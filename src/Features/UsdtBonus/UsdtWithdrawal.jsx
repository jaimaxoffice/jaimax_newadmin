// src/features/usdtBonus/UsdtBonusList.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import Table from "../../reusableComponents/Tables/Table";
import MobileCard from "../../reusableComponents/MobileCards/MobileCards";
import MobileCardList from "../../reusableComponents/MobileCards/MobileCardList";
import StatCard from "../../reusableComponents/StatCards/StatsCard";
import Pagination from "../../reusableComponents/paginations/Pagination";
import Modal from "../../reusableComponents/Modals/Modals";
import { useGetUsdtBonusListQuery } from "./usdtwithdrawalApiSlice";
import SearchBar from "../../reusableComponents/searchBar/SearchBar";
import Loader from "../../reusableComponents/Loader/Loader";
import PerPageSelector from "../../reusableComponents/Filter/PerPageSelector";
import { formatDateWithAmPm } from "../../utils/dateUtils";
import {
  Hourglass,
  CheckCircle,
  XCircle,
  Wallet,
  PencilIcon,
} from "lucide-react";

const UsdtBonusList = () => {
  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
  });

  const [selectedType, setSelectedType] = useState("");
  const [isSearching, setIsSearching] = useState(false);
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
    data: getUsdtBonusList,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetUsdtBonusListQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  // ─── Data Processing ────────────────────────────────────────

  const TableData = getUsdtBonusList?.data?.withdrawList || [];
  const totalRecords = getUsdtBonusList?.data?.total || 0;
  const totalPages = Math.ceil(totalRecords / state.perPage) || 1;

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

  const handlePerPageChange = useCallback((e) => {
    setState((prev) => ({
      ...prev,
      perPage: parseInt(e.target.value),
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
    setSelectedType(e.target.value);
    setState((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const openDetailModal = useCallback((title, content) => {
    setDetailModal({ show: true, title, content });
  }, []);

  const closeDetailModal = useCallback(() => {
    setDetailModal({ show: false, title: "", content: "" });
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

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
      <div>
        <div className="p-2 sm:p-2 space-y-6">
          <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* <div className="w-10 h-10 rounded-xl bg-[#b9fd5c]/10 flex items-center justify-center text-[#b9fd5c]"></div> */}
                  <h1 className="text-lg font-semibold text-white">
                    USDT Bonus Withdrawals
                  </h1>
                </div>
              </div>
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
                             bg-[#b9fd5c] text-white hover:bg-[#ff8533]
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
      </div>
    );
  }

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
          className="text-xs text-[#8a8d93] font-mono cursor-pointer hover:text-[#b9fd5c] transition-colors"
          title={row?._id}
        >
          {row?._id ? `${row._id.slice(0, 10)}...` : "N/A"}
        </span>
      ),
    },
    {
      header: "Customer ID",
      render: (row) => (
        <span className="text-xs text-[#8a8d93]">
          {row?.userId?.username || "N/A"}
        </span>
      ),
    },
    {
      header: "Currency",
      render: (row) => (
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full
                     bg-blue-500/10 text-blue-400"
        >
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
        <span className="text-[#0ecb6f] font-semibold text-sm">
          {formatCurrency(
            getDecimalValue(row?.amount_in_token),
            row?.currency || "USDT",
          )}
        </span>
      ),
    },
    {
      header: "Admin Fee",
      render: (row) => (
        <span className="text-yellow-400 text-xs">
          {formatCurrency(
            getDecimalValue(row?.admin_fee_token),
            row?.currency || "USDT",
          )}
        </span>
      ),
    },
    {
      header: "Final Amount",
      render: (row) => (
        <span className="text-blue-400 font-semibold text-sm">
          {formatCurrency(
            getDecimalValue(row?.senttoken),
            row?.currency || "USDT",
          )}
        </span>
      ),
    },
    {
      header: "INR Value",
      render: (row) => (
        <span className="text-white text-sm">
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
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${status.class}`}
          >
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
              row?.walletAddress || "No wallet address available.",
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
    <div>
      <div className="p-2 sm:p-2 space-y-6">
        {/* Top Controls */}
        {/* Stat Cards */}
        {/* USDT Withdrawal Stats */}
        // Inside your component return:
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Pending"
            value={totalPending}
            // numericValue={totalPending}
            icon={Hourglass}
            status="pending"
          />

          <StatCard
            title="Approved"
            value={totalApproved}
            // numericValue={totalApproved}
            icon={CheckCircle}
            status="approved"
          />

          <StatCard
            title="Rejected"
            value={totalRejected}
            // numericValue={totalRejected}
            icon={XCircle}
            status="rejected"
          />

          <StatCard
            title="Total USDT"
            value={totalUsdtAmount.toFixed(2)}
            // numericValue={Math.floor(totalUsdtAmount)}
            // suffix="USDT"
            icon={Wallet}
            // status="info"
            // customBgClass="bg-[#544a24]"
            // customIconColorClass="text-white"
          />
        </div>
        {/* Fetching Indicator */}
        {isFetching && !isLoading && <Loader />}
        {/* Main Table Card */}
        <div className="bg-[#282f35] border border-[#2a2c2f] rounded-lg  overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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

                  {/* Type Filter */}
                  <select
                    onChange={handleTypeChange}
                    value={selectedType}
                    disabled={isLoading}
                    className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
                         py-2.5 px-3 text-sm focus:outline-none focus:border-[#b9fd5c]
                         transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <option value="">All Types</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <SearchBar
                    onSearch={handleSearch}
                    placeholder={
                      isSearching ? "Searching..." : "Search username..."
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-lg ">
            <Table
              columns={columns}
              data={TableData}
              isLoading={isLoading}
              currentPage={state.currentPage}
              perPage={state.perPage}
              noDataTitle="No Transactions Found"
              noDataMessage="You didn't got any transactions yet."
              noDataIcon="search"
            />
          </div>
        </div>
        {totalPages > 1 && (
          <Pagination
            currentPage={state.currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
      <Modal
        isOpen={detailModal.show}
        onClose={closeDetailModal}
        maxWidth="max-w-md"
      >
        <Modal.Accent
          color={
            detailModal.title === "Wallet Address"
              ? "from-[#b9fd5c] via-[#ff8533] to-yellow-500"
              : "from-blue-500 via-blue-400 to-cyan-500"
          }
        />

        <div className="flex flex-col items-center pt-8 pb-2 px-6">
          <Modal.Icon
            icon={
              detailModal.title === "Wallet Address" ? (
                <WalletLargeIcon />
              ) : (
                <PencilIcon />
              )
            }
            bgClass={
              detailModal.title === "Wallet Address"
                ? "bg-[#b9fd5c]/10"
                : "bg-blue-500/10"
            }
          />
          <Modal.Header title={detailModal.title} subtitle="Details below" />
        </div>

        <Modal.Body className="mb-6 mt-2">
          <div className="p-4 bg-[#111214] border border-[#2a2c2f] rounded-xl">
            <p
              className="text-[#8a8d93] text-sm font-mono break-all leading-relaxed"
              style={{ whiteSpace: "pre-wrap" }}
            >
              {detailModal.content}
            </p>
          </div>

          {/* Copy Button */}
          {detailModal.content &&
            detailModal.content !== "No wallet address available." &&
            detailModal.content !== "No note available." && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(detailModal.content);
                }}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5
                           rounded-xl text-sm font-medium bg-[#111214] border border-[#2a2c2f]
                           text-[#8a8d93] hover:text-white hover:border-[#3a3c3f]
                           transition-colors cursor-pointer"
              >
                <CopyIcon />
                Copy to Clipboard
              </button>
            )}
        </Modal.Body>

        <Modal.Footer>
          <button
            onClick={closeDetailModal}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                       bg-[#111214] border border-[#2a2c2f] text-[#8a8d93]
                       hover:text-white hover:border-[#3a3c3f]
                       transition-colors cursor-pointer"
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UsdtBonusList;

// ─── Helper Function ─────────────────────────────────────────────

function getDecimalValue(field) {
  if (!field) return 0;
  if (typeof field === "object" && field.$numberDecimal) {
    return parseFloat(field.$numberDecimal);
  }
  return parseFloat(field) || 0;
}

const WalletLargeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#b9fd5c"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);

const NoteIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const CopyIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);
