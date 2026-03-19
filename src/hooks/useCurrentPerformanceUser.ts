import { useQuery } from "@tanstack/react-query";
import UserService from "../services/userApi";

const pickString = (...values: unknown[]): string => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
};

const toTitleLabel = (value: string): string => {
  const normalized = value.replace(/[_-]+/g, " ").trim().replace(/\s+/g, " ");
  if (!normalized) return "";
  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
};

const getSourceUser = (payload: any) =>
  payload?.user && typeof payload.user === "object" ? payload.user : payload;

const getUserId = (source: any, payload: any) =>
  pickString(
    source?._id,
    source?.id,
    source?.userId,
    source?.employeeId,
    payload?._id,
    payload?.id,
    payload?.userId,
    payload?.employeeId,
  );

export interface CurrentPerformanceUser {
  raw: any;
  source: any;
  id: string;
  role: string;
  roleLabel: string;
  isStudent: boolean;
  name: string;
  initials: string;
  organizationName: string;
  organizationCode: string;
  organizationLogo: string;
  token: string;
}

const normalizeCurrentUser = (payload: any): CurrentPerformanceUser => {
  const source = getSourceUser(payload);
  const id = getUserId(source, payload);

  const roleRaw = pickString(source?.role, payload?.role);
  const role = roleRaw.toLowerCase();
  const isStudent = role === "student";

  const firstName = pickString(source?.firstName, source?.firstname, source?.first_name);
  const lastName = pickString(source?.lastName, source?.lastname, source?.last_name);
  const fullName = pickString(
    `${firstName} ${lastName}`.trim(),
    source?.name,
    source?.fullName,
    payload?.name,
  );

  const name = fullName || "User";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2) || "U";

  const organizationName = pickString(
    source?.organization?.name,
    source?.org?.name,
    source?.organizationName,
    "Organization",
  );
  const organizationCode = pickString(
    source?.organization?.code,
    source?.org?.code,
    source?.organizationCode,
  );
  const organizationLogo = pickString(
    source?.organization?.branding?.logo,
    source?.organization?.logo,
    source?.org?.branding?.logo,
    source?.org?.logo,
  );

  const roleLabel = isStudent ? "Employee" : toTitleLabel(roleRaw || "Admin");
  const token = pickString(payload?.token, source?.token);

  return {
    raw: payload,
    source,
    id,
    role,
    roleLabel,
    isStudent,
    name,
    initials,
    organizationName,
    organizationCode,
    organizationLogo,
    token,
  };
};

export const useCurrentPerformanceUser = (enabled = true) => {
  return useQuery({
    queryKey: ["user", "current", "performance-normalized"],
    queryFn: async () => {
      const response = await UserService.getCurrentUser();
      return normalizeCurrentUser(response);
    },
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};
