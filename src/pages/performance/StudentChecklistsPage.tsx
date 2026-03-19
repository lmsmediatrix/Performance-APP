import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BentoCard from "../../components/common/BentoCard";
import DataTable, { type DataTableColumn } from "../../components/common/DataTable";
import { ClipboardIcon, EyeIcon, TriangleAlertIcon } from "../../components/icons/animate";
import { useCurrentPerformanceUser } from "../../hooks/useCurrentPerformanceUser";
import { useChecklistTemplates } from "../../hooks/useChecklistTemplate";
import { useEmployeeChecklists } from "../../hooks/useEmployeeChecklist";
import type {
  ChecklistStatus,
  ChecklistTemplate,
  EmployeeChecklist,
  OverallStatus,
} from "../../types/performance";

const STATUS_CONFIG: Record<ChecklistStatus, { label: string; dot: string; text: string; bg: string }> =
  {
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

const OVERALL_CONFIG: Record<OverallStatus, { label: string; color: string; bg: string }> = {
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
  isOverdue: boolean;
}

const STATUS_FILTERS: Array<"all" | ChecklistStatus> = [
  "all",
  "assigned",
  "in-progress",
  "completed",
  "overdue",
];

export default function StudentChecklistsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<"all" | ChecklistStatus>("all");
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
      (item) =>
        !item.isDeleted &&
        item.employeeId === currentUser.id &&
        (statusFilter === "all" || item.status === statusFilter)
    );
  }, [checklists, currentUser?.id, statusFilter]);

  const rows = useMemo<StudentChecklistRow[]>(() => {
    return myChecklists.map((checklist) => {
      const dueDate = checklist.dueDate ? new Date(checklist.dueDate) : null;
      return {
        checklistId: checklist._id,
        templateName:
          templatesById.get(checklist.checklistTemplateId) ?? "Unknown Template",
        status: checklist.status,
        overallStatus: checklist.overallStatus,
        score: checklist.overallScore ?? null,
        dueDate,
        dueDateLabel: dueDate ? dueDate.toLocaleDateString() : "No due date",
        isOverdue:
          Boolean(dueDate) &&
          dueDate !== null &&
          dueDate.getTime() < Date.now() &&
          checklist.status !== "completed",
      };
    });
  }, [myChecklists, templatesById]);

  const allMine = useMemo(() => {
    if (!currentUser?.id) return [];
    return checklists.filter((item) => !item.isDeleted && item.employeeId === currentUser.id);
  }, [checklists, currentUser?.id]);

  const counts = {
    all: allMine.length,
    assigned: allMine.filter((item) => item.status === "assigned").length,
    "in-progress": allMine.filter((item) => item.status === "in-progress").length,
    completed: allMine.filter((item) => item.status === "completed").length,
    overdue: allMine.filter((item) => item.status === "overdue").length,
  };

  const columns: Array<DataTableColumn<StudentChecklistRow>> = [
    {
      id: "template",
      header: "Checklist",
      accessor: (row) => row.templateName,
      sortable: true,
      filterType: "text",
      filterPlaceholder: "Search checklist",
      minWidth: "260px",
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
      minWidth: "150px",
      cell: (row) => {
        const config = STATUS_CONFIG[row.status];
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
      filterOptions: (Object.keys(OVERALL_CONFIG) as OverallStatus[]).map((status) => ({
        label: OVERALL_CONFIG[status].label,
        value: status,
      })),
      minWidth: "140px",
      cell: (row) => {
        const config = OVERALL_CONFIG[row.overallStatus];
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.color}`}
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
        title="My Checklists"
        description="View all your assigned checklists and open detailed grading feedback."
        icon={<ClipboardIcon size={18} className="text-blue-600" />}
      >
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            {counts.all} total
          </span>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
            {counts["in-progress"]} in progress
          </span>
          <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
            {counts.overdue} overdue
          </span>
        </div>
      </BentoCard>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((status) => {
          const count = status === "all" ? counts.all : counts[status];
          const active = statusFilter === status;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? status === "all"
                    ? "bg-slate-900 text-white"
                    : status === "completed"
                      ? "bg-green-600 text-white"
                      : status === "overdue"
                        ? "bg-red-600 text-white"
                        : status === "in-progress"
                          ? "bg-amber-500 text-white"
                          : "bg-blue-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {status === "all" ? "All" : STATUS_CONFIG[status].label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs ${
                  active
                    ? "bg-white/20"
                    : "border border-slate-200 bg-white text-slate-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <DataTable
        data={rows}
        columns={columns}
        rowKey={(row) => row.checklistId}
        defaultSort={{ columnId: "dueDate", direction: "asc" }}
        emptyState={
          <div className="flex flex-col items-center gap-2">
            <TriangleAlertIcon size={28} className="text-slate-400" />
            <p className="font-medium text-slate-600">
              {isChecklistsLoading || isTemplatesLoading
                ? "Loading your checklists..."
                : isChecklistsError
                  ? "Failed to load your checklists"
                  : "No checklists found"}
            </p>
          </div>
        }
        onRowClick={(row) => navigate(`/student/checklists/${row.checklistId}`)}
      />
    </div>
  );
}
