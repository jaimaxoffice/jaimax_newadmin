import React, { useState, useEffect, useCallback } from "react";
import _ from "lodash";
import { useGetUserInfoQuery } from "./userinfoApiSlice";
import { toast } from "react-toastify";
import {
  Search,
  Users,
  Link2,
  User,
  Loader2,
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
  XCircle,
  Coins,
  Gift,
  Star,
} from "lucide-react";
import Edituser from "./EditableUser";
import Loader from "../../reusableComponents/Loader/Loader";

const Userinfo = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [referrals, setReferrals] = useState([]);
  const [refType, setRefType] = useState("");
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isBlurred, setIsBlurred] = useState(true);
  const [showModal, setShowModal] = useState(false);
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

  const handleSearchInputChange = (e) => setSearchTerm(e.target.value);

  const handleDirectSearch = () => {
    const term = searchTerm.trim().toUpperCase();
    if (!term) return toast("Please enter a Reference ID");
    setLoading(true);
    clearAll();
    setRefType("direct");
    setDebouncedSearchTerm(term);
  };

  const handleChainSearch = () => {
    const term = searchTerm.trim().toUpperCase();
    if (!term) return toast("Please enter a Reference ID");
    setLoading(true);
    clearAll();
    setRefType("chain");
    setDebouncedSearchTerm(term);
  };

  const handleShowUserDetails = () => {
    const term = searchTerm.trim().toUpperCase();
    if (!term) return toast("Please enter a Reference ID");
    setLoading(true);
    clearAll();
    setRefType("");
    setDebouncedSearchTerm(term);
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
          if (foundUser) {
            setUserDetails({
              ...foundUser,
              directCount: totalActiveDirectRefs.length,
              chainCount: totalActiveChainRefs.length,
            });
          } else toast("User not found!");
        }
      } else toast("Failed to fetch user data");
      setLoading(false);
    }
  }, [userData, refType]);

  useEffect(() => {
    if (error) { toast("Error fetching user data"); setLoading(false); }
  }, [error]);

  useEffect(() => {
    if (isLoading && debouncedSearchTerm) setLoading(true);
  }, [isLoading, debouncedSearchTerm]);

  const isPageLoading = loading || isLoading;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  const handleUnlockClick = () => setShowModal(true);

  const handleSecretSubmit = () => {
    if (secretInput === "devteam") {
      setIsBlurred(false);
      setShowModal(false);
    } else toast.error("Invalid Secret Code!");
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[#eb660f]/10 flex items-center justify-center shrink-0">
          <User size={24} className="text-[#eb660f]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">User Information</h1>
          <p className="text-sm text-gray-400">Search and view user details</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-[#1b232d] border border-[#303f50] rounded-xl p-5 mb-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-full max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Enter JAIMAX ID"
              value={searchTerm}
              onChange={handleSearchInputChange}
              className="w-full bg-[#111827] border border-[#303f50] text-white rounded-lg 
                pl-10 pr-4 py-2.5 text-sm text-center focus:outline-none focus:border-[#eb660f] 
                focus:ring-1 focus:ring-[#eb660f]/50 transition-colors placeholder-gray-500"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={handleDirectSearch}
              disabled={isPageLoading}
              className="flex items-center gap-2 bg-[#eb660f] hover:bg-[#d55a0e] text-white 
                font-medium px-4 py-2.5 rounded-lg transition-all disabled:opacity-50 cursor-pointer text-sm"
            >
              <Users size={16} />
              Show Direct Referrals
            </button>
            <button
              onClick={handleChainSearch}
              disabled={isPageLoading}
              className="flex items-center gap-2 bg-[#eb660f] hover:bg-[#d55a0e] text-white 
                font-medium px-4 py-2.5 rounded-lg transition-all disabled:opacity-50 cursor-pointer text-sm"
            >
              <Link2 size={16} />
              Show Chain Referrals
            </button>
            <button
              onClick={handleShowUserDetails}
              disabled={isPageLoading}
              className="flex items-center gap-2 bg-[#eb660f] hover:bg-[#d55a0e] text-white 
                font-medium px-4 py-2.5 rounded-lg transition-all disabled:opacity-50 cursor-pointer text-sm"
            >
              <User size={16} />
              Show Details
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-center">
            <p className="text-red-400 text-sm">Error loading data. Please try again.</p>
          </div>
        )}
      </div>

      {isPageLoading ? (
        <Loader />
      ) : (
        <>
          {/* User Details */}
          {userDetails && (
            <div className="max-w-6xl mx-auto mb-6">
              <div className="bg-gradient-to-br from-[#1b232d] to-[#1a2128] rounded-2xl border-2 border-[#eb660f] 
                shadow-[0_20px_40px_rgba(0,0,0,0.3),0_8px_24px_rgba(236,102,15,0.2)] overflow-hidden relative">
                
                {/* Decorative */}
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#eb660f]/10 rounded-full" />
                <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-[#eb660f]/5 rounded-full" />

                <div className="relative p-5 sm:p-6 z-10">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                    <div>
                      <h2 className="text-[#eb660f] text-2xl font-bold">User Profile</h2>
                      <p className="text-white/70 text-sm mt-0.5">Complete user information and statistics</p>
                    </div>
                    <button
                      onClick={() => setShowEditModal(true)}
                      disabled={isPageLoading}
                      className="flex items-center gap-2 bg-[#eb660f] hover:bg-[#eb660f]/80 text-white 
                        px-5 py-2 rounded-full text-sm font-medium transition-all hover:-translate-y-0.5 
                        hover:shadow-[0_4px_12px_rgba(236,102,15,0.3)] cursor-pointer"
                    >
                      <Pencil size={14} />
                      Edit Profile
                    </button>
                  </div>

                  {/* Two Column Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {/* Personal Info */}
                      <InfoSection title="Personal Information">
                        <InfoRow icon={User} label="Name" value={userDetails.name} />
                        <InfoRow icon={Hash} label="Username" value={userDetails.username} />
                        <InfoRow icon={Phone} label="Phone" value={userDetails.phone} />
                        <InfoRow icon={Mail} label="Email" value={userDetails.email} truncate />
                      </InfoSection>

                      {/* Account Status */}
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
                            <span className="text-[#eb660f] font-mono bg-[#eb660f]/10 px-2 py-0.5 rounded border border-[#eb660f]/30 text-xs">
                              {userDetails.referenceId}
                            </span>
                          }
                        />
                      </InfoSection>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      {/* Financial */}
                      <InfoSection title="Financial Overview">
                        <InfoRow icon={Gift} label="Referral Bonus" value={<span className="text-[#eb660f] font-bold">₹{userDetails.referenceInr}</span>} />
                        <InfoRow icon={Wallet} label="Wallet Balance" value={<span className="text-[#eb660f] font-bold">{userDetails.walletBalance ?? 0}</span>} />
                        <InfoRow icon={Coins} label="JAIMAX Tokens" value={<span className="text-[#eb660f] font-bold">{userDetails.tokens?.toLocaleString() || "N/A"}</span>} />
                        <InfoRow icon={Star} label="Super Bonus" value={<span className="text-[#eb660f] font-bold">{userDetails.super_bonus || "N/A"}</span>} />
                      </InfoSection>

                      {/* Referral Stats - Blurred */}
                      <div className="relative">
                        {isBlurred && (
                          <button
                            onClick={handleUnlockClick}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 
                              bg-black/65 backdrop-blur-sm px-5 py-2.5 rounded-full border border-[#eb660f] 
                              text-[#eb660f] font-bold text-sm cursor-pointer hover:bg-black/80 transition-all
                              flex items-center gap-2"
                          >
                            <Lock size={14} />
                            Click to Unlock
                          </button>
                        )}

                        <div
                          className={`bg-gradient-to-br from-[#1b232d] to-[#1a2128] rounded-2xl border border-[#eb660f] 
                            p-4 shadow-[0_4px_12px_rgba(0,0,0,0.3)] min-h-[260px] transition-all duration-300
                            ${isBlurred ? "blur-lg pointer-events-none" : ""}`}
                        >
                          <h3 className="text-[#eb660f] text-lg font-semibold mb-3 pb-2 border-b-2 border-[#eb660f]">
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
            <div className="bg-[#1b232d] border border-[#303f50] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#303f50]">
                <h3 className="text-[#eb660f] font-semibold text-center">
                  {refType === "direct" ? "Direct" : "Chain"} Referrals
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#eb660f]">
                      {["S.No", "Name", "Username", "Phone", "Email", "Status", "Created"].map((h) => (
                        <th key={h} className="text-white text-xs font-semibold uppercase tracking-wider px-4 py-3 text-center">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#303f50]/50">
                    {referrals.map((user, index) => (
                      <tr key={index} className="hover:bg-[#252d38] transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-400 text-center">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-white">{user.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{user.username}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{user.phone}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{user.email}</td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                          }`}>
                            {user.isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400 text-center">{user.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#1b232d] border border-[#303f50] rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#eb660f]">
              <h3 className="text-white font-semibold">Edit User</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-9 h-9 rounded-lg bg-[#111827] text-gray-400 hover:text-white 
                  flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[75vh] p-6">
              {userData && (
                <Edituser
                  user={userData?.data?.user}
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
          <div className="relative bg-[#1b232d] border border-[#eb660f] rounded-xl p-6 w-full max-w-xs">
            <h3 className="text-[#eb660f] font-semibold mb-4">Enter Secret Code</h3>
            <input
              type="password"
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value)}
              placeholder="Enter Secret"
              className="w-full bg-[#111827] border border-[#303f50] text-white rounded-lg px-4 py-2.5 text-sm 
                focus:outline-none focus:border-[#eb660f] mb-3 placeholder-gray-500"
            />
            <button
              onClick={handleSecretSubmit}
              className="w-full bg-[#eb660f] hover:bg-[#d55a0e] text-white font-semibold py-2.5 rounded-lg 
                transition-colors mb-2 cursor-pointer"
            >
              Unlock
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-transparent border border-[#eb660f] text-[#eb660f] font-semibold py-2.5 
                rounded-lg hover:bg-[#eb660f]/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Helper Components ──────────────────────────────────────

function InfoSection({ title, children }) {
  return (
    <div className="bg-gradient-to-br from-[#1b232d] to-[#1a2128] rounded-2xl border border-[#eb660f] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
      <h3 className="text-[#eb660f] text-lg font-semibold mb-3 pb-2 border-b-2 border-[#eb660f]">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, truncate = false }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        {/* {Icon && <Icon size={14} className="text-[#eb660f]/60 shrink-0" />} */}
        <span className="text-white/70 text-sm font-medium">{label}:</span>
      </div>
      <span className={`text-white text-sm font-semibold text-right `}>
        {value}
      </span>
    </div>
  );
}

function StatBox({ label, value, accent = false }) {
  return (
    <div className={`text-center p-3 rounded-xl border ${
      accent
        ? "bg-[#eb660f]/10 border-[#eb660f]/30"
        : "bg-gray-500/10 border-gray-500/30"
    }`}>
      <div className={`text-xl font-bold mb-1 ${accent ? "text-[#eb660f]" : "text-white/80"}`}>
        {value}
      </div>
      <div className={`text-xs font-medium ${accent ? "text-white/80" : "text-white/60"}`}>
        {label}
      </div>
    </div>
  );
}

export default Userinfo;