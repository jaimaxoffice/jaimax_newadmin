import React from 'react';
import { Trash2, FolderOpen } from 'lucide-react';
import { BsThreeDotsVertical } from "react-icons/bs";

const ChatHeader = ({
    selectedGroup,
    typingUsers,
    totalUsers,
    showHeaderMenu,
    setShowHeaderMenu,
    setShowMembers,
    setShowFilesPanel,
    setShowClearChatModal,
    getTypingText,
    headerRef,
}) => {
    return (
        <div ref={headerRef} className="bg-[#b9fd5c] p-2 sm:p-4 flex items-center justify-between border-b border-[#2a3942] sidebar-scroll">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 sidebar-scroll">
                <div
                    onClick={() => { setShowMembers(true); setShowFilesPanel(false); }}
                    className="flex items-center gap-3 flex-1 cursor-pointer p-2 rounded-lg transition-colors min-w-0 ml-2"
                >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00a884] to-[#008069] flex items-center justify-center text-xl flex-shrink-0">
                        <img src="https://res.cloudinary.com/ddefr5owc/image/upload/v1766049897/logo_xwrr9w.png" alt="" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="font-semibold truncate">{selectedGroup?.name}</h2>
                        {typingUsers?.length > 0 ? (
                            <div className="flex items-center gap-1">
                                <p className="text-xs text-white truncate animate-pulse">{getTypingText()}</p>
                                <div className="flex gap-0.5">
                                    <span className="w-1 h-1 bg-[#00a884] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1 h-1 bg-[#00a884] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-1 h-1 bg-[#00a884] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-black truncate">{totalUsers ?? 0} members</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="relative">
                <button
                    onClick={(e) => { e.stopPropagation(); setShowHeaderMenu(prev => !prev); }}
                    className="p-2 rounded-lg transition-colors flex-shrink-0"
                >
                    <BsThreeDotsVertical className='w-6 h-6 text-black' />
                </button>

                {showHeaderMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#000000] rounded-lg shadow-xl border border-[#2a3942] overflow-hidden z-50">
                        <button
                            onClick={() => { setShowFilesPanel(true); setShowMembers(false); setShowHeaderMenu(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#0b141a] text-left transition-colors"
                        >
                            <FolderOpen className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">Shared Files</span>
                        </button>
                        <div className="border-t border-[#2a3942]">
                            <button
                                onClick={() => { setShowClearChatModal(true); setShowHeaderMenu(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-600/10 text-left transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-sm">Clear Chat</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatHeader;