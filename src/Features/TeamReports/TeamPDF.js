// src/features/team/TeamPDF.js
import PDFGenerator from "../../utils/pdfGenerator";

// ─── Get Total Stats ────────────────────────────────────────
const getTotalStats = (layersData) => {
  let totalActive = 0;
  let totalInactive = 0;
  let totalLayers = 0;

  Object.keys(layersData).forEach((layerKey) => {
    const layer = layersData[layerKey];
    const activeCount = layer?.active?.length || 0;
    const inactiveCount = layer?.inactive?.length || 0;

    if (activeCount > 0 || inactiveCount > 0) {
      totalLayers++;
    }
    totalActive += activeCount;
    totalInactive += inactiveCount;
  });

  return {
    totalActive,
    totalInactive,
    totalUsers: totalActive + totalInactive,
    totalLayers,
  };
};

// ─── User Table Columns ─────────────────────────────────────
const USER_COLUMNS = [
  { header: "#", render: (_, i) => `${i + 1}.` },
  { header: "Name", render: (row) => row?.name || "—" },
  { header: "Username", render: (row) => row?.username || "—" },
  { header: "Email", render: (row) => row?.email || "—" },
  { header: "Phone", render: (row) => row?.phone?.toString() || "—" },
  { header: "Reference ID", render: (row) => row?.referenceId || "—" },
];

// ─── Build Team PDF ─────────────────────────────────────────
export const buildTeamPDF = (pdf, { layersData, username }) => {
  const stats = getTotalStats(layersData);

  // ── Page 1: Summary ──────────────────────────────────────
  // Stat Cards
  pdf.addStatCards([
    { label: "Total Layers", value: stats.totalLayers, color: [59, 130, 246] },
    { label: "Active Users", value: stats.totalActive, color: [14, 203, 111] },
    { label: "Inactive Users", value: stats.totalInactive, color: [239, 68, 68] },
    { label: "Total Users", value: stats.totalUsers, color: [235, 102, 15] },
  ]);

  pdf.addSpace(5);

  // Summary Box
  pdf.addSummaryBox("Report Summary", [
    { label: "Username", value: username },
    { label: "Total Layers", value: stats.totalLayers },
    { label: "Active Users", value: stats.totalActive, color: [14, 203, 111] },
    { label: "Inactive Users", value: stats.totalInactive, color: [239, 68, 68] },
    { label: "Total Users", value: stats.totalUsers },
    { label: "Report Date", value: new Date().toLocaleString() },
  ]);

  pdf.addSpace(5);

  // ── Layer-wise Summary Table ─────────────────────────────
  pdf.addSectionTitle("Layer-wise Summary");

  const summaryColumns = [
    { header: "Layer", accessor: "layer" },
    { header: "Active", accessor: "active" },
    { header: "Inactive", accessor: "inactive" },
    { header: "Total", accessor: "total" },
  ];

  const summaryData = Object.keys(layersData)
    .sort((a, b) => Number(a) - Number(b))
    .filter((layerKey) => {
      const layer = layersData[layerKey];
      return (layer?.active?.length || 0) + (layer?.inactive?.length || 0) > 0;
    })
    .map((layerKey) => {
      const layer = layersData[layerKey];
      const activeCount = layer?.active?.length || 0;
      const inactiveCount = layer?.inactive?.length || 0;
      return {
        layer: `Layer ${layerKey}`,
        active: activeCount.toString(),
        inactive: inactiveCount.toString(),
        total: (activeCount + inactiveCount).toString(),
      };
    });

  // Add total row
  summaryData.push({
    layer: "TOTAL",
    active: stats.totalActive.toString(),
    inactive: stats.totalInactive.toString(),
    total: stats.totalUsers.toString(),
  });

  pdf.addTable(summaryColumns, summaryData, {
    columnStyles: {
      0: { halign: "left", fontStyle: "bold" },
      1: { halign: "center" },
      2: { halign: "center" },
      3: { halign: "center" },
    },
  });

  // ── Detailed Layer Pages ─────────────────────────────────
  const sortedLayers = Object.keys(layersData).sort(
    (a, b) => Number(a) - Number(b)
  );

  sortedLayers.forEach((layerKey) => {
    const layer = layersData[layerKey];
    const activeUsers = layer?.active || [];
    const inactiveUsers = layer?.inactive || [];

    if (activeUsers.length === 0 && inactiveUsers.length === 0) return;

    // New page for each layer
    pdf.addNewPage();

    // Layer title
    pdf.addSectionTitle(`Layer ${layerKey}`, {
      icon: "◆",
      color: [59, 130, 246],
    });

    // Layer stats
    pdf.addText(
      `Active: ${activeUsers.length} | Inactive: ${inactiveUsers.length} | Total: ${activeUsers.length + inactiveUsers.length}`,
      {
        fontSize: 9,
        color: pdf.theme.textMuted,
      }
    );

    pdf.addSpace(3);

    // Active Users Table
    if (activeUsers.length > 0) {
      pdf.addText("✓ Active Users", {
        fontSize: 11,
        fontStyle: "bold",
        color: [14, 203, 111],
      });

      pdf.addSpace(2);

      pdf.addTable(USER_COLUMNS, activeUsers, {
        compact: true,
        headerColor: [14, 203, 111],
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 30 },
          2: { cellWidth: 28 },
          3: { cellWidth: 42 },
          4: { cellWidth: 25 },
          5: { cellWidth: 30 },
        },
      });

      pdf.addSpace(5);
    }

    // Inactive Users Table
    if (inactiveUsers.length > 0) {
      pdf.checkPageBreak(30);

      pdf.addText("✗ Inactive Users", {
        fontSize: 11,
        fontStyle: "bold",
        color: [239, 68, 68],
      });

      pdf.addSpace(2);

      pdf.addTable(USER_COLUMNS, inactiveUsers, {
        compact: true,
        headerColor: [239, 68, 68],
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 30 },
          2: { cellWidth: 28 },
          3: { cellWidth: 42 },
          4: { cellWidth: 25 },
          5: { cellWidth: 30 },
        },
      });
    }
  });
};