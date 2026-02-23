import React, { useEffect, useRef, useState, useCallback } from 'react';
import Cookies from "js-cookie";
import {
    Users, Clipboard, Send, ArrowLeft, ArrowUpRight, Circle, CornerUpLeft, Check,
    Info, Trash2, Paperclip, Mic, Smile, X, File, Image as ImageIcon, Download,
    CheckCheck, Play, Link as LinkIcon, FolderOpen, ChevronDown, Pause, Volume2, Eye, CornerUpRight, AlertTriangle
} from 'lucide-react';
import { BsThreeDotsVertical } from "react-icons/bs";

import EmojiPicker from 'emoji-picker-react';

import { decryptMessage } from './encryptmsg';
import Loader from '../../ReusableComponents/Loader/loader';


import loaderImage from "/logo.png"
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
    isInputDisabled,      // ✅ ADD THIS
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

}) => {



    const [countdown, setCountdown] = useState(0);




    const containerRef = useRef(null);
    const headerRef = useRef(null);
    const messagesAreaRef = useRef(null);
    // const { handleReadReceipt } = useChat();
    const inputRef = useRef(null);

    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const prevMessagesLengthRef = useRef(0);

    const [showErrorDetail, setShowErrorDetail] = useState(null);
    const [showHeaderMenu, setShowHeaderMenu] = useState(false);
    const [isComponentLoading, setIsComponentLoading] = useState(true);
    const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

    const [viewingImage, setViewingImage] = useState(null);


    const justCompletedInitialLoadRef = useRef(false);

    const allMessages = messages;


    console.log(allMessages, "allmessages")
    const hasMoreOldMessagesRef = useRef(hasMoreOldMessages);
    const isLoadingOlderRef = useRef(isLoadingOlder);

    useEffect(() => { hasMoreOldMessagesRef.current = hasMoreOldMessages; }, [hasMoreOldMessages]);
    useEffect(() => { isLoadingOlderRef.current = isLoadingOlder; }, [isLoadingOlder]);



    const scrollPositionRef = useRef(null);
    const previousScrollHeightRef = useRef(0);
    const isAtBottomRef = useRef(true);
    const [userScrolledUp, setUserScrolledUp] = useState(false);
    const isRestoringScrollRef = useRef(false);
    const [newMessagesCount, setNewMessagesCount] = useState(0);

    const [copiedMessageId, setCopiedMessageId] = useState(null);
    const [activeGroupTab, setActiveGroupTab] = useState('overview');
    const membersContainerRef = useRef(null);
    const lastScrollTop = useRef(0);




    // After the isComponentLoading state declaration
    useEffect(() => {
        if (!isComponentLoading && messages?.length > 0) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
                    isAtBottomRef.current = true;
                });
            });
        }
    }, [isComponentLoading]); // only fires when spinner disappears


    const getFileUrl = (msg) => {
        return msg.msgBody?.media?.file_url ||
            msg.fileUrl ||
            msg.msgBody?.media?.fileUrl ||
            null;
    };

    const getFileType = (msg) => {
        return msg.msgBody?.media?.file_type ||
            msg.msgBody?.media?.fileType ||
            null;
    };

    const getFileName = (msg) => {
        return msg.msgBody?.media?.fileName ||
            msg.msgBody?.message ||
            'File';
    };

    const getFileSize = (msg) => {
        return msg.msgBody?.media?.file_size ||
            msg.msgBody?.media?.fileSize ||
            null;
    };



    const [showReportModal, setShowReportModal] = useState(false);
    const [reportingMessage, setReportingMessage] = useState(null);
    const [reportReason, setReportReason] = useState('');
    const [reportDescription, setReportDescription] = useState('');



    const sidebarMenuItems = [
        { id: 'overview', icon: Info, label: 'Overview' },
        { id: 'members', icon: Users, label: `${members?.length || 0} Members` },
        { id: 'media', icon: ImageIcon, label: 'Media' },
        { id: 'files', icon: File, label: 'Files' },
        { id: 'links', icon: LinkIcon, label: 'Links' }
    ];
    // Track which messages have been observed for read receipts
    const [observedMessages, setObservedMessages] = useState(new Set());
    const observerRef = useRef(null);





    useEffect(() => {
        let timer;
        if (isInputDisabled) {
            setCountdown(60);
            timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setIsInputDisabled(false); // re-enable input
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isInputDisabled]);

    const storedData = Cookies.get("adminUserData");

    let token = "";
    let userRole = "";
    let username = "";

    if (storedData) {
        const parsed = JSON.parse(storedData);

        token = parsed?.data?.token || "";
        userRole = parsed.data.role;
        username = parsed?.data?.username || "";
    }




    // Add this helper function near the top of your component
    const canSendMessages = (role) => {
        return role === 0 || role === 2 || role === 3;
    };

    const isRoleDisabled = !canSendMessages(userRole);

    const [showReadReceipts, setShowReadReceipts] = useState(false);
    const [selectedMessageForReceipts, setSelectedMessageForReceipts] = useState(null);


    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const [localOpenMenuId, setLocalOpenMenuId] = useState(null);
    const effectiveOpenMenuId = typeof openMenuId !== 'undefined' ? openMenuId : localOpenMenuId;
    const setEffectiveOpenMenuId = (v) => {
        if (typeof setOpenMenuId === 'function') setOpenMenuId(v);
        else setLocalOpenMenuId(v);
    };


    useEffect(() => {
        // Simulate component load - wait for essential data
        const timer = setTimeout(() => {
            if (selectedGroup && messages !== undefined) {
                setIsComponentLoading(false);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [selectedGroup, messages]);

    // Reset loading when group changes
    useEffect(() => {
        setIsComponentLoading(true);
    }, [selectedGroup?.id]);






    const handleReportMessage = (msg) => {
        setReportingMessage(msg);
        setShowReportModal(true);
        setEffectiveOpenMenuId(null);
    };


    const downloadFileToDesktop = async (fileUrl, fileName) => {
        try {
            // Fetch the file
            const response = await fetch(fileUrl, {
                mode: 'cors',
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const blob = await response.blob();

            // Create blob URL
            const blobUrl = window.URL.createObjectURL(blob);

            // Create temporary link
            const link = document.createElement('a');
            link.style.display = 'none';
            link.href = blobUrl;
            link.download = fileName || 'download';

            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            }, 100);

        } catch (err) {
            // Fallback: try direct download
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = fileName || 'download';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    useEffect(() => {
        const container = membersContainerRef.current;
        if (!container || activeGroupTab !== 'members') return;

        let scrollTimeout;

        const handleScroll = () => {
            clearTimeout(scrollTimeout);

            scrollTimeout = setTimeout(() => {
                const { scrollTop, scrollHeight, clientHeight } = container;

                const scrollPercentage = ((scrollTop + clientHeight) / scrollHeight) * 100;

                if (scrollPercentage > 90 && userPage < totalPages && !isLoadingUsers) {
                    if (typeof loadNextPage === 'function') {
                        loadNextPage();
                    }
                }

                if (scrollPercentage < 10 && userPage > 1 && !isLoadingUsers) {
                    if (typeof loadPrevPage === 'function') {
                        loadPrevPage();
                    }
                }
            }, 300);
        };

        container.addEventListener('scroll', handleScroll);

        return () => {
            clearTimeout(scrollTimeout);
            container.removeEventListener('scroll', handleScroll);
        };
    }, [activeGroupTab, isLoadingUsers, userPage, totalPages, loadNextPage, loadPrevPage]);

    // Close header menu on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showHeaderMenu) {
                setShowHeaderMenu(false);
            }
        };

        if (showHeaderMenu) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showHeaderMenu]);



    // Check if user has seen welcome message
    useEffect(() => {
        if (selectedGroup && currentUser) {
            const welcomeKey = `jaimx_welcome_${currentUser.id}_${selectedGroup.id}`;
            const hasSeenWelcome = Cookies.get(welcomeKey);

            if (!hasSeenWelcome) {
                setShowWelcomeMessage(true);
            }
        }
    }, [selectedGroup?.id, currentUser?.id]);

    // Reset welcome message when group changes
    useEffect(() => {
        if (selectedGroup) {
            const welcomeKey = `jaimx_welcome_${currentUser.id}_${selectedGroup.id}`;
            const hasSeenWelcome = Cookies.get(welcomeKey);
            setShowWelcomeMessage(!hasSeenWelcome);
        }
    }, [selectedGroup?.id]);

    const submitReport = () => {
        if (!reportReason) {
            alert('Please select a reason');
            return;
        }

        const reportData = {
            msgId: reportingMessage.msgId || reportingMessage._id?.toString(),
            chatId: selectedGroup.chatId,
            reportedBy: currentUser.id,
            reportedByName: currentUser.name,
            reportedUser: reportingMessage.fromUserId,
            reportedUserName: reportingMessage.publisherName || reportingMessage.senderName,
            reason: reportReason,
            description: reportDescription,
            messageContent: reportingMessage.msgBody?.message || 'Media message',
            timestamp: Date.now()
        };

        // Call the parent function to handle report
        if (reportMessage) {
            reportMessage(reportData);
        }

        // Reset and close modal
        setShowReportModal(false);
        setReportingMessage(null);
        setReportReason('');
        setReportDescription('');
    };


    const handleDismissWelcome = () => {
        const welcomeKey = `jaimx_welcome_${currentUser.id}_${selectedGroup.id}`;
        Cookies.set(welcomeKey, 'true');
        setShowWelcomeMessage(false);
    };

    const handleSendMessage = () => {
        if (isInputDisabled) {
            // Show visual feedback instead of sending
            const warningDiv = document.createElement('div');
            warningDiv.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse';
            warningDiv.textContent = 'Please wait! You are sending messages too quickly.';
            document.body.appendChild(warningDiv);

            setTimeout(() => {
                warningDiv.remove();
            }, 3000);
            return;
        }
        if (message?.trim()) {
            onSendMessage?.();
        }
    };

    useEffect(() => {
        const messagesArea = messagesAreaRef.current;
        if (!messagesArea) {
            console.log("❌ messagesAreaRef still NULL");
            return;
        }

        console.log("✅ Scroll listener attached");
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
                if (distanceFromTop < 200 && hasMoreOldMessagesRef.current && !isLoadingOlderRef.current) {
                    console.log("✅ Calling loadOlderMessages");
                    loadOlderMessages();
                }
                if (distanceFromBottom < 200 && hasMoreNewMessages && !isLoadingNewer && !isAtBottomRef.current) {
                    loadNewerMessages();
                }
            }, 200);
        };

        messagesArea.addEventListener('scroll', handleScroll);

        return () => {
            clearTimeout(scrollTimeout);
            messagesArea.removeEventListener('scroll', handleScroll);
        };

    }, [
        isComponentLoading,        // ✅ THIS is the fix — re-runs when spinner disappears
        isInitialMessagesLoad,     // ✅ also re-run when messages finish loading
        loadOlderMessages,
        loadNewerMessages,
        hasMoreNewMessages,
        isLoadingNewer
    ]);


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


    const handleEmojiClick = (emojiObject) => {
        setMessage(prev => prev + emojiObject.emoji);
        setShowEmojiPicker(false);

        // Focus input after emoji insertion
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };




    useEffect(() => {
        const messagesArea = messagesAreaRef.current;
        if (!messagesArea) return;

        if (isLoadingOlder && !scrollPositionRef.current) {
            // Only store if we don't already have one
            const visibleMessages = messagesArea.querySelectorAll('[data-msg-id]');

            if (visibleMessages.length > 0) {
                // Find the first message that's currently visible in viewport
                const containerRect = messagesArea.getBoundingClientRect();

                for (let msg of visibleMessages) {
                    const rect = msg.getBoundingClientRect();

                    // Check if message is visible (top is within viewport)
                    if (rect.top >= containerRect.top && rect.top <= containerRect.bottom) {
                        const msgId = msg.getAttribute('data-msg-id');
                        scrollPositionRef.current = msgId;
                        isRestoringScrollRef.current = true;
                        break;
                    }
                }
            }
        }
    }, [isLoadingOlder]);

    useEffect(() => {
        const messagesArea = messagesAreaRef.current;
        if (!messagesArea) return;

        // Only restore when loading finishes AND we have a stored position
        if (!isLoadingOlder && scrollPositionRef.current && isRestoringScrollRef.current) {
            // console.log("🔄 Attempting to restore scroll to message:", scrollPositionRef.current);

            // Use multiple animation frames to ensure DOM is fully rendered
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const targetElement = document.getElementById(`msg-${scrollPositionRef.current}`);

                    if (targetElement) {
                        targetElement.scrollIntoView({ block: 'start', behavior: 'instant' });
                    } else {
                        console.log(" Target message not found in DOM");
                    }

                    // Clear the stored position and flag
                    scrollPositionRef.current = null;
                    isRestoringScrollRef.current = false;
                });
            });
        }
    }, [isLoadingOlder, messages.length]);

    useEffect(() => {

        if (!selectedGroup || !messagesAreaRef.current || !currentUser?.id) {

            return;
        }

        // Cleanup previous observer
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        const observerOptions = {
            root: messagesAreaRef.current,
            threshold: 0.7,
            rootMargin: "-20px 0px -20px 0px"
        };


        observerRef.current = new IntersectionObserver((entries) => {

            const now = Date.now();

            entries.forEach((entry) => {
                const msgId = entry.target.getAttribute("data-msg-id");
                const fromUserId = entry.target.getAttribute("data-from-user-id");


                if (!entry.isIntersecting || entry.intersectionRatio < 0.7) {
                    return;
                }

                if (!msgId || !fromUserId) {
                    return;
                }

                if (fromUserId === currentUser.id.toString()) {
                    return;
                }

                if (observedMessages.has(msgId)) {
                    return;
                }


                setObservedMessages(prev => {
                    const newSet = new Set(prev);
                    newSet.add(msgId);
                    return newSet;
                });

                // Call local handler (optional - for local UI updates)
                if (onMarkAsRead) {
                    onMarkAsRead({
                        msgId,
                        groupId: selectedGroup.id,
                        chatId: selectedGroup.chatId,
                        userId: currentUser.id,
                        timestamp: now
                    });
                }

                if (socketRef?.current?.connected && typeof socketRef.current.emit === 'function') {

                    socketRef.current.emit("message:read", {
                        msgId,
                        chatId: selectedGroup.chatId,
                        userId: currentUser.id,
                        readAt: now
                    });

                } else {
                    console.error("Socket not ready", {
                        exists: !!socketRef?.current,
                        connected: socketRef?.current?.connected,
                        hasEmit: typeof socketRef?.current?.emit === 'function'
                    });
                }
            });
        }, observerOptions);


        // Observe message elements
        const setupObserver = () => {
            const messageElements =
                messagesAreaRef.current?.querySelectorAll("[data-msg-id]");


            if (messageElements?.length) {
                let observedCount = 0;
                messageElements.forEach((el) => {
                    const msgId = el.getAttribute("data-msg-id");
                    const fromUserId = el.getAttribute("data-from-user-id");

                    if (msgId && fromUserId) {
                        observerRef.current.observe(el);
                        observedCount++;
                    }
                });
            } else {
                console.warn(" No message elements found to observe");
            }
        };

        const timeoutId = setTimeout(setupObserver, 100);

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
        socketRef
    ]);

    useEffect(() => {
        setObservedMessages(new Set());
    }, [selectedGroup?.id]);


    useEffect(() => {
        const messagesArea = messagesAreaRef.current;
        if (!messagesArea || !messages?.length) return;

        if (isRestoringScrollRef.current) {
            prevMessagesLengthRef.current = messages.length;
            return;
        }

        if (isLoadingOlder) {
            prevMessagesLengthRef.current = messages.length;
            return;
        }

        if (isInitialLoad) {
            // Only scroll if the overlay is gone (messagesEndRef exists)
            if (!isInitialMessagesLoad && !isLoadingMessages) {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
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

        if (currentLength <= prevLength) {
            return;
        }

        const lastMessage = messages[currentLength - 1];
        const previousLastMessage = prevLength > 0 ? messages[prevLength - 1] : null;

        if (previousLastMessage && lastMessage.msgId === previousLastMessage.msgId) {
            prevMessagesLengthRef.current = currentLength;
            return;
        }

        const isMyMessage = lastMessage?.fromUserId?.toString() === currentUser?.id?.toString();

        if (isMyMessage) {
            requestAnimationFrame(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            });
        } else if (isAtBottomRef.current) {
            requestAnimationFrame(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            });
            setNewMessagesCount(0);
        } else {
            setNewMessagesCount(prev => prev + 1);
        }

        prevMessagesLengthRef.current = currentLength;

    }, [messages?.length, currentUser?.id, isInitialLoad, isInitialMessagesLoad, isLoadingMessages]);

    useEffect(() => {
        const messagesArea = messagesAreaRef.current;
        if (!messagesArea) return;

        let scrollTimeout;
        const handleScroll = () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                console.log("User scrolled - observer will detect visible messages");
            }, 150);
        };

        messagesArea.addEventListener('scroll', handleScroll);
        return () => {
            clearTimeout(scrollTimeout);
            messagesArea.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const getMessageReadStatus = (msg) => {
        const isCurrentUser = msg.fromUserId?.toString() === currentUser?.id?.toString();

        if (!isCurrentUser) return null;

        const readBy = msg.metaData?.readBy || [];
        const totalMembers = members?.length || 0;
        const readCount = readBy.length;

        if (!msg.metaData?.isSent) {
            return 'sending';
        }

        if (readCount === 0) {
            return 'sent';
        }

        if (readCount >= totalMembers - 1) {
            return 'read_all';
        }

        return 'read_some';
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
                left: Math.max(16, (container?.clientWidth || 300) - 220)
            });
            setEffectiveOpenMenuId(msgId);
            return;
        }

        const msgRect = msgElem.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const headerRect = header ? header.getBoundingClientRect() : { bottom: containerRect.top };

        const spaceAbove = msgRect.top - containerRect.top - (headerRect.height || 0);
        const spaceBelow = containerRect.bottom - msgRect.bottom;

        const MENU_W = 180;
        const MENU_H = 160;
        const GAP = 8;

        let left;
        if (isCurrentUser) {
            left = msgRect.right - MENU_W;
            if (left + MENU_W > containerRect.right - 8) left = containerRect.right - 8 - MENU_W;
            if (left < containerRect.left + 8) left = containerRect.left + 8;
        } else {
            left = msgRect.left;
            if (left < containerRect.left + 8) left = containerRect.left + 8;
            if (left + MENU_W > containerRect.right - 8) left = containerRect.right - 8 - MENU_W;
        }

        let top;
        if (spaceAbove > MENU_H + GAP) {
            top = msgRect.top - MENU_H - GAP;
        } else if (spaceBelow > MENU_H + GAP) {
            top = msgRect.bottom + GAP;
        } else {
            top = Math.min(
                Math.max(containerRect.top + 8, msgRect.bottom + GAP),
                containerRect.bottom - MENU_H - 8
            );
        }

        setMenuPosition({ top: Math.round(top - containerRect.top), left: Math.round(left - containerRect.left) });
        setEffectiveOpenMenuId(msgId);
    };



    const scrollToMessage = (msgId) => {
        const msgElement = document.getElementById(`msg-${msgId}`);
        if (msgElement) {
            msgElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            msgElement.classList.add('bg-[#0a6a72]');
            setTimeout(() => {
                msgElement.classList.remove('bg-[#0a6a72]');
            }, 2000);
        }
    };




    // Setup Intersection Observer for read receipts
    useEffect(() => {
        if (!selectedGroup || !messagesAreaRef.current) return;

        const observerOptions = {
            root: messagesAreaRef.current,
            threshold: 0.5,
            rootMargin: '0px'
        };

        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const msgId = entry.target.getAttribute('data-msg-id');
                    const fromUserId = entry.target.getAttribute('data-from-user-id');

                    if (msgId && fromUserId !== currentUser?.id?.toString() && !observedMessages.has(msgId)) {
                        setObservedMessages(prev => new Set([...prev, msgId]));

                        if (onMarkAsRead) {
                            onMarkAsRead({
                                msgId,
                                groupId: selectedGroup.id,
                                userId: currentUser?.id
                            });
                        }
                    }
                }
            });
        }, observerOptions);

        const messageElements = messagesAreaRef.current.querySelectorAll('[data-msg-id]');
        messageElements.forEach(el => observerRef.current?.observe(el));

        return () => {
            observerRef.current?.disconnect();
        };

    }, [selectedGroup, messages, currentUser, observedMessages, onMarkAsRead]);

    useEffect(() => {
        setObservedMessages(new Set());
        setIsInitialLoad(true);
        setNewMessagesCount(0);
        setUserScrolledUp(false);
        isAtBottomRef.current = true;
        justCompletedInitialLoadRef.current = false;
    }, [selectedGroup?.id]);

    const handleCopyMessage = (messageText, id) => {
        if (!messageText) return;

        let textToCopy = messageText;

        // Handle encrypted object
        if (typeof messageText === 'object' && messageText !== null) {
            if (messageText.cipherText && groupKey) {
                try {
                    textToCopy = decryptMessage(messageText, groupKey);
                } catch (err) {
                    textToCopy = "[Encrypted message]";
                }
            } else {
                textToCopy = "[Unable to copy]";
            }
        }
        // Handle already decrypted string
        else if (typeof messageText === 'string') {
            textToCopy = messageText;
        }
        // Handle any other type
        else {
            textToCopy = String(messageText || '');
        }

        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                setCopiedMessageId(id);
                setTimeout(() => setCopiedMessageId(null), 2000);
            })
            .catch((err) => console.error("Failed to copy:", err));
    };


    const saveToDesktop = (fileUrl, fileName) => {
        try {
            // Create a temporary anchor element
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = fileName || 'download'; // Set the filename
            link.target = '_blank'; // Open in new tab as fallback

            // Append to body (required for Firefox)
            document.body.appendChild(link);

            // Trigger the download
            link.click();

            // Clean up
            document.body.removeChild(link);

        } catch (err) {
            alert('Failed to download file');
        }
    };

    // Fallback download method
    const fallbackDownload = (fileUrl, fileName) => {
        try {
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = fileName;
            link.target = '_blank';

            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (err) {
            alert('Failed to download file. Please try opening the file in a new tab.');
        }
    };

    // Show read receipts for a message
    const showMessageReadReceipts = (msg) => {
        setSelectedMessageForReceipts(msg);
        setShowReadReceipts(true);
        ReadInfoButton(prev => !prev)
        setEffectiveOpenMenuId(null);
        handleReadReceipt(msg);
    };

    // close menu on outside click
    useEffect(() => {
        const onWindowClick = (ev) => {
            setEffectiveOpenMenuId(null);
        };
        window.addEventListener('click', onWindowClick);
        return () => window.removeEventListener('click', onWindowClick);
    }, []);


    // close menu on ESC
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setEffectiveOpenMenuId(null);
                setShowReadReceipts(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // reposition/close on resize
    useEffect(() => {
        const onResize = () => setEffectiveOpenMenuId(null);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const getTypingText = () => {
        if (!typingUsers || typingUsers.length === 0) return null;
        if (typingUsers.length === 1) return `${typingUsers[0].userName} is typing`;
        if (typingUsers.length === 2) return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`;
        return `${typingUsers.length} people are typing...`;
    };

    const groupedMessages = groupMessagesByDate(messages || []);
    const uploadProgress = uploadingFile ? 50 : 0;


    return (
        <>
            {
                isComponentLoading ? (
                    <Loader />
                ) : (
                    <div ref={containerRef} className="flex-1 flex flex-col relative h-full sidebar-scroll">

                        {selectedGroup && (
                            <div ref={headerRef} className="bg-[#085056] p-2 sm:p-4 flex items-center justify-between border-b border-[#2a3942] sidebar-scroll">
                                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 sidebar-scroll">


                                    <div
                                        onClick={() => {
                                            setShowMembers(true);
                                            setShowFilesPanel(false);
                                        }}
                                        className="flex items-center gap-3 flex-1 cursor-pointer  p-2 rounded-lg transition-colors min-w-0 ml-2"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00a884] to-[#008069] flex items-center justify-center text-xl flex-shrink-0">
                                            <img src="https://res.cloudinary.com/ddefr5owc/image/upload/v1766049897/logo_xwrr9w.png" alt="" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h2 className="font-semibold truncate">{selectedGroup?.name}</h2>
                                            {typingUsers?.length > 0 ? (
                                                <div className="flex items-center gap-1">
                                                    <p className="text-xs text-white truncate animate-pulse">
                                                        {getTypingText()}
                                                    </p>
                                                    <div className="flex gap-0.5">
                                                        <span className="w-1 h-1 bg-[#00a884] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                        <span className="w-1 h-1 bg-[#00a884] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                        <span className="w-1 h-1 bg-[#00a884] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-400 truncate">{totalUsers ?? 0} members</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowHeaderMenu(prev => !prev);
                                        }}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                                    >
                                        <BsThreeDotsVertical className='w-6 h-6' />
                                    </button>


                                    {showHeaderMenu && (
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-[#202c33] rounded-lg shadow-xl border border-[#2a3942] overflow-hidden z-50">

                                            <button
                                                onClick={() => {
                                                    setShowFilesPanel(true);
                                                    setShowMembers(false);
                                                    setActiveGroupTab('overview');
                                                    setShowHeaderMenu(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#0b141a] text-left transition-colors"
                                            >
                                                <FolderOpen className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm">Shared Files</span>
                                            </button>

                                            <div className="border-t border-[#2a3942]">
                                                <button
                                                    onClick={() => {
                                                        setShowClearChatModal(true);
                                                        setShowHeaderMenu(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-600/10 text-left transition-colors text-white-400"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span className="text-sm ">Clear Chat</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}


                        {/* MESSAGES */}
                        {selectedGroup && !showMembers && !showFilesPanel && (
                            <div
                                ref={messagesAreaRef}
                                className="flex-1 overflow-y-auto p-2 sm:p-4 bg-[#0b141a] relative z-10 sidebar-scroll"
                                style={{
                                    overflowAnchor: 'none'
                                }}
                            >
                                {isInitialMessagesLoad && isLoadingMessages ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111b21]/80 z-50">
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111b21]/80 z-50">
                                            <div className="relative w-20 h-20">
                                                <div className="absolute inset-0 rounded-full border-4 border-[#202c33] border-t-[#00a884] animate-spin"></div>
                                                <div
                                                    className="absolute inset-0 rounded-full border-4 border-transparent border-b-[#00a884]/40 animate-spin"
                                                    style={{ animationDirection: "reverse", animationDuration: "1s" }}
                                                ></div>
                                                <img
                                                    src={loaderImage}
                                                    alt="loader"
                                                    className="absolute inset-0 m-auto w-10 h-10 object-contain"
                                                />
                                            </div>
                                        </div>

                                        <p className="text-lg mt-6 mb-1 font-medium text-gray-300">
                                            Loading messages…
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Please wait
                                        </p>
                                    </div>

                                ) : (
                                    <>
                                        {isLoadingOlder && (
                                            <div className="flex justify-center py-2 mb-2">
                                                <div className="bg-[#202c33] px-4 py-2 rounded-full flex items-center gap-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00a884]"></div>
                                                    <span className="text-xs text-gray-400">Loading older messages...</span>
                                                </div>
                                            </div>
                                        )}

                                        {(!messages || messages.length === 0) ? (
                                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                                <Users className="w-20 h-20 mb-4 opacity-30" />
                                                <p className="text-lg mb-2">No messages yet</p>
                                                <p className="text-sm">Start the conversation!</p>
                                            </div>
                                        ) : (
                                            <>
                                                {Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
                                                    <div key={dateKey}>
                                                        <div className="flex justify-center my-4">
                                                            <span className="bg-[#202c33] px-3 py-1 rounded-full text-xs text-gray-400">
                                                                {formatDateHeader(dateKey)}
                                                            </span>
                                                        </div>

                                                        {dateMessages.map((msg) => {
                                                            const id = msg.msgId || msg.id;

                                                            if (msg.deletedFor && Array.isArray(msg.deletedFor)) {
                                                                const isDeletedForMe = msg.deletedFor.some(userId => {
                                                                    const userIdStr = userId?.toString();
                                                                    const currentUserIdStr = currentUser?.id?.toString();
                                                                    return userIdStr === currentUserIdStr;
                                                                });

                                                                if (isDeletedForMe) {
                                                                    return null;
                                                                }
                                                            }

                                                            const isCurrentUser = msg.fromUserId?.toString() === currentUser?.id?.toString();
                                                            const containerBg = isCurrentUser ? "bg-[#005c4b] text-white" : "bg-[#202c33] text-gray-200";
                                                            const readStatus = getMessageReadStatus(msg);

                                                            let messageText = msg.msgBody?.message;
                                                            let decryptedText = '';
                                                            let wasEncryptedObject = false;

                                                            if (typeof messageText === 'object' && messageText !== null) {
                                                                wasEncryptedObject = true;

                                                                if (messageText.cipherText && groupKey) {
                                                                    try {
                                                                        decryptedText = decryptMessage(messageText, groupKey);
                                                                    } catch (err) {
                                                                        decryptedText = "[Encrypted message]";
                                                                    }
                                                                } else {
                                                                    decryptedText = "sending";
                                                                }
                                                            }

                                                            else if (typeof messageText === 'string') {
                                                                console.log("📝 Message is already a string");
                                                                decryptedText = messageText;
                                                            }

                                                            else {
                                                                decryptedText = String(messageText || '');
                                                            }

                                                            if (groupKey && messageText && !msg.deletedForEveryone) {
                                                                try {
                                                                    if (messageText.includes('') || messageText.length > 100) {
                                                                        decryptedText = decryptMessage(messageText, groupKey);
                                                                    }
                                                                } catch (err) {
                                                                    decryptedText = messageText;
                                                                }
                                                            }

                                                            return (
                                                                <div
                                                                    key={`${id}-${msg.timestamp}`}
                                                                    id={`msg-${id}`}
                                                                    data-msg-id={id}
                                                                    data-from-user-id={msg.fromUserId}
                                                                    className={`mb-4 flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                                                                >
                                                                    <div className={`relative max-w-[75%] sm:max-w-[60%] rounded-tl-2xl rounded-br-2xl rounded-bl-2xl bg-[#1d8e85] p-3 text-white p-2 sm:p-3 shadow-md ${containerBg}`}>
                                                                        {!isCurrentUser && (
                                                                            <div className="text-xs text-[#00a884] mb-1 font-semibold">
                                                                                {msg.fromUserId}
                                                                            </div>
                                                                        )}

                                                                        {msg.replyTo && (
                                                                            <div
                                                                                className="mb-2 p-2 bg-black/20 rounded border-l-4 border-[#00a884] cursor-pointer hover:bg-black/30"
                                                                                onClick={() => scrollToMessage(msg.replyTo.msgId)}
                                                                            >
                                                                                <div className="text-xs text-[#00a884] font-semibold mb-1">
                                                                                    {msg.replyTo.senderName || 'User'}
                                                                                </div>
                                                                                <div className="text-xs text-gray-400 truncate">
                                                                                    {(() => {
                                                                                        let replyText = msg.replyTo.message;

                                                                                        if (typeof replyText === 'object' && replyText?.cipherText) {
                                                                                            try {
                                                                                                replyText = decryptMessage(replyText, groupKey);
                                                                                            } catch {
                                                                                                replyText = '[Encrypted]';
                                                                                            }
                                                                                        }

                                                                                        return String(replyText || 'Media message');
                                                                                    })()}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {!msg.deletedForEveryone && getFileUrl(msg) && getFileType(msg)?.startsWith('image/') && (
                                                                            <div className="relative group max-w-xs">
                                                                                <div className="relative rounded-lg overflow-hidden">
                                                                                    <img
                                                                                        src={getFileUrl(msg)}
                                                                                        alt={getFileName(msg)}
                                                                                        className={`rounded-lg max-w-full transition-all ${msg.msgBody.media.is_uploading
                                                                                            ? 'opacity-60 cursor-wait'
                                                                                            : 'cursor-pointer hover:opacity-90'
                                                                                            }`}
                                                                                        onClick={() => {
                                                                                            if (!msg.msgBody?.media?.is_uploading &&
                                                                                                getFileUrl(msg) &&
                                                                                                !getFileUrl(msg).startsWith('blob:')) {
                                                                                                window.open(getFileUrl(msg), '_blank');
                                                                                            }
                                                                                        }}
                                                                                    />

                                                                                    <div className="absolute top-2 right-2 bg-[#397378] backdrop-blur-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                        <span className="text-white text-xs font-bold flex items-center gap-1">
                                                                                            <Eye className="w-3 h-3" />
                                                                                            View
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {!msg.deletedForEveryone && getFileUrl(msg) && !getFileType(msg)?.startsWith('image/') && (
                                                                            <div className="max-w-xs">
                                                                                <div
                                                                                    className={`group relative flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-[#1a2332] to-[#0f1419] border  transition-all ${msg.msgBody.media.is_uploading ? 'opacity-60' : 'hover:scale-[1.02] cursor-pointer'
                                                                                        }`}
                                                                                    onClick={() => {
                                                                                        if (!msg.msgBody?.media?.is_uploading && getFileUrl(msg)) {
                                                                                            window.open(getFileUrl(msg), '_blank');
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <div className="absolute inset-0  opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>

                                                                                    <div className="relative w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 border border-white group-hover:scale-110 transition-transform">
                                                                                        <File className="w-6 h-6 text-white" />
                                                                                        <div className="absolute inset-0 rounded-lg  animate-pulse opacity-0 group-hover:opacity-100"></div>
                                                                                    </div>

                                                                                    <div className="flex-1 min-w-0 relative z-10">
                                                                                        <p className="font-semibold text-sm truncate text-white flex items-center gap-2">
                                                                                            {getFileName(msg)}
                                                                                            <ArrowUpRight className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                                        </p>

                                                                                        <div className="flex items-center gap-2 mt-1">
                                                                                            <p className="text-xs text-gray-400">
                                                                                                {getFileSize(msg) ? formatFileSize(getFileSize(msg)) : 'Unknown size'}
                                                                                            </p>

                                                                                            {!msg.msgBody.media.is_uploading && (
                                                                                                <span className="text-xs text-white-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                                    • Click to open
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>

                                                                                    {!msg.msgBody.media.is_uploading && (
                                                                                        <div className="relative z-10 p-2 rounded-lg bg-black opacity-0 group-hover:opacity-100 transition-all group-hover:scale-110 shadow-lg shadow-orange-500/30">
                                                                                            <Download className="w-4 h-4 text-white" />
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {msg.deletedForEveryone ? (
                                                                            <div className="text-sm break-words whitespace-pre-wrap">
                                                                                <span className="italic text-gray-400">This message was deleted</span>
                                                                            </div>
                                                                        ) : (
                                                                            <>
                                                                                {!getFileUrl(msg) && (
                                                                                    <div className="text-sm break-words whitespace-pre-wrap">
                                                                                        {msg.deletedForEveryone ? (
                                                                                            <span className="italic text-gray-400">This message was deleted</span>
                                                                                        ) : msg.isreported && msg.isreported.count >= 3 && msg.isreported.isHidden ? (
                                                                                            <div className="flex items-center gap-2 text-gray-400 italic">
                                                                                                <span></span>
                                                                                            </div>
                                                                                        ) : (
                                                                                            renderMessageWithLinks(decryptedText)
                                                                                        )}
                                                                                    </div>
                                                                                )}

                                                                                {msg.deletedForEveryone && getFileUrl(msg) && (
                                                                                    <div className="text-sm break-words whitespace-pre-wrap">
                                                                                        <span className="italic text-gray-400">This message was deleted</span>
                                                                                    </div>
                                                                                )}
                                                                            </>
                                                                        )}


                                                                        {msg.isreported && msg.isreported.count >= 3 && msg.isreported.isHidden && (
                                                                            <div className="mb-2 p-2 bg-red-500/20 border border-red-500/50 rounded-md flex items-start gap-2">
                                                                                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="text-xs font-semibold text-red-400 mb-1">
                                                                                        This message has been reported {msg.isreported.count} times
                                                                                    </p>
                                                                                    <p className="text-xs text-red-300/80">
                                                                                        Multiple users have flagged this content as inappropriate
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        <div className="flex items-center justify-end gap-1 mt-1 text-xs text-gray-400">
                                                                            <span className='text-white'>{formatTime(msg.timestamp)}</span>

                                                                            {isCurrentUser && (
                                                                                <>
                                                                                </>
                                                                            )}

                                                                            {!msg.deletedForEveryone && (
                                                                                <button
                                                                                    className="ml-1 p-1 text-white hover:bg-white/20 rounded-full"
                                                                                    onClick={(e) => toggleMenu(id, e, isCurrentUser)}
                                                                                >
                                                                                    <ChevronDown className="w-4 h-4" />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ))}
                                            </>
                                        )}

                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>
                        )}


                        {showImagePreview && selectedImages.length > 0 && (
                            <div className="fixed inset-0 bg-black z-50 flex flex-col">
                                <div className="bg-[#202c33] p-4 flex items-center justify-between border-b border-[#2a3942]">
                                    <button
                                        onClick={cancelImageUpload}
                                        className="text-white hover:bg-white/10 p-2 rounded-full transition"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                    <h3 className="text-lg font-semibold text-white">
                                        {selectedImages.length} {selectedImages.length === 1 ? 'Photo' : 'Photos'}
                                    </h3>
                                    <div className="w-10" />
                                </div>

                                <div className="flex-1 overflow-y-auto p-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-4xl mx-auto">
                                        {selectedImages.map((img, index) => (
                                            <div key={index} className="relative group aspect-square">
                                                <img
                                                    src={img.preview}
                                                    alt={img.name}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />

                                                <button
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>

                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 rounded-b-lg">
                                                    <p className="truncate">{img.name}</p>
                                                    <p className="text-gray-300">{formatFileSize(img.size)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-[#202c33] p-4 border-t border-[#2a3942]">
                                    <div className="max-w-4xl mx-auto space-y-3">
                                        <input
                                            type="text"
                                            value={imageCaption}
                                            onChange={(e) => setImageCaption(e.target.value)}
                                            placeholder="Add a caption..."
                                            className="w-full px-4 py-3 bg-[#2a3942] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a884] placeholder-gray-400"
                                            maxLength={1000}
                                        />

                                        <button
                                            onClick={sendImageMessage}
                                            disabled={uploadingFile}
                                            className="w-full bg-[#00a884] hover:bg-[#008069] disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            {uploadingFile ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5" />
                                                    Send {selectedImages.length} {selectedImages.length === 1 ? 'Photo' : 'Photos'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showDocumentPreview && selectedDocument && (
                            <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                                <div className="bg-[#202c33] rounded-lg w-full max-w-md shadow-2xl">
                                    <div className="p-4 border-b border-[#2a3942] flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-white">Send Document</h3>
                                        <button
                                            onClick={cancelDocumentUpload}
                                            className="text-gray-400 hover:text-white transition"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-center gap-4 p-4 bg-[#0b141a] rounded-lg mb-4">
                                            <div className="w-16 h-16 rounded-lg bg-blue-500/20 flex items-center justify-center text-4xl flex-shrink-0">
                                                {selectedDocument.icon}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-white truncate text-lg">
                                                    {selectedDocument.name}
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    {formatFileSize(selectedDocument.size)}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {selectedDocument.type || 'Document'}
                                                </p>
                                            </div>
                                        </div>

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={(e) => {
                                                const accept = e.target.getAttribute('accept');
                                                if (accept?.includes('image')) {
                                                    handleImageSelect(e);
                                                } else {
                                                    handleDocumentSelect(e);
                                                }
                                            }}
                                            className="hidden"
                                            accept="image/*"
                                        />

                                        {uploadingFile && uploadProgress > 0 && (
                                            <div className="mb-4">
                                                <div className="flex justify-between text-xs mb-1 text-gray-300">
                                                    <span>Uploading...</span>
                                                    <span>{uploadProgress}%</span>
                                                </div>
                                                <div className="w-full bg-[#0b141a] rounded-full h-2">
                                                    <div
                                                        className="bg-[#00a884] h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={sendDocumentMessage}
                                            disabled={uploadingFile}
                                            className="w-full bg-[#00a884] hover:bg-[#008069] disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            {uploadingFile ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5" />
                                                    Send Document
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}


                        {showClearChatModal && (
                            <div
                                className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                                onClick={() => setShowClearChatModal(false)}
                            >
                                <div
                                    className="bg-[#202c33] rounded-lg max-w-md w-full shadow-xl"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="p-4 border-b border-[#2a3942]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                                <Trash2 className="w-5 h-5 text-red-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">Clear Chat?</h3>
                                                <p className="text-xs text-gray-400">
                                                    {selectedGroup?.name}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="mb-4">
                                            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 flex items-start gap-2">
                                                <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-semibold text-orange-400 mb-1">
                                                        This action cannot be undone
                                                    </p>
                                                    <p className="text-xs text-orange-300/80">
                                                        All messages, media, and files will be permanently deleted from your view.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setShowClearChatModal(false)}
                                                className="flex-1 bg-[#0b141a] hover:bg-[#1a2730] text-white py-2.5 rounded-lg font-medium text-sm transition-colors"
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                onClick={onClearChat}
                                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Clear Chat
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}



                        {showErrorDetail && (
                            <div
                                className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                                onClick={() => setShowErrorDetail(null)}
                            >
                                <div
                                    className="bg-[#202c33] rounded-lg max-w-sm w-full shadow-xl"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="p-4 border-b border-[#2a3942]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                                <svg
                                                    className="w-6 h-6 text-red-500"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">Message Not Sent</h3>
                                                <p className="text-xs text-gray-400">
                                                    {formatTime(showErrorDetail.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-[#0b141a] border-b border-[#2a3942]">
                                        <p className="text-xs text-gray-400 mb-1">Your message:</p>
                                        <p className="text-sm text-gray-200 line-clamp-2">
                                            {(() => {
                                                const msgText = showErrorDetail.msgBody?.message;

                                                if (typeof msgText === 'object' && msgText !== null) {
                                                    if (msgText.cipherText) {
                                                        try {
                                                            const decrypted = decryptMessage(msgText, SECRET_KEY);
                                                            return decrypted;
                                                        } catch (err) {
                                                            console.error("Failed to decrypt for modal:", err);
                                                            return "[Encrypted message]";
                                                        }
                                                    }
                                                    return "[Media message]";
                                                }

                                                return msgText || "Media message";
                                            })()}
                                        </p>
                                    </div>

                                    <div className="p-4">
                                        <div className="mb-4">
                                            <p className="text-xs text-gray-400 mb-2">Error reason:</p>
                                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                                <p className="text-sm text-red-400">
                                                    {showErrorDetail.error || "Unknown error occurred"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setShowErrorDetail(null);
                                                    if (retryMessage) {
                                                        retryMessage(showErrorDetail);
                                                    }
                                                }}
                                                className="flex-1 bg-[#00a884] hover:bg-[#008069] text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                                    />
                                                </svg>
                                                Retry
                                            </button>

                                            <button
                                                onClick={() => setShowErrorDetail(null)}
                                                className="flex-1 bg-[#0b141a] hover:bg-[#1a2730] text-white py-2.5 rounded-lg font-medium text-sm transition-colors"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}


                        {showFileTypeModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
                                <div className="w-full max-w-sm rounded-2xl bg-[#085358] border border-[#1e7f85] p-6">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="text-lg font-semibold text-white">
                                            Select file type
                                        </h3>
                                        <button
                                            onClick={() => setShowFileTypeModal(false)}
                                            className="p-2 rounded-full hover:bg-white/10 transition"
                                        >
                                            <X className="w-5 h-5 text-white/80" />
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={() => {
                                                fileInputRef?.current?.setAttribute("accept", "image/*");
                                                fileInputRef?.current?.setAttribute("multiple", "true");
                                                fileInputRef?.current?.click();
                                                setShowFileTypeModal(false);
                                            }}
                                            className="group w-full flex items-center gap-4 rounded-xl bg-[#0b646a] hover:bg-[#0f7278] p-4 transition active:scale-[0.97]"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-cyan-400/20 flex items-center justify-center">
                                                <ImageIcon className="w-6 h-6 text-cyan-300" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="text-base font-medium text-white">
                                                    Images
                                                </div>
                                                <div className="text-sm text-[#d1f5f7]">
                                                    Send images from your device
                                                </div>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => {
                                                fileInputRef?.current?.setAttribute(
                                                    "accept",
                                                    "application/pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx,.zip,.rar"
                                                );
                                                fileInputRef?.current?.removeAttribute("multiple");
                                                fileInputRef?.current?.click();
                                                setShowFileTypeModal(false);
                                            }}
                                            className="group w-full flex items-center gap-4 rounded-xl bg-[#0b646a] hover:bg-[#0f7278] p-4 transition active:scale-[0.97]"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-sky-400/20 flex items-center justify-center">
                                                <File className="w-6 h-6 text-sky-300" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="text-base font-medium text-white">
                                                    Documents
                                                </div>
                                                <div className="text-sm text-[#d1f5f7]">
                                                    PDFs, Word, Excel, PowerPoint files
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}



                        {selectedGroup && effectiveOpenMenuId && (
                            <div
                                className="position-absolute bg-dark border rounded shadow"
                                style={{
                                    width: "180px",
                                    top: menuPosition.top,
                                    left: menuPosition.left,
                                    zIndex: 1055,
                                    borderColor: "#444"
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                            </div>
                        )}

                        {selectedGroup && effectiveOpenMenuId && (
                            <div
                                className="absolute z-50 w-44 bg-[#202c33] rounded-lg shadow-lg border border-gray-700 overflow-hidden"
                                style={{
                                    top: menuPosition.top,
                                    left: menuPosition.left,
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-[#0b141a] w-full text-left text-sm"
                                    onClick={() => {
                                        const msg = messages?.find(m => (m.msgId || m.id) === effectiveOpenMenuId);
                                        if (msg) {
                                            handleReply(msg);
                                            setEffectiveOpenMenuId(null);
                                        }
                                    }}
                                >
                                    <CornerUpLeft className="w-4 h-4" /> Reply
                                </button>

                                {messages?.find(m => (m.msgId || m.id) === effectiveOpenMenuId)?.msgBody?.message && (
                                    <button
                                        className="flex items-center gap-2 px-3 py-2 hover:bg-[#0b141a] w-full text-left text-sm"
                                        onClick={() => handleCopyMessage(
                                            messages.find(m => (m.msgId || m.id) === effectiveOpenMenuId).msgBody.message,
                                            effectiveOpenMenuId
                                        )}
                                    >
                                        <Clipboard className="w-4 h-4" />
                                        {copiedMessageId === effectiveOpenMenuId ? "Copied" : "Copy"}
                                    </button>
                                )}

                                {messages?.find(m => (m.msgId || m.id) === effectiveOpenMenuId)?.status === "failed" && (
                                    <button
                                        className="flex items-center gap-2 px-3 py-2 hover:bg-[#0b141a] w-full text-left text-sm text-orange-400"
                                        onClick={() => {
                                            const msg = messages.find(m => (m.msgId || m.id) === effectiveOpenMenuId);
                                            if (msg) {
                                                retryMessage(msg);
                                                setEffectiveOpenMenuId(null);
                                            }
                                        }}
                                    >
                                        <CornerUpRight className="w-4 h-4" /> Retry
                                    </button>
                                )}

                                <button
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-[#0b141a] w-full text-left text-sm"
                                    onClick={() => {
                                        const msg = messages.find(m => (m.msgId || m.id) === effectiveOpenMenuId);
                                        if (msg) {
                                            const idToDelete = msg._id?.toString() || msg.msgId || msg.id;
                                            deleteForMe(idToDelete);
                                            setEffectiveOpenMenuId(null);
                                        }
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" /> Delete for Me
                                </button>

                                {(() => {
                                    const msg = messages?.find(m => (m.msgId || m.id) === effectiveOpenMenuId);
                                    const isOtherPersonMessage = msg?.fromUserId?.toString() !== currentUser?.id?.toString();

                                    if (isOtherPersonMessage) {
                                        return (
                                            <button
                                                className="flex items-center gap-2 px-3 py-2 hover:bg-[#0b141a] w-full text-left text-sm text-orange-400"
                                                onClick={() => {
                                                    if (msg) handleReportMessage(msg);
                                                }}
                                            >
                                                <AlertTriangle className="w-4 h-4" /> Report
                                            </button>
                                        );
                                    }
                                    return null;
                                })()}

                                {(() => {
                                    const msg = messages?.find(m => (m.msgId || m.id) === effectiveOpenMenuId);
                                    const isMyMessage = msg?.fromUserId?.toString() === currentUser?.id?.toString();

                                    if (isMyMessage) {
                                        return (
                                            <button
                                                className="flex items-center gap-2 px-3 py-2 hover:bg-red-600 text-red-400 hover:text-white w-full text-left text-sm"
                                                onClick={() => {
                                                    if (msg) {
                                                        const idToDelete = msg._id?.toString() || msg.msgId || msg.id;
                                                        deleteForEveryone(idToDelete);
                                                        setEffectiveOpenMenuId(null);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" /> Delete for Everyone
                                            </button>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        )}

                        {showReportModal && reportingMessage && (
                            <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2">
                                <div className="bg-[#202c33] rounded-lg w-full max-w-sm">

                                    <div className="p-3 border-b border-[#2a3942] flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-white">Report Message</h3>
                                        <button
                                            onClick={() => {
                                                setShowReportModal(false);
                                                setReportingMessage(null);
                                                setReportReason('');
                                                setReportDescription('');
                                            }}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="p-3 space-y-3">

                                        <div className="p-2 bg-[#0b141a] rounded-md border border-[#2a3942]">
                                            <p className="text-[11px] text-gray-400 mb-1">
                                                Message from {reportingMessage.publisherName || reportingMessage.senderName}
                                            </p>
                                            <p className="text-xs text-gray-200 break-words">
                                                {reportingMessage.msgBody?.message || "Media message"}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-300 mb-1">
                                                Why are you reporting this? *
                                            </label>

                                            <div className="space-y-1">
                                                {[
                                                    { value: 'spam', label: 'Spam' },
                                                    { value: 'harassment', label: 'Harassment' },
                                                    { value: 'violence', label: 'Violence' },
                                                    { value: 'inappropriate', label: 'Inappropriate' },
                                                    { value: 'other', label: 'Other' }
                                                ].map((option) => (
                                                    <label
                                                        key={option.value}
                                                        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer text-xs
                  ${reportReason === option.value
                                                                ? 'bg-[#00a884]/20 border border-[#00a884]'
                                                                : 'bg-[#0b141a] hover:bg-[#1a2730]'
                                                            }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="reportReason"
                                                            value={option.value}
                                                            checked={reportReason === option.value}
                                                            onChange={(e) => setReportReason(e.target.value)}
                                                            className="w-3 h-3 text-[#00a884]"
                                                        />
                                                        <span className="text-gray-200">{option.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-300 mb-1">
                                                Additional details (optional)
                                            </label>
                                            <textarea
                                                value={reportDescription}
                                                onChange={(e) => setReportDescription(e.target.value)}
                                                placeholder="More details..."
                                                rows={2}
                                                maxLength={500}
                                                className="w-full p-2 bg-[#0b141a] text-xs text-white rounded-md border border-[#2a3942] focus:ring-1 focus:ring-[#00a884] resize-none"
                                            />
                                            <p className="text-[10px] text-gray-500 text-right">
                                                {reportDescription.length}/500
                                            </p>
                                        </div>

                                        <div className="flex items-start gap-2 p-2 bg-orange-500/10 border border-orange-500/30 rounded-md">
                                            <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5" />
                                            <p className="text-[10px] text-orange-200">
                                                False reports may result in action on your account.
                                            </p>
                                        </div>

                                        <div className="flex gap-2 pt-1">
                                            <button
                                                onClick={() => {
                                                    setShowReportModal(false);
                                                    setReportingMessage(null);
                                                    setReportReason('');
                                                    setReportDescription('');
                                                }}
                                                className="flex-1 py-2 bg-[#0b141a] hover:bg-[#1a2730] text-xs text-white rounded-md"
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                onClick={submitReport}
                                                disabled={!reportReason}
                                                className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-xs text-white rounded-md"
                                            >
                                                Submit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}


                        {showReadReceipts && selectedMessageForReceipts && (
                            <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                                <div className="bg-[#202c33] rounded-lg max-w-md w-full max-h-[80vh] flex flex-col">
                                    <div className="p-4 border-b border-[#2a3942] flex items-center justify-between">
                                        <h3 className="text-lg font-semibold">Read by</h3>
                                        <button
                                            onClick={() => setShowReadReceipts(false)}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4">
                                        {selectedMessageForReceipts.metaData?.readBy?.length > 0 ? (
                                            <div className="space-y-3">
                                                {selectedMessageForReceipts.metaData.readBy.map((readInfo) => {
                                                    const member = members?.find(m => m.id === readInfo.userId);
                                                    return (
                                                        <div key={readInfo.userId} className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                                                {member?.name?.charAt(0).toUpperCase() || '?'}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-semibold">{member?.name || 'Unknown'}</p>
                                                                <p className="text-xs text-gray-400">
                                                                    {readInfo.readAt ? formatTime(readInfo.readAt) : 'Just now'}
                                                                </p>
                                                            </div>
                                                            <CheckCheck className="w-5 h-5 text-[#53bdeb]" />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                                                <Eye className="w-12 h-12 mb-3 opacity-30" />
                                                <p>No one has read this message yet</p>
                                            </div>
                                        )}

                                        {(() => {
                                            const readByIds = selectedMessageForReceipts.metaData?.readBy?.map(r => r.userId) || [];
                                            const unreadMembers = members?.filter(m =>
                                                m.id !== currentUser?.id && !readByIds.includes(m.id)
                                            );

                                            if (unreadMembers && unreadMembers.length > 0) {
                                                return (
                                                    <div className="mt-6">
                                                        <h4 className="text-sm text-gray-400 mb-3 font-semibold">Delivered to</h4>
                                                        <div className="space-y-3">
                                                            {unreadMembers.map(member => (
                                                                <div key={member.id} className="flex items-center gap-3 opacity-60">
                                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                                                        {member.name?.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="font-semibold">{member.name}</p>
                                                                        <p className="text-xs text-gray-400">Not read yet</p>
                                                                    </div>
                                                                    <CheckCheck className="w-5 h-5 text-gray-500" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                </div>
                            </div>
                        )}

                        {showFilePreview && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
                                <div className="w-full max-w-sm rounded-2xl bg-[#085358] border border-[#1e7f85] p-6">

                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="text-lg font-semibold text-white">
                                            Send File
                                        </h3>
                                        <button
                                            onClick={cancelFileUpload}
                                            className="p-2 rounded-full hover:bg-white/10 transition"
                                        >
                                            <X className="w-5 h-5 text-white/80" />
                                        </button>
                                    </div>

                                    {selectedFile?.type?.startsWith("image/") && filePreview ? (
                                        <div className="w-full rounded-xl overflow-hidden mb-4 bg-[#0b646a] p-3">
                                            <img
                                                src={filePreview}
                                                alt="Preview"
                                                className="w-full h-48 object-contain rounded-lg"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4 p-4 bg-[#0b646a] rounded-xl w-full mb-4">
                                            <div className="w-12 h-12 rounded-full bg-sky-400/20 flex items-center justify-center flex-shrink-0">
                                                <File className="w-6 h-6 text-sky-300" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-base text-white truncate">
                                                    {selectedFile?.name}
                                                </div>
                                                <div className="text-sm text-[#d1f5f7]">
                                                    {(selectedFile?.size / 1024 / 1024).toFixed(2)} MB
                                                </div>
                                                <div className="text-xs text-[#d1f5f7]/70 mt-0.5">
                                                    {selectedFile?.type || "Unknown"}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {uploadingFile && (
                                        <div className="w-full mb-4">
                                            <div className="flex justify-between text-sm mb-2 text-[#d1f5f7]">
                                                <span>Uploading...</span>
                                                <span>{uploadProgress}%</span>
                                            </div>
                                            <div className="w-full bg-[#0b646a] rounded-full h-2">
                                                <div
                                                    className="bg-cyan-300 h-2 rounded-full transition-all"
                                                    style={{ width: `${uploadProgress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={sendFileMessage}
                                        disabled={uploadingFile}
                                        className="w-full bg-[#0b646a] hover:bg-[#0f7278] disabled:bg-[#0b646a]/50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium text-base transition active:scale-[0.97]"
                                    >
                                        {uploadingFile ? 'Uploading...' : 'Upload File'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {audioBlob && (
                            <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                                <div className="bg-[#202c33] rounded-lg max-w-md w-full p-6">
                                    <h3 className="text-lg font-semibold mb-4">Voice Message</h3>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex-1 text-center">
                                            <div className="text-2xl font-mono">{formatDuration(recordingTime)}</div>
                                        </div>
                                    </div>
                                    {uploadingAudio && (
                                        <div className="mb-4 text-center text-sm text-gray-400">
                                            <div className="animate-pulse">Uploading audio...</div>
                                        </div>
                                    )}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={cancelRecording}
                                            disabled={uploadingAudio}
                                            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={sendAudioMessage}
                                            disabled={uploadingAudio}
                                            className="flex-1 bg-[#00a884] hover:bg-[#008069] disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
                                        >
                                            {uploadingAudio ? 'Sending...' : 'Send'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {replyToMessage && selectedGroup && !showMembers && !showFilesPanel && (
                            <div className="bg-[#2a3942] p-3 border-t border-[#3b4a54] flex items-center gap-3">
                                <div className="flex-1 min-w-0 border-l-4 border-[#00a884] pl-3">
                                    {/* Reply info */}
                                </div>
                                <button
                                    onClick={cancelReply}
                                    className="p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
                                    aria-label="Cancel reply"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                        )}

                        {selectedGroup && !showMembers && !showFilesPanel && (
                            <div className="bg-[#202c33] p-2 sm:p-3 border-t border-[#2a3942] z-20">

                                {isInputDisabled && (
                                    <div className="mb-2 rounded-xl px-4 py-2.5 flex items-center gap-3 border border-teal-500/30 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800/80 backdrop-blur-sm shadow-lg shadow-teal-900/10">

                                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
                                            <AlertTriangle className="w-3.5 h-3.5 text-teal-400" />
                                        </div>

                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-gray-200 tracking-wide">
                                                Message rate limit exceeded
                                            </p>
                                            <p className="text-[10px] text-gray-500 mt-0.5">
                                                Input will re-enable automatically
                                            </p>
                                        </div>

                                        <div
                                            className="flex items-center gap-1.5 bg-black/50 border border-teal-500/30 rounded-lg px-3 py-1.5"
                                            style={{ boxShadow: "0 0 12px rgba(20,184,166,0.1), inset 0 2px 6px rgba(0,0,0,0.6)" }}
                                        >
                                            <span
                                                className="text-sm font-bold font-mono tracking-widest"
                                                style={{
                                                    color: "#2dd4bf",
                                                    textShadow: "0 0 8px #14b8a6, 0 0 20px #0d9488",
                                                }}
                                            >
                                                0:{countdown.toString().padStart(2, "0")}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-1 sm:gap-2 relative">
                                    <button
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        disabled={isInputDisabled}
                                        className={`p-2 transition-colors flex-shrink-0 ${(isInputDisabled)
                                            ? 'text-gray-600 cursor-not-allowed opacity-50'
                                            : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        <Smile className="w-5 h-5" />
                                    </button>

                                    {showEmojiPicker && !isInputDisabled && (
                                        <div ref={emojiPickerRef} className="absolute bottom-16 left-2 z-50">
                                            <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setShowFileTypeModal(true)}
                                        disabled={isInputDisabled}
                                        className={`p-2 transition-colors flex-shrink-0 ${(isInputDisabled)
                                            ? 'text-gray-600 cursor-not-allowed opacity-50'
                                            : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        <Paperclip className="w-5 h-5" />
                                    </button>

                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={message}
                                        onChange={(e) => {
                                            setMessage(e.target.value);
                                            handleTyping?.();
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                if (message?.trim() && !isInputDisabled) {
                                                    onSendMessage?.();
                                                }
                                            }
                                        }}
                                        disabled={isInputDisabled}
                                        placeholder="Type a message"
                                        className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-[#2a3942] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#085358] placeholder-gray-400 text-sm sm:text-base transition-opacity ${(isInputDisabled) ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                    />

                                    {message?.trim() && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (!isInputDisabled && message?.trim()) {
                                                    onSendMessage?.();
                                                }
                                            }}
                                            disabled={isInputDisabled}
                                            className={`p-2 sm:p-3 rounded-full transition-colors flex-shrink-0 ${(isInputDisabled)
                                                ? 'bg-gray-600 opacity-50 cursor-not-allowed'
                                                : 'bg-[#00a884] hover:bg-[#008069]'
                                                }`}
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}



                        {selectedGroup && showMembers && (
                            <div className="flex-1 flex flex-col bg-[#0b141a] h-full">
                                <div className="bg-[#202c33] p-2 sm:p-3 md:p-4 flex items-center gap-2 sm:gap-3 border-b border-[#2a3942]">
                                    <button
                                        onClick={() => {
                                            setShowMembers(false);
                                            setActiveGroupTab('overview');
                                            setTimeout(() => {
                                                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                                            }, 100);
                                        }}
                                        className="hover:bg-[#0a6a72] p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0"
                                    >
                                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                    <h2 className="text-base sm:text-lg font-semibold truncate">Group Info</h2>
                                </div>

                                <div className="bg-[#202c33] border-b border-[#2a3942] overflow-x-auto">
                                    <div className="flex min-w-max">

                                        <button
                                            onClick={() => {
                                                setActiveGroupTab("overview");
                                            }}
                                            className={`flex-1 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors ${activeGroupTab === "overview"
                                                ? "border-[#00a884] text-[#00a884]"
                                                : "border-transparent text-gray-400 hover:text-white"
                                                }`}
                                        >
                                            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                                                <Info className="w-6 h-6 sm:w-4 sm:h-4" />
                                                <span className="hidden xs:inline">Overview</span>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setActiveGroupTab("media");
                                                refetchFiles?.();
                                            }}
                                            className={`flex-1 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors ${activeGroupTab === "media"
                                                ? "border-[#00a884] text-[#00a884]"
                                                : "border-transparent text-gray-400 hover:text-white"
                                                }`}
                                        >
                                            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                                                <ImageIcon className="w-6 h-6 sm:w-4 sm:h-4" />
                                                <span className="hidden xs:inline">Media</span>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setActiveGroupTab("files");
                                                refetchFiles?.();
                                            }}
                                            className={`flex-1 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors ${activeGroupTab === "files"
                                                ? "border-[#00a884] text-[#00a884]"
                                                : "border-transparent text-gray-400 hover:text-white"
                                                }`}
                                        >
                                            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                                                <File className="w-6 h-6 sm:w-4 sm:h-4" />
                                                <span className="hidden xs:inline">Files</span>
                                            </div>
                                        </button>

                                    </div>
                                </div>


                                <div className="flex-1 overflow-y-auto">
                                    {activeGroupTab === 'overview' && (
                                        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                                            <div className="bg-[#202c33] rounded-lg p-3 sm:p-4">
                                                <h4 className="text-xs sm:text-sm font-semibold text-gray-400 mb-2 sm:mb-3">Group Description</h4>
                                                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                                                    {selectedGroup?.groupDescription || 'No description available'}
                                                </p>
                                            </div>

                                            <div className="bg-[#202c33] rounded-lg p-3 sm:p-4">
                                                <h4 className="text-xs sm:text-sm font-semibold text-gray-400 mb-2 sm:mb-3">Group Details</h4>
                                                <div className="space-y-2 text-xs sm:text-sm">
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-gray-300 text-right">{formatTime(selectedGroup?.createdAt)}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-gray-400">Total Members</span>
                                                        <span className="text-gray-300">{totalUsers || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeGroupTab === 'media' && (
                                        <div className="p-3 sm:p-4">
                                            {loadingFiles ? (
                                                <div className="flex items-center justify-center h-64">
                                                    <div className="text-center">
                                                        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#00a884] mx-auto mb-3 sm:mb-4"></div>
                                                        <p className="text-gray-400 text-xs sm:text-sm">Loading media...</p>
                                                    </div>
                                                </div>
                                            ) : (() => {
                                                const allFiles = [];
                                                chatFiles?.forEach(chatFile => {
                                                    if (chatFile.files && Array.isArray(chatFile.files)) {
                                                        chatFile.files.forEach(file => {
                                                            allFiles.push({
                                                                _id: chatFile._id,
                                                                fileName: file.fileName,
                                                                fileUrl: file.file_url,
                                                                fileType: file.file_type,
                                                                fileSize: file.file_size,
                                                                senderName: chatFile.publisherName,
                                                                timestamp: chatFile.timestamp || chatFile.createdAt
                                                            });
                                                        });
                                                    }
                                                });

                                                const imageFiles = allFiles.filter(f => f.fileType?.startsWith('image/'));

                                                return imageFiles.length > 0 ? (
                                                    <>
                                                        <h3 className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3 font-semibold">
                                                            {imageFiles.length} Images
                                                        </h3>
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                                                            {imageFiles.map((file, index) => (
                                                                <div
                                                                    key={`${file._id}-${index}`}
                                                                    className="relative group cursor-pointer"
                                                                    onClick={() => window.open(file.fileUrl, '_blank')}
                                                                >
                                                                    <div className="w-full aspect-square rounded-lg overflow-hidden bg-[#1f2f2a]">
                                                                        <img
                                                                            src={file.fileUrl}
                                                                            alt={file.fileName}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </div>
                                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                                        <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                                        <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-3 opacity-30" />
                                                        <p className="text-xs sm:text-sm">No images shared yet</p>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                    {activeGroupTab === 'files' && (
                                        <div className="p-3 sm:p-4">
                                            {loadingFiles ? (
                                                <div className="flex items-center justify-center h-64">
                                                    <div className="text-center">
                                                        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#00a884] mx-auto mb-3 sm:mb-4"></div>
                                                        <p className="text-gray-400 text-xs sm:text-sm">Loading files...</p>
                                                    </div>
                                                </div>
                                            ) : (() => {
                                                const allFiles = [];
                                                chatFiles?.forEach(chatFile => {
                                                    if (chatFile.files && Array.isArray(chatFile.files)) {
                                                        chatFile.files.forEach(file => {
                                                            allFiles.push({
                                                                _id: chatFile._id,
                                                                fileName: file.fileName,
                                                                fileUrl: file.file_url,
                                                                fileType: file.file_type,
                                                                fileSize: file.file_size,
                                                                senderName: chatFile.publisherName,
                                                                timestamp: chatFile.timestamp || chatFile.createdAt
                                                            });
                                                        });
                                                    }
                                                });

                                                const documentFiles = allFiles.filter(f => !f.fileType?.startsWith('image/'));

                                                return documentFiles.length > 0 ? (
                                                    <>
                                                        <h3 className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3 font-semibold">
                                                            {documentFiles.length} Documents
                                                        </h3>
                                                        <div className="space-y-1.5 sm:space-y-2">
                                                            {documentFiles.map((file, index) => (
                                                                <div
                                                                    key={`${file._id}-${index}`}
                                                                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-[#202c33] rounded-lg hover:bg-[#2a3942] transition-colors cursor-pointer"
                                                                    onClick={() => window.open(file.fileUrl, '_blank')}
                                                                >
                                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                                                        <File className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs sm:text-sm font-semibold truncate text-white">
                                                                            {file.fileName}
                                                                        </p>
                                                                        <p className="text-xs text-gray-400 truncate">
                                                                            {file.senderName || 'Unknown'} • {formatTime(file.timestamp)}
                                                                        </p>
                                                                        {file.fileSize && (
                                                                            <p className="text-xs text-gray-500">
                                                                                {formatFileSize(file.fileSize)}
                                                                            </p>
                                                                        )}
                                                                    </div>

                                                                    <button
                                                                        onClick={async (e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            await downloadFileToDesktop(file.fileUrl, file.fileName);
                                                                        }}
                                                                        className="p-1.5 sm:p-2 hover:bg-[#0a6a72] rounded-full transition-colors flex-shrink-0"
                                                                    >
                                                                        <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                                        <File className="w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-3 opacity-30" />
                                                        <p className="text-xs sm:text-sm">No documents shared yet</p>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {selectedGroup && showFilesPanel && (
                            <div className="flex-1 flex flex-col bg-[#0b141a]">
                                <div className="bg-[#202c33] p-3 sm:p-4 flex items-center gap-3 border-b border-[#2a3942]">
                                    <button
                                        onClick={() => setShowFilesPanel(false)}
                                        className="hover:bg-[#0a6a72] p-2 rounded-lg transition-colors"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <h2 className="text-lg font-semibold">Shared Files</h2>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4">
                                    {loadingFiles ? (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <div className="text-center">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a884] mx-auto mb-4"></div>
                                                <p>Loading files...</p>
                                            </div>
                                        </div>
                                    ) : (chatFiles?.length ?? 0) === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                            <FolderOpen className="w-20 h-20 mb-4 opacity-30" />
                                            <p className="text-lg mb-2">No files shared yet</p>
                                            <p className="text-sm">Files shared in this chat will appear here</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {(() => {
                                                const allFiles = [];

                                                chatFiles.forEach(chatFile => {
                                                    if (chatFile.files && Array.isArray(chatFile.files)) {
                                                        chatFile.files.forEach(file => {
                                                            allFiles.push({
                                                                _id: chatFile._id,
                                                                fileName: file.fileName,
                                                                fileUrl: file.file_url,
                                                                fileType: file.file_type,
                                                                fileSize: file.file_size,
                                                                senderName: chatFile.publisherName,
                                                                timestamp: chatFile.timestamp || chatFile.createdAt
                                                            });
                                                        });
                                                    }
                                                });

                                                const imageFiles = allFiles.filter(f => f.fileType?.startsWith('image/'));
                                                const documentFiles = allFiles.filter(f => !f.fileType?.startsWith('image/'));

                                                return (
                                                    <>
                                                        {imageFiles.length > 0 && (
                                                            <div>
                                                                <h3 className="text-sm text-gray-400 mb-3 font-semibold flex items-center gap-2">
                                                                    <ImageIcon className="w-4 h-4" />
                                                                    Images ({imageFiles.length})
                                                                </h3>
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    {imageFiles.map((file, index) => (
                                                                        <div
                                                                            key={`${file._id}-${index}`}
                                                                            className="relative group cursor-pointer"
                                                                            onClick={() => window.open(file.fileUrl, '_blank')}
                                                                        >
                                                                            <div className="w-full aspect-square rounded-lg overflow-hidden bg-[#1f2f2a]">
                                                                                <img
                                                                                    src={file.fileUrl}
                                                                                    alt={file.fileName}
                                                                                    className="w-full h-full object-cover"
                                                                                    onError={(e) => {
                                                                                        e.target.style.display = 'none';
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center p-2">
                                                                                <p className="text-xs text-white text-center truncate w-full px-2 mb-1">
                                                                                    {file.fileName}
                                                                                </p>
                                                                                <p className="text-xs text-gray-300">
                                                                                    {file.senderName || 'Unknown'}
                                                                                </p>
                                                                                <p className="text-xs text-gray-400">
                                                                                    {formatTime(file.timestamp)}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {documentFiles.length > 0 && (
                                                            <div>
                                                                <h3 className="text-sm text-gray-400 mb-3 font-semibold flex items-center gap-2">
                                                                    <File className="w-4 h-4" />
                                                                    Documents ({documentFiles.length})
                                                                </h3>
                                                                <div className="space-y-2">
                                                                    {documentFiles.map((file, index) => (
                                                                        <div
                                                                            key={`${file._id}-${index}`}
                                                                            className="flex items-center gap-3 p-3 bg-[#202c33] rounded-lg hover:bg-[#2a3942] transition-colors cursor-pointer"
                                                                            onClick={() => window.open(file.fileUrl, '_blank')}
                                                                        >
                                                                            <div className="w-10 h-10 rounded bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                                                                <File className="w-6 h-6 text-blue-400" />
                                                                            </div>

                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-sm font-semibold truncate text-white">
                                                                                    {file.fileName}
                                                                                </p>
                                                                                <p className="text-xs text-gray-400">
                                                                                    {file.senderName || 'Unknown'} • {formatTime(file.timestamp)}
                                                                                </p>
                                                                                {file.fileSize && (
                                                                                    <p className="text-xs text-gray-500">
                                                                                        {formatFileSize(file.fileSize)}
                                                                                    </p>
                                                                                )}
                                                                            </div>

                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    window.open(file.fileUrl, '_blank');
                                                                                }}
                                                                                className="p-2 hover:bg-[#0a6a72] rounded-full transition-colors flex-shrink-0"
                                                                                title="Download"
                                                                            >
                                                                                <Download className="w-5 h-5" />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {imageFiles.length === 0 && documentFiles.length === 0 && (
                                                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                                                <FolderOpen className="w-16 h-16 mb-3 opacity-30" />
                                                                <p>No files found</p>
                                                            </div>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div >
                )

            }

        </>
    );

};

export default ChatWindow;


