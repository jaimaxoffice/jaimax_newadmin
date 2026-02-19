// // src/features/team/TeamInfoPdfDownloader.jsx
// import React, { useState } from "react";
// import { toast } from "react-toastify";
// import {
//   Download,
//   Eye,
//   Search,
//   FileText,
//   AlertCircle,
//   Users,
//   UserCheck,
//   UserX,
//   Layers,
//   Loader,
// } from "lucide-react";

// import { useLazyUserCompleteInfoQuery } from "./teamreportsApiSlice";
// import usePDFGenerator from "../../hooks/usePDFGenerator";
// import { buildTeamPDF } from "./TeamPDF";

// const TeamInfoPdfDownloader = () => {
//   const [username, setUsername] = useState("");
//   const [fetchedData, setFetchedData] = useState(null);
//   const [stats, setStats] = useState(null);

//   const [fetchUserInfo, { isLoading: isFetching, isError }] =
//     useLazyUserCompleteInfoQuery();
//   const { isGenerating, downloadPDF, previewPDF } = usePDFGenerator();

//   // Calculate stats from layers data
//   const calculateStats = (layersData) => {
//     let totalActive = 0;
//     let totalInactive = 0;
//     let totalLayers = 0;

//     Object.keys(layersData).forEach((layerKey) => {
//       const layer = layersData[layerKey];
//       const activeCount = layer?.active?.length || 0;
//       const inactiveCount = layer?.inactive?.length || 0;
//       if (activeCount > 0 || inactiveCount > 0) totalLayers++;
//       totalActive += activeCount;
//       totalInactive += inactiveCount;
//     });

//     return {
//       totalActive,
//       totalInactive,
//       totalUsers: totalActive + totalInactive,
//       totalLayers,
//     };
//   };

//   // Fetch user data
//   const handleFetch = async () => {
//     if (!username.trim()) {
//       toast.error("Please enter a username");
//       return;
//     }

//     try {
//       const result = await fetchUserInfo(username.trim()).unwrap();
//       if (result?.data) {
//         setFetchedData(result.data);
//         setStats(calculateStats(result.data));
//         toast.success("Data fetched successfully!");
//       } else {
//         toast.error("No data found for this username");
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       toast.error("Error fetching data. Please check username.");
//     }
//   };

//   // PDF options
//   const getPdfOptions = () => ({
//     title: "Team Complete Information Report",
//     subtitle: `Username: ${username} • Generated: ${new Date().toLocaleDateString()}`,
//     companyName: "Admin Panel",
//     theme: "dark",
//   });

//   // Download PDF
//   const handleDownload = async () => {
//     if (!fetchedData) {
//       // Fetch first then download
//       try {
//         const result = await fetchUserInfo(username.trim()).unwrap();
//         if (result?.data) {
//           setFetchedData(result.data);
//           setStats(calculateStats(result.data));

//           await downloadPDF(
//             (pdf) =>
//               buildTeamPDF(pdf, {
//                 layersData: result.data,
//                 username: username.trim(),
//               }),
//             getPdfOptions(),
//             `Team_Report_${username}_${new Date().toISOString().split("T")[0]}.pdf`
//           );
//         }
//       } catch (error) {
//         toast.error("Error fetching data");
//       }
//       return;
//     }

//     await downloadPDF(
//       (pdf) =>
//         buildTeamPDF(pdf, {
//           layersData: fetchedData,
//           username: username.trim(),
//         }),
//       getPdfOptions(),
//       `Team_Report_${username}_${new Date().toISOString().split("T")[0]}.pdf`
//     );
//   };

//   // Preview PDF
//   const handlePreview = async () => {
//     if (!fetchedData) {
//       toast.error("Please fetch data first");
//       return;
//     }

//     await previewPDF(
//       (pdf) =>
//         buildTeamPDF(pdf, {
//           layersData: fetchedData,
//           username: username.trim(),
//         }),
//       getPdfOptions()
//     );
//   };

//   // Handle Enter key
//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") handleFetch();
//   };

//   const isProcessing = isFetching || isGenerating;

