import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BentoCard from "../../components/common/BentoCard";
import DataTable, { type DataTableColumn } from "../../components/common/DataTable";
import {
  CheckCheckIcon,
  ClipboardIcon,
  PlusIcon,
  TriangleAlertIcon,
  UsersRoundIcon,
} from "../../components/icons/animate";
import { useChecklistTemplates } from "../../hooks/useChecklistTemplate";
import { useEmployeeChecklists } from "../../hooks/useEmployeeChecklist";
import { useUsers } from "../../hooks/useUser";
import { useAppTheme } from "../../context/AppThemeContext";
import type {
  ChecklistTemplate,
  ChecklistStatus,
  EmployeeChecklist,
  OverallStatus,
} from "../../types/performance";

const STATUS_CONFIG: Record<
  ChecklistStatus,
  { label: string; color: string; bg: string; bar: string }
> = {
  assigned: {
    label: "Assigned",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    bar: "bg-blue-500",
  },
  "in-progress": {
    label: "In Progress",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    bar: "bg-amber-500",
  },
  completed: {
    label: "Completed",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    bar: "bg-green-500",
  },
  overdue: {
    label: "Overdue",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    bar: "bg-red-500",
  },
};

const OVERALL_STATUS_CONFIG: Record<
  OverallStatus,
  { label: string; color: string; bg: string }
> = {
  pass: { label: "Pass", color: "text-green-700", bg: "bg-green-100" },
  fail: { label: "Fail", color: "text-red-700", bg: "bg-red-100" },
  "in-progress": {
    label: "In Progress",
    color: "text-amber-700",
    bg: "bg-amber-100",
  },
  "not-started": {
    label: "Not Started",
    color: "text-slate-700",
    bg: "bg-slate-100",
  },
};

interface AssignmentRow {
  checklistId: string;
  employeeName: string;
  templateName: string;
  status: ChecklistStatus;
  overallStatus: OverallStatus;
  score: number | null;
  dueDate: Date | null;
  dueDateLabel: string;
  initials: string;
}

