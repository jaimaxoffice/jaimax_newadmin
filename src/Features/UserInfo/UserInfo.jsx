// import React, { useState, useEffect, useCallback } from "react";
// import _ from "lodash";
// import { useGetUserInfoQuery } from "./userinfoApiSlice";
// import { useToast } from "../../reusableComponents/Toasts/ToastContext";
// import {
//   Search,
//   Users,
//   Link2,
//   User,
//   Loader2,
//   Pencil,
//   X,
//   Lock,
//   Shield,
//   Wallet,
//   Calendar,
//   Hash,
//   Mail,
//   Phone,
//   CheckCircle,
//   XCircle,
//   Coins,
//   Gift,
//   Star,
// } from "lucide-react";
// import Edituser from "./EditableUser";
// import Loader from "../../reusableComponents/Loader/Loader";
// import Button from "../../reusableComponents/Buttons/Button"; // Import the Button
// import SearchBar from "../../reusableComponents/SearchBar/SearchBar";
// const Userinfo = () => {
//   const toast = useToast();
//   const [searchTerm, setSearchTerm] = useState("");
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
//   const [referrals, setReferrals] = useState([]);
//   const [refType, setRefType] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [userDetails, setUserDetails] = useState(null);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [isBlurred, setIsBlurred] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [secretInput, setSecretInput] = useState("");

//   const debouncedSearch = useCallback(
//     _.debounce((term) => {
//       setDebouncedSearchTerm(term.trim().toUpperCase());
//     }, 1500),
//     []
//   );

//   useEffect(() => {
//     debouncedSearch(searchTerm);
//     return () => debouncedSearch.cancel();
//   }, [searchTerm, debouncedSearch]);

//   const {
//     data: userData,
//     error,
//     isLoading,
//     refetch,
//   } = useGetUserInfoQuery(debouncedSearchTerm, {
//     skip: !debouncedSearchTerm.trim(),
//   });

//   const clearAll = () => {
//     setReferrals([]);
//     setUserDetails(null);
//     setRefType("");
//   };

//   const handleSearchInputChange = (e) => setSearchTerm(e.target.value);

//   const handleDirectSearch = () => {
//     const term = searchTerm.trim().toUpperCase();
//     if (!term) return toast("Please enter a Reference ID");
//     setLoading(true);
//     clearAll();
//     setRefType("direct");
//     setDebouncedSearchTerm(term);
//   };

//   const handleChainSearch = () => {
//     const term = searchTerm.trim().toUpperCase();
//     if (!term) return toast("Please enter a Reference ID");
//     setLoading(true);
//     clearAll();
//     setRefType("chain");
//     setDebouncedSearchTerm(term);
//   };

//   const handleShowUserDetails = () => {
//     const term = searchTerm.trim().toUpperCase();
//     if (!term) return toast("Please enter a Reference ID");
//     setLoading(true);
//     clearAll();
//     setRefType("");
//     setDebouncedSearchTerm(term);
//   };

//   useEffect(() => {
//     if (userData) {
//       if (userData.status_code === 408) {
//         toast.success("Session expired. Please login again.");
//         setLoading(false);
//         return;
//       }
//       if (userData.success === 1 && userData.data) {
//         const { totalActiveDirectRefs = [], totalActiveChainRefs = [] } = userData.data;
//         if (refType === "direct") setReferrals(totalActiveDirectRefs);
//         else if (refType === "chain") setReferrals(totalActiveChainRefs);

//         if (!refType) {
//           const foundUser = userData.data.user || {};
//           if (foundUser) {
//             setUserDetails({
//               ...foundUser,
//               directCount: totalActiveDirectRefs.length,
//               chainCount: totalActiveChainRefs.length,
//             });
//           } else toast.error("User not found!");
//         }
//       } else toast.error("Failed to fetch user data");
//       setLoading(false);
//     }
//   }, [userData, refType]);

//   useEffect(() => {
//     if (error) {
//       toast.error("Error fetching user data");
//       setLoading(false);
//     }
//   }, [error]);

//   useEffect(() => {
//     if (isLoading && debouncedSearchTerm) setLoading(true);
//   }, [isLoading, debouncedSearchTerm]);

//   const isPageLoading = loading || isLoading;

//   const formatDate = (dateString) => {
//     if (!dateString) return "";
//     return new Date(dateString).toLocaleDateString();
//   };

//   const handleUnlockClick = () => setShowModal(true);

