// import React, { useState, useMemo } from "react";
// import { useToast } from "../../reusableComponents/Toasts/ToastContext";
// import {
//   Users, UserCheck, UserX, UserPlus, Banknote, Layers,
//   Search, FileText, RotateCcw, Maximize2, Minimize2,
//   ArrowUp, ArrowDown, Filter, Download, Eye, 
// } from "lucide-react";
// import Loader from "../../reusableComponents/Loader/Loader"
// import StatCard from "../../reusableComponents/StatCards/StatsCard";
// import MemberDetailModal from "./MemberDetailModal";
// import LayerAccordion from "./LayerAccordion";
// import usePDFGenerator from "../../hooks/usePDFGenerator";
// import { buildTeamInvestmentPDF } from "./TeamInvestmentPDF";
// import {
//   formatAmount, getTotalInvestment, convertToApiDateFormat,
// } from "../../utils/dateUtils";
// import { useLazyUserInvestmentsQuery } from "./teaminvestmentsApiSlice";

// const TABS = [
//   { key: "all", icon: Users, label: "All Members" },
//   { key: "active", icon: UserCheck, label: "Active Only" },
//   { key: "inactive", icon: UserX, label: "Inactive Only" },
// ];

// const SORT_OPTIONS = [
//   { value: "name", label: "Sort by Name" },
//   { value: "investment", label: "Sort by Investment" },
//   { value: "date", label: "Sort by Date" },
// ];

// const TeamInfo = () => {
//   const toast = useToast();
//   const [expandedLayers, setExpandedLayers] = useState([]);
//   const [activeTab, setActiveTab] = useState("all");
//   const [input, setInput] = useState({ username: "", fromDate: "", toDate: "" });
//   const [teamData, setTeamData] = useState(null);
//   const [expandAll, setExpandAll] = useState(false);
//   const [selectedMember, setSelectedMember] = useState(null);
//   const [showMemberModal, setShowMemberModal] = useState(false);
//   const [sortBy, setSortBy] = useState("name");
//   const [sortOrder, setSortOrder] = useState("asc");
//   const [searchedName, setSearchedName] = useState("");

//   const [fetchUserInfo, { isLoading, isError, error }] = useLazyUserInvestmentsQuery();
//   const { isGenerating, downloadPDF, previewPDF } = usePDFGenerator();

//   // Extract name from API response
//   const extractNameFromResponse = (data) => {
//     if (data?.name) return data.name;
//     if (data?.summary?.name) return data.summary.name;

//     const layer1 = data?.layers?.["1"];
//     if (layer1) {
//       const firstMember = layer1.active?.[0] || layer1.inactive?.[0];
//       if (firstMember?.sponsorName) return firstMember.sponsorName;
//       if (firstMember?.referrerName) return firstMember.referrerName;
//       if (firstMember?.parentName) return firstMember.parentName;
//     }

//     return "";
//   };

//   // Display name (fallback to username if name not found)
//   const displayName = searchedName || input.username;

//   // Computed Stats
//   const layerStats = useMemo(() => {
//     if (!teamData?.layers)
//       return { totalActive: 0, totalInactive: 0, totalInvestment: 0, layerCount: 0 };
//     let totalActive = 0,
//       totalInactive = 0,
//       totalInvestment = 0,
//       layerCount = 0;

//     Object.values(teamData.layers).forEach((layer) => {
//       const a = layer.active?.length || 0;
//       const i = layer.inactive?.length || 0;
//       if (a > 0 || i > 0) layerCount++;
//       totalActive += a;
//       totalInactive += i;
//       layer.active?.forEach(
//         (m) => (totalInvestment += getTotalInvestment(m.investments))
//       );
//     });

//     return { totalActive, totalInactive, totalInvestment, layerCount };
//   }, [teamData]);

