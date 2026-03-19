import apiClient from "../config/apiClient";
import { API_ENDPOINTS } from "../config/endpoints";
import { APIService } from "./apiService";

const { BASE_URL, CHECKLIST_TEMPLATE } = API_ENDPOINTS;

class ChecklistTemplateService extends APIService {
  getChecklistTemplates = async () => {
    const response = await apiClient.get(
      `${BASE_URL}${CHECKLIST_TEMPLATE.GET_ALL}${this.getQueryString()}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  };

  getChecklistTemplateById = async (templateId: string) => {
    const response = await apiClient.get(
      `${BASE_URL}${CHECKLIST_TEMPLATE.GET_BY_ID.replace(":id", templateId)}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  };

  createChecklistTemplate = async (body: object) => {
    const response = await apiClient.post(
      `${BASE_URL}${CHECKLIST_TEMPLATE.CREATE}`,
      body,
      {
        withCredentials: true,
      }
    );
    return response.data;
  };

  updateChecklistTemplate = async (body: object) => {
    const response = await apiClient.put(
      `${BASE_URL}${CHECKLIST_TEMPLATE.UPDATE}`,
      body,
      {
        withCredentials: true,
      }
    );
    return response.data;
  };

  archiveChecklistTemplate = async (templateId: string) => {
    const response = await apiClient.put(
      `${BASE_URL}${CHECKLIST_TEMPLATE.ARCHIVE.replace(":id", templateId)}`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data;
  };

  addChecklistItem = async (templateId: string, body: object) => {
    const response = await apiClient.post(
      `${BASE_URL}${CHECKLIST_TEMPLATE.ADD_ITEM.replace(":templateId", templateId)}`,
      body,
      {
        withCredentials: true,
      }
    );
    return response.data;
  };

  updateChecklistItem = async (
    templateId: string,
    itemId: string,
    body: object
  ) => {
    const response = await apiClient.put(
      `${BASE_URL}${CHECKLIST_TEMPLATE.UPDATE_ITEM.replace(
        ":templateId",
        templateId
      ).replace(":itemId", itemId)}`,
      body,
      {
        withCredentials: true,
      }
    );
    return response.data;
  };

  removeChecklistItem = async (templateId: string, itemId: string) => {
    const response = await apiClient.delete(
      `${BASE_URL}${CHECKLIST_TEMPLATE.REMOVE_ITEM.replace(
        ":templateId",
        templateId
      ).replace(":itemId", itemId)}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  };
}

export default new ChecklistTemplateService();
