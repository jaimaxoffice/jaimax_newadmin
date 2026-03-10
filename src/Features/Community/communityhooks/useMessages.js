import { useState, useRef } from "react";
import { encryptMessage, decryptMessage } from "../encryptmsg.js";
import { sanitizeMessage } from "../sanitize.js";

const SECRET_KEY = import.meta.env.VITE_APP_CHATSECRETKEY?.trim();

/**
 * useMessages
 * Owns all message state and operations: send, delete, retry, pagination.
 */
const useMessages = (socketRef, selectedGroup, currentUser) => {
  const [messages, setMessages]                         = useState([]);
  const [replyToMessage, setReplyToMessage]             = useState(null);
  const [isInputDisabled, setIsInputDisabled]           = useState(false);
  const [hasMoreOldMessages, setHasMoreOldMessages]     = useState(true);
  const [hasMoreNewMessages, setHasMoreNewMessages]     = useState(false);
  const [isLoadingOlder, setIsLoadingOlder]             = useState(false);
  const [isLoadingNewer, setIsLoadingNewer]             = useState(false);
  const [oldestMessageTimestamp, setOldestMessageTimestamp] = useState(null);
  const [newestMessageTimestamp, setNewestMessageTimestamp] = useState(null);
  const [isDeletingMessage, setIsDeletingMessage]       = useState(false);

  const rateLimitResetTimer = useRef(null);
  const processedMessagesRef = useRef(new Set());

  // ── send text message ──────────────────────────────────────────────────────
  const sendMessage = async (messageText, setMessageText, replyTo, setReplyTo) => {
    if (isInputDisabled || !messageText.trim() || !selectedGroup || !currentUser.id) return;

    const sanitized = sanitizeMessage(messageText.trim());
    if (!sanitized) return;

    const timestamp   = new Date().toISOString();
    const tempId      = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const correlationId = `${currentUser.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const encrypted   = await encryptMessage(sanitized, SECRET_KEY);

    const messageData = {
      rowId: tempId, chatType: "groupChat", originalText: sanitized,
      messageType: "message", chatId: selectedGroup.chatId,
      msgId: tempId, _id: tempId, correlationId,
      createdAt: timestamp,
      fromUserId: currentUser.id,
      publisherName: currentUser.name,
      receiverId: "Jaimax Team",
      ...(replyTo && {
        replyTo: {
          msgId: replyTo.msgId || replyTo.id,
          message: replyTo.msgBody?.message,
          senderName: replyTo.publisherName || replyTo.senderName,
          senderId: replyTo.fromUserId,
        },
      }),
      msgBody: {
        message: encrypted, originalText: sanitized, message_type: "text",
        media: { fileName: "", file_url: "", file_key: "", duration: "", caption: "",
                 file_size: "", thumb_image: "", local_path: "",
                 is_uploading: 0, is_downloaded: 0, isLargeFile: false },
        UserName: currentUser.name,
      },
      msgStatus: "pending", timestamp: new Date(timestamp).getTime(),
      deleteStatus: 0, userId: currentUser.id, status: "pending", error: null, msgType: "text",
      metaData: { isSent: false, sentAt: null, isDelivered: false, deliveredAt: null,
                  isRead: false, readAt: null, readBy: [] },
    };

    setMessages((prev) => [...prev, messageData]);
    setMessageText("");
    setReplyTo(null);

    if (socketRef.current?.connected) {
      socketRef.current.emit("send_message", messageData);
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.msgId === tempId
              ? { ...msg, status: "sent", msgStatus: "sent", metaData: { ...msg.metaData, isSent: true, sentAt: Date.now() } }
              : msg
          )
        );
      }, 100);
    } else {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.msgId === tempId
            ? { ...msg, status: "failed", msgStatus: "failed", error: "Not connected to server" }
            : msg
        )
      );
    }
  };

  // ── delete for me ──────────────────────────────────────────────────────────
  const deleteForMe = (msgId) => {
    setIsDeletingMessage(true);
    setMessages((prev) =>
      prev.map((msg) => {
        const id = msg.msgId || msg._id?.toString() || msg.id;
        return id === msgId ? { ...msg, deletedFor: [...(msg.deletedFor || []), currentUser.id] } : msg;
      })
    );

    if (socketRef.current?.connected) {
      socketRef.current.emit("delete_for_me", { msgId, userId: currentUser.id, chatId: selectedGroup.chatId });
    } else {
      setMessages((prev) =>
        prev.map((msg) => {
          const id = msg.msgId || msg._id?.toString() || msg.id;
          return id === msgId ? { ...msg, deletedFor: (msg.deletedFor || []).filter((uid) => uid !== currentUser.id) } : msg;
        })
      );
    }
    setIsDeletingMessage(false);
  };

  // ── delete for everyone ────────────────────────────────────────────────────
  const deleteForEveryone = (msgId) => {
    setIsDeletingMessage(true);
    const target = messages.find((msg) => {
      const id = msg.msgId || msg._id?.toString() || msg.id;
      return id === msgId;
    });
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
      socketRef.current.emit("delete_for_everyone", { msgId: realId, userId: currentUser.id, chatId: selectedGroup.chatId });
    }
    setIsDeletingMessage(false);
  };

  // ── retry ──────────────────────────────────────────────────────────────────
  const retryMessage = async (failedMsg) => {
    setMessages((prev) => prev.filter((msg) => msg.msgId !== failedMsg.msgId));

    const newTempId      = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newCorrelationId = `${currentUser.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const originalText = failedMsg.msgBody?.originalText;
    let messageText;
    if (originalText) {
      messageText = originalText;
    } else {
      const enc = failedMsg.msgBody?.message;
      messageText = typeof enc === "object" && enc?.cipherText
        ? await decryptMessage(enc, SECRET_KEY)
        : String(enc);
    }

    const encrypted = await encryptMessage(messageText, SECRET_KEY);

    const newMessageData = {
      ...failedMsg,
      msgId: newTempId, _id: newTempId, rowId: newTempId,
      correlationId: newCorrelationId,
      timestamp: Date.now(), createdAt: new Date().toISOString(),
      msgStatus: "pending", status: "pending", error: null,
      msgBody: { ...failedMsg.msgBody, message: encrypted, originalText: messageText },
      metaData: { isSent: false, sentAt: null, isDelivered: false, deliveredAt: null,
                  isRead: false, readAt: null, readBy: [] },
    };

    setMessages((prev) => [...prev, newMessageData]);

    if (socketRef.current?.connected) {
      socketRef.current.emit("send_message", newMessageData);
    } else {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.msgId === newTempId
            ? { ...msg, status: "failed", msgStatus: "failed", error: "Not connected to server" }
            : msg
        )
      );
    }
  };

  // ── load older / newer ─────────────────────────────────────────────────────
  const loadOlderMessages = () => {
    if (!selectedGroup?.chatId || isLoadingOlder || !hasMoreOldMessages) return;
    setIsLoadingOlder(true);
    if (socketRef.current?.connected) {
      const before = oldestMessageTimestamp || messages[0]?.timestamp;
      socketRef.current.emit("fetch_older_messages", { chatId: selectedGroup.chatId, before, limit: 50 });
    } else {
      setIsLoadingOlder(false);
    }
  };

  const loadNewerMessages = () => {
    if (!selectedGroup?.chatId || isLoadingNewer || !hasMoreNewMessages) return;
    setIsLoadingNewer(true);
    if (socketRef.current?.connected) {
      const after = newestMessageTimestamp || messages[messages.length - 1]?.timestamp;
      socketRef.current.emit("fetch_newer_messages", { chatId: selectedGroup.chatId, after, limit: 50 });
    } else {
      setIsLoadingNewer(false);
    }
  };

  // ── clear chat ─────────────────────────────────────────────────────────────
  const handleClearChat = (chatId) => {
    setMessages([]);
    if (socketRef.current?.connected) {
      socketRef.current.emit("clear_chat", { chatId, userId: currentUser.id });
    }
  };

  // ── reply helpers ──────────────────────────────────────────────────────────
  const handleReply  = (msg) => setReplyToMessage(msg);
  const cancelReply  = ()    => setReplyToMessage(null);

  return {
    messages, setMessages,
    replyToMessage, setReplyToMessage, handleReply, cancelReply,
    isInputDisabled, setIsInputDisabled,
    hasMoreOldMessages, setHasMoreOldMessages,
    hasMoreNewMessages, setHasMoreNewMessages,
    isLoadingOlder,    setIsLoadingOlder,
    isLoadingNewer,    setIsLoadingNewer,
    oldestMessageTimestamp, setOldestMessageTimestamp,
    newestMessageTimestamp, setNewestMessageTimestamp,
    isDeletingMessage,
    processedMessagesRef,
    rateLimitResetTimer,
    sendMessage, deleteForMe, deleteForEveryone, retryMessage,
    loadOlderMessages, loadNewerMessages, handleClearChat,
  };
};

export default useMessages;