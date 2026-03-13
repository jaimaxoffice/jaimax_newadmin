import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import Cookies from "js-cookie";
import ChatWindow from "./ChatWindow.jsx";
import { useGetGroupsQuery } from "./communityApiSlice";
import { encryptMessage, decryptMessage } from "./socket/encryptmsg.js";
import Loader from "../../ReusableComponents/Loader/loader.jsx";
import { useSocket } from "./socket/useSocket.js";
import {
  safeDecrypt,
  decodeHtmlEntities,
  sanitizeMessage,
  formatFileSize,
  ALLOWED_DOC_EXTENSIONS,
  formatDateHeader,
  groupMessagesByDate,
  formatTime,
  formatDuration,
  makeId,
} from "./socket/socketUtils.js";

// ─── Constants ────────────────────────────────────────────────────────────────
const MESSAGES_PER_PAGE = 50;
const USERS_PER_PAGE = 10;
const TYPING_TIMEOUT_MS = 2000;
const SOCKET_JOIN_TIMEOUT_MS = 10_000;
const MAX_NOTIFICATIONS = 10;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_IMAGE_SIZE_BYTES = 50 * 1024 * 1024;
const MAX_DOC_SIZE_BYTES = 100 * 1024 * 1024;
const LARGE_FILE_THRESHOLD = 25 * 1024 * 1024;

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

// const buildReplyTo = (msg) =>
//   msg
//     ? {
//         _id: msg._id,
//         message: msg.msgBody?.message,
//         senderName: msg.publisherName || msg.senderName,
//         senderId: msg.fromUserId,
//       }
//     : null;

const buildReplyTo = (msg) =>
  msg
    ? {
        _id: msg._id?.toString(),
        msgId: msg.msgId?.toString() || msg._id?.toString(),
        message: msg.msgBody?.message,
        senderName: msg.publisherName || msg.senderName || msg.fromUserId,
        senderId: msg.fromUserId,
      }
    : null;
