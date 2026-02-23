import React, { useState, useCallback } from "react";
import { useToast } from "../../reusableComponents/Toasts/ToastContext";
import Table from "../../reusableComponents/Tables/Table";
import Pagination from "../../reusableComponents/paginations/Pagination";
import MobileCard from "../../reusableComponents/MobileCards/MobileCards";
import MobileCardList from "../../reusableComponents/MobileCards/MobileCardList";
import Loader from "../../reusableComponents/Loader/Loader";

import {
  useGetAdminUserQuery,
  useBlockUserMutation,
} from "./adminmanagementApiSlice";

import AddAdminUser from "./AddPermissions";
import EditAdminUser from "./UpdatePermissions";
import ViewAdminUser from "./ViewAdminUser";
import { Eye, PencilLine,Plus } from "lucide-react";
import Button from "../../reusableComponents/Buttons/Button";
import PerPageSelector from "../../reusableComponents/Filter/PerPageSelector";
import SearchBar from "../../reusableComponents/searchBar/SearchBar";
const AdminManagement = () => {
  const toast = useToast();
  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
    selectedUserId: null,
  });

  const [modals, setModals] = useState({
    add: false,
    edit: false,
    view: false,
  });

  const queryParams = `limit=${state.perPage}&page=${state.currentPage}&search=${state.search}`;

  const {
    data: adminData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAdminUserQuery(queryParams);
  const [blockUser, { isLoading: isBlocking }] = useBlockUserMutation();

  const tableData = adminData?.data?.users || [];
  const totalRecords = adminData?.data?.pagination?.total || 0;

  // Handlers
  const handlePageChange = (page) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  };

  const handleSearch = useCallback(
    (() => {
      let timeout;
      return (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          setState((prev) => ({
            ...prev,
            search: e.target.value,
            currentPage: 1,
          }));
        }, 500);
      };
    })(),
    [],
  );

  const handleToggleBlock = async (userId, isBlock) => {
    try {
      const payload = { user_id: userId, is_blocked: isBlock ? 0 : 1 };
      const response = await blockUser(payload).unwrap();
      toast.success(response?.message || "User status updated!", {
        position: "top-center",
      });
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update status", {
        position: "top-center",
      });
    }
  };

  const handleViewUser = (userId) => {
    setState((prev) => ({ ...prev, selectedUserId: userId }));
    setModals((prev) => ({ ...prev, view: true }));
  };

  const handleEditUser = (userId) => {
    setState((prev) => ({ ...prev, selectedUserId: userId }));
    setModals((prev) => ({ ...prev, edit: true }));
  };

  // Toggle Switch
  const ToggleSwitch = ({ isActive, onToggle, disabled }) => (
    <label
      className={`relative inline-block w-10.5 h-5.5 ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        checked={isActive}
        onChange={onToggle}
        disabled={disabled}
        className="opacity-0 w-0 h-0"
      />
      <span
        className={`absolute inset-0 rounded-full transition-colors duration-300 ${
          isActive ? "bg-[#b9fd5c]" : "bg-[#4b4545]"
        }`}
      >
        <span
          className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all duration-300 ${
            isActive ? "left-5.5" : "left-0.5"
          }`}
        />
      </span>
    </label>
  );

  // Action Buttons
  const AdminActions = ({ user }) => (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => handleViewUser(user._id)}
        title="View User"
        className="w-8 h-8 flex items-center justify-center rounded-lg
           hover:bg-blue-500/20
          transition-colors cursor-pointer text-sm"
      >
        <Eye size={17} />
      </button>
      <button
        onClick={() => handleEditUser(user._id)}
        title="Edit User"
        className="w-8 h-8 flex items-center justify-center rounded-lg
           text-[#b9fd5c] hover:bg-[#b9fd5c]/20
          transition-colors cursor-pointer text-sm"
      >
        <PencilLine size={17} />
      </button>
    </div>
  );

  // Columns
  const columns = [
    {
      header: "S.No",
      render: (_, index, currentPage, perPage) =>
        currentPage * perPage - (perPage - 1) + index + ".",
    },
    { header: "Name", accessor: "name" },
    {
      header: "Email",
      render: (row) => <span>{row.email || "—"}</span>,
    },
    { header: "Username", accessor: "username" },
    {
      header: "Block/Unblock",
      render: (row) => (
        <ToggleSwitch
          isActive={!row.isBlock}
          onToggle={() => handleToggleBlock(row._id, row.isBlock)}
          disabled={isBlocking}
        />
      ),
    },
    {
      header: "Status",
      render: (row) => (
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
            row.isBlock
              ? "bg-red-500/10 text-red-400"
              : "bg-[#0ecb6f]/10 text-[#0ecb6f]"
          }`}
        >
          {row.isBlock ? "Blocked" : "Active"}
        </span>
      ),
    },
    {
      header: "Action",
      render: (row) => <AdminActions user={row} />,
    },
  ];

  // Show loader for: initial load, search, page change, filter change
  const showLoader = isLoading || isFetching;

  return (
    <>
      <div className="p-2 sm:p-2 space-y-6">
        {/* Table Section */}
        <div className="bg-[#282f35]  rounded-lg  overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-[#282f35] flex items-center justify-between">
            <div className="flex w-full">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto ml-auto">
                <PerPageSelector
                  value={state.perPage}
                  options={[10, 20, 40, 60, 80, 100]}
                  onChange={(value) =>
                    setState((prev) => ({
                      ...prev,
                      perPage: value,
                      currentPage: 1,
                    }))
                  }
                />

               <Button
        onClick={() => setModals((prev) => ({ ...prev, add: true }))}
        variant="primary"
        size="md"
        icon={Plus}
      >
        Add User
      </Button>

                <SearchBar
                  onSearch={(e) => {
                    clearTimeout(window._searchTimeout);
                    window._searchTimeout = setTimeout(() => {
                      setState((prev) => ({
                        ...prev,
                        search: e.target.value,
                        currentPage: 1,
                      }));
                    }, 500);
                  }}
                  placeholder="Search..."
                />
              </div>
            </div>

            {/* Inline fetching indicator */}
            {isFetching && !isLoading && (
              <div className="flex items-center gap-2"></div>
            )}
          </div>

          {/* Desktop Table */}
          <div className="rounded-lg ">
            {showLoader ? (
              <Loader />
            ) : (
              <Table
                columns={columns}
                data={tableData}
                isLoading={false}
                currentPage={state.currentPage}
                perPage={state.perPage}
              />
            )}
          </div>
        </div>

        {/* Pagination */}
        {!showLoader && tableData?.length > 0 && (
          <Pagination
            currentPage={state.currentPage}
            totalPages={Math.ceil(totalRecords / state.perPage) || 1}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Add Modal */}
      <AddAdminUser
        isOpen={modals.add}
        onClose={() => setModals((prev) => ({ ...prev, add: false }))}
        onSuccess={refetch}
      />

      {/* Edit Modal */}
      <EditAdminUser
        isOpen={modals.edit}
        onClose={() => {
          setModals((prev) => ({ ...prev, edit: false }));
          setState((prev) => ({ ...prev, selectedUserId: null }));
        }}
        userId={state.selectedUserId}
        onSuccess={refetch}
      />

      {/* View Modal */}
      <ViewAdminUser
        isOpen={modals.view}
        onClose={() => {
          setModals((prev) => ({ ...prev, view: false }));
          setState((prev) => ({ ...prev, selectedUserId: null }));
        }}
        userId={state.selectedUserId}
      />
    </>
  );
};

export default AdminManagement;
