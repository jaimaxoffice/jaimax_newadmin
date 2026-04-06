
// import React, { useEffect } from "react";
// import {
//   ArrowLeft,
//   Info,
//   File,
//   Image as ImageIcon,
//   Eye,
//   Download,
//   Ban,
//   UserX,
// } from "lucide-react";

// const GroupInfoPanel = ({
//   selectedGroup,
//   activeGroupTab,
//   setActiveGroupTab,
//   totalUsers,
//   membersContainerRef,
//   accumulatedFiles,
//   filesPage,
//   setFilesPage,
//   loadingFiles,
//   filesPagination,
//   refetchFiles,
//   setShowMembers,
//   messagesEndRef,
//   formatFileSize,
//   downloadFileToDesktop,
//   blockedUsers = [],
//   onUnblockUser,
// }) => {
//   const allFiles = Array.isArray(accumulatedFiles) ? accumulatedFiles : [];

//   useEffect(() => {
//     if (activeGroupTab === "media") refetchFiles?.("image");
//     else if (activeGroupTab === "files") refetchFiles?.("document");
//   }, [activeGroupTab]); // eslint-disable-line react-hooks/exhaustive-deps

//   useEffect(() => {
//     const container = membersContainerRef.current;
//     if (!container || activeGroupTab === "overview") return;
//     const handleScroll = () => {
//       const { scrollTop, scrollHeight, clientHeight } = container;
//       const hasMore = filesPagination?.page < filesPagination?.totalPages;
//       if (scrollHeight - scrollTop - clientHeight < 150 && hasMore && !loadingFiles && filesPagination?.page >= 1)
//         setFilesPage((p) => p + 1);
//     };
//     container.addEventListener("scroll", handleScroll, { passive: true });
//     return () => container.removeEventListener("scroll", handleScroll);
//   }, [activeGroupTab, loadingFiles, filesPagination]);

//   const getFileType = (url) => {
//     if (!url || typeof url !== "string") return "unknown";
//     const clean = url.split("?")[0].toLowerCase();
//     if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/.test(clean)) return "image";
//     return "file";
//   };

//   const getFileName = (url) => {
//     if (!url) return "File";
//     return url.split("?")[0].split("/").pop() || "File";
//   };

//   const imageFiles = allFiles.filter((url) => getFileType(url) === "image");
//   const documentFiles = allFiles.filter((url) => getFileType(url) !== "image");

//   const TABS = [
//     { id: "overview", icon: Info, label: "Overview", short: "Info" },
//     { id: "media", icon: ImageIcon, label: imageFiles.length > 0 ? `Media (${imageFiles.length})` : "Media", short: "Media" },
//     { id: "files", icon: File, label: documentFiles.length > 0 ? `Files (${documentFiles.length})` : "Files", short: "Files" },
//     { id: "blocked", icon: Ban, label: blockedUsers.length > 0 ? `Blocked (${blockedUsers.length})` : "Blocked", short: "Blocked" },
//   ];

//   const LoadMoreSpinner = () => {
//     const hasMore = filesPagination?.page < filesPagination?.totalPages;
//     if (loadingFiles && filesPage > 1)
//       return <div className="py-4 flex justify-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00a884]" /></div>;
//     if (hasMore)
//       return (
//         <div className="py-4 flex justify-center">
//           {/* <button onClick={() => setFilesPage((p) => p + 1)}
//             className="px-4 py-1.5 text-xs text-[#00a884] border border-[#00a884] rounded-full hover:bg-[#00a884]/10 transition-colors active:scale-95">
//           </button> */}
//         </div>
//       );
//     if (allFiles.length > 0)
//       return <div className="py-3 flex justify-center"><p className="text-[10px] text-gray-600">All loaded</p></div>;
//     return null;
//   };

//   return (
//     <div className="flex flex-col bg-[#0b141a] h-full w-full">

//       {/* ── Header ── */}
//       <div className="flex-shrink-0 flex items-center gap-2 px-2 sm:px-4 py-2.5 sm:py-3 bg-[#202c33] border-b border-[#2a3942]">
//         <button
//           onClick={() => { setShowMembers(false); setActiveGroupTab("overview"); setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100); }}
//           className="p-1.5 sm:p-2 hover:bg-[#2a3942] rounded-lg transition-colors flex-shrink-0 active:scale-90"
//         >
//           <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
//         </button>

//         <div className="flex items-center gap-2 flex-1 min-w-0">
//           <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#00a884]/20 flex-shrink-0 flex items-center justify-center overflow-hidden">
//             {selectedGroup?.groupImage
//               ? <img src={selectedGroup.groupImage} alt="" className="w-full h-full object-cover" />
//               : <span className="text-sm font-bold text-[#00a884]">{(selectedGroup?.name || "G")[0].toUpperCase()}</span>
//             }
//           </div>
//           <div className="min-w-0">
//             <p className="text-sm sm:text-[15px] font-semibold text-white truncate leading-tight">{selectedGroup?.name || "Group Info"}</p>
//             <p className="text-[10px] sm:text-xs text-gray-500">{totalUsers || 0} member{totalUsers !== 1 ? "s" : ""}</p>
//           </div>
//         </div>
//       </div>

