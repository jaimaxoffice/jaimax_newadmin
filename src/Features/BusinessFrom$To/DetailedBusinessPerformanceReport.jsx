// DetailedBusinessPerformanceReport.jsx
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Modal, Button } from "react-bootstrap";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Reusable Components
import Table from "../../reusableComponents/Tables/Table";
import Pagination from "../../reusableComponents/paginations/Pagination";
import StatCard from "../../reusableComponents/StatCards/StatsCard";
import MobileCard from "../../reusableComponents/MobileCards/MobileCards";
import MobileCardList from "../../reusableComponents/MobileCards/MobileCardList";

import {
  useGetUserBusinessDirectRefsMutation,
  useGetDetailedDirectChainUsersBusinessMutation,
} from "./getBusinessReportFromToApiSlice";

const DetailedBusinessPerformanceReport = () => {
  const [username, setUsername] = useState("");
  const [excludedDirectUsers, setExcludedDirectUsers] = useState([]);
  const [excludedChainUsers, setExcludedChainUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [activeTab, setActiveTab] = useState("direct");

  // Pagination & Search states
  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
  });

  const [getRefs] = useGetUserBusinessDirectRefsMutation();
  const [getDetailedReport] = useGetDetailedDirectChainUsersBusinessMutation();

  const toastConfig = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  // Reset all states
  const resetStates = () => {
    setUser(null);
    setExcludedDirectUsers([]);
    setExcludedChainUsers([]);
    setReportData(null);
    setShowReportModal(false);
    setActiveTab("direct");
    setState({ currentPage: 1, perPage: 10, search: "" });
  };

  // Filter referrals based on search
  const filterReferralsData = (referralsData, searchQuery) => {
    if (!searchQuery.trim()) return referralsData || [];
    const query = searchQuery.toLowerCase().trim();
    return (
      referralsData?.filter(
        (u) =>
          u.name?.toLowerCase().includes(query) ||
          u.username?.toLowerCase().includes(query) ||
          u.email?.toLowerCase().includes(query)
      ) || []
    );
  };

  // Get current tab's filtered data
  const getCurrentFilteredData = () => {
    const sourceData =
      activeTab === "direct" ? user?.directReferrals : user?.chainReferrals;
    return filterReferralsData(sourceData, state.search);
  };

  const filteredData = user ? getCurrentFilteredData() : [];
  const totalFiltered = filteredData.length;

  // Paginate the filtered data
  const paginatedData = filteredData.slice(
    (state.currentPage - 1) * state.perPage,
    state.currentPage * state.perPage
  );

  // Stats computation
  const getStats = () => {
    if (!user) return null;
    const directCount = user.directReferrals?.length || 0;
    const chainCount = user.chainReferrals?.length || 0;
    const excludedDirectCount = excludedDirectUsers.length;
    const excludedChainCount = excludedChainUsers.length;
    return {
      directCount,
      chainCount,
      excludedDirectCount,
      excludedChainCount,
      totalReferrals: directCount + chainCount,
      includedTotal:
        directCount -
        excludedDirectCount +
        (chainCount - excludedChainCount),
    };
  };

  const stats = getStats();

  // Form for username input
  const formik = useFormik({
    initialValues: { username: "" },
    validationSchema: Yup.object({
      username: Yup.string().required("Username is required"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        resetStates();
        setUsername(values.username);
        const res = await getRefs(values.username).unwrap();
        setUser(res.data);
        toast.success("User referrals fetched successfully!", toastConfig);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error(
          "Failed to fetch referrals data. Please try again.",
          toastConfig
        );
        resetStates();
      } finally {
        setLoading(false);
      }
    },
  });

  // Report form
  const reportFormik = useFormik({
    initialValues: {},
    onSubmit: async () => {
      await handleGenerateReport();
    },
  });

  // Reset when username input changes
  useEffect(() => {
    if (formik.values.username !== username) {
      resetStates();
    }
  }, [formik.values.username, username]);

  // Reset pagination & search when switching tabs
  useEffect(() => {
    setState((prev) => ({ ...prev, currentPage: 1, search: "" }));
  }, [activeTab]);

  const toggleExcludedDirect = (uname) => {
    setExcludedDirectUsers((prev) =>
      prev.includes(uname)
        ? prev.filter((u) => u !== uname)
        : [...prev, uname]
    );
  };

  const toggleExcludedChain = (uname) => {
    setExcludedChainUsers((prev) =>
      prev.includes(uname)
        ? prev.filter((u) => u !== uname)
        : [...prev, uname]
    );
  };

  const handleShowReport = () => {
    if (!user) return;
    setReportData(null);
    reportFormik.resetForm();
    setShowReportModal(true);
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const payload = {
        username,
        excludedDirectUsers: excludedDirectUsers || [],
        excludedChainUsers: excludedChainUsers || [],
      };
      const response = await getDetailedReport(payload).unwrap();
      setReportData(response);
      toast.success("Detailed report generated successfully!", toastConfig);
    } catch (error) {
      console.error("Report generation error:", error);
      toast.error(
        "Failed to generate detailed report. Please try again.",
        toastConfig
      );
    } finally {
      setLoading(false);
    }
  };

  // Search handler with debounce
  let searchTimeout;
  const handleSearch = (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        search: e.target.value,
        currentPage: 1,
      }));
    }, 500);
  };

  const handlePageChange = (page) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  };

  // Exclude checkbox component
  const ExcludeCheckbox = ({ data }) => {
    const isChain = activeTab === "chain";
    const excludedList = isChain ? excludedChainUsers : excludedDirectUsers;
    const toggleFn = isChain ? toggleExcludedChain : toggleExcludedDirect;

    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={excludedList.includes(data.username)}
          onChange={() => toggleFn(data.username)}
          className="w-4 h-4 rounded border-[#2a2c2f] accent-[#eb660f] 
                     cursor-pointer"
        />
        <span
          className={`text-xs ${
            excludedList.includes(data.username)
              ? "text-red-400 line-through"
              : "text-[#8a8d93]"
          }`}
        >
          {excludedList.includes(data.username) ? "Excluded" : "Include"}
        </span>
      </label>
    );
  };

  // Status style for excluded/included
  const getExclusionStyle = (uname) => {
    const isChain = activeTab === "chain";
    const excludedList = isChain ? excludedChainUsers : excludedDirectUsers;
    return excludedList.includes(uname)
      ? "bg-red-500/10 text-red-400"
      : "bg-[#0ecb6f]/10 text-[#0ecb6f]";
  };

  const getExclusionLabel = (uname) => {
    const isChain = activeTab === "chain";
    const excludedList = isChain ? excludedChainUsers : excludedDirectUsers;
    return excludedList.includes(uname) ? "Excluded" : "Included";
  };

  // Desktop Table Columns
  const columns = [
    {
      header: "S.No",
      render: (_, index, currentPage, perPage) =>
        currentPage * perPage - (perPage - 1) + index + ".",
    },
    { header: "Name", accessor: "name" },
    { header: "Username", accessor: "username" },
    {
      header: "Email",
      render: (row) => (
        <span className="text-xs text-[#8a8d93] truncate max-w-45 inline-block">
          {row.email || "N/A"}
        </span>
      ),
    },
    {
      header: "Phone",
      render: (row) => row.phone || "N/A",
    },
    {
      header: "Status",
      render: (row) => (
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full 
                      ${getExclusionStyle(row.username)}`}
        >
          {getExclusionLabel(row.username)}
        </span>
      ),
    },
    {
      header: "Exclude",
      render: (row) => <ExcludeCheckbox data={row} />,
    },
  ];

  // Mobile Card Renderer
  const renderReferralCard = (row, index) => {
    const sNo =
      state.currentPage * state.perPage - (state.perPage - 1) + index;
    const isChain = activeTab === "chain";
    const excludedList = isChain ? excludedChainUsers : excludedDirectUsers;
    const isExcluded = excludedList.includes(row.username);
    const toggleFn = isChain ? toggleExcludedChain : toggleExcludedDirect;

    return (
      <MobileCard
        key={row.username || index}
        header={{
          avatar: row.name?.charAt(0)?.toUpperCase(),
          avatarBg: isExcluded
            ? "bg-red-500/10 text-red-400"
            : "bg-[#eb660f]/10 text-[#eb660f]",
          title: row.name || "N/A",
          subtitle: `#${sNo} • ${row.username}`,
          badge: isExcluded ? "Excluded" : "Included",
          badgeClass: isExcluded
            ? "bg-red-500/10 text-red-400"
            : "bg-[#0ecb6f]/10 text-[#0ecb6f]",
        }}
        rows={[
          { label: "Username", value: row.username },
          { label: "Email", value: row.email || "N/A" },
          { label: "Phone", value: row.phone || "N/A" },
          {
            label: "Type",
            value: activeTab === "direct" ? "Direct Referral" : "Chain Referral",
          },
        ]}
        actions={[
          {
            label: isExcluded ? "Include User" : "Exclude User",
            onClick: () => toggleFn(row.username),
            className: isExcluded
              ? "text-[#0ecb6f] hover:bg-[#0ecb6f]/5"
              : "text-red-400 hover:bg-red-500/5",
          },
        ]}
      />
    );
  };

  // PDF Generation (unchanged logic)
  const generateDetailedBusinessReportPdf = () => {
    if (!user || !reportData) return null;

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

    // Header
    doc.setFontSize(18);
    doc.setTextColor(32, 147, 74);
    doc.text("DETAILED BUSINESS PERFORMANCE REPORT", 105, yPosition, {
      align: "center",
    });
    yPosition += 15;

    // User Info
    doc.setFontSize(14);
    doc.setTextColor(32, 147, 74);
    doc.text("USER INFORMATION", 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    const userInfo = [
      [`Name: ${user.name}`, `Phone: ${user.phone || "N/A"}`],
      [`Username: ${user.username}`, `Email: ${user.email}`],
    ];

    userInfo.forEach((row) => {
      checkAddPage();
      doc.text(row[0], 20, yPosition);
      doc.text(row[1], 105, yPosition);
      yPosition += 6;
    });

    yPosition += 10;

    checkAddPage();
    doc.setFontSize(14);
    doc.setTextColor(32, 147, 74);
    doc.text("REPORT DETAILS", 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `Generated on: ${new Date().toLocaleDateString("en-GB")}`,
      20,
      yPosition
    );
    yPosition += 15;

    // Direct Referrals Table
    if (reportData.data?.directUserBusinessPerformance?.length > 0) {
      checkAddPage(30);
      doc.setFontSize(14);
      doc.setTextColor(32, 147, 74);
      doc.text("DIRECT REFERRALS", 20, yPosition);
      yPosition += 10;

      const directTableColumns = [
        "S.No",
        "Name",
        "Username",
        "Email",
        "Phone",
        "DR",
        "CR",
        "TR",
      ];

      const directTableRows = reportData.data.directUserBusinessPerformance
        .filter((u) => !excludedDirectUsers.includes(u.username))
        .map((u, index) => [
          (index + 1).toString(),
          u.name || "N/A",
          u.username || "N/A",
          u.email || "N/A",
          u.phone?.toString() || "N/A",
          u.directRefs?.toString() || "0",
          u.chainRefs?.toString() || "0",
          u.totalRefs?.toString() || "0",
        ]);

      autoTable(doc, {
        head: [directTableColumns],
        body: directTableRows,
        startY: yPosition,
        theme: "striped",
        headStyles: {
          fillColor: [32, 147, 74],
          textColor: 255,
          fontSize: 8,
          fontStyle: "bold",
        },
        styles: { fontSize: 7, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 35 },
          4: { cellWidth: 25 },
          5: { cellWidth: 15 },
          6: { cellWidth: 15 },
          7: { cellWidth: 15 },
        },
      });

      yPosition = doc.lastAutoTable.finalY + 15;
    }

    // Chain Referrals Table
    if (reportData.data?.chainUserBusinessPerformance?.length > 0) {
      checkAddPage(30);
      doc.setFontSize(14);
      doc.setTextColor(32, 147, 74);
      doc.text("CHAIN REFERRALS", 20, yPosition);
      yPosition += 10;

      const chainTableColumns = [
        "S.No",
        "Name",
        "Username",
        "Email",
        "Phone",
        "DR",
        "CR",
        "TR",
      ];

      const chainTableRows = reportData.data.chainUserBusinessPerformance
        .filter((u) => !excludedChainUsers.includes(u.username))
        .map((u, index) => [
          (index + 1).toString(),
          u.name || "N/A",
          u.username || "N/A",
          u.email || "N/A",
          u.phone?.toString() || "N/A",
          u.directRefs?.toString() || "0",
          u.chainRefs?.toString() || "0",
          u.totalRefs?.toString() || "0",
        ]);

      autoTable(doc, {
        head: [chainTableColumns],
        body: chainTableRows,
        startY: yPosition,
        theme: "striped",
        headStyles: {
          fillColor: [32, 147, 74],
          textColor: 255,
          fontSize: 8,
          fontStyle: "bold",
        },
        styles: { fontSize: 7, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 35 },
          4: { cellWidth: 25 },
          5: { cellWidth: 15 },
          6: { cellWidth: 15 },
          7: { cellWidth: 15 },
        },
      });
    }

    // Summary
    yPosition = doc.lastAutoTable
      ? doc.lastAutoTable.finalY + 15
      : yPosition + 15;
    checkAddPage(40);

    doc.setFontSize(14);
    doc.setTextColor(32, 147, 74);
    doc.text("SUMMARY STATISTICS", 20, yPosition);
    yPosition += 10;

    const totalDirectUsers =
      reportData.data?.directUserBusinessPerformance?.filter(
        (u) => !excludedDirectUsers.includes(u.username)
      ).length || 0;

    const totalChainUsers =
      reportData.data?.chainUserBusinessPerformance?.filter(
        (u) => !excludedChainUsers.includes(u.username)
      ).length || 0;

    const totalDirectRefs =
      reportData.data?.directUserBusinessPerformance
        ?.filter((u) => !excludedDirectUsers.includes(u.username))
        ?.reduce((sum, u) => sum + (u.directRefs || 0), 0) || 0;

    const totalChainRefs =
      reportData.data?.chainUserBusinessPerformance
        ?.filter((u) => !excludedChainUsers.includes(u.username))
        ?.reduce((sum, u) => sum + (u.chainRefs || 0), 0) || 0;

    const summaryData = [
      ["Metric", "Count/Value"],
      ["Total Direct Referrals", totalDirectUsers.toString()],
      ["Total Chain Referrals", totalChainUsers.toString()],
      ["Total Direct Refs Count", totalDirectRefs.toString()],
      ["Total Chain Refs Count", totalChainRefs.toString()],
      [
        "Overall Total Users",
        (totalDirectUsers + totalChainUsers).toString(),
      ],
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
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 50, halign: "right" },
      },
    });

    return doc;
  };

  const handlePdfGeneration = async () => {
    try {
      setPdfLoading(true);
      const pdfDoc = generateDetailedBusinessReportPdf();
      if (pdfDoc) {
        const filename = `detailed-business-performance-${user.name.replace(
          /\s+/g,
          "-"
        )}-${new Date().toISOString().split("T")[0]}.pdf`;
        pdfDoc.save(filename);
        toast.success(
          "PDF report generated and downloaded successfully!",
          toastConfig
        );
        setShowReportModal(false);
      } else {
        throw new Error("Failed to generate PDF content");
      }
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error(
        "Failed to generate PDF report. Please try again.",
        toastConfig
      );
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <>
      <div className="p-2 sm:p-2 space-y-6">
        {/* ─── Header & Username Search ─── */}
        <div className="bg-[#1b232d] border border-[#1b232d] rounded-2xl overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
            <h1 className="text-lg font-semibold text-white">
              Detailed Business Performance Report
            </h1>
            {user && (
              <p className="text-[#eb660f] text-sm mt-1">
                User: {user.name} ({user.username})
              </p>
            )}
          </div>

          <div className="px-4 sm:px-6 py-4">
            <form
              onSubmit={formik.handleSubmit}
              className="flex flex-col sm:flex-row items-start sm:items-end gap-3"
            >
              <div className="w-full sm:w-64">
                <label className="block text-sm text-[#8a8d93] mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  autoComplete="off"
                  onChange={formik.handleChange}
                  value={formik.values.username}
                  placeholder="Enter username..."
                  className="bg-[#111214] border border-[#2a2c2f] text-white 
                             placeholder-[#555] rounded-xl py-2.5 px-4 text-sm 
                             focus:outline-none focus:border-[#eb660f] 
                             focus:ring-1 focus:ring-[#eb660f]/50 
                             transition-colors w-full"
                />
                {formik.errors.username && formik.touched.username && (
                  <p className="text-red-400 text-xs mt-1">
                    {formik.errors.username}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#eb660f] hover:bg-[#d25400] text-white 
                           font-semibold py-2.5 px-6 rounded-xl text-sm 
                           transition-all duration-200 disabled:opacity-50 
                           disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? "Loading..." : "Fetch Referrals"}
              </button>
            </form>
          </div>
        </div>

        {/* ─── Main Content (shown after user data is fetched) ─── */}
        {user && (
          <>
            {/* Stat Cards */}
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Direct Referrals"
                  value={stats.directCount}
                  valueClass="text-[#eb660f]"
                />
                <StatCard
                  title="Chain Referrals"
                  value={stats.chainCount}
                  valueClass="text-blue-400"
                />
                <StatCard
                  title="Excluded Users"
                  value={
                    stats.excludedDirectCount + stats.excludedChainCount
                  }
                  valueClass="text-red-400"
                />
                <StatCard
                  title="Included in Report"
                  value={stats.includedTotal}
                  valueClass="text-[#0ecb6f]"
                />
              </div>
            )}

            {/* Controls Row: Per Page, Tab Switcher, Search, Generate Button */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Per Page */}
              <select
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    perPage: Number(e.target.value),
                    currentPage: 1,
                  }))
                }
                value={state.perPage}
                className="bg-[#111214] border border-[#2a2c2f] text-white 
                           rounded-xl py-2.5 px-3 text-sm focus:outline-none 
                           focus:border-[#eb660f] transition-colors cursor-pointer"
              >
                <option value="10">10</option>
                <option value="30">30</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>

              {/* Tab Switcher */}
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="bg-[#111214] border border-[#2a2c2f] text-white 
                           rounded-xl py-2.5 px-3 text-sm focus:outline-none 
                           focus:border-[#eb660f] transition-colors cursor-pointer"
              >
                <option value="direct">
                  Direct Referrals ({user.directReferrals?.length || 0})
                </option>
                <option value="chain">
                  Chain Referrals ({user.chainReferrals?.length || 0})
                </option>
              </select>

              {/* Search */}
              <input
                type="text"
                autoComplete="off"
                placeholder="Search by name, username, email..."
                onChange={handleSearch}
                className="bg-[#111214] border border-[#2a2c2f] text-white 
                           placeholder-[#555] rounded-xl py-2.5 px-4 text-sm 
                           focus:outline-none focus:border-[#eb660f] 
                           focus:ring-1 focus:ring-[#eb660f]/50 
                           transition-colors w-full sm:w-64"
              />

              {/* Generate Report Button */}
              <button
                onClick={handleShowReport}
                className="bg-[#eb660f] hover:bg-[#d25400] text-white 
                           font-semibold py-2.5 px-5 rounded-xl text-sm 
                           transition-all duration-200 ml-auto cursor-pointer"
              >
                Generate Report
              </button>
            </div>

            {/* ─── Table Section ─── */}
            <div className="bg-[#1b232d] border border-[#1b232d] rounded-2xl overflow-hidden">
              {/* Table Header */}
              <div className="px-4 sm:px-6 py-4 border-b border-[#2a2c2f]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-white">
                    {activeTab === "direct"
                      ? "Direct Referrals"
                      : "Chain Referrals"}
                  </h2>
                  <span className="text-xs text-[#8a8d93]">
                    Showing {paginatedData.length} of {totalFiltered} users
                    {state.search && (
                      <span className="text-yellow-400 ml-1">(filtered)</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block">
                <Table
                  columns={columns}
                  data={paginatedData}
                  isLoading={loading}
                  currentPage={state.currentPage}
                  perPage={state.perPage}
                />
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden">
                <MobileCardList
                  data={paginatedData}
                  isLoading={loading}
                  renderCard={renderReferralCard}
                  emptyMessage="No referrals found"
                />
              </div>
            </div>

            {/* Pagination */}
            {totalFiltered > 0 && (
              <Pagination
                currentPage={state.currentPage}
                totalPages={
                  Math.ceil(totalFiltered / state.perPage) || 1
                }
                onPageChange={handlePageChange}
              />
            )}

            {/* ─── Excluded Users Summary ─── */}
            {(excludedDirectUsers.length > 0 ||
              excludedChainUsers.length > 0) && (
              <div className="bg-[#1b232d] border border-[#2a2c2f] rounded-2xl overflow-hidden">
                <div className="px-4 sm:px-6 py-3 border-b border-[#2a2c2f] bg-red-500/10">
                  <h3 className="text-sm font-semibold text-red-400">
                    Excluded Users Summary (
                    {excludedDirectUsers.length + excludedChainUsers.length})
                  </h3>
                </div>
                <div className="px-4 sm:px-6 py-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {excludedDirectUsers.length > 0 && (
                      <div className="flex-1">
                        <p className="text-xs text-[#8a8d93] mb-2">
                          Direct Referrals ({excludedDirectUsers.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {excludedDirectUsers.map((uname) => (
                            <span
                              key={uname}
                              className="inline-flex items-center gap-1.5 
                                         bg-red-500/10 text-red-400 
                                         text-[11px] font-medium px-2.5 py-1 
                                         rounded-full"
                            >
                              {uname}
                              <button
                                onClick={() => toggleExcludedDirect(uname)}
                                className="hover:text-red-300 
                                           transition-colors text-xs 
                                           cursor-pointer"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {excludedChainUsers.length > 0 && (
                      <div className="flex-1">
                        <p className="text-xs text-[#8a8d93] mb-2">
                          Chain Referrals ({excludedChainUsers.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {excludedChainUsers.map((uname) => (
                            <span
                              key={uname}
                              className="inline-flex items-center gap-1.5 
                                         bg-yellow-500/10 text-yellow-400 
                                         text-[11px] font-medium px-2.5 py-1 
                                         rounded-full"
                            >
                              {uname}
                              <button
                                onClick={() => toggleExcludedChain(uname)}
                                className="hover:text-yellow-300 
                                           transition-colors text-xs 
                                           cursor-pointer"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── Report Generation Modal ─── */}
      <Modal
        show={showReportModal}
        onHide={() => setShowReportModal(false)}
        size="lg"
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header
          closeButton
          style={{
            backgroundColor: "#1b232d",
            borderBottom: "1px solid #2a2c2f",
          }}
        >
          <Modal.Title className="text-white text-base">
            Generate Detailed Business Performance Report
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#1b232d", color: "#fff" }}>
          <form onSubmit={reportFormik.handleSubmit}>
            <div className="space-y-4">
              {/* User Summary */}
              <div className="bg-[#111214] border border-[#2a2c2f] rounded-xl p-4">
                <p className="text-sm text-[#8a8d93] mb-1">
                  Generating report for:
                </p>
                <p className="text-white font-semibold">
                  {user?.name} ({user?.username})
                </p>
              </div>

              {/* Exclusion Preview */}
              {(excludedDirectUsers.length > 0 ||
                excludedChainUsers.length > 0) && (
                <div className="bg-[#111214] border border-[#2a2c2f] rounded-xl p-4">
                  <p className="text-sm text-yellow-400 font-medium mb-3">
                    Users excluded from report:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {excludedDirectUsers.length > 0 && (
                      <div className="flex-1">
                        <p className="text-xs text-[#8a8d93] mb-1.5">
                          Direct Referrals:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {excludedDirectUsers.map((uname) => (
                            <span
                              key={uname}
                              className="bg-red-500/10 text-red-400 
                                         text-[11px] font-medium px-2.5 
                                         py-1 rounded-full"
                            >
                              {uname}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {excludedChainUsers.length > 0 && (
                      <div className="flex-1">
                        <p className="text-xs text-[#8a8d93] mb-1.5">
                          Chain Referrals:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {excludedChainUsers.map((uname) => (
                            <span
                              key={uname}
                              className="bg-yellow-500/10 text-yellow-400 
                                         text-[11px] font-medium px-2.5 
                                         py-1 rounded-full"
                            >
                              {uname}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Report Data Preview */}
              {reportData && (
                <div className="bg-[#111214] border border-[#0ecb6f]/30 rounded-xl p-4">
                  <p className="text-sm text-[#0ecb6f] font-medium mb-3">
                    ✓ Report generated successfully
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#1b232d] rounded-lg p-3 text-center">
                      <p className="text-xs text-[#8a8d93]">
                        Direct Users
                      </p>
                      <p className="text-lg font-bold text-[#eb660f]">
                        {reportData.data?.directUserBusinessPerformance
                          ?.filter(
                            (u) =>
                              !excludedDirectUsers.includes(u.username)
                          ).length || 0}
                      </p>
                    </div>
                    <div className="bg-[#1b232d] rounded-lg p-3 text-center">
                      <p className="text-xs text-[#8a8d93]">
                        Chain Users
                      </p>
                      <p className="text-lg font-bold text-blue-400">
                        {reportData.data?.chainUserBusinessPerformance
                          ?.filter(
                            (u) =>
                              !excludedChainUsers.includes(u.username)
                          ).length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer
          style={{
            backgroundColor: "#1b232d",
            borderTop: "1px solid #2a2c2f",
          }}
        >
          <Button
            variant="secondary"
            onClick={() => setShowReportModal(false)}
            style={{
              backgroundColor: "#2a2c2f",
              border: "1px solid #3a3a3a",
              color: "#8a8d93",
            }}
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={reportFormik.handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: "#eb660f",
              border: "1px solid #eb660f",
            }}
          >
            {loading ? "Generating..." : "Generate Report"}
          </Button>
          {reportData && (
            <Button
              variant="success"
              onClick={handlePdfGeneration}
              disabled={pdfLoading}
              style={{
                backgroundColor: "#0ecb6f",
                border: "1px solid #0ecb6f",
              }}
            >
              {pdfLoading ? "Generating PDF..." : "📄 Download PDF"}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DetailedBusinessPerformanceReport;