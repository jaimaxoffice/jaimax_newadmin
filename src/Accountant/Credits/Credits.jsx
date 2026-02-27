import { Icon } from "@iconify/react/dist/iconify.js";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useEffect, useRef, useState } from "react";
// import { Button, Modal } from "react-bootstrap";
import  ClipLoader  from "../../reusableComponents/Loader/Loader";
import * as Yup from "yup";
import Pagination from "../../reusableComponents/paginations/Pagination";
import Modals from "../../reusableComponents/Modals/Modals";
import {
  useTransAmountUpdateMutation,
  useTransListQuery,
} from "../../Features/Wallet/walletApiSlice";
import { toast, ToastContainer } from "react-toastify";
import Cookies from "js-cookie"
const Credits = () => {
  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://192.168.128.1:3002/api";

  const LIST_SORT = "-transactionDate,-_id";

  const [show, setShow] = useState(false);
  const [deleteModal1, setDeleteModal1] = useState(false);
  const [check, setCheck] = useState(false);
  const [id, setId] = useState("");
  const [status, setStatus] = useState("");
  const [editShow, setEditShow] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [updateTransaction] = useTransAmountUpdateMutation();
  const [utrModal, setUtrModal] = useState(false);
  const [utrTx, setUtrTx] = useState(null);

  const [exporting, setExporting] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
    fromDate: "",
    toDate: "",
  });

  const exportRef = useRef(null);

  // Close export dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const queryParams = new URLSearchParams({
    limit: state.perPage,
    page: state.currentPage,
    search: state.search,
    transactionType: "Credit",
    fromDate: state.fromDate || "",
    toDate: state.toDate || "",
    sort: LIST_SORT,
  }).toString();

  const { data, isLoading, refetch } = useTransListQuery(queryParams);
  const tableData = data;

  useEffect(() => {
    refetch();
  }, [state, refetch]);

  const handlePageChange = (page) => setState({ ...state, currentPage: page });

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheck = (id, status) => {
    setCheck(true);
    setId(id);
    setStatus(status);
  };
  const handleDelete = (id) => {
    setDeleteModal1(true);
    setId(id);
  };
  const handleEdit = (data) => {
    setEditShow(true);
    setSelectedData(data);
  };
  const handleClose = () => setEditShow(false);

  const handleUpdate = async () => {
    try {
      await updateTransaction({
        transactionId: selectedData.transactionId,
        transactionAmount: parseFloat(selectedData.transactionAmount),
      });
      handleClose();
    } catch (error) {
      console.error("Failed to update transaction:", error);
    }
  };

  const formatDateWithAmPm = (isoString) => {
    const date = new Date(isoString);
    const dd = String(date.getUTCDate()).padStart(2, "0");
    const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
    const yyyy = date.getUTCFullYear();
    let hh = date.getUTCHours();
    const min = String(date.getUTCMinutes()).padStart(2, "0");
    const ampm = hh >= 12 ? "PM" : "AM";
    hh = hh % 12 || 12;
    return `${dd}-${mm}-${yyyy} ${hh}:${min} ${ampm}`;
  };

  const download = async (fmt) => {
    setExportOpen(false);
    setExporting(true);
    try {
      const q = new URLSearchParams();
      q.set("format", fmt);
      q.set("transactionType", "Credit");
      if (state.search) q.set("search", state.search);
      if (state.fromDate?.trim()) q.set("fromDate", state.fromDate);
      if (state.toDate?.trim()) q.set("toDate", state.toDate);
      q.set("sort", LIST_SORT);

      const url = `${API_BASE}/accounts/transactions/export?${q.toString()}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${Cookies.get("adminToken") || ""}`,
        },
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || `Export failed with ${res.status}`);
      }

      const blob = await res.blob();

      let filename = `credits_export.${fmt}`;
      const disposition = res.headers.get("content-disposition");
      if (disposition && disposition.includes("filename=")) {
        filename = disposition
          .split("filename=")[1]
          .trim()
          .replace(/["']/g, "");
      }

      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch (e) {
      console.error("Export failed:", e);
      alert("Export failed. See console for details.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={2000} />
      <section className="py-4">
        <div className="w-full px-4">
          <div className="w-full">
            <div className="bg-[#1a2128] rounded-lg px-4 pb-0 py-6">
              {/* Header */}
              <div className="flex flex-wrap justify-between items-center mb-4">
               
                <div className="relative mt-2 sm:mt-0" ref={exportRef}>
                  <button
                    type="button"
                    className="px-4 py-1.5 text-sm border border-white/30 text-white rounded hover:bg-white/10 transition disabled:opacity-50"
                    onClick={() => setExportOpen(!exportOpen)}
                    disabled={exporting}
                  >
                    {exporting ? "Exporting…" : "Export ▾"}
                  </button>
                  {exportOpen && (
                    <div className="absolute right-0 mt-1 w-40 bg-[#232d38] border border-gray-600 rounded shadow-lg z-50">
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-50"
                        onClick={() => download("xlsx")}
                        disabled={exporting}
                      >
                        Excel (.xlsx)
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-50"
                        onClick={() => download("pdf")}
                        disabled={exporting}
                      >
                        PDF (.pdf)
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Status counts */}
              {tableData?.data?.statusCounts && (
                <div className="flex flex-wrap justify-center gap-4 mb-6">
                  <div className="w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.75rem)]">
                    <div className="bg-[#282f35] shadow rounded-lg">
                      <div className="text-center py-3 text-white">
                        <div className="flex items-center justify-center gap-2">
                          <Icon
                            icon="material-symbols:check-circle"
                            width="24"
                            height="24"
                            className="text-white"
                          />
                          <div>
                            <h5 className="mb-0 font-bold text-white text-lg">
                              {tableData.data.statusCounts.Completed}
                            </h5>
                            <small className="text-white">Completed</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.75rem)]">
                    <div className="bg-[#282f35] shadow rounded-lg">
                      <div className="text-center py-3 text-white">
                        <div className="flex items-center justify-center gap-2">
                          <Icon
                            icon="material-symbols:cancel"
                            width="24"
                            height="24"
                            className="text-white"
                          />
                          <div>
                            <h5 className="mb-0 font-bold text-white text-lg">
                              {tableData.data.statusCounts.Failed}
                            </h5>
                            <small className="text-white">Failed</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                {/* Per page */}
                <div className="w-full sm:w-auto">
                  <select
                    className="bg-[#1a2128] text-white border border-[#313b48] rounded px-3 py-2 text-sm focus:outline-none focus:ring-0"
                    value={state.perPage}
                    onChange={(e) =>
                      setState({
                        ...state,
                        perPage: e.target.value,
                        currentPage: 1,
                      })
                    }
                  >
                    <option value="10">10</option>
                    <option value="30">30</option>
                    <option value="50">50</option>
                  </select>
                </div>

                {/* From date */}
                <div className="w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <label className="text-white text-sm whitespace-nowrap">
                      From
                    </label>
                    <input
                      type="date"
                      className="bg-white text-gray-900 rounded px-3 py-2 text-sm focus:outline-none"
                      value={state.fromDate}
                      onChange={(e) =>
                        setState({
                          ...state,
                          fromDate: e.target.value,
                          currentPage: 1,
                        })
                      }
                    />
                  </div>
                </div>

                {/* To date */}
                <div className="w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <label className="text-white text-sm whitespace-nowrap">
                      To
                    </label>
                    <input
                      type="date"
                      className="bg-white text-gray-900 rounded px-3 py-2 text-sm focus:outline-none"
                      value={state.toDate}
                      onChange={(e) =>
                        setState({
                          ...state,
                          toDate: e.target.value,
                          currentPage: 1,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Search */}
                <div className="w-full sm:w-auto flex-1 min-w-[200px]">
                  <div className="flex items-center border border-[#313b48] rounded bg-transparent">
                    <span className="px-3 py-2">
                      <Icon
                        icon="tabler:search"
                        width="16"
                        height="16"
                        className="text-white"
                      />
                    </span>
                    <input
                      type="text"
                      placeholder="Search by name or txn id"
                      className="flex-1 bg-transparent text-white text-sm py-2 pr-3 focus:outline-none placeholder-gray-400"
                      value={state.search}
                      onChange={(e) =>
                        setState({
                          ...state,
                          search: e.target.value,
                          currentPage: 1,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="text-center py-8">
                    <ClipLoader
                      size={50}
                      color={"#123abc"}
                      loading={isLoading}
                    />
                  </div>
                ) : (
                  <table className="w-full text-sm text-left sidebar-scroll">
                    <thead className="bg-[#b9fd5c] text-black">
                      <tr className="border-b border-gray-600 text-black bg-[#b9fd5c]">
                        <th className="px-3 py-3 font-semibold whitespace-nowrap">S.No</th>
                        <th className="px-3 py-3 font-semibold whitespace-nowrap">Name</th>
                        <th className="px-3 py-3 font-semibold whitespace-nowrap">Payment Method</th>
                        <th className="px-3 py-3 font-semibold whitespace-nowrap">Transaction Type</th>
                        <th className="px-3 py-3 font-semibold whitespace-nowrap">Transaction Amount</th>
                        <th className="px-3 py-3 font-semibold whitespace-nowrap">Transaction ID</th>
                        <th className="px-3 py-3 font-semibold whitespace-nowrap">UTR / Ref ID</th>
                        <th className="px-3 py-3 font-semibold whitespace-nowrap">Transaction Date</th>
                        <th className="px-3 py-3 font-semibold whitespace-nowrap">Updated By</th>
                        <th className="px-3 py-3 font-semibold whitespace-nowrap">Status</th>
                        <th className="px-3 py-3 font-semibold whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData?.data?.transactions?.length > 0 ? (
                        tableData.data.transactions.map((tx, i) => (
                          <tr
                            key={tx.transactionId || i}
                            className="border-b border-gray-700 text-white hover:bg-white/5 transition"
                          >
                            <td className="px-3 py-3 whitespace-nowrap">
                              {state.currentPage * state.perPage -
                                (state.perPage - 1) +
                                i}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">{tx.name}</td>
                            <td className="px-3 py-3 whitespace-nowrap">{tx.paymentMode}</td>
                            <td className="px-3 py-3 whitespace-nowrap">{tx.transactionType}</td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              {tx.transactionAmount.toFixed(2)}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              {tx.screenshotUrl ? (
                                <a
                                  href={tx.screenshotUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:underline"
                                >
                                  {tx.transactionId}
                                </a>
                              ) : (
                                tx.transactionId
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              {tx.utrRef ? tx.utrRef : "N/A"}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              {formatDateWithAmPm(tx.transactionDate)}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              {tx.updatedBy?.name || "N/A"}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">{tx.transactionStatus}</td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <button
                                className="px-3 py-1 text-xs border border-white/30 text-white rounded hover:bg-white/10 transition"
                                onClick={() => {
                                  setUtrTx(tx);
                                  setUtrModal(true);
                                }}
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="11"
                            className="text-center text-gray-400 py-6"
                          >
                            No credit transactions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <Pagination
              currentPage={state.currentPage}
              totalPages={
                tableData
                  ? Math.ceil(tableData.data.total / state.perPage)
                  : 1
              }
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </section>

      <Modals
        {...{
          show,
          setShow,
          deleteModal1,
          setDeleteModal1,
          check,
          setCheck,
          id,
          status,
        }}
      />

      {/* Edit Transaction Modal */}
      {editShow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#1a2128] rounded-lg w-full max-w-md mx-4 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h2 className="text-lg font-semibold text-white">
                Update Transaction
              </h2>
              <button
                className="text-gray-400 hover:text-white text-xl leading-none"
                onClick={handleClose}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4">
              {selectedData ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      className="w-full bg-transparent border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none"
                      value={selectedData.name}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">
                      Transaction Amount
                    </label>
                    <input
                      type="text"
                      name="transactionAmount"
                      className="w-full bg-transparent border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                      value={selectedData.transactionAmount}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">
                      Transaction Id
                    </label>
                    <input
                      type="text"
                      className="w-full bg-transparent border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none"
                      value={selectedData.transactionId}
                      readOnly
                    />
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">No data available.</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-center gap-3 px-6 pb-5 pt-2">
              <button
                className="px-8 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-500 transition"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                className="px-8 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-500 transition"
                onClick={handleUpdate}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UTR Modal */}
      {utrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#1a2128] rounded-lg w-full max-w-md mx-4 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h2 className="text-lg font-semibold text-white">
                Update UTR Number
              </h2>
              <button
                className="text-gray-400 hover:text-white text-xl leading-none"
                onClick={() => setUtrModal(false)}
              >
                ✕
              </button>
            </div>

            <Formik
              initialValues={{
                transactionId: utrTx?.transactionId || "",
                utrNo: "",
              }}
              validationSchema={Yup.object({
                transactionId: Yup.string()
                  .matches(
                    /^[0-9A-Za-z-]{6,40}$/,
                    "Enter a valid Transaction ID"
                  )
                  .required("Transaction ID is required"),
                utrNo: Yup.string()
                  .matches(
                    /^[0-9A-Za-z]{6,30}$/,
                    "Enter valid UTR/Ref number"
                  )
                  .required("UTR number is required"),
              })}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                try {
                  const res = await fetch(`${API_BASE}/wallet/update-utr`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${
                        Cookies.get("adminToken") || ""
                      }`,
                    },
                    body: JSON.stringify({
                      id: utrTx._id,
                      txId: values.transactionId.trim(),
                      utrNo: values.utrNo.trim(),
                    }),
                  });

                  if (!res.ok) {
                    const errText = await res.text().catch(() => "");
                    throw new Error(errText || `Error ${res.status}`);
                  }

                  const result = await res.json();
                  if (result?.success) {
                    toast.success("UTR updated successfully!");
                    setUtrModal(false);
                    resetForm();
                    refetch();
                  } else {
                    throw new Error(result?.message || "Update failed");
                  }
                } catch (err) {
                  console.error("UTR update failed:", err);
                  toast.error(err.message);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting }) => (
                <Form>
                  {/* Body */}
                  <div className="px-6 py-4 space-y-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">
                        Transaction ID
                      </label>
                      <Field
                        name="transactionId"
                        type="text"
                        placeholder="Enter or Edit Transaction ID"
                        className="w-full bg-transparent border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500"
                      />
                      <ErrorMessage
                        name="transactionId"
                        component="div"
                        className="text-red-400 text-xs mt-1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-1">
                        Enter UTR / Ref Number
                      </label>
                      <Field
                        name="utrNo"
                        type="text"
                        placeholder="Enter UTR / Ref No."
                        className="w-full bg-transparent border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500"
                      />
                      <ErrorMessage
                        name="utrNo"
                        component="div"
                        className="text-red-400 text-xs mt-1"
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-center gap-3 px-6 pb-5 pt-2">
                    <button
                      type="button"
                      className="px-8 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-500 transition"
                      onClick={() => setUtrModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-500 transition disabled:opacity-50 flex items-center gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <ClipLoader size={18} color="#fff" /> Saving…
                        </>
                      ) : (
                        "Submit"
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </div>
  );
};

export default Credits;