//   const activePercentage = useMemo(() => {
//     const total = teamData?.summary?.chain?.total || 0;
//     const active = teamData?.summary?.chain?.active || 0;
//     return total ? ((active / total) * 100).toFixed(1) : 0;
//   }, [teamData]);

//   // Handlers
//   const handleSearch = async () => {
//     if (!input.username.trim()) return;
//     try {
//       const payload = { username: input.username.trim() };
//       if (input.fromDate)
//         payload.fromDate = convertToApiDateFormat(input.fromDate);
//       if (input.toDate) payload.toDate = convertToApiDateFormat(input.toDate);
//       const result = await fetchUserInfo(payload).unwrap();

//       if (result?.data) {
//         setTeamData(result.data);
//         setExpandedLayers(["1"]);
//         setExpandAll(false);

//         // Extract and store the name from response
//         const name = extractNameFromResponse(result.data);
//         setSearchedName(name);
//         console.log("EXTRACTED NAME →", name);
//         console.log("FULL RESPONSE →", JSON.stringify(result.data, null, 2));

//         toast.success("Data fetched successfully!");
//       }
//     } catch (err) {
//       toast.error("Error fetching team data");
//     }
//   };

//   const handleReset = () => {
//     setInput({ username: "", fromDate: "", toDate: "" });
//     setTeamData(null);
//     setExpandedLayers([]);
//     setActiveTab("all");
//     setExpandAll(false);
//     setSearchedName("");
//   };

//   const toggleLayer = (layer) => {
//     setExpandedLayers((prev) =>
//       prev.includes(layer)
//         ? prev.filter((l) => l !== layer)
//         : [...prev, layer]
//     );
//   };

//   const toggleExpandAll = () => {
//     if (expandAll) {
//       setExpandedLayers([]);
//     } else {
//       setExpandedLayers(Object.keys(teamData?.layers || {}));
//     }
//     setExpandAll(!expandAll);
//   };

//   const openMemberDetail = (member) => {
//     setSelectedMember(member);
//     setShowMemberModal(true);
//   };

//   // PDF Options - uses name instead of username
//   const getPdfOptions = () => ({
//     title: "Team Investment Report",
//     subtitle: `Name: ${displayName} • ${new Date().toLocaleDateString()}`,
//     companyName: "Admin Panel",
//     theme: "dark",
//   });

//   // Download PDF - uses name instead of username
//   const handleDownloadPDF = async () => {
//     if (!input.username.trim()) return;
//     try {
//       const payload = { username: input.username.trim() };
//       if (input.fromDate)
//         payload.fromDate = convertToApiDateFormat(input.fromDate);
//       if (input.toDate) payload.toDate = convertToApiDateFormat(input.toDate);
//       const result = await fetchUserInfo(payload).unwrap();

//       if (result?.data?.layers) {
//         const name =
//           extractNameFromResponse(result.data) || input.username.trim();

//         await downloadPDF(
//           (pdf) =>
//             buildTeamInvestmentPDF(pdf, {
//               layersData: result.data.layers,
//               username: name,
//               fromDate: input.fromDate
//                 ? convertToApiDateFormat(input.fromDate)
//                 : null,
//               toDate: input.toDate
//                 ? convertToApiDateFormat(input.toDate)
//                 : null,
//             }),
//           {
//             ...getPdfOptions(),
//             subtitle: `Name: ${name} • ${new Date().toLocaleDateString()}`,
//           },
//           `Team_Investment_${name}_${new Date().toISOString().split("T")[0]}.pdf`
//         );
//       }
//     } catch (err) {
//       toast.error("Error generating PDF");
//     }
//   };

//   // Preview PDF - uses name instead of username
//   const handlePreviewPDF = async () => {
//     if (!teamData?.layers) return;
//     await previewPDF(
//       (pdf) =>
//         buildTeamInvestmentPDF(pdf, {
//           layersData: teamData.layers,
//           username: displayName,
//           fromDate: input.fromDate
//             ? convertToApiDateFormat(input.fromDate)
//             : null,
//           toDate: input.toDate
//             ? convertToApiDateFormat(input.toDate)
//             : null,
//         }),
//       getPdfOptions()
//     );
//   };

