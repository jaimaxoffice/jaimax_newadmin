import React, { useState, useEffect } from "react";
import { useUpdateUserInfoMutation } from "./userinfoApiSlice";
import { toast } from "react-toastify";
import { Pencil, Loader2, X } from "lucide-react";

const inputClass = `w-full bg-[#282f35] border border-[#303f50] text-gray-400 rounded-lg 
  px-4 py-2.5 text-sm focus:outline-none transition-colors disabled:opacity-70`;

const editInputClass = `w-full bg-[#282f35] border border-[#b9fd5c] text-white rounded-lg 
  px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#b9fd5c]/50 transition-colors font-medium`;

const Edituser = ({ user, searchTerm, setSearchTerm, refetchUserInfo }) => {
  const [updateUserInfo, { isLoading: isUpdating }] = useUpdateUserInfoMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState({
    name: false,
    email: false,
    phone: false,
    referenceId: false,
  });
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretCode, setSecretCode] = useState("");
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
        if (setSearchTerm && searchTerm !== user.username) setSearchTerm(user.username);
        if (refetchUserInfo) refetchUserInfo();
        toast.success(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} updated successfully!`);
      } else {
        toast.error(`Failed to update ${fieldName}: ${response?.message || "Unknown error"}`);
      }
    } catch (error) {
      toast.error(`Error updating ${fieldName}: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySecretCode = () => {
    if (secretCode === "devteam") {
      setShowSecretModal(false);
      setSecretCode("");
      handleEditClick(pendingField);
    } else toast.error("Invalid secret code!");
  };

  const renderEditableField = (fieldName, label) => (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        {!editMode[fieldName] && (
          <button
            onClick={() => {
              if (fieldName === "referenceId" && user.isActive) {
                setPendingField("referenceId");
                setShowSecretModal(true);
              } else handleEditClick(fieldName);
            }}
            className="text-[#b9fd5c] hover:text-[#b9fd5c]/80 cursor-pointer"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={editMode[fieldName] ? editedUser[fieldName] : user[fieldName]}
          onChange={(e) => handleInputChange(e, fieldName)}
          readOnly={!editMode[fieldName]}
          className={editMode[fieldName] ? editInputClass : inputClass}
        />
        {editMode[fieldName] && (
          <button
            onClick={() => handleSaveField(fieldName)}
            disabled={isUpdating || isLoading}
            className="shrink-0 bg-[#b9fd5c] hover:bg-[#d55a0e] text-white font-bold px-4 py-2.5 
              rounded-lg transition-colors disabled:opacity-50 cursor-pointer text-sm"
          >
            {isUpdating || isLoading ? "Saving..." : "Save"}
          </button>
        )}
      </div>
    </div>
  );

  const renderPhoneField = () => {
    const phoneDisplay = `+${user.countryCode} ${user.phone}`;
    return (
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <label className="text-sm font-medium text-gray-300">Phone</label>
          {!editMode.phone && (
            <button onClick={() => handleEditClick("phone")} className="text-[#b9fd5c] cursor-pointer">
              <Pencil size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {editMode.phone ? (
            <>
              <input
                type="text"
                value={editedUser.phone}
                onChange={(e) => handleInputChange(e, "phone")}
                placeholder="Phone number without country code"
                className={editInputClass}
              />
              <button
                onClick={() => handleSaveField("phone")}
                disabled={isUpdating || isLoading}
                className="shrink-0 bg-[#b9fd5c] hover:bg-[#d55a0e] text-white font-bold px-4 py-2.5 
                  rounded-lg transition-colors disabled:opacity-50 cursor-pointer text-sm"
              >
                {isUpdating || isLoading ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <input type="text" value={phoneDisplay} readOnly className={inputClass} />
          )}
        </div>
      </div>
    );
  };

  const renderReadOnlyField = (label, value) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
      <input type="text" value={value} readOnly disabled className={inputClass + " disabled:opacity-60"} />
    </div>
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={24} className="text-[#b9fd5c] animate-spin mr-2" />
        <span className="text-gray-400">Loading user details...</span>
      </div>
    );
  }

  const kycStatusMap = {
    open: "In Open",
    approve: "Approved",
    inprogress: "In Progress",
    reject: "Rejected",
  };

  return (
    <div>
      {/* Secret Code Modal */}
      {showSecretModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => { setShowSecretModal(false); setSecretCode(""); }} />
          <div className="relative bg-[#282f35] rounded-xl p-6 w-full max-w-xs text-center border border-[#303f50]">
            <h3 className="text-[#b9fd5c] font-semibold mb-4">Enter Secret Code</h3>
            <input
              type="password"
              placeholder="Secret Code"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              className="w-full bg-[#111827] border border-[#303f50] text-white rounded-lg px-4 py-2.5 text-sm 
                focus:outline-none focus:border-[#b9fd5c] mb-4 placeholder-gray-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleVerifySecretCode}
                className="flex-1 bg-[#b9fd5c] text-white py-2.5 rounded-lg font-semibold hover:bg-[#d55a0e] 
                  transition-colors cursor-pointer"
              >
                Verify
              </button>
              <button
                onClick={() => { setShowSecretModal(false); setSecretCode(""); }}
                className="flex-1 bg-gray-600 text-white py-2.5 rounded-lg font-semibold hover:bg-gray-500 
                  transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-[#b9fd5c] text-xl font-bold text-center mb-6">User Details</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {renderEditableField("name", "Name")}
        {renderReadOnlyField("User ID", user.username)}
        {renderEditableField("email", "Email")}
        {renderPhoneField()}
        {renderReadOnlyField(
          "Referral Amount",
          user.countryCode === 91
            ? `₹${user.referenceInr.toFixed(2)}`
            : `$${user.referenceInr.toFixed(2)}`
        )}
        {renderEditableField("referenceId", "Referrer ID")}
        {renderReadOnlyField("Tokens", user.tokens)}
        {renderReadOnlyField("INR", user.Inr)}
        {renderReadOnlyField("Referral Count", user.referenceCount)}
        {renderReadOnlyField("Status", user.isActive ? "Active" : "Inactive")}
        {renderReadOnlyField("Account Created On", formatDateWithAmPm(user.createdAt))}
        {renderReadOnlyField(
          "Account Activated At",
          user.activeDate && user.activeDate !== "N/A"
            ? formatDateWithAmPm(user.activeDate)
            : "N/A"
        )}
        {renderReadOnlyField(
          "Wallet Amount",
          user.countryCode === 91
            ? `₹${user.walletBalance.toFixed(2)}`
            : `$${user.walletBalance.toFixed(2)}`
        )}
        {renderReadOnlyField("Verified", user.isVerified ? "Verified" : "Not Verified")}
        {renderReadOnlyField("KYC Status", kycStatusMap[user.kycStatus] || "N/A")}
      </div>
    </div>
  );
};

export default Edituser;