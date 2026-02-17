// import { Icon } from "@iconify/react/dist/iconify.js";
// import { ErrorMessage, Field, Form, Formik } from "formik";
// import { useEffect, useRef, useState } from "react";
// import * as Yup from "yup";
// import Pagination from "../../reusableComponents/paginations/Pagination";
// import Modals from "../../Features/Wallet/EditTransactionModal";
// import {
//   useTransAmountUpdateMutation,
//   useTransListQuery,
// } from "../../Features/Wallet/walletApiSlice";
// import { toast, ToastContainer } from "react-toastify";

// /* ── Reusable pure-Tailwind Modal ── */
// const TwModal = ({ show, onClose, children, backdrop = true }) => {
//   if (!show) return null;
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       {/* Backdrop */}
//       <div
//         className="absolute inset-0 bg-black/60"
//         onClick={backdrop === "static" ? undefined : onClose}
//       />
//       {/* Dialog */}
//       <div className="relative w-full max-w-lg bg-[#1a2128] border border-[#2b3440] rounded-xl shadow-2xl text-white z-10 max-h-[90vh] overflow-y-auto">
//         {children}
//       </div>
//     </div>
//   );
// };

// const TwModalHeader = ({ onClose, children }) => (
//   <div className="flex items-start justify-between p-4 border-b border-[#2b3440]">
//     <h5 className="text-lg font-semibold leading-snug">{children}</h5>
//     <button
//       onClick={onClose}
//       className="ml-4 text-gray-400 hover:text-white transition text-2xl leading-none"
//     >
//       ×
//     </button>
//   </div>
// );

// const TwModalBody = ({ children, className = "" }) => (
//   <div className={`p-4 ${className}`}>{children}</div>
// );

// const TwModalFooter = ({ children }) => (
//   <div className="flex flex-nowrap justify-center gap-4 p-4">{children}</div>
// );

// /* ── Tailwind dropdown for Export ── */
// const ExportDropdown = ({ exporting, onDownload }) => {
//   const [open, setOpen] = useState(false);
//   const ref = useRef(null);

//   useEffect(() => {
//     const handler = (e) => {
//       if (ref.current && !ref.current.contains(e.target)) setOpen(false);
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   return (
//     <div className="relative inline-block" ref={ref}>
//       <button
//         type="button"
//         className="px-3 py-1.5 text-xs sm:text-sm border border-gray-500 text-white rounded hover:bg-white/10 transition disabled:opacity-50"
//         onClick={() => setOpen((p) => !p)}
//         disabled={exporting}
//       >
//         {exporting ? "Exporting…" : "Export ▾"}
//       </button>
//       {open && (
//         <ul className="absolute right-0 mt-1 w-40 bg-[#1e2a34] border border-[#2b3440] rounded shadow-xl z-20 overflow-hidden">
//           <li>
//             <button
//               className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition"
//               onClick={() => {
//                 setOpen(false);
//                 onDownload("xlsx");
//               }}
//               disabled={exporting}
//             >
//               Excel (.xlsx)
//             </button>
//           </li>
//           <li>
//             <button
//               className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition"
//               onClick={() => {
//                 setOpen(false);
//                 onDownload("pdf");
//               }}
//               disabled={exporting}
//             >
//               PDF (.pdf)
//             </button>
//           </li>
//         </ul>
//       )}
//     </div>
//   );
// };

// /* ══════════════════════════════════════
//    CREDITS COMPONENT
//    ══════════════════════════════════════ */
// const Credits = () => {
//   const API_BASE =
//     import.meta.env.VITE_API_BASE_URL || "http://192.168.128.1:3002/api";
//   const LIST_SORT = "-transactionDate,-_id";

//   const [show, setShow] = useState(false);
//   const [deleteModal1, setDeleteModal1] = useState(false);
//   const [check, setCheck] = useState(false);
//   const [id, setId] = useState("");
//   const [status, setStatus] = useState("");
//   const [editShow, setEditShow] = useState(false);
//   const [selectedData, setSelectedData] = useState(null);
//   const [updateTransaction] = useTransAmountUpdateMutation();
//   const [utrModal, setUtrModal] = useState(false);
//   const [utrTx, setUtrTx] = useState(null);
//   const [exporting, setExporting] = useState(false);

//   const [state, setState] = useState({
//     currentPage: 1,
//     perPage: 10,
//     search: "",
//     fromDate: "",
//     toDate: "",
//   });

//   const queryParams = new URLSearchParams({
//     limit: state.perPage,
//     page: state.currentPage,
//     search: state.search,
//     transactionType: "Credit",
//     fromDate: state.fromDate || "",
//     toDate: state.toDate || "",
//     sort: LIST_SORT,
//   }).toString();

//   const { data, isLoading, refetch } = useTransListQuery(queryParams);
//   const tableData = data;

//   useEffect(() => {
//     refetch();
//   }, [state, refetch]);

//   /* ── handlers ── */
//   const handlePageChange = (page) => setState({ ...state, currentPage: page });

//   const handleEditChange = (e) => {
//     const { name, value } = e.target;
//     setSelectedData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleCheck = (tid, s) => {
//     setCheck(true);
//     setId(tid);
//     setStatus(s);
//   };
//   const handleDelete = (tid) => {
//     setDeleteModal1(true);
//     setId(tid);
//   };
//   const handleEdit = (d) => {
//     setEditShow(true);
//     setSelectedData(d);
//   };
//   const handleClose = () => setEditShow(false);

//   const handleUpdate = async () => {
//     try {
//       await updateTransaction({
//         transactionId: selectedData.transactionId,
//         transactionAmount: parseFloat(selectedData.transactionAmount),
//       });
//       handleClose();
//     } catch (error) {
//       console.error("Failed to update transaction:", error);
//     }
//   };

//   const formatDateWithAmPm = (isoString) => {
//     const date = new Date(isoString);
//     const dd = String(date.getUTCDate()).padStart(2, "0");
//     const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
//     const yyyy = date.getUTCFullYear();
//     let hh = date.getUTCHours();
//     const min = String(date.getUTCMinutes()).padStart(2, "0");
//     const ampm = hh >= 12 ? "PM" : "AM";
//     hh = hh % 12 || 12;
//     return `${dd}-${mm}-${yyyy} ${hh}:${min} ${ampm}`;
//   };

//   const download = async (fmt) => {
//     setExporting(true);
//     try {
//       const q = new URLSearchParams();
//       q.set("format", fmt);
//       q.set("transactionType", "Credit");
//       if (state.search) q.set("search", state.search);
//       if (state.fromDate?.trim()) q.set("fromDate", state.fromDate);
//       if (state.toDate?.trim()) q.set("toDate", state.toDate);
//       q.set("sort", LIST_SORT);

//       const url = `${API_BASE}/accounts/transactions/export?${q.toString()}`;
//       const res = await fetch(url, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
//         },
//       });
//       if (!res.ok) {
//         const errText = await res.text().catch(() => "");
//         throw new Error(errText || `Export failed with ${res.status}`);
//       }

//       const blob = await res.blob();
//       let filename = `credits_export.${fmt}`;
//       const disposition = res.headers.get("content-disposition");
//       if (disposition && disposition.includes("filename=")) {
//         filename = disposition
//           .split("filename=")[1]
//           .trim()
//           .replace(/["']/g, "");
//       }

//       const href = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = href;
//       a.download = filename;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       URL.revokeObjectURL(href);
//     } catch (e) {
//       console.error("Export failed:", e);
//       alert("Export failed. See console for details.");
//     } finally {
//       setExporting(false);
//     }
//   };

//   /* ── Input base classes ── */
//   const inputBase =
//     "w-full bg-transparent border border-[#313b48] rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

//   return (
//     <div>
//       <ToastContainer position="top-right" autoClose={2000} />

//       <section className="py-4 px-2 sm:px-4 lg:px-6 min-h-screen bg-[#0b1218]">
//         <div className="w-full">
//           {/* ── Main Card ── */}
//           <div className="bg-[#1a2128] border border-[#2b3440] rounded-xl px-3 sm:px-4 md:px-5 pb-1 pt-4 overflow-x-hidden">
//             {/* Header */}
//             <div className="flex flex-wrap justify-between items-center mb-4">
//               <h1 className="font-bold text-white text-xl sm:text-2xl md:text-3xl leading-none">
//                 Credits
//               </h1>
//               <ExportDropdown exporting={exporting} onDownload={download} />
//             </div>

//             {/* ── Status Cards ── */}
//             {tableData?.data?.statusCounts && (
//               <div className="flex flex-col sm:flex-row justify-center gap-3 mb-5">
//                 {/* Completed */}
//                 <div className="flex-1 min-w-0 bg-green-500/20 rounded-xl flex items-center justify-center py-4 gap-2">
//                   <Icon
//                     icon="material-symbols:check-circle"
//                     width="26"
//                     height="26"
//                     className="text-green-400 shrink-0"
//                   />
//                   <div className="text-center">
//                     <p className="text-xl font-bold text-white leading-none mb-0.5">
//                       {tableData.data.statusCounts.Completed}
//                     </p>
//                     <span className="text-xs text-green-300">Completed</span>
//                   </div>
//                 </div>

//                 {/* Failed */}
//                 <div className="flex-1 min-w-0 bg-red-500/20 rounded-xl flex items-center justify-center py-4 gap-2">
//                   <Icon
//                     icon="material-symbols:cancel"
//                     width="26"
//                     height="26"
//                     className="text-red-400 shrink-0"
//                   />
//                   <div className="text-center">
//                     <p className="text-xl font-bold text-white leading-none mb-0.5">
//                       {tableData.data.statusCounts.Failed}
//                     </p>
//                     <span className="text-xs text-red-300">Failed</span>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* ── Filters ── */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[auto_1fr_1fr_1fr] gap-3 mb-4 items-end">
//               {/* Per-page */}
//               <select
//                 className="bg-[#1a2128] text-white border border-[#313b48] rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-auto"
//                 value={state.perPage}
//                 onChange={(e) =>
//                   setState({
//                     ...state,
//                     perPage: e.target.value,
//                     currentPage: 1,
//                   })
//                 }
//               >
//                 <option value="10">10</option>
//                 <option value="30">30</option>
//                 <option value="50">50</option>
//               </select>

//               {/* From */}
//               <div className="flex items-center gap-2">
//                 <label className="text-white text-sm whitespace-nowrap">
//                   From
//                 </label>
//                 <input
//                   type="date"
//                   className="bg-white text-gray-900 rounded-md px-2 py-2 text-sm w-full focus:outline-none"
//                   value={state.fromDate}
//                   onChange={(e) =>
//                     setState({
//                       ...state,
//                       fromDate: e.target.value,
//                       currentPage: 1,
//                     })
//                   }
//                 />
//               </div>

//               {/* To */}
//               <div className="flex items-center gap-2">
//                 <label className="text-white text-sm whitespace-nowrap">
//                   To
//                 </label>
//                 <input
//                   type="date"
//                   className="bg-white text-gray-900 rounded-md px-2 py-2 text-sm w-full focus:outline-none"
//                   value={state.toDate}
//                   onChange={(e) =>
//                     setState({
//                       ...state,
//                       toDate: e.target.value,
//                       currentPage: 1,
//                     })
//                   }
//                 />
//               </div>

//               {/* Search */}
//               <div className="flex items-center border border-[#313b48] rounded-md overflow-hidden">
//                 <span className="px-2.5 flex items-center">
//                   <Icon
//                     icon="tabler:search"
//                     width="16"
//                     height="16"
//                     className="text-gray-400"
//                   />
//                 </span>
//                 <input
//                   type="text"
//                   placeholder="Search by name or txn id"
//                   className="bg-transparent text-white text-sm py-2 pr-3 w-full focus:outline-none placeholder:text-gray-500"
//                   value={state.search}
//                   onChange={(e) =>
//                     setState({
//                       ...state,
//                       search: e.target.value,
//                       currentPage: 1,
//                     })
//                   }
//                 />
//               </div>
//             </div>

//             {/* ── Table ── */}
//             <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-5">
//               {isLoading ? (
//                 <div className="flex justify-center py-10">
//                   {/* <ClipLoader size={44} color="#3b82f6" /> */}
//                 </div>
//               ) : (
//                 <table className="w-full text-sm text-left">
//                   <thead className="bg-[#131a21] text-gray-400 text-xs uppercase tracking-wider">
//                     <tr>
//                       {[
//                         "S.No",
//                         "Name",
//                         "Payment Method",
//                         "Txn Type",
//                         "Amount",
//                         "Transaction ID",
//                         "UTR / Ref",
//                         "Date",
//                         "Updated By",
//                         "Status",
//                         "Action",
//                       ].map((h) => (
//                         <th key={h} className="px-4 py-3 whitespace-nowrap">
//                           {h}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-[#1e2a34]">
//                     {tableData?.data?.transactions?.length > 0 ? (
//                       tableData.data.transactions.map((tx, i) => (
//                         <tr
//                           key={tx.transactionId || i}
//                           className="hover:bg-white/5 transition"
//                         >
//                           <td className="px-4 py-3">
//                             {state.currentPage * state.perPage -
//                               (state.perPage - 1) +
//                               i}
//                           </td>
//                           <td className="px-4 py-3 whitespace-nowrap">
//                             {tx.name}
//                           </td>
//                           <td className="px-4 py-3">{tx.paymentMode}</td>
//                           <td className="px-4 py-3">{tx.transactionType}</td>
//                           <td className="px-4 py-3">
//                             {tx.transactionAmount.toFixed(2)}
//                           </td>
//                           <td className="px-4 py-3">
//                             {tx.screenshotUrl ? (
//                               <a
//                                 href={tx.screenshotUrl}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="text-blue-400 hover:underline"
//                               >
//                                 {tx.transactionId}
//                               </a>
//                             ) : (
//                               tx.transactionId
//                             )}
//                           </td>
//                           <td className="px-4 py-3">
//                             {tx.utrRef || "N/A"}
//                           </td>
//                           <td className="px-4 py-3 whitespace-nowrap">
//                             {formatDateWithAmPm(tx.transactionDate)}
//                           </td>
//                           <td className="px-4 py-3">
//                             {tx.updatedBy?.name || "N/A"}
//                           </td>
//                           <td className="px-4 py-3">
//                             <span
//                               className={`px-2 py-0.5 rounded-full text-xs font-medium ${
//                                 tx.transactionStatus === "Completed"
//                                   ? "bg-green-500/20 text-green-400"
//                                   : tx.transactionStatus === "Failed"
//                                   ? "bg-red-500/20 text-red-400"
//                                   : "bg-yellow-500/20 text-yellow-400"
//                               }`}
//                             >
//                               {tx.transactionStatus}
//                             </span>
//                           </td>
//                           <td className="px-4 py-3">
//                             <button
//                               className="px-3 py-1 text-xs border border-gray-500 text-white rounded hover:bg-white/10 transition"
//                               onClick={() => {
//                                 setUtrTx(tx);
//                                 setUtrModal(true);
//                               }}
//                             >
//                               Edit
//                             </button>
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td
//                           colSpan="11"
//                           className="text-center py-10 text-gray-500"
//                         >
//                           No credit transactions found
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               )}
//             </div>
//           </div>

//           {/* Pagination */}
//           <Pagination
//             currentPage={state.currentPage}
//             totalPages={
//               tableData
//                 ? Math.ceil(tableData.data.total / state.perPage)
//                 : 1
//             }
//             onPageChange={handlePageChange}
//           />
//         </div>
//       </section>

//       {/* ── Wallet Modals (approve / reject) ── */}
//       <Modals
//         {...{
//           show,
//           setShow,
//           deleteModal1,
//           setDeleteModal1,
//           check,
//           setCheck,
//           id,
//           status,
//         }}
//       />

//       {/* ── Edit Transaction Modal ── */}
//       <TwModal
//         show={editShow}
//         onClose={handleClose}
//         backdrop="static"
//       >
//         <TwModalHeader onClose={handleClose}>Update Transaction</TwModalHeader>
//         <TwModalBody>
//           {selectedData ? (
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm text-gray-400 mb-1">
//                   Name
//                 </label>
//                 <input
//                   type="text"
//                   className={`${inputBase} opacity-60 cursor-not-allowed`}
//                   value={selectedData.name}
//                   readOnly
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm text-gray-400 mb-1">
//                   Transaction Amount
//                 </label>
//                 <input
//                   type="text"
//                   name="transactionAmount"
//                   className={inputBase}
//                   value={selectedData.transactionAmount}
//                   onChange={handleEditChange}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm text-gray-400 mb-1">
//                   Transaction Id
//                 </label>
//                 <input
//                   type="text"
//                   className={`${inputBase} opacity-60 cursor-not-allowed`}
//                   value={selectedData.transactionId}
//                   readOnly
//                 />
//               </div>
//             </div>
//           ) : (
//             <p className="text-gray-500">No data available.</p>
//           )}
//         </TwModalBody>
//         <TwModalFooter>
//           <button
//             className="px-6 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white text-sm transition"
//             onClick={handleClose}
//           >
//             Cancel
//           </button>
//           <button
//             className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm transition"
//             onClick={handleUpdate}
//           >
//             Update
//           </button>
//         </TwModalFooter>
//       </TwModal>

