import React, { useState } from "react";
import { useLazyGetTxInfoQuery } from "../../Features/Wallet/walletApiSlice";
import { toast, ToastContainer } from "react-toastify";
import Loader from "../../reusableComponents/Loader/Loader";
import InputField from "../../reusableComponents/Inputs/InputField";
import Button from "../../reusableComponents/Buttons/Button";
import { formatDateWithAmPm } from "../../utils/dateUtils";
import {
  ClipboardList,
  UserCircle,
  ImageIcon,
  AlertTriangle,
  Camera,
  ExternalLink,
} from "lucide-react";

/* ── Helpers ── */
const pillColor = (status = "") => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "pending":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "hold":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "failed":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-white/10 text-gray-300 border-white/10";
  }
};

const typeBadge = (type = "") => {
  switch (type.toLowerCase()) {
    case "credit":
      return "bg-green-500/15 text-green-400 border-green-500/25";
    case "debit":
      return "bg-red-500/15 text-red-400 border-red-500/25";
    default:
      return "bg-white/10 text-gray-300 border-white/10";
  }
};

const fmtAmount = (amt, cc) =>
  amt == null ? "N/A" : (cc === 91 ? "₹" : "$") + Number(amt).toFixed(2);

/* ── Detail Row ── */
const Row = ({ label, children }) => (
  <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-1 xs:gap-2 p-3 sm:p-3.5 rounded-lg bg-[#282f35]/80 border border-[#2b3440] backdrop-blur-sm">
    <div className="text-[#8b949e] text-xs sm:text-[13px] font-medium shrink-0">
      {label}
    </div>
    <div className="text-white font-semibold text-sm text-left xs:text-right break-all xs:max-w-[65%]">
      {children}
    </div>
  </div>
);

/* ── Section Title ── */
const SectionTitle = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 mb-3">
    <Icon size={16} className="text-[#a8ec4b]" />
    <h4 className="text-white/90 font-semibold text-sm sm:text-[15px] uppercase tracking-wide">
      {children}
    </h4>
    <div className="flex-1 h-px bg-gradient-to-r from-[#a8ec4b]/30 to-transparent ml-2" />
  </div>
);

/* ══════════════════════════════════════
   TX INFO COMPONENT
   ══════════════════════════════════════ */
