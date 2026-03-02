import React, { useState } from 'react';
import { useWithdrawalSlabsQuery } from './withdrawalApiSlice';
import XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import Table from '../../reusableComponents/Tables/Table'; // Adjust path as needed

const WithdrawalDownload = () => {
  const [selectedSlab, setSelectedSlab] = useState(1);
  
  const { data: response, isLoading, error, refetch } = useWithdrawalSlabsQuery(selectedSlab);
  const withdrawalData = response?.data || [];

  // Filter HDFC and Other Bank accounts
  const filterAccounts = () => {
    const hdfcAccounts = [];
    const otherBankAccounts = [];

    withdrawalData.forEach((item) => {
      const bankName = (item.kycInfo?.bank_name || '').toLowerCase().trim();
      
      if (bankName.includes('hdfc')) {
        hdfcAccounts.push(item);
      } else {
        otherBankAccounts.push(item);
      }
    });

    return { hdfcAccounts, otherBankAccounts };
  };

  const { hdfcAccounts, otherBankAccounts } = filterAccounts();

  // Table columns configuration
  const columns = [
    {
      header: 'S.No',
      accessor: 'sno',
      width: '60px',
      render: (row, rowIndex, currentPage, perPage) => {
        return ((currentPage - 1) * perPage) + rowIndex + 1;
      }
    },
    {
      header: 'Name',
      accessor: 'name',
      minWidth: '180px',
      render: (row) => row.userId?.name || 'N/A'
    },
    {
      header: 'Bank Name',
      accessor: 'bank_name',
      minWidth: '150px',
      render: (row) => row.kycInfo?.bank_name || 'N/A'
    },
    {
      header: 'IFSC Code',
      accessor: 'ifsc_code',
      minWidth: '120px',
      render: (row) => row.kycInfo?.ifsc_code || 'N/A'
    },
    {
      header: 'Account Number',
      accessor: 'bank_account',
      minWidth: '150px',
      render: (row) => row.kycInfo?.bank_account || 'N/A'
    },
    {
      header: 'Amount (₹)',
      accessor: 'amount',
      minWidth: '120px',
      render: (row) => {
        const amount = parseFloat(row.amount?.$numberDecimal || row.amount) || 0;
        const adminCharges = parseFloat(row.admin_inr_charges?.$numberDecimal || row.admin_inr_charges) || 0;
        const netAmount = amount - adminCharges;
        return (
          <span className="text-green-400 font-bold">
            ₹{netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        );
      }
    },
    {
      header: 'Bank Type',
      accessor: 'bank_type',
      minWidth: '100px',
      render: (row) => {
        const bankName = (row.kycInfo?.bank_name || '').toLowerCase();
        const isHDFC = bankName.includes('hdfc');
        return (
          <span className={`px-2 py-1 rounded text-xs font-bold ${isHDFC ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'}`}>
            {isHDFC ? 'HDFC' : 'Other'}
          </span>
        );
      }
    }
  ];

  // Create worksheet helper
  const createWorksheet = (data, bankType) => {
    const headerStyle = {
      font: { bold: true, sz: 12, color: { rgb: '000000' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    };

    const companyStyle = {
      font: { bold: true, sz: 14, color: { rgb: '000000' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    };

    const tableHeaderStyle = {
      font: { bold: true, sz: 9, color: { rgb: '000000' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      fill: { fgColor: { rgb: bankType === 'HDFC' ? 'FFD700' : 'BFBFBF' } },
      border: {
        top: { style: 'medium', color: { rgb: '000000' } },
        bottom: { style: 'medium', color: { rgb: '000000' } },
        left: { style: 'medium', color: { rgb: '000000' } },
        right: { style: 'medium', color: { rgb: '000000' } },
      },
    };

    const dataCellStyle = {
      font: { bold: true, sz: 8, color: { rgb: '000000' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      },
    };

    const dataCellStyleLeft = {
      font: { bold: true, sz: 8, color: { rgb: '000000' } },
      alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      },
    };

    const totalLabelStyle = {
      font: { bold: true, sz: 10, color: { rgb: '000000' } },
      alignment: { horizontal: 'right', vertical: 'center' },
      border: {
        top: { style: 'medium', color: { rgb: '000000' } },
        bottom: { style: 'medium', color: { rgb: '000000' } },
        left: { style: 'medium', color: { rgb: '000000' } },
        right: { style: 'medium', color: { rgb: '000000' } },
      },
    };

    const totalValueStyle = {
      font: { bold: true, sz: 10, color: { rgb: '000000' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      fill: { fgColor: { rgb: 'FFFF00' } },
      border: {
        top: { style: 'medium', color: { rgb: '000000' } },
        bottom: { style: 'medium', color: { rgb: '000000' } },
        left: { style: 'medium', color: { rgb: '000000' } },
        right: { style: 'medium', color: { rgb: '000000' } },
      },
    };

    const emptyBorderStyle = {
      border: {
        top: { style: 'medium', color: { rgb: '000000' } },
        bottom: { style: 'medium', color: { rgb: '000000' } },
        left: { style: 'medium', color: { rgb: '000000' } },
        right: { style: 'medium', color: { rgb: '000000' } },
      },
    };

    const sheetData = [];

    const headerText = bankType === 'HDFC' 
      ? 'Please find the attached sheet below for Amount transfer OF HDFC BANK'
      : 'Please find the attached sheet below for Amount transfer OF OTHER BANK';

    // Row 1: Header
    sheetData.push([
      { v: headerText, s: headerStyle },
      { v: '', s: headerStyle },
      { v: '', s: headerStyle },
      { v: '', s: headerStyle },
      { v: '', s: headerStyle },
      { v: '', s: headerStyle },
    ]);

    // Row 2: Company
    sheetData.push([
      { v: 'JAISVIK SOFTWARE SOLUTIONS PVT. LTD - HYDERABAD', s: companyStyle },
      { v: '', s: companyStyle },
      { v: '', s: companyStyle },
      { v: '', s: companyStyle },
      { v: '', s: companyStyle },
      { v: '', s: companyStyle },
    ]);

    // Row 3: Empty
    sheetData.push([{ v: '' }, { v: '' }, { v: '' }, { v: '' }, { v: '' }, { v: '' }]);

    // Row 4: Table headers
    sheetData.push([
      { v: 'S.NO', s: tableHeaderStyle },
      { v: 'NAME OF THE ACCOUNT HOLDER', s: tableHeaderStyle },
      { v: 'BANK NAME', s: tableHeaderStyle },
      { v: 'IFSC CODE', s: tableHeaderStyle },
      { v: 'ACCOUNT NUMBER', s: tableHeaderStyle },
      { v: 'AMOUNT (RS)', s: tableHeaderStyle },
    ]);

    // Data rows
    let totalAmount = 0;
    data.forEach((item, index) => {
      const amount = parseFloat(item.amount?.$numberDecimal || item.amount) || 0;
      const adminCharges = parseFloat(item.admin_inr_charges?.$numberDecimal || item.admin_inr_charges) || 0;
      const netAmount = amount - adminCharges;
      totalAmount += netAmount;

      sheetData.push([
        { v: index + 1, s: dataCellStyle },
        { v: item.userId?.name || 'N/A', s: dataCellStyleLeft },
        { v: item.kycInfo?.bank_name || 'N/A', s: dataCellStyle },
        { v: item.kycInfo?.ifsc_code || 'N/A', s: dataCellStyle },
        { v: item.kycInfo?.bank_account || 'N/A', s: dataCellStyle },
        { v: netAmount.toFixed(2), s: dataCellStyle },
      ]);
    });

    // Total row
    sheetData.push([
      { v: '', s: emptyBorderStyle },
      { v: '', s: emptyBorderStyle },
      { v: '', s: emptyBorderStyle },
      { v: '', s: emptyBorderStyle },
      { v: 'Total=', s: totalLabelStyle },
      { v: totalAmount.toFixed(2), s: totalValueStyle },
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    worksheet['!cols'] = [
      { wch: 5 },
      { wch: 28 },
      { wch: 20 },
      { wch: 12 },
      { wch: 18 },
      { wch: 12 },
    ];

    const rowHeights = [{ hpt: 20 }, { hpt: 22 }, { hpt: 10 }, { hpt: 25 }];
    for (let i = 0; i < data.length; i++) {
      rowHeights.push({ hpt: 18 });
    }
    rowHeights.push({ hpt: 22 });
    worksheet['!rows'] = rowHeights;

    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
    ];

    worksheet['!pageSetup'] = {
      paperSize: 9,
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      horizontalCentered: true,
    };

    worksheet['!margins'] = {
      left: 0.25,
      right: 0.25,
      top: 0.5,
      bottom: 0.5,
      header: 0.3,
      footer: 0.3,
    };

    return { worksheet, totalAmount };
  };

  // Download Excel with both sheets
  const downloadExcel = () => {
    if (!withdrawalData || !withdrawalData.length) {
      alert('No data available to download');
      return;
    }

    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;

    const workbook = XLSX.utils.book_new();

    if (otherBankAccounts.length > 0) {
      const { worksheet: otherBankSheet } = createWorksheet(otherBankAccounts, 'OTHER');
      XLSX.utils.book_append_sheet(workbook, otherBankSheet, 'Other Bank');
    }

    if (hdfcAccounts.length > 0) {
      const { worksheet: hdfcSheet } = createWorksheet(hdfcAccounts, 'HDFC');
      XLSX.utils.book_append_sheet(workbook, hdfcSheet, 'HDFC Bank');
    }

    if (otherBankAccounts.length === 0 && hdfcAccounts.length === 0) {
      alert('No data available to download');
      return;
    }

    const fileName = `withdrawal_slab${selectedSlab}_${formattedDate}.xlsx`;
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, fileName);
  };

  // Calculate totals
  const calculateTotals = (data) => {
    return data.reduce((total, item) => {
      const amount = parseFloat(item.amount?.$numberDecimal || item.amount) || 0;
      const adminCharges = parseFloat(item.admin_inr_charges?.$numberDecimal || item.admin_inr_charges) || 0;
      return total + (amount - adminCharges);
    }, 0);
  };

  return (
    <div className="p-4">
      {/* Header with Slab Input */}
      <div className="bg-gradient-to-r from-[#acacaf] to-[#878789] rounded-lg p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
           
            <p className="text-black mt-1">Download withdrawal data (HDFC & Other Banks separated)</p>
          </div>
          
          {/* Single Input for Slab */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <label className="text-white font-bold text-lg">Select Slab:</label>
            <input
              type="number"
              min="1"
              max="3"
              value={selectedSlab}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value >= 1 && value <= 3) {
                  setSelectedSlab(value);
                }
              }}
              className="w-20 px-4 py-3 text-xl font-bold text-center border-4 border-[#b9fd5c] rounded-lg bg-[#282f35] text-white focus:outline-none focus:border-[#d4ff7a]"
            />
            <span className="text-[#b9fd5c] font-bold">
              {selectedSlab === 1 && '₹0 - ₹5,000'}
              {selectedSlab === 2 && '₹5,001 - ₹50,000'}
              {selectedSlab === 3 && '₹50,001+'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#282f35] border-2 border-blue-500 rounded-lg p-4">
          <h4 className="text-blue-400 font-bold text-sm">Total Records</h4>
          <p className="text-3xl font-bold text-white mt-2">
            {isLoading ? '...' : withdrawalData.length}
          </p>
          <p className="text-gray-400 text-sm mt-1">Slab {selectedSlab}</p>
        </div>

        <div className="bg-[#282f35] border-2 border-orange-500 rounded-lg p-4">
          <h4 className="text-orange-400 font-bold text-sm">🏦 HDFC Bank</h4>
          <p className="text-3xl font-bold text-white mt-2">
            {isLoading ? '...' : hdfcAccounts.length}
          </p>
          <p className="text-green-400 text-sm mt-1 font-bold">
            ₹{isLoading ? '...' : calculateTotals(hdfcAccounts).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-[#282f35] border-2 border-green-500 rounded-lg p-4">
          <h4 className="text-green-400 font-bold text-sm">🏛️ Other Banks</h4>
          <p className="text-3xl font-bold text-white mt-2">
            {isLoading ? '...' : otherBankAccounts.length}
          </p>
          <p className="text-green-400 text-sm mt-1 font-bold">
            ₹{isLoading ? '...' : calculateTotals(otherBankAccounts).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-[#282f35] border-2 border-pink-500 rounded-lg p-4">
          <h4 className="text-pink-400 font-bold text-sm">💰 Grand Total</h4>
          <p className="text-2xl font-bold text-white mt-2">
            ₹{isLoading ? '...' : calculateTotals(withdrawalData).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-900/50 border-2 border-red-500 rounded-lg p-4 mb-6 flex items-center justify-between">
          <span className="text-red-300 font-bold">Error: {error.message || 'Failed to load data'}</span>
          <button
            onClick={refetch}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#1e2329] rounded-lg border-2 border-[#343638] mb-6">
        <Table
          columns={columns}
          data={withdrawalData}
          isLoading={isLoading}
          currentPage={1}
          perPage={50}
          noDataTitle="No Withdrawal Data"
          noDataMessage={`No withdrawal records found for Slab ${selectedSlab}`}
          noDataIcon="inbox"
          noDataAction={true}
          noDataActionLabel="Refresh"
          onNoDataAction={refetch}
        />
      </div>

      {/* Download Button */}
      {!isLoading && withdrawalData.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={downloadExcel}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 border-4 border-green-400"
          >
            📥 Download Excel
            <span className="bg-white/20 px-3 py-1 rounded text-sm">
              HDFC: {hdfcAccounts.length} | Other: {otherBankAccounts.length}
            </span>
          </button>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-[#282f35] border-2 border-blue-500 rounded-lg p-4">
        <p className="text-blue-400 font-bold text-sm">
          💡 Excel will contain 2 sheets: "HDFC Bank" & "Other Bank" - Optimized for A4 printing
        </p>
      </div>
    </div>
  );
};

export default WithdrawalDownload;