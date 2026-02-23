// src/features/admin/UpdatePermissions.jsx
import React, { useState, useEffect } from "react";
import { useToast } from "../../reusableComponents/Toasts/ToastContext";
import Modal from "../../reusableComponents/Modals/Modals";
import {
  useViewUserQuery,
  useEditUserMutation,
} from "./adminmanagementApiSlice";
import { allPermissions, formatPermissionName } from "./permissions";
import countryCodes from "../../layout/countryCodes.json";
import FormField from "../../reusableComponents/Inputs/FormField";

import Button from "../../reusableComponents/Buttons/Button";
const EditAdminUser = ({ isOpen, onClose, userId, onSuccess }) => {
  const toast = useToast();
  const { data: viewUser, isLoading: isFetching } = useViewUserQuery(userId, {
    skip: !userId,
  });
  const [editUser, { isLoading: isUpdating }] = useEditUserMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+91",
    mobile: "",
    permissions: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (viewUser?.data) {
      const user = viewUser.data;
      setFormData({
        name: user.name || "",
        email: user.email || "",
        countryCode: user.countryCode ? `+${user.countryCode}` : "+91",
        mobile: user.phone?.toString() || "",
        permissions: user.permissions || [],
      });
    }
  }, [viewUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleKeyPress = (e) => {
    if (!/[0-9]/.test(e.key)) e.preventDefault();
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, value]
        : prev.permissions.filter((p) => p !== value),
    }));
    if (errors.permissions) setErrors((prev) => ({ ...prev, permissions: "" }));
  };

  const handleSelectAll = () => {
    if (formData.permissions.length === allPermissions.length) {
      setFormData((prev) => ({ ...prev, permissions: [] }));
    } else {
      setFormData((prev) => ({ ...prev, permissions: [...allPermissions] }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{6,12}$/;

    if (!formData.name || formData.name.length < 3) {
      newErrors.name = formData.name
        ? "Name must be at least 3 characters"
        : "Name is required";
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.mobile) {
      newErrors.mobile = "Phone number is required";
    } else if (!phoneRegex.test(formData.mobile)) {
      newErrors.mobile = "Phone must be 6-12 digits";
    }
    if (formData.permissions.length === 0) {
      newErrors.permissions = "At least one permission is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        adminId: userId,
        name: formData.name,
        email: formData.email,
        countryCode: formData.countryCode,
        phone: Number(formData.mobile),
        permissions: formData.permissions,
      };

      const res = await editUser(payload).unwrap();
      toast.success(res?.message || "User updated successfully!", {
        position: "top-center",
      });
      handleClose();
      onSuccess?.();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update user", {
        position: "top-center",
      });
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Admin User"
      size="lg"
    >
      {isFetching ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-12 bg-[#282f35] rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <FormField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter full name"
              error={errors.name}
            />

            {/* Email */}
            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              error={errors.email}
            />

            {/* Country Code */}
            <div>
              <label className="block text-sm font-medium text-[#b9fd5c] mb-2">
                Country Code *
              </label>
              <select
                name="countryCode"
                value={formData.countryCode}
                onChange={handleInputChange}
                className="w-full bg-[#111214] border border-[#2a2c2f] text-white
                  rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-[#b9fd5c]
                  focus:ring-1 focus:ring-[#b9fd5c]/30 transition-colors"
              >
                {countryCodes.map((item, i) => (
                  <option
                    key={i}
                    value={item.countryCode}
                    className="bg-[#111214]"
                  >
                    {item.flag} {item.countryCode} - {item.country_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone */}
            <FormField
              label="Phone Number"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter phone number"
              error={errors.mobile}
              maxLength={12}
            />
          </div>

          {/* Permissions */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-[#b9fd5c]">
                Permissions *
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-sm text-[#b9fd5c] hover:text-[#ff7b1c] transition-colors
                  cursor-pointer bg-transparent border-none"
              >
                {formData.permissions.length === allPermissions.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {allPermissions.map((permission, index) => (
                <label
                  key={index}
                  className="flex items-center justify-between p-3
                    bg-[#111214] border border-[#2a2c2f] rounded-lg
                    hover:border-[#b9fd5c]/30 transition-colors cursor-pointer"
                >
                  <span className="text-[13px] text-[#ccc]">
                    {formatPermissionName(permission)}
                  </span>
                  <input
                    type="checkbox"
                    value={permission}
                    checked={formData.permissions.includes(permission)}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 accent-[#b9fd5c] cursor-pointer"
                  />
                </label>
              ))}
            </div>

            {errors.permissions && (
              <p className="text-red-400 text-xs mt-2">{errors.permissions}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2c2f]">
            <Button
              type="button"
              onClick={handleClose}
              disabled={isUpdating}
              variant="outline"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isFetching}
              loading={isUpdating}
              variant="primary"
            >
              {isUpdating ? "Updating..." : "Update User"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default EditAdminUser;
