// import { decryptMessage } from "./encryptmsg.js";
// import {
//   decryptMessages,
//   filterDeleted,
//   safeDecrypt,
//   isRateLimitError,
// } from "./socketUtils.js";

// const RATE_LIMIT_COOLDOWN_MS = 60_000;
// const LARGE_FILE_THRESHOLD = 25 * 1024 * 1024;

// export const registerSocketHandlers = (socket, handlers) => {
//   const {
//     // identity
//     currentUser,
//     SECRET_KEY,

//     // state setters
//     setSocketConnected,
//     setMessages,
//     setOnlineUsers,
//     setTypingUsers,
//     setUploadProgress,
//     setChatFiles,
//     setFilesPagination,
//     setLoadingFiles,
//     setGroups,
//     setNotifications,
//     setTotalUsers,
//     setHasMoreOldMessages,
//     setHasMoreNewMessages,
//     setOldestMessageTimestamp,
//     setNewestMessageTimestamp,
//     setIsLoadingMessages,
//     setIsInitialMessagesLoad,
//     setIsLoadingOlder,
//     setIsLoadingNewer,
//     setIsDeletingMessage,
//     setIsInputDisabled,
//     setRateLimitError,

//     // refs
//     selectedGroupRef,
//     processedMessagesRef,
//     rateLimitResetTimer,

//     // callbacks
//     processIncomingMessage,
//     updateGroupLastMessage,
//     showNotification,
//     handleGroupSelect,
//     hasAutoSelectedRef,
//   } = handlers;

//   // ─── connect ──────────────────────────────────────────────────────────────
//   socket.on("connect", () => {
//     setSocketConnected(true);

//     const activeGroup = selectedGroupRef.current;
//     if (activeGroup?.chatId) {
//       socket.emit("join_chat", { chatId: activeGroup.chatId });

//       // Mark stuck "pending" messages as failed so the user can retry
//       setMessages((prev) =>
//         prev.map((m) =>
//           m.msgStatus === "pending"
//             ? {
//                 ...m,
//                 status: "failed",
//                 msgStatus: "failed",
//                 error: "Reconnected — please retry",
//               }
//             : m,
//         ),
//       );
//     }

//     if (!hasAutoSelectedRef.current) {
//       setGroups((currentGroups) => {
//         if (currentGroups.length > 0) {
//           hasAutoSelectedRef.current = true;
//           setTimeout(() => handleGroupSelect(currentGroups[0]), 0);
//         }
//         return currentGroups;
//       });
//     }
//   });

//   // ─── disconnect ───────────────────────────────────────────────────────────
//   socket.on("disconnect", () => setSocketConnected(false));

//   // ─── presence ─────────────────────────────────────────────────────────────
//   socket.on("online_users", setOnlineUsers);

//   socket.on("user:typing", (data) => {
//     if (data.userId === currentUser.id) return;
//     setTypingUsers((prev) => {
//       if (prev.some((u) => u.userId === data.userId)) return prev;
//       return [
//         ...prev,
//         { userId: data.userId, userName: data.userName || "Someone" },
//       ];
//     });
//   });

//   socket.on("user:stop-typing", (data) => {
//     setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
//   });

//   socket.on("join_chat_success", ({ chatId, communityCount }) => {
//     setTotalUsers(communityCount ?? 0);
//   });

//   socket.on("join_chat_error", ({ error }) => {
//     console.error("Join chat error:", error);
//   });

//   socket.on("send_message", async (data) => {
//     const result = await processIncomingMessage(data);
//     if (!result) return;
//     const { messageId, messageObject } = result;
//     const isMyMessage = data.fromUserId === currentUser.id;

//     setMessages((prev) => {
//       if (isMyMessage) {
//         const tempIdx = prev.findIndex(
//           (m) =>
//             m.correlationId &&
//             m.correlationId === data.correlationId &&
//             m._id?.startsWith("temp_"),
//         );
//         if (tempIdx !== -1) {
//           processedMessagesRef.current.add(messageId);
//           const updated = [...prev];
//           updated[tempIdx] = {
//             ...messageObject,
//             msgStatus: "sent",
//             status: "sent",
//           };
//           return updated;
//         }
//       }
//       if (prev.some((m) => m._id?.toString() === messageId)) {
//         processedMessagesRef.current.add(messageId);
//         return prev;
//       }
//       processedMessagesRef.current.add(messageId);
//       return [...prev, messageObject];
//     });

//     updateGroupLastMessage(messageObject);
//   });

//   socket.on("send_message_error", ({ error, correlationId }) => {
//     if (isRateLimitError(error)) {
//       setMessages((prev) =>
//         prev.filter((msg) => msg.correlationId !== correlationId),
//       );
//       setRateLimitError(error);
//       setIsInputDisabled(true);
//       rateLimitResetTimer.current && clearTimeout(rateLimitResetTimer.current);
//       rateLimitResetTimer.current = setTimeout(() => {
//         setIsInputDisabled(false);
//         setRateLimitError("");
//       }, RATE_LIMIT_COOLDOWN_MS);
//       return;
//     }
//     setMessages((prev) =>
//       prev.map((msg) =>
//         msg.correlationId === correlationId
//           ? { ...msg, status: "failed", msgStatus: "failed", error }
//           : msg,
//       ),
//     );
//   });

