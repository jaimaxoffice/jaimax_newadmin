import React, { useEffect, useRef, useState, useCallback } from "react";
import Cookies from "js-cookie";
import {
  Users,
  ChevronDown,
  Pin,
  PinOff,
  X,
  Star,
  StarOff,
  ArrowDown,
  ArrowLeft,
  Reply,
  Copy,
  Check,
  CheckCheck,
  Pencil,
  Info,
  Trash2,
  Flag,
  Forward,
  Smile,
  Download,
  GripHorizontal,
  SmilePlus,
  ShieldBan,
  ShieldCheck,
} from "lucide-react";
import { decryptMessage } from "./socket/encryptmsg";
import Loader from "../../ReusableComponents/Loader/loader";
import loaderImage from "/logo.png";
import ChatHeader from "./chatWindow/Chatheader";
import MessageBubble from "./chatWindow/Messagebubble";
import MessageInput from "./chatWindow/Messageinput";
import GroupInfoPanel from "./chatWindow/Groupinfopanel";
import SharedFilesPanel from "./chatWindow/Sharedfilespanel";
import {
  ClearChatModal,
  ErrorDetailModal,
  FileTypeModal,
  FileSendPreview,
  ImagePreviewModal,
  DocumentPreviewModal,
  ReportModal,
  ReadReceiptsModal,
} from "./chatWindow/Modals";

import MessageInfoPanel from "./chatWindow/MessageInfoPanel";
import ForwardModal from "./chatWindow/ForwardModal";
import StarredMessagesPanel from "./chatWindow/StarredMessagesPanel";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

