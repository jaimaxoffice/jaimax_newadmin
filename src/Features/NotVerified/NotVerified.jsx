// src/features/notVerifiedUsers/NotVerifiedUsers.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import Table from "../../reusableComponents/Tables/Table";
import MobileCard from "../../reusableComponents/MobileCards/MobileCards";
import MobileCardList from "../../reusableComponents/MobileCards/MobileCardList";
import StatCard from "../../reusableComponents/StatCards/StatsCard";
import Pagination from "../../reusableComponents/paginations/Pagination";
import ConfirmModal from "../../reusableComponents/Modals/ConfirmModal";
import {
  useGetAllNotverifiedUsersQuery,
  useDeleteNotVerifiedUserMutation,
} from "./notverifiedApiSlice";
import SearchBar from "../../reusableComponents/searchBar/SearchBar";
import Loader from "../../reusableComponents/Loader/Loader";
import PerPageSelector from "../../reusableComponents/Filter/PerPageSelector";
import { formatDate } from "../../utils/dateUtils";
const NotVerifiedUsers = () => {
  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
  });

  const [isSearching, setIsSearching] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const searchTimeoutRef = useRef(null);

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAllNotverifiedUsersQuery();

  const [deleteUser, { isLoading: isDeleting }] =
    useDeleteNotVerifiedUserMutation();

  // ─── Data Processing ────────────────────────────────────────

  const users = useMemo(() => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (response.data && Array.isArray(response.data)) return response.data;
    if (response.users && Array.isArray(response.users)) return response.users;
    return [];
  }, [response]);

  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    if (!state.search) return users;

    const lowerSearch = state.search.toLowerCase();
    return users.filter(
      (user) =>
        user?.name?.toLowerCase().includes(lowerSearch) ||
        user?.email?.toLowerCase().includes(lowerSearch) ||
        user?._id?.toString().includes(state.search),
    );
  }, [users, state.search]);

  const paginatedUsers = useMemo(() => {
    const start = (state.currentPage - 1) * state.perPage;
    return filteredUsers.slice(start, start + state.perPage);
  }, [filteredUsers, state.currentPage, state.perPage]);

  const totalPages = Math.ceil(filteredUsers.length / state.perPage) || 1;

  // Stats
  const totalUnverified = filteredUsers.length;
  const activeCount = filteredUsers.filter((u) => u.isActive).length;
  const inactiveCount = filteredUsers.filter((u) => !u.isActive).length;
  const totalTokens = filteredUsers.reduce(
    (sum, u) => sum + (u.tokens || 0),
    0,
  );

  // ─── Handlers ────────────────────────────────────────────────

  const handlePageChange = (page) =>
    setState((prev) => ({ ...prev, currentPage: page }));

  const handlePerPageChange = (e) =>
    setState((prev) => ({
      ...prev,
      perPage: parseInt(e.target.value),
      currentPage: 1,
    }));

  const handleSearch = (e) => {
    const value = e.target.value;
    if (value !== state.search) setIsSearching(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, search: value, currentPage: 1 }));
      setIsSearching(false);
    }, 600);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteUser(selectedUser._id).unwrap();
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isError) {
    const errorMessage =
      error?.status === 524
        ? "The request timed out. This might be due to a large dataset."
        : error?.status === 500
          ? "Server error. Please try again later."
          : error?.data?.message || "Something went wrong. Please try again.";

    return (
      <div>
        <div className="p-2 sm:p-2 space-y-6">
          <div className="bg-[#1b232d] border border-[#2a2c2f] rounded-2xl overflow-hidden">
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <h3 className="text-white text-lg font-semibold mb-2">
                Error Loading Data
              </h3>
              <p className="text-[#8a8d93] text-sm text-center max-w-md mb-6">
                {errorMessage}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                             bg-[#eb660f] text-white hover:bg-[#ff8533]
                             transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  {/* <RefreshIcon className={isLoading ? "animate-spin" : ""} /> */}
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium
                             bg-[#111214] border border-[#2a2c2f] text-[#8a8d93]
                             hover:text-white hover:border-[#3a3c3f]
                             transition-colors cursor-pointer"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Table Columns ──────────────────────────────────────────

  const columns = [
    {
      header: "S.No",
      render: (_, index) =>
        `${(state.currentPage - 1) * state.perPage + index + 1}.`,
    },
    {
      header: "ID",
      render: (row) => <span className="">{row?._id?.slice(-8) || "N/A"}</span>,
    },
    {
      header: "Name",
      render: (row) => <span className="">{row?.name || "N/A"}</span>,
    },
    {
      header: "Email",
      render: (row) => <span className="">{row?.email || "N/A"}</span>,
    },
    {
      header: "Registration Date",
      render: (row) => (
        <span className="text-xs">{formatDate(row?.createdAt)}</span>
      ),
    },
    {
      header: "Status",
      render: (row) => (
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            row?.isActive
              ? "bg-[#eb660f]/10 text-[#eb660f]"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {row?.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Tokens",
      render: (row) => (
        <span
          className={`font-semibold text-sm ${
            row?.tokens > 1000
              ? "text-[#eb660f]"
              : row?.tokens > 0
                ? "text-yellow-400"
                : "text-red-400"
          }`}
        >
          {row?.tokens || 0}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <button
          onClick={() => handleDeleteClick(row)}
          disabled={isDeleting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                     bg-red-500/10 text-red-400 border border-red-500/20
                     hover:bg-red-500/20 hover:border-red-500/40
                     transition-all duration-200 cursor-pointer
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="p-2 sm:p-2 space-y-6">
        {/* Top Controls */}

        {/* Main Table Card */}
        <div className="bg-[#1b232d] border border-[#2a2c2f] rounded-lg  overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex w-full">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto ml-auto">
                  <PerPageSelector
                    options={[10,20,40,60,80,100]}
                    onChange={(value) =>
                      setState((prev) => ({
                        ...prev,
                        perPage: value,
                        currentPage: 1,
                      }))
                    }
                  />

                  <SearchBar
                    onSearch={handleSearch}
                    placeholder={
                      isSearching ? "Searching..." : "Search username..."
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Desktop Table */}
          <div className="">
            <Table
              columns={columns}
              data={paginatedUsers}
              isLoading={isLoading}
              currentPage={state.currentPage}
              perPage={state.perPage}
            />
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={state.currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCloseModal}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        subtitle="Are you sure you want to delete this user?"
        confirmText="Delete User"
        cancelText="Cancel"
        loadingText="Deleting..."
        warningText="This action cannot be undone! The user and all associated data will be permanently removed."
        accentColor="from-red-500 via-red-400 to-orange-500"
        confirmBtnClass="bg-red-500 text-white hover:bg-red-600"
        // icon={<TrashLargeIcon />}
        iconBg="bg-red-500/10"
      >
        {/* User Info Inside Modal */}
        {selectedUser && (
          <div className="p-4 bg-[#111214] border border-[#2a2c2f] rounded-xl space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-[#2a2c2f]">
              <div
                className="w-10 h-10 rounded-full bg-red-500/10 flex items-center
                           justify-center text-red-400 font-semibold text-sm shrink-0"
              >
                {(selectedUser?.name?.charAt(0) || "?").toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {selectedUser.name || "N/A"}
                </p>
                <p className="text-[#8a8d93] text-xs truncate">
                  {selectedUser.email}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#8a8d93] text-xs">User ID</span>
                <span className="text-[#eb660f] text-xs font-mono font-semibold">
                  {selectedUser._id?.slice(-12) || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8a8d93] text-xs">Status</span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    selectedUser.isActive
                      ? "bg-[#0ecb6f]/10 text-[#0ecb6f]"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {selectedUser.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8a8d93] text-xs">Tokens</span>
                <span
                  className={`text-xs font-semibold ${
                    selectedUser.tokens > 1000
                      ? "text-[#0ecb6f]"
                      : selectedUser.tokens > 0
                        ? "text-yellow-400"
                        : "text-red-400"
                  }`}
                >
                  {selectedUser.tokens || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8a8d93] text-xs">Registered</span>
                <span className="text-white text-xs">
                  {formatDate(selectedUser.createdAt)}
                </span>
              </div>
            </div>
          </div>
        )}
      </ConfirmModal>
    </div>
  );
};

export default NotVerifiedUsers;
