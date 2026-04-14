

import {
  decryptMessages,
  filterDeleted,
  safeDecrypt,
  isRateLimitError,
} from "./socketUtils.js";


// ADD at the very top of the file
import { toast } from "react-toastify";
const RATE_LIMIT_COOLDOWN_MS = 60_000;

export const refetchChatData = (socket, chatId) => {
  if (!socket?.connected || !chatId) return;

  // Leave and rejoin to get fresh data
  socket.emit("leave_chat", { chatId });

  // Small delay to ensure leave is processed
  setTimeout(() => {
    socket.emit("join_chat", { chatId });
  }, 100);
};

export const refetchPinnedMessages = (socket, chatId) => {
  if (!socket?.connected || !chatId) return;
  socket.emit("get_pinned_messages", { chatId });
};

export const refetchStarredMessages = (socket, chatId, userId) => {
  if (!socket?.connected || !chatId) return;
  socket.emit("get_starred_messages", { chatId, userId });
};

export const registerSocketHandlers = (socket, handlers) => {
  const {
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
    setPinnedMessages,
    setEditingMessage,
    setLastSeenInfo,
    setBlockedUsers,
    setIsBlocked,    // ← ADD
    setIsAdmin,
  } = handlers;

  const safeSetter = (setter) => {
    return typeof setter === "function" ? setter : () => { };
  };

  socket.on("connect", () => {
    setSocketConnected(true);

    const activeGroup = selectedGroupRef.current;

    if (activeGroup?.chatId) {
      // ✅ Rejoin the active chat — server will send
      //    chat_history + pinned_messages + join_chat_success
      socket.emit("join_chat", { chatId: activeGroup.chatId });

      // Mark pending messages as failed
      setMessages((prev) =>
        prev.map((m) =>
          m.msgStatus === "pending"
            ? {
              ...m,
              status: "failed",
              msgStatus: "failed",
              error: "Reconnected — please retry",
            }
            : m
        )
      );
    }

    // Auto-select first group if none selected
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
    setTypingUsers((prev) =>
      prev.filter((u) => u.userId !== data.userId)
    );
  });

  // REPLACE the single join_chat_success handler with:
  socket.on("join_chat_success", ({ chatId, communityCount, isAdmin, isBlocked, blockedUsers }) => {
    setTotalUsers(communityCount ?? 0);
    if (setBlockedUsers) setBlockedUsers(blockedUsers || []);
    if (setIsBlocked) setIsBlocked(isBlocked ?? false);
    if (setIsAdmin) setIsAdmin(isAdmin ?? false);
    // console.log(blockedUsers, "blockedUsers");
  });

  // socket.on("you_are_blocked", ({ chatId }) => {
  //   if (setIsBlocked) setIsBlocked(true);
  // });

  // socket.on("you_are_unblocked", ({ chatId }) => {
  //   if (setIsBlocked) setIsBlocked(false);
  // });




  // ── Block/Admin error toasts ─────────────────────────────────────────────

  socket.on("admin_action_error", ({ action, error }) => {
    const actionLabels = {
      block: "Block user",
      unblock: "Unblock user",
      delete: "Delete message",
      bulk_delete: "Bulk delete",
      add_admin: "Add admin",
      // remove_admin: "Remove admin",
      get_blocked: "Fetch blocked users",
    };
    const label = actionLabels[action] || "Admin action";
    toast.error(`${label} failed: ${error}`, {
      position: "top-center",
      autoClose: 4000,
      toastId: `admin_error_${action}`, 
    });
  });

  socket.on("you_are_blocked", ({ chatId, reason, blockedBy }) => {
    toast.error(
      `You have been blocked from this group.${reason ? ` Reason: ${reason}` : ""}`,
      {
        position: "top-center",
        autoClose: false,          // stays until dismissed
        toastId: "you_are_blocked",
      }
    );
  });

  socket.on("you_are_unblocked", ({ chatId }) => {
    toast.dismiss("you_are_blocked");  // remove the blocked toast
    toast.success("You have been unblocked and can send messages again.", {
      position: "top-center",
      autoClose: 4000,
    });
  });

  socket.on("join_chat_error", ({ error, chatId }) => {
    console.error("Join chat error:", error);
    setIsLoadingMessages(false);
    setIsInitialMessagesLoad(false);
  });

  socket.on("chat_history", async ({ chatId, messages: chatMessages }) => {
    // Clear any loading timeouts
    if (window.currentLoadingTimeout) {
      clearTimeout(window.currentLoadingTimeout);
    }

    try {
      // ✅ Guard: ensure we still care about this chat
      const activeChat = selectedGroupRef.current?.chatId;
      if (activeChat && chatId !== activeChat) {
        return; // Stale response for a chat we left
      }

      // ✅ Guard: ensure messages is an array
      const rawMessages = Array.isArray(chatMessages)
        ? chatMessages
        : chatMessages?.messages || [];

      if (rawMessages.length === 0) {
        setMessages([]);
        setIsLoadingMessages(false);
        setIsInitialMessagesLoad(false);
        setHasMoreOldMessages(false);
        setHasMoreNewMessages(false);
        return;
      }

      const decrypted = await decryptMessages(rawMessages, SECRET_KEY);
      const filtered = filterDeleted(decrypted, currentUser.id);

      // ✅ Mark all received message IDs as processed
      filtered.forEach((msg) => {
        const id = msg._id?.toString();
        if (id) processedMessagesRef.current.add(id);
      });

      setMessages(filtered);
      setIsLoadingMessages(false);
      setIsInitialMessagesLoad(false);

      if (filtered.length > 0) {
        setOldestMessageTimestamp(filtered[0].timestamp);
        setNewestMessageTimestamp(
          filtered[filtered.length - 1].timestamp
        );
        setHasMoreOldMessages(filtered.length >= 30);
        setHasMoreNewMessages(false);
      } else {
        setHasMoreOldMessages(false);
        setHasMoreNewMessages(false);
      }
    } catch (err) {
      console.error("chat_history processing error:", err);
      setMessages([]);
      setIsLoadingMessages(false);
      setIsInitialMessagesLoad(false);
    }
  });

  socket.on(
    "load_older_messages",
    async ({ messages: olderMessages, hasMore }) => {
      try {
        const rawMessages = Array.isArray(olderMessages)
          ? olderMessages
          : olderMessages?.messages || [];

        if (rawMessages.length > 0) {
          const decrypted = filterDeleted(
            await decryptMessages(rawMessages, SECRET_KEY),
            currentUser.id
          );

          decrypted.forEach((msg) => {
            const id = msg._id?.toString();
            if (id) processedMessagesRef.current.add(id);
          });

          setMessages((prev) => {
            const existingIds = new Set(
              prev.map((m) => m._id?.toString())
            );
            return [
              ...decrypted.filter(
                (m) => !existingIds.has(m._id?.toString())
              ),
              ...prev,
            ];
          });
          setOldestMessageTimestamp(rawMessages[0].timestamp);
          setHasMoreOldMessages(hasMore ?? false);
        } else {
          setHasMoreOldMessages(false);
        }
      } catch (err) {
        console.error("load_older_messages error:", err);
        setHasMoreOldMessages(false);
      }
      setIsLoadingOlder(false);
    }
  );

  socket.on(
    "load_newer_messages",
    async ({ messages: newerMessages, hasMore }) => {
      try {
        const rawMessages = Array.isArray(newerMessages)
          ? newerMessages
          : newerMessages?.messages || [];

        if (rawMessages.length > 0) {
          const decrypted = filterDeleted(
            await decryptMessages(rawMessages, SECRET_KEY),
            currentUser.id
          );

          decrypted.forEach((msg) => {
            const id = msg._id?.toString();
            if (id) processedMessagesRef.current.add(id);
          });

          setMessages((prev) => {
            const existingIds = new Set(
              prev.map((m) => m._id?.toString())
            );
            return [
              ...prev,
              ...decrypted.filter(
                (m) => !existingIds.has(m._id?.toString())
              ),
            ];
          });
          setNewestMessageTimestamp(
            rawMessages[rawMessages.length - 1].timestamp
          );
          setHasMoreNewMessages(hasMore ?? false);
        } else {
          setHasMoreNewMessages(false);
        }
      } catch (err) {
        console.error("load_newer_messages error:", err);
        setHasMoreNewMessages(false);
      }
      setIsLoadingNewer(false);
    }
  );

  socket.on("send_message", async (data) => {
    const messageId = data._id?.toString();
    const isMyMessage = data.fromUserId === currentUser.id;

    if (processedMessagesRef.current.has(messageId)) return;

    if (isMyMessage) {
      processedMessagesRef.current.add(messageId);

      const decryptedText = await safeDecrypt(
        data.msgBody?.message,
        SECRET_KEY
      );

      const confirmedMessage = {
        ...data,
        _id: messageId,
        msgStatus: "sent",
        status: "sent",
        msgBody: {
          ...data.msgBody,
          message: decryptedText,
        },
      };

      setMessages((prev) => {
        const tempIdx = prev.findIndex(
          (m) =>
            m.correlationId &&
            m.correlationId === data.correlationId &&
            (m._id?.startsWith("temp_") || m.msgStatus === "pending")
        );

        if (tempIdx !== -1) {
          const updated = [...prev];
          updated[tempIdx] = confirmedMessage;
          return updated;
        }

        if (prev.some((m) => m._id?.toString() === messageId)) {
          return prev;
        }

        return [...prev, confirmedMessage];
      });

      updateGroupLastMessage(confirmedMessage);
      return;
    }

    // Other user's message
    const result = await processIncomingMessage(data);
    if (!result) return;

    const { messageId: processedId, messageObject } = result;
    processedMessagesRef.current.add(processedId);

    setMessages((prev) => {
      if (prev.some((m) => m._id?.toString() === processedId)) {
        return prev;
      }
      return [...prev, messageObject];
    });

    updateGroupLastMessage(messageObject);

    const activeGroup = selectedGroupRef.current;
    if (!activeGroup || data.chatId !== activeGroup.chatId) {
      showNotification(data);
    }
  });

  socket.on("send_message_error", ({ error, correlationId }) => {
    if (isRateLimitError(error)) {
      setMessages((prev) =>
        prev.filter((msg) => msg.correlationId !== correlationId)
      );
      setRateLimitError(error);
      setIsInputDisabled(true);
      if (rateLimitResetTimer.current) {
        clearTimeout(rateLimitResetTimer.current);
      }
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
          : msg
      )
    );
  });

  socket.on("file_upload_progress", ({ correlationId, progress }) => {
    setUploadProgress(progress);
    setMessages((prev) =>
      prev.map((msg) =>
        msg.correlationId === correlationId
          ? { ...msg, uploadProgress: progress }
          : msg
      )
    );
  });

  socket.on("file_upload_success", async (savedMessage) => {
    const messageId = savedMessage._id?.toString();

    if (processedMessagesRef.current.has(messageId)) return;
    processedMessagesRef.current.add(messageId);

    const decrypted = await safeDecrypt(
      savedMessage.msgBody?.message,
      SECRET_KEY
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
          ...savedMessage.msgBody?.media,
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
            : msg
        )
      );
    } else {
      setMessages((prev) => {
        if (prev.some((m) => m._id?.toString() === messageId))
          return prev;
        return [...prev, messageObject];
      });

      const activeGroup = selectedGroupRef.current;
      if (
        !activeGroup ||
        savedMessage.chatId !== activeGroup.chatId
      ) {
        showNotification(savedMessage);
      }
    }

    updateGroupLastMessage(messageObject);
    setUploadProgress(0);

    // Add to files panel
    if (
      savedMessage.msgType === "file" ||
      savedMessage.msgBody?.media?.file_url
    ) {
      const normalized = {
        _id: messageId,
        chatId: savedMessage.chatId,
        publisherName:
          savedMessage.publisherName || savedMessage.senderName,
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
              media: {
                ...msg.msgBody?.media,
                is_uploading: false,
              },
            },
            error,
          }
          : msg
      )
    );
    setUploadProgress(0);
  });

  socket.on("user_blocked", ({ chatId, userId: blockedUserId, userName, blockedBy, reason }) => {
    if (setBlockedUsers) {                          // ← was handlers.setBlockedUsers
      setBlockedUsers((prev) => {
        if (prev.some(u => u.userId === blockedUserId)) return prev;
        return [...prev, { userId: blockedUserId, userName, blockedBy, reason, blockedAt: new Date() }];
      });
    }
  });

  socket.on("user_unblocked", ({ chatId, userId: unblockedUserId }) => {
    if (setBlockedUsers) {                          // ← was handlers.setBlockedUsers
      setBlockedUsers((prev) => prev.filter(u => u.userId !== unblockedUserId));
    }
  });

  socket.on("you_are_blocked", ({ chatId }) => {
    if (handlers.setIsBlocked) handlers.setIsBlocked(true);  // setIsBlocked not destructured, keep as is
  });

  socket.on("you_are_unblocked", ({ chatId }) => {
    if (handlers.setIsBlocked) handlers.setIsBlocked(false); // same
  });

  socket.on("blocked_users_list", ({ chatId, blockedUsers }) => {
    if (setBlockedUsers) setBlockedUsers(blockedUsers || []);  // ← was handlers.setBlockedUsers
  });

  const applyDeletedForEveryone = (msgId) =>
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
      })
    );

  const applyDeleteForMe = (msgId) => {
    setIsDeletingMessage(false);
    setMessages((prev) =>
      prev.filter((msg) => {
        const id = msg._id?.toString() || msg.id;
        return id !== msgId;
      })
    );
  };

  socket.on("delete_for_everyone_success", ({ msgId }) => {
    setIsDeletingMessage(false);
    applyDeletedForEveryone(msgId);
  });

  socket.on("delete_for_everyone", ({ msgId, userId }) => {
    if (userId !== currentUser.id) applyDeletedForEveryone(msgId);
    setIsDeletingMessage(false);
  });

  socket.on("message_deleted_for_me", ({ msgId }) => {
    applyDeleteForMe(msgId);
  });

  socket.on("delete_for_me_success", ({ msgId }) => {
    applyDeleteForMe(msgId);
  });

  socket.on("delete_error", (error) => {
    setIsDeletingMessage(false);
    console.error("Delete error:", error);
  });

  const handleChatCleared = ({ chatId, userId: clearedByUserId }) => {
    const clearedBy = clearedByUserId || currentUser.id;

    // Only clear UI for the user who requested it
    if (clearedBy !== currentUser.id) return;

    if (selectedGroupRef.current?.chatId === chatId) {
      setMessages([]);
      setHasMoreOldMessages(false);
      setHasMoreNewMessages(false);
      setOldestMessageTimestamp(null);
      setNewestMessageTimestamp(null);

      // ── Clear pinned messages immediately ──
      safeSetter(setPinnedMessages)([]);

      // ── Re-fetch: server will exclude messages in deletedFor ──
      socket.emit("get_pinned_messages", {
        chatId,
        userId: currentUser.id,
      });
    }

    setGroups((prev) =>
      prev.map((g) =>
        g.chatId === chatId
          ? { ...g, lastMessage: "", time: "", unread: 0 }
          : g
      )
    );
  };
  socket.on("chat_cleared", handleChatCleared);

  socket.on("clear_chat_success", handleChatCleared);

  socket.on("clear_chat_error", ({ error }) =>
    console.error("Clear chat error:", error)
  );

  socket.on(
    "message_edited",
    ({ msgId, chatId, newMessage, isEdited, editedAt, originalMessage }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          const id = msg._id?.toString();
          if (id !== msgId) return msg;
          return {
            ...msg,
            msgBody: {
              ...msg.msgBody,
              message: newMessage,
            },
            isEdited: true,
            editedAt,
            originalMessage,
            editedStatus: 1,
          };
        })
      );
    }
  );

  socket.on("edit_message_error", ({ error }) => {
    console.error("Edit message error:", error);
  });


  socket.on("message:reaction_update", ({ msgId, chatId, reactions }) => {
    setMessages((prev) =>
      prev.map((msg) => {
        const id = msg._id?.toString();
        if (id !== msgId) return msg;
        return {
          ...msg,
          reactions: reactions || [],
        };
      })
    );
  });

  socket.on("reaction_error", ({ error }) => {
    console.error("Reaction error:", error);
  });

  socket.on("pinned_messages", ({ chatId, messages: pinnedMsgs }) => {
    // Filter out messages that are deleted for the current user
    const filteredPinned = (pinnedMsgs || []).filter((m) => {
      const deletedFor = m.deletedFor || [];
      return !deletedFor.includes(currentUser.id);
    });

    safeSetter(setPinnedMessages)(filteredPinned);

    // Also mark messages in the main list as pinned
    if (filteredPinned.length > 0) {
      const pinnedIds = new Set(
        filteredPinned.map((m) => m._id?.toString())
      );
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          isPinned: pinnedIds.has(msg._id?.toString()),
        }))
      );
    }
  });


  socket.on(
    "message_pinned",
    ({ msgId, chatId, pinnedBy, pinnedByName, message }) => {
      // Skip if this message was cleared by the current user
      const deletedFor = message?.deletedFor || [];
      if (deletedFor.includes(currentUser.id)) return;

      // Update the message in the list
      setMessages((prev) =>
        prev.map((msg) => {
          const id = msg._id?.toString();
          if (id !== msgId) return msg;
          return {
            ...msg,
            isPinned: true,
            pinnedBy,
            pinnedByName,
            pinnedAt: new Date(),
          };
        })
      );

      // Update pinned messages list
      safeSetter(setPinnedMessages)((prev) => {
        if (!Array.isArray(prev)) return [message];
        if (prev.some((m) => m._id?.toString() === msgId)) return prev;
        return [message, ...prev].slice(0, 3);
      });
    }
  );

  // ─── Message unpinned (no change needed) ───
  socket.on("message_unpinned", ({ msgId, chatId }) => {
    setMessages((prev) =>
      prev.map((msg) => {
        const id = msg._id?.toString();
        if (id !== msgId) return msg;
        return {
          ...msg,
          isPinned: false,
          pinnedBy: null,
          pinnedByName: null,
          pinnedAt: null,
        };
      })
    );

    safeSetter(setPinnedMessages)((prev) => {
      if (!Array.isArray(prev)) return [];
      return prev.filter((m) => m._id?.toString() !== msgId);
    });
  });

  socket.on("pin_message_error", ({ error }) => {
    console.error("Pin message error:", error);
  });

  const handleReadUpdate = ({ msgId, chatId, readBy }) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg._id?.toString() !== msgId) return msg;
        const existingReadBy = msg.metaData?.readBy || [];
        const alreadyRead = existingReadBy.some(
          (r) => r.userId === readBy?.userId
        );
        if (alreadyRead) return msg;

        return {
          ...msg,
          metaData: {
            ...msg.metaData,
            readBy: [...existingReadBy, readBy],
            isRead: true,
            readAt: readBy?.readAt || new Date(),
          },
        };
      })
    );
  };

  // ✅ Listen to BOTH event name variations
  socket.on("message:read_update", handleReadUpdate);
  socket.on("message:read:update", handleReadUpdate);

  socket.on(
    "message:delivered_update",
    ({ msgId, chatId, deliveredBy }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id?.toString() !== msgId) return msg;
          return {
            ...msg,
            metaData: {
              ...msg.metaData,
              isDelivered: true,
              deliveredAt: deliveredBy?.deliveredAt || new Date(),
            },
            msgStatus:
              msg.msgStatus === "sent" ? "delivered" : msg.msgStatus,
          };
        })
      );
    }
  );

  socket.on("message:delivered", ({ msgId, deliveredTo }) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg._id?.toString() !== msgId) return msg;
        return {
          ...msg,
          metaData: {
            ...msg.metaData,
            isDelivered: true,
            deliveredAt: new Date(),
            deliveredTo: deliveredTo || [],
          },
          msgStatus:
            msg.msgStatus === "sent" ? "delivered" : msg.msgStatus,
        };
      })
    );
  });

  socket.on("message_hidden", ({ msgId, chatId }) => {
    setMessages((prev) =>
      prev.map((msg) => {
        const id = msg._id?.toString();
        if (id !== msgId) return msg;
        return {
          ...msg,
          isHidden: true,
          msgBody: {
            ...msg.msgBody,
            message: "This message has been hidden due to reports",
          },
        };
      })
    );
  });

  socket.on("last_seen_info", ({ userId, isOnline, lastSeen }) => {
    safeSetter(setLastSeenInfo)({ userId, isOnline, lastSeen });
  });

  socket.on(
    "message_saved_confirmation",
    ({ correlationId, _id }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.correlationId === correlationId
            ? { ...msg, _id, dbSaved: true }
            : msg
        )
      );
    }
  );

  socket.on(
    "update_message_status",
    ({ msgId, metaData, msgStatus }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id?.toString() === msgId
            ? {
              ...msg,
              metaData: { ...msg.metaData, ...metaData },
              msgStatus,
            }
            : msg
        )
      );
    }
  );

  socket.on("report_success", ({ msgId }) => {
    console.info("Report submitted for message:", msgId);
  });

  socket.on("report_received", (data) => {
    if (data.success) console.info("Report submitted successfully");
  });

  socket.on("report_error", (error) => {
    console.error("Report error:", error);
  });

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

  socket.on("message_info", (data) => {
    // Dispatch to wherever you show message info
    if (handlers.onMessageInfo) {
      handlers.onMessageInfo(data);
    }
  });

  socket.on("message_info_error", ({ error }) => {
    console.error("Message info error:", error);
  });
};  