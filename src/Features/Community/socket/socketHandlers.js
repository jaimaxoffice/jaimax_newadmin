import { decryptMessage } from "./encryptmsg.js";
import {
  decryptMessages,
  filterDeleted,
  safeDecrypt,
  isRateLimitError,
} from "./socketUtils.js";

const RATE_LIMIT_COOLDOWN_MS = 60_000;
const LARGE_FILE_THRESHOLD = 25 * 1024 * 1024;

export const registerSocketHandlers = (socket, handlers) => {
  const {
    // identity
    currentUser,
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

    // refs
    selectedGroupRef,
    processedMessagesRef,
    rateLimitResetTimer,

    // callbacks
    processIncomingMessage,
    updateGroupLastMessage,
    showNotification,
    handleGroupSelect,
    hasAutoSelectedRef,
  } = handlers;

  // ─── connect ──────────────────────────────────────────────────────────────
  socket.on("connect", () => {
    setSocketConnected(true);

    const activeGroup = selectedGroupRef.current;
    if (activeGroup?.chatId) {
      socket.emit("join_chat", { chatId: activeGroup.chatId });

      // Mark stuck "pending" messages as failed so the user can retry
      setMessages((prev) =>
        prev.map((m) =>
          m.msgStatus === "pending"
            ? {
                ...m,
                status: "failed",
                msgStatus: "failed",
                error: "Reconnected — please retry",
              }
            : m,
        ),
      );
    }

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

  // ─── disconnect ───────────────────────────────────────────────────────────
  socket.on("disconnect", () => setSocketConnected(false));

  // ─── presence ─────────────────────────────────────────────────────────────
  socket.on("online_users", setOnlineUsers);

  socket.on("user:typing", (data) => {
    if (data.userId === currentUser.id) return;
    setTypingUsers((prev) => {
      if (prev.some((u) => u.userId === data.userId)) return prev;
      return [
        ...prev,
        { userId: data.userId, userName: data.userName || "Someone" },
      ];
    });
  });

  socket.on("user:stop-typing", (data) => {
    setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
  });

  socket.on("join_chat_success", ({ chatId, communityCount }) => {
    setTotalUsers(communityCount ?? 0);
  });

  socket.on("join_chat_error", ({ error }) => {
    console.error("Join chat error:", error);
  });

  socket.on("send_message", async (data) => {
    const result = await processIncomingMessage(data);
    if (!result) return;
    const { messageId, messageObject } = result;
    const isMyMessage = data.fromUserId === currentUser.id;

    setMessages((prev) => {
      if (isMyMessage) {
        const tempIdx = prev.findIndex(
          (m) =>
            m.correlationId &&
            m.correlationId === data.correlationId &&
            m._id?.startsWith("temp_"),
        );
        if (tempIdx !== -1) {
          processedMessagesRef.current.add(messageId);
          const updated = [...prev];
          updated[tempIdx] = {
            ...messageObject,
            msgStatus: "sent",
            status: "sent",
          };
          return updated;
        }
      }
      if (prev.some((m) => m._id?.toString() === messageId)) {
        processedMessagesRef.current.add(messageId);
        return prev;
      }
      processedMessagesRef.current.add(messageId);
      return [...prev, messageObject];
    });

    updateGroupLastMessage(messageObject);
  });

  socket.on("send_message_error", ({ error, correlationId }) => {
    if (isRateLimitError(error)) {
      setMessages((prev) =>
        prev.filter((msg) => msg.correlationId !== correlationId),
      );
      setRateLimitError(error);
      setIsInputDisabled(true);
      rateLimitResetTimer.current && clearTimeout(rateLimitResetTimer.current);
      rateLimitResetTimer.current = setTimeout(() => {
        setIsInputDisabled(false);
        setRateLimitError("");
      }, RATE_LIMIT_COOLDOWN_MS);
      return;
    }
    setMessages((prev) =>
      prev.map((msg) =>
        msg.correlationId === correlationId
          ? { ...msg, status: "failed", msgStatus: "failed", error }
          : msg,
      ),
    );
  });

  // ─── file upload ──────────────────────────────────────────────────────────
  socket.on("file_upload_progress", ({ correlationId, progress }) => {
    setUploadProgress(progress);
    setMessages((prev) =>
      prev.map((msg) =>
        msg.correlationId === correlationId
          ? { ...msg, uploadProgress: progress }
          : msg,
      ),
    );
  });

  socket.on("file_upload_success", async (savedMessage) => {
    const messageId = savedMessage._id?.toString();
    const decrypted = await safeDecrypt(
      savedMessage.msgBody?.message,
      SECRET_KEY,
    );

    const messageObject = {
      ...savedMessage,
      _id: messageId,
      msgStatus: "sent",
      status: "sent",
      msgBody: {
        ...savedMessage.msgBody,
        message: decrypted,
        media: {
          ...savedMessage.msgBody.media,
          is_uploading: false,
          tempPreview: undefined,
        },
      },
    };

    if (savedMessage.fromUserId === currentUser.id) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.correlationId === savedMessage.correlationId
            ? messageObject
            : msg,
        ),
      );
    } else {
      setMessages((prev) => {
        if (prev.some((m) => m._id?.toString() === messageId)) return prev;
        return [...prev, messageObject];
      });

      const activeGroup = selectedGroupRef.current;
      if (activeGroup && savedMessage.chatId === activeGroup.chatId) {
        setTimeout(() => {
          if (socket.connected) {
            socket.emit("message_read", {
              chatId: savedMessage.chatId,
              messageId: savedMessage._id,
              userId: currentUser.id,
            });
          }
        }, 500);
      } else {
        showNotification(savedMessage);
      }
    }

    processedMessagesRef.current.add(messageId);
    updateGroupLastMessage(messageObject);
    setUploadProgress(0);

    // Add to files panel if applicable
    if (
      savedMessage.msgType === "file" ||
      savedMessage.msgBody?.media?.file_url
    ) {
      const normalized = {
        _id: messageId,
        chatId: savedMessage.chatId,
        publisherName: savedMessage.publisherName || savedMessage.senderName,
        files: [
          {
            file_url: savedMessage.msgBody?.media?.file_url,
            file_key: savedMessage.msgBody?.media?.file_key,
            file_type: savedMessage.msgBody?.media?.file_type,
            file_size: savedMessage.msgBody?.media?.file_size,
            fileName: savedMessage.msgBody?.media?.fileName,
          },
        ],
        timestamp: savedMessage.timestamp,
        createdAt: savedMessage.createdAt,
      };
      setChatFiles((prev) => {
        if (prev.some((f) => f._id === messageId)) return prev;
        return [normalized, ...prev];
      });
      setFilesPagination((prev) => ({
        ...prev,
        totalCount: (prev.totalCount || 0) + 1,
      }));
    }
  });

  socket.on("file_upload_error", ({ correlationId, error }) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.correlationId === correlationId
          ? {
              ...msg,
              status: "failed",
              msgStatus: "failed",
              msgBody: {
                ...msg.msgBody,
                media: { ...msg.msgBody.media, is_uploading: false },
              },
              error,
            }
          : msg,
      ),
    );
    setUploadProgress(0);
  });

  // ─── delete ───────────────────────────────────────────────────────────────
  const applyDeletedForEveryone = (msgId) =>
    setMessages((prev) =>
      prev.map((msg) => {
        const id = msg._id?.toString() || msg.id;
        return id === msgId
          ? {
              ...msg,
              deletedForEveryone: true,
              msgBody: { ...msg.msgBody, message: "This message was deleted" },
            }
          : msg;
      }),
    );

  socket.on("delete_for_everyone", ({ msgId, userId }) => {
    if (userId !== currentUser.id) applyDeletedForEveryone(msgId);
    setIsDeletingMessage(false);
  });

  socket.on("delete_for_everyone_success", ({ msgId }) => {
    setIsDeletingMessage(false);
    applyDeletedForEveryone(msgId);
  });

  socket.on("delete_for_me_success", ({ msgId }) => {
    setIsDeletingMessage(false);
    setMessages((prev) =>
      prev.filter((msg) => {
        const id = msg._id?.toString() || msg.id;
        return id !== msgId;
      }),
    );
  });

  socket.on("delete_error", () => setIsDeletingMessage(false));

  // ─── message status ───────────────────────────────────────────────────────
  socket.on("message_saved_confirmation", ({ correlationId, _id }) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.correlationId === correlationId
          ? { ...msg, _id, dbSaved: true }
          : msg,
      ),
    );
  });

  socket.on("update_message_status", ({ msgId, metaData, msgStatus }) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id?.toString() === msgId
          ? { ...msg, metaData: { ...msg.metaData, ...metaData }, msgStatus }
          : msg,
      ),
    );
  });

  socket.on("message:read:update", ({ msgId, readBy }) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id?.toString() === msgId
          ? {
              ...msg,
              metaData: {
                ...msg.metaData,
                readBy: readBy || [],
                isRead: readBy?.length > 0,
              },
            }
          : msg,
      ),
    );
  });

  // ─── history / pagination ─────────────────────────────────────────────────
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
      setHasMoreOldMessages(filtered.length >= 30);
      setHasMoreNewMessages(false);
    } else {
      setHasMoreOldMessages(false);
      setHasMoreNewMessages(false);
    }
  });

  socket.on(
    "load_older_messages",
    async ({ messages: olderMessages, hasMore }) => {
      if (olderMessages?.length > 0) {
        const decrypted = filterDeleted(
          await decryptMessages(olderMessages, SECRET_KEY),
          currentUser.id,
        );
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m._id?.toString()));
          return [
            ...decrypted.filter((m) => !existingIds.has(m._id?.toString())),
            ...prev,
          ];
        });
        setOldestMessageTimestamp(olderMessages[0].timestamp);
        setHasMoreOldMessages(hasMore);
      } else {
        setHasMoreOldMessages(false);
      }
      setIsLoadingOlder(false);
    },
  );

  socket.on(
    "load_newer_messages",
    async ({ messages: newerMessages, hasMore }) => {
      if (newerMessages?.length > 0) {
        const decrypted = filterDeleted(
          await decryptMessages(newerMessages, SECRET_KEY),
          currentUser.id,
        );
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m._id?.toString()));
          return [
            ...prev,
            ...decrypted.filter((m) => !existingIds.has(m._id?.toString())),
          ];
        });
        setNewestMessageTimestamp(
          newerMessages[newerMessages.length - 1].timestamp,
        );
        setHasMoreNewMessages(hasMore);
      } else {
        setHasMoreNewMessages(false);
      }
      setIsLoadingNewer(false);
    },
  );

  // ─── clear chat ───────────────────────────────────────────────────────────
  socket.on("clear_chat_success", ({ chatId, userId }) => {
    if (
      selectedGroupRef.current?.chatId === chatId &&
      userId === currentUser.id
    ) {
      setMessages([]);
      setHasMoreOldMessages(false);
      setHasMoreNewMessages(false);
      setOldestMessageTimestamp(null);
      setNewestMessageTimestamp(null);
    }
    setGroups((prev) =>
      prev.map((g) =>
        g.chatId === chatId
          ? { ...g, lastMessage: "", time: "", unread: 0 }
          : g,
      ),
    );
  });

  socket.on("clear_chat_error", ({ error }) =>
    console.error("Clear chat error:", error),
  );

  // ─── files panel ──────────────────────────────────────────────────────────
  socket.on("group_images", (data) => {
    const { chatId, assests } = data;
    if (chatId !== selectedGroupRef.current?.chatId) return;

    setLoadingFiles(false);
    const urls = assests?.fileUrls || [];
    const pagination = assests?.pagination || {};

    if (pagination.page === 1) {
      setChatFiles(urls);
    } else {
      setChatFiles((prev) => [...prev, ...urls]);
    }
    setFilesPagination(pagination);
  });

  // ─── report ───────────────────────────────────────────────────────────────
  socket.on("report_received", (data) => {
    if (data.success) console.info("Report submitted successfully");
  });
};
