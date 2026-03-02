import React, { useState, useEffect, useRef } from "react";
import Table from "../../reusableComponents/Tables/Table";
import Pagination from "../../reusableComponents/paginations/Pagination";
import { useBonusHistoryQuery } from "./bonusApiSlice";
import SearchBar from "../../reusableComponents/searchBar/SearchBar";
import PerPageSelector from "../../reusableComponents/Filter/PerPageSelector";
import useTableState from "../../hooks/useTableState";
import NotFound from "../../reusableComponents/Tables/NoDataFound.jsx";
import { formatDateWithAmPm } from "../../utils/dateUtils.js";
const BonusHistory = () => {
  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
  });

  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  const queryParams = `limit=${state.perPage}&page=${state.currentPage}&search=${state.search}`;

  const {
    data: bonusHistory,
    isLoading,
    error,
    isError,
    refetch,
  } = useBonusHistoryQuery(queryParams);

  const TableData = bonusHistory?.data?.withdrawRequests || [];
  const bonusCoins = bonusHistory?.data?.totalBonusCoins || 0;
  const totalItems = bonusHistory?.data?.pagination?.total || 0;
  const totalPages = Math.ceil(totalItems / state.perPage) || 1;

  const handlePageChange = (page) =>
    setState((prev) => ({ ...prev, currentPage: page }));

  const handlePerPageChange = (e) =>
    setState((prev) => ({
      ...prev,
      perPage: parseInt(e.target.value),
      currentPage: 1,
    }));

  const handleSearch = (e) => {
    const value = e.target.value;
    if (value !== state.search) setIsSearching(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, search: value, currentPage: 1 }));
      setIsSearching(false);
    }, 600);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isError) {
    return (
      <div>
        <NotFound />
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
      header: "Name",
      render: (row) => (
        <span className="text-white font-medium">{row?.name || "N/A"}</span>
      ),
    },
    {
      header: "Email",
      render: (row) => <span className="">{row?.email || "N/A"}</span>,
    },
    {
      header: "Transaction Amount",
      render: (row) => <span className="">{row?.transactionAmount}</span>,
    },
    {
      header: "Transaction Type",
      render: (row) => (
        <span className={``}>{row?.transactionType || "N/A"}</span>
      ),
    },
    {
      header: "Transaction ID",
      render: (row) => <span className="">{row?.transactionId || "N/A"}</span>,
    },
    {
      header: "Helped User",
      render: (row) => (
        <span className="text-xs">{row?.comssionHelpedUser || "N/A"}</span>
      ),
    },
    {
      header: "Transaction Date",
      render: (row) => (
        <span className="text-xs">
          {formatDateWithAmPm(row?.transactionDate)}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="p-2 sm:p-2 space-y-6">
        <div className="bg-[#282f35]  rounded-lg  overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f] space-y-4">
            {/* Filters - Right */}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-end">
              <div className=" items-left gap-2 rounded-xl py-1.5">
                <span className="text-sm text-[#8a8d93] font-medium">
                  Total Bonus Coins :
                </span>
                <span className="text-lg font-semibold text-white">
                  {Number(bonusHistory?.data?.totalBonusCoins).toFixed(3)}
                </span>
              </div>
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
                onSearch={handleSearch}
                placeholder={
                  isSearching ? "Searching..." : "Search name, email..."
                }
              />
            </div>
          </div>

          {/* Desktop Table */}
          <div className="rounded-lg ">
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

export default BonusHistory;
