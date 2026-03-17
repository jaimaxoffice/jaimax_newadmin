import React from "react";
import { X, Star } from "lucide-react";

const StarredMessagesPanel = ({
  starredMessages,
  loading,
  onClose,
  onScrollToMessage,
  onUnstar,
  formatTime,
  groupKey,
  currentUser,
}) => {
  return (
    <div className="flex-1 flex flex-col bg-[#111b21] overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#202c33] border-b border-[#2a3942]">
        <button
          onClick={onClose}
          className="p-1 hover:bg-[#2a3942] rounded-full"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
        <h3 className="text-white font-medium">Starred messages</h3>
      </div>

      <div className="flex-1 overflow-y-auto sidebar-scroll p-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2a3942] border-t-[#00a884]" />
          </div>
        ) : starredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Star className="w-16 h-16 opacity-30 mb-4" />
            <p className="text-lg mb-1">No starred messages</p>
            <p className="text-sm text-center">
              Tap and hold on a message to star it
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {starredMessages.map((msg) => {
              const msgId = msg._id?.toString() || msg.msgId;
              const isCurrentUser =
                msg.fromUserId?.toString() ===
                currentUser?.id?.toString();
              return (
                <div
                  key={msgId}
                  className="bg-[#202c33] rounded-lg p-3 cursor-pointer hover:bg-[#2a3942] transition-colors"
                  onClick={() => onScrollToMessage(msgId)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-[#00a884]">
                      {isCurrentUser
                        ? "You"
                        : msg.publisherName || "Unknown"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500">
                        {formatTime(msg.timestamp)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnstar(msgId);
                        }}
                        className="p-0.5 hover:bg-[#374751] rounded"
                      >
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2">
                    {msg.msgBody?.message_type === "file"
                      ? `📎 ${msg.msgBody?.media?.fileName || "File"}`
                      : typeof msg.msgBody?.message === "string"
                        ? msg.msgBody.message
                        : "Message"}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StarredMessagesPanel;