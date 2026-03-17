import React, { useEffect, useRef, useState } from "react";
import {
  Reply,
  Copy,
  Check,
  Pencil,
  Star,
  Pin,
  PinOff,
  Info,
  Flag,
  Trash2,
  Forward,
  SmilePlus,
} from "lucide-react";

const EnhancedContextMenu = ({
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
  handlePinMessage,
  handleUnpinMessage,
  handleStarMessage,
  handleUnstarMessage,
  handleForward,
  handleEditMessage,
  handleShowMessageInfo,
  handleReport,
  isMessageStarred,
  isMessagePinned,
  canEditMessage,
}) => {
  const menuRef = useRef(null);
  const [animateIn, setAnimateIn] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // "me" | "everyone" | null

  // Animate in on open
  useEffect(() => {
    if (effectiveOpenMenuId) {
      requestAnimationFrame(() => setAnimateIn(true));
    } else {
      setAnimateIn(false);
      setShowDeleteConfirm(null);
    }
  }, [effectiveOpenMenuId]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setEffectiveOpenMenuId(null);
      }
    };
    if (effectiveOpenMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [effectiveOpenMenuId]);

  if (!effectiveOpenMenuId) return null;

  const msg = messages?.find(
    (m) => (m.msgId || m._id?.toString()) === effectiveOpenMenuId
  );
  if (!msg) return null;

  const isCurrentUser =
    msg.fromUserId?.toString() === currentUser?.id?.toString();
  const isAdmin = userRole === "admin" || userRole === "superAdmin";
  const starred = isMessageStarred(msg);
  const pinned = isMessagePinned(msg);
  const editable = canEditMessage(msg);
  const msgId = msg.msgId || msg._id?.toString();
  const isCopied = copiedMessageId === effectiveOpenMenuId;
  const isTextMessage = msg.msgBody?.message_type !== "file";

  const closeMenu = () => setEffectiveOpenMenuId(null);

  // Quick reactions row
  const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  // ── Delete confirmation view ──
  if (showDeleteConfirm) {
    return (
      <div
        ref={menuRef}
        className={`fixed z-[60] transition-all duration-200 ease-out
          ${animateIn ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        style={{
          top: menuPosition.top,
          left: menuPosition.left,
          transformOrigin: "top left",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#1f2c34] rounded-2xl shadow-2xl border border-[#30444f] w-[280px] overflow-hidden backdrop-blur-sm">
          {/* Warning icon */}
          <div className="flex flex-col items-center pt-5 pb-3 px-5">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-white text-sm font-medium text-center">
              {showDeleteConfirm === "everyone"
                ? "Delete for everyone?"
                : "Delete for you?"}
            </p>
            <p className="text-gray-500 text-xs text-center mt-1.5 leading-relaxed">
              {showDeleteConfirm === "everyone"
                ? "This message will be removed for all members in this chat."
                : "This message will only be removed from your view."}
            </p>
          </div>

          {/* Actions */}
          <div className="px-4 pb-4 flex gap-2.5">
            <button
              onClick={() => setShowDeleteConfirm(null)}
              className="flex-1 py-2.5 text-sm text-gray-400 bg-[#2a3942] 
                hover:bg-[#35474f] rounded-xl font-medium transition-all 
                active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (showDeleteConfirm === "everyone") {
                  deleteForEveryone(msgId);
                } else {
                  deleteForMe(msgId, currentUser.id);
                }
                closeMenu();
              }}
              className="flex-1 py-2.5 text-sm text-white bg-red-500 
                hover:bg-red-600 rounded-xl font-medium transition-all 
                active:scale-95"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main menu ──
  return (
    <div
      ref={menuRef}
      className={`fixed z-[60] transition-all duration-200 ease-out
        ${animateIn ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      style={{
        top: menuPosition.top,
        left: menuPosition.left,
        transformOrigin: "top left",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-[#1f2c34] rounded-2xl shadow-2xl border border-[#30444f] w-[220px] overflow-hidden backdrop-blur-sm">
        {/* ── Quick Reactions Row ── */}
        <div className="px-3 pt-3 pb-2 border-b border-[#2a3942]/60">
          <div className="flex items-center justify-between">
            {quickReactions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  // Handle reaction
                  closeMenu();
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full 
                  hover:bg-[#2a3942] text-lg transition-all duration-150 
                  hover:scale-125 active:scale-95"
              >
                {emoji}
              </button>
            ))}
            <button
              onClick={() => {
                // Open full emoji picker
                closeMenu();
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full 
                hover:bg-[#2a3942] transition-all duration-150 
                hover:scale-110 active:scale-95"
            >
              <SmilePlus className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* ── Menu Items ── */}
        <div className="py-1.5">
          {/* Reply */}
          <MenuItem
            icon={<Reply className="w-[18px] h-[18px]" />}
            label="Reply"
            onClick={() => {
              handleReply(msg);
              closeMenu();
            }}
          />

          {/* Copy (text only) */}
          {isTextMessage && (
            <MenuItem
              icon={
                isCopied ? (
                  <Check className="w-[18px] h-[18px] text-green-400" />
                ) : (
                  <Copy className="w-[18px] h-[18px]" />
                )
              }
              label={isCopied ? "Copied!" : "Copy"}
              success={isCopied}
              onClick={() => {
                handleCopyMessage(msg.msgBody?.message, effectiveOpenMenuId);
              }}
            />
          )}

          {/* Edit */}
          {isCurrentUser && editable && (
            <MenuItem
              icon={<Pencil className="w-[18px] h-[18px]" />}
              label="Edit"
              onClick={() => {
                handleEditMessage(msg);
                closeMenu();
              }}
            />
          )}

          {/* Forward */}
          {/* <MenuItem
            icon={<Forward className="w-[18px] h-[18px]" />}
            label="Forward"
            onClick={() => {
              handleForward(msg);
              closeMenu();
            }}
          /> */}

          {/* Star / Unstar */}
          {/* <MenuItem
            icon={
              <Star
                className={`w-[18px] h-[18px] ${
                  starred ? "text-yellow-400 fill-yellow-400" : ""
                }`}
              />
            }
            label={starred ? "Unstar" : "Star"}
            highlight={starred}
            onClick={() => {
              starred ? handleUnstarMessage(msgId) : handleStarMessage(msgId);
              closeMenu();
            }}
          /> */}

          {/* Pin / Unpin */}
          <MenuItem
            icon={
              pinned ? (
                <PinOff className="w-[18px] h-[18px]" />
              ) : (
                <Pin className="w-[18px] h-[18px]" />
              )
            }
            label={pinned ? "Unpin" : "Pin"}
            onClick={() => {
              pinned ? handleUnpinMessage(msgId) : handlePinMessage(msgId);
              closeMenu();
            }}
          />

          {/* Message Info (own messages) */}
          {isCurrentUser && (
            <MenuItem
              icon={<Info className="w-[18px] h-[18px]" />}
              label="Message info"
              onClick={() => {
                handleShowMessageInfo(msg);
                closeMenu();
              }}
            />
          )}

          {/* ── Divider ── */}
          <div className="my-1.5 mx-3 border-t border-[#2a3942]/60" />

          {/* Report (other's messages) */}
          {!isCurrentUser && (
            <MenuItem
              icon={<Flag className="w-[18px] h-[18px]" />}
              label="Report"
              onClick={() => {
                handleReport(msg);
                closeMenu();
              }}
            />
          )}

          {/* Delete for me */}
          <MenuItem
            icon={<Trash2 className="w-[18px] h-[18px]" />}
            label="Delete for me"
            danger
            onClick={() => setShowDeleteConfirm("me")}
          />

          {/* Delete for everyone */}
          {(isCurrentUser || isAdmin) && (
            <MenuItem
              icon={<Trash2 className="w-[18px] h-[18px]" />}
              label="Delete for everyone"
              danger
              onClick={() => setShowDeleteConfirm("everyone")}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ── Reusable menu item ──
const MenuItem = ({
  icon,
  label,
  onClick,
  danger = false,
  success = false,
  highlight = false,
}) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] 
        font-normal transition-all duration-150 active:scale-[0.98]
        ${
          danger
            ? "text-red-400 hover:bg-red-500/8"
            : success
              ? "text-green-400 hover:bg-[#2a3942]"
              : highlight
                ? "text-yellow-400 hover:bg-[#2a3942]"
                : "text-[#d1d7db] hover:bg-[#2a3942]"
        }`}
    >
      <span
        className={`flex-shrink-0 ${
          danger
            ? "text-red-400/70"
            : success
              ? "text-green-400/70"
              : highlight
                ? "text-yellow-400/70"
                : "text-[#8696a0]"
        }`}
      >
        {icon}
      </span>
      <span className="flex-1 text-left">{label}</span>
    </button>
  );
};

export default EnhancedContextMenu;