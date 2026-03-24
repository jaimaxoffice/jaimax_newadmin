

import React, { useState, useEffect } from "react";
import { FolderOpen, Trash2, ShieldBan, ArrowLeft } from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";

const ChatHeader = ({
  selectedGroup,
  totalUsers,
  typingUsers,
  setShowMembers,
  setShowFilesPanel,
  setActiveGroupTab,
  setShowClearChatModal,
  headerRef,
  isEffectiveAdmin,
  blockedUsers = [],
  onShowBlockedUsers,
  onBackToGroups,
  isMobile,
  onShowStarred,
}) => {
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => {
      if (showHeaderMenu) setShowHeaderMenu(false);
    };
    if (showHeaderMenu) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showHeaderMenu]);

  const getTypingText = () => {
    if (!typingUsers || typingUsers.length === 0) return null;
    if (typingUsers.length === 1) return `${typingUsers[0].userId} is typing`;
    if (typingUsers.length === 2)
      return `${typingUsers[0].userId} and ${typingUsers[1].userId} are typing...`;
    return `${typingUsers.length} people are typing...`;
  };

  if (!selectedGroup) return null;

  return (
    <div
      ref={headerRef}
      className="sticky top-0 z-30 bg-[#b9fd5c] p-2 sm:p-4 flex items-center justify-between border-b border-[#2a3942] flex-shrink-0 w-full z-50"
    >
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        {/* Back button on mobile */}
        {isMobile && onBackToGroups && (
          <button
            onClick={onBackToGroups}
            className="p-1.5 rounded-lg transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-black" />
          </button>
        )}

        <div
          onClick={() => {
            setShowMembers(true);
            setShowFilesPanel(false);
          }}
          className="flex items-center gap-3 flex-1 cursor-pointer p-2 rounded-lg transition-colors min-w-0 ml-2"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00a884] to-[#008069] flex items-center justify-center text-xl flex-shrink-0">
            <img
              src="https://res.cloudinary.com/ddefr5owc/image/upload/v1766049897/logo_xwrr9w.png"
              alt=""
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-black truncate">
              {selectedGroup?.name}
            </h2>
            {typingUsers?.length > 0 ? (
              <div className="flex items-center gap-1">
                <p className="text-xs text-white truncate animate-pulse">
                  {getTypingText()}
                </p>
                <div className="flex gap-0.5">
                  <span
                    className="w-1 h-1 bg-[#00a884] rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1 h-1 bg-[#00a884] rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1 h-1 bg-[#00a884] rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-black truncate">
                {totalUsers ?? 0} members
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="relative flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowHeaderMenu((prev) => !prev);
          }}
          className="p-2 rounded-lg transition-colors"
        >
          <BsThreeDotsVertical className="w-6 h-6 text-black" />
        </button>

        {showHeaderMenu && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-[#000000] rounded-lg shadow-xl border border-[#2a3942] overflow-hidden z-50">

            {/* Blocked Users — admin only */}
            {/* {isEffectiveAdmin && (
              <button
                onClick={() => {
                  onShowBlockedUsers?.();
                  setShowHeaderMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#0b141a] text-left transition-colors"
              >
                <ShieldBan className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-sm text-white flex items-center gap-2">
                  Blocked Users
                  {blockedUsers.length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                      {blockedUsers.length}
                    </span>
                  )}
                </span>
              </button>
            )} */}

            {/* Clear Chat */}
            <div className={isEffectiveAdmin ? "border-t border-[#2a3942]" : ""}>
              <button
                onClick={() => {
                  setShowClearChatModal(true);
                  setShowHeaderMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-600/10 text-left transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span className="text-sm text-white">Clear Chat</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;