
import React, { useState, useMemo, useCallback } from "react";
import {
  Coins,
  IndianRupee,
  Repeat,
  Search,
} from "lucide-react";

import {
  useGetAdminP2PHistoryQuery,
} from "./adminP2PApiSlice";

import Table from "../../reusableComponents/Tables/Table";
import Pagination from "../../reusableComponents/paginations/Pagination";
import StatCard from "../../reusableComponents/StatCards/StatsCard";
import SearchBar from "../../reusableComponents/searchBar/SearchBar";
import Loader from "../../reusableComponents/Loader/Loader";
import PerPageSelector from "../../reusableComponents/Filter/PerPageSelector";

const P2PHistory = () => {
  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    username: "",
    status: "",
    role: "",
    fromDate: "",
    toDate: "",
  });

  const queryParams = {
    page: state.currentPage,
    limit: state.perPage,
    username: state.username,
    status: state.status,
    role: state.role,
    fromDate: state.fromDate,
    toDate: state.toDate,
  };

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAdminP2PHistoryQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const trades = response?.data?.trades || [];
  const stats = response?.data?.stats || {};
  const pagination = response?.data?.pagination || {};

  const totalPages = pagination?.totalPages || 1;

  // ─── Handlers ───────────────────────────────────────

  const handlePageChange = useCallback((page) => {
    setState((prev) => ({
      ...prev,
      currentPage: page,
    }));
  }, []);

  const handlePerPageChange = useCallback((value) => {
    setState((prev) => ({
      ...prev,
      perPage: value,
      currentPage: 1,
    }));
  }, []);

  const handleSearch = useCallback((e) => {
    setState((prev) => ({
      ...prev,
      username: e.target.value,
      currentPage: 1,
    }));
  }, []);

  const handleStatusChange = useCallback((e) => {
    setState((prev) => ({
      ...prev,
      status: e.target.value,
      currentPage: 1,
    }));
  }, []);
  const handleRoleChange = useCallback((e) => {
    setState((prev) => ({
      ...prev,
      role: e.target.value,
      currentPage: 1,
    }));
  }, []);

  // ─── Error State ─────────────────────────────────────

  if (isError) {
    const errorMessage =
      error?.status === 500
        ? "Server error. Please try again later."
        : error?.data?.message || "Failed to fetch P2P history.";

    return (
      <div className="p-2 sm:p-2 space-y-6">
        <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
            <h1 className="text-lg font-semibold text-white">
              P2P History
            </h1>
          </div>

          <div className="flex flex-col items-center justify-center py-20">
            <h3 className="text-white text-lg font-semibold mb-2">
              Error Loading Data
            </h3>
            <p className="text-[#8a8d93] mb-6">{errorMessage}</p>

            <button
              onClick={refetch}
              className="px-5 py-2.5 rounded-xl bg-[#b9fd5c] text-black font-semibold"
            >
              Try Again
            </button>
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
      header: "Trade ID",
      render: (row) => (
        <span className="font-mono text-xs">
          {row?.tradeId?.slice(-8)}
        </span>
      ),
    },
    {
      header: "Buyer",
      render: (row) => row?.buyer?.username || "N/A",
    },
    {
      header: "Seller",
      render: (row) => row?.seller?.username || "N/A",
    },
    {
      header: "Amount",
      render: (row) => `₹${row?.payment?.totalInr}`,
    },
    {
      header: "Price/Coin",
      render: (row) => `₹${row?.payment?.pricePerCoinInr}`,
    },
    {
      header: "Coins",
      render: (row) => row?.coins?.totalCoins,
    },
    {
      header: "Seller %",
      render: (row) => row?.split?.sellerSupplyPct,
    },
    {
      header: "Company %",
      render: (row) => row?.split?.companySupplyPct,
    },
    {
      header: "Status",
      render: (row) => (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
          {row?.status}
        </span>
      ),
    },
    {
      header: "Date",
      render: (row) =>
        new Date(row?.createdAt).toLocaleString(),
    },
  ];

  const TableData = useMemo(() => trades, [trades]);

  return (
    <div className="p-2 sm:p-2 space-y-6">

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Trades"
          value={stats?.totalTrades || 0}
          icon={Repeat}
          status="success"
        />

        <StatCard
          title="Total Volume"
          value={`₹${stats?.totalVolumeInr || 0}`}
          icon={IndianRupee}
          status="pending"
        />

        <StatCard
          title="Total Coins"
          value={stats?.totalCoinsTraded || 0}
          icon={Coins}
          status="completed"
        />
      </div>

      {/* Loader */}
      {isFetching && !isLoading && <Loader />}

      {/* Main Table */}
      <div className="bg-[#282f35] border border-[#2a2c2f] rounded-lg overflow-hidden">

        {/* Header */}
<div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
  <div className="flex flex-col gap-4">
    {/* Header */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h2 className="text-lg font-semibold text-white">
        P2P Trade History
      </h2>
      
      <PerPageSelector
        options={[10, 20, 50, 100]}
        onChange={handlePerPageChange}
      />
    </div>

    {/* Filters */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {/* Status Filter */}
      <select
        value={state.status}
        onChange={handleStatusChange}
        className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      >
        <option value="">All Status</option>
        <option value="COMPLETED">Completed</option>
        <option value="PENDING">Pending</option>
      </select>

      {/* Role Filter */}
      <select
        value={state.role}
        onChange={handleRoleChange}
        className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      >
        <option value="">All Roles</option>
        <option value="buyer">Buyer</option>
        <option value="seller">Seller</option>
        <option value="both">Both</option>
      </select>

      {/* From Date */}
      <input
        type="date"
        value={state.fromDate}
        onChange={(e) =>
          setState((prev) => ({
            ...prev,
            fromDate: e.target.value,
            currentPage: 1,
          }))
        }
        placeholder="From date"
        className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />

      {/* To Date */}
      <input
        type="date"
        value={state.toDate}
        onChange={(e) =>
          setState((prev) => ({
            ...prev,
            toDate: e.target.value,
            currentPage: 1,
          }))
        }
        placeholder="To date"
        className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />

      {/* Search Bar - spans 2 columns on larger screens */}
      <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search username..."
        />
      </div>
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
            noDataTitle="No P2P Trades Found"
            noDataMessage="No P2P transaction history available."
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
    </div>
  );
};

export default P2PHistory;