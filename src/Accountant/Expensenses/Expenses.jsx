// import React, { useState, useRef, useEffect } from "react";
// import { Icon } from "@iconify/react/dist/iconify.js";
// import { Formik, Form, Field, ErrorMessage } from "formik";
// import * as Yup from "yup";
// import {
//   useUploadDocumentMutation,
//   useGetDocumentsQuery,
//   useUpdateDocumentMutation,
//   useDeleteDocumentMutation,
// } from "./expensesApiSlice";
// import Pagination from "../../reusableComponents/paginations/Pagination";
// import { Eye, ChevronDown } from "lucide-react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// /* ── Tailwind Modal Shell ── */
// const TwModal = ({ show, onClose, size = "max-w-lg", children }) => {
//   if (!show) return null;
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/70" onClick={onClose} />
//       <div
//         className={`relative w-full ${size} bg-[#1a2128] border border-[#444] rounded-xl shadow-2xl text-white z-10 max-h-[90vh] overflow-y-auto`}
//       >
//         {children}
//       </div>
//     </div>
//   );
// };

// const TwModalHeader = ({ onClose, children }) => (
//   <div className="flex items-start justify-between p-4 border-b border-[#444]">
//     <h5 className="text-lg font-semibold">{children}</h5>
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
//   <div className="flex justify-end gap-3 p-4 border-t border-[#444]">
//     {children}
//   </div>
// );

// /* ── Export Dropdown ── */
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
//         </ul>
//       )}
//     </div>
//   );
// };

// /* ── Shared input class ── */
// const inputCls =
//   "w-full bg-[#1a2128] border border-[#444] rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#eb660f]";

// const selectWrap = "relative";
// const chevronCls =
//   "absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none text-xs";

// /* ══════════════════════════════════════
//    INTERNAL EXPENSES COMPONENT
//    ══════════════════════════════════════ */
// const InternalExpenses = () => {
//   const [FormOpen, setFormOpen] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [selectedExpense, setSelectedExpense] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
//   const [expenseToDelete, setExpenseToDelete] = useState(null);
//   const [exporting, setExporting] = useState(false);
//   const perPage = 10;

//   const [queryParam, setQueryParam] = useState(`page=1&limit=${perPage}`);

//   const API_BASE = import.meta.env.VITE_API_BASE_URL;

//   const handleUploadClick = () => {
//     setEditMode(false);
//     setSelectedExpense(null);
//     setFormOpen(true);
//   };

//   const handleEditClick = (expense) => {
//     setEditMode(true);
//     setSelectedExpense(expense);
//     setFormOpen(true);
//   };

//   const handleClose = () => {
//     setFormOpen(false);
//     setEditMode(false);
//     setSelectedExpense(null);
//   };

//   const handleDeleteClick = (expense) => {
//     setExpenseToDelete(expense);
//     setDeleteConfirmModal(true);
//   };

//   const handleCancelDelete = () => {
//     setDeleteConfirmModal(false);
//     setExpenseToDelete(null);
//   };

//   const [uploadDocument] = useUploadDocumentMutation();
//   const [updateDocument] = useUpdateDocumentMutation();
//   const [deleteDocument, { isLoading: isDeleting }] =
//     useDeleteDocumentMutation();

//   const storedUserData = JSON.parse(
//     localStorage.getItem("userData") || "{}"
//   );
//   const username = storedUserData?.data?.username || "N/A";
//   const name = storedUserData?.data?.name || "N/A";
//   const userId = storedUserData?.data?._id || "";

//   const {
//     data: documentsData,
//     isLoading,
//     refetch,
//   } = useGetDocumentsQuery(queryParam);

//   const ExpenseSchema = Yup.object().shape({
//     category: Yup.string().required("Category is required"),
//     amount: Yup.number()
//       .typeError("Amount must be a number")
//       .required("Amount is required"),
//     transactionBill: editMode
//       ? Yup.mixed().nullable()
//       : Yup.mixed().required("Transaction Bill is required"),
//     supportBill: Yup.mixed().nullable(),
//     otherBill: Yup.mixed().nullable(),
//     title: Yup.string().required("Title is required"),
//     date: Yup.string().required("Date is required"),
//     moneySource: Yup.string().required("Money Source is required"),
//   });

//   const formatDateYYYYMMDD = (isoString) => {
//     if (!isoString) return "-";
//     const d = new Date(isoString);
//     return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
//   };

//   const handleFormSubmit = async (values, { resetForm }) => {
//     try {
//       const formData = new FormData();
//       if (values.transactionBill instanceof File)
//         formData.append("transactionBill", values.transactionBill);
//       if (values.supportBill instanceof File)
//         formData.append("supportBill", values.supportBill);
//       if (values.otherBill instanceof File)
//         formData.append("otherBill", values.otherBill);

//       formData.append("title", values.title);
//       formData.append("category", values.category);
//       formData.append("description", values.description);
//       formData.append("amount", values.amount);
//       formData.append("moneySource", values.moneySource);
//       formData.append("utrNumber", values.utrNumber?.trim() || "");
//       formData.append("date", values.date);
//       formData.append("username", username);
//       formData.append("name", name);
//       formData.append("userId", userId);

//       if (editMode && selectedExpense) {
//         await updateDocument({
//           id: selectedExpense._id,
//           data: formData,
//         }).unwrap();
//       } else {
//         await uploadDocument(formData).unwrap();
//       }

//       resetForm();
//       handleClose();
//       refetch();
//     } catch (err) {
//       console.error("Operation failed", err);
//     }
//   };

//   const handleConfirmDelete = async () => {
//     if (!expenseToDelete) return;
//     try {
//       await deleteDocument(expenseToDelete._id).unwrap();
//       handleCancelDelete();
//       refetch();
//     } catch (err) {
//       console.error("Delete failed", err);
//     }
//   };

//   const download = async (fmt) => {
//     setExporting(true);
//     try {
//       const q = new URLSearchParams();
//       q.set("format", fmt);
//       if (searchTerm.trim())
//         q.set("search", encodeURIComponent(searchTerm.trim()));
//       if (startDate) q.set("from", startDate);
//       if (endDate) q.set("to", endDate);

//       const res = await fetch(
//         `${API_BASE}/internalexpenes/export?${q.toString()}`,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
//           },
//         }
//       );

//       if (!res.ok) throw new Error(`Export failed with ${res.status}`);

//       const blob = await res.blob();
//       let filename = `internal_expenses_export.${fmt}`;
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
//       toast.success("Export successful!");
//     } catch (e) {
//       console.error("Export failed:", e);
//       toast.error("Export failed. Please try again.");
//     } finally {
//       setExporting(false);
//     }
//   };

//   const expenseList = Array.isArray(documentsData?.data?.data)
//     ? documentsData.data.data
//     : [];
//   const pagination = documentsData?.data?.pagination || {};
//   const totalCount = pagination.total || 0;
//   const totalPages = pagination.totalPages || 1;

//   const buildQueryParam = () => {
//     const params = [];
//     if (searchTerm.trim())
//       params.push(`search=${encodeURIComponent(searchTerm.trim())}`);
//     if (startDate) params.push(`from=${startDate}`);
//     if (endDate) params.push(`to=${endDate}`);
//     params.push(`page=${currentPage}`);
//     params.push(`limit=${perPage}`);
//     return params.join("&");
//   };

//   const handleFilter = () => {
//     setCurrentPage(1);
//     setQueryParam(buildQueryParam());
//   };

//   const handleReset = () => {
//     setSearchTerm("");
//     setStartDate("");
//     setEndDate("");
//     setCurrentPage(1);
//     setQueryParam("");
//   };

//   const handlePageChange = (page) => setCurrentPage(page);

//   useEffect(() => {
//     setQueryParam(buildQueryParam());
//   }, [currentPage]);

//   const viewBtnCls =
//     "inline-flex items-center justify-center px-2.5 py-1.5 text-white bg-[#eb660f] hover:bg-[#d45a0d] rounded text-xs transition";

//   return (
//     <div>
//       <ToastContainer position="top-right" autoClose={2000} />

//       <section className="py-3 sm:py-4 px-1 sm:px-3 md:px-4 min-h-screen bg-[#0b1218]">
//         <div className="w-full">
//           {/* ── Main Card ── */}
//           <div className="bg-[#1a2128] border border-[#2b3440] rounded-xl px-3 sm:px-4 md:px-5 pb-1 pt-4 overflow-x-hidden">
//             {/* Header */}
//             <div className="flex flex-wrap justify-between items-center mb-4">
//               <h1 className="font-bold text-white text-lg sm:text-xl md:text-2xl leading-none">
//                 Internal Expenses
//               </h1>
//               <ExportDropdown exporting={exporting} onDownload={download} />
//             </div>

//             {/* ── Summary Cards ── */}
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
//               {/* Total Monthly Amount */}
//               <div className="bg-[#4c4320] rounded-xl p-4 text-white flex flex-col items-center justify-center text-center min-h-25">
//                 <h6 className="text-sm mb-1 opacity-90">
//                   Total Monthly Amount
//                 </h6>
//                 <h3 className="text-2xl font-bold">
//                   ₹{pagination?.totalAmount?.toLocaleString() || 0}
//                 </h3>
//               </div>

//               {/* Total Bills */}
//               <div className="bg-[#154555] rounded-xl p-4 text-white flex flex-col items-center justify-center text-center min-h-25">
//                 <h6 className="text-sm mb-1 opacity-90">Total Bills</h6>
//                 <h3 className="text-2xl font-bold">{totalCount || 0}</h3>
//               </div>

//               {/* Upload Card */}
//               <div
//                 className="bg-[#173632] rounded-xl p-4 text-white flex flex-col items-center justify-center text-center min-h-25 cursor-pointer hover:opacity-90 transition"
//                 onClick={handleUploadClick}
//               >
//                 <Icon
//                   icon="material-symbols:upload"
//                   width="32"
//                   height="32"
//                   className="text-white mb-2"
//                 />
//                 <h5 className="font-bold text-base mb-0">Upload</h5>
//                 <small className="text-white/50">Expense Bill</small>
//               </div>
//             </div>

//             {/* ── Filters ── */}
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
//               <div className="text-white text-sm">
//                 Showing{" "}
//                 {expenseList.length > 0
//                   ? (currentPage - 1) * perPage + 1
//                   : 0}{" "}
//                 - {Math.min(currentPage * perPage, totalCount)} of{" "}
//                 {totalCount} results
//               </div>

//               <div className="flex flex-wrap gap-2 items-center">
//                 <input
//                   type="date"
//                   className={`${inputCls} w-40`}
//                   value={startDate}
//                   onChange={(e) => setStartDate(e.target.value)}
//                 />
//                 <input
//                   type="date"
//                   className={`${inputCls} w-40`}
//                   value={endDate}
//                   onChange={(e) => setEndDate(e.target.value)}
//                 />
//                 <input
//                   type="text"
//                   placeholder="Search by UTR"
//                   className={`${inputCls} w-50`}
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") handleFilter();
//                   }}
//                 />
//                 <button
//                   className="px-4 py-2 bg-[#eb660f] hover:bg-[#d45a0d] text-white text-sm rounded transition disabled:opacity-50"
//                   onClick={handleFilter}
//                   disabled={isLoading}
//                 >
//                   {isLoading ? "Loading..." : "Fetch"}
//                 </button>
//               </div>
//             </div>

//             {/* ── Table ── */}
//             <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-5">
//               <table className="w-full text-sm text-left">
//                 <thead className="bg-[#131a21] text-gray-400 text-xs uppercase tracking-wider">
//                   <tr>
//                     {[
//                       "S.No",
//                       "Date of Bill",
//                       "Name",
//                       "Category",
//                       "Title",
//                       "Amount",
//                       "MoneySource",
//                       "UTR",
//                       "Uploaded Date",
//                       "Description",
//                       "Transaction Bill",
//                       "Support Bill",
//                       "Other Bill",
//                       "Actions",
//                     ].map((h) => (
//                       <th
//                         key={h}
//                         className={`px-4 py-3 whitespace-nowrap ${
//                           h === "Description"
//                             ? "min-w-62.5 max-w-75 text-center"
//                             : ""
//                         }`}
//                       >
//                         {h}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-[#1e2a34]">
//                   {isLoading ? (
//                     [...Array(10)].map((_, i) => (
//                       <tr key={i}>
//                         {[...Array(14)].map((_, j) => (
//                           <td key={j} className="px-4 py-3">
//                             <div
//                               baseColor="#1e2a34"
//                               highlightColor="#2a3744"
//                             />
//                           </td>
//                         ))}
//                       </tr>
//                     ))
//                   ) : expenseList.length > 0 ? (
//                     expenseList.map((doc, idx) => (
//                       <tr
//                         key={doc._id}
//                         className="hover:bg-white/5 transition"
//                       >
//                         <td className="px-4 py-3">
//                           {(currentPage - 1) * perPage + idx + 1}
//                         </td>
//                         <td className="px-4 py-3 whitespace-nowrap">
//                           {doc.date || "-"}
//                         </td>
//                         <td className="px-4 py-3 whitespace-nowrap">
//                           {doc.name || "-"}
//                         </td>
//                         <td className="px-4 py-3">{doc.category}</td>
//                         <td className="px-4 py-3">{doc.title}</td>
//                         <td className="px-4 py-3">
//                           ₹{Number(doc.amount).toLocaleString()}
//                         </td>
//                         <td className="px-4 py-3">{doc.moneySource}</td>
//                         <td className="px-4 py-3">
//                           {doc.utrNumber || "-"}
//                         </td>
//                         <td className="px-4 py-3 whitespace-nowrap">
//                           {formatDateYYYYMMDD(doc.createdAt)}
//                         </td>
//                         <td className="px-4 py-3 min-w-62.5 max-w-75 whitespace-normal wrap-break-words">
//                           {doc.description || ""}
//                         </td>
//                         <td className="px-4 py-3 text-center">
//                           {doc.transactionBill ? (
//                             <a
//                               href={doc.transactionBill}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className={viewBtnCls}
//                             >
//                               <Eye />
//                             </a>
//                           ) : (
//                             "-"
//                           )}
//                         </td>
//                         <td className="px-4 py-3 text-center">
//                           {doc.supportBill ? (
//                             <a
//                               href={doc.supportBill}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className={viewBtnCls}
//                             >
//                               <Eye />
//                             </a>
//                           ) : (
//                             "-"
//                           )}
//                         </td>
//                         <td className="px-4 py-3 text-center">
//                           {doc.otherBill ? (
//                             <a
//                               href={doc.otherBill}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className={viewBtnCls}
//                             >
//                               <Eye />
//                             </a>
//                           ) : (
//                             "-"
//                           )}
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="flex gap-2">
//                             <button
//                               className="p-1.5 bg-[#eb660f] hover:bg-[#d45a0d] text-white rounded text-xs transition"
//                               onClick={() => handleEditClick(doc)}
//                               title="Edit"
//                             >
//                               <Icon
//                                 icon="mdi:pencil"
//                                 width="16"
//                                 height="16"
//                               />
//                             </button>
//                             <button
//                               className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition"
//                               onClick={() => handleDeleteClick(doc)}
//                               title="Delete"
//                             >
//                               <Icon
//                                 icon="mdi:delete"
//                                 width="16"
//                                 height="16"
//                               />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td
//                         colSpan="14"
//                         className="text-center py-10 text-gray-500"
//                       >
//                         {queryParam
//                           ? "No records found for the selected filters"
//                           : "No expenses found. Upload your first expense!"}
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination */}
//             {totalCount > 0 && (
//               <div className="mt-3">
//                 <Pagination
//                   currentPage={currentPage}
//                   totalPages={totalPages}
//                   onPageChange={handlePageChange}
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       </section>

//       {/* ═══════════════════════════════════
//           UPLOAD / EDIT EXPENSE MODAL
//          ═══════════════════════════════════ */}
//       <TwModal
//         show={FormOpen}
//         onClose={handleClose}
//         size="max-w-3xl"
//       >
//         <TwModalHeader onClose={handleClose}>
//           {editMode ? "Edit Expense Bill" : "Upload Expense Bill"}
//         </TwModalHeader>

//         <TwModalBody>
//           <Formik
//             initialValues={{
//               category: selectedExpense?.category || "",
//               amount: selectedExpense?.amount || "",
//               description: selectedExpense?.description || "",
//               transactionBill: null,
//               supportBill: null,
//               otherBill: null,
//               title: selectedExpense?.title || "",
//               utrNumber: selectedExpense?.utrNumber || "",
//               date: selectedExpense?.date || "",
//               moneySource: selectedExpense?.moneySource || "",
//             }}
//             validationSchema={ExpenseSchema}
//             onSubmit={handleFormSubmit}
//             enableReinitialize
//           >
//             {({ setFieldValue, isSubmitting }) => (
//               <Form className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {/* Title */}
//                   <div>
//                     <label className="block text-sm text-gray-400 mb-1">
//                       Title *
//                     </label>
//                     <Field
//                       name="title"
//                       className={inputCls}
//                       placeholder="Enter expense title"
//                     />
//                     <ErrorMessage
//                       name="title"
//                       component="div"
//                       className="text-red-500 text-xs mt-1"
//                     />
//                   </div>

//                   {/* Category */}
//                   <div>
//                     <label className="block text-sm text-gray-400 mb-1">
//                       Category *
//                     </label>
//                     <div className={selectWrap}>
//                       <Field name="category" as="select" className={inputCls}>
//                         <option value="">Select Category</option>
//                         <option value="Office Expenses">
//                           Office Expenses
//                         </option>
//                         <option value="Marketing Expenses">
//                           Marketing Expenses
//                         </option>
//                         <option value="Tools Expenses">
//                           Tools Expenses
//                         </option>
//                         <option value="other">Other</option>
//                       </Field>
//                       <ChevronDown className={chevronCls} />
//                     </div>
//                     <ErrorMessage
//                       name="category"
//                       component="div"
//                       className="text-red-500 text-xs mt-1"
//                     />
//                   </div>

//                   {/* Amount */}
//                   <div>
//                     <label className="block text-sm text-gray-400 mb-1">
//                       Amount (₹) *
//                     </label>
//                     <Field
//                       name="amount"
//                       type="number"
//                       className={inputCls}
//                       placeholder="Enter amount"
//                     />
//                     <ErrorMessage
//                       name="amount"
//                       component="div"
//                       className="text-red-500 text-xs mt-1"
//                     />
//                   </div>

//                   {/* Money Source */}
//                   <div>
//                     <label className="block text-sm text-gray-400 mb-1">
//                       Money Source *
//                     </label>
//                     <div className={selectWrap}>
//                       <Field
//                         name="moneySource"
//                         as="select"
//                         className={inputCls}
//                       >
//                         <option value="">Select Money Source</option>
//                         <option value="Office Money">Office Money</option>
//                         <option value="Manager Money">
//                           Manager Money
//                         </option>
//                         <option value="Others">Others</option>
//                       </Field>
//                       <ChevronDown className={chevronCls} />
//                     </div>
//                     <ErrorMessage
//                       name="moneySource"
//                       component="div"
//                       className="text-red-500 text-xs mt-1"
//                     />
//                   </div>

//                   {/* UTR Number */}
//                   <div>
//                     <label className="block text-sm text-gray-400 mb-1">
//                       UTR Number
//                     </label>
//                     <Field
//                       name="utrNumber"
//                       className={inputCls}
//                       placeholder="Enter UTR number"
//                     />
//                     <ErrorMessage
//                       name="utrNumber"
//                       component="div"
//                       className="text-red-500 text-xs mt-1"
//                     />
//                   </div>

//                   {/* Date */}
//                   <div>
//                     <label className="block text-sm text-gray-400 mb-1">
//                       Date *
//                     </label>
//                     <Field name="date" type="date" className={inputCls} />
//                     <ErrorMessage
//                       name="date"
//                       component="div"
//                       className="text-red-500 text-xs mt-1"
//                     />
//                   </div>
//                 </div>

//                 {/* File uploads */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   {/* Transaction Bill */}
//                   <div>
//                     <label className="block text-sm text-gray-400 mb-1">
//                       Transaction Bill {!editMode && "*"}
//                     </label>
//                     <input
//                       name="transactionBill"
//                       type="file"
//                       className={inputCls}
//                       accept=".pdf,.jpg,.jpeg,.png"
//                       onChange={(e) =>
//                         setFieldValue(
//                           "transactionBill",
//                           e.currentTarget.files[0]
//                         )
//                       }
//                     />
//                     <ErrorMessage
//                       name="transactionBill"
//                       component="div"
//                       className="text-red-500 text-xs mt-1"
//                     />
//                     {editMode && selectedExpense?.transactionBill && (
//                       <small className="text-cyan-400 block mt-1">
//                         Current:{" "}
//                         <a
//                           href={selectedExpense.transactionBill}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="text-cyan-400 underline"
//                         >
//                           View
//                         </a>
//                       </small>
//                     )}
//                     <small className="block text-white/60 text-xs">
//                       {editMode ? "Upload new to replace" : "PDF, JPG, PNG"}
//                     </small>
//                   </div>

//                   {/* Support Bill */}
//                   <div>
//                     <label className="block text-sm text-gray-400 mb-1">
//                       Support Bill
//                     </label>
//                     <input
//                       name="supportBill"
//                       type="file"
//                       className={inputCls}
//                       accept=".pdf,.jpg,.jpeg,.png"
//                       onChange={(e) =>
//                         setFieldValue(
//                           "supportBill",
//                           e.currentTarget.files[0]
//                         )
//                       }
//                     />
//                     <ErrorMessage
//                       name="supportBill"
//                       component="div"
//                       className="text-red-500 text-xs mt-1"
//                     />
//                     {editMode && selectedExpense?.supportBill && (
//                       <small className="text-cyan-400 block mt-1">
//                         Current:{" "}
//                         <a
//                           href={selectedExpense.supportBill}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="text-cyan-400 underline"
//                         >
//                           View
//                         </a>
//                       </small>
//                     )}
//                     <small className="block text-white/60 text-xs">
//                       Optional
//                     </small>
//                   </div>

//                   {/* Other Bill */}
//                   <div>
//                     <label className="block text-sm text-gray-400 mb-1">
//                       Other Bill
//                     </label>
//                     <input
//                       name="otherBill"
//                       type="file"
//                       className={inputCls}
//                       accept=".pdf,.jpg,.jpeg,.png"
//                       onChange={(e) =>
//                         setFieldValue(
//                           "otherBill",
//                           e.currentTarget.files[0]
//                         )
//                       }
//                     />
//                     <ErrorMessage
//                       name="otherBill"
//                       component="div"
//                       className="text-red-500 text-xs mt-1"
//                     />
//                     {editMode && selectedExpense?.otherBill && (
//                       <small className="text-cyan-400 block mt-1">
//                         Current:{" "}
//                         <a
//                           href={selectedExpense.otherBill}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="text-cyan-400 underline"
//                         >
//                           View
//                         </a>
//                       </small>
//                     )}
//                     <small className="block text-white/60 text-xs">
//                       Optional
//                     </small>
//                   </div>
//                 </div>

//                 {/* Description */}
//                 <div>
//                   <label className="block text-sm text-gray-400 mb-1">
//                     Description
//                   </label>
//                   <Field
//                     name="description"
//                     as="textarea"
//                     rows="3"
//                     className={inputCls}
//                     placeholder="Enter expense description"
//                   />
//                   <ErrorMessage
//                     name="description"
//                     component="div"
//                     className="text-red-500 text-xs mt-1"
//                   />
//                 </div>

//                 {/* Buttons */}
//                 <div className="flex justify-end gap-3 pt-2">
//                   <button
//                     type="button"
//                     className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition"
//                     onClick={handleClose}
//                     disabled={isSubmitting}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="px-5 py-2 bg-[#eb660f] hover:bg-[#d45a0d] text-white text-sm rounded transition disabled:opacity-50 flex items-center gap-2"
//                     disabled={isSubmitting}
//                   >
//                     {isSubmitting && (
//                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                     )}
//                     {isSubmitting
//                       ? editMode
//                         ? "Updating..."
//                         : "Uploading..."
//                       : editMode
//                       ? "Update Expense"
//                       : "Upload Expense"}
//                   </button>
//                 </div>
//               </Form>
//             )}
//           </Formik>
//         </TwModalBody>
//       </TwModal>

//       {/* ═══════════════════════════════════
//           DELETE CONFIRMATION MODAL
//          ═══════════════════════════════════ */}
//       <TwModal
//         show={deleteConfirmModal}
//         onClose={handleCancelDelete}
//       >
//         <TwModalHeader onClose={handleCancelDelete}>
//           Confirm Delete
//         </TwModalHeader>

//         <TwModalBody>
//           <p className="mb-3">
//             Are you sure you want to delete this expense?
//           </p>

//           {expenseToDelete && (
//             <div className="bg-yellow-500/15 border border-yellow-500/30 rounded-lg p-3 mb-3 text-sm">
//               <p className="mb-1">
//                 <strong>Title:</strong> {expenseToDelete.title}
//               </p>
//               <p className="mb-1">
//                 <strong>Amount:</strong> ₹
//                 {Number(expenseToDelete.amount).toLocaleString()}
//               </p>
//               <p className="mb-0">
//                 <strong>UTR:</strong> {expenseToDelete.utrNumber}
//               </p>
//             </div>
//           )}

//           <p className="text-red-400 text-sm flex items-center gap-2 mb-0">
//             <Icon icon="mdi:alert" width="18" />
//             This operation is irreversible
//           </p>
//         </TwModalBody>

//         <TwModalFooter>
//           <button
//             className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition"
//             onClick={handleCancelDelete}
//             disabled={isDeleting}
//           >
//             Cancel
//           </button>
//           <button
//             className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition disabled:opacity-50 flex items-center gap-2"
//             onClick={handleConfirmDelete}
//             disabled={isDeleting}
//           >
//             {isDeleting ? (
//               <>
//                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                 Deleting...
//               </>
//             ) : (
//               <>
//                 <Icon icon="mdi:delete" width="16" />
//                 Delete Expense
//               </>
//             )}
//           </button>
//         </TwModalFooter>
//       </TwModal>
//     </div>
//   );
// };

// export default InternalExpenses;

// Pages/InternalExpenses/InternalExpenses.jsx
import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Eye, ChevronDown } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  useUploadDocumentMutation,
  useGetDocumentsQuery,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
} from "./expensesApiSlice";

// ✅ YOUR REUSABLE COMPONENTS
import Table from "../../reusableComponents/Tables/Table";
import Pagination from "../../reusableComponents/paginations/Pagination";
import StatCard from "../../reusableComponents/StatCards/StatsCard";
import MobileCard from "../../reusableComponents/MobileCards/MobileCards";
import MobileCardList from "../../reusableComponents/MobileCards/MobileCardList";
import SearchBar from "../../reusableComponents/searchBar/SearchBar";

/* ── Modal Components ── */
const TwModal = ({ show, onClose, size = "max-w-lg", children }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        className={`relative w-full ${size} bg-[#1a2128] border border-[#444] rounded-xl shadow-2xl text-white z-10 max-h-[90vh] overflow-y-auto`}
      >
        {children}
      </div>
    </div>
  );
};

const TwModalHeader = ({ onClose, children }) => (
  <div className="flex items-start justify-between p-4 border-b border-[#444]">
    <h5 className="text-lg font-semibold">{children}</h5>
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
  <div className="flex justify-end gap-3 p-4 border-t border-[#444]">
    {children}
  </div>
);

/* ── Export Dropdown ── */
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
          <li>
            <button
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition"
              onClick={() => {
                setOpen(false);
                onDownload("xlsx");
              }}
              disabled={exporting}
            >
              Excel (.xlsx)
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

/* ── Bill View Button ── */
const BillViewButton = ({ url }) => {
  if (!url) return <span className="text-gray-500">-</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center px-2.5 py-1.5 text-white bg-[#eb660f] hover:bg-[#d45a0d] rounded text-xs transition"
    >
      <Eye size={14} />
    </a>
  );
};

/* ── Shared Styles ── */
const inputCls =
  "w-full bg-[#1a2128] border border-[#444] rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#eb660f]";
const selectWrap = "relative";
const chevronCls =
  "absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none text-xs";

