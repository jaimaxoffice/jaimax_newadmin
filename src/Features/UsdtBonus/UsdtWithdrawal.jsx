// src/features/usdtBonus/UsdtBonusList.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import Table from "../../reusableComponents/Tables/Table";
import StatCard from "../../reusableComponents/StatCards/StatsCard";
import Pagination from "../../reusableComponents/paginations/Pagination";
import SearchBar from "../../reusableComponents/searchBar/SearchBar";
import Loader from "../../reusableComponents/Loader/Loader";
import PerPageSelector from "../../reusableComponents/Filter/PerPageSelector";
import { formatDateWithAmPm } from "../../utils/dateUtils";
import { useGetUsdtBonusListQuery } from "./usdtwithdrawalApiSlice";
import {
  CheckCircle,
  XCircle,
  Wallet,
  Clock,
  Copy,
  Check,
  X
} from "lucide-react";

const UsdtBonusList = () => {
  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
  });

  const [selectedType, setSelectedType] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [copied, setCopied] = useState(false);
  const [detailModal, setDetailModal] = useState({
    show: false,
    title: "",
    content: "",
  });
  const searchTimeoutRef = useRef(null);

  const queryParams = {
    page: state.currentPage,
    limit: state.perPage,
    username: state.search,
    type: selectedType,
  };

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetUsdtBonusListQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  // ─── Data Processing ────────────────────────────────────────

  const TableData = response?.data?.withdrawList || [];
  const totalRecords = response?.data?.total || 0;
  const totalPages = response?.data?.totalPages || 1;

  // Stats
  const totalPending = useMemo(
    () => TableData.filter((req) => req.status === 0).length,
    [TableData],
  );
  const totalApproved = useMemo(
    () => TableData.filter((req) => req.status === 1).length,
    [TableData],
  );
  const totalRejected = useMemo(
    () => TableData.filter((req) => req.status === 2).length,
    [TableData],
  );
  const totalUsdtAmount = useMemo(
    () =>
      TableData.reduce(
        (sum, item) => sum + getDecimalValue(item?.amount_in_token),
        0,
      ),
    [TableData],
  );

  // ─── Handlers ────────────────────────────────────────────────

  const handlePageChange = useCallback((page) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  }, []);

  const handlePerPageChange = useCallback((value) => {
    setState((prev) => ({
      ...prev,
      perPage: value,
      currentPage: 1,
    }));
  }, []);

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setIsSearching(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, search: value, currentPage: 1 }));
      setIsSearching(false);
    }, 600);
  }, []);

  const handleTypeChange = useCallback((e) => {
    const value = e.target.value;
    setSelectedType(value);
    setState((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const openDetailModal = useCallback((title, content) => {
    setDetailModal({ show: true, title, content });
    setCopied(false);
  }, []);

  const closeDetailModal = useCallback(() => {
    setDetailModal({ show: false, title: "", content: "" });
    setCopied(false);
  }, []);

  const handleCopy = useCallback(() => {
    if (detailModal.content && 
        detailModal.content !== "No wallet address available." && 
        detailModal.content !== "No note available." &&
        detailModal.content !== "No transaction hash available.") {
      navigator.clipboard.writeText(detailModal.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [detailModal.content]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  // ─── Helper Functions ────────────────────────────────────────

  const formatCurrency = (amount, currency = "USDT") => {
    if (amount === null || amount === undefined) return `0.00 ${currency}`;
    return `${parseFloat(amount).toFixed(2)} ${currency}`;
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 1:
        return {
          label: "Approved",
          class: "bg-[#0ecb6f]/10 text-[#0ecb6f]",
        };
      case 2:
        return {
          label: "Rejected",
          class: "bg-red-500/10 text-red-400",
        };
      default:
        return {
          label: "Pending",
          class: "bg-yellow-500/10 text-yellow-400",
        };
    }
  };

  // ─── Error State ─────────────────────────────────────────────

  if (isError) {
    const errorMessage =
      error?.status === 524
        ? "The request timed out. This might be due to a large dataset."
        : error?.status === 500
          ? "Server error. Please try again later."
          : error?.data?.message || "Something went wrong. Please try again.";

    return (
      <div className="p-2 sm:p-2 space-y-6">
        <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
            <h1 className="text-lg font-semibold text-white">
              USDT Bonus Withdrawals
            </h1>
          </div>

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
                           bg-[#b9fd5c] text-[#111214] hover:bg-[#a8ec4c]
                           transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
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
    );
  }

  // ─── Table Columns ───────────────────────────────────────────

  const columns = [
    {
      header: "S.No",
      render: (_, index) =>
        `${(state.currentPage - 1) * state.perPage + index + 1}.`,
    },
    {
      header: "Customer Name",
      render: (row) => (
        <span className="text-white font-medium">
          {row?.userId?.name || "N/A"}
        </span>
      ),
    },
    {
      header: "Transaction ID",
      render: (row) => (
        <span
          className="text-xs text-[#ffff] font-mono cursor-pointer hover:text-[#b9fd5c] transition-colors"
          title={row?._id}
          onClick={() => openDetailModal("Transaction ID", row?._id || "N/A")}
        >
          {row?._id ? `${row._id}` : "N/A"}
        </span>
      ),
    },
    {
      header: "Customer ID",
      render: (row) => (
        <span className="text-xs text-[#ffff]">
          {row?.userId?.username || "N/A"}
        </span>
      ),
    },
    {
      header: "Currency",
      render: (row) => (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full ">
          {row?.currency || "USDT"}
        </span>
      ),
    },
    {
      header: "UTR Number",
      render: (row) => (
        <span className="text-xs">{row?.utr_number || "N/A"}</span>
      ),
    },
    {
      header: "Amount (USDT)",
      render: (row) => (
        <span className="text-[#fff]  text-xs">
          {formatCurrency(getDecimalValue(row?.amount_in_token), row?.currency || "USDT")}
        </span>
      ),
    },
    {
      header: "Admin Fee",
      render: (row) => (
        <span className=" text-xs">
          {formatCurrency(getDecimalValue(row?.admin_fee_token), row?.currency || "USDT")}
        </span>
      ),
    },
    {
      header: "Final Amount",
      render: (row) => (
        <span className="  text-xs">
          {formatCurrency(getDecimalValue(row?.senttoken), row?.currency || "USDT")}
        </span>
      ),
    },
        {
  header: "Balance Before",
  render: (row) => {
    const value = row?.balance_before?.$numberDecimal
      ? parseFloat(row.balance_before.$numberDecimal)
      : 0;

    return (
      <span className="text-white text-xs">
        ₹{value.toFixed(2)}
      </span>
    );
  },
},
    {
  header: "Balance After",
  render: (row) => {
    const value = row?.balance_after?.$numberDecimal
      ? parseFloat(row.balance_after.$numberDecimal)
      : 0;

    return (
      <span className="text-white text-xs">
        ₹{value.toFixed(2)}
      </span>
    );
  },
},
    {
      header: "Withdrawal Amount",
      render: (row) => (
        <span className="text-white text-xs">
          ₹{row?.amount_in_inr?.toFixed(2) || "0.00"}
        </span>
      ),
    },

    {
      header: "Date & Time",
      render: (row) => (
        <span className="text-xs">{formatDateWithAmPm(row?.created_at)}</span>
      ),
    },
    {
      header: "Status",
      render: (row) => {
        const status = getStatusInfo(row?.status);
        return (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${status.class}`}>
            {status.label}
          </span>
        );
      },
    },
    {
      header: "Wallet Address",
      render: (row) => (
        <button
          onClick={() =>
            openDetailModal(
              "Wallet Address",
              row?.walletAddress || "No wallet address available."
            )
          }
          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg
                     bg-[#b9fd5c]/10 text-[#b9fd5c] border border-[#b9fd5c]/20
                     hover:bg-[#b9fd5c]/20 hover:border-[#b9fd5c]/40
                     transition-all duration-200 cursor-pointer"
        >
          View
        </button>
      ),
    },
    {
      header: "TXN Hash",
      render: (row) => (
        <button
          onClick={() =>
            openDetailModal("Transaction Hash", row?.txn_hash || "No transaction hash available.")
          }
          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg
                     bg-purple-500/10 text-purple-400 border border-purple-500/20
                     hover:bg-purple-500/20 hover:border-purple-500/40
                     transition-all duration-200 cursor-pointer"
        >
          View
        </button>
      ),
    },
    {
      header: "Note",
      render: (row) => (
        <button
          onClick={() =>
            openDetailModal("Note", row?.note || "No note available.")
          }
          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg
                     bg-blue-500/10 text-blue-400 border border-blue-500/20
                     hover:bg-blue-500/20 hover:border-blue-500/40
                     transition-all duration-200 cursor-pointer"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div className="p-2 sm:p-2 space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending"
          value={totalPending}
          icon={Clock}
          status="pending"
        />
        <StatCard
          title="Approved"
          value={totalApproved}
          icon={CheckCircle}
          status="approved"
        />
        <StatCard
          title="Rejected"
          value={totalRejected}
          icon={XCircle}
          status="rejected"
        />
        <StatCard
          title="Total USDT"
          value={`${totalUsdtAmount.toFixed(4)} `}
          icon={Wallet}
        />
      </div>

      {/* Fetching Indicator */}
      {isFetching && !isLoading && <Loader />}

      {/* Main Table Card */}
      <div className="bg-[#282f35] border border-[#2a2c2f] rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">
              USDT Withdrawals
            </h2>
            
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <PerPageSelector
                options={[10, 20, 40, 60, 80, 100]}
                onChange={handlePerPageChange}
              />

              {/* Status Filter */}
              <select
                onChange={handleTypeChange}
                value={selectedType}
                disabled={isLoading}
                className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
                     py-2.5 px-3 text-sm focus:outline-none focus:border-[#b9fd5c]
                     transition-colors cursor-pointer disabled:opacity-50"
              >
                <option value="">All Status</option>
                <option value="0">Pending</option>
                <option value="1">Approved</option>
                <option value="2">Rejected</option>
              </select>

              <SearchBar
                onSearch={handleSearch}
                placeholder={isSearching ? "Searching..." : "Search username..."}
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg">
          <Table
            columns={columns}
            data={TableData}
            isLoading={isLoading}
            currentPage={state.currentPage}
            perPage={state.perPage}
            noDataTitle="No Transactions Found"
            noDataMessage="No withdrawal transactions available."
            noDataIcon="search"
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

      {/* Simple Detail Modal */}
      {detailModal.show && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeDetailModal}
        >
          <div 
            className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-2xl max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2c2f]">
              <h3 className="text-base font-semibold text-white">
                {detailModal.title}
              </h3>
              <button
                onClick={closeDetailModal}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-4">
              <div className="relative bg-[#111214] border border-[#2a2c2f] rounded-lg p-4">
                <p className="text-sm text-gray-300 break-all leading-relaxed">
                  {detailModal.content}
                </p>
              </div>

              {/* Copy Button */}
              {detailModal.content && 
               detailModal.content !== "No wallet address available." && 
               detailModal.content !== "No note available." &&
               detailModal.content !== "No transaction hash available." && (
                <button
                  onClick={handleCopy}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5
                             rounded-xl text-sm font-medium bg-[#111214] border border-[#2a2c2f]
                             text-[#8a8d93] hover:text-white hover:border-[#3a3c3f]
                             transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy to Clipboard
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-[#2a2c2f]">
              <button
                onClick={closeDetailModal}
                className="w-full bg-[#b9fd5c] hover:bg-[#b9fd5c]/90 text-[#111214] font-semibold py-2.5 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsdtBonusList;

// ─── Helper Functions ────────────────────────────────────────────

function getDecimalValue(field) {
  if (!field) return 0;
  if (typeof field === "object" && field.$numberDecimal) {
    return parseFloat(field.$numberDecimal);
  }
  return parseFloat(field) || 0;
}