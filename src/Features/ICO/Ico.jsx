// src/features/ico/IcoManagement.jsx
import React, { useState, useEffect } from "react";
import Table from "../../reusableComponents/Tables/Table";
import Pagination from "../../reusableComponents/paginations/Pagination";
import EditRoundModal from "./EditRoundModal";
import {
  useGetRoundQuery,
  useUpdateRoundMutation,
  useGetExchangeQuery,
} from "./icoApiSlice";
import { toast } from "react-toastify";
import SearchBar from "../../reusableComponents/searchBar/SearchBar";
import Loader from "../../reusableComponents/Loader/Loader";
import PerPageSelector from "../../reusableComponents/Filter/PerPageSelector";
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
      render: (row) => <span className="">Round {row.round}</span>,
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
        <span className="text-[#b9fd5c]">{formatNum(row.soldQty)}</span>
      ),
    },
    {
      header: "Remaining",
      render: (row) => <span className="">{formatNum(row.remaingQty)}</span>,
    },
    {
      header: "Action",
      render: (row) => (
        <button
          onClick={() => handleEdit(row)}
          title="Edit Round"
          className="text-[#b9fd5c] text-xs font-medium 
            bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          Edit
        </button>
      ),
    },
  ];


  return (
    <>
      <div className="p-2 sm:p-2 space-y-6">
        {/* Table Section */}
        <div className="bg-[#282f35] border border-[#303f50] rounded-lg  overflow-hidden">
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

                  <SearchBar
                    onSearch={handleSearch}
                    placeholder="Search username..."
                  />
                </div>
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
