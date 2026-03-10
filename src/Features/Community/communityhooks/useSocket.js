// import { useRef, useState } from "react";
// import io from "socket.io-client";
// import { decryptMessage } from "../encryptmsg.js";

// const SECRET_KEY = import.meta.env.VITE_APP_CHATSECRETKEY?.trim();
// const socketUrl = import.meta.env.VITE_API_CHAT_URL;

// console.log(socketUrl,"socketUrl")

// /**
//  * useSocket
//  * Owns the socket connection and registers/unregisters all socket event handlers.
//  * Call connectSocket() once currentUser is ready.
//  * All state-setters are passed in so this hook stays decoupled from the others.
//  */
// const useSocket = ({
//     currentUser,
//     selectedGroup,
//     // message state setters (from useMessages)
//     setMessages,
//     processedMessagesRef,
//     setIsInputDisabled,
//     rateLimitResetTimer,
//     setHasMoreOldMessages,
//     setHasMoreNewMessages,
//     setOldestMessageTimestamp,
//     setNewestMessageTimestamp,
//     setIsLoadingOlder,
//     setIsLoadingNewer,
//     // group/ui setters (from GroupChatApp)
//     setGroups,
//     setTypingUsers,
//     setOnlineUsers,
//     setUploadProgress,
// }) => {
//     const socketRef = useRef(null);
//     const [socketConnected, setSocketConnected] = useState(false);

//     // ── helpers ────────────────────────────────────────────────────────────────
//     const decryptMsg = async (raw) => {
//         if (raw && typeof raw === "object" && raw.cipherText) {
//             try { return await decryptMessage(raw, SECRET_KEY); }
//             catch { return "[Decryption failed]"; }
//         }
//         return typeof raw === "string" ? raw : String(raw || "");
//     };

//     const filterDeleted = (msgs, userId) =>
//         msgs.filter((msg) => {
//             if (!msg.deletedFor || !Array.isArray(msg.deletedFor)) return true;
//             return !msg.deletedFor.some((uid) => uid?.toString() === userId?.toString());
//         });

//     const normalizeMsg = (msg, overrides = {}) => ({
//         ...msg,
//         _id: msg._id || msg.msgId,
//         msgId: msg.msgId || msg._id?.toString(),
//         ...overrides,
//     });

//     // ── connect ────────────────────────────────────────────────────────────────
//     const connectSocket = () => {
//         if (socketRef.current) {
//             socketRef.current.removeAllListeners();
//             socketRef.current.disconnect();
//             socketRef.current = null;
//         }

//         socketRef.current = io(socketUrl, {
//             transports: ["websocket"],
//             query: { userId: currentUser.id, date: currentUser.userregisteredDate },
//         });

//         const socket = socketRef.current;

//         socket.on("connect", () => setSocketConnected(true));
//         socket.on("disconnect", () => setSocketConnected(false));

//         socket.on("online_users", (users) => setOnlineUsers(users));

//         // ── typing ───────────────────────────────────────────────────────────────
//         socket.on("user:typing", (data) => {
//             if (data.userId === currentUser.id) return;
//             setTypingUsers((prev) => {
//                 if (prev.some((u) => u.userId === data.userId)) return prev;
//                 return [...prev, { userId: data.userId, userName: data.userName || "Someone" }];
//             });
//         });

//         socket.on("user:stop-typing", (data) => {
//             setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
//         });

//         // ── new_message ───────────────────────────────────────────────────────────
//         socket.on("new_message", async (data) => {
//             const messageId = data._id?.toString() || data.msgId;
//             if (!messageId || processedMessagesRef.current.has(messageId)) return;

//             const decrypted = await decryptMsg(data.msgBody?.message);
//             const msgObj = normalizeMsg(data, {
//                 msgBody: { ...data.msgBody, message: decrypted, media: data.msgBody?.media ? { ...data.msgBody.media, is_uploading: false } : undefined },
//             });

//             const isMe = data.fromUserId === currentUser.id;

