import React from "react";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const EmojiReactionPicker = ({
  show,
  msgId,
  position,
  onReact,
  onClose,
  currentReaction,
}) => {
  if (!show || !msgId) return null;

  return (
    <div
      className="fixed z-50 bg-[#233138] rounded-full shadow-2xl border border-[#2a3942] px-2 py-1.5 flex items-center gap-1"
      style={{
        top: Math.max(10, position.top),
        left: Math.max(10, position.left),
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {REACTION_EMOJIS.map((emoji) => {
        const isActive = currentReaction === emoji;
        return (
          <button
            key={emoji}
            onClick={() => onReact(msgId, emoji)}
            className={`w-9 h-9 flex items-center justify-center rounded-full text-xl 
              transition-all duration-200 hover:scale-125 
              ${
                isActive
                  ? "bg-[#005c4b] ring-2 ring-[#00a884] scale-110"
                  : "hover:bg-[#2a3942]"
              }`}
            title={emoji}
          >
            {emoji}
          </button>
        );
      })}

      {/* Close / Remove reaction */}
      <button
        onClick={() => onClose()}
        className="w-7 h-7 flex items-center justify-center rounded-full 
          hover:bg-[#2a3942] text-gray-500 hover:text-gray-300 
          ml-1 border-l border-[#2a3942] pl-1 transition-colors"
        title="Close"
      >
        ✕
      </button>
    </div>
  );
};

export default EmojiReactionPicker;