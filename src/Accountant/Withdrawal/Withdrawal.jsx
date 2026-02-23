import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useToast } from "../../reusableComponents/Toasts/ToastContext";
import {
  useWithdrawApprovalMutation,
  useGetWithdrawListQuery,
} from "../../Features/Withdrawal/withdrawalApiSlice";
import Modals from "../../reusableComponents/Modals/Modals";
import Cookies from "js-cookie"

// ✅ YOUR REUSABLE COMPONENTS
import Table from "../../reusableComponents/Tables/Table";
import Pagination from "../../reusableComponents/paginations/Pagination";
import StatCard from "../../reusableComponents/StatCards/StatsCard";
import MobileCard from "../../reusableComponents/MobileCards/MobileCards";
import MobileCardList from "../../reusableComponents/MobileCards/MobileCardList";
import SearchBar from "../../reusableComponents/searchBar/SearchBar";
import { Clock, CheckCircle, BarChart3, XCircle } from "lucide-react";
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://192.168.128.1:3002/api";

/* ── Tailwind Modal ── */
const TwModal = ({ show, onClose, children, backdrop = true }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={backdrop === "static" ? undefined : onClose}
      />
      <div className="relative w-full max-w-lg bg-linear-to-b from-[#282f35] to-[#141a20] border border-white/10 rounded-[14px] shadow-[0_8px_30px_rgba(0,0,0,0.7)] text-white z-10 max-h-[90vh] overflow-y-auto animate-slideUp">
        {children}
      </div>
    </div>
  );
};

const TwModalHeader = ({ onClose, children }) => (
  <div className="flex items-start justify-between p-4">
    <h5 className="text-lg font-bold tracking-wide text-[#b9fd5c] drop-shadow-[0_0_6px_rgba(235,102,15,0.6)]">
      {children}
    </h5>
    <button
      onClick={onClose}
      className="ml-4 text-orange-400/90 hover:text-orange-300 hover:rotate-90 transition-all duration-300 text-2xl leading-none"
    >
      ×
    </button>
  </div>
);

const TwModalBody = ({ children, className = "" }) => (
  <div className={`px-4 pb-4 ${className}`}>{children}</div>
);

const TwModalFooter = ({ children }) => (
  <div className="flex justify-end gap-3 px-4 pb-4">{children}</div>
);

