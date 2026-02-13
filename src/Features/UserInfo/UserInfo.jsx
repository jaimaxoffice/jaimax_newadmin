// src/features/userinfo/Userinfo.jsx
import React, { useState, useEffect, useCallback } from "react";
import _ from "lodash";
import { useGetUserInfoQuery } from "./userInfoApiSlice";
import { toast } from "react-toastify";
import Table from "../../reusableComponents/Tables/Table";
import MobileCard from "../../reusableComponents/MobileCards/MobileCards";
import MobileCardList from "../../reusableComponents/MobileCards/MobileCardList";
import SectionCard from "../../reusableComponents/Cards/SectionCard";
import Modal from "../../reusableComponents/Modals/Modals";
import Badge from "../../reusableComponents/Badges/Badge";
import InputField from "../../reusableComponents/Inputs/InputField";
import SubmitButton from "../../reusableComponents/Buttons/SubmitButton";
import Alert from "../../reusableComponents/Alerts/Alerts";
import Edituser from "./EditableUser";

const Userinfo = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [referrals, setReferrals] = useState([]);
  const [refType, setRefType] = useState("");
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isBlurred, setIsBlurred] = useState(true);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretInput, setSecretInput] = useState("");

  const debouncedSearch = useCallback(
    _.debounce((term) => {
      setDebouncedSearchTerm(term.trim().toUpperCase());
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  const {
    data: userData,
    error,
    isLoading,
    refetch,
  } = useGetUserInfoQuery(debouncedSearchTerm, {
    skip: !debouncedSearchTerm.trim(),
  });

  const clearAll = () => {
    setReferrals([]);
    setUserDetails(null);
    setRefType("");
  };

  const handleDirectSearch = () => {
    if (!searchTerm.trim()) return toast("Please enter a Reference ID");
    setLoading(true);
    clearAll();
    setRefType("direct");
    setDebouncedSearchTerm(searchTerm.trim().toUpperCase());
  };

  const handleChainSearch = () => {
    if (!searchTerm.trim()) return toast("Please enter a Reference ID");
    setLoading(true);
    clearAll();
    setRefType("chain");
    setDebouncedSearchTerm(searchTerm.trim().toUpperCase());
  };

  const handleShowUserDetails = () => {
    if (!searchTerm.trim()) return toast("Please enter a Reference ID");
    setLoading(true);
    clearAll();
    setRefType("");
    setDebouncedSearchTerm(searchTerm.trim().toUpperCase());
  };

  useEffect(() => {
    if (userData) {
      if (userData.status_code === 408) {
        toast("Session expired. Please login again.");
        setLoading(false);
        return;
      }
      if (userData.success === 1 && userData.data) {
        const { totalActiveDirectRefs = [], totalActiveChainRefs = [] } = userData.data;
        if (refType === "direct") setReferrals(totalActiveDirectRefs);
        else if (refType === "chain") setReferrals(totalActiveChainRefs);

        if (!refType) {
          const foundUser = userData.data.user || {};
          setUserDetails({
            ...foundUser,
            directCount: totalActiveDirectRefs.length,
            chainCount: totalActiveChainRefs.length,
          });
        }
      } else {
        toast("Failed to fetch user data");
      }
      setLoading(false);
    }
  }, [userData, refType]);

  useEffect(() => {
    if (error) {
      toast("Error fetching user data");
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    if (isLoading && debouncedSearchTerm) setLoading(true);
  }, [isLoading, debouncedSearchTerm]);

  const isPageLoading = loading || isLoading;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const handleSecretSubmit = () => {
    if (secretInput === "devteam") {
      setIsBlurred(false);
      setShowSecretModal(false);
    } else {
      toast.error("Invalid Secret Code!");
    }
  };

  // Referral Table Columns
  const referralColumns = [
    {
      header: "S.No",
      render: (_, index) => index + 1 + ".",
    },
    { header: "Name", accessor: "name" },
    { header: "Username", accessor: "username" },
    { header: "Phone", accessor: "phone" },
    { header: "Email", accessor: "email" },
    {
      header: "Status",
      render: (row) => (
        <Badge type={row.isActive ? "success" : "danger"}>
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Created At",
      render: (row) => formatDate(row.createdAt),
    },
  ];

  // Mobile Referral Card
  const renderReferralCard = (row, index) => (
    <MobileCard
      key={index}
      header={{
        avatar: row?.name?.charAt(0)?.toUpperCase() || "?",
        title: row?.name,
        subtitle: `#${index + 1} • ${row?.username}`,
        badge: row?.isActive ? "Active" : "Inactive",
        badgeClass: row?.isActive
          ? "bg-[#eb660f]/10 text-[#eb660f]"
          : "bg-red-500/10 text-red-400",
      }}
      rows={[
        { label: "Phone", value: row?.phone },
        { label: "Email", value: row?.email },
        { label: "Created", value: formatDate(row?.createdAt) },
      ]}
    />
  );

  // Detail Row Component
  const DetailRow = ({ label, value, highlight, mono }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-xs text-[#8a8d93]">{label}</span>
      <span
        className={`text-sm text-right max-w-[60%] truncate ${
          highlight ? "text-[#eb660f] font-semibold" : mono ? "font-mono text-[#eb660f] text-xs bg-[#eb660f]/10 px-2 py-0.5 rounded" : "text-white font-medium"
        }`}
      >
        {value || "N/A"}
      </span>
    </div>
  );

  // Stat Box Component
  const StatBox = ({ value, label, accent }) => (
    <div
      className={`text-center p-3 rounded-xl border ${
        accent
          ? "bg-[#eb660f]/5 border-[#eb660f]/20"
          : "bg-[#2a2c2f]/30 border-[#2a2c2f]"
      }`}
    >
      <p
        className={`text-xl font-bold mb-1 ${
          accent ? "text-[#eb660f]" : "text-white"
        }`}
      >
        {value ?? 0}
      </p>
      <p className="text-[10px] text-[#8a8d93]">{label}</p>
    </div>
  );

  return (
    <div className="p-2 sm:p-2 space-y-6">
      {/* Search Section */}
      <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-2xl p-5">
        <div className="max-w-md mx-auto space-y-4">
          <input
            type="text"
            placeholder="Enter Reference ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111214] border border-[#2a2c2f] text-white placeholder-[#555]
              rounded-xl py-3 px-4 text-sm text-center focus:outline-none focus:border-[#eb660f]
              focus:ring-1 focus:ring-[#eb660f]/50 transition-colors uppercase"
          />
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleDirectSearch}
              disabled={isPageLoading}
              className="w-full sm:w-auto flex-1 bg-[#eb660f] hover:bg-[#eb660f]/90
                disabled:bg-[#eb660f]/50 disabled:cursor-not-allowed
                text-[#111214] font-semibold py-2.5 px-4 rounded-xl text-sm
                transition-colors cursor-pointer"
            >
              Direct Referrals
            </button>
            <button
              onClick={handleChainSearch}
              disabled={isPageLoading}
              className="w-full sm:w-auto flex-1 bg-[#eb660f] hover:bg-[#eb660f]/90
                disabled:bg-[#eb660f]/50 disabled:cursor-not-allowed
                text-[#111214] font-semibold py-2.5 px-4 rounded-xl text-sm
                transition-colors cursor-pointer"
            >
              Chain Referrals
            </button>
            <button
              onClick={handleShowUserDetails}
              disabled={isPageLoading}
              className="w-full sm:w-auto flex-1 bg-[#eb660f] hover:bg-[#eb660f]/90
                disabled:bg-[#eb660f]/50 disabled:cursor-not-allowed
                text-[#111214] font-semibold py-2.5 px-4 rounded-xl text-sm
                transition-colors cursor-pointer"
            >
              Show Details
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4">
            <Alert type="error" message="Error loading data. Please try again." />
          </div>
        )}
      </div>

      {/* Loading */}
      {isPageLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-[#eb660f] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* User Details */}
      {!isPageLoading && userDetails && (
        <div className="max-w-9xl mx-auto">
          <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#2a2c2f] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">User Profile</h2>
                <p className="text-xs text-[#555] mt-0.5">
                  Complete user information and statistics
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-[#eb660f] hover:bg-[#eb660f]/90 text-[#111214] font-semibold
                  py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Edit Profile
              </button>
            </div>

            {/* Content */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Personal Info */}
              <SectionCard title="Personal Information">
                <div className="divide-y divide-[#2a2c2f]/50">
                  <DetailRow label="Name" value={userDetails.name} />
                  <DetailRow label="Username" value={userDetails.username} />
                  <DetailRow label="Phone" value={userDetails.phone} />
                  <DetailRow label="Email" value={userDetails.email} />
                </div>
              </SectionCard>

              {/* Account Status */}
              <SectionCard title="Account Status">
                <div className="divide-y divide-[#2a2c2f]/50">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-[#8a8d93]">Status</span>
                    <Badge type={userDetails.isActive ? "success" : "danger"}>
                      {userDetails.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-[#8a8d93]">Verified</span>
                    <Badge type={userDetails.isVerified ? "success" : "danger"}>
                      {userDetails.isVerified ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <DetailRow label="Created" value={formatDate(userDetails.createdAt)} />
                  <DetailRow label="Ref ID" value={userDetails.referenceId} mono />
                </div>
              </SectionCard>

              {/* Financial */}
              <SectionCard title="Financial Overview">
                <div className="divide-y divide-[#2a2c2f]/50">
                  <DetailRow label="Referral Bonus" value={`₹${userDetails.referenceInr}`} highlight />
                  <DetailRow label="Wallet Balance" value={userDetails.walletBalance ?? 0} highlight />
                  <DetailRow
                    label="JAIMAX Tokens"
                    value={userDetails.tokens?.toLocaleString() || "N/A"}
                    highlight
                  />
                  <DetailRow label="Super Bonus" value={userDetails.super_bonus || "N/A"} highlight />
                </div>
              </SectionCard>

              {/* Referral Stats - Blurred */}
              <div className="relative">
                {isBlurred && (
                  <button
                    onClick={() => setShowSecretModal(true)}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20
                      bg-black/60 backdrop-blur-sm border border-[#eb660f]/50 text-[#eb660f]
                      font-semibold text-sm px-5 py-2.5 rounded-full cursor-pointer
                      hover:bg-black/80 transition-all"
                  >
                    Click to Unlock
                  </button>
                )}

                <div
                  className={`transition-all ${
                    isBlurred ? "blur-lg pointer-events-none" : ""
                  }`}
                >
                  <SectionCard title="Referral Statistics">
                    <div className="grid grid-cols-2 gap-3">
                      <StatBox
                        value={userDetails.totalActiveDirectRefsCount}
                        label="Active Direct"
                        accent
                      />
                      <StatBox
                        value={userDetails.totalActiveChainRefsCount}
                        label="Active Chain"
                        accent
                      />
                      <StatBox
                        value={userDetails.totalDirectRefsCount}
                        label="Total Direct"
                      />
                      <StatBox
                        value={userDetails.totalChainRefsCount}
                        label="Total Chain"
                      />
                    </div>
                  </SectionCard>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Referral Tables */}
      {!isPageLoading && referrals.length > 0 && (
        <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-2xl overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
            <h2 className="text-lg font-semibold text-white">
              {refType === "direct" ? "Direct" : "Chain"} Referrals
            </h2>
            <p className="text-xs text-[#555] mt-0.5">
              {referrals.length} referrals found
            </p>
          </div>

          {/* Desktop */}
          <div className="hidden lg:block">
            <Table
              columns={referralColumns}
              data={referrals}
              isLoading={false}
              currentPage={1}
              perPage={referrals.length}
            />
          </div>

          {/* Mobile */}
          <div className="lg:hidden">
            <MobileCardList
              data={referrals}
              isLoading={false}
              renderCard={renderReferralCard}
              emptyMessage="No referrals found"
            />
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
        size="lg"
      >
        {userData && (
          <Edituser
            user={userData?.data?.user}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            refetchUserInfo={refetch}
          />
        )}
      </Modal>

      {/* Secret Code Modal */}
      <Modal
        isOpen={showSecretModal}
        onClose={() => setShowSecretModal(false)}
        title="Enter Secret Code"
        size="sm"
      >
        <div className="space-y-4">
          <input
            type="password"
            value={secretInput}
            onChange={(e) => setSecretInput(e.target.value)}
            placeholder="Enter Secret"
            className="w-full bg-[#111214] border border-[#2a2c2f] text-white placeholder-[#555]
              rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#eb660f]
              focus:ring-1 focus:ring-[#eb660f]/50 transition-colors"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setShowSecretModal(false)}
              className="flex-1 bg-[#2a2c2f] hover:bg-[#333] text-white py-3
                rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSecretSubmit}
              className="flex-1 bg-[#eb660f] hover:bg-[#eb660f]/90 text-[#111214] py-3
                rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              Unlock
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Userinfo;