// src/hooks/usePDFGenerator.js
import { useState, useCallback } from "react";
import { useToast } from "../reusableComponents/Toasts/ToastContext";
import PDFGenerator from "../utils/pdfGenerator";

const usePDFGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
const toast = useToast();
  const generatePDF = useCallback(async (builderFn, options = {}) => {
    setIsGenerating(true);

    try {
      const pdf = new PDFGenerator(options);
      pdf.addHeader();

      await builderFn(pdf);

      return pdf;
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("Failed to generate PDF");
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const downloadPDF = useCallback(
    async (builderFn, options = {}, filename) => {
      const pdf = await generatePDF(builderFn, options);
      if (pdf) {
        pdf.download(filename);
        toast.success("PDF downloaded successfully!");
      }
    },
    [generatePDF]
  );

  const previewPDF = useCallback(
    async (builderFn, options = {}) => {
      const pdf = await generatePDF(builderFn, options);
      if (pdf) pdf.preview();
    },
    [generatePDF]
  );

  return { isGenerating, generatePDF, downloadPDF, previewPDF };
};

export default usePDFGenerator;