import { CheckCircle, XCircle, Search, X } from "lucide-react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import ClipLoader from "../../reusableComponents/Loader/Loader";
import * as Yup from "yup";
import Pagination from "../../reusableComponents/paginations/Pagination";
import PerPageSelector from "../../reusableComponents/Filter/PerPageSelector";
import SearchBar from "../../reusableComponents/SearchBar/SearchBar";
import Modals from "../../reusableComponents/Modals/Modals";
import {
  useTransAmountUpdateMutation,
  useTransListQuery,
} from "../../Features/Wallet/walletApiSlice";
import {
  useLazyExportTransactionsQuery,
  useUpdateUTRMutation,
} from "../accountsApiSlice";
import { toast, ToastContainer } from "react-toastify";
import { formatDateWithAmPm } from "../../utils/dateUtils";

const LIST_SORT = "-transactionDate,-_id";

const STATUS_CARDS = [
  {
    key: "Completed",
    label: "Completed",
    Icon: CheckCircle,
  },
  {
    key: "Failed",
    label: "Failed",
    Icon: XCircle,
  },
];

const TABLE_COLUMNS = [
  { label: "S.No", key: "sno" },
  { label: "Name", key: "name" },
  { label: "Payment Method", key: "paymentMode" },
  { label: "Transaction Type", key: "transactionType" },
  { label: "Transaction Amount", key: "transactionAmount" },
  { label: "Transaction ID", key: "transactionId" },
  { label: "UTR / Ref ID", key: "utrRef" },
  { label: "Transaction Date", key: "transactionDate" },
  { label: "Updated By", key: "updatedBy" },
  { label: "Status", key: "transactionStatus" },
  { label: "Action", key: "action" },
];

const UTR_FIELDS = [
  {
    name: "transactionId",
    label: "Transaction ID",
    placeholder: "Enter or Edit Transaction ID",
  },
  {
    name: "utrNo",
    label: "Enter UTR / Ref Number",
    placeholder: "Enter UTR / Ref No.",
  },
];

const utrValidationSchema = Yup.object({
  transactionId: Yup.string()
    .matches(/^[0-9A-Za-z-]{6,40}$/, "Enter a valid Transaction ID")
    .required("Transaction ID is required"),
  utrNo: Yup.string()
    .matches(/^[0-9A-Za-z]{6,30}$/, "Enter valid UTR/Ref number")
    .required("UTR number is required"),
});