//       {/* ── Tabs ──
//           Mobile  : 4-column icon+short-label grid
//           sm+     : single scrollable row with full label        */}
//       <div className="flex-shrink-0 bg-[#202c33] border-b border-[#2a3942]">

//         {/* Mobile tab strip (< sm) */}
//         <div className="grid grid-cols-4 sm:hidden">
//           {TABS.map(({ id, icon: Icon, short }) => {
//             const active = activeGroupTab === id;
//             return (
//               <button key={id} onClick={() => { if (activeGroupTab !== id) setActiveGroupTab(id); }}
//                 className={`flex flex-col items-center justify-center gap-0.5 py-2 border-b-2 transition-colors
//                   ${active ? "border-[#00a884] text-[#00a884] bg-[#00a884]/5" : "border-transparent text-gray-500 hover:text-gray-300"}`}
//               >
//                 <Icon className="w-4 h-4 flex-shrink-0" />
//                 <span className="text-[9px] font-medium leading-tight">{short}</span>
//               </button>
//             );
//           })}
//         </div>

//         {/* Desktop tab strip (sm+) */}
//         <div className="hidden sm:flex overflow-x-auto">
//           {TABS.map(({ id, icon: Icon, label }) => {
//             const active = activeGroupTab === id;
//             return (
//               <button key={id} onClick={() => { if (activeGroupTab !== id) setActiveGroupTab(id); }}
//                 className={`flex items-center gap-1.5 px-3 md:px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors flex-1 justify-center
//                   ${active ? "border-[#00a884] text-[#00a884] bg-[#00a884]/5" : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5"}`}
//               >
//                 <Icon className="w-3.5 h-3.5 flex-shrink-0" />
//                 <span>{label}</span>
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* ── Content ── */}
//       <div ref={membersContainerRef} className="flex-1 overflow-y-auto gip-scroll">

//         {/* Overview */}
//         {activeGroupTab === "overview" && (
//           <div className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
//             <div className="bg-[#202c33] rounded-xl p-3 sm:p-4">
//               <p className="text-[10px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</p>
//               <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
//                 {selectedGroup?.groupDescription || "No description available"}
//               </p>
//             </div>
//             <div className="bg-[#202c33] rounded-xl p-3 sm:p-4">
//               <p className="text-[10px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Details</p>
//               <div className="space-y-2 text-xs sm:text-sm">
//                 <div className="flex items-center justify-between">
//                   <span className="text-gray-400">Members</span>
//                   <span className="text-white font-medium">{totalUsers || 0}</span>
//                 </div>
//                 {selectedGroup?.chatId && (
//                   <div className="flex items-center justify-between gap-4">
//                     <span className="text-gray-400">Group ID</span>
//                     <span className="text-gray-400 font-mono text-[10px] truncate max-w-[140px] sm:max-w-[180px]">{selectedGroup.chatId}</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Media */}

//         {activeGroupTab === "media" && (
//           <div className="p-3 sm:p-4">
//             {filesPage === 1 && loadingFiles ? (
//               <div className="flex items-center justify-center h-64">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a884]" />
//               </div>
//             ) : imageFiles.length > 0 ? (
//               <>
//                 <h3 className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3 font-semibold">
//                   {filesPagination?.totalMessages || imageFiles.length} Image
//                   {imageFiles.length !== 1 ? "s" : ""}
//                 </h3>
//                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 Current max-h-[60vh] sidebar-scroll scrollbar-hide">
//                   {imageFiles.map((url, index) => (
//                     <div
//                       key={`${url}-${index}`}
//                       className="relative group cursor-pointer aspect-square rounded-lg overflow-hidden bg-[#1f2f2a]"
//                       onClick={() => window.open(url, "_blank")}
//                     >
//                       <img
//                         src={url}
//                         alt={getFileName(url)}
//                         className="w-full h-full object-cover"
//                         onError={(e) => {
//                           e.target.style.display = "none";
//                         }}
//                       />
//                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
//                         <Eye className="w-6 h-6 text-white" />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//                 <LoadMoreSpinner />
//               </>
//             ) : (
//               <div className="flex flex-col items-center justify-center h-64 text-gray-400">
//                 <ImageIcon className="w-16 h-16 mb-3 opacity-30" />
//                 <p className="text-sm">No images shared yet</p>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Files Tab */}
//         {activeGroupTab === "files" && (
//           <div className="p-3 sm:p-4">
//             {filesPage === 1 && loadingFiles ? (
//               <div className="flex items-center justify-center h-64">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a884]" />
//               </div>
//             ) : documentFiles.length > 0 ? (
//               <>
//                 <h3 className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3 font-semibold">
//                   {filesPagination?.totalMessages || documentFiles.length}{" "}
//                   Document
//                   {documentFiles.length !== 1 ? "s" : ""}
//                 </h3>
//                 <div className="space-y-1.5 sm:space-y-2 max-h-[60vh] sidebar-scroll scrollbar-hide">
//                   {documentFiles.map((url, index) => (
//                     <div
//                       key={`${url}-${index}`}
//                       className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-[#1f2f2a] rounded-lg hover:bg-[#2a3942] transition-colors cursor-pointer group"
//                       onClick={() => window.open(url, "_blank")}
//                     >
//                       <div className="w-10 h-10 rounded bg-blue-500/20 flex items-center justify-center flex-shrink-0">
//                         <File className="w-6 h-6 text-blue-400" />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className="text-xs sm:text-sm font-semibold truncate text-white">
//                           {getFileName(url)}
//                         </p>
//                       </div>
//                       <button
//                         onClick={async (e) => {
//                           e.preventDefault();
//                           e.stopPropagation();
//                           await downloadFileToDesktop(url, getFileName(url));
//                         }}
//                         className="p-1.5 sm:p-2 hover:bg-[#0a6a72] rounded-full transition-colors flex-shrink-0"
//                       >
//                         <Download className="w-4 h-4 sm:w-5 sm:h-5" />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//                 <LoadMoreSpinner />
//               </>
//             ) : (
//               <div className="flex flex-col items-center justify-center h-64 text-gray-400">
//                 <File className="w-16 h-16 mb-3 opacity-30" />
//                 <p className="text-sm">No documents shared yet</p>
//               </div>
//             )}
//           </div>
//         )}


