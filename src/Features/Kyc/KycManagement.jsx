import React, { useState, useEffect } from "react";
import Table from "../../reusableComponents/Tables/Table";
import Pagination from "../../reusableComponents/paginations/Pagination";
import StatCard from "../../reusableComponents/StatCards/StatsCard";
import KycViewModal from "./KycViewModal";
import KycActionModal from "./KycActionModal";
import { useKycListQuery, useKycUpdateMutation } from "./kycApiSlice";
import { useToast } from "../../reusableComponents/Toasts/ToastContext";
import SearchBar from "../../reusableComponents/searchBar/SearchBar";
import PerPageSelector from "../../reusableComponents/Filter/PerPageSelector";

import { Clock, CheckCircle, XCircle, Loader ,Eye} from "lucide-react";

const KycApprove = () => {
  const toast = useToast();
  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
  });

  const [modals, setModals] = useState({ view: false, action: false });
  const [selectedData, setSelectedData] = useState(null);
  const [actionType, setActionType] = useState("");
  const [actionId, setActionId] = useState("");

  const queryParams = `limit=${state.perPage}&page=${state.currentPage}&search=${state.search}`;
  const { data: tableData, isLoading, refetch } = useKycListQuery(queryParams);
  const [updateKyc, { isLoading: isUpdating }] = useKycUpdateMutation(); // ← THIS WAS MISSING

  const kycList = tableData?.data?.kycs || [];
  const statusCounts = tableData?.data?.kycStatusCounts || [];
  const totalRecords = tableData?.data?.pagination?.total || 0;

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleSearch = (e) => {
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      setState((prev) => ({ ...prev, search: e.target.value, currentPage: 1 }));
    }, 800);
  };

  const handlePageChange = (page) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  };

  const handleView = (data) => {
    setSelectedData(data);
    setModals((prev) => ({ ...prev, view: true }));
  };

  const handleAction = (id, type) => {
    setActionId(id);
    setActionType(type);
    setModals((prev) => ({ ...prev, action: true }));
  };

  // ←←←← THIS IS THE FIXED FUNCTION — updation now works!
  const handleConfirmAction = async (id, type, reason = "") => {
    try {
      await updateKyc({
        id: id,
        status: type === "approve" ? "approve" : "reject",
        reason: type === "reject" ? reason : undefined,
      }).unwrap();

      toast.success(`KYC ${type === "approve" ? "approved" : "rejected"} successfully!`);
      refetch();
      setModals((prev) => ({ ...prev, action: false }));
    } catch (error) {
      toast.error(error?.data?.message || `Failed to ${type} KYC`);
    }
  };

  const ActionButtons = ({ data }) => {
    if (!data || data.status !== "open") {
      return (
        <button
          onClick={() => handleView(data)}
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          <Eye size={18} />
        </button>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleView(data)}
          className="text-blue-400 hover:text-blue-300 p-2"
        >
          <Eye size={18} />
        </button>
        <button
          onClick={() => handleAction(data._id, "approve")}
          className="w-9 h-9 rounded-lg bg-[#b9fd5c]/10 text-[#b9fd5c] hover:bg-[#b9fd5c]/20 
                     flex items-center justify-center transition-all font-bold"
        >
          ✓
        </button>
        <button
          onClick={() => handleAction(data._id, "reject")}
          className="w-9 h-9 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 
                     flex items-center justify-center transition-all font-bold"
        >
          ✕
        </button>
      </div>
    );
  };
const statusConfig = {
  open: {
    title: "Pending",
    icon: <Clock className="w-6 h-6 text-yellow-400" />,
    valueClass: "text-yellow-400",
  },
  approve: {
    title: "Approved",
    icon: <CheckCircle className="w-6 h-6 text-[#b9fd5c]" />,
    valueClass: "text-[#b9fd5c]",
  },
  reject: {
    title: "Rejected",
    icon: <XCircle className="w-6 h-6 text-red-400" />,
    valueClass: "text-red-400",
  },
  in_progress: {
    title: "In Progress",
    icon: <Loader className="w-6 h-6 text-blue-400" />,
    valueClass: "text-blue-400",
  },
};
  const columns = [
    {
      header: "S.No",
      render: (_, index) =>
        (state.currentPage - 1) * state.perPage + index + 1 + ".",
    },
    { header: "User ID", render: (row) => row.user_id?.username || "N/A" },
    { header: "Name", accessor: "name" },
    { header: "Bank Name", accessor: "bank_name" },
    { header: "Bank Account", accessor: "bank_account" },
    {
  header: "Address",
  render: (row) => (
    <span
      className="truncate text-left block"
      title={row.address}
    >
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
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
            ${row.status === "approve" ? "bg-[#b9fd5c]/10 text-[#b9fd5c]" :
              row.status === "reject" ? "bg-red-500/10 text-red-400" :
              row.status === "open" ? "bg-yellow-500/10 text-yellow-400" :
              "bg-blue-500/10 text-blue-400"
            }`}
        >
          {row.status === "open" ? "In Open" :
           row.status === "approve" ? "Approved" :
           row.status === "inprogress" ? "In Progress" :
           row.status === "reject" ? "Rejected" : "N/A"}
        </span>
      ),
    },
    { header: "UPI ID", render: (row) => row.upi_id || "N/A" },
    { header: "Action", render: (row) => <ActionButtons data={row} /> },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Stats */}
      {statusCounts.length > 0 && (
       <div className="grid gap-4 w-full 
                  grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
  {statusCounts.map((item) => {
    const config = statusConfig[item._id] || statusConfig.in_progress;
    return (
      <StatCard
        key={item._id}
        title={config.title}
        value={item.count}
        valueClass={config.valueClass}
        icon={config.icon}
      />
    );
  })}
</div>
      )}

      {/* Table */}
      <div className="bg-[#282f35] rounded-2xl overflow-hidden border border-[#2a2c2f]">
        <div className="px-5 py-4 border-b border-[#2a2c2f] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white">KYC Requests</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <PerPageSelector
              options={[10, 20, 40, 60, 80, 100]}
              onChange={(v) => setState(prev => ({ ...prev, perPage: v, currentPage: 1 }))}
            />
            <SearchBar onSearch={handleSearch} placeholder="Search user..." />
          </div>
        </div>

        <Table
          columns={columns}
          data={kycList}
          isLoading={isLoading || isUpdating}
          currentPage={state.currentPage}
          perPage={state.perPage}
        />

        {kycList.length > 0 && (
          <Pagination
            currentPage={state.currentPage}
            totalPages={Math.ceil(totalRecords / state.perPage)}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <KycViewModal isOpen={modals.view} onClose={() => setModals(prev => ({ ...prev, view: false }))} data={selectedData} />
      <KycActionModal
        isOpen={modals.action}
        onClose={() => setModals(prev => ({ ...prev, action: false }))}
        type={actionType}
        id={actionId}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
};

export default KycApprove;