// import React, { useState } from "react";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import {
//   CreditCard,
//   CheckCircle,
//   XCircle,
//   Zap,
//   Play,
//   Pause,
//   Plus,
//   Filter,
//   Activity,
//   Power,
//   Calendar,
// } from "lucide-react";
// import {
//   useGetAllPaymentGatewaysQuery,
//   useGetActivePaymentGatewayQuery,
//   useGetPaymentGatewayStatsQuery,
//   useCreatePaymentGatewayMutation,
//   useUpdatePaymentGatewayMutation,
//   useActivatePaymentGatewayMutation,
//   useDeactivateAllPaymentGatewaysMutation,
//   useDeletePaymentGatewayMutation,
// } from "./paymentGatewayApiSlice";
// import StatCard from "../../reusableComponents/StatCards/StatsCard";

// const PaymentGatewayManagement = () => {
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editingGateway, setEditingGateway] = useState(null);
//   const [newGatewayName, setNewGatewayName] = useState("");
//   const [editGatewayName, setEditGatewayName] = useState("");
//   const [filterActive, setFilterActive] = useState("all");
//   const [isCustomGateway, setIsCustomGateway] = useState(false);

//   // API queries
//   const {
//     data: allGateways,
//     isLoading: loadingGateways,
//     refetch: refetchGateways,
//   } = useGetAllPaymentGatewaysQuery();

//   const { data: activeGateway } = useGetActivePaymentGatewayQuery();

//   const { data: gatewayStats, isLoading: loadingStats } =
//     useGetPaymentGatewayStatsQuery();

//   // API mutations
//   const [createGateway, { isLoading: creatingGateway }] =
//     useCreatePaymentGatewayMutation();
//   const [updateGateway, { isLoading: updatingGateway }] =
//     useUpdatePaymentGatewayMutation();
//   const [activateGateway, { isLoading: activatingGateway }] =
//     useActivatePaymentGatewayMutation();
//   const [deactivateAllGateways] = useDeactivateAllPaymentGatewaysMutation();
//   const [deleteGateway] = useDeletePaymentGatewayMutation();

//   const toastConfig = {
//     position: "top-right",
//     autoClose: 3000,
//     hideProgressBar: false,
//     closeOnClick: true,
//     pauseOnHover: true,
//     draggable: true,
//   };

//   // Handle create gateway
//   const handleCreateGateway = async () => {
//     const gatewayName = isCustomGateway
//       ? newGatewayName.trim()
//       : newGatewayName;

//     if (!gatewayName) {
//       toast.error("Please select or enter a gateway name", toastConfig);
//       return;
//     }

//     try {
//       const result = await createGateway({
//         gatewayName: gatewayName,
//         isActive: false,
//       }).unwrap();

//       if (result.success) {
//         toast.success("Payment gateway created successfully!", toastConfig);
//         setNewGatewayName("");
//         setIsCustomGateway(false);
//         setShowCreateModal(false);
//         refetchGateways();
//       }
//     } catch (error) {
//       toast.error(
//         error?.data?.message || "Failed to create payment gateway",
//         toastConfig
//       );
//     }
//   };

//   const handlePredefinedGatewaySelect = (gatewayName) => {
//     setNewGatewayName(gatewayName);
//     setIsCustomGateway(false);
//   };

//   const handleCustomGatewayToggle = () => {
//     setIsCustomGateway(true);
//     setNewGatewayName("");
//   };

//   const resetCreateModal = () => {
//     setShowCreateModal(false);
//     setNewGatewayName("");
//     setIsCustomGateway(false);
//   };

//   const handleEditGateway = async () => {
//     if (!editGatewayName.trim()) {
//       toast.error("Gateway name is required", toastConfig);
//       return;
//     }

//     try {
//       const result = await updateGateway({
//         id: editingGateway._id,
//         gatewayName: editGatewayName.trim(),
//       }).unwrap();

//       if (result.success) {
//         toast.success("Payment gateway updated successfully!", toastConfig);
//         setEditGatewayName("");
//         setEditingGateway(null);
//         setShowEditModal(false);
//         refetchGateways();
//       }
//     } catch (error) {
//       toast.error(
//         error?.data?.message || "Failed to update payment gateway",
//         toastConfig
//       );
//     }
//   };

//   const handleActivateGateway = async (gatewayId, gatewayName) => {
//     try {
//       const result = await activateGateway(gatewayId).unwrap();

//       if (result.success) {
//         toast.success(
//           `${gatewayName} activated successfully! Other gateways deactivated.`,
//           toastConfig
//         );
//         refetchGateways();
//         window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
//       }
//     } catch (error) {
//       toast.error(
//         error?.data?.message || "Failed to activate payment gateway",
//         toastConfig
//       );
//     }
//   };

