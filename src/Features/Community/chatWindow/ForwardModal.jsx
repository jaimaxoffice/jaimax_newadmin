import React, { useState } from "react";
import { X, Search, Send } from "lucide-react";

const ForwardModal = ({ onClose, onForward, message, groupKey }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChats, setSelectedChats] = useState([]);

  // You would fetch available chats from your parent/context
  // For now this is a placeholder structure
  const [availableChats] = useState([]);

  const toggleChat = (chatId) => {
    setSelectedChats((prev) =>
      prev.includes(chatId)
        ? prev.filter((id) => id !== chatId)
        : [...prev, chatId]
    );
  };

  const handleForward = () => {
    if (selectedChats.length === 0) return;
    onForward(selectedChats);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#233138] rounded-xl w-full max-w-md mx-4 shadow-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a3942]">
          <h3 className="text-white text-lg font-medium">Forward message</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#2a3942] rounded-full"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-[#2a3942]">
          <div className="flex items-center gap-2 bg-[#2a3942] rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search chats…"
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder-gray-500"
            />
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto sidebar-scroll">
          {availableChats.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
              No chats available to forward
            </div>
          ) : (
            availableChats
              .filter((chat) =>
                chat.name
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase())
              )
              .map((chat) => (
                <button
                  key={chat.chatId}
                  onClick={() => toggleChat(chat.chatId)}
                  className={`w-full flex items-center gap-3 px-5 py-3 hover:bg-[#2a3942] transition-colors ${
                    selectedChats.includes(chat.chatId)
                      ? "bg-[#005c4b]/30"
                      : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#2a3942] flex items-center justify-center text-gray-300">
                    {chat.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <span className="flex-1 text-left text-sm text-gray-300">
                    {chat.name}
                  </span>
                  {selectedChats.includes(chat.chatId) && (
                    <div className="w-5 h-5 rounded-full bg-[#00a884] flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        viewBox="0 0 16 11"
                      >
                        <path
                          d="M1 5l4 4L14 1"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))
          )}
        </div>

        {/* Forward button */}
        {selectedChats.length > 0 && (
          <div className="px-5 py-4 border-t border-[#2a3942]">
            <button
              onClick={handleForward}
              className="w-full flex items-center justify-center gap-2 bg-[#00a884] hover:bg-[#06cf9c] text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              <Send className="w-4 h-4" />
              Forward to {selectedChats.length} chat
              {selectedChats.length > 1 ? "s" : ""}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForwardModal;