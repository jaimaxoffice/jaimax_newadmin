import React, { useState } from "react";
import { useGetAdminWalletTxsQuery } from "./miningApiSlice";
import Table from "../../reusableComponents/Tables/Table";
import Pagination from "../../reusableComponents/paginations/Pagination";
import { formatDateTimeSimple } from "../../utils/dateUtils";
const WalletTransactions = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
  });
const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const { data, isLoading, isError, error } = useGetAdminWalletTxsQuery(filters);
  const transactions = data?.data?.txs || [];
  const totalPages = data?.data?.pagination?.totalPages || 1;

  const columns = [
    {
      header: "S.No",
      accessor: "sno", // optional accessor
      // minWidth: "80px",
      render: (row, rowIndex, currentPage, perPage) => (
        <div className="text-center font-semibold text-white">
          {(currentPage - 1) * perPage + rowIndex + 1}
        </div>
      )
    },

    {
      header: "User ID",
      accessor: "userId",
      render: (row) => (
        <div className="flex items-center justify-center">

          <div className="ml-3">
            <div className="text-xs font-regular text-white">
              {row.userId}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: "type",
      minWidth: "150px",
      render: (row) => (
        <div className="text-xs font-regular text-white">
              {row.type}
            </div>
      ),
    },
    {
      header: "Direction",
      accessor: "direction",
      minWidth: "120px",
      render: (row) => (
        <div className="text-xs font-regular text-white">
              {row.direction}
            </div>
      ),
    },
    {
      header: "Amount",
      accessor: "amount",
      minWidth: "130px",
      render: (row) => (
        <span
          className={`font-bold ${row.direction === "credit" ? "text-green-400" : "text-red-400"
            }`}
        >
          {row.direction === "credit" ? "+" : "-"}{row.amount?.toLocaleString()} jmc
        </span>
      ),
    },
    {
      header: "Balance Before",
      accessor: "balanceBefore",
      minWidth: "130px",
      render: (row) => (
        <span className="text-gray-300">{row.balanceBefore?.toLocaleString()} jmc</span>
      ),
    },
    {
      header: "Balance After",
      accessor: "balanceAfter",
      // minWidth: "130px",
      render: (row) => (
        <span className="text-white font-semibold">
          {row.balanceAfter?.toLocaleString()} jmc
        </span>
      ),
    },
    {
      header: "Reference",
      accessor: "referenceType",
      render: (row) => (
        <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
          {row.referenceType || "N/A"}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: "createdAt",
      render: (row) => (
        <div>
          <div className="text-xs text-white">
            {formatDateTimeSimple(row.createdAt)}
          </div>

        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Table
        columns={columns}
        data={transactions}
        isLoading={isLoading}
        currentPage={filters.page}
        perPage={filters.limit}
        noDataTitle="No Wallet Transactions Found"
        noDataMessage="There are no wallet transactions matching your filters."
        noDataIcon="wallet"
      />

      {/* Pagination */}
      {transactions.length > 0 && (
        <Pagination
          currentPage={filters.page}
          totalPages={totalPages}
          onPageChange={(page) => handleFilterChange("page", page)}
        />
      )}
    </div>
  );
};



const DirectionBadge = ({ direction }) => {
  const config = {
    credit: { bg: "bg-green-300", text: "text-black", icon: "↓" },
    debit: { bg: "bg-red-600", text: "text-white", icon: "↑" },
  };

  const { bg, text, icon } = config[direction] || config.credit;

  return (
    <span
      className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${bg} ${text}`}
    >
      <span className="mr-1">{icon}</span>
      {direction}
    </span>
  );
};

const TypeBadge = ({ type }) => {
  const typeConfig = {
    deposit: "bg-blue-600 text-white",
    withdrawal: "bg-purple-600 text-white",
    mining: "bg-emerald-600 text-white",
    referral_reward: "bg-[#b9fd5c] text-black",
  };

  return (
    <span
      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${typeConfig[type] || "bg-gray-600 text-black"
        }`}
    >
      {type?.replace(/_/g, " ")}
    </span>
  );
};

export default WalletTransactions;