const TxInfo = () => {
  const [txId, setTxId] = useState("");
  const [imgError, setImgError] = useState(false);
  const [triggerTxInfo, { data, isFetching, isError, error }] =
    useLazyGetTxInfoQuery();

  const tx = data?.data?.transaction;

  const handleSearch = async () => {
    if (!txId.trim()) {
      toast.error("Please enter a Transaction ID");
      return;
    }
    setImgError(false);
    try {
      await triggerTxInfo(txId.trim());
    } catch (err) {
      console.error("Error fetching tx info:", err);
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Transaction not found or failed to fetch.",
        { position: "top-center" }
      );
    }
  };

  return (
    <div>
      <ToastContainer />

      <section className="py-4 sm:py-6 px-2 sm:px-4 md:px-6 min-h-screen bg-[#282f35] rounded-xl mx-1 sm:mx-2.5">
        {/* ── Search Bar ── */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <form
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full max-w-xl"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <div className="flex-1">
              <InputField
                type="text"
                placeholder="Enter Transaction ID"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isFetching}>
              {isFetching ? "Loading..." : "Get Transaction Info"}
            </Button>
          </form>
        </div>

        {/* ── Loading ── */}
        {isFetching && <Loader />}

        {/* ── Error ── */}
        {isError && (
          <div className="max-w-xl mx-auto bg-red-500/15 text-red-400 border border-red-500/25 rounded-lg text-center py-3 px-4 mt-3 text-sm font-medium">
            {error?.data?.message || "Transaction not found or invalid ID"}
          </div>
        )}

        {/* ── Transaction Card ── */}
        {tx && (
          <div
            className="max-w-8xl mx-auto p-4 sm:p-5 md:p-6 rounded-2xl border border-[#a8ec4b]/30"
            style={{
              background:
                "linear-gradient(145deg, #1e262d 0%, #282f35 50%, #1e262d 100%)",
              boxShadow:
                "0 20px 40px rgba(0,0,0,.35), 0 8px 24px rgba(168,236,75,.08), inset 0 1px 0 rgba(255,255,255,.03)",
            }}
          >
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 pb-4 border-b border-white/5">
              <h3 className="text-[#a8ec4b] font-bold text-lg sm:text-xl md:text-2xl">
                Transaction Details
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold border ${typeBadge(
                    tx.transactionType
                  )}`}
                >
                  {tx.transactionType || "N/A"}
                </span>
                <span
                  className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold border ${pillColor(
                    tx.transactionStatus
                  )}`}
                >
                  {tx.transactionStatus || "N/A"}
                </span>
              </div>
            </div>

            {/* ── Summary Strip ── */}
            <div className="bg-[#282f35]/80 backdrop-blur-sm border border-[#2b3440] rounded-xl p-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center sm:text-left">
                  <div className="text-[#8b949e] text-xs font-medium mb-1">
                    Name
                  </div>
                  <div className="text-white font-bold text-base sm:text-lg break-words">
                    {tx.name || "N/A"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[#8b949e] text-xs font-medium mb-1">
                    Amount
                  </div>
                  <div
                    className={`font-bold text-xl sm:text-2xl ${
                      tx.transactionType?.toLowerCase() === "credit"
                        ? "text-green-400"
                        : tx.transactionType?.toLowerCase() === "debit"
                        ? "text-red-400"
                        : "text-white"
                    }`}
                  >
                    {tx.transactionType?.toLowerCase() === "debit" && "- "}
                    {fmtAmount(tx.transactionAmount, tx.userId?.countryCode)}
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-[#8b949e] text-xs font-medium mb-1">
                    Date
                  </div>
                  <div className="text-white font-bold text-base sm:text-lg">
                    {formatDateWithAmPm(tx.transactionDate)}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Detail Sections ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              {/* Left — Transaction Info */}
              <div>
                <SectionTitle icon={ClipboardList}>
                  Transaction Info
                </SectionTitle>
                <div className="space-y-2.5">
                  <Row label="Transaction ID">{tx.transactionId}</Row>
                  <Row label="Payment Mode">{tx.paymentMode || "N/A"}</Row>
                  <Row label="Currency">{tx.currency || "N/A"}</Row>
                  <Row label="UTR / Ref">{tx.utrRef || "N/A"}</Row>
                  <Row label="Transaction Fee">
                    {tx.transactionFee != null
                      ? fmtAmount(tx.transactionFee, tx.userId?.countryCode)
                      : "N/A"}
                  </Row>
                  <Row label="Reason">{tx.reason || "N/A"}</Row>
                </div>
              </div>

              {/* Right — User & Audit */}
              <div>
                <SectionTitle icon={UserCircle}>User & Audit Info</SectionTitle>
                <div className="space-y-2.5">
                  <Row label="User ID">
                    {tx.userId?._id || tx.userId || "N/A"}
                  </Row>
                  <Row label="Country Code">
                    {tx.userId?.countryCode ?? "N/A"}
                  </Row>
                  <Row label="Created By">
                    {tx.createdBy?.name || tx.createdBy || "N/A"}
                  </Row>
                  <Row label="Created On">
                    {formatDateWithAmPm(tx.createdOn)}
                  </Row>
                  <Row label="Updated By">
                    {tx.updatedBy?.name || tx.updatedBy || "N/A"}
                  </Row>
                  <Row label="Updated On">
                    {formatDateWithAmPm(tx.updatedOn)}
                  </Row>
                </div>
              </div>
            </div>

            {/* ── Screenshot ── */}
            <div className="mt-6">
              <SectionTitle icon={ImageIcon}>Screenshot</SectionTitle>
              <div className="p-4 rounded-xl bg-[#282f35]/80 backdrop-blur-sm border border-[#2b3440]">
                {tx.screenshotUrl && !imgError ? (
                  <div className="flex justify-center">
                    <a
                      href={tx.screenshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block group"
                    >
                      <img
                        src={tx.screenshotUrl}
                        alt="Transaction Screenshot"
                        className="max-w-full sm:max-w-md md:max-w-lg max-h-80 sm:max-h-96 object-contain rounded-lg border-2 border-[#a8ec4b]/30 cursor-pointer group-hover:border-[#a8ec4b] group-hover:shadow-lg group-hover:shadow-[#a8ec4b]/10 transition-all duration-300"
                        onError={() => setImgError(true)}
                      />
                      <p className="flex items-center justify-center gap-1.5 text-[#8b949e] text-xs mt-2.5 group-hover:text-[#a8ec4b] transition-colors">
                        <ExternalLink size={12} />
                        Click image to open in new tab
                      </p>
                    </a>
                  </div>
                ) : tx.screenshotUrl && imgError ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <AlertTriangle size={36} className="text-[#8b949e]/60" />
                    <p className="text-[#8b949e] text-sm text-center">
                      Image failed to load
                    </p>
                    <a
                      href={tx.screenshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[#a8ec4b] hover:text-[#c4f97a] text-sm font-medium underline underline-offset-2 transition-colors"
                    >
                      <ExternalLink size={14} />
                      Open link instead
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <Camera size={36} className="text-[#8b949e]/40" />
                    <p className="text-[#8b949e] text-sm">
                      No screenshot available
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default TxInfo;