//       {/* ── UTR Modal ── */}
//       <TwModal
//         show={utrModal}
//         onClose={() => setUtrModal(false)}
//         backdrop="static"
//       >
//         <TwModalHeader onClose={() => setUtrModal(false)}>
//           Update UTR Number
//         </TwModalHeader>

//         <Formik
//           enableReinitialize
//           initialValues={{
//             transactionId: utrTx?.transactionId || "",
//             utrNo: "",
//           }}
//           validationSchema={Yup.object({
//             transactionId: Yup.string()
//               .matches(/^[0-9A-Za-z-]{6,40}$/, "Enter a valid Transaction ID")
//               .required("Transaction ID is required"),
//             utrNo: Yup.string()
//               .matches(/^[0-9A-Za-z]{6,30}$/, "Enter valid UTR/Ref number")
//               .required("UTR number is required"),
//           })}
//           onSubmit={async (values, { setSubmitting, resetForm }) => {
//             try {
//               const res = await fetch(`${API_BASE}/wallet/update-utr`, {
//                 method: "POST",
//                 headers: {
//                   "Content-Type": "application/json",
//                   Authorization: `Bearer ${
//                     localStorage.getItem("token") || ""
//                   }`,
//                 },
//                 body: JSON.stringify({
//                   id: utrTx._id,
//                   txId: values.transactionId.trim(),
//                   utrNo: values.utrNo.trim(),
//                 }),
//               });

