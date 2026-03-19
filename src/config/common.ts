import { IGradeScale } from "../types/interfaces";

export const defaultColors = {
  primary: "#3E5B93",
  secondary: "#f9b314",
  accent: "#18365c",
  light: "#f8f9fa",
  dark: "#343a40",
  neutral: "#808080",
  success: "#28a745",
  warning: "#ffc107",
  danger: "#dc3545",
};

import {
  FaHome,
  FaCog,
  FaBook,
  FaChalkboardTeacher,
  FaUsers,
  FaLayerGroup,
  FaWrench,
  FaChartLine,
} from "react-icons/fa";

export interface NavItem {
  LABEL: string;
  PATH?: string;
  ICON?: React.ComponentType;
  SUBMENU?: NavItem[];
}

export const BASE_NAVIGATION: {
  [key: string]: NavItem[];
} = {
  SUPERADMIN: [
    {
      LABEL: "Dashboard",
      PATH: "/admin/dashboard",
      ICON: FaHome,
    },
    {
      LABEL: "Organization",
      PATH: "/admin/organization",
      ICON: FaCog,
    },
    {
      LABEL: "Logs",
      ICON: FaBook,
      SUBMENU: [
        {
          LABEL: "Activity",
          PATH: "/admin/activities",
        },
        {
          LABEL: "Audit",
          PATH: "/admin/audit",
        },
      ],
    },
  ],
  ADMIN: [
    {
      LABEL: "Dashboard",
      PATH: "/:code/admin/dashboard",
      ICON: FaHome,
    },
    {
      LABEL: "Courses",
      PATH: "/:code/admin/course",
      ICON: FaBook,
    },
    {
      LABEL: "Instructor",
      PATH: "/:code/admin/instructor",
      ICON: FaChalkboardTeacher,
    },
    {
      LABEL: "Student",
      PATH: "/:code/admin/student",
      ICON: FaUsers,
    },
    {
      LABEL: "Sections",
      PATH: "/:code/admin/section",
      ICON: FaLayerGroup,
    },
    {
      LABEL: "Configuration",
      ICON: FaWrench,
      SUBMENU: [
        {
          LABEL: "Category",
          PATH: "/:code/admin/category",
        },
        {
          LABEL: "Faculty",
          PATH: "/:code/admin/faculty",
        },
        {
          LABEL: "Program",
          PATH: "/:code/admin/program",
        },
      ],
    },
    {
      LABEL: "Performance",
      PATH: "/:code/admin/performance",
      ICON: FaChartLine,
    },
  ],
  INSTRUCTOR: [
    {
      LABEL: "Dashboard",
      PATH: "/:code/instructor/dashboard",
      ICON: FaHome,
    },
    {
      LABEL: "My Sections",
      PATH: "/:code/instructor/sections",
      ICON: FaLayerGroup,
    },
    {
      LABEL: "Performance",
      PATH: "/:code/instructor/performance",
      ICON: FaChartLine,
    },
  ],
  STUDENT: [
    {
      LABEL: "Dashboard",
      PATH: "/:code/student/dashboard",
      ICON: FaHome,
    },
    {
      LABEL: "My Sections",
      PATH: "/:code/student/sections",
      ICON: FaLayerGroup,
    },
  ],
};

export const organizationTypes = ["school", "corporate"];

export const roleLabels = {
  learner: {
    school: { singular: "Student", plural: "Students" },
    corporate: { singular: "Employee", plural: "Employees" },
  },
  group: {
    school: { singular: "Section", plural: "Sections" },
    corporate: { singular: "Department", plural: "Departments" },
  },
  instructor: {
    school: { singular: "Instructor", plural: "Instructors" },
    corporate: { singular: "Instructor", plural: "Instructors" },
  },
};

export const dayAbbreviations = {
  mon: "M",
  tue: "T",
  wed: "W",
  thu: "Th",
  fri: "F",
  sat: "Sa",
  sun: "S",
};

export const letterGradeScale: IGradeScale[] = [
  { gradeLabel: "A", percentageRange: { startRange: 90, endRange: 100 } },
  { gradeLabel: "B", percentageRange: { startRange: 80, endRange: 89 } },
  { gradeLabel: "C", percentageRange: { startRange: 70, endRange: 79 } },
  { gradeLabel: "D", percentageRange: { startRange: 60, endRange: 69 } },
  { gradeLabel: "F", percentageRange: { startRange: 0, endRange: 59 } },
];

export const pointsBasedScale: IGradeScale[] = [
  {
    gradeLabel: "1.00",
    pointValue: 1.0,
    percentageRange: { startRange: 97, endRange: 100 },
  },
  {
    gradeLabel: "1.25",
    pointValue: 1.25,
    percentageRange: { startRange: 94, endRange: 96 },
  },
  {
    gradeLabel: "1.50",
    pointValue: 1.5,
    percentageRange: { startRange: 91, endRange: 93 },
  },
  {
    gradeLabel: "1.75",
    pointValue: 1.75,
    percentageRange: { startRange: 88, endRange: 90 },
  },
  {
    gradeLabel: "2.00",
    pointValue: 2.0,
    percentageRange: { startRange: 85, endRange: 87 },
  },
  {
    gradeLabel: "2.25",
    pointValue: 2.25,
    percentageRange: { startRange: 82, endRange: 84 },
  },
  {
    gradeLabel: "2.50",
    pointValue: 2.5,
    percentageRange: { startRange: 79, endRange: 81 },
  },
  {
    gradeLabel: "2.75",
    pointValue: 2.75,
    percentageRange: { startRange: 76, endRange: 78 },
  },
  {
    gradeLabel: "3.00",
    pointValue: 3.0,
    percentageRange: { startRange: 75, endRange: 75 },
  },
  {
    gradeLabel: "5.00",
    pointValue: 5.0,
    percentageRange: { startRange: 0, endRange: 75 },
  },
];