export default function Dashboard() {
  const {
    data: templatesResponse,
    isLoading: isTemplatesLoading,
    isError: isTemplatesError,
  } = useChecklistTemplates({ page: 1, limit: 200 });
  const {
    data: employeeChecklistsResponse,
    isLoading: isChecklistsLoading,
    isError: isChecklistsError,
  } = useEmployeeChecklists({ page: 1, limit: 500 });
  const { data: lmsUsers = [] } = useUsers();
  const { isDarkMode } = useAppTheme();
  const navigate = useNavigate();

  const employeeDirectory = useMemo(() => {
    const byId = new Map<string, { id: string; name: string }>();

    lmsUsers.forEach((user) => {
      byId.set(user.id, {
        id: user.id,
        name: user.name,
      });
    });

    return byId;
  }, [lmsUsers]);

  const templates: ChecklistTemplate[] = templatesResponse?.templates ?? [];
  const employeeChecklists: EmployeeChecklist[] =
    employeeChecklistsResponse?.checklists ?? [];
  const isDashboardLoading = isTemplatesLoading || isChecklistsLoading;
  const hasDashboardError = isTemplatesError || isChecklistsError;

  const activeTemplates = templates.filter((template) => !template.archive.status && !template.isDeleted);
  const visibleChecklists = employeeChecklists.filter((checklist) => !checklist.isDeleted);

  const totalAssigned = visibleChecklists.length;
  const completed = visibleChecklists.filter((checklist) => checklist.status === "completed").length;
  const overdue = visibleChecklists.filter((checklist) => checklist.status === "overdue").length;
  const inProgress = visibleChecklists.filter((checklist) => checklist.status === "in-progress").length;
  const completionRate = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;
  const remainingAssignments = Math.max(totalAssigned - completed, 0);

  const statusBreakdown = useMemo(
    () =>
      (["assigned", "in-progress", "completed", "overdue"] as ChecklistStatus[]).map((status) => {
        const count = visibleChecklists.filter((checklist) => checklist.status === status).length;
        const percentage = totalAssigned > 0 ? Math.round((count / totalAssigned) * 100) : 0;

        return {
          status,
          count,
          percentage,
          config: STATUS_CONFIG[status],
        };
      }),
    [visibleChecklists, totalAssigned],
  );

  const overallBreakdown = useMemo(() => {
    const passCount = visibleChecklists.filter((checklist) => checklist.overallStatus === "pass").length;
    const failCount = visibleChecklists.filter((checklist) => checklist.overallStatus === "fail").length;
    const notStartedCount = visibleChecklists.filter(
      (checklist) => checklist.overallStatus === "not-started",
    ).length;

    return { passCount, failCount, notStartedCount };
  }, [visibleChecklists, totalAssigned]);

  const recentAssignments = useMemo(() => {
    return [...visibleChecklists]
      .sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      )
      .slice(0, 10);
  }, [visibleChecklists]);

  const assignmentRows = useMemo<AssignmentRow[]>(() => {
    return recentAssignments.map((checklist: EmployeeChecklist) => {
      const employee = employeeDirectory.get(checklist.employeeId);
      const template = templates.find((record) => record._id === checklist.checklistTemplateId);
      const initials = employee
        ? employee.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase()
        : "?";

      return {
        checklistId: checklist._id,
        employeeName: employee?.name ?? checklist.employeeId,
        templateName: template?.name ?? "Unknown Template",
        status: checklist.status,
        overallStatus: checklist.overallStatus,
        score: checklist.overallScore ?? null,
        dueDate: checklist.dueDate ? new Date(checklist.dueDate) : null,
        dueDateLabel: checklist.dueDate
          ? new Date(checklist.dueDate).toLocaleDateString()
          : "No due date",
        initials,
      };
    });
  }, [employeeDirectory, templates, recentAssignments]);

  const columns: Array<DataTableColumn<AssignmentRow>> = [
    {
      id: "employee",
      header: "Employee",
      accessor: (row) => row.employeeName,
      sortable: true,
      filterType: "text",
      filterPlaceholder: "Search employee",
      minWidth: "220px",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-xs font-semibold text-white">
            {row.initials}
          </div>
          <div>
            <p className="font-medium text-slate-900">{row.employeeName}</p>
          </div>
        </div>
      ),
    },
    {
      id: "template",
      header: "Template",
      accessor: (row) => row.templateName,
      sortable: true,
      filterType: "text",
      filterPlaceholder: "Search template",
      minWidth: "220px",
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => row.status,
      sortable: true,
      filterType: "select",
      filterOptions: (Object.keys(STATUS_CONFIG) as ChecklistStatus[]).map((status) => ({
        label: STATUS_CONFIG[status].label,
        value: status,
      })),
      minWidth: "140px",
      cell: (row) => {
        const config = STATUS_CONFIG[row.status];
        return (
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.color}`}
          >
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
      filterOptions: (Object.keys(OVERALL_STATUS_CONFIG) as OverallStatus[]).map((status) => ({
        label: OVERALL_STATUS_CONFIG[status].label,
        value: status,
      })),
      minWidth: "140px",
      cell: (row) => {
        const config = OVERALL_STATUS_CONFIG[row.overallStatus];
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.color}`}
          >
            {config.label}
          </span>
        );
      },
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
      cell: (row) => <span className="text-slate-600">{row.dueDateLabel}</span>,
    },
  ];

  const stats = [
    {
      label: "Active Templates",
      value: activeTemplates.length,
      subtitle: "Live template library",
      icon: ClipboardIcon,
      onClick: () => navigate("/templates"),
      iconTone: "text-blue-700",
      iconBg: "bg-blue-100",
    },
    {
      label: "Total Assignments",
      value: totalAssigned,
      subtitle: "Distributed this cycle",
      icon: UsersRoundIcon,
      onClick: () => navigate("/employee-checklists"),
      iconTone: "text-cyan-700",
      iconBg: "bg-cyan-100",
    },
    {
      label: "Completed",
      value: completed,
      subtitle: `${completionRate}% completion rate`,
      icon: CheckCheckIcon,
      onClick: () => navigate("/employee-checklists"),
      iconTone: "text-emerald-700",
      iconBg: "bg-emerald-100",
    },
    {
      label: "Overdue",
      value: overdue,
      subtitle: "Require escalation",
      icon: TriangleAlertIcon,
      onClick: () => navigate("/employee-checklists"),
      iconTone: "text-rose-700",
      iconBg: "bg-rose-100",
    },
  ];

  const heroCardClass = "xl:col-span-8 border-slate-200/90 bg-white shadow-[0_20px_50px_-36px_rgba(15,23,42,0.38)]";
  const heroTemplateChipClass = isDarkMode
    ? "border-white/20 bg-white/10 text-blue-100"
    : "border-blue-200 bg-white text-blue-700";
  const heroProgressChipClass = isDarkMode
    ? "border-cyan-200/30 bg-cyan-400/10 text-cyan-100"
    : "border-cyan-200 bg-cyan-50 text-cyan-700";
  const heroRiskChipClass = isDarkMode
    ? "border-amber-200/30 bg-amber-400/10 text-amber-100"
    : "border-amber-200 bg-amber-50 text-amber-700";
  const heroCreateButtonClass = isDarkMode
    ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
    : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50";
  const heroAssignButtonClass = isDarkMode
    ? "border-cyan-200/30 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20"
    : "border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100";
  const heroReviewButtonClass = isDarkMode
    ? "border-blue-200/30 bg-blue-500/10 text-blue-100 hover:bg-blue-500/20"
    : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100";
  const surfaceCardClass = isDarkMode
    ? "border-slate-200/90 bg-white"
    : "border-slate-200/90 bg-white";
  const surfaceSoftCardClass = isDarkMode
    ? "border-slate-200/80 bg-white"
    : "border-slate-200/80 bg-white";
  const completionTrackClass = isDarkMode ? "bg-slate-700" : "bg-slate-200";
  const completionFillClass = isDarkMode ? "bg-emerald-400" : "bg-emerald-500";
  const titleTextClass = isDarkMode ? "text-slate-100" : "text-slate-900";
  const mutedTextClass = isDarkMode ? "text-slate-300" : "text-slate-500";
  const subtleBadgeClass = isDarkMode
    ? "border-cyan-300/30 bg-cyan-500/15 text-cyan-100"
    : "border-cyan-200 bg-cyan-50 text-cyan-700";
  const tableCardClass = isDarkMode
    ? "border-slate-200/90 bg-white"
    : "border-slate-200/90 bg-white";
  const tableActionButtonClass = isDarkMode
    ? "border-slate-600 bg-slate-800 text-slate-100 hover:border-slate-500 hover:text-white"
    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900";

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6 [--dash-accent:#2563eb] [--dash-cyan:#06b6d4] [--dash-deep:#020617]">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <BentoCard className={heroCardClass}>
          <div className="space-y-4">
            <div>
              <h2 className={`text-2xl font-semibold tracking-tight ${titleTextClass}`}>Performance Dashboard</h2>
              <p className={`mt-1 text-sm ${mutedTextClass}`}>
                Track template adoption, assignment health, and scoring trends from one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${heroTemplateChipClass}`}>
                {activeTemplates.length} active templates
              </span>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${heroProgressChipClass}`}>
                {inProgress} in progress
              </span>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${heroRiskChipClass}`}>
                {overdue} overdue
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                onClick={() => navigate("/templates")}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${heroCreateButtonClass}`}
              >
                <PlusIcon size={14} />
                Create Template
              </button>
              <button
                onClick={() => navigate("/employee-checklists")}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${heroAssignButtonClass}`}
              >
                <PlusIcon size={14} />
                Assign Checklist
              </button>
              <button
                onClick={() => navigate("/employee-checklists")}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${heroReviewButtonClass}`}
              >
                <PlusIcon size={14} />
                Review Progress
              </button>
            </div>
          </div>
        </BentoCard>

        <BentoCard className={`xl:col-span-4 ${surfaceSoftCardClass}`}>
          <div>
            <h3 className={`text-2xl font-semibold tracking-tight ${titleTextClass}`}>Completion</h3>
            <p className={`mt-1 text-sm ${mutedTextClass}`}>Current assignment completion</p>
          </div>

          <p className={`mt-4 text-5xl font-semibold tracking-tight ${titleTextClass}`}>{completionRate}%</p>
          <div className={`mt-4 h-2 overflow-hidden rounded-full ${completionTrackClass}`}>
            <div
              className={`h-full rounded-full ${completionFillClass}`}
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className={`mt-2 flex items-center justify-between text-xs ${mutedTextClass}`}>
            <span>{completed} completed</span>
            <span>{remainingAssignments} remaining</span>
          </div>
        </BentoCard>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <BentoCard
              key={stat.label}
              onClick={stat.onClick}
              className={
                isDarkMode
                  ? "border-slate-700/80 bg-slate-800/72 shadow-[0_18px_44px_-30px_rgba(15,23,42,0.95)]"
                  : "border-slate-200/90 bg-white"
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${mutedTextClass}`}>
                    {stat.label}
                  </p>
                  <p className={`mt-2 text-3xl font-semibold tracking-tight ${titleTextClass}`}>{stat.value}</p>
                  <p className={`mt-1 text-xs ${mutedTextClass}`}>{stat.subtitle}</p>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                    isDarkMode ? "border-slate-600 bg-slate-700/70" : `border-white/80 ${stat.iconBg}`
                  }`}
                >
                  <Icon size={18} className={isDarkMode ? "text-slate-100" : stat.iconTone} />
                </div>
              </div>
            </BentoCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <BentoCard className={`xl:col-span-5 ${surfaceCardClass}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className={`text-sm font-semibold ${titleTextClass}`}>Status Breakdown</h3>
              <p className={`text-xs ${mutedTextClass}`}>Distribution of assignment stages</p>
            </div>
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                isDarkMode
                  ? "border-slate-600 bg-slate-700/70 text-slate-200"
                  : "border-slate-200 bg-slate-50 text-slate-600"
              }`}
            >
              {totalAssigned} total
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {statusBreakdown.map(({ status, count, percentage, config }) => (
              <div
                key={status}
                className={`rounded-xl border p-3 ${
                  isDarkMode ? "border-slate-700 bg-slate-700/35" : "border-slate-100 bg-slate-50/80"
                }`}
              >
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className={`font-semibold ${config.color}`}>{config.label}</span>
                  <span className={mutedTextClass}>
                    {count} ({percentage}%)
                  </span>
                </div>
                <div className={`h-2 overflow-hidden rounded-full ${isDarkMode ? "bg-slate-700" : "bg-slate-200"}`}>
                  <div
                    className={`h-full rounded-full ${config.bar} transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </BentoCard>

        <BentoCard className={`xl:col-span-7 ${surfaceCardClass}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className={`text-sm font-semibold ${titleTextClass}`}>Operations Deck</h3>
              <p className={`text-xs ${mutedTextClass}`}>High-impact shortcuts and risk visibility</p>
            </div>
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${subtleBadgeClass}`}>
              {overallBreakdown.passCount} passing assignments
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              onClick={() => navigate("/templates")}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                isDarkMode
                  ? "border-slate-600 bg-slate-700/35 hover:bg-slate-700/55"
                  : "border-blue-200 bg-white hover:bg-slate-50"
              }`}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg shadow-sm ${
                  isDarkMode ? "bg-slate-700 text-blue-300" : "bg-white text-blue-700"
                }`}
              >
                <ClipboardIcon size={16} />
              </div>
              <div>
                <p className={`text-sm font-medium ${titleTextClass}`}>Create template</p>
                <p className={`text-xs ${mutedTextClass}`}>Build a reusable assessment flow</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/employee-checklists")}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                isDarkMode
                  ? "border-slate-600 bg-slate-700/35 hover:bg-slate-700/55"
                  : "border-cyan-200 bg-white hover:bg-slate-50"
              }`}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg shadow-sm ${
                  isDarkMode ? "bg-slate-700 text-cyan-300" : "bg-white text-cyan-700"
                }`}
              >
                <UsersRoundIcon size={16} />
              </div>
              <div>
                <p className={`text-sm font-medium ${titleTextClass}`}>Assign checklist</p>
                <p className={`text-xs ${mutedTextClass}`}>Launch employee performance cycle</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/employee-checklists")}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                isDarkMode
                  ? "border-slate-600 bg-slate-700/35 hover:bg-slate-700/55"
                  : "border-amber-200 bg-white hover:bg-slate-50"
              }`}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg shadow-sm ${
                  isDarkMode ? "bg-slate-700 text-amber-300" : "bg-white text-amber-700"
                }`}
              >
                <TriangleAlertIcon size={16} />
              </div>
              <div>
                <p className={`text-sm font-medium ${titleTextClass}`}>Resolve overdue</p>
                <p className={`text-xs ${mutedTextClass}`}>Prioritize assignments at risk</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/reports")}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                isDarkMode
                  ? "border-slate-600 bg-slate-700/35 hover:bg-slate-700/55"
                  : "border-emerald-200 bg-white hover:bg-slate-50"
              }`}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg shadow-sm ${
                  isDarkMode ? "bg-slate-700 text-emerald-300" : "bg-white text-emerald-700"
                }`}
              >
                <CheckCheckIcon size={16} />
              </div>
              <div>
                <p className={`text-sm font-medium ${titleTextClass}`}>Review reports</p>
                <p className={`text-xs ${mutedTextClass}`}>Inspect trends and scoring outcomes</p>
              </div>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className={`rounded-xl border px-3 py-2 ${isDarkMode ? "border-slate-700 bg-slate-700/35" : "border-slate-200 bg-slate-50"}`}>
              <p className={`text-xs ${mutedTextClass}`}>Pass</p>
              <p className={`text-xl font-semibold ${titleTextClass}`}>{overallBreakdown.passCount}</p>
            </div>
            <div className={`rounded-xl border px-3 py-2 ${isDarkMode ? "border-slate-700 bg-slate-700/35" : "border-slate-200 bg-slate-50"}`}>
              <p className={`text-xs ${mutedTextClass}`}>Fail</p>
              <p className={`text-xl font-semibold ${titleTextClass}`}>{overallBreakdown.failCount}</p>
            </div>
            <div className={`rounded-xl border px-3 py-2 ${isDarkMode ? "border-slate-700 bg-slate-700/35" : "border-slate-200 bg-slate-50"}`}>
              <p className={`text-xs ${mutedTextClass}`}>Not Started</p>
              <p className={`text-xl font-semibold ${titleTextClass}`}>{overallBreakdown.notStartedCount}</p>
            </div>
          </div>
        </BentoCard>
      </div>

      <BentoCard className={tableCardClass}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className={`text-base font-semibold ${titleTextClass}`}>Recent Assignments</h2>
            <p className={`text-xs ${mutedTextClass}`}>Sortable table for latest checklist activity</p>
          </div>
          <button
            onClick={() => navigate("/employee-checklists")}
            className={`w-full rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors sm:w-auto ${tableActionButtonClass}`}
          >
            View all
          </button>
        </div>

        <div className="mt-3">
          <DataTable
            data={assignmentRows}
            columns={columns}
            rowKey={(row) => row.checklistId}
            defaultSort={{ columnId: "dueDate", direction: "asc" }}
            emptyState={
              isDashboardLoading
                ? "Loading assignments..."
                : hasDashboardError
                  ? "Failed to load assignments."
                  : "No assignments found."
            }
            onRowClick={(row) => navigate(`/employee-checklists/${row.checklistId}`)}
          />
        </div>
      </BentoCard>
    </div>
  );
}
