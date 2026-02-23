import React, { useState } from "react";
import { useToast } from "../../reusableComponents/Toasts/ToastContext";
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
import StatCard from "../../reusableComponents/StatCards/StatsCard";
const PaymentGatewayManagement = () => {
  const toast = useToast();
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
        toastConfig,
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
        toastConfig,
      );
    }
  };

  const handleActivateGateway = async (gatewayId, gatewayName) => {
    try {
      const result = await activateGateway(gatewayId).unwrap();

      if (result.success) {
        toast.success(
          `${gatewayName} activated successfully! Other gateways deactivated.`,
          toastConfig,
        );
        refetchGateways();
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      }
    } catch (error) {
      toast.error(
        error?.data?.message || "Failed to activate payment gateway",
        toastConfig,
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
        toastConfig,
      );
    }
  };

  const handleDeactivateAll = async () => {
    if (
      window.confirm(
        "Are you sure you want to deactivate all payment gateways?",
      )
    ) {
      try {
        const result = await deactivateAllGateways().unwrap();

        if (result.success) {
          toast.success(
            "All payment gateways deactivated successfully!",
            toastConfig,
          );
          refetchGateways();
        }
      } catch (error) {
        toast.error(
          error?.data?.message || "Failed to deactivate payment gateways",
          toastConfig,
        );
      }
    }
  };

  const handleDeleteGateway = async (gatewayId, gatewayName) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${gatewayName}"? This action cannot be undone.`,
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
          toastConfig,
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
    <div className=" sm:p-3 space-y-6 min-h-screen bg-[#0f172a] p-10 rounded-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          {/* <CreditCard size={32} className="text-[#b9fd5c]" /> */}
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
        <div></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Gateways"
            value={gatewayStats?.data?.totalGateways}
            icon={CreditCard}
            isLoading={loadingStats}
            gradient={{ from: "#f59e0b", to: "#d97706" }}
          />
          <StatCard
            title="Current Active"
            value={gatewayStats?.data?.currentActiveGateway || "None"}
            icon={Zap}
            isLoading={loadingStats}
            gradient={{ from: "#f59e0b", to: "#d97706" }}
          />
          <StatCard
            title="Active Gateways"
            value={gatewayStats?.data?.activeGateways}
            icon={CheckCircle}
            isLoading={loadingStats}
            gradient={{ from: "#f59e0b", to: "#d97706" }}
          />
          <StatCard
            title="Inactive Gateways"
            value={gatewayStats?.data?.inactiveGateways}
            icon={XCircle}
            isLoading={loadingStats}
            gradient={{ from: "#b74f0b", to: "#b74f0b" }}
          />
        </div>
      )}

      {/* Active Gateway Alert */}
      {activeGateway?.data && (
        <div
          className="flex items-center gap-3 rounded-xl px-5 py-4 shadow-sm
            bg-[#b9fd5c]/10 border-l-4 border-[#b9fd5c]"
        >
          <Zap size={20} className="text-[#b9fd5c] shrink-0" />
          <span className="text-white font-bold">Active Gateway:</span>
          <span className="text-white">{activeGateway.data.gatewayName}</span>
        </div>
      )}

      {/* Filter Section */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 mr-2">
          <Filter size={18} className="text-[#b9fd5c]" />
          <span className="text-white font-medium text-sm">Filter:</span>
        </div>

        <button
          onClick={() => setFilterActive("all")}
          className={`px-4 py-2 rounded-xs text-xs font-medium transition-all duration-200 cursor-pointer ${
            filterActive === "all"
              ? "bg-[#b9fd5c] text-black shadow-md shadow-[#b9fd5c]/20"
              : "bg-transparent border border-[#64748b] text-white hover:border-[#b9fd5c]/50"
          }`}
        >
          All ({allGateways?.data?.length || 0})
        </button>

        <button
          onClick={() => setFilterActive("active")}
          className={`px-4 py-2 rounded-xs text-xs font-medium transition-all duration-200 cursor-pointer ${
            filterActive === "active"
              ? "bg-[#b9fd5c] text-black shadow-md shadow-[#b9fd5c]/20"
              : "bg-transparent border border-[#64748b] text-white hover:border-[#b9fd5c]/50"
          }`}
        >
          Active ({gatewayStats?.data?.activeGateways || 0})
        </button>

        <button
          onClick={() => setFilterActive("inactive")}
          className={`px-4 py-2 rounded-xs text-xs font-medium transition-all duration-200 cursor-pointer ${
            filterActive === "inactive"
              ? "bg-[#b9fd5c] text-black shadow-md shadow-[#b9fd5c]/20"
              : "bg-transparent border border-[#64748b] text-white hover:border-[#b9fd5c]/50"
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
              className={`relative overflow-hidden rounded-lg shadow-lg
                transition-all duration-300 hover:-translate-y-2 group
                bg-[#282f35] border
                ${
                  gateway.isActive
                    ? "border-[#b9fd5c]/30 hover:shadow-[0_15px_35px_rgba(235,102,15,0.2)] hover:border-[#b9fd5c]"
                    : "border-[#2a2c2f] hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)] hover:border-[#b9fd5c]"
                }`}
            >
              {/* Active Corner Badge */}
              {gateway.isActive && (
                <div className="absolute top-0 right-0">
                  <div
                    className="w-0 h-0"
                    style={{
                      borderLeft: "50px solid transparent",
                      borderTop: "50px solid #b9fd5c",
                    }}
                  />
                  <CheckCircle
                    size={16}
                    className="absolute text-black"
                    style={{ top: "5px", right: "5px" }}
                  />
                </div>
              )}

              <div className="p-5">
                {/* Card Header */}
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className={`p-3 rounded-full shrink-0 ${
                      gateway.isActive ? "bg-[#b9fd5c]" : "bg-[#64748b]"
                    }`}
                  >
                    <CreditCard size={24} className="text-black" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">
                      {gateway.gatewayName}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${
                        gateway.isActive
                          ? "bg-[#b9fd5c] text-black"
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
                  <div className="bg-[#b9fd5c]/10 border border-[#b9fd5c]/20 rounded-xs p-3">
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

                  <div className="bg-[#64748b]/10 border border-[#64748b]/20 rounded-xs p-3">
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
                          gateway.gatewayName,
                        )
                      }
                      disabled={activatingGateway || updatingGateway}
                      className="flex-1 flex items-center justify-center gap-2 
                        bg-[#f59e0b] hover:bg-[#f59e0b]/90 text-black
                        font-semibold py-2.5 px-4 rounded-xs text-sm
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200 cursor-pointer min-h-10 "
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
                        handleActivateGateway(gateway._id, gateway.gatewayName)
                      }
                      disabled={activatingGateway}
                      className="flex-1 flex items-center justify-center gap-2 
                        bg-[#b9fd5c] hover:bg-[#b9fd5c]/90 text-black
                        font-semibold py-2.5 px-4 rounded-xs text-sm
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200 cursor-pointer min-h-10"
                    >
                      {activatingGateway ? (
                        <div className="w-4 h-4 border-2 border-white/30  rounded-full animate-spin text-black" />
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
            className="w-24 h-24 rounded-full bg-[#b9fd5c]/10 
              flex items-center justify-center mb-4"
          >
            <CreditCard size={48} className="text-[#b9fd5c]" />
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
              className="flex items-center gap-2 bg-[#b9fd5c] hover:bg-[#b9fd5c]/90 
                text-black font-semibold py-3 px-6 rounded-lg text-sm
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
          <div className="relative bg-[#282f35] border border-[#2a2c2f] rounded-2xl w-full max-w-md shadow-2xl">
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
                className="w-full bg-[#111214] border border-[#2a2c2f] text-white rounded-lg
                  py-3 px-4 text-sm focus:outline-none focus:border-[#b9fd5c] 
                  focus:ring-1 focus:ring-[#b9fd5c]/50 transition-colors"
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
                className="px-5 py-2.5 rounded-lg text-sm font-medium 
                  bg-[#b9fd5c] text-white hover:bg-[#b9fd5c]/90 
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
          <div className="relative bg-[#282f35] border border-[#2a2c2f] rounded-lg w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2c2f]">
              <div className="flex items-center gap-2">
                <Plus size={24} className="text-[#b9fd5c]" />
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
                            ? "bg-[#b9fd5c] text-white shadow-md"
                            : "bg-transparent border border-blue-500/50 text-white hover:border-[#b9fd5c]/50"
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
                      py-3 px-4 text-sm focus:outline-none focus:border-[#b9fd5c] 
                      focus:ring-1 focus:ring-[#b9fd5c]/50 transition-colors"
                    placeholder="Enter custom gateway name"
                  />
                </div>
              )}

              {!isCustomGateway && newGatewayName && (
                <div className="flex items-center gap-2 bg-[#b9fd5c]/10 border-l-[3px] border-[#b9fd5c] rounded-lg px-4 py-3">
                  <CheckCircle size={18} className="text-[#b9fd5c] shrink-0" />
                  <span className="text-white text-sm">
                    Selected:{" "}
                    <strong className="text-[#b9fd5c]">{newGatewayName}</strong>
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
                  bg-[#b9fd5c] text-white hover:bg-[#b9fd5c]/90 
                  disabled:opacity-50 disabled:cursor-not-allowed 
                  transition-colors cursor-pointer flex items-center gap-2"
              >
                {creatingGateway ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin text-black" />
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
