import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  HiOutlineArrowLeft,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineArchive,
  HiOutlineUserAdd,
  HiX,
  HiOutlineChevronDown,
  HiCheck,
} from "react-icons/hi";
import { toast } from "react-toastify";
import { createPortal } from "react-dom";
import { InfoCircleIcon } from "../../components/icons/animate";
import {
  useAddChecklistTemplateItem,
  useArchiveChecklistTemplate,
  useChecklistTemplateById,
  useRemoveChecklistTemplateItem,
  useUpdateChecklistTemplate,
  useUpdateChecklistTemplateItem,
} from "../../hooks/useChecklistTemplate";
import type {
  ChecklistTemplate,
  ChecklistItem,
  ItemType,
  DataSource,
  QuantitativeRule,
} from "../../types/performance";

interface ItemForm {
  name: string;
  description: string;
  itemType: ItemType;
  quantitativeRule: QuantitativeRule;
  targetValue: string;
  threshold: string;
  unit: string;
  weight: number;
  dataSource: DataSource;
}

const ITEM_TYPE_COLORS: Record<ItemType, string> = {
  quantitative: "bg-indigo-50 text-indigo-700 border-indigo-100",
  qualitative: "bg-emerald-50 text-emerald-700 border-emerald-100",
  certification: "bg-amber-50 text-amber-700 border-amber-100",
};

const DATA_SOURCE_COLORS: Record<DataSource, string> = {
  manual: "bg-gray-100 text-gray-600",
  lms: "bg-blue-50 text-blue-600",
  api: "bg-violet-50 text-violet-600",
};

const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  quantitative: "Quantitative",
  qualitative: "Qualitative",
  certification: "Certification",
};

const DATA_SOURCE_LABELS: Record<DataSource, string> = {
  manual: "Manual",
  lms: "LMS",
  api: "API",
};

const ITEM_TYPE_OPTIONS: Array<{ value: ItemType; label: string; description: string }> = [
  {
    value: "quantitative",
    label: "Quantitative",
    description: "Numbers, targets, and thresholds.",
  },
  {
    value: "qualitative",
    label: "Qualitative",
    description: "Assessment and criteria toggle.",
  },
  {
    value: "certification",
    label: "Certification",
    description: "Pass or not passed status.",
  },
];

const DATA_SOURCE_OPTIONS: Array<{ value: DataSource; label: string; description: string }> = [
  {
    value: "manual",
    label: "Manual",
    description: "Entered directly by manager.",
  },
  {
    value: "lms",
    label: "LMS",
    description: "Pulled from learning records.",
  },
  {
    value: "api",
    label: "API",
    description: "Synced from external system.",
  },
];

const FIELD_HELP_TEXT = {
  itemType:
    "How this item is scored: Quantitative uses numeric values, Qualitative uses manager assessment + met toggle, Certification uses pass or not passed.",
  dataSource:
    "Where the evidence comes from. Manual = entered by manager, LMS = from learning platform, API = from external integration.",
  targetValue:
    "The goal value for this quantitative item (example: 95%). Actual value is compared against this target.",
  threshold:
    "Minimum requirement to mark this item as met. Can be based on percentage or actual value.",
  unit: "Display suffix for numeric values like %, days, hours, points, or tickets.",
  thresholdBasis:
    "Percentage: checks computed percentage vs threshold. Actual Value: checks raw actual number vs threshold.",
  weight:
    "Impact on final score (allowed range: 1 to 10). Formula: Overall Score = sum(itemScore x weight) / sum(weight). Higher weight means stronger impact.",
} as const;

function TooltipInfo({ text }: { text: string }) {
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const updatePosition = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 256;
    const viewportPadding = 12;

    const centeredLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
    const clampedLeft = Math.min(
      Math.max(centeredLeft, viewportPadding),
      window.innerWidth - tooltipWidth - viewportPadding
    );
    const tooltipTop = Math.max(rect.top - 10, viewportPadding);

    setPosition({ top: tooltipTop, left: clampedLeft });
  };

  useLayoutEffect(() => {
    if (!open) return;

    updatePosition();

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  return (
    <span
      ref={triggerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <InfoCircleIcon
        size={14}
        className={`transition-colors ${
          open ? "text-blue-600" : "text-slate-400"
        }`}
      />
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <span
            className="pointer-events-none fixed z-[99] w-64 rounded-lg bg-slate-900 px-3 py-2 text-[11px] leading-relaxed text-white shadow-lg"
            style={{
              left: position.left,
              top: position.top,
              transform: "translateY(-100%)",
            }}
          >
            {text}
          </span>,
          document.body
        )}
    </span>
  );
}

function LabelWithHelp({
  label,
  helpText,
  required = false,
  small = false,
}: {
  label: string;
  helpText: string;
  required?: boolean;
  small?: boolean;
}) {
  return (
    <label
      className={`mb-1.5 flex items-center gap-1.5 ${
        small
          ? "min-h-[1.5rem] text-xs leading-tight"
          : "min-h-[1.25rem] text-sm"
      } font-medium text-gray-700`}
    >
      <span className={small ? "whitespace-nowrap" : ""}>
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <TooltipInfo text={helpText} />
    </label>
  );
}

export default function ChecklistTemplateDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: templateResponse, isLoading, isError } = useChecklistTemplateById(id);
  const template: ChecklistTemplate | undefined = templateResponse?.data;

  const addItemMutation = useAddChecklistTemplateItem();
  const updateItemMutation = useUpdateChecklistTemplateItem();
  const removeItemMutation = useRemoveChecklistTemplateItem();
  const updateTemplateMutation = useUpdateChecklistTemplate();
  const archiveTemplateMutation = useArchiveChecklistTemplate();

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [editHeader, setEditHeader] = useState(false);
  const [headerName, setHeaderName] = useState("");
  const [headerDesc, setHeaderDesc] = useState("");
  const [isItemTypeDropdownOpen, setIsItemTypeDropdownOpen] = useState(false);
  const [isDataSourceDropdownOpen, setIsDataSourceDropdownOpen] = useState(false);
  const [isWeightDropdownOpen, setIsWeightDropdownOpen] = useState(false);
  const itemTypeDropdownRef = useRef<HTMLDivElement | null>(null);
  const dataSourceDropdownRef = useRef<HTMLDivElement | null>(null);
  const weightDropdownRef = useRef<HTMLDivElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<ItemForm>({
    defaultValues: {
      weight: 1,
      dataSource: "manual",
      itemType: "quantitative",
      quantitativeRule: "percentage",
    },
  });

  const watchedType = watch("itemType");
  const selectedItemType = watch("itemType");
  const selectedDataSource = watch("dataSource");
  const selectedWeight = watch("weight");

  useEffect(() => {
    if (template) {
      setHeaderName(template.name);
      setHeaderDesc(template.description ?? "");
    }
  }, [template]);

  useEffect(() => {
    if (
      !isItemTypeDropdownOpen &&
      !isDataSourceDropdownOpen &&
      !isWeightDropdownOpen
    ) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        itemTypeDropdownRef.current &&
        !itemTypeDropdownRef.current.contains(target)
      ) {
        setIsItemTypeDropdownOpen(false);
      }

      if (
        dataSourceDropdownRef.current &&
        !dataSourceDropdownRef.current.contains(target)
      ) {
        setIsDataSourceDropdownOpen(false);
      }

      if (
        weightDropdownRef.current &&
        !weightDropdownRef.current.contains(target)
      ) {
        setIsWeightDropdownOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsItemTypeDropdownOpen(false);
        setIsDataSourceDropdownOpen(false);
        setIsWeightDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isItemTypeDropdownOpen, isDataSourceDropdownOpen, isWeightDropdownOpen]);

  if (isLoading) {
    return (
      <div className="p-6 text-center text-sm text-gray-500">Loading template...</div>
    );
  }

  if (isError || !template) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Template not found.</p>
        <button
          onClick={() => navigate("/templates")}
          className="mt-3 text-blue-600 text-sm hover:underline"
        >
          Back to Templates
        </button>
      </div>
    );
  }

  const openAddItem = () => {
    setEditingItem(null);
    setIsItemTypeDropdownOpen(false);
    setIsDataSourceDropdownOpen(false);
    setIsWeightDropdownOpen(false);
    reset({
      name: "",
      description: "",
      itemType: "quantitative",
      quantitativeRule: "percentage",
      targetValue: "",
      threshold: "",
      unit: "",
      weight: 1,
      dataSource: "manual",
    });
    setItemModalOpen(true);
  };

  const openEditItem = (item: ChecklistItem) => {
    setEditingItem(item);
    setIsItemTypeDropdownOpen(false);
    setIsDataSourceDropdownOpen(false);
    setIsWeightDropdownOpen(false);
    reset({
      name: item.name,
      description: item.description ?? "",
      itemType: item.itemType,
      quantitativeRule: item.quantitativeRule ?? "percentage",
      targetValue: item.targetValue !== undefined ? String(item.targetValue) : "",
      threshold: item.threshold !== undefined ? String(item.threshold) : "",
      unit: item.unit ?? "",
      weight: item.weight,
      dataSource: item.dataSource,
    });
    setItemModalOpen(true);
  };

  const onItemSubmit = async (data: ItemForm) => {
    const isQuantitative = data.itemType === "quantitative";
    const payload = {
      name: data.name,
      description: data.description || undefined,
      itemType: data.itemType,
      quantitativeRule: isQuantitative ? data.quantitativeRule : undefined,
      targetValue: isQuantitative && data.targetValue ? Number(data.targetValue) : undefined,
      threshold: isQuantitative && data.threshold ? Number(data.threshold) : undefined,
      unit: isQuantitative ? data.unit || undefined : undefined,
      weight: Number(data.weight),
      dataSource: data.dataSource,
    };

    try {
      if (editingItem) {
        await updateItemMutation.mutateAsync({
          templateId: template._id,
          itemId: String(editingItem._id),
          body: payload,
        });
        toast.success("Item updated");
      } else {
        await addItemMutation.mutateAsync({
          templateId: template._id,
          body: payload,
        });
        toast.success("Item added");
      }
      setItemModalOpen(false);
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save item");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!window.confirm("Remove this item?")) return;

    try {
      await removeItemMutation.mutateAsync({
        templateId: template._id,
        itemId,
      });
      toast.success("Item removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove item");
    }
  };

  const handleSaveHeader = async () => {
    try {
      await updateTemplateMutation.mutateAsync({
        _id: template._id,
        name: headerName,
        description: headerDesc,
      });
      setEditHeader(false);
      toast.success("Template updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update template");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
      <button
        onClick={() => navigate("/templates")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
      >
        <HiOutlineArrowLeft /> Back to Templates
      </button>

      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        {editHeader ? (
          <div className="space-y-3">
            <input
              value={headerName}
              onChange={(e) => setHeaderName(e.target.value)}
              className="w-full text-xl font-bold border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={headerDesc}
              onChange={(e) => setHeaderDesc(e.target.value)}
              rows={2}
              placeholder="Description..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={handleSaveHeader}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium"
              >
                Save
              </button>
              <button
                onClick={() => setEditHeader(false)}
                className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{template.name}</h1>
                {template.archive.status && (
                  <span className="px-2.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full border border-gray-200">
                    Archived
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">{template.description || "No description"}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <span>{template.items.length} items</span>
                <span>Created {new Date(template.createdAt).toLocaleDateString()}</span>
                <span>Updated {new Date(template.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
              <button
                onClick={() => navigate("/employee-checklists")}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium"
              >
                <HiOutlineUserAdd /> Assign
              </button>
              <button
                onClick={() => {
                  setHeaderName(template.name);
                  setHeaderDesc(template.description ?? "");
                  setEditHeader(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 font-medium"
              >
                <HiOutlinePencil /> Edit
              </button>
              <button
                onClick={async () => {
                  try {
                    await archiveTemplateMutation.mutateAsync(template._id);
                    toast.success(template.archive.status ? "Unarchived" : "Archived");
                    navigate("/templates");
                  } catch (error) {
                    toast.error(
                      error instanceof Error ? error.message : "Failed to archive template"
                    );
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 font-medium"
              >
                <HiOutlineArchive /> {template.archive.status ? "Unarchive" : "Archive"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="font-semibold text-gray-900">Checklist Items</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {template.items.length} item{template.items.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={openAddItem}
            className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            <HiOutlinePlus /> Add Item
          </button>
        </div>

        {template.items.length === 0 ? (
          <div className="px-4 py-12 text-center sm:px-6 sm:py-16">
            <HiOutlinePlus className="text-4xl text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium text-sm">No items yet</p>
            <p className="text-xs text-gray-400 mt-1">Add checklist items to define the performance criteria</p>
            <button
              onClick={openAddItem}
              className="mt-4 text-sm text-blue-600 hover:underline font-medium"
            >
              + Add your first item
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {template.items.map((item, idx) => (
              <div
                key={String(item._id)}
                className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-start sm:gap-4 sm:px-6"
              >
                <span className="size-7 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                    <span className={`px-2 py-0.5 text-xs rounded-full border capitalize font-medium ${ITEM_TYPE_COLORS[item.itemType]}`}>
                      {item.itemType}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full capitalize font-medium ${DATA_SOURCE_COLORS[item.dataSource]}`}>
                      {item.dataSource}
                    </span>
                  </div>
                  {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {item.itemType === "quantitative" && (
                      <>
                        {item.targetValue !== undefined && (
                          <span className="text-xs text-gray-500">
                            Target: <span className="font-medium text-gray-700">{item.targetValue}{item.unit ?? ""}</span>
                          </span>
                        )}
                        {item.threshold !== undefined && (
                          <span className="text-xs text-gray-500">
                            Threshold: <span className="font-medium text-gray-700">{item.threshold}{item.unit ?? ""}</span>
                            <span className="ml-1 text-gray-400">
                              ({item.quantitativeRule === "actual" ? "actual value" : "percentage"})
                            </span>
                          </span>
                        )}
                      </>
                    )}
                    <span className="text-xs text-gray-500">
                      Weight: <span className="font-medium text-gray-700">{item.weight}</span>
                    </span>
                  </div>
                </div>
                <div className="flex gap-1.5 self-end sm:self-auto">
                  <button
                    onClick={() => openEditItem(item)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit item"
                  >
                    <HiOutlinePencil className="text-sm" />
                  </button>
                  <button
                    onClick={() => handleRemoveItem(String(item._id))}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <HiOutlineTrash className="text-sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {itemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setItemModalOpen(false)} />
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl">
            <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingItem ? "Edit Checklist Item" : "Add Checklist Item"}
              </h2>
              <button onClick={() => setItemModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <HiX className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onItemSubmit)} className="space-y-4 overflow-y-auto p-4 sm:p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name", { required: "Item name is required" })}
                  placeholder="e.g. Code Quality Score"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <input
                  {...register("description")}
                  placeholder="Optional description..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <LabelWithHelp
                    label="Item Type"
                    required
                    helpText={FIELD_HELP_TEXT.itemType}
                  />
                  <input type="hidden" {...register("itemType")} />
                  <div ref={itemTypeDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDataSourceDropdownOpen(false);
                        setIsWeightDropdownOpen(false);
                        setIsItemTypeDropdownOpen((open) => !open);
                      }}
                      className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left text-sm text-gray-900 transition-colors hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-haspopup="listbox"
                      aria-expanded={isItemTypeDropdownOpen}
                    >
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          ITEM_TYPE_COLORS[selectedItemType ?? "quantitative"]
                        }`}
                      >
                        {ITEM_TYPE_LABELS[selectedItemType ?? "quantitative"]}
                      </span>
                      <HiOutlineChevronDown
                        className={`text-gray-400 transition-transform ${
                          isItemTypeDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isItemTypeDropdownOpen && (
                      <div
                        className="absolute z-30 mt-1 w-full rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
                        role="listbox"
                      >
                        {ITEM_TYPE_OPTIONS.map((option) => {
                          const isSelected = (selectedItemType ?? "quantitative") === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setValue("itemType", option.value, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                                clearErrors("itemType");
                                setIsItemTypeDropdownOpen(false);
                              }}
                              className={`mb-1 flex w-full items-start justify-between rounded-md px-3 py-2 text-left last:mb-0 ${
                                isSelected
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                              role="option"
                              aria-selected={isSelected}
                            >
                              <span>
                                <span className="block text-sm font-medium">{option.label}</span>
                                <span className="block text-xs text-gray-500">{option.description}</span>
                              </span>
                              {isSelected && <HiCheck className="mt-0.5 text-sm" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <LabelWithHelp
                    label="Data Source"
                    helpText={FIELD_HELP_TEXT.dataSource}
                  />
                  <input type="hidden" {...register("dataSource")} />
                  <div ref={dataSourceDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsItemTypeDropdownOpen(false);
                        setIsWeightDropdownOpen(false);
                        setIsDataSourceDropdownOpen((open) => !open);
                      }}
                      className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left text-sm text-gray-900 transition-colors hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-haspopup="listbox"
                      aria-expanded={isDataSourceDropdownOpen}
                    >
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          DATA_SOURCE_COLORS[selectedDataSource ?? "manual"]
                        }`}
                      >
                        {DATA_SOURCE_LABELS[selectedDataSource ?? "manual"]}
                      </span>
                      <HiOutlineChevronDown
                        className={`text-gray-400 transition-transform ${
                          isDataSourceDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isDataSourceDropdownOpen && (
                      <div
                        className="absolute z-30 mt-1 w-full rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
                        role="listbox"
                      >
                        {DATA_SOURCE_OPTIONS.map((option) => {
                          const isSelected = (selectedDataSource ?? "manual") === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setValue("dataSource", option.value, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                                clearErrors("dataSource");
                                setIsDataSourceDropdownOpen(false);
                              }}
                              className={`mb-1 flex w-full items-start justify-between rounded-md px-3 py-2 text-left last:mb-0 ${
                                isSelected
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                              role="option"
                              aria-selected={isSelected}
                            >
                              <span>
                                <span className="block text-sm font-medium">{option.label}</span>
                                <span className="block text-xs text-gray-500">{option.description}</span>
                              </span>
                              {isSelected && <HiCheck className="mt-0.5 text-sm" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {watchedType === "quantitative" && (
                <div className="grid grid-cols-1 gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <LabelWithHelp
                      label="Target Value"
                      helpText={FIELD_HELP_TEXT.targetValue}
                      small
                    />
                    <input
                      {...register("targetValue")}
                      type="number"
                      placeholder="80"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <LabelWithHelp
                      label="Threshold"
                      helpText={FIELD_HELP_TEXT.threshold}
                      small
                    />
                    <input
                      {...register("threshold")}
                      type="number"
                      placeholder="70"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <LabelWithHelp
                      label="Unit"
                      helpText={FIELD_HELP_TEXT.unit}
                      small
                    />
                    <input
                      {...register("unit")}
                      placeholder="%"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <LabelWithHelp
                      label="Threshold Basis"
                      helpText={FIELD_HELP_TEXT.thresholdBasis}
                      small
                    />
                    <div className="relative">
                      <select
                        {...register("quantitativeRule")}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="actual">Actual Value</option>
                      </select>
                      <HiOutlineChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <LabelWithHelp label="Weight" helpText={FIELD_HELP_TEXT.weight} />
                <input
                  type="hidden"
                  {...register("weight", {
                    valueAsNumber: true,
                    min: { value: 1, message: "Weight must be at least 1" },
                    max: { value: 10, message: "Weight must not exceed 10" },
                  })}
                />
                <div ref={weightDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsWeightDropdownOpen((open) => !open)}
                    className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left text-sm text-gray-900 transition-colors hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-haspopup="listbox"
                    aria-expanded={isWeightDropdownOpen}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="text-gray-500">Weight</span>
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 font-semibold text-blue-700">
                        {selectedWeight ?? 1}
                      </span>
                    </span>
                    <HiOutlineChevronDown
                      className={`text-gray-400 transition-transform ${
                        isWeightDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isWeightDropdownOpen && (
                    <div
                      className="absolute top-full z-30 mt-2 w-full rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
                      role="listbox"
                    >
                      <div className="grid grid-cols-5 gap-1">
                        {Array.from({ length: 10 }, (_, index) => {
                          const value = index + 1;
                          const isSelected = Number(selectedWeight ?? 1) === value;

                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => {
                                setValue("weight", value, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                                clearErrors("weight");
                                setIsWeightDropdownOpen(false);
                              }}
                              className={`inline-flex items-center justify-center gap-1 rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                                isSelected
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                              }`}
                              role="option"
                              aria-selected={isSelected}
                            >
                              {isSelected && <HiCheck className="text-xs" />}
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">Allowed: 1 to 10. Higher weight = more impact on overall score.</p>
                {errors.weight && <p className="text-red-500 text-xs">{errors.weight.message}</p>}
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setItemModalOpen(false)}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addItemMutation.isPending || updateItemMutation.isPending}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-70"
                >
                  {editingItem ? "Save Changes" : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
