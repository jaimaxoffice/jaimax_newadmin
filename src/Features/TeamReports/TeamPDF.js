// src/features/team/TeamPDF.js

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
export const buildTeamPDF = (pdf, { layersData, name, username }) => {
  // Use name if available, fallback to username
  const displayName = name || username || "Unknown";
  
  const stats = getTotalStats(layersData);

  // Full content width for column calculations
  // A4 = 210mm, margins 8mm each side = 194mm usable
  const fw = pdf.contentWidth;

  // ── Page 1: Summary ──────────────────────────────────────
  pdf.addStatCards([
    { label: "Total Layers", value: stats.totalLayers, color: [59, 130, 246] },
    { label: "Active Users", value: stats.totalActive, color: [14, 203, 111] },
    { label: "Inactive Users", value: stats.totalInactive, color: [239, 68, 68] },
    { label: "Total Users", value: stats.totalUsers, color: [235, 102, 15] },
  ]);

  pdf.addSpace(3);

  // Summary Box - Show Name prominently
  pdf.addSummaryBox("Report Summary", [
    { label: "Name", value: displayName },
    ...(username && username !== displayName ? [{ label: "Username", value: username }] : []),
    { label: "Total Layers", value: stats.totalLayers },
    { label: "Active Users", value: stats.totalActive, color: [14, 203, 111] },
    { label: "Inactive Users", value: stats.totalInactive, color: [239, 68, 68] },
    { label: "Total Users", value: stats.totalUsers },
    { label: "Report Date", value: new Date().toLocaleString() },
  ]);

  pdf.addSpace(3);

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

  summaryData.push({
    layer: "TOTAL",
    active: stats.totalActive.toString(),
    inactive: stats.totalInactive.toString(),
    total: stats.totalUsers.toString(),
  });

  // Summary table — proportional widths that fill 100%
  pdf.addTable(summaryColumns, summaryData, {
    columnStyles: {
      0: { cellWidth: fw * 0.4, halign: "left", fontStyle: "bold" },
      1: { cellWidth: fw * 0.2, halign: "center" },
      2: { cellWidth: fw * 0.2, halign: "center" },
      3: { cellWidth: fw * 0.2, halign: "center" },
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

    pdf.addNewPage();

    pdf.addSectionTitle(`Layer ${layerKey}`);

    pdf.addText(
      `Active: ${activeUsers.length}  |  Inactive: ${inactiveUsers.length}  |  Total: ${activeUsers.length + inactiveUsers.length}`,
      { fontSize: 7.5, color: pdf.theme.muted }
    );

    pdf.addSpace(2);

    const userColStyles = {
      0: { cellWidth: fw * 0.05, halign: "center" },
      1: { cellWidth: fw * 0.18 },
      2: { cellWidth: fw * 0.16 },
      3: { cellWidth: fw * 0.27 },
      4: { cellWidth: fw * 0.14 },
      5: { cellWidth: fw * 0.20 },
    };

    // Active Users
    if (activeUsers.length > 0) {
      pdf.addText("Active Users", {
        fontSize: 8,
        bold: true,
        color: [14, 203, 111],
      });
      pdf.addSpace(1);

      pdf.addTable(USER_COLUMNS, activeUsers, {
        compact: true,
        headerColor: [14, 203, 111],
        columnStyles: userColStyles,
      });

      pdf.addSpace(3);
    }

    // Inactive Users
    if (inactiveUsers.length > 0) {
      pdf.checkPageBreak(20);

      pdf.addText("Inactive Users", {
        fontSize: 8,
        bold: true,
        color: [239, 68, 68],
      });
      pdf.addSpace(1);

      pdf.addTable(USER_COLUMNS, inactiveUsers, {
        compact: true,
        headerColor: [239, 68, 68],
        columnStyles: userColStyles,
      });
    }
  });
};