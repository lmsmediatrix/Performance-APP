import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion as m } from "framer-motion";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { toast } from "react-toastify";
import BentoCard from "../../components/common/BentoCard";
import DataTable, { type DataTableColumn } from "../../components/common/DataTable";
import {
  ChartBarIcon,
  CheckCheckIcon,
  ClipboardIcon,
  EyeIcon,
  TriangleAlertIcon,
  UsersRoundIcon,
} from "../../components/icons/animate";
import { useChecklistTemplates } from "../../hooks/useChecklistTemplate";
import { useEmployeeChecklists } from "../../hooks/useEmployeeChecklist";
import { useAllUsers } from "../../hooks/useUser";
import {
  downloadPerformanceReportsCsv,
  downloadPerformanceReportsPdf,
  type PerformanceReportExportRow,
} from "../../lib/performanceReportsExport";
import UserService from "../../services/userApi";
import type {
  ChecklistStatus,
  ChecklistTemplate,
  EmployeeChecklist,
  EmployeeChecklistItem,
  OverallStatus,
} from "../../types/performance";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const STATUS_LABELS: Record<ChecklistStatus, string> = {
  assigned: "Assigned",
  "in-progress": "In Progress",
  completed: "Completed",
  overdue: "Overdue",
};

const OVERALL_LABELS: Record<OverallStatus, string> = {
  pass: "Pass",
  fail: "Fail",
  "in-progress": "In Progress",
  "not-started": "Not Started",
};

const formatDateReadable = (value?: string) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const hasItemValue = (item: EmployeeChecklistItem) =>
  (item.actualValue !== undefined &&
    item.actualValue !== null &&
    item.actualValue !== "") ||
  item.isMet !== undefined;

interface PerformanceReportRow {
  checklistId: string;
  employeeName: string;
  role: string;
  department: string;
  checklistName: string;
  status: ChecklistStatus;
  overallStatus: OverallStatus;
  score: number | null;
  progress: string;
  assignedDateLabel: string;
  dueDate: Date | null;
  dueDateLabel: string;
  completedDateLabel: string;
  itemCount: number;
  metItems: number;
  initials: string;
  isOverdue: boolean;
}

const normalizeRoleForPermission = (role: string) =>
  role.toLowerCase().replace(/[_-]+/g, " ").trim();

const STATUS_CELL_CLASSES: Record<
  ChecklistStatus,
  { dot: string; text: string; bg: string; label: string }
> = {
  assigned: {
    label: "Assigned",
    dot: "bg-blue-500",
    text: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
  },
  "in-progress": {
    label: "In Progress",
    dot: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
  },
  completed: {
    label: "Completed",
    dot: "bg-green-500",
    text: "text-green-700",
    bg: "bg-green-50 border-green-200",
  },
  overdue: {
    label: "Overdue",
    dot: "bg-red-500",
    text: "text-red-700",
    bg: "bg-red-50 border-red-200",
  },
};

const OVERALL_CELL_CLASSES: Record<OverallStatus, string> = {
  pass: "bg-green-100 text-green-700",
  fail: "bg-red-100 text-red-700",
  "in-progress": "bg-amber-100 text-amber-700",
  "not-started": "bg-slate-100 text-slate-700",
};

const getCardMotion = (index: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.45,
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    delay: index * 0.08,
  },
});

export default function PerformanceReportsPage() {
  const navigate = useNavigate();
  const [exportingPdf, setExportingPdf] = useState(false);

  const {
    data: templatesResponse,
    isLoading: isTemplatesLoading,
    isError: isTemplatesError,
  } = useChecklistTemplates({ page: 1, limit: 500 });
  const {
    data: employeeChecklistsResponse,
    isLoading: isChecklistsLoading,
    isError: isChecklistsError,
  } = useEmployeeChecklists({ page: 1, limit: 1000 });
  const { data: users = [], isLoading: isUsersLoading } = useAllUsers();
  const { data: currentUser } = useQuery({
    queryKey: ["user", "current", "reports-access"],
    queryFn: () => UserService.getCurrentUser(),
    staleTime: 1000 * 60 * 5,
  });

  const templates: ChecklistTemplate[] = templatesResponse?.templates ?? [];
  const employeeChecklists: EmployeeChecklist[] =
    employeeChecklistsResponse?.checklists ?? [];

  const templateById = useMemo(() => {
    const map = new Map<string, { name: string }>();
    templates.forEach((template) => {
      map.set(template._id, { name: template.name });
    });
    return map;
  }, [templates]);

  const employeeById = useMemo(() => {
    const map = new Map<
      string,
      { name: string; role: string; department: string }
    >();

    users.forEach((user) => {
      map.set(user.id, {
        name: user.name,
        role: user.position || "Employee",
        department: user.department || "Unknown",
      });
    });

    return map;
  }, [users]);

  const reportRows = useMemo<PerformanceReportRow[]>(() => {
    return employeeChecklists
      .filter((checklist) => !checklist.isDeleted)
      .map((checklist) => {
        const employee = employeeById.get(checklist.employeeId);
        const template = templateById.get(checklist.checklistTemplateId);
        const completedItems = checklist.items.filter(hasItemValue).length;
        const totalItems = checklist.items.length;
        const progressPct =
          totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        const employeeName = employee?.name ?? "Unknown Employee";
        const dueDate = checklist.dueDate ? new Date(checklist.dueDate) : null;
        const initials = employeeName
          .split(" ")
          .map((part) => part[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return {
          checklistId: checklist._id,
          employeeName,
          role: employee?.role ?? "Employee",
          department: employee?.department ?? "Unknown",
          checklistName: template?.name ?? "Unknown Checklist",
          status: checklist.status,
          overallStatus: checklist.overallStatus,
          score: checklist.overallScore ?? null,
          progress: `${completedItems}/${totalItems} (${progressPct}%)`,
          assignedDateLabel: formatDateReadable(checklist.assignedDate),
          dueDate,
          dueDateLabel: formatDateReadable(checklist.dueDate),
          completedDateLabel: formatDateReadable(checklist.completedDate),
          itemCount: totalItems,
          metItems: checklist.items.filter((item) => item.isMet === true).length,
          initials: initials || "?",
          isOverdue:
            Boolean(dueDate) &&
            dueDate !== null &&
            dueDate.getTime() < Date.now() &&
            checklist.status !== "completed",
        };
      });
  }, [employeeChecklists, employeeById, templateById]);

  const exportRows = useMemo<PerformanceReportExportRow[]>(
    () =>
      reportRows.map((row) => ({
        employeeName: row.employeeName,
        role: row.role,
        department: row.department,
        checklistName: row.checklistName,
        status: STATUS_LABELS[row.status],
        overallStatus: OVERALL_LABELS[row.overallStatus],
        score: row.score,
        progress: row.progress,
        assignedDate: row.assignedDateLabel,
        dueDate: row.dueDateLabel,
        completedDate: row.completedDateLabel,
        itemCount: row.itemCount,
        metItems: row.metItems,
      })),
    [reportRows]
  );

  const summary = useMemo(() => {
    const total = reportRows.length;
    const completed = reportRows.filter((row) => row.status === "completed").length;
    const inProgress = reportRows.filter((row) => row.status === "in-progress").length;
    const overdue = reportRows.filter((row) => row.status === "overdue").length;
    const scoredRows = reportRows.filter((row) => row.score !== null);
    const avgScore =
      scoredRows.length > 0
        ? Math.round(
            scoredRows.reduce((sum, row) => sum + (row.score ?? 0), 0) /
              scoredRows.length
          )
        : null;

    return { total, completed, inProgress, overdue, avgScore };
  }, [reportRows]);

  const reportColumns = useMemo<Array<DataTableColumn<PerformanceReportRow>>>(
    () => [
      {
        id: "employee",
        header: "Employee",
        accessor: (row) => row.employeeName,
        sortable: true,
        filterType: "text",
        filterPlaceholder: "Search employee",
        minWidth: "240px",
        cell: (row) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-xs font-semibold text-white">
              {row.initials}
            </div>
            <div>
              <p className="font-medium text-slate-900">{row.employeeName}</p>
              <p className="text-xs text-slate-500">{row.role}</p>
            </div>
          </div>
        ),
      },
      {
        id: "checklist",
        header: "Checklist",
        accessor: (row) => row.checklistName,
        sortable: true,
        filterType: "text",
        filterPlaceholder: "Search checklist",
        minWidth: "240px",
        cell: (row) => (
          <div>
            <p className="font-medium text-slate-800">{row.checklistName}</p>
            <p className="text-xs text-slate-500">{row.itemCount} items</p>
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        accessor: (row) => row.status,
        sortable: true,
        filterType: "select",
        filterOptions: (Object.keys(STATUS_LABELS) as ChecklistStatus[]).map(
          (status) => ({
            label: STATUS_LABELS[status],
            value: status,
          })
        ),
        minWidth: "150px",
        cell: (row) => {
          const config = STATUS_CELL_CLASSES[row.status];
          return (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
              {config.label}
            </span>
          );
        },
      },
      {
        id: "overall",
        header: "Overall",
        accessor: (row) => row.overallStatus,
        sortable: true,
        filterType: "select",
        filterOptions: (Object.keys(OVERALL_LABELS) as OverallStatus[]).map(
          (status) => ({
            label: OVERALL_LABELS[status],
            value: status,
          })
        ),
        minWidth: "140px",
        cell: (row) => (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${OVERALL_CELL_CLASSES[row.overallStatus]}`}
          >
            {OVERALL_LABELS[row.overallStatus]}
          </span>
        ),
      },
      {
        id: "score",
        header: "Score",
        accessor: (row) => row.score,
        sortable: true,
        filterType: "none",
        minWidth: "120px",
        cell: (row) =>
          row.score === null ? (
            <span className="text-xs text-slate-400">Not scored</span>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full ${
                    row.score >= 70
                      ? "bg-green-500"
                      : row.score >= 50
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min(row.score, 100)}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-700">{row.score}%</span>
            </div>
          ),
      },
      {
        id: "dueDate",
        header: "Due Date",
        accessor: (row) => row.dueDate,
        sortable: true,
        filterType: "text",
        filterPlaceholder: "Search date",
        minWidth: "140px",
        cell: (row) => (
          <span className={row.isOverdue ? "font-medium text-red-600" : "text-slate-600"}>
            {row.dueDateLabel}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        accessor: (row) => row.checklistId,
        sortable: false,
        filterType: "none",
        minWidth: "100px",
        className: "text-right",
        headerClassName: "text-right",
        cell: (row) => (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={(event) => {
                event.stopPropagation();
                navigate(`/employee-checklists/${row.checklistId}`);
              }}
              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
              title="View details"
            >
              <EyeIcon size={15} />
            </button>
          </div>
        ),
      },
    ],
    [navigate]
  );

  const statusChartData = useMemo(() => {
    const assigned = reportRows.filter((row) => row.status === "assigned").length;
    const inProgress = reportRows.filter(
      (row) => row.status === "in-progress"
    ).length;
    const completed = reportRows.filter(
      (row) => row.status === "completed"
    ).length;
    const overdue = reportRows.filter((row) => row.status === "overdue").length;

    return {
      labels: ["Assigned", "In Progress", "Completed", "Overdue"],
      datasets: [
        {
          data: [assigned, inProgress, completed, overdue],
          backgroundColor: ["#3b82f6", "#f59e0b", "#10b981", "#ef4444"],
          borderColor: ["#ffffff", "#ffffff", "#ffffff", "#ffffff"],
          borderWidth: 2,
        },
      ],
    };
  }, [reportRows]);

  const scoreByChecklistData = useMemo(() => {
    const scoreMap = new Map<string, { total: number; count: number }>();

    reportRows.forEach((row) => {
      if (row.score === null) return;

      const prev = scoreMap.get(row.checklistName) ?? { total: 0, count: 0 };
      scoreMap.set(row.checklistName, {
        total: prev.total + row.score,
        count: prev.count + 1,
      });
    });

    const chartRows = Array.from(scoreMap.entries())
      .map(([name, value]) => ({
        name,
        avg: Math.round(value.total / value.count),
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 8);

    return {
      labels: chartRows.map((row) => row.name),
      datasets: [
        {
          label: "Average Score",
          data: chartRows.map((row) => row.avg),
          backgroundColor: "#2563eb",
          borderRadius: 6,
        },
      ],
    };
  }, [reportRows]);

  const sourceUser =
    currentUser?.user && typeof currentUser.user === "object"
      ? currentUser.user
      : currentUser;

  const organizationName =
    sourceUser?.organization?.name ??
    sourceUser?.org?.name ??
    sourceUser?.organizationName ??
    "Organization";
  const organizationLogo =
    sourceUser?.organization?.branding?.logo ??
    sourceUser?.organization?.logo ??
    sourceUser?.org?.branding?.logo ??
    sourceUser?.org?.logo ??
    "";
  const generatedBy = sourceUser?.name ?? "System User";
  const currentRole = normalizeRoleForPermission(sourceUser?.role ?? "");
  const canExport =
    !currentRole ||
    currentRole.includes("hr") ||
    currentRole.includes("admin") ||
    currentRole.includes("instructor");

  const pageLoading = isTemplatesLoading || isChecklistsLoading || isUsersLoading;
  const pageError = isTemplatesError || isChecklistsError;

  const summaryCards = [
    {
      title: "Records",
      value: summary.total,
      description: "Total report rows",
      icon: <UsersRoundIcon size={18} className="text-cyan-600" />,
    },
    {
      title: "Completed",
      value: summary.completed,
      description: "Checklist status",
      icon: <CheckCheckIcon size={18} className="text-green-600" />,
    },
    {
      title: "In Progress",
      value: summary.inProgress,
      description: "Checklist status",
      icon: <ChartBarIcon size={18} className="text-amber-600" />,
    },
    {
      title: "Overdue",
      value: summary.overdue,
      description: "Checklist status",
      icon: <TriangleAlertIcon size={18} className="text-rose-600" />,
    },
    {
      title: "Avg Score",
      value: summary.avgScore === null ? "--" : `${summary.avgScore}%`,
      description: "Across scored rows",
      icon: <ClipboardIcon size={18} className="text-blue-600" />,
    },
  ];

  const handleExportCsv = () => {
    if (!canExport) {
      toast.error("Only HR, Admin, or Instructor can export reports.");
      return;
    }

    if (exportRows.length === 0) {
      toast.info("No records available for export.");
      return;
    }

    downloadPerformanceReportsCsv(exportRows);
    toast.success("CSV export downloaded.");
  };

  const handleExportPdf = async () => {
    if (!canExport) {
      toast.error("Only HR, Admin, or Instructor can export reports.");
      return;
    }

    if (exportRows.length === 0) {
      toast.info("No records available for export.");
      return;
    }

    try {
      setExportingPdf(true);
      await downloadPerformanceReportsPdf({
        rows: exportRows,
        summary,
        organizationName,
        organizationLogoUrl: organizationLogo,
        generatedBy,
      });
      toast.success("PDF report downloaded.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to export PDF report."
      );
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
      <m.div {...getCardMotion(0)}>
        <BentoCard
          hoverable
          title="Performance Reports"
          description="Analyze student and employee performance, visualize outcomes, and export full records."
          icon={<ChartBarIcon size={18} className="text-cyan-600" />}
          action={
            <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
              <button
                onClick={handleExportCsv}
                disabled={!canExport || pageLoading}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ClipboardIcon size={14} />
                Export CSV
              </button>
              <button
                onClick={handleExportPdf}
                disabled={!canExport || pageLoading || exportingPdf}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ChartBarIcon size={14} />
                {exportingPdf ? "Exporting..." : "Export PDF"}
              </button>
            </div>
          }
        >
          {!canExport && (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Export is limited to HR, Admin, or Instructor accounts.
            </p>
          )}
        </BentoCard>
      </m.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card, index) => (
          <m.div key={card.title} {...getCardMotion(index + 1)}>
            <BentoCard
              hoverable
              title={card.title}
              value={card.value}
              description={card.description}
              icon={card.icon}
            />
          </m.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <m.div {...getCardMotion(6)}>
          <BentoCard
            hoverable
            title="Status Distribution"
            description="Current workload split"
          >
            <div className="h-64 sm:h-72">
              <Doughnut
                data={statusChartData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            </div>
          </BentoCard>
        </m.div>

        <m.div {...getCardMotion(7)}>
          <BentoCard
            hoverable
            title="Average Score by Checklist"
            description="Top checklist performance"
          >
            {scoreByChecklistData.labels.length === 0 ? (
              <div className="flex h-72 items-center justify-center text-sm text-slate-500">
                No scored data yet.
              </div>
            ) : (
              <div className="h-64 sm:h-72">
                <Bar
                  data={scoreByChecklistData}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                      },
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
              </div>
            )}
          </BentoCard>
        </m.div>
      </div>

      <m.div {...getCardMotion(8)}>
        <BentoCard
          hoverable
          title="Report Data"
          description="Complete export-ready list of performance entries"
        >
          <DataTable
            data={reportRows}
            columns={reportColumns}
            rowKey={(row) => row.checklistId}
            defaultSort={{ columnId: "dueDate", direction: "asc" }}
            emptyState={
              pageLoading
                ? "Loading report data..."
                : pageError
                  ? "Failed to load report data."
                  : "No report records found."
            }
            onRowClick={(row) => navigate(`/employee-checklists/${row.checklistId}`)}
          />
        </BentoCard>
      </m.div>
    </div>
  );
}
