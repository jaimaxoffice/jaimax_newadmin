// src/features/support/Support.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../reusableComponents/Toasts/ToastContext";
import { Eye, Pencil, MessageSquare } from "lucide-react";
import Table from "../../reusableComponents/Tables/Table";
import Pagination from "../../reusableComponents/paginations/Pagination";
import Modal from "../../reusableComponents/Modals/Modals";
import SearchBar from "../../reusableComponents/searchBar/SearchBar";
import PerPageSelector from "../../reusableComponents/Filter/PerPageSelector";
import { useSupportDataQuery, useEditStatusMutation } from "./supportApiSlice";
import Loader from "../../reusableComponents/Loader/Loader"
// ─── Constants ──────────────────────────────────────────────
const STATUS_STYLES = {
  open: "text-[#0ecb6f]",
  inprogress: " text-yellow-400",
  closed: " text-red-400",
};

const STATUS_OPTIONS = [
  { value: "", label: "Select Status" },
  { value: "inprogress", label: "In Progress" },
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
];

const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// ─── Main Component ─────────────────────────────────────────
const Support = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
  });

  const [modals, setModals] = useState({
    edit: false,
  });

  const [editTarget, setEditTarget] = useState({ id: "", status: "" });

  // API
  const queryParams = `limit=${state.perPage}&page=${state.currentPage}&searchParam=${state.search}`;

  const {
    data: supportData,
    isLoading,
    refetch,
  } = useSupportDataQuery(queryParams);

  const [editStatus, { isLoading: isEditing }] = useEditStatusMutation();

  const TableData = supportData?.data?.response || [];
  const totalCount = supportData?.data?.totalCount || 0;

  useEffect(() => {
    refetch();
  }, []);

  // Handlers
  const handlePageChange = (page) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  };

  let searchTimeout;
  const handleSearch = (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        search: e.target.value,
        currentPage: 1,
      }));
    }, 500);
  };

  const openEditModal = (id) => {
    setEditTarget({ id, status: "" });
    setModals((prev) => ({ ...prev, edit: true }));
  };

  const handleEditStatus = async () => {
    if (!editTarget.status) {
      toast.error("Please select a status", { position: "top-center" });
      return;
    }

    try {
      const response = await editStatus({
        id: editTarget.id,
        status: editTarget.status,
      });

      if (response?.data?.status_code === 200) {
        setModals((prev) => ({ ...prev, edit: false }));
        toast.success(
          response?.data?.message || "Status updated successfully",
          {
            position: "top-center",
          },
        );
        refetch();
      }
    } catch (error) {
      toast.error(error?.message || "Failed to update status", {
        position: "top-center",
      });
    }
  };

  // Status Badge
  const StatusBadge = ({ status }) => (
    <span
      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
        STATUS_STYLES[status] || "bg-[#2a2c2f] text-[#8a8d93]"
      }`}
    >
      {capitalize(status) || "N/A"}
    </span>
  );

  // Action Buttons
  const SupportActions = ({ data }) => (
    <div className="flex items-center gap-15">
      <button
        onClick={() => navigate(`/support-chart/${data._id}`)}
        title="View Ticket"
        className=" cursor-pointer"
      >
        <Eye size={17} />
      </button>
      <button
        onClick={() => openEditModal(data._id)}
        title="Edit Status"
        className=" cursor-pointer"
      >
        <Pencil size={17} />
      </button>
    </div>
  );

  // Desktop Table Columns
  const columns = [
    {
      header: "S.No",
      render: (_, index, currentPage, perPage) =>
        currentPage * perPage - (perPage - 1) + index + ".",
    },
    {
      header: "User ID",
      render: (row) => <span className="">{row._id || "N/A"}</span>,
    },
    {
      header: "Name",
      render: (row) => row.author_name || "N/A",
    },
    {
      header: "Email",
      render: (row) => <span className="">{row.author_email || "N/A"}</span>,
    },
    {
      header: "Username",
      render: (row) => row.author_username || "N/A",
    },
    {
      header: "Phone",
      render: (row) => row.author_phone || "N/A",
    },
    {
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Action",
      render: (row) => <SupportActions data={row} />,
    },
  ];

  return (
    <>
      <div className="p-2 sm:p-2 space-y-6 sidebar-scroll">
        {/* Header */}

        

        {/* Filters */}

        {/* Table Section */}
        <div className="bg-[#282f35]  rounded-lg  overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-[#282f35]">
            <div className="flex items-center justify-between">
              <div className="flex w-full">
                <div className="flex items-center gap-3 w-full sm:w-auto ml-auto">
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

                  <SearchBar onChange={handleSearch} placeholder="Search..." />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="">
            <Table
              columns={columns}
              data={TableData}
              isLoading={isLoading}
              currentPage={state.currentPage}
              perPage={state.perPage}
            />
          </div>
        </div>

        {/* Pagination */}
        {TableData?.length > 0 && (
          <Pagination
            currentPage={state.currentPage}
            totalPages={Math.ceil(totalCount / state.perPage) || 1}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Edit Status Modal */}
      <Modal
        isOpen={modals.edit}
        onClose={() => setModals((prev) => ({ ...prev, edit: false }))}
        title="Edit Ticket Status"
        size="sm"
      >
        <div className="space-y-5">
          {/* Status Select */}
          <div>
            <label className="block text-sm font-medium text-[#b9fd5c] mb-2">
              Select Status
            </label>
            <select
              value={editTarget.status}
              onChange={(e) =>
                setEditTarget((prev) => ({ ...prev, status: e.target.value }))
              }
              className="w-full bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
                py-2.5 px-4 text-sm focus:outline-none focus:border-[#b9fd5c]
                focus:ring-1 focus:ring-[#b9fd5c]/30 transition-colors cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-[#111214]"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Preview */}
          {editTarget.status && (
            <div className="flex items-center gap-2 p-3 bg-[#111214] border border-[#2a2c2f] rounded-xl">
              <span className="text-[#8a8d93] text-xs">New Status:</span>
              <StatusBadge status={editTarget.status} />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setModals((prev) => ({ ...prev, edit: false }))}
              disabled={isEditing}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white
                bg-transparent border border-[#2a2c2f] hover:bg-[#2a2c2f]
                transition-colors cursor-pointer disabled:opacity-50"
            >
              Close
            </button>
            <button
              onClick={handleEditStatus}
              disabled={isEditing || !editTarget.status}
              className="px-5 py-2.5 rounded-3xl text-sm font-semibold text-black
                bg-[#b9fd5c]  transition-colors cursor-pointer
                disabled:opacity-50 flex items-center gap-2"
            >
              {isEditing ? (
                <>
                  <Loader />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};


export default Support;
