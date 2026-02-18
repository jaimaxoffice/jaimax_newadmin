import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Calendar,
  Search,
  Download,
  BarChart3,
  FileText,
  Users,
  Loader2,
  TrendingUp,
  Wallet,
  ShoppingCart,
  X,
  Coins,
  DollarSign,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useGetBusinessDetailsByDateMutation } from "./getBusinessDetailsApiSlice";

const inputClass = `w-full bg-[#1b232d] border border-[#303f50] text-white rounded-lg 
  px-4 py-2.5 text-sm focus:outline-none focus:border-[#eb660f] 
  focus:ring-1 focus:ring-[#eb660f]/50 transition-colors duration-200
  placeholder-gray-500 disabled:opacity-50`;

const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

function GetBusinessDetails() {
  const [usersData, setUsersData] = useState([]);
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);
  const [dataFetched, setDataFetched] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("orders");
  const [currentView, setCurrentView] = useState("details");
  const [formValues, setFormValues] = useState({ fromDate: "", toDate: "" });

  const [getBusinessDetails, { isLoading }] =
    useGetBusinessDetailsByDateMutation();

  const initialValues = {
    fromDate: new Date().toISOString().split("T")[0],
    toDate: new Date().toISOString().split("T")[0],
  };

  const validationSchema = Yup.object({
    fromDate: Yup.date()
      .required("From date is required")
      .max(Yup.ref("toDate"), "From date cannot be later than To date"),
    toDate: Yup.date()
      .required("To date is required")
      .min(Yup.ref("fromDate"), "To date cannot be earlier than From date"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setDataFetched(false);
    setUsersData([]);
    setSelectedUserIndex(0);
    setFormValues({ fromDate: values.fromDate, toDate: values.toDate });

    try {
      const response = await getBusinessDetails({
        fromDate: values.fromDate,
        toDate: values.toDate,
      }).unwrap();

      if (response?.data && Array.isArray(response.data)) {
        setUsersData(response.data);
        setDataFetched(true);
      }
    } catch (error) {
      console.error("Error fetching business data:", error);
      toast.error("Error fetching business data. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateForPDF = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Analytics helper
  const getAnalyticsData = () => {
    if (!usersData || usersData.length === 0) {
      return {
        totalUsers: 0,
        totalCoins: 0,
        totalInvestments: 0,
        avgInvestmentPerUser: 0,
        monthlyData: [],
        paymentModeData: [],
      };
    }

    const totalUsers = usersData.length;
    const totalCoins = usersData.reduce(
      (sum, user) => sum + (user.user.totalOrderedCoins || 0),
      0
    );
    const totalInvestments = usersData.reduce(
      (sum, user) => sum + (user.user.totalInvestments || 0),
      0
    );
    const avgInvestmentPerUser =
      totalUsers > 0 ? totalInvestments / totalUsers : 0;

    const paymentModeStats = {};
    usersData.forEach((user) => {
      if (user.walletTransactions?.length > 0) {
        user.walletTransactions.forEach((transaction) => {
          const mode = transaction.paymentMode || "Unknown";
          if (!paymentModeStats[mode]) {
            paymentModeStats[mode] = { count: 0, amount: 0 };
          }
          paymentModeStats[mode].count += 1;
          paymentModeStats[mode].amount += transaction.transactionAmount || 0;
        });
      }
    });

    const colors = ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5A2B"];
    const paymentModeData = Object.entries(paymentModeStats).map(
      ([mode, stats], index) => ({
        name: mode,
        value: stats.amount,
        count: stats.count,
        color: colors[index % colors.length],
      })
    );

    const monthlyStats = {};
    usersData.forEach((user) => {
      if (user.orders?.length > 0) {
        user.orders.forEach((order) => {
          const date = new Date(order.createdAt);
          const monthKey = date.toLocaleString("default", {
            month: "short",
            year: "numeric",
          });
          const sortKey = date.getFullYear() * 100 + date.getMonth();

          if (!monthlyStats[monthKey]) {
            monthlyStats[monthKey] = {
              month: monthKey,
              investments: 0,
              coins: 0,
              users: new Set(),
              sortKey,
            };
          }
          monthlyStats[monthKey].investments += order.amount || 0;
          monthlyStats[monthKey].coins += order.jaimax || 0;
          monthlyStats[monthKey].users.add(user.user.email);
        });
      }

      if (user.walletTransactions?.length > 0) {
        user.walletTransactions.forEach((transaction) => {
          const date = new Date(transaction.transactionDate);
          const monthKey = date.toLocaleString("default", {
            month: "short",
            year: "numeric",
          });
          const sortKey = date.getFullYear() * 100 + date.getMonth();

          if (!monthlyStats[monthKey]) {
            monthlyStats[monthKey] = {
              month: monthKey,
              investments: 0,
              coins: 0,
              users: new Set(),
              sortKey,
            };
          }
          monthlyStats[monthKey].investments +=
            transaction.transactionAmount || 0;
          monthlyStats[monthKey].users.add(user.user.email);
        });
      }
    });

    const monthlyData = Object.values(monthlyStats)
      .sort((a, b) => a.sortKey - b.sortKey)
      .map((stat) => ({
        month: stat.month,
        investments: stat.investments,
        coins: stat.coins,
        users: stat.users.size,
      }));

    return {
      totalUsers,
      totalCoins,
      totalInvestments,
      avgInvestmentPerUser,
      monthlyData,
      paymentModeData,
    };
  };

  const getTotalStats = () => {
    if (usersData.length === 0)
      return { totalUsers: 0, totalCoins: 0, totalInvestments: 0, paymentModeStats: {} };

    const paymentModeStats = {};
    usersData.forEach((user) => {
      if (user.walletTransactions?.length > 0) {
        user.walletTransactions.forEach((transaction) => {
          const mode = transaction.paymentMode || "Unknown";
          if (!paymentModeStats[mode]) {
            paymentModeStats[mode] = { count: 0, amount: 0 };
          }
          paymentModeStats[mode].count += 1;
          paymentModeStats[mode].amount += transaction.transactionAmount || 0;
        });
      }
    });

    return {
      totalUsers: usersData.length,
      totalCoins: usersData.reduce(
        (sum, user) => sum + (user.user.totalOrderedCoins || 0),
        0
      ),
      totalInvestments: usersData.reduce(
        (sum, user) => sum + (user.user.totalInvestments || 0),
        0
      ),
      paymentModeStats,
    };
  };

  const getCurrentUserData = () => {
    if (usersData.length === 0) return null;
    return usersData[selectedUserIndex] || null;
  };

  const handleViewDetails = (type) => {
    const userData = getCurrentUserData();
    if (!userData) return;
    setModalType(type);
    setShowModal(true);
  };

  // PDF Export
  const exportToPDF = () => {
    if (!dataFetched || usersData.length === 0) {
      toast.error("No data available to export.");
      return;
    }

    try {
      const doc = new jsPDF();
      const stats = getTotalStats();

      // Summary
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text("JAIMAX BUSINESS REPORT", 105, 25, { align: "center" });
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `From ${formatDateForPDF(formValues.fromDate)} To ${formatDateForPDF(formValues.toDate)}`,
        105, 35, { align: "center" }
      );
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 40, { align: "center" });

      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text("BUSINESS SUMMARY", 20, 65);

      autoTable(doc, {
        startY: 75,
        head: [["Metric", "Value"]],
        body: [
          ["Total Users", stats.totalUsers.toString()],
          ["Total Coins", stats.totalCoins.toLocaleString()],
          ["Total Investments", stats.totalInvestments.toLocaleString()],
        ],
        theme: "grid",
        styles: { fontSize: 12 },
        headStyles: { fillColor: [236, 102, 15], textColor: 255 },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        margin: { left: 20, right: 20 },
      });

      // Payment Mode
      doc.text("PAYMENT MODE BREAKDOWN", 20, 140);

      if (Object.keys(stats.paymentModeStats).length > 0) {
        const paymentData = Object.entries(stats.paymentModeStats).map(
          ([mode, s]) => [mode, s.count.toString(), s.amount.toLocaleString()]
        );

        autoTable(doc, {
          startY: 150,
          head: [["Payment Mode", "Transactions", "Total Amount"]],
          body: paymentData,
          theme: "grid",
          styles: { fontSize: 12 },
          headStyles: { fillColor: [236, 102, 15], textColor: 255 },
          alternateRowStyles: { fillColor: [250, 250, 250] },
          margin: { left: 20, right: 20 },
        });
      }

      // Users Overview
      doc.addPage();
      doc.setFontSize(16);
      doc.text("USERS OVERVIEW", 20, 25);

      const userData = usersData.map((user, index) => [
        (index + 1).toString(),
        user.user.name,
        user.user.email,
        user.user.phone.toString(),
        user.user.totalOrderedCoins?.toLocaleString() || "0",
        user.user.totalInvestments?.toLocaleString() || "0",
        user.orders?.length.toString() || "0",
        user.walletTransactions?.length.toString() || "0",
      ]);

      autoTable(doc, {
        startY: 35,
        head: [["S.No", "Name", "Email", "Phone", "Coins", "Investments", "Orders", "Txns"]],
        body: userData,
        theme: "grid",
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [236, 102, 15], textColor: 255, fontSize: 8 },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        margin: { left: 10, right: 10 },
      });

      // Detailed Users
      doc.addPage();
      let yPos = 20;

      usersData.forEach((ud, userIndex) => {
        if (yPos > 50 && userIndex > 0) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(236, 102, 15);
        doc.text(`${ud.user.name}`, 20, yPos);
        yPos += 15;

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);
        doc.text(`Name: ${ud.user.name}`, 20, yPos);
        doc.text(`Username: ${ud.user.username}`, 20, yPos + 7);
        doc.text(`Email: ${ud.user.email}`, 20, yPos + 14);
        doc.text(`Phone: ${ud.user.phone}`, 20, yPos + 21);
        doc.text(`Total Coins: ${ud.user.totalOrderedCoins?.toLocaleString() || "0"}`, 20, yPos + 28);
        doc.text(`Total Investments: ${ud.user.totalInvestments?.toLocaleString() || "0"}`, 20, yPos + 35);
        yPos += 50;

        if (ud.orders?.length > 0) {
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("Orders", 20, yPos);
          yPos += 10;
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(`Total Orders: ${ud.orders.length}`, 20, yPos);
          yPos += 15;

          const orderData = ud.orders.map((order, i) => [
            (i + 1).toString(),
            formatDateForPDF(order.createdAt),
            `${order.amount?.toLocaleString() || "0"} ${order.currency || "INR"}`,
            order.jaimax?.toLocaleString() || "0",
            order.status || "N/A",
          ]);

          autoTable(doc, {
            startY: yPos,
            head: [["S.No", "Date", "Amount", "JAIMAX Tokens", "Status"]],
            body: orderData,
            theme: "grid",
            styles: { fontSize: 9 },
            headStyles: { fillColor: [236, 102, 15], textColor: 255 },
            alternateRowStyles: { fillColor: [250, 250, 250] },
            margin: { left: 20, right: 20 },
          });

          yPos += orderData.length * 8 + 20;
        }

        if (ud.walletTransactions?.length > 0) {
          if (yPos > 180) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("Wallet Transactions", 20, yPos);
          yPos += 10;
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(`Total Transactions: ${ud.walletTransactions.length}`, 20, yPos);
          yPos += 15;

          const txnData = ud.walletTransactions.map((t, i) => [
            (i + 1).toString(),
            formatDateForPDF(t.transactionDate),
            `${t.transactionAmount?.toLocaleString() || "0"} ${t.currency || "INR"}`,
            t.paymentMode || "N/A",
            t.transactionId || "N/A",
            t.transactionStatus || "N/A",
          ]);

          autoTable(doc, {
            startY: yPos,
            head: [["S.No", "Date", "Amount", "Mode", "Txn ID", "Status"]],
            body: txnData,
            theme: "grid",
            styles: { fontSize: 8 },
            headStyles: { fillColor: [236, 102, 15], textColor: 255 },
            alternateRowStyles: { fillColor: [250, 250, 250] },
            margin: { left: 20, right: 20 },
          });

          yPos += txnData.length * 8 + 20;
        }

        yPos += 15;
      });

      const today = new Date().toISOString().slice(0, 10);
      doc.save(`Business_Report_${formValues.fromDate}_to_${formValues.toDate}_${today}.pdf`);
      toast.success("PDF download started successfully!");
    } catch (error) {
      console.error("PDF Error:", error);
      toast.error("Error creating PDF.");
    }
  };

  const currentUserData = getCurrentUserData();
  const totalStats = getTotalStats();

  // Analytics Dashboard
  const AnalyticsDashboard = () => {
    const analytics = getAnalyticsData();

    if (!dataFetched || usersData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full bg-[#111827] flex items-center justify-center mb-4">
            <BarChart3 size={28} className="text-gray-600" />
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">
            Please fetch business data first to view analytics!
          </h3>
          <p className="text-gray-400 text-sm">
            Use the form above to get business details for selected date range
          </p>
        </div>
      );
    }

    return (
      <div className="bg-linear-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-2xl p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-white text-xl sm:text-2xl font-bold mb-1">
            📊 Business Analytics Dashboard
          </h2>
          <p className="text-gray-400 text-sm">
            Monitor your business performance • {formatDate(formValues.fromDate)} to{" "}
            {formatDate(formValues.toDate)}
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <GradientStatCard
            title="Total Users"
            value={analytics.totalUsers.toLocaleString()}
            gradient="from-[#8B5CF6] to-[#7C3AED]"
            shadow="shadow-[0_4px_20px_rgba(139,92,246,0.3)]"
            icon={Users}
          />
          <GradientStatCard
            title="Total Coins"
            value={analytics.totalCoins.toLocaleString()}
            gradient="from-[#06B6D4] to-[#0891B2]"
            shadow="shadow-[0_4px_20px_rgba(6,182,212,0.3)]"
            icon={Coins}
          />
          <GradientStatCard
            title="Total Investments"
            value={`₹${analytics.totalInvestments.toLocaleString()}`}
            gradient="from-[#10B981] to-[#059669]"
            shadow="shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
            icon={DollarSign}
          />
          <GradientStatCard
            title="Avg per User"
            value={`₹${Math.round(analytics.avgInvestmentPerUser).toLocaleString()}`}
            gradient="from-[#F59E0B] to-[#D97706]"
            shadow="shadow-[0_4px_20px_rgba(245,158,11,0.3)]"
            icon={Activity}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mb-6">
          {/* Area Chart */}
          <div className="xl:col-span-8">
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-white/10">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="text-white text-base sm:text-lg font-semibold">
                  Monthly Investment Trend
                </h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" />
                  <span className="text-gray-400 text-xs">Investments</span>
                </div>
              </div>
              <div className="h-56 sm:h-64">
                {analytics.monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.monthlyData}>
                      <defs>
                        <linearGradient id="investGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="month" stroke="#999" fontSize={11} />
                      <YAxis stroke="#999" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0,0,0,0.85)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "8px",
                          color: "white",
                          fontSize: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="investments"
                        stroke="#06B6D4"
                        strokeWidth={2}
                        fill="url(#investGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <NoChartData message="No monthly data available" />
                )}
              </div>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="xl:col-span-4">
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-white/10">
              <h3 className="text-white text-base sm:text-lg font-semibold mb-4">
                Payment Methods
              </h3>
              {analytics.paymentModeData.length > 0 ? (
                <>
                  <div className="h-44 sm:h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.paymentModeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {analytics.paymentModeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(0,0,0,0.85)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: "8px",
                            color: "white",
                            fontSize: "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-3">
                    {analytics.paymentModeData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-gray-400 text-xs">{item.name}</span>
                        </div>
                        <span className="text-white text-xs font-semibold">
                          ₹{item.value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <NoChartData message="No payment data available" />
              )}
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-white/10 mb-6">
          <h3 className="text-white text-base sm:text-lg font-semibold mb-4">
            Monthly User Activity
          </h3>
          <div className="h-48 sm:h-56">
            {analytics.monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="#999" fontSize={11} />
                  <YAxis stroke="#999" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.85)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                      color: "white",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="users" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <NoChartData message="No user activity data" />
            )}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="border-t border-white/10 pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <FooterStat
              label="Active Period"
              value={
                analytics.monthlyData.length > 0
                  ? `${analytics.monthlyData[0]?.month} - ${analytics.monthlyData[analytics.monthlyData.length - 1]?.month}`
                  : "No Data"
              }
            />
            <FooterStat
              label="Peak Month"
              value={
                analytics.monthlyData.length > 0
                  ? analytics.monthlyData.reduce(
                      (max, m) => (m.investments > max.investments ? m : max),
                      analytics.monthlyData[0]
                    )?.month || "N/A"
                  : "N/A"
              }
            />
            <FooterStat
              label="Total Transactions"
              value={analytics.paymentModeData
                .reduce((sum, mode) => sum + mode.count, 0)
                .toLocaleString()}
            />
            <FooterStat
              label="Growth Rate"
              value={
                analytics.monthlyData.length > 1
                  ? `${(
                      (analytics.monthlyData[analytics.monthlyData.length - 1]?.investments /
                        analytics.monthlyData[0]?.investments -
                        1) *
                      100
                    ).toFixed(1)}%`
                  : "0%"
              }
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#eb660f]/10 flex items-center justify-center">
            <BarChart3 size={24} className="text-[#eb660f]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Get Business Details</h1>
            <p className="text-sm text-gray-400">Search business data by date range</p>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex bg-[#1b232d] border border-[#303f50] rounded-lg p-0.5">
          <button
            onClick={() => setCurrentView("analytics")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
              currentView === "analytics"
                ? "bg-[#eb660f] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            📊 Analytics Dashboard
          </button>
          <button
            onClick={() => setCurrentView("details")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
              currentView === "details"
                ? "bg-[#eb660f] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            📋 Business Details
          </button>
        </div>
      </div>

      {/* Search Form */}
      <div className="bg-[#1b232d] border border-[#303f50] rounded-xl p-5 mb-6">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, resetForm }) => (
            <Form>
              <div className="flex flex-col sm:flex-row items-end gap-4">
                <div className="w-full sm:flex-1">
                  <label className={labelClass}>From Date</label>
                  <Field type="date" name="fromDate" className={inputClass} />
                  <ErrorMessage name="fromDate" component="p" className="text-red-400 text-xs mt-1" />
                </div>
                <div className="w-full sm:flex-1">
                  <label className={labelClass}>To Date</label>
                  <Field type="date" name="toDate" className={inputClass} />
                  <ErrorMessage name="toDate" component="p" className="text-red-400 text-xs mt-1" />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#eb660f] hover:bg-[#d55a0e] 
                    text-white font-medium px-6 py-2.5 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting || isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Get Details"
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      {/* Conditional View */}
      {currentView === "analytics" ? (
        <AnalyticsDashboard />
      ) : (
        <>
          {/* Business Summary */}
          {dataFetched && usersData.length > 0 && (
            <div className="bg-[#1b232d] border border-[#303f50] rounded-xl overflow-hidden mb-6">
              <div className="px-5 py-4 border-b border-[#303f50]">
                <h3 className="text-[#eb660f] font-semibold">Business Summary</h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <SummaryCard label="Total Users" value={totalStats.totalUsers} />
                  <SummaryCard label="Total Coins" value={totalStats.totalCoins.toLocaleString()} />
                  <SummaryCard label="Total Investments" value={`₹${totalStats.totalInvestments.toLocaleString()}`} />
                </div>

                {Object.keys(totalStats.paymentModeStats).length > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[#eb660f] font-semibold text-sm">Payment Mode Breakdown</h4>
                      <button
                        onClick={exportToPDF}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                          bg-green-500/10 text-green-400 border border-green-500/20
                          hover:bg-green-500/20 transition-all cursor-pointer"
                      >
                        <Download size={14} />
                        Export PDF
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(totalStats.paymentModeStats).map(([mode, stats]) => (
                        <div
                          key={mode}
                          className="bg-[#2e2e2e] border border-[#4a4a4a] rounded-xl p-4 text-center
                            hover:bg-[#3a3a3a] hover:-translate-y-0.5 transition-all"
                        >
                          <p className="text-[#eb660f] font-semibold mb-2">{mode}</p>
                          <p className="text-gray-400 text-sm">
                            Transactions: <span className="text-white font-semibold">{stats.count}</span>
                          </p>
                          <p className="text-white text-xl font-bold mt-1">
                            ₹{stats.amount.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* User Selector */}
          {dataFetched && usersData.length > 1 && (
            <div className="mb-6 max-w-md mx-auto">
              <label className={labelClass}>Select User to View Details</label>
              <select
                className={inputClass}
                value={selectedUserIndex}
                onChange={(e) => setSelectedUserIndex(parseInt(e.target.value))}
              >
                {usersData.map((userData, index) => (
                  <option key={index} value={index}>
                    {userData.user.name} ({userData.user.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* User Info Card */}
          {dataFetched && currentUserData && (
            <div className="bg-[#1b232d] border border-[#303f50] rounded-xl overflow-hidden mb-6">
              <div className="px-5 py-4 border-b border-[#303f50]">
                <h3 className="text-[#eb660f] font-semibold">User Information</h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <InfoRow label="Name" value={currentUserData.user.name} />
                    <InfoRow label="Email" value={currentUserData.user.email} />
                    <InfoRow label="Phone" value={currentUserData.user.phone} />
                  </div>
                  <div className="space-y-2">
                    <InfoRow label="Username" value={currentUserData.user.username} />
                    <InfoRow label="Total Coins" value={currentUserData.user.totalOrderedCoins?.toLocaleString() || "0"} />
                    <InfoRow label="Total Investments" value={`₹${currentUserData.user.totalInvestments?.toLocaleString() || "0"}`} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleViewDetails("orders")}
                    disabled={!currentUserData.orders?.length}
                    className="flex items-center justify-center gap-2 bg-[#eb660f] hover:bg-[#d55a0e] text-white 
                      font-medium py-3 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <ShoppingCart size={16} />
                    View Orders ({currentUserData.orders?.length || 0})
                  </button>
                  <button
                    onClick={() => handleViewDetails("walletTransactions")}
                    disabled={!currentUserData.walletTransactions?.length}
                    className="flex items-center justify-center gap-2 bg-[#2e2e2e] hover:bg-[#3a3a3a] text-white 
                      font-medium py-3 rounded-lg border border-[#3a3a3a] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Wallet size={16} />
                    View Wallet Transactions ({currentUserData.walletTransactions?.length || 0})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* No Data */}
          {dataFetched && usersData.length === 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-5 py-4 text-yellow-400 text-sm">
              No data found for the selected date range
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && currentUserData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#1b232d] border border-[#303f50] rounded-xl shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#303f50] shrink-0">
              <h3 className="text-lg font-semibold text-[#eb660f]">
                {currentUserData.user.name}&apos;s{" "}
                {modalType === "orders" ? "Orders" : "Wallet Transactions"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-lg bg-[#111827] text-gray-400 hover:text-white 
                  flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-6">
              {/* User Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <InfoRow label="Name" value={currentUserData.user.name} />
                  <InfoRow label="Username" value={currentUserData.user.username} />
                  <InfoRow label="Email" value={currentUserData.user.email} />
                </div>
                <div className="space-y-2">
                  <InfoRow label="Phone" value={currentUserData.user.phone} />
                  <InfoRow label="Total Coins" value={currentUserData.user.totalOrderedCoins?.toLocaleString() || "0"} />
                  <InfoRow label="Total Investments" value={`₹${currentUserData.user.totalInvestments?.toLocaleString() || "0"}`} />
                </div>
              </div>

              {/* Orders Table */}
              {modalType === "orders" && (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <SummaryCard label="Total Orders" value={currentUserData.orders?.length || 0} />
                    <SummaryCard label="Total Tokens" value={currentUserData.user.totalOrderedCoins?.toLocaleString() || "0"} />
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-[#303f50]">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-[#eb660f] to-[#f07d2c]">
                          {["S.No", "Date", "Amount", "JAIMAX Tokens", "Status"].map((h) => (
                            <th key={h} className="text-white text-sm font-semibold uppercase tracking-wider px-4 py-3 text-center">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {currentUserData.orders?.length > 0 ? (
                          currentUserData.orders.map((item, index) => (
                            <tr
                              key={index}
                              className={`${
                                index % 2 === 0 ? "bg-[#2e2e2e]" : "bg-[#262626]"
                              } hover:bg-[#3a3a3a] transition-colors border-l-2 border-r-2 border-transparent hover:border-[#eb660f]`}
                            >
                              <td className="px-4 py-3 text-center">
                                <span className="bg-[#eb660f] text-white text-xs font-bold px-2.5 py-1 rounded-md">
                                  {index + 1}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center text-white text-sm">
                                {formatDate(item.createdAt)}
                              </td>
                              <td className="px-4 py-3 text-center text-white text-sm font-semibold">
                                {(item.amount || 0).toLocaleString()} {item.currency}
                              </td>
                              <td className="px-4 py-3 text-center text-white text-sm font-semibold">
                                {(item.jaimax || 0).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <StatusBadge status={item.status} />
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center py-8 text-gray-500 italic">
                              No order data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Wallet Transactions Table */}
              {modalType === "walletTransactions" && (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <SummaryCard label="Total Transactions" value={currentUserData.walletTransactions?.length || 0} />
                    <SummaryCard label="Total Investment" value={`₹${currentUserData.user.totalInvestments?.toLocaleString() || "0"}`} />
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-[#303f50]">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-linear-to-r from-[#eb660f] to-[#f07d2c]">
                          {["S.No", "Date", "Amount", "Payment Mode", "Transaction ID", "Status"].map((h) => (
                            <th key={h} className="text-white text-sm font-semibold uppercase tracking-wider px-4 py-3 text-center">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {currentUserData.walletTransactions?.length > 0 ? (
                          currentUserData.walletTransactions.map((item, index) => (
                            <tr
                              key={index}
                              className={`${
                                index % 2 === 0 ? "bg-[#2e2e2e]" : "bg-[#262626]"
                              } hover:bg-[#3a3a3a] transition-colors border-l-2 border-r-2 border-transparent hover:border-[#eb660f]`}
                            >
                              <td className="px-4 py-3 text-center">
                                <span className="bg-[#eb660f] text-white text-xs font-bold px-2.5 py-1 rounded-md">
                                  {index + 1}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center text-white text-sm">
                                {formatDate(item.transactionDate)}
                              </td>
                              <td className="px-4 py-3 text-center text-white text-sm font-semibold">
                                {(item.transactionAmount || 0).toLocaleString()} {item.currency}
                              </td>
                              <td className="px-4 py-3 text-center text-white text-sm">
                                {item.paymentMode}
                              </td>
                              <td className="px-4 py-3 text-center text-white text-sm font-mono">
                                {item.transactionId}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <StatusBadge status={item.transactionStatus} />
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="text-center py-8 text-gray-500 italic">
                              No wallet transaction data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#303f50] shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 bg-[#2e2e2e] hover:bg-[#3a3a3a] text-white rounded-lg 
                  border border-[#3a3a3a] transition-colors cursor-pointer"
              >
                Close
              </button>
              {modalType === "orders" && currentUserData?.walletTransactions?.length > 0 && (
                <button
                  onClick={() => setModalType("walletTransactions")}
                  className="px-5 py-2.5 bg-[#eb660f] hover:bg-[#d55a0e] text-white rounded-lg transition-colors cursor-pointer"
                >
                  View Wallet Transactions
                </button>
              )}
              {modalType === "walletTransactions" && currentUserData?.orders?.length > 0 && (
                <button
                  onClick={() => setModalType("orders")}
                  className="px-5 py-2.5 bg-[#eb660f] hover:bg-[#d55a0e] text-white rounded-lg transition-colors cursor-pointer"
                >
                  View Orders
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helper Components ──────────────────────────────────────

function GradientStatCard({ title, value, gradient, shadow, icon: Icon }) {
  return (
    <div
      className={`bg-linear-to-br ${gradient} rounded-xl p-4 sm:p-5 ${shadow} 
        border border-white/10 relative overflow-hidden`}
    >
      <div className="absolute top-0 right-0 p-2 opacity-20">
        <Icon size={48} className="text-white" />
      </div>
      <div className="relative">
        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-3">
          <Icon size={20} className="text-white" />
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-1">
          {value}
        </p>
        <p className="text-white/70 text-xs">{title}</p>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-[#2e2e2e] rounded-xl p-4 text-center">
      <p className="text-[#eb660f] text-sm font-medium mb-1">{label}</p>
      <p className="text-white text-xl font-bold">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <p className="text-sm text-gray-300">
      <span className="font-semibold text-white">{label}:</span> {value || "N/A"}
    </p>
  );
}

function StatusBadge({ status }) {
  const isCompleted = status === "Completed";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold ${
        isCompleted
          ? "bg-green-600 text-white"
          : "bg-yellow-500 text-black"
      }`}
    >
      {status || "N/A"}
    </span>
  );
}

function FooterStat({ label, value }) {
  return (
    <div>
      <p className="text-gray-400 text-[11px] mb-0.5">{label}</p>
      <p className="text-white text-xs font-semibold">{value}</p>
    </div>
  );
}

function NoChartData({ message }) {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-full bg-[#111827] flex items-center justify-center mb-2">
        <BarChart3 size={20} className="text-gray-600" />
      </div>
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
}

export default GetBusinessDetails;