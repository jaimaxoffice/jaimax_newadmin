// src/features/wealthPlan/WealthLogs3O.jsx
import React, { useState, useEffect, useCallback } from "react";
import Table from "../../../reusableComponents/Tables/Table";
import Pagination from "../../../reusableComponents/paginations/Pagination";
import { useGuaranteedWealthOrders3OMutation } from "../wealthPlanApiSlice";
import { formatDateWithAmPm } from "../../../utils/dateUtils";
import Badge from "../../../reusableComponents/Badges/Badge";
import SearchBar from "../../../reusableComponents/searchBar/SearchBar";
import PerPageSelector from "../../../reusableComponents/Filter/PerPageSelector";
import StatCards from "../../../reusableComponents/StatCards/StatsCard";
import {
  Banknote,
  Coins,
  LayoutGrid,
  Activity,
} from "lucide-react";

const WealthLogs3O = () => {
  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
  });

  const [trigger, { data, isLoading }] = useGuaranteedWealthOrders3OMutation();

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

  const handlePageChange = (page) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  };

  const columns = [
    {
      header: "S.No",
      render: (_, index) =>
        `${(state.currentPage - 1) * state.perPage + index + 1}.`,
    },
    {
      header: "User ID",
      render: (row) => <span className="">{row?.user?._id}</span>,
    },
    {
      header: "Order ID",
      render: (row) => <span className="">{row?._id}</span>,
    },
    {
      header: "Name",
      render: (row) => row?.user?.name,
    },
    {
      header: "Email",
      render: (row) => <span className="">{row?.user?.email}</span>,
    },
    {
      header: "Amount(₹)",
      render: (row) => <span className="font-medium">₹{row?.amount}</span>,
    },
    {
      header: "Tokens",
      accessor: "jaimax",
    },
    {
      header: "Wealth Plan Status",
      render: (row) => (
        <Badge type={row?.isGuaranteedWealthOpted_3 ? "success" : "danger"}>
          {row?.isGuaranteedWealthOpted_3 ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      header: "Everyday Amount",
      render: (row) => (
        <span className="text-yellow-400">
          {row?.guaranteedAmountToBeDisburse_3 || "—"}
        </span>
      ),
    },
    {
      header: "Everyday Tokens Collected",
      render: (row) => (
        <span className="text-yellow-400">
          {row?.guaranteedTokensToBeCollect_3 || "—"}
        </span>
      ),
    },
    {
      header: "Total Amount Disbursed",
      render: (row) => (
        <span className="text-yellow-400">
          {row?.totalAmountDisbursedForWealthPlan_3 || "—"}
        </span>
      ),
    },
    {
      header: "Total Coins Collected",
      render: (row) => (
        <span className="text-yellow-400">
          {row?.totalCoinsCollectedFormUser_3 || "—"}
        </span>
      ),
    },
    {
      header: "Total Days Collected",
      render: (row) => (
        <span className="text-yellow-400">
          {row?.wealthPalnDisbursedDays_3 || "—"}
        </span>
      ),
    },
    {
      header: "Wealth plan Completed",
      render: (row) => (
        <Badge type={row?.wealthPlanCompleted_3 ? "success" : "danger"}>
          {row?.wealthPlanCompleted_3 ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      header: "Created On",
      render: (row) => (
        <span className="">
          {formatDateWithAmPm(row?.guaranteedWealthPlanChosenDate_3)}
        </span>
      ),
    },
  ];

  return (
    <div className="p-2 sm:p-2 space-y-6">
      <div className="grid gap-4 w-full 
                  grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
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

      <div className="bg-[#282f35] border border-[#2a2c2f] rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
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
                clearTimeout(window._wealth3OSearchTimeout);
                window._wealth3OSearchTimeout = setTimeout(() => {
                  setState((prev) => ({
                    ...prev,
                    search: e.target.value,
                    currentPage: 1,
                  }));
                }, 1000);
              }}
              placeholder="Search by userId...."
            />
          </div>
        </div>

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

export default WealthLogs3O;