function useIsTablet() {
  const [isTablet, setIsTablet] = useState(
    typeof window !== "undefined"
      ? window.innerWidth >= 640 && window.innerWidth < 1024
      : false
  );
  useEffect(() => {
    const handler = () =>
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isTablet;
}

const ChatWindow = ({
  selectedGroup,
  messages,
  ReadInfoButton,
  retryMessage,
  members,
  replyToMessage,
  groupKey,
  showMembers,
  refetchFiles,
  showClearChatModal,
  setShowClearChatModal,
  setShowMembers,
  handleReply,
  cancelReply,
  onClearChat,
  message,
  setMessage,
  onSendMessage,
  isInputDisabled,
  setIsInputDisabled,
  isLoadingMessages,
  isInitialMessagesLoad,
  loadNextPage,
  loadPrevPage,
  isLoadingUsers,
  userPage,
  totalPages,
  totalUsers,
  goToNextPage,
  goToPrevPage,
  goToFirstPage,
  goToLastPage,
  goToPage,
  isLoadingGroups,
  onBackToGroups,
  currentUser,
  typingUsers,
  onlineUsers,
  showEmojiPicker,
  showFileTypeModal,
  setShowFileTypeModal,
  setShowEmojiPicker,
  selectedFile,
  filePreview,
  showFilePreview,
  audioBlob,
  recordingTime,
  loadMoreUsers,
  isLoadingMoreUsers,
  hasMoreUsers,
  showFilesPanel,
  setShowFilesPanel,
  openMenuId,
  setOpenMenuId,
  cancelFileUpload,
  sendFileMessage,
  cancelRecording,
  sendAudioMessage,
  handleTyping,
  formatTime,
  formatDuration,
  fileInputRef,
  emojiPickerRef,
  messagesEndRef,
  chatFiles,
  loadingFiles,
  uploadingFile,
  uploadingAudio,
  socketRef,
  formatDateHeader,
  groupMessagesByDate,
  deleteForMe,
  deleteForEveryone,
  onMarkAsRead,
  loadOlderMessages,
  loadNewerMessages,
  isLoadingOlder,
  isLoadingNewer,
  hasMoreOldMessages,
  hasMoreNewMessages,
  reportMessage,
  selectedImages,
  setSelectedImages,
  selectedDocument,
  setSelectedDocument,
  imageCaption,
  setImageCaption,
  documentCaption,
  setDocumentCaption,
  showImagePreview,
  setShowImagePreview,
  showDocumentPreview,
  setShowDocumentPreview,
  handleImageSelect,
  handleDocumentSelect,
  sendImageMessage,
  sendDocumentMessage,
  cancelImageUpload,
  cancelDocumentUpload,
  removeImage,
  formatFileSize,
  emojiButtonRef,
  emojiClickInsideRef,
  filesPagination,
  filesPage,
  setFilesPage,
  filesTabType,
  rateLimitError,
  isAdmin = false,         // ← NEW: from socket join_chat_success
  isBlocked = false,       // ← NEW: from socket
  onAdminDelete,           // ← NEW: callback
  onBlockUser,             // ← NEW: callback
  onUnblockUser,
}) => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const [blockedUsers, setBlockedUsers] = useState([]);
  // ═══════════════════════════════════════════════════════════
  //  STATE
  // ═══════════════════════════════════════════════════════════
  const [countdown, setCountdown] = useState(0);
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const messagesAreaRef = useRef(null);
  const inputRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const prevMessagesLengthRef = useRef(0);
  const [showErrorDetail, setShowErrorDetail] = useState(null);
  const [isComponentLoading, setIsComponentLoading] = useState(true);
  const [activeGroupTab, setActiveGroupTab] = useState("overview");

  const isCurrentUserBlocked = blockedUsers.includes(currentUser?.id?.toString());
  const hasMoreOldMessagesRef = useRef(hasMoreOldMessages);
  const isLoadingOlderRef = useRef(isLoadingOlder);
  const hasMoreNewMessagesRef = useRef(hasMoreNewMessages);
  const isLoadingNewerRef = useRef(isLoadingNewer);
  useEffect(() => {
    hasMoreOldMessagesRef.current = hasMoreOldMessages;
  }, [hasMoreOldMessages]);

  useEffect(() => {
    isLoadingOlderRef.current = isLoadingOlder;
  }, [isLoadingOlder]);

  useEffect(() => {
    hasMoreNewMessagesRef.current = hasMoreNewMessages;
  }, [hasMoreNewMessages]);

  useEffect(() => {
    isLoadingNewerRef.current = isLoadingNewer;
  }, [isLoadingNewer]);

  const scrollPositionRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const isRestoringScrollRef = useRef(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const membersContainerRef = useRef(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingMessage, setReportingMessage] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  const [showReadReceipts, setShowReadReceipts] = useState(false);
  const [selectedMessageForReceipts, setSelectedMessageForReceipts] =
    useState(null);

  const [showMessageInfo, setShowMessageInfo] = useState(false);
  const [messageInfoData, setMessageInfoData] = useState(null);
  const [messageInfoLoading, setMessageInfoLoading] = useState(false);

  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState(null);

  const [showStarredPanel, setShowStarredPanel] = useState(false);
  const [starredMessages, setStarredMessages] = useState([]);
  const [starredLoading, setStarredLoading] = useState(false);

  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [reactionPickerPosition, setReactionPickerPosition] = useState({
    top: 0,
    left: 0,
  });
  const [amIBlocked, setAmIBlocked] = useState(false);
  const [myBlockedAt, setMyBlockedAt] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");

  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [showPinnedExpanded, setShowPinnedExpanded] = useState(false);
  const [currentPinnedIndex, setCurrentPinnedIndex] = useState(0);

  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [localOpenMenuId, setLocalOpenMenuId] = useState(null);
  const effectiveOpenMenuId =
    typeof openMenuId !== "undefined" ? openMenuId : localOpenMenuId;
  const setEffectiveOpenMenuId = (v) => {
    if (typeof setOpenMenuId === "function") setOpenMenuId(v);
    else setLocalOpenMenuId(v);
  };

  const [observedMessages, setObservedMessages] = useState(new Set());
  const observerRef = useRef(null);

  const storedData = Cookies.get("adminUserData");
  let userRole = "";
  let platformRole = "";
  if (storedData) {
    const parsed = JSON.parse(storedData);
    userRole = parsed.data.role;
    platformRole = parsed.data.role;
  }

  const isOverlayOpen =
    showMembers || showFilesPanel || showStarredPanel || showMessageInfo;
  const handleUserBlocked = useCallback(({ chatId, targetUserId, blockedBy, blockedByName, blockedAt }) => {
    if (chatId === selectedGroup?.chatId) {
      setBlockedUsers((prev) => {
        if (prev.includes(targetUserId)) return prev;
        return [...prev, targetUserId];
      });
    }
  }, [selectedGroup?.chatId]);

  useEffect(() => {
    if (selectedGroup?.chatId && socketRef?.current?.connected) {
      socketRef.current.emit("get_blocked_users", {
        chatId: selectedGroup.chatId,
        userId: currentUser.id,
      });
    }
    // Reset on chat change
    setBlockedUsers([]);
  }, [selectedGroup?.chatId, currentUser?.id]);
  const handleUserUnblocked = useCallback(({ chatId, targetUserId }) => {
    if (chatId === selectedGroup?.chatId) {
      setBlockedUsers((prev) => prev.filter((id) => id !== targetUserId));
    }
  }, [selectedGroup?.chatId]);

  const handleBlockedUsersList = useCallback(({ chatId, blockedUsers: blocked, amIBlocked: blockedUser, myBlockedAt: blockedAt }) => {
    if (chatId === selectedGroup?.chatId) {
      setBlockedUsers(blocked || []);
      setAmIBlocked(!!blockedUser);    // ← FIXED: correct variable
      setMyBlockedAt(blockedAt ? new Date(blockedAt) : null);
    }
  }, [selectedGroup?.chatId]);

  const handleBlockError = useCallback(({ error }) => {
    console.error("Block error:", error);
  }, []);

  const handleBlockUser = useCallback(
    (targetUserId) => {
      socketRef?.current?.emit("block_user", {
        chatId: selectedGroup.chatId,
        targetUserId,
        blockedBy: currentUser.id,
        blockedByName: currentUser.name,
        blockerRole: currentUser.role,
      });
    },
    [socketRef, selectedGroup, currentUser]
  );

  const handleUnblockUser = useCallback(
    (targetUserId) => {
      socketRef?.current?.emit("unblock_user", {
        chatId: selectedGroup.chatId,
        targetUserId,
        unblockedBy: currentUser.id,
        unblockerRole: currentUser.role,
      });
    },
    [socketRef, selectedGroup, currentUser]
  );
  // ═══════════════════════════════════════════════════════════
  //  SOCKET LISTENERS
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;

    const handlePinnedMessages = ({ chatId, messages: pinned }) => {
      if (chatId === selectedGroup?.chatId) setPinnedMessages(pinned || []);
    };
    const handleMessagePinned = ({ chatId, message: pinnedMsg }) => {
      if (chatId === selectedGroup?.chatId)
        setPinnedMessages((prev) => [pinnedMsg, ...prev].slice(0, 3));
    };
    const handleMessageUnpinned = ({ chatId, msgId }) => {
      if (chatId === selectedGroup?.chatId)
        setPinnedMessages((prev) => prev.filter((m) => m._id !== msgId));
    };
    const handleReactionUpdate = () => { };
    const handleStarSuccess = () => { };
    const handleMessageInfo = (data) => {
      setMessageInfoData(data);
      setMessageInfoLoading(false);
    };
    const handleStarredMessages = ({ messages: msgs }) => {
      setStarredMessages(msgs || []);
      setStarredLoading(false);
    };
    const handleMessageEdited = () => { };
    const handleForwardSuccess = () => {
      setShowForwardModal(false);
      setForwardingMessage(null);
    };
    const handleYouAreBlocked = ({ chatId: blockedChatId, blockedBy, blockedByName, blockedAt }) => {
      if (blockedChatId === selectedGroup?.chatId) {
        setBlockedUsers((prev) => {
          const myId = currentUser?.id?.toString();
          if (prev.includes(myId)) return prev;
          return [...prev, myId];
        });
        setAmIBlocked(true);
        setMyBlockedAt(blockedAt ? new Date(blockedAt) : new Date());
      }
    };

    const handleYouAreUnblocked = ({ chatId: unblockedChatId }) => {
      if (unblockedChatId === selectedGroup?.chatId) {
        setBlockedUsers((prev) =>
          prev.filter((id) => id !== currentUser?.id?.toString())
        );
      }
      setAmIBlocked(false);
      setMyBlockedAt(null);
    };

    // Also handle send_message_error for blocked feedback
    const handleSendMessageError = ({ error, blocked, correlationId }) => {
      if (blocked) {
        // Force add current user to blocked list
        setBlockedUsers((prev) => {
          const myId = currentUser?.id?.toString();
          if (prev.includes(myId)) return prev;
          return [...prev, myId];
        });
      }
    };


    socket.on("pinned_messages", handlePinnedMessages);
    socket.on("message_pinned", handleMessagePinned);
    socket.on("message_unpinned", handleMessageUnpinned);
    socket.on("message:reaction_update", handleReactionUpdate);
    socket.on("star_message_success", handleStarSuccess);
    socket.on("message_info", handleMessageInfo);
    socket.on("starred_messages", handleStarredMessages);
    socket.on("message_edited", handleMessageEdited);
    socket.on("forward_message_success", handleForwardSuccess);
    socket.on("user_blocked", handleUserBlocked);
    socket.on("user_unblocked", handleUserUnblocked);
    socket.on("blocked_users_list", handleBlockedUsersList);
    socket.on("block_user_error", handleBlockError);
    socket.on("you_are_blocked", handleYouAreBlocked);
    socket.on("you_are_unblocked", handleYouAreUnblocked);

    return () => {
      socket.off("pinned_messages", handlePinnedMessages);
      socket.off("message_pinned", handleMessagePinned);
      socket.off("message_unpinned", handleMessageUnpinned);
      socket.off("message:reaction_update", handleReactionUpdate);
      socket.off("star_message_success", handleStarSuccess);
      socket.off("message_info", handleMessageInfo);
      socket.off("starred_messages", handleStarredMessages);
      socket.off("message_edited", handleMessageEdited);
      socket.off("forward_message_success", handleForwardSuccess);
      socket.off("user_blocked", handleUserBlocked);
      socket.off("user_unblocked", handleUserUnblocked);
      socket.off("blocked_users_list", handleBlockedUsersList);
      socket.off("block_user_error", handleBlockError);
      socket.off("you_are_blocked", handleYouAreBlocked);
      socket.off("you_are_unblocked", handleYouAreUnblocked);
    };
  }, [socketRef, selectedGroup?.chatId]);

  // ═══════════════════════════════════════════════════════════
  //  FEATURE HANDLERS
  // ═══════════════════════════════════════════════════════════
  const handlePinMessage = useCallback(
    (msgId) => {
      socketRef?.current?.emit("pin_message", {
        msgId,
        chatId: selectedGroup.chatId,
        userId: currentUser.id,
        userName: currentUser.name,
      });
      setEffectiveOpenMenuId(null);
    },
    [socketRef, selectedGroup, currentUser]
  );

  const handleUnpinMessage = useCallback(
    (msgId) => {
      socketRef?.current?.emit("unpin_message", {
        msgId,
        chatId: selectedGroup.chatId,
      });
      setEffectiveOpenMenuId(null);
    },
    [socketRef, selectedGroup]
  );

  const handleStarMessage = useCallback(
    (msgId) => {
      socketRef?.current?.emit("star_message", {
        msgId,
        chatId: selectedGroup.chatId,
        userId: currentUser.id,
      });
      setEffectiveOpenMenuId(null);
    },
    [socketRef, selectedGroup, currentUser]
  );

  const handleUnstarMessage = useCallback(
    (msgId) => {
      socketRef?.current?.emit("unstar_message", {
        msgId,
        chatId: selectedGroup.chatId,
        userId: currentUser.id,
      });
      setEffectiveOpenMenuId(null);
    },
    [socketRef, selectedGroup, currentUser]
  );

  const handleReaction = useCallback(
    (msgId, emoji) => {
      socketRef?.current?.emit("message:react", {
        msgId,
        chatId: selectedGroup.chatId,
        emoji,
        userId: currentUser.id,
        userName: currentUser.name,
      });
      setShowReactionPicker(null);
    },
    [socketRef, selectedGroup, currentUser]
  );

  const handleRemoveReaction = useCallback(
    (msgId) => {
      socketRef?.current?.emit("message:remove_reaction", {
        msgId,
        chatId: selectedGroup.chatId,
        userId: currentUser.id,
      });
    },
    [socketRef, selectedGroup, currentUser]
  );

  const handleForward = useCallback((msg) => {
    setForwardingMessage(msg);
    setShowForwardModal(true);
    setEffectiveOpenMenuId(null);
  }, []);

  const submitForward = useCallback(
    (toChatIds) => {
      if (!forwardingMessage) return;
      socketRef?.current?.emit("forward_message", {
        msgId: forwardingMessage.msgId || forwardingMessage._id,
        fromChatId: selectedGroup.chatId,
        toChatIds,
        userId: currentUser.id,
        userName: currentUser.name,
      });
    },
    [forwardingMessage, socketRef, selectedGroup, currentUser]
  );

  const handleEditMessage = useCallback(
    (msg) => {
      const msgText =
        typeof msg.msgBody?.message === "object" && groupKey
          ? decryptMessage(msg.msgBody.message, groupKey)
          : msg.msgBody?.message || "";
      setEditingMessage(msg);
      setEditText(msgText);
      setShowEditModal(true);
      setEffectiveOpenMenuId(null);
    },
    [groupKey]
  );

  const submitEdit = useCallback(() => {
    if (!editingMessage || !editText.trim()) return;
    socketRef?.current?.emit("edit_message", {
      msgId: editingMessage.msgId || editingMessage._id,
      chatId: selectedGroup.chatId,
      newMessage: editText.trim(),
      userId: currentUser.id,
    });
    setShowEditModal(false);
    setEditingMessage(null);
    setEditText("");
  }, [editingMessage, editText, socketRef, selectedGroup, currentUser]);

  const handleShowMessageInfo = useCallback(
    (msg) => {
      setMessageInfoLoading(true);
      setShowMessageInfo(true);
      socketRef?.current?.emit("get_message_info", {
        msgId: msg.msgId || msg._id,
        chatId: selectedGroup.chatId,
      });
      setEffectiveOpenMenuId(null);
    },
    [socketRef, selectedGroup]
  );

  const handleShowStarred = useCallback(() => {
    setStarredLoading(true);
    setShowStarredPanel(true);
    socketRef?.current?.emit("get_starred_messages", {
      chatId: selectedGroup.chatId,
      userId: currentUser.id,
    });
  }, [socketRef, selectedGroup, currentUser]);

  const handleReport = useCallback((msg) => {
    setReportingMessage(msg);
    setShowReportModal(true);
    setEffectiveOpenMenuId(null);
  }, []);

  const submitReport = () => {
    if (!reportReason) {
      alert("Please select a reason");
      return;
    }
    const reportData = {
      msgId: reportingMessage.msgId || reportingMessage._id?.toString(),
      chatId: selectedGroup.chatId,
      userId: currentUser.id,
      reason: reportReason,
      description: reportDescription,
    };
    socketRef?.current?.emit("report_message", reportData);
    reportMessage?.(reportData);
    setShowReportModal(false);
    setReportingMessage(null);
    setReportReason("");
    setReportDescription("");
  };

  const handleShowReactionPicker = useCallback(
    (msgId, e) => {
      e?.stopPropagation();
      if (isMobile) {
        setReactionPickerPosition({
          top: window.innerHeight - 120,
          left: (window.innerWidth - 280) / 2,
        });
      } else {
        const rect = e.currentTarget.getBoundingClientRect();
        setReactionPickerPosition({
          top: Math.max(10, rect.top - 50),
          left: Math.min(rect.left, window.innerWidth - 300),
        });
      }
      setShowReactionPicker(msgId);
    },
    [isMobile]
  );

  // ═══════════════════════════════════════════════════════════
  //  EFFECTS
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    let timer;
    if (isInputDisabled) {
      setCountdown(60);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsInputDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isInputDisabled]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedGroup && messages !== undefined) setIsComponentLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedGroup, messages]);

  useEffect(() => {
    setIsComponentLoading(true);
    setPinnedMessages([]);
    setShowStarredPanel(false);
    setShowMessageInfo(false);
  }, [selectedGroup?.id]);

  useEffect(() => {
    if (!isComponentLoading && messages?.length > 0) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
          isAtBottomRef.current = true;
        });
      });
    }
  }, [isComponentLoading]);

  useEffect(() => {
    const container = membersContainerRef.current;
    if (!container || activeGroupTab !== "members") return;
    let scrollTimeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const pct = ((scrollTop + clientHeight) / scrollHeight) * 100;
        if (pct > 90 && userPage < totalPages && !isLoadingUsers)
          loadNextPage?.();
        if (pct < 10 && userPage > 1 && !isLoadingUsers) loadPrevPage?.();
      }, 300);
    };
    container.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(scrollTimeout);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [activeGroupTab, isLoadingUsers, userPage, totalPages]);

  useEffect(() => {
    const messagesArea = messagesAreaRef.current;
    if (!messagesArea) return;

    let scrollTimeout;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);

      const { scrollTop, scrollHeight, clientHeight } = messagesArea;
      const distBottom = scrollHeight - scrollTop - clientHeight;

      isAtBottomRef.current = distBottom < 100;
      setUserScrolledUp(!isAtBottomRef.current);
      if (isAtBottomRef.current) setNewMessagesCount(0);

      scrollTimeout = setTimeout(() => {
        // ✅ Load older: user near TOP
        if (
          scrollTop < 200 &&
          hasMoreOldMessagesRef.current &&
          !isLoadingOlderRef.current
        ) {
          console.log("[SCROLL] Near top — loading older messages");
          loadOlderMessages();
        }

        // ✅ Load newer: user near BOTTOM but not at bottom
        if (
          distBottom < 200 &&
          hasMoreNewMessagesRef.current &&
          !isLoadingNewerRef.current &&
          !isAtBottomRef.current
        ) {
          loadNewerMessages();
        }
      }, 200);
    };

    messagesArea.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(scrollTimeout);
      messagesArea.removeEventListener("scroll", handleScroll);
    };
  }, [loadOlderMessages, loadNewerMessages]);
  useEffect(() => {
    const messagesArea = messagesAreaRef.current;
    if (!messagesArea) return;
    if (isLoadingOlder && !scrollPositionRef.current) {
      const visibleMessages = messagesArea.querySelectorAll("[data-msg-id]");
      if (visibleMessages.length > 0) {
        const containerRect = messagesArea.getBoundingClientRect();
        for (let msg of visibleMessages) {
          const rect = msg.getBoundingClientRect();
          if (
            rect.top >= containerRect.top &&
            rect.top <= containerRect.bottom
          ) {
            scrollPositionRef.current = msg.getAttribute("data-msg-id");
            isRestoringScrollRef.current = true;
            break;
          }
        }
      }
    }
  }, [isLoadingOlder]);

  useEffect(() => {
    if (
      !isLoadingOlder &&
      scrollPositionRef.current &&
      isRestoringScrollRef.current
    ) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = document.getElementById(
            `msg-${scrollPositionRef.current}`
          );
          if (el) el.scrollIntoView({ block: "start", behavior: "instant" });
          scrollPositionRef.current = null;
          isRestoringScrollRef.current = false;
        });
      });
    }
  }, [isLoadingOlder, messages?.length]);

  useEffect(() => {
    if (!selectedGroup || !messagesAreaRef.current || !currentUser?.id) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const now = Date.now();
        entries.forEach((entry) => {
          const msgId = entry.target.getAttribute("data-msg-id");
          const fromUserId = entry.target.getAttribute("data-from-user-id");
          if (!entry.isIntersecting || entry.intersectionRatio < 0.7) return;
          if (!msgId || !fromUserId) return;
          if (fromUserId === currentUser.id.toString()) return;
          if (observedMessages.has(msgId)) return;
          setObservedMessages((prev) => {
            const s = new Set(prev);
            s.add(msgId);
            return s;
          });
          onMarkAsRead?.({
            msgId,
            groupId: selectedGroup.id,
            chatId: selectedGroup.chatId,
            userId: currentUser.id,
            timestamp: now,
          });
          if (socketRef?.current?.connected) {
            socketRef.current.emit("message:read", {
              msgId,
              chatId: selectedGroup.chatId,
              userId: currentUser.id,
              readAt: now,
            });
          }
        });
      },
      {
        root: messagesAreaRef.current,
        threshold: 0.7,
        rootMargin: "-20px 0px -20px 0px",
      }
    );
    const timeoutId = setTimeout(() => {
      const els = messagesAreaRef.current?.querySelectorAll("[data-msg-id]");
      els?.forEach((el) => {
        if (
          el.getAttribute("data-msg-id") &&
          el.getAttribute("data-from-user-id")
        )
          observerRef.current.observe(el);
      });
    }, 100);
    return () => {
      clearTimeout(timeoutId);
      observerRef.current?.disconnect();
    };
  }, [
    selectedGroup?.id,
    selectedGroup?.chatId,
    messages?.length,
    currentUser?.id,
    onMarkAsRead,
    socketRef,
  ]);

  useEffect(() => {
    setObservedMessages(new Set());
  }, [selectedGroup?.id]);

  useEffect(() => {
    const messagesArea = messagesAreaRef.current;
    if (!messagesArea || !messages?.length) return;
    if (isRestoringScrollRef.current || isLoadingOlder) {
      prevMessagesLengthRef.current = messages.length;
      return;
    }
    if (isInitialLoad) {
      if (!isInitialMessagesLoad && !isLoadingMessages) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
            isAtBottomRef.current = true;
          });
        });
        setIsInitialLoad(false);
      }
      prevMessagesLengthRef.current = messages.length;
      return;
    }
    const prevLength = prevMessagesLengthRef.current;
    const currentLength = messages.length;
    if (currentLength <= prevLength) return;
    const lastMessage = messages[currentLength - 1];
    const previousLastMessage =
      prevLength > 0 ? messages[prevLength - 1] : null;
    if (
      previousLastMessage &&
      lastMessage.msgId === previousLastMessage.msgId
    ) {
      prevMessagesLengthRef.current = currentLength;
      return;
    }
    const isMyMessage =
      lastMessage?.fromUserId?.toString() === currentUser?.id?.toString();
    if (isMyMessage || isAtBottomRef.current) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100); // 100ms lets the image render and expand
        });
      });
    } else {
      setNewMessagesCount((prev) => prev + 1);
    }
    prevMessagesLengthRef.current = currentLength;
  }, [
    messages?.length,
    currentUser?.id,
    isInitialLoad,
    isInitialMessagesLoad,
    isLoadingMessages,
  ]);

  useEffect(() => {
    const onClick = () => {
      setEffectiveOpenMenuId(null);
      setShowReactionPicker(null);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setEffectiveOpenMenuId(null);
        setShowReadReceipts(false);
        setShowReactionPicker(null);
        setShowMessageInfo(false);
        setShowForwardModal(false);
        setShowEditModal(false);
        setShowStarredPanel(false);
        setShowPinnedExpanded(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onResize = () => {
      setEffectiveOpenMenuId(null);
      setShowReactionPicker(null);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);




  // ═══════════════════════════════════════════════════════════
  //  HELPERS
  // ═══════════════════════════════════════════════════════════
  const renderMessageWithLinks = (text) => {
    if (!text) return null;
    text = String(text);
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#53bdeb] hover:underline break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const getMessageReadStatus = (msg) => {
    const isCurrentUser =
      msg.fromUserId?.toString() === currentUser?.id?.toString();
    if (!isCurrentUser) return null;
    const readBy = msg.metaData?.readBy || [];
    const deliveredTo = msg.metaData?.deliveredTo || [];
    const totalMembers = members?.length || 0;
    if (!msg.metaData?.isSent && msg.msgStatus === "pending") return "sending";
    if (msg.msgStatus === "failed") return "failed";
    if (readBy.length >= totalMembers - 1 && totalMembers > 1)
      return "read_all";
    if (readBy.length > 0) return "read_some";
    if (deliveredTo.length >= totalMembers - 1 && totalMembers > 1)
      return "delivered_all";
    if (deliveredTo.length > 0 || msg.metaData?.isDelivered)
      return "delivered";
    if (msg.metaData?.isSent) return "sent";
    return "sending";
  };

  const isMessageStarred = (msg) =>
    (msg.starredBy || []).includes(currentUser?.id?.toString());

  const isMessagePinned = (msg) => msg.isPinned === true;

  const canEditMessage = (msg) => {
    if (msg.fromUserId?.toString() !== currentUser?.id?.toString())
      return false;
    if (
      msg.msgBody?.message_type === "file" ||
      msg.msgBody?.message_type === "audio"
    )
      return false;
    return Date.now() - new Date(msg.timestamp).getTime() < 15 * 60 * 1000;
  };

  // const toggleMenu = (msgId, e, isCurrentUser) => {
  //   e?.stopPropagation();
  //   if (effectiveOpenMenuId === msgId) {
  //     setEffectiveOpenMenuId(null);
  //     return;
  //   }
  //   if (isMobile) {
  //     setMenuPosition({ top: 0, left: 0 });
  //     setEffectiveOpenMenuId(msgId);
  //     return;
  //   }
  //   const msgElem = document.getElementById(`msg-${msgId}`);
  //   const container = containerRef.current;
  //   const header = headerRef.current;
  //   if (!msgElem || !container) {
  //     setMenuPosition({
  //       top: 80,
  //       left: Math.max(16, (container?.clientWidth || 300) - 220),
  //     });
  //     setEffectiveOpenMenuId(msgId);
  //     return;
  //   }
  //   const msgRect = msgElem.getBoundingClientRect();
  //   const containerRect = container.getBoundingClientRect();
  //   const headerRect = header
  //     ? header.getBoundingClientRect()
  //     : { bottom: containerRect.top };
  //   const spaceAbove =
  //     msgRect.top - containerRect.top - (headerRect.height || 0);
  //   const spaceBelow = containerRect.bottom - msgRect.bottom;
  //   const MENU_W = 200,
  //     MENU_H = 280,
  //     GAP = 8;
  //   let left = isCurrentUser
  //     ? Math.max(
  //         containerRect.left + 8,
  //         Math.min(msgRect.right - MENU_W, containerRect.right - 8 - MENU_W)
  //       )
  //     : Math.max(
  //         containerRect.left + 8,
  //         Math.min(msgRect.left, containerRect.right - 8 - MENU_W)
  //       );
  //   let top =
  //     spaceAbove > MENU_H + GAP
  //       ? msgRect.top - MENU_H - GAP
  //       : spaceBelow > MENU_H + GAP
  //         ? msgRect.bottom + GAP
  //         : Math.min(
  //             Math.max(containerRect.top + 8, msgRect.bottom + GAP),
  //             containerRect.bottom - MENU_H - 8
  //           );
  //   setMenuPosition({
  //     top: Math.round(top - containerRect.top),
  //     left: Math.round(left - containerRect.left),
  //   });
  //   setEffectiveOpenMenuId(msgId);
  // };
  // ═══════════════════════════════════════════════════════════
  //  FIXED toggleMenu function (replace in ChatWindow)
  // ═══════════════════════════════════════════════════════════
  const toggleMenu = useCallback(
    (msgId, e, isCurrentUser) => {
      e?.stopPropagation();
      e?.preventDefault();

      if (effectiveOpenMenuId === msgId) {
        setEffectiveOpenMenuId(null);
        return;
      }

      // Mobile → bottom sheet, no position needed
      if (isMobile) {
        setMenuPosition({ top: 0, left: 0 });
        setEffectiveOpenMenuId(msgId);
        return;
      }

      // Desktop → calculate position relative to container
      const msgElem = document.getElementById(`msg-${msgId}`);
      const container = containerRef.current;

      if (!msgElem || !container) {
        setEffectiveOpenMenuId(msgId);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const msgRect = msgElem.getBoundingClientRect();

      const MENU_W = 220;
      const MENU_H = 340; // estimated max height
      const GAP = 6;
      const EDGE_PADDING = 8;

      // ── Calculate LEFT ──
      let left;
      if (isCurrentUser) {
        // Right-aligned messages → menu opens to the left
        left = msgRect.right - containerRect.left - MENU_W;
      } else {
        // Left-aligned messages → menu opens to the right
        left = msgRect.left - containerRect.left;
      }

      // Clamp left within container bounds
      left = Math.max(
        EDGE_PADDING,
        Math.min(left, containerRect.width - MENU_W - EDGE_PADDING)
      );

      // ── Calculate TOP ──
      const spaceBelow = containerRect.bottom - msgRect.bottom;
      const spaceAbove = msgRect.top - containerRect.top;

      let top;

      if (spaceBelow >= MENU_H + GAP) {
        // Enough space below → show below message
        top = msgRect.bottom - containerRect.top + GAP;
      } else if (spaceAbove >= MENU_H + GAP) {
        // Enough space above → show above message
        top = msgRect.top - containerRect.top - MENU_H - GAP;
      } else {
        // Not enough space either way → fit within container
        // Show in whichever direction has more space
        if (spaceBelow > spaceAbove) {
          top = msgRect.bottom - containerRect.top + GAP;
        } else {
          top = msgRect.top - containerRect.top - MENU_H - GAP;
        }
      }

      // Clamp top within container bounds
      top = Math.max(
        EDGE_PADDING,
        Math.min(top, containerRect.height - MENU_H - EDGE_PADDING)
      );

      setMenuPosition({
        top: Math.round(top),
        left: Math.round(left),
      });
      setEffectiveOpenMenuId(msgId);
    },
    [effectiveOpenMenuId, isMobile]
  );
  const scrollToMessage = (msgId) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("highlight-message");
      setTimeout(() => el.classList.remove("highlight-message"), 2000);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setNewMessagesCount(0);
  };

  const handleCopyMessage = (messageText, id) => {
    if (!messageText) return;
    let textToCopy = messageText;
    if (typeof messageText === "object" && messageText !== null) {
      if (messageText.cipherText && groupKey) {
        try {
          textToCopy = decryptMessage(messageText, groupKey);
        } catch {
          textToCopy = "[Encrypted message]";
        }
      } else {
        textToCopy = "[Unable to copy]";
      }
    }
    navigator.clipboard
      .writeText(String(textToCopy || ""))
      .then(() => {
        setCopiedMessageId(id);
        setTimeout(() => setCopiedMessageId(null), 2000);
      })
      .catch(console.error);
  };

  const downloadFileToDesktop = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl, { mode: "cors" });
      if (!response.ok) throw new Error("Network error");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = blobUrl;
      link.download = fileName || "download";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName || "download";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const deduplicatedMessages = React.useMemo(() => {
    if (!messages || messages.length === 0) return [];
    const seen = new Map();
    for (const msg of messages) {
      const id = msg._id?.toString() || msg.msgId || msg.correlationId ||
        `${msg.fromUserId}-${msg.timestamp}-${msg.msgBody?.message}`;
      seen.set(id, msg);
    }
    let result = Array.from(seen.values()).sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    // If current user is blocked, only show messages UP TO block time
    if (amIBlocked && myBlockedAt) {
      result = result.filter(
        (msg) => new Date(msg.timestamp) <= myBlockedAt
      );
    }

    return result;
  }, [messages, amIBlocked, myBlockedAt]);

  const groupedMessages = groupMessagesByDate(deduplicatedMessages);
  const currentRole = currentUser.role;
  const parseRoleNum = (currentRole) => {
    if (typeof currentRole === "number") return currentRole;
    if (typeof currentRole === "string" && !isNaN(Number(currentRole))) return Number(currentRole);
    return null;
  };
  const numericUserRole = parseRoleNum(userRole) ?? parseRoleNum(currentUser?.role);
  const isEffectiveAdmin =
    numericUserRole === 0 ||
    numericUserRole === 2 ||
    ["admin", "superAdmin", "subAdmin", "sub_admin"].includes(userRole);
  return (
    <>
      {isComponentLoading ? (
        <Loader />
      ) : (
        <div
          ref={containerRef}
          className="flex-1 flex flex-col relative h-full overflow-hidden bg-[#0b141a] w-full max-w-full"
        >
          {/* ─── HEADER ─── */}
          {!isOverlayOpen && (
            <div ref={headerRef}>
              <ChatHeader
                selectedGroup={selectedGroup}
                totalUsers={totalUsers}
                typingUsers={typingUsers}
                setShowMembers={setShowMembers}
                setShowFilesPanel={setShowFilesPanel}
                setActiveGroupTab={setActiveGroupTab}
                setShowClearChatModal={setShowClearChatModal}
                onShowStarred={handleShowStarred}
                headerRef={headerRef}
                isMobile={isMobile}
                onBackToGroups={onBackToGroups}
              />
            </div>
          )}

          {/* ─── PINNED MESSAGES BAR ─── */}
          {pinnedMessages.length > 0 && !isOverlayOpen && (
            <div className="bg-[#1f2c34] border-b border-[#2a3942] px-2 sm:px-4 py-1.5 sm:py-2">
              <div className="flex items-center justify-between gap-2">
                <div
                  className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0 cursor-pointer"
                  onClick={() => {
                    const pinId = pinnedMessages[currentPinnedIndex]?._id;
                    if (pinId) scrollToMessage(pinId);
                    setCurrentPinnedIndex(
                      (prev) => (prev + 1) % pinnedMessages.length
                    );
                  }}
                >
                  <Pin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00a884] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-[#00a884] text-[10px] sm:text-xs font-medium">
                        Pinned
                        {pinnedMessages.length > 1 &&
                          ` (${currentPinnedIndex + 1}/${pinnedMessages.length})`}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-300 truncate">
                      {typeof pinnedMessages[currentPinnedIndex]?.msgBody
                        ?.message === "string"
                        ? pinnedMessages[currentPinnedIndex].msgBody.message
                        : pinnedMessages[currentPinnedIndex]?.msgBody
                          ?.message_type === "file"
                          ? pinnedMessages[currentPinnedIndex]?.msgBody?.media
                            ?.fileName || "File"
                          : "Message"}
                    </p>
                  </div>
                </div>
                {pinnedMessages.length > 1 && (
                  <button
                    onClick={() => setShowPinnedExpanded(!showPinnedExpanded)}
                    className="p-1 hover:bg-[#2a3942] rounded flex-shrink-0"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 transition-transform ${showPinnedExpanded ? "rotate-180" : ""
                        }`}
                    />
                  </button>
                )}
              </div>

              {showPinnedExpanded && (
                <div className="mt-1.5 sm:mt-2 space-y-0.5 sm:space-y-1 border-t border-[#2a3942] pt-1.5 sm:pt-2">
                  {pinnedMessages.map((pin, idx) => (
                    <div
                      key={pin._id}
                      className="flex items-center justify-between py-1 px-1.5 sm:px-2 hover:bg-[#2a3942] rounded cursor-pointer"
                      onClick={() => {
                        scrollToMessage(pin._id);
                        setCurrentPinnedIndex(idx);
                        setShowPinnedExpanded(false);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] sm:text-xs text-[#00a884]">
                          {pin.publisherName}
                        </span>
                        <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                          {typeof pin.msgBody?.message === "string"
                            ? pin.msgBody.message
                            : "Media"}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnpinMessage(pin._id);
                        }}
                        className="p-0.5 sm:p-1 hover:bg-[#374751] rounded flex-shrink-0 ml-1"
                      >
                        <X className="w-3 h-3 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── OVERLAY PANELS ─── */}
          {selectedGroup && showMembers && (
            <div
              className={
                isMobile ? "absolute inset-0 z-40 bg-[#0b141a]" : ""
              }
            >
              <GroupInfoPanel
                selectedGroup={selectedGroup}
                activeGroupTab={activeGroupTab}
                setActiveGroupTab={setActiveGroupTab}
                members={members}
                totalUsers={totalUsers}
                membersContainerRef={membersContainerRef}
                accumulatedFiles={Array.isArray(chatFiles) ? chatFiles : []}
                filesPage={filesPage}
                setFilesPage={setFilesPage}
                loadingFiles={loadingFiles}
                filesPagination={filesPagination}
                refetchFiles={refetchFiles}
                setShowMembers={setShowMembers}
                messagesEndRef={messagesEndRef}
                formatFileSize={formatFileSize}
                downloadFileToDesktop={downloadFileToDesktop}
                isMobile={isMobile}
              />
            </div>
          )}

          {selectedGroup && showFilesPanel && (
            <div
              className={
                isMobile ? "absolute inset-0 z-40 bg-[#0b141a]" : ""
              }
            >
              <SharedFilesPanel
                setShowFilesPanel={setShowFilesPanel}
                accumulatedFiles={Array.isArray(chatFiles) ? chatFiles : []}
                filesPage={filesPage}
                loadingFiles={loadingFiles}
                filesPagination={filesPagination}
                formatTime={formatTime}
                formatFileSize={formatFileSize}
                isMobile={isMobile}
              />
            </div>
          )}

          {showStarredPanel && (
            <div
              className={
                isMobile ? "absolute inset-0 z-40 bg-[#0b141a]" : ""
              }
            >
              <StarredMessagesPanel
                starredMessages={starredMessages}
                loading={starredLoading}
                onClose={() => setShowStarredPanel(false)}
                onScrollToMessage={(msgId) => {
                  setShowStarredPanel(false);
                  setTimeout(() => scrollToMessage(msgId), 300);
                }}
                onUnstar={(msgId) => handleUnstarMessage(msgId)}
                formatTime={formatTime}
                groupKey={groupKey}
                currentUser={currentUser}
                isMobile={isMobile}
              />
            </div>
          )}

          {showMessageInfo && (
            <div
              className={
                isMobile ? "absolute inset-0 z-40 bg-[#0b141a]" : ""
              }
            >
              <MessageInfoPanel
                data={messageInfoData}
                loading={messageInfoLoading}
                members={members}
                onClose={() => {
                  setShowMessageInfo(false);
                  setMessageInfoData(null);
                }}
                formatTime={formatTime}
                isMobile={isMobile}
              />
            </div>
          )}

          {/* ─── MESSAGES AREA ─── */}
          {selectedGroup && !isOverlayOpen && (
            <div
              ref={messagesAreaRef}
              className="flex-1 overflow-y-auto p-1.5 sm:p-2 md:p-4 relative z-10 sidebar-scroll"
              style={{
                overflowAnchor: "none",
                WebkitOverflowScrolling: "touch",
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23111b21' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundColor: "#0b141a",
              }}
            >
              {isInitialMessagesLoad && isLoadingMessages ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b141a]/90 z-50">
                  <div className="relative w-14 h-14 sm:w-20 sm:h-20">
                    <div className="absolute inset-0 rounded-full border-[3px] sm:border-4 border-[#202c33] border-t-[#00a884] animate-spin" />
                    <div
                      className="absolute inset-0 rounded-full border-[3px] sm:border-4 border-transparent border-b-[#00a884]/40 animate-spin"
                      style={{
                        animationDirection: "reverse",
                        animationDuration: "1s",
                      }}
                    />
                    <img
                      src={loaderImage}
                      alt="loader"
                      className="absolute inset-0 m-auto w-7 h-7 sm:w-10 sm:h-10 object-contain"
                    />
                  </div>
                  <p className="text-sm sm:text-lg mt-4 sm:mt-6 mb-1 font-medium text-gray-300">
                    Loading messages…
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Please wait
                  </p>
                </div>
              ) : (
                <>
                  {isLoadingOlder && (
                    <div className="sticky top-0 z-20 flex justify-center py-3 mb-2">
                      <div className="bg-[#202c33] px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-lg border border-[#2a3942]">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#2a3942] border-t-[#00a884]" />
                        </div>
                        <span className="text-xs text-gray-300 font-medium">
                          Loading older messages…
                        </span>
                      </div>
                    </div>
                  )}

                  {!isLoadingOlder && hasMoreOldMessages && messages?.length > 0 && (
                    <div className="flex justify-center py-2 mb-1">
                      <button
                        onClick={() => loadOlderMessages()}
                        className="group bg-[#182229] hover:bg-[#202c33] active:bg-[#2a3942] 
                 px-4 py-2 rounded-xl border border-[#2a3942]/50 
                 hover:border-[#00a884]/40 transition-all duration-200 
                 cursor-pointer active:scale-95 flex items-center gap-2
                 shadow-sm hover:shadow-md"
                      >
                        <svg
                          className="w-3.5 h-3.5 text-[#00a884] group-hover:-translate-y-0.5 
                   transition-transform duration-200"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                        <span className="text-xs sm:text-sm text-gray-400 
                        group-hover:text-gray-200 font-medium 
                        transition-colors duration-200">
                          Load older messages
                        </span>
                      </button>
                    </div>
                  )}
                  {!messages || messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 px-4">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-[#202c33] flex items-center justify-center mb-3 sm:mb-4">
                        <Users className="w-8 h-8 sm:w-12 sm:h-12 opacity-50" />
                      </div>
                      <p className="text-base sm:text-lg mb-1 text-gray-400 text-center">
                        No messages yet
                      </p>
                      <p className="text-xs sm:text-sm text-center">
                        Send a message to start the conversation
                      </p>
                    </div>
                  ) : (
                    <>
                      {Object.entries(groupedMessages).map(
                        ([dateKey, dateMessages]) => (
                          <div key={dateKey}>
                            <div className="flex justify-center my-2 sm:my-3">
                              <span className="bg-[#182229] text-[#8696a0] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-medium shadow-sm uppercase tracking-wide">
                                {formatDateHeader(dateKey)}
                              </span>
                            </div>
                            {dateMessages.map((msg, index) => {
                              const uniqueKey =
                                msg._id?.toString() ||
                                msg.msgId ||
                                msg.correlationId ||
                                `${msg.fromUserId}-${msg.timestamp}-${index}`;
                              return (
                                <MessageBubble
                                  key={uniqueKey}
                                  msg={msg}
                                  currentUser={currentUser}
                                  members={members}
                                  groupKey={groupKey}
                                  effectiveOpenMenuId={effectiveOpenMenuId}
                                  copiedMessageId={copiedMessageId}
                                  toggleMenu={toggleMenu}
                                  scrollToMessage={scrollToMessage}
                                  formatTime={formatTime}
                                  formatFileSize={formatFileSize}
                                  renderMessageWithLinks={
                                    renderMessageWithLinks
                                  }
                                  onImageLoad={() => {
                                    if (isAtBottomRef.current) {
                                      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                                    }
                                  }}
                                  getMessageReadStatus={getMessageReadStatus}
                                  isEdited={msg.isEdited || false}
                                  isForwarded={msg.isForwarded || false}
                                  starred={isMessageStarred(msg)}
                                  pinned={isMessagePinned(msg)}
                                  reactions={msg.reactions || []}
                                  readStatus={getMessageReadStatus(msg)}
                                  onReact={handleShowReactionPicker}
                                  onRemoveReaction={handleRemoveReaction}
                                  isMobile={isMobile}
                                />
                              );
                            })}
                          </div>
                        )
                      )}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                  {isLoadingNewer && (
                    <div className="flex justify-center py-3 mt-2">
                      <div className="bg-[#202c33] px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-lg border border-[#2a3942]">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#2a3942] border-t-[#00a884]" />
                        <span className="text-xs text-gray-300 font-medium">
                          Loading newer messages…
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Scroll to bottom FAB */}
              {userScrolledUp && (
                <button
                  onClick={scrollToBottom}
                  className={`fixed z-40 rounded-full bg-[#202c33] hover:bg-[#2a3942] shadow-lg flex items-center justify-center transition-all border border-[#2a3942] active:scale-95 ${isMobile
                    ? "bottom-20 right-4 w-9 h-9"
                    : "bottom-24 right-8 w-10 h-10"
                    }`}
                >
                  <ArrowDown
                    className={`text-gray-400 ${isMobile ? "w-4 h-4" : "w-5 h-5"
                      }`}
                  />
                  {newMessagesCount > 0 && (
                    <span
                      className={`absolute bg-[#00a884] text-white font-bold rounded-full flex items-center justify-center ${isMobile
                        ? "-top-1.5 -right-1.5 text-[8px] w-4 h-4"
                        : "-top-2 -right-2 text-[10px] w-5 h-5"
                        }`}
                    >
                      {newMessagesCount > 99 ? "99+" : newMessagesCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          )}

          {/* ─── REACTION PICKER ─── */}
          {showReactionPicker && (
            <>
              {isMobile && (
                <div
                  className="fixed inset-0 z-40 bg-black/40"
                  onClick={() => setShowReactionPicker(null)}
                />
              )}
              <div
                className={`fixed z-50 bg-[#233138] shadow-xl border border-[#2a3942] flex items-center ${isMobile
                  ? "rounded-2xl px-3 py-2 gap-2 left-1/2 -translate-x-1/2 bottom-16"
                  : "rounded-full px-2 py-1 gap-1"
                  }`}
                style={
                  isMobile
                    ? {}
                    : {
                      top: reactionPickerPosition.top,
                      left: reactionPickerPosition.left,
                    }
                }
                onClick={(e) => e.stopPropagation()}
              >
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(showReactionPicker, emoji)}
                    className={`flex items-center justify-center hover:bg-[#2a3942] rounded-full transition-transform hover:scale-125 active:scale-95 ${isMobile ? "w-10 h-10 text-2xl" : "w-8 h-8 text-xl"
                      }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ─── TYPING INDICATOR ─── */}
          {typingUsers?.length > 0 && !isOverlayOpen && (
            <div className="px-2 sm:px-4 py-0.5 sm:py-1 bg-[#0b141a]">
              <div className="flex items-center gap-1.5 sm:gap-2 text-[#00a884] text-[10px] sm:text-xs">
                <div className="flex gap-0.5">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#00a884] rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
                <span className="truncate">
                  {typingUsers.length === 1
                    ? `${typingUsers[0].userId || "Someone"} is typing…`
                    : `${typingUsers.length} people are typing…`}
                </span>
              </div>
            </div>
          )}

          {/* ═══ MODALS ═══ */}
          <ImagePreviewModal
            showImagePreview={showImagePreview}
            selectedImages={selectedImages}
            imageCaption={imageCaption}
            setImageCaption={setImageCaption}
            uploadingFile={uploadingFile}
            cancelImageUpload={cancelImageUpload}
            sendImageMessage={sendImageMessage}
            removeImage={removeImage}
            formatFileSize={formatFileSize}
          />
          <DocumentPreviewModal
            showDocumentPreview={showDocumentPreview}
            selectedDocument={selectedDocument}
            uploadingFile={uploadingFile}
            cancelDocumentUpload={cancelDocumentUpload}
            sendDocumentMessage={sendDocumentMessage}
            formatFileSize={formatFileSize}
          />
          <ClearChatModal
            selectedGroup={selectedGroup}
            showClearChatModal={showClearChatModal}
            setShowClearChatModal={setShowClearChatModal}
            onClearChat={onClearChat}
          />
          <ErrorDetailModal
            showErrorDetail={showErrorDetail}
            setShowErrorDetail={setShowErrorDetail}
            retryMessage={retryMessage}
            formatTime={formatTime}
          />
          <FileTypeModal
            showFileTypeModal={showFileTypeModal}
            setShowFileTypeModal={setShowFileTypeModal}
            fileInputRef={fileInputRef}
          />
          <FileSendPreview
            showFilePreview={showFilePreview}
            selectedFile={selectedFile}
            filePreview={filePreview}
            uploadingFile={uploadingFile}
            cancelFileUpload={cancelFileUpload}
            sendFileMessage={sendFileMessage}
          />

          {/* Context Menu */}
          {selectedGroup && effectiveOpenMenuId && (
            <EnhancedContextMenu
              isAdmin={isEffectiveAdmin}  // ← Use combined check
              isBlocked={isBlocked}
              onAdminDelete={onAdminDelete}
              onBlockUser={onBlockUser}
              effectiveOpenMenuId={effectiveOpenMenuId}
              menuPosition={menuPosition}
              messages={messages}
              currentUser={currentUser}
              userRole={userRole}
              groupKey={groupKey}
              copiedMessageId={copiedMessageId}
              handleReply={handleReply}
              handleCopyMessage={handleCopyMessage}
              retryMessage={retryMessage}
              deleteForMe={deleteForMe}
              deleteForEveryone={deleteForEveryone}
              setEffectiveOpenMenuId={setEffectiveOpenMenuId}
              handlePinMessage={handlePinMessage}
              handleUnpinMessage={handleUnpinMessage}
              handleStarMessage={handleStarMessage}
              handleUnstarMessage={handleUnstarMessage}
              handleForward={handleForward}
              handleEditMessage={handleEditMessage}
              handleShowMessageInfo={handleShowMessageInfo}
              handleReport={handleReport}
              isMessageStarred={isMessageStarred}
              isMessagePinned={isMessagePinned}
              canEditMessage={canEditMessage}
              isMobile={isMobile}
              handleBlockUser={handleBlockUser}       // ← NEW
              handleUnblockUser={handleUnblockUser}   // ← NEW
              blockedUsers={blockedUsers}
              amIBlocked={amIBlocked}          // ← ADD THIS
              members={members}
            />
          )}

          <ReportModal
            showReportModal={showReportModal}
            reportingMessage={reportingMessage}
            reportReason={reportReason}
            reportDescription={reportDescription}
            setReportReason={setReportReason}
            setReportDescription={setReportDescription}
            setShowReportModal={setShowReportModal}
            setReportingMessage={setReportingMessage}
            groupKey={groupKey}
            submitReport={submitReport}
          />

          <ReadReceiptsModal
            showReadReceipts={showReadReceipts}
            setShowReadReceipts={setShowReadReceipts}
            selectedMessageForReceipts={selectedMessageForReceipts}
            members={members}
            formatTime={formatTime}
          />

          {/* Edit Modal */}
          {showEditModal && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60">
              <div
                className={`bg-[#233138] shadow-2xl w-full ${isMobile
                  ? "rounded-t-2xl max-h-[80vh]"
                  : "rounded-xl max-w-md mx-4"
                  }`}
              >
                <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-[#2a3942]">
                  <div className="flex items-center gap-2">
                    <Pencil className="w-4 h-4 sm:w-5 sm:h-5 text-[#00a884]" />
                    <h3 className="text-white text-base sm:text-lg font-medium">
                      Edit message
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingMessage(null);
                    }}
                    className="p-1.5 sm:p-1 hover:bg-[#2a3942] rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <div className="p-4 sm:p-5">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-[#2a3942] text-white rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none resize-none border border-[#374751] focus:border-[#00a884] transition-colors"
                    rows={isMobile ? 3 : 4}
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-4 border-t border-[#2a3942]">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingMessage(null);
                    }}
                    className="px-3 sm:px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitEdit}
                    disabled={!editText.trim()}
                    className="px-5 sm:px-6 py-2 bg-[#00a884] hover:bg-[#06cf9c] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors active:scale-95"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Forward Modal */}
          {showForwardModal && (
            <ForwardModal
              onClose={() => {
                setShowForwardModal(false);
                setForwardingMessage(null);
              }}
              onForward={submitForward}
              message={forwardingMessage}
              groupKey={groupKey}
              isMobile={isMobile}
            />
          )}

          {/* ─── INPUT BAR ─── */}
          {selectedGroup && !isOverlayOpen && (
            <>
              {/* {blockedUsers.includes(currentUser?.id?.toString()) ? ( */}
              {amIBlocked ? (
                // ── Blocked User Banner ──
                <div className="px-4 py-3 bg-[#1a2730] border-t border-[#2a3942]">
                  <div className="flex items-center justify-center gap-2 py-1">
                    <ShieldBan className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span className="text-sm text-red-400 font-medium">
                      You are blocked from sending messages in this group
                    </span>
                  </div>
                </div>
              ) : (
                // ── Normal Input ──
                <MessageInput
                  message={message}
                  setMessage={setMessage}
                  onSendMessage={onSendMessage}
                  isInputDisabled={isInputDisabled}
                  setIsInputDisabled={setIsInputDisabled}
                  countdown={countdown}
                  replyToMessage={replyToMessage}
                  cancelReply={cancelReply}
                  groupKey={groupKey}
                  handleTyping={handleTyping}
                  showEmojiPicker={showEmojiPicker}
                  setShowEmojiPicker={setShowEmojiPicker}
                  setShowFileTypeModal={setShowFileTypeModal}
                  inputRef={inputRef}
                  emojiPickerRef={emojiPickerRef}
                  emojiButtonRef={emojiButtonRef}
                  emojiClickInsideRef={emojiClickInsideRef}
                  rateLimitError={rateLimitError}
                  isMobile={isMobile}
                  onCameraImageReady={(captureData) => {
                    setSelectedImages([{
                      file: captureData.file,
                      preview: captureData.preview,
                      name: captureData.fileName,
                      size: captureData.fileSize,
                      type: captureData.fileType,
                    }]);
                    setImageCaption(captureData.caption || "");
                    setShowImagePreview(true);
                  }}
                />
              )}
            </>
          )}
        </div>
      )}

      <style>{`
        .highlight-message {
          animation: highlightFade 2s ease-out;
        }
        @keyframes highlightFade {
          0% { background-color: rgba(0, 168, 132, 0.3); }
          100% { background-color: transparent; }
        }
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.25s ease-out;
        }
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        @media (min-width: 640px) {
          .sidebar-scroll::-webkit-scrollbar {
            width: 6px;
          }
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: #374751;
          border-radius: 3px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #4a5568;
        }
        @supports (padding: env(safe-area-inset-bottom)) {
          .safe-bottom {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
        @media (max-width: 639px) {
          .no-select {
            -webkit-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
          }
        }
      `}</style>
    </>
  );
};

const EnhancedContextMenu = ({
  effectiveOpenMenuId,
  menuPosition,
  messages,
  currentUser,
  userRole,
  groupKey,
  copiedMessageId,
  handleReply,
  handleCopyMessage,
  retryMessage,
  deleteForMe,
  deleteForEveryone,
  setEffectiveOpenMenuId,
  handlePinMessage,
  handleUnpinMessage,
  handleStarMessage,
  handleUnstarMessage,
  handleForward,
  handleEditMessage,
  handleShowMessageInfo,
  handleReport,
  isMessageStarred,
  isMessagePinned,
  canEditMessage,
  handleBlockUser,
  handleUnblockUser,
  blockedUsers = [],
  amIBlocked = false,       // ← NEW PROP
  members = [],             // ← NEW PROP for role checking
}) => {
  const menuRef = useRef(null);
  const [animateIn, setAnimateIn] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);

  useEffect(() => {
    if (effectiveOpenMenuId) {
      requestAnimationFrame(() => setAnimateIn(true));
    } else {
      setAnimateIn(false);
      setShowDeleteConfirm(null);
      setShowBlockConfirm(false);
    }
  }, [effectiveOpenMenuId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setEffectiveOpenMenuId(null);
      }
    };
    if (effectiveOpenMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [effectiveOpenMenuId]);

  if (!effectiveOpenMenuId) return null;

  const msg = messages?.find(
    (m) => (m.msgId || m._id?.toString()) === effectiveOpenMenuId
  );
  if (!msg) return null;

  const isCurrentUser =
    msg.fromUserId?.toString() === currentUser?.id?.toString();

  const parseRole = (role) => {
    if (role === null || role === undefined || role === "") return null;
    if (typeof role === "number") return role;
    if (typeof role === "string") {
      const n = Number(role);
      if (!isNaN(n) && role.trim() !== "") return n;
    }
    return null;
  };

  const numericRole = parseRole(currentUser?.role) ?? parseRole(userRole);
  const isAdmin = numericRole === 0;
  const isModeratorOrAbove = numericRole === 0 || numericRole === 1;
  const isSubAdmin = numericRole === 2;
  const canPin = isAdmin || isSubAdmin;
  const canDeleteForEveryone = isCurrentUser || isModeratorOrAbove || isSubAdmin;

  // ── Block permission: Sub-admin CANNOT block admin ──
  const targetMember = members.find(
    (m) => m.id?.toString() === msg.fromUserId?.toString() ||
      m.userId?.toString() === msg.fromUserId?.toString()
  );
  const targetNumericRole = parseRole(targetMember?.role) ?? parseRole(msg.fromUserRole);
  const isTargetAdmin = targetNumericRole === 0;
  const isTargetSubAdmin = targetNumericRole === 2;

  const canBlock = (() => {
    if (isCurrentUser) return false;
    if (amIBlocked) return false;                    // Blocked users can't block
    if (!isAdmin && !isSubAdmin) return false;
    if (isSubAdmin && isTargetAdmin) return false;   // Sub-admin can't block admin
    if (isSubAdmin && isTargetSubAdmin) return false; // Sub-admin can't block sub-admin
    return true;
  })();

  const isTargetBlocked = blockedUsers.includes(msg.fromUserId?.toString());
  const starred = isMessageStarred(msg);
  const pinned = isMessagePinned(msg);
  const editable = canEditMessage(msg);
  const msgId = msg.msgId || msg._id?.toString();
  const isCopied = copiedMessageId === effectiveOpenMenuId;
  const isTextMessage = msg.msgBody?.message_type !== "file";

  const closeMenu = () => setEffectiveOpenMenuId(null);
  const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  // ── Block Confirm Dialog ──
  if (showBlockConfirm) {
    return (
      <div
        ref={menuRef}
        className={`fixed z-[60] transition-all duration-200 ease-out
          ${animateIn ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        style={{
          top: menuPosition.top,
          left: menuPosition.left,
          transformOrigin: "top left",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#1f2c34] rounded-2xl shadow-2xl border border-[#30444f] w-[300px] overflow-hidden backdrop-blur-sm">
          <div className="flex flex-col items-center pt-5 pb-3 px-5">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isTargetBlocked ? "bg-green-500/10" : "bg-red-500/10"
              }`}>
              {isTargetBlocked ? (
                <ShieldCheck className="w-6 h-6 text-green-400" />
              ) : (
                <ShieldBan className="w-6 h-6 text-red-400" />
              )}
            </div>
            <p className="text-white text-sm font-medium text-center">
              {isTargetBlocked
                ? `Unblock ${msg.publisherName || msg.fromUserId || "this user"}?`
                : `Block ${msg.publisherName || msg.fromUserId || "this user"}?`}
            </p>
            <p className="text-gray-500 text-xs text-center mt-1.5 leading-relaxed">
              {isTargetBlocked
                ? "This user will be able to send messages again."
                : "This user will not be able to send messages in this group."}
            </p>
          </div>
          <div className="px-4 pb-4 flex gap-2.5">
            <button
              onClick={() => setShowBlockConfirm(false)}
              className="flex-1 py-2.5 text-sm text-gray-400 bg-[#2a3942] hover:bg-[#35474f] rounded-xl font-medium transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (isTargetBlocked) {
                  handleUnblockUser(msg.fromUserId?.toString());
                } else {
                  handleBlockUser(msg.fromUserId?.toString());
                }
                closeMenu();
              }}
              className={`flex-1 py-2.5 text-sm text-white rounded-xl font-medium transition-all active:scale-95 ${isTargetBlocked ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"
                }`}
            >
              {isTargetBlocked ? "Unblock" : "Block"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Delete Confirm Dialog ──
  if (showDeleteConfirm) {
    return (
      <div
        ref={menuRef}
        className={`fixed z-[60] transition-all duration-200 ease-out
          ${animateIn ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        style={{
          top: menuPosition.top,
          left: menuPosition.left,
          transformOrigin: "top left",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#1f2c34] rounded-2xl shadow-2xl border border-[#30444f] w-[280px] overflow-hidden backdrop-blur-sm">
          <div className="flex flex-col items-center pt-5 pb-3 px-5">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-white text-sm font-medium text-center">
              {showDeleteConfirm === "everyone" ? "Delete for everyone?" : "Delete for you?"}
            </p>
            <p className="text-gray-500 text-xs text-center mt-1.5 leading-relaxed">
              {showDeleteConfirm === "everyone"
                ? isCurrentUser
                  ? "This message will be removed for all members."
                  : "You're deleting another member's message for everyone."
                : "This message will only be removed from your view."}
            </p>
          </div>
          <div className="px-4 pb-4 flex gap-2.5">
            <button
              onClick={() => setShowDeleteConfirm(null)}
              className="flex-1 py-2.5 text-sm text-gray-400 bg-[#2a3942] hover:bg-[#35474f] rounded-xl font-medium transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (showDeleteConfirm === "everyone") {
                  deleteForEveryone(msgId);
                } else {
                  deleteForMe(msgId, currentUser.id);
                }
                closeMenu();
              }}
              className="flex-1 py-2.5 text-sm text-white bg-red-500 hover:bg-red-600 rounded-xl font-medium transition-all active:scale-95"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Menu ──
  return (
    <div
      ref={menuRef}
      className={`fixed z-[60] transition-all duration-200 ease-out
        ${animateIn ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      style={{
        top: menuPosition.top,
        left: menuPosition.left,
        transformOrigin: "top left",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-[#1f2c34] rounded-2xl shadow-2xl border border-[#30444f] w-[220px] overflow-hidden backdrop-blur-sm">

        {/* ── Quick Reactions (hidden if blocked) ── */}
        {!amIBlocked && (
          <div className="px-3 pt-3 pb-2 border-b border-[#2a3942]/60">
            <div className="flex items-center justify-between">
              {quickReactions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => closeMenu()}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#2a3942] text-lg transition-all duration-150 hover:scale-125 active:scale-95"
                >
                  {emoji}
                </button>
              ))}
              <button
                onClick={() => closeMenu()}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#2a3942] transition-all duration-150 hover:scale-110 active:scale-95"
              >
                <SmilePlus className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        )}

        <div className="py-1.5">

          {/* ── Reply (hidden if blocked) ── */}
          {!amIBlocked && (
            <MenuItem
              icon={<Reply className="w-[18px] h-[18px]" />}
              label="Reply"
              onClick={() => { handleReply(msg); closeMenu(); }}
            />
          )}

          {/* ── Copy (hidden if blocked) ── */}
          {!amIBlocked && isTextMessage && (
            <MenuItem
              icon={isCopied
                ? <Check className="w-[18px] h-[18px] text-green-400" />
                : <Copy className="w-[18px] h-[18px]" />
              }
              label={isCopied ? "Copied!" : "Copy"}
              success={isCopied}
              onClick={() => handleCopyMessage(msg.msgBody?.message, effectiveOpenMenuId)}
            />
          )}

          {/* ── Edit (hidden if blocked) ── */}
          {!amIBlocked && isCurrentUser && editable && (
            <MenuItem
              icon={<Pencil className="w-[18px] h-[18px]" />}
              label="Edit"
              onClick={() => { handleEditMessage(msg); closeMenu(); }}
            />
          )}

          {/* ── Pin/Unpin (hidden if blocked) ── */}
          {!amIBlocked && canPin && (
            <MenuItem
              icon={pinned
                ? <PinOff className="w-[18px] h-[18px]" />
                : <Pin className="w-[18px] h-[18px]" />
              }
              label={pinned ? "Unpin" : "Pin"}
              onClick={() => {
                pinned ? handleUnpinMessage(msgId) : handlePinMessage(msgId);
                closeMenu();
              }}
            />
          )}


          {/* ── Message Info (hidden if blocked) ── */}
          {!amIBlocked && isCurrentUser && (
            <MenuItem
              icon={<Info className="w-[18px] h-[18px]" />}
              label="Message info"
              onClick={() => { handleShowMessageInfo(msg); closeMenu(); }}
            />
          )}

          {/* ── Divider ── */}
          <div className="my-1.5 mx-3 border-t border-[#2a3942]/60" />

          {/* ── Block/Unblock (hidden if blocked) ── */}
          {!amIBlocked && canBlock && (
            <MenuItem
              icon={isTargetBlocked
                ? <ShieldCheck className="w-[18px] h-[18px]" />
                : <ShieldBan className="w-[18px] h-[18px]" />
              }
              label={isTargetBlocked ? "Unblock user" : "Block user"}
              danger={!isTargetBlocked}
              success={isTargetBlocked}
              onClick={() => setShowBlockConfirm(true)}
            />
          )}

          {/* ── Report (hidden if blocked) ── */}
          {!amIBlocked && !isCurrentUser && (
            <MenuItem
              icon={<Flag className="w-[18px] h-[18px]" />}
              label="Report"
              onClick={() => { handleReport(msg); closeMenu(); }}
            />
          )}

          {/* ── Delete for me (ALWAYS available) ── */}
          <MenuItem
            icon={<Trash2 className="w-[18px] h-[18px]" />}
            label="Delete for me"
            danger
            onClick={() => setShowDeleteConfirm("me")}
          />

          {/* ── Delete for everyone (hidden if blocked) ── */}
          {!amIBlocked && canDeleteForEveryone && (
            <MenuItem
              icon={<Trash2 className="w-[18px] h-[18px]" />}
              label="Delete for everyone"
              danger
              onClick={() => setShowDeleteConfirm("everyone")}
            />
          )}
        </div>
      </div>
    </div>
  );
};
const MenuItem = ({
  icon,
  label,
  onClick,
  danger = false,
  success = false,
  highlight = false,
}) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] 
        font-normal transition-all duration-150 active:scale-[0.98]
        ${danger
          ? "text-red-400 hover:bg-red-500/8"
          : success
            ? "text-green-400 hover:bg-[#2a3942]"
            : highlight
              ? "text-yellow-400 hover:bg-[#2a3942]"
              : "text-[#d1d7db] hover:bg-[#2a3942]"
        }`}
    >
      <span
        className={`flex-shrink-0 ${danger
          ? "text-red-400/70"
          : success
            ? "text-green-400/70"
            : highlight
              ? "text-yellow-400/70"
              : "text-[#8696a0]"
          }`}
      >
        {icon}
      </span>
      <span className="flex-1 text-left">{label}</span>
    </button>
  );
};

export default ChatWindow;