import React, { createContext, useContext, useState } from "react";
import type {
  ChecklistTemplate,
  ChecklistItem,
  EmployeeChecklist,
  EmployeeChecklistItem,
  MockEmployee,
  MockEmployeeAttendancePerformance,
  ChecklistStatus,
  OverallStatus,
} from "../types/performance";

// ─── Mock Employees ─────────────────────────────────────────────────────────
export const MOCK_EMPLOYEES: MockEmployee[] = [
  { id: "EMP001", name: "Alice Johnson", department: "Engineering", position: "Senior Developer" },
  { id: "EMP002", name: "Bob Smith", department: "Sales", position: "Sales Manager" },
  { id: "EMP003", name: "Carol White", department: "Human Resources", position: "HR Specialist" },
  { id: "EMP004", name: "David Brown", department: "Engineering", position: "Junior Developer" },
  { id: "EMP005", name: "Eva Martinez", department: "Marketing", position: "Marketing Lead" },
];

export const MOCK_EMPLOYEE_ATTENDANCE_PERFORMANCE: MockEmployeeAttendancePerformance[] = [
  {
    id: "att-001",
    employeeId: "EMP001",
    period: "2026",
    workingDays: 200,
    daysPresent: 198,
    absentDays: 2,
    lateDays: 6,
    attendanceRate: 99,
    lateRate: 3,
    averageLateMinutes: 6,
    attendanceScore: 99,
    punctualityScore: 97,
    overallScore: 98,
    level: "excellent",
    trend: "stable",
    managerNote: "Attendance is above the 180-day threshold.",
  },
  {
    id: "att-002",
    employeeId: "EMP002",
    period: "2026",
    workingDays: 200,
    daysPresent: 191,
    absentDays: 9,
    lateDays: 12,
    attendanceRate: 95.5,
    lateRate: 6,
    averageLateMinutes: 11,
    attendanceScore: 96,
    punctualityScore: 89,
    overallScore: 93,
    level: "good",
    trend: "improving",
    managerNote: "Improved punctuality compared to last month.",
  },
  {
    id: "att-003",
    employeeId: "EMP003",
    period: "2026",
    workingDays: 200,
    daysPresent: 184,
    absentDays: 16,
    lateDays: 20,
    attendanceRate: 92,
    lateRate: 10,
    averageLateMinutes: 14,
    attendanceScore: 92,
    punctualityScore: 80,
    overallScore: 86,
    level: "good",
    trend: "declining",
    managerNote: "Needs support on morning scheduling consistency.",
  },
  {
    id: "att-004",
    employeeId: "EMP004",
    period: "2026",
    workingDays: 200,
    daysPresent: 176,
    absentDays: 24,
    lateDays: 30,
    attendanceRate: 88,
    lateRate: 15,
    averageLateMinutes: 18,
    attendanceScore: 88,
    punctualityScore: 70,
    overallScore: 78,
    level: "needs-improvement",
    trend: "declining",
    managerNote: "Attendance is below the 180-day threshold and needs correction.",
  },
  {
    id: "att-005",
    employeeId: "EMP005",
    period: "2026",
    workingDays: 200,
    daysPresent: 200,
    absentDays: 0,
    lateDays: 2,
    attendanceRate: 100,
    lateRate: 1,
    averageLateMinutes: 4,
    attendanceScore: 100,
    punctualityScore: 99,
    overallScore: 100,
    level: "excellent",
    trend: "stable",
    managerNote: "Exceptional attendance performance for the year.",
  },
];