//             setMessages((prev) => {
//                 if (isMe) {
//                     const tempIdx = prev.findIndex(
//                         (m) => m.correlationId && data.correlationId && m.correlationId === data.correlationId && m.msgId?.startsWith("temp_")
//                     );
//                     if (tempIdx !== -1) {
//                         processedMessagesRef.current.add(messageId);
//                         const updated = [...prev];
//                         updated[tempIdx] = { ...msgObj, msgStatus: "sent", status: "sent", metaData: { ...msgObj.metaData, isSent: true, sentAt: data.timestamp, isDelivered: false } };
//                         return updated;
//                     }
//                 }
//                 if (prev.some((m) => (m._id?.toString() || m.msgId) === messageId)) {
//                     processedMessagesRef.current.add(messageId);
//                     return prev;
//                 }
//                 processedMessagesRef.current.add(messageId);
//                 return [...prev, msgObj];
//             });

//             updateGroupLastMessage(data, msgObj);
//         });

//         // ── send_message (echo) ───────────────────────────────────────────────────
//         socket.on("send_message", async (data) => {
//             const messageId = data._id?.toString() || data.msgId;
//             if (!messageId || processedMessagesRef.current.has(messageId)) return;

//             const decrypted = await decryptMsg(data.msgBody?.message);
//             const msgObj = normalizeMsg(data, { msgBody: { ...data.msgBody, message: decrypted } });
//             const isMe = data.fromUserId === currentUser.id;

//             setMessages((prev) => {
//                 if (isMe) {
//                     const tempIdx = prev.findIndex(
//                         (m) => m.correlationId && data.correlationId && m.correlationId === data.correlationId && m.msgId?.startsWith("temp_")
//                     );
//                     if (tempIdx !== -1) {
//                         processedMessagesRef.current.add(messageId);
//                         const updated = [...prev];
//                         updated[tempIdx] = { ...msgObj, msgStatus: "sent", status: "sent", metaData: { ...msgObj.metaData, isSent: true, sentAt: data.timestamp } };
//                         return updated;
//                     }
//                 }
//                 if (prev.some((m) => (m._id?.toString() || m.msgId) === messageId)) {
//                     processedMessagesRef.current.add(messageId);
//                     return prev;
//                 }
//                 processedMessagesRef.current.add(messageId);
//                 return [...prev, msgObj];
//             });

//             updateGroupLastMessage(data, msgObj);
//         });

//         // ── send_message_error ────────────────────────────────────────────────────
//         socket.on("send_message_error", ({ error, tempId, correlationId, msgId }) => {
//             const isRateLimit = /rate limit|too many|slow down|wait/i.test(error || "");

//             if (isRateLimit) {
//                 setMessages((prev) => prev.filter((msg) => {
//                     const matchTemp = msg.msgId === tempId || msg.correlationId === correlationId;
//                     const matchId = msg.msgId === msgId || msg._id?.toString() === msgId;
//                     return !(matchTemp || matchId);
//                 }));
//                 setIsInputDisabled(true);
//                 if (rateLimitResetTimer.current) clearTimeout(rateLimitResetTimer.current);
//                 rateLimitResetTimer.current = setTimeout(() => setIsInputDisabled(false), 60000);
//                 return;
//             }

//             setMessages((prev) =>
//                 prev.map((msg) => {
//                     const matchTemp = msg.msgId === tempId || msg.correlationId === correlationId;
//                     const matchId = msg.msgId === msgId || msg._id?.toString() === msgId;
//                     return matchTemp || matchId ? { ...msg, status: "failed", msgStatus: "failed", error } : msg;
//                 })
//             );
//         });

//         // ── message_saved_confirmation ─────────────────────────────────────────────
//         socket.on("message_saved_confirmation", ({ tempId, correlationId, _id, msgId }) => {
//             setMessages((prev) =>
//                 prev.map((msg) =>
//                     msg.correlationId === correlationId || msg.msgId === tempId
//                         ? { ...msg, _id, msgId, dbSaved: true }
//                         : msg
//                 )
//             );
//         });

