// hooks/useExcelExport.js

import { useState, useCallback } from "react";
import exportToExcel from "../utils/exportToExcel";

/**
 * ─── REACT HOOK FOR EXCEL EXPORT ───
 *
 * const { exporting, exportExcel, exportMultiSheet } = useExcelExport();
 *
 * exportExcel({
 *   data: users,
 *   columns: [...],
 *   fileName: "users",
 * });
 */
const useExcelExport = ({ onSuccess, onError } = {}) => {
  const [exporting, setExporting] = useState(false);

  const exportExcel = useCallback(
    async (config) => {
      setExporting(true);
      try {
        const result = exportToExcel({
          ...config,
          onSuccess: (info) => {
            onSuccess?.(info);
            config.onSuccess?.(info);
          },
          onError: (err) => {
            onError?.(err);
            config.onError?.(err);
          },
        });
        return result;
      } finally {
        // Small delay so UI can show "exporting" state
        setTimeout(() => setExporting(false), 500);
      }
    },
    [onSuccess, onError]
  );

  const exportMultiSheet = useCallback(
    async (sheets, config = {}) => {
      return exportExcel({ ...config, sheets });
    },
    [exportExcel]
  );

  return {
    exporting,
    exportExcel,
    exportMultiSheet,
  };
};

export default useExcelExport;