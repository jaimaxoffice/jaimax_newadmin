import React from 'react';
import { File, Download, ArrowUpRight, ChevronDown, AlertTriangle } from 'lucide-react';
import { decryptMessage } from '../encryptmsg';

const MessageBubble = ({
    msg,
    currentUser,
    groupKey,
    formatTime,
    formatFileSize,
    toggleMenu,
    scrollToMessage,
    renderMessageWithLinks,
}) => {
    const id = msg.msgId || msg.id;
    const isCurrentUser = msg.fromUserId?.toString() === currentUser?.id?.toString();
    const containerBg = isCurrentUser ? "bg-[#b9fd5c] text-black" : "bg-[#202c33] text-gray-200";

    // ── decrypt message text ───────────────────────────────────────────────────
    let decryptedText = '';
    const messageText = msg.msgBody?.message;

    if (typeof messageText === 'object' && messageText !== null) {
        if (messageText.cipherText && groupKey) {
            try { decryptedText = decryptMessage(messageText, groupKey); }
            catch { decryptedText = "[Encrypted message]"; }
        } else {
            decryptedText = "sending";
        }
    } else if (typeof messageText === 'string') {
        decryptedText = messageText;
        if (groupKey && messageText && !msg.deletedForEveryone) {
            try {
                if (messageText.length > 100) decryptedText = decryptMessage(messageText, groupKey);
            } catch { decryptedText = messageText; }
        }
    } else {
        decryptedText = String(messageText || '');
    }

    // ── file helpers ───────────────────────────────────────────────────────────
    const fileUrl  = msg.msgBody?.media?.file_url || msg.fileUrl || msg.msgBody?.media?.fileUrl || null;
    const fileType = msg.msgBody?.media?.file_type || msg.msgBody?.media?.fileType || null;
    const fileName = msg.msgBody?.media?.fileName  || msg.msgBody?.message || 'File';
    const fileSize = msg.msgBody?.media?.file_size || msg.msgBody?.media?.fileSize || null;
    const isImage  = fileType?.startsWith('image/');

    return (
        <div
            id={`msg-${id}`}
            data-msg-id={id}
            data-from-user-id={msg.fromUserId}
            className={`mb-4 flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
        >
            <div className={`relative max-w-[75%] sm:max-w-[60%] rounded-tl-2xl rounded-br-2xl rounded-bl-2xl p-2 sm:p-3 shadow-md ${containerBg}`}>

                {/* Sender name */}
                {!isCurrentUser && (
                    <div className="text-xs text-[#00a884] mb-1 font-semibold">{msg.fromUserId}</div>
                )}

                {/* Reply quote */}
                {msg.replyTo && (
                    <div
                        className="mb-2 p-2 bg-black/20 rounded border-l-4 border-[#00a884] cursor-pointer hover:bg-black/30"
                        onClick={() => scrollToMessage(msg.replyTo.msgId)}
                    >
                        <div className="text-xs text-[#00a884] font-semibold mb-1">{msg.fromUserId || 'User'}</div>
                        <div className="text-xs text-gray-400 truncate">
                            {(() => {
                                let rt = msg.replyTo.message;
                                if (typeof rt === 'object' && rt?.cipherText) {
                                    try { rt = decryptMessage(rt, groupKey); } catch { rt = '[Encrypted]'; }
                                }
                                return String(rt || 'Media message');
                            })()}
                        </div>
                    </div>
                )}

                {/* Image */}
                {!msg.deletedForEveryone && fileUrl && isImage && (
                    <div className="relative group max-w-xs">
                        <img
                            src={fileUrl}
                            alt={fileName}
                            className={`rounded-lg max-w-full transition-all ${msg.msgBody?.media?.is_uploading ? 'opacity-60 cursor-wait' : 'cursor-pointer hover:opacity-90'}`}
                            onClick={() => {
                                if (!msg.msgBody?.media?.is_uploading && fileUrl && !fileUrl.startsWith('blob:'))
                                    window.open(fileUrl, '_blank');
                            }}
                        />
                    </div>
                )}

                {/* Document / file */}
                {!msg.deletedForEveryone && fileUrl && !isImage && (
                    <div className="max-w-xs">
                        <div
                            className={`group relative flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-[#1a2332] to-[#0f1419] border transition-all ${msg.msgBody?.media?.is_uploading ? 'opacity-60' : 'hover:scale-[1.02] cursor-pointer'}`}
                            onClick={() => { if (!msg.msgBody?.media?.is_uploading && fileUrl) window.open(fileUrl, '_blank'); }}
                        >
                            <div className="relative w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 border border-white group-hover:scale-110 transition-transform">
                                <File className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0 relative z-10">
                                <p className="font-semibold text-sm truncate text-white flex items-center gap-2">
                                    {fileName}
                                    <ArrowUpRight className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-gray-400">
                                        {fileSize ? formatFileSize(fileSize) : 'Unknown size'}
                                    </p>
                                </div>
                            </div>
                            {!msg.msgBody?.media?.is_uploading && (
                                <div className="relative z-10 p-2 rounded-lg bg-black opacity-0 group-hover:opacity-100 transition-all group-hover:scale-110 shadow-lg">
                                    <Download className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Text body */}
                {msg.deletedForEveryone ? (
                    <div className="text-sm break-words whitespace-pre-wrap">
                        <span className="italic text-gray-400">This message was deleted</span>
                    </div>
                ) : (
                    !fileUrl && (
                        <div className="text-sm break-words whitespace-pre-wrap">
                            {msg.isreported?.count >= 3 && msg.isreported?.isHidden
                                ? <div className="flex items-center gap-2 text-gray-400 italic"><span></span></div>
                                : renderMessageWithLinks(decryptedText)
                            }
                        </div>
                    )
                )}

                {/* Reported warning */}
                {msg.isreported?.count >= 3 && msg.isreported?.isHidden && (
                    <div className="mb-2 p-2 bg-red-500/20 border border-red-500/50 rounded-md flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-semibold text-red-400 mb-1">
                                Reported {msg.isreported.count} times
                            </p>
                            <p className="text-xs text-red-300/80">Multiple users flagged this content</p>
                        </div>
                    </div>
                )}

                {/* Timestamp + menu */}
                <div className="flex items-center justify-end gap-1 mt-1 text-xs text-gray-400">
                    <span className='text-white'>{formatTime(msg.timestamp)}</span>
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
};

export default MessageBubble;