//         // ── update_message_status ──────────────────────────────────────────────────
//         socket.on("update_message_status", ({ msgId, metaData, msgStatus }) => {
//             setMessages((prev) =>
//                 prev.map((msg) =>
//                     msg.msgId === msgId || msg._id?.toString() === msgId
//                         ? { ...msg, metaData: { ...msg.metaData, ...metaData }, msgStatus }
//                         : msg
//                 )
//             );
//         });

//         // ── message:read:update ────────────────────────────────────────────────────
//         socket.on("message:read:update", ({ msgId, readBy }) => {
//             setMessages((prev) =>
//                 prev.map((msg) =>
//                     msg.msgId === msgId || msg._id?.toString() === msgId
//                         ? { ...msg, metaData: { ...msg.metaData, readBy: readBy || [], isRead: !!(readBy?.length) } }
//                         : msg
//                 )
//             );
//         });

//         // ── delete events ──────────────────────────────────────────────────────────
//         const markDeletedForEveryone = (msgId) => {
//             setMessages((prev) =>
//                 prev.map((msg) => {
//                     const id = msg.msgId || msg._id?.toString() || msg.id;
//                     return id === msgId ? { ...msg, deletedForEveryone: true, msgBody: { ...msg.msgBody, message: "This message was deleted" } } : msg;
//                 })
//             );
//         };

//         socket.on("message_deleted_for_everyone", ({ msgId, userId }) => {
//             if (userId !== currentUser.id) markDeletedForEveryone(msgId);
//         });

//         socket.on("delete_for_everyone", ({ msgId, userId }) => {
//             if (userId !== currentUser.id) markDeletedForEveryone(msgId);
//         });

//         socket.on("delete_error", () => { });

//         // ── file events ────────────────────────────────────────────────────────────
//         socket.on("file_upload_progress", ({ correlationId, progress }) => {
//             setUploadProgress(progress);
//             setMessages((prev) =>
//                 prev.map((msg) => msg.correlationId === correlationId ? { ...msg, uploadProgress: progress } : msg)
//             );
//         });

//         socket.on("file_upload_success", async (savedMessage) => {
//             const messageId = savedMessage._id?.toString() || savedMessage.msgId;
//             const decrypted = await decryptMsg(savedMessage.msgBody?.message);
//             const msgObj = normalizeMsg(savedMessage, {
//                 msgStatus: "sent", status: "sent",
//                 msgBody: { ...savedMessage.msgBody, message: decrypted, media: { ...savedMessage.msgBody.media, is_uploading: false, tempPreview: undefined } },
//                 metaData: { ...savedMessage.metaData, isSent: true, sentAt: savedMessage.timestamp },
//             });

//             if (savedMessage.fromUserId === currentUser.id) {
//                 setMessages((prev) =>
//                     prev.map((msg) =>
//                         msg.msgId === savedMessage.tempId || msg.correlationId === savedMessage.correlationId
//                             ? msgObj : msg
//                     )
//                 );
//             } else {
//                 setMessages((prev) => {
//                     if (prev.some((m) => (m._id?.toString() || m.msgId) === messageId)) return prev;
//                     return [...prev, msgObj];
//                 });
//             }

//             processedMessagesRef.current.add(messageId);
//             setUploadProgress(0);
//         });

//         socket.on("file_upload_error", ({ tempId, correlationId, error }) => {
//             setMessages((prev) =>
//                 prev.map((msg) =>
//                     msg.msgId === tempId || msg.correlationId === correlationId
//                         ? {
//                             ...msg, status: "failed", msgStatus: "failed",
//                             msgBody: { ...msg.msgBody, media: { ...msg.msgBody.media, is_uploading: false } }, error
//                         }
//                         : msg
//                 )
//             );
//             setUploadProgress(0);
//         });

//         socket.on("new_file_message", (data) => {
//             const msgObj = {
//                 ...data, _id: data._id, msgId: data.msgId || data._id?.toString(),
//                 msgBody: { ...data.msgBody, media: { ...data.msgBody.media, is_uploading: false } }
//             };
//             setMessages((prev) => [...prev, msgObj]);
//         });

