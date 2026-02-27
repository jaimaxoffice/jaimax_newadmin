// src/features/deletedUsers/DeletedUsersTable.jsx
import React, { useState, useEffect, useMemo } from "react";
import Table from "../../reusableComponents/Tables/Table";
import MobileCard from "../../reusableComponents/MobileCards/MobileCards";
import UserDetailsModal from "../../reusableComponents/Modals/UserDetailsModal";
import DeleteUserModal from "../../reusableComponents/Modals/DeleteUserModal";
import { Trash2, Eye } from "lucide-react";
import {
  useGetDeletedUsersQuery,
  useDeleteUserMutation,
} from "./deleteApiSlice";
import { formatDateWithAmPm } from "../../utils/dateUtils";
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

  // Reverse the data to show most recent first
  const reversedUsersData = useMemo(() => {
    return [...usersData].reverse();
  }, [usersData]);

  useEffect(() => {
    refetch();
  }, [refetch]);

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

  const columns = [
    {
      header: "S.No",
      render: (_, index) => `${index + 1}.`,
    },
    {
      header: "Username",
      render: (row) => (
        <span className="text-white font-medium">{row?.username || "N/A"}</span>
      ),
    },
    {
      header: "Name",
      render: (row) => row?.name || "N/A",
    },
    {
      header: "Email",
      render: (row) => (
        <span className="inline-block">{row?.email || "N/A"}</span>
      ),
    },
    {
      header: "Tokens",
      render: (row) => (
        <span className="text-[#b9fd5c] font-medium">
          {Number(row?.tokens || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Transferred To",
      render: (row) => row?.tokensTransferredTo || "N/A",
    },
    {
      header: "Deletion Reason",
      render: (row) => (
        <span
          className="text-red-400"
          title={row?.deletionReason || "No reason provided"}
        >
          {row?.deletionReason || "No reason provided"}
        </span>
      ),
    },
    {
      header: "Deleted Date",
      render: (row) => (
        <span className="text-xs">{formatDateWithAmPm(row?.deletedAt)}</span>
      ),
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
          <Eye size={16} />
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="p-2 sm:p-2 space-y-6">
        {/* Main Table Card */}
        <div className="bg-[#282f35] border border-[#2a2c2f] rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              {/* Total Count */}
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-2.5">
                <span className="text-sm text-[#8a8d93] font-medium">
                  Total Deleted Users:
                </span>
                <span className="text-lg font-bold text-red-400">
                  {Number(totalDeletedUsers).toLocaleString()}
                </span>
              </div>

              {/* Delete Button */}
              <button
                onClick={handleShowDeleteModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                  bg-red-500/10 text-red-400 border border-red-500/20
                  hover:bg-red-500/20 hover:border-red-500/30
                  transition-all duration-200 cursor-pointer"
              >
                <Trash2 size={16} />
                Delete User
              </button>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="">
            <Table
              columns={columns}
              data={reversedUsersData}
              isLoading={isLoading}
              currentPage={1}
              perPage={reversedUsersData.length}
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