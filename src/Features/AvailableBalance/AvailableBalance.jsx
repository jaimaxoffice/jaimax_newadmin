// // src/features/availableBalance/AvailableBalance.jsx
// import React, { useState, useEffect } from "react";
// import Table from "../../reusableComponents/Tables/Table";
// import Pagination from "../../reusableComponents/paginations/Pagination";
// import { useAvailableBalanceQuery } from "./availablebalanceApiSlice";
// import SearchBar from "../../reusableComponents/searchBar/SearchBar";
// import PerPageSelector from "../../reusableComponents/Filter/PerPageSelector";
// import useTableState from "../../hooks/useTableState";
// import NotFound from "../../reusableComponents/Tables/NoDataFound";

// const AvailableBalance = () => {
//   const {
//     state,
//     setState,
//     handlePageChange,
//   } = useTableState({
//     initialPerPage: 10,
//     initialStatus: "",
//     searchDelay: 1000,
//   });

//   const [amountFilter, setAmountFilter] = useState({
//     amountType: "preset",
//     presetAmount: "",
//     minAmount: "",
//     maxAmount: "",
//   });

//   const amountOptions = [
//     { value: "", label: "All Amounts" },
//     { value: "500", label: "₹500" },
//     { value: "1000", label: "₹1,000" },
//     { value: "5000", label: "₹5,000" },
//     { value: "10000", label: "₹10,000" },
//     { value: "20000", label: "₹20,000" },
//     { value: "50000", label: "₹50,000" },
//     { value: "100000", label: "₹1,00,000" },
//     { value: "custom", label: "Custom Range" },
//   ];

//   let queryParams = `limit=${state.perPage}&page=${state.currentPage}&search=${state.search}`;
//   if (amountFilter.minAmount !== "" && amountFilter.maxAmount !== "") {
//     queryParams += `&minAmount=${amountFilter.minAmount}&maxAmount=${amountFilter.maxAmount}`;
//   }

//   const {
//     data: availableBalance,
//     isLoading,
//     isError,
//     refetch,
//   } = useAvailableBalanceQuery(queryParams);

//   const TableData = availableBalance?.data?.users || [];
//   const totalItems = availableBalance?.data?.pagination?.total || 0;
//   const totalPages = Math.ceil(totalItems / state.perPage) || 1;

//   useEffect(() => {
//     refetch();
//   }, [refetch]);

//   const handleAmountChange = (e) => {
//     const value = e.target.value;
//     if (value === "custom") {
//       setAmountFilter({
//         amountType: "custom",
//         presetAmount: value,
//         minAmount: "",
//         maxAmount: "",
//       });
//     } else if (value) {
//       setAmountFilter({
//         amountType: "preset",
//         presetAmount: value,
//         minAmount: "0",
//         maxAmount: value,
//       });
//     } else {
//       setAmountFilter({
//         amountType: "preset",
//         presetAmount: "",
//         minAmount: "",
//         maxAmount: "",
//       });
//     }
//     setState((prev) => ({ ...prev, currentPage: 1 }));
//   };

//   if (isError) {
//     return (
//       <div>
//         <NotFound />
//       </div>
//     );
//   }

//   const formatCurrency = (amount) => {
//     if (amount === null || amount === undefined) return "₹0";
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(amount);
//   };

//   const columns = [
//     {
//       header: "S.No",
//       render: (_, index) =>
//         `${(state.currentPage - 1) * state.perPage + index + 1}.`,
//     },
//     {
//       header: "Name",
//       render: (row) => (
//         <span className="text-white font-medium">{row?.name || "N/A"}</span>
//       ),
//     },
//     {
//       header: "Username",
//       render: (row) => <span className="">{row?.username || "N/A"}</span>,
//     },
//     {
//       header: "Email",
//       render: (row) => <span className="">{row?.email || "N/A"}</span>,
//     },
//     {
//       header: "Balance (INR)",
//       render: (row) => <span>{formatCurrency(row?.Inr)}</span>,
//     },
//     {
//       header: "Status",
//       render: () => (
//         <span
//           className="text-[11px] font-semibold px-2 py-0.5 rounded-full
//                      bg-[#b9fd5c]/10 text-[#b9fd5c]"
//         >
//           Active
//         </span>
//       ),
//     },
//   ];

