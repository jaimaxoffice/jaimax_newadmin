// src/features/wallet/WalletApprove.jsx
import React, { useState, useEffect } from "react";
import Table from "../../reusableComponents/Tables/Table";
import Pagination from "../../reusableComponents/paginations/Pagination";
import StatCard from "../../reusableComponents/StatCards/StatsCard";
import MobileCard from "../../reusableComponents/MobileCards/MobileCards";
import MobileCardList from "../../reusableComponents/MobileCards/MobileCardList";
import WalletActionModal from "./WalletActionModal";
import EditTransactionModal from "./EditTransactionModal";
import {
  useTransAmountUpdateMutation,
  useTransListQuery,
} from "./walletApiSlice";
import { toast } from "react-toastify";
import { PencilLine } from "lucide-react";
import SearchBar from "../../reusableComponents/searchBar/SearchBar";
import { Clock, CheckCircle, PauseCircle, XCircle } from "lucide-react";
import PerPageSelector from "../../reusableComponents/Filter/PerPageSelector";
import { formatDateWithAmPm } from "../../utils/dateUtils";
const WalletApprove = () => {
  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
  });

  const [selectedStatus, setSelectedStatus] = useState("Transaction Type");
  const [selectedData, setSelectedData] = useState(null);

  const [modals, setModals] = useState({
    action: false,
    edit: false,
  });

  const [actionType, setActionType] = useState("");
  const [actionId, setActionId] = useState("");

  const [updateTransaction] = useTransAmountUpdateMutation();

  const queryParams = `limit=${state.perPage}&page=${state.currentPage}&search=${state.search}&transactionType=${
    selectedStatus === "Transaction Type" ? "" : selectedStatus
  }`;

  const {
    data: tableData,
    isLoading,
    refetch,
  } = useTransListQuery(queryParams);

  const transactions = tableData?.data?.transactions || [];
  const statusCounts = tableData?.data?.statusCounts;
  const totalRecords = tableData?.data?.total || 0;

  useEffect(() => {
    refetch();
  }, []);

  // Handlers
  const handlePageChange = (page) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setState((prev) => ({ ...prev, currentPage: 1 }));
  };

  let searchTimeout;
  const handleSearch = (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      setState((prev) => ({ ...prev, search: e.target.value, currentPage: 1 }));
    }, 1000);
  };

  const handleAction = (id, type) => {
    setActionId(id);
    setActionType(type);
    setModals((prev) => ({ ...prev, action: true }));
  };

  const handleEdit = (data) => {
    setSelectedData({ ...data });
    setModals((prev) => ({ ...prev, edit: true }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        transactionId: selectedData.transactionId,
        transactionAmount: parseFloat(selectedData.transactionAmount),
      };
      await updateTransaction(payload);
      toast.success("Transaction updated successfully", {
        position: "top-center",
      });
      setModals((prev) => ({ ...prev, edit: false }));
      refetch();
    } catch (error) {
      toast.error("Failed to update transaction");
    }
  };

  const handleApprove = async (id) => {
    try {
      // your approve API call here
      toast.success("Transaction approved", { position: "top-center" });
      refetch();
    } catch (error) {
      toast.error("Failed to approve");
    }
  };

  const handleHold = async (id) => {
    try {
      // your hold API call here
      toast.success("Transaction on hold", { position: "top-center" });
      refetch();
    } catch (error) {
      toast.error("Failed to hold");
    }
  };

  const handleReject = async (id, reason) => {
    try {
      // your reject API call here
      toast.success("Transaction rejected", { position: "top-center" });
      refetch();
    } catch (error) {
      toast.error("Failed to reject");
    }
  };

  const getCurrency = (countryCode, value) => {
    return countryCode === 91
      ? `₹${value?.toFixed(2)}`
      : `$${value?.toFixed(2)}`;
  };

  const getStatusStyle = (status) => {
    const map = {
      Completed: "bg-[#0ecb6f]/10 text-[#0ecb6f]",
      Pending: "bg-yellow-500/10 text-yellow-400",
      Hold: "bg-blue-500/10 text-blue-400",
      Failed: "bg-red-500/10 text-red-400",
    };
    return map[status] || "bg-[#2a2c2f] text-[#8a8d93]";
  };

  // Action Buttons Component
  const ActionButtons = ({ data }) => {
    if (
      data.transactionStatus === "Completed" ||
      data.transactionStatus === "Failed"
    ) {
      return <span className="text-xs text-[#555]">—</span>;
    }

    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => handleAction(data.transactionId, "Approve")}
          title="Approve"
          className="w-8 h-8 flex items-center justify-center rounded-lg 
            bg-[#eb660f]/10 text-[#eb660f] hover:bg-[#eb660f]/20 
            transition-colors cursor-pointer text-sm font-bold"
        >
          ✓
        </button>

        {data.transactionStatus !== "Hold" && (
          <button
            onClick={() => handleAction(data.transactionId, "Hold")}
            title="Hold"
            className="w-8 h-8 flex items-center justify-center rounded-lg 
              bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 
              transition-colors cursor-pointer text-sm font-bold"
          >
            ⏸
          </button>
        )}

        <button
          onClick={() => handleAction(data.transactionId, "Reject")}
          title="Reject"
          className="w-8 h-8 flex items-center justify-center rounded-lg 
            bg-red-500/10 text-red-400 hover:bg-red-500/20 
            transition-colors cursor-pointer text-sm font-bold"
        >
          ✕
        </button>

        <button
          onClick={() => handleEdit(data)}
          title="Edit"
          className=" w-8 h-8  items-center justify-center rounded-lg  bg-green-500/10 text-blue-500 transition-colors cursor-pointer text-sm font-bold"
        >
          <PencilLine size={15} />
        </button>
      </div>
    );
  };

  // Desktop Table Columns
  const columns = [
    {
      header: "S.No",
      render: (_, index, currentPage, perPage) =>
        currentPage * perPage - (perPage - 1) + index + ".",
    },
    { header: "Name", accessor: "name" },
    { header: "Payment Method", accessor: "paymentMode" },
    { header: "Transaction Type", accessor: "transactionType" },
    {
      header: "Transaction Amount",
      render: (row) =>
        getCurrency(row.userId?.countryCode, row.transactionAmount),
    },
    {
      header: "Transaction ID",
      render: (row) =>
        row.screenshotUrl ? (
          <a
            href={row.screenshotUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-800 hover:underline text-xs"
          >
            {row.transactionId}
          </a>
        ) : (
          <span className="text-xs">{row.transactionId}</span>
        ),
    },
    {
      header: "Transaction  Date",
      render: (row) => formatDateWithAmPm(row.transactionDate),
    },
    {
      header: "Updated By",
      render: (row) => row.updatedBy?.name || "N/A",
    },
    {
      header: "Status",
      render: (row) => (
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full text-center ${getStatusStyle(row.transactionStatus)}`}
        >
          {row.transactionStatus}
        </span>
      ),
    },
    {
      header: "Reason",
      render: (row) => <span className="">{row.reason || "N/A"}</span>,
    },
    {
      header: "Action",
      render: (row) => <ActionButtons data={row} />,
    },
  ];

  return (
    <>
      <div className="p-2 sm:p-2 space-y-6">
        {statusCounts && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Pending"
              value={statusCounts.Pending || 0}
              valueClass=""
              bgClass="bg-[#544a24]"
              icon={<Clock size={25} strokeWidth={2} className="text-white" />}
              // iconBg="bg-yellow-500/20"
            />
            <StatCard
              title="Completed"
              value={statusCounts.Completed || 0}
              valueClass=""
              bgClass="bg-[#1a3c37]"
              icon={
                <CheckCircle size={25} strokeWidth={2} className="text-white" />
              }
              // iconBg="bg-green-500/20"
            />
            <StatCard
              title="Hold"
              value={statusCounts.Hold || 0}
              valueClass=""
              bgClass="bg-[#174d5e]"
              icon={
                <PauseCircle size={25} strokeWidth={2} className="text-white" />
              }
              // iconBg="bg-blue-500/20"
            />
            <StatCard
              title="Failed"
              value={statusCounts.Failed || 0}
              valueClass=""
              bgClass="bg-[#4b2733]"
              icon={
                <XCircle size={25} strokeWidth={2} className="text-white" />
              }
              // iconBg="bg-red-500/20"
            />
          </div>
        )}
        {/* Table Section */}
        <div className="bg-[#1b232d] border border-[#303f50] rounded-lg overflow-hidden ">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-[#1b232d]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex w-full">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto ml-auto">
                  {/* Per Page */}

                  <PerPageSelector
                    options={[5, 15, 25, 50, 100]}
                    onChange={(value) =>
                      setState((prev) => ({
                        ...prev,
                        perPage: value,
                        currentPage: 1,
                      }))
                    }
                  />
                  {/* Transaction Type Filter */}
                  <select
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl 
              py-2.5 px-3 text-sm focus:outline-none focus:border-[#eb660f] 
              transition-colors cursor-pointer"
                  >
                    <option value="Transaction Type">All Types</option>
                    <option value="Credit">Credit</option>
                    <option value="Debit">Debit</option>
                  </select>

                  {/* Search */}
                  <SearchBar
                    onSearch={(e) => {
                      clearTimeout(window._searchTimeout);
                      window._searchTimeout = setTimeout(() => {
                        setState((prev) => ({
                          ...prev,
                          search: e.target.value,
                          currentPage: 1,
                        }));
                      }, 1000);
                    }}
                    placeholder="Search..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className=" border border-[#303f50]">
            <Table
              columns={columns}
              data={transactions}
              isLoading={isLoading}
              currentPage={state.currentPage}
              perPage={state.perPage}
            />
          </div>

          {/* Mobile Cards */}
        </div>

        {/* Pagination */}
        {transactions?.length > 0 && (
          <Pagination
            currentPage={state.currentPage}
            totalPages={Math.ceil(totalRecords / state.perPage) || 1}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Action Modal (Approve/Hold/Reject) */}
      <WalletActionModal
        isOpen={modals.action}
        onClose={() => setModals((prev) => ({ ...prev, action: false }))}
        type={actionType}
        id={actionId}
        onApprove={handleApprove}
        onHold={handleHold}
        onReject={handleReject}
      />

      {/* Edit Modal */}
      <EditTransactionModal
        isOpen={modals.edit}
        onClose={() => setModals((prev) => ({ ...prev, edit: false }))}
        data={selectedData}
        onChange={handleEditChange}
        onUpdate={handleUpdate}
      />
    </>
  );
};

export default WalletApprove;
