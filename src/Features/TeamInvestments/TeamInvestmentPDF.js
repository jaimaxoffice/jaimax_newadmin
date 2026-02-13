// src/features/team/TeamInvestmentPDF.js

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
};

const formatAmountPDF = (amount) => {
  if (!amount && amount !== 0) return "0";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getTotalInvestment = (investments) => {
  if (!investments || investments.length === 0) return 0;
  return investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
};

const getInvestedStats = (layersData) => {
  let totalInvestedUsers = 0;
  let totalLayers = 0;
  let totalInvestment = 0;

  Object.keys(layersData).forEach((layerKey) => {
    const layer = layersData[layerKey];
    const investedUsers =
      layer?.active?.filter((u) => u.investments?.length > 0) || [];

    if (investedUsers.length > 0) totalLayers++;
    totalInvestedUsers += investedUsers.length;
    investedUsers.forEach((u) => {
      totalInvestment += getTotalInvestment(u.investments);
    });
  });

  return { totalInvestedUsers, totalLayers, totalInvestment };
};

export const buildTeamInvestmentPDF = (pdf, { layersData, username, fromDate, toDate }) => {
  const stats = getInvestedStats(layersData);
  const fw = pdf.contentWidth;

  if (stats.totalInvestedUsers === 0) {
    pdf.addText("No invested users found to generate report.", {
      fontSize: 14,
      fontStyle: "bold",
      color: [239, 68, 68],
    });
    return;
  }

  // Stat Cards
  pdf.addStatCards([
    { label: "Total Layers", value: stats.totalLayers, color: [59, 130, 246] },
    { label: "Invested Users", value: stats.totalInvestedUsers, color: [14, 203, 111] },
    { label: "Total Investment", value: formatAmountPDF(stats.totalInvestment), color: [235, 102, 15] },
  ]);

  pdf.addSpace(3);

  // Date range info
  if (fromDate || toDate) {
    pdf.addText(`Period: ${fromDate || "Start"} → ${toDate || "Present"}`, {
      fontSize: 9,
      color: pdf.theme.muted,
    });
    pdf.addSpace(3);
  }

  // Summary Box
  pdf.addSummaryBox("Report Summary", [
    { label: "Username", value: username },
    { label: "Invested Users", value: stats.totalInvestedUsers },
    { label: "Active Layers", value: stats.totalLayers },
    { label: "Total Investment", value: formatAmountPDF(stats.totalInvestment), color: [14, 203, 111] },
    { label: "Report Date", value: new Date().toLocaleString() },
  ]);

  pdf.addSpace(5);

  // Layer-wise Summary Table
  pdf.addSectionTitle("Layer-wise Summary (Invested Users Only)");

  const summaryColumns = [
    { header: "Layer", accessor: "layer" },
    { header: "Invested Users", accessor: "users" },
    { header: "Total Investment", accessor: "investment" },
  ];

  const summaryData = Object.keys(layersData)
    .sort((a, b) => Number(a) - Number(b))
    .filter((key) => {
      const layer = layersData[key];
      return (layer?.active?.filter((u) => u.investments?.length > 0) || []).length > 0;
    })
    .map((key) => {
      const layer = layersData[key];
      const invested = layer?.active?.filter((u) => u.investments?.length > 0) || [];
      let amount = 0;
      invested.forEach((u) => (amount += getTotalInvestment(u.investments)));
      return {
        layer: `Layer ${key}`,
        users: invested.length.toString(),
        investment: formatAmountPDF(amount),
      };
    });

  summaryData.push({
    layer: "TOTAL",
    users: stats.totalInvestedUsers.toString(),
    investment: formatAmountPDF(stats.totalInvestment),
  });

  pdf.addTable(summaryColumns, summaryData, {
    columnStyles: {
      0: { cellWidth: fw * 0.4, halign: "left", fontStyle: "bold" },
      1: { cellWidth: fw * 0.3, halign: "center" },
      2: { cellWidth: fw * 0.3, halign: "center" },
    },
  });

  // Detailed Layer Pages
  Object.keys(layersData)
    .sort((a, b) => Number(a) - Number(b))
    .forEach((layerKey) => {
      const layer = layersData[layerKey];
      const investedUsers =
        layer?.active?.filter((u) => u.investments?.length > 0) || [];

      if (investedUsers.length === 0) return;

      let layerTotal = 0;
      investedUsers.forEach((u) => (layerTotal += getTotalInvestment(u.investments)));

      pdf.addNewPage();
      pdf.addSectionTitle(`Layer ${layerKey}`, { icon: "◆", color: [59, 130, 246] });

      pdf.addText(
        `Invested Users: ${investedUsers.length} | Total Investment: ${formatAmountPDF(layerTotal)}`,
        { fontSize: 9, color: pdf.theme.muted }
      );

      pdf.addSpace(3);
      pdf.addText("Invested Users", { fontSize: 11, fontStyle: "bold", color: [14, 203, 111] });
      pdf.addSpace(2);

      const columns = [
        { header: "S.No", render: (_, i) => `${i + 1}.` },
        { header: "Name", render: (row) => row?.name || "—" },
        { header: "Username", render: (row) => row?.username || "—" },
        { header: "Phone", render: (row) => row?.phone?.toString() || "—" },
        {
          header: "Investments",
          render: (row) =>
            row.investments
              ?.map((inv, idx) => `${idx + 1}. ${formatAmountPDF(inv.amount)} (${formatDate(inv.transactionDate)})`)
              .join("\n") || "—",
        },
        {
          header: "Total",
          render: (row) => formatAmountPDF(getTotalInvestment(row.investments)),
        },
      ];

      pdf.addTable(columns, investedUsers, {
        compact: true,
        headerColor: [14, 203, 111],
        columnStyles: {
          0: { cellWidth: fw * 0.06, halign: "center" },
          1: { cellWidth: fw * 0.15 },
          2: { cellWidth: fw * 0.14 },
          3: { cellWidth: fw * 0.12 },
          4: { cellWidth: fw * 0.38 },
          5: { cellWidth: fw * 0.15, fontStyle: "bold" },
        },
      });
    });
};