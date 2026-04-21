// import React, { useState } from "react";
// import { useGetAdminWalletTxsQuery } from "./miningApiSlice";
// import Table from "../../reusableComponents/Tables/Table";
// import Pagination from "../../reusableComponents/paginations/Pagination";
// import { formatDateTimeSimple } from "../../utils/dateUtils";

// const WalletTransactions = () => {
//   const [filters, setFilters] = useState({
//     page: 1,
//     limit: 10,
//     userId: "",
//     type: "",
//     direction: "",
//     referenceType: "",
//     from: "",
//     to: ""
//   });

//   const [searchInput, setSearchInput] = useState("");

//   const { data, isLoading, isError, error } = useGetAdminWalletTxsQuery(filters);

//   const transactions = data?.data?.txs || [];
//   const totalPages = data?.data?.pagination?.totalPages || 1;

//   // Handle filter changes
//   const handleFilterChange = (key, value) => {
//     setFilters((prev) => ({
//       ...prev,
//       [key]: value,
//       page: key !== 'page' ? 1 : value // Reset to page 1 when filters change
//     }));
//   };

//   // Handle search input change
//   const handleSearchChange = (e) => {
//     setSearchInput(e.target.value);
//   };

//   // Handle search submit
//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     handleFilterChange("userId", searchInput);
//   };

//   // Handle clear search
//   const handleClearSearch = () => {
//     setSearchInput("");
//     handleFilterChange("userId", "");
//   };

//   // Handle clear all filters
//   const handleClearAllFilters = () => {
//     setSearchInput("");
//     setFilters({
//       page: 1,
//       limit: 10,
//       userId: "",
//       type: "",
//       direction: "",
//       referenceType: "",
//       from: "",
//       to: ""
//     });
//   };

//   const columns = [
//     {
//       header: "S.No",
//       accessor: "sno",
//       render: (row, rowIndex, currentPage, perPage) => (
//         <div className="text-center font-semibold text-white">
//           {(currentPage - 1) * perPage + rowIndex + 1}
//         </div>
//       )
//     },
//     {
//       header: "User ID",
//       accessor: "userId",
//       render: (row) => (
//         <div className="flex items-center justify-center">
//           <div className="ml-3">
//             <div className="text-xs font-regular text-white">
//               {row.userId?.username}
//             </div>
//           </div>
//         </div>
//       ),
//     },
//     {
//       header: "Type",
//       accessor: "type",
//       minWidth: "150px",
//       render: (row) => <TypeBadge type={row.type} />,
//     },
//     {
//       header: "Direction",
//       accessor: "direction",
//       minWidth: "120px",
//       render: (row) => <DirectionBadge direction={row.direction} />,
//     },
//     {
//       header: "Amount",
//       accessor: "amount",
//       minWidth: "130px",
//       render: (row) => (
//         <span
//           className={`font-bold ${row.direction === "credit" ? "text-green-400" : "text-red-400"}`}
//         >
//           {row.direction === "credit" ? "+" : "-"}{row.amount?.toLocaleString()} jmc
//         </span>
//       ),
//     },
//     {
//       header: "Balance Before",
//       accessor: "balanceBefore",
//       minWidth: "130px",
//       render: (row) => (
//         <span className="text-gray-300">{row.balanceBefore?.toLocaleString()} jmc</span>
//       ),
//     },
//     {
//       header: "Balance After",
//       accessor: "balanceAfter",
//       render: (row) => (
//         <span className="text-white font-semibold">
//           {row.balanceAfter?.toLocaleString()} jmc
//         </span>
//       ),
//     },
//     {
//       header: "Reference",
//       accessor: "referenceType",
//       render: (row) => (
//         <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded capitalize">
//           {row.referenceType?.replace(/_/g, " ") || "N/A"}
//         </span>
//       ),
//     },

//     {
//       header: "Date",
//       accessor: "createdAt",
//       render: (row) => (
//         <div>
//           <div className="text-xs text-white">
//             {formatDateTimeSimple(row.createdAt)}
//           </div>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className="p-6">
//       {/* Filters Section */}
//       <div className="mb-6 bg-gray-800 rounded-lg p-4">
//         {/* First Row - Search and Main Filters */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           {/* Search Bar */}
//           <form onSubmit={handleSearchSubmit} className="lg:col-span-2">
//             <div className="relative">
//               <input
//                 type="text"
//                 value={searchInput}
//                 onChange={handleSearchChange}
//                 placeholder="Search by User ID..."
//                 className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-20 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
//                 <svg
//                   className="w-5 h-5 text-gray-400"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//                   />
//                 </svg>
//               </div>
//               <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
//                 {searchInput && (
//                   <button
//                     type="button"
//                     onClick={handleClearSearch}
//                     className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-xs transition-colors"
//                   >
//                     Clear
//                   </button>
//                 )}
//                 <button
//                   type="submit"
//                   className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors"
//                 >
//                   Search
//                 </button>
//               </div>
//             </div>
//           </form>

