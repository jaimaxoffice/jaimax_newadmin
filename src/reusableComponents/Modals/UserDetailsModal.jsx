// src/reusableComponents/Modals/UserDetailsModal.jsx
import { useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Coins,
  Calendar,
  Hash,
  ArrowRightLeft,
  Trash2,
  MessageSquare,
  Copy,
  Check,
  Shield,
  AlertCircle,
} from "lucide-react";

const UserDetailsModal = ({ isOpen, onClose, user, formatDate }) => {
  const [copiedField, setCopiedField] = useState(null);

  if (!isOpen) return null;

  const handleCopy = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sidebar-scroll"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-b from-[#1e2328] to-[#181b1f] border border-[#2a2c2f] 
                   rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl
                   animate-in fade-in zoom-in-95 duration-200 sidebar-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Gradient */}
        <div className="relative bg-gradient-to-r from-[#b9fd5c]/10 via-[#b9fd5c]/5 to-transparent px-6 py-5">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full
                       bg-[#111214]/80 border border-[#2a2c2f] text-[#8a8d93]
                       hover:text-white hover:border-red-500/50 hover:bg-red-500/10
                       transition-all duration-200 cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* User Avatar & Basic Info */}
          <div className="flex items-center gap-4 sidebar-scroll">
            <div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#b9fd5c] to-[#8bc34a] 
                         flex items-center justify-center text-[#111214] font-bold text-xl
                         shadow-lg shadow-[#b9fd5c]/20 serialHeading"
            >
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white truncate">
                {user?.name || "Unknown User"}
              </h2>
              <p className="text-[#b9fd5c] text-sm font-medium">
                @{user?.username || "username"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                             bg-red-500/10 text-red-400 border border-red-500/20"
                >
                  <Trash2 size={10} />
                  Deleted Account
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6 sidebar-scroll">
          {user ? (
            <>
              {/* Token Balance Card */}
              <div
                className="bg-gradient-to-r from-[#b9fd5c]/10 to-transparent 
                           border border-[#b9fd5c]/20 rounded-2xl p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#b9fd5c]/20 flex items-center justify-center">
                      <Coins size={24} className="text-[#b9fd5c]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#8a8d93]">Token Balance</p>
                      <p className="text-2xl font-bold text-[#b9fd5c]">
                        {Number(user.tokens || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {user.tokensTransferredTo && (
                    <div className="text-right">
                      <p className="text-xs text-[#8a8d93]">Transferred To</p>
                      <p className="text-sm text-white font-medium">
                        {user.tokensTransferredTo}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* User ID */}
                <InfoCard
                  icon={Hash}
                  label="User ID"
                  value={user._id}
                  mono
                  copyable
                  onCopy={() => handleCopy(user._id, "id")}
                  copied={copiedField === "id"}
                />

                {/* Username */}
                <InfoCard
                  icon={User}
                  label="Username"
                  value={user.username}
                  copyable
                  onCopy={() => handleCopy(user.username, "username")}
                  copied={copiedField === "username"}
                />

                {/* Email */}
                <InfoCard
                  icon={Mail}
                  label="Email Address"
                  value={user.email}
                  copyable
                  onCopy={() => handleCopy(user.email, "email")}
                  copied={copiedField === "email"}
                />

                {/* Phone */}
                <InfoCard
                  icon={Phone}
                  label="Phone Number"
                  value={
                    user.countryCode && user.phone
                      ? `+${user.countryCode} ${user.phone}`
                      : null
                  }
                />

                {/* Deleted Date */}
                <InfoCard
                  icon={Calendar}
                  label="Deleted On"
                  value={formatDate(user.deletedAt)}
                  variant="danger"
                />

                {/* Deleted By */}
                <InfoCard
                  icon={Shield}
                  label="Deleted By"
                  value={user.deletedBy || "System"}
                  variant="warning"
                />
              </div>

              {/* Deletion Reason */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-[#8a8d93]" />
                  <label className="text-sm font-medium text-[#8a8d93]">
                    Deletion Reason
                  </label>
                </div>
                <div
                  className="bg-[#111214] border border-[#2a2c2f] rounded-xl p-4 
                             text-sm text-white leading-relaxed"
                >
                  {user.deletionReason ? (
                    <p>{user.deletionReason}</p>
                  ) : (
                    <p className="text-[#555] italic flex items-center gap-2">
                      <AlertCircle size={14} />
                      No reason provided
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#2a2c2f] flex items-center justify-center mb-4">
                <User size={32} className="text-[#555]" />
              </div>
              <p className="text-[#8a8d93]">No user details available.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#2a2c2f] bg-[#111214]/50">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-3xl text-sm font-semibold
                         bg-[#b9fd5c] text-[#111214]
                         hover:bg-[#a8ec4b]
                         transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;

/**
 * Info Card Component
 */
const InfoCard = ({
  icon: Icon,
  label,
  value,
  mono = false,
  variant = "default",
  copyable = false,
  onCopy,
  copied = false,
}) => {
  const variantStyles = {
    default: "bg-[#111214] border-[#2a2c2f]",
    danger: "bg-red-500/5 border-red-500/20",
    warning: "bg-yellow-500/5 border-yellow-500/20",
    success: "bg-green-500/5 border-green-500/20",
  };

  const iconColors = {
    default: "text-[#8a8d93]",
    danger: "text-red-400",
    warning: "text-yellow-400",
    success: "text-green-400",
  };

  return (
    <div
      className={`group relative rounded-xl border p-4 transition-all duration-200
                  hover:border-[#3a3c3f] ${variantStyles[variant]}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-lg bg-[#1a1c1f] flex items-center justify-center
                      flex-shrink-0 ${iconColors[variant]}`}
        >
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#8a8d93] uppercase tracking-wider mb-1">
            {label}
          </p>
          <p
            className={`text-sm break-all ${
              mono
                ? "text-[#8a8d93] font-mono text-xs"
                : value
                ? "text-white"
                : "text-[#555]"
            }`}
          >
            {value || "N/A"}
          </p>
        </div>

        {/* Copy Button */}
        {copyable && value && (
          <button
            onClick={onCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity
                       w-8 h-8 rounded-lg bg-[#2a2c2f] flex items-center justify-center
                       text-[#8a8d93] hover:text-[#b9fd5c] hover:bg-[#3a3c3f]
                       cursor-pointer"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check size={14} className="text-[#b9fd5c]" />
            ) : (
              <Copy size={14} />
            )}
          </button>
        )}
      </div>

      {/* Copied Toast */}
      {copied && (
        <div
          className="absolute -top-2 right-2 px-2 py-1 rounded-md text-xs
                     bg-[#b9fd5c] text-[#111214] font-medium
                     animate-in fade-in slide-in-from-bottom-1 duration-200"
        >
          Copied!
        </div>
      )}
    </div>
  );
};