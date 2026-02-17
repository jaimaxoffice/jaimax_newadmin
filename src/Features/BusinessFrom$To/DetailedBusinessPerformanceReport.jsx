import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Search,
  X,
  Loader2,
  Download,
  FileText,
  Users,
  Link2,
  BarChart3,
  UserX,
  AlertTriangle,
} from "lucide-react";
import {
  useGetUserBusinessDirectRefsMutation,
  useGetDetailedDirectChainUsersBusinessMutation,
} from "./businessApiSlice";

const inputClass = `w-full bg-[#1b232d] border border-[#303f50] text-white rounded-lg 
  px-4 py-2.5 text-sm focus:outline-none focus:border-[#eb660f] 
  focus:ring-1 focus:ring-[#eb660f]/50 transition-colors duration-200
  placeholder-gray-500 disabled:opacity-50`;

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
  const [directSearchQuery, setDirectSearchQuery] = useState("");
  const [chainSearchQuery, setChainSearchQuery] = useState("");

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

  const resetStates = () => {
    setUser(null);
    setExcludedDirectUsers([]);
    setExcludedChainUsers([]);
    setReportData(null);
    setShowReportModal(false);
    setActiveTab("direct");
    setDirectSearchQuery("");
    setChainSearchQuery("");
  };

  const filterReferralsData = (referralsData, searchQuery) => {
    if (!searchQuery.trim()) return referralsData;
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

  const filteredDirectReferrals = filterReferralsData(
    user?.directReferrals,
    directSearchQuery
  );
  const filteredChainReferrals = filterReferralsData(
    user?.chainReferrals,
    chainSearchQuery
  );

  const reportFormik = useFormik({
    initialValues: {},
    onSubmit: async () => {
      await handleGenerateReport();
    },
  });

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
        toast.error("Failed to fetch referrals data.", toastConfig);
        resetStates();
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (formik.values.username !== username) resetStates();
  }, [formik.values.username, username]);

  useEffect(() => {
    if (activeTab === "direct") setChainSearchQuery("");
    else setDirectSearchQuery("");
  }, [activeTab]);

  const toggleExcludedDirect = (uname) => {
    setExcludedDirectUsers((prev) =>
      prev.includes(uname) ? prev.filter((u) => u !== uname) : [...prev, uname]
    );
  };

  const toggleExcludedChain = (uname) => {
    setExcludedChainUsers((prev) =>
      prev.includes(uname) ? prev.filter((u) => u !== uname) : [...prev, uname]
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
      toast.error("Failed to generate detailed report.", toastConfig);
    } finally {
      setLoading(false);
    }
  };

  // ─── PDF Generation (kept exactly the same) ────────────────
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

    doc.setFontSize(18);
    doc.setTextColor(32, 147, 74);
    doc.text("DETAILED BUSINESS PERFORMANCE REPORT", 105, yPosition, {
      align: "center",
    });
    yPosition += 15;

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
    doc.text(`Generated on: ${new Date().toLocaleDateString("en-GB")}`, 20, yPosition);
    yPosition += 15;

    if (reportData.data?.directUserBusinessPerformance?.length > 0) {
      checkAddPage(30);
      doc.setFontSize(14);
      doc.setTextColor(32, 147, 74);
      doc.text("DIRECT REFERRALS", 20, yPosition);
      yPosition += 10;

      const directRows = reportData.data.directUserBusinessPerformance
        .filter((u) => !excludedDirectUsers.includes(u.username))
        .map((u, i) => [
          (i + 1).toString(), u.name || "N/A", u.username || "N/A",
          u.email || "N/A", u.phone?.toString() || "N/A",
          u.directRefs?.toString() || "0", u.chainRefs?.toString() || "0",
          u.totalRefs?.toString() || "0",
        ]);

      autoTable(doc, {
        head: [["S.No", "Name", "Username", "Email", "Phone", "DR", "CR", "TR"]],
        body: directRows,
        startY: yPosition,
        theme: "striped",
        headStyles: { fillColor: [32, 147, 74], textColor: 255, fontSize: 8, fontStyle: "bold" },
        styles: { fontSize: 7, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 15 }, 1: { cellWidth: 30 }, 2: { cellWidth: 30 },
          3: { cellWidth: 35 }, 4: { cellWidth: 25 }, 5: { cellWidth: 15 },
          6: { cellWidth: 15 }, 7: { cellWidth: 15 },
        },
        didDrawPage: (data) => {
          doc.setFontSize(8);
          doc.setTextColor(100);
          doc.text("Page " + doc.internal.getNumberOfPages(), data.settings.margin.left, doc.internal.pageSize.height - 10);
        },
      });
      yPosition = doc.lastAutoTable.finalY + 15;
    }

    if (reportData.data?.chainUserBusinessPerformance?.length > 0) {
      checkAddPage(30);
      doc.setFontSize(14);
      doc.setTextColor(32, 147, 74);
      doc.text("CHAIN REFERRALS", 20, yPosition);
      yPosition += 10;

      const chainRows = reportData.data.chainUserBusinessPerformance
        .filter((u) => !excludedChainUsers.includes(u.username))
        .map((u, i) => [
          (i + 1).toString(), u.name || "N/A", u.username || "N/A",
          u.email || "N/A", u.phone?.toString() || "N/A",
          u.directRefs?.toString() || "0", u.chainRefs?.toString() || "0",
          u.totalRefs?.toString() || "0",
        ]);

      autoTable(doc, {
        head: [["S.No", "Name", "Username", "Email", "Phone", "DR", "CR", "TR"]],
        body: chainRows,
        startY: yPosition,
        theme: "striped",
        headStyles: { fillColor: [32, 147, 74], textColor: 255, fontSize: 8, fontStyle: "bold" },
        styles: { fontSize: 7, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 15 }, 1: { cellWidth: 30 }, 2: { cellWidth: 30 },
          3: { cellWidth: 35 }, 4: { cellWidth: 25 }, 5: { cellWidth: 15 },
          6: { cellWidth: 15 }, 7: { cellWidth: 15 },
        },
        didDrawPage: (data) => {
          doc.setFontSize(8);
          doc.setTextColor(100);
          doc.text("Page " + doc.internal.getNumberOfPages(), data.settings.margin.left, doc.internal.pageSize.height - 10);
        },
      });
    }

    yPosition = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : yPosition + 15;
    checkAddPage(40);

    doc.setFontSize(14);
    doc.setTextColor(32, 147, 74);
    doc.text("SUMMARY STATISTICS", 20, yPosition);
    yPosition += 10;

    const totalDirectUsers = reportData.data?.directUserBusinessPerformance?.filter(
      (u) => !excludedDirectUsers.includes(u.username)
    ).length || 0;
    const totalChainUsers = reportData.data?.chainUserBusinessPerformance?.filter(
      (u) => !excludedChainUsers.includes(u.username)
    ).length || 0;
    const totalDirectRefs = reportData.data?.directUserBusinessPerformance
      ?.filter((u) => !excludedDirectUsers.includes(u.username))
      ?.reduce((sum, u) => sum + (u.directRefs || 0), 0) || 0;
    const totalChainRefs = reportData.data?.chainUserBusinessPerformance
      ?.filter((u) => !excludedChainUsers.includes(u.username))
      ?.reduce((sum, u) => sum + (u.chainRefs || 0), 0) || 0;

    const summaryData = [
      ["Metric", "Count/Value"],
      ["Total Direct Referrals", totalDirectUsers.toString()],
      ["Total Chain Referrals", totalChainUsers.toString()],
      ["Total Direct Refs Count", totalDirectRefs.toString()],
      ["Total Chain Refs Count", totalChainRefs.toString()],
      ["Overall Total Users", (totalDirectUsers + totalChainUsers).toString()],
    ];

    autoTable(doc, {
      head: [summaryData[0]],
      body: summaryData.slice(1),
      startY: yPosition,
      theme: "striped",
      headStyles: { fillColor: [32, 147, 74], textColor: 255, fontSize: 10, fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 50, halign: "right" } },
    });

    return doc;
  };

  const handlePdfGeneration = async () => {
    try {
      setPdfLoading(true);
      const pdfDoc = generateDetailedBusinessReportPdf();
      if (pdfDoc) {
        const filename = `detailed-business-performance-${user.name.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;
        pdfDoc.save(filename);
        toast.success("PDF report generated successfully!", toastConfig);
        setShowReportModal(false);
      } else {
        throw new Error("Failed to generate PDF");
      }
    } catch (error) {
      console.error("PDF error:", error);
      toast.error("Failed to generate PDF report.", toastConfig);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[#eb660f]/10 flex items-center justify-center">
          <BarChart3 size={24} className="text-[#eb660f]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">
            Detailed Business Performance Report
          </h1>
          {user && (
            <p className="text-[#eb660f] text-sm font-medium mt-0.5">
              Name: {user.name}
            </p>
          )}
        </div>
      </div>

      {/* Search Form */}
      <div className="bg-[#1b232d] border border-[#303f50] rounded-xl p-5 mb-6">
        <form onSubmit={formik.handleSubmit}>
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="w-full sm:flex-1 max-w-md">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Username
              </label>
              <input
                type="text"
                name="username"
                className={inputClass}
                placeholder="Enter username..."
                onChange={formik.handleChange}
                value={formik.values.username}
              />
              {formik.errors.username && (
                <p className="text-red-400 text-xs mt-1">
                  {formik.errors.username}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#eb660f] hover:bg-[#d55a0e] 
                text-white font-medium px-6 py-2.5 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Fetch Referrals
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {user && (
        <>
          {/* Tabs & Generate Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex">
              <button
                onClick={() => setActiveTab("direct")}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border transition-all cursor-pointer ${
                  activeTab === "direct"
                    ? "bg-[#eb660f] text-white border-[#eb660f]"
                    : "bg-transparent text-[#eb660f] border-[#eb660f] hover:bg-[#eb660f]/10"
                }`}
              >
                <Users size={14} />
                Direct Referrals ({user.directReferrals?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("chain")}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border border-l-0 transition-all cursor-pointer ${
                  activeTab === "chain"
                    ? "bg-[#eb660f] text-white border-[#eb660f]"
                    : "bg-transparent text-[#eb660f] border-[#eb660f] hover:bg-[#eb660f]/10"
                }`}
              >
                <Link2 size={14} />
                Chain Referrals ({user.chainReferrals?.length || 0})
              </button>
            </div>

            <button
              onClick={handleShowReport}
              className="flex items-center gap-2 bg-[#eb660f] hover:bg-[#d55a0e] text-white 
                font-semibold px-5 py-2.5 rounded-lg transition-all cursor-pointer"
            >
              <FileText size={16} />
              Generate Detailed Report
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-[#1b232d] border border-[#303f50] rounded-xl overflow-hidden mb-6">
            {activeTab === "direct" && (
              <>
                <SearchBar
                  query={directSearchQuery}
                  setQuery={setDirectSearchQuery}
                  placeholder="Search direct referrals by name, username or email..."
                  totalCount={user.directReferrals?.length || 0}
                  filteredCount={filteredDirectReferrals?.length || 0}
                />
                <ReferralsTable
                  data={filteredDirectReferrals}
                  excludedList={excludedDirectUsers}
                  toggleFunction={toggleExcludedDirect}
                />
              </>
            )}

            {activeTab === "chain" && (
              <>
                <SearchBar
                  query={chainSearchQuery}
                  setQuery={setChainSearchQuery}
                  placeholder="Search chain referrals by name, username or email..."
                  totalCount={user.chainReferrals?.length || 0}
                  filteredCount={filteredChainReferrals?.length || 0}
                />
                <ReferralsTable
                  data={filteredChainReferrals}
                  excludedList={excludedChainUsers}
                  toggleFunction={toggleExcludedChain}
                />
              </>
            )}
          </div>

          {/* Excluded Users Summary */}
          {(excludedDirectUsers.length > 0 || excludedChainUsers.length > 0) && (
            <div className="bg-[#1b232d] border border-[#303f50] rounded-xl overflow-hidden mb-6">
              <div className="px-5 py-3 bg-red-500/20 border-b border-[#303f50]">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-400" />
                  <h3 className="text-white font-semibold text-sm">
                    Excluded Users Summary
                  </h3>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {excludedDirectUsers.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-xs mb-2">
                        Excluded Direct Referrals ({excludedDirectUsers.length}):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {excludedDirectUsers.map((uname) => (
                          <span
                            key={uname}
                            className="inline-flex items-center gap-1 bg-red-500/20 text-red-400 
                              border border-red-500/30 text-xs font-medium px-2.5 py-1 rounded-full"
                          >
                            {uname}
                            <button
                              onClick={() => toggleExcludedDirect(uname)}
                              className="hover:text-white transition-colors cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {excludedChainUsers.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-xs mb-2">
                        Excluded Chain Referrals ({excludedChainUsers.length}):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {excludedChainUsers.map((uname) => (
                          <span
                            key={uname}
                            className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-400 
                              border border-yellow-500/30 text-xs font-medium px-2.5 py-1 rounded-full"
                          >
                            {uname}
                            <button
                              onClick={() => toggleExcludedChain(uname)}
                              className="hover:text-white transition-colors cursor-pointer"
                            >
                              <X size={12} />
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

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowReportModal(false)}
          />
          <div className="relative w-full max-w-2xl bg-[#1b232d] border border-[#303f50] rounded-xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#303f50]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#eb660f]/10 flex items-center justify-center">
                  <FileText size={20} className="text-[#eb660f]" />
                </div>
                <h3 className="text-white font-semibold">
                  Generate Detailed Report
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="w-9 h-9 rounded-lg bg-[#111827] text-gray-400 hover:text-white 
                  flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Excluded Preview */}
              {(excludedDirectUsers.length > 0 || excludedChainUsers.length > 0) && (
                <div className="mb-4">
                  <p className="text-yellow-400 font-semibold text-sm mb-3">
                    Users to be excluded from report:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {excludedDirectUsers.length > 0 && (
                      <div>
                        <p className="text-gray-400 text-xs mb-1.5">Direct Referrals:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {excludedDirectUsers.map((uname) => (
                            <span
                              key={uname}
                              className="bg-red-500/20 text-red-400 border border-red-500/30 
                                text-xs font-medium px-2.5 py-1 rounded-full"
                            >
                              {uname}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {excludedChainUsers.length > 0 && (
                      <div>
                        <p className="text-gray-400 text-xs mb-1.5">Chain Referrals:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {excludedChainUsers.map((uname) => (
                            <span
                              key={uname}
                              className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 
                                text-xs font-medium px-2.5 py-1 rounded-full"
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
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
                  <p className="text-green-400 text-sm font-medium">
                    ✓ Report data generated successfully! Click &quot;Download PDF&quot; to save.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#303f50]">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-5 py-2.5 bg-gray-600 hover:bg-gray-500 text-white rounded-lg 
                  transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={reportFormik.handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#eb660f] hover:bg-[#d55a0e] 
                  text-white rounded-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText size={16} />
                    Generate Report
                  </>
                )}
              </button>
              {reportData && (
                <button
                  onClick={handlePdfGeneration}
                  disabled={pdfLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 
                    text-white rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {pdfLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Generating PDF...
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
        </div>
      )}
    </div>
  );
};

// ─── Search Bar Component ───────────────────────────────────

function SearchBar({ query, setQuery, placeholder, totalCount, filteredCount }) {
  return (
    <div className="px-5 py-3 border-b border-[#303f50]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={14}
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              query ? "text-[#eb660f]" : "text-gray-500"
            }`}
          />
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#111827] border border-[#303f50] text-white rounded-lg 
              pl-9 pr-9 py-2 text-sm focus:outline-none focus:border-[#eb660f] 
              focus:ring-1 focus:ring-[#eb660f]/50 transition-colors placeholder-gray-500"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white 
                transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs">
            Showing {filteredCount} of {totalCount} users
          </span>
          {query && filteredCount !== totalCount && (
            <span className="text-yellow-400 text-xs">(filtered)</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Referrals Table Component ──────────────────────────────

function ReferralsTable({ data, excludedList, toggleFunction }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-[#eb660f]">
            {["S.No", "Name", "Username", "Email", "Phone", "Exclude?"].map(
              (head, i) => (
                <th
                  key={head}
                  className={`text-white text-xs font-semibold uppercase tracking-wider px-4 py-3 text-left
                    ${head === "Email" ? "hidden md:table-cell" : ""}
                    ${head === "Phone" ? "hidden lg:table-cell" : ""}
                    ${head === "Exclude?" ? "text-center" : ""}`}
                >
                  {head}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#303f50]/50">
          {data?.length > 0 ? (
            data.map((user, index) => {
              const isExcluded = excludedList.includes(user.username);
              return (
                <tr
                  key={user.username}
                  className={`transition-all duration-200 ${
                    isExcluded
                      ? "bg-gray-500/10 opacity-50"
                      : "bg-[#1a1a1a] hover:bg-[#252d38]"
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-white font-medium">
                    {user.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {user.username}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300 hidden md:table-cell">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300 hidden lg:table-cell">
                    {user.phone}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={isExcluded}
                      onChange={() => toggleFunction(user.username)}
                      className="w-4 h-4 rounded border-gray-600 text-[#eb660f] 
                        focus:ring-[#eb660f] focus:ring-offset-0 bg-[#111827] cursor-pointer
                        accent-[#eb660f]"
                    />
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-10">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#111827] flex items-center justify-center mb-2">
                    <UserX size={20} className="text-gray-600" />
                  </div>
                  <p className="text-gray-400 text-sm">
                    No referrals found matching your search.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DetailedBusinessPerformanceReport;