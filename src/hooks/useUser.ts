import { useQuery } from "@tanstack/react-query";
import UserService from "../services/userApi";

export type UserDirectoryItem = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  role: string;
};

const pickString = (...values: unknown[]): string => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
};

const toTitleLabel = (value: string) =>
  value
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const mapRoleToPosition = (role: string): string => {
  const normalized = role.trim().toLowerCase();

  if (!normalized) {
    return "Employee";
  }

  if (normalized === "student") {
    return "Employee";
  }

  return toTitleLabel(role);
};

const mapRoleForPerformance = (role: string): string => {
  const normalized = role.trim().toLowerCase();
  if (normalized === "student") {
    return "employee";
  }
  return normalized || "employee";
};

const extractUserArray = (payload: any): any[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }

  if (Array.isArray(payload?.documents)) {
    return payload.documents;
  }

  if (Array.isArray(payload?.users)) {
    return payload.users;
  }

  return [];
};

const normalizeUser = (raw: any): UserDirectoryItem | null => {
  const source =
    raw?.user && typeof raw.user === "object" ? { ...raw, ...raw.user } : raw;

  const id = pickString(
    source?._id,
    source?.id,
    source?.userId,
    source?.email
  );
  if (!id) {
    return null;
  }

  const firstName = pickString(
    source?.firstName,
    source?.firstname,
    source?.first_name,
    source?.givenName,
    raw?.firstName,
    raw?.firstname,
    raw?.first_name,
    raw?.givenName,
    raw?.user?.firstName,
    raw?.user?.firstname,
    raw?.user?.first_name,
    raw?.user?.givenName
  );
  const lastName = pickString(
    source?.lastName,
    source?.lastname,
    source?.last_name,
    source?.familyName,
    raw?.lastName,
    raw?.lastname,
    raw?.last_name,
    raw?.familyName,
    raw?.user?.lastName,
    raw?.user?.lastname,
    raw?.user?.last_name,
    raw?.user?.familyName
  );
  const fullName = pickString(
    `${firstName} ${lastName}`.trim(),
    source?.fullName,
    raw?.fullName,
    raw?.user?.fullName
  );

  const email = pickString(source?.email, raw?.email, raw?.user?.email);
  const role = pickString(source?.role, raw?.role, raw?.user?.role);
  const department = pickString(
    source?.organization?.name,
    raw?.organization?.name,
    source?.organizationName,
    raw?.organizationName,
    "Unknown"
  );

  return {
    id,
    name: pickString(fullName, source?.name, raw?.name, email, id),
    firstName,
    lastName,
    email,
    department,
    position: mapRoleToPosition(role),
    role: mapRoleForPerformance(role),
  };
};

export const useUsers = () => {
  return useQuery({
    queryKey: ["users", "lms", "get-all", "student"],
    queryFn: async () => {
      const response = await UserService.getAllStudents();
      const users = extractUserArray(response)
        .map(normalizeUser)
        .filter(Boolean) as UserDirectoryItem[];

      return users;
    },
  });
};

export const useAllUsers = () => {
  return useQuery({
    queryKey: ["users", "lms", "get-all", "all-roles"],
    queryFn: async () => {
      const response = await UserService.getAllUsers();
      const users = extractUserArray(response)
        .map(normalizeUser)
        .filter(Boolean) as UserDirectoryItem[];

      return users;
    },
  });
};
