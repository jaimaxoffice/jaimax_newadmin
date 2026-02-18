import React, { useEffect, useMemo, useState } from "react";
import { useLazyGetTxInfoQuery } from "../../Features/Wallet/walletApiSlice";
import { toast, ToastContainer } from "react-toastify";

/* ── Tailwind Modal ── */
const TwModal = ({ show, onClose, size = "max-w-lg", children }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className={`relative w-full ${size} bg-[#282f35] border border-[#2b3440] rounded-xl shadow-2xl text-white z-10 max-h-[90vh] overflow-y-auto`}
      >
        {children}
      </div>
    </div>
  );
};

const TwModalHeader = ({ onClose, children }) => (
  <div className="flex items-start justify-between p-4 border-b border-[#2b3440]">
    <h5 className="text-lg font-semibold">{children}</h5>
    <button
      onClick={onClose}
      className="ml-4 text-gray-400 hover:text-white transition text-2xl leading-none"
    >
      ×
    </button>
  </div>
);

const TwModalBody = ({ children, className = "" }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

/* ── Helpers ── */
const pillColor = (status = "") => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-500/20 text-green-400";
    case "pending":
      return "bg-yellow-500/20 text-yellow-400";
    case "hold":
      return "bg-orange-500/20 text-orange-400";
    case "failed":
      return "bg-red-500/20 text-red-400";
    default:
      return "bg-white/10 text-gray-300";
  }
};

const fmtAmount = (amt, cc) =>
  amt == null ? "N/A" : (cc === 91 ? "₹" : "$") + Number(amt).toFixed(2);

const formatDateWithAmPm = (isoString) => {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = date.getUTCFullYear();
  let hh = date.getUTCHours();
  const min = String(date.getUTCMinutes()).padStart(2, "0");
  const ampm = hh >= 12 ? "PM" : "AM";
  hh = hh % 12 || 12;
  return `${dd}-${mm}-${yyyy} ${hh}:${min} ${ampm}`;
};

/* ── Detail Row ── */
const Row = ({ label, children }) => (
  <div className="flex justify-between items-center p-3 rounded-lg bg-[#2a313b] border border-[#2b3440] mb-2.5">
    <div className="text-[#b9c0c7] text-[13px]">{label}</div>
    <div className="text-white font-semibold text-right break-all max-w-[60%]">
      {children}
    </div>
  </div>
);

/* ══════════════════════════════════════
   TX INFO COMPONENT
   ══════════════════════════════════════ */
const TxInfo = () => {
  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://192.168.128.1:3002/api";

  const [txId, setTxId] = useState("");
  const [triggerTxInfo, { data, isFetching, isError, error }] =
    useLazyGetTxInfoQuery();

  const [showImg, setShowImg] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [imgTried, setImgTried] = useState([]);
  const [isImgLoading, setIsImgLoading] = useState(false);

  const tx = data?.data?.transaction;

  const extractS3KeyFromUrl = (u) => {
    try {
      const url = new URL(u);
      const key = url.pathname.replace(/^\/+/, "");
      return decodeURIComponent(key);
    } catch {
      return null;
    }
  };

  const imageCandidates = useMemo(() => {
    if (!tx) return [];
    const list = [];
    if (tx.screenshotKey) {
      list.push(
        `${API_BASE}/wallet/screenshot?key=${encodeURIComponent(tx.screenshotKey)}`
      );
    }
    if (tx.screenshotUrl?.includes("amazonaws.com")) {
      const key = extractS3KeyFromUrl(tx.screenshotUrl);
      if (key) {
        list.push(
          `${API_BASE}/wallet/screenshot?key=${encodeURIComponent(key)}`
        );
      }
    }
    if (tx.screenshotUrl?.includes("X-Amz-Algorithm=")) {
      list.push(tx.screenshotUrl);
    }
    return [...new Set(list.filter(Boolean))];
  }, [tx, API_BASE]);

  useEffect(() => {
    if (imageCandidates.length) {
      setImgSrc(imageCandidates[0]);
      setImgTried([]);
    } else {
      setImgSrc("");
      setImgTried([]);
    }
  }, [imageCandidates]);

  useEffect(() => {
    if (!imgSrc) return;
    setIsImgLoading(true);
    const loader = new Image();
    loader.src = imgSrc;
    loader.onload = () => setIsImgLoading(false);
    loader.onerror = () => {
      setIsImgLoading(false);
      tryNextImage();
    };
  }, [imgSrc]);

  const tryNextImage = () => {
    if (!imageCandidates.length) return;
    const tried = new Set([...imgTried, imgSrc]);
    const next = imageCandidates.find((u) => !tried.has(u));
    setImgTried([...tried]);
    if (next) setImgSrc(next);
    else setImgSrc("");
  };

  const handleSearch = async () => {
    if (!txId.trim()) {
      toast.error("Please enter a Transaction ID");
      return;
    }
    try {
      await triggerTxInfo(txId.trim());
    } catch (err) {
      console.error("Error fetching tx info:", err);
      const msg =
        err?.data?.message ||
        err?.error ||
        "Transaction not found or failed to fetch transaction.";
      toast.error(msg, { position: "top-center" });
    }
  };

  return (
    <div>
      <ToastContainer />

      <section className="py-3 sm:py-4 px-1 sm:px-3 md:px-4 min-h-screen bg-[#282f35] rounded-lg mx-1 sm:mx-2.5">
        {/* ── Search Bar ── */}
        <div className="flex justify-center mb-6">
          <form
            className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full max-w-125"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <input
              type="text"
              placeholder="Enter Transaction ID"
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              className="w-full flex-1 min-w-0 h-11.5 sm:h-11.5 px-3.5 rounded-lg bg-[#2a313b] border border-[#2b3440] text-white text-center text-sm placeholder:text-white/65 focus:outline-none focus:ring-1 focus:ring-[#ec660f]"
            />
            <button
              type="submit"
              disabled={isFetching}
              className="w-full sm:w-auto h-11.5 px-5 rounded-lg bg-[#ec660f] hover:bg-[#d45a0d] text-white font-semibold text-sm whitespace-nowrap transition disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {isFetching ? "Loading..." : "Get Transaction Info"}
            </button>
          </form>
        </div>

        {/* ── Loading Spinner ── */}
        {isFetching && (
          <div className="flex justify-center py-10">
            <div className="w-10 h-10 border-4 border-[#ec660f] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* ── Error ── */}
        {isError && (
          <div className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-center py-3 px-4 mt-3 text-sm">
            {error?.data?.message || "Transaction not found or invalid ID"}
          </div>
        )}

        {/* ── Transaction Card ── */}
        {tx && (
          <div
            className="p-3 sm:p-4 rounded-xl border-2 border-[#ec660f]"
            style={{
              background: "linear-gradient(135deg, #1a2128 0%, #141a20 100%)",
              boxShadow:
                "0 20px 40px rgba(0,0,0,.32), 0 8px 24px rgba(236,102,15,.16)",
            }}
          >
            {/* Title + Status Pill */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <h3 className="text-[#ec660f] font-bold text-base sm:text-lg md:text-xl">
                Transaction Details
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold border border-[#2b3440] ${pillColor(
                  tx.transactionStatus
                )}`}
              >
                {tx.transactionStatus || "N/A"}
              </span>
            </div>

            {/* ── Summary Strip ── */}
            <div className="bg-[#2a313b] border border-[#2b3440] rounded-lg p-3 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="text-[#b9c0c7] text-xs">Name</div>
                  <div className="text-white font-bold text-sm sm:text-base wrap-break-words">
                    {tx.name || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-[#b9c0c7] text-xs">Amount</div>
                  <div className="text-white font-bold text-sm sm:text-base">
                    {fmtAmount(tx.transactionAmount, tx.userId?.countryCode)}
                  </div>
                </div>
                <div>
                  <div className="text-[#b9c0c7] text-xs">Date</div>
                  <div className="text-white font-bold text-sm sm:text-base">
                    {formatDateWithAmPm(tx.transactionDate)}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Detail Rows ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left */}
              <div>
                <Row label="Transaction ID">{tx.transactionId}</Row>
                <Row label="Payment Mode">{tx.paymentMode || "N/A"}</Row>
                <Row label="Type">{tx.transactionType || "N/A"}</Row>
                <Row label="Currency">{tx.currency || "N/A"}</Row>
                <Row label="Reason">{tx.reason || "N/A"}</Row>
                <Row label="User ID">
                  {tx.userId?._id || tx.userId || "N/A"}
                </Row>
                <Row label="Country Code">
                  {tx.userId?.countryCode ?? "N/A"}
                </Row>
              </div>

              {/* Right */}
              <div>
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

                {/* ── Screenshot ── */}
                <div className="bg-[#2a313b] border border-[#2b3440] rounded-lg p-3 mt-2.5">
                  <div className="flex justify-between items-center mb-2">
                    <strong className="text-white text-sm">Screenshot</strong>
                    {tx.transactionType === "Debit" &&
                      !imageCandidates.length && (
                        <span className="text-[#b9c0c7] text-xs">
                          Usually not available for debits
                        </span>
                      )}
                  </div>

                  <div className="relative min-h-55 flex items-center justify-center">
                    {/* Loader overlay */}
                    {isImgLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg z-10">
                        <div className="w-10 h-10 border-4 border-[#ec660f] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}

                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt="screenshot"
                        loading="lazy"
                        className={`max-w-full max-h-70 object-contain border border-[#ec660f] rounded-lg cursor-zoom-in transition-opacity duration-500 ${
                          isImgLoading ? "opacity-0" : "opacity-100"
                        }`}
                        onClick={() => setShowImg(true)}
                      />
                    ) : (
                      <div className="w-full h-55 bg-[#2e2e2e] flex items-center justify-center text-[#aaa] border border-dashed border-[#ec660f] rounded-lg p-3 text-center text-sm">
                        {imageCandidates.length
                          ? "Image failed to load."
                          : "No image available"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Image Lightbox Modal ── */}
        <TwModal show={showImg} onClose={() => setShowImg(false)} size="max-w-3xl">
          <TwModalHeader onClose={() => setShowImg(false)}>
            Screenshot
          </TwModalHeader>
          <TwModalBody className="bg-[#282f35]">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt="screenshot large"
                className="w-full h-auto rounded-lg"
                onLoad={() => setIsImgLoading(false)}
                onError={() => {
                  setIsImgLoading(false);
                  tryNextImage();
                }}
              />
            ) : null}
          </TwModalBody>
        </TwModal>
      </section>
    </div>
  );
};

export default TxInfo;