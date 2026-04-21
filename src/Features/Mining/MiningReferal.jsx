// components/admin/mine/ReferralBonus.jsx
import React, { useState } from "react";
import { useGetAdminReferralBonusQuery } from "./miningApiSlice";
import Table from "../../reusableComponents/Tables/Table";
import Pagination from "../../reusableComponents/paginations/Pagination";
import { formatDateTimeSimple } from "../../utils/dateUtils";

const ReferralBonus = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    referrerId: "",
    referredUserId: "",
    status: "",
    from: "",
    to: ""
  });

  const [searchReferrer, setSearchReferrer] = useState("");
  const [searchReferred, setSearchReferred] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useGetAdminReferralBonusQuery(filters);

  const bonuses = data?.data?.logs || [];
  const totalPages = data?.data?.pagination?.totalPages || 1;

  // Calculate active filter count
  const activeFilterCount = [
    filters.referrerId,
    filters.referredUserId,
    filters.status,
    filters.from,
    filters.to
  ].filter(Boolean).length;

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ 
      ...prev, 
      [key]: value,
      page: key !== 'page' ? 1 : value
    }));
  };

  // Handle referrer search
  const handleReferrerSearchChange = (e) => {
    setSearchReferrer(e.target.value);
  };

  const handleReferrerSearchSubmit = (e) => {
    e.preventDefault();
    handleFilterChange("referrerId", searchReferrer);
  };

  const handleClearReferrerSearch = () => {
    setSearchReferrer("");
    handleFilterChange("referrerId", "");
  };

  // Handle referred user search
  const handleReferredSearchChange = (e) => {
    setSearchReferred(e.target.value);
  };

  const handleReferredSearchSubmit = (e) => {
    e.preventDefault();
    handleFilterChange("referredUserId", searchReferred);
  };

  const handleClearReferredSearch = () => {
    setSearchReferred("");
    handleFilterChange("referredUserId", "");
  };

  // Handle clear all filters
  const handleClearAllFilters = () => {
    setSearchReferrer("");
    setSearchReferred("");
    setFilters({ 
      page: 1, 
      limit: 10, 
      referrerId: "",
      referredUserId: "",
      status: "",
      from: "",
      to: ""
    });
  };

  // Define table columns
  const columns = [
    {
      header: "S.No",
      accessor: "sno",
      minWidth: "60px",
      render: (row, rowIndex, currentPage, perPage) => (
        <div className="text-center text-xs font-regular text-white">
          {(currentPage - 1) * perPage + rowIndex + 1}
        </div>
      )
    },
    {
      header: "User ID",
      accessor: "userJaimaxId",
      minWidth: "150px",
      render: (row) => (
        <div className="flex items-center justify-center">
          <div className="ml-3">
            <div className="text-xs font-regular text-white truncate">
              {row.userJaimaxId}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Referred User ID",
      accessor: "referrerJaimaxId",
      minWidth: "150px",
      render: (row) => (
        <div className="flex items-center justify-center">
          <div className="ml-2">
            <div className="text-xs text-white truncate">
              {row.referrerJaimaxId}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Bonus Amount",
      accessor: "bonusAmount",
      minWidth: "120px",
      render: (row) => (
        <div className="text-xs font-regular text-green-400">
          +{row.bonusAmount?.toLocaleString()} jmc
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      minWidth: "100px",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Referred At",
      accessor: "createdAt",
      minWidth: "140px",
      render: (row) => (
        <div className="text-xs text-white">
          {formatDateTimeSimple(row.createdAt)}
        </div>
      ),
    },
  ];

  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-4">
      {/* Filter Section */}
      <div className="mb-4 bg-gray-800 rounded-lg overflow-hidden">
        {/* Filter Header - Always Visible */}
        <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 min-w-0">
            {/* Referrer Search */}
            <form onSubmit={handleReferrerSearchSubmit} className="flex-1 min-w-[150px]">
              <div className="relative">
                <input
                  type="text"
                  value={searchReferrer}
                  onChange={handleReferrerSearchChange}
                  placeholder="Search Referrer..."
                  className="w-full bg-gray-700 text-white rounded-lg pl-9 pr-20 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#b9fd5c]"
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex gap-1">
                  {searchReferrer && (
                    <button 
                      type="button" 
                      onClick={handleClearReferrerSearch} 
                      className="bg-gray-600 hover:bg-gray-500 text-white px-1.5 sm:px-2 py-1 rounded text-xs transition-colors"
                    >
                      ×
                    </button>
                  )}
                  <button 
                    type="submit" 
                    className="bg-[#b9fd5c] hover:bg-[#a8ed4a] text-black px-1.5 sm:px-2 py-1 rounded text-xs font-medium transition-colors"
                  >
                    Go
                  </button>
                </div>
              </div>
            </form>

            {/* Referred User Search */}
            <form onSubmit={handleReferredSearchSubmit} className="flex-1 min-w-[150px]">
              <div className="relative">
                <input
                  type="text"
                  value={searchReferred}
                  onChange={handleReferredSearchChange}
                  placeholder="Search Referred User..."
                  className="w-full bg-gray-700 text-white rounded-lg pl-9 pr-20 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex gap-1">
                  {searchReferred && (
                    <button 
                      type="button" 
                      onClick={handleClearReferredSearch} 
                      className="bg-gray-600 hover:bg-gray-500 text-white px-1.5 sm:px-2 py-1 rounded text-xs transition-colors"
                    >
                      ×
                    </button>
                  )}
                  <button 
                    type="submit" 
                    className="bg-[#b9fd5c] hover:bg-[#a8ed4a] text-black px-1.5 sm:px-2 py-1 rounded text-xs font-medium transition-colors"
                  >
                    Go
                  </button>
                </div>
              </div>
            </form>

            {/* Toggle Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs sm:text-sm transition-colors whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-[#b9fd5c] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Clear All - Only show if filters active */}
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearAllFilters}
              className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center justify-center sm:justify-start gap-1 py-2 sm:py-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear All
            </button>
          )}
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="px-3 pb-3 border-t border-gray-700 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="bg-gray-700 text-white rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#b9fd5c] cursor-pointer transition-colors"
              >
                <option value="">All Status</option>
                <option value="sucess">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              {/* From Date Filter */}
              <input
                type="date"
                value={filters.from}
                onChange={(e) => handleFilterChange("from", e.target.value)}
                max={filters.to || undefined}
                className="bg-gray-700 text-white rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#b9fd5c] [color-scheme:dark] transition-colors"
              />

              {/* To Date Filter */}
              <input
                type="date"
                value={filters.to}
                onChange={(e) => handleFilterChange("to", e.target.value)}
                min={filters.from || undefined}
                className="bg-gray-700 text-white rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#b9fd5c] [color-scheme:dark] transition-colors"
              />
            </div>
          </div>
        )}

        {/* Active Filters Tags - Compact */}
        {activeFilterCount > 0 && (
          <div className="px-3 pb-3 flex flex-wrap gap-2">
            {filters.referrerId && (
              <span className="bg-blue-600 text-white px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-transform hover:scale-105">
                Ref: {filters.referrerId}
                <button 
                  onClick={() => {
                    setSearchReferrer("");
                    handleFilterChange("referrerId", "");
                  }}
                  className="hover:opacity-70 transition-opacity"
                >
                  ×
                </button>
              </span>
            )}

            {filters.referredUserId && (
              <span className="bg-purple-600 text-white px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-transform hover:scale-105">
                User: {filters.referredUserId}
                <button 
                  onClick={() => {
                    setSearchReferred("");
                    handleFilterChange("referredUserId", "");
                  }}
                  className="hover:opacity-70 transition-opacity"
                >
                  ×
                </button>
              </span>
            )}
            
            {filters.status && (
              <span className="bg-green-600 text-white px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-transform hover:scale-105">
                {filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
                <button 
                  onClick={() => handleFilterChange("status", "")}
                  className="hover:opacity-70 transition-opacity"
                >
                  ×
                </button>
              </span>
            )}
            
            {filters.from && (
              <span className="bg-orange-600 text-white px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-transform hover:scale-105">
                From: {new Date(filters.from).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                <button 
                  onClick={() => handleFilterChange("from", "")}
                  className="hover:opacity-70 transition-opacity"
                >
                  ×
                </button>
              </span>
            )}

            {filters.to && (
              <span className="bg-orange-600 text-white px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-transform hover:scale-105">
                To: {new Date(filters.to).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                <button 
                  onClick={() => handleFilterChange("to", "")}
                  className="hover:opacity-70 transition-opacity"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        <Table
          columns={columns}
          data={bonuses}
          isLoading={isLoading}
          currentPage={filters.page}
          perPage={filters.limit}
          noDataTitle="No Referral Bonuses Found"
          noDataMessage="There are no referral bonuses matching your filters."
          noDataIcon="gift"
        />
      </div>

      {/* Pagination */}
      {bonuses.length > 0 && (
        <div className="mt-4 sm:mt-6">
          <Pagination
            currentPage={filters.page}
            totalPages={totalPages}
            onPageChange={(page) => handleFilterChange("page", page)}
          />
        </div>
      )}
    </div>
  );
};

// StatusBadge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    paid: {
      bg: "bg-green-600",
      text: "text-white",
    },
    pending: {
      bg: "bg-yellow-600",
      text: "text-white",
    },
    failed: {
      bg: "bg-red-600",
      text: "text-white",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`px-2 sm:px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text} capitalize`}
    >
      {status}
    </span>
  );
};

export default ReferralBonus;