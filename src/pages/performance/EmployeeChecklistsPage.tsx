import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { HiCheck, HiOutlineArchive, HiOutlineChevronDown, HiX } from "react-icons/hi";
import { toast } from "react-toastify";
import BentoCard from "../../components/common/BentoCard";
import DataTable, { type DataTableColumn } from "../../components/common/DataTable";
import {
  EyeIcon,
  PlusIcon,
  TriangleAlertIcon,
  UsersRoundIcon,
} from "../../components/icons/animate";
import { useChecklistTemplates } from "../../hooks/useChecklistTemplate";
import {
  useArchiveEmployeeChecklist,
  useCreateEmployeeChecklist,
  useEmployeeChecklists,
} from "../../hooks/useEmployeeChecklist";
import { useUsers } from "../../hooks/useUser";
import type {
  ChecklistTemplate,
  ChecklistStatus,
  EmployeeChecklist,
  OverallStatus,
} from "../../types/performance";

interface AssignForm {
  employeeId: string;
  checklistTemplateId: string;
  dueDate: string;
}

interface EmployeeChecklistRow {
  checklistId: string;
  employeeName: string;
  position: string;
  templateName: string;
  itemCount: number;
  status: ChecklistStatus;
  overallStatus: OverallStatus;
  score: number | null;
  dueDate: Date | null;
  dueDateLabel: string;
  isOverdue: boolean;
  initials: string;
}

const STATUS_CONFIG: Record<
  ChecklistStatus,
  { label: string; dot: string; text: string; bg: string }
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

const ALL_STATUSES: Array<"all" | ChecklistStatus> = [
  "all",
  "assigned",
  "in-progress",
  "completed",
  "overdue",
];

