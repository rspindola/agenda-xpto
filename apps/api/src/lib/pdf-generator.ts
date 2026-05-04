import PDFDocument from "pdfkit";
import type { ReportResponse } from "~/modules/reports/reports.schema.js";

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  if (name.length <= 2) return `${name}***@${domain}`;
  return `${name[0]}***@${domain}`;
}

export async function generateReportPdf(report: ReportResponse): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ bufferPages: true });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    doc.on("error", (err: Error) => {
      reject(err);
    });

    try {
      // Header
      doc.fontSize(20).font("Helvetica-Bold").text("Analytics Report", { align: "center" });
      doc.fontSize(12).font("Helvetica").text(`Report Type: ${report.reportType}`, { align: "center" });
      doc.fontSize(10).text(`Period: ${new Date(report.period.from).toLocaleDateString()} to ${new Date(report.period.to).toLocaleDateString()}`, { align: "center" });
      doc.text(`Generated: ${new Date(report.generatedAt).toLocaleString()}`, { align: "center" });
      doc.moveDown();

      // Data rows
      if (report.data.length > 0) {
        doc.fontSize(12).font("Helvetica-Bold").text("Data", { underline: true });
        doc.fontSize(10).font("Helvetica");
        doc.moveDown(0.3);

        for (const row of report.data) {
          const value = typeof row.value === 'string' ? row.value : String(row.value);
          const maskedValue = value.includes("@")
            ? value.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (email) => maskEmail(email))
            : value;

          doc.text(`${row.label}: ${maskedValue}`);
          doc.moveDown(0.2);
        }
      } else {
        doc.fontSize(10).text("No data available for the selected period.");
      }

      doc.moveDown();

      // Summary (if present)
      if (report.summary && Object.keys(report.summary).length > 0) {
        doc.fontSize(12).font("Helvetica-Bold").text("Summary", { underline: true });
        doc.fontSize(10).font("Helvetica");
        doc.moveDown(0.3);

        for (const [key, value] of Object.entries(report.summary)) {
          const v = typeof value === 'string' ? value : String(value);
          const maskedV = v.includes("@")
            ? v.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (email) => maskEmail(email))
            : v;
          doc.text(`${key}: ${maskedV}`);
          doc.moveDown(0.2);
        }
      }

      doc.end();
    } catch (error: unknown) {
      doc.end();
      if (error instanceof Error) {
        reject(error);
      } else {
        reject(new Error(String(error)));
      }
    }
  });
}
