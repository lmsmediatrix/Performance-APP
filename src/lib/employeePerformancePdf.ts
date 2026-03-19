import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { EmployeeChecklistItem } from "../types/performance";

type ReportItem = {
  index: number;
  item: EmployeeChecklistItem;
  actualValueDisplay: string;
  isMetValue?: boolean;
  managerNotesDisplay: string;
};

export type EmployeePerformancePdfInput = {
  organizationName: string;
  organizationLogoUrl?: string;
  employeeName: string;
  employeeRole: string;
  checklistName: string;
  statusLabel: string;
  overallStatusLabel: string;
  overallScore?: number;
  assignedDate?: string;
  dueDate?: string;
  completedItems: number;
  totalItems: number;
  progressPct: number;
  managerFeedback?: string;
  reportItems: ReportItem[];
};

const formatDate = (value?: string) => {
  if (!value) return "--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "--";
  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (value: Date) =>
  value.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const sanitizeForFilename = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

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
      reader.onloadend = () => {
        resolve(typeof reader.result === "string" ? reader.result : undefined);
      };
      reader.onerror = () => reject(new Error("Failed to read logo image"));
      reader.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
};

const getTargetDisplay = (item: EmployeeChecklistItem) => {
  if (item.itemType !== "quantitative") return "--";
  if (item.targetValue === undefined || item.targetValue === null) return "--";
  return `${item.targetValue}${item.unit ?? ""}`;
};

const getThresholdDisplay = (item: EmployeeChecklistItem) => {
  if (item.itemType !== "quantitative") return "--";
  if (item.threshold === undefined || item.threshold === null) return "--";
  const ruleLabel = item.quantitativeRule === "actual" ? "actual" : "percentage";
  return `${item.threshold}${item.unit ?? ""} (${ruleLabel})`;
};

const getActualDisplay = (reportItem: ReportItem) => {
  if (reportItem.item.itemType === "certification") {
    if (reportItem.isMetValue === true) return "Passed";
    if (reportItem.isMetValue === false) return "Not Passed";
  }

  if (!reportItem.actualValueDisplay.trim()) {
    return "--";
  }

  return reportItem.actualValueDisplay;
};

const getResultDisplay = (reportItem: ReportItem) => {
  if (reportItem.isMetValue === true) return "Met";
  if (reportItem.isMetValue === false) return "Not met";
  return "Pending";
};

export const downloadEmployeePerformancePdf = async (
  payload: EmployeePerformancePdfInput
) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 40;
  const contentWidth = pageWidth - marginX * 2;

  const logoDataUrl = await loadImageAsDataUrl(payload.organizationLogoUrl);

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(marginX, 28, contentWidth, 92, 12, 12, "F");

  if (logoDataUrl) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(marginX + 16, 48, 48, 48, 10, 10, "F");
    doc.addImage(
      logoDataUrl,
      imageTypeFromDataUrl(logoDataUrl),
      marginX + 20,
      52,
      40,
      40
    );
  } else {
    doc.setFillColor(30, 64, 175);
    doc.roundedRect(marginX + 16, 48, 48, 48, 10, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(payload.organizationName.slice(0, 1).toUpperCase() || "O", marginX + 40, 79, {
      align: "center",
    });
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(payload.organizationName || "Organization", marginX + 76, 64);
  doc.setFontSize(20);
  doc.text("Employee Performance Report", marginX + 76, 88);

  const generatedAt = new Date();

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, 136, contentWidth, 106, 10, 10, "FD");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Employee", marginX + 14, 157);
  doc.text("Checklist Name", marginX + 14, 181);
  doc.text("Assigned / Due", marginX + 14, 205);
  doc.text("Generated", marginX + 14, 229);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text(`${payload.employeeName} (${payload.employeeRole || "Employee"})`, marginX + 98, 157);
  doc.text(payload.checklistName, marginX + 98, 181);
  doc.text(
    `${formatDate(payload.assignedDate)} / ${formatDate(payload.dueDate)}`,
    marginX + 98,
    205
  );
  doc.text(
    formatDateTime(generatedAt),
    marginX + 98,
    229
  );

  const metricX = pageWidth - marginX - 182;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(metricX, 152, 168, 74, 10, 10, "F");
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.text("STATUS", metricX + 12, 170);
  doc.text("OVERALL", metricX + 12, 192);
  doc.text("PROGRESS", metricX + 12, 214);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(payload.statusLabel, metricX + 76, 170);
  doc.text(
    payload.overallScore !== undefined
      ? `${payload.overallStatusLabel} (${payload.overallScore}%)`
      : payload.overallStatusLabel,
    metricX + 76,
    192
  );
  doc.text(
    `${payload.completedItems}/${payload.totalItems} (${payload.progressPct}%)`,
    metricX + 76,
    214
  );

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Checklist Item Breakdown", marginX, 272);

  const tableBody = payload.reportItems.map((reportItem) => [
    `${reportItem.index}`,
    reportItem.item.name,
    reportItem.item.itemType,
    getTargetDisplay(reportItem.item),
    getActualDisplay(reportItem),
    getThresholdDisplay(reportItem.item),
    getResultDisplay(reportItem),
    String(reportItem.item.weight ?? 1),
    reportItem.managerNotesDisplay || "--",
  ]);

  autoTable(doc, {
    startY: 282,
    margin: { left: marginX, right: marginX },
    head: [
      ["#", "Item", "Type", "Target", "Actual", "Threshold", "Result", "Weight", "Notes"],
    ],
    body: tableBody,
    theme: "grid",
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold",
      halign: "left",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 18, halign: "center" },
      1: { cellWidth: 116 },
      2: { cellWidth: 56 },
      3: { cellWidth: 56 },
      4: { cellWidth: 56 },
      5: { cellWidth: 74 },
      6: { cellWidth: 52 },
      7: { cellWidth: 44, halign: "center" },
      8: { cellWidth: "auto" },
    },
  });

  const tableState = doc as jsPDF & {
    lastAutoTable?: { finalY: number };
  };
  let nextY = (tableState.lastAutoTable?.finalY ?? 282) + 18;

  if (nextY > pageHeight - 150) {
    doc.addPage();
    nextY = marginX;
  }

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, nextY, contentWidth, 100, 10, 10, "FD");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Manager Feedback", marginX + 14, nextY + 20);

  const feedbackText =
    payload.managerFeedback?.trim() || "No manager feedback was provided.";
  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const feedbackLines = doc.splitTextToSize(feedbackText, contentWidth - 28);
  doc.text(feedbackLines, marginX + 14, nextY + 38);

  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, pageHeight - 32, pageWidth - marginX, pageHeight - 32);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Performance System Report", marginX, pageHeight - 18);
    doc.text(`Page ${page} of ${totalPages}`, pageWidth - marginX, pageHeight - 18, {
      align: "right",
    });
  }

  const employeeSlug = sanitizeForFilename(payload.employeeName || "employee");
  const todayStamp = new Date().toISOString().slice(0, 10);
  doc.save(`performance-report-${employeeSlug}-${todayStamp}.pdf`);
};