//   const handleDeactivateGateway = async (gatewayId, gatewayName) => {
//     try {
//       const result = await updateGateway({
//         id: gatewayId,
//         isActive: false,
//       }).unwrap();

//       if (result.success) {
//         toast.success(`${gatewayName} deactivated successfully!`, toastConfig);
//         refetchGateways();
//         window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
//       }
//     } catch (error) {
//       toast.error(
//         error?.data?.message || "Failed to deactivate payment gateway",
//         toastConfig
//       );
//     }
//   };

//   const handleDeactivateAll = async () => {
//     if (
//       window.confirm(
//         "Are you sure you want to deactivate all payment gateways?"
//       )
//     ) {
//       try {
//         const result = await deactivateAllGateways().unwrap();

//         if (result.success) {
//           toast.success(
//             "All payment gateways deactivated successfully!",
//             toastConfig
//           );
//           refetchGateways();
//         }
//       } catch (error) {
//         toast.error(
//           error?.data?.message || "Failed to deactivate payment gateways",
//           toastConfig
//         );
//       }
//     }
//   };

//   const handleDeleteGateway = async (gatewayId, gatewayName) => {
//     if (
//       window.confirm(
//         `Are you sure you want to delete "${gatewayName}"? This action cannot be undone.`
//       )
//     ) {
//       try {
//         const result = await deleteGateway(gatewayId).unwrap();

//         if (result.success) {
//           toast.success(`${gatewayName} deleted successfully!`, toastConfig);
//           refetchGateways();
//         }
//       } catch (error) {
//         toast.error(
//           error?.data?.message || "Failed to delete payment gateway",
//           toastConfig
//         );
//       }
//     }
//   };

//   const openEditModal = (gateway) => {
//     setEditingGateway(gateway);
//     setEditGatewayName(gateway.gatewayName);
//     setShowEditModal(true);
//   };

//   // Filter gateways
//   const filteredGateways =
//     allGateways?.data?.filter((gateway) => {
//       if (filterActive === "active") return gateway.isActive;
//       if (filterActive === "inactive") return !gateway.isActive;
//       return true;
//     }) || [];

//   // Gateway Card Component
//   const GatewayCard = ({ gateway }) => (
//     <div className="group relative bg-[#1b232d] border border-[#2a2c2f] rounded-2xl 
//       overflow-hidden transition-all duration-300 hover:border-[#eb660f] 
//       hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(235,102,15,0.15)]">
      
//       {/* Active Badge Corner */}
//       {gateway.isActive && (
//         <div className="absolute top-0 right-0 w-0 h-0 
//           border-l-[50px] border-l-transparent border-t-[50px] border-t-[#eb660f]">
//           <CheckCircle
//             size={14}
//             className="absolute -top-[42px] -right-[14px] text-white"
//           />
//         </div>
//       )}

//       <div className="p-5">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-5">
//           <div className="flex items-center gap-3">
//             <div
//               className={`w-12 h-12 rounded-full flex items-center justify-center 
//                 ${gateway.isActive 
//                   ? "bg-[#eb660f]/20 text-[#eb660f]" 
//                   : "bg-[#2a2c2f] text-[#8a8d93]"
//                 }`}
//             >
//               <CreditCard size={22} />
//             </div>
//             <div>
//               <h3 className="text-white font-bold text-base mb-1">
//                 {gateway.gatewayName}
//               </h3>
//               <span
//                 className={`inline-flex items-center gap-1 text-[11px] font-semibold 
//                   px-2.5 py-1 rounded-full
//                   ${gateway.isActive
//                     ? "bg-[#eb660f]/10 text-[#eb660f]"
//                     : "bg-[#2a2c2f] text-[#8a8d93]"
//                   }`}
//               >
//                 {gateway.isActive ? (
//                   <>
//                     <Power size={10} />
//                     Active
//                   </>
//                 ) : (
//                   <>
//                     <Pause size={10} />
//                     Inactive
//                   </>
//                 )}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Info Cards */}
//         <div className="space-y-2.5 mb-5">
//           <div className="bg-[#eb660f]/5 border border-[#eb660f]/10 rounded-xl p-3.5">
//             <div className="flex items-center gap-2 text-[#8a8d93] mb-1.5">
//               <Calendar size={13} className="text-[#eb660f]" />
//               <span className="text-xs font-medium">Created</span>
//             </div>
//             <p className="text-white/70 text-xs m-0">
//               {new Date(gateway.createdAt).toLocaleDateString("en-US", {
//                 year: "numeric",
//                 month: "short",
//                 day: "numeric",
//               })}
//             </p>
//           </div>