//   // ─── file upload ──────────────────────────────────────────────────────────
//   socket.on("file_upload_progress", ({ correlationId, progress }) => {
//     setUploadProgress(progress);
//     setMessages((prev) =>
//       prev.map((msg) =>
//         msg.correlationId === correlationId
//           ? { ...msg, uploadProgress: progress }
//           : msg,
//       ),
//     );
//   });

// socket.on("file_upload_success", async (savedMessage) => {
//   const messageId = savedMessage._id?.toString();
//   const decrypted = await safeDecrypt(
//     savedMessage.msgBody?.message,
//     SECRET_KEY
//   );

//   const messageObject = {
//     ...savedMessage,
//     _id: messageId,
//     msgStatus: "sent",
//     status: "sent",
//     msgBody: {
//       ...savedMessage.msgBody,
//       message: decrypted,
//       media: {
//         ...savedMessage.msgBody.media,
//         is_uploading: false,
//         tempPreview: undefined,
//       },
//     },
//   };

//   if (savedMessage.fromUserId === currentUser.id) {
//     // ✅ Own file — replace optimistic message
//     setMessages((prev) =>
//       prev.map((msg) =>
//         msg.correlationId === savedMessage.correlationId
//           ? messageObject
//           : msg
//       )
//     );
//   } else {
//     // ✅ Someone else's file — add if not duplicate
//     setMessages((prev) => {
//       if (prev.some((m) => m._id?.toString() === messageId)) return prev;
//       return [...prev, messageObject];
//     });

//     // ✅ DON'T emit message_read here — let the batched useEffect handle it
//     // The useEffect will pick up this new unread message 
//     // and include it in the next batch
    
//     const activeGroup = selectedGroupRef.current;
//     if (!activeGroup || savedMessage.chatId !== activeGroup.chatId) {
//       showNotification(savedMessage);
//     }
//   }

//   processedMessagesRef.current.add(messageId);
//   updateGroupLastMessage(messageObject);
//   setUploadProgress(0);

//   // Add to files panel
//   if (
//     savedMessage.msgType === "file" ||
//     savedMessage.msgBody?.media?.file_url
//   ) {
//     const normalized = {
//       _id: messageId,
//       chatId: savedMessage.chatId,
//       publisherName:
//         savedMessage.publisherName || savedMessage.senderName,
//       files: [
//         {
//           file_url: savedMessage.msgBody?.media?.file_url,
//           file_key: savedMessage.msgBody?.media?.file_key,
//           file_type: savedMessage.msgBody?.media?.file_type,
//           file_size: savedMessage.msgBody?.media?.file_size,
//           fileName: savedMessage.msgBody?.media?.fileName,
//         },
//       ],
//       timestamp: savedMessage.timestamp,
//       createdAt: savedMessage.createdAt,
//     };
//     setChatFiles((prev) => {
//       if (prev.some((f) => f._id === messageId)) return prev;
//       return [normalized, ...prev];
//     });
//     setFilesPagination((prev) => ({
//       ...prev,
//       totalCount: (prev.totalCount || 0) + 1,
//     }));
//   }
// });

//   socket.on("file_upload_error", ({ correlationId, error }) => {
//     setMessages((prev) =>
//       prev.map((msg) =>
//         msg.correlationId === correlationId
//           ? {
//               ...msg,
//               status: "failed",
//               msgStatus: "failed",
//               msgBody: {
//                 ...msg.msgBody,
//                 media: { ...msg.msgBody.media, is_uploading: false },
//               },
//               error,
//             }
//           : msg,
//       ),
//     );
//     setUploadProgress(0);
//   });

//   // ─── delete ───────────────────────────────────────────────────────────────
//   const applyDeletedForEveryone = (msgId) =>
//     setMessages((prev) =>
//       prev.map((msg) => {
//         const id = msg._id?.toString() || msg.id;
//         return id === msgId
//           ? {
//               ...msg,
//               deletedForEveryone: true,
//               msgBody: { ...msg.msgBody, message: "This message was deleted" },
//             }
//           : msg;
//       }),
//     );

//   socket.on("delete_for_everyone", ({ msgId, userId }) => {
//     if (userId !== currentUser.id) applyDeletedForEveryone(msgId);
//     setIsDeletingMessage(false);
//   });

//   socket.on("delete_for_everyone_success", ({ msgId }) => {
//     setIsDeletingMessage(false);
//     applyDeletedForEveryone(msgId);
//   });