/* ── Date Formatter ── */
const formatDateYYYYMMDD = (isoString) => {
  if (!isoString) return "-";
  const d = new Date(isoString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/* ═══════════════════════════════════
   INTERNAL EXPENSES COMPONENT
   ═══════════════════════════════════ */
const InternalExpenses = () => {
  /* ── State ── */
  const [FormOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [exporting, setExporting] = useState(false);
  const perPage = 10;

  const [queryParam, setQueryParam] = useState(`page=1&limit=${perPage}`);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  /* ── API ── */
  const [uploadDocument] = useUploadDocumentMutation();
  const [updateDocument] = useUpdateDocumentMutation();
  const [deleteDocument, { isLoading: isDeleting }] =
    useDeleteDocumentMutation();

  const {
    data: documentsData,
    isLoading,
    refetch,
  } = useGetDocumentsQuery(queryParam);

  /* ── User Data ── */
  const storedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
  const username = storedUserData?.data?.username || "N/A";
  const name = storedUserData?.data?.name || "N/A";
  const userId = storedUserData?.data?._id || "";

  /* ── Computed ── */
  const expenseList = Array.isArray(documentsData?.data?.data)
    ? documentsData.data.data
    : [];
  const pagination = documentsData?.data?.pagination || {};
  const totalCount = pagination.total || 0;
  const totalPages = pagination.totalPages || 1;

  const getSerialNo = (i) => (currentPage - 1) * perPage + i + 1;

  /* ── Query Builder ── */
  const buildQueryParam = () => {
    const params = [];
    if (searchTerm.trim())
      params.push(`search=${encodeURIComponent(searchTerm.trim())}`);
    if (startDate) params.push(`from=${startDate}`);
    if (endDate) params.push(`to=${endDate}`);
    params.push(`page=${currentPage}`);
    params.push(`limit=${perPage}`);
    return params.join("&");
  };

  useEffect(() => {
    setQueryParam(buildQueryParam());
  }, [currentPage]);

  /* ── Handlers ── */
  const handleUploadClick = () => {
    setEditMode(false);
    setSelectedExpense(null);
    setFormOpen(true);
  };

  const handleEditClick = (expense) => {
    setEditMode(true);
    setSelectedExpense(expense);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditMode(false);
    setSelectedExpense(null);
  };

  const handleDeleteClick = (expense) => {
    setExpenseToDelete(expense);
    setDeleteConfirmModal(true);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmModal(false);
    setExpenseToDelete(null);
  };

  const handleFilter = () => {
    setCurrentPage(1);
    setQueryParam(buildQueryParam());
  };

  const handleReset = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    setQueryParam("");
  };

  /* ── Form Submit ── */
  const ExpenseSchema = Yup.object().shape({
    category: Yup.string().required("Category is required"),
    amount: Yup.number()
      .typeError("Amount must be a number")
      .required("Amount is required"),
    transactionBill: editMode
      ? Yup.mixed().nullable()
      : Yup.mixed().required("Transaction Bill is required"),
    supportBill: Yup.mixed().nullable(),
    otherBill: Yup.mixed().nullable(),
    title: Yup.string().required("Title is required"),
    date: Yup.string().required("Date is required"),
    moneySource: Yup.string().required("Money Source is required"),
  });

  const handleFormSubmit = async (values, { resetForm }) => {
    try {
      const formData = new FormData();
      if (values.transactionBill instanceof File)
        formData.append("transactionBill", values.transactionBill);
      if (values.supportBill instanceof File)
        formData.append("supportBill", values.supportBill);
      if (values.otherBill instanceof File)
        formData.append("otherBill", values.otherBill);

      formData.append("title", values.title);
      formData.append("category", values.category);
      formData.append("description", values.description);
      formData.append("amount", values.amount);
      formData.append("moneySource", values.moneySource);
      formData.append("utrNumber", values.utrNumber?.trim() || "");
      formData.append("date", values.date);
      formData.append("username", username);
      formData.append("name", name);
      formData.append("userId", userId);

      if (editMode && selectedExpense) {
        await updateDocument({
          id: selectedExpense._id,
          data: formData,
        }).unwrap();
      } else {
        await uploadDocument(formData).unwrap();
      }

      resetForm();
      handleClose();
      refetch();
    } catch (err) {
      console.error("Operation failed", err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    try {
      await deleteDocument(expenseToDelete._id).unwrap();
      handleCancelDelete();
      refetch();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  /* ── Export ── */
  const download = async (fmt) => {
    setExporting(true);
    try {
      const q = new URLSearchParams();
      q.set("format", fmt);
      if (searchTerm.trim())
        q.set("search", encodeURIComponent(searchTerm.trim()));
      if (startDate) q.set("from", startDate);
      if (endDate) q.set("to", endDate);

      const res = await fetch(
        `${API_BASE}/internalexpenes/export?${q.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        },
      );

      if (!res.ok) throw new Error(`Export failed with ${res.status}`);

      const blob = await res.blob();
      let filename = `internal_expenses_export.${fmt}`;
      const disposition = res.headers.get("content-disposition");
      if (disposition?.includes("filename=")) {
        filename = disposition
          .split("filename=")[1]
          .trim()
          .replace(/["']/g, "");
      }

      const a = Object.assign(document.createElement("a"), {
        href: URL.createObjectURL(blob),
        download: filename,
      });
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Export successful!");
    } catch (e) {
      console.error("Export failed:", e);
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  /* ── Table Columns ── */
  const columns = [
    {
      key: "sno",
      header: "S.No",
      render: (_, i) => getSerialNo(i),
    },
    {
      key: "date",
      header: "Date of Bill",
      nowrap: true,
      render: (doc) => doc.date || "-",
    },
    {
      key: "name",
      header: "Name",
      nowrap: true,
      render: (doc) => doc.name || "-",
    },
    {
      key: "category",
      header: "Category",
      accessor: "category",
    },
    {
      key: "title",
      header: "Title",
      accessor: "title",
    },
    {
      key: "amount",
      header: "Amount",
      render: (doc) => `₹${Number(doc.amount).toLocaleString()}`,
    },
    {
      key: "moneySource",
      header: "MoneySource",
      accessor: "moneySource",
    },
    {
      key: "utr",
      header: "UTR",
      render: (doc) => doc.utrNumber || "-",
    },
    {
      key: "uploadedDate",
      header: "Uploaded Date",
      nowrap: true,
      render: (doc) => formatDateYYYYMMDD(doc.createdAt),
    },
    {
      key: "description",
      header: "Description",
      render: (doc) => (
        <span className="block min-w-[250px] max-w-[300px] whitespace-normal break-words">
          {doc.description || ""}
        </span>
      ),
    },
    {
      key: "transactionBill",
      header: "Transaction Bill",
      render: (doc) => <BillViewButton url={doc.transactionBill} />,
    },
    {
      key: "supportBill",
      header: "Support Bill",
      render: (doc) => <BillViewButton url={doc.supportBill} />,
    },
    {
      key: "otherBill",
      header: "Other Bill",
      render: (doc) => <BillViewButton url={doc.otherBill} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (doc) => (
        <div className="flex gap-2">
          <button
            className="p-1.5 bg-[#eb660f] hover:bg-[#d45a0d] text-white rounded text-xs transition"
            onClick={() => handleEditClick(doc)}
            title="Edit"
          >
            <Icon icon="mdi:pencil" width="16" height="16" />
          </button>
          <button
            className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition"
            onClick={() => handleDeleteClick(doc)}
            title="Delete"
          >
            <Icon icon="mdi:delete" width="16" height="16" />
          </button>
        </div>
      ),
    },
  ];

  /* ── Mobile Card Fields ── */
  const mobileFields = [
    {
      label: "Date of Bill",
      render: (doc) => doc.date || "-",
    },
    {
      label: "Name",
      render: (doc) => doc.name || "-",
    },
    {
      label: "Category",
      key: "category",
    },
    {
      label: "Title",
      key: "title",
    },
    {
      label: "Amount",
      render: (doc) => `₹${Number(doc.amount).toLocaleString()}`,
    },
    {
      label: "Money Source",
      key: "moneySource",
    },
    {
      label: "UTR",
      render: (doc) => doc.utrNumber || "-",
    },
    {
      label: "Uploaded Date",
      render: (doc) => formatDateYYYYMMDD(doc.createdAt),
    },
    {
      label: "Description",
      render: (doc) => doc.description || "-",
    },
    {
      label: "Bills",
      render: (doc) => (
        <div className="flex gap-2 flex-wrap">
          {doc.transactionBill && (
            <a
              href={doc.transactionBill}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 underline"
            >
              Transaction
            </a>
          )}
          {doc.supportBill && (
            <a
              href={doc.supportBill}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 underline"
            >
              Support
            </a>
          )}
          {doc.otherBill && (
            <a
              href={doc.otherBill}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 underline"
            >
              Other
            </a>
          )}
          {!doc.transactionBill && !doc.supportBill && !doc.otherBill && "-"}
        </div>
      ),
    },
  ];

  /* ═══════════ RENDER ═══════════ */
  return (
    <div>
      <ToastContainer position="top-right" autoClose={2000} />

      <section className="py-3 sm:py-4 px-1 sm:px-3 md:px-4 min-h-screen bg-[#0b1218]">
        <div className="w-full">
          <div className="bg-[#1a2128] border border-[#2b3440] rounded-xl px-3 sm:px-4 md:px-5 pb-1 pt-4 overflow-x-hidden">
            {/* ── Header ── */}
            <div className="flex flex-wrap justify-between items-center mb-4">
              <h1 className="font-bold text-white text-lg sm:text-xl md:text-2xl leading-none">
                Internal Expenses
              </h1>
              <ExportDropdown exporting={exporting} onDownload={download} />
            </div>

            {/* ── Summary Cards (✅ StatCard) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <StatCard
                icon="mdi:currency-inr"
                value={`₹${pagination?.totalAmount?.toLocaleString() || 0}`}
                title="Total Monthly Amount"
                variant="yellow"
                bgClass="bg-[#4c4320]"
              />
              <StatCard
                icon="mdi:file-document-multiple"
                value={totalCount || 0}
                title="Total Bills"
                variant="blue"
                bgClass="bg-[#4a262f]"
              />

              {/* Upload Card (custom - not a stat) */}
              <div
                className="bg-[#173632] rounded-xl p-4 text-white flex flex-col items-center justify-center text-center min-h-25 cursor-pointer hover:opacity-90 transition"
                onClick={handleUploadClick}
              >
                <Icon
                  icon="material-symbols:upload"
                  width="32"
                  height="32"
                  className="text-white mb-2"
                />
                <h5 className="font-bold text-base mb-0">Upload</h5>
                <small className="text-white/50">Expense Bill</small>
              </div>
            </div>

            {/* ── Filters ── */}
            <div className="flex flex-col gap-3 mb-4">
              {/* Row 2: All filter controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
                {/* From Date */}
                <div className="w-full">
                  <label className="block text-white text-xs mb-1">From</label>
                  <input
                    type="date"
                    className={`${inputCls} w-full`}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                {/* To Date */}
                <div className="w-full">
                  <label className="block text-white text-xs mb-1">To</label>
                  <input
                    type="date"
                    className={`${inputCls} w-full`}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                {/* Search */}
                <div className="w-full">
                  <label className="block text-white text-xs mb-1">
                    Search
                  </label>
                  <SearchBar
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleFilter();
                    }}
                    placeholder="Search by UTR"
                  />
                </div>

                {/* Fetch Button */}
                <button
                  className="px-4 py-2 bg-[#eb660f] hover:bg-[#d45a0d] text-white text-sm rounded transition disabled:opacity-50 h-[38px] w-full sm:w-auto"
                  onClick={handleFilter}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Fetch"}
                </button>
              </div>
            </div>

            {/* ── Desktop Table (✅ Table) ── */}
            <div className="">
              <Table
                columns={columns}
                data={expenseList}
                isLoading={isLoading}
                emptyMessage={
                  queryParam
                    ? "No records found for the selected filters"
                    : "No expenses found. Upload your first expense!"
                }
                keyExtractor={(doc) => doc._id}
              />
            </div>



            {/* ── Pagination (✅ Pagination) ── */}
            {totalCount > 0 && (
              <div className="mt-3">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          UPLOAD / EDIT EXPENSE MODAL
         ═══════════════════════════════════ */}
      <TwModal show={FormOpen} onClose={handleClose} size="max-w-3xl">
        <TwModalHeader onClose={handleClose}>
          {editMode ? "Edit Expense Bill" : "Upload Expense Bill"}
        </TwModalHeader>

        <TwModalBody>
          <Formik
            initialValues={{
              category: selectedExpense?.category || "",
              amount: selectedExpense?.amount || "",
              description: selectedExpense?.description || "",
              transactionBill: null,
              supportBill: null,
              otherBill: null,
              title: selectedExpense?.title || "",
              utrNumber: selectedExpense?.utrNumber || "",
              date: selectedExpense?.date || "",
              moneySource: selectedExpense?.moneySource || "",
            }}
            validationSchema={ExpenseSchema}
            onSubmit={handleFormSubmit}
            enableReinitialize
          >
            {({ setFieldValue, isSubmitting }) => (
              <Form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Title *
                    </label>
                    <Field
                      name="title"
                      className={inputCls}
                      placeholder="Enter expense title"
                    />
                    <ErrorMessage
                      name="title"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Category *
                    </label>
                    <div className={selectWrap}>
                      <Field name="category" as="select" className={inputCls}>
                        <option value="">Select Category</option>
                        <option value="Office Expenses">Office Expenses</option>
                        <option value="Marketing Expenses">
                          Marketing Expenses
                        </option>
                        <option value="Tools Expenses">Tools Expenses</option>
                        <option value="other">Other</option>
                      </Field>
                      <ChevronDown className={chevronCls} />
                    </div>
                    <ErrorMessage
                      name="category"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Amount (₹) *
                    </label>
                    <Field
                      name="amount"
                      type="number"
                      className={inputCls}
                      placeholder="Enter amount"
                    />
                    <ErrorMessage
                      name="amount"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {/* Money Source */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Money Source *
                    </label>
                    <div className={selectWrap}>
                      <Field
                        name="moneySource"
                        as="select"
                        className={inputCls}
                      >
                        <option value="">Select Money Source</option>
                        <option value="Office Money">Office Money</option>
                        <option value="Manager Money">Manager Money</option>
                        <option value="Others">Others</option>
                      </Field>
                      <ChevronDown className={chevronCls} />
                    </div>
                    <ErrorMessage
                      name="moneySource"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {/* UTR Number */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      UTR Number
                    </label>
                    <Field
                      name="utrNumber"
                      className={inputCls}
                      placeholder="Enter UTR number"
                    />
                    <ErrorMessage
                      name="utrNumber"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Date *
                    </label>
                    <Field name="date" type="date" className={inputCls} />
                    <ErrorMessage
                      name="date"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                </div>

                {/* File uploads */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      name: "transactionBill",
                      label: "Transaction Bill",
                      required: !editMode,
                    },
                    {
                      name: "supportBill",
                      label: "Support Bill",
                      required: false,
                    },
                    {
                      name: "otherBill",
                      label: "Other Bill",
                      required: false,
                    },
                  ].map((file) => (
                    <div key={file.name}>
                      <label className="block text-sm text-gray-400 mb-1">
                        {file.label} {file.required && "*"}
                      </label>
                      <input
                        name={file.name}
                        type="file"
                        className={inputCls}
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          setFieldValue(file.name, e.currentTarget.files[0])
                        }
                      />
                      <ErrorMessage
                        name={file.name}
                        component="div"
                        className="text-red-500 text-xs mt-1"
                      />
                      {editMode && selectedExpense?.[file.name] && (
                        <small className="text-cyan-400 block mt-1">
                          Current:{" "}
                          <a
                            href={selectedExpense[file.name]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 underline"
                          >
                            View
                          </a>
                        </small>
                      )}
                      <small className="block text-white/60 text-xs">
                        {editMode
                          ? "Upload new to replace"
                          : file.required
                            ? "PDF, JPG, PNG"
                            : "Optional"}
                      </small>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Description
                  </label>
                  <Field
                    name="description"
                    as="textarea"
                    rows="3"
                    className={inputCls}
                    placeholder="Enter expense description"
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#eb660f] hover:bg-[#d45a0d] text-white text-sm rounded transition disabled:opacity-50 flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {isSubmitting
                      ? editMode
                        ? "Updating..."
                        : "Uploading..."
                      : editMode
                        ? "Update Expense"
                        : "Upload Expense"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </TwModalBody>
      </TwModal>

      {/* ═══════════════════════════════════
          DELETE CONFIRMATION MODAL
         ═══════════════════════════════════ */}
      <TwModal show={deleteConfirmModal} onClose={handleCancelDelete}>
        <TwModalHeader onClose={handleCancelDelete}>
          Confirm Delete
        </TwModalHeader>

        <TwModalBody>
          <p className="mb-3">Are you sure you want to delete this expense?</p>

          {expenseToDelete && (
            <div className="bg-yellow-500/15 border border-yellow-500/30 rounded-lg p-3 mb-3 text-sm">
              <p className="mb-1">
                <strong>Title:</strong> {expenseToDelete.title}
              </p>
              <p className="mb-1">
                <strong>Amount:</strong> ₹
                {Number(expenseToDelete.amount).toLocaleString()}
              </p>
              <p className="mb-0">
                <strong>UTR:</strong> {expenseToDelete.utrNumber}
              </p>
            </div>
          )}

          <p className="text-red-400 text-sm flex items-center gap-2 mb-0">
            <Icon icon="mdi:alert" width="18" />
            This operation is irreversible
          </p>
        </TwModalBody>

        <TwModalFooter>
          <button
            className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition"
            onClick={handleCancelDelete}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition disabled:opacity-50 flex items-center gap-2"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Icon icon="mdi:delete" width="16" />
                Delete Expense
              </>
            )}
          </button>
        </TwModalFooter>
      </TwModal>
    </div>
  );
};

export default InternalExpenses;
