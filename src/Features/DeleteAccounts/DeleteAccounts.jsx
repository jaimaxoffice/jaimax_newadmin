// src/features/deleteAccountByAdmin/DeletedUsersTable.jsx
import React, { useState, useEffect } from "react";
import Table from "../../reusableComponents/Tables/Table";
import MobileCard from "../../reusableComponents/MobileCards/MobileCards";
import UserDetailsModal  from "../../reusableComponents/Modals/UserDetailsModal";
import DeleteUserModal  from "../../reusableComponents/Modals/DeleteUserModal";
import {TrashIcon } from "lucide-react"
import {
  useGetDeletedUsersQuery,
  useDeleteUserMutation,
} from "./deleteApiSlice";
 
import { useToast } from "../../reusableComponents/Toasts/ToastContext";

const DeletedUsersTable = () => {
  const toast = useToast();
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
                     bg-[#b9fd5c]/10 text-[#b9fd5c] hover:bg-[#b9fd5c]/20
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
            className: "text-[#b9fd5c] hover:bg-[#b9fd5c]/5",
          },
        ]}
      />
    );
  };

  return (
    <div>
      <div className="p-2 sm:p-2 space-y-6">
        

        {/* Main Table Card */}
<div className="bg-[#282f35] border border-[#2a2c2f] rounded-lg  overflow-hidden">
  {/* Header */}
  <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f] space-y-4">
    {/* Title + Delete Button */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <h1 className="text-lg font-semibold text-white">
        Deleted Users Report
      </h1>
      <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-2.5">
        <span className="text-sm text-[#8a8d93] font-medium">Total Deleted Users:</span>
        <span className="text-lg font-bold text-red-400">
          {Number(totalDeletedUsers).toLocaleString()}
        </span>
      </div>

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

    {/* Total Count - Centered */}
    
  </div>

  {/* Desktop Table */}
  <div className="">
    <Table
      columns={columns}
      data={usersData}
      isLoading={isLoading}
      currentPage={1}
      perPage={usersData.length}
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



