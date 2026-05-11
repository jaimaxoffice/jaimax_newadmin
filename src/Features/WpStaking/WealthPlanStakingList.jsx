import React, { useState, useMemo, useCallback } from "react";
import { Wallet, IndianRupee, Coins } from "lucide-react";

import { useGetWpStakingWalletsQuery } from "./stakingapislice";
import { formatDateTimeSimple } from "../../utils/dateUtils";

import Table from "../../reusableComponents/Tables/Table";
import Pagination from "../../reusableComponents/paginations/Pagination";
import StatCard from "../../reusableComponents/StatCards/StatsCard";
import SearchBar from "../../reusableComponents/searchBar/SearchBar";
import Loader from "../../reusableComponents/Loader/Loader";
import PerPageSelector from "../../reusableComponents/Filter/PerPageSelector";

const WealthPlanStakingList = () => {
  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
    status: "",
  });

  const queryParams = {
    page: state.currentPage,
    limit: state.perPage,
    search: state.search,
    status: state.status,
  };

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetWpStakingWalletsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const wallets = response?.data?.wallets || [];
  const stats = response?.data?.stats || {};
  const pagination = response?.data?.pagination || {};

  const totalPages = pagination?.totalPages || 1;

  // ─── Handlers ───────────────────────────────────────

  const handlePageChange = useCallback((page) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  }, []);

  const handlePerPageChange = useCallback((value) => {
    setState((prev) => ({ ...prev, perPage: value, currentPage: 1 }));
  }, []);

  const handleSearch = useCallback((e) => {
    setState((prev) => ({ ...prev, search: e.target.value, currentPage: 1 }));
  }, []);

  const handleStatusChange = useCallback((e) => {
    setState((prev) => ({ ...prev, status: e.target.value, currentPage: 1 }));
  }, []);

  // ─── Error State ─────────────────────────────────────

  if (isError) {
    const errorMessage =
      error?.status === 500
        ? "Server error. Please try again later."
        : error?.data?.message || "Failed to fetch WP staking wallets.";

    const errorCode = error?.status || "ERR";

    return (
      <div className="p-2 sm:p-2 space-y-6">
        <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
            <h1 className="text-lg font-semibold text-white">
              WP Staking Wallets
            </h1>
          </div>

          {/* Error Body */}
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            {/* Icon Circle */}
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>

            {/* Error Code Badge */}
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold tracking-wider uppercase mb-3 border border-red-500/20">
              Error {errorCode}
            </span>

            {/* Title */}
            <h3 className="text-white text-xl font-semibold mb-2">
              Something went wrong
            </h3>

            {/* Message */}
            <p className="text-[#8a8d93] text-sm max-w-sm mb-8 leading-relaxed">
              {errorMessage}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={refetch}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#b9fd5c] text-black text-sm font-semibold hover:bg-[#a8ec4b] transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Try Again
              </button>
            </div>
          </div>

          {/* Footer hint */}
          <div className="px-6 py-3 border-t border-[#2a2c2f] flex items-center gap-2">
            <svg
              className="w-3.5 h-3.5 text-[#555]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-[#555] text-xs">
              If this issue persists, please contact support or check your
              network connection.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Table Columns ───────────────────────────────────

  const columns = [
    {
      header: "S.No",
      render: (_, index) =>
        `${(state.currentPage - 1) * state.perPage + index + 1}.`,
    },
    {
      header: "Name",
      render: (row) => row?.user?.name || "N/A",
      cellClass: "text-left",
    },
    {
      header: "Username",
      render: (row) => row?.user?.username || "N/A",
    },
    {
      header: "Total Tokens Awarded",
      render: (row) =>
        row?.totalTokensAwarded != null
          ? Number(row.totalTokensAwarded).toLocaleString("en-IN")
          : "—",
    },
    {
      header: "Net Tokens",
      render: (row) =>
        row?.netTokens != null
          ? Number(row.netTokens).toLocaleString("en-IN")
          : "—",
    },

    {
      header: "Total Sold (P2P)",
      render: (row) =>
        row?.totalSoldInP2P != null
          ? Number(row.totalSoldInP2P).toLocaleString("en-IN")
          : "—",
    },

    {
      header: "Converted At",
      render: (row) =>
        row?.convertedAt ? formatDateTimeSimple(row.convertedAt) : "—",
    },
  ];

  const TableData = useMemo(() => wallets, [wallets]);

  return (
    <div className="p-2 sm:p-2 space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Wallets"
          value={stats?.totalWallets ?? pagination?.total ?? 0}
          icon={Wallet}
          status="success"
        />
        <StatCard
          title="Total INR Volume"
          value={`₹${Number(stats?.totalInr ?? 0).toLocaleString("en-IN")}`}
          icon={IndianRupee}
          status="pending"
        />
        <StatCard
          title="Total Tokens Awarded"
          value={Number(stats?.totalTokensAwarded ?? 0).toLocaleString("en-IN")}
          icon={Coins}
          status="completed"
        />
      </div>

      {/* Fetching Loader */}
      {isFetching && !isLoading && <Loader />}

      {/* Main Table Card */}
      <div className="bg-[#282f35] border border-[#2a2c2f] rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">
              WP Staking Wallets
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              <PerPageSelector
                options={[10, 20, 50, 100]}
                onChange={handlePerPageChange}
              />

              <select
                value={state.status}
                onChange={handleStatusChange}
                className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl py-2.5 px-3 text-sm"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <SearchBar
                onSearch={handleSearch}
                placeholder="Search username..."
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg">
          <Table
            columns={columns}
            data={TableData}
            isLoading={isLoading}
            currentPage={state.currentPage}
            perPage={state.perPage}
            noDataTitle="No WP Staking Wallets Found"
            noDataMessage="No staking wallet records available."
            noDataIcon="inbox"
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
  );
};

export default WealthPlanStakingList;