//   return (
//     <div className="p-2 sm:p-2 space-y-6">
//       {/* Header */}
//       <div className="flex items-center gap-3">
//         <div className="w-10 h-10 rounded-xl bg-[#b9fd5c]/10 flex items-center justify-center">
//           <FileText size={20} className="text-[#b9fd5c]" />
//         </div>
//         <div>
//           <h1 className="text-lg font-bold text-white">
//             Download Team Report
//           </h1>
//           <p className="text-[#8a8d93] text-sm">
//             Generate detailed team information PDF
//           </p>
//         </div>
//       </div>

//       {/* Input Section */}
//       <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl p-5 space-y-5">
//         <h3 className="text-xs font-semibold text-[#b9fd5c] uppercase tracking-widest">
//           Enter Details
//         </h3>

//         <div className="space-y-4">
//           {/* Username Input */}
//           <div>
//             <label className="block text-sm font-medium text-[#b9fd5c] mb-2">
//               Username <span className="text-red-400">*</span>
//             </label>
//             <div className="flex gap-3">
//               <input
//                 type="text"
//                 name="username"
//                 value={username}
//                 onChange={(e) => {
//                   setUsername(e.target.value);
//                   // Reset fetched data when username changes
//                   if (fetchedData) {
//                     setFetchedData(null);
//                     setStats(null);
//                   }
//                 }}
//                 onKeyDown={handleKeyDown}
//                 placeholder="JAIMAX...."
//                 autoComplete="off"
//                 className="flex-1 bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
//                   py-2.5 px-4 text-sm focus:outline-none focus:border-[#b9fd5c]
//                   focus:ring-1 focus:ring-[#b9fd5c]/30 transition-colors placeholder-[#555]"
//               />

//               {/* Fetch Button */}
//               <button
//                 onClick={handleFetch}
//                 disabled={!username.trim() || isFetching}
//                 className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
//                   bg-[#b9fd5c] hover:bg-[#ff7b1c] text-white transition-colors
//                   cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
//               >
//                 {isFetching ? (
//                   <>
//                     <Loader size={16} className="animate-spin" />
//                     Fetching...
//                   </>
//                 ) : (
//                   <>
//                     <Search size={16} />
//                     Fetch Data
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* Error */}
//           {isError && (
//             <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
//               <AlertCircle size={18} className="text-red-400 shrink-0" />
//               <p className="text-red-400 text-sm">
//                 Error fetching data. Please check the username and try again.
//               </p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Stats Preview (after fetch) */}
//       {stats && fetchedData && (
//         <>
//           {/* Stat Cards */}
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//             <StatPreviewCard
//               icon={Layers}
//               label="Total Layers"
//               value={stats.totalLayers}
//               color="text-blue-400"
//               bgColor="bg-blue-500/10"
//             />
//             <StatPreviewCard
//               icon={UserCheck}
//               label="Active Users"
//               value={stats.totalActive}
//               color="text-[#0ecb6f]"
//               bgColor="bg-[#0ecb6f]/10"
//             />
//             <StatPreviewCard
//               icon={UserX}
//               label="Inactive Users"
//               value={stats.totalInactive}
//               color="text-red-400"
//               bgColor="bg-red-500/10"
//             />
//             <StatPreviewCard
//               icon={Users}
//               label="Total Users"
//               value={stats.totalUsers}
//               color="text-[#b9fd5c]"
//               bgColor="bg-[#b9fd5c]/10"
//             />
//           </div>

//           {/* Layer Summary Preview */}
//           <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl p-5 space-y-4">
//             <h3 className="text-sm font-semibold text-white flex items-center gap-2">
//               <Layers size={16} className="text-[#b9fd5c]" />
//               Layer-wise Summary
//             </h3>

