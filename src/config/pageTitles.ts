import { getTerm } from "../lib/utils";

// Define types for the title mapping
type TitleMapping = {
  [key: string]: string | (() => string);
};

// Helper function to get organization-specific terms
const getTerms = (orgType: string = "school") => {
  const studentTerm = getTerm("learner", orgType);
  const sectionTerm = getTerm("group", orgType);

  return {
    studentTerm,
    sectionTerm,
    studentTermPlural: getTerm("learner", orgType, true),
    sectionTermPlural: getTerm("group", orgType, true),
  };
};

// Title mapping configuration
export const pageTitles: TitleMapping = {
  // Super Admin Routes
  "/admin/dashboard": "Admin Dashboard",
  "/admin/organization": "Organizations",
  "/admin/activities": "Activity Log",
  "/admin/organization/create": "Create Organization",
  "/admin/organization/:id/edit": () => `Edit Organization`,
  "/admin/organization/:orgId": () => `Organization Details`,

  // Organization Admin Routes
  "/:orgCode/admin/dashboard": "Admin Dashboard",
  "/:orgCode/admin/instructor": () => `Instructors`,
  "/:orgCode/admin/instructor/:id": () => `Instructor Details`,
  "/:orgCode/admin/student": () => `${getTerms().studentTermPlural}`,
  "/:orgCode/admin/student/:id": () => `${getTerms().studentTerm} Details`,
  "/:orgCode/admin/section": () => `${getTerms().sectionTermPlural}`,
  "/:orgCode/admin/section/new": () => `Create New ${getTerms().sectionTerm}`,
  "/:orgCode/admin/section/:code": () => `Edit ${getTerms().sectionTerm}`,
  "/:orgCode/admin/course": "Courses",
  "/:orgCode/admin/category": "Categories",
  "/:orgCode/admin/faculty": "Faculties",
  "/:orgCode/admin/program": "Programs",
  "/:orgCode/admin/voucher": "Vouchers",
  "/:orgCode/admin/profile": "Admin Profile",
  "/:orgCode/admin/settings": "Settings",
  "/:orgCode/admin/performance": "Performance Management",
  "/:orgCode/admin/performance/:studentId": () =>
    `${getTerms().studentTerm} Performance Details`,

  // Instructor Routes
  "/:orgCode/instructor/dashboard": "Instructor Dashboard",
  "/:orgCode/instructor/sections": () => `${getTerms().sectionTermPlural}`,
  "/:orgCode/instructor/sections/:sectionCode": () =>
    `${getTerms().sectionTerm} Details`,
  "/:orgCode/instructor/sections/:sectionCode/manage": () =>
    `Manage ${getTerms().sectionTerm} Details`,
  "/:orgCode/instructor/sections/:sectionCode/assessment/:assessmentId":
    "Assessment Details",
  "/:orgCode/instructor/sections/:sectionCode/update": () =>
    `Update ${getTerms().sectionTerm}`,
  "/:orgCode/instructor/profile": "Instructor Profile",
  "/:orgCode/instructor/sections/:sectionCode/assessment/:assessmentId/student/:studentId":
    "Assessment Results",
  "/:orgCode/instructor/sections/:courseCode/lessons/:lessonId":
    "Lesson Details",
  "/:orgCode/instructor/performance": "Performance Management",
  "/:orgCode/instructor/performance/:studentId": () =>
    `${getTerms().studentTerm} Performance Details`,

  // Student Routes
  "/:orgCode/student/dashboard": () => `${getTerms().studentTerm} Dashboard`,
  "/:orgCode/student/sections": () => `My ${getTerms().sectionTermPlural}`,
  "/:orgCode/student/sections/:courseCode": () =>
    `${getTerms().sectionTerm} Details`,
  "/:orgCode/student/sections/:courseCode/lessons/:lessonId": "Lesson",
  "/:orgCode/student/calendar": "Calendar",
  "/:orgCode/student/portfolio": "Portfolio",
  "/:orgCode/student/inbox": "Inbox",
  "/:orgCode/student/:assessmentType/:assessmentId": "Assessment",
  "/:orgCode/student/:assessmentType/:assessmentId/submitted":
    "Assessment Submitted",
  "/:orgCode/student/sections/:sectionCode/assessment/:assessmentId":
    "Assessment",
  "/:orgCode/student/sections/:sectionCode/assessment/:assessmentId/submitted":
    "Assessment Submitted",
  "/:orgCode/student/:assessmentType/:assessmentId/result":
    "Assessment Results",
  "/:orgCode/student/profile": "Profile",
  "/:orgCode/student/notifications": "Notifications",

  // Auth Routes
  "/login": "Login",
  "/register": "Register",
  "/": "Welcome", // Add a title for the root path

  "/FAQ": "FAQ",
  "/termsandconditions": "Terms And Condition",
  "/privacypolicy": "Privacy and Policy",

  // Default and loading states
  loading: "Loading...", // Add a loading state title
  "*": "Page Not Found",
};

// Default application name to prepend to titles
export const APP_NAME = "ALMA";

// Function to format the full page title
export const formatPageTitle = (title: string): string => {
  return `${title} | ${APP_NAME}`;
};
