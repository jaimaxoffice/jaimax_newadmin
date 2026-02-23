import React, { useState } from "react";
import Modal from "../../reusableComponents/Modals/Modals";
// ✅ Import the EXISTING mutation from your API slice
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

  // ✅ Use your EXISTING mutation (not a new one)
  const [updateStatus] = useTransUpdateMutation();

  const handleSubmit = async () => {
    if (type === "Reject" && !reason.trim()) {
      toast.warning("Please enter a reason for rejection");
      return;
    }

    setIsSubmitting(true);
    try {
      // ✅ This matches your existing API: `/wallet/updateStatus`
      const payload = {
        transactionId: id,
        transactionStatus: type === "Approve" ? "Completed" : type === "Hold" ? "Hold" : "Failed",
      };

      // Add reason for reject
      if (type === "Reject") {
        payload.reason = reason;
      }

      const result = await updateStatus(payload).unwrap();
      console.log("Update result:", result);

      // Show toast based on action type
      if (type === "Approve") {
        toast.success("Transaction Approved", "Status updated to Completed");
      } else if (type === "Hold") {
        toast.warning("Transaction on Hold", "Status updated to Hold");
      } else if (type === "Reject") {
        toast.success("Transaction Rejected", "Status updated to Failed");
      }

      setReason("");
      onClose();
      refetch?.(); // ✅ Refresh table data
    } catch (error) {
      console.error("Status update error:", error);
      toast.error(
        `Failed to ${type.toLowerCase()} transaction`,
        error?.data?.message || error?.message || "Something went wrong"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const config = {
    Approve: {
      title: "Approve Transaction",
      message: "Are you sure you want to approve this transaction?",
      btnClass: "bg-[#b9fd5c] hover:bg-[#b9fd5c]/90 text-[#111214]",
      btnText: "Approve",
    },
    Hold: {
      title: "Hold Transaction",
      message: "Are you sure you want to hold this transaction?",
      btnClass: "bg-yellow-500 hover:bg-yellow-500/90 text-[#111214]",
      btnText: "Hold",
    },
    Reject: {
      title: "Reject Transaction",
      message: "Are you sure you want to reject this transaction?",
      btnClass: "bg-red-500 hover:bg-red-500/90 text-white",
      btnText: "Reject",
      showReason: true,
    },
  };

  const current = config[type] || config.Approve;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={current.title} size="sm">
      <div className="space-y-4">
        <p className="text-[#8a8d93] text-sm">{current.message}</p>

        {/* Transaction ID info */}
        <div className="bg-[#111214] border border-[#2a2c2f] rounded-xl px-4 py-2.5">
          <span className="text-xs text-[#8a8d93]">Transaction ID: </span>
          <span className="text-xs text-white font-medium">{id}</span>
        </div>

        {/* Reason field for Reject */}
        {current.showReason && (
          <div>
            <label className="block text-sm font-medium text-[#8a8d93] mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={3}
              className="w-full bg-[#111214] border border-[#2a2c2f] text-white placeholder-[#555] 
                rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#b9fd5c] 
                focus:ring-1 focus:ring-[#b9fd5c]/50 transition-colors resize-none"
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 bg-[#2a2c2f] hover:bg-[#333] text-white py-3 rounded-3xl 
              text-sm font-medium transition-colors cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex-1 py-3 rounded-3xl text-sm font-semibold 
              transition-colors cursor-pointer 
              disabled:opacity-50 disabled:cursor-not-allowed
              ${current.btnClass}`}
          >
            {isSubmitting ? "Processing..." : current.btnText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default WalletActionModal;