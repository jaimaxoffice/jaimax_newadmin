import React, { useState, useEffect } from "react";
import Table from "../../reusableComponents/Tables/Table";
import Pagination from "../../reusableComponents/paginations/Pagination";
import StatCard from "../../reusableComponents/StatCards/StatsCard";
import WalletActionModal from "./WalletActionModal";
import EditTransactionModal from "./EditTransactionModal";
import {
  useTransAmountUpdateMutation,
  useTransListQuery,
} from "./walletApiSlice";
import { useToast } from "../../reusableComponents/Toasts/ToastContext";
import { PencilLine } from "lucide-react";
import SearchBar from "../../reusableComponents/searchBar/SearchBar";
import PerPageSelector from "../../reusableComponents/Filter/PerPageSelector";
import { formatDateWithAmPm } from "../../utils/dateUtils";
import useTableState from "../../hooks/useTableState";
import { Clock, CheckCircle2, PauseCircle, XCircle } from "lucide-react";

const WalletApprove = () => {
  const toast = useToast();

  const {
    state,
    setState,
    selectedStatus,
    handlePageChange,
    handleStatusChange,
  } = useTableState({
    initialPerPage: 10,
    initialStatus: "Transaction Type",
    searchDelay: 1000,
  });

  const [selectedData, setSelectedData] = useState(null);
  const [modals, setModals] = useState({ action: false, edit: false });
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
      await updateTransaction(payload).unwrap();
      toast.success("Transaction updated successfully");
      setModals((prev) => ({ ...prev, edit: false }));
      refetch();
    } catch (error) {
      toast.error(
        "Failed to update transaction",
        error?.data?.message || "Something went wrong",
      );
    }
  };

  const getCurrency = (countryCode, value) => {
    return countryCode === 91
      ? `₹${value?.toFixed(2)}`
      : `$${value?.toFixed(2)}`;
  };

  const getStatusStyle = (status) => {
    const map = {
      Completed: "text-[#0ecb6f]",
      Pending: "text-yellow-400",
      Hold: "text-blue-400",
      Failed: "text-red-400",
    };
    return map[status] || "bg-[#2a2c2f] text-[#8a8d93]";
  };

  const ActionButtons = ({ data }) => {
    if (
      data.transactionStatus === "Completed" ||
      data.transactionStatus === "Failed"
    ) {
      return <span className="text-xs text-[#fff]">N/A</span>;
    }

    return (
      <div className="flex items-center gap-5">
        <button
          onClick={() => handleAction(data.transactionId, "Approve")}
          title="Approve"
          className="w-8 h-8 flex items-center justify-center rounded-lg 
            bg-[#b9fd5c]/10 text-[#b9fd5c] hover:bg-[#b9fd5c]/20 
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
          className="w-8 h-8 flex items-center justify-center rounded-lg 
            bg-green-500/10 text-blue-500 transition-colors cursor-pointer text-sm font-bold"
        >
          <PencilLine size={15} />
        </button>
      </div>
    );
  };

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
            className="text-blue-500 hover:underline text-xs"
          >
            {row.transactionId}
          </a>
        ) : (
          <span className="text-xs">{row.transactionId}</span>
        ),
    },
    {
      header: "Transaction Date",
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
      render: (row) => <span>{row.reason || "N/A"}</span>,
    },
    {
      header: "Action",
      render: (row) => (row ? <ActionButtons data={row} /> : "N/A"),
    },
  ];

  return (
    <>
      <div className="p-2 sm:p-2 space-y-6 sidebar-scroll">
{statusCounts && (
  <div className="grid gap-4 w-full 
                  grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
    <StatCard
      title="Pending"
      value={statusCounts.Pending || 0}
      icon={Clock}
      variant="pending"
    />
    <StatCard
      title="Completed"
      value={statusCounts.Completed || 0}
      icon={CheckCircle2}
      variant="completed"
    />
    <StatCard
      title="Hold"
      value={statusCounts.Hold || 0}
      icon={PauseCircle}
      variant="hold"
    />
    <StatCard
      title="Failed"
      value={statusCounts.Failed || 0}
      icon={XCircle}
      variant="failed"
    />
  </div>
)}

        <div className="bg-[#282f35] rounded-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex w-full">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto ml-auto">
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
                <select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl 
                    py-2.5 px-3 text-sm focus:outline-none focus:border-[#b9fd5c] 
                    transition-colors cursor-pointer"
                >
                  <option value="Transaction Type">All Types</option>
                  <option value="Credit">Credit</option>
                  <option value="Debit">Debit</option>
                </select>
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

          <Table
            columns={columns}
            data={transactions}
            isLoading={isLoading}
            currentPage={state.currentPage}
            perPage={state.perPage}
            noDataTitle="No Transactions Found"
            noDataMessage="You haven't made any transactions yet."
            noDataIcon="search"
          />
        </div>

        {transactions?.length > 0 && (
          <Pagination
            currentPage={state.currentPage}
            totalPages={Math.ceil(totalRecords / state.perPage) || 1}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* ✅ Modal handles its own API call using useTransUpdateMutation */}
      <WalletActionModal
        isOpen={modals.action}
        onClose={() => setModals((prev) => ({ ...prev, action: false }))}
        type={actionType}
        id={actionId}
        refetch={refetch}
      />

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
