import React, { useState, useEffect, useRef, useMemo } from "react";
import { Users } from "lucide-react";
import io from "socket.io-client";
import Cookies from "js-cookie";
import ChatWindow from "./chatWindow.jsx";
import {
  useGetChatFilesQuery,
  useLazyGetUsersQuery,
  useGetGroupsQuery,
  useUploadFileMutation,
  useUploadAudioMutation,
  useSendPublicKeyMutation,
  useGetAllUsersCommunityQuery,
} from "./communityApiSlice";
import { encryptMessage, decryptMessage } from "./encryptmsg.js";
import { sanitizeMessage } from "./sanitize.js";
import Loader from "../../ReusableComponents/Loader/loader.jsx";

const GroupChatApp = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState({ id: "", name: "" });
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showClearChatModal, setShowClearChatModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFilesPanel, setShowFilesPanel] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [socketInitialized, setSocketInitialized] = useState(false);
  const [ReadInfo, setReadInfo] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [encryptedKey, setencryptedKey] = useState(null);
  const [DecryptedKey, setdecryptedKey] = useState([]);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const rateLimitResetTimer = useRef(null);
  const [activeGroupTab, setActiveGroupTab] = useState("overview");

  const [PrivateKey, setPrivateKey] = useState(null);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);
  const [showFileTypeModal, setShowFileTypeModal] = useState(false);
  const [status, setstatus] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true); // ✅ Start as loading
  const [isInitialMessagesLoad, setIsInitialMessagesLoad] = useState(true);
  const [userPage, setUserPage] = useState(1);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [isLoadingMoreUsers, setIsLoadingMoreUsers] = useState(false);

  const hasAutoSelectedRef = useRef(false);

  // Refs

  const processedMessagesRef = useRef(new Set());
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const audioPlayerRef = useRef({});
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Add these new state variables (around line 50)
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [imageCaption, setImageCaption] = useState("");
  const [documentCaption, setDocumentCaption] = useState("");
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [parsedCookies, setparsedCookies] = useState(null);

  const [hasMoreOldMessages, setHasMoreOldMessages] = useState(true);
  const [hasMoreNewMessages, setHasMoreNewMessages] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [isLoadingNewer, setIsLoadingNewer] = useState(false);
  const [oldestMessageTimestamp, setOldestMessageTimestamp] = useState(null);
  const [newestMessageTimestamp, setNewestMessageTimestamp] = useState(null);

  const [displayedUsers, setDisplayedUsers] = useState([]); // Only current 10 users
  // const [userPage, setUserPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const isLoadingUsersRef = useRef(false); // Prevent duplicate calls
  const lastScrollDirection = useRef(null);

  const { data: fetchedGroups = [] } = useGetGroupsQuery();

  const { data: userDetails } = useGetAllUsersCommunityQuery();

  console.log(userDetails, "teye");
  console.log(userDetails?.finalTotalUsers, "useDETAILS");

  useEffect(() => {
    if (userDetails) {
      setTotalUsers(userDetails.finalTotalUsers);
    }
  }, [userDetails]);

  console.log(showFileTypeModal, "showFileTypeModaqql");

  // const { data: chatFiles = [], isLoading: loadingFiles, refetch: refetchFiles } = useGetChatFilesQuery(
  //     selectedGroup?.chatId,
  //     { skip: !selectedGroup?.chatId }
  // );

  const shouldFetchFiles =
    (activeGroupTab === "media" || activeGroupTab === "files") &&
    !!selectedGroup?.chatId;

  const {
    data: chatFilesData = [],
    isLoading: loadingFiles,
    refetch: refetchFiles,
  } = useGetChatFilesQuery(selectedGroup?.chatId, {
    skip: !selectedGroup?.chatId,
  });

  const chatFiles = chatFilesData?.data || chatFilesData || [];

  const [sendPublicKey, { isLoading, isSuccess, isError }] =
    useSendPublicKeyMutation();
  const [fetchUsers, { isLoading: isLoadingUsersAPI, error: usersError }] =
    useLazyGetUsersQuery();

  const [uploadFile, { isLoading: uploadingFile }] = useUploadFileMutation();
  const [uploadAudio, { isLoading: uploadingAudio }] = useUploadAudioMutation();

  const Allusers = useMemo(() => displayedUsers, [displayedUsers]);

  console.log(allUsers, "allusers");
  console.log(totalUsers, "totalUsers");

  const SECRET_KEY = import.meta.env.VITE_APP_CHATSECRETKEY?.trim();

  const userDetail = Cookies.get("adminUserData");

  if (userDetail) {
    const parsedUser = JSON.parse(userDetail);
    console.log(parsedUser, "parsedUser");
  }

  useEffect(() => {
    if (selectedGroup) {
      fetchUsers({ page: 1, limit: 10 });
      setUserPage(1);
    }
  }, [selectedGroup?.id]);

  const loadMoreUsers = async () => {
    if (isLoadingMoreUsers || !hasMoreUsers) return;

    setIsLoadingMoreUsers(true);
    const nextPage = userPage + 1;

    try {
      const result = await fetchUsers({ page: nextPage, limit: 10 }).unwrap();
      setUserPage(nextPage);
      setHasMoreUsers(result.hasMore);
    } catch (error) {
      console.error("Failed to load more users:", error);
    } finally {
      setIsLoadingMoreUsers(false);
    }
  };

  // ✅ FIX 1: REPLACE your currentUser useState initialization (around line 150)
  // Start with empty state

  // ✅ FIX 1.5: ADD this useEffect to read cookies AFTER mount
  useEffect(() => {
    console.log("🍪 Checking for user cookies...");

    try {
      const data = Cookies.get("adminUserData");
      console.log("🍪 Raw cookie data:", data);

      if (data) {
        const parsedData = JSON.parse(data);
        console.log("✅ Parsed cookie data:", parsedData);

        const userData = {
          id: parsedData?.data?.username || "",
          name: parsedData?.data?.name || "",
          userregisteredDate: parsedData?.data?.registeredDate,
        };

        console.log("👤 Setting current user:", userData);
        setCurrentUser(userData);
      } else {
        console.log("⚠️ No userData cookie found");
      }
    } catch (error) {
      console.error("❌ Error reading userData from cookies:", error);
    }
  }, []);

  console.log(currentUser, "currentUser");

  const fetchUsersPage = async (page) => {
    if (isLoadingUsersRef.current) {
      console.log("⏸️ Already loading, skipping...");
      return;
    }

    if (page < 1 || (totalPages > 0 && page > totalPages)) {
      console.log("❌ Invalid page:", page);
      return;
    }

    isLoadingUsersRef.current = true;
    setIsLoadingUsers(true);

    console.log(`📥 Fetching page ${page}`);

    try {
      const result = await fetchUsers({
        page,
        limit: 10,
        chatId: selectedGroup.chatId, // ✅ Make sure to pass chatId
      }).unwrap();

      console.log("✅ Loaded users:", result.users?.length);

      // ✅ Update state with new data
      setDisplayedUsers(result.users || []);
      setUserPage(page);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (error) {
      console.error("❌ Failed to fetch users:", error);
      // alert("Failed to load members. Please try again.");
    } finally {
      setIsLoadingUsers(false);
      isLoadingUsersRef.current = false;
    }
  };
  // ✅ Fetch initial users when group is selected
  useEffect(() => {
    if (!selectedGroup) return;

    console.log("🔄 Group selected, loading page 1");
    fetchUsersPage(1);
  }, [selectedGroup?.id]);

  // ✅ Load next page (scroll down)
  const loadNextPage = () => {
    if (userPage < totalPages && !isLoadingUsers) {
      console.log("⬇️ Loading next page:", userPage + 1);
      fetchUsersPage(userPage + 1);
    }
  };

  // ✅ Load previous page (scroll up)
  const loadPrevPage = () => {
    if (userPage > 1 && !isLoadingUsers) {
      console.log("⬆️ Loading previous page:", userPage - 1);
      fetchUsersPage(userPage - 1);
    }
  };

  // ✅ Reset when group changes
  useEffect(() => {
    console.log("🔄 Group changed, resetting");
    setDisplayedUsers([]);
    setUserPage(1);

    setTotalPages(1);
    setIsLoadingUsers(false);
    isLoadingUsersRef.current = false;
    lastScrollDirection.current = null;
  }, [selectedGroup?.chatId]);

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    // Validate all files are images
    const validImages = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        return false;
      }
      if (file.size > 50 * 1024 * 1024) {
        // 50MB limit
        return false;
      }
      return true;
    });

    if (validImages.length === 0) return;

    // Create preview URLs
    const imageObjects = validImages.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));

    setSelectedImages(imageObjects);
    setShowImagePreview(true);
    setImageCaption("");
  };

  const handleDocumentSelect = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    // Validate file size
    if (file.size > 100 * 1024 * 1024) {
      return;
    }

    // Validate file type (documents only)
    const allowedTypes = [
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
    ];

    if (
      !allowedTypes.includes(file.type) &&
      !file.name.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar)$/i)
    ) {
      return;
    }

    const documentObject = {
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      icon: getFileIcon(file.name),
    };

    setSelectedDocument(documentObject);
    setShowDocumentPreview(true);
    setDocumentCaption("");
  };

  useEffect(() => {
    console.log("👤 Current user state:", currentUser);
    console.log("👤 User ID:", currentUser.id);
    console.log("👤 User Name:", currentUser.name);
  }, [currentUser]);

  // Socket connection function
  const connectSocket = () => {
    console.log("trigggred123");
    try {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null; // ✅ Clear reference
      }

      console.log(
        currentUser.userregisteredDate,
        "currentUser.userregisteredDate",
      );

      socketRef.current = io("https://scsi-embedded-tags-exactly.trycloudflare.com/", {
        transports: ["websocket"],
        query: {
          userId: currentUser.id,
          date: currentUser.userregisteredDate,
        },
      });

      socketRef.current.on("connect", () => {
        // console.log("Socket connected:", socketRef.current.id);
        setSocketConnected(true);
      });

      socketRef.current.on("disconnect", () => {
        // console.log("Socket disconnected");
        setSocketConnected(false);
      });

      socketRef.current.on("online_users", (users) => {
        setOnlineUsers(users);
      });

      socketRef.current.on("user:typing", (data) => {
        console.log("📥 FRONTEND: Received user:typing", data);

        if (data.userId !== currentUser.id) {
          setTypingUsers((prev) => {
            const exists = prev.some((u) => u.userId === data.userId);
            if (exists) return prev;

            return [
              ...prev,
              {
                userId: data.userId,
                userName: data.userName || "Someone",
              },
            ];
          });
        }
      });

      // Add this AFTER your existing send_message handler (around line 900)

      socketRef.current.on("new_message", async (data) => {
        console.log("📨 Received new_message (file upload):", {
          msgId: data.msgId,
          fileName: data.msgBody?.media?.fileName,
          fileUrl: data.msgBody?.media?.file_url,
          from: data.publisherName,
        });

        const messageId = data._id?.toString() || data.msgId;

        if (!messageId) {
          console.error("❌ new_message has no ID:", data);
          return;
        }

        // ✅ Check for duplicates
        if (processedMessagesRef.current.has(messageId)) {
          console.log("⚠️ Duplicate new_message ignored:", messageId);
          return;
        }

        // ✅ Decrypt message if needed
        let decryptedMessage = data.msgBody?.message;
        if (
          decryptedMessage &&
          typeof decryptedMessage === "object" &&
          decryptedMessage.cipherText
        ) {
          try {
            decryptedMessage = await decryptMessage(
              decryptedMessage,
              SECRET_KEY,
            );
          } catch (err) {
            console.error("❌ Decryption failed:", err);
            decryptedMessage = "[Decryption failed]";
          }
        } else if (typeof decryptedMessage !== "string") {
          decryptedMessage = String(decryptedMessage || "");
        }

        const messageObject = {
          ...data,
          _id: data._id,
          msgId: messageId,
          msgBody: {
            ...data.msgBody,
            message: decryptedMessage,
            media: data.msgBody?.media
              ? {
                  ...data.msgBody.media,
                  is_uploading: false, // ✅ CRITICAL: Set to false
                  file_url: data.msgBody.media.file_url, // ✅ Real URL from backend
                }
              : undefined,
          },
        };

        const isMyMessage = data.fromUserId === currentUser.id;

        console.log("📎 File message details:", {
          isMyMessage,
          hasMedia: !!messageObject.msgBody?.media,
          fileUrl: messageObject.msgBody?.media?.file_url,
          fileName: messageObject.msgBody?.media?.fileName,
        });

        if (isMyMessage) {
          // ✅ FOR SENDER: Replace temp message with real one
          setMessages((prev) => {
            const tempIndex = prev.findIndex(
              (msg) =>
                msg.correlationId &&
                data.correlationId &&
                msg.correlationId === data.correlationId &&
                msg.msgId?.startsWith("temp_"),
            );

            if (tempIndex !== -1) {
              console.log(
                "✅ Replacing temp file message at index:",
                tempIndex,
              );
              processedMessagesRef.current.add(messageId);

              const updated = [...prev];
              updated[tempIndex] = {
                ...messageObject,
                msgStatus: "sent",
                status: "sent",
                metaData: {
                  ...messageObject.metaData,
                  isSent: true,
                  sentAt: data.timestamp,
                  isDelivered: false,
                },
              };
              return updated;
            }

            // Check if already exists
            const alreadyExists = prev.some((msg) => {
              const existingId = msg._id?.toString() || msg.msgId;
              return existingId === messageId;
            });

            if (alreadyExists) {
              console.log("⚠️ File message already exists");
              processedMessagesRef.current.add(messageId);
              return prev;
            }

            // Add as new
            console.log("➕ Adding file message as new");
            processedMessagesRef.current.add(messageId);
            return [...prev, messageObject];
          });
        } else {
          // ✅ FOR OTHER USERS: Add immediately with file URL
          console.log("📨 Adding file message from other user");

          setMessages((prev) => {
            // Check if already exists
            const alreadyExists = prev.some((msg) => {
              const existingId = msg._id?.toString() || msg.msgId;
              return existingId === messageId;
            });

            if (alreadyExists) {
              console.log("⚠️ File message already exists for other user");
              processedMessagesRef.current.add(messageId);
              return prev;
            }

            console.log("✅ Adding new file message to UI");
            console.log(
              "📎 Image URL:",
              messageObject.msgBody?.media?.file_url,
            );

            processedMessagesRef.current.add(messageId);
            return [...prev, messageObject];
          });

          // Mark as read if in current chat
          if (selectedGroup && data.chatId === selectedGroup.chatId) {
            if (socketRef.current?.connected) {
              setTimeout(() => {
                socketRef.current.emit("message_read", {
                  chatId: data.chatId,
                  messageId: data._id,
                  userId: currentUser.id,
                });
              }, 500);
            }
          } else {
            // Show notification if from different chat
            showNotification(data);
          }
        }

        // Update group last message
        updateGroupLastMessage(messageObject);
      });

      // Around line 820 in your frontend code
      socketRef.current.on(
        "message_deleted_for_everyone",
        ({ msgId, userId, chatId }) => {
          console.log("📩 Received message_deleted_for_everyone:", {
            msgId,
            userId,
          });

          // Only update if it's from another user (not yourself - you already updated optimistically)
          if (userId !== currentUser.id) {
            setMessages((prev) =>
              prev.map((msg) => {
                const messageId = msg.msgId || msg._id?.toString() || msg.id;
                if (messageId === msgId) {
                  console.log("✅ Marking as deleted for everyone:", messageId);
                  return {
                    ...msg,
                    deletedForEveryone: true,
                    msgBody: {
                      ...msg.msgBody,
                      message: "This message was deleted",
                    },
                  };
                }
                return msg;
              }),
            );
          }
        },
      );
      socketRef.current.on("user:stop-typing", (data) => {
        console.log("📥 FRONTEND: Received user:stop-typing", data);
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
      });

      socketRef.current.on("report_received", (data) => {
        // console.log("✅ Report confirmation received:", data);
        // Optional: You can show a notification or update UI
        if (data.success) {
          console.log("Report submitted successfully");
        }
      });

      socketRef.current.on("clear_chat_success", ({ chatId, userId }) => {
        console.log("✅ Chat cleared successfully for:", chatId);

        // ✅ IMPORTANT: Only clear if it's the current chat
        if (selectedGroup?.chatId === chatId && userId === currentUser.id) {
          // Clear messages immediately
          setMessages([]);

          // Reset pagination states
          setHasMoreOldMessages(false);
          setHasMoreNewMessages(false);
          setOldestMessageTimestamp(null);
          setNewestMessageTimestamp(null);
        }

        // Update last message in sidebar
        setGroups((prev) =>
          prev.map((g) => {
            if (g.chatId === chatId) {
              return {
                ...g,
                lastMessage: "",
                time: "",
                unread: 0,
              };
            }
            return g;
          }),
        );
      });

      // ============================================
      // SOCKET EVENT HANDLERS FOR FILE UPLOADS
      // Add these inside your connectSocket() function
      // ============================================

      // 1. FILE UPLOAD PROGRESS
      socketRef.current.on(
        "file_upload_progress",
        ({ correlationId, progress }) => {
          console.log(`📊 Upload progress: ${progress}%`);

          setUploadProgress(progress);

          // Update message with progress
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.correlationId === correlationId) {
                return {
                  ...msg,
                  uploadProgress: progress,
                };
              }
              return msg;
            }),
          );
        },
      );

      // 2. FILE UPLOAD SUCCESS
      // socketRef.current.on("file_upload_success", ({
      //     tempId,
      //     correlationId,
      //     messageId,
      //     fileUrl,
      //     fullMessage
      // }) => {
      //     console.log("✅ File upload success:", messageId);

      //     setMessages(prev => prev.map(msg => {
      //         if (msg.msgId === tempId || msg.correlationId === correlationId) {
      //             return {
      //                 ...broadcastMessage,
      //                 msgId: messageId,
      //                 _id: messageId,
      //                 msgStatus: "sent",
      //                 status: "sent",
      //                 msgBody: {
      //                     ...broadcastMessage.msgBody,
      //                     media: {
      //                         ...broadcastMessage.msgBody.media,
      //                         is_uploading: false,
      //                         file_url: fileUrl,
      //                         tempPreview: undefined // Remove temp preview
      //                     }
      //                 },
      //                 metaData: {
      //                     ...broadcastMessage.metaData,
      //                     isSent: true,
      //                     sentAt: Date.now()
      //                 }
      //             };
      //         }
      //         return msg;
      //     }));

      //     processedMessagesRef.current.add(messageId);
      //     setUploadProgress(0);
      // });

      socketRef.current.on("file_upload_success", async (savedMessage) => {
        console.log("✅ file_upload_success received:", {
          msgId: savedMessage.msgId,
          from: savedMessage.publisherName,
          fromUserId: savedMessage.fromUserId,
          myUserId: currentUser.id,
          fileName: savedMessage.msgBody?.media?.fileName,
          fileUrl: savedMessage.msgBody?.media?.file_url,
        });

        const messageId = savedMessage._id?.toString() || savedMessage.msgId;
        const isMyMessage = savedMessage.fromUserId === currentUser.id;

        console.log("🔍 Is my upload?", isMyMessage);

        // Decrypt caption if needed
        let decryptedMessage = savedMessage.msgBody?.message;
        if (
          decryptedMessage &&
          typeof decryptedMessage === "object" &&
          decryptedMessage.cipherText
        ) {
          try {
            decryptedMessage = await decryptMessage(
              decryptedMessage,
              SECRET_KEY,
            );
          } catch (err) {
            console.error("❌ Decryption failed:", err);
            decryptedMessage = "[Decryption failed]";
          }
        } else if (typeof decryptedMessage !== "string") {
          decryptedMessage = String(decryptedMessage || "");
        }

        const messageObject = {
          ...savedMessage,
          _id: savedMessage._id,
          msgId: messageId,
          msgStatus: "sent",
          status: "sent",
          msgBody: {
            ...savedMessage.msgBody,
            message: decryptedMessage,
            media: {
              ...savedMessage.msgBody.media,
              is_uploading: false,
              tempPreview: undefined,
            },
          },
          metaData: {
            ...savedMessage.metaData,
            isSent: true,
            sentAt: savedMessage.timestamp,
          },
        };

        if (isMyMessage) {
          // MY UPLOAD - Replace temp message
          console.log("🔄 Replacing MY temp message");

          setMessages((prev) =>
            prev.map((msg) => {
              if (
                msg.msgId === savedMessage.tempId ||
                msg.correlationId === savedMessage.correlationId
              ) {
                console.log("✅ Replaced temp message");
                return messageObject;
              }
              return msg;
            }),
          );
        } else {
          // OTHER USER'S UPLOAD - Add as new message
          console.log("📨 Adding OTHER USER'S file");

          setMessages((prev) => {
            // Check if already exists
            const alreadyExists = prev.some((msg) => {
              const existingId = msg._id?.toString() || msg.msgId;
              return existingId === messageId;
            });

            if (alreadyExists) {
              console.log("⚠️ File already exists");
              return prev;
            }

            console.log("✅ ADDING OTHER USER'S FILE:", {
              fileName: messageObject.msgBody?.media?.fileName,
              fileUrl: messageObject.msgBody?.media?.file_url,
            });

            return [...prev, messageObject];
          });

          // Mark as read if in current chat
          if (selectedGroup && savedMessage.chatId === selectedGroup.chatId) {
            if (socketRef.current?.connected) {
              setTimeout(() => {
                socketRef.current.emit("message_read", {
                  chatId: savedMessage.chatId,
                  messageId: savedMessage._id,
                  userId: currentUser.id,
                });
              }, 500);
            }
          } else {
            showNotification(savedMessage);
          }
        }

        processedMessagesRef.current.add(messageId);
        updateGroupLastMessage(messageObject);
        setUploadProgress(0);
      });

      // 3. FILE UPLOAD ERROR
      socketRef.current.on(
        "file_upload_error",
        ({ tempId, correlationId, error }) => {
          console.error("❌ File upload error:", error);

          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.msgId === tempId || msg.correlationId === correlationId) {
                return {
                  ...msg,
                  status: "failed",
                  msgStatus: "failed",
                  msgBody: {
                    ...msg.msgBody,
                    media: {
                      ...msg.msgBody.media,
                      is_uploading: false,
                    },
                  },
                  error: error,
                };
              }
              return msg;
            }),
          );

          setUploadProgress(0);
        },
      );

      // 4. NEW FILE MESSAGE FROM OTHERS
      socketRef.current.on("new_file_message", async (data) => {
        console.log("📨 Received file from other user:", data.msgId);

        // Add the file message to UI
        const messageObject = {
          ...data,
          _id: data._id,
          msgId: data.msgId || data._id?.toString(),
          msgBody: {
            ...data.msgBody,
            media: {
              ...data.msgBody.media,
              is_uploading: false, // ✅ NOT uploading anymore
            },
          },
        };

        setMessages((prev) => [...prev, messageObject]);
      });

      // ✅ NEW: Separate handler for file messages from other users
      // socketRef.current.on('new_file_message', async (data) => {
      //     console.log("📨 Received new_file_message:", {
      //         msgId: data.msgId,
      //         fileName: data.msgBody?.media?.fileName,
      //         from: data.publisherName
      //     });

      //     const messageId = data._id?.toString() || data.msgId;

      //     if (!messageId) {
      //         console.error("❌ new_file_message has no ID");
      //         return;
      //     }

      //     // ✅ Check for duplicates
      //     if (processedMessagesRef.current.has(messageId)) {
      //         console.log("⚠️ Duplicate file message ignored:", messageId);
      //         return;
      //     }

      //     // ✅ Decrypt message if needed
      //     let decryptedMessage = data.msgBody?.message;
      //     if (decryptedMessage && typeof decryptedMessage === 'object' && decryptedMessage.cipherText) {
      //         try {
      //             decryptedMessage = await decryptMessage(decryptedMessage, SECRET_KEY);
      //         } catch (err) {
      //             console.error("❌ Decryption failed:", err);
      //             decryptedMessage = "[Decryption failed]";
      //         }
      //     }

      //     const messageObject = {
      //         ...data,
      //         _id: data._id,
      //         msgId: messageId,
      //         msgBody: {
      //             ...data.msgBody,
      //             message: decryptedMessage,
      //             media: data.msgBody?.media ? {
      //                 ...data.msgBody.media,
      //                 is_uploading: false, // ✅ NOT uploading
      //                 file_url: data.msgBody.media.file_url
      //             } : undefined
      //         }
      //     };

      //     // ✅ Add to messages
      //     setMessages(prev => {
      //         const exists = prev.some(msg => {
      //             const existingId = msg._id?.toString() || msg.msgId;
      //             return existingId === messageId;
      //         });

      //         if (exists) {
      //             console.log("⚠️ File message already exists");
      //             processedMessagesRef.current.add(messageId);
      //             return prev;
      //         }

      //         console.log("✅ Adding file message from other user");
      //         processedMessagesRef.current.add(messageId);
      //         return [...prev, messageObject];
      //     });

      //     // Mark as read if in current chat
      //     if (selectedGroup && data.chatId === selectedGroup.chatId) {
      //         if (socketRef.current?.connected) {
      //             setTimeout(() => {
      //                 socketRef.current.emit('message:read', {
      //                     msgId: messageId,
      //                     chatId: data.chatId,
      //                     userId: currentUser.id,
      //                     readAt: Date.now()
      //                 });
      //             }, 500);
      //         }
      //     } else {
      //         showNotification(data);
      //     }

      //     updateGroupLastMessage(messageObject);
      // });

      // ✅ Update file_upload_success handler
      // socketRef.current.on("file_upload_success", ({ tempId, correlationId, messageId, fileUrl, fullMessage }) => {
      //     console.log("✅ File upload confirmed for sender:", messageId);

      //     // ✅ Replace temp message with real message
      //     setMessages(prev => prev.map(msg => {
      //         if (msg.msgId === tempId || msg.correlationId === correlationId) {
      //             return {
      //                 ...fullMessage, // ✅ Use complete message from backend
      //                 msgStatus: "sent",
      //                 status: "sent",
      //                 msgBody: {
      //                     ...fullMessage.msgBody,
      //                     media: {
      //                         ...fullMessage.msgBody.media,
      //                         is_uploading: false, // ✅ Upload complete
      //                         file_url: fileUrl
      //                     }
      //                 }
      //             };
      //         }
      //         return msg;
      //     }));

      //     // Mark as processed
      //     processedMessagesRef.current.add(messageId);
      // });

      socketRef.current.on("clear_chat_error", ({ error }) => {
        console.error("❌ Clear chat error:", error);
      });

      socketRef.current.on("load_older_messages", async (data) => {
        const { messages: olderMessages, hasMore } = data;

        if (olderMessages && olderMessages.length > 0) {
          // ✅ PROPERLY decrypt messages
          const decryptedMessages = await Promise.all(
            olderMessages.map(async (msg) => {
              let decryptedMessage = msg.msgBody?.message;

              // ✅ Check if message needs decryption
              if (
                decryptedMessage &&
                typeof decryptedMessage === "object" &&
                decryptedMessage.cipherText
              ) {
                console.log("🔓 Decrypting older message:", msg.msgId);
                try {
                  decryptedMessage = await decryptMessage(
                    decryptedMessage,
                    SECRET_KEY,
                  );
                } catch (err) {
                  console.error("❌ Failed to decrypt older message:", err);
                  decryptedMessage = "[Decryption failed]";
                }
              } else if (typeof decryptedMessage !== "string") {
                // ✅ Handle non-string, non-encrypted cases
                decryptedMessage = String(decryptedMessage || "");
              }

              return {
                ...msg,
                _id: msg._id || msg.msgId,
                msgId: msg.msgId || msg._id?.toString(),
                msgBody: {
                  ...msg.msgBody,
                  message: decryptedMessage,
                },
              };
            }),
          );

          // ✅ Filter out deleted messages
          const filteredMessages = decryptedMessages.filter((msg) => {
            if (!msg.deletedFor || !Array.isArray(msg.deletedFor)) {
              return true;
            }

            const currentUserId = currentUser?.id?.toString();
            return !msg.deletedFor.some(
              (userId) => userId?.toString() === currentUserId,
            );
          });

          setMessages((prev) => {
            const existingIds = new Set(
              prev.map((m) => m.msgId || m._id?.toString()),
            );
            const newMessages = filteredMessages.filter(
              (m) => !existingIds.has(m.msgId || m._id?.toString()),
            );

            return [...newMessages, ...prev];
          });

          setOldestMessageTimestamp(olderMessages[0].timestamp);
          setHasMoreOldMessages(hasMore);
        } else {
          setHasMoreOldMessages(false);
        }

        setIsLoadingOlder(false);
      });

      socketRef.current.on("load_newer_messages", async (data) => {
        const { messages: newerMessages, hasMore } = data;

        if (newerMessages && newerMessages.length > 0) {
          // ✅ PROPERLY decrypt messages
          const decryptedMessages = await Promise.all(
            newerMessages.map(async (msg) => {
              let decryptedMessage = msg.msgBody?.message;

              // ✅ Check if message needs decryption
              if (
                decryptedMessage &&
                typeof decryptedMessage === "object" &&
                decryptedMessage.cipherText
              ) {
                console.log("🔓 Decrypting newer message:", msg.msgId);
                try {
                  decryptedMessage = await decryptMessage(
                    decryptedMessage,
                    SECRET_KEY,
                  );
                } catch (err) {
                  console.error("❌ Failed to decrypt newer message:", err);
                  decryptedMessage = "[Decryption failed]";
                }
              } else if (typeof decryptedMessage !== "string") {
                // ✅ Handle non-string, non-encrypted cases
                decryptedMessage = String(decryptedMessage || "");
              }

              return {
                ...msg,
                _id: msg._id || msg.msgId,
                msgId: msg.msgId || msg._id?.toString(),
                msgBody: {
                  ...msg.msgBody,
                  message: decryptedMessage,
                },
              };
            }),
          );

          // ✅ Filter out deleted messages
          const filteredMessages = decryptedMessages.filter((msg) => {
            if (!msg.deletedFor || !Array.isArray(msg.deletedFor)) {
              return true;
            }

            const currentUserId = currentUser?.id?.toString();
            return !msg.deletedFor.some(
              (userId) => userId?.toString() === currentUserId,
            );
          });

          setMessages((prev) => {
            const existingIds = new Set(
              prev.map((m) => m.msgId || m._id?.toString()),
            );
            const newMessages = filteredMessages.filter(
              (m) => !existingIds.has(m.msgId || m._id?.toString()),
            );

            return [...prev, ...newMessages];
          });

          setNewestMessageTimestamp(
            newerMessages[newerMessages.length - 1].timestamp,
          );
          setHasMoreNewMessages(hasMore);
        } else {
          setHasMoreNewMessages(false);
        }

        setIsLoadingNewer(false);
      });

      socketRef.current.on(
        "chat_history",
        async ({ chatId, messages: chatMessages }) => {
          console.log(chatMessages, "chatmessages");
          if (window.currentLoadingTimeout) {
            clearTimeout(window.currentLoadingTimeout);
            window.currentLoadingTimeout = null;
          }
          setIsLoadingMessages(false);

          const formattedMessages = await Promise.all(
            chatMessages.map(async (msg) => {
              let decryptedMessage = msg.msgBody?.message;

              if (
                decryptedMessage &&
                typeof decryptedMessage === "object" &&
                decryptedMessage.cipherText
              ) {
                try {
                  decryptedMessage = await decryptMessage(
                    decryptedMessage,
                    SECRET_KEY,
                  );
                } catch (err) {
                  console.error("Failed to decrypt history message:", err);
                  decryptedMessage = "[Encrypted message]";
                }
              }

              if (typeof decryptedMessage !== "string") {
                decryptedMessage = String(decryptedMessage || "");
              }

              return {
                ...msg,
                _id: msg._id || msg.msgId,
                msgId: msg.msgId || msg._id?.toString(),
                msgBody: {
                  ...msg.msgBody,
                  message: decryptedMessage,
                },
              };
            }),
          );

          // ✅ ADD THIS: Filter out messages deleted for current user
          const filteredMessages = formattedMessages.filter((msg) => {
            if (msg.deletedFor && Array.isArray(msg.deletedFor)) {
              const currentUserId = currentUser?.id?.toString();
              const isDeletedForMe = msg.deletedFor.some(
                (userId) => userId?.toString() === currentUserId,
              );
              return !isDeletedForMe; // ✅ Exclude if deleted for me
            }
            return true; // ✅ Include if not deleted
          });

          setMessages(filteredMessages); // ✅ Set filtered messages
          console.log(messages, "messages123");
          setIsLoadingMessages(false); // ✅ ADD THIS
          setIsInitialMessagesLoad(false);
          console.log(filteredMessages, "filteredMessages");

          if (filteredMessages.length > 0) {
            setOldestMessageTimestamp(filteredMessages[0].timestamp);
            setNewestMessageTimestamp(
              filteredMessages[filteredMessages.length - 1].timestamp,
            );
            setHasMoreOldMessages(filteredMessages.length >= 50);
            setHasMoreNewMessages(false);
          } else {
            setHasMoreOldMessages(false);
            setHasMoreNewMessages(false);
          }
        },
      );

      socketRef.current.on("message:read:update", (data) => {
        console.log("📖 Read receipt update:", data);
        const { msgId, readBy } = data;

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.msgId === msgId || msg._id?.toString() === msgId) {
              return {
                ...msg,
                metaData: {
                  ...msg.metaData,
                  readBy: readBy || [],
                  isRead: readBy && readBy.length > 0,
                },
              };
            }
            return msg;
          }),
        );
      });

      socketRef.current.on("delete_for_everyone", ({ msgId, userId }) => {
        // console.log("📩 Received message_deleted_for_everyone:", { msgId, userId });

        // Only update if it's from another user (not yourself - you already updated optimistically)
        if (userId !== currentUser.id) {
          setMessages((prev) =>
            prev.map((msg) => {
              const messageId = msg.msgId || msg._id?.toString() || msg.id;
              if (messageId === msgId) {
                // console.log("✅ Marking as deleted for everyone:", messageId);
                return {
                  ...msg, // Preserve ALL fields including timestamp
                  deletedForEveryone: true,
                  msgBody: {
                    ...msg.msgBody,
                    message: "This message was deleted",
                  },
                };
              }
              return msg;
            }),
          );
        }
      });

      socketRef.current.on("delete_error", ({ error, msgId }) => {
        // console.error("❌ Delete error:", error, msgId);
        // alert(`Failed to delete message: ${error}`);
        setIsDeletingMessage(false);
      });

      // socketRef.current.on('send_message', async (data) => {
      //     // console.log("send_messageinitiated")

      //     // const messageIdentifier = `${data.chatId}_${data.senderId}_${data.timestamp}`;
      //     const messageIdentifier = data._id?.toString() || data.msgId;

      //     // console.log(data, messageIdentifier, "messageindefntinfer")

      //     if (processedMessagesRef.current.has(messageIdentifier)) {
      //         return;
      //     }

      //     processedMessagesRef.current.add(messageIdentifier);

      //     if (data.msgBody?.message) {
      //         try {
      //             data.msgBody.message = await decryptMessage(
      //                 data.msgBody.message,
      //                 SECRET_KEY
      //             );
      //         } catch (err) {
      //             console.error(" Failed to decrypt message:", err);
      //         }
      //     }

      //     const isMyMessage = data.fromUserId === currentUser.id || data.senderId === currentUser.id;

      //     if (isMyMessage) {
      //         setMessages(prev => {
      //             const tempIndex = prev.findIndex(msg => {
      //                 if (!msg.msgId?.startsWith('temp_')) return false;

      //                 if (msg.correlationId && data.correlationId &&
      //                     msg.correlationId === data.correlationId) {
      //                     return true;
      //                 }

      //                 if (msg.msgBody?.message === data.msgBody?.message &&
      //                     Math.abs(msg.timestamp - data.timestamp) < 5000) {
      //                     return true;
      //                 }

      //                 if (data.tempId && msg.msgId === data.tempId) {
      //                     return true;
      //                 }

      //                 return false;
      //             });

      //             if (tempIndex !== -1) {
      //                 const updatedMessages = [...prev];
      //                 updatedMessages[tempIndex] = {
      //                     ...data,
      //                     _id: data._id,  // ✅ PRESERVE _id FROM SERVER
      //                     msgId: data._id?.toString() || data.msgId,
      //                     rowId: data._id?.toString() || data.rowId,
      //                     msgStatus: data.msgStatus || "sent",
      //                     metaData: {
      //                         ...data.metaData,
      //                         isSent: true,
      //                         sentAt: data.timestamp
      //                     }
      //                 };
      //                 return updatedMessages;
      //             }

      //             const exists = prev.some(msg =>
      //                 msg.msgId === data._id?.toString()
      //             );

      //             if (exists) return prev;

      //             return [...prev, createMessageObject(data)];
      //         });

      //         updateGroupLastMessage(data);
      //         return;
      //     }

      //     // Message from others
      //     const newMessage = createMessageObject(data);

      //     if (selectedGroup && data.chatId === selectedGroup.chatId) {
      //         setMessages(prev => {
      //             const isDuplicate = prev.some(msg =>
      //                 msg.msgId === data._id?.toString() ||
      //                 msg._id?.toString() === data._id?.toString()
      //             );

      //             if (isDuplicate) {
      //                 return prev;
      //             }

      //             return [...prev, newMessage];
      //         });

      //         if (socketRef.current?.connected) {
      //             socketRef.current.emit('message_read', {
      //                 chatId: data.chatId,
      //                 messageId: data._id,
      //                 userId: currentUser.id
      //             });
      //         }
      //     } else {
      //         showNotification(data);
      //     }

      //     updateGroupLastMessage(data);
      // });

      // socketRef.current.on("update_message_status", (msgUpdate) => {
      //     console.log("💬 Message status update received:", msgUpdate);
      //     const { msgId, chatId, metaData, msgStatus } = msgUpdate;

      //     setMessages(prev =>
      //         prev.map(msg => {
      //             // Match by msgId or fallback to _id
      //             if (msg.msgId === msgId || msg._id?.toString() === msgId) {
      //                 return {
      //                     ...msg,
      //                     metaData: { ...msg.metaData, ...metaData },
      //                     msgStatus: msgStatus
      //                 };
      //             }
      //             return msg;
      //         })
      //     );
      // });

      // socketRef.current.on('send_message', async (data) => {
      //     console.log("📩 Received send_message event:", data);

      //     // Create unique identifier
      //     const messageIdentifier = data._id?.toString() || data.msgId;

      //     // Prevent duplicate processing
      //     if (processedMessagesRef.current.has(messageIdentifier)) {
      //         console.log("⚠️ Duplicate message ignored:", messageIdentifier);
      //         return;
      //     }

      //     processedMessagesRef.current.add(messageIdentifier);

      //     // Decrypt message if encrypted
      //     if (data.msgBody?.message) {
      //         try {
      //             data.msgBody.message = await decryptMessage(
      //                 data.msgBody.message,
      //                 SECRET_KEY
      //             );
      //         } catch (err) {
      //             console.error("❌ Failed to decrypt message:", err);
      //         }
      //     }

      //     const isMyMessage = data.fromUserId === currentUser.id || data.senderId === currentUser.id;

      //     if (isMyMessage) {
      //         // ✅ MY MESSAGE - Replace temp message with server message
      //         console.log("✅ My message received from server");

      //         setMessages(prev => {
      //             // Find temp message
      //             const tempIndex = prev.findIndex(msg => {
      //                 if (!msg.msgId?.startsWith('temp_')) return false;

      //                 // Match by correlationId (most reliable)
      //                 if (msg.correlationId && data.correlationId &&
      //                     msg.correlationId === data.correlationId) {
      //                     return true;
      //                 }

      //                 // Match by content and timestamp
      //                 if (msg.msgBody?.message === data.msgBody?.message &&
      //                     Math.abs(msg.timestamp - data.timestamp) < 5000) {
      //                     return true;
      //                 }

      //                 // Match by tempId
      //                 if (data.tempId && msg.msgId === data.tempId) {
      //                     return true;
      //                 }

      //                 return false;
      //             });

      //             if (tempIndex !== -1) {
      //                 // Replace temp message
      //                 console.log("🔄 Replacing temp message at index:", tempIndex);
      //                 const updatedMessages = [...prev];
      //                 updatedMessages[tempIndex] = {
      //                     ...data,
      //                     _id: data._id,
      //                     msgId: data._id?.toString() || data.msgId,
      //                     rowId: data._id?.toString() || data.rowId,
      //                     msgStatus: data.msgStatus || "sent",
      //                     metaData: {
      //                         ...data.metaData,
      //                         isSent: true,
      //                         sentAt: data.timestamp
      //                     }
      //                 };
      //                 return updatedMessages;
      //             }

      //             // Check if already exists (duplicate prevention)
      //             const exists = prev.some(msg =>
      //                 msg.msgId === data._id?.toString() ||
      //                 msg._id?.toString() === data._id?.toString()
      //             );

      //             if (exists) {
      //                 console.log("⚠️ Message already exists, skipping");
      //                 return prev;
      //             }

      //             // Add new message (shouldn't happen normally)
      //             console.log("➕ Adding message as new");
      //             return [...prev, createMessageObject(data)];
      //         });

      //         updateGroupLastMessage(data);
      //         return;
      //     }

      //     // ✅ OTHER USER'S MESSAGE - Add immediately for instant UI update
      //     console.log("📨 Message from other user:", data.publisherName);

      //     const newMessage = createMessageObject(data);

      //     // Check if in current chat
      //     if (selectedGroup && data.chatId === selectedGroup.chatId) {
      //         // ✅ INSTANT UI UPDATE - Add message immediately
      //         setMessages(prev => {
      //             // Prevent duplicates
      //             const isDuplicate = prev.some(msg =>
      //                 msg.msgId === data._id?.toString() ||
      //                 msg._id?.toString() === data._id?.toString()
      //             );

      //             if (isDuplicate) {
      //                 console.log("⚠️ Duplicate message from other user, skipping");
      //                 return prev;
      //             }

      //             console.log("✅ Adding message to UI immediately");
      //             return [...prev, newMessage];
      //         });

      //         // Mark as read
      //         if (socketRef.current?.connected) {
      //             socketRef.current.emit('message_read', {
      //                 chatId: data.chatId,
      //                 messageId: data._id,
      //                 userId: currentUser.id
      //             });
      //         }
      //     } else {
      //         // Message from other chat - show notification
      //         console.log("🔔 Message from other chat, showing notification");
      //         showNotification(data);
      //     }

      //     // Update group last message in sidebar
      //     updateGroupLastMessage(data);
      // });

      // ✅ REPLACE YOUR send_message SOCKET HANDLER (around line 420)

      // socketRef.current.on('send_message', async (data) => {
      //     console.log("📩 Received send_message:", data.msgId);

      //     // ✅ Create unique identifier
      //     const messageIdentifier = data._id?.toString() || data.msgId;

      //     // ✅ Prevent duplicate processing
      //     if (processedMessagesRef.current.has(messageIdentifier)) {
      //         console.log("⚠️ Duplicate message ignored:", messageIdentifier);
      //         return;
      //     }

      //     processedMessagesRef.current.add(messageIdentifier);

      //     // ✅ Decrypt message
      //     if (data.msgBody?.message) {
      //         try {
      //             data.msgBody.message = await decryptMessage(
      //                 data.msgBody.message,
      //                 SECRET_KEY
      //             );
      //         } catch (err) {
      //             console.error("❌ Failed to decrypt:", err);
      //         }
      //     }

      //     const isMyMessage = data.fromUserId === currentUser.id;

      //     if (isMyMessage) {
      //         // ✅ MY MESSAGE - Replace temp with real
      //         console.log("✅ My message confirmed by server");

      //         setMessages(prev => {
      //             // Find temp message by correlationId
      //             const tempIndex = prev.findIndex(msg =>
      //                 msg.correlationId &&
      //                 data.correlationId &&
      //                 msg.correlationId === data.correlationId
      //             );

      //             if (tempIndex !== -1) {
      //                 // Replace temp with server message
      //                 const updatedMessages = [...prev];
      //                 updatedMessages[tempIndex] = {
      //                     ...data,
      //                     _id: data._id,
      //                     msgId: data._id?.toString() || data.msgId,
      //                     msgStatus: "sent",
      //                     metaData: {
      //                         ...data.metaData,
      //                         isSent: true,
      //                         sentAt: data.timestamp
      //                     }
      //                 };
      //                 return updatedMessages;
      //             }

      //             // If temp not found, check if message already exists
      //             const exists = prev.some(msg =>
      //                 msg.msgId === data._id?.toString() ||
      //                 msg._id?.toString() === data._id?.toString()
      //             );

      //             if (exists) return prev;

      //             // Add as new message
      //             return [...prev, createMessageObject(data)];
      //         });

      //     } else {
      //         // ✅ OTHER USER'S MESSAGE - Add immediately
      //         console.log("📨 Message from:", data.publisherName);

      //         setMessages(prev => {
      //             // Check if already exists
      //             const exists = prev.some(msg =>
      //                 msg.msgId === data._id?.toString() ||
      //                 msg._id?.toString() === data._id?.toString()
      //             );

      //             if (exists) {
      //                 console.log("⚠️ Message already exists");
      //                 return prev;
      //             }

      //             // Add new message
      //             return [...prev, createMessageObject(data)];
      //         });

      //         // Mark as read if in current chat
      //         if (selectedGroup && data.chatId === selectedGroup.chatId) {
      //             if (socketRef.current?.connected) {
      //                 socketRef.current.emit('message_read', {
      //                     chatId: data.chatId,
      //                     messageId: data._id,
      //                     userId: currentUser.id
      //                 });
      //             }
      //         } else {
      //             // Show notification if from different chat
      //             showNotification(data);
      //         }
      //     }

      //     // Update group last message
      //     updateGroupLastMessage(data);
      // });

      // socketRef.current.on('send_message', async (data) => {
      //     console.log("📩 Received send_message:", {
      //         msgId: data.msgId,
      //         _id: data._id,
      //         from: data.publisherName,
      //         correlationId: data.correlationId
      //     });

      //     // ✅ STEP 1: Create CONSISTENT identifier
      //     const messageId = data._id?.toString() || data.msgId;

      //     if (!messageId) {
      //         console.error("❌ Message has no ID:", data);
      //         return;
      //     }

      //     // ✅ STEP 2: Check if we've already processed this EXACT message
      //     if (processedMessagesRef.current.has(messageId)) {
      //         console.log("⚠️ DUPLICATE - Already processed:", messageId);
      //         return;
      //     }

      //     // ✅ STEP 3: Decrypt message (if encrypted)
      //     let decryptedMessage = data.msgBody?.message;
      //     if (decryptedMessage) {
      //         try {
      //             decryptedMessage = await decryptMessage(decryptedMessage, SECRET_KEY);
      //         } catch (err) {
      //             console.error("❌ Decryption failed:", err);
      //         }
      //     }

      //     // ✅ STEP 4: Check if this is MY message or someone else's
      //     const isMyMessage =
      //         data.fromUserId === currentUser.id ||
      //         data.senderId === currentUser.id;

      //     console.log(isMyMessage ? "✅ My message" : "📨 Other user's message");

      //     // ✅ STEP 5: Handle based on sender
      //     if (isMyMessage) {
      //         // ═══════════════════════════════════════
      //         // MY MESSAGE - Replace temp with real
      //         // ═══════════════════════════════════════

      //         setMessages(prev => {
      //             // Try to find temp message by correlationId
      //             const tempIndex = prev.findIndex(msg =>
      //                 msg.correlationId &&
      //                 data.correlationId &&
      //                 msg.correlationId === data.correlationId &&
      //                 msg.msgId?.startsWith('temp_')
      //             );

      //             if (tempIndex !== -1) {
      //                 console.log("🔄 Replacing temp message at index:", tempIndex);

      //                 // Mark as processed BEFORE updating
      //                 processedMessagesRef.current.add(messageId);

      //                 // Replace temp with server message
      //                 const updated = [...prev];
      //                 updated[tempIndex] = {
      //                     ...data,
      //                     _id: data._id,
      //                     msgId: messageId,
      //                     msgBody: {
      //                         ...data.msgBody,
      //                         message: decryptedMessage
      //                     },
      //                     msgStatus: "sent",
      //                     metaData: {
      //                         ...data.metaData,
      //                         isSent: true,
      //                         sentAt: data.timestamp
      //                     }
      //                 };
      //                 return updated;
      //             }

      //             // If no temp found, check if already exists by ID
      //             const alreadyExists = prev.some(msg => {
      //                 const existingId = msg._id?.toString() || msg.msgId;
      //                 return existingId === messageId;
      //             });

      //             if (alreadyExists) {
      //                 console.log("⚠️ Message already exists (no temp found):", messageId);
      //                 processedMessagesRef.current.add(messageId);
      //                 return prev;
      //             }

      //             // No temp, doesn't exist - add as new
      //             console.log("➕ Adding my message as new");
      //             processedMessagesRef.current.add(messageId);

      //             return [...prev, {
      //                 ...data,
      //                 _id: data._id,
      //                 msgId: messageId,
      //                 msgBody: {
      //                     ...data.msgBody,
      //                     message: decryptedMessage
      //                 }
      //             }];
      //         });

      //     } else {
      //         // ═══════════════════════════════════════
      //         // OTHER USER'S MESSAGE - Add if new
      //         // ═══════════════════════════════════════

      //         setMessages(prev => {
      //             // ✅ CRITICAL: Check if message already exists
      //             const alreadyExists = prev.some(msg => {
      //                 const existingId = msg._id?.toString() || msg.msgId;
      //                 return existingId === messageId;
      //             });

      //             if (alreadyExists) {
      //                 console.log("⚠️ Other user's message already exists:", messageId);
      //                 processedMessagesRef.current.add(messageId);
      //                 return prev; // ✅ DON'T ADD - already have it
      //             }

      //             // ✅ New message - add it
      //             console.log("✅ Adding new message from other user");
      //             processedMessagesRef.current.add(messageId);

      //             return [...prev, {
      //                 ...data,
      //                 _id: data._id,
      //                 msgId: messageId,
      //                 msgBody: {
      //                     ...data.msgBody,
      //                     message: decryptedMessage
      //                 }
      //             }];
      //         });

      //         // ✅ Mark as read if in current chat
      //         if (selectedGroup && data.chatId === selectedGroup.chatId) {
      //             if (socketRef.current?.connected) {
      //                 setTimeout(() => {
      //                     socketRef.current.emit('message_read', {
      //                         chatId: data.chatId,
      //                         messageId: data._id,
      //                         userId: currentUser.id
      //                     });
      //                 }, 500);
      //             }
      //         } else {
      //             // Show notification if from different chat
      //             showNotification(data);
      //         }
      //     }

      //     // ✅ Update group last message in sidebar
      //     updateGroupLastMessage(data);
      // });

      // ✅ REPLACE your send_message handler with proper decryption

      // socketRef.current.on('send_message', async (data) => {
      //     console.log("📩 Received send_message:", {
      //         msgId: data.msgId,
      //         _id: data._id,
      //         from: data.publisherName,
      //         messageType: typeof data.msgBody?.message
      //     });

      //     // ✅ STEP 1: Create CONSISTENT identifier
      //     const messageId = data._id?.toString() || data.msgId;

      //     if (!messageId) {
      //         console.error("❌ Message has no ID:", data);
      //         return;
      //     }

      //     // ✅ STEP 2: Check duplicates
      //     if (processedMessagesRef.current.has(messageId)) {
      //         console.log("⚠️ DUPLICATE - Already processed:", messageId);
      //         return;
      //     }

      //     // ✅ STEP 3: CRITICAL - Always decrypt and validate
      //     let decryptedMessage = data.msgBody?.message;

      //     if (decryptedMessage) {
      //         // Check if it's an encrypted object (not already decrypted)
      //         if (typeof decryptedMessage === 'object' && decryptedMessage.cipherText) {
      //             console.log("🔓 Decrypting encrypted object");
      //             try {
      //                 decryptedMessage = await decryptMessage(decryptedMessage, SECRET_KEY);
      //                 console.log("✅ Decrypted successfully");
      //             } catch (err) {
      //                 console.error("❌ Decryption failed:", err);
      //                 decryptedMessage = "[Encrypted message - decryption failed]";
      //             }
      //         } else if (typeof decryptedMessage === 'string') {
      //             console.log("✅ Already decrypted string");
      //             // Already a string, no action needed
      //         } else {
      //             console.error("⚠️ Unknown message format:", typeof decryptedMessage);
      //             decryptedMessage = "[Invalid message format]";
      //         }
      //     }

      //     // ✅ STEP 4: Validate decrypted message is a string
      //     if (typeof decryptedMessage !== 'string') {
      //         console.error("❌ Decrypted message is not a string:", decryptedMessage);
      //         decryptedMessage = JSON.stringify(decryptedMessage); // Fallback
      //     }

      //     const isMyMessage =
      //         data.fromUserId === currentUser.id ||
      //         data.senderId === currentUser.id;

      //     console.log(isMyMessage ? "✅ My message" : "📨 Other user's message");

      //     if (isMyMessage) {
      //         // MY MESSAGE - Replace temp with real
      //         setMessages(prev => {
      //             const tempIndex = prev.findIndex(msg =>
      //                 msg.correlationId &&
      //                 data.correlationId &&
      //                 msg.correlationId === data.correlationId &&
      //                 msg.msgId?.startsWith('temp_')
      //             );

      //             if (tempIndex !== -1) {
      //                 console.log("🔄 Replacing temp message");
      //                 processedMessagesRef.current.add(messageId);

      //                 const updated = [...prev];
      //                 updated[tempIndex] = {
      //                     ...data,
      //                     _id: data._id,
      //                     msgId: messageId,
      //                     msgBody: {
      //                         ...data.msgBody,
      //                         message: decryptedMessage  // ✅ Always a string now
      //                     },
      //                     msgStatus: "sent",
      //                     metaData: {
      //                         ...data.metaData,
      //                         isSent: true,
      //                         sentAt: data.timestamp
      //                     }
      //                 };
      //                 return updated;
      //             }

      //             const alreadyExists = prev.some(msg => {
      //                 const existingId = msg._id?.toString() || msg.msgId;
      //                 return existingId === messageId;
      //             });

      //             if (alreadyExists) {
      //                 processedMessagesRef.current.add(messageId);
      //                 return prev;
      //             }

      //             processedMessagesRef.current.add(messageId);
      //             return [...prev, {
      //                 ...data,
      //                 _id: data._id,
      //                 msgId: messageId,
      //                 msgBody: {
      //                     ...data.msgBody,
      //                     message: decryptedMessage  // ✅ Always a string
      //                 }
      //             }];
      //         });

      //     } else {
      //         // OTHER USER'S MESSAGE
      //         setMessages(prev => {
      //             const alreadyExists = prev.some(msg => {
      //                 const existingId = msg._id?.toString() || msg.msgId;
      //                 return existingId === messageId;
      //             });

      //             if (alreadyExists) {
      //                 processedMessagesRef.current.add(messageId);
      //                 return prev;
      //             }

      //             console.log("✅ Adding new message with decrypted text");
      //             processedMessagesRef.current.add(messageId);

      //             return [...prev, {
      //                 ...data,
      //                 _id: data._id,
      //                 msgId: messageId,
      //                 msgBody: {
      //                     ...data.msgBody,
      //                     message: decryptedMessage  // ✅ Always a string
      //                 }
      //             }];
      //         });

      //         if (selectedGroup && data.chatId === selectedGroup.chatId) {
      //             if (socketRef.current?.connected) {
      //                 setTimeout(() => {
      //                     socketRef.current.emit('message_read', {
      //                         chatId: data.chatId,
      //                         messageId: data._id,
      //                         userId: currentUser.id
      //                     });
      //                 }, 500);
      //             }
      //         } else {
      //             showNotification(data);
      //         }
      //     }

      //     updateGroupLastMessage(data);
      // });

      socketRef.current.on("send_message", async (data) => {
        console.log("calledsendmessagemitted");

        const messageId = data._id?.toString() || data.msgId;

        if (!messageId || processedMessagesRef.current.has(messageId)) {
          return;
        }

        // Decrypt message
        let decryptedMessage = data.msgBody?.message;
        if (
          decryptedMessage &&
          typeof decryptedMessage === "object" &&
          decryptedMessage.cipherText
        ) {
          try {
            decryptedMessage = await decryptMessage(
              decryptedMessage,
              SECRET_KEY,
            );
          } catch (err) {
            console.error("❌ Decryption failed:", err);
            decryptedMessage = "[Decryption failed]";
          }
        } else if (typeof decryptedMessage !== "string") {
          decryptedMessage = String(decryptedMessage || "");
        }

        const messageObject = {
          ...data,
          _id: data._id,
          msgId: messageId,
          msgBody: {
            ...data.msgBody,
            message: decryptedMessage,
          },
        };

        const isMyMessage = data.fromUserId === currentUser.id;

        if (isMyMessage) {
          // ✅ Replace temp message with real message from backend
          setMessages((prev) => {
            const tempIndex = prev.findIndex(
              (msg) =>
                msg.correlationId &&
                data.correlationId &&
                msg.correlationId === data.correlationId &&
                msg.msgId?.startsWith("temp_"),
            );

            if (tempIndex !== -1) {
              console.log("✅ Replacing temp with real message");
              processedMessagesRef.current.add(messageId);

              const updated = [...prev];
              updated[tempIndex] = {
                ...messageObject,
                msgStatus: "sent",
                status: "sent",
                metaData: {
                  ...messageObject.metaData,
                  isSent: true, // ✅ Keep double tick
                  sentAt: data.timestamp,
                  isDelivered: false, // Ready for delivery update
                },
              };
              return updated;
            }

            // If temp not found, check if already exists
            const alreadyExists = prev.some((msg) => {
              const existingId = msg._id?.toString() || msg.msgId;
              return existingId === messageId;
            });

            if (alreadyExists) {
              processedMessagesRef.current.add(messageId);
              return prev;
            }

            // Add as new
            processedMessagesRef.current.add(messageId);
            return [...prev, messageObject];
          });
        } else {
          // Other user's message
          setMessages((prev) => {
            const alreadyExists = prev.some((msg) => {
              const existingId = msg._id?.toString() || msg.msgId;
              return existingId === messageId;
            });

            if (alreadyExists) {
              processedMessagesRef.current.add(messageId);
              return prev;
            }

            processedMessagesRef.current.add(messageId);
            return [...prev, messageObject];
          });
        }

        updateGroupLastMessage(messageObject);
      });

      // ✅ ADD NEW HANDLER: Confirmation after DB save
      socketRef.current.on(
        "message_saved_confirmation",
        ({ tempId, correlationId, _id, msgId }) => {
          console.log("✅ Message saved to DB:", msgId);

          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.correlationId === correlationId || msg.msgId === tempId) {
                return {
                  ...msg,
                  _id: _id,
                  msgId: msgId,
                  dbSaved: true,
                };
              }
              return msg;
            }),
          );
        },
      );

      // Add this in your socket connection setup
      // socketRef.current.on("file_upload_success", ({ tempId, correlationId, messageId, fileUrl }) => {
      //     console.log("✅ File upload confirmed:", messageId);

      //     // Update temp message with success status
      //     setMessages(prev => prev.map(msg => {
      //         if (msg.msgId === tempId || msg.correlationId === correlationId) {
      //             return {
      //                 ...msg,
      //                 msgId: messageId,
      //                 _id: messageId,
      //                 status: "sent",
      //                 msgStatus: "sent",
      //                 msgBody: {
      //                     ...msg.msgBody,
      //                     media: {
      //                         ...msg.msgBody.media,
      //                         is_uploading: false,
      //                         file_url: fileUrl
      //                     }
      //                 }
      //             };
      //         }
      //         return msg;
      //     }));
      // });
      // ✅ KEEP your existing error handler
      // socketRef.current.on("send_message_error", ({ error, tempId, correlationId, msgId }) => {

      //     console.log("calledsendmessamittederror")

      //     // Update the specific message with error state
      //     setMessages(prev => prev.map(msg => {
      //         const matchesTemp = msg.msgId === tempId || msg.correlationId === correlationId;
      //         const matchesId = msg.msgId === msgId || msg._id?.toString() === msgId;

      //         if (matchesTemp || matchesId) {
      //             return {
      //                 ...msg,
      //                 status: "failed",
      //                 msgStatus: "failed",
      //                 error: error // ✅ Store the error message
      //             };
      //         }
      //         return msg;
      //     }));
      // });

      socketRef.current.on(
        "send_message_error",
        ({ error, tempId, correlationId, msgId }) => {
          console.log("❌ Message send error received:", error);

          // Check if it's a rate limit error
          const isRateLimitError =
            error?.toLowerCase().includes("rate limit") ||
            error?.toLowerCase().includes("too many") ||
            error?.toLowerCase().includes("slow down") ||
            error?.toLowerCase().includes("wait");

          if (isRateLimitError) {
            console.log("🚫 Rate limit detected - disabling input");

            // ✅ REMOVE the message from UI immediately
            setMessages((prev) =>
              prev.filter((msg) => {
                const matchesTemp =
                  msg.msgId === tempId || msg.correlationId === correlationId;
                const matchesId =
                  msg.msgId === msgId || msg._id?.toString() === msgId;
                return !(matchesTemp || matchesId); // Remove if it matches
              }),
            );

            // Disable input
            setIsInputDisabled(true);

            // Clear any existing timer
            if (rateLimitResetTimer.current) {
              clearTimeout(rateLimitResetTimer.current);
            }

            // Re-enable after 1 minute (60000ms)
            rateLimitResetTimer.current = setTimeout(() => {
              console.log("✅ Rate limit timer expired - re-enabling input");
              setIsInputDisabled(false);
            }, 60000);

            // Show user-friendly error message
            //             const warningDiv = document.createElement('div');
            //             warningDiv.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] font-semibold';
            //             warningDiv.innerHTML = `
            //     <div class="flex items-center gap-2">
            //         <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            //             <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            //         </svg>
            //         <span>Slow down! Wait 60 seconds before sending more messages.</span>
            //     </div>
            // `;
            //             document.body.appendChild(warningDiv);

            setTimeout(() => {
              warningDiv.remove();
            }, 5000);

            return; // ✅ EXIT - Don't process as failed message
          }

          // ✅ For non-rate-limit errors, mark as failed
          setMessages((prev) =>
            prev.map((msg) => {
              const matchesTemp =
                msg.msgId === tempId || msg.correlationId === correlationId;
              const matchesId =
                msg.msgId === msgId || msg._id?.toString() === msgId;

              if (matchesTemp || matchesId) {
                return {
                  ...msg,
                  status: "failed",
                  msgStatus: "failed",
                  error: error,
                };
              }
              return msg;
            }),
          );
        },
      );
      // ✅ STEP 3: Real-time status updates from backend (delivered/read)

      socketRef.current.on("update_message_status", (msgUpdate) => {
        console.log("💬 Status update from backend:", msgUpdate);
        const { msgId, metaData, msgStatus } = msgUpdate;

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.msgId === msgId || msg._id?.toString() === msgId) {
              return {
                ...msg,
                metaData: { ...msg.metaData, ...metaData },
                msgStatus: msgStatus,
              };
            }
            return msg;
          }),
        );
      });
    } catch (err) {
      console.error("Socket.IO connection error:", err);
      setSocketConnected(false);
    }
  };

  console.log(messages, "Allmessages");
  console.log(
    socketInitialized,
    currentUser.id,
    isLoadingGroups,
    "informations",
  );

  const sendImageMessage = async () => {
    if (selectedImages.length === 0 || !selectedGroup || !currentUser.id)
      return;

    const timestamp = Date.now();

    // Send each image separately (WhatsApp style)
    for (let i = 0; i < selectedImages.length; i++) {
      const imageObj = selectedImages[i];
      const tempId = `temp_img_${timestamp}_${i}_${Math.random().toString(36).substr(2, 9)}`;
      const correlationId = `${currentUser.id}_img_${timestamp}_${i}_${Math.random().toString(36).substr(2, 9)}`;

      // Sanitize caption
      const sanitizedCaption = imageCaption.trim()
        ? sanitizeMessage(imageCaption.trim())
        : "";

      // Create temp message
      const messageData = {
        rowId: tempId,
        msgId: tempId,
        correlationId,
        chatId: selectedGroup.chatId,
        chatType: "groupChat",
        messageType: "image",
        senderId: currentUser.id,
        fromUserId: currentUser.id,
        publisherName: currentUser.name,
        senderName: currentUser.name,
        receiverId: "",
        msgBody: {
          message: sanitizedCaption,
          originalText: sanitizedCaption,
          message_type: "image",
          media: {
            fileName: imageObj.name,
            file_type: imageObj.file.type,
            file_size: imageObj.size,
            file_url: imageObj.preview, // ✅ Show preview immediately
            tempPreview: imageObj.preview,
            file_key: "",
            duration: "",
            caption: sanitizedCaption,
            thumb_image: imageObj.preview,
            local_path: "",
            is_uploading: true, // ✅ Show loading overlay
            is_downloaded: false,
            isLargeFile: imageObj.size > 25 * 1024 * 1024,
          },
          UserName: currentUser.name,
        },
        msgStatus: "pending",
        timestamp,
        createdAt: new Date(),
        deleteStatus: 0,
        status: "pending",
        favouriteStatus: 0,
        editedStatus: 0,
        editMessageId: "",
        metaData: {
          isSent: false,
          sentAt: null,
          isDelivered: false,
          deliveredAt: null,
          isRead: false,
          readAt: null,
        },
        replyTo: replyToMessage
          ? {
              msgId: replyToMessage.msgId || replyToMessage.id,
              message: replyToMessage.msgBody?.message,
              senderName:
                replyToMessage.publisherName || replyToMessage.senderName,
              senderId: replyToMessage.fromUserId,
            }
          : null,
      };

      // ✅ INSTANT UI UPDATE - Show image immediately
      setMessages((prev) => [...prev, messageData]);

      try {
        // Convert file to ArrayBuffer
        const buffer = await imageObj.file.arrayBuffer();

        if (socketRef.current?.connected) {
          console.log("📤 Sending image:", imageObj.name);

          // Send via socket
          socketRef.current.emit("send_file", {
            fileBuffer: buffer,
            fileName: imageObj.name,
            fileType: imageObj.file.type,
            caption: sanitizedCaption,
            messageData,
          });
        } else {
          throw new Error("Socket not connected");
        }
      } catch (error) {
        console.error("Image send error:", error);

        // Show error state
        setMessages((prev) =>
          prev.map((msg) =>
            msg.msgId === tempId
              ? {
                  ...msg,
                  status: "failed",
                  msgStatus: "failed",
                  msgBody: {
                    ...msg.msgBody,
                    media: {
                      ...msg.msgBody.media,
                      is_uploading: false,
                    },
                  },
                  error: error.message,
                }
              : msg,
          ),
        );
      }
    }

    // Close preview and cleanup
    cancelImageUpload();
    setReplyToMessage(null);
  };

  // ============================================
  // SEND DOCUMENT MESSAGE
  // ============================================

  const sendDocumentMessage = async () => {
    if (!selectedDocument || !selectedGroup || !currentUser.id) return;

    const tempId = `temp_doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const correlationId = `${currentUser.id}_doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Sanitize caption
    const sanitizedCaption = documentCaption.trim()
      ? sanitizeMessage(documentCaption.trim())
      : "";

    // Create temp message
    const messageData = {
      rowId: tempId,
      msgId: tempId,
      _id: tempId,
      correlationId,
      chatId: selectedGroup.chatId,
      chatType: "groupChat",
      messageType: "document",
      senderId: currentUser.id,
      fromUserId: currentUser.id,
      publisherName: currentUser.name,
      senderName: currentUser.name,
      receiverId: "",
      msgBody: {
        message: selectedDocument.name,
        originalText: selectedDocument.name,
        message_type: "document",
        media: {
          fileName: selectedDocument.name,
          file_type: selectedDocument.type,
          file_size: selectedDocument.size,
          file_url: "",
          file_key: "",
          duration: "",
          caption: sanitizedCaption,
          thumb_image: "",
          local_path: "",
          is_uploading: true,
          is_downloaded: false,
          isLargeFile: selectedDocument.size > 25 * 1024 * 1024,
          fileIcon: selectedDocument.icon,
        },
        UserName: currentUser.name,
      },
      msgStatus: "pending",
      timestamp: Date.now(),
      createdAt: new Date(),
      deleteStatus: 0,
      status: "pending",
      favouriteStatus: 0,
      editedStatus: 0,
      editMessageId: "",
      metaData: {
        isSent: false,
        sentAt: null,
        isDelivered: false,
        deliveredAt: null,
        isRead: false,
        readAt: null,
      },
      replyTo: replyToMessage
        ? {
            msgId: replyToMessage.msgId || replyToMessage.id,
            message: replyToMessage.msgBody?.message,
            senderName:
              replyToMessage.publisherName || replyToMessage.senderName,
            senderId: replyToMessage.fromUserId,
          }
        : null,
    };

    // ✅ INSTANT UI UPDATE
    setMessages((prev) => [...prev, messageData]);

    // Close preview
    cancelDocumentUpload();

    try {
      const buffer = await selectedDocument.file.arrayBuffer();

      if (socketRef.current?.connected) {
        console.log("📤 Sending document:", selectedDocument.name);

        socketRef.current.emit("send_file", {
          fileBuffer: buffer,
          fileName: selectedDocument.name,
          fileType: selectedDocument.type,
          caption: sanitizedCaption,
          messageData,
        });
      } else {
        throw new Error("Socket not connected");
      }
    } catch (error) {
      console.error("❌ Document send error:", error);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.msgId === tempId
            ? {
                ...msg,
                status: "failed",
                msgStatus: "failed",
                msgBody: {
                  ...msg.msgBody,
                  media: {
                    ...msg.msgBody.media,
                    is_uploading: false,
                  },
                },
                error: error.message,
              }
            : msg,
        ),
      );
    }

    setReplyToMessage(null);
  };

  const cancelImageUpload = () => {
    // Revoke preview URLs to free memory
    selectedImages.forEach((img) => {
      URL.revokeObjectURL(img.preview);
    });

    setSelectedImages([]);
    setShowImagePreview(false);
    setImageCaption("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const cancelDocumentUpload = () => {
    setSelectedDocument(null);
    setShowDocumentPreview(false);
    setDocumentCaption("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ============================================
  // REMOVE SINGLE IMAGE
  // ============================================

  const removeImage = (index) => {
    setSelectedImages((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  // ============================================
  // FORMAT FILE SIZE
  // ============================================

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };
  // Add this handler function (around line 1200, near other handlers)
  const handleClearChat = () => {
    if (!selectedGroup?.chatId) return;

    console.log("🗑️ Clearing chat for:", selectedGroup.chatId);

    // Clear messages from state
    setMessages([]);

    // Emit to backend to clear chat history
    if (socketRef.current?.connected) {
      socketRef.current.emit("clear_chat", {
        chatId: selectedGroup.chatId,
        userId: currentUser.id,
      });
      console.log("📤 Sent clear_chat to server");
    }

    // Close modal
    setShowClearChatModal(false);
  };
  // Add this useEffect to monitor socket status
  // useEffect(() => {
  //     const checkInterval = setInterval(() => {
  //         if (socketRef.current) {
  //             console.log("🔌 Socket status:", {
  //                 connected: socketRef.current.connected,
  //                 id: socketRef.current.id,
  //                 userId: currentUser.id
  //             });

  //             // ✅ Auto-reconnect if disconnected
  //             if (!socketRef.current.connected && currentUser.id) {
  //                 console.warn("⚠️ Socket disconnected, reconnecting...");
  //                 // connectSocket();
  //             }
  //         }
  //     }, 5000); // Check every 5 seconds

  //     return () => clearInterval(checkInterval);
  // }, [currentUser.id]);

  const handleTyping = () => {
    setstatus((prev) => !prev);

    if (!socketRef.current || !selectedGroup) {
      console.log("❌ Cannot emit typing");
      return;
    }

    console.log("📤 FRONTEND: Emitting user:typing", {
      chatId: selectedGroup.chatId,
      userId: currentUser.id,
      userName: currentUser.name,
      socketId: socketRef.current.id,
      connected: socketRef.current.connected,
    });

    socketRef.current.emit("user:typing", {
      chatId: selectedGroup.chatId,
      userId: currentUser.id,
      userName: currentUser.name,
    });
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to emit stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("user:stop-typing", {
        chatId: selectedGroup.chatId,
        userId: currentUser.id,
      });
    }, 2000);
  };

  const sendNotification = async () => {
    try {
      const response = await fetch(
        "http://localhost:3003/api/webpush/send-notification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "JAIMAX123JI3", // dummy user id
            title: "Test Notification", // dummy title
            body: "This is a dummy notification for testing", // dummy body
            url: "/dummy-url", // dummy link
          }),
        },
      );

      const data = await response.json();
      console.log(data, "daya12");
      if (response.ok) {
        console.log("Notification sent:", data);
      } else {
        console.error("Notification error:", data);
        // alert("Notification error:", data)
      }
    } catch (err) {
      console.error("Fetch error sending notification:", err);
    }
  };

  const retryMessage = async (failedMsg) => {
    console.log("🔄 Retrying message:", failedMsg.msgId);

    setMessages((prev) => prev.filter((msg) => msg.msgId !== failedMsg.msgId));

    const newTempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newCorrelationId = `${currentUser.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // ✅ Use stored original text, or decrypt if not available
    const originalText = failedMsg.msgBody?.originalText;
    let messageText;

    if (originalText) {
      messageText = originalText;
    } else {
      // Fallback: try to decrypt
      const encryptedMsg = failedMsg.msgBody?.message;
      if (typeof encryptedMsg === "object" && encryptedMsg.cipherText) {
        messageText = await decryptMessage(encryptedMsg, SECRET_KEY);
      } else {
        messageText = String(encryptedMsg);
      }
    }

    const encryptedMessage = await encryptMessage(messageText, SECRET_KEY);

    const newMessageData = {
      ...failedMsg,
      msgId: newTempId,
      _id: newTempId,
      rowId: newTempId,
      correlationId: newCorrelationId,
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
      msgStatus: "pending",
      status: "pending",
      error: null,
      msgBody: {
        ...failedMsg.msgBody,
        message: encryptedMessage,
        originalText: messageText, // ✅ Keep original text
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

    setMessages((prev) => [...prev, newMessageData]);

    if (socketRef.current?.connected) {
      socketRef.current.emit("send_message", newMessageData);
    } else {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.msgId === newTempId
            ? {
                ...msg,
                status: "failed",
                msgStatus: "failed",
                error: "Not connected to server",
              }
            : msg,
        ),
      );
    }
  };

  // Replace your current useEffect with this:
  useEffect(() => {
    console.log("🔌 Attempting socket connection...");
    console.log("Current user ID:", currentUser.id);

    if (!currentUser.id) {
      console.warn("⚠️ No user ID yet, delaying socket connection");
      return;
    }

    if (socketRef.current?.connected) {
      console.log("✅ Socket already connected");
      return;
    }

    console.log("🔌 Connecting socket now...");
    connectSocket();
    setSocketInitialized(true);

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocketInitialized(false);
    };
  }, [currentUser.id]); // ✅ Only depends on user ID

  // useEffect(() => {
  //     // ✅ CRITICAL: Don't connect if no user ID
  //     if (!currentUser.id) {
  //         console.log("⏳ Waiting for currentUser.id...");
  //         return;
  //     }

  //     console.log("🔌 Connecting socket with user:", currentUser.id);

  //     connectSocket();
  //     setSocketInitialized(true);

  //     return () => {
  //         if (socketRef.current) {
  //             socketRef.current.removeAllListeners();
  //             socketRef.current.disconnect();
  //             socketRef.current = null;
  //         }
  //         setSocketInitialized(false);
  //     };
  // }, [currentUser.id]);

  useEffect(() => {
    if (selectedGroup && Allusers && Allusers.length > 0) {
      // console.log('Auto-updating members from Allusers:', Allusers.length);
      setMembers(Allusers);
    }
  }, [Allusers, selectedGroup]);

  const handleReply = (msg) => {
    setReplyToMessage(msg);
  };

  const cancelReply = () => {
    setReplyToMessage(null);
  };

  // useEffect(() => {
  //     const formatted = fetchedGroups.map((group, index) => ({
  // id: index + 1,
  // chatId: group.groupId,
  // name: group.groupName,
  // groupImage: group.groupImage,
  // groupDescription: group.groupDescriptoin,
  // lastMessage: group.lastMessage || '',
  // time: group.lastMessageTime || '',
  // unread: group.unread || 0,
  // avatar: "https://res.cloudinary.com/ddefr5owc/image/upload/v1766049897/logo_xwrr9w.png"
  //     }));
  //     setGroups(formatted);

  //     if (formatted.length > 0 && !selectedGroup) {
  //         handleGroupSelect(formatted[0]);
  //     }
  // }, [fetchedGroups]);

  // useEffect(() => {
  //     setIsLoadingGroups(true);

  //     const formatted = fetchedGroups.map((group, index) => ({
  //         id: index + 1,
  //         chatId: group.groupId,
  //         name: group.groupName,
  //         groupImage: group.groupImage,
  //         groupDescription: group.groupDescriptoin,
  //         lastMessage: group.lastMessage || '',
  //         time: group.lastMessageTime || '',
  //         unread: group.unread || 0,
  //         avatar: "https://res.cloudinary.com/ddefr5owc/image/upload/v1766049897/logo_xwrr9w.png"
  //     }));

  //     setGroups(formatted);
  //     setIsLoadingGroups(false);

  //     // ✅ Only auto-select if socket is ready
  //     if (formatted.length > 0 && !selectedGroup && socketRef.current?.connected) {
  //         console.log("✅ Auto-selecting first group");
  //         handleGroupSelect(formatted[0]);
  //     } else if (formatted.length > 0 && !socketRef.current?.connected) {
  //         console.warn("⚠️ Groups loaded but socket not ready");
  //     }
  // }, [fetchedGroups, socketRef.current?.connected]);

  // ✅ FIX 1: Add a ref to track if we've already auto-selected

  useEffect(() => {
    if (!fetchedGroups || fetchedGroups.length === 0) return;

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

    // ✅ Only auto-select ONCE when groups first load AND socket is ready
    if (
      formatted.length > 0 &&
      !selectedGroup &&
      socketRef.current?.connected &&
      !hasAutoSelectedRef.current // ✅ Prevent re-selection
    ) {
      console.log("✅ Auto-selecting first group");
      hasAutoSelectedRef.current = true; // ✅ Mark as selected
      handleGroupSelect(formatted[0]);
    }
  }, [fetchedGroups]); // ✅ Only depend on fetchedGroups

  // ✅ FIX 2: Separate useEffect for socket connection check
  useEffect(() => {
    // When socket connects and we have groups but no selection, auto-select
    if (
      socketRef.current?.connected &&
      groups.length > 0 &&
      !selectedGroup &&
      !hasAutoSelectedRef.current
    ) {
      console.log("✅ Socket connected, auto-selecting first group");
      hasAutoSelectedRef.current = true;
      handleGroupSelect(groups[0]);
    }
  }, [socketRef.current?.connected, groups.length]); // ✅ Watch socket status

  // ✅ FIX 3: Reset auto-select flag when user manually changes groups
  useEffect(() => {
    if (selectedGroup) {
      hasAutoSelectedRef.current = true; // User has made a selection
    }
  }, [selectedGroup]);

  const loadOlderMessages = () => {
    if (!selectedGroup?.chatId || isLoadingOlder || !hasMoreOldMessages) {
      // console.log("Cannot load older messages:", {
      //     hasGroup: !!selectedGroup?.chatId,
      //     isLoadingOlder,
      //     hasMoreOldMessages
      // });
      return;
    }

    // console.log(" Loading older messages...");
    setIsLoadingOlder(true);

    if (socketRef.current?.connected) {
      const beforeTimestamp = oldestMessageTimestamp || messages[0]?.timestamp;

      socketRef.current.emit("fetch_older_messages", {
        chatId: selectedGroup.chatId,
        before: beforeTimestamp,
        limit: 50,
      });

      // console.log(" Emitted fetch_older_messages:", {
      //     chatId: selectedGroup.chatId,
      //     before: beforeTimestamp
      // });
    } else {
      // console.error("Socket not connected");
      setIsLoadingOlder(false);
    }
  };

  const loadNewerMessages = () => {
    if (!selectedGroup?.chatId || isLoadingNewer || !hasMoreNewMessages) {
      // console.log("Cannot load newer messages:", {
      //     hasGroup: !!selectedGroup?.chatId,
      //     isLoadingNewer,
      //     hasMoreNewMessages
      // });
      return;
    }

    // console.log("loading newer messages...");
    setIsLoadingNewer(true);

    if (socketRef.current?.connected) {
      const afterTimestamp =
        newestMessageTimestamp || messages[messages.length - 1]?.timestamp;

      socketRef.current.emit("fetch_newer_messages", {
        chatId: selectedGroup.chatId,
        after: afterTimestamp,
        limit: 50,
      });

      // console.log("Emitted fetch_newer_messages:", {
      //     chatId: selectedGroup.chatId,
      //     after: afterTimestamp
      // });
    } else {
      // console.error("Socket not connected");
      setIsLoadingNewer(false);
    }
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const reportMessage = (reportData) => {
    console.log("Reporting message:", reportData);

    if (socketRef.current?.connected) {
      // Emit report to backend
      socketRef.current.emit("report_message", reportData);
    } else {
      console.error("Socket not connected");
      alert("Unable to submit report. Please check your connection.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!selectedGroup?.chatId) return;

    const unreadMessages = messages.filter(
      (msg) => msg.senderId !== currentUser.id && msg.msgStatus !== "read",
    );
    // console.log(unreadMessages, "unreadMessages")

    unreadMessages.forEach((msg) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("message_read", {
          msgId: msg.msgId,
          chatId: msg.chatId,
        });
      }
    });
  }, [selectedGroup?.chatId, messages, currentUser.id]);

  const deleteForMe = (msgId) => {
    console.log("🗑️ Delete for me initiated:", msgId);
    setIsDeletingMessage(true);

    setMessages((prev) =>
      prev.map((msg) => {
        const messageId = msg.msgId || msg._id?.toString() || msg.id;
        if (messageId === msgId) {
          return {
            ...msg,
            deletedFor: [...(msg.deletedFor || []), currentUser.id],
          };
        }
        return msg;
      }),
    );

    if (socketRef.current?.connected) {
      console.log(msgId, "msgId");
      socketRef.current.emit("delete_for_me", {
        msgId: msgId,
        userId: currentUser.id,
        chatId: selectedGroup.chatId,
      });
      console.log("📤 Sent delete_for_me to server");
    } else {
      console.error("❌ Socket not connected");
      setMessages((prev) =>
        prev.map((msg) => {
          const messageId = msg.msgId || msg._id?.toString() || msg.id;
          if (messageId === msgId) {
            return {
              ...msg,
              deletedFor: (msg.deletedFor || []).filter(
                (id) => id !== currentUser.id,
              ),
            };
          }
          return msg;
        }),
      );
    }

    setIsDeletingMessage(false);
  };

  const deleteForEveryone = (msgId) => {
    console.log("🗑️ Delete for everyone - Target ID:", msgId);
    setIsDeletingMessage(true);

    // ✅ Find the actual message to get its real ID
    const targetMessage = messages.find((msg) => {
      const messageId = msg.msgId || msg._id?.toString() || msg.id;
      return messageId === msgId;
    });

    const realMessageId =
      targetMessage?._id?.toString() || targetMessage?.msgId;

    if (!realMessageId) {
      console.error("❌ Cannot delete - message not found:", msgId);
      setIsDeletingMessage(false);
      return;
    }

    // // ✅ Check if this is still a temp message (shouldn't delete unsent messages)
    // if (realMessageId.startsWith('temp_')) {
    //     console.warn("⚠️ Cannot delete unsent message");
    //     alert("Cannot delete message that hasn't been sent yet");
    //     setIsDeletingMessage(false);
    //     return;
    // }

    console.log("🗑️ Deleting with real ID:", realMessageId);

    // Update UI optimistically
    setMessages((prev) => {
      const updated = prev.map((msg) => {
        const messageId = msg.msgId || msg._id?.toString() || msg.id;

        if (messageId === msgId) {
          return {
            ...msg,
            deletedForEveryone: true,
            msgBody: {
              ...msg.msgBody,
              message: "This message was deleted",
            },
          };
        }
        return msg;
      });
      return updated;
    });

    // ✅ Send REAL ID to server
    if (socketRef.current?.connected) {
      socketRef.current.emit("delete_for_everyone", {
        msgId: realMessageId, // ✅ Send real server ID
        userId: currentUser.id,
        chatId: selectedGroup.chatId,
      });
      console.log("📤 Sent delete_for_everyone with ID:", realMessageId);
    } else {
      console.error("❌ Socket not connected");
      // Revert optimistic update
      setMessages((prev) =>
        prev.map((msg) => {
          const messageId = msg.msgId || msg._id?.toString() || msg.id;
          if (messageId === msgId) {
            return {
              ...msg,
              deletedForEveryone: false,
              msgBody: {
                ...msg.msgBody,
                message: targetMessage.msgBody?.message,
              },
            };
          }
          return msg;
        }),
      );
    }

    setIsDeletingMessage(false);
  };

  // const deleteForEveryone = (msgId) => {
  //     console.log("🗑️ Delete for everyone - Target ID:", msgId);
  //     setIsDeletingMessage(true);

  //     setMessages(prev => {
  //         const updated = prev.map(msg => {
  //             const messageId = msg.msgId || msg._id?.toString() || msg.id;

  //             console.log("Checking message:", messageId, "against target:", msgId, "Match:", messageId === msgId);

  //             // ✅ ONLY modify if IDs match
  //             if (messageId === msgId) {
  //                 // console.log("✅ DELETING THIS MESSAGE:", messageId);
  //                 return {
  //                     ...msg,
  //                     deletedForEveryone: true,
  //                     msgBody: {
  //                         ...msg.msgBody,
  //                         message: "This message was deleted"
  //                     }
  //                 };
  //             }

  //             // ✅ Return unchanged
  //             return msg;
  //         });

  //         // console.log("Updated messages count:", updated.length);
  //         return updated;
  //     });

  //     if (socketRef.current?.connected) {
  //         socketRef.current.emit("delete_for_everyone", {
  //             msgId: msgId,
  //             userId: currentUser.id,
  //             chatId: selectedGroup.chatId
  //         });
  //     }

  //     setIsDeletingMessage(false);
  // };

  const clearChat = () => {
    if (!selectedGroup?.chatId) return;

    const confirmClear = window.confirm(
      `Are you sure you want to clear all messages in ${selectedGroup.name}? This action cannot be undone.`,
    );

    if (!confirmClear) return;

    console.log("🗑️ Clearing chat for:", selectedGroup.chatId);

    // Optimistically clear messages in UI
    setMessages([]);

    // Emit to backend to mark all messages as deleted for this user
    if (socketRef.current?.connected) {
      socketRef.current.emit("clear_chat", {
        chatId: selectedGroup.chatId,
        userId: currentUser.id,
      });
      console.log("📤 Sent clear_chat to server");
    } else {
      console.error("❌ Socket not connected");
      // alert("Unable to clear chat. Please check your connection.");
    }
  };

  const updateGroupLastMessage = async (data) => {
    console.log("📝 Updating group last message for:", data.chatId);

    setGroups((prev) =>
      prev.map((g) => {
        if (g.chatId === data.chatId) {
          const shouldIncrementUnread =
            selectedGroup?.chatId !== data.chatId &&
            data.senderId !== currentUser.id;

          // ✅ CRITICAL: Get message preview safely
          let messagePreview = "";

          // Extract message text
          let messageText = data.msgBody?.message;

          console.log(messageText, "messageText345");

          // ✅ Handle encrypted object case
          if (
            typeof messageText === "object" &&
            messageText !== null &&
            messageText.cipherText
          ) {
            console.log("🔓 Decrypting last message for group sidebar");
            try {
              // Decrypt synchronously if possible, or use placeholder
              messagePreview = "[New message]"; // Placeholder for encrypted

              // Decrypt async and update later
              (async () => {
                try {
                  const decrypted = await decryptMessage(
                    messageText,
                    SECRET_KEY,
                  );
                  console.log(decrypted, "decrypte234");

                  // Update again with decrypted text
                  setGroups((prev2) =>
                    prev2.map((g2) => {
                      if (g2.chatId === data.chatId) {
                        return {
                          ...g2,
                          lastMessage: decrypted.substring(0, 50), // Truncate long messages
                        };
                      }
                      return g2;
                    }),
                  );
                } catch (err) {
                  console.error(
                    "❌ Failed to decrypt group last message:",
                    err,
                  );
                }
              })();
            } catch (err) {
              console.error("❌ Decryption error:", err);
              messagePreview = "[Encrypted message]";
            }
          }
          // ✅ Handle already decrypted string
          else if (typeof messageText === "string") {
            messagePreview = messageText.substring(0, 50); // Truncate
          }
          // ✅ Handle media messages
          else if (data.msgBody?.media?.file_url) {
            messagePreview = "📎 File";
          } else if (data.msgBody?.media?.fileName) {
            messagePreview = "📎 " + data.msgBody.media.fileName;
          } else {
            messagePreview = "Message";
          }

          return {
            ...g,
            lastMessage: messagePreview, // ✅ Always a string now
            time: formatTime(data.timestamp),
            unread: shouldIncrementUnread ? g.unread + 1 : g.unread,
          };
        }
        return g;
      }),
    );
  };

  const ReadInfoButton = () => {
    setReadInfo((prev) => !prev);
  };

  const handleReplyMessage = (msg) => {
    setReplyToMessage(msg);
  };
  const showNotification = (data) => {
    const notification = {
      id: Date.now(),
      chatId: data.chatId,
      senderName: data.senderName,
      message: data.message || "New message",
      timestamp: data.timestamp,
    };

    setNotifications((prev) => [notification, ...prev].slice(0, 10));

    // if ('Notification' in window && Notification.permission === 'granted') {
    //     const groupName = groups.find(g => g.chatId === data.chatId)?.name || 'Group Chat';
    //     const browserNotif = new Notification(`${data.senderName} in ${groupName}`, {
    //         body: data.message || 'Sent an attachment',
    //         icon: '/chat-icon.png',
    //         tag: data.chatId
    //     });

    //     browserNotif.onclick = () => {
    //         window.focus();
    //         const group = groups.find(g => g.chatId === data.chatId);
    //         if (group) handleGroupSelect(group);
    //     };
    // }

    playNotificationSound();
  };

  const playNotificationSound = () => {
    const audio = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUBELTKXh8bllHAU+ktbx0H8tBSh+zPLaizsKFGO56+mhUBAMTKXh8bllHAU+ktbx0H8tBSh+zPLaizsKFGO56+mhUBAMTKXh8bllHAU+ktbx0H8tBSh+",
    );
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const handleGroupSelect = (group) => {
    console.log("🔄 Switching to group:", group.name);

    // ✅ Check socket connection first
    if (!socketRef.current?.connected) {
      console.error("❌ Socket not connected!");
      // alert("Connection not ready. Please wait and try again.");
      return;
    }

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
    setIsLoadingMessages(true); // ✅ Good
    setIsInitialMessagesLoad(true); // ✅ Good

    const loadingTimeout = setTimeout(() => {
      console.error("⏰ Message loading timeout!");
      setIsLoadingMessages(false);
      setIsInitialMessagesLoad(false);
      // alert("Failed to load messages. Please try again.");
    }, 10000); // 10 second timeout

    // Store timeout ID
    window.currentLoadingTimeout = loadingTimeout;

    if (Allusers && Allusers.length > 0) {
      setMembers(Allusers);
    }

    setGroups((prev) =>
      prev.map((g) => (g.id === group.id ? { ...g, unread: 0 } : g)),
    );

    setNotifications((prev) => prev.filter((n) => n.chatId !== group.chatId));

    if (socketRef.current?.connected) {
      if (selectedGroup && selectedGroup.chatId !== group.chatId) {
        console.log("👋 Leaving previous chat:", selectedGroup.chatId);
        socketRef.current.emit("leave_chat", { chatId: selectedGroup.chatId });
        setMessages([]);
        processedMessagesRef.current.clear(); // ✅ CRITICAL: Clear processed IDs
      }

      console.log("✅ Joining new chat:", group.chatId);
      socketRef.current.emit("join_chat", { chatId: group.chatId });
    }
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setTypingUsers([]);
  };

  //  ADD THIS AFTER YOUR send_message HANDLER (for debugging)

  // Monitor messages state changes
  // useEffect(() => {
  //     console.log(" Messages updated. Count:", messages.length);

  //     // Check for duplicates
  //     const ids = messages.map(m => m._id?.toString() || m.msgId);
  //     const uniqueIds = new Set(ids);

  //     if (ids.length !== uniqueIds.size) {
  //         console.error(" DUPLICATE DETECTED!");
  //         console.log("Total messages:", ids.length);
  //         console.log("Unique messages:", uniqueIds.size);

  //         // Find duplicates
  //         const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  //         console.log("Duplicate IDs:", duplicates);

  //         // Show which messages are duplicated
  //         duplicates.forEach(dupId => {
  //             const dupes = messages.filter(m =>
  //                 (m._id?.toString() || m.msgId) === dupId
  //             );
  //             console.log(`Duplicate message "${dupId}":`, dupes);
  //         });
  //     } else {
  //         console.log("No duplicates found");
  //     }
  // }, [messages.length]);

  useEffect(() => {
    console.log(
      "Processed IDs cleared. Size:",
      processedMessagesRef.current.size,
    );
  }, [selectedGroup?.chatId]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      // alert('File size must be less than 10MB');
      return;
    }

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
  };

  const cancelFileUpload = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setShowFilePreview(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendFileMessage = async () => {
    if (!selectedFile || !selectedGroup || !currentUser.id) return;

    const tempId = `temp_file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const correlationId = `${currentUser.id}_file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // ✅ DON'T encrypt file names - keep them readable
    const sanitizedFileName = sanitizeMessage(selectedFile.name.trim());

    if (sanitizedFileName === "") {
      // alert("Invalid file name");
      return;
    }

    const encyptedmessage = await encryptMessage(sanitizedFileName, SECRET_KEY);

    // ✅ Create temp message with UNENCRYPTED file name for instant display
    let messageData = {
      rowId: tempId,
      msgId: tempId,
      _id: tempId,
      correlationId,
      chatId: selectedGroup.chatId,
      chatType: "groupChat",
      messageType: "file",
      senderId: currentUser.id,
      fromUserId: currentUser.id,
      publisherName: currentUser.name,
      senderName: currentUser.name,
      receiverId: "",
      msgBody: {
        message: encyptedmessage,
        originalText: sanitizedFileName,
        message_type: "file",
        media: {
          fileName: encyptedmessage,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
          file_url: "",
          file_key: "",
          duration: "",
          caption: "",
          thumb_image: filePreview || "",
          local_path: "",
          is_uploading: true, // ✅ Show loading state
          is_downloaded: false,
          isLargeFile: selectedFile.size > 25 * 1024 * 1024,
        },
        UserName: currentUser.name,
      },
      msgStatus: "pending",
      timestamp: Date.now(),
      createdAt: new Date(),
      deleteStatus: 0,
      status: "pending",
      favouriteStatus: 0,
      editedStatus: 0,
      editMessageId: "",
      metaData: {
        isSent: false,
        sentAt: null,
        isDelivered: false,
        deliveredAt: null,
        isRead: false,
        readAt: null,
      },
      replyTo: replyToMessage
        ? {
            msgId: replyToMessage.msgId || replyToMessage.id,
            message: replyToMessage.msgBody?.message,
            senderName:
              replyToMessage.publisherName || replyToMessage.senderName,
            senderId: replyToMessage.fromUserId,
          }
        : null,
    };

    // ✅ INSTANT UI UPDATE - Add message immediately
    setMessages((prev) => [...prev, messageData]);
    cancelFileUpload();

    try {
      const buffer = await selectedFile.arrayBuffer();

      if (socketRef.current?.connected) {
        console.log("📤 Sending file:", sanitizedFileName);

        // ✅ Send file to backend
        socketRef.current.emit("send_file", {
          fileBuffer: buffer,
          fileName: sanitizedFileName,
          fileType: selectedFile.type,
          messageData,
        });

        // ✅ INSTANT STATUS UPDATE - Mark as "sent" immediately
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.msgId === tempId
                ? {
                    ...msg,
                    status: "sent",
                    msgStatus: "sent",
                    metaData: {
                      ...msg.metaData,
                      isSent: true,
                      sentAt: Date.now(),
                    },
                  }
                : msg,
            ),
          );
        }, 100); // Small delay to show upload started
      } else {
        throw new Error("Socket not connected");
      }
    } catch (error) {
      console.error("❌ File send error:", error);

      // ✅ Show error state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.msgId === tempId
            ? {
                ...msg,
                status: "failed",
                msgStatus: "failed",
                msgBody: {
                  ...msg.msgBody,
                  media: {
                    ...msg.msgBody.media,
                    is_uploading: false, // ✅ Stop loading spinner
                  },
                },
                error: error.message,
              }
            : msg,
        ),
      );

      // alert(`Failed to send file: ${error.message}`);
    }
  };

  // const sendFileMessage = async () => {
  //     if (!selectedFile || !selectedGroup || !currentUser.id) return;

  //     const tempId = `temp_file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  //     const correlationId = `${currentUser.id}_file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  //     const sanitizemessage = sanitizeMessage(selectedFile.name.trim());
  //     if (sanitizemessage === "") {
  //         alert("cannot send message due to security reasons");
  //         return;
  //     }

  //     const encyptedmessage = await encryptMessage(sanitizemessage, SECRET_KEY);

  //     let messageData = {
  //         rowId: tempId,
  //         msgId: tempId,
  //         _id: tempId,
  //         correlationId,
  //         chatId: selectedGroup.chatId,
  //         chatType: "groupChat",
  //         messageType: "file",
  //         senderId: currentUser.id,
  //         fromUserId: currentUser.id,
  //         publisherName: currentUser.name,
  //         senderName: currentUser.name,
  //         receiverId: "",
  //         msgBody: {
  //             message: encyptedmessage,
  //             message_type: "file",
  //             media: {
  //                 fileName: selectedFile.name,
  //                 file_type: selectedFile.type,
  //                 file_size: selectedFile.size,
  //                 file_url: "",
  //                 file_key: "",
  //                 duration: "",
  //                 caption: "",
  //                 thumb_image: "",
  //                 local_path: "",
  //                 is_uploading: true,
  //                 is_downloaded: false,
  //                 isLargeFile: selectedFile.size > 25 * 1024 * 1024,
  //             },
  //             UserName: currentUser.name,
  //         },
  //         msgStatus: "pending",
  //         timestamp: Date.now(),
  //         createdAt: new Date(),
  //         deleteStatus: 0,
  //         status: "pending",
  //         favouriteStatus: 0,
  //         editedStatus: 0,
  //         editMessageId: "",
  //         metaData: {
  //             isSent: false,
  //             sentAt: null,
  //             isDelivered: false,
  //             deliveredAt: null,
  //             isRead: false,
  //             readAt: null,
  //         },
  //         replyTo: replyToMessage ? {
  //             msgId: replyToMessage.msgId || replyToMessage.id,
  //             message: replyToMessage.msgBody?.message,
  //             senderName: replyToMessage.publisherName || replyToMessage.senderName,
  //             senderId: replyToMessage.fromUserId
  //         } : null,
  //     };

  //     setMessages(prev => [...prev, messageData]);

  //     cancelFileUpload();

  //     try {
  //         const buffer = await selectedFile.arrayBuffer();

  //         if (socketRef.current?.connected) {
  //             console.log("📤 Sending file via socket:", {
  //                 fileName: selectedFile.name,
  //                 size: selectedFile.size,
  //                 correlationId
  //             });

  //             socketRef.current.emit("send_file", {
  //                 fileBuffer: buffer,
  //                 fileName: selectedFile.name,
  //                 fileType: selectedFile.type,
  //                 messageData
  //             });
  //         } else {
  //             throw new Error("Socket not connected");
  //         }

  //     } catch (error) {
  //         console.error("❌ File send error:", error);

  //         setMessages(prev => prev.map(msg =>
  //             msg.msgId === tempId
  //                 ? { ...msg, status: "failed", msgStatus: "failed", error: error.message }
  //                 : msg
  //         ));

  //         alert(`Failed to send file: ${error.message}`);
  //     }
  // };

  useEffect(() => {
    if (!socketRef.current || !selectedGroup) return;

    const socket = socketRef.current;

    // Listen for typing events
    const handleUserTyping = (data) => {
      console.log("User typing:", data);

      if (
        data.chatId === selectedGroup.chatId &&
        data.userId !== currentUser.id
      ) {
        setTypingUsers((prev) => {
          // Check if user is already in typing list
          const exists = prev.some((u) => u.userId === data.userId);
          if (exists) return prev;

          return [
            ...prev,
            {
              userId: data.userId,
              userName: data.userName || "Someone",
            },
          ];
        });
      }
    };

    // Listen for stop typing events
    const handleUserStopTyping = (data) => {
      console.log("User stopped typing:", data);

      if (data.chatId === selectedGroup.chatId) {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
      }
    };

    socket.on("user:typing", handleUserTyping);
    socket.on("user:stop-typing", handleUserStopTyping);

    return () => {
      socket.off("user:typing", handleUserTyping);
      socket.off("user:stop-typing", handleUserStopTyping);
    };
  }, [selectedGroup?.chatId, currentUser?.id]);

  console.log("SECRET_KEY raw:", JSON.stringify(SECRET_KEY));

  // ========================================
  useEffect(() => {
    return () => {
      if (rateLimitResetTimer.current) {
        clearTimeout(rateLimitResetTimer.current);
      }
    };
  }, []);

  const sendMessage = async () => {
    console.log("🔍 sendMessage called", {
      isInputDisabled,
      messageText: message.trim(),
      hasGroup: !!selectedGroup,
      hasUser: !!currentUser.id,
    });

    // ✅ CRITICAL: Block if input is disabled
    if (isInputDisabled) {
      console.log("🚫 Message blocked - rate limit active");

      // Show visual feedback
      const warningDiv = document.createElement("div");
      warningDiv.className =
        "fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] animate-pulse font-semibold";
      warningDiv.innerHTML = `
            <div class="flex items-center gap-2">
                <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Please wait! You're sending messages too quickly.</span>
            </div>
        `;
      document.body.appendChild(warningDiv);

      setTimeout(() => {
        warningDiv.remove();
      }, 3000);

      return; // ✅ EXIT - Don't send message
    }

    if (!message.trim() || !selectedGroup || !currentUser.id) {
      return;
    }

    const sanitizemessage = sanitizeMessage(message.trim());
    if (sanitizemessage === "") {
      // alert("Cannot send message due to security reasons");
      return;
    }

    const timestamp = new Date().toISOString();
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const correlationId = `${currentUser.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const encyptedmessage = await encryptMessage(sanitizemessage, SECRET_KEY);

    const messageData = {
      rowId: tempId,
      chatType: "groupChat",
      originalText: sanitizemessage,
      messageType: "message",
      chatId: selectedGroup.chatId,
      msgId: tempId,
      _id: tempId,
      correlationId,
      createdAt: timestamp,
      fromUserId: currentUser.id,
      publisherName: currentUser.name,
      receiverId: "Jaimax Team",
      ...(replyToMessage && {
        replyTo: {
          msgId: replyToMessage.msgId || replyToMessage.id,
          message: replyToMessage.msgBody?.message,
          senderName: replyToMessage.publisherName || replyToMessage.senderName,
          senderId: replyToMessage.fromUserId,
        },
      }),
      msgBody: {
        message: encyptedmessage,
        originalText: sanitizemessage,
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
        },
        UserName: currentUser.name,
      },
      msgStatus: "pending",
      timestamp: new Date(timestamp).getTime(),
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
    };

    // ✅ Show message immediately
    setMessages((prev) => [...prev, messageData]);

    // Clear input
    setMessage("");
    setReplyToMessage(null);

    if (socketRef.current?.connected) {
      socketRef.current.emit("send_message", messageData);
      console.log("📤 Message sent to server");

      // Update to "sent" status
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.msgId === tempId
              ? {
                  ...msg,
                  status: "sent",
                  msgStatus: "sent",
                  metaData: {
                    ...msg.metaData,
                    isSent: true,
                    sentAt: Date.now(),
                  },
                }
              : msg,
          ),
        );
      }, 100);
    } else {
      // Show error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.msgId === tempId
            ? {
                ...msg,
                status: "failed",
                msgStatus: "failed",
                error: "Not connected to server",
              }
            : msg,
        ),
      );
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) {
      return "";
    }

    const date = new Date(timestamp);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDateHeader = (dateKey) => {
    const today = new Date().toLocaleDateString();
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
    if (dateKey === today) return "Today";
    if (dateKey === yesterday) return "Yesterday";
    return dateKey;
  };

  const groupMessagesByDate = (messages) => {
    // console.log(messages, "2messages")
    const grouped = {};
    messages.forEach((msg) => {
      const date = new Date(msg.timestamp);
      const dateKey = date.toDateString();
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(msg);
    });
    return grouped;
  };

  return (
    <div className="flex flex-1 h-[80vh] bg-[#085056] text-white">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,application/pdf,.doc,.docx,.txt"
      />

      {!socketInitialized || !currentUser.id || isLoadingGroups ? (
        <Loader />
      ) : (
        <ChatWindow
          selectedGroup={selectedGroup}
          messages={messages}
          members={Allusers}
          handleReplyMessage={handleReplyMessage}
          showMembers={showMembers}
          ReadInfoButton={ReadInfoButton}
          setShowMembers={setShowMembers}
          message={message}
          setMessage={setMessage}
          onSendMessage={sendMessage}
          onBackToGroups={handleBackToGroups}
          deleteForEveryone={deleteForEveryone}
          currentUser={currentUser}
          typingUsers={typingUsers}
          onlineUsers={onlineUsers}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          filePreview={filePreview}
          deleteForMe={deleteForMe}
          setFilePreview={setFilePreview}
          showFilePreview={showFilePreview}
          setShowFilePreview={setShowFilePreview}
          isRecording={isRecording}
          reportMessage={reportMessage}
          setIsRecording={setIsRecording}
          audioBlob={audioBlob}
          setAudioBlob={setAudioBlob}
          replyToMessage={replyToMessage}
          recordingTime={recordingTime}
          groupKey={DecryptedKey[0]}
          setRecordingTime={setRecordingTime}
          playingAudio={playingAudio}
          setPlayingAudio={setPlayingAudio}
          showFilesPanel={showFilesPanel}
          setShowFilesPanel={setShowFilesPanel}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          handleFileSelect={handleFileSelect}
          cancelFileUpload={cancelFileUpload}
          handleReply={handleReply}
          cancelReply={cancelReply}
          sendFileMessage={sendFileMessage}
          handleTyping={handleTyping}
          formatTime={formatTime}
          formatDuration={formatDuration}
          fileInputRef={fileInputRef}
          emojiPickerRef={emojiPickerRef}
          messagesEndRef={messagesEndRef}
          chatFiles={chatFiles}
          isDeletingMessage={isDeletingMessage}
          setIsDeletingMessage={setIsDeletingMessage}
          loadingFiles={loadingFiles}
          uploadingFile={uploadingFile}
          uploadingAudio={uploadingAudio}
          socketRef={socketRef}
          formatDateHeader={formatDateHeader}
          groupMessagesByDate={groupMessagesByDate}
          onClearChat={handleClearChat}
          loadOlderMessages={loadOlderMessages}
          retryMessage={retryMessage}
          showClearChatModal={showClearChatModal}
          setShowClearChatModal={setShowClearChatModal}
          loadNewerMessages={loadNewerMessages}
          showFileTypeModal={showFileTypeModal}
          setShowFileTypeModal={setShowFileTypeModal}
          isLoadingOlder={isLoadingOlder}
          isLoadingNewer={isLoadingNewer}
          hasMoreOldMessages={hasMoreOldMessages}
          loadMoreUsers={loadMoreUsers}
          isLoadingMoreUsers={isLoadingMoreUsers}
          hasMoreUsers={hasMoreUsers}
          hasMoreNewMessages={hasMoreNewMessages}
          isLoadingMessages={isLoadingMessages}
          isInitialMessagesLoad={isInitialMessagesLoad}
          isLoadingGroups={isLoadingGroups}
          loadUsersPage={fetchUsersPage}
          goToNextPage={() => fetchUsersPage(userPage + 1)}
          goToPrevPage={() => fetchUsersPage(userPage - 1)}
          goToFirstPage={() => fetchUsersPage(1)}
          goToLastPage={() => fetchUsersPage(totalPages)}
          goToPage={fetchUsersPage}
          totalUsers={totalUsers}
          loadNextPage={() => fetchUsersPage(userPage + 1)}
          loadPrevPage={() => fetchUsersPage(userPage - 1)}
          isLoadingUsers={isLoadingUsers}
          userPage={userPage}
          totalPages={totalPages}
          selectedImages={selectedImages}
          setSelectedImages={setSelectedImages}
          selectedDocument={selectedDocument}
          setSelectedDocument={setSelectedDocument}
          imageCaption={imageCaption}
          setImageCaption={setImageCaption}
          documentCaption={documentCaption}
          setDocumentCaption={setDocumentCaption}
          showImagePreview={showImagePreview}
          setShowImagePreview={setShowImagePreview}
          showDocumentPreview={showDocumentPreview}
          setShowDocumentPreview={setShowDocumentPreview}
          isInputDisabled={isInputDisabled}
          setIsInputDisabled={setIsInputDisabled}
          uploadProgress={uploadProgress}
          handleImageSelect={handleImageSelect}
          handleDocumentSelect={handleDocumentSelect}
          sendImageMessage={sendImageMessage}
          sendDocumentMessage={sendDocumentMessage}
          cancelImageUpload={cancelImageUpload}
          cancelDocumentUpload={cancelDocumentUpload}
          removeImage={removeImage}
          formatFileSize={formatFileSize}
          refetchFiles={refetchFiles}

          // getFileIcon={getFileIcon}
        />
      )}
    </div>
  );
};

export default GroupChatApp;