//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="bg-[#b9fd5c]">
//                     <th className="px-4 py-3 text-left text-xs font-semibold text-white">
//                       Layer
//                     </th>
//                     <th className="px-4 py-3 text-center text-xs font-semibold text-white">
//                       Active
//                     </th>
//                     <th className="px-4 py-3 text-center text-xs font-semibold text-white">
//                       Inactive
//                     </th>
//                     <th className="px-4 py-3 text-center text-xs font-semibold text-white">
//                       Total
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {Object.keys(fetchedData)
//                     .sort((a, b) => Number(a) - Number(b))
//                     .filter((layerKey) => {
//                       const layer = fetchedData[layerKey];
//                       return (
//                         (layer?.active?.length || 0) +
//                           (layer?.inactive?.length || 0) >
//                         0
//                       );
//                     })
//                     .map((layerKey, index) => {
//                       const layer = fetchedData[layerKey];
//                       const activeCount = layer?.active?.length || 0;
//                       const inactiveCount = layer?.inactive?.length || 0;

//                       return (
//                         <tr
//                           key={layerKey}
//                           className={
//                             index % 2 === 0
//                               ? "bg-[#111214]"
//                               : "bg-[#282f35]"
//                           }
//                         >
//                           <td className="px-4 py-3 text-sm text-white font-medium">
//                             Layer {layerKey}
//                           </td>
//                           <td className="px-4 py-3 text-sm text-[#0ecb6f] text-center font-semibold">
//                             {activeCount}
//                           </td>
//                           <td className="px-4 py-3 text-sm text-red-400 text-center font-semibold">
//                             {inactiveCount}
//                           </td>
//                           <td className="px-4 py-3 text-sm text-white text-center font-bold">
//                             {activeCount + inactiveCount}
//                           </td>
//                         </tr>
//                       );
//                     })}

//                   {/* Total Row */}
//                   <tr className="bg-[#b9fd5c]/10 border-t border-[#b9fd5c]/30">
//                     <td className="px-4 py-3 text-sm text-[#b9fd5c] font-bold">
//                       TOTAL
//                     </td>
//                     <td className="px-4 py-3 text-sm text-[#0ecb6f] text-center font-bold">
//                       {stats.totalActive}
//                     </td>
//                     <td className="px-4 py-3 text-sm text-red-400 text-center font-bold">
//                       {stats.totalInactive}
//                     </td>
//                     <td className="px-4 py-3 text-sm text-[#b9fd5c] text-center font-bold">
//                       {stats.totalUsers}
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Download / Preview Actions */}
//           <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl p-5">
//             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//               <div>
//                 <h3 className="text-white font-bold flex items-center gap-2 mb-1">
//                   <FileText size={18} className="text-[#b9fd5c]" />
//                   Ready to Export
//                 </h3>
//                 <p className="text-[#8a8d93] text-sm">
//                   Download or preview the team report for{" "}
//                   <span className="text-[#b9fd5c] font-semibold">
//                     {username}
//                   </span>{" "}
//                   • {stats.totalUsers} users across {stats.totalLayers} layers
//                 </p>
//               </div>

//               <div className="flex items-center gap-3">
//                 {/* Preview Button */}
//                 <button
//                   onClick={handlePreview}
//                   disabled={isProcessing}
//                   className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
//                     bg-transparent border border-[#2a2c2f] text-[#8a8d93]
//                     hover:bg-[#2a2c2f] hover:text-white transition-colors
//                     cursor-pointer disabled:opacity-50"
//                 >
//                   <Eye size={16} />
//                   Preview
//                 </button>

//                 {/* Download Button */}
//                 <button
//                   onClick={handleDownload}
//                   disabled={isProcessing}
//                   className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
//                     bg-[#b9fd5c] hover:bg-[#ff7b1c] text-white transition-colors
//                     cursor-pointer disabled:opacity-50"
//                 >
//                   {isGenerating ? (
//                     <>
//                       <Loader size={16} className="animate-spin" />
//                       Generating...
//                     </>
//                   ) : (
//                     <>
//                       <Download size={16} />
//                       Download PDF
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//       {/* Quick Download (without preview) */}
//       {!fetchedData && (
//         <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl p-5">
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//             <div>
//               <h3 className="text-white font-bold flex items-center gap-2 mb-1">
//                 <Download size={18} className="text-[#b9fd5c]" />
//                 Quick Download
//               </h3>
//               <p className="text-[#8a8d93] text-sm">
//                 Fetch data and download PDF in one click
//               </p>
//             </div>

