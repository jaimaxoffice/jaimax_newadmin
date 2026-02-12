// src/utils/pdfGenerator.js
import jsPDF from "jspdf";
import "jspdf-autotable";

// ─── Theme Configuration ────────────────────────────────────
const THEMES = {
  dark: {
    primary: [235, 102, 15],      // #eb660f
    secondary: [27, 35, 45],      // #1b232d
    background: [17, 18, 20],     // #111214
    text: [255, 255, 255],        // white
    textMuted: [138, 141, 147],   // #8a8d93
    border: [42, 44, 47],         // #2a2c2f
    success: [14, 203, 111],      // #0ecb6f
    danger: [239, 68, 68],        // red
    warning: [245, 158, 11],      // yellow
    tableHeader: [235, 102, 15],  // #eb660f
    tableRowEven: [27, 35, 45],   // #1b232d
    tableRowOdd: [17, 18, 20],    // #111214
  },
  light: {
    primary: [235, 102, 15],
    secondary: [249, 250, 251],
    background: [255, 255, 255],
    text: [17, 24, 39],
    textMuted: [107, 114, 128],
    border: [229, 231, 235],
    success: [16, 185, 129],
    danger: [239, 68, 68],
    warning: [245, 158, 11],
    tableHeader: [235, 102, 15],
    tableRowEven: [249, 250, 251],
    tableRowOdd: [255, 255, 255],
  },
};

// ─── PDF Generator Class ────────────────────────────────────
class PDFGenerator {
  constructor(options = {}) {
    const {
      orientation = "portrait",
      unit = "mm",
      format = "a4",
      theme = "dark",
      title = "Report",
      subtitle = "",
      logo = null,
      companyName = "Admin Panel",
      footer = true,
      watermark = null,
      margins = { top: 20, right: 15, bottom: 20, left: 15 },
    } = options;

    this.doc = new jsPDF(orientation, unit, format);
    this.theme = THEMES[theme] || THEMES.dark;
    this.title = title;
    this.subtitle = subtitle;
    this.logo = logo;
    this.companyName = companyName;
    this.showFooter = footer;
    this.watermark = watermark;
    this.margins = margins;
    this.currentY = margins.top;
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.contentWidth = this.pageWidth - margins.left - margins.right;
  }

  // ─── Header ──────────────────────────────────────────────
  addHeader() {
    const { doc, theme, margins } = this;

    // Header background
    doc.setFillColor(...theme.secondary);
    doc.rect(0, 0, this.pageWidth, 40, "F");

    // Orange accent line
    doc.setFillColor(...theme.primary);
    doc.rect(0, 40, this.pageWidth, 2, "F");

    // Company name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...theme.text);
    doc.text(this.companyName, margins.left, 18);

    // Title
    doc.setFontSize(11);
    doc.setTextColor(...theme.primary);
    doc.text(this.title, margins.left, 28);

    // Subtitle
    if (this.subtitle) {
      doc.setFontSize(9);
      doc.setTextColor(...theme.textMuted);
      doc.text(this.subtitle, margins.left, 35);
    }

    // Date on right side
    doc.setFontSize(9);
    doc.setTextColor(...theme.textMuted);
    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      this.pageWidth - margins.right,
      18,
      { align: "right" }
    );

    // Page info
    doc.setFontSize(8);
    doc.text(
      `Page ${doc.internal.getNumberOfPages()}`,
      this.pageWidth - margins.right,
      28,
      { align: "right" }
    );

