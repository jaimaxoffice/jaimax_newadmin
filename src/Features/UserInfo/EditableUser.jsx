// src/Features/UserInfo/Edituser.jsx
import React, { useState, useEffect } from "react";
import { useUpdateUserInfoMutation } from "./userinfoApiSlice";
import { useToast } from "../../reusableComponents/Toasts/ToastContext";
import Loader from "../../reusableComponents/Loader/Loader"
import {
  Pencil,
  Loader2,
  X,
  User,
  Mail,
  Phone,
  Wallet,
  Coins,
  Users,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Link,
  Hash,
  Save,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";

const Edituser = ({ user, searchTerm, setSearchTerm, refetchUserInfo }) => {
  const toast = useToast();
  const [updateUserInfo, { isLoading: isUpdating }] =
    useUpdateUserInfoMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState({
    name: false,
    email: false,
    phone: false,
    referenceId: false,
  });
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [pendingField, setPendingField] = useState(null);
  const [editedUser, setEditedUser] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "",
    referenceId: "",
    username: "",
  });

  const formatDateWithAmPm = (isoString) => {
    if (!isoString || isoString === "N/A") return "N/A";
    const date = new Date(isoString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    let hours = date.getUTCHours();
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const amPm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day}-${month}-${year} ${hours}:${minutes} ${amPm}`;
  };

  const formatCurrency = (value, countryCode) => {
    const amount = Number(value) || 0;
    return countryCode === 91
      ? `₹${amount.toFixed(2)}`
      : `$${amount.toFixed(2)}`;
  };

  useEffect(() => {
    if (user) {
      setEditedUser({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        countryCode: user.countryCode || "",
        referenceId: user.referenceId || "",
        username: user.username || "",
      });
    }
  }, [user]);

  const handleEditClick = (fieldName) => {
    setEditMode((prev) => ({ ...prev, [fieldName]: true }));
  };

  const handleCancelEdit = (fieldName) => {
    setEditMode((prev) => ({ ...prev, [fieldName]: false }));
    setEditedUser((prev) => ({ ...prev, [fieldName]: user[fieldName] || "" }));
  };

  const handleInputChange = (e, fieldName) => {
    setEditedUser((prev) => ({ ...prev, [fieldName]: e.target.value }));
  };

  const handleSaveField = async (fieldName) => {
    if (isLoading || isUpdating) return;
    try {
      setIsLoading(true);
      const updateData = { username: user.username };
      if (fieldName === "phone") {
        updateData.phone = editedUser.phone.replace(/\D/g, "");
        updateData.countryCode = user.countryCode;
      } else {
        updateData[fieldName] = editedUser[fieldName];
      }

      const response = await updateUserInfo(updateData).unwrap();

      if (response?.success) {
        setEditMode((prev) => ({ ...prev, [fieldName]: false }));
        if (setSearchTerm && searchTerm !== user.username)
          setSearchTerm(user.username);
        if (refetchUserInfo) refetchUserInfo();
        toast.success(
          `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} updated successfully!`,
        );
      } else {
        toast.error(
          `Failed to update ${fieldName}: ${response?.message || "Unknown error"}`,
        );
      }
    } catch (error) {
      toast.error(
        `Error updating ${fieldName}: ${error.message || "Unknown error"}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySecretCode = () => {
    if (secretCode === "devteam") {
      setShowSecretModal(false);
      setSecretCode("");
      handleEditClick(pendingField);
    } else {
      toast.error("Invalid secret code!");
    }
  };

  const kycStatusMap = {
    open: { label: "Open", color: "blue" },
    approve: { label: "Approved", color: "green" },
    inprogress: { label: "In Progress", color: "yellow" },
    reject: { label: "Rejected", color: "red" },
  };

  const getKycStatus = (status) =>
    kycStatusMap[status] || { label: "N/A", color: "gray" };

  // Loading State
  if (!user) {
    return (
      <Loader/>
    );
  }

  return (
    <div className="space-y-6 sidebar-scroll ">
      {/* Secret Code Modal */}
      {showSecretModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              setShowSecretModal(false);
              setSecretCode("");
            }}
          />
          <div
            className="relative bg-gradient-to-b from-[#1e2328] to-[#181b1f] border border-[#2a2c2f] 
                       rounded-2xl p-6 w-full max-w-sm shadow-2xl sidebar-scroll"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Lock size={20} className="text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">
                    Authorization Required
                  </h3>
                  <p className="text-[#8a8d93] text-xs">
                    Enter secret code to continue
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSecretModal(false);
                  setSecretCode("");
                }}
                className="w-8 h-8 rounded-lg bg-[#111214] border border-[#2a2c2f] 
                           flex items-center justify-center text-[#8a8d93] 
                           hover:text-white hover:border-[#3a3c3f] transition-all cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl mb-4">
              <AlertTriangle
                size={16}
                className="text-yellow-500 mt-0.5 flex-shrink-0"
              />
              <p className="text-yellow-400/80 text-xs leading-relaxed">
                You are about to edit a sensitive field for an active user. This
                action will be logged.
              </p>
            </div>

            {/* Input */}
            <div className="relative mb-4">
              <input
                type={showSecretCode ? "text" : "password"}
                placeholder="Enter secret code"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerifySecretCode()}
                className="w-full bg-[#111214] border border-[#2a2c2f] text-white rounded-xl 
                           px-4 py-3 pr-12 text-sm focus:outline-none focus:border-[#b9fd5c] 
                           focus:ring-1 focus:ring-[#b9fd5c]/30 transition-all placeholder-[#555]"
              />
              <button
                type="button"
                onClick={() => setShowSecretCode(!showSecretCode)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] 
                           hover:text-[#b9fd5c] transition-colors cursor-pointer"
              >
                {showSecretCode ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowSecretModal(false);
                  setSecretCode("");
                }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                           bg-[#111214] border border-[#2a2c2f] text-[#8a8d93]
                           hover:text-white hover:border-[#3a3c3f] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifySecretCode}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold
                           bg-[#b9fd5c] text-[#111214] hover:bg-[#a8ec4b] 
                           transition-all cursor-pointer"
              >
                Verify & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Card */}
      <div
        className="bg-gradient-to-r from-[#b9fd5c]/10 via-[#b9fd5c]/5 to-transparent 
                      border border-[#2a2c2f] rounded-2xl p-5 sidebar-scroll"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#b9fd5c] to-[#8bc34a] 
                          flex items-center justify-center text-[#111214] font-bold text-xl
                          shadow-lg shadow-[#b9fd5c]/20 flex-shrink-0 serialHeading"
          >
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white truncate">
              {user.name || "Unknown User"}
            </h2>
            <p className="text-[#b9fd5c] text-sm font-medium">
              @{user.username}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                           ${
                             user.isActive
                               ? "bg-green-500/10 text-green-400 border border-green-500/20"
                               : "bg-red-500/10 text-red-400 border border-red-500/20"
                           }`}
              >
                {user.isActive ? (
                  <CheckCircle size={10} />
                ) : (
                  <XCircle size={10} />
                )}
                {user.isActive ? "Active" : "Inactive"}
              </span>

              {/* Verified Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                           ${
                             user.isVerified
                               ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                               : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                           }`}
              >
                <Shield size={10} />
                {user.isVerified ? "Verified" : "Not Verified"}
              </span>

              {/* KYC Badge */}
             
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Tokens */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[#b9fd5c] text-base sm:text-lg font-bold leading-tight">
                  {Number(user.tokens || 0).toLocaleString()}
                </p>
                <p className="text-[#8a8d93] text-xs whitespace-nowrap">
                  Total Tokens
                </p>
              </div>
              {/* <Coins size={20} className="text-[#b9fd5c] hidden sm:block" /> */}
            </div>

            {/* Divider */}
            <div
              className="w-px h-12 bg-[#2a2c2f] hidden sm:block"
              aria-hidden="true"
            />

            {/* Referrals */}
            <div className="flex items-center gap-3">
              {/* <Users size={20} className="text-white hidden sm:block" /> */}
              <div className="text-left">
                <p className="text-white text-lg sm:text-xl font-bold leading-tight">
                  {user.referenceCount || 0}
                </p>
                <p className="text-[#8a8d93] text-xs whitespace-nowrap">
                  Active Referrals
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editable Fields Section */}
      <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2a2c2f]">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Pencil size={16} className="text-[#b9fd5c]" />
            Editable Information
          </h3>
          <p className="text-[#8a8d93] text-xs mt-1">
            Click the edit icon to modify these fields
          </p>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name Field */}
          <EditableField
            icon={User}
            label="Full Name"
            value={user.name}
            editValue={editedUser.name}
            isEditing={editMode.name}
            isLoading={isLoading || isUpdating}
            onEdit={() => handleEditClick("name")}
            onCancel={() => handleCancelEdit("name")}
            onChange={(e) => handleInputChange(e, "name")}
            onSave={() => handleSaveField("name")}
          />

          {/* Email Field */}
          <EditableField
            icon={Mail}
            label="Email Address"
            value={user.email}
            editValue={editedUser.email}
            isEditing={editMode.email}
            isLoading={isLoading || isUpdating}
            onEdit={() => handleEditClick("email")}
            onCancel={() => handleCancelEdit("email")}
            onChange={(e) => handleInputChange(e, "email")}
            onSave={() => handleSaveField("email")}
          />

          {/* Phone Field */}
          <EditableField
            icon={Phone}
            label="Phone Number"
            value={`+${user.countryCode} ${user.phone}`}
            editValue={editedUser.phone}
            isEditing={editMode.phone}
            isLoading={isLoading || isUpdating}
            onEdit={() => handleEditClick("phone")}
            onCancel={() => handleCancelEdit("phone")}
            onChange={(e) => handleInputChange(e, "phone")}
            onSave={() => handleSaveField("phone")}
            placeholder="Phone without country code"
          />

          {/* Referrer ID Field */}
          <EditableField
            icon={Link}
            label="Referrer ID"
            value={user.referenceId || "N/A"}
            editValue={editedUser.referenceId}
            isEditing={editMode.referenceId}
            isLoading={isLoading || isUpdating}
            isProtected={user.isActive}
            onEdit={() => {
              if (user.isActive) {
                setPendingField("referenceId");
                setShowSecretModal(true);
              } else {
                handleEditClick("referenceId");
              }
            }}
            onCancel={() => handleCancelEdit("referenceId")}
            onChange={(e) => handleInputChange(e, "referenceId")}
            onSave={() => handleSaveField("referenceId")}
          />
        </div>
      </div>

      {/* Financial Information */}
      <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2a2c2f]">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Wallet size={16} className="text-[#b9fd5c]" />
            Financial Information
          </h3>
        </div>

        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoCard
            icon={Coins}
            label="Tokens"
            value={Number(user.tokens || 0).toLocaleString()}
            highlight
          />
          <InfoCard
            icon={Wallet}
            label="Wallet Balance"
            value={formatCurrency(user.walletBalance, user.countryCode)}
          />
          <InfoCard
            icon={Hash}
            label="INR Balance"
            value={`₹${Number(user.Inr || 0).toFixed(2)}`}
          />
          <InfoCard
            icon={Users}
            label="Referral Earnings"
            value={formatCurrency(user.referenceInr, user.countryCode)}
          />
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2a2c2f]">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Calendar size={16} className="text-[#b9fd5c]" />
            Account Information
          </h3>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReadOnlyField
            icon={Hash}
            label="User ID"
            value={user.username}
            mono
          />
          <ReadOnlyField
            icon={Users}
            label="Referral Count"  
            value={user.referenceCount || 0}
          />
          <ReadOnlyField
            icon={Calendar}
            label="Account Created"
            value={formatDateWithAmPm(user.createdAt)}
          />
          <ReadOnlyField
            icon={CheckCircle}
            label="Account Activated"
            value={
              user.activeDate && user.activeDate !== "N/A"
                ? formatDateWithAmPm(user.activeDate)
                : "N/A"
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Edituser;

// ─── Sub Components ───────────────────────────────────────────────────

const EditableField = ({
  icon: Icon,
  label,
  value,
  editValue,
  isEditing,
  isLoading,
  isProtected,
  onEdit,
  onCancel,
  onChange,
  onSave,
  placeholder,
}) => {
  return (
    <div className="bg-[#111214] border border-[#2a2c2f] rounded-xl p-4 hover:border-[#3a3c3f] transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1a1c1f] flex items-center justify-center">
            <Icon size={14} className="text-[#8a8d93]" />
          </div>
          <span className="text-sm font-medium text-[#8a8d93]">{label}</span>
        </div>

        {!isEditing && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                       bg-[#b9fd5c]/10 text-[#b9fd5c] hover:bg-[#b9fd5c]/20 
                       transition-all cursor-pointer"
          >
            {isProtected && <Lock size={10} />}
            <Pencil size={10} />
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editValue}
            onChange={onChange}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            className="w-full bg-[#1a1c1f] border border-[#b9fd5c] text-white rounded-lg 
                       px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#b9fd5c]/30 
                       transition-all placeholder-[#555]"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg 
                         text-xs font-medium bg-[#2a2c2f] text-[#8a8d93] 
                         hover:text-white hover:bg-[#3a3c3f] transition-all cursor-pointer
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={12} />
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg 
                         text-xs font-semibold bg-[#b9fd5c] text-[#111214] 
                         hover:bg-[#a8ec4b] transition-all cursor-pointer
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={12} />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-white text-sm font-medium truncate">
          {value || "N/A"}
        </p>
      )}
    </div>
  );
};

const ReadOnlyField = ({ icon: Icon, label, value, mono = false }) => {
  return (
    <div className="bg-[#111214] border border-[#2a2c2f] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-[#1a1c1f] flex items-center justify-center">
          <Icon size={14} className="text-[#8a8d93]" />
        </div>
        <span className="text-sm font-medium text-[#8a8d93]">{label}</span>
      </div>
      <p
        className={`text-sm font-medium truncate ${
          mono ? "text-[#8a8d93] font-mono text-xs" : "text-white"
        }`}
      >
        {value || "0"}
      </p>
    </div>  
  );
};

const InfoCard = ({ icon: Icon, label, value, highlight = false }) => {
  return (
    <div
      className={`rounded-xl p-4 text-center ${
        highlight
          ? "bg-gradient-to-br from-[#b9fd5c]/10 to-transparent border border-[#b9fd5c]/20"
          : "bg-[#111214] border border-[#2a2c2f]"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center ${
          highlight ? "bg-[#b9fd5c]/20" : "bg-[#1a1c1f]"
        }`}
      >
        <Icon
          size={18}
          className={highlight ? "text-[#b9fd5c]" : "text-[#8a8d93]"}
        />
      </div>
      <p
        className={`text-sm  font-semibold mb-1 ${highlight ? "text-[#b9fd5c]" : "text-white"}`}
      >
        {value}
      </p>
      <p className="text-[#8a8d93] text-xs">{label}</p>
    </div>
  );
};
