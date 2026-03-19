import apiClient from "../config/apiClient";
import { API_ENDPOINTS } from "../config/endpoints";

const { LMS_URL, USER } = API_ENDPOINTS;

type GetAllUsersOptions = {
  select?: string[];
  queryArray?: string[];
  queryArrayType?: string;
  limit?: number;
  count?: boolean;
  document?: boolean;
  pagination?: boolean;
};

const DEFAULT_GET_ALL_USERS_OPTIONS: Required<GetAllUsersOptions> = {
  select: [
    "firstName",
    "lastName",
    "firstname",
    "lastname",
    "first_name",
    "last_name",
    "fullName",
    "name",
    "email",
    "organizationId",
    "role",
    "avatar",
  ],
  queryArray: [],
  queryArrayType: "",
  limit: 1000,
  count: true,
  document: true,
  pagination: true,
};

const buildGetAllUsersQuery = (
  options: Required<GetAllUsersOptions>
): string => {
  const params = new URLSearchParams();

  options.select.forEach((field) => params.append("select", field));
  options.queryArray.forEach((value) => params.append("queryArray", value));
  if (options.queryArrayType) {
    params.set("queryArrayType", options.queryArrayType);
  }
  params.set("limit", String(options.limit));
  params.set("count", String(options.count));
  params.set("document", String(options.document));
  params.set("pagination", String(options.pagination));

  return params.toString();
};

class UserService {
  getAllUsers = async (options: GetAllUsersOptions = {}) => {
    const mergedOptions: Required<GetAllUsersOptions> = {
      ...DEFAULT_GET_ALL_USERS_OPTIONS,
      ...options,
    };

    const queryString = buildGetAllUsersQuery(mergedOptions);
    const response = await apiClient.get(
      `${LMS_URL}${USER.GET_ALL}?${queryString}`,
      {
        withCredentials: true,
      }
    );

    return response.data;
  };

  getAllStudents = async (
    options: Omit<GetAllUsersOptions, "queryArray" | "queryArrayType"> = {}
  ) => {
    return this.getAllUsers({
      ...options,
      queryArray: ["student"],
      queryArrayType: "role",
    });
  };

  getCurrentUser = async () => {
    const response = await apiClient.get(`${LMS_URL}${USER.CHECKLOGIN}`, {
      withCredentials: true,
    });

    return response.data;
  };
}

export default new UserService();