    this.currentY = 50;
    return this;
  }

  // ─── Footer ──────────────────────────────────────────────
  addFooter() {
    if (!this.showFooter) return this;

    const { doc, theme, margins } = this;
    const totalPages = doc.internal.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // Footer line
      doc.setDrawColor(...theme.primary);
      doc.setLineWidth(0.5);
      doc.line(
        margins.left,
        this.pageHeight - 15,
        this.pageWidth - margins.right,
        this.pageHeight - 15
      );

      // Footer text
      doc.setFontSize(8);
      doc.setTextColor(...theme.textMuted);
      doc.text(
        `© ${new Date().getFullYear()} ${this.companyName} - Confidential`,
        margins.left,
        this.pageHeight - 10
      );

      // Page number
      doc.text(
        `Page ${i} of ${totalPages}`,
        this.pageWidth - margins.right,
        this.pageHeight - 10,
        { align: "right" }
      );
    }
    return this;
  }

  // ─── Watermark ───────────────────────────────────────────
  addWatermark(text) {
    const { doc } = this;
    const watermarkText = text || this.watermark;
    if (!watermarkText) return this;

    const totalPages = doc.internal.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(50);
      doc.setTextColor(200, 200, 200);
      doc.setFont("helvetica", "bold");

      doc.text(watermarkText, this.pageWidth / 2, this.pageHeight / 2, {
        align: "center",
        angle: 45,
        opacity: 0.1,
      });
    }
    return this;
  }

  // ─── Section Title ───────────────────────────────────────
  addSectionTitle(title, options = {}) {
    const { icon = "●", color = this.theme.primary } = options;

    this.checkPageBreak(15);

    const { doc, margins } = this;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...color);
    doc.text(`${icon} ${title}`, margins.left, this.currentY);

    // Underline
    doc.setDrawColor(...color);
    doc.setLineWidth(0.5);
    doc.line(
      margins.left,
      this.currentY + 2,
      margins.left + doc.getTextWidth(`${icon} ${title}`),
      this.currentY + 2
    );

    this.currentY += 10;
    return this;
  }

  // ─── Text ────────────────────────────────────────────────
  addText(text, options = {}) {
    const {
      fontSize = 10,
      fontStyle = "normal",
      color = this.theme.text,
      align = "left",
      maxWidth = this.contentWidth,
    } = options;

    this.checkPageBreak(10);

    const { doc, margins } = this;
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle);
    doc.setTextColor(...color);

    const lines = doc.splitTextToSize(text, maxWidth);
    const x =
      align === "center"
        ? this.pageWidth / 2
        : align === "right"
        ? this.pageWidth - margins.right
        : margins.left;

    doc.text(lines, x, this.currentY, { align });
    this.currentY += lines.length * (fontSize * 0.5) + 5;
    return this;
  }

  // ─── Spacing ─────────────────────────────────────────────
  addSpace(height = 10) {
    this.currentY += height;
    return this;
  }

  // ─── Divider ─────────────────────────────────────────────
  addDivider(options = {}) {
    const { color = this.theme.border, style = "solid" } = options;

    this.checkPageBreak(5);

    const { doc, margins } = this;
    doc.setDrawColor(...color);
    doc.setLineWidth(0.3);

    if (style === "dashed") {
      const dashLength = 3;
      const gapLength = 2;
      let x = margins.left;
      while (x < this.pageWidth - margins.right) {
        doc.line(
          x,
          this.currentY,
          Math.min(x + dashLength, this.pageWidth - margins.right),
          this.currentY
        );
        x += dashLength + gapLength;
      }
    } else {
      doc.line(
        margins.left,
        this.currentY,
        this.pageWidth - margins.right,
        this.currentY
      );
    }

    this.currentY += 5;
    return this;
  }

  // ─── Stat Cards ──────────────────────────────────────────
  addStatCards(stats) {
    this.checkPageBreak(30);

    const { doc, theme, margins } = this;
    const cardCount = stats.length;
    const gap = 5;
    const cardWidth = (this.contentWidth - gap * (cardCount - 1)) / cardCount;
    const cardHeight = 25;

    stats.forEach((stat, index) => {
      const x = margins.left + index * (cardWidth + gap);

      // Card background
      doc.setFillColor(...theme.secondary);
      doc.roundedRect(x, this.currentY, cardWidth, cardHeight, 3, 3, "F");

      // Left accent
      const accentColor = stat.color || theme.primary;
      doc.setFillColor(...accentColor);
      doc.rect(x, this.currentY, 3, cardHeight, "F");

      // Value
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...theme.text);
      doc.text(String(stat.value), x + 10, this.currentY + 10);

      // Label
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...theme.textMuted);
      doc.text(stat.label, x + 10, this.currentY + 18);
    });

    this.currentY += cardHeight + 10;
    return this;
  }

  // ─── Key-Value Pairs ─────────────────────────────────────
  addKeyValuePairs(pairs, options = {}) {
    const { columns = 2 } = options;
    const { doc, theme, margins } = this;
    const colWidth = this.contentWidth / columns;

    pairs.forEach((pair, index) => {
      this.checkPageBreak(10);

      const col = index % columns;
      const x = margins.left + col * colWidth;

      if (col === 0 && index > 0) {
        this.currentY += 8;
      }

      // Label
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...theme.textMuted);
      doc.text(pair.label + ":", x, this.currentY);

      // Value
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...(pair.color || theme.text));
      doc.text(String(pair.value || "N/A"), x + 35, this.currentY);
    });

    this.currentY += 12;
    return this;
  }

  // ─── Table ───────────────────────────────────────────────
  addTable(columns, data, options = {}) {
    const {
      showHead = true,
      striped = true,
      compact = false,
      startY = this.currentY,
      columnStyles = {},
      headerColor = this.theme.tableHeader,
    } = options;

    const { doc, theme, margins } = this;

    doc.autoTable({
      head: showHead ? [columns.map((col) => col.header)] : undefined,
      body: data.map((row) =>
        columns.map((col) => {
          if (col.render) return col.render(row);
          return row[col.accessor] ?? "—";
        })
      ),
      startY,
      margin: { left: margins.left, right: margins.right },
      styles: {
        font: "helvetica",
        fontSize: compact ? 7 : 8,
        cellPadding: compact ? 2 : 4,
        textColor: theme.text,
        lineColor: theme.border,
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: headerColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: compact ? 7 : 9,
      },
      bodyStyles: {
        fillColor: theme.tableRowOdd,
      },
      alternateRowStyles: striped
        ? { fillColor: theme.tableRowEven }
        : undefined,
      columnStyles,
      didDrawPage: (data) => {
        // Re-add header on new pages
        if (data.pageNumber > 1) {
          this.addHeader();
        }
      },
    });

    this.currentY = doc.lastAutoTable.finalY + 10;
    return this;
  }

  // ─── Status Badge (in table) ─────────────────────────────
  static getStatusText(status) {
    const map = {
      0: "Pending",
      1: "Approved",
      2: "Rejected",
      active: "Active",
      inactive: "Inactive",
      completed: "Completed",
      failed: "Failed",
      hold: "Hold",
    };
    return map[status] || String(status);
  }

  // ─── Summary Box ─────────────────────────────────────────
  addSummaryBox(title, items) {
    this.checkPageBreak(items.length * 8 + 20);

    const { doc, theme, margins } = this;
    const boxHeight = items.length * 8 + 15;

    // Box background
    doc.setFillColor(...theme.secondary);
    doc.roundedRect(
      margins.left,
      this.currentY,
      this.contentWidth,
      boxHeight,
      3,
      3,
      "F"
    );

    // Border
    doc.setDrawColor(...theme.primary);
    doc.setLineWidth(0.5);
    doc.roundedRect(
      margins.left,
      this.currentY,
      this.contentWidth,
      boxHeight,
      3,
      3,
      "S"
    );

    // Title
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...theme.primary);
    doc.text(title, margins.left + 8, this.currentY + 10);

    // Items
    items.forEach((item, index) => {
      const y = this.currentY + 20 + index * 8;

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...theme.textMuted);
      doc.text(item.label + ":", margins.left + 10, y);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...(item.color || theme.text));
      doc.text(String(item.value), margins.left + 60, y);
    });

    this.currentY += boxHeight + 10;
    return this;
  }

  // ─── Page Break Check ────────────────────────────────────
  checkPageBreak(neededSpace = 20) {
    if (this.currentY + neededSpace > this.pageHeight - this.margins.bottom - 15) {
      this.doc.addPage();
      this.addHeader();
    }
    return this;
  }

  // ─── New Page ────────────────────────────────────────────
  addNewPage() {
    this.doc.addPage();
    this.addHeader();
    return this;
  }

  // ─── Generate / Download / Preview ───────────────────────
  download(filename) {
    this.addFooter();
    const name = filename || `${this.title.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
    this.doc.save(name);
    return this;
  }

  preview() {
    this.addFooter();
    const blob = this.doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    return this;
  }

  getBlob() {
    this.addFooter();
    return this.doc.output("blob");
  }

  getBase64() {
    this.addFooter();
    return this.doc.output("datauristring");
  }
}

export default PDFGenerator;