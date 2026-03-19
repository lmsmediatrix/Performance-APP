import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BentoCard from "../../components/common/BentoCard";
import DataTable, { type DataTableColumn } from "../../components/common/DataTable";
import {
  CheckCheckIcon,
  ClipboardIcon,
  EyeIcon,
  TriangleAlertIcon,
  UsersRoundIcon,
} from "../../components/icons/animate";
import { useCurrentPerformanceUser } from "../../hooks/useCurrentPerformanceUser";
import { useChecklistTemplates } from "../../hooks/useChecklistTemplate";
import { useEmployeeChecklists } from "../../hooks/useEmployeeChecklist";
import type {
  ChecklistStatus,
  ChecklistTemplate,
  EmployeeChecklist,
  OverallStatus,
} from "../../types/performance";

const STATUS_CONFIG: Record<ChecklistStatus, { label: string; color: string; bg: string }> = {
  assigned: {
    label: "Assigned",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
  },
  "in-progress": {
    label: "In Progress",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
  },
  completed: {
    label: "Completed",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
  },
  overdue: {
    label: "Overdue",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
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

interface StudentChecklistRow {
  checklistId: string;
  templateName: string;
  status: ChecklistStatus;
  overallStatus: OverallStatus;
  score: number | null;
  dueDate: Date | null;
  dueDateLabel: string;
  assignedDate: Date;
}

export default function StudentDashboardPage() {
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentPerformanceUser();
  const {
    data: checklistsResponse,
    isLoading: isChecklistsLoading,
    isError: isChecklistsError,
  } = useEmployeeChecklists({ page: 1, limit: 1000 });
  const { data: templatesResponse, isLoading: isTemplatesLoading } =
    useChecklistTemplates({ page: 1, limit: 300 });

  const checklists: EmployeeChecklist[] = checklistsResponse?.checklists ?? [];
  const templates: ChecklistTemplate[] = templatesResponse?.templates ?? [];

  const templatesById = useMemo(() => {
    return new Map(templates.map((template) => [template._id, template.name]));
  }, [templates]);

  const myChecklists = useMemo(() => {
    if (!currentUser?.id) return [];
    return checklists.filter(
      (item) => !item.isDeleted && item.employeeId === currentUser.id
    );
  }, [checklists, currentUser?.id]);

  const rows = useMemo<StudentChecklistRow[]>(() => {
    return myChecklists
      .map((checklist) => ({
        checklistId: checklist._id,
        templateName:
          templatesById.get(checklist.checklistTemplateId) ?? "Unknown Template",
        status: checklist.status,
        overallStatus: checklist.overallStatus,
        score: checklist.overallScore ?? null,
        dueDate: checklist.dueDate ? new Date(checklist.dueDate) : null,
        dueDateLabel: checklist.dueDate
          ? new Date(checklist.dueDate).toLocaleDateString()
          : "No due date",
        assignedDate: new Date(checklist.assignedDate),
      }))
      .sort((left, right) => right.assignedDate.getTime() - left.assignedDate.getTime());
  }, [myChecklists, templatesById]);

  const summary = useMemo(() => {
    const total = myChecklists.length;
    const completed = myChecklists.filter((item) => item.status === "completed").length;
    const inProgress = myChecklists.filter((item) => item.status === "in-progress").length;
    const overdue = myChecklists.filter((item) => item.status === "overdue").length;
    const scored = myChecklists.filter((item) => item.overallScore !== undefined);
    const avgScore =
      scored.length > 0
        ? Math.round(
            scored.reduce((sum, item) => sum + Number(item.overallScore ?? 0), 0) /
              scored.length
          )
        : null;

    return { total, completed, inProgress, overdue, avgScore };
  }, [myChecklists]);

  const columns: Array<DataTableColumn<StudentChecklistRow>> = [
    {
      id: "template",
      header: "Checklist",
      accessor: (row) => row.templateName,
      sortable: true,
      filterType: "text",
      filterPlaceholder: "Search checklist",
      minWidth: "240px",
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
    {
      id: "actions",
      header: "Actions",
      accessor: (row) => row.checklistId,
      sortable: false,
      filterType: "none",
      minWidth: "110px",
      className: "text-right",
      headerClassName: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end">
          <button
            onClick={(event) => {
              event.stopPropagation();
              navigate(`/student/checklists/${row.checklistId}`);
            }}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
            title="View details"
          >
            <EyeIcon size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
      <BentoCard
        title="My Performance Dashboard"
        description="Track your checklist progress, latest results, and manager feedback."
        icon={<UsersRoundIcon size={18} className="text-cyan-600" />}
      >
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            {summary.total} checklists
          </span>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
            {summary.inProgress} in progress
          </span>
          <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
            {summary.completed} completed
          </span>
        </div>
      </BentoCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <BentoCard
          title="Total"
          value={summary.total}
          description="My assigned checklists"
          icon={<ClipboardIcon size={18} className="text-blue-600" />}
          hoverable
        />
        <BentoCard
          title="Completed"
          value={summary.completed}
          description="Finished checklists"
          icon={<CheckCheckIcon size={18} className="text-green-600" />}
          hoverable
        />
        <BentoCard
          title="Overdue"
          value={summary.overdue}
          description="Need attention"
          icon={<TriangleAlertIcon size={18} className="text-rose-600" />}
          hoverable
        />
        <BentoCard
          title="Average Score"
          value={summary.avgScore === null ? "--" : `${summary.avgScore}%`}
          description="Across scored checklists"
          icon={<UsersRoundIcon size={18} className="text-cyan-600" />}
          hoverable
        />
      </div>

      <BentoCard
        title="My Recent Checklists"
        description="Open any checklist to view item-by-item grading details."
      >
        <DataTable
          data={rows.slice(0, 10)}
          columns={columns}
          rowKey={(row) => row.checklistId}
          defaultSort={{ columnId: "dueDate", direction: "asc" }}
          emptyState={
            isChecklistsLoading || isTemplatesLoading
              ? "Loading your checklists..."
              : isChecklistsError
                ? "Failed to load your checklists."
                : "No checklist assignments yet."
          }
          onRowClick={(row) => navigate(`/student/checklists/${row.checklistId}`)}
        />
      </BentoCard>
    </div>
  );
}