//           <div className="bg-[#2a2c2f]/50 border border-[#2a2c2f] rounded-xl p-3.5">
//             <div className="flex items-center gap-2 text-[#8a8d93] mb-1.5">
//               <Activity size={13} className="text-[#8a8d93]" />
//               <span className="text-xs font-medium">Last Updated</span>
//             </div>
//             <p className="text-white/70 text-xs m-0">
//               {new Date(gateway.updatedAt).toLocaleDateString("en-US", {
//                 year: "numeric",
//                 month: "short",
//                 day: "numeric",
//               })}
//             </p>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex gap-2">
//           {gateway.isActive ? (
//             <button
//               className="flex-1 flex items-center justify-center gap-2 
//                 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 
//                 border border-yellow-500/20 rounded-xl py-2.5 px-4 
//                 text-sm font-medium transition-all duration-200 
//                 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
//               onClick={() =>
//                 handleDeactivateGateway(gateway._id, gateway.gatewayName)
//               }
//               disabled={activatingGateway || updatingGateway}
//             >
//               {updatingGateway ? (
//                 <div className="w-4 h-4 border-2 border-yellow-400/30 
//                   border-t-yellow-400 rounded-full animate-spin" />
//               ) : (
//                 <Pause size={15} />
//               )}
//               Deactivate
//             </button>
//           ) : (
//             <button
//               className="flex-1 flex items-center justify-center gap-2 
//                 bg-[#eb660f] hover:bg-[#d55a0d] text-white 
//                 border border-[#eb660f] rounded-xl py-2.5 px-4 
//                 text-sm font-medium transition-all duration-200 
//                 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
//                 hover:shadow-[0_4px_15px_rgba(235,102,15,0.3)]"
//               onClick={() =>
//                 handleActivateGateway(gateway._id, gateway.gatewayName)
//               }
//               disabled={activatingGateway}
//             >
//               {activatingGateway ? (
//                 <div className="w-4 h-4 border-2 border-white/30 
//                   border-t-white rounded-full animate-spin" />
//               ) : (
//                 <Play size={15} />
//               )}
//               Activate
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div>
//       <div className="p-2 sm:p-2 space-y-6">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row items-start sm:items-center 
//           justify-between gap-4">
//           <div>
//             <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
//               <div className="w-10 h-10 bg-[#eb660f]/10 rounded-xl flex items-center 
//                 justify-center">
//                 <CreditCard size={22} className="text-[#eb660f]" />
//               </div>
//               Payment Gateway Management
//             </h1>
//             <p className="text-[#8a8d93] text-sm mt-1 ml-[52px]">
//               Manage and monitor your payment gateways
//             </p>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//           <StatCard
//             title="Total Gateways"
//             value={
//               loadingStats ? (
//                 <div className="w-5 h-5 border-2 border-[#eb660f]/30 
//                   border-t-[#eb660f] rounded-full animate-spin" />
//               ) : (
//                 gatewayStats?.data?.totalGateways || 0
//               )
//             }
//             valueClass="text-[#eb660f]"
//           />
//           <StatCard
//             title="Current Active"
//             value={
//               loadingStats ? (
//                 <div className="w-5 h-5 border-2 border-[#eb660f]/30 
//                   border-t-[#eb660f] rounded-full animate-spin" />
//               ) : (
//                 gatewayStats?.data?.currentActiveGateway || "None"
//               )
//             }
//             valueClass="text-[#eb660f]"
//           />
//           <StatCard
//             title="Active Gateways"
//             value={
//               loadingStats ? (
//                 <div className="w-5 h-5 border-2 border-[#0ecb6f]/30 
//                   border-t-[#0ecb6f] rounded-full animate-spin" />
//               ) : (
//                 gatewayStats?.data?.activeGateways || 0
//               )
//             }
//             valueClass="text-[#0ecb6f]"
//           />
//           <StatCard
//             title="Inactive Gateways"
//             value={
//               loadingStats ? (
//                 <div className="w-5 h-5 border-2 border-red-400/30 
//                   border-t-red-400 rounded-full animate-spin" />
//               ) : (
//                 gatewayStats?.data?.inactiveGateways || 0
//               )
//             }
//             valueClass="text-red-400"
//           />
//         </div>

//         {/* Active Gateway Alert */}
//         {activeGateway?.data && (
//           <div className="bg-[#eb660f]/5 border border-[#eb660f]/20 
//             rounded-xl px-4 py-3 flex items-center gap-3">
//             <div className="w-8 h-8 bg-[#eb660f]/10 rounded-lg flex items-center 
//               justify-center flex-shrink-0">
//               <Zap size={16} className="text-[#eb660f]" />
//             </div>
//             <div className="flex items-center gap-2 flex-wrap">
//               <span className="text-white font-semibold text-sm">
//                 Active Gateway:
//               </span>
//               <span className="text-[#eb660f] font-bold text-sm">
//                 {activeGateway.data.gatewayName}
//               </span>
//             </div>
//           </div>
//         )}

