// src/features/wealthPlan/WealthPlanOrders.jsx
import React, { useState, useEffect, useCallback } from "react";
import Table from "../../../reusableComponents/Tables/Table";
import Pagination from "../../../reusableComponents/paginations/Pagination";
import MobileCard from "../../../reusableComponents/MobileCards/MobileCards";
import MobileCardList from "../../../reusableComponents/MobileCards/MobileCardList";
import Badge from "../../../reusableComponents/Badges/Badge";
import { useGuaranteedWealthOrdersMutation } from "../wealthPlanApiSlice";
import { formatDateWithAmPm } from "../../../utils/dateUtils";
import SearchBar from "../../../reusableComponents/searchBar/SearchBar";
import PerPageSelector from "../../../reusableComponents/Filter/PerPageSelector";
const WealthPlanOrders = () => {
  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
  });

  const [trigger, { data, isLoading }] = useGuaranteedWealthOrdersMutation();

  // Fetch
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

  const tableData = data?.data?.data || [];
  const totalRecords = data?.data?.total || 0;

  // Search
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

  // Columns
  const columns = [
    {
      header: "S.No",
      render: (_, index, currentPage, perPage) =>
        currentPage * perPage - (perPage - 1) + index + ".",
    },
    {
      header: "User ID",
      render: (row) => (
        <span className="">
          {row?.userId?._id?.slice(-8)}
        </span>
      ),
    },
    {
      header: "Name",
      render: (row) => row?.userId?.name,
    },
    {
      header: "Email",
      render: (row) => (
        <span className="">{row?.userId?.email}</span>
      ),
    },
    {
      header: "Amount",
      render: (row) => (
        <span className="font-medium">₹{row?.amount}</span>
      ),
    },
    {
      header: "Tokens",
      accessor: "jaimax",
    },
    {
      header: "Wealth Plan",
      render: (row) => (
        <Badge type={row?.isGuaranteedWealthOpted ? "success" : "danger"}>
          {row?.isGuaranteedWealthOpted ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      header: "Daily Amount",
      render: (row) => (
        <span className="text-yellow-400">
          {row?.guaranteedAmountToBeDisburse || "—"}
        </span>
      ),
    },
    {
      header: "Daily Tokens",
      render: (row) => (
        <span className="text-yellow-400">
          {row?.guaranteedTokensToBeCollect || "—"}
        </span>
      ),
    },
    {
      header: "Total Disbursed",
      render: (row) => (
        <span className="text-yellow-400">
          {row?.totalAmountDisbursedForWealthPlan || "—"}
        </span>
      ),
    },
    {
      header: "Coins Collected",
      render: (row) => (
        <span className="text-yellow-400">
          {row?.totalCoinsCollectedFormUser || "—"}
        </span>
      ),
    },
    {
      header: "Days",
      render: (row) => (
        <span className="text-yellow-400">
          {row?.wealthPalnDisbursedDays || "—"}
        </span>
      ),
    },
    {
      header: "Completed",
      render: (row) => (
        <Badge type={row?.wealthPlanCompleted ? "success" : "danger"}>
          {row?.wealthPlanCompleted ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      header: "Created On",
      render: (row) => (
        <span className="">
          {formatDateWithAmPm(row?.guaranteedWealthPlanChosenDate)}
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
          avatar: row?.userId?.name?.charAt(0)?.toUpperCase() || "?",
          title: row?.userId?.name || "Unknown",
          subtitle: `#${sNo} • ${row?.userId?.email}`,
          badge: row?.wealthPlanCompleted ? "Completed" : "In Progress",
          badgeClass: row?.wealthPlanCompleted
            ? "bg-[#b9fd5c]/10 text-[#b9fd5c]"
            : "bg-yellow-500/10 text-yellow-400",
        }}
        rows={[
          { label: "Amount", value: `₹${row?.amount}`, highlight: true },
          { label: "Tokens", value: row?.jaimax },
          {
            label: "Wealth Plan",
            custom: (
              <Badge type={row?.isGuaranteedWealthOpted ? "success" : "danger"}>
                {row?.isGuaranteedWealthOpted ? "Yes" : "No"}
              </Badge>
            ),
          },
          { label: "Daily Amount", value: row?.guaranteedAmountToBeDisburse || "—" },
          { label: "Daily Tokens", value: row?.guaranteedTokensToBeCollect || "—" },
          { label: "Total Disbursed", value: row?.totalAmountDisbursedForWealthPlan || "—" },
          { label: "Coins Collected", value: row?.totalCoinsCollectedFormUser || "—" },
          { label: "Days", value: row?.wealthPalnDisbursedDays || "—" },
          { label: "Created On", value: formatDateWithAmPm(row?.guaranteedWealthPlanChosenDate) },
        ]}
      />
    );
  };

  return (
    <div className="p-2 sm:p-2 space-y-6">


      {/* Table Card */}
      <div className="bg-[#282f35] border border-[#2a2c2f] rounded-lg  overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-lg font-semibold text-white">
              Guaranteed Wealth Plan Orders
            </h1>
<div className="flex w-full">
  <div className="flex items-center gap-3 w-full sm:w-auto ml-auto">
    <PerPageSelector
      value={state.perPage}
      options={[10, 30, 50]}
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

export default WealthPlanOrders;