import apiClient from "../config/apiClient";
import { API_ENDPOINTS } from "../config/endpoints";

const { BASE_URL, EMPLOYEE_CHECKLIST } = API_ENDPOINTS;

type GetEmployeeChecklistsOptions = {
  page?: number;
  limit?: number;
};

class EmployeeChecklistService {
  getEmployeeChecklists = async (
    options: GetEmployeeChecklistsOptions = {}
  ) => {
    const page = options.page ?? 1;
    const limit = options.limit ?? 200;
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    const response = await apiClient.get(
      `${BASE_URL}${EMPLOYEE_CHECKLIST.GET_ALL}?${query.toString()}`,
      { withCredentials: true }
    );

    return response.data;
  };

  createEmployeeChecklist = async (body: {
    employeeId: string;
    checklistTemplateId: string;
    dueDate?: string;
  }) => {
    const response = await apiClient.post(
      `${BASE_URL}${EMPLOYEE_CHECKLIST.CREATE}`,
      body,
      { withCredentials: true }
    );
    return response.data;
  };

  archiveEmployeeChecklist = async (checklistId: string) => {
    const response = await apiClient.put(
      `${BASE_URL}${EMPLOYEE_CHECKLIST.ARCHIVE.replace(":id", checklistId)}`,
      {},
      { withCredentials: true }
    );
    return response.data;
  };

  getEmployeeChecklistById = async (checklistId: string) => {
    const response = await apiClient.get(
      `${BASE_URL}${EMPLOYEE_CHECKLIST.GET_BY_ID.replace(":id", checklistId)}`,
      { withCredentials: true }
    );
    return response.data;
  };

  updateEmployeeChecklist = async (body: {
    _id: string;
    managerFeedback?: string;
    items?: unknown[];
  }) => {
    const response = await apiClient.put(
      `${BASE_URL}${EMPLOYEE_CHECKLIST.UPDATE}`,
      body,
      { withCredentials: true }
    );
    return response.data;
  };
}

export default new EmployeeChecklistService();
