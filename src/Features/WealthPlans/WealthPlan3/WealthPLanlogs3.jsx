import React, { useState, useEffect, useCallback } from "react";
import Table from "../../../reusableComponents/Tables/Table";
import Pagination from "../../../reusableComponents/paginations/Pagination";
import MobileCard from "../../../reusableComponents/MobileCards/MobileCards";
import MobileCardList from "../../../reusableComponents/MobileCards/MobileCardList";
import Badge from "../../../reusableComponents/Badges/Badge";
import { useGuarantededWealthPlanLogs3OMutation } from "../wealthPlanApiSlice";
import { formatDateWithAmPm } from "../../../utils/dateUtils";
import SearchBar from "../../../reusableComponents/searchBar/SearchBar";
import PerPageSelector from "../../../reusableComponents/Filter/PerPageSelector";
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
      render: (row) => <span className="">{row?.transactionId || "—"}</span>,
    },
    {
      header: "Amount (₹)",
      render: (row) => (
        <span className="">
          ₹
          {row?.amountDisbursed?.toFixed?.(2) || row?.amountDisbursed || "0.00"}
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
      render: (row) => <span className="">{row?.orderId || "—"}</span>,
    },
    {
      header: "Day",
      render: (row) => <Badge type="warning">{extractDay(row?.reason)}</Badge>,
    },
    {
      header: "Created On",
      render: (row) => (
        <span className="">{formatDateWithAmPm(row?.createdOn)}</span>
      ),
    },
  ];

  return (
    <div>
      <div className="p-2 sm:p-2 space-y-6">
        {/* Filters Row */}

        {/* Table Card */}
        <div className="bg-[#1b232d] border border-[#2a2c2f] rounded-lg  overflow-hidden">
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

                  <SearchBar onChange={handleSearch} placeholder="Search..." />
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
