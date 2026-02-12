// src/components/ConfirmModal.jsx
import React, { useState } from "react";
import Modal from "./Modals";

const ConfirmModal = ({
  show,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  showReasonInput = false,
}) => {
  const [reason, setReason] = useState("");

  const colorMap = {
    danger: {
      btn: "bg-red-500 hover:bg-red-600",
      icon: "🚫",
    },
    success: {
      btn: "bg-[#0ecb6f] hover:bg-[#0ba85a]",
      icon: "✅",
    },
    warning: {
      btn: "bg-[#eb660f] hover:bg-[#ff7b1c]",
      icon: "⚠️",
    },
  };

  const colors = colorMap[type] || colorMap.danger;

  const handleConfirm = () => {
    if (showReasonInput) {
      onConfirm(reason, setReason);
    } else {
      onConfirm();
    }
  };

  return (
    <Modal isOpen={show} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        {/* Icon + Message */}
        <div className="text-center py-2">
          <div className="text-4xl mb-3">{colors.icon}</div>
          <p className="text-[#8a8d93] text-sm">{message}</p>
        </div>

        {/* Reason Input */}
        {showReasonInput && (
          <div>
            <label className="block text-sm font-medium text-[#8a8d93] mb-2">
              Reason
            </label>
            <textarea
              rows={3}
              placeholder="Enter reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-white text-sm
                bg-[#232528] border border-[#2a2c2f]
                focus:outline-none focus:border-[#eb660f] focus:ring-1 focus:ring-[#eb660f]/30
                placeholder:text-[#8a8d93] transition-all duration-200 resize-none"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white
              bg-transparent border border-[#2a2c2f]
              hover:bg-[#2a2c2f] transition-all duration-300 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold text-white
              ${colors.btn} transition-all duration-300 cursor-pointer`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;