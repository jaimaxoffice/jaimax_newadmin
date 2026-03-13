import React from "react";
import EmojiPicker from "emoji-picker-react";
import { safeReplyText } from "./MessageText";
import {
  Image,
  FileText,
  Music,
  Video,
  File,
  Sheet,
  Presentation,
  Archive,
  Send,
  Paperclip,
  Smile,
  X,
  AlertTriangle,
} from "lucide-react";

const MediaIcon = ({ media }) => {
  const fileName = media?.fileName || "";
  const fileType = media?.file_type || "";

  if (
    fileType.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileName)
  )
    return (
      <>
        <Image className="w-3 h-3 inline mr-1" /> Photo
      </>
    );
  if (fileType.includes("pdf") || /\.pdf$/i.test(fileName))
    return (
      <>
        <FileText className="w-3 h-3 inline mr-1" /> PDF
      </>
    );
  if (fileType.includes("audio") || /\.(mp3|wav|ogg|m4a)$/i.test(fileName))
    return (
      <>
        <Music className="w-3 h-3 inline mr-1" /> Audio
      </>
    );
  if (fileType.includes("video") || /\.(mp4|mov|avi|webm)$/i.test(fileName))
    return (
      <>
        <Video className="w-3 h-3 inline mr-1" /> Video
      </>
    );
  if (fileType.includes("word") || /\.(doc|docx)$/i.test(fileName))
    return (
      <>
        <FileText className="w-3 h-3 inline mr-1" /> Document
      </>
    );
  if (fileType.includes("sheet") || /\.(xls|xlsx)$/i.test(fileName))
    return (
      <>
        <Sheet className="w-3 h-3 inline mr-1" /> Spreadsheet
      </>
    );
  if (fileType.includes("presentation") || /\.(ppt|pptx)$/i.test(fileName))
    return (
      <>
        <Presentation className="w-3 h-3 inline mr-1" /> Presentation
      </>
    );
  if (/\.(zip|rar)$/i.test(fileName))
    return (
      <>
        <Archive className="w-3 h-3 inline mr-1" /> Archive
      </>
    );
  return (
    <>
      <File className="w-3 h-3 inline mr-1" /> File
    </>
  );
};
const MessageInput = ({
  message,
  setMessage,
  onSendMessage,
  isInputDisabled,
  setIsInputDisabled,
  countdown,
  replyToMessage,
  cancelReply,
  groupKey,
  handleTyping,
  showEmojiPicker,
  setShowEmojiPicker,
  setShowFileTypeModal,
  inputRef,
  emojiPickerRef,
  emojiButtonRef,
  emojiClickInsideRef,
  rateLimitError,
}) => {
  // ── FIX: emoji click adds emoji but does NOT close the picker ─────────────
  const handleEmojiClick = (emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="bg-[#202c33] border-t border-[#3b4a54] z-20 flex-shrink-0">
      {/* Reply preview — flush above input, WhatsApp style */}
      {replyToMessage && (
        <div className="flex items-center gap-2 px-3 pt-2 pb-0">
          <div className="flex-1 min-w-0 flex items-stretch bg-[#1a2530] rounded-lg overflow-hidden">
            <div className="w-1 flex-shrink-0 bg-[#00a884]" />
            <div className="flex-1 min-w-0 px-2 py-1.5">
              <p className="text-xs font-semibold text-[#00a884] truncate leading-tight">
                {replyToMessage.fromUserId || "User"}
              </p>
              <p className="text-xs text-gray-400 truncate leading-tight mt-0.5 flex items-center">
                {replyToMessage.msgBody?.media?.file_url ? (
                  <MediaIcon media={replyToMessage.msgBody.media} />
                ) : typeof replyToMessage.msgBody?.message === "string" ? (
                  replyToMessage.msgBody.message.slice(0, 100)
                ) : (
                  safeReplyText(replyToMessage.msgBody?.message, groupKey)
                )}
              </p>
            </div>
            {replyToMessage.msgBody?.media?.file_url &&
              replyToMessage.msgBody?.media?.file_type?.startsWith(
                "image/",
              ) && (
                <img
                  src={replyToMessage.msgBody.media.file_url}
                  alt=""
                  className="w-10 h-10 object-cover flex-shrink-0"
                />
              )}
          </div>
          <button
            onClick={cancelReply}
            className="flex-shrink-0 p-1.5 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Cancel reply"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      )}
      {/* Input row wrapper */}
      <div className="p-2 sm:p-3">
        {isInputDisabled && (
          <div className="mb-2 rounded-xl px-4 py-2.5 flex items-center gap-3 border border-teal-500/30 bg-[#000000]">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#000000] border border-teal-500/30 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-200 tracking-wide">
                {rateLimitError || "Message rate limit exceeded"}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Input will re-enable automatically
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-black/50 border border-teal-500/30 rounded-lg px-3 py-1.5">
              <span
                className="text-sm font-bold font-mono tracking-widest"
                style={{ color: "#b9fd5c", textShadow: "0 0 8px #14b8a6" }}
              >
                0:{countdown.toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        )}

        <div
          className="flex items-center gap-1 sm:gap-2 relative"
          style={{ minWidth: 0 }}
        >
          {/* Emoji button */}
          <button
            ref={emojiButtonRef}
            onPointerDown={(e) => {
              e.stopPropagation();
              setShowEmojiPicker((p) => !p);
            }}
            disabled={isInputDisabled}
            className={`p-2 transition-colors flex-shrink-0 ${isInputDisabled ? "text-gray-600 cursor-not-allowed opacity-50" : "text-gray-400 hover:text-white"}`}
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Emoji picker */}
          {showEmojiPicker && !isInputDisabled && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-14 left-0 z-50"
              onPointerDown={() => {
                if (emojiClickInsideRef) emojiClickInsideRef.current = true;
              }}
            >
              <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
            </div>
          )}

          {/* Attachment button */}
          <button
            onClick={() => setShowFileTypeModal(true)}
            disabled={isInputDisabled}
            className={`p-2 transition-colors flex-shrink-0 ${isInputDisabled ? "text-gray-600 cursor-not-allowed opacity-50" : "text-gray-400 hover:text-white"}`}
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping?.();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (isInputDisabled) {
                  const el = document.createElement("div");
                  el.className =
                    "fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] font-semibold";
                  el.textContent =
                    rateLimitError ||
                    "Please wait! You are sending messages too quickly.";
                  document.body.appendChild(el);
                  setTimeout(() => el.remove(), 3000);
                  return;
                }
                if (message?.trim()) onSendMessage?.();
              }
            }}
            disabled={isInputDisabled}
            placeholder="Type a message"
            className={`flex-1 min-w-0 w-0 px-3 sm:px-4 py-2 sm:py-3 bg-[#2a3942] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#085358] placeholder-gray-400 text-sm sm:text-base transition-opacity ${isInputDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          />

          {/* Send button */}
          {message?.trim() && (
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                if (!isInputDisabled && message?.trim()) onSendMessage?.();
              }}
              disabled={isInputDisabled}
              className={`flex-shrink-0 p-2 sm:p-3 rounded-full transition-colors ${isInputDisabled ? "bg-gray-600 opacity-50 cursor-not-allowed" : "bg-[#b9fd5c]"}`}
            >
              <Send className="w-5 h-5 text-black" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
