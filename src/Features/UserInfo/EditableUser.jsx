// src/features/userinfo/EditableUser.jsx
import React, { useState, useEffect } from "react";
import { useUpdateUserInfoMutation } from "./userinfoApiSlice";
import { toast } from "react-toastify";
import ReadOnlyField from "../../reusableComponents/Inputs/ReadOnlyField";
import Modal from "../../reusableComponents/Modals/Modals";

const EditableField = ({
  label,
  fieldName,
  value,
  editValue,
  isEditing,
  onEdit,
  onChange,
  onSave,
  isSaving,
}) => {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="text-xs font-medium text-[#8a8d93]">{label}</label>
        {!isEditing && (
          <button
            onClick={onEdit}
            className="text-[#0ecb6f] hover:text-[#0ecb6f]/80 cursor-pointer"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          autoComplete="off"
          value={isEditing ? editValue : value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={!isEditing}
          className={`w-full bg-[#111214] border rounded-xl py-2.5 px-4 text-sm 
            focus:outline-none transition-colors
            ${
              isEditing
                ? "border-[#0ecb6f] text-white focus:ring-1 focus:ring-[#0ecb6f]/50"
                : "border-[#2a2c2f] text-[#8a8d93] cursor-default"
            }`}
        />
        {isEditing && (
          <button
            onClick={onSave}
            disabled={isSaving}
            className="bg-[#0ecb6f] hover:bg-[#0ecb6f]/90 disabled:bg-[#0ecb6f]/50
              disabled:cursor-not-allowed text-[#111214] font-semibold px-4 py-2.5
              rounded-xl text-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        )}
      </div>
    </div>
  );
};

const Edituser = ({ user, searchTerm, setSearchTerm, refetchUserInfo }) => {
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
  const [pendingField, setPendingField] = useState(null);

  const [editedUser, setEditedUser] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "",
    referenceId: "",
    username: "",
  });

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

  const formatDateWithAmPm = (isoString) => {
    if (!isoString || isoString === "N/A") return "N/A";
    const date = new Date(isoString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    let hours = date.getUTCHours();
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const amAndPm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day}-${month}-${year} ${hours}:${minutes} ${amAndPm}`;
  };

  const getCurrency = (countryCode, value) => {
    return countryCode === 91
      ? `₹${value?.toFixed(2)}`
      : `$${value?.toFixed(2)}`;
  };

  const getKycStatus = (status) => {
    const map = {
      open: "In Open",
      approve: "Approved",
      inprogress: "In Progress",
      reject: "Rejected",
    };
    return map[status] || "N/A";
  };

  const handleEditClick = (fieldName) => {
    if (fieldName === "referenceId" && user.isActive) {
      setPendingField("referenceId");
      setShowSecretModal(true);
    } else {
      setEditMode((prev) => ({ ...prev, [fieldName]: true }));
    }
  };

  const handleInputChange = (fieldName, value) => {
    setEditedUser((prev) => ({ ...prev, [fieldName]: value }));
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

        if (setSearchTerm && searchTerm !== user.username) {
          setSearchTerm(user.username);
        }

        if (refetchUserInfo) refetchUserInfo();

        toast.success(
          `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} updated successfully!`,
          { position: "top-center" }
        );
      } else {
        toast.error(`Failed to update ${fieldName}: ${response?.message || "Unknown error"}`, {
          position: "top-center",
        });
      }
    } catch (error) {
      toast.error(`Error updating ${fieldName}: ${error.message || "Unknown error"}`, {
        position: "top-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySecretCode = () => {
    if (secretCode === "devteam") {
      setShowSecretModal(false);
      setSecretCode("");
      setEditMode((prev) => ({ ...prev, [pendingField]: true }));
    } else {
      toast.error("Invalid secret code!");
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#0ecb6f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isSaving = isUpdating || isLoading;

  return (
    <div className="space-y-5">
      {/* Title */}
      <h2 className="text-center text-lg font-semibold text-[#0ecb6f]">
        User Details
      </h2>

      {/* Editable Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EditableField
          label="Name"
          fieldName="name"
          value={user.name}
          editValue={editedUser.name}
          isEditing={editMode.name}
          onEdit={() => handleEditClick("name")}
          onChange={(val) => handleInputChange("name", val)}
          onSave={() => handleSaveField("name")}
          isSaving={isSaving}
        />

        <ReadOnlyField label="User ID" value={user.username} />

        <EditableField
          label="Email"
          fieldName="email"
          value={user.email}
          editValue={editedUser.email}
          isEditing={editMode.email}
          onEdit={() => handleEditClick("email")}
          onChange={(val) => handleInputChange("email", val)}
          onSave={() => handleSaveField("email")}
          isSaving={isSaving}
        />

        {/* Phone */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <label className="text-xs font-medium text-[#8a8d93]">Phone</label>
            {!editMode.phone && (
              <button
                onClick={() => handleEditClick("phone")}
                className="text-[#0ecb6f] hover:text-[#0ecb6f]/80 cursor-pointer"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
                </svg>
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              autoComplete="off"
              value={
                editMode.phone
                  ? editedUser.phone
                  : `+${user.countryCode} ${user.phone}`
              }
              onChange={(e) => handleInputChange("phone", e.target.value)}
              readOnly={!editMode.phone}
              placeholder={editMode.phone ? "Phone without country code" : ""}
              className={`w-full bg-[#111214] border rounded-xl py-2.5 px-4 text-sm 
                focus:outline-none transition-colors placeholder-[#555]
                ${
                  editMode.phone
                    ? "border-[#0ecb6f] text-white focus:ring-1 focus:ring-[#0ecb6f]/50"
                    : "border-[#2a2c2f] text-[#8a8d93] cursor-default"
                }`}
            />
            {editMode.phone && (
              <button
                onClick={() => handleSaveField("phone")}
                disabled={isSaving}
                className="bg-[#0ecb6f] hover:bg-[#0ecb6f]/90 disabled:bg-[#0ecb6f]/50
                  disabled:cursor-not-allowed text-[#111214] font-semibold px-4 py-2.5
                  rounded-xl text-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            )}
          </div>
        </div>

        <ReadOnlyField
          label="Referral Amount"
          value={getCurrency(user.countryCode, user.referenceInr)}
        />

        <EditableField
          label="Referrer ID"
          fieldName="referenceId"
          value={user.referenceId}
          editValue={editedUser.referenceId}
          isEditing={editMode.referenceId}
          onEdit={() => handleEditClick("referenceId")}
          onChange={(val) => handleInputChange("referenceId", val)}
          onSave={() => handleSaveField("referenceId")}
          isSaving={isSaving}
        />

        <ReadOnlyField label="Tokens" value={user.tokens} />
        <ReadOnlyField label="INR" value={user.Inr} />
        <ReadOnlyField label="Referral Count" value={user.referenceCount} />
        <ReadOnlyField
          label="Status"
          value={user.isActive ? "Active" : "Inactive"}
        />
        <ReadOnlyField
          label="Account Created On"
          value={formatDateWithAmPm(user.createdAt)}
        />
        <ReadOnlyField
          label="Account Activated At"
          value={
            user.activeDate && user.activeDate !== "N/A"
              ? formatDateWithAmPm(user.activeDate)
              : "N/A"
          }
        />
        <ReadOnlyField
          label="Wallet Amount"
          value={getCurrency(user.countryCode, user.walletBalance)}
        />
        <ReadOnlyField
          label="Verified"
          value={user.isVerified ? "Verified" : "Not Verified"}
        />
        <ReadOnlyField
          label="KYC Status"
          value={getKycStatus(user.kycStatus)}
        />
      </div>

      {/* Secret Code Modal */}
      <Modal
        isOpen={showSecretModal}
        onClose={() => {
          setShowSecretModal(false);
          setSecretCode("");
        }}
        title="Enter Secret Code"
        size="sm"
      >
        <div className="space-y-4">
          <input
            type="password"
            value={secretCode}
            onChange={(e) => setSecretCode(e.target.value)}
            placeholder="Secret Code"
            className="w-full bg-[#111214] border border-[#2a2c2f] text-white placeholder-[#555]
              rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#0ecb6f]
              focus:ring-1 focus:ring-[#0ecb6f]/50 transition-colors"
          />
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowSecretModal(false);
                setSecretCode("");
              }}
              className="flex-1 bg-[#2a2c2f] hover:bg-[#333] text-white py-3
                rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleVerifySecretCode}
              className="flex-1 bg-[#0ecb6f] hover:bg-[#0ecb6f]/90 text-[#111214] py-3
                rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              Verify
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Edituser;