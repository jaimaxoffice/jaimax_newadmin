// src/features/kyc/KycApprove.jsx
import React, { useState, useEffect } from "react";
import Table from "../../reusableComponents/Tables/Table";
import Pagination from "../../reusableComponents/paginations/Pagination";
import StatCard from "../../reusableComponents/StatCards/StatsCard";
import KycViewModal from "./KycViewModal";
import KycActionModal from "./KycActionModal";
import { useKycListQuery } from "./kycApiSlice";
import { toast } from "react-toastify";
import SearchBar from "../../reusableComponents/searchBar/SearchBar";
import { CheckCircle, XCircle, Clock, AlertCircle, Eye } from "lucide-react";
import PerPageSelector from "../../reusableComponents/Filter/PerPageSelector";
const KycApprove = () => {
  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
  });

  const [modals, setModals] = useState({
    view: false,
    action: false,
  });

  const [selectedData, setSelectedData] = useState(null);
  const [actionType, setActionType] = useState("");
  const [actionId, setActionId] = useState("");

  const queryParams = `limit=${state.perPage}&page=${state.currentPage}&search=${state.search}`;
  const { data: tableData, isLoading, refetch } = useKycListQuery(queryParams);

  const kycList = tableData?.data?.kycs || [];
  const statusCounts = tableData?.data?.kycStatusCounts || [];
  const totalRecords = tableData?.data?.pagination?.total || 0;

  useEffect(() => {
    refetch();
  }, []);

  // Search
  let searchTimeout;
  const handleSearch = (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      setState((prev) => ({ ...prev, search: e.target.value, currentPage: 1 }));
    }, 1000);
  };

  const handlePageChange = (page) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  };

  // View KYC
  const handleView = (data) => {
    setSelectedData(data);
    setModals((prev) => ({ ...prev, view: true }));
  };

  // Approve
  const handleApprove = (id) => {
    setActionId(id);
    setActionType("approve");
    setModals((prev) => ({ ...prev, action: true }));
  };

  // Reject
  const handleReject = (id) => {
    setActionId(id);
    setActionType("reject");
    setModals((prev) => ({ ...prev, action: true }));
  };

  // Confirm Action
  const handleConfirmAction = async (id, type, reason) => {
    try {
      // your API call here
      toast.success(
        `KYC ${type === "approve" ? "approved" : "rejected"} successfully`,
        { position: "top-center" },
      );
      refetch();
    } catch (error) {
      toast.error(`Failed to ${type} KYC`);
    }
  };

  const getStatusText = (status) => {
    const map = {
      open: "In Open",
      approve: "Approved",
      inprogress: "In Progress",
      reject: "Rejected",
    };
    return map[status] || "N/A";
  };

  const getStatusIcon = (status) => {
    const map = {
      open: <AlertCircle size={32} strokeWidth={2} className="text-[#b9fd5c]" />,
      approve: <CheckCircle size={32} strokeWidth={2} className="text-[#b9fd5c]" />,
      inprogress: <Clock size={32} strokeWidth={2} className="text-white" />,
      reject: <XCircle size={32} strokeWidth={2} className="text-white" />,
    };
    return map[status] || <AlertCircle size={32} strokeWidth={2} className="text-gray-400" />;
  };

  const getStatusStyle = (status) => {
    const map = {
      approve: " text-green-400",
      reject: "bg-red-500/10 text-red-400",
      open: "bg-yellow-500/10 text-yellow-400",
      inprogress: "bg-blue-500/10 text-blue-400",
    };
    return map[status] || "bg-[#2a2c2f] text-[#8a8d93]";
  };

  const getStatColor = (status) => {
    const s = status?.toLowerCase();
    if (s === "approve" || s === "approved") return "text-[#0ecb6f]";
    if (s === "reject" || s === "rejected") return "text-red-400";
    if (s === "inprogress" || s === "in-progress" || s === "pending")
      return "text-blue-400";
    if (s === "open" || s === "submitted") return "text-yellow-400";
    return "text-white";
  };

  // Action Buttons
  const ActionButtons = ({ data }) => {
    if (data.status === "open") {
      return (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleView(data)}
            title="View"
            className="w-8 h-8 flex items-center justify-center rounded-lg
              bg-blue-500/10 text-blue-400 hover:bg-blue-500/20
              transition-colors cursor-pointer text-sm"
          >
            ⊙
          </button>
          <button
            onClick={() => handleApprove(data._id)}
            title="Approve"
            className="w-8 h-8 flex items-center justify-center rounded-lg
              bg-[#0ecb6f]/10 text-[#0ecb6f] hover:bg-[#0ecb6f]/20
              transition-colors cursor-pointer text-sm font-bold"
          >
            ✓
          </button>
          <button
            onClick={() => handleReject(data._id)}
            title="Reject"
            className="w-8 h-8 flex items-center justify-center rounded-lg
              bg-red-500/10 text-red-400 hover:bg-red-500/20
              transition-colors cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={() => handleView(data)}
        title="View"
        className=" hover:text-blue-300 text-xs font-medium
           px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
      >
        <Eye size={17} />
      </button>
    );
  };

  // Desktop Columns
  const columns = [
    {
      header: "S.No",
      render: (_, index, currentPage, perPage) =>
        currentPage * perPage - (perPage - 1) + index + ".",
    },
    {
      header: "User ID",
      render: (row) => row.user_id?.username || "N/A",
    },
    { header: "Name", accessor: "name" },
    { header: "Bank Name", accessor: "bank_name" },
    { header: "Bank Account", accessor: "bank_account" },
    {
      header: "Address",
      cellClass: "text-left",
      render: (row) => (
        <span className=" inline-block " title={row.address}>
          {row.address || "N/A"}
        </span>
      ),
    },
    { header: "IFSC Code", accessor: "ifsc_code" },
    { header: "Mobile Number", accessor: "mobile_number" },
    {
      header: "Status",
      render: (row) => (
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${getStatusStyle(
            row.status,
          )}`}
        >
          {getStatusText(row.status)}
        </span>
      ),
    },
    { header: "UPI ID", accessor: "upi_id" },
    {
      header: "Action",
      render: (row) => <ActionButtons data={row} />,
    },
  ];


  return (
    <>
      <div className="p-2 sm:p-2 space-y-6">
        {/* Status Cards */}
        {statusCounts.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statusCounts.map((item, i) => (
              <StatCard
                key={i}
                title={getStatusText(item._id) || item._id}
                value={item.count}
                // valueClass="text-[#b9fd5c]"
                icon={getStatusIcon(item._id)}
                
              />
            ))}
          </div>
        )}

        {/* Table Section */}
        <div className="bg-[#282f35]  rounded-lg  overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

              <div className="flex w-full">
                <div className="flex items-center gap-3 w-full sm:w-auto ml-auto">
                  {/* <select
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        perPage: Number(e.target.value),
                        currentPage: 1,
                      }))
                    }
                    className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#0ecb6f] transition-colors cursor-pointer"
                  >
                    <option value="10">10</option>
                    <option value="30">30</option>
                    <option value="50">50</option>
                  </select> */}
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
                  <SearchBar onSearch={handleSearch} placeholder="Search..." />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="">
            <Table
              columns={columns}
              data={kycList}
              isLoading={isLoading}
              currentPage={state.currentPage}
              perPage={state.perPage}
            />
          </div>


        </div>

        {/* Pagination */}
        {kycList?.length > 0 && (
          <Pagination
            currentPage={state.currentPage}
            totalPages={Math.ceil(totalRecords / state.perPage) || 1}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* View Modal */}
      <KycViewModal
        isOpen={modals.view}
        onClose={() => setModals((prev) => ({ ...prev, view: false }))}
        data={selectedData}
      />

      {/* Action Modal */}
      <KycActionModal
        isOpen={modals.action}
        onClose={() => setModals((prev) => ({ ...prev, action: false }))}
        type={actionType}
        id={actionId}
        onConfirm={handleConfirmAction}
      />
    </>
  );
};

export default KycApprove;