//         // ── chat_history ───────────────────────────────────────────────────────────
//         socket.on("chat_history", async ({ chatId, messages: chatMessages }) => {
//             if (window.currentLoadingTimeout) {
//                 clearTimeout(window.currentLoadingTimeout);
//                 window.currentLoadingTimeout = null;
//             }

//             const formatted = await Promise.all(
//                 chatMessages.map(async (msg) => {
//                     const decrypted = await decryptMsg(msg.msgBody?.message);
//                     return normalizeMsg(msg, { msgBody: { ...msg.msgBody, message: decrypted } });
//                 })
//             );

//             const filtered = filterDeleted(formatted, currentUser?.id);
//             setMessages(filtered);

//             if (filtered.length > 0) {
//                 setOldestMessageTimestamp(filtered[0].timestamp);
//                 setNewestMessageTimestamp(filtered[filtered.length - 1].timestamp);
//                 setHasMoreOldMessages(filtered.length >= 50);
//                 setHasMoreNewMessages(false);
//             } else {
//                 setHasMoreOldMessages(false);
//                 setHasMoreNewMessages(false);
//             }
//         });

//         // ── load_older_messages ────────────────────────────────────────────────────
//         socket.on("load_older_messages", async ({ messages: older, hasMore }) => {
//             if (older?.length) {
//                 const decrypted = await Promise.all(older.map(async (msg) => {
//                     const d = await decryptMsg(msg.msgBody?.message);
//                     return normalizeMsg(msg, { msgBody: { ...msg.msgBody, message: d } });
//                 }));
//                 const filtered = filterDeleted(decrypted, currentUser?.id);

//                 setMessages((prev) => {
//                     const existingIds = new Set(prev.map((m) => m.msgId || m._id?.toString()));
//                     const newMsgs = filtered.filter((m) => !existingIds.has(m.msgId || m._id?.toString()));
//                     return [...newMsgs, ...prev];
//                 });

//                 setOldestMessageTimestamp(older[0].timestamp);
//                 setHasMoreOldMessages(hasMore);
//             } else {
//                 setHasMoreOldMessages(false);
//             }
//             setIsLoadingOlder(false);
//         });

//         // ── load_newer_messages ────────────────────────────────────────────────────
//         socket.on("load_newer_messages", async ({ messages: newer, hasMore }) => {
//             if (newer?.length) {
//                 const decrypted = await Promise.all(newer.map(async (msg) => {
//                     const d = await decryptMsg(msg.msgBody?.message);
//                     return normalizeMsg(msg, { msgBody: { ...msg.msgBody, message: d } });
//                 }));
//                 const filtered = filterDeleted(decrypted, currentUser?.id);

//                 setMessages((prev) => {
//                     const existingIds = new Set(prev.map((m) => m.msgId || m._id?.toString()));
//                     const newMsgs = filtered.filter((m) => !existingIds.has(m.msgId || m._id?.toString()));
//                     return [...prev, ...newMsgs];
//                 });

//                 setNewestMessageTimestamp(newer[newer.length - 1].timestamp);
//                 setHasMoreNewMessages(hasMore);
//             } else {
//                 setHasMoreNewMessages(false);
//             }
//             setIsLoadingNewer(false);
//         });

//         // ── clear_chat ─────────────────────────────────────────────────────────────
//         socket.on("clear_chat_success", ({ chatId, userId }) => {
//             if (selectedGroup?.chatId === chatId && userId === currentUser.id) {
//                 setMessages([]);
//                 setHasMoreOldMessages(false);
//                 setHasMoreNewMessages(false);
//                 setOldestMessageTimestamp(null);
//                 setNewestMessageTimestamp(null);
//             }
//             setGroups((prev) =>
//                 prev.map((g) =>
//                     g.chatId === chatId ? { ...g, lastMessage: "", time: "", unread: 0 } : g
//                 )
//             );
//         });

//         socket.on("clear_chat_error", ({ error }) => console.error("Clear chat error:", error));

