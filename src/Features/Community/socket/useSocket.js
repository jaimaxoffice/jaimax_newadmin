import { useEffect, useRef, useCallback } from "react";
import { createSocket } from "./socketConfig.js";
import { registerSocketHandlers } from "./socketHandlers.js";
import { safeDecrypt } from "./socketUtils.js";


export const useSocket = ({
  currentUser,
  socketUrl,
  SECRET_KEY,

  // state setters
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

  // refs
  selectedGroupRef,
  processedMessagesRef,
  hasAutoSelectedRef,


  setBlockedUsers,
  setIsBlocked,
  setIsAdmin,

  handleGroupSelect,
  updateGroupLastMessage,
  showNotification,
}) => {
  const socketRef = useRef(null);
  const rateLimitResetTimer = useRef(null);

  // ── processIncomingMessage ──────────────────────────────────────────────
  const processIncomingMessage = useCallback(
    async (data) => {
      const messageId = data._id?.toString() || data.msgId;
      if (!messageId || processedMessagesRef.current.has(messageId))
        return null;

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
    [SECRET_KEY, processedMessagesRef],
  );

  // ── connectSocket ──────────────────────────────────────────────────────
  const connectSocket = useCallback(() => {
    // Tear down any existing socket cleanly
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket = createSocket({ socketUrl, currentUser });
    socketRef.current = socket;

    registerSocketHandlers(socket, {
      currentUser,
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

      selectedGroupRef,
      processedMessagesRef,
      rateLimitResetTimer,


      processIncomingMessage,
      updateGroupLastMessage,
      showNotification,
      handleGroupSelect,
      hasAutoSelectedRef,

      setBlockedUsers,
      setIsBlocked,
      setIsAdmin,

    });
  }, [
    currentUser,
    socketUrl,
    SECRET_KEY,
    processIncomingMessage,
    updateGroupLastMessage,
    showNotification,
    handleGroupSelect,
    selectedGroupRef,
    processedMessagesRef,
    hasAutoSelectedRef,
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
    setBlockedUsers,
    setIsBlocked,
    setIsAdmin,

  ]);

  // ── Initial connect + cleanup ──────────────────────────────────────────
  useEffect(() => {
    if (!currentUser.id) return;
    if (socketRef.current?.connected) return;

    connectSocket();
    setSocketInitialized(true);

    return () => {
      rateLimitResetTimer.current && clearTimeout(rateLimitResetTimer.current);
      socketRef.current?.removeAllListeners();
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocketInitialized(false);
    };
  }, [currentUser.id]); // intentionally only on mount/unmount


  useEffect(() => {
    if (!currentUser.id) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      const socket = socketRef.current;
      if (!socket || !socket.connected) {
        connectSocket();
      } else {
        socket.emit("ping");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [currentUser.id, connectSocket]);

  return { socketRef, connectSocket };
};