//           {/* Type Filter */}
//           <div>
//             <select
//               value={filters.type}
//               onChange={(e) => handleFilterChange("type", e.target.value)}
//               className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">All Types</option>
//               <option value="mine_reward">Mine Reward</option>
//               <option value="recovery_reward">Recovery Reward</option>
//               <option value="referral_reward">Referral Reward</option>
//               <option value="penalty_deduction">Penalty Deduction</option>
//               <option value="monthly_bonus">Monthly Bonus</option>
//               <option value="resurrection">Resurrection</option>
//             </select>
//           </div>

//           {/* Direction Filter */}
//           <div>
//             <select
//               value={filters.direction}
//               onChange={(e) => handleFilterChange("direction", e.target.value)}
//               className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">All Directions</option>
//               <option value="credit">Credit</option>
//               <option value="debit">Debit</option>
//             </select>
//           </div>
//         </div>

//         {/* Second Row - Reference Type and Date Range */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
//           {/* Reference Type Filter */}
//           <div>
//             <select
//               value={filters.referenceType}
//               onChange={(e) => handleFilterChange("referenceType", e.target.value)}
//               className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">All References</option>
//               <option value="mining_logs">Mining Logs</option>
//               <option value="referral_logs">Referral Logs</option>
//             </select>
//           </div>

//           {/* Start Date Filter */}
//           <div className="relative">
//             <label className="block text-xs text-gray-400 mb-1">Start Date</label>
//             <input
//               type="date"
//               value={filters.from}
//               onChange={(e) => handleFilterChange("from", e.target.value)}
//               className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
//             />
//             {filters.from && (
//               <button
//                 type="button"
//                 onClick={() => handleFilterChange("from", "")}
//                 className="absolute right-2 top-8 text-gray-400 hover:text-white"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             )}
//           </div>

//           {/* End Date Filter */}
//           <div className="relative">
//             <label className="block text-xs text-gray-400 mb-1">End Date</label>
//             <input
//               type="date"
//               value={filters.to}
//               onChange={(e) => handleFilterChange("to", e.target.value)}
//               className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
//             />
//             {filters.to && (
//               <button
//                 type="button"
//                 onClick={() => handleFilterChange("to", "")}
//                 className="absolute right-2 top-8 text-gray-400 hover:text-white"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Active Filters Display */}
//         {(filters.userId || filters.type || filters.direction || filters.referenceType || filters.startDate || filters.endDate) && (
//           <div className="mt-4 flex flex-wrap gap-2 items-center">
//             <span className="text-sm text-gray-400">Active Filters:</span>

//             {filters.userId && (
//               <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
//                 User ID: {filters.userId}
//                 <button
//                   onClick={() => {
//                     setSearchInput("");
//                     handleFilterChange("userId", "");
//                   }}
//                   className="hover:text-gray-300"
//                 >
//                   ×
//                 </button>
//               </span>
//             )}

//             {filters.type && (
//               <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
//                 Type: {filters.type.replace(/_/g, " ")}
//                 <button onClick={() => handleFilterChange("type", "")} className="hover:text-gray-300">
//                   ×
//                 </button>
//               </span>
//             )}

//             {filters.direction && (
//               <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
//                 Direction: {filters.direction}
//                 <button onClick={() => handleFilterChange("direction", "")} className="hover:text-gray-300">
//                   ×
//                 </button>
//               </span>
//             )}

//             {filters.referenceType && (
//               <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
//                 Reference: {filters.referenceType.replace(/_/g, " ")}
//                 <button onClick={() => handleFilterChange("referenceType", "")} className="hover:text-gray-300">
//                   ×
//                 </button>
//               </span>
//             )}

//             {filters.startDate && (
//               <span className="bg-pink-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
//                 From: {new Date(filters.startDate).toLocaleDateString()}
//                 <button onClick={() => handleFilterChange("startDate", "")} className="hover:text-gray-300">
//                   ×
//                 </button>
//               </span>
//             )}