//         // ── report ─────────────────────────────────────────────────────────────────
//         socket.on("report_received", (data) => { if (data.success) console.log("Report submitted"); });
//     };

//     // ── update group sidebar last-message preview ──────────────────────────────
//     const updateGroupLastMessage = (data, msgObj) => {
//         setGroups((prev) =>
//             prev.map((g) => {
//                 if (g.chatId !== data.chatId) return g;
//                 let preview = "";
//                 const raw = msgObj.msgBody?.message;
//                 if (typeof raw === "string") preview = raw.substring(0, 50);
//                 else if (data.msgBody?.media?.file_url) preview = "📎 File";
//                 else preview = "Message";

//                 return { ...g, lastMessage: preview, time: new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
//             })
//         );
//     };

//     const disconnectSocket = () => {
//         if (socketRef.current) {
//             socketRef.current.removeAllListeners();
//             socketRef.current.disconnect();
//             socketRef.current = null;
//         }
//     };

//     return { socketRef, socketConnected, connectSocket, disconnectSocket };
// };

// export default useSocket;

import { useState } from "react";
import io from "socket.io-client";
import { decryptMessage } from "../encryptmsg.js";

const SECRET_KEY = import.meta.env.VITE_APP_CHATSECRETKEY?.trim();
const socketUrl = import.meta.env.VITE_API_CHAT_URL;

/**
 * useSocket
 * Owns the socket connection and registers/unregisters all socket event handlers.
 * Call connectSocket() once currentUser is ready.
 * All state-setters are passed in so this hook stays decoupled from the others.
 */
