import React, { useRef } from 'react';
import { Send, Smile, Paperclip, AlertTriangle, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const MessageInput = ({
    message,
    setMessage,
    onSendMessage,
    isInputDisabled,
    setIsInputDisabled,
    showEmojiPicker,
    setShowEmojiPicker,
    setShowFileTypeModal,
    handleTyping,
    emojiPickerRef,
    countdown,
    replyToMessage,
    cancelReply,
}) => {
    const inputRef = useRef(null);

    const handleEmojiClick = (emojiObject) => {
        setMessage(prev => prev + emojiObject.emoji);
        setShowEmojiPicker(false);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleSend = () => {
        if (isInputDisabled) {
            const warningDiv = document.createElement('div');
            warningDiv.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse';
            warningDiv.textContent = 'Please wait! You are sending messages too quickly.';
            document.body.appendChild(warningDiv);
            setTimeout(() => warningDiv.remove(), 3000);
            return;
        }
        if (message?.trim()) onSendMessage?.();
    };

    return (
        <div className="bg-[#202c33] p-2 sm:p-3 border-t border-[#ffffff] z-20">
            {/* Rate limit banner */}
            {isInputDisabled && (
                <div className="mb-2 rounded-xl px-4 py-2.5 flex items-center gap-3 border border-teal-500/30 bg-[#000000]">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#000000] border border-teal-500/30 flex items-center justify-center">
                        <AlertTriangle className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-medium text-gray-200 tracking-wide">Message rate limit exceeded</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Input will re-enable automatically</p>
                    </div>
                    {/* <div className="flex items-center gap-1.5 bg-black/50 border border-teal-500/30 rounded-lg px-3 py-1.5">
                        <span className="text-sm font-bold font-mono tracking-widest" style={{ color: "#b9fd5c", textShadow: "0 0 8px #14b8a6" }}>
                            0:{countdown.toString().padStart(2, "0")}
                        </span>
                    </div> */}
                </div>
            )}

            {/* Reply preview */}
            {replyToMessage && (
                <div className="bg-[#2a3942] px-3 py-2 border-l-4 border-[#00a884] mb-2 flex items-center justify-between rounded">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs text-[#00a884] font-semibold truncate">
                            {replyToMessage.publisherName || replyToMessage.senderName}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                            {typeof replyToMessage.msgBody?.message === 'string'
                                ? replyToMessage.msgBody.message
                                : 'Media message'}
                        </p>
                    </div>
                    <button onClick={cancelReply} className="p-1 hover:bg-white/20 rounded-full ml-2">
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
            )}

            <div className="flex items-center gap-1 sm:gap-2 relative">
                {/* Emoji */}
                <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    disabled={isInputDisabled}
                    className={`p-2 transition-colors flex-shrink-0 ${isInputDisabled ? 'text-gray-600 cursor-not-allowed opacity-50' : 'text-gray-400 hover:text-white'}`}
                >
                    <Smile className="w-5 h-5" />
                </button>

                {showEmojiPicker && !isInputDisabled && (
                    <div ref={emojiPickerRef} className="absolute bottom-16 left-2 z-50">
                        <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
                    </div>
                )}

                {/* Attach */}
                <button
                    onClick={() => setShowFileTypeModal(true)}
                    disabled={isInputDisabled}
                    className={`p-2 transition-colors flex-shrink-0 ${isInputDisabled ? 'text-gray-600 cursor-not-allowed opacity-50' : 'text-gray-400 hover:text-white'}`}
                >
                    <Paperclip className="w-5 h-5" />
                </button>

                {/* Text input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => { setMessage(e.target.value); handleTyping?.(); }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (message?.trim() && !isInputDisabled) onSendMessage?.();
                        }
                    }}
                    disabled={isInputDisabled}
                    placeholder="Type a message"
                    className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-[#2a3942] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#085358] placeholder-gray-400 text-sm sm:text-base transition-opacity ${isInputDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                />

                {/* Send */}
                {message?.trim() && (
                    <button
                        onClick={(e) => { e.preventDefault(); if (!isInputDisabled && message?.trim()) onSendMessage?.(); }}
                        disabled={isInputDisabled}
                        className={`p-2 sm:p-3 rounded-full transition-colors flex-shrink-0 ${isInputDisabled ? 'bg-gray-600 opacity-50 cursor-not-allowed' : 'bg-[#b9fd5c]'}`}
                    >
                        <Send className="w-5 h-5 text-black" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default MessageInput;