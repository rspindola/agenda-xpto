import type { ReportResponse } from "~/modules/reports/reports.schema.js";

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  if (name.length <= 2) return `${name}***@${domain}`;
  return `${name[0]}***@${domain}`;
}

export function formatReportCsv(report: ReportResponse): string {
  const lines: string[] = [];

  // Header
  lines.push(`Report: ${report.reportType}`);
  lines.push(`Period: ${report.period.from} to ${report.period.to}`);
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push("");

  // Data rows
  if (report.data.length > 0) {
    lines.push("Label,Value");
    for (const row of report.data) {
      const label = escapeCsvField(row.label);
      let value = String(row.value) || "";

      // Mask emails in values
      if (value.includes("@")) {
        value = value.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (email) => maskEmail(email));
      }

      value = escapeCsvField(value);
      lines.push(`${label},${value}`);
    }
  } else {
    lines.push("No data available for the selected period.");
  }

  lines.push("");

  // Summary (if present)
  if (report.summary && Object.keys(report.summary).length > 0) {
    lines.push("Summary");
    for (const [key, value] of Object.entries(report.summary)) {
      const k = escapeCsvField(key);
      let v = typeof value === 'string' ? value : String(value);
      if (v.includes("@")) {
        v = v.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (email) => maskEmail(email));
      }
      v = escapeCsvField(v);
      lines.push(`${k},${v}`);
    }
  }

  return lines.join("\n");
}

function escapeCsvField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