/* ── Export Dropdown ── */
const ExportDropdown = ({ onExport }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        className="px-3 py-1.5 text-xs sm:text-sm border border-gray-500 text-white rounded hover:bg-white/10 transition"
        onClick={() => setOpen((p) => !p)}
      >
        Export ▾
      </button>
      {open && (
        <ul className="absolute right-0 mt-1 w-40 bg-[#1e2a34] border border-[#2b3440] rounded shadow-xl z-20 overflow-hidden">
          {[
            { key: "xlsx", label: "Excel (.xlsx)" },
            { key: "pdf", label: "PDF (.pdf)" },
          ].map((f) => (
            <li key={f.key}>
              <button
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition"
                onClick={() => {
                  setOpen(false);
                  onExport(f.key);
                }}
              >
                {f.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/* ── Status Badge ── */
const StatusBadge = ({ status }) => {
  const pill = (s) => {
    if (s == "1")
      return { cls: "bg-green-500/20 text-green-400", text: "Approved" };
    if (s == "2")
      return { cls: "bg-red-500/20 text-red-400", text: "Rejected" };
    if (s == "0")
      return { cls: "bg-yellow-500/20 text-yellow-400", text: "Pending" };
    return { cls: "bg-gray-500/20 text-gray-400", text: "Failed" };
  };
  const { cls, text } = pill(status);
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {text}
    </span>
  );
};

/* ── Date Formatter ── */
const formatDate = (iso) => {
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  let hh = d.getUTCHours();
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  const ampm = hh >= 12 ? "PM" : "AM";
  hh = hh % 12 || 12;
  return `${dd}-${mm}-${yyyy} ${hh}:${min} ${ampm}`;
};

/* ═══════════════════════════════════
   WITHDRAW COMPONENT
   ═══════════════════════════════════ */
const WithDraw = () => {
  const toast = useToast();
  /* ── State ── */
  const [selectedWithdrawId, setSelectedWithdrawId] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [allRequests, setAllRequests] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("Select Status");
  const [detailModal, setDetailModal] = useState({
    show: false,
    title: "",
    content: "",
  });

  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
    selectedUserId: null,
    fromDate: "",
    toDate: "",
  });

  const update = (patch) => setState((p) => ({ ...p, ...patch }));

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteModal3, setDeleteModal3] = useState(false);
  const [check2, setCheck2] = useState(false);

  /* ── API ── */
  const queryParams = `limit=${state.perPage || ""}&page=${
    state.currentPage || ""
  }&search=${state.search || ""}&status=${
    selectedStatus === "Select Status" ? "" : selectedStatus
  }&fromDate=${state.fromDate || ""}&toDate=${state.toDate || ""}`;

  const {
    data: getWithdrawList,
    isLoading,
    refetch,
  } = useGetWithdrawListQuery(queryParams);

  const [withdrawApprovalAmount] = useWithdrawApprovalMutation();
  const TableData = getWithdrawList?.data?.withdrawRequests || [];
  const pagination = getWithdrawList?.data?.pagination;

  useEffect(() => {
    if (getWithdrawList?.data?.withdrawRequests) {
      setAllRequests(getWithdrawList.data.withdrawRequests);
    }
  }, [getWithdrawList]);

  useEffect(() => {
    refetch();
    if (refresh) {
      refetch();
      setRefresh(false);
    }
  }, [refresh, refetch]);

  /* ── Computed ── */
  const totalPages = Math.ceil((pagination?.total || 0) / state.perPage) || 1;

  const getSerialNo = (i) =>
    state.currentPage * state.perPage - (state.perPage - 1) + i;

  /* ── Handlers ── */
  const handleDelete = (withdrawId) => {
    setSelectedWithdrawId(withdrawId);
    setDeleteModal(true);
  };

  const handleCheck = (withdrawId) => {
    setSelectedWithdrawId(withdrawId);
    setCheck2(true);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    update({ currentPage: 1 });
  };

  let searchTimeout;
  const handleSearch = (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      update({ search: e.target.value, currentPage: 1 });
    }, 1000);
  };

  const handleApprove = async () => {
    try {
      const payload = { isApproved: 1, withraw_id: [selectedWithdrawId] };
      await withdrawApprovalAmount(payload).unwrap();
      toast.success("Withdrawal approved successfully", {
        position: "top-center",
      });
      setCheck2(false);
      setRefresh(true);
    } catch (error) {
      toast.error("Failed to approve withdrawal", {
        position: "top-center",
      });
    }
  };

  const handleReject = async (reason, setReason) => {
    try {
      const payload = {
        isApproved: 0,
        withraw_id: [selectedWithdrawId],
        reason: reason,
      };
      await withdrawApprovalAmount(payload).unwrap();
      toast.success("Withdrawal rejected successfully", {
        position: "top-center",
      });
      setDeleteModal(false);
      setRefresh(true);
      setReason("");
    } catch (error) {
      toast.error("Failed to reject withdrawal", {
        position: "top-center",
      });
    }
  };

  const handleExport = async (fmt) => {
    try {
      const q = new URLSearchParams();
      q.set("format", fmt);
      if (state.search) q.set("search", state.search);
      if (state.fromDate?.trim()) q.set("fromDate", state.fromDate);
      if (state.toDate?.trim()) q.set("toDate", state.toDate);

      const res = await fetch(`${API_BASE}/accounts/withdrawals/export?${q}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token") || ""}`,
        },
      });
      if (!res.ok) {
        toast.error("Export failed");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const disposition = res.headers.get("content-disposition");
      let filename =
        disposition && disposition.includes("filename=")
          ? disposition.split("filename=")[1].replace(/["']/g, "")
          : fmt === "pdf"
          ? "withdrawals.pdf"
          : "withdrawals.xlsx";

      const a = Object.assign(document.createElement("a"), {
        href: url,
        download: filename,
      });
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Export error");
      console.error("Export error:", err);
    }
  };

  const closeDetail = () =>
    setDetailModal({ show: false, title: "", content: "" });

  /* ── View Button Style ── */
  const viewBtnClass =
    "px-2 py-1.5 text-sm font-medium text-white border border-[#b9fd5c]/60 bg-transparent hover:bg-[#b9fd5c] rounded-sm transition-all duration-300 hover:scale-[1.02]";

  /* ── Table Columns ── */
  const columns = [
    {
      key: "sno",
      header: "S.No",
      render: (_, i) => `${getSerialNo(i)}.`,
    },
    {
      key: "name",
      header: "Customer Name",
      nowrap: true,
      render: (d) => d?.userId?.name,
    },
    {
      key: "txnId",
      header: "Transaction Id",
      render: (d) => <span className="text-xs">{d?._id}</span>,
    },
    {
      key: "customerId",
      header: "Customer Id",
      render: (d) => d?.userId?.username,
    },
    {
      key: "currency",
      header: "Currency",
      accessor: "currency",
    },
    {
      key: "amount",
      header: "Amount",
      render: (d) => {
        const sym = d.currency === "INR" ? "₹" : "$";
        return `${sym}${d.amount.toFixed(2)}`;
      },
    },
    {
      key: "charges",
      header: "Admin Charges",
      render: (d) => {
        const sym = d.currency === "INR" ? "₹" : "$";
        return `${sym}${d.admin_inr_charges.toFixed(2)}`;
      },
    },
    {
      key: "finalAmount",
      header: "Final Amount",
      render: (d) => {
        const sym = d.currency === "INR" ? "₹" : "$";
        return `${sym} ${(d.amount - d.admin_inr_charges || 0).toFixed(2)}`;
      },
    },
    {
      key: "date",
      header: "Date & Time",
      nowrap: true,
      render: (d) => formatDate(d?.created_at),
    },
    {
      key: "status",
      header: "Status",
      render: (d) => <StatusBadge status={d.status} />,
    },
    {
      key: "bankDetails",
      header: "Bank Details",
      render: (d) => (
        <button
          className={viewBtnClass}
          onClick={() =>
            setDetailModal({
              show: true,
              title: "Bank Details",
              content: `Bank Name: ${
                d.bankDetails?.bank_name || "N/A"
              }\nAccount No: ${
                d.bankDetails?.bank_account || "N/A"
              }\nIFSC Code: ${d.bankDetails?.ifsc_code || "N/A"}`,
            })
          }
        >
          View
        </button>
      ),
    },
    {
      key: "note",
      header: "Note",
      render: (d) => (
        <button
          className={viewBtnClass}
          onClick={() =>
            setDetailModal({
              show: true,
              title: "Note",
              content: d.note || "No note available.",
            })
          }
        >
          View
        </button>
      ),
    },
  ];

  /* ── Mobile Card Fields ── */
  const mobileFields = [
    {
      label: "Customer Name",
      render: (d) => d?.userId?.name,
    },
    {
      label: "Customer Id",
      render: (d) => d?.userId?.username,
    },
    {
      label: "Currency",
      key: "currency",
    },
    {
      label: "Amount",
      render: (d) => {
        const sym = d.currency === "INR" ? "₹" : "$";
        return `${sym}${d.amount.toFixed(2)}`;
      },
    },
    {
      label: "Admin Charges",
      render: (d) => {
        const sym = d.currency === "INR" ? "₹" : "$";
        return `${sym}${d.admin_inr_charges.toFixed(2)}`;
      },
    },
    {
      label: "Final Amount",
      render: (d) => {
        const sym = d.currency === "INR" ? "₹" : "$";
        return `${sym} ${(d.amount - d.admin_inr_charges || 0).toFixed(2)}`;
      },
    },
    {
      label: "Date & Time",
      render: (d) => formatDate(d?.created_at),
    },
    {
      label: "Status",
      render: (d) => <StatusBadge status={d.status} />,
    },
  ];

  /* ═══════════ RENDER ═══════════ */
  return (
    <div>
      <section className="py-3 sm:py-4 px-1 sm:px-3 md:px-4 min-h-screen bg-[#0b1218] overflow-x-hidden">
        {/* ── Summary Cards (✅ StatCard - SAME as before) ── */}


<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
  <StatCard
    icon={<Clock />}
    value={pagination?.pending ?? 0}
    title="Pending"
    variant="yellow"
  />
  <StatCard
    icon={<CheckCircle />}
    value={pagination?.approved ?? 0}
    title="Approved"
    variant="green"
  />
  <StatCard
    icon={<BarChart3 />}
    value={pagination?.total ?? 0}
    title="Total"
    variant="blue"
  />
  <StatCard
    icon={<XCircle />}
    value={pagination?.rejected ?? 0}
    title="Rejected"
    variant="red"
  />
</div>

        {/* ── Main Card ── */}
        <div className="bg-[#1a2128] border border-[#2b3440] rounded-xl px-3 sm:px-4 md:px-5 pb-1 pt-4 overflow-x-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <h1 className="font-bold text-white text-lg sm:text-xl md:text-2xl leading-none">
              Withdrawal Bonus
            </h1>
            <ExportDropdown onExport={handleExport} />
          </div>

          {/* ── Filters ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[auto_1fr_1fr_auto_auto_1fr] gap-3 mb-4 items-end">
            {/* Per-page */}
            <select
              className="bg-[#1a2128] text-white border border-[#313b48] rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-auto"
              value={state.perPage}
              onChange={(e) =>
                update({ perPage: e.target.value, currentPage: 1 })
              }
            >
              <option value="10">10</option>
              <option value="30">30</option>
              <option value="50">50</option>
            </select>

            {/* From */}
            <div className="flex items-center gap-2">
              <label className="text-white text-sm whitespace-nowrap">
                From
              </label>
              <input
                type="date"
                className="bg-white text-gray-900 rounded-md px-2 py-2 text-sm w-full focus:outline-none"
                value={state.fromDate}
                onChange={(e) =>
                  update({ fromDate: e.target.value, currentPage: 1 })
                }
              />
            </div>

            {/* To */}
            <div className="flex items-center gap-2">
              <label className="text-white text-sm whitespace-nowrap">
                To
              </label>
              <input
                type="date"
                className="bg-white text-gray-900 rounded-md px-2 py-2 text-sm w-full focus:outline-none"
                value={state.toDate}
                onChange={(e) =>
                  update({ toDate: e.target.value, currentPage: 1 })
                }
              />
            </div>

            {/* Status filter */}
            <select
              className="bg-[#1a2128] text-white border border-[#313b48] rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-auto"
              value={selectedStatus}
              onChange={handleStatusChange}
            >
              <option value="Select Status">Select Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Spacer */}
            <div className="hidden lg:block" />

            {/* ✅ SearchBar */}
            <SearchBar
              onChange={handleSearch}
              placeholder="Search"
            />
          </div>

          {/* ── Desktop Table (✅ Table) ── */}
          <div className="">
            <Table
              columns={columns}
              data={TableData}
              isLoading={isLoading}
              emptyMessage="No data found"
              keyExtractor={(d, i) => d._id || i}
            />
          </div>


        </div>

        {/* ── Pagination (✅ Pagination) ── */}
        {TableData?.length > 0 && (
          <Pagination
            currentPage={state.currentPage}
            totalPages={totalPages}
            onPageChange={(page) => update({ currentPage: page })}
          />
        )}
      </section>

      {/* ── Approve / Reject Modals ── */}
      <Modals
        deleteModal={deleteModal}
        setDeleteModal={setDeleteModal}
        setDeleteModal3={setDeleteModal3}
        check2={check2}
        setCheck2={setCheck2}
        handleApprove={handleApprove}
        handleReject={handleReject}
      />

      {/* ── Detail Modal (Bank / Note) ── */}
      <TwModal show={detailModal.show} onClose={closeDetail} backdrop="static">
        <TwModalHeader onClose={closeDetail}>
          {detailModal.title}
        </TwModalHeader>
        <TwModalBody>
          <textarea
            readOnly
            rows={6}
            value={detailModal.content}
            className="w-full p-3 border border-[#2b3440] rounded-lg bg-transparent text-white font-mono text-sm whitespace-pre-line resize-none focus:outline-none"
          />
        </TwModalBody>
        <TwModalFooter>
          <button
            className="px-5 py-2 font-semibold text-white bg-[#b9fd5c] hover:bg-[#ff7b1c] rounded-lg transition-all duration-300 text-sm"
            onClick={closeDetail}
          >
            Close
          </button>
        </TwModalFooter>
      </TwModal>

      {/* ── Animations ── */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        @keyframes slideUp {
          from { transform: translateY(25px); opacity: 0 }
          to { transform: translateY(0); opacity: 1 }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out }
        .animate-slideUp { animation: slideUp 0.3s ease-out }
      `}</style>
    </div>
  );
};

export default WithDraw;