//   const handleSecretSubmit = () => {
//     if (secretInput === "devteam") {
//       setIsBlurred(false);
//       setShowModal(false);
//     } else toast.error("Invalid Secret Code!");
//   };

//   return (
//     <div className="min-h-screen p-4 sm:p-6">
//       {/* Header */}
      

//       {/* Search Section */}
//       <div className="bg-[#282f35]  rounded-[5px] p-5 mb-6">
//         <div className="flex flex-col items-center gap-4">
//           <div className="relative w-full max-w-xs">
//             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
//             <input
//               type="text"
//               placeholder="Enter JAIMAX ID"
//               value={searchTerm}
//               onChange={handleSearchInputChange}
//               className="w-full bg-[#111827]  text-white rounded-lg 
//                 pl-10 pr-4 py-2.5 text-sm text-center focus:outline-none focus:border-[#b9fd5c] 
//                 focus:ring-1 focus:ring-[#b9fd5c]/50 transition-colors placeholder-gray-500"
//             />
//           </div>
          
//           {/* Updated Buttons */}
//           <div className="flex flex-wrap justify-center gap-3">
//             <Button
//               onClick={handleDirectSearch}
//               disabled={isPageLoading}
//               icon={Users}
//             >
//               Show Direct Referrals
//             </Button>
            
//             <Button
//               onClick={handleChainSearch}
//               disabled={isPageLoading}
//               icon={Link2}
//             >
//               Show Chain Referrals
//             </Button>
            
//             <Button
//               onClick={handleShowUserDetails}
//               disabled={isPageLoading}
//               icon={User}
//             >
//               Show Details
//             </Button>
//           </div>
//         </div>

//         {error && (
//           <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-center">
//             <p className="text-red-400 text-sm">Error loading data. Please try again.</p>
//           </div>
//         )}
//       </div>

//       {isPageLoading ? (
//         <Loader />
//       ) : (
//         <>
//           {/* User Details */}
//           {userDetails && (
//             <div className="max-w-6xl mx-auto mb-6">
//               <div className="bg-gradient-to-br from-[#282f35] to-[#1a2128] rounded-2xl border-2 border-[#b9fd5c] 
//                 shadow-[0_20px_40px_rgba(0,0,0,0.3),0_8px_24px_rgba(236,102,15,0.2)] overflow-hidden relative">
                
//                 {/* Decorative */}
//                 <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#b9fd5c]/10 rounded-full" />
//                 <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-[#b9fd5c]/5 rounded-full" />

//                 <div className="relative p-5 sm:p-6 z-10">
//                   {/* Header */}
//                   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
//                     <div>
//                       <h2 className="text-[#b9fd5c] text-2xl font-bold">User Profile</h2>
//                       <p className="text-white/70 text-sm mt-0.5">Complete user information and statistics</p>
//                     </div>
                    
//                     {/* Edit Profile Button */}
//                     <Button
//                       onClick={() => setShowEditModal(true)}
//                       disabled={isPageLoading}
//                       icon={Pencil}
//                       size="sm"
//                       className="rounded-full hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(185,253,92,0.3)]"
//                     >
//                       Edit Profile
//                     </Button>
//                   </div>

//                   {/* Two Column Grid */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {/* Left Column */}
//                     <div className="space-y-4">
//                       {/* Personal Info */}
//                       <InfoSection title="Personal Information">
//                         <InfoRow icon={User} label="Name" value={userDetails.name} />
//                         <InfoRow icon={Hash} label="Username" value={userDetails.username} />
//                         <InfoRow icon={Phone} label="Phone" value={userDetails.phone} />
//                         <InfoRow icon={Mail} label="Email" value={userDetails.email} truncate />
//                       </InfoSection>

//                       {/* Account Status */}
//                       <InfoSection title="Account Status">
//                         <InfoRow
//                           icon={Shield}
//                           label="Status"
//                           value={
//                             <span className={userDetails.isActive ? "text-green-400" : "text-red-400"}>
//                               {userDetails.isActive ? "🟢 ACTIVE" : "🔴 INACTIVE"}
//                             </span>
//                           }
//                         />
//                         <InfoRow
//                           icon={CheckCircle}
//                           label="Verified"
//                           value={
//                             <span className={userDetails.isVerified ? "text-green-400" : "text-red-400"}>
//                               {userDetails.isVerified ? "🟢 YES" : "🔴 NO"}
//                             </span>
//                           }
//                         />
//                         <InfoRow icon={Calendar} label="Created" value={formatDate(userDetails.createdAt)} />
//                         <InfoRow
//                           icon={Hash}
//                           label="Ref ID"
//                           value={
//                             <span className="text-[#b9fd5c] font-mono bg-[#b9fd5c]/10 px-2 py-0.5 rounded border border-[#b9fd5c]/30 text-xs">
//                               {userDetails.referenceId}
//                             </span>
//                           }
//                         />
//                       </InfoSection>
//                     </div>

