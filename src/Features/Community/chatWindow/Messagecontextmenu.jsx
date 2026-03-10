import React from 'react';
import { CornerUpLeft, CornerUpRight, Clipboard, Trash2 } from 'lucide-react';

const MessageContextMenu = ({
    messages,
    effectiveOpenMenuId,
    menuPosition,
    currentUser,
    userRole,
    copiedMessageId,
    handleReply,
    handleCopyMessage,
    retryMessage,
    deleteForMe,
    deleteForEveryone,
    setEffectiveOpenMenuId,
}) => {
    const msg = messages?.find(m => (m.msgId || m.id) === effectiveOpenMenuId);
    if (!msg) return null;

    const isMyMessage = msg.fromUserId?.toString() === currentUser?.id?.toString();
    const isAdmin = userRole === 2 || userRole === 0;
    const idToDelete = msg._id?.toString() || msg.msgId || msg.id;

    return (
        <div
            className="absolute z-50 w-52 bg-[#2a3942] rounded-xl shadow-2xl border border-[#3b4a54] overflow-hidden"
            style={{ top: menuPosition.top, left: menuPosition.left }}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Reply */}
            {/* <button
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#3b4a54] w-full text-left text-sm text-white transition-colors"
                onClick={() => { handleReply(msg); setEffectiveOpenMenuId(null); }}
            >
                <CornerUpLeft className="w-4 h-4 text-[#00a884]" />
                <span>Reply</span>
            </button> */}

            {/* Copy */}
            {msg.msgBody?.message && (
                <button
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#3b4a54] w-full text-left text-sm text-white transition-colors border-t border-[#3b4a54]"
                    onClick={() => handleCopyMessage(msg.msgBody.message, effectiveOpenMenuId)}
                >
                    <Clipboard className="w-4 h-4 text-blue-400" />
                    <span>{copiedMessageId === effectiveOpenMenuId ? "Copied ✓" : "Copy"}</span>
                </button>
            )}

            {/* Retry */}
            {msg.status === "failed" && (
                <button
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#3b4a54] w-full text-left text-sm text-orange-400 transition-colors border-t border-[#3b4a54]"
                    onClick={() => { retryMessage(msg); setEffectiveOpenMenuId(null); }}
                >
                    <CornerUpRight className="w-4 h-4" />
                    <span>Retry</span>
                </button>
            )}

            {/* Delete for me */}
            <button
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#3b4a54] w-full text-left text-sm text-red-400 transition-colors border-t border-[#3b4a54]"
                onClick={() => { deleteForMe(idToDelete); setEffectiveOpenMenuId(null); }}
            >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>Delete for Me</span>
            </button>

            {/* Delete for everyone */}
            {(isMyMessage || isAdmin) && (
                <button
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#3b4a54] w-full text-left text-sm text-red-400 transition-colors border-t border-[#3b4a54]"
                    onClick={() => { deleteForEveryone(idToDelete); setEffectiveOpenMenuId(null); }}
                >
                    <Trash2 className="w-4 h-4 text-red-400" />
                    <span>Delete for Everyone</span>
                </button>
            )}
        </div>
    );
};

export default MessageContextMenu;