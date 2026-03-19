import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { HiX } from "react-icons/hi";
import { toast } from "react-toastify";
import BentoCard from "../../components/common/BentoCard";
import {
  ClipboardIcon,
  EyeIcon,
  PlusIcon,
  SearchIcon,
} from "../../components/icons/animate";
import {
  useArchiveChecklistTemplate,
  useChecklistTemplates,
  useCreateChecklistTemplate,
  useUpdateChecklistTemplate,
} from "../../hooks/useChecklistTemplate";
import type { ChecklistTemplate } from "../../types/performance";

interface TemplateForm {
  name: string;
  description: string;
}

export default function ChecklistTemplatesPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "archived">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null);

  const {
    data: templatesResponse,
    isLoading,
    isError,
  } = useChecklistTemplates({ page: 1, limit: 200 });

  const createTemplate = useCreateChecklistTemplate();
  const updateTemplate = useUpdateChecklistTemplate();
  const archiveTemplate = useArchiveChecklistTemplate();

  const templates: ChecklistTemplate[] = templatesResponse?.templates ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TemplateForm>();

  const visible = useMemo(
    () =>
      templates
        .filter((template) => !template.isDeleted)
        .filter((template) => {
          if (filter === "active") return !template.archive.status;
          if (filter === "archived") return template.archive.status;
          return true;
        })
        .filter((template) =>
          template.name.toLowerCase().includes(search.toLowerCase())
        ),
    [templates, filter, search]
  );

  const openCreate = () => {
    setEditingTemplate(null);
    reset({ name: "", description: "" });
    setIsModalOpen(true);
  };

  const openEdit = (template: ChecklistTemplate) => {
    setEditingTemplate(template);
    reset({ name: template.name, description: template.description ?? "" });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: TemplateForm) => {
    try {
      if (editingTemplate) {
        await updateTemplate.mutateAsync({
          _id: editingTemplate._id,
          name: data.name,
          description: data.description,
        });
        toast.success("Template updated");
      } else {
        await createTemplate.mutateAsync({
          name: data.name,
          description: data.description,
          items: [],
        });
        toast.success("Template created");
      }

      setIsModalOpen(false);
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save template");
    }
  };

  const handleArchive = async (
    template: ChecklistTemplate,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    try {
      await archiveTemplate.mutateAsync(template._id);
      toast.success(template.archive.status ? "Template unarchived" : "Template archived");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to archive template");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
      <BentoCard
        title="Checklist Templates"
        description="Build reusable performance review templates and organize them by lifecycle."
        icon={<ClipboardIcon size={18} className="text-blue-600" />}
        action={
          <button
            onClick={openCreate}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto"
          >
            <PlusIcon size={15} />
            Create Template
          </button>
        }
      >
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            {templates.filter((template) => !template.isDeleted).length} templates
          </span>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            {
              templates.filter(
                (template) => !template.archive.status && !template.isDeleted
              ).length
            }{" "}
            active
          </span>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
            {
              templates.filter(
                (template) => template.archive.status && !template.isDeleted
              ).length
            }{" "}
            archived
          </span>
        </div>
      </BentoCard>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 sm:w-auto">
          {(["all", "active", "archived"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                filter === tab
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              } whitespace-nowrap`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <BentoCard>
          <div className="py-10 text-center text-sm text-slate-500">Loading templates...</div>
        </BentoCard>
      ) : isError ? (
        <BentoCard>
          <div className="py-10 text-center text-sm text-red-500">Failed to load templates</div>
        </BentoCard>
      ) : visible.length === 0 ? (
        <BentoCard>
          <div className="flex flex-col items-center py-10 text-center">
            <ClipboardIcon size={30} className="text-slate-400" />
            <p className="mt-3 font-medium text-slate-600">No templates found</p>
            <p className="mt-1 text-sm text-slate-400">Create your first checklist template to get started.</p>
            <button
              onClick={openCreate}
              className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
            >
              + Create Template
            </button>
          </div>
        </BentoCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((template) => (
            <BentoCard
              key={template._id}
              onClick={() => navigate(`/templates/${template._id}`)}
              title={template.name}
              description={template.description || "No description"}
              icon={<ClipboardIcon size={16} className="text-blue-600" />}
              className={template.archive.status ? "opacity-80" : ""}
            >
              <div className="mb-4 mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  {template.items.length} items
                </span>
                <span className="text-xs text-slate-500">
                  Updated {new Date(template.updatedAt).toLocaleDateString()}
                </span>
                {template.archive.status && (
                  <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    Archived
                  </span>
                )}
              </div>

              <div className="mb-4 flex flex-wrap gap-1">
                {(["quantitative", "qualitative", "certification"] as const).map(
                  (type) => {
                    const count = template.items.filter((item) => item.itemType === type).length;
                    if (!count) return null;

                    const tone: Record<typeof type, string> = {
                      quantitative: "bg-indigo-50 text-indigo-700",
                      qualitative: "bg-emerald-50 text-emerald-700",
                      certification: "bg-amber-50 text-amber-700",
                    };

                    return (
                      <span
                        key={type}
                        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${tone[type]}`}
                      >
                        {count} {type}
                      </span>
                    );
                  }
                )}
              </div>

              <div className="mt-2 grid grid-cols-1 gap-2 border-t border-slate-100 pt-3 sm:grid-cols-3">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate(`/templates/${template._id}`);
                  }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <EyeIcon size={14} />
                  View
                </button>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    openEdit(template);
                  }}
                  className="flex-1 rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  onClick={(event) => handleArchive(template, event)}
                  className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors ${
                    template.archive.status
                      ? "border-blue-200 text-blue-700 hover:bg-blue-50"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {template.archive.status ? "Unarchive" : "Archive"}
                </button>
              </div>
            </BentoCard>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsModalOpen(false)} />
          <div className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingTemplate ? "Edit Template" : "Create Template"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <HiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto p-4 sm:p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name", { required: "Name is required" })}
                  placeholder="e.g. Q2 Performance Review"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  {...register("description")}
                  placeholder="Brief description of this checklist template..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {!editingTemplate && (
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  You can add checklist items after creating the template.
                </p>
              )}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTemplate.isPending || updateTemplate.isPending}
                  className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-70"
                >
                  {editingTemplate ? "Save Changes" : "Create Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