//             <button
//               onClick={handleDownload}
//               disabled={!username.trim() || isProcessing}
//               className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold
//                 bg-[#b9fd5c] hover:bg-[#ff7b1c] text-white transition-colors
//                 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
//             >
//               {isProcessing ? (
//                 <>
//                   <Loader size={16} className="animate-spin" />
//                   Processing...
//                 </>
//               ) : (
//                 <>
//                   <Download size={16} />
//                   Fetch & Download PDF
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       )}


//     </div>
//   );
// };

// export default TeamInfoPdfDownloader;

// // ─── Stat Preview Card ──────────────────────────────────────
// const StatPreviewCard = ({ icon: Icon, label, value, color, bgColor }) => (
//   <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl p-5 hover:border-[#b9fd5c]/30 transition-colors">
//     <div className="flex items-center gap-3">
//       <div
//         className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center shrink-0`}
//       >
//         <Icon size={20} className={color} />
//       </div>
//       <div>
//         <h3 className={`text-xl font-bold ${color}`}>{value}</h3>
//         <p className="text-[#8a8d93] text-xs font-medium mt-0.5">{label}</p>
//       </div>
//     </div>
//   </div>
// );



// src/features/team/TeamInfoPdfDownloader.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  Download,
  Eye,
  Search,
  FileText,
  AlertCircle,
  Users,
  UserCheck,
  UserX,
  Layers,
  RotateCcw,
} from "lucide-react";

import { useLazyUserCompleteInfoQuery } from "./teamreportsApiSlice";
import usePDFGenerator from "../../hooks/usePDFGenerator";
import { buildTeamPDF } from "./TeamPDF";

