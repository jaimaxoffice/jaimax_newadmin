import React, { useState, useMemo } from "react";
import {
  File,
  Download,
  ArrowUpRight,
  ChevronDown,
  AlertTriangle,
  X,
  Star,
  Pin,
} from "lucide-react";
import { decryptMessage } from "../socket/encryptmsg";
import MessageText, { safeReplyText } from "./MessageText";

const MessageBubble = ({
  msg,
  currentUser,
  onImageLoad,
  members,
  groupKey,
  effectiveOpenMenuId,
  copiedMessageId,
  toggleMenu,
  scrollToMessage,
  formatTime,
  formatFileSize,
  renderMessageWithLinks,
  getMessageReadStatus,
  isEdited,
  isForwarded,
  starred,
  pinned,
  reactions,
  readStatus,
  onReact,
  onRemoveReaction,
}) => {
  const id = msg._id?.toString() || msg.id?.toString();
  const [activeGif, setActiveGif] = useState(null);

  if (msg.deletedFor && Array.isArray(msg.deletedFor)) {
    const isDeletedForMe = msg.deletedFor.some(
      (uid) => uid?.toString() === currentUser?.id?.toString()
    );
    if (isDeletedForMe) return null;
  }
  // console.log("Rendering message:", currentUser.role);
  const isCurrentUser =
    msg.fromUserId?.toString() === currentUser?.id?.toString();

  // ✅ Resolve pinned from both prop AND message object
  const isPinned = pinned || msg.isPinned;

  // ═══════════════════════════════════════════════════════
  //  Pin time formatter — "2 min ago", "3h ago", "Jun 15"
  // ═══════════════════════════════════════════════════════
  const formatPinTime = (pinnedAt) => {
    if (!pinnedAt) return "";
    const now = new Date();
    const pinDate = new Date(pinnedAt);
    const diffMs = now - pinDate;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;

    return pinDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };


  const handleImageDownload = async (e, url, fileName) => {
    e.stopPropagation();
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName || "image";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback if fetch fails (e.g. cross-origin)
      window.open(url, "_blank");
    }
  };

  // ═══════════════════════════════════════════════════════
  //  Get pinner display name
  // ═══════════════════════════════════════════════════════
  const getPinnerName = () => {
    // console.log("Determining pinner name for message:", msg);
    const name = msg.pinnedBy || msg.pinnedByName;
    if (!name) return "";

    // Check if the current user pinned it
    if (
      msg.pinnedBy === currentUser?.id?.toString() ||
      msg.pinnedByName === currentUser?.name
    ) {
      return "You";
    }

    // Truncate long names
    if (name.length > 20) return name.slice(0, 18) + "…";
    return name;
  };


  // ─── existing helpers ─────────────────────────────────
  const isEncryptedObject = (value) => {
    if (!value || typeof value !== "object") return false;
    return !!(
      value.cipherText ||
      value.ciphertext ||
      value.encrypted ||
      (value.iv && value.authTag)
    );
  };

  const safeString = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (isEncryptedObject(value)) return "";
      if (value.text) return String(value.text);
      if (value.body) return String(value.body);
      if (value.content) return String(value.content);
      return "";
    }
    return String(value);
  };

  const resolveMessageText = (msg, groupKey) => {
    const messageText = msg.msgBody?.message;
    if (messageText === null || messageText === undefined) return "";

    const isClean = (str) => {
      const t = str.trim();
      if (!t || t === "0" || t === "false" || t === "null") return false;
      if (t.length < 2) return false;
      if (/^[\w\-. ]+\.\w{2,5}$/.test(t)) return false;
      if (/\.(jpg|jpeg|png|gif|webp|bmp|svg|mp4|mov|pdf|doc|docx|xls|xlsx|zip|rar|mp3|wav)$/i.test(t)) return false;
      return true;
    };

    if (typeof messageText === "string") {
      return isClean(messageText) ? messageText.trim() : "";
    }

    if (typeof messageText === "object") {
      if (isEncryptedObject(messageText) && groupKey) {
        try {
          const decrypted = decryptMessage(messageText, groupKey);
          if (typeof decrypted === "string" && isClean(decrypted))
            return decrypted.trim();
        } catch (err) {
          console.warn("Decryption failed:", msg._id);
        }
        return "";
      }
      if (messageText.text) return String(messageText.text);
      if (messageText.body) return String(messageText.body);
      return "";
    }

    return String("" || "");
  };

  const decryptedText = useMemo(
    () => resolveMessageText(msg, groupKey),
    [msg._id, msg.msgBody?.message, groupKey]
  );

  const getFileUrl = (m) =>
    m.msgBody?.media?.tempPreview ||
    m.msgBody?.media?.file_url ||
    m.fileUrl ||
    m.msgBody?.media?.fileUrl ||
    null;

  const getFileType = (m) => {
    const type = m.msgBody?.media?.file_type || m.msgBody?.media?.fileType;
    if (type) return type;
    const fileName = m.msgBody?.media?.fileName || "";
    if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileName))
      return "image/jpeg";
    if (/\.(mp4|mov|avi|webm)$/i.test(fileName)) return "video/mp4";
    if (/\.(pdf)$/i.test(fileName)) return "application/pdf";
    if (/\.(gif)$/i.test(fileName)) return "image/gif";
    return null;
  };

  const getFileName = (m) => {
    if (m.msgBody?.media?.fileName) return m.msgBody.media.fileName;
    const msgText = m.msgBody?.message;
    if (typeof msgText === "string" && msgText.length > 0) return msgText;
    return "File";
  };

  const getFileSize = (m) =>
    m.msgBody?.media?.file_size || m.msgBody?.media?.fileSize || null;

  const isReported = msg.isreported?.count >= 3 && msg.isreported?.isHidden;
  const currentReactions = reactions || msg.reactions || []; const isFile = !!getFileUrl(msg);
  const isPending = msg.msgStatus === "pending";

  const hasContent =
    msg.deletedForEveryone ||
    isFile ||
    (decryptedText && decryptedText.trim().length > 0);

  if (!hasContent) return null;

  const getReplyText = (replyTo) => {
    if (!replyTo) return "Message";
    if (
      replyTo.message_type === "file" ||
      replyTo.msgBody?.message_type === "file"
    ) {
      return `📎 ${replyTo.msgBody?.media?.fileName || replyTo.message || "Media"
        }`;
    }
    const replyContent = replyTo.message || replyTo.msgBody?.message;
    if (typeof replyContent === "object" && isEncryptedObject(replyContent)) {
      if (groupKey) {
        try {
          const decrypted = decryptMessage(replyContent, groupKey);
          if (typeof decrypted === "string" && decrypted.length > 0)
            return decrypted.slice(0, 100);
        } catch {
          return "Message";
        }
      }
      return "Message";
    }
    if (typeof replyContent === "string" && replyContent.length > 0)
      return replyContent.slice(0, 100);
    try {
      const safe = safeReplyText(replyContent, groupKey);
      if (typeof safe === "string" && safe.length > 0)
        return safe.slice(0, 90);
    } catch { }
    return "Message";
  };

  const getReplySenderName = (replyTo) => {
    if (!replyTo) return "Unknown";
    return safeString(replyTo.fromUserId || "Unknown");
  };

  return (
    <div
      id={`msg-${id}`}
      data-msg-id={id}
      data-from-user-id={msg.fromUserId}
      className={`mb-2 flex group ${isCurrentUser ? "justify-end" : "justify-start"
        }`}
    >
      <div className="relative max-w-[72%] sm:max-w-[60%] min-w-0">

        {/* ═══════════════════════════════════════════════ */}
        {/*  ✅ PIN BANNER — who pinned + when             */}
        {/* ═══════════════════════════════════════════════ */}
        {isPinned && !msg.deletedForEveryone && (
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 mb-0.5 rounded-t-lg ${isCurrentUser ? "justify-end" : "justify-start"
              }`}
          >
            <Pin className="w-3 h-3 text-amber-400/80 rotate-45 flex-shrink-0" />
            <span className="text-[11px] text-amber-400/80 font-medium truncate">
              {getPinnerName()
                ? `Pinned by ${getPinnerName()}`
                : "Pinned"}
            </span>
            {msg.pinnedAt && (
              <>
                <span className="text-[10px] text-amber-400/40">·</span>
                <span className="text-[10px] text-amber-400/50 flex-shrink-0">
                  {formatPinTime(msg.pinnedAt)}
                </span>
              </>
            )}
          </div>
        )}

        {/* Forwarded indicator */}
        {(isForwarded || msg.isForwarded) && !msg.deletedForEveryone && (
          <div className="flex items-center gap-1 px-2 pt-1 text-[11px] text-gray-400 italic">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M9.5 2L14 6.5 9.5 11V8C5 8 2.5 10 1 13c0-5 3-8 8.5-8V2z" />
            </svg>
            Forwarded
          </div>
        )}

        {/* Main bubble */}
        <div
          className={`
            relative rounded-2xl
            ${isCurrentUser ? "rounded-tr-sm" : "rounded-tl-sm"}
            ${isPinned && !msg.deletedForEveryone ? "rounded-t-lg" : ""}
            p-2 sm:p-3 shadow-md
            ${msg.deletedForEveryone
              ? "bg-[#1d2b33] italic"
              : isPending
                ? isCurrentUser
                  ? "bg-[#005c4b]/70 text-white"
                  : "bg-[#202c33]/70 text-gray-300"
                : isCurrentUser
                  ? "bg-[#005c4b] text-white"
                  : "bg-[#202c33] text-gray-200"
            }
            ${isPinned && !msg.deletedForEveryone
              ? "ring-1 ring-amber-500/25 shadow-amber-500/5"
              : ""
            }
          `}
          style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
        >
          {/* Sender name */}
          {!isCurrentUser && !msg.deletedForEveryone && (
            <p className="text-[12px] font-semibold text-[#00a884] mb-0.5 truncate">
              {safeString(msg.fromUserId || "Unknown")}
            </p>
          )}

          {/* ═══════════════════════════════════════════════ */}
          {/*  CORNER ICONS: Pin + Star (top-right)          */}
          {/* ═══════════════════════════════════════════════ */}
          {(starred || isPinned) && !msg.deletedForEveryone && (
            <div className="absolute top-2 right-2 flex items-center gap-1">
              {isPinned && (
                <div className="group/pin relative">
                  {/* <Pin
                    className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30 rotate-45 cursor-pointer"
                  /> */}
                  {/* Tooltip on hover — shows full info */}
                  <div className="absolute bottom-full right-0 mb-1 hidden group-hover/pin:block z-50">
                    <div className="bg-[#1a2730] border border-white/10 rounded-lg px-2.5 py-1.5 shadow-xl whitespace-nowrap">
                      <p className="text-[11px] text-amber-400 font-medium">
                        📌 Pinned
                        {getPinnerName() ? ` by ${getPinnerName()}` : ""}
                      </p>
                      {msg.pinnedAt && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(msg.pinnedAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* {starred && (
                <Star
                  className="w-3 h-3 text-yellow-400 fill-yellow-400"
                  title="Starred"
                />
              )} */}
            </div>
          )}

          {/* Reply preview */}
          {msg.replyTo && !msg.deletedForEveryone && (
            <div
              className={`mb-2 p-2 rounded-lg border-l-4 cursor-pointer transition-colors ${isCurrentUser
                ? "bg-[#004a3e] border-[#06cf9c] hover:bg-[#005a4e]"
                : "bg-[#1a2730] border-[#00a884] hover:bg-[#1f2d38]"
                }`}
              onClick={() =>
                scrollToMessage(
                  msg.replyTo.msgId ||
                  msg.replyTo._id?.toString() ||
                  msg.replyTo.id?.toString()
                )
              }
            >
              <p className="text-[11px] font-semibold text-[#06cf9c] mb-0.5 truncate">
                {getReplySenderName(msg.replyTo)}
              </p>
              <p className="text-[11px] text-gray-400 line-clamp-2">
                {getReplyText(msg.replyTo)}
              </p>
            </div>
          )}

          {/* Deleted message */}
          {msg.deletedForEveryone ? (
            <p className="text-sm text-gray-500 italic flex items-center gap-1.5 py-1">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              This message was deleted
            </p>
          ) : isReported ? null : (
            <>
              {/* Image media */}
              {isFile &&
                (getFileType(msg)?.startsWith("image/") ||
                  msg.msgBody?.media?.message_type === "image" ||
                  msg.messageType === "image") && (
                  <div
                    className="relative group/img"
                    style={{ maxWidth: "260px" }}
                  >
                    <div className="relative rounded-lg overflow-hidden">
                      <img
                        src={getFileUrl(msg)}
                        alt={getFileName(msg)}
                        onLoad={onImageLoad}
                        className={`rounded-lg w-full h-auto transition-all ${msg.msgBody?.media?.is_uploading
                          ? "opacity-60 cursor-wait"
                          : "cursor-pointer hover:opacity-90"
                          }`}
                        style={{
                          maxHeight:
                            getFileType(msg) === "image/gif"
                              ? "none"
                              : "300px",
                          objectFit: "cover",
                        }}
                        onClick={() => {
                          if (
                            !msg.msgBody?.media?.is_uploading &&
                            getFileUrl(msg)
                          ) {
                            if (/\.gif$/i.test(getFileName(msg))) {
                              setActiveGif(getFileUrl(msg));
                            } else if (
                              !getFileUrl(msg).startsWith("blob:")
                            ) {
                              window.open(getFileUrl(msg), "_blank");
                            }
                          }
                        }}
                      />
                      {msg.msgBody?.media?.is_uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Non-image file */}
              {isFile && !getFileType(msg)?.startsWith("image/") && (
                <div className="max-w-xs">
                  <div
                    className={`group/file relative flex items-center gap-3 p-3 rounded-xl 
                      bg-gradient-to-br from-[#1a2332] to-[#0f1419] border border-white/5 
                      transition-all ${msg.msgBody?.media?.is_uploading
                        ? "opacity-60"
                        : "hover:scale-[1.01] cursor-pointer hover:border-white/10"
                      }`}
                    onClick={() => {
                      if (
                        !msg.msgBody?.media?.is_uploading &&
                        getFileUrl(msg)
                      )
                        window.open(getFileUrl(msg), "_blank");
                    }}
                  >
                    <div className="relative w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/20 bg-white/5">
                      <File className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate text-white flex items-center gap-2">
                        {getFileName(msg)}
                        <ArrowUpRight className="w-3 h-3 text-white opacity-0 group-hover/file:opacity-100 transition-opacity" />
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {getFileSize(msg)
                          ? formatFileSize(getFileSize(msg))
                          : "Unknown size"}
                      </p>
                    </div>
                    {!msg.msgBody?.media?.is_uploading && (
                      <div className="p-2 rounded-lg bg-white/5 opacity-0 group-hover/file:opacity-100 transition-all">
                        <Download className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Message text */}
              {decryptedText && !isFile && (
                <MessageText
                  text={decryptedText}
                  isCurrentUser={isCurrentUser}
                  isReported={
                    msg.isreported?.count >= 3 && msg.isreported?.isHidden
                  }
                  renderMessageWithLinks={renderMessageWithLinks}
                />
              )}

              {/* File caption */}
              {isFile &&
                decryptedText &&
                decryptedText !== getFileName(msg) && (
                  <p className="text-sm mt-1.5 leading-relaxed">
                    {renderMessageWithLinks
                      ? renderMessageWithLinks(decryptedText)
                      : decryptedText}
                  </p>
                )}
            </>
          )}

          {/* Reported warning */}
          {/* Reported warning */}
          {isReported && !msg.deletedForEveryone && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              margin: "4px 0 2px", padding: "8px 10px 10px",
              borderRadius: 8, borderLeft: "3px solid #ef4444",
              backgroundColor: isCurrentUser ? "rgba(17,27,33,0.07)" : "rgba(0,0,0,0.22)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink: 0 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <circle cx="12" cy="17" r="0.5" fill="#ef4444" />
              </svg>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: "#ef4444", lineHeight: 1.3 }}>
                  Reported · {msg.isreported.count} {msg.isreported.count === 1 ? "time" : "times"}
                </span>
                <span style={{ fontSize: 10.5, lineHeight: 1.3, color: isCurrentUser ? "rgba(17,27,33,0.45)" : "#8696a0" }}>
                  This message has been flagged
                </span>
              </div>
            </div>
          )}
          {/* ═══════════════════════════════════════════════ */}
          {/*  TIMESTAMP ROW: pin icon + edited + time + ✓✓  */}
          {/* ═══════════════════════════════════════════════ */}
          {!msg.deletedForEveryone && !isReported && (
            <div className="flex items-center justify-end gap-1 mt-1">
              {isPinned && (
                <Pin
                  className="w-2.5 h-2.5 text-amber-400/50 rotate-45"
                  title={`Pinned${getPinnerName() ? ` by ${getPinnerName()}` : ""
                    }${msg.pinnedAt
                      ? ` · ${formatPinTime(msg.pinnedAt)}`
                      : ""
                    }`}
                />
              )}
              {(isEdited || msg.isEdited) && (
                <span className="text-[10px] text-gray-400 italic">
                  edited
                </span>
              )}
              <span
                className={`text-[10px] ${isCurrentUser ? "text-white/60" : "text-gray-500"
                  }`}
              >
                {formatTime(msg.timestamp)}
              </span>
              {isCurrentUser && <ReadStatusTicks status={readStatus} />}
              {!isReported && (
                <button
                  className={`ml-0.5 p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${isCurrentUser
                    ? "hover:bg-white/10 text-white/60"
                    : "hover:bg-white/10 text-gray-400"
                    }`}
                  onClick={(e) => toggleMenu(id, e, isCurrentUser)}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Reactions */}
        {currentReactions.length > 0 && !msg.deletedForEveryone && (
          <div
            className={`flex flex-wrap gap-1 mt-1 ${isCurrentUser ? "justify-end" : "justify-start"
              }`}
          >
            {Object.entries(
              currentReactions.reduce((acc, r) => {
                acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                return acc;
              }, {})
            ).map(([emoji, count]) => {
              const myReaction = currentReactions.find(
                (r) =>
                  r.emoji === emoji &&
                  r.userId === currentUser?.id?.toString()
              );
              return (
                <button
                  key={emoji}
                  onClick={() =>
                    myReaction
                      ? onRemoveReaction?.(id)
                      : onReact?.(id, emoji)
                  }
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition-all ${myReaction
                    ? "bg-[#005c4b] border border-[#00a884]"
                    : "bg-[#202c33] border border-[#2a3942] hover:bg-[#2a3942]"
                    }`}
                >
                  <span>{emoji}</span>
                  <span className="text-[10px] text-gray-400">{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Hover actions */}
        {!msg.deletedForEveryone && (
          <div
            className={`absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 ${isCurrentUser ? "-left-14" : "-right-14"
              }`}
          >
            <button
              onClick={(e) => onReact?.(id, e)}
              className="p-1 rounded-full bg-[#202c33] hover:bg-[#2a3942] text-gray-400 shadow-md"
              title="React"
            >
              😀
            </button>
            {!isReported && (
              <button
                className={`ml-0.5 p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${isCurrentUser
                  ? "hover:bg-white/10 text-white/60"
                  : "hover:bg-white/10 text-gray-400"
                  }`}
                onClick={(e) => toggleMenu(id, e, isCurrentUser)}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* GIF modal */}
        {activeGif && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90"
            onClick={() => setActiveGif(null)}
          >
            <div
              className="relative max-w-[90vw] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveGif(null)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={activeGif}
                alt="GIF"
                className="max-w-full max-h-[85vh] rounded-lg object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ReadStatusTicks = ({ status }) => {
  if (!status) return null;
  switch (status) {
    case "sending":
      return (
        <svg className="w-4 h-3 text-white/40" viewBox="0 0 16 11">
          <path d="M11 1L4 8.5 1.5 6" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
        </svg>
      );
    case "sent":
      return (
        <svg className="w-4 h-3 text-white/60" viewBox="0 0 16 11">
          <path d="M11 1L4 8.5 1.5 6" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "delivered":
    case "delivered_all":
      return (
        <svg className="w-5 h-3 text-white/60" viewBox="0 0 20 11">
          <path d="M11 1L4 8.5 1.5 6" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 1L8 8.5 5.5 6" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "read_some":
    case "read_all":
      return (
        <svg className="w-5 h-3 text-[#53bdeb]" viewBox="0 0 20 11">
          <path d="M11 1L4 8.5 1.5 6" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 1L8 8.5 5.5 6" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "failed":
      return (
        <svg className="w-4 h-3 text-red-500" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10.5a.75.75 0 110 1.5.75.75 0 010-1.5zM8 4a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 018 4z" />
        </svg>
      );
    default:
      return null;
  }
};

export default MessageBubble;