//                     {/* Right Column */}
//                     <div className="space-y-4">
//                       {/* Financial */}
//                       <InfoSection title="Financial Overview">
//                         <InfoRow icon={Gift} label="Referral Bonus" value={<span className="text-[#b9fd5c] font-bold">₹{userDetails.referenceInr}</span>} />
//                         <InfoRow icon={Wallet} label="Wallet Balance" value={<span className="text-[#b9fd5c] font-bold">{userDetails.walletBalance ?? 0}</span>} />
//                         <InfoRow icon={Coins} label="JAIMAX Tokens" value={<span className="text-[#b9fd5c] font-bold">{userDetails.tokens?.toLocaleString() || "N/A"}</span>} />
//                         <InfoRow icon={Star} label="Super Bonus" value={<span className="text-[#b9fd5c] font-bold">{userDetails.super_bonus || "N/A"}</span>} />
//                       </InfoSection>

//                       {/* Referral Stats - Blurred */}
//                       <div className="relative">
//                         {isBlurred && (
//                           <Button
//                             onClick={handleUnlockClick}
//                             variant="ghost"
//                             size="sm"
//                             icon={Lock}
//                             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
//                           >
//                             Click to Unlock
//                           </Button>
//                         )}

//                         <div
//                           className={`bg-gradient-to-br from-[#282f35] to-[#1a2128] rounded-2xl border border-[#b9fd5c] 
//                             p-4 shadow-[0_4px_12px_rgba(0,0,0,0.3)] min-h-[260px] transition-all duration-300
//                             ${isBlurred ? "blur-lg pointer-events-none" : ""}`}
//                         >
//                           <h3 className="text-[#b9fd5c] text-lg font-semibold mb-3 pb-2 border-b-2 border-[#b9fd5c]">
//                             Referral Statistics
//                           </h3>
//                           <div className="grid grid-cols-2 gap-3">
//                             <StatBox label="Active Direct" value={userDetails.totalActiveDirectRefsCount} accent />
//                             <StatBox label="Active Chain" value={userDetails.totalActiveChainRefsCount} accent />
//                             <StatBox label="Total Direct" value={userDetails.totalDirectRefsCount} />
//                             <StatBox label="Total Chain" value={userDetails.totalChainRefsCount} />
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Referrals Table */}
//           {(refType === "direct" || refType === "chain") && referrals.length > 0 && (
//             <div className="bg-[#282f35]  rounded-xl overflow-hidden">
//               <div className="px-5 py-4 border-b border-[#303f50]">
//                 <h3 className="text-[#b9fd5c] font-semibold text-center">
//                   {refType === "direct" ? "Direct" : "Chain"} Referrals
//                 </h3>
//               </div>
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead>
//                     <tr className="bg-[#b9fd5c]">
//                       {["S.No", "Name", "Username", "Phone", "Email", "Status", "Created"].map((h) => (
//                         <th key={h} className="text-black text-xs font-semibold uppercase tracking-wider px-4 py-3 text-center">
//                           {h}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-[#303f50]/50">
//                     {referrals.map((user, index) => (
//                       <tr key={index} className="hover:bg-[#252d38] transition-colors">
//                         <td className="px-4 py-3 text-sm text-gray-400 text-center">{index + 1}</td>
//                         <td className="px-4 py-3 text-sm text-white">{user.name}</td>
//                         <td className="px-4 py-3 text-sm text-gray-300">{user.username}</td>
//                         <td className="px-4 py-3 text-sm text-gray-300">{user.phone}</td>
//                         <td className="px-4 py-3 text-sm text-gray-300">{user.email}</td>
//                         <td className="px-4 py-3 text-sm text-center">
//                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                             user.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
//                           }`}>
//                             {user.isActive ? "ACTIVE" : "INACTIVE"}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3 text-sm text-gray-400 text-center">{user.createdAt}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </>
//       )}

