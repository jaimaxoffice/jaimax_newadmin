import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Zap,
  Play,
  Pause,
  Plus,
  Filter,
  Activity,
  Power,
  Calendar,
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
import StatCard from "../../reusableComponents/StatCards/StatsCard";

const PaymentGatewayManagement = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGateway, setEditingGateway] = useState(null);
  const [newGatewayName, setNewGatewayName] = useState("");
  const [editGatewayName, setEditGatewayName] = useState("");
  const [filterActive, setFilterActive] = useState("all");
  const [isCustomGateway, setIsCustomGateway] = useState(false);

  // API queries
  const {
    data: allGateways,
    isLoading: loadingGateways,
    refetch: refetchGateways,
  } = useGetAllPaymentGatewaysQuery();

  const { data: activeGateway } = useGetActivePaymentGatewayQuery();

  const { data: gatewayStats, isLoading: loadingStats } =
    useGetPaymentGatewayStatsQuery();

  // API mutations
  const [createGateway, { isLoading: creatingGateway }] =
    useCreatePaymentGatewayMutation();
  const [updateGateway, { isLoading: updatingGateway }] =
    useUpdatePaymentGatewayMutation();
  const [activateGateway, { isLoading: activatingGateway }] =
    useActivatePaymentGatewayMutation();
  const [deactivateAllGateways] = useDeactivateAllPaymentGatewaysMutation();
  const [deleteGateway] = useDeletePaymentGatewayMutation();

  const toastConfig = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  // Handle create gateway
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
        gatewayName: gatewayName,
        isActive: false,
      }).unwrap();

      if (result.success) {
        toast.success("Payment gateway created successfully!", toastConfig);
        setNewGatewayName("");
        setIsCustomGateway(false);
        setShowCreateModal(false);
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

  // Filter gateways
  const filteredGateways =
    allGateways?.data?.filter((gateway) => {
      if (filterActive === "active") return gateway.isActive;
      if (filterActive === "inactive") return !gateway.isActive;
      return true;
    }) || [];

  // Gateway Card Component
  const GatewayCard = ({ gateway }) => (
    <div className="group relative bg-[#1b232d] border border-[#2a2c2f] rounded-2xl 
      overflow-hidden transition-all duration-300 hover:border-[#eb660f] 
      hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(235,102,15,0.15)]">
      
      {/* Active Badge Corner */}
      {gateway.isActive && (
        <div className="absolute top-0 right-0 w-0 h-0 
          border-l-[50px] border-l-transparent border-t-[50px] border-t-[#eb660f]">
          <CheckCircle
            size={14}
            className="absolute -top-[42px] -right-[14px] text-white"
          />
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center 
                ${gateway.isActive 
                  ? "bg-[#eb660f]/20 text-[#eb660f]" 
                  : "bg-[#2a2c2f] text-[#8a8d93]"
                }`}
            >
              <CreditCard size={22} />
            </div>
            <div>
              <h3 className="text-white font-bold text-base mb-1">
                {gateway.gatewayName}
              </h3>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold 
                  px-2.5 py-1 rounded-full
                  ${gateway.isActive
                    ? "bg-[#eb660f]/10 text-[#eb660f]"
                    : "bg-[#2a2c2f] text-[#8a8d93]"
                  }`}
              >
                {gateway.isActive ? (
                  <>
                    <Power size={10} />
                    Active
                  </>
                ) : (
                  <>
                    <Pause size={10} />
                    Inactive
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="space-y-2.5 mb-5">
          <div className="bg-[#eb660f]/5 border border-[#eb660f]/10 rounded-xl p-3.5">
            <div className="flex items-center gap-2 text-[#8a8d93] mb-1.5">
              <Calendar size={13} className="text-[#eb660f]" />
              <span className="text-xs font-medium">Created</span>
            </div>
            <p className="text-white/70 text-xs m-0">
              {new Date(gateway.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="bg-[#2a2c2f]/50 border border-[#2a2c2f] rounded-xl p-3.5">
            <div className="flex items-center gap-2 text-[#8a8d93] mb-1.5">
              <Activity size={13} className="text-[#8a8d93]" />
              <span className="text-xs font-medium">Last Updated</span>
            </div>
            <p className="text-white/70 text-xs m-0">
              {new Date(gateway.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {gateway.isActive ? (
            <button
              className="flex-1 flex items-center justify-center gap-2 
                bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 
                border border-yellow-500/20 rounded-xl py-2.5 px-4 
                text-sm font-medium transition-all duration-200 
                disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              onClick={() =>
                handleDeactivateGateway(gateway._id, gateway.gatewayName)
              }
              disabled={activatingGateway || updatingGateway}
            >
              {updatingGateway ? (
                <div className="w-4 h-4 border-2 border-yellow-400/30 
                  border-t-yellow-400 rounded-full animate-spin" />
              ) : (
                <Pause size={15} />
              )}
              Deactivate
            </button>
          ) : (
            <button
              className="flex-1 flex items-center justify-center gap-2 
                bg-[#eb660f] hover:bg-[#d55a0d] text-white 
                border border-[#eb660f] rounded-xl py-2.5 px-4 
                text-sm font-medium transition-all duration-200 
                disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                hover:shadow-[0_4px_15px_rgba(235,102,15,0.3)]"
              onClick={() =>
                handleActivateGateway(gateway._id, gateway.gatewayName)
              }
              disabled={activatingGateway}
            >
              {activatingGateway ? (
                <div className="w-4 h-4 border-2 border-white/30 
                  border-t-white rounded-full animate-spin" />
              ) : (
                <Play size={15} />
              )}
              Activate
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="p-2 sm:p-2 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center 
          justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-[#eb660f]/10 rounded-xl flex items-center 
                justify-center">
                <CreditCard size={22} className="text-[#eb660f]" />
              </div>
              Payment Gateway Management
            </h1>
            <p className="text-[#8a8d93] text-sm mt-1 ml-[52px]">
              Manage and monitor your payment gateways
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Gateways"
            value={
              loadingStats ? (
                <div className="w-5 h-5 border-2 border-[#eb660f]/30 
                  border-t-[#eb660f] rounded-full animate-spin" />
              ) : (
                gatewayStats?.data?.totalGateways || 0
              )
            }
            valueClass="text-[#eb660f]"
          />
          <StatCard
            title="Current Active"
            value={
              loadingStats ? (
                <div className="w-5 h-5 border-2 border-[#eb660f]/30 
                  border-t-[#eb660f] rounded-full animate-spin" />
              ) : (
                gatewayStats?.data?.currentActiveGateway || "None"
              )
            }
            valueClass="text-[#eb660f]"
          />
          <StatCard
            title="Active Gateways"
            value={
              loadingStats ? (
                <div className="w-5 h-5 border-2 border-[#0ecb6f]/30 
                  border-t-[#0ecb6f] rounded-full animate-spin" />
              ) : (
                gatewayStats?.data?.activeGateways || 0
              )
            }
            valueClass="text-[#0ecb6f]"
          />
          <StatCard
            title="Inactive Gateways"
            value={
              loadingStats ? (
                <div className="w-5 h-5 border-2 border-red-400/30 
                  border-t-red-400 rounded-full animate-spin" />
              ) : (
                gatewayStats?.data?.inactiveGateways || 0
              )
            }
            valueClass="text-red-400"
          />
        </div>

        {/* Active Gateway Alert */}
        {activeGateway?.data && (
          <div className="bg-[#eb660f]/5 border border-[#eb660f]/20 
            rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-[#eb660f]/10 rounded-lg flex items-center 
              justify-center flex-shrink-0">
              <Zap size={16} className="text-[#eb660f]" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-semibold text-sm">
                Active Gateway:
              </span>
              <span className="text-[#eb660f] font-bold text-sm">
                {activeGateway.data.gatewayName}
              </span>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-[#1b232d] border border-[#2a2c2f] rounded-2xl overflow-hidden">
          {/* Filter Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center 
              justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">
                All Gateways
              </h2>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 mr-2">
                  <Filter size={16} className="text-[#eb660f]" />
                  <span className="text-[#8a8d93] text-sm font-medium">
                    Filter:
                  </span>
                </div>

                {[
                  {
                    key: "all",
                    label: `All (${allGateways?.data?.length || 0})`,
                  },
                  {
                    key: "active",
                    label: `Active (${gatewayStats?.data?.activeGateways || 0})`,
                  },
                  {
                    key: "inactive",
                    label: `Inactive (${gatewayStats?.data?.inactiveGateways || 0})`,
                  },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setFilterActive(filter.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium 
                      transition-all duration-200 cursor-pointer border
                      ${filterActive === filter.key
                        ? "bg-[#eb660f] text-white border-[#eb660f]"
                        : "bg-transparent text-[#8a8d93] border-[#2a2c2f] hover:border-[#eb660f]/50 hover:text-white"
                      }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Gateways Grid */}
          <div className="p-4 sm:p-6">
            {loadingGateways ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-12 h-12 border-3 border-[#eb660f]/20 
                  border-t-[#eb660f] rounded-full animate-spin mb-4" />
                <p className="text-white text-lg font-semibold mb-1">
                  Loading payment gateways...
                </p>
                <p className="text-[#8a8d93] text-sm">
                  Please wait while we fetch your data
                </p>
              </div>
            ) : filteredGateways.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredGateways.map((gateway) => (
                  <GatewayCard key={gateway._id} gateway={gateway} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-[#eb660f]/10 rounded-full 
                  flex items-center justify-center mb-5">
                  <CreditCard size={36} className="text-[#eb660f]" />
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">
                  No payment gateways found
                </h3>
                <p className="text-[#8a8d93] text-sm mb-5 text-center max-w-sm">
                  {filterActive !== "all"
                    ? `No ${filterActive} gateways available. Try changing the filter.`
                    : "Create your first payment gateway to get started"}
                </p>
                {filterActive === "all" && (
                  <button
                    className="flex items-center gap-2 bg-[#eb660f] hover:bg-[#d55a0d] 
                      text-white rounded-xl py-2.5 px-5 text-sm font-medium 
                      transition-all duration-200 cursor-pointer
                      hover:shadow-[0_4px_15px_rgba(235,102,15,0.3)]"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Plus size={18} />
                    Create Gateway
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGatewayManagement;