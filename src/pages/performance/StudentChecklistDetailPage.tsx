import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi";
import {
  useEmployeeChecklistById,
} from "../../hooks/useEmployeeChecklist";
import { useChecklistTemplates } from "../../hooks/useChecklistTemplate";
import { useCurrentPerformanceUser } from "../../hooks/useCurrentPerformanceUser";
import type {
  ChecklistTemplate,
  ChecklistStatus,
  EmployeeChecklist,
  EmployeeChecklistItem,
  ItemType,
  OverallStatus,
} from "../../types/performance";

const ITEM_TYPE_CONFIG: Record<ItemType, { label: string; color: string; bg: string }> = {
  quantitative: {
    label: "Quantitative",
    color: "text-indigo-700",
    bg: "bg-indigo-50 border-indigo-100",
  },
  qualitative: {
    label: "Qualitative",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-100",
  },
  certification: {
    label: "Certification",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-100",
  },
};

const OVERALL_STATUS_CONFIG: Record<
  OverallStatus,
  { label: string; color: string; bg: string; ring: string }
> = {
  pass: {
    label: "Pass",
    color: "text-green-700",
    bg: "bg-green-100",
    ring: "ring-green-200",
  },
  fail: {
    label: "Fail",
    color: "text-red-700",
    bg: "bg-red-100",
    ring: "ring-red-200",
  },
  "in-progress": {
    label: "In Progress",
    color: "text-amber-700",
    bg: "bg-amber-100",
    ring: "ring-amber-200",
  },
  "not-started": {
    label: "Not Started",
    color: "text-gray-600",
    bg: "bg-gray-100",
    ring: "ring-gray-200",
  },
};

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

const hasItemValue = (item: EmployeeChecklistItem): boolean =>
  (item.actualValue !== undefined &&
    item.actualValue !== null &&
    item.actualValue !== "") ||
  item.isMet !== undefined;

