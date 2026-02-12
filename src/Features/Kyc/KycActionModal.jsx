// src/features/kyc/KycActionModal.jsx
import React, { useState } from "react";
import Modal from "../../reusableComponents/Modals/Modals";

const KycActionModal = ({ isOpen, onClose, type, id, onConfirm }) => {
  const [reason, setReason] = useState("");

  const isReject = type === "reject";

  const handleSubmit = () => {
    onConfirm(id, type, reason);
    setReason("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isReject ? "Reject KYC" : "Approve KYC"}
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-[#8a8d93] text-sm">
          {isReject
            ? "Are you sure you want to reject this KYC request?"
            : "Are you sure you want to approve this KYC request?"}
        </p>

        {isReject && (
          <div>
            <label className="block text-sm font-medium text-[#8a8d93] mb-2">
              Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={3}
              className="w-full bg-[#111214] border border-[#2a2c2f] text-white 
                placeholder-[#555] rounded-xl py-3 px-4 text-sm focus:outline-none 
                focus:border-[#0ecb6f] focus:ring-1 focus:ring-[#0ecb6f]/50 
                transition-colors resize-none"
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 bg-[#2a2c2f] hover:bg-[#333] text-white py-3 
              rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold 
              transition-colors cursor-pointer ${
                isReject
                  ? "bg-red-500 hover:bg-red-500/90 text-white"
                  : "bg-[#0ecb6f] hover:bg-[#0ecb6f]/90 text-[#111214]"
              }`}
          >
            {isReject ? "Reject" : "Approve"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default KycActionModal;