//   const isProcessing = isLoading || isGenerating;

//   return (
//     <>
//       <div className="p-2 sm:p-2 space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between flex-wrap gap-3">
//           <div>
//             <h2 className="text-xl font-bold text-white flex items-center gap-3">
//               <Users size={24} className="text-[#b9fd5c]" />
//               Team Investments Overview
//             </h2>
//             <p className="text-[#8a8d93] text-sm mt-1">
//               Search, analyze and export team investment data with date filters
//             </p>
//           </div>
//           {teamData && (
//             <button
//               onClick={toggleExpandAll}
//               className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
//                 bg-transparent border border-[#b9fd5c]/30 text-[#b9fd5c]
//                 hover:bg-[#b9fd5c]/10 transition-colors cursor-pointer"
//             >
//               {expandAll ? (
//                 <Minimize2 size={14} />
//               ) : (
//                 <Maximize2 size={14} />
//               )}
//               {expandAll ? "Collapse All" : "Expand All"}
//             </button>
//           )}
//         </div>

//         {/* Search Section */}
//         <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl p-5 space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
//             {/* Username */}
//             <div className="md:col-span-4">
//               <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
//                 Username
//               </label>
//               <input
//                 type="text"
//                 placeholder="e.g., JAIMAX......"
//                 value={input.username}
//                 onChange={(e) =>
//                   setInput({ ...input, username: e.target.value.toUpperCase() })
//                 }
//                 onKeyDown={(e) => e.key === "Enter" && handleSearch()}
//                 autoComplete="off"
//                 className="w-full bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
//                   py-3 px-4 text-sm focus:outline-none focus:border-[#b9fd5c]
//                   focus:ring-1 focus:ring-[#b9fd5c]/30 transition-colors placeholder-[#555]"
//               />
//             </div>

//             {/* From Date */}
//             <div className="md:col-span-3">
//               <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
//                 From Date
//               </label>
//               <input
//                 type="date"
//                 value={input.fromDate}
//                 onChange={(e) =>
//                   setInput({ ...input, fromDate: e.target.value })
//                 }
//                 className="w-full bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
//                   py-3 px-4 text-sm focus:outline-none focus:border-[#b9fd5c]
//                   focus:ring-1 focus:ring-[#b9fd5c]/30 transition-colors
//                   [color-scheme:dark]"
//               />
//             </div>

//             {/* To Date */}
//             <div className="md:col-span-3">
//               <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
//                 To Date
//               </label>
//               <input
//                 type="date"
//                 value={input.toDate}
//                 onChange={(e) =>
//                   setInput({ ...input, toDate: e.target.value })
//                 }
//                 className="w-full bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
//                   py-3 px-4 text-sm focus:outline-none focus:border-[#b9fd5c]
//                   focus:ring-1 focus:ring-[#b9fd5c]/30 transition-colors
//                   [color-scheme:dark]"
//               />
//             </div>