export default function StudentChecklistDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentPerformanceUser();
  const { data: checklistResponse, isLoading, isError } = useEmployeeChecklistById(id);
  const { data: templatesResponse } = useChecklistTemplates({ page: 1, limit: 300 });

  const checklist: EmployeeChecklist | undefined =
    checklistResponse?.data ?? checklistResponse?.checklist ?? checklistResponse;
  const templates: ChecklistTemplate[] = templatesResponse?.templates ?? [];

  const template = useMemo(
    () => templates.find((record) => record._id === checklist?.checklistTemplateId),
    [templates, checklist?.checklistTemplateId]
  );

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Loading checklist...</p>
      </div>
    );
  }

  if (isError || !checklist) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Checklist not found.</p>
        <button
          onClick={() => navigate("/student/checklists")}
          className="mt-3 text-sm text-blue-600 hover:underline"
        >
          Back to My Checklists
        </button>
      </div>
    );
  }

  if (currentUser?.id && checklist.employeeId !== currentUser.id) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">You do not have access to this checklist.</p>
        <button
          onClick={() => navigate("/student/checklists")}
          className="mt-3 text-sm text-blue-600 hover:underline"
        >
          Back to My Checklists
        </button>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[checklist.status] ?? STATUS_CONFIG.assigned;
  const overallCfg =
    OVERALL_STATUS_CONFIG[checklist.overallStatus] ?? OVERALL_STATUS_CONFIG["not-started"];
  const assignedDateLabel = new Date(checklist.assignedDate).toLocaleDateString();
  const dueDateLabel = checklist.dueDate
    ? new Date(checklist.dueDate).toLocaleDateString()
    : "--";

  const completedItems = checklist.items.filter(hasItemValue).length;
  const totalItems = checklist.items.length;
  const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6">
      <button
        onClick={() => navigate("/student/checklists")}
        className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-blue-600"
      >
        <HiOutlineArrowLeft /> Back to My Checklists
      </button>

      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {template?.name ?? "Checklist"}
            </h1>
            <p className="text-sm text-gray-500">Performance evaluation details</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${statusCfg.bg} ${statusCfg.color}`}
            >
              {statusCfg.label}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ${overallCfg.bg} ${overallCfg.color} ${overallCfg.ring}`}
            >
              {overallCfg.label}
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 sm:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Assigned</p>
            <p className="mt-0.5 text-sm font-medium text-gray-700">{assignedDateLabel}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Due Date</p>
            <p className="mt-0.5 text-sm font-medium text-gray-700">{dueDateLabel}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Overall Score
            </p>
            <p
              className={`mt-0.5 text-sm font-bold ${
                checklist.overallScore === undefined
                  ? "text-gray-400"
                  : checklist.overallScore >= 70
                    ? "text-green-600"
                    : "text-red-600"
              }`}
            >
              {checklist.overallScore !== undefined ? `${checklist.overallScore}%` : "--"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Progress</p>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-600">
                {completedItems}/{totalItems}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-4 sm:px-6">
          <h2 className="font-semibold text-gray-900">Checklist Item Results</h2>
          <p className="mt-0.5 text-xs text-gray-400">
            Read-only grading details from your manager or instructor.
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {checklist.items.map((item, index) => {
            const typeCfg = ITEM_TYPE_CONFIG[item.itemType];
            const isMet = item.isMet;
            const actualValue =
              item.actualValue !== undefined && item.actualValue !== null
                ? String(item.actualValue)
                : "--";
            const quantitativeRule = item.quantitativeRule ?? "percentage";
            const valueLabel =
              item.itemType === "quantitative" &&
              quantitativeRule === "percentage" &&
              item.calculatedPercentage !== undefined
                ? `${item.calculatedPercentage}%`
                : item.itemType === "quantitative" &&
                    actualValue !== "--" &&
                    item.unit
                  ? `${actualValue}${item.unit}`
                  : actualValue;

            return (
              <div key={item.checklistItemId} className="p-4 sm:p-6">
                <div className="mb-4 flex items-start gap-3">
                  <span className="mt-0.5 flex size-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${typeCfg.bg} ${typeCfg.color}`}
                      >
                        {typeCfg.label}
                      </span>
                      {isMet === true && (
                        <HiOutlineCheckCircle className="text-base text-green-500" />
                      )}
                      {isMet === false && <HiOutlineXCircle className="text-base text-red-500" />}
                    </div>
                    {item.description && (
                      <p className="mt-0.5 text-xs text-gray-500">{item.description}</p>
                    )}

                    {item.itemType === "quantitative" && (
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                        {item.targetValue !== undefined && (
                          <span>
                            Target:{" "}
                            <span className="font-medium text-gray-700">
                              {item.targetValue}
                              {item.unit ?? ""}
                            </span>
                          </span>
                        )}
                        {item.threshold !== undefined && (
                          <span>
                            Threshold:{" "}
                            <span className="font-medium text-gray-700">
                              {item.threshold}
                              {item.unit ?? ""}
                            </span>
                            <span className="ml-1 text-gray-400">
                              ({quantitativeRule === "actual" ? "actual value" : "percentage"})
                            </span>
                          </span>
                        )}
                        <span>
                          Weight: <span className="font-medium text-gray-700">{item.weight}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500">Result</p>
                    <p
                      className={`mt-1 text-sm font-semibold ${
                        isMet === true
                          ? "text-green-600"
                          : isMet === false
                            ? "text-red-600"
                            : "text-gray-500"
                      }`}
                    >
                      {isMet === true ? "Met" : isMet === false ? "Not Met" : "Pending"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Actual</p>
                    <p className="mt-1 text-sm text-gray-700">{valueLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Manager Notes</p>
                    <p className="mt-1 text-sm text-gray-700">{item.managerNotes || "--"}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <h2 className="mb-1.5 font-semibold text-gray-900">Manager Feedback</h2>
        <p className="text-sm text-gray-700">
          {checklist.managerFeedback || "No manager feedback has been added yet."}
        </p>
      </div>
    </div>
  );
}

