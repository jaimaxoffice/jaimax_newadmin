// import React, { useState, useMemo } from 'react';
// import {
//   useWithdrawalSlabsQuery,
//   useUpdateWithdrawalChequeMutation,
//   useUpdateWithdrawalStatusMutation,
//   useGetWithdrawUnderProcessListQuery
// } from './withdrawalApiSlice';
// import XLSX from 'xlsx-js-style';
// import { saveAs } from 'file-saver';
// import Table from '../../reusableComponents/Tables/Table';
// import Modal from '../../reusableComponents/Modals/Modals';
// import Pagination from '../../reusableComponents/Paginations/Pagination';
// import Loader from '../../reusableComponents/Loader/Loader';
// import { useToast } from "../../reusableComponents/Toasts/ToastContext";
// import { downloadWithdrawalDoc, getFinancialYear } from '../../hooks/generateWithdrawalDoc';

// const SLAB_CONFIG = {
//   1: { label: '₹0 - ₹5,000', icon: '💵', color: 'text-green-400', border: 'border-green-500/40' },
//   2: { label: '₹5,001 - ₹50,000', icon: '💰', color: 'text-yellow-400', border: 'border-yellow-500/40' },
//   3: { label: '₹50,001+', icon: '🏆', color: 'text-orange-400', border: 'border-orange-500/40' },
// };

// const STATUS_MAP = {
//   0: { label: 'Pending', cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/50' },
//   1: { label: 'Success', cls: 'bg-[#b9fd5c]/15 text-[#b9fd5c] border-[#b9fd5c]/50' },
//   2: { label: 'Rejected', cls: 'bg-red-500/15 text-red-400 border-red-500/50' },
//   3: { label: 'Processing', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/50' },
//   4: { label: 'Under Process', cls: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/50' },
// };

// // ── Helpers ──────────────────────────────────────────────────
// const getNetAmount = (item) => {
//   const a = parseFloat(item.amount?.$numberDecimal || item.amount) || 0;
//   const c = parseFloat(item.admin_inr_charges?.$numberDecimal || item.admin_inr_charges) || 0;
//   return a - c;
// };

// const calcTotal = (data) => data.reduce((s, i) => s + getNetAmount(i), 0);

// const formatINR = (n) =>
//   n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// const isHDFCAccount = (item) =>
//   (item.kycInfo?.ifsc_code || '').toLowerCase().includes('hdfc');

// const splitByBank = (list) => {
//   const hdfc = [];
//   const other = [];
//   list.forEach((item) => {
//     if (isHDFCAccount(item)) hdfc.push(item);
//     else other.push(item);
//   });
//   return { hdfc, other };
// };

// // ── Small components ────────────────────────────────────────
// const StatusBadge = ({ status }) => {
//   const config = STATUS_MAP[status] || STATUS_MAP[0];
//   return (
//     <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${config.cls}`}>
//       {config.label}
//     </span>
//   );
// };

// const BankBadge = ({ bankName }) => {
//   const isHDFC = (bankName || '').toLowerCase().includes('hdfc');
//   return (
//     <span
//       className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
//         isHDFC
//           ? 'bg-orange-500/15 text-orange-400 border-orange-500/50'
//           : 'bg-[#b9fd5c]/15 text-[#b9fd5c] border-[#b9fd5c]/50'
//       }`}
//     >
//       {isHDFC ? 'HDFC' : 'Other'}
//     </span>
//   );
// };

// // ═════════════════════════════════════════════════════════════
// // MAIN COMPONENT
// // ═════════════════════════════════════════════════════════════
// const WithdrawalDownload = () => {
//   const toast = useToast();

//   // ── View state ────────────────────────────────────────────
//   const [viewMode, setViewMode] = useState('idle');
//   const [selectedSlab, setSelectedSlab] = useState(null);

//   // ── Slab modal ────────────────────────────────────────────
//   const [isSlabModalOpen, setIsSlabModalOpen] = useState(false);
//   const [tempSlab, setTempSlab] = useState(1);

//   // ── Process modal ─────────────────────────────────────────
//   const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
//   const [processSlab, setProcessSlab] = useState(1);
//   const [processChequeNumber, setProcessChequeNumber] = useState('');

//   // ── Success modal ─────────────────────────────────────────
//   const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
//   const [successChequeNumber, setSuccessChequeNumber] = useState('');

//   // ── DOC modal  ─  now tracks its data source ─────────────
//   const [isDocModalOpen, setIsDocModalOpen] = useState(false);
//   const [docConfig, setDocConfig] = useState({
//     bankType: 'OTHER',
//     chequeNumber: '',
//     refNumber: '',
//     date: new Date().toISOString().split('T')[0],
//     source: 'slabs', // ← NEW: 'slabs' | 'underProcess'
//   });

//   // ── Under Process pagination ──────────────────────────────
//   const [upPage, setUpPage] = useState(1);
//   const [upLimit, setUpLimit] = useState(10);

//   // ═════════════════════════════════════════════════════════════
//   // API HOOKS
//   // ═════════════════════════════════════════════════════════════
//   const {
//     data: slabRes,
//     isLoading: isSlabLoading,
//     error: slabError,
//     refetch: refetchSlab,
//   } = useWithdrawalSlabsQuery(selectedSlab, { skip: !selectedSlab });

//   const [updateWithdrawalCheque, { isLoading: isProcessing }] =
//     useUpdateWithdrawalChequeMutation();

//   const [updateWithdrawalStatus, { isLoading: isUpdatingStatus }] =
//     useUpdateWithdrawalStatusMutation();

//   const {
//     data: upRes,
//     isLoading: isUpLoading,
//     isFetching: isUpFetching,
//     refetch: refetchUp,
//   } = useGetWithdrawUnderProcessListQuery(
//     { page: upPage, limit: upLimit },
//     { skip: viewMode !== 'underProcess' }
//   );

//   // ═════════════════════════════════════════════════════════════
//   // DERIVED DATA
//   // ═════════════════════════════════════════════════════════════
//   const withdrawalData = slabRes?.data?.updatedWithdrawals || [];
//   const upData = upRes?.data?.records || [];
//   const upPagination = upRes?.data?.pagenation || {
//     total: 0,
//     page: 1,
//     limit: 10,
//     totalPages: 1,
//   };

//   // ── Bank split – SLAB data ────────────────────────────────
//   const { hdfcAccounts, otherBankAccounts } = useMemo(() => {
//     const { hdfc, other } = splitByBank(withdrawalData);
//     return { hdfcAccounts: hdfc, otherBankAccounts: other };
//   }, [withdrawalData]);

//   // ── Bank split – UNDER PROCESS data  (NEW) ───────────────
//   const { upHdfcAccounts, upOtherBankAccounts } = useMemo(() => {
//     const { hdfc, other } = splitByBank(upData);
//     return { upHdfcAccounts: hdfc, upOtherBankAccounts: other };
//   }, [upData]);

//   // ── Convenience: pick the right lists for the DOC modal ───
//   const getAccountsBySource = (source, bankType) => {
//     if (source === 'underProcess') {
//       return bankType === 'HDFC' ? upHdfcAccounts : upOtherBankAccounts;
//     }
//     return bankType === 'HDFC' ? hdfcAccounts : otherBankAccounts;
//   };

//   // ═════════════════════════════════════════════════════════════
//   // HANDLERS
//   // ═════════════════════════════════════════════════════════════

//   // Slab Modal
//   const handleFetchSlab = () => {
//     setSelectedSlab(tempSlab);
//     setViewMode('slabs');
//     setIsSlabModalOpen(false);
//   };

//   // Under Process
//   const handleShowUnderProcess = () => {
//     setViewMode('underProcess');
//     setUpPage(1);
//   };

//   const handleBackToSlabs = () => {
//     setViewMode(selectedSlab ? 'slabs' : 'idle');
//   };

//   // Process Withdrawal
//   const handleProcessWithdrawal = async () => {
//     if (!processChequeNumber.trim())
//       return toast.sucess('Please enter a cheque number');
//     try {
//       const r = await updateWithdrawalCheque({
//         slab: processSlab,
//         chequeNumber: processChequeNumber.trim(),
//       }).unwrap();
//       toast.sucess(r.message || 'Cheque number added successfully!');
//       setIsProcessModalOpen(false);
//       setProcessChequeNumber('');
//       if (selectedSlab) refetchSlab();
//     } catch (err) {
//       toast.error(err?.data?.message);
//     }
//   };

//   // Mark Success
//   const handleUpdateStatus = async () => {
//     if (!successChequeNumber.trim())
//       return toast.sucess('Please enter a cheque number');
//     try {
//       const r = await updateWithdrawalStatus({
//         chequeNumber: successChequeNumber.trim(),
//       }).unwrap();
//       toast.sucess(r.message || 'Status updated successfully!');
//       setIsSuccessModalOpen(false);
//       setSuccessChequeNumber('');
//       if (selectedSlab) refetchSlab();
//       if (viewMode === 'underProcess') refetchUp();
//     } catch (err) {
//       toast.error(err?.data?.message);
//     }
//   };

//   // ── DOC Modal – now accepts source ───────────────────────
//   const openDocModal = (bankType, source = 'slabs') => {
//     const accounts = getAccountsBySource(source, bankType);
//     const cheque =
//       accounts.find((a) => a.checqueNumber || a.chequeNumber)?.checqueNumber ||
//       accounts.find((a) => a.chequeNumber)?.chequeNumber ||
//       '';
//     setDocConfig({
//       bankType,
//       chequeNumber: cheque,
//       refNumber: `JSS/MTN/${getFinancialYear()}/01`,
//       date: new Date().toISOString().split('T')[0],
//       source,
//     });
//     setIsDocModalOpen(true);
//   };

//   const handleDownloadDoc = () => {
//     const accounts = getAccountsBySource(docConfig.source, docConfig.bankType);
//     if (!accounts.length) return toast.error('No data available');
//     downloadWithdrawalDoc({
//       data: accounts,
//       bankType: docConfig.bankType,
//       chequeNumber: docConfig.chequeNumber,
//       refNumber: docConfig.refNumber,
//       date: docConfig.date,
//     });
//     setIsDocModalOpen(false);
//   };

//   // Refresh
//   const handleRefresh = () => {
//     if (viewMode === 'slabs' && selectedSlab) refetchSlab();
//     if (viewMode === 'underProcess') refetchUp();
//   };

//   // ═════════════════════════════════════════════════════════════
//   // EXCEL HELPERS
//   // ═════════════════════════════════════════════════════════════
//   const createWorksheet = (data, bankType) => {
//     const border = (style = 'thin') => ({
//       top: { style, color: { rgb: '000000' } },
//       bottom: { style, color: { rgb: '000000' } },
//       left: { style, color: { rgb: '000000' } },
//       right: { style, color: { rgb: '000000' } },
//     });

//     const headerStyle = {
//       font: { bold: true, sz: 12, color: { rgb: '000000' } },
//       alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
//     };
//     const companyStyle = {
//       font: { bold: true, sz: 14, color: { rgb: '000000' } },
//       alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
//     };
//     const thStyle = {
//       font: { bold: true, sz: 9, color: { rgb: '000000' } },
//       alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
//       fill: {
//         fgColor: { rgb: bankType === 'HDFC' ? 'FFD700' : 'BFBFBF' },
//       },
//       border: border('medium'),
//     };
//     const tdCenter = {
//       font: { bold: true, sz: 8, color: { rgb: '000000' } },
//       alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
//       border: border(),
//     };
//     const totalLabel = {
//       font: { bold: true, sz: 10, color: { rgb: '000000' } },
//       alignment: { horizontal: 'right', vertical: 'center' },
//       border: border('medium'),
//     };
//     const totalVal = {
//       ...totalLabel,
//       alignment: { horizontal: 'center', vertical: 'center' },
//     };
//     const emptyBorder = { border: border('medium') };

