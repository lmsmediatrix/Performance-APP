// utils/terminology.ts
import { roleLabels, organizationTypes } from "../config/common";

// Define types for TypeScript
export type OrganizationType = typeof organizationTypes[number];
export type Role = keyof typeof roleLabels;

// Utility function to get the appropriate term
export function getTerm(
  role: Role,
  orgType: OrganizationType,
  plural: boolean = false
): string {
  const roleConfig = roleLabels[role];
  if (!roleConfig) {
    console.warn(`Role "${role}" not found in terminology`);
    return role; // Fallback to role name
  }

  const orgConfig = roleConfig[orgType as keyof typeof roleConfig];
  if (!orgConfig) {
    console.warn(`Org type "${orgType}" not found for role "${role}"`);
    return role; // Fallback
  }

  return plural ? orgConfig.plural : orgConfig.singular;
}

export const getYearLevelText = (yearLevel: number) => {
  if (!yearLevel) return "Not specified";
  const suffixes = { 1: "st", 2: "nd", 3: "rd" };
  const suffix = suffixes[yearLevel as 1 | 2 | 3] || "th";
  return `${yearLevel}${suffix} year`;
};

