// src/utils/pdfGenerator.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const T = {
  primary: [235, 102, 15],
  // primary: [185, 253, 92],
  bg: [255, 255, 255],
  text: [33, 37, 41],
  muted: [108, 117, 125],
  light: [173, 181, 189],
  border: [222, 226, 230],
  cardBg: [247, 248, 249],
  success: [25, 135, 84],
  danger: [220, 53, 69],
  warning: [255, 193, 7],
  white: [255, 255, 255],
  rowEven: [255, 255, 255],
  rowOdd: [248, 249, 250],
};

class PDFGenerator {
  constructor(opts = {}) {
    this.doc = new jsPDF(
      opts.orientation || "portrait",
      "mm",
      opts.format || "a4",
    );
    this.theme = T;
    this.title = opts.title || "Report";
    this.subtitle = opts.subtitle || "";
    this.company = opts.companyName || "Admin Panel";
    this.showFooter = opts.footer !== false;
    this.margins = opts.margins || { top: 12, right: 8, bottom: 12, left: 8 };
    this.currentY = this.margins.top;
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.contentWidth = this.pageWidth - this.margins.left - this.margins.right;
    this._headerDrawnPages = new Set(); // Track which pages have headers
  }

  // ─── Header ──────────────────────────────────────────────
  addHeader() {
    const { doc, theme, margins } = this;
    const currentPage = doc.internal.getNumberOfPages();

    // Prevent drawing header twice on the same page
    if (this._headerDrawnPages.has(currentPage)) {
      this.currentY = 23;
      return this;
    }
    this._headerDrawnPages.add(currentPage);

    // Top accent
    doc.setFillColor(...theme.primary);
    doc.rect(0, 0, this.pageWidth, 0.8, "F");

    // Company
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...theme.text);
    doc.text(this.company, margins.left, 8);

    // Title
    doc.setFontSize(8);
    doc.setTextColor(...theme.primary);
    doc.text(this.title, margins.left, 13);

    // Subtitle
    if (this.subtitle) {
      doc.setFontSize(6.5);
      doc.setTextColor(...theme.muted);
      doc.text(this.subtitle, margins.left, 17);
    }

    // Right — date + page
    doc.setFontSize(6.5);
    doc.setTextColor(...theme.light);
    doc.text(
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      this.pageWidth - margins.right,
      8,
      { align: "right" },
    );
    doc.setFontSize(6);
    doc.text(`Page ${currentPage}`, this.pageWidth - margins.right, 12, {
      align: "right",
    });

    // Bottom line
    doc.setDrawColor(...theme.border);
    doc.setLineWidth(0.15);
    doc.line(margins.left, 20, this.pageWidth - margins.right, 20);

