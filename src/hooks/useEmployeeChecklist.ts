import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import employeeChecklistService from "../services/employeeChecklistApi";

type EmployeeChecklistQueryParams = {
  page?: number;
  limit?: number;
};

export const useEmployeeChecklists = (
  apiParams?: EmployeeChecklistQueryParams
) => {
  return useQuery({
    queryKey: ["employee-checklists", apiParams],
    queryFn: () =>
      employeeChecklistService.getEmployeeChecklists({
        page: apiParams?.page ?? 1,
        limit: apiParams?.limit ?? 200,
      }),
  });
};

export const useCreateEmployeeChecklist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: {
      employeeId: string;
      checklistTemplateId: string;
      dueDate?: string;
    }) => employeeChecklistService.createEmployeeChecklist(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-checklists"] });
    },
  });
};

export const useArchiveEmployeeChecklist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (checklistId: string) =>
      employeeChecklistService.archiveEmployeeChecklist(checklistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-checklists"] });
    },
  });
};

export const useEmployeeChecklistById = (checklistId: string) => {
  return useQuery({
    queryKey: ["employee-checklist", checklistId],
    queryFn: () => employeeChecklistService.getEmployeeChecklistById(checklistId),
    enabled: Boolean(checklistId),
  });
};

export const useUpdateEmployeeChecklist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: {
      _id: string;
      managerFeedback?: string;
      items?: unknown[];
    }) => employeeChecklistService.updateEmployeeChecklist(body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employee-checklists"] });
      queryClient.invalidateQueries({
        queryKey: ["employee-checklist", variables._id],
      });
    },
  });
};
