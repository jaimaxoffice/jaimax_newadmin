import React, { useState, useEffect, useRef } from "react";
import Table from "../../reusableComponents/Tables/Table";
import Pagination from "../../reusableComponents/paginations/Pagination";
import { useGetGradualLayerBonusLogsQuery } from "./gradualBonusApiSlice";
import SearchBar from "../../reusableComponents/searchBar/SearchBar";
import { formatDateWithAmPm } from "../../utils/dateUtils";
import NOtfound from "../../reusableComponents/Tables/NoDataFound";
import PerPageSelector from "../../reusableComponents/Filter/PerPageSelector";
import useTableState from "../../hooks/useTableState";
const GradualLayerBonusLogs = () => {
  const {
    state,
    setState,
    selectedStatus,
    handlePageChange,
    handleStatusChange,
  } = useTableState({
    initialPerPage: 10,
    initialStatus: "",
    searchDelay: 1000,
  });

  const queryParams = `limit=${state.perPage}&page=${state.currentPage}&search=${state.search}`;

  const {
    data: bonusLogs,
    isLoading,
    error,
    isError,
    refetch,
  } = useGetGradualLayerBonusLogsQuery(queryParams);

  const TableData = bonusLogs?.data?.records || [];
  const totalItems =
    bonusLogs?.data?.pagination?.total || bonusLogs?.data?.total || 0;
  const totalPages = Math.ceil(totalItems / state.perPage) || 1;

  if (isError) {
    return (
      <div>
        <NOtfound />
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
      header: "User Name",
      render: (row) => (
        <span className="text-white font-medium">{row?.name || "N/A"}</span>
      ),
    },
    {
      header: "Total Amount",
      render: (row) => <span className=" ">{row?.amount}</span>,
    },
    {
      header: "Amount/Day",
      render: (row) => <span className="text-white">{row?.amountPerDay}</span>,
    },
    {
      header: "Duration",
      render: (row) => (
        <span className="text-xs">
          <span className="">{row?.disbursedDays || 0}</span>
          <span className="">/{row?.totalDays || 0} days</span>
        </span>
      ),
    },
    {
      header: "Transaction ID",
      render: (row) => <span className="">{row?.transactionId || "N/A"}</span>,
    },
    {
      header: "Created Date",
      render: (row) => (
        <span className="text-xs">{formatDateWithAmPm(row?.createdOn)}</span>
      ),
    },
    {
      header: "Position",
      render: (row) => <span className="">{row?.position || "N/A"}</span>,
    },
    {
      header: "Helped User",
      render: (row) => (
        <span className="text-xs">{row?.comssionHelpedUser || "N/A"}</span>
      ),
    },
    {
      header: "Percentage",
      render: (row) => <span className=" ">{row?.elegiblePercentag}%</span>,
    },
  ];

  return (
    <div>
      <div className="p-2 sm:p-2 space-y-6">
        {/* Top Controls */}

        {/* Main Table Card */}
        <div className="bg-[#282f35] border border-[#2a2c2f] rounded-lg  overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f] space-y-4">
            {/* Title */}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-end">
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

          {/* Desktop Table */}
          <div className="">
            <Table
              columns={columns}
              data={TableData}
              isLoading={isLoading}
              currentPage={state.currentPage}
              perPage={state.perPage}
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

export default GradualLayerBonusLogs;
