import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import io from "socket.io-client";
import Cookies from "js-cookie";
import ChatWindow from "./chatWindow.jsx";
import {
  useGetChatFilesQuery,
  // useLazyGetUsersQuery,
  useGetGroupsQuery,
  useUploadFileMutation,
  useUploadAudioMutation,
  useSendPublicKeyMutation,
  useGetAllUsersCommunityQuery,
} from "./communityApiSlice";
import { encryptMessage, decryptMessage } from "./encryptmsg.js";
import { sanitizeMessage } from "./sanitize.js";
import Loader from "../../ReusableComponents/Loader/loader.jsx";

// ─── Constants ────────────────────────────────────────────────────────────────
const MESSAGES_PER_PAGE = 50;
const USERS_PER_PAGE = 10;
const TYPING_TIMEOUT_MS = 2000;
const SOCKET_JOIN_TIMEOUT_MS = 10_000;
const RATE_LIMIT_COOLDOWN_MS = 60_000;
const MAX_NOTIFICATIONS = 10;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;      // 10 MB  (generic files)
const MAX_IMAGE_SIZE_BYTES = 50 * 1024 * 1024;     // 50 MB
const MAX_DOC_SIZE_BYTES = 100 * 1024 * 1024;      // 100 MB
const LARGE_FILE_THRESHOLD = 25 * 1024 * 1024;     // 25 MB

const ALLOWED_DOC_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "application/zip",
  "application/x-rar-compressed",
]);

const ALLOWED_DOC_EXTENSIONS = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar)$/i;

// ─── Pure helpers (defined outside component to avoid re-creation) ────────────
const makeId = (prefix = "temp") =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "";
  const now = new Date();
  const diffDays = Math.floor((now - date) / 86_400_000);
  if (diffDays === 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

const formatFileSize = (bytes) => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

const formatDateHeader = (dateKey) => {
  const today = new Date().toLocaleDateString();
  const yesterday = new Date(Date.now() - 86_400_000).toLocaleDateString();
  if (dateKey === today) return "Today";
  if (dateKey === yesterday) return "Yesterday";
  return dateKey;
};

const groupMessagesByDate = (messages) =>
  messages.reduce((acc, msg) => {
    const key = new Date(msg.timestamp).toDateString();
    (acc[key] = acc[key] || []).push(msg);
    return acc;
  }, {});

const isRateLimitError = (error = "") =>
  /rate limit|too many|slow down|wait/i.test(error);

const buildReplyTo = (msg) =>
  msg
    ? {
      msgId: msg.msgId || msg.id,
      message: msg.msgBody?.message,
      senderName: msg.publisherName || msg.senderName,
      senderId: msg.fromUserId,
    }
    : null;

/** Decrypt a message field in-place; returns plaintext string */
const safeDecrypt = async (field, secretKey) => {
  if (field && typeof field === "object" && field.cipherText) {
    try {
      return decodeHtmlEntities(await decryptMessage(field, secretKey));
    } catch {
      return "[Decryption failed]";
    }
  }
  const raw = typeof field === "string" ? field : String(field ?? "");
  return decodeHtmlEntities(raw);
};

/** Decrypt all messages in an array concurrently */
const decryptMessages = async (msgs, secretKey) =>
  Promise.all(
    msgs.map(async (msg) => ({
      ...msg,
      _id: msg._id || msg.msgId,
      msgId: msg.msgId || msg._id?.toString(),
      msgBody: {
        ...msg.msgBody,
        message: await safeDecrypt(msg.msgBody?.message, secretKey),
      },
    }))
  );

/** Filter out messages deleted for the current user */
const filterDeleted = (msgs, currentUserId) =>
  msgs.filter((msg) => {
    if (!Array.isArray(msg.deletedFor)) return true;
    return !msg.deletedFor.some((id) => id?.toString() === currentUserId?.toString());
  });

/** Parse admin user from cookie — tries multiple field name variants */
const parseCurrentUser = () => {
  try {
    const raw = Cookies.get("adminUserData");
    if (!raw) return { id: "", name: "", userregisteredDate: undefined };
    const parsed = JSON.parse(raw);
    const data = parsed?.data || parsed || {};
    // Try every field name the backend might use
    const registeredDate =
      data.registeredDate ||
      data.userregisteredDate ||
      data.registered_date ||
      data.createdAt ||
      data.created_at ||
      undefined;
    return {
      _id: data?._id || "",
      id: data.username || data.userId || data.user_id || data.id || "",
      name: data.name || data.userName || data.user_name || "",
      userregisteredDate: registeredDate,
    };
  } catch {
    return { id: "", name: "", userregisteredDate: undefined };
  }
};

/** Build a temporary optimistic message object */
const buildTempMessage = ({
  tempId,
  correlationId,
  currentUser,
  selectedGroup,
  encryptedMessage,
  sanitizedMessage,
  replyToMessage,
  messageType = "message",
  mediaOverrides = {},
  timestamp = Date.now(),
}) => ({
  rowId: tempId,
  chatType: "groupChat",
  originalText: sanitizedMessage,
  messageType,
  chatId: selectedGroup.chatId,
  msgId: tempId,
  _id: tempId,
  correlationId,
  createdAt: new Date().toISOString(),
  fromUserId: currentUser.id,
  publisherName: currentUser.name,
  senderName: currentUser.name,
  senderId: currentUser.id,
  receiverId: "",
  replyTo: buildReplyTo(replyToMessage),
  msgBody: {
    message: encryptedMessage,
    originalText: sanitizedMessage,
    message_type: "text",
    media: {
      fileName: "",
      file_url: "",
      file_key: "",
      duration: "",
      caption: "",
      file_size: "",
      thumb_image: "",
      local_path: "",
      is_uploading: 0,
      is_downloaded: 0,
      isLargeFile: false,
      ...mediaOverrides,
    },
    UserName: currentUser.name,
  },
  msgStatus: "pending",
  timestamp,
  deleteStatus: 0,
  userId: currentUser.id,
  status: "pending",
  error: null,
  msgType: "text",
  metaData: {
    isSent: false,
    sentAt: null,
    isDelivered: false,
    deliveredAt: null,
    isRead: false,
    readAt: null,
    readBy: [],
  },
});

/** Decode HTML entities that sanitizers sometimes produce (e.g. &lt; → <) */
const decodeHtmlEntities = (str) => {
  if (typeof str !== "string") return str;
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
};

// ─── Responsive breakpoint hook ───────────────────────────────────────────────
// Treat anything below 1024px as "mobile" (single-panel WhatsApp layout)
// This covers: phones (320-767px), tablets (768-1023px), small laptops
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
};