//     const label =
//       bankType === 'HDFC'
//         ? 'Please find the attached sheet below for Amount transfer OF HDFC BANK'
//         : 'Please find the attached sheet below for Amount transfer OF OTHER BANK';

//     const rows = [];
//     rows.push(
//       Array(6)
//         .fill(null)
//         .map((_, i) => ({ v: i === 0 ? label : '', s: headerStyle }))
//     );
//     rows.push(
//       Array(6)
//         .fill(null)
//         .map((_, i) => ({
//           v:
//             i === 0
//               ? 'JAISVIK SOFTWARE SOLUTIONS PVT. LTD - HYDERABAD'
//               : '',
//           s: companyStyle,
//         }))
//     );
//     rows.push(Array(6).fill({ v: '' }));
//     rows.push(
//       [
//         'S.NO',
//         'NAME OF THE ACCOUNT HOLDER',
//         'BANK NAME',
//         'IFSC CODE',
//         'ACCOUNT NUMBER',
//         'AMOUNT (RS)',
//       ].map((v) => ({ v, s: thStyle }))
//     );

//     let total = 0;
//     data.forEach((item, i) => {
//       const net = getNetAmount(item);
//       total += net;
//       rows.push([
//         { v: i + 1, s: tdCenter },
//         { v: item.userId?.name || 'N/A', s: tdCenter },
//         { v: item.kycInfo?.bank_name || 'N/A', s: tdCenter },
//         { v: item.kycInfo?.ifsc_code || 'N/A', s: tdCenter },
//         { v: item.kycInfo?.bank_account || 'N/A', s: tdCenter },
//         { v: net.toFixed(2), s: tdCenter },
//       ]);
//     });

//     rows.push([
//       { v: '', s: emptyBorder },
//       { v: '', s: emptyBorder },
//       { v: '', s: emptyBorder },
//       { v: '', s: emptyBorder },
//       { v: 'Total=', s: totalLabel },
//       { v: total.toFixed(2), s: totalVal },
//     ]);

//     const ws = XLSX.utils.aoa_to_sheet(rows);
//     ws['!cols'] = [
//       { wch: 5 },
//       { wch: 28 },
//       { wch: 20 },
//       { wch: 12 },
//       { wch: 18 },
//       { wch: 12 },
//     ];
//     const rh = [{ hpt: 20 }, { hpt: 22 }, { hpt: 10 }, { hpt: 25 }];
//     for (let i = 0; i < data.length; i++) rh.push({ hpt: 18 });
//     rh.push({ hpt: 22 });
//     ws['!rows'] = rh;
//     ws['!merges'] = [
//       { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
//       { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
//     ];
//     return ws;
//   };

//   // ── Generic Excel downloader (works for both views) ──────
//   const buildAndDownloadExcel = (allData, hdfcData, otherData, suffix) => {
//     if (!allData.length) return toast.error('No data available');
//     const d = new Date();
//     const wb = XLSX.utils.book_new();
//     if (otherData.length > 0)
//       XLSX.utils.book_append_sheet(
//         wb,
//         createWorksheet(otherData, 'OTHER'),
//         'Other Bank'
//       );
//     if (hdfcData.length > 0)
//       XLSX.utils.book_append_sheet(
//         wb,
//         createWorksheet(hdfcData, 'HDFC'),
//         'HDFC Bank'
//       );
//     if (!otherData.length && !hdfcData.length)
//       return toast.error('No data');
//     const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
//     saveAs(
//       new Blob([buf], {
//         type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//       }),
//       `withdrawal_${suffix}_${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}.xlsx`
//     );
//   };

//   const downloadSlabExcel = () =>
//     buildAndDownloadExcel(
//       withdrawalData,
//       hdfcAccounts,
//       otherBankAccounts,
//       `slab${selectedSlab}`
//     );

//   const downloadUpExcel = () =>
//     buildAndDownloadExcel(
//       upData,
//       upHdfcAccounts,
//       upOtherBankAccounts,
//       'under_process'
//     );

//   // ═════════════════════════════════════════════════════════════
//   // COLUMN DEFINITIONS
//   // ═════════════════════════════════════════════════════════════
//   const slabColumns = [
//     {
//       header: 'S.No',
//       accessor: 'sno',
//       width: '60px',
//       render: (_, idx, cp, pp) => (cp - 1) * pp + idx + 1,
//     },
//     {
//       header: 'Name',
//       accessor: 'name',
//       minWidth: '160px',
//       render: (row) => (
//         <span className="text-white font-semibold">
//           {row.userId?.name || 'N/A'}
//         </span>
//       ),
//     },
//     {
//       header: 'Bank Name',
//       accessor: 'bank_name',
//       minWidth: '140px',
//       render: (row) => row.kycInfo?.bank_name || 'N/A',
//     },
//     {
//       header: 'IFSC',
//       accessor: 'ifsc_code',
//       minWidth: '110px',
//       render: (row) => (
//         <span className="font-mono text-xs">
//           {row.kycInfo?.ifsc_code || 'N/A'}
//         </span>
//       ),
//     },
//     {
//       header: 'Account No',
//       accessor: 'bank_account',
//       minWidth: '150px',
//       render: (row) => (
//         <span className="font-mono text-xs">
//           {row.kycInfo?.bank_account || 'N/A'}
//         </span>
//       ),
//     },
//     {
//       header: 'Amount',
//       accessor: 'amount',
//       minWidth: '110px',
//       render: (row) => (
//         <span className="text-[#b9fd5c] font-bold">
//           ₹{formatINR(getNetAmount(row))}
//         </span>
//       ),
//     },
//     {
//       header: 'Cheque',
//       accessor: 'chequeNumber',
//       minWidth: '100px',
//       render: (row) => (
//         <span
//           className={
//             row.checqueNumber
//               ? 'text-cyan-400 font-bold'
//               : 'text-[#3a3d43]'
//           }
//         >
//           {row.checqueNumber || '—'}
//         </span>
//       ),
//     },
//     {
//       header: 'Status',
//       accessor: 'status',
//       minWidth: '100px',
//       render: (row) => <StatusBadge status={row.status} />,
//     },
//     {
//       header: 'Type',
//       accessor: 'bank_type',
//       minWidth: '80px',
//       render: (row) => <BankBadge bankName={row.kycInfo?.bank_name} />,
//     },
//   ];

//   // ── Under Process columns – NOW includes bank details ────
//   const upColumns = [
//     {
//       header: 'S.No',
//       accessor: 'sno',
//       width: '60px',
//       render: (_, idx) => (upPage - 1) * upLimit + idx + 1,
//     },
//     {
//       header: 'Name',
//       accessor: 'name',
//       minWidth: '160px',
//       render: (row) => (
//         <div>
//           <p className="text-white font-semibold text-sm">
//             {row.userId?.name || 'N/A'}
//           </p>
//           <p className="text-[#5a5d63] text-xs">
//             {row.userId?.username || ''}
//           </p>
//         </div>
//       ),
//     },
//     {
//       header: 'Bank',
//       accessor: 'bank_name',
//       minWidth: '130px',
//       render: (row) => (
//         <div>
//           <p className="text-white text-xs font-medium">
//             {row.kycInfo?.bank_name || 'N/A'}
//           </p>
//           <p className="text-[#5a5d63] text-[10px] font-mono">
//             {row.kycInfo?.ifsc_code || ''}
//           </p>
//         </div>
//       ),
//     },
//     {
//       header: 'Account No',
//       accessor: 'bank_account',
//       minWidth: '140px',
//       render: (row) => (
//         <span className="font-mono text-xs text-white">
//           {row.kycInfo?.bank_account || 'N/A'}
//         </span>
//       ),
//     },
//     {
//       header: 'Amount',
//       accessor: 'amount',
//       minWidth: '120px',
//       render: (row) => (
//         <span className="text-[#b9fd5c] font-bold">
//           ₹{formatINR(getNetAmount(row))}
//         </span>
//       ),
//     },
//     {
//       header: 'Cheque',
//       accessor: 'chequeNumber',
//       minWidth: '110px',
//       render: (row) => (
//         <span className="text-cyan-400 font-bold">
//           {row.chequeNumber || row.checqueNumber || '—'}
//         </span>
//       ),
//     },
//     {
//       header: 'Type',
//       accessor: 'bank_type',
//       minWidth: '80px',
//       render: (row) => <BankBadge bankName={row.kycInfo?.bank_name} />,
//     },
//     {
//       header: 'Status',
//       accessor: 'status',
//       minWidth: '110px',
//       render: (row) => <StatusBadge status={row.status} />,
//     },
//     {
//       header: 'Date',
//       accessor: 'created_at',
//       minWidth: '100px',
//       render: (row) => {
//         const dt = new Date(row.created_at);
//         return (
//           <div className="text-xs leading-relaxed">
//             <p className="text-[#ffff]">
//               {dt.toLocaleDateString('en-IN')}
//             </p>
//             <p className="text-[#fff]">
//               {dt.toLocaleTimeString('en-IN', {
//                 hour: '2-digit',
//                 minute: '2-digit',
//               })}
//             </p>
//           </div>
//         );
//       },
//     },
//   ];

//   // ═════════════════════════════════════════════════════════════
//   // JSX
//   // ═════════════════════════════════════════════════════════════
//   return (
//     <div className="p-4 md:p-6 space-y-5 max-w-[1400px] mx-auto">
//       {/* ─── HEADER ───────────────────────────────────────────── */}
//       <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-2xl p-5 md:p-6">
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
//           <div>
//             <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
//               Withdrawal Management
//             </h1>
//             <p className="text-[#6a6d73] text-sm mt-1">
//               Manage, download &amp; process withdrawal data
//             </p>
//           </div>

//           {viewMode === 'slabs' && selectedSlab && (
//             <div
//               className={`flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#282f35] border ${SLAB_CONFIG[selectedSlab]?.border}`}
//             >
//               <div>
//                 <p className="text-xs text-[#6a6d73] font-medium">
//                   Active Slab
//                 </p>
//                 <p
//                   className={`text-sm font-bold ${SLAB_CONFIG[selectedSlab]?.color}`}
//                 >
//                   Slab {selectedSlab}
//                 </p>
//               </div>
//             </div>
//           )}

//           {viewMode === 'underProcess' && (
//             <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#282f35] border border-cyan-500/40">
//               <div>
//                 <p className="text-xs text-[#fff] font-medium">Viewing</p>
//                 <p className="text-sm font-bold text-cyan-400">
//                   Under Process List
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Action Buttons */}
//         <div className="flex flex-wrap gap-2.5 pt-4 border-t border-[#2a2c2f]">
//           <button
//             onClick={() => {
//               setTempSlab(selectedSlab || 1);
//               setIsSlabModalOpen(true);
//             }}
//             className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#b9fd5c] text-black hover:bg-[#a8ec4b] active:scale-[0.97] transition-all"
//           >
//             Get Slabs List
//           </button>
//           <button
//             onClick={handleShowUnderProcess}
//             className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-[0.97] ${
//               viewMode === 'underProcess'
//                 ? 'bg-cyan-500 text-white border-cyan-500'
//                 : 'border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10'
//             }`}
//           >
//             Under Process
//           </button>

//           <div className="w-px h-8 bg-[#2a2c2f] self-center mx-1" />