//               if (!res.ok) {
//                 const errText = await res.text().catch(() => "");
//                 throw new Error(errText || `Error ${res.status}`);
//               }

//               const result = await res.json();
//               if (result?.success) {
//                 toast.success("UTR updated successfully!");
//                 setUtrModal(false);
//                 resetForm();
//                 refetch();
//               } else {
//                 throw new Error(result?.message || "Update failed");
//               }
//             } catch (err) {
//               console.error("UTR update failed:", err);
//               toast.error(err.message);
//             } finally {
//               setSubmitting(false);
//             }
//           }}
//         >
//           {({ isSubmitting }) => (
//             <Form>
//               <TwModalBody>
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm text-gray-400 mb-1">
//                       Transaction ID
//                     </label>
//                     <Field
//                       name="transactionId"
//                       type="text"
//                       placeholder="Enter or Edit Transaction ID"
//                       className={inputBase}
//                     />
//                     <ErrorMessage
//                       name="transactionId"
//                       component="div"
//                       className="text-red-500 text-xs mt-1"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm text-gray-400 mb-1">
//                       Enter UTR / Ref Number
//                     </label>
//                     <Field
//                       name="utrNo"
//                       type="text"
//                       placeholder="Enter UTR / Ref No."
//                       className={inputBase}
//                     />
//                     <ErrorMessage
//                       name="utrNo"
//                       component="div"
//                       className="text-red-500 text-xs mt-1"
//                     />
//                   </div>
//                 </div>
//               </TwModalBody>

//               <TwModalFooter>
//                 <button
//                   type="button"
//                   className="px-6 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white text-sm transition"
//                   onClick={() => setUtrModal(false)}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={isSubmitting}
//                   className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm transition disabled:opacity-50 flex items-center gap-2"
//                 >
//                   {isSubmitting ? (
//                     <>
//                       {/* <ClipLoader size={16} color="#fff" /> */}
//                       Saving…
//                     </>
//                   ) : (
//                     "Submit"
//                   )}
//                 </button>
//               </TwModalFooter>
//             </Form>
//           )}
//         </Formik>
//       </TwModal>
//     </div>
//   );
// };

// export default Credits;



// Pages/Credits/Credits.jsx
import { Icon } from "@iconify/react/dist/iconify.js";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";

// API
import {
  useTransAmountUpdateMutation,
  useTransListQuery,
} from "../../Features/Wallet/walletApiSlice";
import Modals from "../../Features/Wallet/EditTransactionModal";

// ✅ YOUR EXISTING REUSABLE COMPONENTS
import Table from "../../reusableComponents/Tables/Table";
import Pagination from "../../reusableComponents/paginations/Pagination";
import StatCard from "../../reusableComponents/StatCards/StatsCard";
import MobileCard from "../../reusableComponents/MobileCards/MobileCards";
import MobileCardList from "../../reusableComponents/MobileCards/MobileCardList";
import SearchBar from "../../reusableComponents/searchBar/SearchBar";

