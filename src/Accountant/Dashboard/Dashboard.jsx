import { Wallet, Users, KeyRound, User, Globe, Calendar } from "lucide-react";
import { useUserDataQuery } from "../../Features/Users/usersApiSlice";
import Loader from "../../reusableComponents/Loader/Loader";
export default function AccountantDashboard() {
  const { data, isLoading, isError } = useUserDataQuery();
  const u = data?.data;

  const fmtINR = (n) =>
    n == null ? "—" : `₹${Number(n).toLocaleString("en-IN")}`;
  const fmtDate = (d) =>
    d ? new Date(d).toLocaleString("en-IN", { hour12: true }) : "—";

  if (isLoading)
    return <Loader/>
  if (isError || !u)
    return <div className="text-red-500 p-4">Unable to load user.</div>;

  return (
      <section className="p-3 sm:p-4 lg:p-5 bg-[#0b1218] text-white min-h-screen">
        {/* ── Profile Header ── */}
        <div className="rounded-xl p-4 sm:p-5 mb-4 shadow-lg flex items-center justify-between flex-wrap gap-3 bg-[#132029] border border-[#1d2a34]">
          <div className="flex flex-col min-w-0">
            <h3 className="mb-1 capitalize font-bold text-[clamp(0.9rem,2.5vw,1.55rem)] leading-tight wrap-break-words">
              {u.name || "—"}
            </h3>
            <div className="text-[#aaa] text-[clamp(0.8rem,1.2vw,0.95rem)] wrap-break-words leading-relaxed max-w-full md:whitespace-nowrap">
              Role&nbsp;ID:&nbsp;{u.role ?? "—"} &nbsp;|&nbsp;{u.email || "—"}
            </div>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${
              u.isActive
                ? "bg-[#162c1d] text-[#18a04a]"
                : "bg-[#2b1d1d] text-[#ec660f]"
            }`}
          >
            {u.isActive ? "Active" : "Inactive"}
          </div>
        </div>

        {/* ── User Info Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Username */}
          <div className="p-4 sm:p-5 rounded-xl shadow-lg bg-[#131c23] border border-[#1e2a32] hover:scale-[1.02] transition-transform duration-200">
            <div className="flex items-center gap-2 mb-3">
              <User className="text-[#18a04a] shrink-0" size={18} />
              <span className="text-[#9ba5b4] text-[13px]">Username</span>
            </div>
            <div className="font-bold text-base">{u.username ?? "—"}</div>
          </div>

          {/* Country */}
          <div className="p-4 sm:p-5 rounded-xl shadow-lg bg-[#131c23] border border-[#1e2a32] hover:scale-[1.02] transition-transform duration-200">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="text-[#c1d42c] shrink-0" size={18} />
              <span className="text-[#9ba5b4] text-[13px]">Country</span>
            </div>
            <div className="font-bold text-base">
              {u.countryCode == 91 ? "India" : "N/A"}
            </div>
          </div>

          {/* Created At */}
          <div className="p-4 sm:p-5 rounded-xl shadow-lg bg-[#131c23] border border-[#1e2a32] hover:scale-[1.02] transition-transform duration-200">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="text-[#18a04a] shrink-0" size={18} />
              <span className="text-[#9ba5b4] text-[13px]">Created At</span>
            </div>
            <div className="font-bold text-base">
              {fmtDate(u.createdAt).slice(0, -12)}
            </div>
          </div>
        </div>

        {/* ── Wallet & Referral ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Wallet */}
          <div className="p-4 sm:p-5 rounded-xl shadow-lg bg-[#131c23] border border-[#1e2a32]">
            <h6 className="mb-3 text-[#9ba5b4] text-sm font-semibold">
              Wallet Summary
            </h6>
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="text-[#18a04a] shrink-0" size={18} />
              <span>
                <strong>Balance:</strong>&nbsp;{fmtINR(u.inr)}
              </span>
            </div>
            <p className="mb-0 break-all text-sm">
              <strong>Wallet Address:</strong>{" "}
              {u.wallet_address
                ? `${u.wallet_address.slice(0, 8)}...${u.wallet_address.slice(-6)}`
                : "—"}
            </p>
          </div>

          {/* Referral */}
          <div className="p-4 sm:p-5 rounded-xl shadow-lg bg-[#131c23] border border-[#1e2a32]">
            <h6 className="mb-3 text-[#9ba5b4] text-sm font-semibold">
              Referral Summary
            </h6>
            <div className="flex items-center gap-2 mb-2">
              <Users className="text-[#18a04a] shrink-0" size={18} />
              <span>
                <strong>Referral Count:</strong>&nbsp;{u.referenceCount ?? "—"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <KeyRound className="text-[#c1d42c] shrink-0" size={18} />
              <span>
                <strong>Earnings:</strong>&nbsp;{fmtINR(u.referenceInr)}
              </span>
            </div>
          </div>
        </div>
      </section>
  );
}