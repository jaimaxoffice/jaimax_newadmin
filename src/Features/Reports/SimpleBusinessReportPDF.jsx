import React, { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useToast } from "../../reusableComponents/Toasts/ToastContext";
import "react-toastify/dist/ReactToastify.css";
import {
  Download,
  Loader2,
  Users,
  UserX,
  UserCheck,
  UserPlus,
  BarChart3,
  RefreshCw,
  Sliders,
} from "lucide-react";
import {
  useLazyGetUsersWithZeroDirectRefsQuery,
  useLazyGetUsersWithOneToTwoDirectRefsQuery,
  useLazyGetUsersWithThreeToFiveDirectRefsQuery,
  useLazyGetUsersWithSixToNineDirectRefsQuery,
  useLazyGetUsersWithTenToTwentyFiveDirectRefsQuery,
  useLazyGetUsersWithTwentySixToHundredDirectRefsQuery,
  useLazyGetUsersWithCustomDirectRefsRangeQuery,
  useLazyGetInactiveUsersQuery,
} from "./reportsApiSlice";

// ─── Report Card Component ──────────────────────────────────
function ReportCard({
  title,
  titleColor,
  borderColor,
  iconBg,
  icon: Icon,
  btnColor,
  reportType,
  onFetch,
  onDownload,
  cardState,
  customRangeInputs,
  onRangeChange,
  isCustomRange = false,
}) {
  const status = cardState?.status || "idle";
  const count = cardState?.count;

  return (
    <div
      className={`bg-[#282f35] rounded-lg overflow-hidden hover:${borderColor} transition-all duration-300 flex flex-col`}
    >
      <div className="p-5 flex flex-col flex-1">
        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}
          >
            <Icon size={20} className={titleColor} />
          </div>
          <h3 className={`font-semibold text-sm ${titleColor}`}>{title}</h3>
        </div>

        {/* Custom Range Inputs (only for custom direct refs card) */}
        {/* {isCustomRange && status === "idle" && (
          <div className="mb-4 p-3 bg-[#1e2329] rounded-lg border border-violet-500/20">
            <label className="block text-xs text-gray-400 mb-2 font-medium">
              Direct Referrals Range
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Min"
                value={customRangeInputs.min}
                onChange={(e) =>
                  onRangeChange("min", e.target.value)
                }
                className="flex-1 px-3 py-2 bg-[#282f35] border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-violet-500"
                min="0"
              />
              <span className="text-gray-500 text-sm">to</span>
              <input
                type="number"
                placeholder="Max"
                value={customRangeInputs.max}
                onChange={(e) =>
                  onRangeChange("max", e.target.value)
                }
                className="flex-1 px-3 py-2 bg-[#282f35] border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-violet-500"
                min="0"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Enter min and max values to filter users
            </p>
          </div>
        )} */}



        {isCustomRange && status === "idle" && (
          <div className="mb-4 p-3 bg-[#1e2329] rounded-lg border border-violet-500/20">
            <label className="block text-xs text-gray-400 mb-2 font-medium">
              Direct Referrals Range
            </label>

            <div className="flex gap-2 items-center justify-start">
              <input
                type="number"
                placeholder="Min"
                value={customRangeInputs.min}
                onChange={(e) =>
                  onRangeChange("min", e.target.value)
                }
                className="w-24 px-3 py-2 bg-[#282f35] border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-violet-500"
                min="0"
              />

              <span className="text-gray-500 text-sm">to</span>

              <input
                type="number"
                placeholder="Max"
                value={customRangeInputs.max}
                onChange={(e) =>
                  onRangeChange("max", e.target.value)
                }
                className="w-24 px-3 py-2 bg-[#282f35] border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-violet-500"
                min="0"
              />
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Enter min and max values to filter users
            </p>
          </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center mb-4 min-h-[80px]">
          {/* IDLE: prompt user to fetch */}
          {status === "idle" && (
            <p className="text-gray-500 text-xs text-center">
              {isCustomRange ? "Enter range and click below" : "Click below to load  the data"}
            </p>
          )}

          {/* FETCHING: spinner */}
          {status === "fetching" && (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={24} className={`animate-spin ${titleColor}`} />
              <p className="text-gray-400 text-xs">Fetching data...</p>
            </div>
          )}

          {/* READY / DOWNLOADING: show count */}
          {(status === "ready" || status === "downloading") && (
            <div className="w-full rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-white mb-1">{count ?? 0}</p>
              <p className="text-gray-400 text-xs">Users</p>
              {isCustomRange && cardState?.rangeLabel && (
                <p className="text-gray-500 text-xs mt-2">
                  Range: {cardState.rangeLabel}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Buttons ── */}
        {status === "idle" && (
          <button
            onClick={() => onFetch(reportType, isCustomRange ? customRangeInputs : null)}
            disabled={isCustomRange && (!customRangeInputs.min || !customRangeInputs.max)}
            className={`w-full flex items-center justify-center gap-2 ${btnColor}
              text-white font-semibold py-2.5 rounded-lg transition-all duration-200 text-sm cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Get Data
          </button>
        )}

        {status === "fetching" && (
          <button
            disabled
            className="w-full flex items-center justify-center gap-2 bg-gray-600
              text-white font-semibold py-2.5 rounded-lg text-sm opacity-60 cursor-not-allowed"
          >
            <Loader2 size={16} className="animate-spin" />
            Loading...
          </button>
        )}

        {(status === "ready" || status === "downloading") && (
          <button
            onClick={() => onDownload(reportType, isCustomRange ? customRangeInputs : null)}
            disabled={status === "downloading"}
            className={`w-full flex items-center justify-center gap-2 ${btnColor}
              text-white font-semibold py-2.5 rounded-lg transition-all duration-200
              disabled:opacity-50 text-sm cursor-pointer`}
          >
            {status === "downloading" ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download size={16} />
                Download PDF
              </>
            )}
          </button>
        )}


      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────
const SimpleBusinessReportPDF = () => {
  const toast = useToast();

  // cardStates holds per-card state: { status, count, data, rangeLabel }
  const [cardStates, setCardStates] = useState({});

  // Custom range inputs state
  const [customRangeInputs, setCustomRangeInputs] = useState({
    min: "",
    max: "",
  });

  // ── Lazy queries (no auto-fetch on mount) ──
  const [fetchZero] = useLazyGetUsersWithZeroDirectRefsQuery();
  const [fetch1to2] = useLazyGetUsersWithOneToTwoDirectRefsQuery();
  const [fetch3to5] = useLazyGetUsersWithThreeToFiveDirectRefsQuery();
  const [fetch6to9] = useLazyGetUsersWithSixToNineDirectRefsQuery();
  const [fetch10to25] = useLazyGetUsersWithTenToTwentyFiveDirectRefsQuery();
  const [fetch26to100] = useLazyGetUsersWithTwentySixToHundredDirectRefsQuery();
  const [fetchInactive] = useLazyGetInactiveUsersQuery();
  const [fetchCustomRange] = useLazyGetUsersWithCustomDirectRefsRangeQuery();

  const toastConfig = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  // Map reportType → lazy fetch function
  const fetcherMap = {
    inactive: fetchInactive,
    zero: fetchZero,
    "1to2": fetch1to2,
    "3to5": fetch3to5,
    "6to9": fetch6to9,
    "10to25": fetch10to25,
    "26to100": fetch26to100,
  };

  const setCardStatus = (reportType, patch) =>
    setCardStates((prev) => ({
      ...prev,
      [reportType]: { ...(prev[reportType] || {}), ...patch },
    }));

  const handleRangeChange = (field, value) => {
    setCustomRangeInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ── Step 1: Fetch data on first button click ──
  const handleFetch = async (reportType, customRange = null) => {
    setCardStatus(reportType, { status: "fetching" });
    try {
      let result;

      if (reportType === "custom-range") {
        // Validation
        if (!customRange?.min || !customRange?.max) {
          toast.error("Please enter both min and max values", toastConfig);
          setCardStatus(reportType, { status: "idle" });
          return;
        }

        const minVal = parseInt(customRange.min);
        const maxVal = parseInt(customRange.max);

        if (isNaN(minVal) || isNaN(maxVal)) {
          toast.error("Min and max must be valid numbers", toastConfig);
          setCardStatus(reportType, { status: "idle" });
          return;
        }

        if (minVal < 0 || maxVal < 0) {
          toast.error("Min and max must be non-negative", toastConfig);
          setCardStatus(reportType, { status: "idle" });
          return;
        }

        if (minVal > maxVal) {
          toast.error("Min must be less than or equal to max", toastConfig);
          setCardStatus(reportType, { status: "idle" });
          return;
        }

        // ✅ Use RTK Query hook instead of direct fetch
        result = await fetchCustomRange({ min: minVal, max: maxVal });

        if (result.error) {
          throw new Error(result.error?.data?.message || "Failed to fetch custom range data");
        }

        setCardStatus(reportType, {
          status: "ready",
          count: result.data?.data?.length ?? 0,
          data: result.data,
          rangeLabel: `${minVal}-${maxVal}`,
        });
      } else {
        // Original fetch logic for all other reports
        const fetchFunction = fetcherMap[reportType];
        result = await fetchFunction();

        if (result.error) throw result.error;

        setCardStatus(reportType, {
          status: "ready",
          count: result.data?.data?.length ?? 0,
          data: result.data,
        });
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error(
        err.message || "Failed to fetch data. Please try again.",
        toastConfig
      );
      setCardStatus(reportType, { status: "idle" });
    }
  };

  // ── Step 2: Generate & download PDF ──
  const handleDownload = async (reportType, customRange = null) => {
    const cardData = cardStates[reportType];
    if (!cardData?.data) return;

    const META = {
      inactive: {
        title: "Inactive Users Report",
        category: "INACTIVE",
        filename: `inactive-users-report-${new Date().toISOString().split("T")[0]}.pdf`,
      },
      zero: {
        title: "Users with 0 Direct Referrals Report",
        category: "0",
        filename: `users-0-direct-refs-report-${new Date().toISOString().split("T")[0]}.pdf`,
      },
      "1to2": {
        title: "Users with 1-2 Direct Referrals Report",
        category: "1-2",
        filename: `users-1-to-2-direct-refs-report-${new Date().toISOString().split("T")[0]}.pdf`,
      },
      "3to5": {
        title: "Users with 3-5 Direct Referrals Report",
        category: "3-5",
        filename: `users-3-to-5-direct-refs-report-${new Date().toISOString().split("T")[0]}.pdf`,
      },
      "6to9": {
        title: "Users with 6-9 Direct Referrals Report",
        category: "6-9",
        filename: `users-6-to-9-direct-refs-report-${new Date().toISOString().split("T")[0]}.pdf`,
      },
      "10to25": {
        title: "Users with 10-25 Direct Referrals Report",
        category: "10-25",
        filename: `users-10-to-25-direct-refs-report-${new Date().toISOString().split("T")[0]}.pdf`,
      },
      "26to100": {
        title: "Users with 26-100 Direct Referrals Report",
        category: "26-100",
        filename: `users-26-to-100-direct-refs-report-${new Date().toISOString().split("T")[0]}.pdf`,
      },
    };

    try {
      setCardStatus(reportType, { status: "downloading" });

      let title, filename, category;

      if (reportType === "custom-range") {
        const minVal = customRange.min;
        const maxVal = customRange.max;
        title = `Users with ${minVal}-${maxVal} Direct Referrals Report`;
        category = `${minVal}-${maxVal}`;
        filename = `users-${minVal}-to-${maxVal}-direct-refs-report-${new Date()
          .toISOString()
          .split("T")[0]}.pdf`;
      } else {
        const meta = META[reportType];
        title = meta.title;
        category = meta.category;
        filename = meta.filename;
      }

      const pdfDoc = generatePdfReport(
        cardData.data,
        title,
        category,
        reportType,
        customRange
      );
      pdfDoc.save(filename);
      toast.success(`${title} downloaded successfully!`, toastConfig);
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF. Please try again.", toastConfig);
    } finally {
      setCardStatus(reportType, { status: "ready" });
    }
  };

  // ── PDF generation ──
  const generatePdfReport = (data, title, category, reportType, customRange) => {
    const doc = new jsPDF();
    let yPosition = 20;

    const checkAddPage = (requiredSpace = 20) => {
      if (yPosition + requiredSpace > doc.internal.pageSize.height - 20) {
        doc.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };

    doc.setFontSize(18);
    doc.setTextColor(32, 147, 74);
    doc.text(title.toUpperCase(), 105, yPosition, { align: "center" });
    yPosition += 15;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated on: ${new Date().toLocaleDateString("en-GB")}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Total Records: ${data?.data?.length || 0}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Report Type: ${title}`, 20, yPosition);
    yPosition += 15;

    checkAddPage(30);
    doc.setFontSize(14);
    doc.setTextColor(32, 147, 74);
    doc.text("REPORT SUMMARY", 20, yPosition);
    yPosition += 10;

    if (reportType === "inactive" || reportType === "zero") {
      const summaryData = [
        ["Metric", "Value"],
        ["Report Type", title || "N/A"],
        ["Total Users", (data?.data?.length || 0).toString()],
        ["Generated On", new Date().toLocaleDateString("en-GB")],
        ["Generated By", "Admin Portal"],
        ["Status", "Current Data"],
      ];
      autoTable(doc, {
        head: [summaryData[0]],
        body: summaryData.slice(1),
        startY: yPosition,
        theme: "striped",
        headStyles: {
          fillColor: [32, 147, 74],
          textColor: 255,
          fontSize: 10,
          fontStyle: "bold",
        },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 80 } },
      });
    } else {
      const totalUsers = data?.data?.length || 0;
      const totalDirectRefs =
        data?.data?.reduce((sum, u) => sum + (u.directRefs || 0), 0) || 0;
      const totalChainRefs =
        data?.data?.reduce((sum, u) => sum + (u.chainRefs || 0), 0) || 0;
      const totalRefs =
        data?.data?.reduce((sum, u) => sum + (u.totalRefs || 0), 0) || 0;

      const summaryData = [
        ["Metric", "Count/Value"],
        ["Total Users", totalUsers.toString()],
        ["Total Direct Refs Count", totalDirectRefs.toString()],
        ["Total Chain Refs Count", totalChainRefs.toString()],
        ["Overall Total Refs", totalRefs.toString()],
      ];
      autoTable(doc, {
        head: [summaryData[0]],
        body: summaryData.slice(1),
        startY: yPosition,
        theme: "striped",
        headStyles: {
          fillColor: [32, 147, 74],
          textColor: 255,
          fontSize: 10,
          fontStyle: "bold",
        },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 50, halign: "right" } },
      });
    }

    yPosition = doc.lastAutoTable.finalY + 15;

    if (data?.data?.length > 0) {
      checkAddPage(30);
      doc.setFontSize(14);
      doc.setTextColor(32, 147, 74);

      if (reportType === "inactive") {
        doc.text("DETAILED USER DATA", 20, yPosition);
      } else if (reportType === "zero") {
        doc.text("USERS WITH 0 DIRECT REFERRALS", 20, yPosition);
      } else {
        doc.text(`USERS WITH ${category} DIRECT REFERRALS`, 20, yPosition);
      }
      yPosition += 10;

      let tableColumns, tableRows, columnStyles;

      if (reportType === "inactive") {
        tableColumns = ["S.No", "Username", "Name", "Email", "Phone", "Referred By"];
        tableRows = data.data.map((user, i) => [
          (i + 1).toString(),
          user.username || "N/A",
          user.name || "N/A",
          user.email || "N/A",
          user.phone?.toString() || "N/A",
          user.referenceId || "N/A",
        ]);
        columnStyles = {
          0: { cellWidth: 15 },
          1: { cellWidth: 30 },
          2: { cellWidth: 35 },
          3: { cellWidth: 40 },
          4: { cellWidth: 30 },
          5: { cellWidth: 30 },
        };
      } else if (reportType === "zero") {
        tableColumns = ["S.No", "Username", "Name", "Email", "Phone", "Direct Refs", "Status"];
        tableRows = data.data.map((user, i) => [
          (i + 1).toString(),
          user.username || "N/A",
          user.name || "N/A",
          user.email || "N/A",
          user.phone?.toString() || "N/A",
          user.directRefs?.toString() || "0",
          user.isActive ? "Active" : "Inactive",
        ]);
        columnStyles = {
          0: { cellWidth: 15 },
          1: { cellWidth: 30 },
          2: { cellWidth: 35 },
          3: { cellWidth: 35 },
          4: { cellWidth: 25 },
          5: { cellWidth: 20 },
          6: { cellWidth: 20 },
        };
      } else {
        tableColumns = ["S.No", "Name", "Username", "Email", "Phone", "DR", "CR", "TR"];
        tableRows = data.data.map((user, i) => [
          (i + 1).toString(),
          user.name || "N/A",
          user.username || "N/A",
          user.email || "N/A",
          user.phone?.toString() || "N/A",
          user.directRefs?.toString() || "0",
          user.chainRefs?.toString() || "0",
          user.totalRefs?.toString() || "0",
        ]);
        columnStyles = {
          0: { cellWidth: 15 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 35 },
          4: { cellWidth: 25 },
          5: { cellWidth: 15 },
          6: { cellWidth: 15 },
          7: { cellWidth: 15 },
        };
      }

      autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: yPosition,
        theme: "striped",
        headStyles: {
          fillColor: [32, 147, 74],
          textColor: 255,
          fontSize:
            reportType === "inactive" || reportType === "zero" ? 9 : 8,
          fontStyle: "bold",
        },
        styles: {
          fontSize:
            reportType === "inactive" || reportType === "zero" ? 8 : 7,
          cellPadding: 2,
        },
        columnStyles,
        didDrawPage: (data) => {
          doc.setFontSize(8);
          doc.setTextColor(100);
          doc.text(
            `Page ${doc.internal.getNumberOfPages()}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
        },
      });

      yPosition = doc.lastAutoTable.finalY + 15;
    }

    if (
      (reportType === "inactive" || reportType === "zero") &&
      data?.data?.length > 0
    ) {
      checkAddPage(20);
      doc.setFontSize(14);
      doc.setTextColor(32, 147, 74);
      doc.text("INSIGHTS", 20, yPosition);
      yPosition += 10;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      const insights =
        reportType === "inactive"
          ? [
            `• Total inactive users identified: ${data.data.length}`,
            `• These users may require re-engagement campaigns`,
            `• Consider targeted marketing strategies to reactivate these users`,
            `• Analyze user behavior patterns to understand inactivity reasons`,
            `• Implement automated email sequences for user re-activation`,
          ]
          : [
            `• Total active users with 0 direct referrals: ${data.data.length}`,
            `• These users are active but haven't made any referrals yet`,
            `• Consider providing referral incentives and training to these users`,
            `• Implement onboarding programs to educate about referral benefits`,
            `• Target these users with referral tutorials and success stories`,
          ];

      insights.forEach((insight) => {
        checkAddPage(8);
        doc.text(insight, 20, yPosition);
        yPosition += 6;
      });
    }

    return doc;
  };

  const REPORT_CARDS = [
    {
      title: "Inactive Users",
      reportType: "inactive",
      btnColor: "bg-red-500 hover:bg-red-600",
      titleColor: "text-red-400",
      borderColor: "border-red-500/30",
      iconBg: "bg-red-500/10",
      icon: UserX,
      isCustomRange: false,
    },
    {
      title: "0 Direct Referrals",
      reportType: "zero",
      btnColor: "bg-gray-500 hover:bg-gray-600",
      titleColor: "text-gray-400",
      borderColor: "border-gray-500/30",
      iconBg: "bg-gray-500/10",
      icon: Users,
      isCustomRange: false,
    },
    {
      title: "1-2 Direct Referrals",
      reportType: "1to2",
      btnColor: "bg-cyan-500 hover:bg-cyan-600",
      titleColor: "text-cyan-400",
      borderColor: "border-cyan-500/30",
      iconBg: "bg-cyan-500/10",
      icon: UserPlus,
      isCustomRange: false,
    },
    {
      title: "3-5 Direct Referrals",
      reportType: "3to5",
      btnColor: "bg-blue-500 hover:bg-blue-600",
      titleColor: "text-blue-400",
      borderColor: "border-blue-500/30",
      iconBg: "bg-blue-500/10",
      icon: UserCheck,
      isCustomRange: false,
    },
    {
      title: "6-9 Direct Referrals",
      reportType: "6to9",
      btnColor: "bg-yellow-500 hover:bg-yellow-600",
      titleColor: "text-yellow-400",
      borderColor: "border-yellow-500/30",
      iconBg: "bg-yellow-500/10",
      icon: UserCheck,
      isCustomRange: false,
    },
    {
      title: "10-25 Direct Referrals",
      reportType: "10to25",
      btnColor: "bg-orange-500 hover:bg-orange-600",
      titleColor: "text-orange-400",
      borderColor: "border-orange-500/30",
      iconBg: "bg-orange-500/10",
      icon: UserCheck,
      isCustomRange: false,
    },
    {
      title: "26-100 Direct Referrals",
      reportType: "26to100",
      btnColor: "bg-green-500 hover:bg-green-600",
      titleColor: "text-green-400",
      borderColor: "border-green-500/30",
      iconBg: "bg-green-500/10",
      icon: UserCheck,
      isCustomRange: false,
    },
    {
      title: "Custom Direct Referrals Range",
      reportType: "custom-range",
      btnColor: "bg-violet-500 hover:bg-violet-600",
      titleColor: "text-violet-400",
      borderColor: "border-violet-500/30",
      iconBg: "bg-violet-500/10",
      icon: Sliders,
      isCustomRange: true,
    },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-[#1a1f24]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[#b9fd5c]/10 flex items-center justify-center">
          <BarChart3 size={24} className="text-[#b9fd5c]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Business Performance Reports</h1>
          <p className="text-sm text-gray-400">
            Click "Load Data" on any card to fetch users, then download the PDF report. Use custom range for flexible filtering.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_CARDS.map((card) => (
          <ReportCard
            key={card.reportType}
            {...card}
            cardState={cardStates[card.reportType]}
            onFetch={handleFetch}
            onDownload={handleDownload}
            customRangeInputs={customRangeInputs}
            onRangeChange={handleRangeChange}
          />
        ))}
      </div>
    </div>
  );
};

export default SimpleBusinessReportPDF;









