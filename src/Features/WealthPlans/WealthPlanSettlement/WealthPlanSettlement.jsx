import React, { useState } from "react";
import { Search, RefreshCw, TrendingUp, AlertCircle } from "lucide-react";
import {
  useGetPreviewWpSettlementMutation,
  useConvertWealthplanToSettlementMutation,
} from "../wealthPlanApiSlice";
import Loader from "../../../reusableComponents/Loader/Loader";
import { buildWpSettlementPDF } from "./buildWpSettlementPDF";
import usePDFGenerator from "../../../hooks/usePDFGenerator";

/* ─── tiny helpers ─── */
const fmt = (n) =>
  typeof n === "number"
    ? n.toLocaleString("en-IN", { maximumFractionDigits: 2 })
    : (n ?? "—");
const fmtCur = (n) => `₹${fmt(n)}`;
const fmtTokens = (n) =>
  typeof n === "number" ? n.toLocaleString("en-IN") : "—";

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-[8px] p-5 flex flex-col gap-1 bg-[#282f35] border border-[#3a4149]">
      <span className="text-xs font-semibold tracking-widest uppercase text-[#b9fd5c]">
        {label}
      </span>
      <span
        className={`text-lg sm:text-2xl font-bold ${
          accent ? "text-[#b9fd5c]" : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* ─── plan badge ─── */
function PlanBadge({ plan, exists }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
        exists
          ? "bg-[#b9fd5c] text-[#1a1f24]"
          : "bg-[#1a1f24] text-[#8a9099] border border-[#3a4149]"
      }`}
    >
      {plan.toUpperCase()} {exists ? "✓" : "—"}
    </span>
  );
}

/* ─── single WP order row ─── */
function OrderRow({ order, idx }) {
  const net = order.amount - order.totalDisbursed;
  const progress =
    order.promisedReturn > 0
      ? Math.min((order.totalDisbursed / order.promisedReturn) * 100, 100)
      : 0;

  return (
    <div className="rounded-[8px] p-3 sm:p-5 bg-[#282f35] border border-[#3a4149] flex flex-col gap-3">
      {/* top row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black tracking-widest text-[#b9fd5c]">
              #{idx + 1}
            </span>
            <span className="text-[10px] text-[#8a9099] font-mono break-all">
              {order.orderId}
            </span>
          </div>
          <div className="flex gap-4 mt-1 flex-wrap">
            <div>
              <span className="text-[10px] block text-[#8a9099] uppercase tracking-wider">
                Invested
              </span>
              <span className="text-sm font-bold">{fmtCur(order.amount)}</span>
            </div>
            <div>
              <span className="text-[10px] block text-[#8a9099] uppercase tracking-wider">
                Promised
              </span>
              <span className="text-sm font-bold text-[#b9fd5c]">
                {fmtCur(order.promisedReturn)}
              </span>
            </div>
            <div>
              <span className="text-[10px] block text-[#8a9099] uppercase tracking-wider">
                Per Day
              </span>
              <span className="text-sm font-bold">
                {fmtCur(order.amountPerDay)}
              </span>
            </div>
          </div>
        </div>

        {/* disbursed / remaining */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0 min-w-0">
          <span className="text-[10px] text-[#8a9099] uppercase tracking-wider">
            Disbursed ({order.disbursedDays}d)
          </span>
          <span className="text-sm sm:text-base font-bold text-white text-right">
            {fmtCur(order.totalDisbursed)}
          </span>
          <span className="text-xs text-[#ff6b6b] text-right">
            Rem: {fmtCur(order.remainingAmountToFulfillPromise)}
          </span>
        </div>
      </div>

      {/* progress bar */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-[10px] text-[#8a9099]">
          <span>Fulfillment Progress</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[#1a1f24] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#b9fd5c] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── plan section ─── */
function PlanSection({ planKey, plan }) {
  const [open, setOpen] = useState(false);
  if (!plan.exists) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* plan totals */}
      <div className="rounded-[8px] p-4 sm:p-5 bg-[#282f35] border border-[#3a4149]">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="text-xs font-bold tracking-widest uppercase text-[#b9fd5c]">
            {planKey.toUpperCase()} — Plan Totals
          </h3>
          <span className="text-xs text-[#8a9099]">
            {plan.orders.length} orders
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            {
              label: "Total Invested",
              value: fmtCur(plan.totals.totalInvested),
            },
            {
              label: "Total Promised",
              value: fmtCur(plan.totals.totalPromised),
            },
            {
              label: "Disbursed",
              value: fmtCur(plan.totals.totalDisbursedTillNow),
            },
            {
              label: "Remaining",
              value: fmtCur(plan.totals.totalRemainingToFulfillPromise),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-0.5 p-3 rounded-[8px] bg-[#1a1f24]"
            >
              <span className="text-[10px] text-[#8a9099] uppercase tracking-wider">
                {item.label}
              </span>
              <span className="text-sm font-bold">{item.value}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-3">
          <div className="flex-1 flex flex-col gap-0.5 p-3 rounded-[8px] bg-[#1a1f24]">
            <span className="text-[10px] text-[#8a9099] uppercase tracking-wider">
              Tokens to Keep
            </span>
            <span className="text-sm font-bold text-[#b9fd5c]">
              {fmtTokens(plan.totals.totalTokensToKeep)}
            </span>
          </div>
          <div className="flex-1 flex flex-col gap-0.5 p-3 rounded-[8px] bg-[#1a1f24]">
            <span className="text-[10px] text-[#8a9099] uppercase tracking-wider">
              Tokens to Recover
            </span>
            <span className="text-sm font-bold text-[#ff6b6b]">
              {fmtTokens(plan.totals.totalTokensToRecover)}
            </span>
          </div>
        </div>
      </div>

      {/* order rows toggle */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center justify-between px-4 py-2.5 rounded-[8px] text-xs font-bold tracking-widest uppercase transition-all
          bg-[#1a1f24] border border-[#3a4149] text-[#8a9099] hover:text-white hover:border-[#b9fd5c]"
      >
        <span>
          {open ? "Hide" : "Show"} {plan.orders.length} Orders
        </span>
        <span className="text-[#b9fd5c]">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="flex flex-col gap-3">
          {plan.orders.map((order, idx) => (
            <OrderRow key={`${order.orderId}-${idx}`} order={order} idx={idx} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── main component ─── */
function WealthPlanSettlement() {
  const [inputValue, setInputValue] = useState("");
  const [submittedUsername, setSubmittedUsername] = useState("");

  const [triggerSettlement, { data, error, isLoading, reset }] =
    useGetPreviewWpSettlementMutation();
  const [convertWealthplanToSettlement, { isLoading: isConverting }] =
    useConvertWealthplanToSettlementMutation();
  const { isGenerating, downloadPDF, previewPDF } = usePDFGenerator();

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim().toUpperCase();
    if (!trimmed) return;
    setSubmittedUsername(trimmed);
    await triggerSettlement(trimmed);
  };

  const handleRefresh = async () => {
    if (!submittedUsername) return;
    await triggerSettlement(submittedUsername);
  };
  const handleConvertSettlement = async () => {
    try {
      const res = await convertWealthplanToSettlement({
        username: submittedUsername,
        consent: true,
      }).unwrap();

      console.log("Conversion Success:", res);
    } catch (error) {
      console.error("Conversion Failed:", error);
    }
  };
  const settlement = data?.data?.summary;
  const plans = data?.data?.plans;
  const showData = !isLoading && !error && !!data;

  const pdfMeta = {
    title: `WP Settlement Report ${settlement?.user?.username || ""}`,
    subtitle: `Generated on ${new Date().toLocaleString("en-IN")}`,
    companyName: "JAIMAX DECENTRALIZED DIGITAL CURRENCY",
    orientation: "portrait",
    format: "a4",
  };

  const handleDownloadPDF = async () => {
    if (!data?.data) return;
    await downloadPDF(
      (pdf) => buildWpSettlementPDF(pdf, data.data),
      pdfMeta,
      `WPSettlement_${settlement?.user?.username}_${Date.now()}.pdf`,
    );
  };

  const handlePreviewPDF = async () => {
    if (!data?.data) return;
    await previewPDF((pdf) => buildWpSettlementPDF(pdf, data.data), pdfMeta);
  };

  return (
    <div className="min-h-screen font-mono bg-[#1a1f24] text-white">
      {/* ── Header ── */}
      <div className="sticky top-0 z-20 px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-2 bg-[#1a1f24] border-b border-[#282f35]">
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2 w-full"
        >
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a9099]">
              <Search size={13} strokeWidth={2.5} />
            </span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter username for WP settlement..."
              className="w-full pl-9 pr-4 py-2 rounded-[8px] text-xs font-mono tracking-wide outline-none transition-all
                bg-[#282f35] border border-[#3a4149] text-white caret-[#b9fd5c]
                focus:border-[#b9fd5c]"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest
              transition-all hover:opacity-80 active:scale-95 flex-shrink-0
              bg-[#b9fd5c] text-[#1a1f24] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search size={12} strokeWidth={2.5} />
            <span>Calculate</span>
          </button>
        </form>

        {/* Refresh + PDF actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {isLoading && (
            <span className="text-xs animate-pulse text-[#b9fd5c]">
              Calculating...
            </span>
          )}
          {submittedUsername && (
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-xs font-bold tracking-widest
                transition-all hover:opacity-80 active:scale-95
                bg-[#282f35] text-white border border-[#3a4149] disabled:opacity-50"
            >
              <RefreshCw
                size={12}
                strokeWidth={2.5}
                className={isLoading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          )}
          {showData && (
            <>
              <button
                disabled={isGenerating}
                onClick={handleDownloadPDF}
                className="px-3 sm:px-4 py-2 rounded-full text-xs font-bold tracking-widest transition-all hover:opacity-80 active:scale-95 bg-[#b9fd5c] text-[#1a1f24] disabled:opacity-50 whitespace-nowrap"
              >
                {isGenerating ? "Generating..." : "Download PDF"}
              </button>
              <button
                onClick={handlePreviewPDF}
                className="px-3 sm:px-4 py-2 rounded-full text-xs font-bold tracking-widest transition-all hover:opacity-80 active:scale-95 bg-[#1a1f24] border border-[#b9fd5c] text-[#b9fd5c] whitespace-nowrap"
              >
                Preview PDF
              </button>
              <button
                disabled={isConverting}
                onClick={handleConvertSettlement}
                className="px-3 sm:px-4 py-2 rounded-full text-xs font-bold tracking-widest transition-all hover:opacity-80 active:scale-95 bg-[#1a1f24] border border-[#b9fd5c] text-[#b9fd5c] whitespace-nowrap"
              >
                {isConverting ? "Processing..." : "Convert Settlement"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6 sm:gap-8">
        {/* ── Empty state ── */}
        {!submittedUsername && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-16 h-16 rounded-[8px] flex items-center justify-center bg-[#282f35] border border-[#3a4149]">
              <TrendingUp size={28} stroke="#b9fd5c" strokeWidth={2} />
            </div>
            <p className="text-sm tracking-widest uppercase text-[#8a9099]">
              Enter a username to calculate WP settlement
            </p>
          </div>
        )}

        {/* ── Loading ── */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader />
            <span className="text-sm tracking-widest uppercase text-[#b9fd5c]">
              Calculating Settlement...
            </span>
          </div>
        )}

        {/* ── Error ── */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-16 h-16 rounded-[8px] flex items-center justify-center bg-[#282f35] border border-[#3a4149]">
              <AlertCircle size={28} stroke="#ff6b6b" strokeWidth={2} />
            </div>
            <p className="text-sm text-[#ff6b6b]">
              User not found or something went wrong.
            </p>
            <p className="text-xs text-[#8a9099]">
              Check the username and try again.
            </p>
          </div>
        )}

        {/* ── Data ── */}
        {showData && (
          <>
            {/* User profile card */}
            <div className="rounded-[8px] p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center bg-[#282f35] border border-[#3a4149]">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-[8px] flex items-center justify-center text-xl sm:text-2xl font-black flex-shrink-0 bg-[#b9fd5c] text-[#1a1f24]">
                {settlement?.user?.name?.charAt(0) || "U"}
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <h1 className="text-xl font-bold truncate">
                  {settlement?.user?.name}
                </h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <span className="text-xs text-[#8a9099]">
                    {settlement?.user?.email}
                  </span>
                  <span className="text-xs text-[#8a9099]">
                    {settlement?.user?.phone}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#1a1f24] text-[#b9fd5c]">
                    {settlement?.user?.username}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-[#1a1f24] text-[#8a9099]">
                    Ref by: {settlement?.user?.reffrefBy}
                  </span>
                  {/* Plan existence badges */}
                  <PlanBadge plan="wp1" exists={plans?.wp1?.exists} />
                  <PlanBadge plan="wp2" exists={plans?.wp2?.exists} />
                  <PlanBadge plan="wp3" exists={plans?.wp3?.exists} />
                </div>
              </div>
              <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-4 sm:gap-2 w-full sm:w-auto flex-shrink-0 pt-2 sm:pt-0 border-t border-[#3a4149] sm:border-0">
                <div className="flex flex-col items-end">
                  <span className="text-xs uppercase tracking-widest text-[#8a9099]">
                    Current Tokens
                  </span>
                  <span className="text-xl font-black text-white">
                    {fmtTokens(settlement?.user?.currentUserTokens)}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs uppercase tracking-widest text-[#b9fd5c]">
                    After Settlement
                  </span>
                  <span className="text-xl font-black text-[#b9fd5c]">
                    {fmtTokens(settlement?.user?.tokensAfterSettlement)}
                  </span>
                </div>
              </div>
            </div>

            {/* Token formula info box */}
            <p className="text-[11px] text-[#8a9099] text-left sm:text-center bg-[#282f35] border border-[#3a4149] rounded-[8px] px-4 py-3 leading-relaxed">
              <span className="text-white font-bold">Formula: </span>
              {settlement?.user?.totalJaimaxToKeepFormula}
            </p>

            {/* INR Summary grid */}
            <div>
              <h2 className="text-xs font-bold tracking-widest uppercase mb-3 text-[#b9fd5c]">
                INR Summary
              </h2>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                  label="Total Invested"
                  value={fmtCur(settlement?.inr?.totalInvestedAcrossAllPlans)}
                />
                <StatCard
                  label="Total Promised"
                  value={fmtCur(settlement?.inr?.totalPromisedAcrossAllPlans)}
                />
                <StatCard
                  label="Total Disbursed"
                  value={fmtCur(settlement?.inr?.totalDisbursedAcrossAllPlans)}
                />
                <StatCard
                  label="Remaining"
                  value={fmtCur(
                    settlement?.inr?.totalRemainingAmountToFulfillPromise,
                  )}
                />
              </div>
            </div>

            {/* Token breakdown */}
            <div className="rounded-[8px] p-4 sm:p-6 bg-[#282f35] border border-[#3a4149]">
              <h2 className="text-xs font-bold tracking-widest uppercase mb-4 text-[#b9fd5c]">
                Token Breakdown
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* From WP plans */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-[#8a9099] font-bold">
                    From Wealth Plans
                  </span>
                  {[
                    {
                      label: "WP1 Tokens",
                      value: fmtTokens(
                        settlement?.tokens?.fromWealthPlans?.jaimaxFromWp1s,
                      ),
                    },
                    {
                      label: "WP2 Tokens",
                      value: fmtTokens(
                        settlement?.tokens?.fromWealthPlans?.jaimaxFromWp2s,
                      ),
                    },
                    {
                      label: "WP3 Tokens",
                      value: fmtTokens(
                        settlement?.tokens?.fromWealthPlans?.jaimaxFromWp3s,
                      ),
                    },
                    {
                      label: "Total to Recover",
                      value: fmtTokens(
                        settlement?.tokens?.fromWealthPlans
                          ?.totalJaimaxToRecover,
                      ),
                      highlight: true,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-3 rounded-[8px] bg-[#1a1f24]"
                    >
                      <span className="text-xs text-[#8a9099]">
                        {item.label}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          item.highlight ? "text-[#ff6b6b]" : "text-white"
                        }`}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* From other sources */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-[#8a9099] font-bold">
                    From Other Sources
                  </span>
                  {[
                    {
                      label: "Normal Orders",
                      value: fmtTokens(
                        settlement?.tokens?.fromOtherSources
                          ?.jaimaxFromNormalOrders,
                      ),
                    },
                    {
                      label: "Registration Bonus",
                      value: fmtTokens(
                        settlement?.tokens?.fromOtherSources
                          ?.jaimaxFromRegistrationBonus,
                      ),
                    },
                    {
                      label: "Referral Bonus",
                      value: fmtTokens(
                        settlement?.tokens?.fromOtherSources
                          ?.jaimaxFromReferralBonus,
                      ),
                    },
                    {
                      label: "Admin Bonus",
                      value: fmtTokens(
                        settlement?.tokens?.fromOtherSources
                          ?.jaimaxFromAdminBonus,
                      ),
                    },
                    {
                      label: "Total to Keep",
                      value: fmtTokens(
                        settlement?.tokens?.totalJaimaxToKeepForUser,
                      ),
                      highlight: true,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-3 rounded-[8px] bg-[#1a1f24]"
                    >
                      <span className="text-xs text-[#8a9099]">
                        {item.label}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          item.highlight ? "text-[#b9fd5c]" : "text-white"
                        }`}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Staking Settlement */}
            {settlement?.staking && (
              <div className="rounded-[8px] p-4 sm:p-6 bg-[#282f35] border border-[#3a4149]">
                <h2 className="text-xs font-bold tracking-widest uppercase mb-4 text-[#b9fd5c]">
                  Staking Settlement
                </h2>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    {
                      label: "Token Price",
                      value: `$${settlement.staking.tokenPrice}`,
                    },
                    {
                      label: "Total Tokens to Award",
                      value: fmtTokens(
                        settlement.staking.totalTokensToAwardForSettlement,
                      ),
                    },
                    {
                      label: "Tokens Per Month",
                      value: fmtTokens(settlement.staking.tokensPerMonth),
                    },
                    {
                      label: "Distribution Months",
                      value: settlement.staking.distributionMonths,
                    },
                    {
                      label: "Monthly Rate",
                      value: settlement.staking.monthlyDistributionRate,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex flex-col gap-1 p-4 rounded-[8px] bg-[#1a1f24]"
                    >
                      <span className="text-[10px] text-[#8a9099] uppercase tracking-wider">
                        {item.label}
                      </span>
                      <span className="text-sm font-bold text-[#b9fd5c]">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WP Plan Sections */}
            {["wp1", "wp2", "wp3"].map((key) =>
              plans?.[key]?.exists ? (
                <div key={key}>
                  <h2 className="text-xs font-bold tracking-widest uppercase mb-3 text-[#b9fd5c]">
                    {key.toUpperCase()} Orders
                  </h2>
                  <PlanSection planKey={key} plan={plans[key]} />
                </div>
              ) : null,
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default WealthPlanSettlement;