// Reusable Components
import Button from "../../reusableComponents/Buttons/Button";
import Table from "../../reusableComponents/Tables/Table";
import StatPreviewCard from "../../reusableComponents/StatCards/StatsCard"
const TeamInfoPdfDownloader = () => {
  const [username, setUsername] = useState("");
  const [fetchedData, setFetchedData] = useState(null);
  const [stats, setStats] = useState(null);

  const [fetchUserInfo, { isLoading: isFetching, isError }] =
    useLazyUserCompleteInfoQuery();
  const { isGenerating, downloadPDF, previewPDF } = usePDFGenerator();

  // Calculate stats from layers data
  const calculateStats = (layersData) => {
    let totalActive = 0;
    let totalInactive = 0;
    let totalLayers = 0;

    Object.keys(layersData).forEach((layerKey) => {
      const layer = layersData[layerKey];
      const activeCount = layer?.active?.length || 0;
      const inactiveCount = layer?.inactive?.length || 0;
      if (activeCount > 0 || inactiveCount > 0) totalLayers++;
      totalActive += activeCount;
      totalInactive += inactiveCount;
    });

    return {
      totalActive,
      totalInactive,
      totalUsers: totalActive + totalInactive,
      totalLayers,
    };
  };

  // Fetch user data
  const handleFetch = async () => {
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    try {
      const result = await fetchUserInfo(username.trim()).unwrap();
      if (result?.data) {
        setFetchedData(result.data);
        setStats(calculateStats(result.data));
        toast.success("Data fetched successfully!");
      } else {
        toast.error("No data found for this username");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error fetching data. Please check username.");
    }
  };

  // PDF options
  const getPdfOptions = () => ({
    title: "Team Complete Information Report",
    subtitle: `Username: ${username} • Generated: ${new Date().toLocaleDateString()}`,
    companyName: "Admin Panel",
    theme: "dark",
  });

  // Download PDF
  const handleDownload = async () => {
    if (!fetchedData) {
      try {
        const result = await fetchUserInfo(username.trim()).unwrap();
        if (result?.data) {
          setFetchedData(result.data);
          setStats(calculateStats(result.data));

          await downloadPDF(
            (pdf) =>
              buildTeamPDF(pdf, {
                layersData: result.data,
                username: username.trim(),
              }),
            getPdfOptions(),
            `Team_Report_${username}_${new Date().toISOString().split("T")[0]}.pdf`
          );
        }
      } catch (error) {
        toast.error("Error fetching data");
      }
      return;
    }

    await downloadPDF(
      (pdf) =>
        buildTeamPDF(pdf, {
          layersData: fetchedData,
          username: username.trim(),
        }),
      getPdfOptions(),
      `Team_Report_${username}_${new Date().toISOString().split("T")[0]}.pdf`
    );
  };

  // Preview PDF
  const handlePreview = async () => {
    if (!fetchedData) {
      toast.error("Please fetch data first");
      return;
    }

    await previewPDF(
      (pdf) =>
        buildTeamPDF(pdf, {
          layersData: fetchedData,
          username: username.trim(),
        }),
      getPdfOptions()
    );
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleFetch();
  };

  // Reset form
  const handleReset = () => {
    setUsername("");
    setFetchedData(null);
    setStats(null);
  };

  const isProcessing = isFetching || isGenerating;

  // Table columns for layer summary
  const layerTableColumns = [
    {
      header: "Layer",
      accessor: "layer",
      render: (row) => (
        <span className="text-white font-medium">Layer {row.layer}</span>
      ),
    },
    {
      header: "Active",
      accessor: "active",
      render: (row) => (
        <span className="text-[#0ecb6f] font-semibold">{row.active}</span>
      ),
    },
    {
      header: "Inactive",
      accessor: "inactive",
      render: (row) => (
        <span className="text-red-400 font-semibold">{row.inactive}</span>
      ),
    },
    {
      header: "Total",
      accessor: "total",
      render: (row) => (
        <span className={`font-bold ${row.isTotal ? "text-[#b9fd5c]" : "text-white"}`}>
          {row.total}
        </span>
      ),
    },
  ];

  // Transform fetched data for table
  const getTableData = () => {
    if (!fetchedData || !stats) return [];

    const layers = Object.keys(fetchedData)
      .sort((a, b) => Number(a) - Number(b))
      .filter((layerKey) => {
        const layer = fetchedData[layerKey];
        return (layer?.active?.length || 0) + (layer?.inactive?.length || 0) > 0;
      })
      .map((layerKey) => {
        const layer = fetchedData[layerKey];
        const activeCount = layer?.active?.length || 0;
        const inactiveCount = layer?.inactive?.length || 0;
        return {
          layer: layerKey,
          active: activeCount,
          inactive: inactiveCount,
          total: activeCount + inactiveCount,
          isTotal: false,
        };
      });

    // Add total row
    layers.push({
      layer: "TOTAL",
      active: stats.totalActive,
      inactive: stats.totalInactive,
      total: stats.totalUsers,
      isTotal: true,
    });

    return layers;
  };

  // Custom columns for total row styling
  const getLayerColumns = () => [
    {
      header: "Layer",
      accessor: "layer",
      render: (row) => (
        <span className={`font-medium ${row.isTotal ? "text-[#b9fd5c] font-bold" : "text-white"}`}>
          {row.isTotal ? "TOTAL" : `Layer ${row.layer}`}
        </span>
      ),
    },
    {
      header: "Active",
      accessor: "active",
      render: (row) => (
        <span className={`font-semibold ${row.isTotal ? "text-[#0ecb6f] font-bold" : "text-[#0ecb6f]"}`}>
          {row.active}
        </span>
      ),
    },
    {
      header: "Inactive",
      accessor: "inactive",
      render: (row) => (
        <span className={`font-semibold ${row.isTotal ? "text-red-400 font-bold" : "text-red-400"}`}>
          {row.inactive}
        </span>
      ),
    },
    {
      header: "Total",
      accessor: "total",
      render: (row) => (
        <span className={`font-bold ${row.isTotal ? "text-[#b9fd5c]" : "text-white"}`}>
          {row.total}
        </span>
      ),
    },
  ];

  return (
    <div className="p-2 sm:p-2 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#b9fd5c]/10 flex items-center justify-center">
          <FileText size={20} className="text-[#b9fd5c]" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Download Team Report</h1>
          <p className="text-[#8a8d93] text-sm">
            Generate detailed team information PDF
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl p-5 space-y-5">
        <h3 className="text-xs font-semibold text-[#b9fd5c] uppercase tracking-widest">
          Enter Details
        </h3>

        <div className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="block text-sm font-medium text-[#b9fd5c] mb-2">
              Username <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-3">
              {/* Custom Input (since SearchBar has specific behavior) */}
              <div className="relative flex-1">
                <Search
                  size={15}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                    username ? "text-[#b9fd5c]" : "text-[#555]"
                  }`}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (fetchedData) {
                      setFetchedData(null);
                      setStats(null);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="JAIMAX...."
                  autoComplete="off"
                  className="w-full bg-[#111214] text-white text-sm placeholder-[#555] 
                    py-2.5 pl-9 pr-4 rounded-lg border outline-none transition-all duration-200
                    border-[#2a2c2f] hover:border-[#3a3c3f] focus:border-[#b9fd5c] 
                    focus:ring-1 focus:ring-[#b9fd5c]/30"
                />
              </div>

              {/* Fetch Button */}
              <Button
                onClick={handleFetch}
                disabled={!username.trim()}
                loading={isFetching}
                icon={!isFetching ? Search : null}
              >
                {isFetching ? "Fetching..." : "Fetch Data"}
              </Button>
            </div>
          </div>

          {/* Error */}
          {isError && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
              <AlertCircle size={18} className="text-red-400 shrink-0" />
              <p className="text-red-400 text-sm">
                Error fetching data. Please check the username and try again.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Preview (after fetch) */}
      {stats && fetchedData && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatPreviewCard
              icon={Layers}
              title="Total Layers"
              value={stats.totalLayers}
              color="text-blue-400"
              bgColor="bg-blue-500/10"
            />
            <StatPreviewCard
              icon={UserCheck}
              title="Active Users"
              value={stats.totalActive}
              color="text-[#0ecb6f]"
              bgColor="bg-[#0ecb6f]/10"
            />
            <StatPreviewCard
              icon={UserX}
              title="Inactive Users"
              value={stats.totalInactive}
              color="text-red-400"
              bgColor="bg-red-500/10"
            />
            <StatPreviewCard
              icon={Users}
              title="Total Users"
              value={stats.totalUsers}
              color="text-[#b9fd5c]"
              bgColor="bg-[#b9fd5c]/10"
            />
          </div>

          {/* Layer Summary Preview - Using Reusable Table */}
          <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[#2a2c2f]">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers size={16} className="text-[#b9fd5c]" />
                Layer-wise Summary
              </h3>
            </div>

            <Table
              columns={getLayerColumns()}
              data={getTableData()}
              isLoading={false}
              currentPage={1}
              perPage={10}
              noDataTitle="No Layer Data"
              noDataMessage="No layer information available."
              noDataIcon="layers"
            />
          </div>

          {/* Download / Preview Actions */}
          <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-white font-bold flex items-center gap-2 mb-1">
                  <FileText size={18} className="text-[#b9fd5c]" />
                  Ready to Export
                </h3>
                <p className="text-[#8a8d93] text-sm">
                  Download or preview the team report for{" "}
                  <span className="text-[#b9fd5c] font-semibold">{username}</span> •{" "}
                  {stats.totalUsers} users across {stats.totalLayers} layers
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">

                {/* Preview Button */}
                <Button
                  onClick={handlePreview}
                  disabled={isProcessing}
                  variant="secondary"
                  icon={Eye}
                >
                  Preview
                </Button>

                {/* Download Button */}
                <Button
                  onClick={handleDownload}
                  disabled={isProcessing}
                  loading={isGenerating}
                  icon={!isGenerating ? Download : null}
                >
                  {isGenerating ? "Generating..." : "Download PDF"}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Quick Download (without preview) */}
      {!fetchedData && (
        <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-white font-bold flex items-center gap-2 mb-1">
                <Download size={18} className="text-[#b9fd5c]" />
                Quick Download
              </h3>
              <p className="text-[#8a8d93] text-sm">
                Fetch data and download PDF in one click
              </p>
            </div>

            <Button
              onClick={handleDownload}
              disabled={!username.trim()}
              loading={isProcessing}
              icon={!isProcessing ? Download : null}
              size="lg"
            >
              {isProcessing ? "Processing..." : "Fetch & Download PDF"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamInfoPdfDownloader;

