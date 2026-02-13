// src/features/deleteAccountByAdmin/DeletedUsersTable.jsx
import React, { useState, useEffect } from "react";
import Table from "../../reusableComponents/Tables/Table";
import MobileCard from "../../reusableComponents/MobileCards/MobileCards";
import MobileCardList from "../../reusableComponents/MobileCards/MobileCardList";
import StatCard from "../../reusableComponents/StatCards/StatsCard";
import SubmitButton from "../../reusableComponents/Buttons/SubmitButton";
import UserDetailsModal  from "../../reusableComponents/Modals/UserDetailsModal";
import DeleteUserModal  from "../../reusableComponents/Modals/DeleteUserModal";
import {
  useGetDeletedUsersQuery,
  useDeleteUserMutation,
} from "./deleteApiSlice";
import { toast } from "react-toastify";

const DeletedUsersTable = () => {
  // Modal states
  const [showDetails, setShowDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteFormData, setDeleteFormData] = useState({
    username: "",
    reasonForDelete: "",
  });

  const {
    data: deletedUsersReport,
    isLoading,
    refetch,
  } = useGetDeletedUsersQuery();

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const usersData = deletedUsersReport?.data || [];
  const totalDeletedUsers = usersData.length;

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Handlers
  const handleShowDetails = (user) => {
    setSelectedUser(user);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedUser(null);
  };

  const handleShowDeleteModal = () => setShowDeleteModal(true);

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteFormData({ username: "", reasonForDelete: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeleteFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeleteUser = async (e) => {
    e.preventDefault();
    if (!deleteFormData.username.trim()) {
      return toast.error("Username is required");
    }
    if (!deleteFormData.reasonForDelete.trim()) {
      return toast.error("Reason for delete is required");
    }
    try {
      await deleteUser({
        username: deleteFormData.username.trim(),
        reasonForDelete: deleteFormData.reasonForDelete.trim(),
      }).unwrap();
      toast.success("User deleted successfully!");
      handleCloseDeleteModal();
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete user");
    }
  };

  const formatDateWithAmPm = (isoString) => {
    if (!isoString) return "N/A";
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

  // Desktop Table Columns
  const columns = [
    {
      header: "S.No",
      render: (_, index) => `${index + 1}.`,
    },
    {
      header: "Username",
      render: (row) => row?.username || "N/A",
    },
    {
      header: "Name",
      render: (row) => row?.name || "N/A",
    },
    {
      header: "Email",
      render: (row) => (
        <span className=" inline-block">
          {row?.email || "N/A"}
        </span>
      ),
    },
    {
      header: "Tokens",
      render: (row) => Number(row?.tokens || 0).toLocaleString(),
    },
    {
      header: "Transferred To",
      render: (row) => row?.tokensTransferredTo || "N/A",
    },
    {
      header: "Deletion Reason",
      render: (row) => (
        <span
          className=""
          title={row?.deletionReason || "No reason provided"}
        >
          {row?.deletionReason || "No reason provided"}
        </span>
      ),
    },
    {
      header: "Deleted Date",
      render: (row) => formatDateWithAmPm(row?.deletedAt),
    },
    {
      header: "Deleted By",
      render: (row) => row?.deletedBy || "System",
    },
    {
      header: "Action",
      render: (row) => (
        <button
          onClick={() => handleShowDetails(row)}
          title="View Details"
          className="w-8 h-8 flex items-center justify-center rounded-lg
                     bg-[#eb660f]/10 text-[#eb660f] hover:bg-[#eb660f]/20
                     transition-colors cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      ),
    },
  ];

  // Mobile Card Builder
  const renderUserCard = (row, index) => {
    return (
      <MobileCard
        key={row._id || index}
        header={{
          avatar: (row?.name?.charAt(0) || row?.username?.charAt(0) || "?").toUpperCase(),
          avatarBg: "bg-red-500/10 text-red-400",
          title: row?.name || "N/A",
          subtitle: `#${index + 1} • @${row?.username || "N/A"}`,
          badge: "Deleted",
          badgeClass: "bg-red-500/10 text-red-400",
        }}
        rows={[
          { label: "Email", value: row?.email || "N/A" },
          {
            label: "Tokens",
            value: Number(row?.tokens || 0).toLocaleString(),
            highlight: true,
          },
          { label: "Transferred To", value: row?.tokensTransferredTo || "N/A" },
          {
            label: "Reason",
            value: row?.deletionReason || "No reason provided",
          },
          { label: "Deleted Date", value: formatDateWithAmPm(row?.deletedAt) },
          { label: "Deleted By", value: row?.deletedBy || "System" },
        ]}
        actions={[
          {
            label: "View Details",
            onClick: () => handleShowDetails(row),
            className: "text-[#eb660f] hover:bg-[#eb660f]/5",
          },
        ]}
      />
    );
  };

  return (
    <div>
      <div className="p-2 sm:p-2 space-y-6">
        {/* Stat Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Deleted Users"
            value={Number(totalDeletedUsers).toLocaleString()}
            valueClass="text-red-400"
          />
        </div>

        {/* Main Table Card */}
        <div className="bg-[#1b232d] border border-[#2a2c2f] rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h1 className="text-lg font-semibold text-white">
                Deleted Users Report
              </h1>

              <button
                onClick={handleShowDeleteModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                           bg-red-500/10 text-red-400 border border-red-500/20
                           hover:bg-red-500/20 hover:border-red-500/30
                           transition-all duration-200 cursor-pointer"
              >
                <TrashIcon />
                Delete User
              </button>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block">
            <Table
              columns={columns}
              data={usersData}
              isLoading={isLoading}
              currentPage={1}
              perPage={usersData.length}
            />
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            <MobileCardList
              data={usersData}
              isLoading={isLoading}
              renderCard={renderUserCard}
              emptyMessage="No deleted users found"
            />
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={showDetails}
        onClose={handleCloseDetails}
        user={selectedUser}
        formatDate={formatDateWithAmPm}
      />

      {/* Delete User Modal */}
      <DeleteUserModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        formData={deleteFormData}
        onChange={handleInputChange}
        onSubmit={handleDeleteUser}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default DeletedUsersTable;

// ─── Icons ───────────────────────────────────────────────────────

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

