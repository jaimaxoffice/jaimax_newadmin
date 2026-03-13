// import React, { useState } from "react";
// import {
//   File,
//   Download,
//   ArrowUpRight,
//   ChevronDown,
//   AlertTriangle,
//   X,
// } from "lucide-react";
// import { decryptMessage } from "../socket/encryptmsg";
// import MessageText, { safeReplyText } from "./MessageText";

// const MessageBubble = ({
//   msg,
//   currentUser,
//   members,
//   groupKey,
//   effectiveOpenMenuId,
//   copiedMessageId,
//   toggleMenu,
//   scrollToMessage,
//   formatTime,
//   formatFileSize,
//   renderMessageWithLinks,
//   getMessageReadStatus,
// }) => {
//   const id = msg._id?.toString() || msg.id?.toString();
//   const [activeGif, setActiveGif] = useState(null);
//   // Filter deleted-for-me messages
//   if (msg.deletedFor && Array.isArray(msg.deletedFor)) {
//     const isDeletedForMe = msg.deletedFor.some(
//       (uid) => uid?.toString() === currentUser?.id?.toString(),
//     );
//     if (isDeletedForMe) return null;
//   }

//   const isCurrentUser =
//     msg.fromUserId?.toString() === currentUser?.id?.toString();
//   const containerBg = isCurrentUser
//     ? "bg-[#b9fd5c] text-black"
//     : "bg-[#202c33] text-gray-200";
//   const readStatus = getMessageReadStatus(msg);

//   // ── Safe message text resolution ─────────────────────────────────────────
//   let messageText = msg.msgBody?.message;
//   let decryptedText = "";

//   if (typeof messageText === "object" && messageText !== null) {
//     if (messageText.cipherText && groupKey) {
//       try {
//         decryptedText = decryptMessage(messageText, groupKey);
//       } catch {
//         decryptedText = "[Encrypted message]";
//       }
//     } else {
//       decryptedText = msg.msgStatus === "pending" ? "sending..." : "[Message]";
//     }
//   } else if (typeof messageText === "string") {
//     decryptedText = messageText;
//   } else {
//     decryptedText = String(messageText || "");
//   }

//   const getFileUrl = (m) =>
//     m.msgBody?.media?.tempPreview ||
//     m.msgBody?.media?.file_url ||
//     m.fileUrl ||
//     m.msgBody?.media?.fileUrl ||
//     null;

//   const getFileType = (m) => {
//     const type = m.msgBody?.media?.file_type || m.msgBody?.media?.fileType;
//     if (type) return type;
//     const fileName = m.msgBody?.media?.fileName || "";
//     if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileName))
//       return "image/jpeg";
//     if (/\.(mp4|mov|avi|webm)$/i.test(fileName)) return "video/mp4";
//     if (/\.(pdf)$/i.test(fileName)) return "application/pdf";
//     if (/\.(gif)$/i.test(fileName)) return "image/gif";
//     return null;
//   };

//   const getFileName = (m) =>
//     m.msgBody?.media?.fileName || m.msgBody?.message || "File";

//   const getFileSize = (m) =>
//     m.msgBody?.media?.file_size || m.msgBody?.media?.fileSize || null;

//   return (
//     <div
//       key={`${id}-${msg.timestamp}`}
//       id={`msg-${id}`}
//       data-msg-id={id}
//       data-from-user-id={msg.fromUserId}
//       className={`mb-3 flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
//     >
//       <div
//         className={`
//           relative
//           max-w-[72%] sm:max-w-[60%]
//           min-w-0
//           rounded-tl-2xl rounded-br-2xl rounded-bl-2xl
//           p-2 sm:p-3
//           shadow-md
//           ${containerBg}
//         `}
//         style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
//       >
//         {/* Sender name */}
//         {!isCurrentUser && (
//           <div className="text-xs text-[#00a884] mb-1 font-semibold truncate">
//             {msg.fromUserId}
//           </div>
//         )}

//         {/* Reply preview */}
//         {msg.replyTo && (
//           <div
//             className="mb-2 p-2 bg-black/20 rounded-lg border-l-4 border-[#00a884] cursor-pointer hover:bg-black/30"
//             style={{ maxWidth: "100%", overflow: "hidden" }}
//             onClick={() => scrollToMessage(msg.replyTo._id?.toString())}
//           >
//             <div className="text-xs text-[#00a884] font-semibold mb-0.5 truncate">
//               {msg.replyTo.senderId || msg.fromUserId || "User"}
//             </div>
//             <div
//               className="text-xs text-black line-clamp-2"
//               style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
//             >
//               {msg.replyTo.msgBody?.media?.file_url ? (
//                 <MediaIcon media={msg.replyTo.msgBody.media} />
//               ) : typeof msg.replyTo.message === "string" ? (
//                 msg.replyTo.message.slice(0, 100)
//               ) : (
//                 safeReplyText(msg.replyTo.message, groupKey)?.slice(0, 90)
//               )}
//             </div>
//           </div>
//         )}

//         {/* Image media */}
//         {!msg.deletedForEveryone &&
//           getFileUrl(msg) &&
//           (getFileType(msg)?.startsWith("image/") ||
//             msg.msgBody?.media?.message_type === "image" ||
//             msg.messageType === "image") && (
//             <div className="relative group" style={{ maxWidth: "260px" }}>
//               <div className="relative rounded-lg overflow-hidden">
//                 <img
//                   src={getFileUrl(msg)}
//                   alt={getFileName(msg)}
//                   className={`rounded-lg w-full h-auto transition-all ${
//                     msg.msgBody?.media?.is_uploading
//                       ? "opacity-60 cursor-wait"
//                       : "cursor-pointer hover:opacity-90"
//                   }`}
//                   style={{
//                     maxHeight:
//                       getFileType(msg) === "image/gif" ? "none" : "300px",
//                     objectFit: "cover",
//                   }}
//                   onClick={() => {
//                     if (!msg.msgBody?.media?.is_uploading && getFileUrl(msg)) {
//                       if (/\.gif$/i.test(getFileName(msg))) {
//                         setActiveGif(getFileUrl(msg));
//                       } else if (!getFileUrl(msg).startsWith("blob:")) {
//                         window.open(getFileUrl(msg), "_blank");
//                       }
//                     }
//                   }}
//                 />
//                 {msg.msgBody?.media?.is_uploading && (
//                   <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
//                     <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//         {/* Non-image file media */}
//         {!msg.deletedForEveryone &&
//           getFileUrl(msg) &&
//           !getFileType(msg)?.startsWith("image/") && (
//             <div className="max-w-xs">
//               <div
//                 className={`group relative flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-[#1a2332] to-[#0f1419] border transition-all ${
//                   msg.msgBody?.media?.is_uploading
//                     ? "opacity-60"
//                     : "hover:scale-[1.02] cursor-pointer"
//                 }`}
//                 onClick={() => {
//                   if (!msg.msgBody?.media?.is_uploading && getFileUrl(msg))
//                     window.open(getFileUrl(msg), "_blank");
//                 }}
//               >
//                 <div className="relative w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 border border-white">
//                   <File className="w-6 h-6 text-white" />
//                 </div>
//                 <div className="flex-1 min-w-0 relative z-10">
//                   <p className="font-semibold text-sm truncate text-white flex items-center gap-2">
//                     {getFileName(msg)}
//                     <ArrowUpRight className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
//                   </p>
//                   <div className="flex items-center gap-2 mt-1">
//                     <p className="text-xs text-gray-400">
//                       {getFileSize(msg)
//                         ? formatFileSize(getFileSize(msg))
//                         : "Unknown size"}
//                     </p>
//                   </div>
//                 </div>
//                 {!msg.msgBody?.media?.is_uploading && (
//                   <div className="relative z-10 p-2 rounded-lg bg-black opacity-0 group-hover:opacity-100 transition-all">
//                     <Download className="w-4 h-4 text-white" />
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//         {/* Message text */}
//         {msg.deletedForEveryone ? (
//           <div className="text-sm italic text-gray-400">
//             This message was deleted
//           </div>
//         ) : (
//           <>
//             {!getFileUrl(msg) && (
//               <MessageText
//                 text={decryptedText}
//                 isCurrentUser={isCurrentUser}
//                 isReported={
//                   msg.isreported?.count >= 3 && msg.isreported?.isHidden
//                 }
//                 renderMessageWithLinks={renderMessageWithLinks}
//               />
//             )}
//           </>
//         )}

