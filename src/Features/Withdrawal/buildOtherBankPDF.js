
export const buildOtherBankPDF = (pdf, accounts = []) => {
//   pdf.addHeader(
//     "Other Bank Details",
//     // `Generated on ${new Date().toLocaleString("en-IN")}`,
//   );
  pdf.addSectionTitle("Other Bank Details");

  const columns = [
    { header: "S.No", accessor: "sno" },
    { header: "Account Holder Name", accessor: "name" },
    { header: "Bank Name", accessor: "bank" },
    { header: "IFSC Code", accessor: "ifsc" },
    { header: "Account Number", accessor: "account" },
    {
      header: "Amount",
      accessor: "amount",
      //   render: (row) => `₹ ${Number(row.amount).toLocaleString("en-IN")}`,
    },
  ];

  const tableData = accounts.map((item, index) => ({
    sno: index + 1,
    name: item?.userId?.name || "—",
    bank: item?.kycInfo?.bank_name || "—",
    ifsc: item?.kycInfo?.ifsc_code || "—",
    account: item?.kycInfo?.bank_account || "—",
    amount: item?.amount || 0,
  }));

  pdf.addTable(columns, tableData, {
    striped: true,
    compact: true,
  });

  const totalAmount = tableData.reduce(
  (sum, row) => sum + Number(row.amount || 0),
  0
);

pdf.addSummaryBox("Summary", [
  { label: "Total Accounts", value: tableData.length },
  {
    label: "Total Amount",
    value: totalAmount.toLocaleString("en-IN"),
  },
]);
  return pdf;
};