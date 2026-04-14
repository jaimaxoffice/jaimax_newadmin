// components/admin/mine/MineLogs.jsx
import React, { useState } from "react";
import { useGetAdminMineLogsQuery } from "./miningApiSlice";
import Table from "../../reusableComponents/Tables/Table";
import Pagination from "../../reusableComponents/paginations/Pagination";
import { formatDateTimeSimple } from "../../utils/dateUtils";

const MineLogs = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useGetAdminMineLogsQuery(filters);

  const logs = data?.data?.logs || [];
  const totalPages = data?.data?.pagination?.totalPages || 1;

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Define table columns
  const columns = [
    {
      header: "S.No",
      accessor: "sno",
      minWidth: "80px",
      render: (row, rowIndex, currentPage, perPage) => (
        <div className="text-center font-semibold text-white">
          {(currentPage - 1) * perPage + rowIndex + 1}
        </div>
      )
    },
    {
      header: "User ID",
      accessor: "userId",
      minWidth: "200px",
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
      header: "Mine Date",
      accessor: "mineDate",
      minWidth: "130px",
      render: (row) => (
        <div className="text-xs text-white">
          {formatDateTimeSimple(row.mineDate)}
        </div>
      ),
    },
    {
      header: "Slot Number",
      accessor: "slotNumber",
      minWidth: "120px",
      render: (row) => (
        <span className="px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full  text-white">
          Slot {row.slotNumber}
        </span>
      ),
    },
    {
      header: "Base Reward",
      accessor: "baseReward",
      minWidth: "130px",
      render: (row) => (
        <span className="text-xs font-regular text-white">
          {row.baseReward?.toLocaleString()} jmc
        </span>
      ),
    },
    {
      header: "Actual Reward",
      accessor: "actualReward",
      minWidth: "130px",
      render: (row) => (
        <span className="text-xs  text-white">
          {row.actualReward?.toLocaleString()} jmc
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      minWidth: "120px",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Mined At",
      accessor: "minedAt",
      minWidth: "150px",
      render: (row) => (
        <div className="text-xs text-white">
          {formatDateTimeSimple(row.minedAt)}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">

      {/* Table */}
      <Table
        columns={columns}
        data={logs}
        isLoading={isLoading}
        currentPage={filters.page}
        perPage={filters.limit}
        noDataTitle="No Mining Logs Found"
        noDataMessage="There are no mining logs matching your filters."
        noDataIcon="pickaxe"
      />

      {/* Pagination */}
      {logs.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={filters.page}
            totalPages={totalPages}
            onPageChange={(page) => handleFilterChange("page", page)}
          />
        </div>
      )}
    </div>
  );
};

// StatCard Component
const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-gradient-to-br ${color} rounded-lg p-6 text-white shadow-lg`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm opacity-90 mb-1">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className="bg-white bg-opacity-20 p-3 rounded-full">
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  </div>
);

// StatusBadge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    claimed: {
      bg: "bg-green-600",
      text: "text-white",
    },
    pending: {
      bg: "bg-yellow-600",
      text: "text-white",
    }, 
    expired: {
      bg: "bg-red-600",
      text: "text-white",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text}`}
    >
      <span className="mr-1">{config.icon}</span>
      {status}
    </span>
  );
};

export default MineLogs;