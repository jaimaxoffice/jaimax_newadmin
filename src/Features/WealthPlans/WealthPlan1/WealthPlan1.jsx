// src/features/wealthPlan/WealthPlanOrders.jsx
import React, { useState, useEffect, useCallback } from "react";
import Table from "../../../reusableComponents/Tables/Table";
import Pagination from "../../../reusableComponents/paginations/Pagination";
import Badge from "../../../reusableComponents/Badges/Badge";
import { useGuaranteedWealthOrdersMutation } from "../wealthPlanApiSlice";
import { formatDateWithAmPm } from "../../../utils/dateUtils";
import SearchBar from "../../../reusableComponents/searchBar/SearchBar";
import PerPageSelector from "../../../reusableComponents/Filter/PerPageSelector";
import StatCards from "../../../reusableComponents/StatCards/StatsCard";

import {
  Users,
  UserCheck,
  Banknote,
  Coins,
  // Alternative options
  LayoutGrid,
  Activity,
  Wallet,
  CircleDollarSign,
  TrendingUp,
  ArrowDownToLine,
  HandCoins,
  PiggyBank,
} from "lucide-react";
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
          {row?.user?._id}
        </span>
      ),
    },
    {
      header: "Name",
      render: (row) => row?.user?.name,
    },
    {
      header: "Email",
      render: (row) => (
        <span className="">{row?.user?.email}</span>
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



  return (
    <div className="p-2 sm:p-2 space-y-6">

<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCards 
    title="Total Plans" 
    value={data?.data?.total || 0} 
    icon={LayoutGrid} 
    variant="default" 
  />
  <StatCards 
    title="Active Plans" 
    value={data?.data?.activeGuaranteedWealthCount || 0} 
    icon={Activity} 
    variant="completed" 
  />
  <StatCards 
    title="Amount To Disburse" 
    value={data?.data?.totalGuaranteedAmountToBeDisbursed || 0} 
    icon={Banknote} 
    variant="warning" 
  />
  <StatCards 
    title="Tokens To Collect" 
    value={data?.data?.totalGuaranteedTokensToBeCollected || 0} 
    icon={Coins} 
    variant="info" 
  />
</div>
      {/* Table Card */}
      <div className="bg-[#282f35] border border-[#2a2c2f] rounded-lg  overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
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