export default function EmployeeChecklistsPage() {
  const navigate = useNavigate();
  const { data: lmsUsers = [], isLoading: isUsersLoading } = useUsers();
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
  const createEmployeeChecklist = useCreateEmployeeChecklist();
  const archiveEmployeeChecklistMutation = useArchiveEmployeeChecklist();

  const [statusFilter, setStatusFilter] = useState<"all" | ChecklistStatus>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmployeePickerOpen, setIsEmployeePickerOpen] = useState(false);
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [templateSearch, setTemplateSearch] = useState("");
  const employeePickerRef = useRef<HTMLDivElement | null>(null);
  const templatePickerRef = useRef<HTMLDivElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    clearErrors,
    formState: { errors },
    reset,
  } = useForm<AssignForm>();
  const selectedEmployeeId = watch("employeeId");
  const selectedTemplateId = watch("checklistTemplateId");

  const templates: ChecklistTemplate[] = templatesResponse?.templates ?? [];
  const employeeChecklists: EmployeeChecklist[] =
    employeeChecklistsResponse?.checklists ?? [];

  const employeeDirectory = useMemo(() => {
    const byId = new Map<string, { id: string; name: string; position: string }>();

    lmsUsers.forEach((user) => {
      byId.set(user.id, {
        id: user.id,
        name: user.name,
        position: user.position,
      });
    });

    return byId;
  }, [lmsUsers]);

  const employeeOptions = useMemo(
    () => Array.from(employeeDirectory.values()),
    [employeeDirectory]
  );
  const selectedEmployee = useMemo(
    () => employeeOptions.find((employee) => employee.id === selectedEmployeeId),
    [employeeOptions, selectedEmployeeId]
  );
  const filteredEmployeeOptions = useMemo(() => {
    const term = employeeSearch.trim().toLowerCase();
    if (!term) return employeeOptions;

    return employeeOptions.filter((employee) => {
      const name = employee.name.toLowerCase();
      const email =
        "email" in employee && typeof employee.email === "string"
          ? employee.email.toLowerCase()
          : "";

      return name.includes(term) || email.includes(term);
    });
  }, [employeeOptions, employeeSearch]);

  const activeTemplates = templates.filter((template) => !template.archive.status && !template.isDeleted);
  const selectedTemplate = useMemo(
    () => activeTemplates.find((template) => template._id === selectedTemplateId),
    [activeTemplates, selectedTemplateId]
  );
  const filteredTemplateOptions = useMemo(() => {
    const term = templateSearch.trim().toLowerCase();
    if (!term) return activeTemplates;

    return activeTemplates.filter((template) =>
      template.name.toLowerCase().includes(term)
    );
  }, [activeTemplates, templateSearch]);

  const visibleChecklists = employeeChecklists
    .filter((checklist) => !checklist.isDeleted)
    .filter((checklist) => statusFilter === "all" || checklist.status === statusFilter);

  const rows = useMemo<EmployeeChecklistRow[]>(() => {
    return visibleChecklists.map((checklist: EmployeeChecklist) => {
      const employee = employeeDirectory.get(checklist.employeeId);
      const template = templates.find((record) => record._id === checklist.checklistTemplateId);
      const initials = employee
        ? employee.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase()
        : "?";
      const dueDate = checklist.dueDate ? new Date(checklist.dueDate) : null;

      return {
        checklistId: checklist._id,
        employeeName: employee?.name ?? "Unknown Employee",
        position: employee?.position ?? "",
        templateName: template?.name ?? "Unknown Template",
        itemCount: template?.items.length ?? checklist.items.length,
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
        initials,
      };
    });
  }, [visibleChecklists, employeeDirectory, templates]);

  const counts = {
    all: employeeChecklists.filter((checklist) => !checklist.isDeleted).length,
    assigned: employeeChecklists.filter((checklist) => checklist.status === "assigned").length,
    "in-progress": employeeChecklists.filter((checklist) => checklist.status === "in-progress").length,
    completed: employeeChecklists.filter((checklist) => checklist.status === "completed").length,
    overdue: employeeChecklists.filter((checklist) => checklist.status === "overdue").length,
  };
  const isPageLoading = isTemplatesLoading || isChecklistsLoading;
  const hasPageError = isTemplatesError || isChecklistsError;

  const columns: Array<DataTableColumn<EmployeeChecklistRow>> = [
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
            {row.position && <p className="text-xs text-slate-500">{row.position}</p>}
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
      cell: (row) => (
        <div>
          <p className="font-medium text-slate-800">{row.templateName}</p>
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
      minWidth: "130px",
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
          <button
            onClick={async (event) => {
              event.stopPropagation();
              try {
                await archiveEmployeeChecklistMutation.mutateAsync(row.checklistId);
                toast.success("Checklist archived");
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Failed to archive checklist"
                );
              }
            }}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            title="Archive"
          >
            <HiOutlineArchive className="text-base" />
          </button>
        </div>
      ),
    },
  ];

  const onAssign = async (data: AssignForm) => {
    try {
      await createEmployeeChecklist.mutateAsync({
        employeeId: data.employeeId,
        checklistTemplateId: data.checklistTemplateId,
        dueDate: data.dueDate || undefined,
      });
      toast.success("Checklist assigned successfully");
      setIsModalOpen(false);
      reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to assign checklist"
      );
    }
  };

  useEffect(() => {
    if (!isModalOpen) {
      setIsEmployeePickerOpen(false);
      setIsTemplatePickerOpen(false);
      setEmployeeSearch("");
      setTemplateSearch("");
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (!isEmployeePickerOpen && !isTemplatePickerOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        employeePickerRef.current &&
        !employeePickerRef.current.contains(target)
      ) {
        setIsEmployeePickerOpen(false);
      }

      if (
        templatePickerRef.current &&
        !templatePickerRef.current.contains(target)
      ) {
        setIsTemplatePickerOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsEmployeePickerOpen(false);
        setIsTemplatePickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isEmployeePickerOpen, isTemplatePickerOpen]);

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
      <BentoCard
        title="Employee Checklists"
        description="Manage assignments, monitor status, and track outcomes with reusable datatable controls."
        icon={<UsersRoundIcon size={18} className="text-cyan-600" />}
        action={
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto"
          >
            <PlusIcon size={15} />
            Assign Checklist
          </button>
        }
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
        {ALL_STATUSES.map((status) => {
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
              {isPageLoading
                ? "Loading employee checklists..."
                : hasPageError
                  ? "Failed to load checklists"
                  : "No checklists found"}
            </p>
            <p className="text-xs text-slate-400">
              {isPageLoading
                ? "Please wait while we fetch checklist data."
                : hasPageError
                  ? "Try refreshing the page."
                  : "Try a different status tab or create a new assignment."}
            </p>
          </div>
        }
        onRowClick={(row) => navigate(`/employee-checklists/${row.checklistId}`)}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsModalOpen(false)} />
          <div className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Assign Checklist</h2>
                <p className="mt-0.5 text-xs text-slate-500">Assign a performance checklist to an employee</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <HiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onAssign)} className="space-y-4 overflow-y-auto p-4 sm:p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Employee <span className="text-red-500">*</span>
                </label>
                <input
                  type="hidden"
                  {...register("employeeId", { required: "Please select an employee" })}
                />
                <div ref={employeePickerRef} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsTemplatePickerOpen(false);
                      setIsEmployeePickerOpen((current) => {
                        const next = !current;
                        if (next) {
                          setEmployeeSearch("");
                        }
                        return next;
                      });
                    }}
                    className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-haspopup="listbox"
                    aria-expanded={isEmployeePickerOpen}
                  >
                    <span className={selectedEmployee ? "text-slate-900" : "text-slate-500"}>
                      {selectedEmployee?.name ?? "Select employee"}
                    </span>
                    <HiOutlineChevronDown
                      className={`text-slate-400 transition-transform ${
                        isEmployeePickerOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isEmployeePickerOpen && (
                    <div className="absolute z-30 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
                      <div className="border-b border-slate-100 p-2">
                        <input
                          type="text"
                          value={employeeSearch}
                          autoFocus
                          onChange={(event) => setEmployeeSearch(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Escape") {
                              setIsEmployeePickerOpen(false);
                            }
                          }}
                          placeholder="Search employee name"
                          className="w-full rounded-md border border-slate-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="max-h-56 overflow-y-auto py-1" role="listbox">
                        {isUsersLoading && (
                          <p className="px-3 py-2 text-sm text-slate-500">Loading employees...</p>
                        )}
                        {!isUsersLoading && filteredEmployeeOptions.length === 0 && (
                          <p className="px-3 py-2 text-sm text-slate-500">No employee found</p>
                        )}
                        {!isUsersLoading &&
                          filteredEmployeeOptions.map((employee) => {
                            const isSelected = selectedEmployeeId === employee.id;
                            return (
                              <button
                                key={employee.id}
                                type="button"
                                onClick={() => {
                                  setValue("employeeId", employee.id, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  });
                                  clearErrors("employeeId");
                                  setEmployeeSearch("");
                                  setIsEmployeePickerOpen(false);
                                }}
                                className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                                  isSelected
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-slate-700 hover:bg-slate-50"
                                }`}
                                role="option"
                                aria-selected={isSelected}
                              >
                                {employee.name}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
                {errors.employeeId && (
                  <p className="mt-1 text-xs text-red-500">{errors.employeeId.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Checklist Template <span className="text-red-500">*</span>
                </label>
                <input
                  type="hidden"
                  {...register("checklistTemplateId", {
                    required: "Please select a template",
                  })}
                />
                <div ref={templatePickerRef} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEmployeePickerOpen(false);
                      setIsTemplatePickerOpen((current) => {
                        const next = !current;
                        if (next) {
                          setTemplateSearch("");
                        }
                        return next;
                      });
                    }}
                    className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-haspopup="listbox"
                    aria-expanded={isTemplatePickerOpen}
                  >
                    <span className={selectedTemplate ? "text-slate-900" : "text-slate-500"}>
                      {selectedTemplate
                        ? `${selectedTemplate.name} (${selectedTemplate.items.length} items)`
                        : "Select template"}
                    </span>
                    <HiOutlineChevronDown
                      className={`text-slate-400 transition-transform ${
                        isTemplatePickerOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isTemplatePickerOpen && (
                    <div className="absolute z-30 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
                      <div className="border-b border-slate-100 p-2">
                        <input
                          type="text"
                          value={templateSearch}
                          autoFocus
                          onChange={(event) => setTemplateSearch(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Escape") {
                              setIsTemplatePickerOpen(false);
                            }
                          }}
                          placeholder="Search template name"
                          className="w-full rounded-md border border-slate-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="max-h-56 overflow-y-auto py-1" role="listbox">
                        {isTemplatesLoading && (
                          <p className="px-3 py-2 text-sm text-slate-500">Loading templates...</p>
                        )}
                        {!isTemplatesLoading && filteredTemplateOptions.length === 0 && (
                          <p className="px-3 py-2 text-sm text-slate-500">No template found</p>
                        )}
                        {!isTemplatesLoading &&
                          filteredTemplateOptions.map((template) => {
                            const isSelected = selectedTemplateId === template._id;
                            return (
                              <button
                                key={template._id}
                                type="button"
                                onClick={() => {
                                  setValue("checklistTemplateId", template._id, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  });
                                  clearErrors("checklistTemplateId");
                                  setTemplateSearch("");
                                  setIsTemplatePickerOpen(false);
                                }}
                                className={`flex w-full items-start justify-between px-3 py-2 text-left text-sm transition-colors ${
                                  isSelected
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-slate-700 hover:bg-slate-50"
                                }`}
                                role="option"
                                aria-selected={isSelected}
                              >
                                <span>
                                  <span className="block font-medium">{template.name}</span>
                                  <span className="block text-xs text-slate-500">
                                    {template.items.length} items
                                  </span>
                                </span>
                                {isSelected && <HiCheck className="mt-0.5 text-sm" />}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
                {errors.checklistTemplateId && (
                  <p className="mt-1 text-xs text-red-500">{errors.checklistTemplateId.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Due Date</label>
                <input
                  type="date"
                  {...register("dueDate")}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-slate-400">Optional. Leave blank for no deadline.</p>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    reset();
                  }}
                  className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Assign Checklist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