    this.currentY = 23;
    return this;
  }

  // ─── Footer ──────────────────────────────────────────────
  addFooter() {
    if (!this.showFooter) return this;
    const { doc, theme, margins } = this;
    const total = doc.internal.getNumberOfPages();

    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      const fy = this.pageHeight - 6;

      doc.setDrawColor(...theme.border);
      doc.setLineWidth(0.1);
      doc.line(margins.left, fy - 2, this.pageWidth - margins.right, fy - 2);

      doc.setFontSize(5.5);
      doc.setTextColor(...theme.light);
      doc.text(
        `© ${new Date().getFullYear()} ${this.company}`,
        margins.left,
        fy,
      );
      doc.text(`${i}/${total}`, this.pageWidth - margins.right, fy, {
        align: "right",
      });
    }
    return this;
  }

  // ─── Section Title ───────────────────────────────────────
  addSectionTitle(title) {
    this.checkPageBreak(8);
    const { doc, theme, margins } = this;

    doc.setFillColor(...theme.primary);
    doc.rect(margins.left, this.currentY, 1.5, 5, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...theme.text);
    doc.text(title, margins.left + 4, this.currentY + 3.5);

    this.currentY += 7;
    doc.setFont("helvetica", "normal");
    return this;
  }

  // ─── Text ────────────────────────────────────────────────
  addText(text, opts = {}) {
    this.checkPageBreak(5);
    const { doc, margins } = this;
    const fs = opts.fontSize || 7.5;
    const color = opts.color || this.theme.text;
    const align = opts.align || "left";

    doc.setFontSize(fs);
    doc.setFont("helvetica", opts.bold ? "bold" : opts.fontStyle || "normal");
    doc.setTextColor(...color);

    const lines = doc.splitTextToSize(
      String(text),
      opts.maxWidth || this.contentWidth,
    );
    const x =
      align === "center"
        ? this.pageWidth / 2
        : align === "right"
          ? this.pageWidth - margins.right
          : margins.left;
    doc.text(lines, x, this.currentY, { align });
    this.currentY += lines.length * (fs * 0.42) + 1.5;
    doc.setFont("helvetica", "normal");
    return this;
  }

  // ─── Space ───────────────────────────────────────────────
  addSpace(h = 3) {
    this.currentY += h;
    return this;
  }

  // ─── Divider ─────────────────────────────────────────────
  addDivider(opts = {}) {
    this.checkPageBreak(2);
    const { doc, theme, margins } = this;
    doc.setDrawColor(...(opts.color || theme.border));
    doc.setLineWidth(0.1);

    if (opts.style === "dashed") {
      let x = margins.left;
      while (x < this.pageWidth - margins.right) {
        doc.line(
          x,
          this.currentY,
          Math.min(x + 2.5, this.pageWidth - margins.right),
          this.currentY,
        );
        x += 4;
      }
    } else {
      doc.line(
        margins.left,
        this.currentY,
        this.pageWidth - margins.right,
        this.currentY,
      );
    }

    this.currentY += 2.5;
    return this;
  }

  // ─── Stat Cards ──────────────────────────────────────────
  addStatCards(stats) {
    this.checkPageBreak(16);
    const { doc, theme, margins } = this;
    const gap = 2;
    const n = stats.length;
    const w = (this.contentWidth - gap * (n - 1)) / n;
    const h = 14;

    stats.forEach((s, i) => {
      const x = margins.left + i * (w + gap);

      doc.setFillColor(...theme.cardBg);
      doc.roundedRect(x, this.currentY, w, h, 1, 1, "F");

      doc.setFillColor(...(s.color || theme.primary));
      doc.rect(x, this.currentY + 1.5, 1.2, h - 3, "F");

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...theme.text);
      doc.text(String(s.value), x + 5, this.currentY + 6);

      doc.setFontSize(5.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...theme.muted);
      doc.text(s.label, x + 5, this.currentY + 11);
    });

    this.currentY += h + 4;
    return this;
  }

  // ─── Key-Value Grid ──────────────────────────────────────
  addKeyValuePairs(pairs, opts = {}) {
    const cols = opts.columns || 2;
    const { doc, theme, margins } = this;
    const colW = this.contentWidth / cols;
    const rows = Math.ceil(pairs.length / cols);
    const ch = rows * 6 + 4;

    this.checkPageBreak(ch);

    doc.setFillColor(...theme.cardBg);
    doc.roundedRect(
      margins.left,
      this.currentY,
      this.contentWidth,
      ch,
      1,
      1,
      "F",
    );

    pairs.forEach((p, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = margins.left + col * colW + 3;
      const y = this.currentY + row * 6 + 4;

      doc.setFontSize(6);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...theme.muted);
      doc.text(p.label, x, y);

      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...(p.color || theme.text));
      doc.text(String(p.value || "—"), x + 28, y);
    });

    this.currentY += ch + 3;
    return this;
  }

  // ─── Table ───────────────────────────────────────────────
  addTable(columns, data, opts = {}) {
    const { doc, theme, margins } = this;
    const self = this;

    autoTable(doc, {
      head:
        opts.showHead !== false ? [columns.map((c) => c.header)] : undefined,
      body: data.map((row, rowIndex) =>
        columns.map((c) =>
          c.render ? c.render(row, rowIndex) : (row[c.accessor] ?? "—"),
        ),
      ),
      startY: opts.startY || this.currentY,
      margin: {
        left: margins.left,
        right: margins.right,
        top: 23, // Start after header on new pages
      },
      tableWidth: this.contentWidth,
      styles: {
        font: "helvetica",
        fontSize: opts.compact !== false ? 6.5 : 7.5,
        cellPadding: opts.compact !== false ? 1.5 : 2.5,
        textColor: theme.text,
        lineColor: theme.border,
        lineWidth: 0.08,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: opts.headerColor || theme.primary,
        textColor: theme.white,
        fontStyle: "bold",
        fontSize: opts.compact !== false ? 6.5 : 7.5,
        cellPadding: opts.compact !== false ? 2 : 3,
      },
      bodyStyles: { fillColor: theme.rowEven },
      alternateRowStyles:
        opts.striped !== false ? { fillColor: theme.rowOdd } : undefined,
      columnStyles: opts.columnStyles || {},
      tableLineColor: theme.border,
      tableLineWidth: 0.08,
      didDrawPage: (data) => {
        // Only add header on continuation pages (not the first page of this table)
        if (data.pageNumber > 1) {
          self.addHeader();
        }
      },
    });

    if (doc.lastAutoTable) {
      this.currentY = doc.lastAutoTable.finalY + 4;
    }
    return this;
  }

  // ─── Summary Box ─────────────────────────────────────────
  addSummaryBox(title, items) {
    const ch = items.length * 6 + 12;
    this.checkPageBreak(ch);

    const { doc, theme, margins } = this;

    doc.setFillColor(...theme.cardBg);
    doc.roundedRect(
      margins.left,
      this.currentY,
      this.contentWidth,
      ch,
      1,
      1,
      "F",
    );

    doc.setFillColor(...theme.primary);
    doc.rect(margins.left, this.currentY + 1.5, 1.2, ch - 3, "F");

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...theme.primary);
    doc.text(title, margins.left + 5, this.currentY + 6);

    items.forEach((item, i) => {
      const iy = this.currentY + 12 + i * 6;

      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...theme.muted);
      doc.text(item.label, margins.left + 6, iy);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...(item.color || theme.text));
      doc.text(String(item.value), margins.left + 65, iy);
    });

    this.currentY += ch + 3;
    return this;
  }

  // ─── Info Card ───────────────────────────────────────────
  addInfoCard(title, fields) {
    const rows = Math.ceil(fields.length / 2);
    const ch = rows * 6 + 10;
    this.checkPageBreak(ch);

    const { doc, theme, margins } = this;
    const colW = this.contentWidth / 2;

    doc.setFillColor(...theme.cardBg);
    doc.roundedRect(
      margins.left,
      this.currentY,
      this.contentWidth,
      ch,
      1,
      1,
      "F",
    );

    doc.setFillColor(...theme.primary);
    doc.rect(margins.left, this.currentY, this.contentWidth, 0.8, "F");

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...theme.text);
    doc.text(title, margins.left + 4, this.currentY + 6);

    fields.forEach((f, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = margins.left + col * colW + 4;
      const fy = this.currentY + 11 + row * 6;

      doc.setFontSize(6);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...theme.muted);
      doc.text(`${f.label}:`, x, fy);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...(f.color || theme.text));
      doc.text(String(f.value || "—"), x + 22, fy);
    });

    this.currentY += ch + 3;
    doc.setFont("helvetica", "normal");
    return this;
  }

  // ─── Status Helper ───────────────────────────────────────
  static status(s) {
    const map = {
      0: "Pending",
      1: "Approved",
      2: "Rejected",
      active: "Active",
      inactive: "Inactive",
      completed: "Completed",
      failed: "Failed",
    };
    return map[s] || String(s);
  }

  // ─── Page Break Check ────────────────────────────────────
  checkPageBreak(need = 12) {
    if (this.currentY + need > this.pageHeight - this.margins.bottom - 8) {
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

  // ─── Download ────────────────────────────────────────────
  download(filename) {
    this.addFooter();
    this.doc.save(
      filename || `${this.title.replace(/\s+/g, "_")}_${Date.now()}.pdf`,
    );
    return this;
  }

  // ─── Preview ─────────────────────────────────────────────
  preview() {
    this.addFooter();
    const url = URL.createObjectURL(this.doc.output("blob"));
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
