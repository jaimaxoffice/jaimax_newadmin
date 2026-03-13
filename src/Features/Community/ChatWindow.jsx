import React, { useEffect, useRef, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { Users } from "lucide-react";
import { decryptMessage } from "./socket/encryptmsg";
import Loader from "../../ReusableComponents/Loader/loader";
import loaderImage from "/logo.png";

// ── Sub-components ────────────────────────────────────────────────────────────
import ChatHeader from "./chatWindow/Chatheader";
import MessageBubble from "./chatWindow/Messagebubble";
import MessageInput from "./chatWindow/Messageinput";
import ContextMenu from "./chatWindow/ContextMenu";
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
}) => {
  // ── Local state ───────────────────────────────────────────────────────────
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

  const hasMoreOldMessagesRef = useRef(hasMoreOldMessages);
  const isLoadingOlderRef = useRef(isLoadingOlder);
  useEffect(() => {
    hasMoreOldMessagesRef.current = hasMoreOldMessages;
  }, [hasMoreOldMessages]);
  useEffect(() => {
    isLoadingOlderRef.current = isLoadingOlder;
  }, [isLoadingOlder]);

  const scrollPositionRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const isRestoringScrollRef = useRef(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  const membersContainerRef = useRef(null);

  // ── Report modal state ────────────────────────────────────────────────────
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingMessage, setReportingMessage] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  // ── Read receipts state ───────────────────────────────────────────────────
  const [showReadReceipts, setShowReadReceipts] = useState(false);
  const [selectedMessageForReceipts, setSelectedMessageForReceipts] =
    useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // ── Context menu state ────────────────────────────────────────────────────
  const [localOpenMenuId, setLocalOpenMenuId] = useState(null);
  const effectiveOpenMenuId =
    typeof openMenuId !== "undefined" ? openMenuId : localOpenMenuId;
  const setEffectiveOpenMenuId = (v) => {
    if (typeof setOpenMenuId === "function") setOpenMenuId(v);
    else setLocalOpenMenuId(v);
  };

  // ── Observed messages for read receipts ──────────────────────────────────
  const [observedMessages, setObservedMessages] = useState(new Set());
  const observerRef = useRef(null);

  // ── Cookie / auth ─────────────────────────────────────────────────────────
  const storedData = Cookies.get("adminUserData");
  let userRole = "";
  if (storedData) {
    const parsed = JSON.parse(storedData);
    userRole = parsed.data.role;
  }

  // ── Countdown for rate limit ──────────────────────────────────────────────
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

  // ── Component loading gate ────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedGroup && messages !== undefined) setIsComponentLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedGroup, messages]);

  useEffect(() => {
    setIsComponentLoading(true);
  }, [selectedGroup?.id]);

  // ── Scroll to bottom on initial load ─────────────────────────────────────
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

  // ── Members pagination scroll ─────────────────────────────────────────────
  useEffect(() => {
    const container = membersContainerRef.current;
    if (!container || activeGroupTab !== "members") return;
    let scrollTimeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const scrollPercentage =
          ((scrollTop + clientHeight) / scrollHeight) * 100;
        if (scrollPercentage > 90 && userPage < totalPages && !isLoadingUsers)
          loadNextPage?.();
        if (scrollPercentage < 10 && userPage > 1 && !isLoadingUsers)
          loadPrevPage?.();
      }, 300);
    };
    container.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(scrollTimeout);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [
    activeGroupTab,
    isLoadingUsers,
    userPage,
    totalPages,
    loadNextPage,
    loadPrevPage,
  ]);

  // ── Messages area scroll handler ─────────────────────────────────────────
  useEffect(() => {
    const messagesArea = messagesAreaRef.current;
    if (!messagesArea) return;
    let scrollTimeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      const { scrollTop, scrollHeight, clientHeight } = messagesArea;
      const distanceFromTop = scrollTop;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      isAtBottomRef.current = distanceFromBottom < 100;
      setUserScrolledUp(!isAtBottomRef.current);
      if (isAtBottomRef.current) setNewMessagesCount(0);
      scrollTimeout = setTimeout(() => {
        if (
          distanceFromTop < 200 &&
          hasMoreOldMessagesRef.current &&
          !isLoadingOlderRef.current
        )
          loadOlderMessages();
        if (
          distanceFromBottom < 200 &&
          hasMoreNewMessages &&
          !isLoadingNewer &&
          !isAtBottomRef.current
        )
          loadNewerMessages();
      }, 200);
    };
    messagesArea.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(scrollTimeout);
      messagesArea.removeEventListener("scroll", handleScroll);
    };
  }, [
    isComponentLoading,
    isInitialMessagesLoad,
    loadOlderMessages,
    loadNewerMessages,
    hasMoreNewMessages,
    isLoadingNewer,
  ]);

  // ── Preserve scroll position when loading older messages ─────────────────
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
          const targetElement = document.getElementById(
            `msg-${scrollPositionRef.current}`,
          );
          if (targetElement)
            targetElement.scrollIntoView({
              block: "start",
              behavior: "instant",
            });
          scrollPositionRef.current = null;
          isRestoringScrollRef.current = false;
        });
      });
    }
  }, [isLoadingOlder, messages.length]);

  // ── Intersection observer for read receipts ───────────────────────────────
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
      },
    );

    const timeoutId = setTimeout(() => {
      const els = messagesAreaRef.current?.querySelectorAll("[data-msg-id]");
      els?.forEach((el) => {
        if (
          el.getAttribute("data-msg-id") &&
          el.getAttribute("data-from-user-id")
        ) {
          observerRef.current.observe(el);
        }
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

  // ── Auto-scroll on new messages ───────────────────────────────────────────
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
    if (isMyMessage) {
      requestAnimationFrame(() =>
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      );
    } else if (isAtBottomRef.current) {
      requestAnimationFrame(() =>
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      );
      setNewMessagesCount(0);
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

  // ── Global event listeners ────────────────────────────────────────────────
  useEffect(() => {
    const onWindowClick = () => setEffectiveOpenMenuId(null);
    window.addEventListener("click", onWindowClick);
    return () => window.removeEventListener("click", onWindowClick);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setEffectiveOpenMenuId(null);
        setShowReadReceipts(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onResize = () => setEffectiveOpenMenuId(null);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const renderMessageWithLinks = (text) => {
    if (!text) return null;
    text = String(text);
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const getMessageReadStatus = (msg) => {
    const isCurrentUser =
      msg.fromUserId?.toString() === currentUser?.id?.toString();
    if (!isCurrentUser) return null;
    const readBy = msg.metaData?.readBy || [];
    const totalMembers = members?.length || 0;
    const readCount = readBy.length;
    if (!msg.metaData?.isSent) return "sending";
    if (readCount === 0) return "sent";
    if (readCount >= totalMembers - 1) return "read_all";
    return "read_some";
  };

  const toggleMenu = (msgId, e, isCurrentUser) => {
    e?.stopPropagation();
    if (effectiveOpenMenuId === msgId) {
      setEffectiveOpenMenuId(null);
      return;
    }
    const msgElem = document.getElementById(`msg-${msgId}`);
    const container = containerRef.current;
    const header = headerRef.current;
    if (!msgElem || !container) {
      setMenuPosition({
        top: 80,
        left: Math.max(16, (container?.clientWidth || 300) - 220),
      });
      setEffectiveOpenMenuId(msgId);
      return;
    }
    const msgRect = msgElem.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const headerRect = header
      ? header.getBoundingClientRect()
      : { bottom: containerRect.top };
    const spaceAbove =
      msgRect.top - containerRect.top - (headerRect.height || 0);
    const spaceBelow = containerRect.bottom - msgRect.bottom;
    const MENU_W = 180,
      MENU_H = 160,
      GAP = 8;
    let left = isCurrentUser
      ? Math.max(
          containerRect.left + 8,
          Math.min(msgRect.right - MENU_W, containerRect.right - 8 - MENU_W),
        )
      : Math.max(
          containerRect.left + 8,
          Math.min(msgRect.left, containerRect.right - 8 - MENU_W),
        );
    let top =
      spaceAbove > MENU_H + GAP
        ? msgRect.top - MENU_H - GAP
        : spaceBelow > MENU_H + GAP
          ? msgRect.bottom + GAP
          : Math.min(
              Math.max(containerRect.top + 8, msgRect.bottom + GAP),
              containerRect.bottom - MENU_H - 8,
            );
    setMenuPosition({
      top: Math.round(top - containerRect.top),
      left: Math.round(left - containerRect.left),
    });
    setEffectiveOpenMenuId(msgId);
  };

  const scrollToMessage = (msgId) => {
    const msgElement = document.getElementById(`msg-${msgId}`);
    if (msgElement) {
      msgElement.scrollIntoView({ behavior: "smooth", block: "center" });
      msgElement.classList.add("bg-[#0a6a72]");
      setTimeout(() => msgElement.classList.remove("bg-[#0a6a72]"), 2000);
    }
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
    } else if (typeof messageText === "string") {
      textToCopy = messageText;
    } else {
      textToCopy = String(messageText || "");
    }
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setCopiedMessageId(id);
        setTimeout(() => setCopiedMessageId(null), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const downloadFileToDesktop = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl, { mode: "cors" });
      if (!response.ok) throw new Error("Network response was not ok");
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
    } catch (err) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName || "download";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const submitReport = () => {
    if (!reportReason) {
      alert("Please select a reason");
      return;
    }
    const reportData = {
      msgId: reportingMessage.msgId || reportingMessage._id?.toString(),
      chatId: selectedGroup.chatId,
      reportedBy: currentUser.id,
      reportedByName: currentUser.name,
      reportedUser: reportingMessage.fromUserId,
      reportedUserName:
        reportingMessage.publisherName || reportingMessage.senderName,
      reason: reportReason,
      description: reportDescription,
      messageContent: reportingMessage.msgBody?.message || "Media message",
      timestamp: Date.now(),
    };
    reportMessage?.(reportData);
    setShowReportModal(false);
    setReportingMessage(null);
    setReportReason("");
    setReportDescription("");
  };

  const groupedMessages = groupMessagesByDate(messages || []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {isComponentLoading ? (
        <Loader />
      ) : (
        <div
          ref={containerRef}
          className="flex-1 flex flex-col relative h-full sidebar-scroll overflow-hidden"
        >
          {/* Header - hide when showing members/files panel */}
          {!showMembers && !showFilesPanel && (
            <ChatHeader
              selectedGroup={selectedGroup}
              totalUsers={totalUsers}
              typingUsers={typingUsers}
              setShowMembers={setShowMembers}
              setShowFilesPanel={setShowFilesPanel}
              setActiveGroupTab={setActiveGroupTab}
              setShowClearChatModal={setShowClearChatModal}
              headerRef={headerRef}
            />
          )}

          {/* Group Info Panel - full height replacement */}
          {selectedGroup && showMembers && (
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
            />
          )}

          {/* Shared Files Panel - full height replacement */}
          {selectedGroup && showFilesPanel && (
            <SharedFilesPanel
              setShowFilesPanel={setShowFilesPanel}
              sharedFilesPanelRef={sharedFilesPanelRef}
              accumulatedFiles={Array.isArray(chatFiles) ? chatFiles : []}
              filesPage={filesPage}
              loadingFiles={loadingFiles}
              filesPagination={filesPagination}
              filesScrollSentinelRef={filesScrollSentinelRef}
              formatTime={formatTime}
              formatFileSize={formatFileSize}
            />
          )}

          {/* Messages area */}
          {selectedGroup && !showMembers && !showFilesPanel && (
            <div
              ref={messagesAreaRef}
              className="flex-1 overflow-y-auto p-2 sm:p-4 bg-[#000000] relative z-10 sidebar-scroll"
              style={{ overflowAnchor: "none" }}
            >
              {isInitialMessagesLoad && isLoadingMessages ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111b21]/80 z-50">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-[#202c33] border-t-[#00a884] animate-spin" />
                    <div
                      className="absolute inset-0 rounded-full border-4 border-transparent border-b-[#00a884]/40 animate-spin"
                      style={{
                        animationDirection: "reverse",
                        animationDuration: "1s",
                      }}
                    />
                    <img
                      src={loaderImage}
                      alt="loader"
                      className="absolute inset-0 m-auto w-10 h-10 object-contain"
                    />
                  </div>
                  <p className="text-lg mt-6 mb-1 font-medium text-gray-300">
                    Loading messages…
                  </p>
                  <p className="text-sm text-gray-500">Please wait</p>
                </div>
              ) : (
                <>
                  {isLoadingOlder && (
                    <div className="flex justify-center py-2 mb-2">
                      <div className="bg-[#202c33] px-4 py-2 rounded-full flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00a884]" />
                        <span className="text-xs text-gray-400">
                          Loading older messages...
                        </span>
                      </div>
                    </div>
                  )}

                  {!messages || messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Users className="w-20 h-20 mb-4 opacity-30" />
                      <p className="text-lg mb-2">No messages yet</p>
                      <p className="text-sm">Start the conversation!</p>
                    </div>
                  ) : (
                    <>
                      {Object.entries(groupedMessages).map(
                        ([dateKey, dateMessages]) => (
                          <div key={dateKey}>
                            <div className="flex justify-center my-4">
                              <span className="bg-[#202c33] px-3 py-1 rounded-full text-xs text-gray-400">
                                {formatDateHeader(dateKey)}
                              </span>
                            </div>
                            {dateMessages.map((msg) => (
                              <MessageBubble
                                key={`${msg.msgId || msg.id}-${msg.timestamp}`}
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
                                renderMessageWithLinks={renderMessageWithLinks}
                                getMessageReadStatus={getMessageReadStatus}
                              />
                            ))}
                          </div>
                        ),
                      )}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          )}

          {/* Modals */}
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

          {/* Context menu */}
          {selectedGroup && (
            <ContextMenu
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
            />
          )}

          {/* Report modal */}
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

          {/* Read receipts modal */}
          <ReadReceiptsModal
            showReadReceipts={showReadReceipts}
            setShowReadReceipts={setShowReadReceipts}
            selectedMessageForReceipts={selectedMessageForReceipts}
            members={members}
            formatTime={formatTime}
          />

          {/* Input bar - only in chat view */}
          {selectedGroup && !showMembers && !showFilesPanel && (
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
            />
          )}
        </div>
      )}
    </>
  );
};

export default ChatWindow;