const useSocket = ({
    socketRef,          // passed from GroupChatApp so all hooks share the same ref
    currentUser,
    selectedGroup,
    // message state setters (from useMessages)
    setMessages,
    processedMessagesRef,
    setIsInputDisabled,
    rateLimitResetTimer,
    setHasMoreOldMessages,
    setHasMoreNewMessages,
    setOldestMessageTimestamp,
    setNewestMessageTimestamp,
    setIsLoadingOlder,
    setIsLoadingNewer,
    // group/ui setters (from GroupChatApp)
    setGroups,
    setTypingUsers,
    setOnlineUsers,
    setUploadProgress,
}) => {
    const [socketConnected, setSocketConnected] = useState(false);

    // ── helpers ────────────────────────────────────────────────────────────────
    const decryptMsg = async (raw) => {
        if (raw && typeof raw === "object" && raw.cipherText) {
            try { return await decryptMessage(raw, SECRET_KEY); }
            catch { return "[Decryption failed]"; }
        }
        return typeof raw === "string" ? raw : String(raw || "");
    };

    const filterDeleted = (msgs, userId) =>
        msgs.filter((msg) => {
            if (!msg.deletedFor || !Array.isArray(msg.deletedFor)) return true;
            return !msg.deletedFor.some((uid) => uid?.toString() === userId?.toString());
        });

    const normalizeMsg = (msg, overrides = {}) => ({
        ...msg,
        _id: msg._id || msg.msgId,
        msgId: msg.msgId || msg._id?.toString(),
        ...overrides,
    });

    // ── connect ────────────────────────────────────────────────────────────────
    const connectSocket = () => {
        if (socketRef.current) {
            socketRef.current.removeAllListeners();
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        socketRef.current = io(socketUrl, {
            transports: ["websocket"],
            query: { userId: currentUser.id, date: currentUser.userregisteredDate },
        });

        const socket = socketRef.current;

        socket.on("connect", () => setSocketConnected(true));
        socket.on("disconnect", () => setSocketConnected(false));

        socket.on("online_users", (users) => setOnlineUsers(users));

        // ── typing ───────────────────────────────────────────────────────────────
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

        // ── new_message ───────────────────────────────────────────────────────────
        socket.on("new_message", async (data) => {
            const messageId = data._id?.toString() || data.msgId;
            if (!messageId || processedMessagesRef.current.has(messageId)) return;

            const decrypted = await decryptMsg(data.msgBody?.message);
            const msgObj = normalizeMsg(data, {
                msgBody: { ...data.msgBody, message: decrypted, media: data.msgBody?.media ? { ...data.msgBody.media, is_uploading: false } : undefined },
            });

            const isMe = data.fromUserId === currentUser.id;

            setMessages((prev) => {
                if (isMe) {
                    const tempIdx = prev.findIndex(
                        (m) => m.correlationId && data.correlationId && m.correlationId === data.correlationId && m.msgId?.startsWith("temp_")
                    );
                    if (tempIdx !== -1) {
                        processedMessagesRef.current.add(messageId);
                        const updated = [...prev];
                        updated[tempIdx] = { ...msgObj, msgStatus: "sent", status: "sent", metaData: { ...msgObj.metaData, isSent: true, sentAt: data.timestamp, isDelivered: false } };
                        return updated;
                    }
                }
                if (prev.some((m) => (m._id?.toString() || m.msgId) === messageId)) {
                    processedMessagesRef.current.add(messageId);
                    return prev;
                }
                processedMessagesRef.current.add(messageId);
                return [...prev, msgObj];
            });

            updateGroupLastMessage(data, msgObj);
        });

        // ── send_message (echo) ───────────────────────────────────────────────────
        socket.on("send_message", async (data) => {
            const messageId = data._id?.toString() || data.msgId;
            if (!messageId || processedMessagesRef.current.has(messageId)) return;

            const decrypted = await decryptMsg(data.msgBody?.message);
            const msgObj = normalizeMsg(data, { msgBody: { ...data.msgBody, message: decrypted } });
            const isMe = data.fromUserId === currentUser.id;

            setMessages((prev) => {
                if (isMe) {
                    const tempIdx = prev.findIndex(
                        (m) => m.correlationId && data.correlationId && m.correlationId === data.correlationId && m.msgId?.startsWith("temp_")
                    );
                    if (tempIdx !== -1) {
                        processedMessagesRef.current.add(messageId);
                        const updated = [...prev];
                        updated[tempIdx] = { ...msgObj, msgStatus: "sent", status: "sent", metaData: { ...msgObj.metaData, isSent: true, sentAt: data.timestamp } };
                        return updated;
                    }
                }
                if (prev.some((m) => (m._id?.toString() || m.msgId) === messageId)) {
                    processedMessagesRef.current.add(messageId);
                    return prev;
                }
                processedMessagesRef.current.add(messageId);
                return [...prev, msgObj];
            });

            updateGroupLastMessage(data, msgObj);
        });

        // ── send_message_error ────────────────────────────────────────────────────
        socket.on("send_message_error", ({ error, tempId, correlationId, msgId }) => {
            const isRateLimit = /rate limit|too many|slow down|wait/i.test(error || "");

            if (isRateLimit) {
                setMessages((prev) => prev.filter((msg) => {
                    const matchTemp = msg.msgId === tempId || msg.correlationId === correlationId;
                    const matchId = msg.msgId === msgId || msg._id?.toString() === msgId;
                    return !(matchTemp || matchId);
                }));
                setIsInputDisabled(true);
                if (rateLimitResetTimer.current) clearTimeout(rateLimitResetTimer.current);
                rateLimitResetTimer.current = setTimeout(() => setIsInputDisabled(false), 60000);
                return;
            }

            setMessages((prev) =>
                prev.map((msg) => {
                    const matchTemp = msg.msgId === tempId || msg.correlationId === correlationId;
                    const matchId = msg.msgId === msgId || msg._id?.toString() === msgId;
                    return matchTemp || matchId ? { ...msg, status: "failed", msgStatus: "failed", error } : msg;
                })
            );
        });

        // ── message_saved_confirmation ─────────────────────────────────────────────
        socket.on("message_saved_confirmation", ({ tempId, correlationId, _id, msgId }) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.correlationId === correlationId || msg.msgId === tempId
                        ? { ...msg, _id, msgId, dbSaved: true }
                        : msg
                )
            );
        });

        // ── update_message_status ──────────────────────────────────────────────────
        socket.on("update_message_status", ({ msgId, metaData, msgStatus }) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.msgId === msgId || msg._id?.toString() === msgId
                        ? { ...msg, metaData: { ...msg.metaData, ...metaData }, msgStatus }
                        : msg
                )
            );
        });

        // ── message:read:update ────────────────────────────────────────────────────
        socket.on("message:read:update", ({ msgId, readBy }) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.msgId === msgId || msg._id?.toString() === msgId
                        ? { ...msg, metaData: { ...msg.metaData, readBy: readBy || [], isRead: !!(readBy?.length) } }
                        : msg
                )
            );
        });

        // ── delete events ──────────────────────────────────────────────────────────
        const markDeletedForEveryone = (msgId) => {
            setMessages((prev) =>
                prev.map((msg) => {
                    const id = msg.msgId || msg._id?.toString() || msg.id;
                    return id === msgId ? { ...msg, deletedForEveryone: true, msgBody: { ...msg.msgBody, message: "This message was deleted" } } : msg;
                })
            );
        };

        socket.on("message_deleted_for_everyone", ({ msgId, userId }) => {
            if (userId !== currentUser.id) markDeletedForEveryone(msgId);
        });

        socket.on("delete_for_everyone", ({ msgId, userId }) => {
            if (userId !== currentUser.id) markDeletedForEveryone(msgId);
        });

        socket.on("delete_error", () => { });

        // ── file events ────────────────────────────────────────────────────────────
        socket.on("file_upload_progress", ({ correlationId, progress }) => {
            setUploadProgress(progress);
            setMessages((prev) =>
                prev.map((msg) => msg.correlationId === correlationId ? { ...msg, uploadProgress: progress } : msg)
            );
        });

        socket.on("file_upload_success", async (savedMessage) => {
            const messageId = savedMessage._id?.toString() || savedMessage.msgId;
            const decrypted = await decryptMsg(savedMessage.msgBody?.message);
            const msgObj = normalizeMsg(savedMessage, {
                msgStatus: "sent", status: "sent",
                msgBody: { ...savedMessage.msgBody, message: decrypted, media: { ...savedMessage.msgBody.media, is_uploading: false, tempPreview: undefined } },
                metaData: { ...savedMessage.metaData, isSent: true, sentAt: savedMessage.timestamp },
            });

            if (savedMessage.fromUserId === currentUser.id) {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.msgId === savedMessage.tempId || msg.correlationId === savedMessage.correlationId
                            ? msgObj : msg
                    )
                );
            } else {
                setMessages((prev) => {
                    if (prev.some((m) => (m._id?.toString() || m.msgId) === messageId)) return prev;
                    return [...prev, msgObj];
                });
            }

            processedMessagesRef.current.add(messageId);
            setUploadProgress(0);
        });

        socket.on("file_upload_error", ({ tempId, correlationId, error }) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.msgId === tempId || msg.correlationId === correlationId
                        ? {
                            ...msg, status: "failed", msgStatus: "failed",
                            msgBody: { ...msg.msgBody, media: { ...msg.msgBody.media, is_uploading: false } }, error
                        }
                        : msg
                )
            );
            setUploadProgress(0);
        });

        socket.on("new_file_message", (data) => {
            const msgObj = {
                ...data, _id: data._id, msgId: data.msgId || data._id?.toString(),
                msgBody: { ...data.msgBody, media: { ...data.msgBody.media, is_uploading: false } }
            };
            setMessages((prev) => [...prev, msgObj]);
        });

        // ── chat_history ───────────────────────────────────────────────────────────
        socket.on("chat_history", async ({ chatId, messages: chatMessages }) => {
            if (window.currentLoadingTimeout) {
                clearTimeout(window.currentLoadingTimeout);
                window.currentLoadingTimeout = null;
            }

            const formatted = await Promise.all(
                chatMessages.map(async (msg) => {
                    const decrypted = await decryptMsg(msg.msgBody?.message);
                    return normalizeMsg(msg, { msgBody: { ...msg.msgBody, message: decrypted } });
                })
            );

            const filtered = filterDeleted(formatted, currentUser?.id);
            setMessages(filtered);

            if (filtered.length > 0) {
                setOldestMessageTimestamp(filtered[0].timestamp);
                setNewestMessageTimestamp(filtered[filtered.length - 1].timestamp);
                setHasMoreOldMessages(filtered.length >= 50);
                setHasMoreNewMessages(false);
            } else {
                setHasMoreOldMessages(false);
                setHasMoreNewMessages(false);
            }
        });

        // ── load_older_messages ────────────────────────────────────────────────────
        socket.on("load_older_messages", async ({ messages: older, hasMore }) => {
            if (older?.length) {
                const decrypted = await Promise.all(older.map(async (msg) => {
                    const d = await decryptMsg(msg.msgBody?.message);
                    return normalizeMsg(msg, { msgBody: { ...msg.msgBody, message: d } });
                }));
                const filtered = filterDeleted(decrypted, currentUser?.id);

                setMessages((prev) => {
                    const existingIds = new Set(prev.map((m) => m.msgId || m._id?.toString()));
                    const newMsgs = filtered.filter((m) => !existingIds.has(m.msgId || m._id?.toString()));
                    return [...newMsgs, ...prev];
                });

                setOldestMessageTimestamp(older[0].timestamp);
                setHasMoreOldMessages(hasMore);
            } else {
                setHasMoreOldMessages(false);
            }
            setIsLoadingOlder(false);
        });

        // ── load_newer_messages ────────────────────────────────────────────────────
        socket.on("load_newer_messages", async ({ messages: newer, hasMore }) => {
            if (newer?.length) {
                const decrypted = await Promise.all(newer.map(async (msg) => {
                    const d = await decryptMsg(msg.msgBody?.message);
                    return normalizeMsg(msg, { msgBody: { ...msg.msgBody, message: d } });
                }));
                const filtered = filterDeleted(decrypted, currentUser?.id);

                setMessages((prev) => {
                    const existingIds = new Set(prev.map((m) => m.msgId || m._id?.toString()));
                    const newMsgs = filtered.filter((m) => !existingIds.has(m.msgId || m._id?.toString()));
                    return [...prev, ...newMsgs];
                });

                setNewestMessageTimestamp(newer[newer.length - 1].timestamp);
                setHasMoreNewMessages(hasMore);
            } else {
                setHasMoreNewMessages(false);
            }
            setIsLoadingNewer(false);
        });

        // ── clear_chat ─────────────────────────────────────────────────────────────
        socket.on("clear_chat_success", ({ chatId, userId }) => {
            if (selectedGroup?.chatId === chatId && userId === currentUser.id) {
                setMessages([]);
                setHasMoreOldMessages(false);
                setHasMoreNewMessages(false);
                setOldestMessageTimestamp(null);
                setNewestMessageTimestamp(null);
            }
            setGroups((prev) =>
                prev.map((g) =>
                    g.chatId === chatId ? { ...g, lastMessage: "", time: "", unread: 0 } : g
                )
            );
        });

        socket.on("clear_chat_error", ({ error }) => console.error("Clear chat error:", error));

        // ── report ─────────────────────────────────────────────────────────────────
        socket.on("report_received", (data) => { if (data.success) console.log("Report submitted"); });
    };

    // ── update group sidebar last-message preview ──────────────────────────────
    const updateGroupLastMessage = (data, msgObj) => {
        setGroups((prev) =>
            prev.map((g) => {
                if (g.chatId !== data.chatId) return g;
                let preview = "";
                const raw = msgObj.msgBody?.message;
                if (typeof raw === "string") preview = raw.substring(0, 50);
                else if (data.msgBody?.media?.file_url) preview = "📎 File";
                else preview = "Message";

                return { ...g, lastMessage: preview, time: new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
            })
        );
    };

    const disconnectSocket = () => {
        if (socketRef.current) {
            socketRef.current.removeAllListeners();
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    };

    return { socketConnected, connectSocket, disconnectSocket };
};

export default useSocket;