import React, { useState, useEffect, useCallback } from "react";
import Table from "../../../reusableComponents/Tables/Table";
import Pagination from "../../../reusableComponents/paginations/Pagination";
import MobileCard from "../../../reusableComponents/MobileCards/MobileCards";
import MobileCardList from "../../../reusableComponents/MobileCards/MobileCardList";
import Badge from "../../../reusableComponents/Badges/Badge";
import { useGuarantededWealthPlanLogs3OMutation } from "../wealthPlanApiSlice";
import { formatDateWithAmPm } from "../../../utils/dateUtils";

const Wealthlogs3O = () => {
  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
  });

  const [trigger, { data, isLoading }] =
    useGuarantededWealthPlanLogs3OMutation();

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

  const tableData = data?.data?.logs || [];
  const totalRecords = data?.data?.totalLogs || 0;

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

  // Helper
  const extractDay = (reason) => {
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
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Transaction ID",
      render: (row) => (
        <span className="">
          {row?.transactionId || "—"}
        </span>
      ),
    },
    {
      header: "Amount (₹)",
      render: (row) => (
        <span className="">
          ₹
          {row?.amountDisbursed?.toFixed?.(2) ||
            row?.amountDisbursed ||
            "0.00"}
        </span>
      ),
    },
    {
      header: "Tokens",
      render: (row) => (
        <span className="text-white font-medium text-sm">
          {row?.tokensCollected || 0}
        </span>
      ),
    },
    {
      header: "Order ID",
      render: (row) => (
        <span className="">
          {row?.orderId || "—"}
        </span>
      ),
    },
    {
      header: "Day",
      render: (row) => (
        <Badge type="warning">{extractDay(row?.reason)}</Badge>
      ),
    },
    {
      header: "Created On",
      render: (row) => (
        <span className="">
          {formatDateWithAmPm(row?.createdOn)}
        </span>
      ),
    },
  ];

  // Mobile Card
  const renderMobileCard = (row, index) => {
    const sNo =
      state.currentPage * state.perPage - (state.perPage - 1) + index;

    return (
      <MobileCard
        key={row?.transactionId || row?._id || index}
        header={{
          avatar: row?.name?.charAt(0)?.toUpperCase() || "?",
          avatarBg: "bg-[#eb660f]/10 text-[#eb660f]",
          title: row?.name || "Unknown",
          subtitle: `#${sNo} • ${row?.orderId || "N/A"}`,
          badge: extractDay(row?.reason),
          badgeClass: "bg-yellow-500/10 text-yellow-400",
        }}
        rows={[
          {
            label: "Transaction ID",
            custom: (
              <span
                className="text-[#0ecb6f] text-xs font-mono truncate 
                max-w-[60%] text-right"
              >
                {row?.transactionId || "—"}
              </span>
            ),
          },
          {
            label: "Amount",
            custom: (
              <span className="text-[#eb660f] font-semibold text-sm">
                ₹
                {row?.amountDisbursed?.toFixed?.(2) ||
                  row?.amountDisbursed ||
                  "0.00"}
              </span>
            ),
          },
          {
            label: "Tokens",
            value: row?.tokensCollected || 0,
            highlight: true,
          },
          {
            label: "Order ID",
            custom: (
              <span
                className="text-blue-400 text-xs font-mono truncate 
                max-w-[60%] text-right"
              >
                {row?.orderId || "—"}
              </span>
            ),
          },
          {
            label: "Created On",
            value: formatDateWithAmPm(row?.createdOn),
          },
        ]}
      />
    );
  };

  return (
    <div>
      <div className="p-2 sm:p-2 space-y-6">
        {/* Filters Row */}


        {/* Table Card */}
        <div className="bg-[#1b232d] border border-[#2a2c2f] rounded-2xl overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
            <div
              className="flex flex-col sm:flex-row items-start sm:items-center 
              justify-between gap-4"
            >
              <h1 className="text-lg font-semibold text-white">
                Guaranteed Wealth Plan Logs 3.O
              </h1>
                      <div className="flex w-full">
          <div className="flex items-center gap-3 w-full sm:w-auto ml-auto">
            <select
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  perPage: Number(e.target.value),
                  currentPage: 1,
                }))
              }
              className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl 
                py-2.5 px-3 text-sm focus:outline-none focus:border-[#eb660f] 
                transition-colors cursor-pointer"
            >
              <option value="10">10</option>
              <option value="30">30</option>
              <option value="50">50</option>
            </select>

            <input
              type="text"
              autoComplete="off"
              placeholder="Search by Order ID..."
              onChange={handleSearch}
              className="bg-[#111214] border border-[#2a2c2f] text-white 
                placeholder-[#555] rounded-xl py-2.5 px-4 text-sm 
                focus:outline-none focus:border-[#eb660f] focus:ring-1 
                focus:ring-[#eb660f]/50 transition-colors w-full sm:w-48"
            />
          </div>
        </div>
              
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

        {/* Pagination */}
        {tableData?.length > 0 && (
          <Pagination
            currentPage={state.currentPage}
            totalPages={Math.ceil(totalRecords / state.perPage) || 1}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default Wealthlogs3O;