//   return (
//     <div>
//       <div className="p-2 sm:p-2 space-y-6">
//         {/* Main Table Card */}
//         <div className="bg-[#282f35] rounded-lg overflow-hidden">
//           {/* Header */}
//           <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f] space-y-4">
//             <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
//               {/* Left: Amount Filter */}
//               <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
//                 <div>
//                   <label className="text-[#8a8d93] text-xs font-medium mb-1.5 block">
//                     Filter by Amount
//                   </label>
//                   <select
//                     value={amountFilter.presetAmount}
//                     onChange={handleAmountChange}
//                     disabled={isLoading}
//                     className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
//                        py-2.5 px-3 text-sm focus:outline-none focus:border-[#b9fd5c]
//                        transition-colors cursor-pointer disabled:opacity-50 min-w-40"
//                   >
//                     {amountOptions.map((option) => (
//                       <option key={option.value} value={option.value}>
//                         {option.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Custom Range Inputs */}
//                 {amountFilter.amountType === "custom" &&
//                   amountFilter.presetAmount === "custom" && (
//                     <div className="flex items-end gap-2">
//                       <div>
//                         <label className="text-[#8a8d93] text-xs font-medium mb-1.5 block">
//                           Min
//                         </label>
//                         <input
//                           type="number"
//                           placeholder="₹ Min"
//                           value={amountFilter.minAmount}
//                           onChange={(e) => {
//                             setAmountFilter((prev) => ({
//                               ...prev,
//                               minAmount: e.target.value,
//                             }));
//                             setState((prev) => ({ ...prev, currentPage: 1 }));
//                           }}
//                           className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
//                              py-2.5 px-3 text-sm focus:outline-none focus:border-[#b9fd5c]
//                              transition-colors w-28"
//                         />
//                       </div>
//                       <span className="text-[#8a8d93] text-sm pb-2.5">–</span>
//                       <div>
//                         <label className="text-[#8a8d93] text-xs font-medium mb-1.5 block">
//                           Max
//                         </label>
//                         <input
//                           type="number"
//                           placeholder="₹ Max"
//                           value={amountFilter.maxAmount}
//                           onChange={(e) => {
//                             setAmountFilter((prev) => ({
//                               ...prev,
//                               maxAmount: e.target.value,
//                             }));
//                             setState((prev) => ({ ...prev, currentPage: 1 }));
//                           }}
//                           className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
//                              py-2.5 px-3 text-sm focus:outline-none focus:border-[#b9fd5c]
//                              transition-colors w-28"
//                         />
//                       </div>
//                     </div>
//                   )}
//               </div>

//               {/* Right: Per Page + Search */}
//               <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
//                 <PerPageSelector
//                   options={[10, 20, 40, 60, 80, 100]}
//                   onChange={(value) =>
//                     setState((prev) => ({
//                       ...prev,
//                       perPage: value,
//                       currentPage: 1,
//                     }))
//                   }
//                 />

//                 <SearchBar
//                   onSearch={(e) => {
//                     clearTimeout(window._searchTimeout);
//                     window._searchTimeout = setTimeout(() => {
//                       setState((prev) => ({
//                         ...prev,
//                         search: e.target.value,
//                         currentPage: 1,
//                       }));
//                     }, 1000);
//                   }}
//                   placeholder="Search..."
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Desktop Table */}
//           <div className="rounded-lg">
//             <Table
//               columns={columns}
//               data={TableData}
//               isLoading={isLoading}
//               currentPage={state.currentPage}
//               perPage={state.perPage}
//             />
//           </div>
//         </div>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <Pagination
//             currentPage={state.currentPage}
//             totalPages={totalPages}
//             onPageChange={handlePageChange}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default AvailableBalance;


// src/features/availableBalance/AvailableBalance.jsx
import React, { useState, useEffect } from "react";
import Table from "../../reusableComponents/Tables/Table";
import Pagination from "../../reusableComponents/paginations/Pagination";
import { useAvailableBalanceQuery } from "./availablebalanceApiSlice";
import SearchBar from "../../reusableComponents/searchBar/SearchBar";
import PerPageSelector from "../../reusableComponents/Filter/PerPageSelector";
import useTableState from "../../hooks/useTableState";
import NotFound from "../../reusableComponents/Tables/NoDataFound";