//         {/* Main Content Card */}
//         <div className="bg-[#1b232d] border border-[#2a2c2f] rounded-2xl overflow-hidden">
//           {/* Filter Header */}
//           <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
//             <div className="flex flex-col sm:flex-row items-start sm:items-center 
//               justify-between gap-4">
//               <h2 className="text-lg font-semibold text-white">
//                 All Gateways
//               </h2>

//               <div className="flex items-center gap-2 flex-wrap">
//                 <div className="flex items-center gap-2 mr-2">
//                   <Filter size={16} className="text-[#eb660f]" />
//                   <span className="text-[#8a8d93] text-sm font-medium">
//                     Filter:
//                   </span>
//                 </div>

//                 {[
//                   {
//                     key: "all",
//                     label: `All (${allGateways?.data?.length || 0})`,
//                   },
//                   {
//                     key: "active",
//                     label: `Active (${gatewayStats?.data?.activeGateways || 0})`,
//                   },
//                   {
//                     key: "inactive",
//                     label: `Inactive (${gatewayStats?.data?.inactiveGateways || 0})`,
//                   },
//                 ].map((filter) => (
//                   <button
//                     key={filter.key}
//                     onClick={() => setFilterActive(filter.key)}
//                     className={`px-3 py-1.5 rounded-lg text-xs font-medium 
//                       transition-all duration-200 cursor-pointer border
//                       ${filterActive === filter.key
//                         ? "bg-[#eb660f] text-white border-[#eb660f]"
//                         : "bg-transparent text-[#8a8d93] border-[#2a2c2f] hover:border-[#eb660f]/50 hover:text-white"
//                       }`}
//                   >
//                     {filter.label}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Gateways Grid */}
//           <div className="p-4 sm:p-6">
//             {loadingGateways ? (
//               <div className="flex flex-col items-center justify-center py-16">
//                 <div className="w-12 h-12 border-3 border-[#eb660f]/20 
//                   border-t-[#eb660f] rounded-full animate-spin mb-4" />
//                 <p className="text-white text-lg font-semibold mb-1">
//                   Loading payment gateways...
//                 </p>
//                 <p className="text-[#8a8d93] text-sm">
//                   Please wait while we fetch your data
//                 </p>
//               </div>
//             ) : filteredGateways.length > 0 ? (
//               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//                 {filteredGateways.map((gateway) => (
//                   <GatewayCard key={gateway._id} gateway={gateway} />
//                 ))}
//               </div>
//             ) : (
//               <div className="flex flex-col items-center justify-center py-16">
//                 <div className="w-20 h-20 bg-[#eb660f]/10 rounded-full 
//                   flex items-center justify-center mb-5">
//                   <CreditCard size={36} className="text-[#eb660f]" />
//                 </div>
//                 <h3 className="text-white text-lg font-semibold mb-2">
//                   No payment gateways found
//                 </h3>
//                 <p className="text-[#8a8d93] text-sm mb-5 text-center max-w-sm">
//                   {filterActive !== "all"
//                     ? `No ${filterActive} gateways available. Try changing the filter.`
//                     : "Create your first payment gateway to get started"}
//                 </p>
//                 {filterActive === "all" && (
//                   <button
//                     className="flex items-center gap-2 bg-[#eb660f] hover:bg-[#d55a0d] 
//                       text-white rounded-xl py-2.5 px-5 text-sm font-medium 
//                       transition-all duration-200 cursor-pointer
//                       hover:shadow-[0_4px_15px_rgba(235,102,15,0.3)]"
//                     onClick={() => setShowCreateModal(true)}
//                   >
//                     <Plus size={18} />
//                     Create Gateway
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentGatewayManagement;


import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Zap,
  Play,
  Pause,
  Plus,
  Power,
  Calendar,
  Activity,
  Filter,
} from "lucide-react";
import {
  useGetAllPaymentGatewaysQuery,
  useGetActivePaymentGatewayQuery,
  useGetPaymentGatewayStatsQuery,
  useCreatePaymentGatewayMutation,
  useUpdatePaymentGatewayMutation,
  useActivatePaymentGatewayMutation,
  useDeactivateAllPaymentGatewaysMutation,
  useDeletePaymentGatewayMutation,
} from "./paymentGatewayApiSlice";
import Loader from "../../reusableComponents/Loader/Loader";

