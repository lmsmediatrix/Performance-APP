import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import checklistTemplateService from "../services/checklistTemplateApi";

interface ChecklistTemplateQueryParams {
  page?: number;
  limit?: number;
}

export const useChecklistTemplates = (
  apiParams?: ChecklistTemplateQueryParams
) => {
  return useQuery({
    queryKey: ["checklist-templates", apiParams],
    queryFn: async () => {
      checklistTemplateService.resetQuery();
      return checklistTemplateService
        .limit(apiParams?.limit || 50)
        .skip(((apiParams?.page || 1) - 1) * (apiParams?.limit || 50))
        .getChecklistTemplates();
    },
  });
};

export const useChecklistTemplateById = (templateId: string) => {
  return useQuery({
    queryKey: ["checklist-template", templateId],
    queryFn: async () => {
      checklistTemplateService.resetQuery();
      return checklistTemplateService.getChecklistTemplateById(templateId);
    },
    enabled: !!templateId,
  });
};

export const useCreateChecklistTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: object) =>
      checklistTemplateService.createChecklistTemplate(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-templates"] });
    },
  });
};

export const useUpdateChecklistTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: object) =>
      checklistTemplateService.updateChecklistTemplate(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-templates"] });
      queryClient.invalidateQueries({ queryKey: ["checklist-template"] });
    },
  });
};

export const useArchiveChecklistTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) =>
      checklistTemplateService.archiveChecklistTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-templates"] });
      queryClient.invalidateQueries({ queryKey: ["checklist-template"] });
    },
  });
};

export const useAddChecklistTemplateItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, body }: { templateId: string; body: object }) =>
      checklistTemplateService.addChecklistItem(templateId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-templates"] });
      queryClient.invalidateQueries({ queryKey: ["checklist-template"] });
    },
  });
};

export const useUpdateChecklistTemplateItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      templateId,
      itemId,
      body,
    }: {
      templateId: string;
      itemId: string;
      body: object;
    }) => checklistTemplateService.updateChecklistItem(templateId, itemId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-templates"] });
      queryClient.invalidateQueries({ queryKey: ["checklist-template"] });
    },
  });
};

export const useRemoveChecklistTemplateItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, itemId }: { templateId: string; itemId: string }) =>
      checklistTemplateService.removeChecklistItem(templateId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-templates"] });
      queryClient.invalidateQueries({ queryKey: ["checklist-template"] });
    },
  });
};