const TwModal = ({ show, onClose, children, backdrop = true }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={backdrop === "static" ? undefined : onClose}
      />
      <div className="relative w-full max-w-lg bg-[#1a2128] border border-[#2b3440] rounded-xl shadow-2xl text-white z-10 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

const TwModalHeader = ({ onClose, children }) => (
  <div className="flex items-start justify-between p-4 border-b border-[#2b3440]">
    <h5 className="text-lg font-semibold leading-snug">{children}</h5>
    <button
      onClick={onClose}
      className="ml-4 text-gray-400 hover:text-white transition text-2xl leading-none"
    >
      ×
    </button>
  </div>
);

const TwModalBody = ({ children, className = "" }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

const TwModalFooter = ({ children }) => (
  <div className="flex flex-nowrap justify-center gap-4 p-4">{children}</div>
);

const ExportDropdown = ({ exporting, onDownload }) => {
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
        className="px-3 py-1.5 text-xs sm:text-sm border border-gray-500 text-white rounded hover:bg-white/10 transition disabled:opacity-50"
        onClick={() => setOpen((p) => !p)}
        disabled={exporting}
      >
        {exporting ? "Exporting…" : "Export ▾"}
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
                  onDownload(f.key);
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

const StatusBadge = ({ status }) => {
  const colors = {
    Completed: "bg-green-500/20 text-green-400",
    Failed: "bg-red-500/20 text-red-400",
    Pending: "bg-yellow-500/20 text-yellow-400",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        colors[status] || "bg-gray-500/20 text-gray-400"
      }`}
    >
      {status}
    </span>
  );
};


const Credits = () => {
  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://192.168.128.1:3002/api";
  const LIST_SORT = "-transactionDate,-_id";

  /* ── State ── */
  const [show, setShow] = useState(false);
  const [deleteModal1, setDeleteModal1] = useState(false);
  const [check, setCheck] = useState(false);
  const [id, setId] = useState("");
  const [status, setStatus] = useState("");
  const [editShow, setEditShow] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [utrModal, setUtrModal] = useState(false);
  const [utrTx, setUtrTx] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [updateTransaction] = useTransAmountUpdateMutation();

  const [state, setState] = useState({
    currentPage: 1,
    perPage: 10,
    search: "",
    fromDate: "",
    toDate: "",
  });

  const update = (patch) => setState((p) => ({ ...p, ...patch }));

  /* ── API Query ── */
  const queryParams = new URLSearchParams({
    limit: state.perPage,
    page: state.currentPage,
    search: state.search,
    transactionType: "Credit",
    fromDate: state.fromDate || "",
    toDate: state.toDate || "",
    sort: LIST_SORT,
  }).toString();

  const { data: tableData, isLoading, refetch } = useTransListQuery(queryParams);

  useEffect(() => {
    refetch();
  }, [state, refetch]);

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

  /* ── Serial Number Calculator ── */
  const getSerialNo = (index) =>
    state.currentPage * state.perPage - (state.perPage - 1) + index;

  /* ── Handlers ── */
  const handleClose = () => setEditShow(false);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedData((p) => ({ ...p, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      await updateTransaction({
        transactionId: selectedData.transactionId,
        transactionAmount: parseFloat(selectedData.transactionAmount),
      });
      handleClose();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  /* ── Export ── */
  const download = async (fmt) => {
    setExporting(true);
    try {
      const q = new URLSearchParams();
      q.set("format", fmt);
      q.set("transactionType", "Credit");
      if (state.search) q.set("search", state.search);
      if (state.fromDate?.trim()) q.set("fromDate", state.fromDate);
      if (state.toDate?.trim()) q.set("toDate", state.toDate);
      q.set("sort", LIST_SORT);

      const res = await fetch(
        `${API_BASE}/accounts/transactions/export?${q}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );
      if (!res.ok)
        throw new Error(
          (await res.text().catch(() => "")) || `Export failed ${res.status}`
        );

      const blob = await res.blob();
      let filename = `credits_export.${fmt}`;
      const disp = res.headers.get("content-disposition");
      if (disp?.includes("filename="))
        filename = disp.split("filename=")[1].trim().replace(/["']/g, "");

      const a = Object.assign(document.createElement("a"), {
        href: URL.createObjectURL(blob),
        download: filename,
      });
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error("Export failed:", e);
      alert("Export failed.");
    } finally {
      setExporting(false);
    }
  };

  /* ── UTR Submit ── */
  const utrSchema = Yup.object({
    transactionId: Yup.string()
      .matches(/^[0-9A-Za-z-]{6,40}$/, "Enter a valid Transaction ID")
      .required("Transaction ID is required"),
    utrNo: Yup.string()
      .matches(/^[0-9A-Za-z]{6,30}$/, "Enter valid UTR/Ref number")
      .required("UTR number is required"),
  });

  const handleUtrSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const res = await fetch(`${API_BASE}/wallet/update-utr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({
          id: utrTx._id,
          txId: values.transactionId.trim(),
          utrNo: values.utrNo.trim(),
        }),
      });
      if (!res.ok)
        throw new Error(
          (await res.text().catch(() => "")) || `Error ${res.status}`
        );
      const result = await res.json();
      if (result?.success) {
        toast.success("UTR updated successfully!");
        setUtrModal(false);
        resetForm();
        refetch();
      } else throw new Error(result?.message || "Update failed");
    } catch (err) {
      console.error("UTR update failed:", err);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ═══════════════════════════════════
     TABLE COLUMNS CONFIG
     (used by your reusable <Table />)
     ═══════════════════════════════════ */
  const columns = [
    {
      key: "sno",
      header: "S.No",
      render: (_, i) => getSerialNo(i),
    },
    {
      key: "name",
      header: "Name",
      accessor: "name",
      nowrap: true,
    },
    {
      key: "paymentMode",
      header: "Payment Method",
      accessor: "paymentMode",
    },
    {
      key: "transactionType",
      header: "Txn Type",
      accessor: "transactionType",
    },
    {
      key: "amount",
      header: "Amount",
      render: (tx) => tx.transactionAmount.toFixed(2),
    },
    {
      key: "transactionId",
      header: "Transaction ID",
      render: (tx) =>
        tx.screenshotUrl ? (
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
        ),
    },
    {
      key: "utrRef",
      header: "UTR / Ref",
      render: (tx) => tx.utrRef || "N/A",
    },
    {
      key: "date",
      header: "Date",
      nowrap: true,
      render: (tx) => formatDate(tx.transactionDate),
    },
    {
      key: "updatedBy",
      header: "Updated By",
      render: (tx) => tx.updatedBy?.name || "N/A",
    },
    {
      key: "status",
      header: "Status",
      render: (tx) => <StatusBadge status={tx.transactionStatus} />,
    },
    {
      key: "action",
      header: "Action",
      render: (tx) => (
        <button
          className="px-3 py-1 text-xs border border-gray-500 text-white rounded hover:bg-white/10 transition"
          onClick={() => {
            setUtrTx(tx);
            setUtrModal(true);
          }}
        >
          Edit
        </button>
      ),
    },
  ];


  const mobileFields = [
    { label: "Name", key: "name" },
    { label: "Payment Method", key: "paymentMode" },
    { label: "Txn Type", key: "transactionType" },
    {
      label: "Amount",
      render: (tx) => tx.transactionAmount.toFixed(2),
    },
    {
      label: "Transaction ID",
      render: (tx) =>
        tx.screenshotUrl ? (
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
        ),
    },
    {
      label: "UTR / Ref",
      render: (tx) => tx.utrRef || "N/A",
    },
    {
      label: "Date",
      render: (tx) => formatDate(tx.transactionDate),
    },
    {
      label: "Updated By",
      render: (tx) => tx.updatedBy?.name || "N/A",
    },
    {
      label: "Status",
      render: (tx) => <StatusBadge status={tx.transactionStatus} />,
    },
  ];

  /* ── Computed values ── */
  const transactions = tableData?.data?.transactions || [];
  const totalPages = tableData
    ? Math.ceil(tableData.data.total / state.perPage)
    : 1;
  const statusCounts = tableData?.data?.statusCounts;

  const inputBase =
    "w-full bg-transparent border border-[#313b48] rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  /* ═══════════════ RENDER ═══════════════ */
  return (
    <div>
      <ToastContainer position="top-right" autoClose={2000} />

      <section className="py-4 px-2 sm:px-4 lg:px-6 min-h-screen bg-[#0b1218]">
        <div className="w-full">
          <div className="bg-[#1a2128] border border-[#2b3440] rounded-xl px-3 sm:px-4 md:px-5 pb-1 pt-4 overflow-x-hidden">
            {/* ═══ Header ═══ */}
            <div className="flex flex-wrap justify-between items-center mb-4">
              <h1 className="font-bold text-white text-xl sm:text-2xl md:text-3xl leading-none">
                Credits
              </h1>
              <ExportDropdown exporting={exporting} onDownload={download} />
            </div>

            {/* ═══ Status Cards (✅ YOUR StatCard) ═══ */}
            {statusCounts && (
              <div className="flex flex-col sm:flex-row justify-center gap-3 mb-5">
                <StatCard
                  icon="material-symbols:check-circle"
                  value={statusCounts.Completed}
                  title="Completed"
                  variant="green"
                  bgClass="bg-[#193b33] "
                />
                <StatCard
                  icon="material-symbols:cancel"
                  value={statusCounts.Failed}
                  title="Failed"
                  variant="red"
                  bgClass="bg-[#4a262f] "
                />
              </div>
            )}

            {/* ═══ Filters ═══ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[auto_1fr_1fr_1fr] gap-3 mb-4 items-end">
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

              {/* From Date */}
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

              {/* To Date */}
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

              {/* ✅ YOUR SearchBar */}
              <SearchBar
                value={state.search}
                onChange={(e) =>
                  update({ search: e.target.value, currentPage: 1 })
                }
                placeholder="Search by name or txn id"
              />
            </div>

            {/* ═══ Desktop Table (✅ YOUR Table) ═══ */}
            <div className="rounded-lg ">
              <Table
                columns={columns}
                data={transactions}
                isLoading={isLoading}
                emptyMessage="No credit transactions found"
                keyExtractor={(tx, i) => tx.transactionId || i}
              />
            </div>


          </div>

          {/* ═══ Pagination (✅ YOUR Pagination) ═══ */}
          <Pagination
            currentPage={state.currentPage}
            totalPages={totalPages}
            onPageChange={(page) => update({ currentPage: page })}
          />
        </div>
      </section>

      {/* ═══ Wallet Modals ═══ */}
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

      {/* ═══ Edit Transaction Modal ═══ */}
      <TwModal show={editShow} onClose={handleClose} backdrop="static">
        <TwModalHeader onClose={handleClose}>
          Update Transaction
        </TwModalHeader>
        <TwModalBody>
          {selectedData ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  className={`${inputBase} opacity-60 cursor-not-allowed`}
                  value={selectedData.name}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Transaction Amount
                </label>
                <input
                  type="text"
                  name="transactionAmount"
                  className={inputBase}
                  value={selectedData.transactionAmount}
                  onChange={handleEditChange}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Transaction Id
                </label>
                <input
                  type="text"
                  className={`${inputBase} opacity-60 cursor-not-allowed`}
                  value={selectedData.transactionId}
                  readOnly
                />
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No data available.</p>
          )}
        </TwModalBody>
        <TwModalFooter>
          <button
            className="px-6 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white text-sm transition"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm transition"
            onClick={handleUpdate}
          >
            Update
          </button>
        </TwModalFooter>
      </TwModal>

      {/* ═══ UTR Modal ═══ */}
      <TwModal
        show={utrModal}
        onClose={() => setUtrModal(false)}
        backdrop="static"
      >
        <TwModalHeader onClose={() => setUtrModal(false)}>
          Update UTR Number
        </TwModalHeader>

        <Formik
          enableReinitialize
          initialValues={{
            transactionId: utrTx?.transactionId || "",
            utrNo: "",
          }}
          validationSchema={utrSchema}
          onSubmit={handleUtrSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <TwModalBody>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Transaction ID
                    </label>
                    <Field
                      name="transactionId"
                      type="text"
                      placeholder="Enter or Edit Transaction ID"
                      className={inputBase}
                    />
                    <ErrorMessage
                      name="transactionId"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Enter UTR / Ref Number
                    </label>
                    <Field
                      name="utrNo"
                      type="text"
                      placeholder="Enter UTR / Ref No."
                      className={inputBase}
                    />
                    <ErrorMessage
                      name="utrNo"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                </div>
              </TwModalBody>
              <TwModalFooter>
                <button
                  type="button"
                  className="px-6 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white text-sm transition"
                  onClick={() => setUtrModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? "Saving…" : "Submit"}
                </button>
              </TwModalFooter>
            </Form>
          )}
        </Formik>
      </TwModal>
    </div>
  );
};

export default Credits;