// utils/exportToExcel.js

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * Reusable Excel Export Utility
 *
 * Usage:
 *   exportToExcel({
 *     data: [...],
 *     columns: [{ header: "Name", key: "name" }, ...],
 *     fileName: "report",
 *   });
 */

const getNestedValue = (obj, path) => {
  if (!path) return undefined;
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
};

const formatCellValue = (value, column) => {
  if (value === null || value === undefined) return column.fallback ?? "N/A";
  if (column.transform) return column.transform(value);

  switch (column.format) {
    case "currency": {
      const sym = column.currency || "₹";
      const num = typeof value === "number" ? value : parseFloat(value);
      return isNaN(num) ? value : `${sym}${num.toFixed(column.decimals ?? 2)}`;
    }
    case "date": {
      if (!value) return "N/A";
      const d = new Date(value);
      if (isNaN(d.getTime())) return value;
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        ...(column.showTime && {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      });
    }
    case "datetime": {
      if (!value) return "N/A";
      const dt = new Date(value);
      if (isNaN(dt.getTime())) return value;
      return dt.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
    case "number": {
      const n = typeof value === "number" ? value : parseFloat(value);
      return isNaN(n)
        ? value
        : n.toLocaleString("en-IN", {
            maximumFractionDigits: column.decimals ?? 2,
          });
    }
    case "percentage": {
      const p = typeof value === "number" ? value : parseFloat(value);
      return isNaN(p) ? value : `${p.toFixed(column.decimals ?? 2)}%`;
    }
    case "boolean":
      return value ? column.trueLabel || "Yes" : column.falseLabel || "No";
    default:
      return value;
  }
};

const buildSheetData = (data, columns, options = {}) => {
  const { serialNumber = false, summaryRow = null } = options;

  if (!columns || columns.length === 0) {
    if (!data || data.length === 0) return [["No Data"]];
    const keys = Object.keys(data[0]);
    const headers = keys.map(
      (k) => k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, " $1")
    );
    const rows = data.map((row, i) => {
      const r = serialNumber ? [i + 1] : [];
      keys.forEach((k) => r.push(row[k] ?? "N/A"));
      return r;
    });
    return [serialNumber ? ["S.No", ...headers] : headers, ...rows];
  }

  const headers = [
    ...(serialNumber ? ["S.No"] : []),
    ...columns.map((c) => c.header || c.key),
  ];

  const rows = data.map((row, index) => {
    const cells = [];
    if (serialNumber) cells.push(index + 1);

    columns.forEach((col) => {
      const rawValue = col.nested
        ? getNestedValue(row, col.key)
        : col.render
          ? col.render(row, index)
          : row[col.key];
      cells.push(formatCellValue(rawValue, col));
    });
    return cells;
  });

  const result = [headers, ...rows];

  if (summaryRow) {
    const summaryArr = headers.map((h) =>
      summaryRow[h] !== undefined ? summaryRow[h] : ""
    );
    if (summaryArr[0] === "") summaryArr[0] = "TOTAL";
    result.push(summaryArr);
  }

  return result;
};

const autoFitColumns = (sheetData) => {
  if (!sheetData || sheetData.length === 0) return [];
  const colCount = sheetData[0].length;
  const widths = [];
  for (let c = 0; c < colCount; c++) {
    let maxLen = 10;
    for (let r = 0; r < sheetData.length; r++) {
      const len = String(sheetData[r]?.[c] ?? "").length;
      if (len > maxLen) maxLen = len;
    }
    widths.push({ wch: Math.min(maxLen + 4, 50) });
  }
  return widths;
};

const exportToExcel = ({
  data = [],
  columns = [],
  sheets = null,
  fileName = "export",
  sheetName = "Sheet1",
  serialNumber = false,
  summaryRow = null,
  autoWidth = true,
  datePrefix = true,
  onSuccess = null,
  onError = null,
}) => {
  try {
    const wb = XLSX.utils.book_new();

    if (sheets && sheets.length > 0) {
      sheets.forEach((sheet, idx) => {
        const sheetData = buildSheetData(
          sheet.data || [],
          sheet.columns || [],
          {
            serialNumber: sheet.serialNumber ?? serialNumber,
            summaryRow: sheet.summaryRow ?? null,
          }
        );
        const ws = XLSX.utils.aoa_to_sheet(sheetData);
        if (autoWidth) ws["!cols"] = autoFitColumns(sheetData);
        XLSX.utils.book_append_sheet(
          wb,
          ws,
          sheet.name || `Sheet${idx + 1}`
        );
      });
    } else {
      const sheetData = buildSheetData(data, columns, {
        serialNumber,
        summaryRow,
      });
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      if (autoWidth) ws["!cols"] = autoFitColumns(sheetData);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const finalName = datePrefix
      ? `${fileName}_${dateStr}.xlsx`
      : `${fileName}.xlsx`;

    const wbOut = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbOut], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, finalName);
    onSuccess?.({ fileName: finalName });
    return { success: true, fileName: finalName };
  } catch (error) {
    console.error("Excel export error:", error);
    onError?.(error);
    return { success: false, error };
  }
};

export default exportToExcel;