import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

const EditMessageModal = ({
  show,
  message,
  initialText,
  onSave,
  onClose,
}) => {
  const [editText, setEditText] = useState("");
  const textareaRef = useRef(null);

  // Sync text when modal opens
  useEffect(() => {
    if (show && initialText !== undefined) {
      setEditText(initialText);
      // Auto-focus after render
      setTimeout(() => {
        textareaRef.current?.focus();
        // Move cursor to end
        const len = initialText?.length || 0;
        textareaRef.current?.setSelectionRange(len, len);
      }, 100);
    }
  }, [show, initialText]);

  if (!show || !message) return null;

  const handleSave = () => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    onSave(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  const hasChanged = editText.trim() !== (initialText || "").trim();
  const isValid = editText.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#233138] rounded-xl w-full max-w-md mx-4 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a3942]">
          <h3 className="text-white text-lg font-medium">Edit message</h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#2a3942] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Original message preview */}
        <div className="px-5 pt-4 pb-2">
          <div className="bg-[#1a2730] rounded-lg px-3 py-2 border-l-4 border-[#00a884]">
            <p className="text-[11px] text-[#00a884] font-medium mb-0.5">
              Original message
            </p>
            <p className="text-xs text-gray-400 line-clamp-2">
              {initialText || "…"}
            </p>
          </div>
        </div>

        {/* Edit area */}
        <div className="px-5 py-3">
          <textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-[#2a3942] text-white rounded-lg px-4 py-3 text-sm 
              outline-none resize-none border border-[#374751] 
              focus:border-[#00a884] transition-colors
              placeholder-gray-500"
            rows={4}
            placeholder="Type your edited message…"
            maxLength={4096}
          />
          <div className="flex justify-between mt-1">
            <p className="text-[10px] text-gray-600">
              Press Enter to save, Shift+Enter for new line
            </p>
            <p className="text-[10px] text-gray-600">
              {editText.length}/4096
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#2a3942]">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm text-gray-400 hover:text-white 
              hover:bg-[#2a3942] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || !hasChanged}
            className="px-6 py-2 bg-[#00a884] hover:bg-[#06cf9c] 
              disabled:opacity-40 disabled:cursor-not-allowed 
              text-white text-sm font-medium rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMessageModal;