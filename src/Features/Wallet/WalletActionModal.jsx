import React, { useState } from "react";
import Modal from "../../reusableComponents/Modals/Modals";
// ✅ IMPORT THIS ONE (Hits /wallet/updateStatus)
import { useTransUpdateMutation } from "./walletApiSlice"; 
import { useToast } from "../../reusableComponents/Toasts/ToastContext";

const WalletActionModal = ({
  isOpen,
  onClose,
  type,
  id,
  refetch,
}) => {
  const toast = useToast();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ USE THE STATUS UPDATE MUTATION
  const [updateStatus] = useTransUpdateMutation(); 

  const handleSubmit = async () => {
    if (type === "Reject" && !reason.trim()) {
      toast.warning("Please enter a reason for rejection");
      return;
    }

    setIsSubmitting(true);
    try {
      const statusMap = {
        Approve: "Completed",
        Hold: "Hold",
        Reject: "Failed",
      };

      // ✅ PAYLOAD for /wallet/updateStatus
      const payload = {
        transactionId: id,
        transactionStatus: statusMap[type],
      };

      if (type === "Reject") {
        payload.reason = reason;
      }

      // Execute the API call
      await updateStatus(payload).unwrap();

      toast.success(`Transaction ${type}d successfully`);
      
      setReason("");
      onClose();
      refetch?.(); // Refresh the table
    } catch (error) {
      toast.error(
        `Failed to ${type.toLowerCase()} transaction`,
        error?.data?.message || "Something went wrong"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const config = {
    Approve: {
      title: "Approve Transaction",
      message: "Are you sure you want to approve this transaction?",
      btnClass: "bg-[#b9fd5c] text-[#111214]",
      btnText: "Approve",
    },
    Hold: {
      title: "Hold Transaction",
      message: "Are you sure you want to hold this transaction?",
      btnClass: "bg-yellow-500 text-[#111214]",
      btnText: "Hold",
    },
    Reject: {
      title: "Reject Transaction",
      message: "Are you sure you want to reject this transaction?",
      btnClass: "bg-red-500 text-white",
      btnText: "Reject",
      showReason: true,
    },
  };

  const current = config[type] || config.Approve;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={current.title} size="sm">
      <div className="space-y-4">
        <p className="text-[#8a8d93] text-sm">{current.message}</p>

        <div className="bg-[#111214] border border-[#2a2c2f] rounded-xl px-4 py-2.5">
          <span className="text-xs text-[#8a8d93]">Transaction ID: </span>
          <span className="text-xs text-white font-medium">{id}</span>
        </div>

        {current.showReason && (
          <div>
            <label className="block text-sm font-medium text-[#8a8d93] mb-2">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason..."
              rows={3}
              className="w-full bg-[#111214] border border-[#2a2c2f] text-white rounded-xl py-3 px-4 text-sm"
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 bg-[#2a2c2f] text-white py-3 rounded-3xl text-sm">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex-1 py-3 rounded-3xl text-sm font-semibold ${current.btnClass} disabled:opacity-50`}
          >
            {isSubmitting ? "Processing..." : current.btnText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default WalletActionModal;