//           <button
//             onClick={() => {
//               setProcessSlab(selectedSlab || 1);
//               setProcessChequeNumber('');
//               setIsProcessModalOpen(true);
//             }}
//             className="px-4 py-2.5 rounded-xl text-xs font-bold border border-[#b9fd5c]/50 text-[#b9fd5c] hover:bg-[#b9fd5c]/10 active:scale-[0.97] transition-all"
//           >
//             Process
//           </button>
//           <button
//             onClick={() => {
//               setSuccessChequeNumber('');
//               setIsSuccessModalOpen(true);
//             }}
//             className="px-4 py-2.5 rounded-xl text-xs font-bold border border-green-500/50 text-green-400 hover:bg-green-500/10 active:scale-[0.97] transition-all"
//           >
//             Mark Success
//           </button>
//           <button
//             onClick={handleRefresh}
//             className="px-4 py-2.5 rounded-xl text-xs font-bold border border-[#343638] text-[#6a6d73] hover:bg-[#282f35] active:scale-[0.97] transition-all"
//           >
//             Refresh
//           </button>
//         </div>
//       </div>

//       {/* ─── IDLE STATE ───────────────────────────────────────── */}
//       {viewMode === 'idle' && (
//         <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-2xl p-12 flex flex-col items-center justify-center text-center">
//           <h3 className="text-white text-lg font-bold mb-2">
//             No Data Selected
//           </h3>
//           <p className="text-[#6a6d73] text-sm max-w-md mb-6">
//             Click{' '}
//             <strong className="text-[#b9fd5c]">"Get Slabs List"</strong> to
//             fetch withdrawal data by slab, or view the{' '}
//             <strong className="text-cyan-400">"Under Process"</strong> list.
//           </p>
//           <div className="flex gap-3">
//             <button
//               onClick={() => {
//                 setTempSlab(1);
//                 setIsSlabModalOpen(true);
//               }}
//               className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#b9fd5c] text-black hover:bg-[#a8ec4b] transition-all"
//             >
//               Get Slabs List
//             </button>
//             <button
//               onClick={handleShowUnderProcess}
//               className="px-5 py-2.5 rounded-xl text-sm font-bold border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition-all"
//             >
//               Under Process
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ─── SLAB VIEW ────────────────────────────────────────── */}
//       {viewMode === 'slabs' && selectedSlab && (
//         <>
//           {/* Stats Cards */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
//             <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-2xl p-4">
//               <div className="flex items-center justify-between mb-3">
//                 <span className="text-[#6a6d73] text-[11px] font-semibold uppercase tracking-wider">
//                   Total
//                 </span>
//                 <span className="text-[#b9fd5c] text-[10px] font-bold bg-[#b9fd5c]/10 px-2 py-0.5 rounded-full">
//                   Slab {selectedSlab}
//                 </span>
//               </div>
//               <p className="text-2xl md:text-3xl font-bold text-white">
//                 {isSlabLoading ? <Loader /> : withdrawalData.length}
//               </p>
//             </div>

//             <div className="bg-[#1a1c1f] border border-orange-500/20 rounded-2xl p-4">
//               <span className="text-orange-400 text-[11px] font-semibold uppercase tracking-wider">
//                 HDFC
//               </span>
//               <p className="text-2xl md:text-3xl font-bold text-white mt-2">
//                 {isSlabLoading ? <Loader /> : hdfcAccounts.length}
//               </p>
//               {!isSlabLoading && (
//                 <p className="text-[#b9fd5c] text-xs font-bold mt-1">
//                   ₹{formatINR(calcTotal(hdfcAccounts))}
//                 </p>
//               )}
//             </div>

//             <div className="bg-[#1a1c1f] border border-[#b9fd5c]/20 rounded-2xl p-4">
//               <span className="text-[#b9fd5c] text-[11px] font-semibold uppercase tracking-wider">
//                 Other
//               </span>
//               <p className="text-2xl md:text-3xl font-bold text-white mt-2">
//                 {isSlabLoading ? <Loader /> : otherBankAccounts.length}
//               </p>
//               {!isSlabLoading && (
//                 <p className="text-[#b9fd5c] text-xs font-bold mt-1">
//                   ₹{formatINR(calcTotal(otherBankAccounts))}
//                 </p>
//               )}
//             </div>

//             <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-2xl p-4">
//               <span className="text-[#6a6d73] text-[11px] font-semibold uppercase tracking-wider">
//                 Grand Total
//               </span>
//               <p className="text-xl md:text-2xl font-bold text-[#b9fd5c] mt-2">
//                 {isSlabLoading ? (
//                   <Loader />
//                 ) : (
//                   `₹${formatINR(calcTotal(withdrawalData))}`
//                 )}
//               </p>
//             </div>
//           </div>

//           {/* Download Actions */}
//           {!isSlabLoading && withdrawalData.length > 0 && (
//             <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-2xl p-4">
//               <p className="text-[#6a6d73] text-xs font-semibold uppercase tracking-wider mb-3">
//                 Download Options
//               </p>
//               <div className="flex flex-wrap gap-2.5">
//                 <button
//                   onClick={downloadSlabExcel}
//                   className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#b9fd5c] text-black hover:bg-[#a8ec4b] active:scale-[0.97] transition-all flex items-center gap-2"
//                 >
//                   Excel
//                   <span className="bg-black/10 px-2 py-0.5 rounded-full text-[10px]">
//                     {withdrawalData.length}
//                   </span>
//                 </button>

//                 {otherBankAccounts.length > 0 && (
//                   <button
//                     onClick={() => openDocModal('OTHER', 'slabs')}
//                     className="px-4 py-2.5 rounded-xl text-xs font-bold border border-[#b9fd5c]/50 text-[#b9fd5c] hover:bg-[#b9fd5c]/10 active:scale-[0.97] transition-all flex items-center gap-2"
//                   >
//                     Other Bank DOC
//                     <span className="bg-[#b9fd5c]/10 px-2 py-0.5 rounded-full text-[10px]">
//                       {otherBankAccounts.length}
//                     </span>
//                   </button>
//                 )}

//                 {hdfcAccounts.length > 0 && (
//                   <button
//                     onClick={() => openDocModal('HDFC', 'slabs')}
//                     className="px-4 py-2.5 rounded-xl text-xs font-bold border border-orange-500/50 text-orange-400 hover:bg-orange-500/10 active:scale-[0.97] transition-all flex items-center gap-2"
//                   >
//                     HDFC Bank DOC
//                     <span className="bg-orange-500/10 px-2 py-0.5 rounded-full text-[10px]">
//                       {hdfcAccounts.length}
//                     </span>
//                   </button>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Error */}
//           {slabError && (
//             <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between">
//               <span className="text-red-400 text-sm font-semibold">
//                 {slabError?.data?.message || 'Failed to load data'}
//               </span>
//               <button
//                 onClick={refetchSlab}
//                 className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-all"
//               >
//                 Retry
//               </button>
//             </div>
//           )}

//           {/* Table */}
//           <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-2xl overflow-hidden">
//             <Table
//               columns={slabColumns}
//               data={withdrawalData}
//               isLoading={isSlabLoading}
//               currentPage={1}
//               perPage={50}
//               noDataTitle="No Withdrawal Data"
//               noDataMessage={`No records found for Slab ${selectedSlab}`}
//               noDataIcon="inbox"
//               noDataAction={true}
//               noDataActionLabel="Refresh"
//               onNoDataAction={refetchSlab}
//             />
//           </div>
//         </>
//       )}

//       {/* ─── UNDER PROCESS VIEW ───────────────────────────────── */}
//       {viewMode === 'underProcess' && (
//         <>
//           {/* Header */}
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={handleBackToSlabs}
//                 className="p-2 rounded-lg bg-[#282f35] text-[#8a8d93] hover:text-white hover:bg-[#343638] transition-all"
//               >
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M15 19l-7-7 7-7"
//                   />
//                 </svg>
//               </button>
//               <div>
//                 <h2 className="text-lg font-bold text-white">
//                   Under Process Withdrawals
//                 </h2>
//                 <p className="text-[#6a6d73] text-xs">
//                   Showing all withdrawals currently under process
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-2.5">
//               <button
//                 onClick={refetchUp}
//                 disabled={isUpFetching}
//                 className="px-4 py-2 rounded-xl text-xs font-bold border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition-all disabled:opacity-40"
//               >
//                 {isUpFetching ? '...' : 'Refresh'}
//               </button>
//               <button
//                 onClick={() => {
//                   setSuccessChequeNumber('');
//                   setIsSuccessModalOpen(true);
//                 }}
//                 className="px-4 py-2 rounded-xl text-xs font-bold bg-green-500 text-white hover:bg-green-600 transition-all"
//               >
//                 Mark Success
//               </button>
//             </div>
//           </div>

//           {/* Stats Cards — now includes bank breakdown */}
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
//             <div className="bg-[#1a1c1f] border border-cyan-500/20 rounded-2xl p-4">
//               <span className="text-cyan-400 text-[11px] font-semibold uppercase tracking-wider">
//                 Total Records
//               </span>
//               <p className="text-2xl font-bold text-white mt-2">
//                 {isUpLoading ? <Loader /> : upPagination.total}
//               </p>
//             </div>

//             <div className="bg-[#1a1c1f] border border-orange-500/20 rounded-2xl p-4">
//               <span className="text-orange-400 text-[11px] font-semibold uppercase tracking-wider">
//                 HDFC
//               </span>
//               <p className="text-2xl font-bold text-white mt-2">
//                 {isUpLoading ? <Loader /> : upHdfcAccounts.length}
//               </p>
//               {!isUpLoading && upHdfcAccounts.length > 0 && (
//                 <p className="text-[#b9fd5c] text-xs font-bold mt-1">
//                   ₹{formatINR(calcTotal(upHdfcAccounts))}
//                 </p>
//               )}
//             </div>

//             <div className="bg-[#1a1c1f] border border-[#b9fd5c]/20 rounded-2xl p-4">
//               <span className="text-[#b9fd5c] text-[11px] font-semibold uppercase tracking-wider">
//                 Other Banks
//               </span>
//               <p className="text-2xl font-bold text-white mt-2">
//                 {isUpLoading ? <Loader /> : upOtherBankAccounts.length}
//               </p>
//               {!isUpLoading && upOtherBankAccounts.length > 0 && (
//                 <p className="text-[#b9fd5c] text-xs font-bold mt-1">
//                   ₹{formatINR(calcTotal(upOtherBankAccounts))}
//                 </p>
//               )}
//             </div>

//             <div className="bg-[#1a1c1f] border border-[#b9fd5c]/20 rounded-2xl p-4">
//               <span className="text-[#b9fd5c] text-[11px] font-semibold uppercase tracking-wider">
//                 Overall Total
//               </span>
//               <p className="text-xl font-bold text-[#b9fd5c] mt-2">
//                 {isUpLoading ? (
//                   <Loader />
//                 ) : (
//                   `₹${formatINR(
//                     parseFloat(upRes?.data?.totalAmount || 0)
//                   )}`
//                 )}
//               </p>
//               <p className="text-[#3a3d43] text-[10px] mt-1 font-medium">
//                 Across all pages
//               </p>
//             </div>

//             <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-2xl p-4">
//               <span className="text-[#6a6d73] text-[11px] font-semibold uppercase tracking-wider">
//                 Pagination
//               </span>
//               <p className="text-lg font-bold text-white mt-2">
//                 {upPagination.page} / {upPagination.totalPages}
//               </p>
//             </div>
//           </div>

