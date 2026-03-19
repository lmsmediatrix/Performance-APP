import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineDownload,
  HiOutlineSave,
  HiOutlineXCircle,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { downloadEmployeePerformancePdf } from "../../lib/employeePerformancePdf";
import { useChecklistTemplates } from "../../hooks/useChecklistTemplate";
import {
  useEmployeeChecklistById,
  useUpdateEmployeeChecklist,
} from "../../hooks/useEmployeeChecklist";
import { useUsers } from "../../hooks/useUser";
import UserService from "../../services/userApi";
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

const STATUS_CONFIG: Record<
  ChecklistStatus,
  { label: string; color: string; bg: string }
> = {
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

export default function EmployeeChecklistDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: currentUser } = useQuery({
    queryKey: ["user", "current", "report-branding"],
    queryFn: () => UserService.getCurrentUser(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: checklistResponse, isLoading, isError } =
    useEmployeeChecklistById(id);
  const { data: templatesResponse } = useChecklistTemplates({
    page: 1,
    limit: 200,
  });
  const { data: lmsUsers = [] } = useUsers();
  const updateEmployeeChecklist = useUpdateEmployeeChecklist();

  const checklist: EmployeeChecklist | undefined =
    checklistResponse?.data ?? checklistResponse?.checklist ?? checklistResponse;
  const templates: ChecklistTemplate[] = templatesResponse?.templates ?? [];

  const [feedback, setFeedback] = useState("");
  const [itemValues, setItemValues] = useState<
    Record<
      string,
      { actualValue?: string; isMet?: boolean; managerNotes?: string }
    >
  >({});
  const [saving, setSaving] = useState(false);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);

  useEffect(() => {
    if (checklist) {
      setFeedback(checklist.managerFeedback ?? "");
      setItemValues({});
    }
  }, [checklist?._id, checklist?.managerFeedback]);

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

  const organizationName = useMemo(() => {
    const source =
      currentUser?.user && typeof currentUser.user === "object"
        ? currentUser.user
        : currentUser;

    return (
      source?.organization?.name ??
      source?.org?.name ??
      source?.organizationName ??
      "Organization"
    );
  }, [currentUser]);

  const organizationLogo = useMemo(() => {
    const source =
      currentUser?.user && typeof currentUser.user === "object"
        ? currentUser.user
        : currentUser;

    return (
      source?.organization?.branding?.logo ??
      source?.organization?.logo ??
      source?.org?.branding?.logo ??
      source?.org?.logo ??
      ""
    );
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Loading checklist...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Failed to load checklist.</p>
        <button
          onClick={() => navigate("/employee-checklists")}
          className="mt-3 text-blue-600 text-sm hover:underline"
        >
          Back to Employee Checklists
        </button>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Checklist not found.</p>
        <button
          onClick={() => navigate("/employee-checklists")}
          className="mt-3 text-blue-600 text-sm hover:underline"
        >
          Back to Employee Checklists
        </button>
      </div>
    );
  }

  const employee = employeeDirectory.get(checklist.employeeId);
  const template = templates.find((t) => t._id === checklist.checklistTemplateId);
  const statusCfg = STATUS_CONFIG[checklist.status] ?? STATUS_CONFIG.assigned;
  const overallCfg =
    OVERALL_STATUS_CONFIG[checklist.overallStatus] ??
    OVERALL_STATUS_CONFIG["not-started"];
  const initials =
    employee?.name
      .split(" ")
      .map((value) => value[0])
      .join("")
      .toUpperCase() ?? "?";
  const isOverdue =
    Boolean(checklist.dueDate) &&
    checklist.status !== "completed" &&
    new Date(checklist.dueDate as string) < new Date();

  const handleValueChange = (
    itemId: string,
    field: "actualValue" | "isMet" | "managerNotes",
    value: string | boolean
  ) => {
    setItemValues((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedItems = checklist.items.map((item) => {
        const changes = itemValues[item.checklistItemId];
        if (!changes) {
          return item;
        }

        const nextItem: EmployeeChecklistItem = { ...item };
        if (changes.actualValue !== undefined) {
          if (item.itemType === "quantitative") {
            const numeric = Number(changes.actualValue);
            nextItem.actualValue =
              changes.actualValue === "" || !Number.isFinite(numeric)
                ? undefined
                : numeric;
          } else {
            nextItem.actualValue =
              changes.actualValue.trim() === "" ? undefined : changes.actualValue;
          }
        }
        if (changes.isMet !== undefined) {
          nextItem.isMet = changes.isMet;
        }
        if (changes.managerNotes !== undefined) {
          nextItem.managerNotes = changes.managerNotes;
        }

        return nextItem;
      });

      await updateEmployeeChecklist.mutateAsync({
        _id: checklist._id,
        managerFeedback: feedback,
        items: updatedItems,
      });

      setItemValues({});
      toast.success("Checklist saved and scores recalculated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save checklist"
      );
    } finally {
      setSaving(false);
    }
  };

  const getDisplayActualValue = (item: EmployeeChecklistItem) => {
    const changed = itemValues[item.checklistItemId]?.actualValue;
    if (changed !== undefined) {
      return changed;
    }
    return item.actualValue !== undefined && item.actualValue !== null
      ? String(item.actualValue)
      : "";
  };

  const getDisplayIsMet = (item: EmployeeChecklistItem) => {
    const changed = itemValues[item.checklistItemId]?.isMet;
    return changed !== undefined ? changed : (item.isMet ?? false);
  };

  const getDisplayNotes = (item: EmployeeChecklistItem) => {
    const changed = itemValues[item.checklistItemId]?.managerNotes;
    return changed !== undefined ? changed : (item.managerNotes ?? "");
  };

  const getExportIsMet = (item: EmployeeChecklistItem) => {
    const changed = itemValues[item.checklistItemId]?.isMet;
    return changed !== undefined ? changed : item.isMet;
  };

  const hasUnsavedChanges =
    Object.keys(itemValues).length > 0 ||
    feedback !== (checklist.managerFeedback ?? "");

  const completedItems = checklist.items.filter(hasItemValue).length;
  const totalItems = checklist.items.length;
  const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const handleDownloadReport = async () => {
    try {
      setIsDownloadingReport(true);

      await downloadEmployeePerformancePdf({
        organizationName,
        organizationLogoUrl: organizationLogo,
        employeeName: employee?.name ?? "Unknown Employee",
        employeeRole: employee?.position ?? "Employee",
        checklistName: template?.name ?? "Untitled Checklist",
        statusLabel: statusCfg.label,
        overallStatusLabel: overallCfg.label,
        overallScore: checklist.overallScore,
        assignedDate: checklist.assignedDate,
        dueDate: checklist.dueDate,
        completedItems,
        totalItems,
        progressPct,
        managerFeedback: feedback,
        reportItems: checklist.items.map((item, index) => ({
          index: index + 1,
          item,
          actualValueDisplay: getDisplayActualValue(item),
          isMetValue: getExportIsMet(item),
          managerNotesDisplay: getDisplayNotes(item),
        })),
      });

      toast.success("Performance report downloaded");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate report"
      );
    } finally {
      setIsDownloadingReport(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6">
      <button
        onClick={() => navigate("/employee-checklists")}
        className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-blue-600"
      >
        <HiOutlineArrowLeft /> Back to Employee Checklists
      </button>

      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex items-start gap-4">
            <div className="flex size-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-violet-500 text-lg font-bold text-white">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {employee?.name ?? "Unknown Employee"}
              </h1>
              <p className="text-sm text-gray-500">{employee?.position ?? "Employee"}</p>
              <p className="mt-1 text-sm text-gray-400">
                {template?.name ?? "Unknown Template"}
              </p>
            </div>
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
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Assigned
            </p>
            <p className="mt-0.5 text-sm font-medium text-gray-700">
              {new Date(checklist.assignedDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Due Date
            </p>
            <p
              className={`mt-0.5 text-sm font-medium ${
                isOverdue ? "text-red-600" : "text-gray-700"
              }`}
            >
              {checklist.dueDate
                ? new Date(checklist.dueDate).toLocaleDateString()
                : "--"}
            </p>
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
              {checklist.overallScore !== undefined
                ? `${checklist.overallScore}%`
                : "--"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Progress
            </p>
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
          <h2 className="font-semibold text-gray-900">Checklist Items</h2>
          <p className="mt-0.5 text-xs text-gray-400">
            Enter actual values for each item. Save to recalculate scores.
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {checklist.items.map((item, idx) => {
            const typeCfg = ITEM_TYPE_CONFIG[item.itemType];
            const displayActual = getDisplayActualValue(item);
            const displayIsMet = getDisplayIsMet(item);
            const displayNotes = getDisplayNotes(item);
            const quantitativeRule = item.quantitativeRule ?? "percentage";
            const actualNumber = displayActual !== "" ? Number(displayActual) : null;
            const targetNumber =
              item.targetValue !== undefined ? Number(item.targetValue) : null;
            const thresholdNumber =
              item.threshold !== undefined ? Number(item.threshold) : null;

            const previewPercentage =
              actualNumber !== null &&
              Number.isFinite(actualNumber) &&
              targetNumber !== null &&
              Number.isFinite(targetNumber) &&
              targetNumber > 0
                ? Math.round((actualNumber / targetNumber) * 100)
                : null;

            const previewIsMet =
              actualNumber !== null &&
              Number.isFinite(actualNumber) &&
              thresholdNumber !== null &&
              Number.isFinite(thresholdNumber)
                ? quantitativeRule === "actual"
                  ? actualNumber >= thresholdNumber
                  : previewPercentage !== null
                    ? previewPercentage >= thresholdNumber
                    : null
                : null;
            const previewValueLabel =
              quantitativeRule === "actual"
                ? actualNumber !== null && Number.isFinite(actualNumber)
                  ? `${actualNumber}${item.unit ?? ""}`
                  : null
                : previewPercentage !== null
                  ? `${previewPercentage}%`
                  : null;
            const hasCurrentActualValue =
              item.actualValue !== undefined &&
              item.actualValue !== null &&
              item.actualValue !== "";
            const currentSnapshotLabel =
              hasCurrentActualValue
                ? quantitativeRule === "actual"
                  ? `${item.actualValue}${item.unit ?? ""}`
                  : item.calculatedPercentage !== undefined
                    ? `${item.calculatedPercentage}%`
                    : `${item.actualValue}${item.unit ?? ""}`
                : null;

            return (
              <div key={item.checklistItemId} className="p-4 sm:p-6">
                <div className="mb-4 flex items-start gap-3">
                  <span className="mt-0.5 flex size-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${typeCfg.bg} ${typeCfg.color}`}
                      >
                        {typeCfg.label}
                      </span>
                      {hasItemValue(item) &&
                        (item.isMet ? (
                          <HiOutlineCheckCircle className="text-base text-green-500" />
                        ) : item.isMet === false ? (
                          <HiOutlineXCircle className="text-base text-red-500" />
                        ) : null)}
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
                            Min threshold:{" "}
                            <span className="font-medium text-gray-700">
                              {item.threshold}
                              {item.unit ?? ""}
                            </span>
                            <span className="ml-1 text-gray-400">
                              (
                              {quantitativeRule === "actual"
                                ? "actual value"
                                : "percentage"}
                              )
                            </span>
                          </span>
                        )}
                        <span>
                          Weight:{" "}
                          <span className="font-medium text-gray-700">{item.weight}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-0 grid grid-cols-1 gap-4 sm:ml-10 sm:grid-cols-2">
                  <div>
                    {item.itemType === "quantitative" && (
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-600">
                          Actual Value {item.unit ? `(${item.unit})` : ""}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={displayActual}
                            onChange={(event) =>
                              handleValueChange(
                                item.checklistItemId,
                                "actualValue",
                                event.target.value
                              )
                            }
                            placeholder="Enter actual value"
                            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {displayActual && (
                            <div className="text-right">
                              {previewValueLabel !== null && (
                                <p className="text-xs font-medium text-gray-700">
                                  {previewValueLabel}
                                </p>
                              )}
                              {previewIsMet !== null && (
                                <p
                                  className={`text-xs ${
                                    previewIsMet ? "text-green-600" : "text-red-600"
                                  }`}
                                >
                                  {previewIsMet ? "Met" : "Not met"}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        {currentSnapshotLabel !== null &&
                          itemValues[item.checklistItemId]?.actualValue === undefined && (
                            <p className="mt-1 text-xs text-gray-400">
                              Current: {currentSnapshotLabel} (
                              {item.isMet === true
                                ? "Met"
                                : item.isMet === false
                                  ? "Not met"
                                  : "Pending"}
                              )
                            </p>
                          )}
                      </div>
                    )}

                    {item.itemType === "qualitative" && (
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-600">
                          Assessment / Rating
                        </label>
                        <input
                          type="text"
                          value={displayActual}
                          onChange={(event) =>
                            handleValueChange(
                              item.checklistItemId,
                              "actualValue",
                              event.target.value
                            )
                          }
                          placeholder="e.g. Excellent, Good, Needs Improvement"
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="mt-2 flex items-center gap-2">
                          <label className="text-xs font-medium text-gray-600">
                            Criteria Met?
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              handleValueChange(
                                item.checklistItemId,
                                "isMet",
                                !displayIsMet
                              )
                            }
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              displayIsMet ? "bg-green-500" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`inline-block size-3.5 rounded-full bg-white shadow transition-transform ${
                                displayIsMet ? "translate-x-4" : "translate-x-0.5"
                              }`}
                            />
                          </button>
                          <span
                            className={`text-xs font-medium ${
                              displayIsMet ? "text-green-600" : "text-gray-500"
                            }`}
                          >
                            {displayIsMet ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    )}

                    {item.itemType === "certification" && (
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-600">
                          Certification Status
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleValueChange(item.checklistItemId, "isMet", true)
                            }
                            className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                              displayIsMet
                                ? "border-green-300 bg-green-50 text-green-700"
                                : "border-gray-200 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            Passed
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleValueChange(item.checklistItemId, "isMet", false)
                            }
                            className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                              displayIsMet === false
                                ? "border-red-300 bg-red-50 text-red-700"
                                : "border-gray-200 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            Not Passed
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                      Manager Notes
                    </label>
                    <textarea
                      value={displayNotes}
                      onChange={(event) =>
                        handleValueChange(
                          item.checklistItemId,
                          "managerNotes",
                          event.target.value
                        )
                      }
                      placeholder="Optional notes for this item..."
                      rows={3}
                      className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <h2 className="mb-1.5 font-semibold text-gray-900">Manager Feedback</h2>
        <p className="mb-3 text-xs text-gray-400">
          Overall feedback and comments for this employee's performance review.
        </p>
        <textarea
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
          placeholder="Write your overall feedback for this performance review..."
          rows={4}
          className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {hasUnsavedChanges ? (
            <p className="text-sm font-medium text-amber-600">
              You have unsaved changes
            </p>
          ) : (
            <p className="text-sm text-gray-400">All changes saved</p>
          )}
        </div>
        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
          <button
            onClick={handleDownloadReport}
            disabled={isDownloadingReport}
            className="flex items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <HiOutlineDownload className="text-base" />
            {isDownloadingReport ? "Generating PDF..." : "Download PDF Report"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            className={`flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
              hasUnsavedChanges
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "cursor-default bg-gray-100 text-gray-500"
            }`}
          >
            <HiOutlineSave className="text-base" />
            {saving ? "Saving..." : "Save & Recalculate"}
          </button>
        </div>
      </div>
    </div>
  );
}