const AvailableBalance = () => {
  const { state, setState, handlePageChange } = useTableState({
    initialPerPage: 10,
    initialStatus: "",
    searchDelay: 1000,
  });

  const [amountFilter, setAmountFilter] = useState({
    amountType: "preset",
    presetAmount: "",
    minAmount: "",
    maxAmount: "",
  });

  const [amountError, setAmountError] = useState("");

  const amountOptions = [
    { value: "", label: "All Amounts" },
    { value: "500", label: "₹500" },
    { value: "1000", label: "₹1,000" },
    { value: "5000", label: "₹5,000" },
    { value: "10000", label: "₹10,000" },
    { value: "20000", label: "₹20,000" },
    { value: "50000", label: "₹50,000" },
    { value: "100000", label: "₹1,00,000" },
    { value: "custom", label: "Custom Range" },
  ];

  // Strict validation check
  const getAmountValidation = (min, max) => {
    if (min === "" || max === "") return { valid: false, error: "" };

    const minVal = Number(min);
    const maxVal = Number(max);

    if (isNaN(minVal) || isNaN(maxVal)) {
      return { valid: false, error: "Please enter valid numbers" };
    }
    if (minVal < 0) {
      return { valid: false, error: "Min amount cannot be negative" };
    }
    if (maxVal < 0) {
      return { valid: false, error: "Max amount cannot be negative" };
    }
    if (minVal === maxVal) {
      return { valid: false, error: "Min and Max cannot be equal" };
    }
    if (minVal > maxVal) {
      return { valid: false, error: "Min amount cannot be greater than Max amount" };
    }
    if (maxVal <= 0) {
      return { valid: false, error: "Max amount must be greater than 0" };
    }

    return { valid: true, error: "" };
  };

  const { valid: isAmountRangeValid } = getAmountValidation(
    amountFilter.minAmount,
    amountFilter.maxAmount
  );

  // Build query params — ONLY include amount when fully valid
  let queryParams = `limit=${state.perPage}&page=${state.currentPage}&search=${state.search}`;

  if (
    amountFilter.minAmount !== "" &&
    amountFilter.maxAmount !== "" &&
    isAmountRangeValid
  ) {
    queryParams += `&minAmount=${amountFilter.minAmount}&maxAmount=${amountFilter.maxAmount}`;
  }

  const {
    data: availableBalance,
    isLoading,
    isError,
    error,
    refetch,
  } = useAvailableBalanceQuery(queryParams);

  // Handle API-level error message
  const apiErrorMessage =
    error?.data?.message || error?.error || "";

  const TableData = availableBalance?.data?.users || [];
  const totalItems = availableBalance?.data?.pagination?.total || 0;
  const totalPages = Math.ceil(totalItems / state.perPage) || 1;

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmountError("");

    if (value === "custom") {
      setAmountFilter({
        amountType: "custom",
        presetAmount: value,
        minAmount: "",
        maxAmount: "",
      });
    } else if (value) {
      setAmountFilter({
        amountType: "preset",
        presetAmount: value,
        minAmount: "0",
        maxAmount: value,
      });
    } else {
      setAmountFilter({
        amountType: "preset",
        presetAmount: "",
        minAmount: "",
        maxAmount: "",
      });
    }
    setState((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleMinChange = (e) => {
    const value = e.target.value;

    // Prevent negative input
    if (value !== "" && Number(value) < 0) return;

    const newFilter = { ...amountFilter, minAmount: value };
    setAmountFilter(newFilter);

    const { error } = getAmountValidation(value, newFilter.maxAmount);
    setAmountError(error);

    // Only reset page if range becomes valid
    const { valid } = getAmountValidation(value, newFilter.maxAmount);
    if (valid) {
      setState((prev) => ({ ...prev, currentPage: 1 }));
    }
  };

  const handleMaxChange = (e) => {
    const value = e.target.value;

    // Prevent negative input
    if (value !== "" && Number(value) < 0) return;

    const newFilter = { ...amountFilter, maxAmount: value };
    setAmountFilter(newFilter);

    const { error } = getAmountValidation(newFilter.minAmount, value);
    setAmountError(error);

    // Only reset page if range becomes valid
    const { valid } = getAmountValidation(newFilter.minAmount, value);
    if (valid) {
      setState((prev) => ({ ...prev, currentPage: 1 }));
    }
  };

  if (isError) {
    return (
      <div>
        <NotFound />
      </div>
    );
  }

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
      header: "Username",
      render: (row) => <span className="">{row?.username || "N/A"}</span>,
    },
    {
      header: "Email",
      render: (row) => <span className="">{row?.email || "N/A"}</span>,
    },
    {
      header: "Balance (INR)",
      render: (row) => <span>{formatCurrency(row?.Inr)}</span>,
    },
    {
      header: "Status",
      render: () => (
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full
                     bg-[#b9fd5c]/10 text-[#b9fd5c]"
        >
          Active
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="p-2 sm:p-2 space-y-6">
        {/* API Error Banner */}
        {apiErrorMessage && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <span className="text-red-400 text-sm font-medium">
              ⚠️ {apiErrorMessage}
            </span>
          </div>
        )}

        {/* Main Table Card */}
        <div className="bg-[#282f35] rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f] space-y-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              {/* Left: Amount Filter */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
                <div>
                  <label className="text-[#8a8d93] text-xs font-medium mb-1.5 block">
                    Filter by Amount
                  </label>
                  <select
                    value={amountFilter.presetAmount}
                    onChange={handleAmountChange}
                    disabled={isLoading}
                    className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
                       py-2.5 px-3 text-sm focus:outline-none focus:border-[#b9fd5c]
                       transition-colors cursor-pointer disabled:opacity-50 min-w-40"
                  >
                    {amountOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Range Inputs */}
                {amountFilter.amountType === "custom" &&
                  amountFilter.presetAmount === "custom" && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-end gap-2">
                        <div>
                          <label className="text-[#8a8d93] text-xs font-medium mb-1.5 block">
                            Min
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="₹ Min"
                            value={amountFilter.minAmount}
                            onChange={handleMinChange}
                            onKeyDown={(e) => {
                              if (e.key === "-" || e.key === "e") {
                                e.preventDefault();
                              }
                            }}
                            className={`bg-[#111214] border text-white rounded-xl
                               py-2.5 px-3 text-sm focus:outline-none
                               transition-colors w-28 ${
                                 amountError
                                   ? "border-red-500 focus:border-red-500"
                                   : "border-[#2a2c2f] focus:border-[#b9fd5c]"
                               }`}
                          />
                        </div>
                        <span className="text-[#8a8d93] text-sm pb-2.5">
                          –
                        </span>
                        <div>
                          <label className="text-[#8a8d93] text-xs font-medium mb-1.5 block">
                            Max
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="₹ Max"
                            value={amountFilter.maxAmount}
                            onChange={handleMaxChange}
                            onKeyDown={(e) => {
                              if (e.key === "-" || e.key === "e") {
                                e.preventDefault();
                              }
                            }}
                            className={`bg-[#111214] border text-white rounded-xl
                               py-2.5 px-3 text-sm focus:outline-none
                               transition-colors w-28 ${
                                 amountError
                                   ? "border-red-500 focus:border-red-500"
                                   : "border-[#2a2c2f] focus:border-[#b9fd5c]"
                               }`}
                          />
                        </div>
                      </div>

                      {/* Error Message */}
                      {amountError && (
                        <span className="text-red-400 text-xs font-medium">
                          ⚠️ {amountError}
                        </span>
                      )}

                      {/* Valid Range Indicator */}
                      {isAmountRangeValid && !amountError && (
                        <span className="text-[#b9fd5c] text-xs font-medium">
                          ✓ Showing:{" "}
                          {formatCurrency(Number(amountFilter.minAmount))} –{" "}
                          {formatCurrency(Number(amountFilter.maxAmount))}
                        </span>
                      )}
                    </div>
                  )}
              </div>

              {/* Right: Per Page + Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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
          <div className="rounded-lg">
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

export default AvailableBalance;