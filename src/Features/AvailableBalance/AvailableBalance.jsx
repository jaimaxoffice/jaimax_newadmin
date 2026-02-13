// src/features/availableBalance/AvailableBalance.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Table from "../../reusableComponents/Tables/Table";
import MobileCard from "../../reusableComponents/MobileCards/MobileCards";
import MobileCardList from "../../reusableComponents/MobileCards/MobileCardList";
import StatCard from "../../reusableComponents/StatCards/StatsCard";
import Pagination from "../../reusableComponents/paginations/Pagination";
import { useAvailableBalanceQuery } from "./availablebalanceApiSlice";

const AvailableBalance = () => {
  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
    amountType: "preset",
    presetAmount: "",
    minAmount: "",
    maxAmount: "",
  });

  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);

  const amountOptions = [
    { value: "", label: "All Amounts" },
    { value: "500", label: "₹500" },
    { value: "1000", label: "₹1,000" },
    { value: "5000", label: "₹5,000" },
    { value: "10000", label: "₹10,000" },
    { value: "20000", label: "₹20,000" },
    { value: "50000", label: "₹50,000" },
    { value: "100000", label: "₹1,00,000" },
    { value: "custom", label: "Custom Range" },
  ];

  // ─── Build Query Params ─────────────────────────────────────

  const queryParams = useMemo(() => {
    let params = `limit=${state.perPage}&page=${state.currentPage}`;
    if (state.search) params += `&search=${state.search}`;
    if (state.minAmount !== "" && state.maxAmount !== "") {
      params += `&minAmount=${state.minAmount}&maxAmount=${state.maxAmount}`;
    }
    return params;
  }, [state.currentPage, state.perPage, state.search, state.minAmount, state.maxAmount]);

  const {
    data: availableBalance,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAvailableBalanceQuery(queryParams);

  // ─── Data Processing ────────────────────────────────────────

  const TableData = availableBalance?.data?.users || [];
  const totalUsers = availableBalance?.data?.total || 0;
  const paginationData = availableBalance?.data?.pagination || {};
  const totalPages = paginationData?.totalPages || 1;

  // Stats
  const totalBalance = useMemo(
    () => TableData.reduce((sum, user) => sum + (user?.Inr || 0), 0),
    [TableData]
  );
  const avgBalance = useMemo(
    () => (TableData.length > 0 ? totalBalance / TableData.length : 0),
    [TableData, totalBalance]
  );
  const highBalanceCount = useMemo(
    () => TableData.filter((u) => (u?.Inr || 0) > 10000).length,
    [TableData]
  );
  const activeUsersCount = useMemo(
    () => TableData.filter((u) => (u?.Inr || 0) > 0).length,
    [TableData]
  );

  // ─── Check Active Filters ──────────────────────────────────

  const hasActiveFilters = useMemo(
    () => state.search || (state.minAmount !== "" && state.maxAmount !== ""),
    [state.search, state.minAmount, state.maxAmount]
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

  const handleAmountChange = useCallback((e) => {
    const value = e.target.value;
    if (value === "custom") {
      setState((prev) => ({
        ...prev,
        amountType: "custom",
        presetAmount: value,
        minAmount: "",
        maxAmount: "",
        currentPage: 1,
      }));
    } else if (value) {
      setState((prev) => ({
        ...prev,
        amountType: "preset",
        presetAmount: value,
        minAmount: "0",
        maxAmount: value,
        currentPage: 1,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        amountType: "preset",
        presetAmount: "",
        minAmount: "",
        maxAmount: "",
        currentPage: 1,
      }));
    }
  }, []);

  const handleClearFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      search: "",
      amountType: "preset",
      presetAmount: "",
      minAmount: "",
      maxAmount: "",
      currentPage: 1,
    }));
    if (searchInputRef.current) searchInputRef.current.value = "";
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // ─── Helpers ─────────────────────────────────────────────────

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getBalanceColor = (amount) => {
    if (amount > 50000) return "text-[#0ecb6f]";
    if (amount > 10000) return "text-blue-400";
    if (amount > 1000) return "text-yellow-400";
    if (amount > 0) return "text-[#eb660f]";
    return "text-red-400";
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
          <div className="bg-[#1b232d] border border-[#2a2c2f] rounded-2xl overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#eb660f]/10 flex items-center justify-center text-[#eb660f]">
                    <WalletIcon />
                  </div>
                  <h1 className="text-lg font-semibold text-white">
                    User Available Balance
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

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Users" value="--" valueClass="text-white" />
            <StatCard title="Total Balance" value="--" valueClass="text-[#0ecb6f]" />
            <StatCard title="Avg Balance" value="--" valueClass="text-blue-400" />
            <StatCard title="High Balance" value="--" valueClass="text-yellow-400" />
          </div>
        </div>
      </div>
    );
  }

  // ─── Table Columns ──────────────────────────────────────────

  const columns = [
    {
      header: "S.No",
      render: (_, index) => {
        const pageNum = paginationData?.page || state.currentPage;
        const limit = paginationData?.limit || state.perPage;
        return `${(pageNum - 1) * limit + index + 1}.`;
      },
    },
    {
      header: "Name",
      render: (row) => (
        <span className="text-white font-medium">{row?.name || "N/A"}</span>
      ),
    },
    {
      header: "Username",
      render: (row) => (
        <span
          className=""
        >
          {row?.username || "N/A"}
        </span>
      ),
    },
    {
      header: "Email",
      render: (row) => (
        <span className="">{row?.email || "N/A"}</span>
      ),
    },
    {
      header: "Balance (INR)",
      render: (row) => (
        <span >
          {formatCurrency(row?.Inr)}
        </span>
      ),
    },
    {
      header: "Status",
      render: () => (
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full
                     bg-[#eb660f]/10 text-[#eb660f]"
        >
          Active
        </span>
      ),
    },
  ];

  // ─── Mobile Card Builder ────────────────────────────────────

  const renderUserCard = (row, index) => {
    const pageNum = paginationData?.page || state.currentPage;
    const limit = paginationData?.limit || state.perPage;
    const sNo = (pageNum - 1) * limit + index + 1;

    return (
      <MobileCard
        key={row._id || index}
        header={{
          avatar: (row?.name?.charAt(0) || "?").toUpperCase(),
          avatarBg: `${getBalanceColor(row?.Inr || 0).replace("text-", "bg-")}/10 ${getBalanceColor(row?.Inr || 0)}`,
          title: row?.name || "N/A",
          subtitle: `#${sNo} • @${row?.username || "N/A"}`,
          badge: "Active",
          badgeClass: "bg-[#0ecb6f]/10 text-[#0ecb6f]",
        }}
        rows={[
          {
            label: "Balance",
            custom: (
              <span className={`font-semibold text-sm ${getBalanceColor(row?.Inr || 0)}`}>
                {formatCurrency(row?.Inr)}
              </span>
            ),
          },
          {
            label: "Username",
            custom: (
              <span
                className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full
                           bg-[#111214] text-[#8a8d93] border border-[#2a2c2f]"
              >
                @{row?.username || "N/A"}
              </span>
            ),
          },
          {
            label: "Email",
            custom: (
              <span className="text-xs text-[#8a8d93] truncate max-w-[60%] text-right">
                {row?.email || "N/A"}
              </span>
            ),
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
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Left: Amount Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
            <div>
              <label className="text-[#8a8d93] text-xs font-medium mb-1.5 block">
                Filter by Amount
              </label>
              <select
                value={state.presetAmount}
                onChange={handleAmountChange}
                disabled={isLoading}
                className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
                           py-2.5 px-3 text-sm focus:outline-none focus:border-[#eb660f]
                           transition-colors cursor-pointer disabled:opacity-50 min-w-[160px]"
              >
                {amountOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Range Inputs */}
            {state.amountType === "custom" && state.presetAmount === "custom" && (
              <div className="flex items-end gap-2">
                <div>
                  <label className="text-[#8a8d93] text-xs font-medium mb-1.5 block">Min</label>
                  <input
                    type="number"
                    placeholder="₹ Min"
                    value={state.minAmount}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        minAmount: e.target.value,
                        currentPage: 1,
                      }))
                    }
                    className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
                               py-2.5 px-3 text-sm focus:outline-none focus:border-[#eb660f]
                               transition-colors w-28"
                  />
                </div>
                <span className="text-[#8a8d93] text-sm pb-2.5">–</span>
                <div>
                  <label className="text-[#8a8d93] text-xs font-medium mb-1.5 block">Max</label>
                  <input
                    type="number"
                    placeholder="₹ Max"
                    value={state.maxAmount}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        maxAmount: e.target.value,
                        currentPage: 1,
                      }))
                    }
                    className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
                               py-2.5 px-3 text-sm focus:outline-none focus:border-[#eb660f]
                               transition-colors w-28"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right: Per Page + Search */}
          <div className="flex flex-wrap items-center gap-3">
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
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>

            {/* Search */}
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                autoComplete="off"
                placeholder={isSearching ? "Searching..." : "Search name, email..."}
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

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium
                           bg-red-500/10 text-red-400 border border-red-500/20
                           hover:bg-red-500/20 hover:border-red-500/40
                           transition-all cursor-pointer"
              >
                <CloseIcon />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-[#1b232d] border border-[#2a2c2f] rounded-xl">
            <span className="text-[#8a8d93] text-xs">Active Filters:</span>

            {state.minAmount !== "" && state.maxAmount !== "" && (
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                           bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
              >
                Balance: {formatCurrency(Number(state.minAmount))} – {formatCurrency(Number(state.maxAmount))}
                <button
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      presetAmount: "",
                      amountType: "preset",
                      minAmount: "",
                      maxAmount: "",
                      currentPage: 1,
                    }))
                  }
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  <CloseSmallIcon />
                </button>
              </span>
            )}

            {state.search && (
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                           bg-blue-500/10 text-blue-400 border border-blue-500/20"
              >
                Search: "{state.search}"
                <button
                  onClick={() => {
                    setState((prev) => ({ ...prev, search: "", currentPage: 1 }));
                    if (searchInputRef.current) searchInputRef.current.value = "";
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  <CloseSmallIcon />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={totalUsers.toLocaleString("en-IN")}
            valueClass="text-white"
          />
          <StatCard
            title="Page Balance"
            value={formatCurrency(totalBalance)}
            valueClass="text-[#0ecb6f]"
          />
          <StatCard
            title="Avg Balance"
            value={formatCurrency(Math.round(avgBalance))}
            valueClass="text-blue-400"
          />
          <StatCard
            title="High Balance (>₹10K)"
            value={highBalanceCount}
            valueClass="text-yellow-400"
          />
        </div>

        {/* Fetching Indicator */}
        {isFetching && !isLoading && (
          <div className="flex items-center justify-center gap-2 py-2">
            <div className="w-4 h-4 border-2 border-[#eb660f] border-t-transparent rounded-full animate-spin" />
            <span className="text-[#8a8d93] text-sm">
              Loading page {state.currentPage}...
            </span>
          </div>
        )}

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
                  <WalletIcon />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">
                    User Available Balance
                  </h1>
                  <p className="text-xs text-[#8a8d93] mt-0.5">
                    Showing{" "}
                    {TableData.length > 0
                      ? ((paginationData?.page || state.currentPage) - 1) *
                          (paginationData?.limit || state.perPage) +
                        1
                      : 0}{" "}
                    to{" "}
                    {Math.min(
                      (paginationData?.page || state.currentPage) *
                        (paginationData?.limit || state.perPage),
                      totalUsers
                    )}{" "}
                    of {totalUsers} users
                    {state.search && (
                      <span className="text-[#eb660f]"> for "{state.search}"</span>
                    )}
                    {state.minAmount !== "" && state.maxAmount !== "" && (
                      <span className="text-yellow-400">
                        {" "}
                        • {formatCurrency(Number(state.minAmount))} – {formatCurrency(Number(state.maxAmount))}
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
              renderCard={renderUserCard}
              emptyMessage={
                hasActiveFilters
                  ? "No users found matching your criteria"
                  : "No users found"
              }
            />
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={paginationData?.page || state.currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default AvailableBalance;

// ─── SVG Icons ───────────────────────────────────────────────────

const WalletIcon = ({ className = "" }) => (
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
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
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

const CloseIcon = ({ className = "" }) => (
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
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CloseSmallIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);