//   socket.on("delete_for_me_success", ({ msgId }) => {
//     setIsDeletingMessage(false);
//     setMessages((prev) =>
//       prev.filter((msg) => {
//         const id = msg._id?.toString() || msg.id;
//         return id !== msgId;
//       }),
//     );
//   });

//   socket.on("delete_error", () => setIsDeletingMessage(false));

//   // ─── message status ───────────────────────────────────────────────────────
//   socket.on("message_saved_confirmation", ({ correlationId, _id }) => {
//     setMessages((prev) =>
//       prev.map((msg) =>
//         msg.correlationId === correlationId
//           ? { ...msg, _id, dbSaved: true }
//           : msg,
//       ),
//     );
//   });

//   socket.on("update_message_status", ({ msgId, metaData, msgStatus }) => {
//     setMessages((prev) =>
//       prev.map((msg) =>
//         msg._id?.toString() === msgId
//           ? { ...msg, metaData: { ...msg.metaData, ...metaData }, msgStatus }
//           : msg,
//       ),
//     );
//   });

//   socket.on("message:read:update", ({ msgId, readBy }) => {
//     setMessages((prev) =>
//       prev.map((msg) =>
//         msg._id?.toString() === msgId
//           ? {
//               ...msg,
//               metaData: {
//                 ...msg.metaData,
//                 readBy: readBy || [],
//                 isRead: readBy?.length > 0,
//               },
//             }
//           : msg,
//       ),
//     );
//   });

//   // ─── history / pagination ─────────────────────────────────────────────────
//   socket.on("chat_history", async ({ chatId, messages: chatMessages }) => {
//     window.currentLoadingTimeout && clearTimeout(window.currentLoadingTimeout);

//     const decrypted = await decryptMessages(chatMessages, SECRET_KEY);
//     const filtered = filterDeleted(decrypted, currentUser.id);

//     setMessages(filtered);
//     setIsLoadingMessages(false);
//     setIsInitialMessagesLoad(false);

//     if (filtered.length > 0) {
//       setOldestMessageTimestamp(filtered[0].timestamp);
//       setNewestMessageTimestamp(filtered[filtered.length - 1].timestamp);
//       setHasMoreOldMessages(filtered.length >= 30);
//       setHasMoreNewMessages(false);
//     } else {
//       setHasMoreOldMessages(false);
//       setHasMoreNewMessages(false);
//     }
//   });

//   socket.on(
//     "load_older_messages",
//     async ({ messages: olderMessages, hasMore }) => {
//       if (olderMessages?.length > 0) {
//         const decrypted = filterDeleted(
//           await decryptMessages(olderMessages, SECRET_KEY),
//           currentUser.id,
//         );
//         setMessages((prev) => {
//           const existingIds = new Set(prev.map((m) => m._id?.toString()));
//           return [
//             ...decrypted.filter((m) => !existingIds.has(m._id?.toString())),
//             ...prev,
//           ];
//         });
//         setOldestMessageTimestamp(olderMessages[0].timestamp);
//         setHasMoreOldMessages(hasMore);
//       } else {
//         setHasMoreOldMessages(false);
//       }
//       setIsLoadingOlder(false);
//     },
//   );

//   socket.on(
//     "load_newer_messages",
//     async ({ messages: newerMessages, hasMore }) => {
//       if (newerMessages?.length > 0) {
//         const decrypted = filterDeleted(
//           await decryptMessages(newerMessages, SECRET_KEY),
//           currentUser.id,
//         );
//         setMessages((prev) => {
//           const existingIds = new Set(prev.map((m) => m._id?.toString()));
//           return [
//             ...prev,
//             ...decrypted.filter((m) => !existingIds.has(m._id?.toString())),
//           ];
//         });
//         setNewestMessageTimestamp(
//           newerMessages[newerMessages.length - 1].timestamp,
//         );
//         setHasMoreNewMessages(hasMore);
//       } else {
//         setHasMoreNewMessages(false);
//       }
//       setIsLoadingNewer(false);
//     },
//   );

//   // ─── clear chat ───────────────────────────────────────────────────────────
//   socket.on("clear_chat_success", ({ chatId, userId }) => {
//     if (
//       selectedGroupRef.current?.chatId === chatId &&
//       userId === currentUser.id
//     ) {
//       setMessages([]);
//       setHasMoreOldMessages(false);
//       setHasMoreNewMessages(false);
//       setOldestMessageTimestamp(null);
//       setNewestMessageTimestamp(null);
//     }
//     setGroups((prev) =>
//       prev.map((g) =>
//         g.chatId === chatId
//           ? { ...g, lastMessage: "", time: "", unread: 0 }
//           : g,
//       ),
//     );
//   });

//   socket.on("clear_chat_error", ({ error }) =>
//     console.error("Clear chat error:", error),
//   );

//   // ─── files panel ──────────────────────────────────────────────────────────
//   socket.on("group_images", (data) => {
//     const { chatId, assests } = data;
//     if (chatId !== selectedGroupRef.current?.chatId) return;