//         {/* Blocked */}
//         {activeGroupTab === "blocked" && (
//           <div className="p-2 sm:p-4">
//             {blockedUsers.length > 0 ? (
//               <>
//                 <p className="text-[10px] sm:text-xs text-gray-500 mb-2 sm:mb-3 font-semibold uppercase tracking-wide">
//                   {blockedUsers.length} Blocked User{blockedUsers.length !== 1 ? "s" : ""}
//                 </p>
//                 <div className="space-y-1 sm:space-y-2">
//                   {blockedUsers.map((user, index) => (
//                     <div key={user.userId || index}
//                       className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-[#202c33] rounded-xl border border-red-500/10"
//                     >
//                       <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
//                         <span className="text-xs sm:text-sm font-bold text-red-400">
//                           {(user.userName || user.userId || "?")[0]?.toUpperCase()}
//                         </span>
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className="text-xs sm:text-sm font-semibold truncate text-white">
//                           {user.userName || user.userId || "Unknown"}
//                         </p>
//                         {user.reason && (
//                           <p className="text-[10px] sm:text-xs text-gray-500 truncate mt-0.5">{user.reason}</p>
//                         )}
//                         {user.blockedAt && (
//                           <p className="text-[9px] sm:text-[10px] text-gray-600 mt-0.5">
//                             {new Date(user.blockedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
//                           </p>
//                         )}
//                       </div>
//                       <button
//                         onClick={() => onUnblockUser?.(user.userId, user.userName)}
//                         className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium bg-[#00a884]/10 hover:bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/30 flex-shrink-0 active:scale-95 transition-colors"
//                       >
//                         <UserX className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
//                         <span>Unblock</span>
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               </>
//             ) : (
//               <div className="flex flex-col items-center justify-center h-40 sm:h-64 text-gray-500">
//                 <Ban className="w-10 h-10 sm:w-14 sm:h-14 mb-2 opacity-25" />
//                 <p className="text-xs sm:text-sm">No blocked users</p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       <style>{`
//         .gip-scroll::-webkit-scrollbar { width: 3px; }
//         @media (min-width: 640px) { .gip-scroll::-webkit-scrollbar { width: 5px; } }
//         .gip-scroll::-webkit-scrollbar-track { background: transparent; }
//         .gip-scroll::-webkit-scrollbar-thumb { background: #374751; border-radius: 3px; }
//       `}</style>
//     </div>
//   );
// };

// export default GroupInfoPanel;  

import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  ArrowLeft, X, File, Image as ImageIcon, Download, Link as LinkIcon,
  ChevronRight, Link, Pencil, Ban, UserX,
  ZoomIn, ZoomOut,
} from "lucide-react";
import { decryptMessage } from "../socket/encryptmsg";

/* ══════════════════════════════════════════════════════
   LOCAL DOWNLOAD UTILITY
   Fetches the file as a blob and saves it to the user's
   device (works on desktop & mobile browsers).
══════════════════════════════════════════════════════ */
const downloadFileLocally = async (url, fileName) => {
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) throw new Error("Fetch failed");
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName || "download";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    }, 200);
  } catch {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "download";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};

