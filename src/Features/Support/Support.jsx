// src/features/support/Support.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../reusableComponents/Toasts/ToastContext";
import { Eye, Pencil } from "lucide-react";
import Table from "../../reusableComponents/Tables/Table";
import Pagination from "../../reusableComponents/paginations/Pagination";
import Modal from "../../reusableComponents/Modals/Modals";
import SearchBar from "../../reusableComponents/searchBar/SearchBar";
import PerPageSelector from "../../reusableComponents/Filter/PerPageSelector";
import { useSupportDataQuery, useEditStatusMutation } from "./supportApiSlice";
import Loader from "../../reusableComponents/Loader/Loader";

const STATUS_STYLES = {
  open: "text-[#0ecb6f]",
  inprogress: "text-yellow-400",
  closed: "text-red-400",
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
  }, [refetch]);

  // Handlers
  const handlePageChange = (page) => {
    setState((prev) => ({ ...prev, currentPage: page }));
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
          { position: "top-center" }
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
// Action Buttons (Reusable)
const SupportActions = ({ data, type }) => {
  if (type === "view") {
    return (
      <button
        onClick={() => navigate(`/support-chart/${data._id}`)}
        title="View Ticket"
        className="cursor-pointer hover:text-blue-500 transition"
      >
        <Eye size={17} />
      </button>
    );
  }

  if (type === "edit") {
    return (
      <button
        onClick={() => openEditModal(data._id)}
        title="Edit Status"
        className="cursor-pointer hover:text-yellow-500 transition"
      >
        <Pencil size={17} />
      </button>
    );
  }

  return null;
};
  // Columns
  const columns = [
    {
      header: "S.No",
      render: (_, index) =>
        `${(state.currentPage - 1) * state.perPage + index + 1}.`,
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
    header: "View",
    render: (row) => <SupportActions data={row} type="view" />,
  },
  {
    header: "Edit",
    render: (row) => <SupportActions data={row} type="edit" />,
  },
  ];

  return (
    <>
      <div className="p-2 sm:p-2 space-y-6 sidebar-scroll">
        {/* Table Section */}
        <div className="bg-[#282f35] rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-[#282f35]">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-end">
              <PerPageSelector
                options={[10, 20, 40, 60, 80, 100]}
                onChange={(value) =>
                  setState((prev) => ({
                    ...prev,
                    perPage: value,
                    currentPage: 1,
                  }))
                }
              />

              <SearchBar
                onSearch={(e) => {
                  clearTimeout(window._supportSearchTimeout);
                  window._supportSearchTimeout = setTimeout(() => {
                    setState((prev) => ({
                      ...prev,
                      search: e.target.value,
                      currentPage: 1,
                    }));
                  }, 1000);
                }}
                placeholder="Search by name, email..."
              />
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

          {editTarget.status && (
            <div className="flex items-center gap-2 p-3 bg-[#111214] border border-[#2a2c2f] rounded-xl">
              <span className="text-[#8a8d93] text-xs">New Status:</span>
              <StatusBadge status={editTarget.status} />
            </div>
          )}

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
                bg-[#b9fd5c] transition-colors cursor-pointer
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