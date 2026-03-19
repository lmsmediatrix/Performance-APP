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
  department: string;
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
  const navigate = useNavigate();

  const employeeDirectory = useMemo(() => {
    const byId = new Map<string, { id: string; name: string; department: string }>();

    lmsUsers.forEach((user) => {
      byId.set(user.id, {
        id: user.id,
        name: user.name,
        department: user.department,
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
        department: employee?.department ?? "Unknown",
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

  const departmentFilterOptions = useMemo(
    () =>
      Array.from(new Set(assignmentRows.map((row) => row.department))).map((department) => ({
        label: department,
        value: department.toLowerCase(),
      })),
    [assignmentRows],
  );

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
            <p className="text-xs text-slate-500">{row.department}</p>
          </div>
        </div>
      ),
    },
    {
      id: "department",
      header: "Department",
      accessor: (row) => row.department,
      sortable: true,
      filterType: "select",
      filterOptions: departmentFilterOptions,
      minWidth: "140px",
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
      subtitle: "Ready for assignment",
      icon: ClipboardIcon,
      onClick: () => navigate("/templates"),
      iconTone: "text-blue-600",
    },
    {
      label: "Total Assignments",
      value: totalAssigned,
      subtitle: "Across all employees",
      icon: UsersRoundIcon,
      onClick: () => navigate("/employee-checklists"),
      iconTone: "text-cyan-600",
    },
    {
      label: "Completed",
      value: completed,
      subtitle: `${completionRate}% completion rate`,
      icon: CheckCheckIcon,
      onClick: () => navigate("/employee-checklists"),
      iconTone: "text-green-600",
    },
    {
      label: "Overdue",
      value: overdue,
      subtitle: "Needs action",
      icon: TriangleAlertIcon,
      onClick: () => navigate("/employee-checklists"),
      iconTone: "text-rose-600",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <BentoCard
          className="lg:col-span-8"
          title="Performance Dashboard"
          description="Track template adoption, assignment health, and scoring trends from one place."
        >
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              {activeTemplates.length} active templates
            </span>
            <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700">
              {inProgress} in progress
            </span>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
              {overdue} overdue
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button
              onClick={() => navigate("/templates")}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-700"
            >
              <PlusIcon size={14} />
              Create Template
            </button>
            <button
              onClick={() => navigate("/employee-checklists")}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-700"
            >
              <PlusIcon size={14} />
              Assign Checklist
            </button>
            <button
              onClick={() => navigate("/employee-checklists")}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-700"
            >
              <PlusIcon size={14} />
              Review Progress
            </button>
          </div>
        </BentoCard>

        <BentoCard
          className="lg:col-span-4"
          title="Completion"
          description="Current assignment completion"
          value={`${completionRate}%`}
        >
          <div className="mt-4 space-y-2">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{completed} completed</span>
              <span>{totalAssigned - completed} remaining</span>
            </div>
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
              title={stat.label}
              value={stat.value}
              description={stat.subtitle}
              icon={<Icon size={18} className={stat.iconTone} />}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <BentoCard className="lg:col-span-5" title="Status Breakdown">
          <div className="space-y-3 pt-1">
            {(["assigned", "in-progress", "completed", "overdue"] as ChecklistStatus[]).map(
              (status) => {
                const count = visibleChecklists.filter((checklist) => checklist.status === status).length;
                const pct = totalAssigned > 0 ? Math.round((count / totalAssigned) * 100) : 0;
                const config = STATUS_CONFIG[status];

                return (
                  <div key={status}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className={`font-medium ${config.color}`}>{config.label}</span>
                      <span className="text-slate-500">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${config.bar} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </BentoCard>

        <BentoCard className="lg:col-span-7" title="Quick Actions">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              onClick={() => navigate("/templates")}
              className="flex items-center gap-3 rounded-xl border border-dashed border-blue-200 bg-blue-50/60 p-3 text-left transition-colors hover:bg-blue-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-600">
                <ClipboardIcon size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Create template</p>
                <p className="text-xs text-slate-500">Add a new checklist structure</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/employee-checklists")}
              className="flex items-center gap-3 rounded-xl border border-dashed border-cyan-200 bg-cyan-50/60 p-3 text-left transition-colors hover:bg-cyan-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-cyan-600">
                <UsersRoundIcon size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Assign checklist</p>
                <p className="text-xs text-slate-500">Start a new employee review</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/employee-checklists")}
              className="flex items-center gap-3 rounded-xl border border-dashed border-amber-200 bg-amber-50/60 p-3 text-left transition-colors hover:bg-amber-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-amber-600">
                <TriangleAlertIcon size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Resolve overdue</p>
                <p className="text-xs text-slate-500">Follow up pending evaluations</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/employee-checklists")}
              className="flex items-center gap-3 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/60 p-3 text-left transition-colors hover:bg-emerald-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-emerald-600">
                <CheckCheckIcon size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Review completed</p>
                <p className="text-xs text-slate-500">Analyze completed checklists</p>
              </div>
            </button>
          </div>
        </BentoCard>
      </div>

      <div className="space-y-2">
        <div className="flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Recent Assignments</h2>
            <p className="text-xs text-slate-500">Reusable datatable with column sort and filters</p>
          </div>
          <button
            onClick={() => navigate("/employee-checklists")}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900 sm:w-auto"
          >
            View all
          </button>
        </div>

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
    </div>
  );
}
