import React, { useState, useEffect } from "react";
import Table from "../../reusableComponents/Tables/Table";
import Pagination from "../../reusableComponents/paginations/Pagination";
import StatCard from "../../reusableComponents/StatCards/StatsCard";
import MobileCard from "../../reusableComponents/MobileCards/MobileCards";
import MobileCardList from "../../reusableComponents/MobileCards/MobileCardList";
import { useAllTransListQuery } from "../Wallet/walletApiSlice";
import PerPageSelector from "../../reusableComponents/Filter/PerPageSelector";
const AllTransactions = () => {
  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
  });

  const [selectedStatus, setSelectedStatus] = useState("Transaction Type");

  const queryParams = `limit=${state.perPage}&page=${state.currentPage}&search=${state.search}&transactionType=${
    selectedStatus === "Transaction Type" ? "" : selectedStatus
  }`;

  const {
    data: tableData,
    isLoading,
    refetch,
  } = useAllTransListQuery(queryParams);

  const transactions = tableData?.data?.transactions || [];
  const totalRecords = tableData?.data?.total || 0;
  const statusCounts = tableData?.data?.statusCounts;

  useEffect(() => {
    refetch();
  }, []);

  // Handlers
  const handlePageChange = (page) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setState((prev) => ({ ...prev, currentPage: 1 }));
  };

  let searchTimeout;
  const handleSearch = (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        search: e.target.value,
        currentPage: 1,
      }));
    }, 1000);
  };

  // Utility Functions
  const formatDateWithAmPm = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    let hours = date.getUTCHours();
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const amAndPm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day}-${month}-${year} ${hours}:${minutes} ${amAndPm}`;
  };

  const getCurrency = (countryCode, value) => {
    if (value === undefined || value === null) return "N/A";
    return countryCode === 91
      ? `₹${value?.toFixed(2)}`
      : `$${value?.toFixed(2)}`;
  };

  const getStatusStyle = (status) => {
    const map = {
      Completed: " text-green-400",
      Pending: "bg-yellow-500/10 text-yellow-400",
      Hold: "bg-blue-500/10 text-blue-400",
      Failed: "bg-red-500/10 text-red-400",
    };
    return map[status] || "bg-[#2a2c2f] text-[#8a8d93]";
  };

  // Desktop Table Columns
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
      header: "Payment Method",
      accessor: "paymentMode",
    },
    {
      header: "Transaction Type",
      render: (row) => (
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full `}
        >
          {row.transactionType}
        </span>
      ),
    },
    {
      header: "Transaction Amount",
      render: (row) => (
        <span
          className={`font-semibold `}
        >
          {(row.userId?.countryCode, row.transactionAmount)}
        </span>
      ),
    },
    {
      header: "Transaction ID",
      render: (row) =>
        row.screenshotUrl ? (
          <a
            href={row.screenshotUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline text-xs"
          >
            {row.transactionId}
          </a>
        ) : (
          <span className="">{row.transactionId}</span>
        ),
    },
    {
      header: "Transaction Date",
      render: (row) => (
        <span className="">
          {formatDateWithAmPm(row.transactionDate)}
        </span>
      ),
    },
    {
      header: "Updated By",
      render: (row) => (
        <span className="">
          {row.updatedBy?.name || "N/A"}
        </span>
      ),
    },
    {
      header: "Status",
      render: (row) => (
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${getStatusStyle(
            row.transactionStatus
          )}`}
        >
          {row.transactionStatus}
        </span>
      ),
    },
    {
      header: "Reason",
      render: (row) => (
        <span className="">{row.reason || "N/A"}</span>
      ),
    },
  ];

  // Mobile Card Builder
  const renderTransactionCard = (row, index) => {
    const sNo =
      state.currentPage * state.perPage - (state.perPage - 1) + index;

    return (
      <MobileCard
        key={row.transactionId || index}
        header={{
          avatar: row.name?.charAt(0)?.toUpperCase(),
          avatarBg: `${
            row.transactionType === "Credit"
              ? "bg-[#0ecb6f]/10 text-[#0ecb6f]"
              : "bg-red-500/10 text-red-400"
          }`,
          title: row.name,
          subtitle: `#${sNo} • ${row.transactionType}`,
          badge: row.transactionStatus,
          badgeClass: getStatusStyle(row.transactionStatus),
        }}
        rows={[
          {
            label: "Payment Method",
            value: row.paymentMode || "N/A",
          },
          {
            label: "Amount",
            value: getCurrency(row.userId?.countryCode, row.transactionAmount),
            highlight: true,
          },
          {
            label: "Transaction ID",
            custom: row.screenshotUrl ? (
              <a
                href={row.screenshotUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#eb660f] hover:underline text-xs 
                  truncate max-w-[60%] text-right"
              >
                {row.transactionId}
              </a>
            ) : (
              <span
                className="text-xs text-white truncate 
                max-w-[60%] text-right"
              >
                {row.transactionId}
              </span>
            ),
          },
          {
            label: "Date",
            value: formatDateWithAmPm(row.transactionDate),
          },
          {
            label: "Updated By",
            value: row.updatedBy?.name || "N/A",
          },
          {
            label: "Reason",
            value: row.reason || "N/A",
          },
        ]}
        actions={[]}
      />
    );
  };

  return (
    <div>
      <div className="p-2 sm:p-2 space-y-6">




        {/* Stats Cards */}
        {statusCounts && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Pending"
              value={statusCounts.Pending || 0}
              // valueClass="text-yellow-400"
            />
            <StatCard
              title="Completed"
              value={statusCounts.Completed || 0}
              // valueClass="text-[#0ecb6f]"
            />
            <StatCard
              title="Hold"
              value={statusCounts.Hold || 0}
              // valueClass="text-blue-400"
            />
            <StatCard
              title="Failed"
              value={statusCounts.Failed || 0}
              // valueClass="text-red-400"
            />
          </div>
        )}

        {/* Table Section */}
        <div
          className="bg-[#1b232d] border border-[#1b232d] rounded-lg 
          overflow-hidden"
        >
          {/* Table Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
            <div
              className="flex flex-col sm:flex-row items-start sm:items-center 
              justify-between gap-4"
            >
             
                      {/* Filters Row */}
        <div className="flex w-full">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto ml-auto">
           <PerPageSelector
  options={[10,20,40,60,80,100]}
  onChange={(value) =>
    setState((prev) => ({
      ...prev,
      perPage: value,
      currentPage: 1,
    }))
  }
/>

            {/* Transaction Type Filter */}
            <select
              value={selectedStatus}
              onChange={handleStatusChange}
              className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl 
                py-2.5 px-3 text-sm focus:outline-none focus:border-[#eb660f] 
                transition-colors cursor-pointer"
            >
              <option value="Transaction Type">All Types</option>
              <option value="Credit">Credit</option>
              <option value="Debit">Debit</option>
            </select>

            {/* Search */}
            <input
              type="text"
              autoComplete="off"
              placeholder="Search..."
              onChange={handleSearch}
              className="bg-[#111214] border border-[#2a2c2f] text-white 
                placeholder-[#555] rounded-xl py-2.5 px-4 text-sm 
                focus:outline-none focus:border-[#eb660f] focus:ring-1 
                focus:ring-[#eb660f]/50 transition-colors w-full sm:w-44"
            />
          </div>
        </div>

            </div>
          </div>

          {/* Desktop Table */}
          <div className="rounded-lg ">
            <Table
              columns={columns}
              data={transactions}
              isLoading={isLoading}
              currentPage={state.currentPage}
              perPage={state.perPage}
            />
          </div>


        </div>

        {/* Pagination */}
        {transactions?.length > 0 && (
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

export default AllTransactions;