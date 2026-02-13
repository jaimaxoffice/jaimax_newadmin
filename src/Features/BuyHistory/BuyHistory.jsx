// src/features/buyHistory/BuyHistory.jsx
import React, { useState, useEffect } from "react";
import Table from "../../reusableComponents/Tables/Table";
import MobileCard from "../../reusableComponents/MobileCards/MobileCards";
import MobileCardList from "../../reusableComponents/MobileCards/MobileCardList";
import StatCard from "../../reusableComponents/StatCards/StatsCard";
import Pagination from "../../reusableComponents/paginations/Pagination";
import { useBuyHistoryQuery } from "./buyhistoryApiSlice";

const BuyHistory = () => {
  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
  });

  const queryParams = `limit=${state.perPage}&page=${state.currentPage}&search=${state.search}`;

  const {
    data: buyHistory,
    isLoading,
    refetch,
  } = useBuyHistoryQuery(queryParams);

  const TableData = buyHistory?.data?.withdrawRequests || [];
  const totalCoins = buyHistory?.data?.totalPurchasedCoins || 0;
  const totalRecords = buyHistory?.data?.pagination?.total || 0;

  useEffect(() => {
    refetch();
  }, []);

  // ─── Handlers ────────────────────────────────────────────────

  const handlePageChange = (page) =>
    setState((prev) => ({ ...prev, currentPage: page }));

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

  // ─── Helpers ─────────────────────────────────────────────────

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

  const getCurrencyValue = (data, field) => {
    if (field === "atPrice") {
      return data.currency === "INR"
        ? `₹${data.atPriceInr?.toFixed(5)}`
        : `$${data.atPriceUsdt?.toFixed(5)}`;
    }
    if (field === "paid") {
      return data.currency === "INR"
        ? `₹${data.amount?.toFixed(2)}`
        : `$${data.amount?.toFixed(2)}`;
    }
    return "N/A";
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === "pending") return "bg-yellow-500/10 text-yellow-400";
    if (s === "completed") return " text-green-400";
    return "bg-red-500/10 text-red-400";
  };

  // ─── Desktop Table Columns ──────────────────────────────────

  const columns = [
    {
      header: "S.No",
      render: (_, index) =>
        `${state.currentPage * state.perPage - (state.perPage - 1) + index}.`,
    },
    {
      header: "Name",
      render: (row) => row?.userId?.name || "N/A",
    },
    {
      header: "Email",
      render: (row) => (
        <span className="">
          {row?.userId?.email || "N/A"}
        </span>
      ),
    },
    {
      header: "Payment Method",
      accessor: "paymentMethod",
    },
    {
      header: "Purchased Date",
      render: (row) => formatDateWithAmPm(row.createdAt),
    },
    {
      header: "Round",
      accessor: "round",
    },
    {
      header: "Paid Currency",
      render: (row) => (
        <span
          
        >
          {row.currency}
        </span>
      ),
    },
    {
      header: "Jaimax Coins",
      render: (row) => (
        <span className="text-[#fff] font-semibold text-sm">
          {Number(row.jaimax)?.toFixed(3)}
        </span>
      ),
    },
    {
      header: "At Price",
      render: (row) => getCurrencyValue(row, "atPrice"),
    },
    {
      header: "Paid",
      render: (row) => (
        <span className="font-semibold">{getCurrencyValue(row, "paid")}</span>
      ),
    },
    {
      header: "Status",
      render: (row) => (
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${getStatusStyle(
            row?.status
          )}`}
        >
          {row?.status}
        </span>
      ),
    },
  ];

  // ─── Mobile Card Builder ────────────────────────────────────

  const renderBuyCard = (row, index) => {
    const sNo =
      state.currentPage * state.perPage - (state.perPage - 1) + index;

    return (
      <MobileCard
        key={row._id || index}
        header={{
          avatar: (row?.userId?.name?.charAt(0) || "?").toUpperCase(),
          avatarBg:
            row.currency === "INR"
              ? "bg-[#eb660f]/10 text-[#eb660f]"
              : "bg-blue-500/10 text-blue-400",
          title: row?.userId?.name || "N/A",
          subtitle: `#${sNo} • ${row.paymentMethod || "N/A"}`,
          badge: row?.status,
          badgeClass: getStatusStyle(row?.status),
        }}
        rows={[
          {
            label: "Email",
            value: row?.userId?.email || "N/A",
          },
          {
            label: "Purchased Date",
            value: formatDateWithAmPm(row.createdAt),
          },
          {
            label: "Round",
            value: row.round || "N/A",
          },
          {
            label: "Currency",
            custom: (
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  row.currency === "INR"
                    ? "bg-[#eb660f]/10 text-[#eb660f]"
                    : "bg-blue-500/10 text-blue-400"
                }`}
              >
                {row.currency}
              </span>
            ),
          },
          {
            label: "Jaimax Coins",
            value: Number(row.jaimax)?.toFixed(3),
            highlight: true,
          },
          {
            label: "At Price",
            value: getCurrencyValue(row, "atPrice"),
          },
          {
            label: "Paid",
            value: getCurrencyValue(row, "paid"),
            highlight: true,
          },
        ]}
      />
    );
  };

  // ─── Render ─────────────────────────────────────────────────

  return (
    <div>
      <div className="p-2 sm:p-2 space-y-6">
        {/* Top Controls */}
        <div className="flex w-full">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto ml-auto">
            {/* Per Page */}
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

            {/* Search */}
            <input
              type="text"
              autoComplete="off"
              placeholder="Search..."
              onChange={handleSearch}
              className="bg-[#111214] border border-[#2a2c2f] text-white placeholder-[#555]
                          rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#eb660f]
                          focus:ring-1 focus:ring-[#eb660f]/50 transition-colors w-full sm:w-44"
            />
          </div>
        </div>

        {/* Stat Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Coins Sold"
            value={Number(totalCoins).toFixed(3)}
            valueClass="text-[#eb660f]"
          />
        </div>

        {/* Main Table Card */}
        <div className="bg-[#1b232d] border border-[#2a2c2f] rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl bg-[#eb660f]/10 flex items-center 
                              justify-center text-[#eb660f]"
                >
                  <CartIcon />
                </div>
                <h1 className="text-lg font-semibold text-white">
                  Buy History
                </h1>
              </div>

              {/* Record Count */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8a8d93]">Total Records:</span>
                <span className="text-sm font-semibold text-white">
                  {totalRecords}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block">
            <Table
              columns={columns}
              data={TableData}
              isLoading={isLoading}
              currentPage={state.currentPage}
              perPage={state.perPage}
            />
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            <MobileCardList
              data={TableData}
              isLoading={isLoading}
              renderCard={renderBuyCard}
              emptyMessage="No buy history found"
            />
          </div>
        </div>

        {/* Pagination */}
        {TableData?.length > 0 && (
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

export default BuyHistory;

// ─── Icons ───────────────────────────────────────────────────────

const CartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);