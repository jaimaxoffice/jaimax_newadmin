// src/features/ico/IcoManagement.jsx
import React, { useState, useEffect } from "react";
import Table from "../../reusableComponents/Tables/Table";
import Pagination from "../../reusableComponents/paginations/Pagination";
import MobileCard from "../../reusableComponents/MobileCards/MobileCards";
import MobileCardList from "../../reusableComponents/MobileCards/MobileCardList";
import EditRoundModal from "./EditRoundModal";
import {
  useGetRoundQuery,
  useUpdateRoundMutation,
  useGetExchangeQuery,
} from "./icoApiSlice";
import { toast } from "react-toastify";

const IcoManagement = () => {
  const [currentEditData, setCurrentEditData] = useState(null);
  const [errors, setErrors] = useState({});
  const [refresh, setRefresh] = useState(false);
  const [editModal, setEditModal] = useState(false);

  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
  });

  const queryParams = `limit=${state.perPage}&page=${state.currentPage}&search=${state.search}`;

  const { data: getRound, isLoading, refetch } = useGetRoundQuery(queryParams);
  const { data: getExchange } = useGetExchangeQuery(queryParams);
  const [updateRound] = useUpdateRoundMutation();

  const TableData = getRound?.data?.rounds || [];
  const exchangeRate = getExchange?.data || 0;
  const totalRecords = getRound?.data?.pagination?.total || 0;

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

  // Edit
  const handleEdit = (data) => {
    setCurrentEditData({ ...data });
    setErrors({});
    setEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setCurrentEditData((prev) => ({ ...prev, [name]: value }));
  };

  // Currency Conversion
  const handleKeyUp = (event) => {
    const fieldName = event.target.name;
    try {
      if (fieldName === "atPriceUsdt") {
        const inrValue = event.target.value * exchangeRate;
        setCurrentEditData((prev) => ({
          ...prev,
          atPriceInr: inrValue?.toFixed(5),
        }));
      } else {
        const usdValue = event.target.value / exchangeRate;
        setCurrentEditData((prev) => ({
          ...prev,
          atPriceUsdt: usdValue?.toFixed(5),
        }));
      }
    } catch (error) {
      console.error("Error converting currency:", error);
    }
  };

  // Validation
  const validate = () => {
    let formErrors = {};

    if (!currentEditData.round) {
      formErrors.round = "Round is required";
    } else if (isNaN(currentEditData.round)) {
      formErrors.round = "Round must be a number";
    } else if (currentEditData.round < 0) {
      formErrors.round = "Round cannot be less than 0";
    }

    if (!currentEditData.atPriceUsdt) {
      formErrors.atPriceUsdt = "Price is required";
    } else if (isNaN(currentEditData.atPriceUsdt)) {
      formErrors.atPriceUsdt = "Price must be a number";
    } else if (currentEditData.atPriceUsdt < 0) {
      formErrors.atPriceUsdt = "Price cannot be less than 0";
    }

    if (!currentEditData.atPriceInr) {
      formErrors.atPriceInr = "Price is required";
    } else if (isNaN(currentEditData.atPriceInr)) {
      formErrors.atPriceInr = "Price must be a number";
    } else if (currentEditData.atPriceInr < 0) {
      formErrors.atPriceInr = "Price cannot be less than 0";
    }

    if (!currentEditData.totalQty) {
      formErrors.totalQty = "Total Quantity is required";
    } else if (isNaN(currentEditData.totalQty)) {
      formErrors.totalQty = "Total Quantity must be a number";
    } else if (currentEditData.totalQty < 0) {
      formErrors.totalQty = "Total Quantity cannot be less than 0";
    }

    if (!currentEditData.remaingQty) {
      formErrors.remaingQty = "Remaining Quantity is required";
    } else if (isNaN(currentEditData.remaingQty)) {
      formErrors.remaingQty = "Remaining Quantity must be a number";
    } else if (currentEditData.remaingQty < 0) {
      formErrors.remaingQty = "Remaining Quantity cannot be less than 0";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  // Update
  const handleUpdateRound = async () => {
    if (!validate()) return;

    try {
      await updateRound(currentEditData).unwrap();
      toast.success("Round Updated Successfully", { position: "top-center" });
      setEditModal(false);
      setRefresh(true);
    } catch (error) {
      toast.error(`${error?.data?.message}`, { position: "top-center" });
    }
  };

  useEffect(() => {
    refetch();
    if (refresh) {
      refetch();
      setRefresh(false);
    }
  }, [refresh, refetch]);

  useEffect(() => {
    return () => clearTimeout(searchTimeout);
  }, []);

  // Format Number
  const formatNum = (num, decimals = 3) => {
    if (num === undefined || num === null) return "0";
    return Number(num).toFixed(decimals);
  };

  // Desktop Columns
  const columns = [
    {
      header: "S.No",
      render: (_, index, currentPage, perPage) =>
        currentPage * perPage - (perPage - 1) + index + ".",
    },
    {
      header: "Round",
      render: (row) => (
        <span className="">
          Round {row.round}
        </span>
      ),
    },
    {
      header: "Price (USD)",
      render: (row) => `$${formatNum(row.atPriceUsdt, 5)}`,
    },
    {
      header: "Price (INR)",
      render: (row) => `₹${formatNum(row.atPriceInr, 2)}`,
    },
    {
      header: "Total Tokens",
      render: (row) => Number(row.totalQty).toLocaleString(),
    },
    {
      header: "Sold Tokens",
      render: (row) => (
        <span className="text-[#eb660f]">
          {formatNum(row.soldQty)}
        </span>
      ),
    },
    {
      header: "Remaining",
      render: (row) => (
        <span className="">
          {formatNum(row.remaingQty)}
        </span>
      ),
    },
    {
      header: "Action",
      render: (row) => (
        <button
          onClick={() => handleEdit(row)}
          title="Edit Round"
            className="text-[#eb660f] text-xs font-medium 
            bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          Edit
        </button>
      ),
    },
  ];

  // Progress Bar Helper
  const getProgress = (sold, total) => {
    if (!total || total === 0) return 0;
    return Math.min(((sold / total) * 100).toFixed(1), 100);
  };

  // Mobile Card
  const renderIcoCard = (row, index) => {
    const sNo = state.currentPage * state.perPage - (state.perPage - 1) + index;
    const progress = getProgress(row.soldQty, row.totalQty);

    return (
      <div
        key={row._id || index}
        className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-xl overflow-hidden"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#16181b]">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#555] font-mono">#{sNo}</span>
            <div className="w-9 h-9 rounded-full bg-[#0ecb6f]/10 flex items-center justify-center">
              <span className="text-[#0ecb6f] text-xs font-bold">
                R{row.round}
              </span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">
                Round {row.round}
              </p>
            </div>
          </div>
        </div>

        {/* Prices */}
        <div className="px-4 py-3 grid grid-cols-2 gap-3 border-b border-[#2a2c2f]/50">
          <div className="bg-[#111214] rounded-lg p-3 text-center">
            <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">
              USD
            </p>
            <p className="text-white text-sm font-semibold">
              ${formatNum(row.atPriceUsdt, 5)}
            </p>
          </div>
          <div className="bg-[#111214] rounded-lg p-3 text-center">
            <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">
              INR
            </p>
            <p className="text-white text-sm font-semibold">
              ₹{formatNum(row.atPriceInr, 2)}
            </p>
          </div>
        </div>

        {/* Token Info */}
        <div className="px-4 py-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8a8d93]">Total Tokens</span>
            <span className="text-xs text-white font-medium">
              {Number(row.totalQty).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8a8d93]">Sold</span>
            <span className="text-xs text-[#0ecb6f] font-medium">
              {formatNum(row.soldQty)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8a8d93]">Remaining</span>
            <span className="text-xs text-yellow-400 font-medium">
              {formatNum(row.remaingQty)}
            </span>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[#555]">Progress</span>
              <span className="text-[10px] text-[#0ecb6f] font-medium">
                {progress}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#2a2c2f] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0ecb6f] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="border-t border-[#2a2c2f]">
          <button
            onClick={() => handleEdit(row)}
            className="w-full py-2.5 text-xs font-medium text-blue-400 
              hover:bg-blue-500/5 transition-colors cursor-pointer"
          >
            Edit Round
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="p-2 sm:p-2 space-y-6">
        {/* Table Section */}
        <div className="bg-[#1b232d] border border-[#2a2c2f] rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-lg font-semibold text-white">
                  ICO Management
                </h1>
                {exchangeRate > 0 && (
                  <p className="text-xs text-[#555] mt-1">
                    Exchange Rate: 1 USD = ₹{exchangeRate}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      perPage: Number(e.target.value),
                      currentPage: 1,
                    }))
                  }
                  className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl 
                    py-2.5 px-3 text-sm focus:outline-none focus:border-[#0ecb6f] 
                    transition-colors cursor-pointer"
                >
                  <option value="10">10</option>
                  <option value="30">30</option>
                  <option value="50">50</option>
                </select>

                <input
                  type="text"
                  autoComplete="off"
                  placeholder="Search..."
                  onChange={handleSearch}
                  className="bg-[#111214] border border-[#2a2c2f] text-white placeholder-[#555] 
                    rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#0ecb6f] 
                    focus:ring-1 focus:ring-[#0ecb6f]/50 transition-colors w-full sm:w-44"
                />
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
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <MobileCard key={i} isLoading />
                ))}
              </div>
            ) : TableData.length === 0 ? (
              <div className="py-12 text-center text-[#555] text-sm">
                No rounds found
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {TableData.map((row, index) => renderIcoCard(row, index))}
              </div>
            )}
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

      {/* Edit Modal */}
      <EditRoundModal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        data={currentEditData}
        errors={errors}
        onChange={handleEditChange}
        onKeyUp={handleKeyUp}
        onUpdate={handleUpdateRound}
      />
    </>
  );
};

export default IcoManagement;