//             {filters.endDate && (
//               <span className="bg-pink-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
//                 To: {new Date(filters.endDate).toLocaleDateString()}
//                 <button onClick={() => handleFilterChange("endDate", "")} className="hover:text-gray-300">
//                   ×
//                 </button>
//               </span>
//             )}

//             <button
//               onClick={handleClearAllFilters}
//               className="text-xs text-red-400 hover:text-red-300 underline"
//             >
//               Clear All
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Table */}
//       <Table
//         columns={columns}
//         data={transactions}
//         isLoading={isLoading}
//         currentPage={filters.page}
//         perPage={filters.limit}
//         noDataTitle="No Wallet Transactions Found"
//         noDataMessage="There are no wallet transactions matching your filters."
//         noDataIcon="wallet"
//       />

//       {/* Pagination */}
//       {transactions.length > 0 && (
//         <div className="mt-6">
//           <Pagination
//             currentPage={filters.page}
//             totalPages={totalPages}
//             onPageChange={(page) => handleFilterChange("page", page)}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// const DirectionBadge = ({ direction }) => {
//   const config = {
//     credit: { bg: "bg-green-600", text: "text-white", icon: "↓" },
//     debit: { bg: "bg-red-600", text: "text-white", icon: "↑" },
//   };

//   const { bg, text, icon } = config[direction] || config.credit;

//   return (
//     <span
//       className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${bg} ${text}`}
//     >
//       <span className="mr-1">{icon}</span>
//       {direction}
//     </span>
//   );
// };

// const TypeBadge = ({ type }) => {
//   const typeConfig = {
//     mine_reward: "bg-yellow-500 text-black",
//     recovery_reward: "bg-cyan-600 text-white",
//     referral_reward: "bg-[#b9fd5c] text-black",
//     penalty_deduction: "bg-red-600 text-white",
//     monthly_bonus: "bg-indigo-600 text-white",
//     resurrection: "bg-pink-600 text-white",
//   };

//   return (
//     <span
//       className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${typeConfig[type] || "bg-gray-600 text-white"
//         }`}
//     >
//       {type?.replace(/_/g, " ")}
//     </span>
//   );
// };

// export default WalletTransactions;



import React, { useState } from "react";
import { useGetAdminWalletTxsQuery } from "./miningApiSlice";
import Table from "../../reusableComponents/Tables/Table";
import Pagination from "../../reusableComponents/paginations/Pagination";
import { formatDateTimeSimple } from "../../utils/dateUtils";

const WalletTransactions = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    userId: "",
    type: "",
    direction: "",
    referenceType: "",
    from: "",
    to: ""
  });

  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useGetAdminWalletTxsQuery(filters);

  const transactions = data?.data?.txs || [];
  const totalPages = data?.data?.pagination?.totalPages || 1;

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value
    }));
  };

  // Handle search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleFilterChange("userId", searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    handleFilterChange("userId", "");
  };

  // Handle clear all filters
  const handleClearAllFilters = () => {
    setSearchInput("");
    setFilters({
      page: 1,
      limit: 10,
      userId: "",
      type: "",
      direction: "",
      referenceType: "",
      from: "",
      to: ""
    });
  };

  // Count active filters
  const activeFilterCount = [
    filters.userId,
    filters.type,
    filters.direction,
    filters.referenceType,
    filters.from,
    filters.to
  ].filter(Boolean).length;

  const columns = [
    {
      header: "S.No",
      accessor: "sno",
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
              {row.userId?.username}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: "type",
      minWidth: "150px",
      render: (row) => <TypeBadge type={row.type} />,
    },
    {
      header: "Direction",
      accessor: "direction",
      minWidth: "120px",
      render: (row) => <DirectionBadge direction={row.direction} />,
    },
    {
      header: "Amount",
      accessor: "amount",
      minWidth: "130px",
      render: (row) => (
        <span
          className={`font-bold ${row.direction === "credit" ? "text-green-400" : "text-red-400"}`}
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
        <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded capitalize">
          {row.referenceType?.replace(/_/g, " ") || "N/A"}
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
    <div className="p-4 md:p-6">
      {/* Compact Filter Section */}
      <div className="mb-4 bg-gray-800 rounded-lg overflow-hidden">
        {/* Filter Header - Always Visible */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Search Bar - Compact */}
            <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px] max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search User ID..."
                  className="w-full bg-gray-700 text-white rounded-lg pl-9 pr-20 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#b9fd5c]"
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex gap-1">
                  {searchInput && (
                    <button type="button" onClick={handleClearSearch} className="bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded text-xs">
                      ×
                    </button>
                  )}
                  <button type="submit" className="bg-[#b9fd5c] text-black px-2 py-1 rounded text-xs font-medium">
                    Go
                  </button>
                </div>
              </div>
            </form>

            {/* Toggle Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-[#b9fd5c] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Clear All - Only show if filters active */}
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearAllFilters}
              className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear All
            </button>
          )}
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="px-3 pb-3 border-t border-gray-700 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Type */}
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#b9fd5c]"
              >
                <option value="">All Types</option>
                <option value="mine_reward">Mine Reward</option>
                <option value="recovery_reward">Recovery Reward</option>
                <option value="referral_reward">Referral Reward</option>
                <option value="penalty_deduction">Penalty Deduction</option>
                <option value="monthly_bonus">Monthly Bonus</option>
                <option value="resurrection">Resurrection</option>
              </select>

              {/* Direction */}
              <select
                value={filters.direction}
                onChange={(e) => handleFilterChange("direction", e.target.value)}
                className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#b9fd5c]"
              >
                <option value="">All Directions</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </select>

              {/* Reference */}
              <select
                value={filters.referenceType}
                onChange={(e) => handleFilterChange("referenceType", e.target.value)}
                className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#b9fd5c]"
              >
                <option value="">All References</option>
                <option value="mining_logs">Mining Logs</option>
                <option value="referral_logs">Referral Logs</option>
              </select>

              {/* From Date */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-400 mb-1">
                  From Date (MM/DD/YYYY)
                </label>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) => handleFilterChange("from", e.target.value)}
                  max={filters.to || undefined}
                  className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-gray-400 mb-1">To Date (MM/DD/YYYY)</label>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) => handleFilterChange("to", e.target.value)}
                  min={filters.from || undefined}
                  className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#b9fd5c]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Tags - Compact */}
        {activeFilterCount > 0 && (
          <div className="px-3 pb-3 flex flex-wrap gap-1.5">
            {filters.userId && (
              <span className="bg-[#b9fd5c] text-black px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                {filters.userId}
                <button onClick={() => { setSearchInput(""); handleFilterChange("userId", ""); }} className="hover:bg-black/20 rounded">×</button>
              </span>
            )}
            {filters.type && (
              <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                {filters.type.replace(/_/g, " ")}
                <button onClick={() => handleFilterChange("type", "")}>×</button>
              </span>
            )}
            {filters.direction && (
              <span className={`${filters.direction === 'credit' ? 'bg-green-600' : 'bg-red-600'} text-white px-2 py-1 rounded text-xs flex items-center gap-1`}>
                {filters.direction}
                <button onClick={() => handleFilterChange("direction", "")}>×</button>
              </span>
            )}
            {filters.referenceType && (
              <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                {filters.referenceType.replace(/_/g, " ")}
                <button onClick={() => handleFilterChange("referenceType", "")}>×</button>
              </span>
            )}
            {filters.from && (
              <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                From: {new Date(filters.from).toLocaleDateString()}
                <button onClick={() => handleFilterChange("from", "")}>×</button>
              </span>
            )}
            {filters.to && (
              <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                To: {new Date(filters.to).toLocaleDateString()}
                <button onClick={() => handleFilterChange("to", "")}>×</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table */}
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
        <div className="mt-4">
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

const DirectionBadge = ({ direction }) => {
  const config = {
    credit: { bg: "bg-green-600", text: "text-white", icon: "↓" },
    debit: { bg: "bg-red-600", text: "text-white", icon: "↑" },
  };

  const { bg, text, icon } = config[direction] || config.credit;

  return (
    <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${bg} ${text}`}>
      <span className="mr-1">{icon}</span>
      {direction}
    </span>
  );
};

const TypeBadge = ({ type }) => {
  const typeConfig = {
    mine_reward: "bg-yellow-500 text-black",
    recovery_reward: "bg-cyan-600 text-white",
    referral_reward: "bg-[#b9fd5c] text-black",
    penalty_deduction: "bg-red-600 text-white",
    monthly_bonus: "bg-indigo-600 text-white",
    resurrection: "bg-pink-600 text-white",
  };

  return (
    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${typeConfig[type] || "bg-gray-600 text-white"}`}>
      {type?.replace(/_/g, " ")}
    </span>
  );
};

export default WalletTransactions;