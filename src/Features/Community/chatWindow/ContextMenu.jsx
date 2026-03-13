import React from 'react';
import { Clipboard, CornerUpLeft, CornerUpRight, Trash2 } from 'lucide-react';

const ContextMenu = ({
    effectiveOpenMenuId,
    menuPosition,
    messages,
    currentUser,
    userRole,
    groupKey,
    copiedMessageId,
    handleReply,
    handleCopyMessage,
    retryMessage,
    deleteForMe,
    deleteForEveryone,
    setEffectiveOpenMenuId,
}) => {
    if (!effectiveOpenMenuId) return null;

    return (
        <div
            className="absolute z-50 w-52 bg-[#2a3942] rounded-xl shadow-2xl border border-[#3b4a54] overflow-hidden"
            style={{ top: menuPosition.top, left: menuPosition.left }}
            onClick={(e) => e.stopPropagation()}
        >
            <button
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#3b4a54] w-full text-left text-sm text-white transition-colors"
                onClick={() => {
                    const msg = messages?.find(m => (m.msgId || m.id) === effectiveOpenMenuId);
                    if (msg) { handleReply(msg); setEffectiveOpenMenuId(null); }
                }}
            >
                <CornerUpLeft className="w-4 h-4 text-[#00a884]" /><span>Reply</span>
            </button>

            {messages?.find(m => (m.msgId || m.id) === effectiveOpenMenuId)?.msgBody?.message && (
                <button
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#3b4a54] w-full text-left text-sm text-white transition-colors border-t border-[#3b4a54]"
                    onClick={() => handleCopyMessage(
                        messages.find(m => (m.msgId || m.id) === effectiveOpenMenuId).msgBody.message,
                        effectiveOpenMenuId
                    )}
                >
                    <Clipboard className="w-4 h-4 text-blue-400" />
                    <span>{copiedMessageId === effectiveOpenMenuId ? "Copied ✓" : "Copy"}</span>
                </button>
            )}

            {messages?.find(m => (m.msgId || m.id) === effectiveOpenMenuId)?.status === "failed" && (
                <button
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#3b4a54] w-full text-left text-sm text-orange-400 transition-colors border-t border-[#3b4a54]"
                    onClick={() => {
                        const msg = messages.find(m => (m.msgId || m.id) === effectiveOpenMenuId);
                        if (msg) { retryMessage(msg); setEffectiveOpenMenuId(null); }
                    }}
                >
                    <CornerUpRight className="w-4 h-4" /><span>Retry</span>
                </button>
            )}

            <button
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#3b4a54] w-full text-left text-sm text-red-400 transition-colors border-t border-[#3b4a54]"
                onClick={() => {
                    const msg = messages.find(m => (m.msgId || m.id) === effectiveOpenMenuId);
                    if (msg) { deleteForMe(msg._id?.toString() || msg.msgId || msg.id); setEffectiveOpenMenuId(null); }
                }}
            >
                <Trash2 className="w-4 h-4 text-red-400" /><span>Delete for Me</span>
            </button>

            {(() => {
                const msg = messages?.find((m) => (m.msgId || m.id) === effectiveOpenMenuId);
                const isMyMessage = msg?.fromUserId?.toString() === currentUser?.id?.toString();
                const isAdmin = userRole === 2 || userRole === 0;
                if (isMyMessage || isAdmin) return (
                    <button
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#3b4a54] w-full text-left text-sm text-red-400 transition-colors border-t border-[#3b4a54]"
                        onClick={() => {
                            if (msg) { deleteForEveryone(msg._id?.toString() || msg.msgId || msg.id); setEffectiveOpenMenuId(null); }
                        }}
                    >
                        <Trash2 className="w-4 h-4 text-red-400" /><span>Delete for Everyone</span>
                    </button>
                );
                return null;
            })()}
        </div>
    );
};

export default ContextMenu;