//             {/* Search Button */}
//             <div className="md:col-span-2">
//               <button
//                 onClick={handleSearch}
//                 disabled={isLoading || !input.username.trim()}
//                 className="w-full bg-[#b9fd5c] text-black rounded-3xl
//                   py-3 px-4 text-sm font-semibold transition-colors cursor-pointer
//                   disabled:opacity-50 disabled:cursor-not-allowed
//                   flex items-center justify-center gap-2"
//               >
//                 {isLoading ? (
//                   <Loader />
//                 ) : (
//                   <Search size={14} />
//                 )}
//                 Search
//               </button>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           {teamData && (
//             <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
//               <button
//                 onClick={handleDownloadPDF}
//                 disabled={isProcessing}
//                 className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
//                   bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer
//                   disabled:opacity-50"
//               >
//                 {isGenerating ? (
//                   <Loader size={12} className="animate-spin" />
//                 ) : (
//                   <Download size={12} />
//                 )}
//                 Export PDF (Invested Only)
//               </button>
//               <button
//                 onClick={handlePreviewPDF}
//                 disabled={isProcessing}
//                 className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
//                   bg-transparent border border-[#2a2c2f] text-[#8a8d93]
//                   hover:bg-[#2a2c2f] hover:text-white transition-colors cursor-pointer"
//               >
//                 <Eye size={12} />
//                 Preview PDF
//               </button>
//               <button
//                 onClick={handleReset}
//                 className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm
//                   bg-transparent border border-white/10 text-white/50
//                   hover:bg-white/5 transition-colors cursor-pointer"
//               >
//                 <RotateCcw size={11} />
//                 Reset
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Error */}
//         {isError && (
//           <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
//             <UserX size={18} className="text-red-400 flex-shrink-0" />
//             <p className="text-red-400 text-sm">
//               {error?.data?.message || "Failed to fetch team data."}
//             </p>
//           </div>
//         )}

//         {/* Empty State */}
//         {!teamData && !isLoading && (
//           <div className="flex flex-col items-center justify-center py-20">
//             <div className="w-20 h-20 rounded-2xl bg-[#b9fd5c]/10 flex items-center justify-center mb-5">
//               <Search size={30} className="text-[#b9fd5c]/40" />
//             </div>
//             <h3 className="text-white/50 font-semibold mb-2">
//               Search for Team Data
//             </h3>
//             <p className="text-white/30 text-sm max-w-md text-center">
//               Enter a username and optionally select date range to view
//               investment details
//             </p>
//           </div>
//         )}

//         {/* Team Data */}
//         {teamData && (
//           <>
//             {/* Stat Cards */}
//             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//               <StatCard
//                 title="Total Team"
//                 value={teamData.summary?.chain?.total || 0}
//                 valueClass="text-[#b9fd5c]"
//               />
//               <StatCard
//                 title="Direct Referrals"
//                 value={teamData.summary?.direct?.total || 0}
//                 valueClass="text-blue-400"
//               />
//               <StatCard
//                 title="Active Members"
//                 value={teamData.summary?.chain?.active || 0}
//                 valueClass="text-[#0ecb6f]"
//               />
//               <StatCard
//                 title="Total Investment"
//                 value={formatAmount(layerStats.totalInvestment)}
//                 valueClass="text-[#0ecb6f]"
//               />
//             </div>

//             {/* Filters */}
//             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//               {/* Tabs */}
//               <div className="flex gap-1 bg-[#111214] border border-[#2a2c2f] rounded-xl p-1">
//                 {TABS.map((tab) => (
//                   <button
//                     key={tab.key}
//                     onClick={() => setActiveTab(tab.key)}
//                     className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px]
//                       transition-all cursor-pointer ${
//                         activeTab === tab.key
//                           ? "bg-[#b9fd5c] text-black font-semibold"
//                           : "text-white/50 hover:text-white/70"
//                       }`}
//                   >
//                     <tab.icon size={12} />
//                     {tab.label}
//                   </button>
//                 ))}
//               </div>

//               {/* Sort */}
//               <div className="flex items-center gap-2">
//                 <Filter size={11} className="text-white/30" />
//                 <select
//                   value={sortBy}
//                   onChange={(e) => setSortBy(e.target.value)}
//                   className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
//                     py-2 px-3 text-xs focus:outline-none focus:border-[#b9fd5c]
//                     transition-colors cursor-pointer"
//                 >
//                   {SORT_OPTIONS.map((opt) => (
//                     <option key={opt.value} value={opt.value}>
//                       {opt.label}
//                     </option>
//                   ))}
//                 </select>
//                 <button
//                   onClick={() =>
//                     setSortOrder((p) => (p === "asc" ? "desc" : "asc"))
//                   }
//                   className="bg-[#111214] border border-[#2a2c2f] text-[#b9fd5c] rounded-xl
//                     p-2 cursor-pointer hover:bg-[#2a2c2f] transition-colors"
//                 >
//                   {sortOrder === "asc" ? (
//                     <ArrowUp size={12} />
//                   ) : (
//                     <ArrowDown size={12} />
//                   )}
//                 </button>
//               </div>
//             </div>

//             {/* Layers */}
//             <div>
//               <div className="flex items-center gap-2 mb-3">
//                 <Layers size={16} className="text-[#b9fd5c]" />
//                 <h3 className="text-white font-semibold text-lg">
//                   Team Layers
//                 </h3>
//                 <span className="text-white/30 text-sm ml-2">
//                   ({layerStats.layerCount} layers)
//                 </span>
//               </div>

//               {teamData.layers &&
//                 Object.entries(teamData.layers)
//                   .sort(([a], [b]) => Number(a) - Number(b))
//                   .map(([layerNum, layerData]) => (
//                     <LayerAccordion
//                       key={layerNum}
//                       layerNum={layerNum}
//                       layerData={layerData}
//                       isExpanded={expandedLayers.includes(layerNum)}
//                       onToggle={() => toggleLayer(layerNum)}
//                       activeTab={activeTab}
//                       sortBy={sortBy}
//                       sortOrder={sortOrder}
//                       onMemberClick={openMemberDetail}
//                     />
//                   ))}
//             </div>
//           </>
//         )}
//       </div>

//       {/* Member Detail Modal */}
//       <MemberDetailModal
//         isOpen={showMemberModal}
//         onClose={() => setShowMemberModal(false)}
//         member={selectedMember}
//       />
//     </>
//   );
// };

// export default TeamInfo;


// src/features/team/TeamInfo.jsx
import React, { useState, useMemo } from "react";
import { useToast } from "../../reusableComponents/Toasts/ToastContext";
import {
  Users, UserCheck, UserX, Layers,
  Search, RotateCcw, Maximize2, Minimize2,
  ArrowUp, ArrowDown, Filter, Download, Eye,
} from "lucide-react";
import Loader from "../../reusableComponents/Loader/Loader";
import StatCard from "../../reusableComponents/StatCards/StatsCard";
import MemberDetailModal from "./MemberDetailModal";
import LayerAccordion from "./LayerAccordion";
import usePDFGenerator from "../../hooks/usePDFGenerator";
import { buildTeamInvestmentPDF } from "./TeamInvestmentPDF";
import {
  formatAmount, getTotalInvestment, convertToApiDateFormat,
} from "../../utils/dateUtils";
import { useLazyUserInvestmentsQuery } from "./teaminvestmentsApiSlice";

const TABS = [
  { key: "all", icon: Users, label: "All Members" },
  { key: "active", icon: UserCheck, label: "Active Only" },
  { key: "inactive", icon: UserX, label: "Inactive Only" },
];

const SORT_OPTIONS = [
  { value: "name", label: "Sort by Name" },
  { value: "investment", label: "Sort by Investment" },
  { value: "date", label: "Sort by Date" },
];

const TeamInfo = () => {
  const toast = useToast();
  const [expandedLayers, setExpandedLayers] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [input, setInput] = useState({ username: "", fromDate: "", toDate: "" });
  const [teamData, setTeamData] = useState(null);
  const [expandAll, setExpandAll] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchedUserName, setSearchedUserName] = useState("");

  const [fetchTeamInvestments, { isLoading, isError, error }] = useLazyUserInvestmentsQuery();
  const { isGenerating, downloadPDF, previewPDF } = usePDFGenerator();

  // Display name - use extracted name if available, otherwise username
  const displayName = searchedUserName || input.username;

  // Extract name from layer 1 data
  const extractNameFromLayer1 = (data) => {
    const layer1 = data?.layers?.["1"];
    if (layer1) {
      // Get first active member's name
      const firstActive = layer1.active?.[0];
      if (firstActive?.name) return firstActive.name;

      // Fallback to first inactive member's name
      const firstInactive = layer1.inactive?.[0];
      if (firstInactive?.name) return firstInactive.name;
    }
    return "";
  };

  // Computed Stats
  const layerStats = useMemo(() => {
    if (!teamData?.layers)
      return { totalActive: 0, totalInactive: 0, totalInvestment: 0, layerCount: 0 };
    let totalActive = 0,
      totalInactive = 0,
      totalInvestment = 0,
      layerCount = 0;

    Object.values(teamData.layers).forEach((layer) => {
      const a = layer.active?.length || 0;
      const i = layer.inactive?.length || 0;
      if (a > 0 || i > 0) layerCount++;
      totalActive += a;
      totalInactive += i;
      layer.active?.forEach(
        (m) => (totalInvestment += getTotalInvestment(m.investments))
      );
    });

    return { totalActive, totalInactive, totalInvestment, layerCount };
  }, [teamData]);

  // Handlers
  const handleSearch = async () => {
    if (!input.username.trim()) return;

    const usernameToSearch = input.username.trim().toUpperCase();

    try {
      const payload = { username: usernameToSearch };
      if (input.fromDate)
        payload.fromDate = convertToApiDateFormat(input.fromDate);
      if (input.toDate)
        payload.toDate = convertToApiDateFormat(input.toDate);

      const result = await fetchTeamInvestments(payload).unwrap();

      if (result?.data) {
        setTeamData(result.data);
        setExpandedLayers(["1"]);
        setExpandAll(false);

        // Extract name from layer 1
        const name = extractNameFromLayer1(result.data);
        setSearchedUserName(name);

        toast.success("Data fetched successfully!");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error(err?.data?.message || "Error fetching data");
    }
  };

  const handleReset = () => {
    setInput({ username: "", fromDate: "", toDate: "" });
    setTeamData(null);
    setExpandedLayers([]);
    setActiveTab("all");
    setExpandAll(false);
    setSearchedUserName("");
  };

  const toggleLayer = (layer) => {
    setExpandedLayers((prev) =>
      prev.includes(layer)
        ? prev.filter((l) => l !== layer)
        : [...prev, layer]
    );
  };

  const toggleExpandAll = () => {
    if (expandAll) {
      setExpandedLayers([]);
    } else {
      setExpandedLayers(Object.keys(teamData?.layers || {}));
    }
    setExpandAll(!expandAll);
  };

  const openMemberDetail = (member) => {
    setSelectedMember(member);
    setShowMemberModal(true);
  };

  // PDF Options
  const getPdfOptions = () => ({
    title: "Team Investment Report",
    subtitle: `Name: ${displayName} • ${new Date().toLocaleDateString()}`,
    companyName: "Admin Panel",
    theme: "dark",
  });

  // Download PDF
  const handleDownloadPDF = async () => {
    if (!input.username.trim()) return;

    const usernameToSearch = input.username.trim().toUpperCase();

    try {
      const payload = { username: usernameToSearch };
      if (input.fromDate)
        payload.fromDate = convertToApiDateFormat(input.fromDate);
      if (input.toDate)
        payload.toDate = convertToApiDateFormat(input.toDate);

      const result = await fetchTeamInvestments(payload).unwrap();

      if (result?.data?.layers) {
        // Extract name from layer 1
        const userName = extractNameFromLayer1(result.data) || usernameToSearch;
        const fileName = userName.replace(/\s+/g, "_");

        await downloadPDF(
          (pdf) =>
            buildTeamInvestmentPDF(pdf, {
              layersData: result.data.layers,
              name: userName,
              username: usernameToSearch,
              fromDate: input.fromDate
                ? convertToApiDateFormat(input.fromDate)
                : null,
              toDate: input.toDate
                ? convertToApiDateFormat(input.toDate)
                : null,
            }),
          {
            ...getPdfOptions(),
            subtitle: `Name: ${userName} • ${new Date().toLocaleDateString()}`,
          },
          `Team_Investment_${fileName}_${new Date().toISOString().split("T")[0]}.pdf`
        );
      }
    } catch (err) {
      toast.error("Error generating PDF");
    }
  };

  // Preview PDF
  const handlePreviewPDF = async () => {
    if (!teamData?.layers) return;
    await previewPDF(
      (pdf) =>
        buildTeamInvestmentPDF(pdf, {
          layersData: teamData.layers,
          name: displayName,
          username: input.username.trim(),
          fromDate: input.fromDate
            ? convertToApiDateFormat(input.fromDate)
            : null,
          toDate: input.toDate
            ? convertToApiDateFormat(input.toDate)
            : null,
        }),
      getPdfOptions()
    );
  };

  const isProcessing = isLoading || isGenerating;

  return (
    <>
      <div className="p-2 sm:p-2 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Users size={24} className="text-[#b9fd5c]" />
              Team Investments Overview
            </h2>
            <p className="text-[#8a8d93] text-sm mt-1">
              Search, analyze and export team investment data with date filters
            </p>
          </div>
          {teamData && (
            <button
              onClick={toggleExpandAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                bg-transparent border border-[#b9fd5c]/30 text-[#b9fd5c]
                hover:bg-[#b9fd5c]/10 transition-colors cursor-pointer"
            >
              {expandAll ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              {expandAll ? "Collapse All" : "Expand All"}
            </button>
          )}
        </div>

        {/* Search Section */}
        <div className="bg-[#282f35] border border-[#2a2c2f] rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Username */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
                Username
              </label>
              <input
                type="text"
                placeholder="e.g., JAIMAX......"
                value={input.username}
                onChange={(e) =>
                  setInput({ ...input, username: e.target.value.toUpperCase() })
                }
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                autoComplete="off"
                className="w-full bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
                  py-3 px-4 text-sm focus:outline-none focus:border-[#b9fd5c]
                  focus:ring-1 focus:ring-[#b9fd5c]/30 transition-colors placeholder-[#555]"
              />
            </div>

            {/* From Date */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
                From Date
              </label>
              <input
                type="date"
                value={input.fromDate}
                onChange={(e) =>
                  setInput({ ...input, fromDate: e.target.value })
                }
                className="w-full bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
                  py-3 px-4 text-sm focus:outline-none focus:border-[#b9fd5c]
                  focus:ring-1 focus:ring-[#b9fd5c]/30 transition-colors
                  [color-scheme:dark]"
              />
            </div>

            {/* To Date */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
                To Date
              </label>
              <input
                type="date"
                value={input.toDate}
                onChange={(e) =>
                  setInput({ ...input, toDate: e.target.value })
                }
                className="w-full bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
                  py-3 px-4 text-sm focus:outline-none focus:border-[#b9fd5c]
                  focus:ring-1 focus:ring-[#b9fd5c]/30 transition-colors
                  [color-scheme:dark]"
              />
            </div>

            {/* Search Button */}
            <div className="md:col-span-2">
              <button
                onClick={handleSearch}
                disabled={isLoading || !input.username.trim()}
                className="w-full bg-[#b9fd5c] text-black rounded-3xl
                  py-3 px-4 text-sm font-semibold transition-colors cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader /> : <Search size={14} />}
                Search
              </button>
            </div>
          </div>

          {/* Show searched user info */}
          {teamData && (
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/5">
              <span className="text-[#8a8d93] text-sm">Searched User:</span>
              {searchedUserName ? (
                <>
                  <span className="text-[#b9fd5c] font-semibold">{searchedUserName}</span>
                  <span className="text-[#8a8d93] text-sm">({input.username})</span>
                </>
              ) : (
                <span className="text-[#b9fd5c] font-semibold">{input.username}</span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {teamData && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
              <button
                onClick={handleDownloadPDF}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                  bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer
                  disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader size={12} className="animate-spin" />
                ) : (
                  <Download size={12} />
                )}
                Export PDF (Invested Only)
              </button>
              <button
                onClick={handlePreviewPDF}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                  bg-transparent border border-[#2a2c2f] text-[#8a8d93]
                  hover:bg-[#2a2c2f] hover:text-white transition-colors cursor-pointer"
              >
                <Eye size={12} />
                Preview PDF
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                  bg-transparent border border-white/10 text-white/50
                  hover:bg-white/5 transition-colors cursor-pointer"
              >
                <RotateCcw size={11} />
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Error */}
        {isError && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <UserX size={18} className="text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">
              {error?.data?.message || "Failed to fetch team data."}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!teamData && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-[#b9fd5c]/10 flex items-center justify-center mb-5">
              <Search size={30} className="text-[#b9fd5c]/40" />
            </div>
            <h3 className="text-white/50 font-semibold mb-2">
              Search for Team Data
            </h3>
            <p className="text-white/30 text-sm max-w-md text-center">
              Enter a username and optionally select date range to view
              investment details
            </p>
          </div>
        )}

        {/* Team Data */}
        {teamData && (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Team"
                value={teamData.summary?.chain?.total || 0}
                valueClass="text-[#b9fd5c]"
              />
              <StatCard
                title="Direct Referrals"
                value={teamData.summary?.direct?.total || 0}
                valueClass="text-blue-400"
              />
              <StatCard
                title="Active Members"
                value={teamData.summary?.chain?.active || 0}
                valueClass="text-[#0ecb6f]"
              />
              <StatCard
                title="Total Investment"
                value={formatAmount(layerStats.totalInvestment)}
                valueClass="text-[#0ecb6f]"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Tabs */}
              <div className="flex gap-1 bg-[#111214] border border-[#2a2c2f] rounded-xl p-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px]
                      transition-all cursor-pointer ${
                        activeTab === tab.key
                          ? "bg-[#b9fd5c] text-black font-semibold"
                          : "text-white/50 hover:text-white/70"
                      }`}
                  >
                    <tab.icon size={12} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <Filter size={11} className="text-white/30" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#111214] border border-[#2a2c2f] text-white rounded-xl
                    py-2 px-3 text-xs focus:outline-none focus:border-[#b9fd5c]
                    transition-colors cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() =>
                    setSortOrder((p) => (p === "asc" ? "desc" : "asc"))
                  }
                  className="bg-[#111214] border border-[#2a2c2f] text-[#b9fd5c] rounded-xl
                    p-2 cursor-pointer hover:bg-[#2a2c2f] transition-colors"
                >
                  {sortOrder === "asc" ? (
                    <ArrowUp size={12} />
                  ) : (
                    <ArrowDown size={12} />
                  )}
                </button>
              </div>
            </div>

            {/* Layers */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Layers size={16} className="text-[#b9fd5c]" />
                <h3 className="text-white font-semibold text-lg">
                  Team Layers
                </h3>
                <span className="text-white/30 text-sm ml-2">
                  ({layerStats.layerCount} layers)
                </span>
              </div>

              {teamData.layers &&
                Object.entries(teamData.layers)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([layerNum, layerData]) => (
                    <LayerAccordion
                      key={layerNum}
                      layerNum={layerNum}
                      layerData={layerData}
                      isExpanded={expandedLayers.includes(layerNum)}
                      onToggle={() => toggleLayer(layerNum)}
                      activeTab={activeTab}
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onMemberClick={openMemberDetail}
                    />
                  ))}
            </div>
          </>
        )}
      </div>

      {/* Member Detail Modal */}
      <MemberDetailModal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        member={selectedMember}
      />
    </>
  );
};

export default TeamInfo;