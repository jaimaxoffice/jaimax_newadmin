export const buildUserSummaryPDF = (pdf, data) => {
  const user = data?.reqUser;
  const wallet = data?.walletTxs || [];
  const orders = data?.userOrders || [];
  // const invoices = data?.totalInvoices || [];
  const bonus = data?.detaildBonusGiven || {};
  const totalInvested = data?.totalInvestedamount;
  const totalBonus = data?.totalBonusGiven;
  const totalWithdrawn = data?.userWithdraws || [];
  const walletBalance = data?.walletBalance;

  const fmt = (n) =>
    typeof n === "number"
      ? n.toLocaleString("en-IN", { maximumFractionDigits: 2 })
      : (n ?? "—");

  const fmtCur = (n) => `Rs. ${fmt(n)}`;
  const fmtDate = (d) =>
    d && d !== "N/A"
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";

  /* ───────── HEADER CONTENT ───────── */

  pdf.addSectionTitle("User Profile");
  pdf.addInfoCard("Personal Details", [
    { label: "Name", value: user?.name },
    { label: "Jaimax ID", value: user?.username },
    { label: "Email", value: user?.email },
    { label: "Phone", value: user?.phone },
    { label: "Refered By", value: user?.referenceId },
    { label: "Registered Date", value: fmtDate(user?.registeredDate) },
    { label: "Active Date", value: fmtDate(user?.activeDate) },
    { label: "Tokens", value: fmt(user?.tokens) },
    { label: "Current INR Balance", value: fmtCur(user?.Inr) },
    { label: "Wallet Balance", value: fmtCur(walletBalance) },
  ]);

  pdf.addSpace(2);

  /* ───────── KEY METRICS ───────── */

  pdf.addSectionTitle("Key Metrics");
  pdf.addStatCards([
    { label: "Total Invested", value: fmtCur(totalInvested) },
    { label: "Total Bonus", value: fmtCur(totalBonus) },
    { label: "Withdrawn", value: fmtCur(bonus.withDrawledAmount) },
    {
      label: "Available Balance",
      value: fmtCur(bonus.currentAvailableBalance),
    },
  ]);

  pdf.addSpace(2);

  pdf.addText(
    "Total Earnings via JAIMAX = Withdrawals + Orders from Available Balance + Available Balance Transfers to Wallet + Current Remaining Available Balance + Admin Referral Amount",
    { fontSize: 6.5, fontStyle: "italic", color: [108, 117, 125] },
  );

  pdf.addSpace(2);

  pdf.addSectionTitle("Bonus Breakdown");
  pdf.addSummaryBox("Bonus Details", [
    {
      label: "Admin Given Referral Amount",
      value: fmtCur(bonus.adminGivenBonus),
    },
    {
      label: "Available Balance Transferred to Wallet",
      value: fmtCur(bonus.bonusTransferToWallet),
    },
    {
      label: "Available Balance Used for Buying Coins",
      value: fmtCur(bonus.bonusUsedForBuyingCoins),
    },
    { label: "Withdrawn Amount", value: fmtCur(bonus.withDrawledAmount) },
    {
      label: "Current Available Balance",
      value: fmtCur(bonus.currentAvailableBalance),
    },
  ]);

  if (orders.length) {
    pdf.addNewPage();
    pdf.addSectionTitle(`Token Purchases(${orders.length})`);
    pdf.addTable(
      [
        { header: "ICO Round", accessor: "round" },
        { header: "Currency", accessor: "currency" },
        { header: "Price INR", render: (r) => `Rs. ${r.atPriceInr}` },
        { header: "Price USDT", render: (r) => `$${r.atPriceUsdt}` },
        { header: "Amount", render: (r) => fmtCur(r.amount) },
        { header: "Tokens", render: (r) => fmt(r.jaimax) },
        // payment method
        {
          header: "Payment Method",
          render: (r) =>
            r.paymentMethod === "wallet"
              ? "Wallet"
              : r.paymentMethod === "Available Balance"
                ? "Available Balance"
                : r.paymentMethod === "swap"
                  ? "Swap"
                  : r.paymentMethod === "bsc-exchange"
                    ? "BSC Exchange"
                    : r.paymentMethod === "migration"
                      ? "Migration"
                      : r.paymentMethod || "Wallet",
        },
      ],
      orders,
      { striped: true },
    );
  }

  if (wallet.length) {
    pdf.checkPageBreak(30);
    pdf.addSectionTitle(`Wallet Transactions (${wallet.length})`);
    pdf.addTable(
      [
        { header: "Name", accessor: "name" },
        { header: "Transaction ID", accessor: "transactionId" },
        // paymentMode
        { header: "Payment Mode", render: (r) => r.paymentMode || "—" },
        { header: "Amount", render: (r) => fmtCur(r.transactionAmount) },
        {
          header: "Fee",
          render: (r) =>
            r.transactionFee === 0 ? "No Fee" : fmtCur(r.transactionFee),
        },
        { header: "Date", render: (r) => fmtDate(r.transactionDate) },
      ],
      wallet,
      { striped: true },
    );
  }

  // if (invoices.length) {
  //   pdf.checkPageBreak(30);
  //   pdf.addSectionTitle(`Invoices (${invoices.length})`);
  //   pdf.addTable(
  //     [
  //       { header: "Invoice No", accessor: "invoiceNo" },
  //       { header: "Date", render: (r) => fmtDate(r.orderDate) },
  //       { header: "Status", render: (r) => pdf.constructor.status(r.status) },
  //       { header: "Coins", render: (r) => fmt(r.coins) },
  //       { header: "Amount", render: (r) => fmtCur(r.amount) },
  //     ],
  //     invoices,
  //     { striped: true },
  //   );
  // }

  if (totalWithdrawn.length) {
    pdf.checkPageBreak(30);
    pdf.addSectionTitle(`Withdrawals (${totalWithdrawn.length})`);
    pdf.addTable(
      [
        { header: "Currency", accessor: "currency" },
        { header: "UTR Number", render: (r) => r.utr_number || "N/A" },
        { header: "Amount", render: (r) => fmtCur(r.amount) },
        { header: "Charges", render: (r) => fmtCur(r.admin_inr_charges) },
        {
          header: "Net Amount",
          render: (r) => fmtCur(r.amount - r.admin_inr_charges),
        },
      ],
      totalWithdrawn,
      { striped: true },
    );
  }
};