//       {/* Edit Modal */}
//       {showEditModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sidebar-scroll">
//           <div className="absolute inset-0 bg-black/70 backdrop-blur-sm sidebar-scroll" onClick={() => setShowEditModal(false)} />
//           <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#282f35]  rounded-xl shadow-2xl overflow-hidden sidebar-scroll">
//             <div className="flex items-center justify-between px-6 py-4 border-b border-[#b9fd5c]">
//               <h3 className="text-white font-semibold">Edit User</h3>
//               <button
//                 onClick={() => setShowEditModal(false)}
//                 className="w-9 h-9 rounded-lg bg-[#111827] text-gray-400 hover:text-white 
//                   flex items-center justify-center transition-colors cursor-pointer"
//               >
//                 <X size={18} />
//               </button>
//             </div>
//             <div className="overflow-y-auto max-h-[75vh] p-6 sidebar-scroll">
//               {userData && (
//                 <Edituser
//                   user={userData?.data?.user}
//                   searchTerm={searchTerm}
//                   setSearchTerm={setSearchTerm}
//                   refetchUserInfo={refetch}
//                 />
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Secret Code Modal */}
//       {showModal && (
//         <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
//           <div className="absolute inset-0 bg-black/70" onClick={() => setShowModal(false)} />
//           <div className="relative bg-[#282f35] border border-[#b9fd5c] rounded-xl p-6 w-full max-w-xs">
//             <h3 className="text-[#b9fd5c] font-semibold mb-4">Enter Secret Code</h3>
//             <input
//               type="password"
//               value={secretInput}
//               onChange={(e) => setSecretInput(e.target.value)}
//               placeholder="Enter Secret"
//               className="w-full bg-[#111827]  text-white rounded-lg px-4 py-2.5 text-sm 
//                 focus:outline-none focus:border-[#b9fd5c] mb-3 placeholder-gray-500"
//             />
            
//             {/* Modal Buttons using Button component */}
//             <Button
//               onClick={handleSecretSubmit}
//               className="w-full mb-2"
//             >
//               Unlock
//             </Button>
            
//             <Button
//               onClick={() => setShowModal(false)}
//               variant="outline"
//               className="w-full"
//             >
//               Cancel
//             </Button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ─── Helper Components ──────────────────────────────────────

// function InfoSection({ title, children }) {
//   return (
//     <div className="bg-gradient-to-br from-[#282f35] to-[#1a2128] rounded-2xl border border-[#b9fd5c] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
//       <h3 className="text-[#b9fd5c] text-lg font-semibold mb-3 pb-2 border-b-2 border-[#b9fd5c]">
//         {title}
//       </h3>
//       <div className="space-y-3">{children}</div>
//     </div>
//   );
// }

// function InfoRow({ icon: Icon, label, value, truncate = false }) {
//   return (
//     <div className="flex items-center justify-between gap-2">
//       <div className="flex items-center gap-2">
//         <span className="text-white/70 text-sm font-medium">{label}:</span>
//       </div>
//       <span className={`text-white text-sm font-semibold text-right`}>
//         {value}
//       </span>
//     </div>
//   );
// }

// function StatBox({ label, value, accent = false }) {
//   return (
//     <div className={`text-center p-3 rounded-xl border ${
//       accent
//         ? "bg-[#b9fd5c]/10 border-[#b9fd5c]/30"
//         : "bg-gray-500/10 border-gray-500/30"
//     }`}>
//       <div className={`text-xl font-bold mb-1 ${accent ? "text-[#b9fd5c]" : "text-white/80"}`}>
//         {value}
//       </div>
//       <div className={`text-xs font-medium ${accent ? "text-white/80" : "text-white/60"}`}>
//         {label}
//       </div>
//     </div>
//   );
// }

// export default Userinfo;


// src/features/userinfo/Userinfo.jsx
import React, { useState, useEffect } from "react";
import { useGetUserInfoQuery } from "./userinfoApiSlice";
import { useToast } from "../../reusableComponents/Toasts/ToastContext";
import {
  Search,
  Users,
  Link2,
  User,
  Pencil,
  X,
  Lock,
  Shield,
  Wallet,
  Calendar,
  Hash,
  Mail,
  Phone,
  CheckCircle,
  Coins,
  Gift,
  Star,
} from "lucide-react";
import Edituser from "./EditableUser";
import Loader from "../../reusableComponents/Loader/Loader";
import Button from "../../reusableComponents/Buttons/Button";

