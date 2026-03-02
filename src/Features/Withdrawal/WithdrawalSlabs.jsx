import React, { useState } from 'react';
import { useWithdrawalSlabsQuery } from './withdrawalApiSlice';
import XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';

const WithdrawalDownload = () => {
  const [selectedSlab, setSelectedSlab] = useState(1);
  
  const { data: response, isLoading, error, refetch } = useWithdrawalSlabsQuery(selectedSlab);
  const withdrawalData = response?.data || [];

  const handleSlabChange = (slab) => {
    setSelectedSlab(slab);
  };

  // Filter HDFC and Other Bank accounts
  const filterAccounts = () => {
    const hdfcAccounts = [];
    const otherBankAccounts = [];

    withdrawalData.forEach((item) => {
      const bankName = (item.kycInfo?.bank_name || '').toLowerCase().trim();
      
      // Check if bank is HDFC
      if (bankName.includes('hdfc')) {
        hdfcAccounts.push(item);
      } else {
        otherBankAccounts.push(item);
      }
    });

    return { hdfcAccounts, otherBankAccounts };
  };

  const { hdfcAccounts, otherBankAccounts } = filterAccounts();

  // Create worksheet with data
  const createWorksheet = (data, bankType) => {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;

    // Define styles
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

    // Build sheet data
    const sheetData = [];

    // Header text based on bank type
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

      const userName = item.userId?.name || item.userId?.fullName || 'N/A';
      const bankName = item.kycInfo?.bank_name || 'N/A';
      const ifscCode = item.kycInfo?.ifsc_code || 'N/A';
      const accountNumber = item.kycInfo?.bank_account || 'N/A';

      sheetData.push([
        { v: index + 1, s: dataCellStyle },
        { v: userName, s: dataCellStyleLeft },
        { v: bankName, s: dataCellStyle },
        { v: ifscCode, s: dataCellStyle },
        { v: accountNumber, s: dataCellStyle },
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

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Column widths for A4
    worksheet['!cols'] = [
      { wch: 5 },
      { wch: 28 },
      { wch: 20 },
      { wch: 12 },
      { wch: 18 },
      { wch: 12 },
    ];

    // Row heights
    const rowHeights = [
      { hpt: 20 },
      { hpt: 22 },
      { hpt: 10 },
      { hpt: 25 },
    ];
    for (let i = 0; i < data.length; i++) {
      rowHeights.push({ hpt: 18 });
    }
    rowHeights.push({ hpt: 22 });
    worksheet['!rows'] = rowHeights;

    // Merge cells
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
    ];

    // Page setup for A4
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

  // Download Excel with both sheets (HDFC & Other Bank)
  const downloadExcelBothSheets = () => {
    if (!withdrawalData || !withdrawalData.length) {
      alert('No data available to download');
      return;
    }

    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;

    const workbook = XLSX.utils.book_new();

    // Create Other Bank sheet
    if (otherBankAccounts.length > 0) {
      const { worksheet: otherBankSheet } = createWorksheet(otherBankAccounts, 'OTHER');
      XLSX.utils.book_append_sheet(workbook, otherBankSheet, 'Other Bank');
    }

    // Create HDFC sheet
    if (hdfcAccounts.length > 0) {
      const { worksheet: hdfcSheet } = createWorksheet(hdfcAccounts, 'HDFC');
      XLSX.utils.book_append_sheet(workbook, hdfcSheet, 'HDFC Bank');
    }

    // If no data in either
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

  // Download only HDFC accounts
  const downloadHDFCOnly = () => {
    if (!hdfcAccounts || hdfcAccounts.length === 0) {
      alert('No HDFC accounts available to download');
      return;
    }

    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;

    const workbook = XLSX.utils.book_new();
    const { worksheet } = createWorksheet(hdfcAccounts, 'HDFC');
    XLSX.utils.book_append_sheet(workbook, worksheet, 'HDFC Bank');

    const fileName = `withdrawal_HDFC_slab${selectedSlab}_${formattedDate}.xlsx`;
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, fileName);
  };

  // Download only Other Bank accounts
  const downloadOtherBankOnly = () => {
    if (!otherBankAccounts || otherBankAccounts.length === 0) {
      alert('No Other Bank accounts available to download');
      return;
    }

    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;

    const workbook = XLSX.utils.book_new();
    const { worksheet } = createWorksheet(otherBankAccounts, 'OTHER');
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Other Bank');

    const fileName = `withdrawal_OtherBank_slab${selectedSlab}_${formattedDate}.xlsx`;
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, fileName);
  };

  const getSlabDescription = (slab) => {
    switch (slab) {
      case 1:
        return '₹0 - ₹5,000';
      case 2:
        return '₹5,001 - ₹50,000';
      case 3:
        return '₹50,001+';
      default:
        return '';
    }
  };

  const calculateTotals = (data) => {
    let total = 0;
    data.forEach((item) => {
      const amount = parseFloat(item.amount?.$numberDecimal || item.amount) || 0;
      const adminCharges = parseFloat(item.admin_inr_charges?.$numberDecimal || item.admin_inr_charges) || 0;
      total += (amount - adminCharges);
    });
    return total;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: '#1a237e', 
        color: 'white', 
        padding: '25px', 
        borderRadius: '10px 10px 0 0',
        border: '4px solid #000',
        borderBottom: 'none'
      }}>
        <h2 style={{ margin: 0, fontWeight: 'bold', fontSize: '28px' }}>💰 Withdrawal Management</h2>
        <p style={{ margin: '8px 0 0 0', fontWeight: 'bold', fontSize: '16px' }}>Download withdrawal data by slab (HDFC & Other Banks separated)</p>
      </div>

      {/* Slab Selection Section */}
      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '30px',
        border: '4px solid #000',
        borderTop: 'none',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#000', fontWeight: 'bold', fontSize: '22px' }}>
          Select Withdrawal Slab
        </h3>

        {/* Slab Buttons */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '25px' }}>
          {[1, 2, 3].map((slab) => (
            <button
              key={slab}
              onClick={() => handleSlabChange(slab)}
              style={{
                padding: '18px 35px',
                fontSize: '18px',
                fontWeight: 'bold',
                border: selectedSlab === slab ? '4px solid #1a237e' : '4px solid #000',
                borderRadius: '12px',
                backgroundColor: selectedSlab === slab ? '#1a237e' : 'white',
                color: selectedSlab === slab ? 'white' : '#000',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '180px',
                boxShadow: selectedSlab === slab ? '0 6px 20px rgba(26, 35, 126, 0.4)' : '0 4px 10px rgba(0,0,0,0.2)',
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '20px' }}>Slab {slab}</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '8px' }}>
                {getSlabDescription(slab)}
              </div>
            </button>
          ))}
        </div>

        {/* Input Field Section */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '20px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '10px',
          border: '4px solid #000',
          flexWrap: 'wrap'
        }}>
          <label style={{ fontWeight: 'bold', color: '#000', fontSize: '16px' }}>
            Or Enter Slab Number:
          </label>
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
            style={{
              padding: '12px 18px',
              fontSize: '18px',
              fontWeight: 'bold',
              border: '4px solid #1a237e',
              borderRadius: '8px',
              width: '80px',
              textAlign: 'center',
            }}
          />
          <select
            value={selectedSlab}
            onChange={(e) => setSelectedSlab(parseInt(e.target.value))}
            style={{
              padding: '12px 18px',
              fontSize: '16px',
              fontWeight: 'bold',
              border: '4px solid #1a237e',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: 'white',
            }}
          >
            <option value={1}>Slab 1 - ₹0 to ₹5,000</option>
            <option value={2}>Slab 2 - ₹5,001 to ₹50,000</option>
            <option value={3}>Slab 3 - ₹50,001+</option>
          </select>
        </div>
      </div>

      {/* Status Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '25px'
      }}>
        {/* Total Records Card */}
        <div style={{
          backgroundColor: '#e3f2fd',
          padding: '20px',
          borderRadius: '12px',
          border: '4px solid #1976d2'
        }}>
          <h4 style={{ margin: 0, color: '#1976d2', fontWeight: 'bold', fontSize: '16px' }}>Total Records</h4>
          <p style={{ margin: '10px 0 0 0', fontSize: '26px', fontWeight: 'bold', color: '#000' }}>
            {isLoading ? '...' : withdrawalData.length}
          </p>
          <p style={{ margin: '5px 0 0 0', color: '#000', fontWeight: 'bold', fontSize: '12px' }}>
            Slab {selectedSlab} | {getSlabDescription(selectedSlab)}
          </p>
        </div>

        {/* HDFC Accounts Card */}
        <div style={{
          backgroundColor: '#fff8e1',
          padding: '20px',
          borderRadius: '12px',
          border: '4px solid #ff9800'
        }}>
          <h4 style={{ margin: 0, color: '#e65100', fontWeight: 'bold', fontSize: '16px' }}>🏦 HDFC Bank</h4>
          <p style={{ margin: '10px 0 0 0', fontSize: '26px', fontWeight: 'bold', color: '#000' }}>
            {isLoading ? '...' : hdfcAccounts.length} Records
          </p>
          <p style={{ margin: '5px 0 0 0', color: '#2e7d32', fontWeight: 'bold', fontSize: '14px' }}>
            ₹{isLoading ? '...' : calculateTotals(hdfcAccounts).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Other Bank Accounts Card */}
        <div style={{
          backgroundColor: '#e8f5e9',
          padding: '20px',
          borderRadius: '12px',
          border: '4px solid #4caf50'
        }}>
          <h4 style={{ margin: 0, color: '#2e7d32', fontWeight: 'bold', fontSize: '16px' }}>🏛️ Other Banks</h4>
          <p style={{ margin: '10px 0 0 0', fontSize: '26px', fontWeight: 'bold', color: '#000' }}>
            {isLoading ? '...' : otherBankAccounts.length} Records
          </p>
          <p style={{ margin: '5px 0 0 0', color: '#2e7d32', fontWeight: 'bold', fontSize: '14px' }}>
            ₹{isLoading ? '...' : calculateTotals(otherBankAccounts).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Grand Total Card */}
        <div style={{
          backgroundColor: '#fce4ec',
          padding: '20px',
          borderRadius: '12px',
          border: '4px solid #e91e63'
        }}>
          <h4 style={{ margin: 0, color: '#c2185b', fontWeight: 'bold', fontSize: '16px' }}>💰 Grand Total</h4>
          <p style={{ margin: '10px 0 0 0', fontSize: '22px', fontWeight: 'bold', color: '#000' }}>
            ₹{isLoading ? '...' : calculateTotals(withdrawalData).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          backgroundColor: '#f5f5f5',
          borderRadius: '12px',
          border: '4px solid #000'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '6px solid #f3f3f3',
            borderTop: '6px solid #1a237e',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 25px'
          }}></div>
          <p style={{ fontWeight: 'bold', fontSize: '18px' }}>Loading withdrawal data for Slab {selectedSlab}...</p>
          <style>
            {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
          </style>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          padding: '25px',
          borderRadius: '12px',
          border: '4px solid #f44336',
          color: '#c62828',
          marginBottom: '25px'
        }}>
          <strong style={{ fontSize: '18px' }}>Error:</strong> 
          <span style={{ fontWeight: 'bold', marginLeft: '10px' }}>{error.message || 'Failed to load data'}</span>
          <button
            onClick={refetch}
            style={{
              marginLeft: '20px',
              padding: '10px 25px',
              backgroundColor: '#f44336',
              color: 'white',
              border: '3px solid #000',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Data Tables */}
      {!isLoading && !error && (
        <>
          {/* HDFC Bank Table */}
          {hdfcAccounts.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ 
                backgroundColor: '#ff9800', 
                color: 'white', 
                padding: '15px 20px', 
                margin: 0,
                borderRadius: '10px 10px 0 0',
                border: '4px solid #000',
                borderBottom: 'none',
                fontWeight: 'bold',
                fontSize: '20px'
              }}>
                🏦 HDFC BANK Accounts ({hdfcAccounts.length})
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  backgroundColor: 'white',
                  border: '4px solid #000'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#ff9800', color: 'white' }}>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', border: '2px solid #000', width: '50px' }}>S.No</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', border: '2px solid #000' }}>Name</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', border: '2px solid #000' }}>Bank Name</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', border: '2px solid #000' }}>IFSC Code</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', border: '2px solid #000' }}>Account Number</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', border: '2px solid #000' }}>Amount (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hdfcAccounts.map((item, index) => {
                      const amount = parseFloat(item.amount?.$numberDecimal || item.amount) || 0;
                      const adminCharges = parseFloat(item.admin_inr_charges?.$numberDecimal || item.admin_inr_charges) || 0;
                      const netAmount = amount - adminCharges;
                      
                      return (
                        <tr key={item._id} style={{ backgroundColor: index % 2 === 0 ? '#fff8e1' : 'white' }}>
                          <td style={{ padding: '10px 8px', textAlign: 'center', border: '2px solid #000', fontWeight: 'bold', fontSize: '13px' }}>{index + 1}</td>
                          <td style={{ padding: '10px 8px', textAlign: 'left', border: '2px solid #000', fontWeight: 'bold', fontSize: '13px' }}>{item.userId?.name || 'N/A'}</td>
                          <td style={{ padding: '10px 8px', textAlign: 'center', border: '2px solid #000', fontWeight: 'bold', fontSize: '13px' }}>{item.kycInfo?.bank_name || 'N/A'}</td>
                          <td style={{ padding: '10px 8px', textAlign: 'center', border: '2px solid #000', fontWeight: 'bold', fontSize: '13px' }}>{item.kycInfo?.ifsc_code || 'N/A'}</td>
                          <td style={{ padding: '10px 8px', textAlign: 'center', border: '2px solid #000', fontWeight: 'bold', fontSize: '13px' }}>{item.kycInfo?.bank_account || 'N/A'}</td>
                          <td style={{ padding: '10px 8px', textAlign: 'center', border: '2px solid #000', fontWeight: 'bold', fontSize: '13px', color: '#2e7d32' }}>
                            ₹{netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#ffe0b2' }}>
                      <td colSpan="5" style={{ padding: '12px', textAlign: 'right', border: '2px solid #000', fontWeight: 'bold', fontSize: '16px' }}>
                        HDFC Total:
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', border: '2px solid #000', fontWeight: 'bold', fontSize: '16px', color: '#e65100', backgroundColor: '#ffff00' }}>
                        ₹{calculateTotals(hdfcAccounts).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Other Bank Table */}
          {otherBankAccounts.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ 
                backgroundColor: '#4caf50', 
                color: 'white', 
                padding: '15px 20px', 
                margin: 0,
                borderRadius: '10px 10px 0 0',
                border: '4px solid #000',
                borderBottom: 'none',
                fontWeight: 'bold',
                fontSize: '20px'
              }}>
                🏛️ OTHER BANK Accounts ({otherBankAccounts.length})
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  backgroundColor: 'white',
                  border: '4px solid #000'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#4caf50', color: 'white' }}>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', border: '2px solid #000', width: '50px' }}>S.No</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', border: '2px solid #000' }}>Name</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', border: '2px solid #000' }}>Bank Name</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', border: '2px solid #000' }}>IFSC Code</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', border: '2px solid #000' }}>Account Number</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', border: '2px solid #000' }}>Amount (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {otherBankAccounts.map((item, index) => {
                      const amount = parseFloat(item.amount?.$numberDecimal || item.amount) || 0;
                      const adminCharges = parseFloat(item.admin_inr_charges?.$numberDecimal || item.admin_inr_charges) || 0;
                      const netAmount = amount - adminCharges;
                      
                      return (
                        <tr key={item._id} style={{ backgroundColor: index % 2 === 0 ? '#e8f5e9' : 'white' }}>
                          <td style={{ padding: '10px 8px', textAlign: 'center', border: '2px solid #000', fontWeight: 'bold', fontSize: '13px' }}>{index + 1}</td>
                          <td style={{ padding: '10px 8px', textAlign: 'left', border: '2px solid #000', fontWeight: 'bold', fontSize: '13px' }}>{item.userId?.name || 'N/A'}</td>
                          <td style={{ padding: '10px 8px', textAlign: 'center', border: '2px solid #000', fontWeight: 'bold', fontSize: '13px' }}>{item.kycInfo?.bank_name || 'N/A'}</td>
                          <td style={{ padding: '10px 8px', textAlign: 'center', border: '2px solid #000', fontWeight: 'bold', fontSize: '13px' }}>{item.kycInfo?.ifsc_code || 'N/A'}</td>
                          <td style={{ padding: '10px 8px', textAlign: 'center', border: '2px solid #000', fontWeight: 'bold', fontSize: '13px' }}>{item.kycInfo?.bank_account || 'N/A'}</td>
                          <td style={{ padding: '10px 8px', textAlign: 'center', border: '2px solid #000', fontWeight: 'bold', fontSize: '13px', color: '#2e7d32' }}>
                            ₹{netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#c8e6c9' }}>
                      <td colSpan="5" style={{ padding: '12px', textAlign: 'right', border: '2px solid #000', fontWeight: 'bold', fontSize: '16px' }}>
                        Other Bank Total:
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', border: '2px solid #000', fontWeight: 'bold', fontSize: '16px', color: '#2e7d32', backgroundColor: '#ffff00' }}>
                        ₹{calculateTotals(otherBankAccounts).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* No Data Message */}
          {withdrawalData.length === 0 && (
            <div style={{
              padding: '50px',
              textAlign: 'center',
              backgroundColor: '#f5f5f5',
              borderRadius: '12px',
              border: '4px solid #000'
            }}>
              <p style={{ fontWeight: 'bold', fontSize: '18px', color: '#666' }}>
                No withdrawal data found for Slab {selectedSlab}
              </p>
            </div>
          )}

          {/* Download Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '15px', 
            justifyContent: 'center', 
            flexWrap: 'wrap',
            marginTop: '20px'
          }}>
            {/* Download Both Sheets */}
            <button
              onClick={downloadExcelBothSheets}
              disabled={withdrawalData.length === 0}
              style={{
                backgroundColor: withdrawalData.length === 0 ? '#ccc' : '#1a237e',
                color: 'white',
                padding: '16px 30px',
                border: '4px solid #000',
                borderRadius: '10px',
                cursor: withdrawalData.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 15px rgba(26, 35, 126, 0.3)',
              }}
            >
              📥 Download All (Both Sheets)
            </button>

            {/* Download HDFC Only */}
            <button
              onClick={downloadHDFCOnly}
              disabled={hdfcAccounts.length === 0}
              style={{
                backgroundColor: hdfcAccounts.length === 0 ? '#ccc' : '#ff9800',
                color: 'white',
                padding: '16px 30px',
                border: '4px solid #000',
                borderRadius: '10px',
                cursor: hdfcAccounts.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)',
              }}
            >
              🏦 Download HDFC Only ({hdfcAccounts.length})
            </button>

            {/* Download Other Bank Only */}
            <button
              onClick={downloadOtherBankOnly}
              disabled={otherBankAccounts.length === 0}
              style={{
                backgroundColor: otherBankAccounts.length === 0 ? '#ccc' : '#4caf50',
                color: 'white',
                padding: '16px 30px',
                border: '4px solid #000',
                borderRadius: '10px',
                cursor: otherBankAccounts.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
              }}
            >
              🏛️ Download Other Banks ({otherBankAccounts.length})
            </button>

            {/* Refresh Button */}
            <button
              onClick={refetch}
              style={{
                backgroundColor: '#2196F3',
                color: 'white',
                padding: '16px 30px',
                border: '4px solid #000',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
              }}
            >
              🔄 Refresh
            </button>
          </div>

          {/* Info Box */}
          <div style={{
            marginTop: '25px',
            padding: '20px',
            backgroundColor: '#e3f2fd',
            borderRadius: '10px',
            border: '3px solid #1976d2'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#1976d2', fontWeight: 'bold' }}>📋 Download Options:</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', fontWeight: 'bold', color: '#333' }}>
              <li><strong>Download All:</strong> Excel with 2 sheets - "HDFC Bank" & "Other Bank"</li>
              <li><strong>Download HDFC Only:</strong> Excel with only HDFC bank accounts</li>
              <li><strong>Download Other Banks:</strong> Excel with all non-HDFC bank accounts</li>
            </ul>
            <p style={{ margin: '15px 0 0 0', fontWeight: 'bold', color: '#1976d2', fontSize: '14px' }}>
              💡 Tip: Open downloaded Excel → File → Print → "Fit Sheet on One Page" for A4 printing
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default WithdrawalDownload;