//           {/* ── NEW: Download Options for Under Process ──────── */}
//           {!isUpLoading && upData.length > 0 && (
//             <div className="bg-[#1a1c1f] border border-cyan-500/20 rounded-2xl p-4">
//               <p className="text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
//                 Download Options (Current Page)
//               </p>
//               <div className="flex flex-wrap gap-2.5">
//                 {/* Excel */}
//                 <button
//                   onClick={downloadUpExcel}
//                   className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#b9fd5c] text-black hover:bg-[#a8ec4b] active:scale-[0.97] transition-all flex items-center gap-2"
//                 >
//                   📊 Excel
//                   <span className="bg-black/10 px-2 py-0.5 rounded-full text-[10px]">
//                     {upData.length}
//                   </span>
//                 </button>

//                 {/* Other Bank DOC */}
//                 {upOtherBankAccounts.length > 0 && (
//                   <button
//                     onClick={() => openDocModal('OTHER', 'underProcess')}
//                     className="px-4 py-2.5 rounded-xl text-xs font-bold border border-[#b9fd5c]/50 text-[#b9fd5c] hover:bg-[#b9fd5c]/10 active:scale-[0.97] transition-all flex items-center gap-2"
//                   >
//                     📄 Other Bank DOC
//                     <span className="bg-[#b9fd5c]/10 px-2 py-0.5 rounded-full text-[10px]">
//                       {upOtherBankAccounts.length}
//                     </span>
//                   </button>
//                 )}

//                 {/* HDFC DOC */}
//                 {upHdfcAccounts.length > 0 && (
//                   <button
//                     onClick={() => openDocModal('HDFC', 'underProcess')}
//                     className="px-4 py-2.5 rounded-xl text-xs font-bold border border-orange-500/50 text-orange-400 hover:bg-orange-500/10 active:scale-[0.97] transition-all flex items-center gap-2"
//                   >
//                     📄 HDFC Bank DOC
//                     <span className="bg-orange-500/10 px-2 py-0.5 rounded-full text-[10px]">
//                       {upHdfcAccounts.length}
//                     </span>
//                   </button>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Table */}
//           <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-2xl overflow-hidden">
//             <Table
//               columns={upColumns}
//               data={upData}
//               isLoading={isUpLoading || isUpFetching}
//               currentPage={1}
//               perPage={upData.length || upLimit}
//               noDataTitle="No Under Process Withdrawals"
//               noDataMessage="No withdrawals currently under process."
//               noDataIcon="inbox"
//               noDataAction={true}
//               noDataActionLabel="Refresh"
//               onNoDataAction={refetchUp}
//             />
//           </div>

//           {/* Pagination */}
//           {upPagination.totalPages > 1 && (
//             <div className="flex justify-center">
//               <Pagination
//                 currentPage={upPage}
//                 totalPages={upPagination.totalPages}
//                 onPageChange={(page) => setUpPage(page)}
//               />
//             </div>
//           )}
//         </>
//       )}

//       {/* ═══════════════════════════════════════════════════════ */}
//       {/* MODALS                                                 */}
//       {/* ═══════════════════════════════════════════════════════ */}

//       {/* Slab selection */}
//       <Modal
//         isOpen={isSlabModalOpen}
//         onClose={() => setIsSlabModalOpen(false)}
//         title="Select Withdrawal Slab"
//         size="sm"
//       >
//         <div className="space-y-5">
//           <p className="text-[#6a6d73] text-sm">
//             Choose a slab to fetch withdrawal records
//           </p>

//           <div className="space-y-2.5">
//             {[1, 2].map((slab) => (
//               <button
//                 key={slab}
//                 onClick={() => setTempSlab(slab)}
//                 className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
//                   tempSlab === slab
//                     ? 'border-[#b9fd5c] bg-[#b9fd5c]/10'
//                     : 'border-[#2a2c2f] bg-[#282f35] hover:border-[#3a3d43]'
//                 }`}
//               >
//                 <div className="text-left flex-1">
//                   <p
//                     className={`text-sm font-bold ${
//                       tempSlab === slab ? 'text-[#b9fd5c]' : 'text-white'
//                     }`}
//                   >
//                     Slab {slab}
//                   </p>
//                 </div>
//                 {tempSlab === slab && (
//                   <div className="w-5 h-5 rounded-full bg-[#b9fd5c] flex items-center justify-center">
//                     <svg
//                       className="w-3 h-3 text-black"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={3}
//                         d="M5 13l4 4L19 7"
//                       />
//                     </svg>
//                   </div>
//                 )}
//               </button>
//             ))}
//           </div>

//           <div className="flex gap-3 pt-2">
//             <button
//               onClick={() => setIsSlabModalOpen(false)}
//               className="flex-1 px-4 py-3 bg-[#282f35] hover:bg-[#343638] text-[#6a6d73] font-semibold rounded-3xl transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleFetchSlab}
//               className="flex-1 px-4 py-3 bg-[#b9fd5c] text-black font-bold rounded-3xl hover:bg-[#a8ec4b] active:scale-[0.97] transition-all"
//             >
//               Fetch Data
//             </button>
//           </div>
//         </div>
//       </Modal>

//       {/* Process */}
//       <Modal
//         isOpen={isProcessModalOpen}
//         onClose={() => {
//           setIsProcessModalOpen(false);
//           setProcessChequeNumber('');
//         }}
//         title="Process Withdrawal"
//         size="sm"
//       >
//         <div className="space-y-5">
//           <div>
//             <label className="block text-[#6a6d73] text-xs font-semibold uppercase tracking-wider mb-2">
//               Slab Number
//             </label>
//             <div className="flex gap-2">
//               {[1, 2].map((s) => (
//                 <button
//                   key={s}
//                   onClick={() => setProcessSlab(s)}
//                   className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
//                     processSlab === s
//                       ? 'border-[#b9fd5c] bg-[#b9fd5c]/10 text-[#b9fd5c]'
//                       : 'border-[#2a2c2f] bg-[#282f35] text-[#6a6d73] hover:border-[#3a3d43]'
//                   }`}
//                 >
//                   Slab {s}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div>
//             <label className="block text-[#6a6d73] text-xs font-semibold uppercase tracking-wider mb-2">
//               Cheque Number <span className="text-red-400">*</span>
//             </label>
//             <input
//               type="text"
//               value={processChequeNumber}
//               onChange={(e) => setProcessChequeNumber(e.target.value)}
//               placeholder="Enter cheque number"
//               className="w-full px-4 py-3 rounded-xl bg-[#282f35] border-2 border-[#2a2c2f] text-white font-semibold placeholder-[#3a3d43] focus:outline-none focus:border-[#b9fd5c] transition-colors"
//             />
//           </div>

//           <div className="bg-[#b9fd5c]/5 border border-[#b9fd5c]/20 rounded-xl p-3.5">
//             <p className="text-[#b9fd5c] text-xs leading-relaxed">
//               <strong>ℹ️ Note:</strong> This will add the cheque number to all
//               pending withdrawals in Slab {processSlab}.
//             </p>
//           </div>

//           <div className="flex gap-3 pt-1">
//             <button
//               onClick={() => {
//                 setIsProcessModalOpen(false);
//                 setProcessChequeNumber('');
//               }}
//               className="flex-1 px-4 py-3 bg-[#282f35] hover:bg-[#343638] text-[#6a6d73] font-semibold rounded-3xl transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleProcessWithdrawal}
//               disabled={isProcessing || !processChequeNumber.trim()}
//               className={`flex-1 px-4 py-3 font-bold rounded-3xl transition-all flex items-center justify-center gap-2 ${
//                 isProcessing || !processChequeNumber.trim()
//                   ? 'bg-[#282f35] text-[#3a3d43] cursor-not-allowed'
//                   : 'bg-[#b9fd5c] text-black hover:bg-[#a8ec4b] active:scale-[0.97]'
//               }`}
//             >
//               {isProcessing ? (
//                 <>
//                   <Loader /> Processing...
//                 </>
//               ) : (
//                 'Add Cheque'
//               )}
//             </button>
//           </div>
//         </div>
//       </Modal>

//       {/* Mark Success */}
//       <Modal
//         isOpen={isSuccessModalOpen}
//         onClose={() => {
//           setIsSuccessModalOpen(false);
//           setSuccessChequeNumber('');
//         }}
//         title="Mark as Success"
//         size="sm"
//       >
//         <div className="space-y-5">
//           <div>
//             <label className="block text-[#6a6d73] text-xs font-semibold uppercase tracking-wider mb-2">
//               Cheque Number <span className="text-red-400">*</span>
//             </label>
//             <input
//               type="text"
//               value={successChequeNumber}
//               onChange={(e) => setSuccessChequeNumber(e.target.value)}
//               placeholder="Enter cheque number to mark as success"
//               className="w-full px-4 py-3 rounded-xl bg-[#282f35] border-2 border-[#2a2c2f] text-white font-semibold placeholder-[#3a3d43] focus:outline-none focus:border-green-500 transition-colors"
//             />
//           </div>

//           <div className="flex gap-3 pt-1">
//             <button
//               onClick={() => {
//                 setIsSuccessModalOpen(false);
//                 setSuccessChequeNumber('');
//               }}
//               className="flex-1 px-4 py-3 bg-[#282f35] hover:bg-[#343638] text-[#6a6d73] font-semibold rounded-3xl transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleUpdateStatus}
//               disabled={isUpdatingStatus || !successChequeNumber.trim()}
//               className={`flex-1 px-4 py-3 font-bold rounded-3xl transition-all flex items-center justify-center gap-2 ${
//                 isUpdatingStatus || !successChequeNumber.trim()
//                   ? 'bg-[#282f35] text-[#3a3d43] cursor-not-allowed'
//                   : 'bg-green-500 text-white hover:bg-green-600 active:scale-[0.97]'
//               }`}
//             >
//               {isUpdatingStatus ? (
//                 <>
//                   <Loader /> Updating...
//                 </>
//               ) : (
//                 'Mark Success'
//               )}
//             </button>
//           </div>
//         </div>
//       </Modal>

//       {/* DOC modal – works for BOTH slab & under-process data */}
//       <Modal
//         isOpen={isDocModalOpen}
//         onClose={() => setIsDocModalOpen(false)}
//         title="📄 Generate Word Document"
//         size="sm"
//       >
//         <div className="space-y-5">
//           {/* Source indicator */}
//           <div className="flex items-center gap-2">
//             <span
//               className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
//                 docConfig.source === 'underProcess'
//                   ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/50'
//                   : 'bg-[#b9fd5c]/15 text-[#b9fd5c] border-[#b9fd5c]/50'
//               }`}
//             >
//               {docConfig.source === 'underProcess'
//                 ? 'Under Process'
//                 : `Slab ${selectedSlab}`}
//             </span>
//           </div>