const Credits = () => {
  const [show, setShow] = useState(false);
  const [deleteModal1, setDeleteModal1] = useState(false);
  const [check, setCheck] = useState(false);
  const [id, setId] = useState("");
  const [status, setStatus] = useState("");
  const [editShow, setEditShow] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [utrModal, setUtrModal] = useState(false);
  const [utrTx, setUtrTx] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);

  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
    fromDate: "",
    toDate: "",
  });

  const exportRef = useRef(null);

  // ── RTK Query hooks ──
  const [updateTransaction] = useTransAmountUpdateMutation();
  const [updateUTR] = useUpdateUTRMutation();
  const [triggerExport, { isFetching: exporting }] =
    useLazyExportTransactionsQuery();

  const queryParams = new URLSearchParams({
    limit: state.perPage,
    page: state.currentPage,
    search: state.search,
    transactionType: "Credit",
    fromDate: state.fromDate || "",
    toDate: state.toDate || "",
    sort: LIST_SORT,
  }).toString();

  const {
    data: tableData,
    isLoading,
    refetch,
  } = useTransListQuery(queryParams);

  // ── Close export dropdown on outside click ──
  useEffect(() => {
    const handler = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    refetch();
  }, [state, refetch]);

  // ── Derived values ──
  const transactions = tableData?.data?.transactions || [];
  const statusCounts = tableData?.data?.statusCounts;
  const totalPages = tableData
    ? Math.ceil(tableData.data.total / state.perPage)
    : 1;

  // ── Handlers ──
  const handlePageChange = (page) =>
    setState((prev) => ({ ...prev, currentPage: page }));

  const handlePerPageChange = (value) =>
    setState((prev) => ({ ...prev, perPage: Number(value), currentPage: 1 }));

  const handleSearchChange = (value) =>
    setState((prev) => ({ ...prev, search: value, currentPage: 1 }));

  const handleDateChange = (key, value) =>
    setState((prev) => ({ ...prev, [key]: value, currentPage: 1 }));

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => setEditShow(false);

  const handleUpdate = async () => {
    try {
      await updateTransaction({
        transactionId: selectedData.transactionId,
        transactionAmount: parseFloat(selectedData.transactionAmount),
      }).unwrap();
      toast.success("Transaction updated!");
      handleClose();
      refetch();
    } catch (error) {
      console.error("Failed to update transaction:", error);
      toast.error("Update failed");
    }
  };

  // const download = async (fmt) => {
  //   setExportOpen(false);
  //   try {
  //     const blob = await triggerExport({
  //       format: fmt,
  //       transactionType: "Credit",
  //       search: state.search || undefined,
  //       fromDate: state.fromDate?.trim() || undefined,
  //       toDate: state.toDate?.trim() || undefined,
  //       sort: LIST_SORT,
  //     }).unwrap();

  //     const filename = `credits_export.${fmt}`;
  //     const href = URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = href;
  //     a.download = filename;
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //     URL.revokeObjectURL(href);
  //   } catch (e) {
  //     console.error("Export failed:", e);
  //     toast.error("Export failed. See console for details.");
  //   }
  // };

   const download = async (fmt) => {
  setExportOpen(false);
  try {
    const blob = await triggerExport({
        format: fmt,
        transactionType: "Credit",
        search: state.search || undefined,
        fromDate: state.fromDate?.trim() || undefined,
        toDate: state.toDate?.trim() || undefined,
        sort: LIST_SORT,
      }).unwrap();


    const filename = `credits_${state.fromDate || "all"}_${
      state.toDate || "all"
    }.${fmt}`;


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
    toast.error("Export failed. See console for details.");
  }
};

  const handleUtrSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const result = await updateUTR({
        id: utrTx._id,
        txId: values.transactionId.trim(),
        utrNo: values.utrNo.trim(),
      }).unwrap();

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
      toast.error(err?.data?.message || err.message || "UTR update failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render cell helper ──
  const renderCell = (tx, col, index) => {
    switch (col.key) {
      case "sno":
        return state.currentPage * state.perPage - (state.perPage - 1) + index;

      case "transactionAmount":
        return tx.transactionAmount.toFixed(2);

      case "transactionId":
        return tx.screenshotUrl ? (
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
        );

      case "utrRef":
        return tx.utrRef || "N/A";

      case "transactionDate":
        return formatDateWithAmPm(tx.transactionDate);

      case "updatedBy":
        return tx.updatedBy?.name || "N/A";

      case "action":
        return (
          <button
            className="px-3 py-1 text-xs border border-white/30 text-white rounded hover:bg-white/10 transition"
            onClick={() => {
              setUtrTx(tx);
              setUtrModal(true);
            }}
          >
            Edit
          </button>
        );

      default:
        return tx[col.key];
    }
  };

  // ── Edit modal fields config ──
  const editFields = selectedData
    ? [
        { label: "Name", value: selectedData.name, readOnly: true },
        {
          label: "Transaction Amount",
          name: "transactionAmount",
          value: selectedData.transactionAmount,
          readOnly: false,
        },
        {
          label: "Transaction Id",
          value: selectedData.transactionId,
          readOnly: true,
        },
      ]
    : [];

  return (
    <div>
      <ToastContainer position="top-right" autoClose={2000} />

      <section className="py-4">
        <div className="w-full px-4">
          <div className="w-full">
            <div className="bg-[#1a2128] rounded-lg px-4 pb-0 py-6">
              {/* ── Header with Export ── */}
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
                      {["xlsx", "pdf"].map((fmt) => (
                        <button
                          key={fmt}
                          className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-50"
                          onClick={() => download(fmt)}
                          disabled={exporting}
                        >
                          {fmt === "xlsx" ? "Excel (.xlsx)" : "PDF (.pdf)"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Status Cards ── */}
              {statusCounts && (
                <div className="flex flex-wrap justify-center gap-4 mb-6">
                  {STATUS_CARDS.map((card) => (
                    <div
                      key={card.key}
                      className="w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.75rem)]"
                    >
                      <div className="bg-[#282f35] shadow rounded-lg">
                        <div className="text-center py-3 text-white">
                          <div className="flex items-center justify-center gap-2">
                            <card.Icon size={24} className="text-white" />
                            <div>
                              <h5 className="mb-0 font-bold text-white text-lg">
                                {statusCounts[card.key]}
                              </h5>
                              <small className="text-white">{card.label}</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Filters Row ── */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                {/* Per Page Selector (Reusable) */}
                <PerPageSelector
                  value={state.perPage}
                  onChange={handlePerPageChange}
                  options={[10, 30, 50]}
                />

                {/* Date Filters */}
                {[
                  { label: "From", key: "fromDate" },
                  { label: "To", key: "toDate" },
                ].map(({ label, key }) => (
                  <div key={key} className="w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <label className="text-white text-sm whitespace-nowrap">
                        {label}
                      </label>
                      <input
                        type="date"
                        className="bg-white text-gray-900 rounded px-3 py-2 text-sm focus:outline-none"
                        value={state[key]}
                        onChange={(e) => handleDateChange(key, e.target.value)}
                      />
                    </div>
                  </div>
                ))}

                {/* Search Bar (Reusable) */}
                <SearchBar
                  value={state.search}
                  onChange={handleSearchChange}
                  placeholder="Search by name or txn id"
                />
              </div>

              {/* ── Table ── */}
              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="text-center py-8">
                    <ClipLoader size={50} color="#123abc" loading />
                  </div>
                ) : (
                  <table className="w-full text-sm text-left sidebar-scroll">
                    <thead className="bg-[#b9fd5c] text-black">
                      <tr className="border-b border-gray-600">
                        {TABLE_COLUMNS.map((col) => (
                          <th
                            key={col.key}
                            className="px-3 py-3 font-semibold whitespace-nowrap"
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {transactions.length > 0 ? (
                        transactions.map((tx, i) => (
                          <tr
                            key={tx.transactionId || i}
                            className="border-b border-gray-700 text-white hover:bg-white/5 transition"
                          >
                            {TABLE_COLUMNS.map((col) => (
                              <td
                                key={col.key}
                                className="px-3 py-3 whitespace-nowrap"
                              >
                                {renderCell(tx, col, i)}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={TABLE_COLUMNS.length}
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

            {/* Pagination (Reusable) */}
            <Pagination
              currentPage={state.currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </section>

      {/* ── Shared Modals ── */}
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

      {/* ── Edit Transaction Modal ── */}
      {editShow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#1a2128] rounded-lg w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h2 className="text-lg font-semibold text-white">
                Update Transaction
              </h2>
              <button
                className="text-gray-400 hover:text-white text-xl leading-none"
                onClick={handleClose}
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-4">
              {selectedData ? (
                <div className="space-y-4">
                  {editFields.map((field) => (
                    <div key={field.label}>
                      <label className="block text-sm text-gray-300 mb-1">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        name={field.name}
                        className={`w-full bg-transparent border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none ${
                          !field.readOnly ? "focus:border-blue-500" : ""
                        }`}
                        value={field.value}
                        readOnly={field.readOnly}
                        onChange={field.readOnly ? undefined : handleEditChange}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No data available.</p>
              )}
            </div>

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

      {/* ── UTR Modal ── */}
      {utrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#1a2128] rounded-lg w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h2 className="text-lg font-semibold text-white">
                Update UTR Number
              </h2>
              <button
                className="text-gray-400 hover:text-white text-xl leading-none"
                onClick={() => setUtrModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <Formik
              initialValues={{
                transactionId: utrTx?.transactionId || "",
                utrNo: "",
              }}
              validationSchema={utrValidationSchema}
              onSubmit={handleUtrSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="px-6 py-4 space-y-4">
                    {UTR_FIELDS.map((f) => (
                      <div key={f.name}>
                        <label className="block text-sm text-gray-300 mb-1">
                          {f.label}
                        </label>
                        <Field
                          name={f.name}
                          type="text"
                          placeholder={f.placeholder}
                          className="w-full bg-transparent border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500"
                        />
                        <ErrorMessage
                          name={f.name}
                          component="div"
                          className="text-red-400 text-xs mt-1"
                        />
                      </div>
                    ))}
                  </div>

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