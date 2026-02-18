// src/reusableComponents/Modals/UserDetailsModal.jsx (or keep inline)
const UserDetailsModal = ({ isOpen, onClose, user, formatDate }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl w-full max-w-2xl 
                    max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2c2f]">
          <h2 className="text-lg font-semibold text-white">
            User Details —{" "}
            <span className="text-[#b9fd5c]">
              {user?.username || user?.name || "User"}
            </span>
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full
                       bg-[#111214] border border-[#2a2c2f] text-[#8a8d93]
                       hover:text-white hover:border-[#b9fd5c]
                       transition-colors cursor-pointer"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[65vh]">
          {user ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
              <DetailItem label="Username" value={user.username} />
              <DetailItem label="User ID" value={user._id} mono />
              <DetailItem label="Name" value={user.name} />
              <DetailItem
                label="Tokens"
                value={Number(user.tokens || 0).toLocaleString()}
                highlight
              />
              <DetailItem label="Email" value={user.email} />
              <DetailItem
                label="Transferred To"
                value={user.tokensTransferredTo}
              />
              <DetailItem
                label="Phone"
                value={
                  user.countryCode && user.phone
                    ? `+${user.countryCode} ${user.phone}`
                    : null
                }
              />
              <DetailItem
                label="Deleted Date"
                value={formatDate(user.deletedAt)}
              />
              <DetailItem label="Deleted By" value={user.deletedBy || "System"} />

              {/* Full-width reason */}
              <div className="md:col-span-2 mt-2">
                <label className="block text-xs font-medium text-[#8a8d93] uppercase tracking-wider mb-1.5">
                  Deletion Reason
                </label>
                <div
                  className="bg-[#111214] border border-[#2a2c2f] rounded-xl p-3 
                              text-sm text-white leading-relaxed"
                >
                  {user.deletionReason || "No reason provided"}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-[#8a8d93]">
              No user details available.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#2a2c2f] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-medium
                       bg-[#111214] border border-[#2a2c2f] text-[#8a8d93]
                       hover:text-white hover:border-[#3a3c3f]
                       transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default UserDetailsModal;
/**
 * Detail Item sub-component
 */
const DetailItem = ({ label, value, highlight = false, mono = false }) => (
  <div className="py-2">
    <label className="block text-xs font-medium text-[#8a8d93] uppercase tracking-wider mb-1">
      {label}
    </label>
    <p
      className={`text-sm m-0 break-all ${
        highlight
          ? "text-[#b9fd5c] font-semibold"
          : mono
          ? "text-[#8a8d93] font-mono text-xs"
          : "text-white"
      }`}
    >
      {value || "N/A"}
    </p>
  </div>
);