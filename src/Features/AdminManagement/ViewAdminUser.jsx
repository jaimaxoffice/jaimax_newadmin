// src/features/admin/ViewAdminUser.jsx
import React from "react";
import Modal from "../../reusableComponents/Modals/Modals";
import { useViewUserQuery } from "./adminmanagementApiSlice";
import { formatPermissionName } from "./permissions";

const ViewAdminUser = ({ isOpen, onClose, userId }) => {
  const { data: viewUser, isLoading } = useViewUserQuery(userId, {
    skip: !userId,
  });
  const user = viewUser?.data;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Details" size="lg">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#b9fd5c]/30 border-t-[#b9fd5c] rounded-full animate-spin" />
          <p className="text-white mt-4 text-sm">Loading user details...</p>
        </div>
      ) : user ? (
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-full bg-[#b9fd5c] flex items-center justify-center
                text-white text-3xl font-bold flex-shrink-0"
            >
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            {/* Basic Info */}
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-white">{user.name}</h3>
              <p className="text-[#8a8d93] text-sm mt-1">{user.username}</p>
              <span
                className={`inline-block mt-2 text-[11px] font-semibold px-3 py-1 rounded-full ${
                  user.isBlock
                    ? "bg-red-500/10 text-red-400"
                    : "bg-[#0ecb6f]/10 text-[#0ecb6f]"
                }`}
              >
                {user.isBlock ? "Blocked" : "Active"}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailItem
              icon="✉"
              label="Email"
              value={user.email || "N/A"}
            />
            <DetailItem
              icon="📞"
              label="Phone"
              value={
                user.phone
                  ? `+${user.countryCode} ${user.phone}`
                  : "N/A"
              }
            />
            <DetailItem
              icon="🛡"
              label="Username / Referral"
              value={user.username || "N/A"}
            />
            <DetailItem
              icon="📅"
              label="Created At"
              value={
                user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"
              }
            />
          </div>

          {/* Permissions */}
          <div>
            <h4 className="text-sm font-semibold text-[#b9fd5c] mb-3">
              Assigned Permissions
            </h4>

            {user.permissions?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {user.permissions.map((permission, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3
                      bg-[#111214] border border-[#2a2c2f] rounded-lg"
                  >
                    <span className="text-[13px] text-[#ccc]">
                      {formatPermissionName(permission)}
                    </span>
                    <span className="text-[#0ecb6f] text-sm">✓</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#555] text-sm">No permissions assigned</p>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-red-400 text-sm">Failed to load user details</p>
        </div>
      )}
    </Modal>
  );
};

// Detail Item Component
const DetailItem = ({ icon, label, value }) => (
  <div className="bg-[#111214] border border-[#2a2c2f] rounded-lg p-4">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-xs text-[#b9fd5c] font-medium">{label}</span>
    </div>
    <p className="text-white text-sm">{value}</p>
  </div>
);

export default ViewAdminUser;