const Userinfo = () => {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [refType, setRefType] = useState("");
  const [referrals, setReferrals] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isBlurred, setIsBlurred] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [secretInput, setSecretInput] = useState("");
  const [shouldProcess, setShouldProcess] = useState(false);

  const {
    data: userData,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetUserInfoQuery(searchQuery, {
    skip: !searchQuery,
  });

  const clearAll = () => {
    setReferrals([]);
    setUserDetails(null);
  };

  const handleSearchInputChange = (e) => setSearchTerm(e.target.value);

  const handleDirectSearch = () => {
    const term = searchTerm.trim().toUpperCase();
    if (!term) {
      toast.error("Please enter a Reference ID");
      return;
    }

    clearAll();
    setRefType("direct");
    setShouldProcess(true);

    if (searchQuery === term) {
      // Same query - force refetch
      refetch();
    } else {
      setSearchQuery(term);
    }
  };

  const handleChainSearch = () => {
    const term = searchTerm.trim().toUpperCase();
    if (!term) {
      toast.error("Please enter a Reference ID");
      return;
    }

    clearAll();
    setRefType("chain");
    setShouldProcess(true);

    if (searchQuery === term) {
      // Same query - force refetch
      refetch();
    } else {
      setSearchQuery(term);
    }
  };

  const handleShowUserDetails = () => {
    const term = searchTerm.trim().toUpperCase();
    if (!term) {
      toast.error("Please enter a Reference ID");
      return;
    }

    clearAll();
    setRefType("details");
    setShouldProcess(true);

    if (searchQuery === term) {
      // Same query - force refetch
      refetch();
    } else {
      setSearchQuery(term);
    }
  };

  // Handle API response
  useEffect(() => {
    // Wait until data is ready and not fetching
    if (!userData || isLoading || isFetching) return;
    
    // Only process if we should
    if (!shouldProcess) return;

    if (userData.status_code === 408) {
      toast.error("Session expired. Please login again.");
      setShouldProcess(false);
      return;
    }

    if (userData.success === 1 && userData.data) {
      const { totalActiveDirectRefs = [], totalActiveChainRefs = [] } = userData.data;

      if (refType === "direct") {
        setReferrals(totalActiveDirectRefs);
        setUserDetails(null);
      } else if (refType === "chain") {
        setReferrals(totalActiveChainRefs);
        setUserDetails(null);
      } else if (refType === "details") {
        const foundUser = userData.data.user;
        if (foundUser) {
          setUserDetails({
            ...foundUser,
            directCount: totalActiveDirectRefs.length,
            chainCount: totalActiveChainRefs.length,
          });
          setReferrals([]);
        } else {
          toast.error("User not found!");
        }
      }
    } else {
      toast.error("Failed to fetch user data");
    }

    setShouldProcess(false);
  }, [userData, isLoading, isFetching, refType, shouldProcess]);

  // Handle error
  useEffect(() => {
    if (error) {
      toast.error("Error fetching user data");
      setShouldProcess(false);
    }
  }, [error]);

  const isPageLoading = isLoading || isFetching;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  const handleUnlockClick = () => setShowModal(true);

  const handleSecretSubmit = () => {
    if (secretInput === "devteam") {
      setIsBlurred(false);
      setShowModal(false);
      setSecretInput("");
    } else {
      toast.error("Invalid Secret Code!");
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleShowUserDetails();
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      {/* Search Section */}
      <div className="bg-[#282f35] rounded-[5px] p-5 mb-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-full max-w-xs">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Enter JAIMAX ID"
              value={searchTerm}
              onChange={handleSearchInputChange}
              onKeyPress={handleKeyPress}
              className="w-full bg-[#111827] text-white rounded-lg 
                pl-10 pr-4 py-2.5 text-sm text-center focus:outline-none focus:border-[#b9fd5c] 
                focus:ring-1 focus:ring-[#b9fd5c]/50 transition-colors placeholder-gray-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              onClick={handleDirectSearch}
              disabled={isPageLoading || !searchTerm.trim()}
              icon={Users}
            >
              {isPageLoading && refType === "direct"
                ? "Loading..."
                : "Show Direct Referrals"}
            </Button>

            <Button
              onClick={handleChainSearch}
              disabled={isPageLoading || !searchTerm.trim()}
              icon={Link2}
            >
              {isPageLoading && refType === "chain"
                ? "Loading..."
                : "Show Chain Referrals"}
            </Button>

            <Button
              onClick={handleShowUserDetails}
              disabled={isPageLoading || !searchTerm.trim()}
              icon={User}
            >
              {isPageLoading && refType === "details"
                ? "Loading..."
                : "Show Details"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-center">
            <p className="text-red-400 text-sm">
              Error loading data. Please try again.
            </p>
          </div>
        )}
      </div>

      {isPageLoading ? (
        <Loader />
      ) : (
        <>
          {/* User Details */}
          {userDetails && refType === "details" && (
            <div className="max-w-4xl mx-auto mb-6">
              <div
                className="bg-gradient-to-br from-[#282f35] to-[#1a2128] rounded-2xl border-2 border-[#b9fd5c] 
                shadow-[0_20px_40px_rgba(0,0,0,0.3),0_8px_24px_rgba(236,102,15,0.2)] overflow-hidden relative"
              >
                {/* Decorative */}
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#b9fd5c]/10 rounded-full" />
                <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-[#b9fd5c]/5 rounded-full" />

                <div className="relative p-5 sm:p-6 z-10">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                    <div>
                      <h2 className="text-[#b9fd5c] text-2xl font-bold">
                        User Profile
                      </h2>
                      <p className="text-white/70 text-sm mt-0.5">
                        Complete user information and statistics
                      </p>
                    </div>

                    <Button
                      onClick={() => setShowEditModal(true)}
                      icon={Pencil}
                      size="sm"
                      className="rounded-full hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(185,253,92,0.3)]"
                    >
                      Edit Profile
                    </Button>
                  </div>

                  {/* Two Column Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <InfoSection title="Personal Information">
                        <InfoRow icon={User} label="Name" value={userDetails.name} />
                        <InfoRow icon={Hash} label="Username" value={userDetails.username} />
                        <InfoRow icon={Phone} label="Phone" value={userDetails.phone} />
                        <InfoRow icon={Mail} label="Email" value={userDetails.email} />
                      </InfoSection>

                      <InfoSection title="Account Status">
                        <InfoRow
                          icon={Shield}
                          label="Status"
                          value={
                            <span className={userDetails.isActive ? "text-green-400" : "text-red-400"}>
                              {userDetails.isActive ? "🟢 ACTIVE" : "🔴 INACTIVE"}
                            </span>
                          }
                        />
                        <InfoRow
                          icon={CheckCircle}
                          label="Verified"
                          value={
                            <span className={userDetails.isVerified ? "text-green-400" : "text-red-400"}>
                              {userDetails.isVerified ? "🟢 YES" : "🔴 NO"}
                            </span>
                          }
                        />
                        <InfoRow icon={Calendar} label="Created" value={formatDate(userDetails.createdAt)} />
                        <InfoRow
                          icon={Hash}
                          label="Ref ID"
                          value={
                            <span className="text-[#b9fd5c] font-mono bg-[#b9fd5c]/10 px-2 py-0.5 rounded border border-[#b9fd5c]/30 text-xs">
                              {userDetails.referenceId}
                            </span>
                          }
                        />
                      </InfoSection>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <InfoSection title="Financial Overview">
                        <InfoRow
                          icon={Gift}
                          label="Referral Bonus"
                          value={<span className="text-[#b9fd5c] font-bold">₹{userDetails.referenceInr}</span>}
                        />
                        <InfoRow
                          icon={Wallet}
                          label="Wallet Balance"
                          value={<span className="text-[#b9fd5c] font-bold">{userDetails.walletBalance ?? 0}</span>}
                        />
                        <InfoRow
                          icon={Coins}
                          label="JAIMAX Tokens"
                          value={
                            <span className="text-[#b9fd5c] font-bold">
                              {userDetails.tokens?.toLocaleString() || "N/A"}
                            </span>
                          }
                        />
                        <InfoRow
                          icon={Star}
                          label="Super Bonus"
                          value={<span className="text-[#b9fd5c] font-bold">{userDetails.super_bonus || "N/A"}</span>}
                        />
                      </InfoSection>

                      {/* Referral Stats - Blurred */}
                      <div className="relative">
                        {isBlurred && (
                          <Button
                            onClick={handleUnlockClick}
                            variant="ghost"
                            size="sm"
                            icon={Lock}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                          >
                            Click to Unlock
                          </Button>
                        )}

                        <div
                          className={`bg-gradient-to-br from-[#282f35] to-[#1a2128] rounded-2xl border border-[#b9fd5c] 
                            p-4 shadow-[0_4px_12px_rgba(0,0,0,0.3)] min-h-[260px] transition-all duration-300
                            ${isBlurred ? "blur-lg pointer-events-none" : ""}`}
                        >
                          <h3 className="text-[#b9fd5c] text-lg font-semibold mb-3 pb-2 border-b-2 border-[#b9fd5c]">
                            Referral Statistics
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            <StatBox label="Active Direct" value={userDetails.totalActiveDirectRefsCount} accent />
                            <StatBox label="Active Chain" value={userDetails.totalActiveChainRefsCount} accent />
                            <StatBox label="Total Direct" value={userDetails.totalDirectRefsCount} />
                            <StatBox label="Total Chain" value={userDetails.totalChainRefsCount} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Referrals Table */}
          {(refType === "direct" || refType === "chain") && referrals.length > 0 && (
            <div className="bg-[#282f35] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#303f50]">
                <h3 className="text-[#b9fd5c] font-semibold text-center">
                  {refType === "direct" ? "Direct" : "Chain"} Referrals ({referrals.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#b9fd5c]">
                      {["S.No", "Name", "Username", "Phone", "Email", "Status", "Created"].map((h) => (
                        <th
                          key={h}
                          className="text-black text-xs font-semibold uppercase tracking-wider px-4 py-3 text-center"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#303f50]/50">
                    {referrals.map((user, index) => (
                      <tr key={user._id || index} className="hover:bg-[#252d38] transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-400 text-center">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-white">{user.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{user.username}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{user.phone}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{user.email}</td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {user.isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400 text-center">
                          {formatDate(user.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* No Referrals Message */}
          {(refType === "direct" || refType === "chain") && referrals.length === 0 && searchQuery && !isPageLoading && (
            <div className="bg-[#282f35] rounded-xl p-8 text-center">
              <p className="text-gray-400">
                No {refType === "direct" ? "direct" : "chain"} referrals found.
              </p>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#282f35] rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#b9fd5c]">
              <h3 className="text-white font-semibold">Edit User</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-9 h-9 rounded-lg bg-[#111827] text-gray-400 hover:text-white 
                  flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[75vh] p-6 sidebar-scroll">
              {userData?.data?.user && (
                <Edituser
                  user={userData.data.user}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  refetchUserInfo={refetch}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Secret Code Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#282f35] border border-[#b9fd5c] rounded-xl p-6 w-full max-w-xs">
            <h3 className="text-[#b9fd5c] font-semibold mb-4">Enter Secret Code</h3>
            <input
              type="password"
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSecretSubmit()}
              placeholder="Enter Secret"
              className="w-full bg-[#111827] text-white rounded-lg px-4 py-2.5 text-sm 
                focus:outline-none focus:border-[#b9fd5c] mb-3 placeholder-gray-500"
            />

            <Button onClick={handleSecretSubmit} className="w-full mb-2">
              Unlock
            </Button>

            <Button
              onClick={() => {
                setShowModal(false);
                setSecretInput("");
              }}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Helper Components ──────────────────────────────────────

function InfoSection({ title, children }) {
  return (
    <div className="bg-gradient-to-br from-[#282f35] to-[#1a2128] rounded-2xl border border-[#b9fd5c] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
      <h3 className="text-[#b9fd5c] text-lg font-semibold mb-3 pb-2 border-b-2 border-[#b9fd5c]">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="text-white/70 text-sm font-medium">{label}:</span>
      </div>
      <span className="text-white text-sm font-semibold text-right">{value}</span>
    </div>
  );
}

function StatBox({ label, value, accent = false }) {
  return (
    <div
      className={`text-center p-3 rounded-xl border ${
        accent ? "bg-[#b9fd5c]/10 border-[#b9fd5c]/30" : "bg-gray-500/10 border-gray-500/30"
      }`}
    >
      <div className={`text-xl font-bold mb-1 ${accent ? "text-[#b9fd5c]" : "text-white/80"}`}>
        {value ?? 0}
      </div>
      <div className={`text-xs font-medium ${accent ? "text-white/80" : "text-white/60"}`}>
        {label}
      </div>
    </div>
  );
}

export default Userinfo;