/* ══════════════════════════════════════════════════════
   LOAD MORE SPINNER
══════════════════════════════════════════════════════ */
const LoadMoreSpinner = ({ loadingFiles, filesPage, filesPagination, allFiles, setFilesPage }) => {
  const hasMore = filesPagination?.page < filesPagination?.totalPages;
  if (loadingFiles && filesPage > 1)
    return (
      <div className="py-6 flex justify-center">
        <div className="w-5 h-5 border-2 border-[#b9fd5c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (hasMore)
    return (
      <div className="py-5 flex justify-center">
        <button
          onClick={() => setFilesPage((p) => p + 1)}
          className="px-5 py-2 text-[12px] font-medium text-white border border-[#b9fd5c]/50 rounded-full hover:bg-[#b9fd5c]/10 transition-colors"
        >
          Load more
        </button>
      </div>
    );
  if (allFiles.length > 0)
    return (
      <div className="py-4 flex justify-center">
        <p className="text-[11px] text-white/60">All loaded</p>
      </div>
    );
  return null;
};

/* ══════════════════════════════════════════════════════
   LINK CARD
══════════════════════════════════════════════════════ */
const LinkCard = ({ url, senderName, timestamp }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2.5 px-4 py-2.5 border-b border-[#b9fd5c]/15 hover:bg-[#b9fd5c]/5 transition-colors group"
  >
    <div className="w-7 h-7 rounded-full bg-[#b9fd5c]/20 flex items-center justify-center shrink-0">
      <LinkIcon className="w-3.5 h-3.5 text-[#b9fd5c]" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[12.5px] text-white truncate group-hover:underline leading-snug">{url}</p>
      <div className="flex items-center gap-1.5 mt-0.5">
        {senderName && (
          <span className="text-[11px] text-white/50 truncate max-w-[100px]">{senderName}</span>
        )}
        {senderName && timestamp && <span className="text-[10px] text-white/30">·</span>}
        {timestamp && (
          <span className="text-[11px] text-white/40">
            {new Date(timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>
    </div>
  </a>
);

/* ══════════════════════════════════════════════════════
   BLOCKED USER CARD
══════════════════════════════════════════════════════ */
const BlockedUserCard = ({ user, onUnblockUser }) => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-[#b9fd5c]/15 hover:bg-[#b9fd5c]/5 transition-colors group">
    <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
      <span className="text-sm font-bold text-red-400">
        {(user.userName || user.userId || "?")[0]?.toUpperCase()}
      </span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-medium text-white truncate">{user.userName || user.userId || "Unknown"}</p>
      <div className="flex items-center gap-2 mt-0.5">
        {user.reason && (
          <span className="text-[11px] text-white/50 truncate max-w-[150px]">{user.reason}</span>
        )}
        {user.blockedAt && (
          <span className="text-[11px] text-white/40">
            {new Date(user.blockedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>
    </div>
    <button
      onClick={() => onUnblockUser?.(user.userId, user.userName)}
      className="px-3 py-1.5 text-[11px] font-medium text-white bg-[#b9fd5c]/20 hover:bg-[#b9fd5c]/30 border border-[#b9fd5c]/40 rounded-lg transition-colors flex-shrink-0"
    >
      <UserX className="w-3.5 h-3.5" />
    </button>
  </div>
);

/* ══════════════════════════════════════════════════════
   ALL CHATS MEDIA MODAL — centered overlay
══════════════════════════════════════════════════════ */
const AllChatsMediaModal = ({
  imageFiles = [],
  documentFiles = [],
  loadingFiles,
  filesPage,
  filesPagination,
  allFiles = [],
  setFilesPage,
  refetchFiles,
  downloadFileToDesktop,
  onClose,
  getFileName,
  setActiveGroupTab,
}) => {
  const [tab, setTab] = useState("media");
  const [viewerIndex, setViewerIndex] = useState(null);

  const switchTab = (t) => {
    setTab(t);
    if (t === "media") { setActiveGroupTab?.("media"); refetchFiles?.("image"); }
    else if (t === "docs") { setActiveGroupTab?.("files"); refetchFiles?.("document"); }
  };

  const TABS = [
    { id: "media", label: "Media" },
    { id: "docs", label: "Docs" },
  ];

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ background: "rgba(10,10,10,0.78)", backdropFilter: "blur(5px)" }}
        onClick={onClose}
      >
        {/* ── Modal card ── */}
        <div
          className="relative flex flex-col bg-[#0a0a0a] rounded-2xl overflow-hidden"
          style={{
            width: "min(560px, 95vw)",
            height: "min(620px, 90vh)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(185,253,92,0.1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex-shrink-0 flex items-center gap-3 px-5 py-4"
            style={{ background: "linear-gradient(135deg,#b9fd5c 0%,#a8ed47 100%)" }}
          >
            <div className="flex-1">
              <h2 className="text-[#0a0a0a] font-semibold text-[15px] tracking-tight leading-tight">
                Jaimax Community Gallery 
              </h2>
              <p className="text-[#0a0a0a]/60 text-[11px] mt-0.5">
                {allFiles.length} file{allFiles.length !== 1 ? "s" : ""} shared
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#0a0a0a]/20 hover:bg-[#0a0a0a]/30 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-[#0a0a0a]" />
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex-shrink-0 flex border-b border-[#b9fd5c]/20 bg-[#0a0a0a]">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => switchTab(id)}
                className={`flex-1 py-3 text-[13px] font-semibold border-b-2 -mb-px transition-colors ${tab === id
                    ? "border-[#b9fd5c] text-[#b9fd5c]"
                    : "border-transparent text-white/50 hover:text-white"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto bg-[#0a0a0a]">

            {/* Media */}
            {tab === "media" && (
              filesPage === 1 && loadingFiles ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-9 h-9 border-2 border-[#b9fd5c] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : imageFiles.length > 0 ? (
                <>
                  <p className="px-5 pt-5 pb-2 text-[10.5px] font-black text-white/50 uppercase tracking-[.14em]">
                    Shared Media
                  </p>
                  <div className="grid grid-cols-3 gap-[2px] bg-[#b9fd5c]/5 mx-1 rounded-xl overflow-hidden">
                    {imageFiles.map((url, i) => (
                      <div
                        key={`${url}-${i}`}
                        className="relative group aspect-square overflow-hidden bg-[#1a1a1a] cursor-pointer"
                        onClick={() => setViewerIndex(i)}
                      >
                        <img
                          src={url}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      </div>
                    ))}
                  </div>
                  <LoadMoreSpinner
                    loadingFiles={loadingFiles} filesPage={filesPage}
                    filesPagination={filesPagination} allFiles={allFiles} setFilesPage={setFilesPage}
                  />
                </>
              ) : (
                <EmptyState icon={<ImageIcon className="w-12 h-12" />} label="No images shared yet" />
              )
            )}

            {/* Docs */}
            {tab === "docs" && (
              filesPage === 1 && loadingFiles ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-9 h-9 border-2 border-[#b9fd5c] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : documentFiles.length > 0 ? (
                <div className="px-4 pt-3 pb-4 space-y-2">
                  <p className="px-1 pt-3 pb-1.5 text-[10.5px] font-black text-white/50 uppercase tracking-[.14em]">
                    Documents
                  </p>
                  {documentFiles.map((url, i) => (
                    <div
                      key={`${url}-${i}`}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl border border-[#b9fd5c]/20 bg-[#0a0a0a] cursor-pointer hover:bg-[#b9fd5c]/5 transition-colors"
                      onClick={() => window.open(url, "_blank")}
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#b9fd5c]/15 border border-[#b9fd5c]/20 flex items-center justify-center shrink-0">
                        <File className="w-5 h-5 text-[#b9fd5c]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-white truncate">{getFileName(url)}</p>
                        <p className="text-[11px] text-white/50 mt-0.5">Document</p>
                      </div>
                    </div>
                  ))}
                  <LoadMoreSpinner
                    loadingFiles={loadingFiles} filesPage={filesPage}
                    filesPagination={filesPagination} allFiles={allFiles} setFilesPage={setFilesPage}
                  />
                </div>
              ) : (
                <EmptyState icon={<File className="w-12 h-12" />} label="No documents shared yet" />
              )
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-5 py-3 bg-[#0a0a0a] border-t border-[#b9fd5c]/15 flex items-center justify-between">
            <span className="text-[11.5px] text-white/60">
              {tab === "media" && `${imageFiles.length} image${imageFiles.length !== 1 ? "s" : ""}`}
              {tab === "docs" && `${documentFiles.length} document${documentFiles.length !== 1 ? "s" : ""}`}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-[12.5px] font-semibold text-white bg-[#b9fd5c]/20 hover:bg-[#b9fd5c]/30 border border-[#b9fd5c]/40 rounded-full transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* ImageViewer modal — stacks above AllChatsMediaModal */}
      {viewerIndex !== null && (
        <ImageViewer
          images={imageFiles}
          startIndex={viewerIndex}
          senderName="Group Media"
          onClose={() => setViewerIndex(null)}
          downloadFileToDesktop={downloadFileToDesktop}
        />
      )}
    </>
  );
};

/* ══════════════════════════════════════════════════════
   EMPTY STATE
══════════════════════════════════════════════════════ */
const EmptyState = ({ icon, label }) => (
  <div className="flex flex-col items-center justify-center h-52 text-white/40">
    <div className="opacity-[0.15] mb-3">{icon}</div>
    <p className="text-[13px]">{label}</p>
  </div>
);

/* ══════════════════════════════════════════════════════
   IMAGE VIEWER — centered modal overlay
══════════════════════════════════════════════════════ */
const ImageViewer = ({ images, startIndex, senderName, senderImage, timestamp, onClose, downloadFileToDesktop }) => {
  const [index, setIndex] = useState(startIndex ?? 0);
  const [zoom, setZoom] = useState(1);
  const thumbRef = useRef(null);

  const getFileName = (url) => url?.split("?")[0].split("/").pop() || "File";
  const currentUrl = images[index];

  useEffect(() => {
    const strip = thumbRef.current;
    if (!strip) return;
    strip.children[index]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [index]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(z + 0.25, 4));
      if (e.key === "-") setZoom((z) => Math.max(z - 0.25, 0.25));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length, onClose]);

  useEffect(() => { setZoom(1); }, [index]);

  const displayTime = timestamp
    ? new Date(timestamp).toLocaleString("en-IN", {
      weekday: "long", hour: "numeric", minute: "2-digit", hour12: true,
    })
    : `${new Date().toLocaleDateString("en-IN", { weekday: "long" })} at ${new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}`;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{ background: "rgba(10,10,10,0.92)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col rounded-2xl overflow-hidden"
        style={{
          width: "min(780px, 96vw)",
          height: "min(580px, 88vh)",
          background: "#0a0a0a",
          boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(185,253,92,0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex-shrink-0 flex items-center gap-3 px-4 py-3"
          style={{ background: "linear-gradient(180deg,#1a1a1a 0%,#0f0f0f 100%)", borderBottom: "1px solid rgba(185,253,92,0.1)" }}
        >
          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-[#b9fd5c]/20 bg-[#b9fd5c]/10 flex items-center justify-center">
            {senderImage ? (
              <img src={senderImage} alt={senderName} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-4 h-4 text-[#b9fd5c]/50" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white text-[13.5px] font-semibold leading-tight truncate">
              {senderName || "Media"}
            </p>
            <p className="text-white/50 text-[11px] leading-tight mt-0.5">{displayTime}</p>
          </div>

          {images.length > 1 && (
            <div className="shrink-0 px-3 py-1 rounded-full text-[11.5px] font-semibold text-white/60"
              style={{ background: "rgba(185,253,92,0.08)" }}>
              {index + 1} / {images.length}
            </div>
          )}

          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.25, 4))}
              className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-[#b9fd5c]/10 transition-colors"
              title="Zoom in (+)"
            >
              <ZoomIn className="w-[17px] h-[17px]" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.25))}
              className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-[#b9fd5c]/10 transition-colors"
              title="Zoom out (-)"
            >
              <ZoomOut className="w-[17px] h-[17px]" />
            </button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-[#b9fd5c]/10 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-[17px] h-[17px]" />
            </button>
          </div>
        </div>

        <div
          className="flex-1 flex items-center justify-center relative overflow-hidden"
          style={{ background: "#050505" }}
        >
          <img
            src={currentUrl}
            alt={getFileName(currentUrl)}
            style={{
              transform: `scale(${zoom})`,
              transition: "transform .18s ease",
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              cursor: zoom > 1 ? "zoom-out" : "default",
              borderRadius: 2,
            }}
            onClick={() => zoom > 1 && setZoom(1)}
          />

          {zoom !== 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 text-white text-[11.5px] font-medium px-3 py-1.5 rounded-full pointer-events-none backdrop-blur-sm">
              {Math.round(zoom * 100)}%
            </div>
          )}

          {images.length > 1 && (
            <>
              <button
                onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white transition-colors hover:bg-[#b9fd5c]/20"
                style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(185,253,92,0.2)" }}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIndex((i) => (i + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white transition-colors hover:bg-[#b9fd5c]/20"
                style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(185,253,92,0.2)" }}
              >
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div
            className="flex-shrink-0 py-2.5"
            style={{ background: "#0f0f0f", borderTop: "1px solid rgba(185,253,92,0.1)" }}
          >
            <div
              ref={thumbRef}
              className="flex gap-1.5 overflow-x-auto px-3"
              style={{ scrollbarWidth: "none" }}
            >
              {images.map((url, i) => (
                <button
                  key={`${url}-${i}`}
                  onClick={() => setIndex(i)}
                  className={`shrink-0 rounded-lg overflow-hidden transition-all ${i === index
                      ? "opacity-100 ring-2 ring-[#b9fd5c] ring-offset-1 ring-offset-[#0f0f0f]"
                      : "opacity-35 hover:opacity-60"
                    }`}
                  style={{ width: 52, height: 52 }}
                >
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover block"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   MAIN GROUP INFO PANEL
══════════════════════════════════════════════════════ */
const GroupInfoPanel = ({
  selectedGroup, activeGroupTab, setActiveGroupTab, totalUsers,
  membersContainerRef, accumulatedFiles, filesPage, setFilesPage,
  loadingFiles, filesPagination, refetchFiles, setShowMembers,
  messagesEndRef, formatFileSize, downloadFileToDesktop,
  messages = [],
  groupKey,
  blockedUsers = [],
  onUnblockUser,
}) => {
  const [mounted, setMounted] = useState(false);
  const [subTab, setSubTab] = useState("media");
  const [viewerIndex, setViewerIndex] = useState(null);
  const [showAllChats, setShowAllChats] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (activeGroupTab === "files") setSubTab("docs");
    else if (activeGroupTab === "media") setSubTab("media");
    else if (activeGroupTab === "blocked") setSubTab("blocked");
  }, [activeGroupTab]);

  useEffect(() => {
    if (activeGroupTab === "media") refetchFiles?.("image");
    else if (activeGroupTab === "files") refetchFiles?.("document");
  }, [activeGroupTab]); // eslint-disable-line

  useEffect(() => {
    const container = membersContainerRef?.current;
    if (!container || activeGroupTab === "overview") return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const hasMore = filesPagination?.page < filesPagination?.totalPages;
      if (scrollHeight - scrollTop - clientHeight < 150 && hasMore && !loadingFiles && filesPagination?.page >= 1) {
        setFilesPage((p) => p + 1);
      }
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [activeGroupTab, loadingFiles, filesPagination]); // eslint-disable-line

  const allFiles = Array.isArray(accumulatedFiles) ? accumulatedFiles : [];
  const getFileType = (url) => {
    if (!url || typeof url !== "string") return "unknown";
    const clean = url.split("?")[0].toLowerCase();
    if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/.test(clean)) return "image";
    return "file";
  };
  const getFileName = (url) => url?.split("?")[0].split("/").pop() || "File";
  const imageFiles = allFiles.filter((url) => getFileType(url) === "image");
  const documentFiles = allFiles.filter((url) => getFileType(url) !== "image");

  const isMediaBrowser = activeGroupTab === "media" || activeGroupTab === "files" || activeGroupTab === "blocked";

  const closePanel = () => {
    setMounted(false);
    setTimeout(() => {
      setShowMembers(false);
      setActiveGroupTab("overview");
      messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  return (
    <>
      {/* ══ SIDE PANEL ══ */}
      <div
        className={`
          absolute top-0 right-0 bottom-0 z-20 flex flex-col bg-[#0a0a0a]
          w-[420px] max-w-full border-l border-[#b9fd5c]/15
          shadow-[-8px_0_24px_rgba(0,0,0,0.5)]
          transition-transform duration-300 ease-out
          ${mounted ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* ── OVERVIEW ── */}
        {!isMediaBrowser && (
          <div className="flex flex-col h-full">
            <div className="bg-[#b9fd5c] px-4 py-8 flex items-center gap-3 flex-shrink-0">
              <button onClick={closePanel} className="text-[#0a0a0a]/70 p-1 shrink-0 hover:text-[#0a0a0a] transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-[#0a0a0a] font-semibold text-[15px] tracking-tight flex-1 truncate">
                Group info
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Avatar + name */}
              <div className="bg-[#0a0a0a] px-4 pt-8 pb-6 flex flex-col items-center text-center border-b border-[#b9fd5c]/15">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 shadow-md shadow-[#b9fd5c]/10">
                  {selectedGroup?.groupImage ? (
                    <img src={selectedGroup.groupImage} alt={selectedGroup?.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#b9fd5c]/15 gap-1">
                      <ImageIcon className="w-8 h-8 text-[#b9fd5c]/40" />
                      <span className="text-[10px] text-[#b9fd5c]/50 font-medium px-2 text-center">Add group icon</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[20px] font-semibold text-white">{selectedGroup?.name}</h3>
                </div>
                <p className="text-[13px] text-white/60">Group · {totalUsers ?? 0} members</p>
              </div>

              {/* Description */}
              <div className="bg-[#0a0a0a] mt-2 px-4 py-4 border-b border-[#b9fd5c]/15">
                {selectedGroup?.groupDescription ? (
                  <p className="text-[13.5px] text-white leading-relaxed">{selectedGroup.groupDescription}</p>
                ) : (
                  <button className="flex items-center gap-2.5 text-[#b9fd5c]">
                    <Pencil className="w-4 h-4" />
                    <span className="text-[13.5px] font-medium">Add group description</span>
                  </button>
                )}
              </div>

              {/* Created info */}
              {(selectedGroup?.createdAt || selectedGroup?.createdBy) && (
                <div className="bg-[#0a0a0a] px-4 py-3 border-b border-[#b9fd5c]/15">
                  <p className="text-[12px] text-white/60 leading-relaxed">
                    Group created by{" "}
                    <span className="text-[#b9fd5c] font-medium">{selectedGroup?.createdBy || "Admin"}</span>
                    {selectedGroup?.createdAt && (
                      <>
                        , on{" "}
                        {new Date(selectedGroup.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "numeric", year: "numeric" })}{" "}
                        at{" "}
                        {new Date(selectedGroup.createdAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}
                      </>
                    )}
                  </p>
                </div>
              )}

              {/* Media row */}
              <button
                onClick={() => { setSubTab("media"); setActiveGroupTab("media"); refetchFiles?.("image"); }}
                className="w-full bg-[#0a0a0a] mt-2 px-4 py-4 flex items-center justify-between border-b border-[#b9fd5c]/15 hover:bg-[#b9fd5c]/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#b9fd5c]/15 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-[18px] h-[18px] text-[#b9fd5c]" />
                  </div>
                  <span className="text-[13.5px] text-white font-medium">Media & docs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] text-white/60">{allFiles.length}</span>
                  <ChevronRight className="w-4 h-4 text-white/60" />
                </div>
              </button>

              {/* Blocked users row */}
              <button
                onClick={() => { setSubTab("blocked"); setActiveGroupTab("blocked"); }}
                className="w-full bg-[#0a0a0a] px-4 py-4 flex items-center justify-between border-b border-[#b9fd5c]/15 hover:bg-[#b9fd5c]/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                    <Ban className="w-[18px] h-[18px] text-red-400" />
                  </div>
                  <span className="text-[13.5px] text-white font-medium">Blocked users</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] text-white/60">{blockedUsers?.length ?? 0}</span>
                  <ChevronRight className="w-4 h-4 text-white/60" />
                </div>
              </button>

              {/* Members count */}
              <div className="mt-2 px-4 py-2 border-b border-[#b9fd5c]/15 flex items-center justify-between">
                <p className="text-[13px] font-semibold text-[#b9fd5c] uppercase tracking-wide">Total Members</p>
                <span className="text-[13px] font-semibold text-[#b9fd5c]">{totalUsers ?? 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── MEDIA / DOCS / BLOCKED BROWSER ── */}
        {isMediaBrowser && (
          <div className="flex flex-col h-full">
            <div className="bg-[#b9fd5c] flex-shrink-0 shadow-sm shadow-[#b9fd5c]/10">
              <div className="flex items-center px-2 pt-2">
                <button onClick={() => setActiveGroupTab("overview")} className="p-2 text-[#0a0a0a] hover:text-[#0a0a0a]/70 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
              <div className="flex border-b border-[#0a0a0a]/10">
                {[
                  { id: "media", label: "Media" },
                  { id: "docs", label: "Docs" },
                  { id: "blocked", label: `Blocked${blockedUsers?.length > 0 ? ` (${blockedUsers.length})` : ""}` },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setSubTab(id);
                      if (id === "media") { setActiveGroupTab("media"); refetchFiles?.("image"); }
                      else if (id === "docs") { setActiveGroupTab("files"); refetchFiles?.("document"); }
                      else if (id === "blocked") setActiveGroupTab("blocked");
                    }}
                    className={`flex-1 py-3 text-[13.5px] font-semibold border-b-2 -mb-px ${subTab === id ? "border-[#0a0a0a] text-[#0a0a0a]" : "border-transparent text-[#0a0a0a]/60 hover:text-[#0a0a0a]"
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div ref={membersContainerRef} className="flex-1 overflow-y-auto bg-[#0a0a0a]">
              {/* Media */}
              {subTab === "media" && (
                filesPage === 1 && loadingFiles ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="w-10 h-10 border-2 border-[#b9fd5c] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : imageFiles.length > 0 ? (
                  <>
                    <p className="px-4 pt-5 pb-2 text-[11px] font-black text-white/50 uppercase tracking-[.12em]">Shared Media</p>
                    <div className="grid grid-cols-3 gap-px bg-[#b9fd5c]/5">
                      {imageFiles.map((url, i) => (
                        <div
                          key={`${url}-${i}`}
                          className="relative group aspect-square overflow-hidden bg-[#1a1a1a] cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setViewerIndex(i)}
                        >
                          <img
                            src={url} alt=""
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                        </div>
                      ))}
                    </div>
                    <LoadMoreSpinner
                      loadingFiles={loadingFiles} filesPage={filesPage}
                      filesPagination={filesPagination} allFiles={allFiles} setFilesPage={setFilesPage}
                    />
                  </>
                ) : (
                  <EmptyState icon={<ImageIcon className="w-16 h-16" />} label="No images shared yet" />
                )
              )}

              {/* Docs */}
              {subTab === "docs" && (
                filesPage === 1 && loadingFiles ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="w-10 h-10 border-2 border-[#b9fd5c] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : documentFiles.length > 0 ? (
                  <div className="px-3 pt-2 pb-3 space-y-1">
                    <p className="px-1 pt-4 pb-2 text-[11px] font-black text-white/50 uppercase tracking-[.12em]">Documents</p>
                    {documentFiles.map((url, i) => (
                      <div
                        key={`${url}-${i}`}
                        className="flex items-center gap-3 px-3 py-3 rounded-2xl border border-[#b9fd5c]/15 bg-[#0a0a0a] cursor-pointer hover:bg-[#b9fd5c]/5 transition-colors"
                        onClick={() => window.open(url, "_blank")}
                      >
                        <div className="w-11 h-11 rounded-xl bg-[#b9fd5c]/15 border border-[#b9fd5c]/20 flex items-center justify-center shrink-0">
                          <File className="w-5 h-5 text-[#b9fd5c]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-white truncate">{getFileName(url)}</p>
                          <p className="text-[11px] text-white/50 mt-0.5">Document</p>
                        </div>
                      </div>
                    ))}
                    <LoadMoreSpinner
                      loadingFiles={loadingFiles} filesPage={filesPage}
                      filesPagination={filesPagination} allFiles={allFiles} setFilesPage={setFilesPage}
                    />
                  </div>
                ) : (
                  <EmptyState icon={<File className="w-16 h-16" />} label="No documents shared yet" />
                )
              )}

              {/* Blocked Users */}
              {subTab === "blocked" && (
                blockedUsers && blockedUsers.length > 0 ? (
                  <>
                    <p className="px-4 pt-5 pb-2 text-[11px] font-black text-white/50 uppercase tracking-[.12em]">
                      Blocked Users · {blockedUsers.length}
                    </p>
                    <div className="border border-[#b9fd5c]/15 bg-[#0a0a0a] rounded-xl mx-3 overflow-hidden">
                      {blockedUsers.map((user, i) => (
                        <BlockedUserCard key={user.userId || i} user={user} onUnblockUser={onUnblockUser} />
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyState icon={<Ban className="w-16 h-16" />} label="No blocked users" />
                )
              )}
            </div>

            {/* Footer — view all chats */}
            <button
              onClick={() => setShowAllChats(true)}
              className="flex-shrink-0 border-t border-[#b9fd5c]/15 bg-[#0a0a0a] px-4 py-3 flex items-center justify-center gap-2 w-full hover:bg-[#b9fd5c]/5 transition-colors"
            >
              <ImageIcon className="w-4 h-4 text-[#b9fd5c]" />
              <span className="text-[13px] font-semibold text-white">View media from all chats</span>
            </button>
          </div>
        )}
      </div>

      {/* ══ IMAGE VIEWER modal ══ */}
      {viewerIndex !== null && (
        <ImageViewer
          images={imageFiles}
          startIndex={viewerIndex}
          senderName={selectedGroup?.name}
          senderImage={selectedGroup?.groupImage}
          onClose={() => setViewerIndex(null)}
          downloadFileToDesktop={downloadFileToDesktop}
        />
      )}

      {/* ══ ALL CHATS MEDIA MODAL ══ */}
      {showAllChats && (
        <AllChatsMediaModal
          imageFiles={imageFiles}
          documentFiles={documentFiles}
          loadingFiles={loadingFiles}
          filesPage={filesPage}
          filesPagination={filesPagination}
          allFiles={allFiles}
          setFilesPage={setFilesPage}
          refetchFiles={refetchFiles}
          downloadFileToDesktop={downloadFileToDesktop}
          onClose={() => setShowAllChats(false)}
          getFileName={getFileName}
          setActiveGroupTab={setActiveGroupTab}
        />
      )}
    </>
  );
};

export default GroupInfoPanel;