// ─── Initial Templates ───────────────────────────────────────────────────────
const INITIAL_TEMPLATES: ChecklistTemplate[] = [
  {
    _id: "tpl-001",
    name: "Software Developer Performance Review",
    description: "Quarterly performance evaluation for software developers covering code quality, delivery, and collaboration.",
    items: [
      { _id: "i-001", name: "Code Quality Score", description: "Average code review score from peers", itemType: "quantitative", targetValue: 80, threshold: 70, unit: "%", weight: 2, dataSource: "manual" },
      { _id: "i-002", name: "Feature Delivery Rate", description: "Percentage of committed features delivered on time", itemType: "quantitative", targetValue: 90, threshold: 75, unit: "%", weight: 2, dataSource: "manual" },
      { _id: "i-003", name: "Team Collaboration", description: "Qualitative assessment by team lead", itemType: "qualitative", weight: 1, dataSource: "manual" },
      { _id: "i-004", name: "AWS Certification", description: "Has valid AWS Solutions Architect certification", itemType: "certification", weight: 1, dataSource: "manual" },
    ],
    createdBy: "admin-001",
    isDeleted: false,
    archive: { status: false, date: null },
    createdAt: "2025-01-10T08:00:00.000Z",
    updatedAt: "2025-01-10T08:00:00.000Z",
  },
  {
    _id: "tpl-002",
    name: "Sales Quarterly Review",
    description: "Evaluation of sales performance including revenue targets, retention, and customer satisfaction.",
    items: [
      { _id: "i-005", name: "Revenue Target Achievement", description: "Percentage of quarterly revenue target met", itemType: "quantitative", targetValue: 100, threshold: 80, unit: "%", weight: 3, dataSource: "manual" },
      { _id: "i-006", name: "Client Retention Rate", description: "Percentage of clients retained from last quarter", itemType: "quantitative", targetValue: 90, threshold: 75, unit: "%", weight: 2, dataSource: "manual" },
      { _id: "i-007", name: "Customer Satisfaction", description: "Manager assessment of customer relations", itemType: "qualitative", weight: 1, dataSource: "manual" },
    ],
    createdBy: "admin-001",
    isDeleted: false,
    archive: { status: false, date: null },
    createdAt: "2025-01-15T08:00:00.000Z",
    updatedAt: "2025-01-15T08:00:00.000Z",
  },
  {
    _id: "tpl-003",
    name: "General Employee Evaluation",
    description: "Standard evaluation template applicable to all employees covering attendance, task completion, and growth.",
    items: [
      { _id: "i-008", name: "Attendance & Punctuality", description: "Assessment of attendance record and punctuality", itemType: "qualitative", weight: 1, dataSource: "manual" },
      { _id: "i-009", name: "Task Completion Rate", description: "Percentage of assigned tasks completed within deadline", itemType: "quantitative", targetValue: 95, threshold: 80, unit: "%", weight: 2, dataSource: "manual" },
      { _id: "i-010", name: "Professional Development", description: "Participation in training and skill development activities", itemType: "qualitative", weight: 1, dataSource: "manual" },
    ],
    createdBy: "admin-001",
    isDeleted: false,
    archive: { status: false, date: null },
    createdAt: "2025-01-20T08:00:00.000Z",
    updatedAt: "2025-01-20T08:00:00.000Z",
  },
  {
    _id: "tpl-004",
    name: "Management Leadership Review",
    description: "Annual leadership evaluation for team leads and managers.",
    items: [
      { _id: "i-011", name: "Team Performance Score", description: "Overall team performance under the manager's leadership", itemType: "quantitative", targetValue: 85, threshold: 70, unit: "%", weight: 3, dataSource: "manual" },
      { _id: "i-012", name: "Communication Effectiveness", description: "Clarity and effectiveness of communication with stakeholders", itemType: "qualitative", weight: 2, dataSource: "manual" },
    ],
    createdBy: "admin-001",
    isDeleted: false,
    archive: { status: true, date: "2025-03-01T00:00:00.000Z" },
    createdAt: "2025-01-05T08:00:00.000Z",
    updatedAt: "2025-03-01T08:00:00.000Z",
  },
  {
    _id: "tpl-005",
    name: "Attendance & Punctuality Performance Review",
    description: "Monthly evaluation focused on attendance consistency and late arrival behavior.",
    items: [
      { _id: "i-013", name: "Attendance Days", description: "Total attended working days in the period", itemType: "quantitative", quantitativeRule: "actual", targetValue: 200, threshold: 180, unit: "days", weight: 2, dataSource: "manual" },
      { _id: "i-014", name: "On-Time Arrival Rate", description: "Percentage of attended days with on-time check-in", itemType: "quantitative", targetValue: 100, threshold: 90, unit: "%", weight: 2, dataSource: "manual" },
      { _id: "i-015", name: "Late Arrival Policy Compliance", description: "Employee stayed within monthly late arrival policy limit", itemType: "certification", weight: 1, dataSource: "manual" },
      { _id: "i-016", name: "Attendance Reliability Notes", description: "Manager notes on schedule adherence and reliability", itemType: "qualitative", weight: 1, dataSource: "manual" },
    ],
    createdBy: "admin-001",
    isDeleted: false,
    archive: { status: false, date: null },
    createdAt: "2025-02-01T08:00:00.000Z",
    updatedAt: "2025-03-12T08:00:00.000Z",
  },
];

