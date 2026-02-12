// src/hooks/usePDFGenerator.js
import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import PDFGenerator from "../utils/pdfGenerator";

const usePDFGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = useCallback(async (builderFn, options = {}) => {
    setIsGenerating(true);

    try {
      const pdf = new PDFGenerator(options);
      pdf.addHeader();

      // Let the caller build the PDF content
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