//         {/* Reported warning */}
//         {msg.isreported?.count >= 3 && msg.isreported?.isHidden && (
//           <div className="mb-2 p-2 bg-red-500/20 border border-red-500/50 rounded-md flex items-start gap-2">
//             <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
//             <div className="flex-1 min-w-0">
//               <p className="text-xs font-semibold text-red-400 mb-1">
//                 Reported {msg.isreported.count} times
//               </p>
//               <p className="text-xs text-red-300/80">
//                 Multiple users flagged this content
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Timestamp + menu toggle */}
//         <div className="flex items-center justify-end gap-1 mt-1 text-xs text-gray-400">
//           <span className="text-black text-[10px]">
//             {formatTime(msg.timestamp)}
//           </span>
//           {!msg.deletedForEveryone && (
//             <button
//               className="ml-1 p-1 text-white hover:bg-white/20 rounded-full"
//               onClick={(e) => toggleMenu(id, e, isCurrentUser)}
//             >
//               <ChevronDown className="w-4 h-4" />
//             </button>
//           )}
//         </div>

//         {/* GIF fullscreen modal */}
//         {activeGif && (
//           <div
//             className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90"
//             onClick={() => setActiveGif(null)}
//           >
//             <div
//               className="relative max-w-[90vw] max-h-[90vh]"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <button
//                 onClick={() => setActiveGif(null)}
//                 className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//               <img
//                 src={activeGif}
//                 alt="GIF"
//                 className="max-w-full max-h-[85vh] rounded-lg object-contain"
//               />
//               <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
//                 GIF
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MessageBubble;
import React, { useState } from "react";
import { decryptMessage } from "../socket/encryptmsg";
import MessageText, { safeReplyText } from "./MessageText";
import {
  Image,
  FileText,
  Music,
  Video,
  File,
  Sheet,
  Presentation,
  Archive,
  X,
  AlertTriangle,
  Download,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";

// ─── Media type icon for reply preview ───────────────────────────────────────
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

// ─── Component ────────────────────────────────────────────────────────────────
const MessageBubble = ({
  msg,
  currentUser,
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
}) => {
  const id = msg._id?.toString() || msg.id?.toString();
  const [activeGif, setActiveGif] = useState(null);

  // ── Filter deleted-for-me ─────────────────────────────────────────────────
  if (msg.deletedFor && Array.isArray(msg.deletedFor)) {
    const isDeletedForMe = msg.deletedFor.some(
      (uid) => uid?.toString() === currentUser?.id?.toString(),
    );
    if (isDeletedForMe) return null;
  }

  const isCurrentUser =
    msg.fromUserId?.toString() === currentUser?.id?.toString();
  const containerBg = isCurrentUser
    ? "bg-[#b9fd5c] text-black"
    : "bg-[#202c33] text-gray-200";

  // ── Decrypt message text ──────────────────────────────────────────────────
  let messageText = msg.msgBody?.message;
  let decryptedText = "";

  if (typeof messageText === "object" && messageText !== null) {
    if (messageText.cipherText && groupKey) {
      try {
        decryptedText = decryptMessage(messageText, groupKey);
      } catch {
        decryptedText = "[Encrypted message]";
      }
    } else {
      decryptedText = msg.msgStatus === "pending" ? "sending..." : "[Message]";
    }
  } else if (typeof messageText === "string") {
    decryptedText = messageText;
  } else {
    decryptedText = String(messageText || "");
  }

  // ── Media helpers ─────────────────────────────────────────────────────────
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

  const getFileName = (m) =>
    m.msgBody?.media?.fileName || m.msgBody?.message || "File";

  const getFileSize = (m) =>
    m.msgBody?.media?.file_size || m.msgBody?.media?.fileSize || null;

  // // ── Reply scroll — highlight target message ───────────────────────────────
  // const handleReplyClick = () => {
  //   // Server may use any of these field names for the original message id
  //   const targetId = (
  //     msg.replyTo._id ||
  //     msg.replyTo.msgId ||
  //     msg.replyTo.id ||
  //     msg.replyTo.messageId
  //   )?.toString();
  //   console.log("replyTo._id:", targetId);
  //   console.log("msg.replyTo full:", JSON.stringify(msg.replyTo));
  //   console.log(
  //     "All msg ids:",
  //     [...document.querySelectorAll("[data-msg-id]")].map(
  //       (e) => e.dataset.msgId,
  //     ),
  //   );

  //   if (!targetId) return;

  //   const highlight = (el) => {
  //     el.scrollIntoView({ behavior: "smooth", block: "center" });
  //     el.classList.add("ring-2", "ring-[#00a884]");
  //     setTimeout(() => el.classList.remove("ring-2", "ring-[#00a884]"), 1500);
  //   };

  //   // 1. Exact id match
  //   let el = document.getElementById(`msg-${targetId}`);
  //   if (el) return highlight(el);

  //   // 2. data-msg-id exact match
  //   el = document.querySelector(`[data-msg-id="${targetId}"]`);
  //   if (el) return highlight(el);

  //   // 3. Strip leading uppercase prefix (e.g. JAIMAX) and retry
  //   const stripped = targetId.replace(/^[A-Z]+/, "");
  //   el =
  //     document.getElementById(`msg-${stripped}`) ||
  //     document.querySelector(`[data-msg-id="${stripped}"]`) ||
  //     document.querySelector(`[data-msg-id$="${stripped}"]`);
  //   if (el) return highlight(el);
  // };

  const handleReplyClick = () => {
    const targetId = (
      msg.replyTo._id ||
      msg.replyTo.msgId ||
      msg.replyTo.id
    )?.toString();

    const highlight = (el) => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.style.transition = "background-color 0.3s ease";
      el.style.backgroundColor = "rgba(0, 168, 132, 0.25)";
      setTimeout(() => {
        el.style.backgroundColor = "transparent";
      }, 1500);
    };
    // 1. Try by ID if available
    if (targetId) {
      const el =
        document.getElementById(`msg-${targetId}`) ||
        document.querySelector(`[data-msg-id="${targetId}"]`);
      if (el) return highlight(el);
    }

    // 2. Fallback: match by senderId + message text
    const replyText =
      typeof msg.replyTo.message === "string"
        ? msg.replyTo.message.trim()
        : null;
    const replySender = msg.replyTo.senderId;

    if (replyText || replySender) {
      const allMsgs = document.querySelectorAll("[data-msg-id]");
      for (const el of allMsgs) {
        const elSender = el.dataset.fromUserId;
        const elText = el
          .querySelector("[data-msg-text]")
          ?.dataset.msgText?.trim();
        if (
          elSender === replySender &&
          (!replyText || elText?.includes(replyText))
        ) {
          return highlight(el);
        }
      }
    }
  };

  return (
    <div
      key={`${id}-${msg.timestamp}`}
      id={`msg-${id}`}
      data-msg-id={id}
      data-from-user-id={msg.fromUserId}
      data-msg-text={decryptedText}
      className={`mb-3 flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`
          relative
          max-w-[72%] sm:max-w-[60%]
          min-w-0
          rounded-tl-2xl rounded-br-2xl rounded-bl-2xl
          p-2 sm:p-3
          shadow-md
          ${containerBg}
        `}
        style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
      >
        {/* Sender name */}
        {!isCurrentUser && (
          <div className="text-xs text-[#00a884] mb-1 font-semibold truncate">
            {msg.fromUserId}
          </div>
        )}

        {/* Reply preview */}
        {msg.replyTo && (
          <div
            className="mb-2 p-2 bg-black/20 rounded-lg border-l-4 border-[#00a884] cursor-pointer hover:bg-black/30"
            style={{ maxWidth: "100%", overflow: "hidden" }}
            onClick={handleReplyClick}
          >
            <div className="text-xs text-[#00a884] font-semibold mb-0.5 truncate">
              {msg.replyTo.senderName || msg.replyTo.senderId || "User"}
            </div>
            <div
              className="text-xs text-gray-400 line-clamp-2"
              style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
            >
              {msg.replyTo.msgBody?.media?.file_url ? (
                <MediaIcon media={msg.replyTo.msgBody.media} />
              ) : typeof msg.replyTo.message === "string" ? (
                msg.replyTo.message.slice(0, 100)
              ) : (
                safeReplyText(msg.replyTo.message, groupKey)?.slice(0, 100)
              )}
            </div>
          </div>
        )}

        {/* Image media */}
        {!msg.deletedForEveryone &&
          getFileUrl(msg) &&
          (getFileType(msg)?.startsWith("image/") ||
            msg.msgBody?.media?.message_type === "image" ||
            msg.messageType === "image") && (
            <div className="relative group" style={{ maxWidth: "260px" }}>
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={getFileUrl(msg)}
                  alt={getFileName(msg)}
                  className={`rounded-lg w-full h-auto transition-all ${
                    msg.msgBody?.media?.is_uploading
                      ? "opacity-60 cursor-wait"
                      : "cursor-pointer hover:opacity-90"
                  }`}
                  style={{
                    maxHeight:
                      getFileType(msg) === "image/gif" ? "none" : "300px",
                    objectFit: "cover",
                  }}
                  onClick={() => {
                    if (!msg.msgBody?.media?.is_uploading && getFileUrl(msg)) {
                      if (/\.gif$/i.test(getFileName(msg))) {
                        setActiveGif(getFileUrl(msg));
                      } else if (!getFileUrl(msg).startsWith("blob:")) {
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

        {/* Non-image file media */}
        {!msg.deletedForEveryone &&
          getFileUrl(msg) &&
          !getFileType(msg)?.startsWith("image/") && (
            <div className="max-w-xs">
              <div
                className={`group relative flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-[#1a2332] to-[#0f1419] border transition-all ${
                  msg.msgBody?.media?.is_uploading
                    ? "opacity-60"
                    : "hover:scale-[1.02] cursor-pointer"
                }`}
                onClick={() => {
                  if (!msg.msgBody?.media?.is_uploading && getFileUrl(msg))
                    window.open(getFileUrl(msg), "_blank");
                }}
              >
                <div className="relative w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 border border-white">
                  <File className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0 relative z-10">
                  <p className="font-semibold text-sm truncate text-white flex items-center gap-2">
                    {getFileName(msg)}
                    <ArrowUpRight className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-400">
                      {getFileSize(msg)
                        ? formatFileSize(getFileSize(msg))
                        : "Unknown size"}
                    </p>
                  </div>
                </div>
                {!msg.msgBody?.media?.is_uploading && (
                  <div className="relative z-10 p-2 rounded-lg bg-black opacity-0 group-hover:opacity-100 transition-all">
                    <Download className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Message text */}
        {msg.deletedForEveryone ? (
          <div className="text-sm italic text-gray-400">
            This message was deleted
          </div>
        ) : (
          <>
            {!getFileUrl(msg) && (
              <MessageText
                text={decryptedText}
                isCurrentUser={isCurrentUser}
                isReported={
                  msg.isreported?.count >= 3 && msg.isreported?.isHidden
                }
                renderMessageWithLinks={renderMessageWithLinks}
              />
            )}
          </>
        )}

        {/* Reported warning */}
        {msg.isreported?.count >= 3 && msg.isreported?.isHidden && (
          <div className="mb-2 p-2 bg-red-500/20 border border-red-500/50 rounded-md flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-red-400 mb-1">
                Reported {msg.isreported.count} times
              </p>
              <p className="text-xs text-red-300/80">
                Multiple users flagged this content
              </p>
            </div>
          </div>
        )}

        {/* Timestamp + menu */}
        <div className="flex items-center justify-end gap-1 mt-1 text-xs text-gray-400">
          <span className="text-black text-[10px]">
            {formatTime(msg.timestamp)}
          </span>
          {!msg.deletedForEveryone && (
            <button
              className="ml-1 p-1 text-white hover:bg-white/20 rounded-full"
              onClick={(e) => toggleMenu(id, e, isCurrentUser)}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* GIF fullscreen modal */}
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
                className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={activeGif}
                alt="GIF"
                className="max-w-full max-h-[85vh] rounded-lg object-contain"
              />
              <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
                GIF
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
