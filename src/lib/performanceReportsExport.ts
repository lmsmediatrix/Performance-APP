import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface PerformanceReportExportRow {
  employeeName: string;
  role: string;
  department: string;
  checklistName: string;
  status: string;
  overallStatus: string;
  score: number | null;
  progress: string;
  assignedDate: string;
  dueDate: string;
  completedDate: string;
  itemCount: number;
  metItems: number;
}

interface PerformancePdfSummary {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  avgScore: number | null;
}

interface DownloadPerformancePdfInput {
  rows: PerformanceReportExportRow[];
  summary: PerformancePdfSummary;
  organizationName: string;
  organizationLogoUrl?: string;
  generatedBy: string;
}

const sanitizeFileName = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

const csvEscape = (value: unknown): string => {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const imageTypeFromDataUrl = (dataUrl: string): "PNG" | "JPEG" =>
  dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";

const loadImageAsDataUrl = async (
  imageUrl?: string
): Promise<string | undefined> => {
  if (!imageUrl) return undefined;

  try {
    const response = await fetch(imageUrl, { mode: "cors" });
    if (!response.ok) return undefined;

    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        resolve(typeof reader.result === "string" ? reader.result : undefined);
      reader.onerror = () => reject(new Error("Failed to load organization logo"));
      reader.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
};

export const downloadPerformanceReportsCsv = (
  rows: PerformanceReportExportRow[]
) => {
  const headers = [
    "Employee",
    "Role",
    "Department",
    "Checklist",
    "Status",
    "Overall",
    "Score",
    "Progress",
    "Assigned Date",
    "Due Date",
    "Completed Date",
    "Item Count",
    "Met Items",
  ];

  const csvLines = [
    headers.join(","),
    ...rows.map((row) =>
      [
        row.employeeName,
        row.role,
        row.department,
        row.checklistName,
        row.status,
        row.overallStatus,
        row.score === null ? "" : row.score,
        row.progress,
        row.assignedDate,
        row.dueDate,
        row.completedDate,
        row.itemCount,
        row.metItems,
      ]
        .map(csvEscape)
        .join(",")
    ),
  ];

  const csvContent = csvLines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const dateStamp = new Date().toISOString().slice(0, 10);
  anchor.href = url;
  anchor.download = `performance-reports-${dateStamp}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export const downloadPerformanceReportsPdf = async ({
  rows,
  summary,
  organizationName,
  organizationLogoUrl,
  generatedBy,
}: DownloadPerformancePdfInput) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 34;
  const contentWidth = pageWidth - marginX * 2;

  const logoDataUrl = await loadImageAsDataUrl(organizationLogoUrl);
  const generatedAt = new Date().toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(marginX, 24, contentWidth, 74, 12, 12, "F");

  if (logoDataUrl) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(marginX + 12, 39, 40, 40, 10, 10, "F");
    doc.addImage(
      logoDataUrl,
      imageTypeFromDataUrl(logoDataUrl),
      marginX + 16,
      43,
      32,
      32
    );
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(organizationName || "Organization", marginX + 62, 49);
  doc.setFontSize(22);
  doc.text("Performance Analytics Report", marginX + 62, 75);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Generated ${generatedAt} by ${generatedBy}`, pageWidth - marginX, 83, {
    align: "right",
  });

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, 112, contentWidth, 56, 10, 10, "FD");
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Total Records", marginX + 14, 134);
  doc.text("Completed", marginX + 180, 134);
  doc.text("In Progress", marginX + 328, 134);
  doc.text("Overdue", marginX + 488, 134);
  doc.text("Average Score", marginX + 614, 134);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(15);
  doc.text(String(summary.total), marginX + 14, 154);
  doc.text(String(summary.completed), marginX + 180, 154);
  doc.text(String(summary.inProgress), marginX + 328, 154);
  doc.text(String(summary.overdue), marginX + 488, 154);
  doc.text(
    summary.avgScore === null ? "--" : `${summary.avgScore}%`,
    marginX + 614,
    154
  );

  autoTable(doc, {
    startY: 184,
    margin: { left: marginX, right: marginX },
    head: [
      [
        "Employee",
        "Role",
        "Checklist",
        "Status",
        "Overall",
        "Score",
        "Progress",
        "Due Date",
      ],
    ],
    body: rows.map((row) => [
      row.employeeName,
      row.role,
      row.checklistName,
      row.status,
      row.overallStatus,
      row.score === null ? "--" : `${row.score}%`,
      row.progress,
      row.dueDate,
    ]),
    theme: "grid",
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 130 },
      1: { cellWidth: 78 },
      2: { cellWidth: 150 },
      3: { cellWidth: 72 },
      4: { cellWidth: 72 },
      5: { cellWidth: 58, halign: "right" },
      6: { cellWidth: 78, halign: "right" },
      7: { cellWidth: "auto" },
    },
  });

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, pageHeight - 26, pageWidth - marginX, pageHeight - 26);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Performance System", marginX, pageHeight - 12);
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - marginX, pageHeight - 12, {
      align: "right",
    });
  }

  const orgSlug = sanitizeFileName(organizationName || "organization");
  const dateStamp = new Date().toISOString().slice(0, 10);
  doc.save(`performance-analytics-${orgSlug}-${dateStamp}.pdf`);
};

