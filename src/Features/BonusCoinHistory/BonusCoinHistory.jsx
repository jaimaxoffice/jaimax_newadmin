// src/features/bonusHistory/BonusHistory.jsx
import React, { useState, useEffect, useRef } from "react";
import Table from "../../reusableComponents/Tables/Table";
import MobileCard from "../../reusableComponents/MobileCards/MobileCards";
import MobileCardList from "../../reusableComponents/MobileCards/MobileCardList";
import StatCard from "../../reusableComponents/StatCards/StatsCard";
import Pagination from "../../reusableComponents/paginations/Pagination";
import { useBonusHistoryQuery } from "./bonusApiSlice";

const BonusHistory = () => {
  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
  });

  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  const queryParams = `limit=${state.perPage}&page=${state.currentPage}&search=${state.search}`;

  const {
    data: bonusHistory,
    isLoading,
    error,
    isError,
    refetch,
  } = useBonusHistoryQuery(queryParams);

  const TableData = bonusHistory?.data?.withdrawRequests || [];
  const bonusCoins = bonusHistory?.data?.totalBonusCoins || 0;
  const totalItems = bonusHistory?.data?.pagination?.total || 0;
  const totalPages = Math.ceil(totalItems / state.perPage) || 1;

  // Derive stats
  const totalTransactions = totalItems;
  const uniqueEmails = new Set(TableData.map((item) => item.email)).size;
  const totalTransactionAmount = TableData.reduce(
    (sum, item) => sum + (parseFloat(item.transactionAmount) || 0),
    0
  );

  // ─── Handlers ────────────────────────────────────────────────

  const handlePageChange = (page) =>
    setState((prev) => ({ ...prev, currentPage: page }));

  const handlePerPageChange = (e) =>
    setState((prev) => ({
      ...prev,
      perPage: parseInt(e.target.value),
      currentPage: 1,
    }));

  const handleSearch = (e) => {
    const value = e.target.value;
    if (value !== state.search) setIsSearching(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, search: value, currentPage: 1 }));
      setIsSearching(false);
    }, 600);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // ─── Helpers ─────────────────────────────────────────────────

  const formatDateWithAmPm = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    let hours = date.getUTCHours();
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const amAndPm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day}-${month}-${year} ${hours}:${minutes} ${amAndPm}`;
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
          {/* Header */}
          <div className="bg-[#1b232d] border border-[#2a2c2f] rounded-2xl overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#eb660f]/10 flex items-center justify-center text-[#eb660f]">
                    <CoinsIcon />
                  </div>
                  <h1 className="text-lg font-semibold text-white">
                    Bonus Coins History
                  </h1>
                </div>
                <button
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                             bg-[#eb660f] text-white hover:bg-[#ff8533]
                             transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  <RefreshIcon className={isLoading ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Error Content */}
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <AlertIcon />
              </div>
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
                             bg-[#eb660f] text-white hover:bg-[#ff8533]
                             transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  <RefreshIcon className={isLoading ? "animate-spin" : ""} />
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

          {/* Empty Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Bonus Coins Given"
              value="--"
              valueClass="text-[#0ecb6f]"
            />
            <StatCard
              title="Total Transactions"
              value="--"
              valueClass="text-blue-400"
            />
            <StatCard
              title="Page Amount"
              value="--"
              valueClass="text-yellow-400"
            />
            <StatCard
              title="Unique Emails"
              value="--"
              valueClass="text-purple-400"
            />
          </div>
        </div>
      </div>
    );
  }

  // ─── Table Columns ──────────────────────────────────────────

  const columns = [
    {
      header: "S.No",
      render: (_, index) =>
        `${(state.currentPage - 1) * state.perPage + index + 1}.`,
    },
    {
      header: "Name",
      render: (row) => (
        <span className="text-white font-medium">{row?.name || "N/A"}</span>
      ),
    },
    {
      header: "Email",
      render: (row) => (
        <span className="text-xs text-[#8a8d93]">{row?.email || "N/A"}</span>
      ),
    },
    {
      header: "Transaction Amount",
      render: (row) => (
        <span className="text-[#eb660f] font-semibold">
          {row?.transactionAmount}
        </span>
      ),
    },
    {
      header: "Transaction Type",
      render: (row) => (
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            row?.transactionType?.toLowerCase() === "credit"
              ? "bg-[#0ecb6f]/10 text-[#0ecb6f]"
              : row?.transactionType?.toLowerCase() === "debit"
              ? "bg-red-500/10 text-red-400"
              : "bg-blue-500/10 text-blue-400"
          }`}
        >
          {row?.transactionType || "N/A"}
        </span>
      ),
    },
    {
      header: "Transaction ID",
      render: (row) => (
        <span className="text-xs text-[#8a8d93] font-mono">
          {row?.transactionId || "N/A"}
        </span>
      ),
    },
    {
      header: "Helped User",
      render: (row) => (
        <span className="text-xs">{row?.comssionHelpedUser || "N/A"}</span>
      ),
    },
    {
      header: "Transaction Date",
      render: (row) => (
        <span className="text-xs">
          {formatDateWithAmPm(row?.transactionDate)}
        </span>
      ),
    },
  ];

  // ─── Mobile Card Builder ────────────────────────────────────

  const renderBonusCard = (row, index) => {
    const sNo = (state.currentPage - 1) * state.perPage + index + 1;

    return (
      <MobileCard
        key={row._id || index}
        header={{
          avatar: (row?.name?.charAt(0) || "?").toUpperCase(),
          avatarBg: "bg-[#eb660f]/10 text-[#eb660f]",
          title: row?.name || "N/A",
          subtitle: `#${sNo} • ${row?.email || "N/A"}`,
          badge: row?.transactionType || "N/A",
          badgeClass:
            row?.transactionType?.toLowerCase() === "credit"
              ? "bg-[#0ecb6f]/10 text-[#0ecb6f]"
              : row?.transactionType?.toLowerCase() === "debit"
              ? "bg-red-500/10 text-red-400"
              : "bg-blue-500/10 text-blue-400",
        }}
        rows={[
          {
            label: "Transaction Amount",
            value: row?.transactionAmount,
            highlight: true,
          },
          {
            label: "Transaction Type",
            custom: (
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  row?.transactionType?.toLowerCase() === "credit"
                    ? "bg-[#0ecb6f]/10 text-[#0ecb6f]"
                    : row?.transactionType?.toLowerCase() === "debit"
                    ? "bg-red-500/10 text-red-400"
                    : "bg-blue-500/10 text-blue-400"
                }`}
              >
                {row?.transactionType || "N/A"}
              </span>
            ),
          },
          {
            label: "Transaction ID",
            custom: (
              <span className="text-xs text-[#8a8d93] font-mono truncate max-w-[60%] text-right">
                {row?.transactionId || "N/A"}
              </span>
            ),
          },
          {
            label: "Helped User",
            value: row?.comssionHelpedUser || "N/A",
          },
          {
            label: "Transaction Date",
            value: formatDateWithAmPm(row?.transactionDate),
          },
        ]}
      />
    );
  };

  // ─── Render ─────────────────────────────────────────────────

  return (
    <div>
      <div className="p-2 sm:p-2 space-y-6">
        {/* Top Controls */}
        <div className="flex w-full">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto ml-auto">
            {/* Per Page */}
            <select
              onChange={handlePerPageChange}
              value={state.perPage}
              disabled={isLoading}
              className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
                          py-2.5 px-3 text-sm focus:outline-none focus:border-[#eb660f]
                          transition-colors cursor-pointer disabled:opacity-50"
            >
              <option value="10">10</option>
              <option value="30">30</option>
              <option value="50">50</option>
            </select>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                autoComplete="off"
                placeholder={
                  isSearching ? "Searching..." : "Search name, email..."
                }
                onChange={handleSearch}
                disabled={isLoading}
                className="bg-[#111214] border border-[#2a2c2f] text-white placeholder-[#555]
                            rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[#eb660f]
                            focus:ring-1 focus:ring-[#eb660f]/50 transition-colors w-full sm:w-56
                            disabled:opacity-50"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]">
                <SearchIcon className={isSearching ? "animate-spin" : ""} />
              </div>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Bonus Coins Given"
            value={bonusCoins}
            valueClass="text-[#0ecb6f]"
          />
          <StatCard
            title="Total Transactions"
            value={totalTransactions}
            valueClass="text-blue-400"
          />
          <StatCard
            title="Page Amount"
            value={formatCurrency(totalTransactionAmount)}
            valueClass="text-yellow-400"
          />
          <StatCard
            title="Unique Emails"
            value={uniqueEmails}
            valueClass="text-purple-400"
          />
        </div>

        {/* Main Table Card */}
        <div className="bg-[#1b232d] border border-[#2a2c2f] rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl bg-[#eb660f]/10 flex items-center
                              justify-center text-[#eb660f]"
                >
                  <CoinsIcon />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">
                    Bonus Coins History
                  </h1>
                  <p className="text-xs text-[#8a8d93] mt-0.5">
                    Showing{" "}
                    {TableData.length > 0
                      ? (state.currentPage - 1) * state.perPage + 1
                      : 0}{" "}
                    to{" "}
                    {Math.min(
                      state.currentPage * state.perPage,
                      totalItems
                    )}{" "}
                    of {totalItems} results
                    {state.search && (
                      <span className="text-[#eb660f]">
                        {" "}
                        for "{state.search}"
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block">
            <Table
              columns={columns}
              data={TableData}
              isLoading={isLoading}
              currentPage={state.currentPage}
              perPage={state.perPage}
            />
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            <MobileCardList
              data={TableData}
              isLoading={isLoading}
              renderCard={renderBonusCard}
              emptyMessage={
                state.search
                  ? `No results found for "${state.search}"`
                  : "No bonus coins history available"
              }
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
      </div>
    </div>
  );
};

export default BonusHistory;

// ─── SVG Icons ───────────────────────────────────────────────────

const CoinsIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
    <path d="m16.71 13.88.7.71-2.82 2.82" />
  </svg>
);

const SearchIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const RefreshIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const AlertIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#ef4444"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);