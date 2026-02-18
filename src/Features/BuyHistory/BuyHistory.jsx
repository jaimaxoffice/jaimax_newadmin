// src/features/buyHistory/BuyHistory.jsx
import React, { useState, useEffect } from "react";
import Table from "../../reusableComponents/Tables/Table";
import MobileCard from "../../reusableComponents/MobileCards/MobileCards";
import MobileCardList from "../../reusableComponents/MobileCards/MobileCardList";
import StatCard from "../../reusableComponents/StatCards/StatsCard";
import Pagination from "../../reusableComponents/paginations/Pagination";
import { useBuyHistoryQuery } from "./buyhistoryApiSlice";
import SearchBar from "../../reusableComponents/searchBar/SearchBar";
import PerPageSelector from "../../reusableComponents/Filter/PerPageSelector";
import {formatDateWithAmPm} from "../../utils/dateUtils";
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
      render: (row) => <span className="">{row?.userId?.email || "N/A"}</span>,
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
      render: (row) => <span>{row.currency}</span>,
    },
    {
      header: "Jaimax Coins",
      render: (row) => (
        <span className=" ">{Number(row.jaimax)?.toFixed(3)}</span>
      ),
    },
    {
      header: "At Price",
      render: (row) => getCurrencyValue(row, "atPrice"),
    },
    {
      header: "Paid",
      render: (row) => (
        <span className="">{getCurrencyValue(row, "paid")}</span>
      ),
    },
    {
      header: "Status",
      render: (row) => (
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${getStatusStyle(
            row?.status,
          )}`}
        >
          {row?.status}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="p-2 sm:p-2 space-y-6">
        <div className="bg-[#1b232d] border border-[#2a2c2f] rounded-lg  overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              {/* Total Coins - Left */}
              <div className="flex items-center gap-2 rounded-xl py-1.5">
                <span className="text-sm text-[#8a8d93] font-medium">
                  Total Coins Sold:
                </span>
                <span className="text-lg font-semibold text-white">
                  {Number(totalCoins).toFixed(3)}
                </span>
              </div>

              {/* Filters - Right */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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