// ─── Initial Employee Checklists ─────────────────────────────────────────────
const INITIAL_EMPLOYEE_CHECKLISTS: EmployeeChecklist[] = [
  {
    _id: "ec-001",
    employeeId: "EMP001",
    checklistTemplateId: "tpl-001",
    assignedBy: "admin-001",
    assignedDate: "2025-03-01T08:00:00.000Z",
    dueDate: "2025-04-01T08:00:00.000Z",
    status: "in-progress",
    items: [
      { checklistItemId: "i-001", name: "Code Quality Score", itemType: "quantitative", targetValue: 80, threshold: 70, unit: "%", weight: 2, dataSource: "manual", actualValue: 85, calculatedPercentage: 106, isMet: true, managerNotes: "Excellent code reviews consistently." },
      { checklistItemId: "i-002", name: "Feature Delivery Rate", itemType: "quantitative", targetValue: 90, threshold: 75, unit: "%", weight: 2, dataSource: "manual", actualValue: 78, calculatedPercentage: 87, isMet: true },
      { checklistItemId: "i-003", name: "Team Collaboration", itemType: "qualitative", weight: 1, dataSource: "manual" },
      { checklistItemId: "i-004", name: "AWS Certification", itemType: "certification", weight: 1, dataSource: "manual", isMet: true },
    ],
    overallScore: 65,
    overallStatus: "in-progress",
    isDeleted: false,
    archive: { status: false, date: null },
    createdAt: "2025-03-01T08:00:00.000Z",
    updatedAt: "2025-03-10T10:00:00.000Z",
  },
  {
    _id: "ec-002",
    employeeId: "EMP002",
    checklistTemplateId: "tpl-002",
    assignedBy: "admin-001",
    assignedDate: "2025-01-01T08:00:00.000Z",
    dueDate: "2025-03-31T08:00:00.000Z",
    status: "completed",
    items: [
      { checklistItemId: "i-005", name: "Revenue Target Achievement", itemType: "quantitative", targetValue: 100, threshold: 80, unit: "%", weight: 3, dataSource: "manual", actualValue: 92, calculatedPercentage: 92, isMet: true, managerNotes: "Slightly below target but above threshold." },
      { checklistItemId: "i-006", name: "Client Retention Rate", itemType: "quantitative", targetValue: 90, threshold: 75, unit: "%", weight: 2, dataSource: "manual", actualValue: 88, calculatedPercentage: 98, isMet: true },
      { checklistItemId: "i-007", name: "Customer Satisfaction", itemType: "qualitative", weight: 1, dataSource: "manual", actualValue: "Excellent", isMet: true, managerNotes: "Received multiple commendations from clients." },
    ],
    overallScore: 94,
    overallStatus: "pass",
    managerFeedback: "Bob had an excellent quarter. Surpassed client retention goals and received outstanding customer feedback.",
    completedDate: "2025-03-28T08:00:00.000Z",
    isDeleted: false,
    archive: { status: false, date: null },
    createdAt: "2025-01-01T08:00:00.000Z",
    updatedAt: "2025-03-28T08:00:00.000Z",
  },
  {
    _id: "ec-003",
    employeeId: "EMP003",
    checklistTemplateId: "tpl-003",
    assignedBy: "admin-001",
    assignedDate: "2025-03-10T08:00:00.000Z",
    dueDate: "2025-04-30T08:00:00.000Z",
    status: "assigned",
    items: [
      { checklistItemId: "i-008", name: "Attendance & Punctuality", itemType: "qualitative", weight: 1, dataSource: "manual" },
      { checklistItemId: "i-009", name: "Task Completion Rate", itemType: "quantitative", targetValue: 95, threshold: 80, unit: "%", weight: 2, dataSource: "manual" },
      { checklistItemId: "i-010", name: "Professional Development", itemType: "qualitative", weight: 1, dataSource: "manual" },
    ],
    overallStatus: "not-started",
    isDeleted: false,
    archive: { status: false, date: null },
    createdAt: "2025-03-10T08:00:00.000Z",
    updatedAt: "2025-03-10T08:00:00.000Z",
  },
  {
    _id: "ec-004",
    employeeId: "EMP004",
    checklistTemplateId: "tpl-001",
    assignedBy: "admin-001",
    assignedDate: "2025-01-15T08:00:00.000Z",
    dueDate: "2025-02-28T08:00:00.000Z",
    status: "overdue",
    items: [
      { checklistItemId: "i-001", name: "Code Quality Score", itemType: "quantitative", targetValue: 80, threshold: 70, unit: "%", weight: 2, dataSource: "manual", actualValue: 60, calculatedPercentage: 75, isMet: false, managerNotes: "Needs improvement in code standards." },
      { checklistItemId: "i-002", name: "Feature Delivery Rate", itemType: "quantitative", targetValue: 90, threshold: 75, unit: "%", weight: 2, dataSource: "manual" },
      { checklistItemId: "i-003", name: "Team Collaboration", itemType: "qualitative", weight: 1, dataSource: "manual" },
      { checklistItemId: "i-004", name: "AWS Certification", itemType: "certification", weight: 1, dataSource: "manual", isMet: false },
    ],
    overallScore: 25,
    overallStatus: "in-progress",
    isDeleted: false,
    archive: { status: false, date: null },
    createdAt: "2025-01-15T08:00:00.000Z",
    updatedAt: "2025-03-05T08:00:00.000Z",
  },
  {
    _id: "ec-005",
    employeeId: "EMP005",
    checklistTemplateId: "tpl-005",
    assignedBy: "admin-001",
    assignedDate: "2025-02-01T08:00:00.000Z",
    dueDate: "2025-02-28T08:00:00.000Z",
    status: "completed",
    items: [
      { checklistItemId: "i-013", name: "Attendance Days", itemType: "quantitative", quantitativeRule: "actual", targetValue: 200, threshold: 180, unit: "days", weight: 2, dataSource: "manual", actualValue: 198, calculatedPercentage: 99, isMet: true, managerNotes: "No absences recorded this month." },
      { checklistItemId: "i-014", name: "On-Time Arrival Rate", itemType: "quantitative", targetValue: 100, threshold: 90, unit: "%", weight: 2, dataSource: "manual", actualValue: 98, calculatedPercentage: 98, isMet: true, managerNotes: "Only one minor late check-in." },
      { checklistItemId: "i-015", name: "Late Arrival Policy Compliance", itemType: "certification", weight: 1, dataSource: "manual", isMet: true },
      { checklistItemId: "i-016", name: "Attendance Reliability Notes", itemType: "qualitative", weight: 1, dataSource: "manual", actualValue: "Highly reliable attendance behavior", isMet: true },
    ],
    overallScore: 99,
    overallStatus: "pass",
    managerFeedback: "Eva consistently meets attendance and punctuality standards with minimal supervision.",
    completedDate: "2025-02-27T08:00:00.000Z",
    isDeleted: false,
    archive: { status: false, date: null },
    createdAt: "2025-02-01T08:00:00.000Z",
    updatedAt: "2025-02-27T08:00:00.000Z",
  },
  {
    _id: "ec-006",
    employeeId: "EMP003",
    checklistTemplateId: "tpl-005",
    assignedBy: "admin-001",
    assignedDate: "2025-03-01T08:00:00.000Z",
    dueDate: "2025-03-31T08:00:00.000Z",
    status: "in-progress",
    items: [
      { checklistItemId: "i-013", name: "Attendance Days", itemType: "quantitative", quantitativeRule: "actual", targetValue: 200, threshold: 180, unit: "days", weight: 2, dataSource: "manual", actualValue: 176, calculatedPercentage: 88, isMet: false },
      { checklistItemId: "i-014", name: "On-Time Arrival Rate", itemType: "quantitative", targetValue: 100, threshold: 90, unit: "%", weight: 2, dataSource: "manual", actualValue: 84, calculatedPercentage: 84, isMet: false },
      { checklistItemId: "i-015", name: "Late Arrival Policy Compliance", itemType: "certification", weight: 1, dataSource: "manual", isMet: false, managerNotes: "Exceeded late arrival limit for March." },
      { checklistItemId: "i-016", name: "Attendance Reliability Notes", itemType: "qualitative", weight: 1, dataSource: "manual" },
    ],
    overallScore: 59,
    overallStatus: "in-progress",
    isDeleted: false,
    archive: { status: false, date: null },
    createdAt: "2025-03-01T08:00:00.000Z",
    updatedAt: "2025-03-20T08:00:00.000Z",
  },
  {
    _id: "ec-007",
    employeeId: "EMP004",
    checklistTemplateId: "tpl-005",
    assignedBy: "admin-001",
    assignedDate: "2025-01-20T08:00:00.000Z",
    dueDate: "2025-02-20T08:00:00.000Z",
    status: "overdue",
    items: [
      { checklistItemId: "i-013", name: "Attendance Days", itemType: "quantitative", quantitativeRule: "actual", targetValue: 200, threshold: 180, unit: "days", weight: 2, dataSource: "manual", actualValue: 162, calculatedPercentage: 81, isMet: false },
      { checklistItemId: "i-014", name: "On-Time Arrival Rate", itemType: "quantitative", targetValue: 100, threshold: 90, unit: "%", weight: 2, dataSource: "manual" },
      { checklistItemId: "i-015", name: "Late Arrival Policy Compliance", itemType: "certification", weight: 1, dataSource: "manual", isMet: false },
      { checklistItemId: "i-016", name: "Attendance Reliability Notes", itemType: "qualitative", weight: 1, dataSource: "manual", actualValue: "Needs support for on-time logins", isMet: false },
    ],
    overallScore: 42,
    overallStatus: "in-progress",
    isDeleted: false,
    archive: { status: false, date: null },
    createdAt: "2025-01-20T08:00:00.000Z",
    updatedAt: "2025-03-03T08:00:00.000Z",
  },
];

// ─── Context Types ────────────────────────────────────────────────────────────
interface MockDataContextType {
  employees: MockEmployee[];
  employeeAttendancePerformance: MockEmployeeAttendancePerformance[];
  templates: ChecklistTemplate[];
  employeeChecklists: EmployeeChecklist[];

  // Template operations
  createTemplate: (data: Omit<ChecklistTemplate, "_id" | "createdAt" | "updatedAt" | "isDeleted" | "archive">) => ChecklistTemplate;
  updateTemplate: (id: string, data: Partial<ChecklistTemplate>) => void;
  archiveTemplate: (id: string) => void;
  addTemplateItem: (templateId: string, item: Omit<ChecklistItem, "_id">) => void;
  updateTemplateItem: (templateId: string, itemId: string, data: Partial<ChecklistItem>) => void;
  removeTemplateItem: (templateId: string, itemId: string) => void;

  // Employee checklist operations
  assignChecklist: (data: { employeeId: string; checklistTemplateId: string; dueDate?: string }) => void;
  updateEmployeeChecklist: (id: string, data: Partial<EmployeeChecklist>) => void;
  archiveEmployeeChecklist: (id: string) => void;
  updateChecklistItem: (checklistId: string, itemId: string, data: Partial<EmployeeChecklistItem>) => void;
  recalculateChecklist: (id: string) => void;
}

const MockDataContext = createContext<MockDataContextType | null>(null);

export function MockDataProvider({ children }: { children: React.ReactNode }) {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>(INITIAL_TEMPLATES);
  const [employeeChecklists, setEmployeeChecklists] = useState<EmployeeChecklist[]>(INITIAL_EMPLOYEE_CHECKLISTS);

  const uid = () => Math.random().toString(36).slice(2, 10);
  const now = () => new Date().toISOString();

  // ── Template operations ──────────────────────────────────────────────────
  const createTemplate = (data: Omit<ChecklistTemplate, "_id" | "createdAt" | "updatedAt" | "isDeleted" | "archive">) => {
    const newTemplate: ChecklistTemplate = {
      ...data,
      _id: `tpl-${uid()}`,
      isDeleted: false,
      archive: { status: false, date: null },
      createdAt: now(),
      updatedAt: now(),
    };
    setTemplates((prev) => [newTemplate, ...prev]);
    return newTemplate;
  };

  const updateTemplate = (id: string, data: Partial<ChecklistTemplate>) => {
    setTemplates((prev) =>
      prev.map((t) => (t._id === id ? { ...t, ...data, updatedAt: now() } : t))
    );
  };

  const archiveTemplate = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t._id === id
          ? { ...t, archive: { status: !t.archive.status, date: !t.archive.status ? now() : null }, updatedAt: now() }
          : t
      )
    );
  };

  const addTemplateItem = (templateId: string, item: Omit<ChecklistItem, "_id">) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t._id === templateId
          ? { ...t, items: [...t.items, { ...item, _id: `i-${uid()}` }], updatedAt: now() }
          : t
      )
    );
  };

  const updateTemplateItem = (templateId: string, itemId: string, data: Partial<ChecklistItem>) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t._id === templateId
          ? { ...t, items: t.items.map((i) => (i._id === itemId ? { ...i, ...data } : i)), updatedAt: now() }
          : t
      )
    );
  };

  const removeTemplateItem = (templateId: string, itemId: string) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t._id === templateId
          ? { ...t, items: t.items.filter((i) => i._id !== itemId), updatedAt: now() }
          : t
      )
    );
  };

  // ── Employee checklist operations ────────────────────────────────────────
  const assignChecklist = (data: { employeeId: string; checklistTemplateId: string; dueDate?: string }) => {
    const template = templates.find((t) => t._id === data.checklistTemplateId);
    if (!template) return;
    const items: EmployeeChecklistItem[] = template.items.map((item) => ({
      checklistItemId: item._id,
      name: item.name,
      description: item.description,
      itemType: item.itemType,
      quantitativeRule: item.quantitativeRule ?? "percentage",
      targetValue: item.targetValue,
      threshold: item.threshold,
      unit: item.unit,
      weight: item.weight,
      dataSource: item.dataSource,
    }));
    const newChecklist: EmployeeChecklist = {
      _id: `ec-${uid()}`,
      employeeId: data.employeeId,
      checklistTemplateId: data.checklistTemplateId,
      assignedBy: "admin-001",
      assignedDate: now(),
      dueDate: data.dueDate,
      status: "assigned",
      items,
      overallStatus: "not-started",
      isDeleted: false,
      archive: { status: false, date: null },
      createdAt: now(),
      updatedAt: now(),
    };
    setEmployeeChecklists((prev) => [newChecklist, ...prev]);
  };

  const updateEmployeeChecklist = (id: string, data: Partial<EmployeeChecklist>) => {
    setEmployeeChecklists((prev) =>
      prev.map((c) => (c._id === id ? { ...c, ...data, updatedAt: now() } : c))
    );
  };

  const archiveEmployeeChecklist = (id: string) => {
    setEmployeeChecklists((prev) =>
      prev.map((c) =>
        c._id === id
          ? { ...c, archive: { status: !c.archive.status, date: !c.archive.status ? now() : null }, updatedAt: now() }
          : c
      )
    );
  };

  const updateChecklistItem = (checklistId: string, itemId: string, data: Partial<EmployeeChecklistItem>) => {
    setEmployeeChecklists((prev) =>
      prev.map((c) =>
        c._id === checklistId
          ? {
              ...c,
              items: c.items.map((item) =>
                item.checklistItemId === itemId ? { ...item, ...data } : item
              ),
              updatedAt: now(),
            }
          : c
      )
    );
  };

  const recalculateChecklist = (id: string) => {
    setEmployeeChecklists((prev) =>
      prev.map((c) => {
        if (c._id !== id) return c;
        const items = c.items.map((item) => {
          const hasActualValue =
            item.actualValue !== undefined &&
            item.actualValue !== null &&
            item.actualValue !== "";

          if (item.itemType === "quantitative" && hasActualValue) {
            const actual = Number(item.actualValue);
            const target = Number(item.targetValue);
            const threshold = Number(item.threshold);
            const quantitativeRule = item.quantitativeRule ?? "percentage";

            if (!Number.isFinite(actual)) {
              return item;
            }

            const calculatedPercentage =
              Number.isFinite(target) && target > 0
                ? Math.round((actual / target) * 100)
                : undefined;

            let isMet: boolean | undefined;
            if (Number.isFinite(threshold)) {
              if (quantitativeRule === "actual") {
                isMet = actual >= threshold;
              } else if (calculatedPercentage !== undefined) {
                isMet = calculatedPercentage >= threshold;
              }
            }

            return {
              ...item,
              quantitativeRule,
              calculatedPercentage,
              isMet,
            };
          }

          if (item.itemType === "quantitative" && !hasActualValue) {
            return { ...item, calculatedPercentage: undefined, isMet: undefined };
          }

          return item;
        });

        const filledItems = items.filter(
          (item) =>
            (item.actualValue !== undefined &&
              item.actualValue !== null &&
              item.actualValue !== "") ||
            item.isMet !== undefined
        );
        const totalWeight = items.reduce((s, i) => s + (i.weight ?? 1), 0);
        const weightedSum = items.reduce((s, item) => {
          const w = item.weight ?? 1;
          if (item.itemType === "quantitative" && item.calculatedPercentage !== undefined) {
            return s + Math.min(item.calculatedPercentage, 100) * w;
          }
          if (item.itemType !== "quantitative" && item.isMet !== undefined) {
            return s + (item.isMet ? 100 : 0) * w;
          }
          return s;
        }, 0);

        const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
        const allFilled = items.every(
          (item) =>
            (item.actualValue !== undefined &&
              item.actualValue !== null &&
              item.actualValue !== "") ||
            item.isMet !== undefined
        );

        let overallStatus: OverallStatus = "not-started";
        if (filledItems.length > 0 && !allFilled) overallStatus = "in-progress";
        if (allFilled) overallStatus = overallScore >= 70 ? "pass" : "fail";

        let status: ChecklistStatus = c.status;
        if (allFilled) status = "completed";
        else if (filledItems.length > 0) status = "in-progress";

        return {
          ...c,
          items,
          overallScore,
          overallStatus,
          status,
          completedDate: allFilled && !c.completedDate ? now() : c.completedDate,
          updatedAt: now(),
        };
      })
    );
  };

  return (
    <MockDataContext.Provider
      value={{
        employees: MOCK_EMPLOYEES,
        employeeAttendancePerformance: MOCK_EMPLOYEE_ATTENDANCE_PERFORMANCE,
        templates,
        employeeChecklists,
        createTemplate,
        updateTemplate,
        archiveTemplate,
        addTemplateItem,
        updateTemplateItem,
        removeTemplateItem,
        assignChecklist,
        updateEmployeeChecklist,
        archiveEmployeeChecklist,
        updateChecklistItem,
        recalculateChecklist,
      }}
    >
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  const ctx = useContext(MockDataContext);
  if (!ctx) throw new Error("useMockData must be used inside MockDataProvider");
  return ctx;
}
