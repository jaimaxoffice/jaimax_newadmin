// src/features/withdrawal/Withdrawal.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Table from "../../reusableComponents/Tables/Table";
import Pagination from "../../reusableComponents/paginations/Pagination";
import StatCard from "../../reusableComponents/StatCards/StatsCard";
import DetailModal from "../../reusableComponents/Modals/DetailModal";
import UTRModal from "../../reusableComponents/Modals/UTRModal";
import ConfirmModal from "../../reusableComponents/Modals/ConfirmModal";
import {
  useGetWithdrawListQuery,
  useWithdrawApprovalMutation,
} from "./withdrawalApiSlice";
import { formatDateWithAmPm, formatCurrency } from "../../utils/dateUtils";
import SearchBar from "../../reusableComponents/searchBar/SearchBar";
import { Eye,Clock, CheckCircle2,XCircle} from "lucide-react";
import PerPageSelector from "../../reusableComponents/Filter/PerPageSelector";
const Withdrawal = () => {
  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
  });

  const [selectedStatus, setSelectedStatus] = useState("Select Status");
  const [selectedWithdrawId, setSelectedWithdrawId] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [allRequests, setAllRequests] = useState([]);
  const [utrNumber, setUtrNumber] = useState("");

  const [modals, setModals] = useState({
    utr: false,
    reject: false,
    detail: false,
  });

  const [detailData, setDetailData] = useState({
    title: "",
    content: "",
  });

  // API
  const queryParams = `limit=${state.perPage}&page=${state.currentPage}&search=${state.search}&status=${
    selectedStatus === "Select Status" ? "" : selectedStatus
  }`;

  const {
    data: getWithdrawList,
    isLoading,
    refetch,
  } = useGetWithdrawListQuery(queryParams);

  const [withdrawApprovalAmount] = useWithdrawApprovalMutation();
  const transactions = getWithdrawList?.data?.withdrawRequests || [];
  const totalRecords = getWithdrawList?.data?.pagination?.total || 0;

  useEffect(() => {
    if (getWithdrawList?.data?.withdrawRequests) {
      setAllRequests(getWithdrawList.data.withdrawRequests);
    }
  }, [getWithdrawList]);

  useEffect(() => {
    refetch();
    if (refresh) {
      refetch();
      setRefresh(false);
    }
  }, [refresh, refetch]);

  // Counts
  const totalPending = allRequests.filter((r) => r.status === 0).length;
  const totalApproved = allRequests.filter((r) => r.status === 1).length;
  const totalRejected = allRequests.filter((r) => r.status === 2).length;

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
      setState((prev) => ({
        ...prev,
        search: e.target.value,
        currentPage: 1,
      }));
    }, 1000);
  };

  const handleApproveClick = (withdrawId) => {
    setSelectedWithdrawId(withdrawId);
    setUtrNumber("");
    setModals((prev) => ({ ...prev, utr: true }));
  };

  const handleRejectClick = (withdrawId) => {
    setSelectedWithdrawId(withdrawId);
    setModals((prev) => ({ ...prev, reject: true }));
  };

  const handleApprove = async () => {
    if (!utrNumber?.trim()) {
      toast.error("Please enter UTR number before approving", {
        position: "top-center",
      });
      return;
    }

    try {
      await withdrawApprovalAmount({
        isApproved: 1,
        withraw_id: [selectedWithdrawId],
        utr_number: utrNumber.toUpperCase(),
      }).unwrap();

      toast.success("Withdrawal approved and UTR updated successfully", {
        position: "top-center",
      });
      setModals((prev) => ({ ...prev, utr: false }));
      setUtrNumber("");
      setRefresh(true);
    } catch (error) {
      toast.error(
        error?.data?.isApproved?.message || "Failed to approve withdrawal",
        { position: "top-center" },
      );
    }
  };

  const handleReject = async (reason, setReason) => {
    try {
      await withdrawApprovalAmount({
        isApproved: 0,
        withraw_id: [selectedWithdrawId],
        reason,
      }).unwrap();

      toast.success("Withdrawal rejected successfully", {
        position: "top-center",
      });
      setModals((prev) => ({ ...prev, reject: false }));
      setRefresh(true);
      setReason("");
    } catch (error) {
      toast.error("Failed to reject withdrawal", { position: "top-center" });
    }
  };

  const showBankDetails = (data) => {
    setDetailData({
      title: "Bank Details",
      content: `Bank Name: ${
        data.bankDetails?.bank_name || "N/A"
      }\nAccount No: ${
        data.bankDetails?.bank_account || "N/A"
      }\nIFSC Code: ${data.bankDetails?.ifsc_code || "N/A"}`,
    });
    setModals((prev) => ({ ...prev, detail: true }));
  };

  const showNote = (data) => {
    setDetailData({
      title: "Note",
      content: data.note || "No note available.",
    });
    setModals((prev) => ({ ...prev, detail: true }));
  };

  // Status Helpers
  const getStatusLabel = (status) => {
    const map = { 0: "Pending", 1: "Approved", 2: "Rejected" };
    return map[status] || "Failed";
  };

  const getStatusStyle = (status) => {
    const map = {
      0: " text-yellow-400",
      1: " text-[#0ecb6f]",
      2: " text-red-400",
    };
    return map[status] || "bg-[#2a2c2f] text-[#8a8d93]";
  };
  const ViewBtn = ({ onClick, label = "View" }) => (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-xs font-semibold rounded-lg
         text-[#ffffff] hover:bg-[#b9fd5c]/20
        transition-colors cursor-pointer"
    >
      <Eye size={17} />
    </button>
  );

  const WithdrawalActions = ({ data }) => {
    if (data.status !== 0) {
      return <span className="text-xs text-[#555]">—</span>;
    }

    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => handleApproveClick(data._id)}
          title="Approve"
          className="w-8 h-8 flex items-center justify-center rounded-lg
            bg-[#b9fd5c]/10 text-green-400 hover:bg-[#b9fd5c]/20
            transition-colors cursor-pointer text-sm font-bold"
        >
          ✓
        </button>
        <button
          onClick={() => handleRejectClick(data._id)}
          title="Reject"
          className="w-8 h-8 flex items-center justify-center rounded-lg
            bg-red-500/10 text-red-400 hover:bg-red-500/20
            transition-colors cursor-pointer text-sm font-bold"
        >
          ✕
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
    {
      header: "Customer Name",
      render: (row) => row?.userId?.name || "—",
    },
    {
      header: "Transaction Id",
      render: (row) => <span className=" ">{row?._id || "—"}</span>,
    },
    {
      header: "Customer Id",
      render: (row) => row?.userId?.username || "—",
    },
    {
      header: "Currency Type",
      accessor: "currency",
    },
    {
      header: "UTR Number",
      render: (row) => <span>{row.utr_number || "N/A"}</span>,
    },
    {
      header: "Withdrawal Amount",
      render: (row) => formatCurrency(row.amount, row.currency),
    },
    {
      header: "Admin Charges",
      render: (row) => formatCurrency(row.admin_inr_charges, row.currency),
    },
    {
      header: "Final Amount",
      render: (row) => (
        <span className="font-semibold text-white">
          {formatCurrency(
            row.amount - row.admin_inr_charges || 0,
            row.currency,
          )}
        </span>
      ),
    },
    {
      header: "Date",
      render: (row) => (
        <span className="text-xs">{formatDateWithAmPm(row?.created_at)}</span>
      ),
    },
    {
      header: "Status",
      render: (row) => (
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${getStatusStyle(
            row.status,
          )}`}
        >
          {getStatusLabel(row.status)}
        </span>
      ),
    },
    {
      header: "Bank Details",
      render: (row) => <ViewBtn onClick={() => showBankDetails(row)} />,
    },
    {
      header: "Note",
      render: (row) => <ViewBtn onClick={() => showNote(row)} />,
    },
    {
      header: "Action",
      render: (row) => <WithdrawalActions data={row} />,
    },
  ];

  return (
    <>
      <div className="p-2 sm:p-2 space-y-6">
<div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
  <StatCard
    title="Pending"
    value={totalPending}
    icon={Clock}
    status="pending"
  />

  <StatCard
    title="Approved"
    value={totalApproved}
    icon={CheckCircle2}
    status="approved"
  />

  <StatCard
    title="Rejected"
    value={totalRejected}
    icon={XCircle}
    status="rejected"
  />
</div>

        {/* Table Section */}
        <div className="bg-[#282f35]  rounded-lg  overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-[#282f35]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex w-full">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto ml-auto">
                  {/* Per Page */}
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

                  {/* Status Filter */}
                  <select
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
                py-2.5 px-3 text-sm focus:outline-none focus:border-[#b9fd5c]
                transition-colors cursor-pointer"
                  >
                    <option value="Select Status">All Status</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <SearchBar
                    onSearch={handleSearch}
                    placeholder="Search with tnx id,username,amount"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="">
            <Table
              columns={columns}
              data={transactions}
              isLoading={isLoading}
              currentPage={state.currentPage}
              perPage={state.perPage}
            />
          </div>
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

      {/* UTR Modal */}
      <UTRModal
        show={modals.utr}
        onClose={() => {
          setModals((prev) => ({ ...prev, utr: false }));
          setUtrNumber("");
        }}
        utrNumber={utrNumber}
        setUtrNumber={setUtrNumber}
        onSubmit={handleApprove}
      />

      {/* Reject Modal */}
      <ConfirmModal
        show={modals.reject}
        onClose={() => setModals((prev) => ({ ...prev, reject: false }))}
        onConfirm={handleReject}
        title="Reject Withdrawal"
        message="Are you sure you want to reject this withdrawal request?"
        confirmText="Reject"
        cancelText="Cancel"
        type="danger"
        showReasonInput={true}
      />

      {/* Detail Modal */}
      <DetailModal
        show={modals.detail}
        title={detailData.title}
        content={detailData.content}
        onClose={() => setModals((prev) => ({ ...prev, detail: false }))}
      />
    </>
  );
};

export default Withdrawal;
