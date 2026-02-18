// src/features/wealthPlan/WealthLogs2O.jsx
import React, { useState, useEffect, useCallback } from "react";
import Table from "../../../reusableComponents/Tables/Table";
import Pagination from "../../../reusableComponents/paginations/Pagination";
import MobileCard from "../../../reusableComponents/MobileCards/MobileCards";
import MobileCardList from "../../../reusableComponents/MobileCards/MobileCardList";
import { useGuarantededWealthPlanLogs2OMutation } from "../wealthPlanApiSlice";
import { formatDateWithAmPm } from "../../../utils/dateUtils";
import SearchBar from "../../../reusableComponents/searchBar/SearchBar";
import PerPageSelector from "../../../reusableComponents/Filter/PerPageSelector";
const WealthLogs2O = () => {
  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
  });

  const [trigger, { data, isLoading }] = useGuarantededWealthPlanLogs2OMutation();

  const fetchData = useCallback(() => {
    trigger({
      limit: state.perPage,
      page: state.currentPage,
      search: state.search,
    });
  }, [state.currentPage, state.perPage, state.search, trigger]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const tableData = data?.data?.logs || [];
  const totalRecords = data?.data?.totalLogs || 0;

  let searchTimeout;
  const handleSearch = (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      setState((prev) => ({ ...prev, search: e.target.value, currentPage: 1 }));
    }, 1000);
  };

  const handlePageChange = (page) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  };

  const getDay = (reason) => {
    const match = reason?.match(/day\s*\d+/i);
    return match ? match[0] : "—";
  };

  // Columns
  const columns = [
    {
      header: "S.No",
      render: (_, index, currentPage, perPage) =>
        currentPage * perPage - (perPage - 1) + index + ".",
    },
    { header: "Name", accessor: "name" },
    {
      header: "Transaction ID",
      render: (row) => (
        <span className="text-[#0ecb6f] text-xs font-mono">
          {row?.transactionId}
        </span>
      ),
    },
    {
      header: "Amount (₹)",
      render: (row) => (
        <span className="font-medium">₹{row?.amountDisbursed}</span>
      ),
    },
    { header: "Tokens", accessor: "tokensCollected" },
    {
      header: "Order ID",
      render: (row) => (
        <span className="text-blue-400 text-xs font-mono">
          {row?.orderId}
        </span>
      ),
    },
    {
      header: "Day",
      render: (row) => (
        <span className="text-yellow-400">{getDay(row?.reason)}</span>
      ),
    },
    {
      header: "Created On",
      render: (row) => (
        <span className="text-[#8a8d93]">
          {formatDateWithAmPm(row?.createdOn)}
        </span>
      ),
    },
  ];

  // Mobile Card
  const renderMobileCard = (row, index) => {
    const sNo = state.currentPage * state.perPage - (state.perPage - 1) + index;

    return (
      <MobileCard
        key={index}
        header={{
          avatar: row?.name?.charAt(0)?.toUpperCase() || "?",
          title: row?.name || "Unknown",
          subtitle: `#${sNo} • ${getDay(row?.reason)}`,
          badge: getDay(row?.reason),
          badgeClass: "bg-yellow-500/10 text-yellow-400",
        }}
        rows={[
          {
            label: "Transaction ID",
            custom: (
              <span className="text-[#0ecb6f] text-xs font-mono truncate max-w-[60%] text-right">
                {row?.transactionId}
              </span>
            ),
          },
          { label: "Amount", value: `₹${row?.amountDisbursed}`, highlight: true },
          { label: "Tokens", value: row?.tokensCollected },
          {
            label: "Order ID",
            custom: (
              <span className="text-blue-400 text-xs font-mono truncate max-w-[60%] text-right">
                {row?.orderId}
              </span>
            ),
          },
          { label: "Created On", value: formatDateWithAmPm(row?.createdOn) },
        ]}
      />
    );
  };

  return (
    <div className="p-2 sm:p-2 space-y-6">

      <div className="bg-[#1b232d] border border-[#2a2c2f] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-lg font-semibold text-white">
              Guaranteed Wealth Plan Logs 2.O
            </h1>
<div className="flex w-full">
  <div className="flex items-center gap-3 w-full sm:w-auto ml-auto">
    <PerPageSelector
      value={state.perPage}
      options={[10,20,40,60,80,100]}
      onChange={(value) =>
        setState((prev) => ({
          ...prev,
          perPage: value,
          currentPage: 1,
        }))
      }
    />

    <SearchBar
      onChange={handleSearch}
      placeholder="Search..."
    />
  </div>
</div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="">
          <Table
            columns={columns}
            data={tableData}
            isLoading={isLoading}
            currentPage={state.currentPage}
            perPage={state.perPage}
          />
        </div>


      </div>

      {/* Pagination */}
      {tableData?.length > 0 && (
        <Pagination
          currentPage={state.currentPage}
          totalPages={Math.ceil(totalRecords / state.perPage) || 1}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default WealthLogs2O;