const buildTempMessage = ({
  pendingId,
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
  chatType: "groupChat",
  originalText: sanitizedMessage,
  messageType,
  chatId: selectedGroup.chatId,
  _id: pendingId,
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

/** Parse admin user from cookie */
const parseCurrentUser = () => {
  try {
    const raw = Cookies.get("adminUserData");
    if (!raw) return { id: "", name: "", userregisteredDate: undefined };
    const parsed = JSON.parse(raw);
    const data = parsed?.data || parsed || {};
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
  const [chatFiles, setChatFiles] = useState([]);
  const [filesPagination, setFilesPagination] = useState({});
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [filesPage, setFilesPage] = useState(1);
  const [filesTabType, setFilesTabType] = useState("image");

  const [message, setMessage] = useState("");
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [isInputDisabled, setIsInputDisabled] = useState(false);

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

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingAudio, setPlayingAudio] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketInitialized, setSocketInitialized] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);
  const [rateLimitError, setRateLimitError] = useState("");

  // ── Refs ──────────────────────────────────────────────────────────────────
  const messagesEndRef = useRef(null);
  const prevMessageCountRef = useRef(0);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const processedMessagesRef = useRef(new Set());
  const hasAutoSelectedRef = useRef(false);
  const selectedGroupRef = useRef(null);
  const emojiClickInsideRef = useRef(false);

  // Keep selectedGroupRef in sync with state
  useEffect(() => {
    selectedGroupRef.current = selectedGroup;
  }, [selectedGroup]);

  // ── Env ───────────────────────────────────────────────────────────────────
  const socketUrl = import.meta.env.VITE_API_CHAT_URL;
  const SECRET_KEY = import.meta.env.VITE_APP_CHATSECRETKEY?.trim();

  // ── RTK Query ─────────────────────────────────────────────────────────────
  const { data: fetchedGroups = [] } = useGetGroupsQuery();
  const Allusers = useMemo(() => displayedUsers, [displayedUsers]);

  // ── Stable callbacks needed by socket handlers ────────────────────────────
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
        }),
      );
    },
    [SECRET_KEY, currentUser.id],
  );

  const showNotification = useCallback((data) => {
    setNotifications((prev) =>
      [
        {
          id: Date.now(),
          chatId: data.chatId,
          senderName: data.senderName,
          message: data.message || "New message",
          timestamp: data.timestamp,
        },
        ...prev,
      ].slice(0, MAX_NOTIFICATIONS),
    );
    const audio = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUBELTKXh8bllHAU+ktbx0H8tBSh+zPLaizsKFGO56+mhUBAMTKXh8bllHAU+ktbx0H8tBSh+zPLaizsKFGO56+mhUBAMTKXh8bllHAU+ktbx0H8tBSh+",
    );
    audio.volume = 0.3;
    audio.play().catch(() => {});
  }, []);

  const handleGroupSelect = useCallback((group) => {
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

    setGroups((prev) =>
      prev.map((g) => (g.id === group.id ? { ...g, unread: 0 } : g)),
    );
    setNotifications((prev) => prev.filter((n) => n.chatId !== group.chatId));

    if (currentGroup && currentGroup.chatId !== group.chatId) {
      socketRef.current.emit("leave_chat", { chatId: currentGroup.chatId });
      setMessages([]);
      processedMessagesRef.current.clear();
    }

    socketRef.current.emit("join_chat", { chatId: group.chatId });
  }, []);

  // ── Socket hook ───────────────────────────────────────────────────────────
  const { socketRef } = useSocket({
    currentUser,
    socketUrl,
    SECRET_KEY,

    setSocketConnected,
    setMessages,
    setOnlineUsers,
    setTypingUsers,
    setUploadProgress,
    setChatFiles,
    setFilesPagination,
    setLoadingFiles,
    setGroups,
    setNotifications,
    setTotalUsers,
    setHasMoreOldMessages,
    setHasMoreNewMessages,
    setOldestMessageTimestamp,
    setNewestMessageTimestamp,
    setIsLoadingMessages,
    setIsInitialMessagesLoad,
    setIsLoadingOlder,
    setIsLoadingNewer,
    setIsDeletingMessage,
    setIsInputDisabled,
    setRateLimitError,
    setSocketInitialized,

    selectedGroupRef,
    processedMessagesRef,
    hasAutoSelectedRef,

    handleGroupSelect,
    updateGroupLastMessage,
    showNotification,
  });

  // ── Side-effects ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (selectedGroup && Allusers.length > 0) setMembers(Allusers);
  }, [Allusers, selectedGroup]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default")
      Notification.requestPermission();
  }, []);

  const emojiClickInsideRefLocal = emojiClickInsideRef;
  useEffect(() => {
    const outsideHandler = (e) => {
      if (emojiButtonRef.current?.contains(e.target)) return;
      if (emojiClickInsideRefLocal.current) {
        emojiClickInsideRefLocal.current = false;
        return;
      }
      setShowEmojiPicker(false);
    };
    document.addEventListener("pointerdown", outsideHandler);
    return () => document.removeEventListener("pointerdown", outsideHandler);
  }, []);
  useEffect(() => {
    const currentCount = messages.length;
    const prevCount = prevMessageCountRef.current;

    // Only scroll if messages were ADDED (not deleted)
    if (currentCount > prevCount) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    prevMessageCountRef.current = currentCount;
  }, [messages]);

  useEffect(() => {
    if (!selectedGroup?.chatId || !socketRef.current?.connected) return;
    messages
      .filter(
        (msg) => msg.senderId !== currentUser.id && msg.msgStatus !== "read",
      )
      .forEach((msg) => {
        socketRef.current.emit("message_read", {
          _id: msg._id,
          chatId: msg.chatId,
        });
      });
  }, [selectedGroup?.chatId, messages, currentUser.id]);

  useEffect(() => {
    setDisplayedUsers([]);
    setUserPage(1);
    setTotalPages(1);
    setIsLoadingUsers(false);
  }, [selectedGroup?.chatId]);

  // Typing listeners scoped to the selected chat
  useEffect(() => {
    if (!socketRef.current || !selectedGroup) return;
    const socket = socketRef.current;

    const onTyping = (data) => {
      if (
        data.chatId !== selectedGroup.chatId ||
        data.userId === currentUser.id
      )
        return;
      setTypingUsers((prev) => {
        if (prev.some((u) => u.userId === data.userId)) return prev;
        return [
          ...prev,
          { userId: data.userId, userName: data.userName || "Someone" },
        ];
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
      avatar:
        "https://res.cloudinary.com/ddefr5owc/image/upload/v1766049897/logo_xwrr9w.png",
    }));
    setGroups(formatted);
    setIsLoadingGroups(false);
  }, [fetchedGroups]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const fetchFilesPage = useCallback((page = 1, type = "image") => {
    if (!socketRef.current?.connected || !selectedGroupRef.current?.chatId)
      return;
    setLoadingFiles(true);
    socketRef.current.emit("get_group_images", {
      chatId: selectedGroupRef.current.chatId,
      limit: 6,
      page,
      type,
    });
  }, []);

  const refetchFiles = useCallback(
    (type = "image") => {
      setFilesTabType(type);
      setFilesPage(1);
      setChatFiles([]);
      setFilesPagination({});
      fetchFilesPage(1, type);
    },
    [fetchFilesPage],
  );

  useEffect(() => {
    if (filesPage > 1) fetchFilesPage(filesPage, filesTabType);
  }, [filesPage, filesTabType, fetchFilesPage]);

  const loadOlderMessages = useCallback(() => {
    if (
      !selectedGroupRef.current?.chatId ||
      isLoadingOlder ||
      !hasMoreOldMessages
    )
      return;
    setIsLoadingOlder(true);
    const before = oldestMessageTimestamp || messages[0]?.timestamp;
    socketRef.current?.emit("fetch_older_messages", {
      chatId: selectedGroupRef.current.chatId,
      before,
      limit: 30,
    });
  }, [isLoadingOlder, hasMoreOldMessages, oldestMessageTimestamp, messages]);

  const loadNewerMessages = useCallback(() => {
    if (
      !selectedGroupRef.current?.chatId ||
      isLoadingNewer ||
      !hasMoreNewMessages
    )
      return;
    setIsLoadingNewer(true);
    const after =
      newestMessageTimestamp || messages[messages.length - 1]?.timestamp;
    socketRef.current?.emit("fetch_newer_messages", {
      chatId: selectedGroupRef.current.chatId,
      after,
      limit: MESSAGES_PER_PAGE,
    });
  }, [isLoadingNewer, hasMoreNewMessages, newestMessageTimestamp, messages]);

  const handleTyping = useCallback(() => {
    if (isInputDisabled || !socketRef.current || !selectedGroupRef.current)
      return;
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
  }, [currentUser, isInputDisabled]);

  const sendMessage = useCallback(async () => {
    if (isInputDisabled) {
      const el = document.createElement("div");
      el.className =
        "fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] font-semibold";
      el.textContent =
        rateLimitError || "Please wait! You're sending messages too quickly.";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
      return;
    }
    if (!message.trim() || !selectedGroupRef.current || !currentUser.id) return;

    const sanitized = decodeHtmlEntities(sanitizeMessage(message.trim()));
    if (!sanitized) return;

    const pendingId = makeId("temp");
    const correlationId = makeId(currentUser.id);
    const encrypted = await encryptMessage(sanitized, SECRET_KEY);

    const messageData = buildTempMessage({
      pendingId,
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

    const isReallyConnected =
      socketRef.current?.connected &&
      socketRef.current?.io?.engine?.readyState === "open";

    if (isReallyConnected) {
      socketRef.current.emit("send_message", messageData);
    } else {
      if (socketRef.current && !socketRef.current.connected)
        socketRef.current.connect();
      setMessages((prev) =>
        prev.map((m) =>
          m._id === pendingId
            ? {
                ...m,
                status: "failed",
                msgStatus: "failed",
                error: "Connection lost — tap to retry",
              }
            : m,
        ),
      );
    }
  }, [
    isInputDisabled,
    rateLimitError,
    message,
    currentUser,
    SECRET_KEY,
    replyToMessage,
  ]);

  const sendImageMessage = useCallback(async () => {
    if (
      isInputDisabled ||
      !selectedImages.length ||
      !selectedGroupRef.current ||
      !currentUser.id
    )
      return;
    const timestamp = Date.now();

    for (let i = 0; i < selectedImages.length; i++) {
      const imgObj = selectedImages[i];
      const pendingId = makeId(`temp_img_${i}`);
      const correlationId = makeId(`${currentUser.id}_img_${i}`);
      const sanitizedCaption = imageCaption.trim()
        ? sanitizeMessage(imageCaption.trim())
        : "";

      const messageData = buildTempMessage({
        pendingId,
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
        if (!socketRef.current?.connected)
          throw new Error("Socket not connected");
        socketRef.current.emit("send_file", {
          fileBuffer: buffer,
          fileName: imgObj.name,
          fileType: imgObj.file.type,
          caption: sanitizedCaption,
          messageData,
        });
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === pendingId
              ? {
                  ...m,
                  status: "failed",
                  msgStatus: "failed",
                  msgBody: {
                    ...m.msgBody,
                    media: { ...m.msgBody.media, is_uploading: false },
                  },
                  error: err.message,
                }
              : m,
          ),
        );
      }
    }
    cancelImageUpload();
    setReplyToMessage(null);
  }, [selectedImages, imageCaption, currentUser, replyToMessage]);

  const sendDocumentMessage = useCallback(async () => {
    if (
      isInputDisabled ||
      !selectedDocument ||
      !selectedGroupRef.current ||
      !currentUser.id
    )
      return;

    const pendingId = makeId("temp_doc");
    const correlationId = makeId(`${currentUser.id}_doc`);
    const sanitizedCaption = documentCaption.trim()
      ? sanitizeMessage(documentCaption.trim())
      : "";

    const messageData = buildTempMessage({
      pendingId,
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
      if (!socketRef.current?.connected)
        throw new Error("Socket not connected");
      socketRef.current.emit("send_file", {
        fileBuffer: buffer,
        fileName: selectedDocument.name,
        fileType: selectedDocument.type,
        caption: sanitizedCaption,
        messageData,
      });
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === pendingId
            ? {
                ...m,
                status: "failed",
                msgStatus: "failed",
                msgBody: {
                  ...m.msgBody,
                  media: { ...m.msgBody.media, is_uploading: false },
                },
                error: err.message,
              }
            : m,
        ),
      );
    }
    setReplyToMessage(null);
  }, [selectedDocument, documentCaption, currentUser, replyToMessage]);

  const sendFileMessage = useCallback(async () => {
    if (
      isInputDisabled ||
      !selectedFile ||
      !selectedGroupRef.current ||
      !currentUser.id
    )
      return;
    const sanitizedName = sanitizeMessage(selectedFile.name.trim());
    if (!sanitizedName) return;

    const pendingId = makeId("temp_file");
    const correlationId = makeId(`${currentUser.id}_file`);
    const encrypted = await encryptMessage(sanitizedName, SECRET_KEY);

    const messageData = buildTempMessage({
      pendingId,
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
      if (!socketRef.current?.connected)
        throw new Error("Socket not connected");
      socketRef.current.emit("send_file", {
        fileBuffer: buffer,
        fileName: sanitizedName,
        fileType: selectedFile.type,
        messageData,
      });
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === pendingId
            ? {
                ...m,
                status: "failed",
                msgStatus: "failed",
                msgBody: {
                  ...m.msgBody,
                  media: { ...m.msgBody.media, is_uploading: false },
                },
                error: err.message,
              }
            : m,
        ),
      );
    }
    setReplyToMessage(null);
  }, [selectedFile, filePreview, currentUser, SECRET_KEY, replyToMessage]);

  const retryMessage = useCallback(
    async (failedMsg) => {
      setMessages((prev) => prev.filter((m) => m._id !== failedMsg._id));

      const pendingId = makeId("temp");
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
        _id: pendingId,
        correlationId,
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
        msgStatus: "pending",
        error: null,
        msgBody: {
          ...failedMsg.msgBody,
          message: encrypted,
          originalText: messageText,
        },
        metaData: {
          isSent: false,
          sentAt: null,
          isDelivered: false,
          deliveredAt: null,
          isRead: false,
          readAt: null,
          readBy: [],
        },
      };

      setMessages((prev) => [...prev, newMsg]);

      if (socketRef.current?.connected) {
        socketRef.current.emit("send_message", newMsg);
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === pendingId
              ? {
                  ...m,
                  status: "failed",
                  msgStatus: "failed",
                  error: "Not connected to server",
                }
              : m,
          ),
        );
      }
    },
    [currentUser.id, SECRET_KEY],
  );

  const deleteForMe = useCallback(
    (msgId) => {
      setIsDeletingMessage(true);

      setMessages((prev) =>
        prev.filter((msg) => {
          const id = msg._id?.toString() || msg.id;
          return id !== msgId;
        }),
      );

      if (socketRef.current?.connected) {
        socketRef.current.emit("delete_for_me", {
          msgId,
          userId: currentUser.id,
          chatId: selectedGroupRef.current?.chatId,
        });
      } else {
        socketRef.current?.emit("join_chat", {
          chatId: selectedGroupRef.current?.chatId,
        });
        setIsDeletingMessage(false);
      }
    },
    [currentUser.id],
  );

  const deleteForEveryone = useCallback(
    (msgId) => {
      setIsDeletingMessage(true);
      const target = messages.find(
        (m) => (m._id?.toString() || m.id) === msgId,
      );
      const realId = target?._id?.toString();
      if (!realId) {
        setIsDeletingMessage(false);
        return;
      }

      setMessages((prev) =>
        prev.map((msg) => {
          const id = msg._id?.toString() || msg.id;
          return id === msgId
            ? {
                ...msg,
                deletedForEveryone: true,
                msgBody: {
                  ...msg.msgBody,
                  message: "This message was deleted",
                },
              }
            : msg;
        }),
      );

      if (socketRef.current?.connected) {
        socketRef.current.emit("delete_for_everyone", {
          msgId: realId,
          userId: currentUser.id,
          chatId: selectedGroupRef.current?.chatId,
        });
      } else {
        // Rollback
        setMessages((prev) =>
          prev.map((msg) => {
            const id = msg._id?.toString() || msg.id;
            return id === msgId
              ? {
                  ...msg,
                  deletedForEveryone: false,
                  msgBody: { ...msg.msgBody, message: target.msgBody?.message },
                }
              : msg;
          }),
        );
        setIsDeletingMessage(false);
      }
    },
    [messages, currentUser.id],
  );

  const handleClearChat = useCallback(() => {
    if (!selectedGroupRef.current?.chatId) return;
    if (socketRef.current?.connected) {
      socketRef.current.emit("clear_chat", {
        chatId: selectedGroupRef.current.chatId,
        userId: currentUser.id,
      });
    }
    setShowClearChatModal(false);
  }, [currentUser.id]);

  const reportMessage = useCallback((reportData) => {
    if (socketRef.current?.connected)
      socketRef.current.emit("report_message", reportData);
    else console.error("Socket not connected – cannot report");
  }, []);

  // ── File selection ────────────────────────────────────────────────────────
  const handleImageSelect = useCallback(
    (event) => {
      if (isInputDisabled) return;
      const files = Array.from(event.target.files).filter(
        (f) => f.type.startsWith("image/") && f.size <= MAX_IMAGE_SIZE_BYTES,
      );
      if (!files.length) return;
      setSelectedImages(
        files.map((file) => ({
          file,
          preview: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
        })),
      );
      setShowImagePreview(true);
      setImageCaption("");
    },
    [isInputDisabled],
  );

  const handleDocumentSelect = useCallback(
    (event) => {
      if (isInputDisabled) return;
      const file = event.target.files[0];
      if (!file || file.size > MAX_DOC_SIZE_BYTES) return;
      if (
        !ALLOWED_DOC_TYPES.has(file.type) &&
        !ALLOWED_DOC_EXTENSIONS.test(file.name)
      )
        return;
      setSelectedDocument({
        file,
        name: file.name,
        size: file.size,
        type: file.type,
      });
      setShowDocumentPreview(true);
      setDocumentCaption("");
    },
    [isInputDisabled],
  );

  const handleFileSelect = useCallback(
    (event) => {
      if (isInputDisabled) return;
      const file = event.target.files[0];
      if (!file || file.size > MAX_FILE_SIZE_BYTES) return;
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target.result);
          setShowFilePreview(true);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
        setShowFilePreview(true);
      }
    },
    [isInputDisabled],
  );

  const cancelImageUpload = useCallback(() => {
    setSelectedImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.preview));
      return [];
    });
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

  const handleReply = useCallback((msg) => setReplyToMessage(msg), []);
  const cancelReply = useCallback(() => setReplyToMessage(null), []);
  const ReadInfoButton = useCallback(() => setReadInfo((p) => !p), []);
  const handleBackToGroups = useCallback(() => {
    if (socketRef.current?.connected && selectedGroupRef.current) {
      socketRef.current.emit("leave_chat", {
        chatId: selectedGroupRef.current.chatId,
      });
    }
    setSelectedGroup(null);
    setTypingUsers([]);
    setMessages([]);
    processedMessagesRef.current.clear();
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  const showLoader = !socketInitialized || !currentUser.id || isLoadingGroups;
  const showGroupList = !isMobile || !selectedGroup;
  const showChatPane = !isMobile || !!selectedGroup;

  return (
    <div
      className="flex w-full overflow-hidden bg-[#000000] text-white"
      style={{
        height: isMobile ? "100dvh" : "100vh",
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
          isMobile={isMobile}
          showGroupList={showGroupList}
          showChatPane={showChatPane}
          sidebarStyle={
            isMobile
              ? {
                  width: "100%",
                  height: "100%",
                  display: showGroupList ? "flex" : "none",
                  flexDirection: "column",
                  flexShrink: 0,
                }
              : {
                  width: "38%",
                  minWidth: 280,
                  flexShrink: 0,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRight: "1px solid #1a1a1a",
                }
          }
          chatPaneStyle={
            isMobile
              ? {
                  width: "100%",
                  height: "100%",
                  display: showChatPane ? "flex" : "none",
                  flexDirection: "column",
                }
              : {
                  flex: 1,
                  minWidth: 0,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }
          }
          selectedGroup={selectedGroup}
          onBackToGroups={handleBackToGroups}
          isLoadingGroups={isLoadingGroups}
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
          members={Allusers}
          showMembers={showMembers}
          setShowMembers={setShowMembers}
          onlineUsers={onlineUsers}
          typingUsers={typingUsers}
          isLoadingUsers={isLoadingUsers}
          userPage={userPage}
          totalPages={totalPages}
          totalUsers={totalUsers}
          currentUser={currentUser}
          message={message}
          setMessage={setMessage}
          onSendMessage={sendMessage}
          handleTyping={handleTyping}
          isInputDisabled={isInputDisabled}
          rateLimitError={rateLimitError}
          setIsInputDisabled={setIsInputDisabled}
          replyToMessage={replyToMessage}
          handleReply={handleReply}
          cancelReply={cancelReply}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          emojiPickerRef={emojiPickerRef}
          emojiButtonRef={emojiButtonRef}
          emojiClickInsideRef={emojiClickInsideRef}
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
          selectedDocument={selectedDocument}
          setSelectedDocument={setSelectedDocument}
          showDocumentPreview={showDocumentPreview}
          setShowDocumentPreview={setShowDocumentPreview}
          documentCaption={documentCaption}
          setDocumentCaption={setDocumentCaption}
          handleDocumentSelect={handleDocumentSelect}
          sendDocumentMessage={sendDocumentMessage}
          cancelDocumentUpload={cancelDocumentUpload}
          uploadProgress={uploadProgress}
          showFileTypeModal={showFileTypeModal}
          setShowFileTypeModal={setShowFileTypeModal}
          isRecording={isRecording}
          setIsRecording={setIsRecording}
          audioBlob={audioBlob}
          setAudioBlob={setAudioBlob}
          recordingTime={recordingTime}
          setRecordingTime={setRecordingTime}
          playingAudio={playingAudio}
          setPlayingAudio={setPlayingAudio}
          showFilesPanel={showFilesPanel}
          setShowFilesPanel={setShowFilesPanel}
          chatFiles={chatFiles}
          filesPagination={filesPagination}
          loadingFiles={loadingFiles}
          filesPage={filesPage}
          setFilesPage={setFilesPage}
          refetchFiles={refetchFiles}
          filesTabType={filesTabType}
          deleteForMe={deleteForMe}
          deleteForEveryone={deleteForEveryone}
          isDeletingMessage={isDeletingMessage}
          setIsDeletingMessage={setIsDeletingMessage}
          reportMessage={reportMessage}
          onClearChat={handleClearChat}
          showClearChatModal={showClearChatModal}
          setShowClearChatModal={setShowClearChatModal}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          ReadInfoButton={ReadInfoButton}
          socketRef={socketRef}
          formatTime={formatTime}
          formatDuration={formatDuration}
          formatFileSize={formatFileSize}
        />
      )}
    </div>
  );
};

export default GroupChatApp;