const PaymentGatewayManagement = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGateway, setEditingGateway] = useState(null);
  const [newGatewayName, setNewGatewayName] = useState("");
  const [editGatewayName, setEditGatewayName] = useState("");
  const [filterActive, setFilterActive] = useState("all");
  const [isCustomGateway, setIsCustomGateway] = useState(false);

  // API Queries
  const {
    data: allGateways,
    isLoading: loadingGateways,
    refetch: refetchGateways,
  } = useGetAllPaymentGatewaysQuery();

  const { data: activeGateway } = useGetActivePaymentGatewayQuery();

  const { data: gatewayStats, isLoading: loadingStats } =
    useGetPaymentGatewayStatsQuery();

  // API Mutations
  const [createGateway, { isLoading: creatingGateway }] =
    useCreatePaymentGatewayMutation();
  const [updateGateway, { isLoading: updatingGateway }] =
    useUpdatePaymentGatewayMutation();
  const [activateGateway, { isLoading: activatingGateway }] =
    useActivatePaymentGatewayMutation();
  const [deactivateAllGateways, { isLoading: deactivatingAll }] =
    useDeactivateAllPaymentGatewaysMutation();
  const [deleteGateway, { isLoading: deletingGateway }] =
    useDeletePaymentGatewayMutation();

  const toastConfig = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  // Handlers
  const handleCreateGateway = async () => {
    const gatewayName = isCustomGateway
      ? newGatewayName.trim()
      : newGatewayName;

    if (!gatewayName) {
      toast.error("Please select or enter a gateway name", toastConfig);
      return;
    }

    try {
      const result = await createGateway({
        gatewayName,
        isActive: false,
      }).unwrap();

      if (result.success) {
        toast.success("Payment gateway created successfully!", toastConfig);
        resetCreateModal();
        refetchGateways();
      }
    } catch (error) {
      toast.error(
        error?.data?.message || "Failed to create payment gateway",
        toastConfig
      );
    }
  };

  const handlePredefinedGatewaySelect = (gatewayName) => {
    setNewGatewayName(gatewayName);
    setIsCustomGateway(false);
  };

  const handleCustomGatewayToggle = () => {
    setIsCustomGateway(true);
    setNewGatewayName("");
  };

  const resetCreateModal = () => {
    setShowCreateModal(false);
    setNewGatewayName("");
    setIsCustomGateway(false);
  };

  const handleEditGateway = async () => {
    if (!editGatewayName.trim()) {
      toast.error("Gateway name is required", toastConfig);
      return;
    }

    try {
      const result = await updateGateway({
        id: editingGateway._id,
        gatewayName: editGatewayName.trim(),
      }).unwrap();

      if (result.success) {
        toast.success("Payment gateway updated successfully!", toastConfig);
        setEditGatewayName("");
        setEditingGateway(null);
        setShowEditModal(false);
        refetchGateways();
      }
    } catch (error) {
      toast.error(
        error?.data?.message || "Failed to update payment gateway",
        toastConfig
      );
    }
  };

  const handleActivateGateway = async (gatewayId, gatewayName) => {
    try {
      const result = await activateGateway(gatewayId).unwrap();

      if (result.success) {
        toast.success(
          `${gatewayName} activated successfully! Other gateways deactivated.`,
          toastConfig
        );
        refetchGateways();
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      }
    } catch (error) {
      toast.error(
        error?.data?.message || "Failed to activate payment gateway",
        toastConfig
      );
    }
  };

  const handleDeactivateGateway = async (gatewayId, gatewayName) => {
    try {
      const result = await updateGateway({
        id: gatewayId,
        isActive: false,
      }).unwrap();

      if (result.success) {
        toast.success(`${gatewayName} deactivated successfully!`, toastConfig);
        refetchGateways();
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      }
    } catch (error) {
      toast.error(
        error?.data?.message || "Failed to deactivate payment gateway",
        toastConfig
      );
    }
  };

  const handleDeactivateAll = async () => {
    if (
      window.confirm(
        "Are you sure you want to deactivate all payment gateways?"
      )
    ) {
      try {
        const result = await deactivateAllGateways().unwrap();

        if (result.success) {
          toast.success(
            "All payment gateways deactivated successfully!",
            toastConfig
          );
          refetchGateways();
        }
      } catch (error) {
        toast.error(
          error?.data?.message || "Failed to deactivate payment gateways",
          toastConfig
        );
      }
    }
  };

  const handleDeleteGateway = async (gatewayId, gatewayName) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${gatewayName}"? This action cannot be undone.`
      )
    ) {
      try {
        const result = await deleteGateway(gatewayId).unwrap();

        if (result.success) {
          toast.success(`${gatewayName} deleted successfully!`, toastConfig);
          refetchGateways();
        }
      } catch (error) {
        toast.error(
          error?.data?.message || "Failed to delete payment gateway",
          toastConfig
        );
      }
    }
  };

  const openEditModal = (gateway) => {
    setEditingGateway(gateway);
    setEditGatewayName(gateway.gatewayName);
    setShowEditModal(true);
  };

  // Filter
  const filteredGateways =
    allGateways?.data?.filter((gateway) => {
      if (filterActive === "active") return gateway.isActive;
      if (filterActive === "inactive") return !gateway.isActive;
      return true;
    }) || [];

  const predefinedGateways = [
    "Razorpay",
    "PhonePe",
    "PayPal",
    "Stripe",
    "Paytm",
  ];

  return (
    <div className=" sm:p-3 space-y-6 min-h-screen bg-[#1b232d] p-10 rounded-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          {/* <CreditCard size={32} className="text-[#eb660f]" /> */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Payment Gateway Management
            </h3>
            <p className="text-xs text-[#8a8d93] mt-2">
              Manage and monitor your payment gateways
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {loadingStats ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Total Gateways */}
          <div
            className="relative overflow-hidden rounded-2xl p-5 shadow-lg 
              hover:-translate-y-1 transition-all duration-300
              hover:shadow-[0_10px_25px_rgba(235,102,15,0.3)]"
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            }}
          >
            <div className="absolute top-3 right-3 opacity-25">
              <CreditCard size={60} className="text-white" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-full bg-white/20">
                  <CreditCard size={24} className="text-white" />
                </div>
                <p className="text-white/70 text-xs">Total Gateways</p>
              </div>
              <h2 className="text-xl font-bold text-white">
                {gatewayStats?.data?.totalGateways || 0}
              </h2>
            </div>
          </div>

          {/* Current Active */}
          <div
            className="relative overflow-hidden rounded-2xl p-5 shadow-lg 
              hover:-translate-y-1 transition-all duration-300
              hover:shadow-[0_10px_25px_rgba(235,102,15,0.3)]"
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            }}
          >
            <div className="absolute top-3 right-3 opacity-25">
              <Zap size={60} className="text-white" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-full bg-white/20">
                  <Zap size={24} className="text-white" />
                </div>
                <p className="text-white/70 text-sm">Current Active</p>
              </div>
              <h2 className="text-2xl font-bold text-white">
                {gatewayStats?.data?.currentActiveGateway || "None"}
              </h2>
            </div>
          </div>

          {/* Active Gateways */}
          <div
            className="relative overflow-hidden rounded-2xl p-5 shadow-lg 
              hover:-translate-y-1 transition-all duration-300
              hover:shadow-[0_10px_25px_rgba(235,102,15,0.3)]"
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            }}
          >
            <div className="absolute top-3 right-3 opacity-25">
              <CheckCircle size={60} className="text-white" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-full bg-white/20">
                  <CheckCircle size={24} className="text-white" />
                </div>
                <p className="text-white/70 text-sm">Active Gateways</p>
              </div>
              <h2 className="text-3xl font-semibold text-white">
                {gatewayStats?.data?.activeGateways || 0}
              </h2>
            </div>
          </div>

          {/* Inactive Gateways */}
          <div
            className="relative overflow-hidden rounded-2xl p-5 shadow-lg 
              hover:-translate-y-1 transition-all duration-300
              hover:shadow-[0_10px_25px_rgba(183,79,11,0.3)]"
            style={{
              background: "linear-gradient(135deg, #b74f0b 0%, #b74f0b 100%)",
            }}
          >
            <div className="absolute top-3 right-3 opacity-25">
              <XCircle size={60} className="text-white" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-full bg-white/20">
                  <XCircle size={24} className="text-white" />
                </div>
                <p className="text-white/70 text-sm">Inactive Gateways</p>
              </div>
              <h2 className="text-3xl font-semibold text-white">
                {gatewayStats?.data?.inactiveGateways || 0}
              </h2>
            </div>
          </div>
        </div>
      )}

      {/* Active Gateway Alert */}
      {activeGateway?.data && (
        <div
          className="flex items-center gap-3 rounded-xl px-5 py-4 shadow-sm
            bg-[#eb660f]/10 border-l-4 border-[#eb660f]"
        >
          <Zap size={20} className="text-[#eb660f] shrink-0" />
          <span className="text-white font-bold">Active Gateway:</span>
          <span className="text-white">{activeGateway.data.gatewayName}</span>
        </div>
      )}

      {/* Filter Section */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 mr-2">
          <Filter size={18} className="text-[#eb660f]" />
          <span className="text-white font-medium text-sm">Filter:</span>
        </div>

        <button
          onClick={() => setFilterActive("all")}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
            filterActive === "all"
              ? "bg-[#eb660f] text-white shadow-md shadow-[#eb660f]/20"
              : "bg-transparent border border-[#64748b] text-white hover:border-[#eb660f]/50"
          }`}
        >
          All ({allGateways?.data?.length || 0})
        </button>

        <button
          onClick={() => setFilterActive("active")}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
            filterActive === "active"
              ? "bg-[#eb660f] text-white shadow-md shadow-[#eb660f]/20"
              : "bg-transparent border border-[#64748b] text-white hover:border-[#eb660f]/50"
          }`}
        >
          Active ({gatewayStats?.data?.activeGateways || 0})
        </button>

        <button
          onClick={() => setFilterActive("inactive")}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
            filterActive === "inactive"
              ? "bg-[#eb660f] text-white shadow-md shadow-[#eb660f]/20"
              : "bg-transparent border border-[#64748b] text-white hover:border-[#eb660f]/50"
          }`}
        >
          Inactive ({gatewayStats?.data?.inactiveGateways || 0})
        </button>
      </div>

      {/* Gateway Cards Grid */}
      {loadingGateways ? (
        <Loader />
      ) : filteredGateways.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredGateways.map((gateway) => (
            <div
              key={gateway._id}
              className={`relative overflow-hidden rounded-2xl shadow-lg
                transition-all duration-300 hover:-translate-y-2 group
                bg-[#1b232d] border
                ${
                  gateway.isActive
                    ? "border-[#eb660f]/30 hover:shadow-[0_15px_35px_rgba(235,102,15,0.2)] hover:border-[#eb660f]"
                    : "border-[#2a2c2f] hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)] hover:border-[#eb660f]"
                }`}
            >
              {/* Active Corner Badge */}
              {gateway.isActive && (
                <div className="absolute top-0 right-0">
                  <div
                    className="w-0 h-0"
                    style={{
                      borderLeft: "50px solid transparent",
                      borderTop: "50px solid #eb660f",
                    }}
                  />
                  <CheckCircle
                    size={16}
                    className="absolute text-white"
                    style={{ top: "5px", right: "5px" }}
                  />
                </div>
              )}

              <div className="p-5">
                {/* Card Header */}
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className={`p-3 rounded-full shrink-0 ${
                      gateway.isActive ? "bg-[#eb660f]" : "bg-[#64748b]"
                    }`}
                  >
                    <CreditCard size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">
                      {gateway.gatewayName}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${
                        gateway.isActive
                          ? "bg-[#eb660f] text-white"
                          : "bg-[#64748b] text-white"
                      }`}
                    >
                      {gateway.isActive ? (
                        <>
                          <Power size={12} /> Active
                        </>
                      ) : (
                        <>
                          <Pause size={12} /> Inactive
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Info Rows */}
                <div className="space-y-2 mb-5">
                  <div className="bg-[#eb660f]/10 border border-[#eb660f]/20 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-white mb-1">
                      <Calendar size={14} className="text-white" />
                      <span className="text-xs font-medium">Created</span>
                    </div>
                    <p className="text-sm text-white/60">
                      {new Date(gateway.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="bg-[#64748b]/10 border border-[#64748b]/20 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-white mb-1">
                      <Activity size={14} className="text-white" />
                      <span className="text-xs font-medium">Last Updated</span>
                    </div>
                    <p className="text-sm text-white/60">
                      {new Date(gateway.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  {gateway.isActive ? (
                    <button
                      onClick={() =>
                        handleDeactivateGateway(
                          gateway._id,
                          gateway.gatewayName
                        )
                      }
                      disabled={activatingGateway || updatingGateway}
                      className="flex-1 flex items-center justify-center gap-2 
                        bg-[#f59e0b] hover:bg-[#f59e0b]/90 text-white
                        font-semibold py-2.5 px-4 rounded-xl text-sm
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200 cursor-pointer min-h-[40px]"
                    >
                      {activatingGateway || updatingGateway ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Pause size={16} />
                      )}
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleActivateGateway(
                          gateway._id,
                          gateway.gatewayName
                        )
                      }
                      disabled={activatingGateway}
                      className="flex-1 flex items-center justify-center gap-2 
                        bg-[#eb660f] hover:bg-[#eb660f]/90 text-white
                        font-semibold py-2.5 px-4 rounded-xl text-sm
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200 cursor-pointer min-h-[40px]"
                    >
                      {activatingGateway ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Play size={16} />
                      )}
                      Activate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16">
          <div
            className="w-24 h-24 rounded-full bg-[#eb660f]/10 
              flex items-center justify-center mb-4"
          >
            <CreditCard size={48} className="text-[#eb660f]" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">
            No payment gateways found
          </h3>
          <p className="text-[#8a8d93] text-sm mb-4">
            {filterActive !== "all"
              ? `No ${filterActive} gateways available`
              : "Create your first payment gateway to get started"}
          </p>
          {filterActive === "all" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-[#eb660f] hover:bg-[#eb660f]/90 
                text-white font-semibold py-3 px-6 rounded-xl text-sm
                transition-colors cursor-pointer"
            >
              <Plus size={20} />
              Create Gateway
            </button>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative bg-[#1b232d] border border-[#2a2c2f] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2c2f]">
              <h2 className="text-lg font-bold text-white">Edit Gateway</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg 
                  bg-[#111214] text-[#8a8d93] hover:text-white 
                  transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5">
              <label className="block text-sm font-medium text-[#8a8d93] mb-2">
                Gateway Name
              </label>
              <input
                type="text"
                value={editGatewayName}
                onChange={(e) => setEditGatewayName(e.target.value)}
                className="w-full bg-[#111214] border border-[#2a2c2f] text-white rounded-xl 
                  py-3 px-4 text-sm focus:outline-none focus:border-[#eb660f] 
                  focus:ring-1 focus:ring-[#eb660f]/50 transition-colors"
                placeholder="Enter gateway name"
              />
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#2a2c2f]">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium 
                  bg-[#64748b] text-white hover:bg-[#64748b]/80 
                  transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleEditGateway}
                disabled={updatingGateway}
                className="px-5 py-2.5 rounded-xl text-sm font-medium 
                  bg-[#eb660f] text-white hover:bg-[#eb660f]/90 
                  disabled:opacity-50 disabled:cursor-not-allowed 
                  transition-colors cursor-pointer flex items-center gap-2"
              >
                {updatingGateway ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Gateway"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={resetCreateModal}
          />
          <div className="relative bg-[#1b232d] border border-[#2a2c2f] rounded-2xl w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2c2f]">
              <div className="flex items-center gap-2">
                <Plus size={24} className="text-[#eb660f]" />
                <h2 className="text-lg font-bold text-white">
                  Add New Payment Gateway
                </h2>
              </div>
              <button
                onClick={resetCreateModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg 
                  bg-[#111214] text-[#8a8d93] hover:text-white 
                  transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Select Gateway Type
                </label>
                <div className="flex gap-2 flex-wrap mb-3">
                  {predefinedGateways.map((gateway) => (
                    <button
                      key={gateway}
                      onClick={() => handlePredefinedGatewaySelect(gateway)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium 
                        transition-all duration-200 cursor-pointer ${
                          newGatewayName === gateway && !isCustomGateway
                            ? "bg-[#eb660f] text-white shadow-md"
                            : "bg-transparent border border-blue-500/50 text-white hover:border-[#eb660f]/50"
                        }`}
                    >
                      {gateway}
                    </button>
                  ))}
                  <button
                    onClick={handleCustomGatewayToggle}
                    className={`px-4 py-2 rounded-xl text-sm font-medium 
                      transition-all duration-200 cursor-pointer ${
                        isCustomGateway
                          ? "bg-[#f59e0b] text-white shadow-md"
                          : "bg-transparent border border-[#f59e0b]/50 text-white hover:border-[#f59e0b]"
                      }`}
                  >
                    Custom
                  </button>
                </div>
              </div>

              {isCustomGateway && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Custom Gateway Name
                  </label>
                  <input
                    type="text"
                    value={newGatewayName}
                    onChange={(e) => setNewGatewayName(e.target.value)}
                    className="w-full bg-[#111214] border border-[#2a2c2f] text-white rounded-xl 
                      py-3 px-4 text-sm focus:outline-none focus:border-[#eb660f] 
                      focus:ring-1 focus:ring-[#eb660f]/50 transition-colors"
                    placeholder="Enter custom gateway name"
                  />
                </div>
              )}

              {!isCustomGateway && newGatewayName && (
                <div className="flex items-center gap-2 bg-[#eb660f]/10 border-l-[3px] border-[#eb660f] rounded-lg px-4 py-3">
                  <CheckCircle size={18} className="text-[#eb660f] shrink-0" />
                  <span className="text-white text-sm">
                    Selected:{" "}
                    <strong className="text-[#eb660f]">{newGatewayName}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#2a2c2f]">
              <button
                onClick={resetCreateModal}
                className="px-5 py-2.5 rounded-xl text-sm font-medium 
                  bg-[#64748b] text-white hover:bg-[#64748b]/80 
                  transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGateway}
                disabled={creatingGateway}
                className="px-5 py-2.5 rounded-xl text-sm font-medium 
                  bg-[#eb660f] text-white hover:bg-[#eb660f]/90 
                  disabled:opacity-50 disabled:cursor-not-allowed 
                  transition-colors cursor-pointer flex items-center gap-2"
              >
                {creatingGateway ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Create Gateway
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentGatewayManagement;