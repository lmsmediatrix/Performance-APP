export type ItemType = "quantitative" | "qualitative" | "certification";
export type DataSource = "lms" | "manual" | "api";
export type ChecklistStatus = "assigned" | "in-progress" | "completed" | "overdue";
export type OverallStatus = "pass" | "fail" | "in-progress" | "not-started";
export type QuantitativeRule = "percentage" | "actual";
export type AttendanceTrend = "improving" | "stable" | "declining";
export type AttendancePerformanceLevel =
  | "excellent"
  | "good"
  | "needs-improvement";

export interface ChecklistItem {
  _id: string;
  name: string;
  description?: string;
  itemType: ItemType;
  quantitativeRule?: QuantitativeRule;
  targetValue?: number | string;
  threshold?: number | string;
  unit?: string;
  weight: number;
  dataSource: DataSource;
}

export interface ChecklistTemplate {
  _id: string;
  name: string;
  description?: string;
  items: ChecklistItem[];
  createdBy: string;
  isDeleted: boolean;
  archive: { status: boolean; date: string | null };
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeChecklistItem {
  checklistItemId: string;
  name: string;
  description?: string;
  itemType: ItemType;
  quantitativeRule?: QuantitativeRule;
  targetValue?: number | string;
  threshold?: number | string;
  unit?: string;
  weight: number;
  dataSource: DataSource;
  actualValue?: number | string | boolean;
  calculatedPercentage?: number;
  isMet?: boolean;
  managerNotes?: string;
}

export interface EmployeeChecklist {
  _id: string;
  employeeId: string;
  checklistTemplateId: string;
  assignedBy: string;
  assignedDate: string;
  dueDate?: string;
  status: ChecklistStatus;
  items: EmployeeChecklistItem[];
  overallScore?: number;
  overallStatus: OverallStatus;
  managerFeedback?: string;
  completedDate?: string;
  isDeleted: boolean;
  archive: { status: boolean; date: string | null };
  createdAt: string;
  updatedAt: string;
}

export interface MockEmployee {
  id: string;
  name: string;
  department: string;
  position: string;
}

export interface MockEmployeeAttendancePerformance {
  id: string;
  employeeId: string;
  period: string;
  workingDays: number;
  daysPresent: number;
  absentDays: number;
  lateDays: number;
  attendanceRate: number;
  lateRate: number;
  averageLateMinutes: number;
  attendanceScore: number;
  punctualityScore: number;
  overallScore: number;
  level: AttendancePerformanceLevel;
  trend: AttendanceTrend;
  managerNote?: string;
}