// ─── Component ────────────────────────────────────────────────────────────────
const GroupChatApp = () => {
  // ── Auth / identity ──────────────────────────────────────────────────────
  const [currentUser] = useState(parseCurrentUser);
  const isMobile = useIsMobile();

  // ── Groups ───────────────────────────────────────────────────────────────
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);

  // ── Messages ─────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isInitialMessagesLoad, setIsInitialMessagesLoad] = useState(true);
  const [hasMoreOldMessages, setHasMoreOldMessages] = useState(true);
  const [hasMoreNewMessages, setHasMoreNewMessages] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [isLoadingNewer, setIsLoadingNewer] = useState(false);
  const [oldestMessageTimestamp, setOldestMessageTimestamp] = useState(null);
  const [newestMessageTimestamp, setNewestMessageTimestamp] = useState(null);

  // ── Users / members ───────────────────────────────────────────────────────
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [members, setMembers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [showMembers, setShowMembers] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFilesPanel, setShowFilesPanel] = useState(false);
  const [showClearChatModal, setShowClearChatModal] = useState(false);
  const [showFileTypeModal, setShowFileTypeModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [ReadInfo, setReadInfo] = useState(false);
  const [activeGroupTab, setActiveGroupTab] = useState("overview");

  // ── Compose state ─────────────────────────────────────────────────────────
  const [message, setMessage] = useState("");
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [isInputDisabled, setIsInputDisabled] = useState(false);

  // ── File / media state ────────────────────────────────────────────────────
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageCaption, setImageCaption] = useState("");
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentCaption, setDocumentCaption] = useState("");
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // ── Audio ─────────────────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingAudio, setPlayingAudio] = useState(null);

  // ── Notifications ─────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([]);

  // ── Socket / connection ───────────────────────────────────────────────────
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketInitialized, setSocketInitialized] = useState(false);

  // ── Misc ──────────────────────────────────────────────────────────────────
  const [typingUsers, setTypingUsers] = useState([]);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);
  const [DecryptedKey] = useState([]);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null); // ref to the toggle button so clicks on it don't close the picker
  const typingTimeoutRef = useRef(null);
  const rateLimitResetTimer = useRef(null);
  const processedMessagesRef = useRef(new Set());
  const hasAutoSelectedRef = useRef(false);
  const isLoadingUsersRef = useRef(false);
  const selectedGroupRef = useRef(null); // avoid stale closures in socket handlers

  // Keep selectedGroupRef in sync
  useEffect(() => {
    selectedGroupRef.current = selectedGroup;
  }, [selectedGroup]);

  // ── Env ───────────────────────────────────────────────────────────────────
  const socketUrl = import.meta.env.VITE_API_CHAT_URL;
  const SECRET_KEY = import.meta.env.VITE_APP_CHATSECRETKEY?.trim();

  // ── RTK Query ─────────────────────────────────────────────────────────────
  const { data: fetchedGroups = [] } = useGetGroupsQuery();
  const { data: userDetails } = useGetAllUsersCommunityQuery();
  // const [fetchUsers] = useLazyGetUsersQuery();
  const [uploadFile, { isLoading: uploadingFile }] = useUploadFileMutation();
  const [uploadAudio, { isLoading: uploadingAudio }] = useUploadAudioMutation();
  const [sendPublicKey] = useSendPublicKeyMutation();

  const { data: chatFilesData = [], isLoading: loadingFiles, refetch: refetchFiles } =
    useGetChatFilesQuery({ chatId: selectedGroup?.chatId, userId: currentUser.id }, { skip: !selectedGroup?.chatId });

  const chatFiles = chatFilesData?.data || chatFilesData || [];
  const Allusers = useMemo(() => displayedUsers, [displayedUsers]);

  // ── Sync totalUsers from API ──────────────────────────────────────────────
  useEffect(() => {
    if (userDetails) setTotalUsers(userDetails.data?.toatlUsers ?? 0);
  }, [userDetails]);

  // ── Sync members list ─────────────────────────────────────────────────────
  useEffect(() => {
    if (selectedGroup && Allusers.length > 0) setMembers(Allusers);
  }, [Allusers, selectedGroup]);

  // ── Request notification permission ──────────────────────────────────────
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default")
      Notification.requestPermission();
  }, []);

  // ── Cleanup rate-limit timer on unmount ───────────────────────────────────
  useEffect(() => () => rateLimitResetTimer.current && clearTimeout(rateLimitResetTimer.current), []);


  // ── Emoji picker – close only on genuine outside clicks ───────────────────
  // Problem: emoji libraries (emoji-picker-react, etc.) render emoji items inside
  // a shadow DOM or Web Component, so `emojiPickerRef.contains(e.target)` returns
  // FALSE for emoji item clicks — making the picker close on every emoji tap.
  //
  // Fix: attach the listener to the picker's wrapper div directly (capture phase)
  // and use a "inside click" flag to cancel the document-level close handler.
  const emojiClickInsideRef = useRef(false);

  useEffect(() => {
    // Document-level handler — only closes if click was NOT inside the picker
    const outsideHandler = (e) => {
      // Toggle button handled by its own onClick — skip
      if (emojiButtonRef.current?.contains(e.target)) return;
      // If the flag was set by the picker's own pointerdown, skip
      if (emojiClickInsideRef.current) {
        emojiClickInsideRef.current = false;
        return;
      }
      setShowEmojiPicker(false);
    };

    document.addEventListener("pointerdown", outsideHandler);
    return () => document.removeEventListener("pointerdown", outsideHandler);
  }, []);

  // ── Auto-scroll on new messages ───────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Mark messages as read when group is active ────────────────────────────
  useEffect(() => {
    if (!selectedGroup?.chatId || !socketRef.current?.connected) return;
    messages
      .filter((msg) => msg.senderId !== currentUser.id && msg.msgStatus !== "read")
      .forEach((msg) => {
        socketRef.current.emit("message_read", { msgId: msg.msgId, chatId: msg.chatId });
      });
  }, [selectedGroup?.chatId, messages, currentUser.id]);

  // ── Reset user list when group changes ────────────────────────────────────
  useEffect(() => {
    setDisplayedUsers([]);
    setUserPage(1);
    setTotalPages(1);
    setIsLoadingUsers(false);
    isLoadingUsersRef.current = false;
  }, [selectedGroup?.chatId]);


  // ─── updateGroupLastMessage ───────────────────────────────────────────────
  const updateGroupLastMessage = useCallback(
    async (data) => {
      const resolvePreview = async () => {
        const msgText = data.msgBody?.message;
        if (typeof msgText === "object" && msgText?.cipherText) {
          try {
            return (await decryptMessage(msgText, SECRET_KEY)).substring(0, 50);
          } catch {
            return "[Encrypted message]";
          }
        }
        if (typeof msgText === "string") return msgText.substring(0, 50);
        if (data.msgBody?.media?.file_url || data.msgBody?.media?.fileName)
          return `📎 ${data.msgBody.media.fileName || "File"}`;
        return "Message";
      };

      const preview = await resolvePreview();

      setGroups((prev) =>
        prev.map((g) => {
          if (g.chatId !== data.chatId) return g;
          const shouldIncrementUnread =
            selectedGroupRef.current?.chatId !== data.chatId &&
            data.senderId !== currentUser.id;
          return {
            ...g,
            lastMessage: preview,
            time: formatTime(data.timestamp),
            unread: shouldIncrementUnread ? g.unread + 1 : g.unread,
          };
        })
      );
    },
    [SECRET_KEY, currentUser.id]
  );

  // ─── showNotification ─────────────────────────────────────────────────────
  const showNotification = useCallback((data) => {
    setNotifications((prev) =>
      [
        { id: Date.now(), chatId: data.chatId, senderName: data.senderName, message: data.message || "New message", timestamp: data.timestamp },
        ...prev,
      ].slice(0, MAX_NOTIFICATIONS)
    );
    const audio = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUBELTKXh8bllHAU+ktbx0H8tBSh+zPLaizsKFGO56+mhUBAMTKXh8bllHAU+ktbx0H8tBSh+zPLaizsKFGO56+mhUBAMTKXh8bllHAU+ktbx0H8tBSh+"
    );
    audio.volume = 0.3;
    audio.play().catch(() => { });
  }, []);

  // ─── Socket: incoming message processor ──────────────────────────────────
  const processIncomingMessage = useCallback(
    async (data) => {
      const messageId = data._id?.toString() || data.msgId;
      if (!messageId || processedMessagesRef.current.has(messageId)) return null;

      const decrypted = await safeDecrypt(data.msgBody?.message, SECRET_KEY);
      const messageObject = {
        ...data,
        msgId: messageId,
        msgBody: {
          ...data.msgBody,
          message: decrypted,
          ...(data.msgBody?.media && {
            media: { ...data.msgBody.media, is_uploading: false },
          }),
        },
      };
      return { messageId, messageObject };
    },
    [SECRET_KEY]
  );

  // ─── Socket setup ─────────────────────────────────────────────────────────
  const connectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Strip undefined values — never send date=undefined to the server
    const socketQuery = { userId: currentUser.id };
    if (currentUser.userregisteredDate !== undefined) {
      socketQuery.date = currentUser.userregisteredDate;
    }

    socketRef.current = io(socketUrl, {
      transports: ["websocket"],
      query: socketQuery,
      // ── Survive browser tab throttling ────────────────────────────────────
      // Browsers throttle inactive tabs, delaying ping/pong by up to 60s.
      // These values give the connection enough slack to stay alive.
      pingTimeout: 120_000,      // wait 2 min for a pong before declaring dead
      pingInterval: 25_000,      // send ping every 25s (default is 25s, keep it)
      // ── Reconnection with exponential backoff ─────────────────────────────
      reconnection: true,
      reconnectionAttempts: Infinity,  // keep trying indefinitely
      reconnectionDelay: 1_000,        // start at 1s
      reconnectionDelayMax: 30_000,    // cap at 30s
      randomizationFactor: 0.5,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      setSocketConnected(true);

      // Re-join the active group on every (re)connect so messages aren't lost
      // This handles: tab throttle disconnect, network blip, server restart
      const activeGroup = selectedGroupRef.current;
      if (activeGroup?.chatId) {
        socket.emit("join_chat", { chatId: activeGroup.chatId });
        // Mark any stuck "pending" messages as failed so user can retry
        setMessages((prev) =>
          prev.map((m) =>
            m.status === "pending" || m.msgStatus === "pending"
              ? { ...m, status: "failed", msgStatus: "failed", error: "Reconnected — please retry" }
              : m
          )
        );
      }

      // Auto-select first group only on very first connect (not every reconnect)
      if (!hasAutoSelectedRef.current) {
        setGroups((currentGroups) => {
          if (currentGroups.length > 0) {
            hasAutoSelectedRef.current = true;
            setTimeout(() => handleGroupSelect(currentGroups[0]), 0);
          }
          return currentGroups;
        });
      }
    });

    socket.on("disconnect", () => setSocketConnected(false));

    socket.on("online_users", setOnlineUsers);

    // ── Typing ──
    socket.on("user:typing", (data) => {
      if (data.userId === currentUser.id) return;
      setTypingUsers((prev) => {
        if (prev.some((u) => u.userId === data.userId)) return prev;
        return [...prev, { userId: data.userId, userName: data.userName || "Someone" }];
      });
    });
    socket.on("user:stop-typing", (data) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    });

    // ── New text message ──
    socket.on("new_message", async (data) => {
      const result = await processIncomingMessage(data);
      if (!result) return;
      const { messageId, messageObject } = result;
      const isMyMessage = data.fromUserId === currentUser.id;

      if (isMyMessage) {
        setMessages((prev) => {
          const tempIdx = prev.findIndex(
            (m) => m.correlationId && m.correlationId === data.correlationId && m.msgId?.startsWith("temp_")
          );
          if (tempIdx !== -1) {
            processedMessagesRef.current.add(messageId);
            const updated = [...prev];
            updated[tempIdx] = { ...messageObject, msgStatus: "sent", status: "sent" };
            return updated;
          }
          if (prev.some((m) => (m._id?.toString() || m.msgId) === messageId)) {
            processedMessagesRef.current.add(messageId);
            return prev;
          }
          processedMessagesRef.current.add(messageId);
          return [...prev, messageObject];
        });
      } else {
        setMessages((prev) => {
          if (prev.some((m) => (m._id?.toString() || m.msgId) === messageId)) {
            processedMessagesRef.current.add(messageId);
            return prev;
          }
          processedMessagesRef.current.add(messageId);
          return [...prev, messageObject];
        });

        const activeGroup = selectedGroupRef.current;
        if (activeGroup && data.chatId === activeGroup.chatId) {
          setTimeout(() => {
            if (socket.connected) {
              socket.emit("message_read", { chatId: data.chatId, messageId: data._id, userId: currentUser.id });
            }
          }, 500);
        } else {
          showNotification(data);
        }
      }

      updateGroupLastMessage(messageObject);
    });

    // ── send_message echo (own messages) ──
    socket.on("send_message", async (data) => {
      const result = await processIncomingMessage(data);
      if (!result) return;
      const { messageId, messageObject } = result;
      const isMyMessage = data.fromUserId === currentUser.id;

      setMessages((prev) => {
        if (isMyMessage) {
          const tempIdx = prev.findIndex(
            (m) => m.correlationId && m.correlationId === data.correlationId && m.msgId?.startsWith("temp_")
          );
          if (tempIdx !== -1) {
            processedMessagesRef.current.add(messageId);
            const updated = [...prev];
            updated[tempIdx] = { ...messageObject, msgStatus: "sent", status: "sent" };
            return updated;
          }
        }
        if (prev.some((m) => (m._id?.toString() || m.msgId) === messageId)) {
          processedMessagesRef.current.add(messageId);
          return prev;
        }
        processedMessagesRef.current.add(messageId);
        return [...prev, messageObject];
      });

      updateGroupLastMessage(messageObject);
    });

    // ── File upload events ──
    socket.on("file_upload_progress", ({ correlationId, progress }) => {
      setUploadProgress(progress);
      setMessages((prev) =>
        prev.map((msg) => (msg.correlationId === correlationId ? { ...msg, uploadProgress: progress } : msg))
      );
    });

    socket.on("file_upload_success", async (savedMessage) => {
      const messageId = savedMessage._id?.toString() || savedMessage.msgId;
      const decrypted = await safeDecrypt(savedMessage.msgBody?.message, SECRET_KEY);
      const messageObject = {
        ...savedMessage,
        msgId: messageId,
        msgStatus: "sent",
        status: "sent",
        msgBody: {
          ...savedMessage.msgBody,
          message: decrypted,
          media: { ...savedMessage.msgBody.media, is_uploading: false, tempPreview: undefined },
        },
      };

      if (savedMessage.fromUserId === currentUser.id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.msgId === savedMessage.tempId || msg.correlationId === savedMessage.correlationId
              ? messageObject
              : msg
          )
        );
      } else {
        setMessages((prev) => {
          if (prev.some((m) => (m._id?.toString() || m.msgId) === messageId)) return prev;
          return [...prev, messageObject];
        });
        const activeGroup = selectedGroupRef.current;
        if (activeGroup && savedMessage.chatId === activeGroup.chatId) {
          setTimeout(() => {
            if (socket.connected) {
              socket.emit("message_read", { chatId: savedMessage.chatId, messageId: savedMessage._id, userId: currentUser.id });
            }
          }, 500);
        } else {
          showNotification(savedMessage);
        }
      }

      processedMessagesRef.current.add(messageId);
      updateGroupLastMessage(messageObject);
      setUploadProgress(0);
    });

    socket.on("file_upload_error", ({ tempId, correlationId, error }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.msgId === tempId || msg.correlationId === correlationId
            ? { ...msg, status: "failed", msgStatus: "failed", msgBody: { ...msg.msgBody, media: { ...msg.msgBody.media, is_uploading: false } }, error }
            : msg
        )
      );
      setUploadProgress(0);
    });

    // ── Delete events ──
    const applyDeletedForEveryone = (msgId) =>
      setMessages((prev) =>
        prev.map((msg) => {
          const id = msg.msgId || msg._id?.toString() || msg.id;
          return id === msgId
            ? { ...msg, deletedForEveryone: true, msgBody: { ...msg.msgBody, message: "This message was deleted" } }
            : msg;
        })
      );

    socket.on("message_deleted_for_everyone", ({ msgId, userId }) => {
      if (userId !== currentUser.id) applyDeletedForEveryone(msgId);
    });
    socket.on("delete_for_everyone", ({ msgId, userId }) => {
      if (userId !== currentUser.id) applyDeletedForEveryone(msgId);
    });
    socket.on("delete_error", () => setIsDeletingMessage(false));

    // ── Message confirmations ──
    socket.on("message_saved_confirmation", ({ tempId, correlationId, _id, msgId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.correlationId === correlationId || msg.msgId === tempId
            ? { ...msg, _id, msgId, dbSaved: true }
            : msg
        )
      );
    });

    socket.on("send_message_error", ({ error, tempId, correlationId, msgId }) => {
      if (isRateLimitError(error)) {
        setMessages((prev) =>
          prev.filter((msg) => {
            const matchesTemp = msg.msgId === tempId || msg.correlationId === correlationId;
            const matchesId = msg.msgId === msgId || msg._id?.toString() === msgId;
            return !(matchesTemp || matchesId);
          })
        );
        setIsInputDisabled(true);
        rateLimitResetTimer.current && clearTimeout(rateLimitResetTimer.current);
        rateLimitResetTimer.current = setTimeout(() => setIsInputDisabled(false), RATE_LIMIT_COOLDOWN_MS);
        return;
      }
      setMessages((prev) =>
        prev.map((msg) => {
          const matchesTemp = msg.msgId === tempId || msg.correlationId === correlationId;
          const matchesId = msg.msgId === msgId || msg._id?.toString() === msgId;
          return matchesTemp || matchesId ? { ...msg, status: "failed", msgStatus: "failed", error } : msg;
        })
      );
    });

    socket.on("update_message_status", ({ msgId, metaData, msgStatus }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.msgId === msgId || msg._id?.toString() === msgId
            ? { ...msg, metaData: { ...msg.metaData, ...metaData }, msgStatus }
            : msg
        )
      );
    });

    socket.on("message:read:update", ({ msgId, readBy }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.msgId === msgId || msg._id?.toString() === msgId
            ? { ...msg, metaData: { ...msg.metaData, readBy: readBy || [], isRead: readBy?.length > 0 } }
            : msg
        )
      );
    });

    // ── Chat history ──
    socket.on("chat_history", async ({ chatId, messages: chatMessages }) => {
      window.currentLoadingTimeout && clearTimeout(window.currentLoadingTimeout);
      const decrypted = await decryptMessages(chatMessages, SECRET_KEY);
      const filtered = filterDeleted(decrypted, currentUser.id);

      setMessages(filtered);
      setIsLoadingMessages(false);
      setIsInitialMessagesLoad(false);

      if (filtered.length > 0) {
        setOldestMessageTimestamp(filtered[0].timestamp);
        setNewestMessageTimestamp(filtered[filtered.length - 1].timestamp);
        setHasMoreOldMessages(filtered.length >= MESSAGES_PER_PAGE);
        setHasMoreNewMessages(false);
      } else {
        setHasMoreOldMessages(false);
        setHasMoreNewMessages(false);
      }
    });

    // ── Paginated messages ──
    socket.on("load_older_messages", async ({ messages: olderMessages, hasMore }) => {
      if (olderMessages?.length > 0) {
        const decrypted = filterDeleted(await decryptMessages(olderMessages, SECRET_KEY), currentUser.id);
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.msgId || m._id?.toString()));
          return [...decrypted.filter((m) => !existingIds.has(m.msgId || m._id?.toString())), ...prev];
        });
        setOldestMessageTimestamp(olderMessages[0].timestamp);
        setHasMoreOldMessages(hasMore);
      } else {
        setHasMoreOldMessages(false);
      }
      setIsLoadingOlder(false);
    });

    socket.on("load_newer_messages", async ({ messages: newerMessages, hasMore }) => {
      if (newerMessages?.length > 0) {
        const decrypted = filterDeleted(await decryptMessages(newerMessages, SECRET_KEY), currentUser.id);
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.msgId || m._id?.toString()));
          return [...prev, ...decrypted.filter((m) => !existingIds.has(m.msgId || m._id?.toString()))];
        });
        setNewestMessageTimestamp(newerMessages[newerMessages.length - 1].timestamp);
        setHasMoreNewMessages(hasMore);
      } else {
        setHasMoreNewMessages(false);
      }
      setIsLoadingNewer(false);
    });

    // ── Clear chat ──
    socket.on("clear_chat_success", ({ chatId, userId }) => {
      if (selectedGroupRef.current?.chatId === chatId && userId === currentUser.id) {
        setMessages([]);
        setHasMoreOldMessages(false);
        setHasMoreNewMessages(false);
        setOldestMessageTimestamp(null);
        setNewestMessageTimestamp(null);
      }
      setGroups((prev) =>
        prev.map((g) => (g.chatId === chatId ? { ...g, lastMessage: "", time: "", unread: 0 } : g))
      );
    });
    socket.on("clear_chat_error", ({ error }) => console.error("Clear chat error:", error));

    // ── Report ──
    socket.on("report_received", (data) => {
      if (data.success) console.info("Report submitted successfully");
    });
  }, [currentUser, socketUrl, SECRET_KEY, processIncomingMessage, showNotification, updateGroupLastMessage]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Init socket once user is known ──────────────────────────────────────
  useEffect(() => {
    if (!currentUser.id) return;
    if (socketRef.current?.connected) return;
    connectSocket();
    setSocketInitialized(true);
    return () => {
      socketRef.current?.removeAllListeners();
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocketInitialized(false);
    };
  }, [currentUser.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Reconnect when tab becomes visible again after being idle ────────────
  // Browsers kill/throttle WebSocket ping-pong in background tabs.
  // When the user comes back, the socket may be silently dead.
  useEffect(() => {
    if (!currentUser.id) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;

      const socket = socketRef.current;

      if (!socket || !socket.connected) {
        // Socket is dead — reconnect fully
        connectSocket();
      } else {
        // Socket thinks it's alive — verify with a ping
        // If server doesn't respond, Socket.IO will fire disconnect then reconnect
        socket.emit("ping");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [currentUser.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Per-group typing listeners (avoids stale selectedGroup in handler) ───
  useEffect(() => {
    if (!socketRef.current || !selectedGroup) return;
    const socket = socketRef.current;

    const onTyping = (data) => {
      if (data.chatId !== selectedGroup.chatId || data.userId === currentUser.id) return;
      setTypingUsers((prev) => {
        if (prev.some((u) => u.userId === data.userId)) return prev;
        return [...prev, { userId: data.userId, userName: data.userName || "Someone" }];
      });
    };
    const onStopTyping = (data) => {
      if (data.chatId === selectedGroup.chatId)
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    };

    socket.on("user:typing", onTyping);
    socket.on("user:stop-typing", onStopTyping);
    return () => {
      socket.off("user:typing", onTyping);
      socket.off("user:stop-typing", onStopTyping);
    };
  }, [selectedGroup?.chatId, currentUser.id]);

  // ── Format groups from API ─────────────────────────────────────────────
  useEffect(() => {
    if (!fetchedGroups?.length) return;
    setIsLoadingGroups(true);
    const formatted = fetchedGroups.map((group, index) => ({
      id: index + 1,
      chatId: group.groupId,
      name: group.groupName,
      groupImage: group.groupImage,
      groupDescription: group.groupDescriptoin,
      lastMessage: group.lastMessage || "",
      time: group.lastMessageTime || "",
      unread: group.unread || 0,
      avatar: "https://res.cloudinary.com/ddefr5owc/image/upload/v1766049897/logo_xwrr9w.png",
    }));
    setGroups(formatted);
    setIsLoadingGroups(false);
    // Auto-select handled by socket 'connect' event to guarantee socket readiness
  }, [fetchedGroups]);

  // ─── handleGroupSelect ─────────────────────────────────────────────────
  const handleGroupSelect = useCallback(
    (group) => {
      // Retry if socket isn't ready yet
      if (!socketRef.current?.connected) {
        const id = setInterval(() => {
          if (socketRef.current?.connected) {
            clearInterval(id);
            handleGroupSelect(group);
          }
        }, 300);
        return;
      }

      const currentGroup = selectedGroupRef.current;

      setSelectedGroup(group);
      setShowMembers(false);
      setShowFilesPanel(false);
      setShowNotifications(false);
      setHasMoreOldMessages(true);
      setHasMoreNewMessages(false);
      setIsLoadingOlder(false);
      setIsLoadingNewer(false);
      setOldestMessageTimestamp(null);
      setNewestMessageTimestamp(null);
      setIsLoadingMessages(true);
      setIsInitialMessagesLoad(true);
      setTypingUsers([]);

      const loadingTimeout = setTimeout(() => {
        setIsLoadingMessages(false);
        setIsInitialMessagesLoad(false);
      }, SOCKET_JOIN_TIMEOUT_MS);
      window.currentLoadingTimeout = loadingTimeout;

      setGroups((prev) => prev.map((g) => (g.id === group.id ? { ...g, unread: 0 } : g)));
      setNotifications((prev) => prev.filter((n) => n.chatId !== group.chatId));

      if (currentGroup && currentGroup.chatId !== group.chatId) {
        socketRef.current.emit("leave_chat", { chatId: currentGroup.chatId });
        setMessages([]);
        processedMessagesRef.current.clear();
      }

      socketRef.current.emit("join_chat", { chatId: group.chatId });
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ─── Message pagination ────────────────────────────────────────────────
  const loadOlderMessages = useCallback(() => {
    if (!selectedGroupRef.current?.chatId || isLoadingOlder || !hasMoreOldMessages) return;
    setIsLoadingOlder(true);
    const before = oldestMessageTimestamp || messages[0]?.timestamp;
    socketRef.current?.emit("fetch_older_messages", { chatId: selectedGroupRef.current.chatId, before, limit: MESSAGES_PER_PAGE });
  }, [isLoadingOlder, hasMoreOldMessages, oldestMessageTimestamp, messages]);

  const loadNewerMessages = useCallback(() => {
    if (!selectedGroupRef.current?.chatId || isLoadingNewer || !hasMoreNewMessages) return;
    setIsLoadingNewer(true);
    const after = newestMessageTimestamp || messages[messages.length - 1]?.timestamp;
    socketRef.current?.emit("fetch_newer_messages", { chatId: selectedGroupRef.current.chatId, after, limit: MESSAGES_PER_PAGE });
  }, [isLoadingNewer, hasMoreNewMessages, newestMessageTimestamp, messages]);

  // ─── Typing indicator ──────────────────────────────────────────────────
  const handleTyping = useCallback(() => {
    if (!socketRef.current || !selectedGroupRef.current) return;
    socketRef.current.emit("user:typing", {
      chatId: selectedGroupRef.current.chatId,
      userId: currentUser.id,
      userName: currentUser.name,
    });
    typingTimeoutRef.current && clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("user:stop-typing", {
        chatId: selectedGroupRef.current?.chatId,
        userId: currentUser.id,
      });
    }, TYPING_TIMEOUT_MS);
  }, [currentUser]);

  // ─── Send text message ─────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    if (isInputDisabled) {
      // Rate-limit warning toast
      const el = document.createElement("div");
      el.className = "fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] font-semibold";
      el.textContent = "Please wait! You're sending messages too quickly.";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
      return;
    }

    if (!message.trim() || !selectedGroupRef.current || !currentUser.id) return;

    const sanitized = decodeHtmlEntities(sanitizeMessage(message.trim()));
    if (!sanitized) return;

    const tempId = makeId("temp");
    const correlationId = makeId(currentUser.id);
    const encrypted = await encryptMessage(sanitized, SECRET_KEY);

    const messageData = buildTempMessage({
      tempId,
      correlationId,
      currentUser,
      selectedGroup: selectedGroupRef.current,
      encryptedMessage: encrypted,
      sanitizedMessage: sanitized,
      replyToMessage,
    });

    setMessages((prev) => [...prev, messageData]);
    setMessage("");
    setReplyToMessage(null);

    // Check BOTH the connected flag AND socket readyState
    // socket.connected can be true while the underlying WS is actually dead
    // (happens after browser tab throttling kills the ping-pong silently)
    const isReallyConnected =
      socketRef.current?.connected &&
      socketRef.current?.io?.engine?.readyState === "open";

    if (isReallyConnected) {
      socketRef.current.emit("send_message", messageData);
    } else {
      // Socket is dead — mark failed immediately so user can retry
      // Also trigger reconnect so the next message works
      if (socketRef.current && !socketRef.current.connected) {
        socketRef.current.connect();
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.msgId === tempId
            ? { ...m, status: "failed", msgStatus: "failed", error: "Connection lost — tap to retry" }
            : m
        )
      );
    }
  }, [isInputDisabled, message, currentUser, SECRET_KEY, replyToMessage]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Send image message ────────────────────────────────────────────────
  const sendImageMessage = useCallback(async () => {
    if (!selectedImages.length || !selectedGroupRef.current || !currentUser.id) return;
    const timestamp = Date.now();

    for (let i = 0; i < selectedImages.length; i++) {
      const imgObj = selectedImages[i];
      const tempId = makeId(`temp_img_${i}`);
      const correlationId = makeId(`${currentUser.id}_img_${i}`);
      const sanitizedCaption = imageCaption.trim() ? sanitizeMessage(imageCaption.trim()) : "";

      const messageData = buildTempMessage({
        tempId,
        correlationId,
        currentUser,
        selectedGroup: selectedGroupRef.current,
        encryptedMessage: sanitizedCaption,
        sanitizedMessage: sanitizedCaption,
        replyToMessage,
        messageType: "image",
        timestamp: timestamp + i,
        mediaOverrides: {
          fileName: imgObj.name,
          file_type: imgObj.file.type,
          file_size: imgObj.size,
          file_url: imgObj.preview,
          tempPreview: imgObj.preview,
          caption: sanitizedCaption,
          thumb_image: imgObj.preview,
          is_uploading: true,
          isLargeFile: imgObj.size > LARGE_FILE_THRESHOLD,
          message_type: "image",
        },
      });
      messageData.msgBody.message_type = "image";
      messageData.msgBody.media.message_type = "image";

      setMessages((prev) => [...prev, messageData]);

      try {
        const buffer = await imgObj.file.arrayBuffer();
        if (!socketRef.current?.connected) throw new Error("Socket not connected");
        socketRef.current.emit("send_file", { fileBuffer: buffer, fileName: imgObj.name, fileType: imgObj.file.type, caption: sanitizedCaption, messageData });
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m.msgId === tempId
              ? { ...m, status: "failed", msgStatus: "failed", msgBody: { ...m.msgBody, media: { ...m.msgBody.media, is_uploading: false } }, error: err.message }
              : m
          )
        );
      }
    }
    cancelImageUpload();
    setReplyToMessage(null);
  }, [selectedImages, imageCaption, currentUser, replyToMessage]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Send document message ─────────────────────────────────────────────
  const sendDocumentMessage = useCallback(async () => {
    if (!selectedDocument || !selectedGroupRef.current || !currentUser.id) return;

    const tempId = makeId("temp_doc");
    const correlationId = makeId(`${currentUser.id}_doc`);
    const sanitizedCaption = documentCaption.trim() ? sanitizeMessage(documentCaption.trim()) : "";

    const messageData = buildTempMessage({
      tempId,
      correlationId,
      currentUser,
      selectedGroup: selectedGroupRef.current,
      encryptedMessage: selectedDocument.name,
      sanitizedMessage: selectedDocument.name,
      replyToMessage,
      messageType: "document",
      mediaOverrides: {
        fileName: selectedDocument.name,
        file_type: selectedDocument.type,
        file_size: selectedDocument.size,
        caption: sanitizedCaption,
        is_uploading: true,
        isLargeFile: selectedDocument.size > LARGE_FILE_THRESHOLD,
        fileIcon: selectedDocument.icon,
        message_type: "document",
      },
    });
    messageData.msgBody.message = selectedDocument.name;
    messageData.msgBody.message_type = "document";

    setMessages((prev) => [...prev, messageData]);
    cancelDocumentUpload();

    try {
      const buffer = await selectedDocument.file.arrayBuffer();
      if (!socketRef.current?.connected) throw new Error("Socket not connected");
      socketRef.current.emit("send_file", { fileBuffer: buffer, fileName: selectedDocument.name, fileType: selectedDocument.type, caption: sanitizedCaption, messageData });
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.msgId === tempId
            ? { ...m, status: "failed", msgStatus: "failed", msgBody: { ...m.msgBody, media: { ...m.msgBody.media, is_uploading: false } }, error: err.message }
            : m
        )
      );
    }
    setReplyToMessage(null);
  }, [selectedDocument, documentCaption, currentUser, replyToMessage]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Send generic file ─────────────────────────────────────────────────
  const sendFileMessage = useCallback(async () => {
    if (!selectedFile || !selectedGroupRef.current || !currentUser.id) return;

    const sanitizedName = sanitizeMessage(selectedFile.name.trim());
    if (!sanitizedName) return;

    const tempId = makeId("temp_file");
    const correlationId = makeId(`${currentUser.id}_file`);
    const encrypted = await encryptMessage(sanitizedName, SECRET_KEY);

    const messageData = buildTempMessage({
      tempId,
      correlationId,
      currentUser,
      selectedGroup: selectedGroupRef.current,
      encryptedMessage: encrypted,
      sanitizedMessage: sanitizedName,
      replyToMessage,
      messageType: "file",
      mediaOverrides: {
        fileName: encrypted,
        file_type: selectedFile.type,
        file_size: selectedFile.size,
        thumb_image: filePreview || "",
        is_uploading: true,
        isLargeFile: selectedFile.size > LARGE_FILE_THRESHOLD,
        message_type: "file",
      },
    });
    messageData.msgBody.message_type = "file";

    setMessages((prev) => [...prev, messageData]);
    cancelFileUpload();

    try {
      const buffer = await selectedFile.arrayBuffer();
      if (!socketRef.current?.connected) throw new Error("Socket not connected");
      socketRef.current.emit("send_file", { fileBuffer: buffer, fileName: sanitizedName, fileType: selectedFile.type, messageData });
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.msgId === tempId
            ? { ...m, status: "failed", msgStatus: "failed", msgBody: { ...m.msgBody, media: { ...m.msgBody.media, is_uploading: false } }, error: err.message }
            : m
        )
      );
    }
    setReplyToMessage(null);
  }, [selectedFile, filePreview, currentUser, SECRET_KEY, replyToMessage]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Retry failed message ──────────────────────────────────────────────
  const retryMessage = useCallback(
    async (failedMsg) => {
      setMessages((prev) => prev.filter((m) => m.msgId !== failedMsg.msgId));

      const tempId = makeId("temp");
      const correlationId = makeId(currentUser.id);

      const originalText = failedMsg.msgBody?.originalText;
      let messageText;
      if (originalText) {
        messageText = originalText;
      } else {
        const enc = failedMsg.msgBody?.message;
        messageText =
          typeof enc === "object" && enc.cipherText
            ? await decryptMessage(enc, SECRET_KEY)
            : String(enc);
      }

      const encrypted = await encryptMessage(messageText, SECRET_KEY);

      const newMsg = {
        ...failedMsg,
        msgId: tempId,
        _id: tempId,
        rowId: tempId,
        correlationId,
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
        msgStatus: "pending",
        status: "pending",
        error: null,
        msgBody: { ...failedMsg.msgBody, message: encrypted, originalText: messageText },
        metaData: { isSent: false, sentAt: null, isDelivered: false, deliveredAt: null, isRead: false, readAt: null, readBy: [] },
      };

      setMessages((prev) => [...prev, newMsg]);

      if (socketRef.current?.connected) {
        socketRef.current.emit("send_message", newMsg);
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.msgId === tempId ? { ...m, status: "failed", msgStatus: "failed", error: "Not connected to server" } : m
          )
        );
      }
    },
    [currentUser.id, SECRET_KEY]
  );

  // ─── Delete actions ────────────────────────────────────────────────────
  const deleteForMe = useCallback(
    (msgId) => {
      setIsDeletingMessage(true);
      setMessages((prev) =>
        prev.map((msg) => {
          const id = msg.msgId || msg._id?.toString() || msg.id;
          return id === msgId ? { ...msg, deletedFor: [...(msg.deletedFor || []), currentUser.id] } : msg;
        })
      );
      if (socketRef.current?.connected) {
        socketRef.current.emit("delete_for_me", { msgId, userId: currentUser.id, chatId: selectedGroupRef.current?.chatId });
      } else {
        // Rollback
        setMessages((prev) =>
          prev.map((msg) => {
            const id = msg.msgId || msg._id?.toString() || msg.id;
            return id === msgId ? { ...msg, deletedFor: (msg.deletedFor || []).filter((i) => i !== currentUser.id) } : msg;
          })
        );
      }
      setIsDeletingMessage(false);
    },
    [currentUser.id]
  );

  const deleteForEveryone = useCallback(
    (msgId) => {
      setIsDeletingMessage(true);
      const target = messages.find((m) => (m.msgId || m._id?.toString() || m.id) === msgId);
      const realId = target?._id?.toString() || target?.msgId;
      if (!realId) { setIsDeletingMessage(false); return; }

      setMessages((prev) =>
        prev.map((msg) => {
          const id = msg.msgId || msg._id?.toString() || msg.id;
          return id === msgId
            ? { ...msg, deletedForEveryone: true, msgBody: { ...msg.msgBody, message: "This message was deleted" } }
            : msg;
        })
      );

      if (socketRef.current?.connected) {
        socketRef.current.emit("delete_for_everyone", { msgId: realId, userId: currentUser.id, chatId: selectedGroupRef.current?.chatId });
      } else {
        // Rollback
        setMessages((prev) =>
          prev.map((msg) => {
            const id = msg.msgId || msg._id?.toString() || msg.id;
            return id === msgId ? { ...msg, deletedForEveryone: false, msgBody: { ...msg.msgBody, message: target.msgBody?.message } } : msg;
          })
        );
      }
      setIsDeletingMessage(false);
    },
    [messages, currentUser.id]
  );

  // ─── Clear chat ────────────────────────────────────────────────────────
  const handleClearChat = useCallback(() => {
    if (!selectedGroupRef.current?.chatId) return;
    // setMessages([]);
    if (socketRef.current?.connected) {
      socketRef.current.emit("clear_chat", { chatId: selectedGroupRef.current.chatId, userId: currentUser.id });
    }
    setShowClearChatModal(false);
  }, [currentUser.id]);

  // ─── Report message ────────────────────────────────────────────────────
  const reportMessage = useCallback((reportData) => {
    if (socketRef.current?.connected) socketRef.current.emit("report_message", reportData);
    else console.error("Socket not connected – cannot report");
  }, []);

  // ─── File selection handlers ───────────────────────────────────────────
  const handleImageSelect = useCallback((event) => {
    const files = Array.from(event.target.files).filter(
      (f) => f.type.startsWith("image/") && f.size <= MAX_IMAGE_SIZE_BYTES
    );
    if (!files.length) return;
    setSelectedImages(files.map((file) => ({ file, preview: URL.createObjectURL(file), name: file.name, size: file.size })));
    setShowImagePreview(true);
    setImageCaption("");
  }, []);

  const handleDocumentSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (!file || file.size > MAX_DOC_SIZE_BYTES) return;
    if (!ALLOWED_DOC_TYPES.has(file.type) && !ALLOWED_DOC_EXTENSIONS.test(file.name)) return;
    setSelectedDocument({ file, name: file.name, size: file.size, type: file.type });
    setShowDocumentPreview(true);
    setDocumentCaption("");
  }, []);

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (!file || file.size > MAX_FILE_SIZE_BYTES) return;
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => { setFilePreview(e.target.result); setShowFilePreview(true); };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
      setShowFilePreview(true);
    }
  }, []);

  // ─── Cancel uploads ────────────────────────────────────────────────────
  const cancelImageUpload = useCallback(() => {
    setSelectedImages((prev) => { prev.forEach((img) => URL.revokeObjectURL(img.preview)); return []; });
    setShowImagePreview(false);
    setImageCaption("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const cancelDocumentUpload = useCallback(() => {
    setSelectedDocument(null);
    setShowDocumentPreview(false);
    setDocumentCaption("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const cancelFileUpload = useCallback(() => {
    setSelectedFile(null);
    setFilePreview(null);
    setShowFilePreview(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const removeImage = useCallback((index) => {
    setSelectedImages((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  }, []);

  // ─── Reply helpers ─────────────────────────────────────────────────────
  const handleReply = useCallback((msg) => setReplyToMessage(msg), []);
  const cancelReply = useCallback(() => setReplyToMessage(null), []);
  const handleReplyMessage = useCallback((msg) => setReplyToMessage(msg), []);
  const handleBackToGroups = useCallback(() => {
    // On mobile this navigates back to the group list
    // On desktop it just deselects (panels collapse)
    if (socketRef.current?.connected && selectedGroupRef.current) {
      socketRef.current.emit("leave_chat", { chatId: selectedGroupRef.current.chatId });
    }
    setSelectedGroup(null);
    setTypingUsers([]);
    setMessages([]);
    processedMessagesRef.current.clear();
  }, []);
  const ReadInfoButton = useCallback(() => setReadInfo((p) => !p), []);

  // ─── Render ────────────────────────────────────────────────────────────
  const showLoader = !socketInitialized || !currentUser.id || isLoadingGroups;

  // WhatsApp-style: mobile = single panel swap, desktop = 60/40 split
  const showGroupList = !isMobile || !selectedGroup;
  const showChatPane = !isMobile || !!selectedGroup;

  return (
    // w-full + h-full inherits from whatever the parent gives us.
    // On mobile the parent (your app shell) should be 100dvh.
    // overflow-hidden stops double scrollbars; flex puts panels side-by-side.
    <div
      className="flex w-full overflow-hidden bg-[#000000] text-white"
      style={{
        height: isMobile ? "100dvh" : "88vh",
        // Safe-area padding so input bar clears iPhone home indicator
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,application/pdf,.doc,.docx,.txt"
      />

      {showLoader ? (
        <Loader />
      ) : (
        <ChatWindow
          // Responsive layout
          isMobile={isMobile}
          showGroupList={showGroupList}
          showChatPane={showChatPane}
          // Mobile: full-width panels toggled by display
          // Desktop (>=1024px): sidebar 38%, chat pane fills remaining 62%
          sidebarStyle={isMobile
            ? { width: "100%", height: "100%", display: showGroupList ? "flex" : "none", flexDirection: "column", flexShrink: 0 }
            : { width: "38%", minWidth: 280, flexShrink: 0, height: "100%", display: "flex", flexDirection: "column", borderRight: "1px solid #1a1a1a" }
          }
          chatPaneStyle={isMobile
            ? { width: "100%", height: "100%", display: showChatPane ? "flex" : "none", flexDirection: "column" }
            : { flex: 1, minWidth: 0, height: "100%", display: "flex", flexDirection: "column" }
          }

          // Group / navigation
          selectedGroup={selectedGroup}
          onBackToGroups={handleBackToGroups}
          isLoadingGroups={isLoadingGroups}

          // Messages
          messages={messages}
          isLoadingMessages={isLoadingMessages}
          isInitialMessagesLoad={isInitialMessagesLoad}
          loadOlderMessages={loadOlderMessages}
          loadNewerMessages={loadNewerMessages}
          hasMoreOldMessages={hasMoreOldMessages}
          hasMoreNewMessages={hasMoreNewMessages}
          isLoadingOlder={isLoadingOlder}
          isLoadingNewer={isLoadingNewer}
          retryMessage={retryMessage}
          messagesEndRef={messagesEndRef}
          formatDateHeader={formatDateHeader}
          groupMessagesByDate={groupMessagesByDate}

          // Users / members
          members={Allusers}
          showMembers={showMembers}
          setShowMembers={setShowMembers}
          onlineUsers={onlineUsers}
          typingUsers={typingUsers}
          isLoadingUsers={isLoadingUsers}
          userPage={userPage}
          totalPages={totalPages}
          totalUsers={totalUsers}

          // Current user
          currentUser={currentUser}

          // Compose
          message={message}
          setMessage={setMessage}
          onSendMessage={sendMessage}
          handleTyping={handleTyping}
          isInputDisabled={isInputDisabled}
          setIsInputDisabled={setIsInputDisabled}
          replyToMessage={replyToMessage}
          handleReply={handleReply}
          cancelReply={cancelReply}
          handleReplyMessage={handleReplyMessage}

          // Emoji
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          emojiPickerRef={emojiPickerRef}
          emojiButtonRef={emojiButtonRef}
          emojiClickInsideRef={emojiClickInsideRef}

          // File (generic)
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          filePreview={filePreview}
          setFilePreview={setFilePreview}
          showFilePreview={showFilePreview}
          setShowFilePreview={setShowFilePreview}
          handleFileSelect={handleFileSelect}
          cancelFileUpload={cancelFileUpload}
          sendFileMessage={sendFileMessage}
          fileInputRef={fileInputRef}
          uploadingFile={uploadingFile}

          // Images
          selectedImages={selectedImages}
          setSelectedImages={setSelectedImages}
          showImagePreview={showImagePreview}
          setShowImagePreview={setShowImagePreview}
          imageCaption={imageCaption}
          setImageCaption={setImageCaption}
          handleImageSelect={handleImageSelect}
          sendImageMessage={sendImageMessage}
          cancelImageUpload={cancelImageUpload}
          removeImage={removeImage}

          // Documents
          selectedDocument={selectedDocument}
          setSelectedDocument={setSelectedDocument}
          showDocumentPreview={showDocumentPreview}
          setShowDocumentPreview={setShowDocumentPreview}
          documentCaption={documentCaption}
          setDocumentCaption={setDocumentCaption}
          handleDocumentSelect={handleDocumentSelect}
          sendDocumentMessage={sendDocumentMessage}
          cancelDocumentUpload={cancelDocumentUpload}
          uploadingAudio={uploadingAudio}
          uploadProgress={uploadProgress}
          showFileTypeModal={showFileTypeModal}
          setShowFileTypeModal={setShowFileTypeModal}

          // Audio
          isRecording={isRecording}
          setIsRecording={setIsRecording}
          audioBlob={audioBlob}
          setAudioBlob={setAudioBlob}
          recordingTime={recordingTime}
          setRecordingTime={setRecordingTime}
          playingAudio={playingAudio}
          setPlayingAudio={setPlayingAudio}

          // Chat files panel
          showFilesPanel={showFilesPanel}
          setShowFilesPanel={setShowFilesPanel}
          chatFiles={chatFiles}
          loadingFiles={loadingFiles}
          refetchFiles={refetchFiles}

          // Delete / report
          deleteForMe={deleteForMe}
          deleteForEveryone={deleteForEveryone}
          isDeletingMessage={isDeletingMessage}
          setIsDeletingMessage={setIsDeletingMessage}
          reportMessage={reportMessage}

          // Clear chat
          onClearChat={handleClearChat}
          showClearChatModal={showClearChatModal}
          setShowClearChatModal={setShowClearChatModal}

          // Misc
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          ReadInfoButton={ReadInfoButton}
          groupKey={DecryptedKey[0]}
          socketRef={socketRef}

          // Formatters
          formatTime={formatTime}
          formatDuration={formatDuration}
          formatFileSize={formatFileSize}
        />
      )}
    </div>
  );
};

export default GroupChatApp;