//           {/* Bank Type & Stats */}
//           <div
//             className={`rounded-xl p-4 border ${
//               docConfig.bankType === 'HDFC'
//                 ? 'bg-orange-500/5 border-orange-500/30'
//                 : 'bg-[#b9fd5c]/5 border-[#b9fd5c]/30'
//             }`}
//           >
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs text-[#6a6d73] font-medium">
//                   Bank Type
//                 </p>
//                 <p
//                   className={`text-sm font-bold ${
//                     docConfig.bankType === 'HDFC'
//                       ? 'text-orange-400'
//                       : 'text-[#b9fd5c]'
//                   }`}
//                 >
//                   {docConfig.bankType === 'HDFC'
//                     ? '🏦 HDFC Bank'
//                     : '🏛️ Other Banks'}
//                 </p>
//               </div>
//               <div className="text-right">
//                 <p className="text-xs text-[#6a6d73] font-medium">Records</p>
//                 <p className="text-sm font-bold text-white">
//                   {
//                     getAccountsBySource(
//                       docConfig.source,
//                       docConfig.bankType
//                     ).length
//                   }
//                 </p>
//               </div>
//               <div className="text-right">
//                 <p className="text-xs text-[#6a6d73] font-medium">Total</p>
//                 <p className="text-sm font-bold text-[#b9fd5c]">
//                   ₹
//                   {formatINR(
//                     calcTotal(
//                       getAccountsBySource(
//                         docConfig.source,
//                         docConfig.bankType
//                       )
//                     )
//                   )}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Cheque Number */}
//           <div>
//             <label className="block text-[#6a6d73] text-xs font-semibold uppercase tracking-wider mb-2">
//               Cheque Number
//             </label>
//             <input
//               type="text"
//               value={docConfig.chequeNumber}
//               onChange={(e) =>
//                 setDocConfig({ ...docConfig, chequeNumber: e.target.value })
//               }
//               placeholder="e.g. 000141"
//               className="w-full px-4 py-3 rounded-xl bg-[#282f35] border-2 border-[#2a2c2f] text-white font-semibold placeholder-[#3a3d43] focus:outline-none focus:border-[#b9fd5c] transition-colors"
//             />
//           </div>

//           {/* Reference Number */}
//           <div>
//             <label className="block text-[#6a6d73] text-xs font-semibold uppercase tracking-wider mb-2">
//               Reference Number
//             </label>
//             <input
//               type="text"
//               value={docConfig.refNumber}
//               onChange={(e) =>
//                 setDocConfig({ ...docConfig, refNumber: e.target.value })
//               }
//               placeholder="e.g. JSS/MTN/2025-26/01"
//               className="w-full px-4 py-3 rounded-xl bg-[#282f35] border-2 border-[#2a2c2f] text-white font-semibold placeholder-[#3a3d43] focus:outline-none focus:border-[#b9fd5c] transition-colors font-mono text-sm"
//             />
//           </div>

//           {/* Date */}
//           <div>
//             <label className="block text-[#6a6d73] text-xs font-semibold uppercase tracking-wider mb-2">
//               Date
//             </label>
//             <input
//               type="date"
//               value={docConfig.date}
//               onChange={(e) =>
//                 setDocConfig({ ...docConfig, date: e.target.value })
//               }
//               className="w-full px-4 py-3 rounded-xl bg-[#282f35] border-2 border-[#2a2c2f] text-white font-semibold focus:outline-none focus:border-[#b9fd5c] transition-colors"
//             />
//           </div>

//           {/* Actions */}
//           <div className="flex gap-3 pt-1">
//             <button
//               onClick={() => setIsDocModalOpen(false)}
//               className="flex-1 px-4 py-3 bg-[#282f35] hover:bg-[#343638] text-[#6a6d73] font-semibold rounded-xl transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleDownloadDoc}
//               className="flex-1 px-4 py-3 bg-[#b9fd5c] text-black font-bold rounded-xl hover:bg-[#a8ec4b] active:scale-[0.97] transition-all"
//             >
//                Download DOC
//             </button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default WithdrawalDownload;



import React, { useState, useMemo } from 'react';
import {
  useWithdrawalSlabsQuery,
  useUpdateWithdrawalChequeMutation,
  useUpdateWithdrawalStatusMutation,
  useGetWithdrawUnderProcessListQuery,
  useLazyGetWithdrawDocListQuery,        // ← NEW lazy hook
} from './withdrawalApiSlice';
import XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import Table from '../../reusableComponents/Tables/Table';
import Modal from '../../reusableComponents/Modals/Modals';
import Pagination from '../../reusableComponents/Paginations/Pagination';
import Loader from '../../reusableComponents/Loader/Loader';
import { useToast } from "../../reusableComponents/Toasts/ToastContext";
import { downloadWithdrawalDoc, getFinancialYear } from '../../hooks/generateWithdrawalDoc';

const SLAB_CONFIG = {
  1: { label: '₹0 - ₹5,000', icon: '💵', color: 'text-green-400', border: 'border-green-500/40' },
  2: { label: '₹5,001 - ₹50,000', icon: '💰', color: 'text-yellow-400', border: 'border-yellow-500/40' },
  3: { label: '₹50,001+', icon: '🏆', color: 'text-orange-400', border: 'border-orange-500/40' },
};

const STATUS_MAP = {
  0: { label: 'Pending', cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/50' },
  1: { label: 'Success', cls: 'bg-[#b9fd5c]/15 text-[#b9fd5c] border-[#b9fd5c]/50' },
  2: { label: 'Rejected', cls: 'bg-red-500/15 text-red-400 border-red-500/50' },
  3: { label: 'Processing', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/50' },
  4: { label: 'Under Process', cls: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/50' },
};

// ── Helpers ──────────────────────────────────────────────────
const getNetAmount = (item) => {
  const a = parseFloat(item.amount?.$numberDecimal || item.amount) || 0;
  const c = parseFloat(item.admin_inr_charges?.$numberDecimal || item.admin_inr_charges) || 0;
  return a - c;
};

const calcTotal = (data) => data.reduce((s, i) => s + getNetAmount(i), 0);

const formatINR = (n) =>
  n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const isHDFCAccount = (item) =>
  (item.kycInfo?.ifsc_code || '').toLowerCase().includes('hdfc');

const splitByBank = (list) => {
  const hdfc = [];
  const other = [];
  list.forEach((item) => {
    if (isHDFCAccount(item)) hdfc.push(item);
    else other.push(item);
  });
  return { hdfc, other };
};

// ── Small components ────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const config = STATUS_MAP[status] || STATUS_MAP[0];
  return (
    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${config.cls}`}>
      {config.label}
    </span>
  );
};

const BankBadge = ({ bankName }) => {
  const isHDFC = (bankName || '').toLowerCase().includes('hdfc');
  return (
    <span
      className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
        isHDFC
          ? 'bg-orange-500/15 text-orange-400 border-orange-500/50'
          : 'bg-[#b9fd5c]/15 text-[#b9fd5c] border-[#b9fd5c]/50'
      }`}
    >
      {isHDFC ? 'HDFC' : 'Other'}
    </span>
  );
};

// ═════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════
const WithdrawalDownload = () => {
  const toast = useToast();

  // ── View state ────────────────────────────────────────────
  const [viewMode, setViewMode] = useState('idle');
  const [selectedSlab, setSelectedSlab] = useState(null);

  // ── Slab modal ────────────────────────────────────────────
  const [isSlabModalOpen, setIsSlabModalOpen] = useState(false);
  const [tempSlab, setTempSlab] = useState(1);

  // ── Process modal ─────────────────────────────────────────
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [processSlab, setProcessSlab] = useState(1);
  const [processChequeNumber, setProcessChequeNumber] = useState('');

  // ── Success modal ─────────────────────────────────────────
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successChequeNumber, setSuccessChequeNumber] = useState('');

  // ── DOC modal ─────────────────────────────────────────────
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docConfig, setDocConfig] = useState({
    bankType: 'OTHER',
    chequeNumber: '',
    refNumber: '',
    date: new Date().toISOString().split('T')[0],
    source: 'slabs',
  });

  // ── Under Process pagination ──────────────────────────────
  const [upPage, setUpPage] = useState(1);
  const [upLimit, setUpLimit] = useState(10);

  // ── NEW: Report cheque number for download ────────────────
  const [reportChequeNumber, setReportChequeNumber] = useState('');

  // ═════════════════════════════════════════════════════════════
  // API HOOKS
  // ═════════════════════════════════════════════════════════════
  const {
    data: slabRes,
    isLoading: isSlabLoading,
    error: slabError,
    refetch: refetchSlab,
  } = useWithdrawalSlabsQuery(selectedSlab, { skip: !selectedSlab });

  const [updateWithdrawalCheque, { isLoading: isProcessing }] =
    useUpdateWithdrawalChequeMutation();

  const [updateWithdrawalStatus, { isLoading: isUpdatingStatus }] =
    useUpdateWithdrawalStatusMutation();

  const {
    data: upRes,
    isLoading: isUpLoading,
    isFetching: isUpFetching,
    refetch: refetchUp,
  } = useGetWithdrawUnderProcessListQuery(
    { page: upPage, limit: upLimit },
    { skip: viewMode !== 'underProcess' }
  );

  // ── NEW: Lazy query for report-for-underprocess ───────────
  const [
    fetchDocList,
    {
      data: docListRes,
      isLoading: isDocListLoading,
      isFetching: isDocListFetching,
      error: docListError,
    },
  ] = useLazyGetWithdrawDocListQuery();

  // ═════════════════════════════════════════════════════════════
  // DERIVED DATA
  // ═════════════════════════════════════════════════════════════
  const withdrawalData = slabRes?.data?.updatedWithdrawals || [];
  const upData = upRes?.data?.records || [];
  const upPagination = upRes?.data?.pagenation || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  // ── Bank split – SLAB data ────────────────────────────────
  const { hdfcAccounts, otherBankAccounts } = useMemo(() => {
    const { hdfc, other } = splitByBank(withdrawalData);
    return { hdfcAccounts: hdfc, otherBankAccounts: other };
  }, [withdrawalData]);

  // ── Bank split – UNDER PROCESS paginated data ─────────────
  const { upHdfcAccounts, upOtherBankAccounts } = useMemo(() => {
    const { hdfc, other } = splitByBank(upData);
    return { upHdfcAccounts: hdfc, upOtherBankAccounts: other };
  }, [upData]);

  // ── NEW: Bank split – REPORT data (from report endpoint) ──
  const reportData = docListRes?.data || [];
  const { reportHdfcAccounts, reportOtherAccounts } = useMemo(() => {
    const { hdfc, other } = splitByBank(reportData);
    return { reportHdfcAccounts: hdfc, reportOtherAccounts: other };
  }, [reportData]);

  const hasReportData = reportData.length > 0;
  const reportFetchedCheque = docListRes ? reportChequeNumber : null;

  // ── Pick the right list for DOC modal ─────────────────────
  const getAccountsBySource = (source, bankType) => {
    if (source === 'underProcess') {
      return bankType === 'HDFC' ? reportHdfcAccounts : reportOtherAccounts;
    }
    return bankType === 'HDFC' ? hdfcAccounts : otherBankAccounts;
  };

  // ═════════════════════════════════════════════════════════════
  // HANDLERS
  // ═════════════════════════════════════════════════════════════

  // Slab Modal
  const handleFetchSlab = () => {
    setSelectedSlab(tempSlab);
    setViewMode('slabs');
    setIsSlabModalOpen(false);
  };

  // Under Process
  const handleShowUnderProcess = () => {
    setViewMode('underProcess');
    setUpPage(1);
  };

  const handleBackToSlabs = () => {
    setViewMode(selectedSlab ? 'slabs' : 'idle');
  };

  // Process Withdrawal
  const handleProcessWithdrawal = async () => {
    if (!processChequeNumber.trim())
      return toast.sucess('Please enter a cheque number');
    try {
      const r = await updateWithdrawalCheque({
        slab: processSlab,
        chequeNumber: processChequeNumber.trim(),
      }).unwrap();
      toast.sucess(r.message || 'Cheque number added successfully!');
      setIsProcessModalOpen(false);
      setProcessChequeNumber('');
      if (selectedSlab) refetchSlab();
    } catch (err) {
      toast.error(err?.data?.message);
    }
  };

  // Mark Success
  const handleUpdateStatus = async () => {
    if (!successChequeNumber.trim())
      return toast.sucess('Please enter a cheque number');
    try {
      const r = await updateWithdrawalStatus({
        chequeNumber: successChequeNumber.trim(),
      }).unwrap();
      toast.sucess(r.message || 'Status updated successfully!');
      setIsSuccessModalOpen(false);
      setSuccessChequeNumber('');
      if (selectedSlab) refetchSlab();
      if (viewMode === 'underProcess') refetchUp();
    } catch (err) {
      toast.error(err?.data?.message);
    }
  };

  // ── NEW: Fetch report by cheque number ────────────────────
  const handleFetchReport = async () => {
    if (!reportChequeNumber.trim()) {
      return toast.error('Please enter a cheque number');
    }
    try {
      const result = await fetchDocList(reportChequeNumber.trim()).unwrap();
      const records = result?.data || [];
      if (records.length === 0) {
        toast.error('No records found for this cheque number');
      } else {
        toast.sucess(`Found ${records.length} records for cheque ${reportChequeNumber}`);
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to fetch report');
    }
  };

  // DOC Modal
  const openDocModal = (bankType, source = 'slabs') => {
    const accounts = getAccountsBySource(source, bankType);
    const cheque =
      source === 'underProcess'
        ? reportChequeNumber
        : accounts.find((a) => a.checqueNumber || a.chequeNumber)?.checqueNumber ||
          accounts.find((a) => a.chequeNumber)?.chequeNumber ||
          '';
    setDocConfig({
      bankType,
      chequeNumber: cheque,
      refNumber: `JSS/MTN/${getFinancialYear()}/01`,
      date: new Date().toISOString().split('T')[0],
      source,
    });
    setIsDocModalOpen(true);
  };

  const handleDownloadDoc = () => {
    const accounts = getAccountsBySource(docConfig.source, docConfig.bankType);
    if (!accounts.length) return toast.error('No data available');
    downloadWithdrawalDoc({
      data: accounts,
      bankType: docConfig.bankType,
      chequeNumber: docConfig.chequeNumber,
      refNumber: docConfig.refNumber,
      date: docConfig.date,
    });
    setIsDocModalOpen(false);
  };

  // Refresh
  const handleRefresh = () => {
    if (viewMode === 'slabs' && selectedSlab) refetchSlab();
    if (viewMode === 'underProcess') refetchUp();
  };

  // ═════════════════════════════════════════════════════════════
  // EXCEL HELPERS
  // ═════════════════════════════════════════════════════════════
  const createWorksheet = (data, bankType) => {
    const border = (style = 'thin') => ({
      top: { style, color: { rgb: '000000' } },
      bottom: { style, color: { rgb: '000000' } },
      left: { style, color: { rgb: '000000' } },
      right: { style, color: { rgb: '000000' } },
    });
    const headerStyle = {
      font: { bold: true, sz: 12, color: { rgb: '000000' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    };
    const companyStyle = {
      font: { bold: true, sz: 14, color: { rgb: '000000' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    };
    const thStyle = {
      font: { bold: true, sz: 9, color: { rgb: '000000' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      fill: { fgColor: { rgb: bankType === 'HDFC' ? 'FFD700' : 'BFBFBF' } },
      border: border('medium'),
    };
    const tdCenter = {
      font: { bold: true, sz: 8, color: { rgb: '000000' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: border(),
    };
    const totalLabel = {
      font: { bold: true, sz: 10, color: { rgb: '000000' } },
      alignment: { horizontal: 'right', vertical: 'center' },
      border: border('medium'),
    };
    const totalVal = {
      ...totalLabel,
      alignment: { horizontal: 'center', vertical: 'center' },
    };
    const emptyBorder = { border: border('medium') };

    const label =
      bankType === 'HDFC'
        ? 'Please find the attached sheet below for Amount transfer OF HDFC BANK'
        : 'Please find the attached sheet below for Amount transfer OF OTHER BANK';

    const rows = [];
    rows.push(
      Array(6).fill(null).map((_, i) => ({ v: i === 0 ? label : '', s: headerStyle }))
    );
    rows.push(
      Array(6).fill(null).map((_, i) => ({
        v: i === 0 ? 'JAISVIK SOFTWARE SOLUTIONS PVT. LTD - HYDERABAD' : '',
        s: companyStyle,
      }))
    );
    rows.push(Array(6).fill({ v: '' }));
    rows.push(
      ['S.NO', 'NAME OF THE ACCOUNT HOLDER', 'BANK NAME', 'IFSC CODE', 'ACCOUNT NUMBER', 'AMOUNT (RS)'].map(
        (v) => ({ v, s: thStyle })
      )
    );

    let total = 0;
    data.forEach((item, i) => {
      const net = getNetAmount(item);
      total += net;
      rows.push([
        { v: i + 1, s: tdCenter },
        { v: item.userId?.name || 'N/A', s: tdCenter },
        { v: item.kycInfo?.bank_name || 'N/A', s: tdCenter },
        { v: item.kycInfo?.ifsc_code || 'N/A', s: tdCenter },
        { v: item.kycInfo?.bank_account || 'N/A', s: tdCenter },
        { v: net.toFixed(2), s: tdCenter },
      ]);
    });

    rows.push([
      { v: '', s: emptyBorder },
      { v: '', s: emptyBorder },
      { v: '', s: emptyBorder },
      { v: '', s: emptyBorder },
      { v: 'Total=', s: totalLabel },
      { v: total.toFixed(2), s: totalVal },
    ]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 5 }, { wch: 28 }, { wch: 20 }, { wch: 12 }, { wch: 18 }, { wch: 12 }];
    const rh = [{ hpt: 20 }, { hpt: 22 }, { hpt: 10 }, { hpt: 25 }];
    for (let i = 0; i < data.length; i++) rh.push({ hpt: 18 });
    rh.push({ hpt: 22 });
    ws['!rows'] = rh;
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
    ];
    return ws;
  };

  const buildAndDownloadExcel = (allData, hdfcData, otherData, suffix) => {
    if (!allData.length) return toast.error('No data available');
    const d = new Date();
    const wb = XLSX.utils.book_new();
    if (otherData.length > 0)
      XLSX.utils.book_append_sheet(wb, createWorksheet(otherData, 'OTHER'), 'Other Bank');
    if (hdfcData.length > 0)
      XLSX.utils.book_append_sheet(wb, createWorksheet(hdfcData, 'HDFC'), 'HDFC Bank');
    if (!otherData.length && !hdfcData.length) return toast.error('No data');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(
      new Blob([buf], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      `withdrawal_${suffix}_${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}.xlsx`
    );
  };

  const downloadSlabExcel = () =>
    buildAndDownloadExcel(withdrawalData, hdfcAccounts, otherBankAccounts, `slab${selectedSlab}`);

  // ── NEW: Download Excel using REPORT data ─────────────────
  const downloadReportExcel = () =>
    buildAndDownloadExcel(
      reportData,
      reportHdfcAccounts,
      reportOtherAccounts,
      `cheque_${reportChequeNumber}`
    );

  // ═════════════════════════════════════════════════════════════
  // COLUMN DEFINITIONS
  // ═════════════════════════════════════════════════════════════
  const slabColumns = [
    {
      header: 'S.No',
      accessor: 'sno',
      width: '60px',
      render: (_, idx, cp, pp) => (cp - 1) * pp + idx + 1,
    },
    {
      header: 'Name',
      accessor: 'name',
      minWidth: '160px',
      render: (row) => (
        <span className="text-white font-semibold">{row.userId?.name || 'N/A'}</span>
      ),
    },
    {
      header: 'Bank Name',
      accessor: 'bank_name',
      minWidth: '140px',
      render: (row) => row.kycInfo?.bank_name || 'N/A',
    },
    {
      header: 'IFSC',
      accessor: 'ifsc_code',
      minWidth: '110px',
      render: (row) => (
        <span className="font-mono text-xs">{row.kycInfo?.ifsc_code || 'N/A'}</span>
      ),
    },
    {
      header: 'Account No',
      accessor: 'bank_account',
      minWidth: '150px',
      render: (row) => (
        <span className="font-mono text-xs">{row.kycInfo?.bank_account || 'N/A'}</span>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      minWidth: '110px',
      render: (row) => (
        <span className="text-[#b9fd5c] font-bold">₹{formatINR(getNetAmount(row))}</span>
      ),
    },
    {
      header: 'Cheque',
      accessor: 'chequeNumber',
      minWidth: '100px',
      render: (row) => (
        <span className={row.checqueNumber ? 'text-cyan-400 font-bold' : 'text-[#3a3d43]'}>
          {row.checqueNumber || '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      minWidth: '100px',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Type',
      accessor: 'bank_type',
      minWidth: '80px',
      render: (row) => <BankBadge bankName={row.kycInfo?.bank_name} />,
    },
  ];

  const upColumns = [
    {
      header: 'S.No',
      accessor: 'sno',
      width: '60px',
      render: (_, idx) => (upPage - 1) * upLimit + idx + 1,
    },
    {
      header: 'Name',
      accessor: 'name',
      minWidth: '160px',
      render: (row) => (
        <div>
          <p className="text-white font-semibold text-sm">{row.userId?.name || 'N/A'}</p>
          <p className="text-[#5a5d63] text-xs">{row.userId?.username || ''}</p>
        </div>
      ),
    },
    // {
    //   header: 'Bank',
    //   accessor: 'bank_name',
    //   minWidth: '130px',
    //   render: (row) => (
    //     <div>
    //       <p className="text-white text-xs font-medium">{row.kycInfo?.bank_name || 'N/A'}</p>
    //       <p className="text-[#5a5d63] text-[10px] font-mono">{row.kycInfo?.ifsc_code || ''}</p>
    //     </div>
    //   ),
    // },
    // {
    //   header: 'Account No',
    //   accessor: 'bank_account',
    //   minWidth: '140px',
    //   render: (row) => (
    //     <span className="font-mono text-xs text-white">{row.kycInfo?.bank_account || 'N/A'}</span>
    //   ),
    // },
    {
      header: 'Amount',
      accessor: 'amount',
      minWidth: '120px',
      render: (row) => (
        <span className="text-[#b9fd5c] font-bold">₹{formatINR(getNetAmount(row))}</span>
      ),
    },
    {
      header: 'Cheque',
      accessor: 'chequeNumber',
      minWidth: '110px',
      render: (row) => (
        <span className="text-cyan-400 font-bold">
          {row.chequeNumber || row.checqueNumber || '—'}
        </span>
      ),
    },
    {
      header: 'Type',
      accessor: 'bank_type',
      minWidth: '80px',
      render: (row) => <BankBadge bankName={row.kycInfo?.bank_name} />,
    },
    {
      header: 'Status',
      accessor: 'status',
      minWidth: '110px',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Date',
      accessor: 'created_at',
      minWidth: '100px',
      render: (row) => {
        const dt = new Date(row.created_at);
        return (
          <div className="text-xs leading-relaxed">
            <p className="text-white">{dt.toLocaleDateString('en-IN')}</p>
            <p className="text-[#6a6d73]">
              {dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        );
      },
    },
  ];

  // ═════════════════════════════════════════════════════════════
  // JSX
  // ═════════════════════════════════════════════════════════════
  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* ─── HEADER ───────────────────────────────────────────── */}
      <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-2xl p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Withdrawal Management
            </h1>
            <p className="text-[#6a6d73] text-sm mt-1">
              Manage, download &amp; process withdrawal data
            </p>
          </div>

          {viewMode === 'slabs' && selectedSlab && (
            <div
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#282f35] border ${SLAB_CONFIG[selectedSlab]?.border}`}
            >
              <div>
                <p className="text-xs text-[#6a6d73] font-medium">Active Slab</p>
                <p className={`text-sm font-bold ${SLAB_CONFIG[selectedSlab]?.color}`}>
                  Slab {selectedSlab}
                </p>
              </div>
            </div>
          )}

          {viewMode === 'underProcess' && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#282f35] border border-cyan-500/40">
              <div>
                <p className="text-xs text-[#fff] font-medium">Viewing</p>
                <p className="text-sm font-bold text-cyan-400">Under Process List</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2.5 pt-4 border-t border-[#2a2c2f]">
          <button
            onClick={() => {
              setTempSlab(selectedSlab || 1);
              setIsSlabModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#b9fd5c] text-black hover:bg-[#a8ec4b] active:scale-[0.97] transition-all"
          >
            Get Slabs List
          </button>
          <button
            onClick={handleShowUnderProcess}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-[0.97] ${
              viewMode === 'underProcess'
                ? 'bg-cyan-500 text-white border-cyan-500'
                : 'border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10'
            }`}
          >
            Under Process
          </button>

          <div className="w-px h-8 bg-[#2a2c2f] self-center mx-1" />

          <button
            onClick={() => {
              setProcessSlab(selectedSlab || 1);
              setProcessChequeNumber('');
              setIsProcessModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold border border-[#b9fd5c]/50 text-[#b9fd5c] hover:bg-[#b9fd5c]/10 active:scale-[0.97] transition-all"
          >
            Process
          </button>
          <button
            onClick={() => {
              setSuccessChequeNumber('');
              setIsSuccessModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold border border-green-500/50 text-green-400 hover:bg-green-500/10 active:scale-[0.97] transition-all"
          >
            Mark Success
          </button>
          <button
            onClick={handleRefresh}
            className="px-4 py-2.5 rounded-xl text-xs font-bold border border-[#343638] text-[#6a6d73] hover:bg-[#282f35] active:scale-[0.97] transition-all"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* ─── IDLE STATE ───────────────────────────────────────── */}
      {viewMode === 'idle' && (
        <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <h3 className="text-white text-lg font-bold mb-2">No Data Selected</h3>
          <p className="text-[#6a6d73] text-sm max-w-md mb-6">
            Click <strong className="text-[#b9fd5c]">"Get Slabs List"</strong> to fetch withdrawal
            data by slab, or view the <strong className="text-cyan-400">"Under Process"</strong>{' '}
            list.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setTempSlab(1);
                setIsSlabModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#b9fd5c] text-black hover:bg-[#a8ec4b] transition-all"
            >
              Get Slabs List
            </button>
            <button
              onClick={handleShowUnderProcess}
              className="px-5 py-2.5 rounded-xl text-sm font-bold border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition-all"
            >
              Under Process
            </button>
          </div>
        </div>
      )}

      {/* ─── SLAB VIEW ────────────────────────────────────────── */}
      {viewMode === 'slabs' && selectedSlab && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#6a6d73] text-[11px] font-semibold uppercase tracking-wider">
                  Total
                </span>
                <span className="text-[#b9fd5c] text-[10px] font-bold bg-[#b9fd5c]/10 px-2 py-0.5 rounded-full">
                  Slab {selectedSlab}
                </span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-white">
                {isSlabLoading ? <Loader /> : withdrawalData.length}
              </p>
            </div>

            <div className="bg-[#1a1c1f] border border-orange-500/20 rounded-2xl p-4">
              <span className="text-orange-400 text-[11px] font-semibold uppercase tracking-wider">
                HDFC
              </span>
              <p className="text-2xl md:text-3xl font-bold text-white mt-2">
                {isSlabLoading ? <Loader /> : hdfcAccounts.length}
              </p>
              {!isSlabLoading && (
                <p className="text-[#b9fd5c] text-xs font-bold mt-1">
                  ₹{formatINR(calcTotal(hdfcAccounts))}
                </p>
              )}
            </div>

            <div className="bg-[#1a1c1f] border border-[#b9fd5c]/20 rounded-2xl p-4">
              <span className="text-[#b9fd5c] text-[11px] font-semibold uppercase tracking-wider">
                Other
              </span>
              <p className="text-2xl md:text-3xl font-bold text-white mt-2">
                {isSlabLoading ? <Loader /> : otherBankAccounts.length}
              </p>
              {!isSlabLoading && (
                <p className="text-[#b9fd5c] text-xs font-bold mt-1">
                  ₹{formatINR(calcTotal(otherBankAccounts))}
                </p>
              )}
            </div>

            <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-2xl p-4">
              <span className="text-[#6a6d73] text-[11px] font-semibold uppercase tracking-wider">
                Grand Total
              </span>
              <p className="text-xl md:text-2xl font-bold text-[#b9fd5c] mt-2">
                {isSlabLoading ? <Loader /> : `₹${formatINR(calcTotal(withdrawalData))}`}
              </p>
            </div>
          </div>

          {!isSlabLoading && withdrawalData.length > 0 && (
            <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-2xl p-4">
              <p className="text-[#6a6d73] text-xs font-semibold uppercase tracking-wider mb-3">
                Download Options
              </p>
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={downloadSlabExcel}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#b9fd5c] text-black hover:bg-[#a8ec4b] active:scale-[0.97] transition-all flex items-center gap-2"
                >
                  Excel
                  <span className="bg-black/10 px-2 py-0.5 rounded-full text-[10px]">
                    {withdrawalData.length}
                  </span>
                </button>

                {otherBankAccounts.length > 0 && (
                  <button
                    onClick={() => openDocModal('OTHER', 'slabs')}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold border border-[#b9fd5c]/50 text-[#b9fd5c] hover:bg-[#b9fd5c]/10 active:scale-[0.97] transition-all flex items-center gap-2"
                  >
                    Other Bank DOC
                    <span className="bg-[#b9fd5c]/10 px-2 py-0.5 rounded-full text-[10px]">
                      {otherBankAccounts.length}
                    </span>
                  </button>
                )}

                {hdfcAccounts.length > 0 && (
                  <button
                    onClick={() => openDocModal('HDFC', 'slabs')}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold border border-orange-500/50 text-orange-400 hover:bg-orange-500/10 active:scale-[0.97] transition-all flex items-center gap-2"
                  >
                    HDFC Bank DOC
                    <span className="bg-orange-500/10 px-2 py-0.5 rounded-full text-[10px]">
                      {hdfcAccounts.length}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          {slabError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between">
              <span className="text-red-400 text-sm font-semibold">
                {slabError?.data?.message || 'Failed to load data'}
              </span>
              <button
                onClick={refetchSlab}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-all"
              >
                Retry
              </button>
            </div>
          )}

          <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-2xl overflow-hidden">
            <Table
              columns={slabColumns}
              data={withdrawalData}
              isLoading={isSlabLoading}
              currentPage={1}
              perPage={50}
              noDataTitle="No Withdrawal Data"
              noDataMessage={`No records found for Slab ${selectedSlab}`}
              noDataIcon="inbox"
              noDataAction={true}
              noDataActionLabel="Refresh"
              onNoDataAction={refetchSlab}
            />
          </div>
        </>
      )}

      {/* ─── UNDER PROCESS VIEW ───────────────────────────────── */}
      {viewMode === 'underProcess' && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToSlabs}
                className="p-2 rounded-lg bg-[#282f35] text-[#8a8d93] hover:text-white hover:bg-[#343638] transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h2 className="text-lg font-bold text-white">Under Process Withdrawals</h2>
                <p className="text-[#6a6d73] text-xs">
                  Showing all withdrawals currently under process
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={refetchUp}
                disabled={isUpFetching}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition-all disabled:opacity-40"
              >
                {isUpFetching ? '...' : 'Refresh'}
              </button>
              <button
                onClick={() => {
                  setSuccessChequeNumber('');
                  setIsSuccessModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-green-500 text-white hover:bg-green-600 transition-all"
              >
                Mark Success
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#1a1c1f] border border-cyan-500/20 rounded-2xl p-4">
              <span className="text-cyan-400 text-[11px] font-semibold uppercase tracking-wider">
                Total Records
              </span>
              <p className="text-2xl font-bold text-white mt-2">
                {isUpLoading ? <Loader /> : upPagination.total}
              </p>
            </div>

            <div className="bg-[#1a1c1f] border border-[#b9fd5c]/20 rounded-2xl p-4">
              <span className="text-[#b9fd5c] text-[11px] font-semibold uppercase tracking-wider">
                Overall Total
              </span>
              <p className="text-xl font-bold text-[#b9fd5c] mt-2">
                {isUpLoading ? (
                  <Loader />
                ) : (
                  `₹${formatINR(parseFloat(upRes?.data?.totalAmount || 0))}`
                )}
              </p>
              <p className="text-[#3a3d43] text-[10px] mt-1 font-medium">Across all pages</p>
            </div>

            <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-2xl p-4">
              <span className="text-[#6a6d73] text-[11px] font-semibold uppercase tracking-wider">
                This Page
              </span>
              <p className="text-2xl font-bold text-white mt-2">
                {isUpLoading ? <Loader /> : upData.length}
              </p>
            </div>

            <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-2xl p-4">
              <span className="text-[#6a6d73] text-[11px] font-semibold uppercase tracking-wider">
                Pagination
              </span>
              <p className="text-lg font-bold text-white mt-2">
                {upPagination.page} / {upPagination.totalPages}
              </p>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              NEW: DOWNLOAD REPORT SECTION
              Fetch data by cheque number from report-for-underprocess
              ══════════════════════════════════════════════════════ */}
          <div className="bg-[#1a1c1f] border border-cyan-500/30 rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="text-white text-sm font-bold mb-1">
                Download Report by Cheque Number
              </h3>
              <p className="text-[#6a6d73] text-xs">
                Enter a cheque number to fetch all associated records for Excel & DOC download
              </p>
            </div>

            {/* Cheque Input + Fetch Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={reportChequeNumber}
                  onChange={(e) => setReportChequeNumber(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFetchReport()}
                  placeholder="Enter cheque number (e.g. 000141)"
                  className="w-full px-4 py-3 rounded-xl bg-[#282f35] border-2 border-[#2a2c2f] text-white font-semibold placeholder-[#3a3d43] focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                />
              </div>
              <button
                onClick={handleFetchReport}
                disabled={isDocListLoading || isDocListFetching || !reportChequeNumber.trim()}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 min-w-[140px] ${
                  isDocListLoading || isDocListFetching || !reportChequeNumber.trim()
                    ? 'bg-[#282f35] text-[#3a3d43] cursor-not-allowed'
                    : 'bg-cyan-500 text-white hover:bg-cyan-600 active:scale-[0.97]'
                }`}
              >
                {isDocListLoading || isDocListFetching ? (
                  <>
                    <Loader /> Fetching...
                  </>
                ) : (
                  'Fetch Report'
                )}
              </button>
            </div>

            {/* Error */}
            {docListError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <p className="text-red-400 text-xs font-semibold">
                  {docListError?.data?.message || 'Failed to fetch report'}
                </p>
              </div>
            )}

            {/* Report Results */}
            {hasReportData && (
              <div className="space-y-4 pt-2 border-t border-[#2a2c2f]">
                {/* Report Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-[#282f35] rounded-xl p-3">
                    <p className="text-[#6a6d73] text-[10px] font-semibold uppercase tracking-wider">
                      Cheque
                    </p>
                    <p className="text-cyan-400 text-sm font-bold font-mono mt-1">
                      {reportFetchedCheque}
                    </p>
                  </div>
                  <div className="bg-[#282f35] rounded-xl p-3">
                    <p className="text-[#6a6d73] text-[10px] font-semibold uppercase tracking-wider">
                      Total Records
                    </p>
                    <p className="text-white text-lg font-bold mt-1">{reportData.length}</p>
                  </div>
                  <div className="bg-[#282f35] rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-400 text-[10px] font-semibold uppercase tracking-wider">
                          HDFC
                        </p>
                        <p className="text-white text-sm font-bold mt-1">
                          {reportHdfcAccounts.length}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#b9fd5c] text-[10px] font-semibold uppercase tracking-wider">
                          Other
                        </p>
                        <p className="text-white text-sm font-bold mt-1">
                          {reportOtherAccounts.length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#282f35] rounded-xl p-3">
                    <p className="text-[#6a6d73] text-[10px] font-semibold uppercase tracking-wider">
                      Grand Total
                    </p>
                    <p className="text-[#b9fd5c] text-sm font-bold mt-1">
                      ₹{formatINR(calcTotal(reportData))}
                    </p>
                  </div>
                </div>

                {/* Download Buttons */}
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={downloadReportExcel}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#b9fd5c] text-black hover:bg-[#a8ec4b] active:scale-[0.97] transition-all flex items-center gap-2"
                  >
                    📊 Excel
                    <span className="bg-black/10 px-2 py-0.5 rounded-full text-[10px]">
                      {reportData.length}
                    </span>
                  </button>

                  {reportOtherAccounts.length > 0 && (
                    <button
                      onClick={() => openDocModal('OTHER', 'underProcess')}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold border border-[#b9fd5c]/50 text-[#b9fd5c] hover:bg-[#b9fd5c]/10 active:scale-[0.97] transition-all flex items-center gap-2"
                    >
                      📄 Other Bank DOC
                      <span className="bg-[#b9fd5c]/10 px-2 py-0.5 rounded-full text-[10px]">
                        {reportOtherAccounts.length}
                      </span>
                    </button>
                  )}

                  {reportHdfcAccounts.length > 0 && (
                    <button
                      onClick={() => openDocModal('HDFC', 'underProcess')}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold border border-orange-500/50 text-orange-400 hover:bg-orange-500/10 active:scale-[0.97] transition-all flex items-center gap-2"
                    >
                      📄 HDFC Bank DOC
                      <span className="bg-orange-500/10 px-2 py-0.5 rounded-full text-[10px]">
                        {reportHdfcAccounts.length}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Empty state after fetch */}
            {docListRes && !hasReportData && (
              <div className="bg-[#282f35] rounded-xl p-4 text-center">
                <p className="text-[#6a6d73] text-sm">
                  No records found for cheque number{' '}
                  <span className="text-cyan-400 font-mono font-bold">{reportChequeNumber}</span>
                </p>
              </div>
            )}
          </div>

          {/* Under Process Table */}
          <div className="bg-[#1a1c1f] border border-[#2a2c2f] rounded-2xl overflow-hidden">
            <Table
              columns={upColumns}
              data={upData}
              isLoading={isUpLoading || isUpFetching}
              currentPage={1}
              perPage={upData.length || upLimit}
              noDataTitle="No Under Process Withdrawals"
              noDataMessage="No withdrawals currently under process."
              noDataIcon="inbox"
              noDataAction={true}
              noDataActionLabel="Refresh"
              onNoDataAction={refetchUp}
            />
          </div>

          {upPagination.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={upPage}
                totalPages={upPagination.totalPages}
                onPageChange={(page) => setUpPage(page)}
              />
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MODALS                                                 */}
      {/* ═══════════════════════════════════════════════════════ */}

      {/* Slab selection */}
      <Modal
        isOpen={isSlabModalOpen}
        onClose={() => setIsSlabModalOpen(false)}
        title="Select Withdrawal Slab"
        size="sm"
      >
        <div className="space-y-5">
          <p className="text-[#6a6d73] text-sm">Choose a slab to fetch withdrawal records</p>
          <div className="space-y-2.5">
            {[1, 2].map((slab) => (
              <button
                key={slab}
                onClick={() => setTempSlab(slab)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  tempSlab === slab
                    ? 'border-[#b9fd5c] bg-[#b9fd5c]/10'
                    : 'border-[#2a2c2f] bg-[#282f35] hover:border-[#3a3d43]'
                }`}
              >
                <div className="text-left flex-1">
                  <p
                    className={`text-sm font-bold ${
                      tempSlab === slab ? 'text-[#b9fd5c]' : 'text-white'
                    }`}
                  >
                    Slab {slab}
                  </p>
                </div>
                {tempSlab === slab && (
                  <div className="w-5 h-5 rounded-full bg-[#b9fd5c] flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-black"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsSlabModalOpen(false)}
              className="flex-1 px-4 py-3 bg-[#282f35] hover:bg-[#343638] text-[#6a6d73] font-semibold rounded-3xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleFetchSlab}
              className="flex-1 px-4 py-3 bg-[#b9fd5c] text-black font-bold rounded-3xl hover:bg-[#a8ec4b] active:scale-[0.97] transition-all"
            >
              Fetch Data
            </button>
          </div>
        </div>
      </Modal>

      {/* Process */}
      <Modal
        isOpen={isProcessModalOpen}
        onClose={() => {
          setIsProcessModalOpen(false);
          setProcessChequeNumber('');
        }}
        title="Process Withdrawal"
        size="sm"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-[#6a6d73] text-xs font-semibold uppercase tracking-wider mb-2">
              Slab Number
            </label>
            <div className="flex gap-2">
              {[1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setProcessSlab(s)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                    processSlab === s
                      ? 'border-[#b9fd5c] bg-[#b9fd5c]/10 text-[#b9fd5c]'
                      : 'border-[#2a2c2f] bg-[#282f35] text-[#6a6d73] hover:border-[#3a3d43]'
                  }`}
                >
                  Slab {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[#6a6d73] text-xs font-semibold uppercase tracking-wider mb-2">
              Cheque Number <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={processChequeNumber}
              onChange={(e) => setProcessChequeNumber(e.target.value)}
              placeholder="Enter cheque number"
              className="w-full px-4 py-3 rounded-xl bg-[#282f35] border-2 border-[#2a2c2f] text-white font-semibold placeholder-[#3a3d43] focus:outline-none focus:border-[#b9fd5c] transition-colors"
            />
          </div>
          <div className="bg-[#b9fd5c]/5 border border-[#b9fd5c]/20 rounded-xl p-3.5">
            <p className="text-[#b9fd5c] text-xs leading-relaxed">
              <strong>ℹ️ Note:</strong> This will add the cheque number to all pending withdrawals
              in Slab {processSlab}.
            </p>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => {
                setIsProcessModalOpen(false);
                setProcessChequeNumber('');
              }}
              className="flex-1 px-4 py-3 bg-[#282f35] hover:bg-[#343638] text-[#6a6d73] font-semibold rounded-3xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleProcessWithdrawal}
              disabled={isProcessing || !processChequeNumber.trim()}
              className={`flex-1 px-4 py-3 font-bold rounded-3xl transition-all flex items-center justify-center gap-2 ${
                isProcessing || !processChequeNumber.trim()
                  ? 'bg-[#282f35] text-[#3a3d43] cursor-not-allowed'
                  : 'bg-[#b9fd5c] text-black hover:bg-[#a8ec4b] active:scale-[0.97]'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader /> Processing...
                </>
              ) : (
                'Add Cheque'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Mark Success */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          setSuccessChequeNumber('');
        }}
        title="Mark as Success"
        size="sm"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-[#6a6d73] text-xs font-semibold uppercase tracking-wider mb-2">
              Cheque Number <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={successChequeNumber}
              onChange={(e) => setSuccessChequeNumber(e.target.value)}
              placeholder="Enter cheque number to mark as success"
              className="w-full px-4 py-3 rounded-xl bg-[#282f35] border-2 border-[#2a2c2f] text-white font-semibold placeholder-[#3a3d43] focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => {
                setIsSuccessModalOpen(false);
                setSuccessChequeNumber('');
              }}
              className="flex-1 px-4 py-3 bg-[#282f35] hover:bg-[#343638] text-[#6a6d73] font-semibold rounded-3xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateStatus}
              disabled={isUpdatingStatus || !successChequeNumber.trim()}
              className={`flex-1 px-4 py-3 font-bold rounded-3xl transition-all flex items-center justify-center gap-2 ${
                isUpdatingStatus || !successChequeNumber.trim()
                  ? 'bg-[#282f35] text-[#3a3d43] cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600 active:scale-[0.97]'
              }`}
            >
              {isUpdatingStatus ? (
                <>
                  <Loader /> Updating...
                </>
              ) : (
                'Mark Success'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* DOC modal */}
      <Modal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        title="📄 Generate Word Document"
        size="sm"
      >
        <div className="space-y-5">
          {/* Source indicator */}
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                docConfig.source === 'underProcess'
                  ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/50'
                  : 'bg-[#b9fd5c]/15 text-[#b9fd5c] border-[#b9fd5c]/50'
              }`}
            >
              {docConfig.source === 'underProcess'
                ? `Under Process • Cheque: ${reportChequeNumber}`
                : `Slab ${selectedSlab}`}
            </span>
          </div>

          {/* Bank Type & Stats */}
          <div
            className={`rounded-xl p-4 border ${
              docConfig.bankType === 'HDFC'
                ? 'bg-orange-500/5 border-orange-500/30'
                : 'bg-[#b9fd5c]/5 border-[#b9fd5c]/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6a6d73] font-medium">Bank Type</p>
                <p
                  className={`text-sm font-bold ${
                    docConfig.bankType === 'HDFC' ? 'text-orange-400' : 'text-[#b9fd5c]'
                  }`}
                >
                  {docConfig.bankType === 'HDFC' ? '🏦 HDFC Bank' : '🏛️ Other Banks'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#6a6d73] font-medium">Records</p>
                <p className="text-sm font-bold text-white">
                  {getAccountsBySource(docConfig.source, docConfig.bankType).length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#6a6d73] font-medium">Total</p>
                <p className="text-sm font-bold text-[#b9fd5c]">
                  ₹
                  {formatINR(
                    calcTotal(getAccountsBySource(docConfig.source, docConfig.bankType))
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Cheque Number */}
          <div>
            <label className="block text-[#6a6d73] text-xs font-semibold uppercase tracking-wider mb-2">
              Cheque Number
            </label>
            <input
              type="text"
              value={docConfig.chequeNumber}
              onChange={(e) => setDocConfig({ ...docConfig, chequeNumber: e.target.value })}
              placeholder="e.g. 000141"
              className="w-full px-4 py-3 rounded-xl bg-[#282f35] border-2 border-[#2a2c2f] text-white font-semibold placeholder-[#3a3d43] focus:outline-none focus:border-[#b9fd5c] transition-colors"
            />
          </div>

          {/* Reference Number */}
          <div>
            <label className="block text-[#6a6d73] text-xs font-semibold uppercase tracking-wider mb-2">
              Reference Number
            </label>
            <input
              type="text"
              value={docConfig.refNumber}
              onChange={(e) => setDocConfig({ ...docConfig, refNumber: e.target.value })}
              placeholder="e.g. JSS/MTN/2025-26/01"
              className="w-full px-4 py-3 rounded-xl bg-[#282f35] border-2 border-[#2a2c2f] text-white font-semibold placeholder-[#3a3d43] focus:outline-none focus:border-[#b9fd5c] transition-colors font-mono text-sm"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-[#6a6d73] text-xs font-semibold uppercase tracking-wider mb-2">
              Date
            </label>
            <input
              type="date"
              value={docConfig.date}
              onChange={(e) => setDocConfig({ ...docConfig, date: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#282f35] border-2 border-[#2a2c2f] text-white font-semibold focus:outline-none focus:border-[#b9fd5c] transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setIsDocModalOpen(false)}
              className="flex-1 px-4 py-3 bg-[#282f35] hover:bg-[#343638] text-[#6a6d73] font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDownloadDoc}
              className="flex-1 px-4 py-3 bg-[#b9fd5c] text-black font-bold rounded-xl hover:bg-[#a8ec4b] active:scale-[0.97] transition-all"
            >
              Download DOC
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WithdrawalDownload;