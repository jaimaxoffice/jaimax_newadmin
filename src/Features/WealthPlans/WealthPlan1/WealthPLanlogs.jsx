import React, { useState, useEffect, useCallback } from "react";
import Table from "../../../reusableComponents/Tables/Table";
import Pagination from "../../../reusableComponents/paginations/Pagination";
import MobileCard from "../../../reusableComponents/MobileCards/MobileCards";
import MobileCardList from "../../../reusableComponents/MobileCards/MobileCardList";
import Badge from "../../../reusableComponents/Badges/Badge";
import { useGuarantededWealthPlanLogsMutation } from "../wealthPlanApiSlice";
import { formatDateWithAmPm } from "../../../utils/dateUtils";
import SearchBar from "../../../reusableComponents/searchBar/SearchBar";
import PerPageSelector from "../../../reusableComponents/Filter/PerPageSelector";
const WealthPlanLogs = () => {
  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
  });

  const [trigger, { data, isLoading }] = useGuarantededWealthPlanLogsMutation();

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

  // Helper to extract day from reason
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
          ₹{row?.amountDisbursed?.toFixed?.(2) || row?.amountDisbursed || "0.00"}
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
        <Badge type="warning">
          {extractDay(row?.reason)}
        </Badge>
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
          avatarBg: "bg-[#b9fd5c]/10 text-[#b9fd5c]",
          title: row?.name || "Unknown",
          subtitle: `#${sNo} • ${row?.orderId || "N/A"}`,
          badge: extractDay(row?.reason),
          badgeClass: "bg-yellow-500/10 text-yellow-400",
        }}
        rows={[
          {
            label: "Transaction ID",
            custom: (
              <span className="text-[#0ecb6f] text-xs font-mono truncate max-w-[60%] text-right">
                {row?.transactionId || "—"}
              </span>
            ),
          },
          {
            label: "Amount",
            custom: (
              <span className="text-[#b9fd5c] font-semibold text-sm">
                ₹{row?.amountDisbursed?.toFixed?.(2) || row?.amountDisbursed || "0.00"}
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
              <span className="text-blue-400 text-xs font-mono truncate max-w-[60%] text-right">
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
        <div className="bg-[#282f35] border border-[#2a2c2f] rounded-lg  overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h1 className="text-lg font-semibold text-white">
                Guaranteed Wealth Plan Logs
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
    </div>
  );
};

export default WealthPlanLogs;