// components/ExportButton.jsx

import React from "react";
import { Download, Loader2 } from "lucide-react";
import useExcelExport from "../../hooks/useExcelExport";

/**
 * ─── REUSABLE EXPORT BUTTON ───
 *
 * <ExportButton
 *   data={users}
 *   columns={[
 *     { header: "Name", key: "name" },
 *     { header: "Email", key: "email" },
 *   ]}
 *   fileName="users_report"
 * />
 */
const ExportButton = ({
  data = [],
  columns = [],
  fileName = "export",
  sheetName = "Sheet1",
  sheets = null,
  serialNumber = false,
  summaryRow = null,
  label = "Export Excel",
  variant = "default", // "default" | "outline" | "ghost" | "green"
  size = "sm", // "xs" | "sm" | "md"
  className = "",
  disabled = false,
  onSuccess,
  onError,
}) => {
  const { exporting, exportExcel } = useExcelExport({
    onSuccess,
    onError,
  });

  const handleExport = () => {
    if (exporting || disabled) return;

    exportExcel({
      data,
      columns,
      fileName,
      sheetName,
      sheets,
      serialNumber,
      summaryRow,
    });
  };

  const variants = {
    default:
      "bg-[#1e262e] text-white border border-[#2e373f] hover:border-[#b9fd5c]/30 hover:bg-[#252d35]",
    outline:
      "bg-transparent text-[#b9fd5c] border border-[#b9fd5c]/40 hover:bg-[#b9fd5c]/10",
    ghost:
      "bg-transparent text-[#9ca3af] hover:text-white hover:bg-white/5",
    green:
      "bg-[#b9fd5c] text-[#0b1218] hover:bg-[#a8ec4b] border border-transparent",
  };

  const sizes = {
    xs: "px-2.5 py-1.5 text-[10px] gap-1.5",
    sm: "px-3 py-2 text-xs gap-2",
    md: "px-4 py-2.5 text-sm gap-2",
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting || disabled || data.length === 0}
      className={`
        inline-flex items-center justify-center font-semibold rounded-xl
        transition-all duration-200 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {exporting ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Download size={14} />
      )}
      <span>{exporting ? "Exporting..." : label}</span>
    </button>
  );
};

export default ExportButton;