//     setLoadingFiles(false);
//     const urls = assests?.fileUrls || [];
//     const pagination = assests?.pagination || {};

//     if (pagination.page === 1) {
//       setChatFiles(urls);
//     } else {
//       setChatFiles((prev) => [...prev, ...urls]);
//     }
//     setFilesPagination(pagination);
//   });

//   // ─── report ───────────────────────────────────────────────────────────────
//   socket.on("report_received", (data) => {
//     if (data.success) console.info("Report submitted successfully");
//   });
// };



// import { decryptMessage } from "./encryptmsg.js";
// import {
//   decryptMessages,
//   filterDeleted,
//   safeDecrypt,
//   isRateLimitError,
// } from "./socketUtils.js";

// const RATE_LIMIT_COOLDOWN_MS = 60_000;
// const LARGE_FILE_THRESHOLD = 25 * 1024 * 1024;

// export const registerSocketHandlers = (socket, handlers) => {
//   const {
//     currentUser,
//     SECRET_KEY,
//     setSocketConnected,
//     setMessages,
//     setOnlineUsers,
//     setTypingUsers,
//     setUploadProgress,
//     setChatFiles,
//     setFilesPagination,
//     setLoadingFiles,
//     setGroups,
//     setNotifications,
//     setTotalUsers,
//     setHasMoreOldMessages,
//     setHasMoreNewMessages,
//     setOldestMessageTimestamp,
//     setNewestMessageTimestamp,
//     setIsLoadingMessages,
//     setIsInitialMessagesLoad,
//     setIsLoadingOlder,
//     setIsLoadingNewer,
//     setIsDeletingMessage,
//     setIsInputDisabled,
//     setRateLimitError,
//     selectedGroupRef,
//     processedMessagesRef,
//     rateLimitResetTimer,
//     processIncomingMessage,
//     updateGroupLastMessage,
//     showNotification,
//     handleGroupSelect,
//     hasAutoSelectedRef,
//   } = handlers;

//   // ─── connect ──────────────────────────────────────────────
//   socket.on("connect", () => {
//     setSocketConnected(true);

//     const activeGroup = selectedGroupRef.current;
//     if (activeGroup?.chatId) {
//       socket.emit("join_chat", { chatId: activeGroup.chatId });

//       setMessages((prev) =>
//         prev.map((m) =>
//           m.msgStatus === "pending"
//             ? {
//                 ...m,
//                 status: "failed",
//                 msgStatus: "failed",
//                 error: "Reconnected — please retry",
//               }
//             : m
//         )
//       );
//     }

//     if (!hasAutoSelectedRef.current) {
//       setGroups((currentGroups) => {
//         if (currentGroups.length > 0) {
//           hasAutoSelectedRef.current = true;
//           setTimeout(() => handleGroupSelect(currentGroups[0]), 0);
//         }
//         return currentGroups;
//       });
//     }
//   });

//   // ─── disconnect ───────────────────────────────────────────
//   socket.on("disconnect", () => setSocketConnected(false));

//   // ─── presence ─────────────────────────────────────────────
//   socket.on("online_users", setOnlineUsers);

//   socket.on("user:typing", (data) => {
//     if (data.userId === currentUser.id) return;
//     setTypingUsers((prev) => {
//       if (prev.some((u) => u.userId === data.userId)) return prev;
//       return [
//         ...prev,
//         { userId: data.userId, userName: data.userName || "Someone" },
//       ];
//     });
//   });

//   socket.on("user:stop-typing", (data) => {
//     setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
//   });

//   socket.on("join_chat_success", ({ chatId, communityCount }) => {
//     setTotalUsers(communityCount ?? 0);
//   });

//   socket.on("join_chat_error", ({ error }) => {
//     console.error("Join chat error:", error);
//   });

//   // ═══════════════════════════════════════════════════════════
//   //  ✅ FIX: send_message — skip API call for own messages
//   // ═══════════════════════════════════════════════════════════
//   socket.on("send_message", async (data) => {
//     const messageId = data._id?.toString();
//     const isMyMessage = data.fromUserId === currentUser.id;

//     // ─── Guard: already processed this message ───
//     if (processedMessagesRef.current.has(messageId)) {
//       return;
//     }

//     // ═══════════════════════════════════════════════════════
//     //  ✅ OWN MESSAGE: Just replace temp → confirmed
//     //  NO API call needed — we already have the content
//     // ═══════════════════════════════════════════════════════
//     if (isMyMessage) {
//       processedMessagesRef.current.add(messageId);

//       // Decrypt only the text (lightweight, no API)
//       const decryptedText = await safeDecrypt(
//         data.msgBody?.message,
//         SECRET_KEY
//       );

//       const confirmedMessage = {
//         ...data,
//         _id: messageId,
//         msgStatus: "sent",
//         status: "sent",
//         msgBody: {
//           ...data.msgBody,
//           message: decryptedText,
//         },
//       };

//       setMessages((prev) => {
//         // Find and replace the temp/pending message
//         const tempIdx = prev.findIndex(
//           (m) =>
//             m.correlationId &&
//             m.correlationId === data.correlationId &&
//             (m._id?.startsWith("temp_") || m.msgStatus === "pending")
//         );

//         if (tempIdx !== -1) {
//           const updated = [...prev];
//           updated[tempIdx] = confirmedMessage;
//           return updated;
//         }

//         // If no temp found, check for duplicate
//         if (prev.some((m) => m._id?.toString() === messageId)) {
//           return prev;
//         }

//         // Edge case: temp was already removed, add confirmed
//         return [...prev, confirmedMessage];
//       });

//       updateGroupLastMessage(confirmedMessage);
//       return; // ← DONE. No processIncomingMessage call
//     }

//     // ═══════════════════════════════════════════════════════
//     //  OTHER USER'S MESSAGE: Full processing
//     // ═══════════════════════════════════════════════════════
//     const result = await processIncomingMessage(data);
//     if (!result) return;

//     const { messageId: processedId, messageObject } = result;

//     processedMessagesRef.current.add(processedId);

//     setMessages((prev) => {
//       if (prev.some((m) => m._id?.toString() === processedId)) {
//         return prev;
//       }
//       return [...prev, messageObject];
//     });

//     updateGroupLastMessage(messageObject);

//     // Show notification if not in this chat
//     const activeGroup = selectedGroupRef.current;
//     if (!activeGroup || data.chatId !== activeGroup.chatId) {
//       showNotification(data);
//     }
//   });

//   // ─── send_message_error ───────────────────────────────────
//   socket.on("send_message_error", ({ error, correlationId }) => {
//     if (isRateLimitError(error)) {
//       setMessages((prev) =>
//         prev.filter((msg) => msg.correlationId !== correlationId)
//       );
//       setRateLimitError(error);
//       setIsInputDisabled(true);
//       rateLimitResetTimer.current &&
//         clearTimeout(rateLimitResetTimer.current);
//       rateLimitResetTimer.current = setTimeout(() => {
//         setIsInputDisabled(false);
//         setRateLimitError("");
//       }, RATE_LIMIT_COOLDOWN_MS);
//       return;
//     }
//     setMessages((prev) =>
//       prev.map((msg) =>
//         msg.correlationId === correlationId
//           ? { ...msg, status: "failed", msgStatus: "failed", error }
//           : msg
//       )
//     );
//   });

//   // ─── file upload ──────────────────────────────────────────
//   socket.on("file_upload_progress", ({ correlationId, progress }) => {
//     setUploadProgress(progress);
//     setMessages((prev) =>
//       prev.map((msg) =>
//         msg.correlationId === correlationId
//           ? { ...msg, uploadProgress: progress }
//           : msg
//       )
//     );
//   });

//   // ═══════════════════════════════════════════════════════════
//   //  ✅ FIX: file_upload_success — same pattern
//   // ═══════════════════════════════════════════════════════════
//   socket.on("file_upload_success", async (savedMessage) => {
//     const messageId = savedMessage._id?.toString();

//     // Guard: already processed
//     if (processedMessagesRef.current.has(messageId)) {
//       return;
//     }
//     processedMessagesRef.current.add(messageId);

//     const decrypted = await safeDecrypt(
//       savedMessage.msgBody?.message,
//       SECRET_KEY
//     );

//     const messageObject = {
//       ...savedMessage,
//       _id: messageId,
//       msgStatus: "sent",
//       status: "sent",
//       msgBody: {
//         ...savedMessage.msgBody,
//         message: decrypted,
//         media: {
//           ...savedMessage.msgBody.media,
//           is_uploading: false,
//           tempPreview: undefined,
//         },
//       },
//     };

//     if (savedMessage.fromUserId === currentUser.id) {
//       // ✅ Own file — just replace optimistic message, NO extra API
//       setMessages((prev) =>
//         prev.map((msg) =>
//           msg.correlationId === savedMessage.correlationId
//             ? messageObject
//             : msg
//         )
//       );
//     } else {
//       // ✅ Other's file — add if not duplicate
//       setMessages((prev) => {
//         if (prev.some((m) => m._id?.toString() === messageId)) return prev;
//         return [...prev, messageObject];
//       });

//       const activeGroup = selectedGroupRef.current;
//       if (!activeGroup || savedMessage.chatId !== activeGroup.chatId) {
//         showNotification(savedMessage);
//       }
//     }

//     updateGroupLastMessage(messageObject);
//     setUploadProgress(0);

//     // Add to files panel
//     if (
//       savedMessage.msgType === "file" ||
//       savedMessage.msgBody?.media?.file_url
//     ) {
//       const normalized = {
//         _id: messageId,
//         chatId: savedMessage.chatId,
//         publisherName:
//           savedMessage.publisherName || savedMessage.senderName,
//         files: [
//           {
//             file_url: savedMessage.msgBody?.media?.file_url,
//             file_key: savedMessage.msgBody?.media?.file_key,
//             file_type: savedMessage.msgBody?.media?.file_type,
//             file_size: savedMessage.msgBody?.media?.file_size,
//             fileName: savedMessage.msgBody?.media?.fileName,
//           },
//         ],
//         timestamp: savedMessage.timestamp,
//         createdAt: savedMessage.createdAt,
//       };
//       setChatFiles((prev) => {
//         if (prev.some((f) => f._id === messageId)) return prev;
//         return [normalized, ...prev];
//       });
//       setFilesPagination((prev) => ({
//         ...prev,
//         totalCount: (prev.totalCount || 0) + 1,
//       }));
//     }
//   });

//   socket.on("file_upload_error", ({ correlationId, error }) => {
//     setMessages((prev) =>
//       prev.map((msg) =>
//         msg.correlationId === correlationId
//           ? {
//               ...msg,
//               status: "failed",
//               msgStatus: "failed",
//               msgBody: {
//                 ...msg.msgBody,
//                 media: { ...msg.msgBody.media, is_uploading: false },
//               },
//               error,
//             }
//           : msg
//       )
//     );
//     setUploadProgress(0);
//   });

//   // ─── delete ───────────────────────────────────────────────
//   const applyDeletedForEveryone = (msgId) =>
//     setMessages((prev) =>
//       prev.map((msg) => {
//         const id = msg._id?.toString() || msg.id;
//         return id === msgId
//           ? {
//               ...msg,
//               deletedForEveryone: true,
//               msgBody: {
//                 ...msg.msgBody,
//                 message: "This message was deleted",
//               },
//             }
//           : msg;
//       })
//     );

//   socket.on("delete_for_everyone", ({ msgId, userId }) => {
//     if (userId !== currentUser.id) applyDeletedForEveryone(msgId);
//     setIsDeletingMessage(false);
//   });

//   socket.on("delete_for_everyone_success", ({ msgId }) => {
//     setIsDeletingMessage(false);
//     applyDeletedForEveryone(msgId);
//   });

//   socket.on("delete_for_me_success", ({ msgId }) => {
//     setIsDeletingMessage(false);
//     setMessages((prev) =>
//       prev.filter((msg) => {
//         const id = msg._id?.toString() || msg.id;
//         return id !== msgId;
//       })
//     );
//   });

//   socket.on("delete_error", () => setIsDeletingMessage(false));

//   // ─── message status ───────────────────────────────────────
//   socket.on("message_saved_confirmation", ({ correlationId, _id }) => {
//     setMessages((prev) =>
//       prev.map((msg) =>
//         msg.correlationId === correlationId
//           ? { ...msg, _id, dbSaved: true }
//           : msg
//       )
//     );
//   });

//   socket.on("update_message_status", ({ msgId, metaData, msgStatus }) => {
//     setMessages((prev) =>
//       prev.map((msg) =>
//         msg._id?.toString() === msgId
//           ? {
//               ...msg,
//               metaData: { ...msg.metaData, ...metaData },
//               msgStatus,
//             }
//           : msg
//       )
//     );
//   });

//   socket.on("message:read:update", ({ msgId, readBy }) => {
//     setMessages((prev) =>
//       prev.map((msg) =>
//         msg._id?.toString() === msgId
//           ? {
//               ...msg,
//               metaData: {
//                 ...msg.metaData,
//                 readBy: readBy || [],
//                 isRead: readBy?.length > 0,
//               },
//             }
//           : msg
//       )
//     );
//   });

//   // ─── history / pagination ─────────────────────────────────
//   socket.on("chat_history", async ({ chatId, messages: chatMessages }) => {
//     window.currentLoadingTimeout &&
//       clearTimeout(window.currentLoadingTimeout);

//     const decrypted = await decryptMessages(chatMessages, SECRET_KEY);
//     const filtered = filterDeleted(decrypted, currentUser.id);

//     setMessages(filtered);
//     setIsLoadingMessages(false);
//     setIsInitialMessagesLoad(false);

//     if (filtered.length > 0) {
//       setOldestMessageTimestamp(filtered[0].timestamp);
//       setNewestMessageTimestamp(filtered[filtered.length - 1].timestamp);
//       setHasMoreOldMessages(filtered.length >= 30);
//       setHasMoreNewMessages(false);
//     } else {
//       setHasMoreOldMessages(false);
//       setHasMoreNewMessages(false);
//     }
//   });

//   socket.on(
//     "load_older_messages",
//     async ({ messages: olderMessages, hasMore }) => {
//       if (olderMessages?.length > 0) {
//         const decrypted = filterDeleted(
//           await decryptMessages(olderMessages, SECRET_KEY),
//           currentUser.id
//         );
//         setMessages((prev) => {
//           const existingIds = new Set(prev.map((m) => m._id?.toString()));
//           return [
//             ...decrypted.filter(
//               (m) => !existingIds.has(m._id?.toString())
//             ),
//             ...prev,
//           ];
//         });
//         setOldestMessageTimestamp(olderMessages[0].timestamp);
//         setHasMoreOldMessages(hasMore);
//       } else {
//         setHasMoreOldMessages(false);
//       }
//       setIsLoadingOlder(false);
//     }
//   );

//   socket.on(
//     "load_newer_messages",
//     async ({ messages: newerMessages, hasMore }) => {
//       if (newerMessages?.length > 0) {
//         const decrypted = filterDeleted(
//           await decryptMessages(newerMessages, SECRET_KEY),
//           currentUser.id
//         );
//         setMessages((prev) => {
//           const existingIds = new Set(prev.map((m) => m._id?.toString()));
//           return [
//             ...prev,
//             ...decrypted.filter(
//               (m) => !existingIds.has(m._id?.toString())
//             ),
//           ];
//         });
//         setNewestMessageTimestamp(
//           newerMessages[newerMessages.length - 1].timestamp
//         );
//         setHasMoreNewMessages(hasMore);
//       } else {
//         setHasMoreNewMessages(false);
//       }
//       setIsLoadingNewer(false);
//     }
//   );

//   // ─── clear chat ───────────────────────────────────────────
//   socket.on("clear_chat_success", ({ chatId, userId }) => {
//     if (
//       selectedGroupRef.current?.chatId === chatId &&
//       userId === currentUser.id
//     ) {
//       setMessages([]);
//       setHasMoreOldMessages(false);
//       setHasMoreNewMessages(false);
//       setOldestMessageTimestamp(null);
//       setNewestMessageTimestamp(null);
//     }
//     setGroups((prev) =>
//       prev.map((g) =>
//         g.chatId === chatId
//           ? { ...g, lastMessage: "", time: "", unread: 0 }
//           : g
//       )
//     );
//   });

//   socket.on("clear_chat_error", ({ error }) =>
//     console.error("Clear chat error:", error)
//   );

//   // ─── files panel ──────────────────────────────────────────
//   socket.on("group_images", (data) => {
//     const { chatId, assests } = data;
//     if (chatId !== selectedGroupRef.current?.chatId) return;

//     setLoadingFiles(false);
//     const urls = assests?.fileUrls || [];
//     const pagination = assests?.pagination || {};

//     if (pagination.page === 1) {
//       setChatFiles(urls);
//     } else {
//       setChatFiles((prev) => [...prev, ...urls]);
//     }
//     setFilesPagination(pagination);
//   });

//   // ─── report ───────────────────────────────────────────────
//   socket.on("report_received", (data) => {
//     if (data.success) console.info("Report submitted successfully");
//   });
// };




import {
  decryptMessages,
  filterDeleted,
  safeDecrypt,
  isRateLimitError,
} from "./socketUtils.js";

const RATE_LIMIT_COOLDOWN_MS = 60_000;

// ═══════════════════════════════════════════════════════════════
//  Refetch helper — call from outside when needed
// ═══════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════
//  Main handler registration
// ═══════════════════════════════════════════════════════════════
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
    // ─── NEW optional handlers for new features ───
    setPinnedMessages,   // optional
    setEditingMessage,   // optional
    setLastSeenInfo,     // optional
  } = handlers;

  // Safe setter — won't crash if handler doesn't exist yet
  const safeSetter = (setter) => {
    return typeof setter === "function" ? setter : () => {};
  };

  // ═══════════════════════════════════════════════════════════
  //  CONNECT — with robust refetch on reconnect
  // ═══════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════
  //  DISCONNECT
  // ═══════════════════════════════════════════════════════════
  socket.on("disconnect", () => setSocketConnected(false));

  // ═══════════════════════════════════════════════════════════
  //  PRESENCE
  // ═══════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════
  //  JOIN CHAT SUCCESS
  // ═══════════════════════════════════════════════════════════
  socket.on("join_chat_success", ({ chatId, communityCount }) => {
    setTotalUsers(communityCount ?? 0);
  });

  socket.on("join_chat_error", ({ error, chatId }) => {
    console.error("Join chat error:", error);
    setIsLoadingMessages(false);
    setIsInitialMessagesLoad(false);
  });

  // ═══════════════════════════════════════════════════════════
  //  CHAT HISTORY — with robust null/format handling
  // ═══════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════
  //  OLDER MESSAGES
  // ═══════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════
  //  NEWER MESSAGES
  // ═══════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════
  //  SEND MESSAGE — own vs. other users
  // ═══════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════
  //  SEND MESSAGE ERROR
  // ═══════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════
  //  FILE UPLOAD
  // ═══════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════
  //  DELETE — FIX: match both server event names
  // ═══════════════════════════════════════════════════════════
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

  // Server emits: "delete_for_everyone_success"
  socket.on("delete_for_everyone_success", ({ msgId }) => {
    setIsDeletingMessage(false);
    applyDeletedForEveryone(msgId);
  });

  // Server also emits: "delete_for_everyone" to room
  socket.on("delete_for_everyone", ({ msgId, userId }) => {
    if (userId !== currentUser.id) applyDeletedForEveryone(msgId);
    setIsDeletingMessage(false);
  });

  // ✅ FIX: Server emits "message_deleted_for_me" NOT "delete_for_me_success"
  socket.on("message_deleted_for_me", ({ msgId }) => {
    applyDeleteForMe(msgId);
  });

  // Keep old name too for backward compatibility
  socket.on("delete_for_me_success", ({ msgId }) => {
    applyDeleteForMe(msgId);
  });

  socket.on("delete_error", (error) => {
    setIsDeletingMessage(false);
    console.error("Delete error:", error);
  });

  // ═══════════════════════════════════════════════════════════
  //  ✅ FIX: CLEAR CHAT — server emits "chat_cleared"
  //          NOT "clear_chat_success"
  // ═══════════════════════════════════════════════════════════
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
    }

    setGroups((prev) =>
      prev.map((g) =>
        g.chatId === chatId
          ? { ...g, lastMessage: "", time: "", unread: 0 }
          : g
      )
    );
  };

  // ✅ Listen to BOTH event names
  socket.on("chat_cleared", handleChatCleared);
  socket.on("clear_chat_success", handleChatCleared);

  socket.on("clear_chat_error", ({ error }) =>
    console.error("Clear chat error:", error)
  );

  // ═══════════════════════════════════════════════════════════
  //  ✅ NEW: MESSAGE EDITED
  // ═══════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════
  //  ✅ NEW: REACTIONS
  // ═══════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════
  //  ✅ NEW: PINNED MESSAGES
  // ═══════════════════════════════════════════════════════════
  socket.on("pinned_messages", ({ chatId, messages: pinnedMsgs }) => {
    // Update pinned state if handler provided
    safeSetter(setPinnedMessages)(pinnedMsgs || []);

    // Also mark messages in the main list as pinned
    if (pinnedMsgs && pinnedMsgs.length > 0) {
      const pinnedIds = new Set(
        pinnedMsgs.map((m) => m._id?.toString())
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

  // ═══════════════════════════════════════════════════════════
  //  ✅ NEW: STAR MESSAGES
  // ═══════════════════════════════════════════════════════════
  socket.on("star_message_success", ({ msgId, starred }) => {
    setMessages((prev) =>
      prev.map((msg) => {
        const id = msg._id?.toString();
        if (id !== msgId) return msg;

        const starredBy = msg.starredBy || [];
        return {
          ...msg,
          starredBy: starred
            ? [...starredBy, currentUser.id]
            : starredBy.filter((uid) => uid !== currentUser.id),
        };
      })
    );
  });

  socket.on("starred_messages", ({ chatId, messages: starredMsgs }) => {
    // If you have a separate starred messages panel
    safeSetter(handlers.setStarredMessages)(starredMsgs || []);
  });

  socket.on("star_message_error", ({ error }) => {
    console.error("Star message error:", error);
  });

  // ═══════════════════════════════════════════════════════════
  //  ✅ NEW: FORWARD MESSAGE
  // ═══════════════════════════════════════════════════════════
  socket.on(
    "forward_message_success",
    ({ originalMsgId, forwarded }) => {
      console.info(
        `Message ${originalMsgId} forwarded to ${forwarded.length} chat(s)`
      );
    }
  );

  socket.on("forward_message_error", ({ error }) => {
    console.error("Forward message error:", error);
  });

  // ═══════════════════════════════════════════════════════════
  //  ✅ FIX: READ RECEIPTS — server emits "message:read_update"
  //          NOT "message:read:update" (colon vs dot)
  // ═══════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════
  //  ✅ NEW: DELIVERED RECEIPTS
  // ═══════════════════════════════════════════════════════════
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

  // Also handle the message:delivered event from send_message flow
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

  // ═══════════════════════════════════════════════════════════
  //  ✅ NEW: MESSAGE HIDDEN (reported 5+ times)
  // ═══════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════
  //  ✅ NEW: LAST SEEN
  // ═══════════════════════════════════════════════════════════
  socket.on("last_seen_info", ({ userId, isOnline, lastSeen }) => {
    safeSetter(setLastSeenInfo)({ userId, isOnline, lastSeen });
  });

  // ═══════════════════════════════════════════════════════════
  //  MESSAGE STATUS UPDATES (existing)
  // ═══════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════
  //  REPORT
  // ═══════════════════════════════════════════════════════════
  socket.on("report_success", ({ msgId }) => {
    console.info("Report submitted for message:", msgId);
  });

  socket.on("report_received", (data) => {
    if (data.success) console.info("Report submitted successfully");
  });

  socket.on("report_error", (error) => {
    console.error("Report error:", error);
  });

  // ═══════════════════════════════════════════════════════════
  //  FILES PANEL
  // ═══════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════
  //  MESSAGE INFO (for info panel)
  // ═══════════════════════════════════════════════════════════
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