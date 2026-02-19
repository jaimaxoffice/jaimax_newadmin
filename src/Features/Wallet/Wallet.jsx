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
import { toast } from "react-toastify";
import { PencilLine } from "lucide-react";
import SearchBar from "../../reusableComponents/searchBar/SearchBar";
import PerPageSelector from "../../reusableComponents/Filter/PerPageSelector";
import { formatDateWithAmPm } from "../../utils/dateUtils";
import useTableState from "../../hooks/useTableState";
import { Clock, CheckCircle2, PauseCircle, XCircle ,Check,Pause,X} from "lucide-react";
const WalletApprove = () => {
  const {
    state,
    setState,
    selectedStatus,
    handlePageChange,
    handleStatusChange,
    handleSearch,
    handlePerPageChange,
  } = useTableState({
    initialPerPage: 10,
    initialStatus: "Transaction Type",
    searchDelay: 1000,
  });

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
      Completed: " text-[#0ecb6f]",
      Pending: " text-yellow-400",
      Hold: " text-blue-400",
      Failed: " text-red-400",
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
  <Button
    onClick={() => handleAction(data.transactionId, "Approve")}
    title="Approve"
    variant="approve"
    size="sm"
  >
    <Check size={16} />
  </Button>

  {data.transactionStatus !== "Hold" && (
    <Button
      onClick={() => handleAction(data.transactionId, "Hold")}
      title="Hold"
      variant="hold"
      size="sm"
    >
      <Pause size={16} />
    </Button>
  )}

  <Button
    onClick={() => handleAction(data.transactionId, "Reject")}
    title="Reject"
    variant="reject"
    size="sm"
  >
    <X size={16} />
  </Button>

  <Button
    onClick={() => handleEdit(data)}
    title="Edit"
    variant="edit"
    size="sm"
  >
    <PencilLine size={15} />
  </Button>
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
            className="text-blue-500 hover:underline text-xs"
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
        {/* Table Section */}
        <div className="bg-[#282f35]  rounded-lg overflow-hidden ">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 ">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex w-full">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto ml-auto">
                  {/* Per Page */}

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
                  {/* Transaction Type Filter */}
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
          <div className=" ">
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
