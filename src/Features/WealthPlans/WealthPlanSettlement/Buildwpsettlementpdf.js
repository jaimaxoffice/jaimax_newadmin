export const buildWpSettlementPDF = (pdf, data) => {
  const { summary, plans } = data;
  const { user, inr, tokens } = summary;

  const fmt = (n) =>
    typeof n === "number"
      ? n.toLocaleString("en-IN", { maximumFractionDigits: 2 })
      : (n ?? "—");
  const fmtCur = (n) => `Rs. ${fmt(n)}`;
  const fmtTokens = (n) =>
    typeof n === "number" ? n.toLocaleString("en-IN") : "—";

  /* ── User Profile ── */
  pdf.addSectionTitle("User Profile");
  pdf.addInfoCard("Personal Details", [
    { label: "Name", value: user?.name },
    { label: "Jaimax ID", value: user?.username },
    { label: "Email", value: user?.email },
    { label: "Phone", value: String(user?.phone ?? "—") },
    { label: "Referred By", value: user?.reffrefBy },
    // { label: "Current Tokens", value: fmtTokens(user?.currentUserTokens) },
    {
      label: "Tokens After Settlement",
      value: fmtTokens(user?.tokensAfterSettlement),
    },
  ]);

  /* ── INR Summary ── */
  pdf.addSectionTitle("Wealth INR Summary (Across All Plans)");
  pdf.addStatCards([
    {
      label: "Total Invested",
      value: fmtCur(inr?.totalInvestedAcrossAllPlans),
    },
    {
      label: "Total Promised",
      value: fmtCur(inr?.totalPromisedAcrossAllPlans),
    },
    {
      label: "Total Disbursed",
      value: fmtCur(inr?.totalDisbursedAcrossAllPlans),
    },
    {
      label: "Remaining to Fulfill Promise",
      value: fmtCur(inr?.totalRemainingAmountToFulfillPromise),
    },
  ]);

  pdf.addSpace(2);

  /* ── Token Breakdown ── */
  pdf.addSectionTitle("Token Breakdown");
  pdf.addSummaryBox("From Wealth Plans", [
    {
      label: "WP1 Tokens",
      value: fmtTokens(tokens?.fromWealthPlans?.jaimaxFromWp1s),
    },
    {
      label: "WP2 Tokens",
      value: fmtTokens(tokens?.fromWealthPlans?.jaimaxFromWp2s),
    },
    {
      label: "WP3 Tokens",
      value: fmtTokens(tokens?.fromWealthPlans?.jaimaxFromWp3s),
    },
    {
      label: "Total to Recover",
      value: fmtTokens(tokens?.fromWealthPlans?.totalJaimaxToRecover),
    },
  ]);

  pdf.addSpace(2);

  pdf.addSummaryBox(
    "Earned Tokens from Other Sources and Sum of All WP1 Tokens ÷ 2",
    [
      {
        label: "Normal Orders",
        value: fmtTokens(tokens?.fromOtherSources?.jaimaxFromNormalOrders),
      },
      {
        label: "Registration Bonus",
        value: fmtTokens(tokens?.fromOtherSources?.jaimaxFromRegistrationBonus),
      },
      {
        label: "Referral Bonus",
        value: fmtTokens(tokens?.fromOtherSources?.jaimaxFromReferralBonus),
      },
      {
        label: "Admin Bonus",
        value: fmtTokens(tokens?.fromOtherSources?.jaimaxFromAdminBonus),
      },
      {
        label: "From WP-1 As Promissed ",
        value: fmtTokens(tokens?.fromOtherSources?.wp1TokensAsPromissed),
      },
      {
        label: "Total tokens After Settlement In Main Wallet",
        value: fmtTokens(tokens?.totalJaimaxToKeepForUser),
      },
    ],
  );

  pdf.addSpace(2);
  pdf.addText(`Formula: ${user?.totalJaimaxToKeepFormula}`, {
    fontSize: 6.5,
    fontStyle: "italic",
    color: [108, 117, 125],
  });
  pdf.addSpace(2);
  /* ── Staking Settlement ── */
  if (summary?.staking) {
    const s = summary.staking;
    pdf.addSpace(2);
    pdf.addSectionTitle("WP Staking Settlement Summary");
    pdf.addSummaryBox("Distribution Details", [
      { label: "Base Token Price", value: `Rs ${s.tokenPrice}` },
      {
        label: "Total Tokens to Award to Fulfill Promise",
        value: fmtTokens(s.totalTokensToAwardForSettlement),
      },
      {
        label: "Tokens Spendble Per Month",
        value: fmtTokens(s.tokensPerMonth),
      },
      {
        label: "Total Months",
        value: String(s.distributionMonths),
      },
      { label: "Monthly Distribution Rate", value: s.monthlyDistributionRate },
    ]);
  }

  /* ── Per-plan sections ── */
  ["wp1", "wp2", "wp3"].forEach((key) => {
    const plan = plans?.[key];
    if (!plan?.exists) return;

    pdf.addNewPage();
    pdf.addSectionTitle(`${key.toUpperCase()} — Plan Summary`);
    pdf.addStatCards([
      { label: "Total Invested", value: fmtCur(plan.totals?.totalInvested) },
      { label: "Total Promised", value: fmtCur(plan.totals?.totalPromised) },
      {
        label: "Total Disbursed",
        value: fmtCur(plan.totals?.totalDisbursedTillNow),
      },
      {
        label: "Remaining",
        value: fmtCur(plan.totals?.totalRemainingToFulfillPromise),
      },
    ]);

    pdf.addSpace(2);
    pdf.addSummaryBox("Token Settlement", [
      {
        label: "Tokens to Keep",
        value: fmtTokens(plan.totals?.totalTokensToKeep),
      },
      {
        label: "Tokens to Recover",
        value: fmtTokens(plan.totals?.totalTokensToRecover),
      },
    ]);

    if (plan.orders?.length > 0) {
      pdf.checkPageBreak(30);
      pdf.addSectionTitle(
        `${key.toUpperCase()} — Orders (${plan.orders.length})`,
      );
      pdf.addTable(
        [
          { header: "#", render: (_, i) => String(i + 1) },
          { header: "Order ID", accessor: "orderId" },
          { header: "Invested", render: (r) => fmtCur(r.amount) },
          { header: "Promised", render: (r) => fmtCur(r.promisedReturn) },
          { header: "Per Day", render: (r) => fmtCur(r.amountPerDay) },
          { header: "Days", accessor: "disbursedDays" },
          { header: "Disbursed", render: (r) => fmtCur(r.totalDisbursed) },
          {
            header: "Remaining",
            render: (r) => fmtCur(r.remainingAmountToFulfillPromise),
          },
        ],
        plan.orders,
        { striped: true },
      );
    }
  });
};
