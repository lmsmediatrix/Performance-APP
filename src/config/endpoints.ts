export const API_ENDPOINTS = {
  BASE_URL: import.meta.env.VITE_BASE_URL || "http://localhost:8080/api",
  LMS_URL: import.meta.env.VITE_LMS_BASE_URL || "http://localhost:5000/api",

  // User API endpoint
  USER: {
    GET_ALL: "/user/get/all",
    GET_BY_ID: "/user/get/:id",
    CREATE: "/user/create",
    UPDATE: "/user/update",
    REMOVE: "/user/remove/:id",
    LOGIN: "/user/login",
    LOGOUT: "/user/logout",
    CHECKLOGIN: "/current/user",
    SEARCH: "/user/search",
    UPLOAD: "/user/upload-image/:id",
    METRICS: "/user/metrics",
    RESET_PASSWORD: "/user/reset-password",
  },

  // Organization | University Endpoint
  ORGANIZATION: {
    GET_ALL: "/organization/get/all",
    GET_BY_ID: "/organization/get/:id",
    GET_BY_CODE: "/organization/code/:code",
    CREATE: "/organization/create",
    UPDATE: "/organization/update",
    REMOVE: "/organization/remove/:id",
    ARCHIVE: "/organization/archive/:id",
    SEARCH: "/organization/search",
    DASHBOARD: "/organization/dashboard/:id",
    CODE: "/organization/code",

    ORG_SETUP: "/bulk/create",
  },

  //Student Endpoint
  STUDENT: {
    GET_ALL: "/student/get/all",
    GET_BY_ID: "/student/get/:id",
    CREATE: "/student/create",
    UPDATE: "/student/update",
    REMOVE: "/student/remove/:id",
    ARCHIVE: "/student/archive/:id",
    SEARCH: "/student/search",
    BULK_IMPORT: "/student/import",
    EXPORT: "/student/export",
    DASHBOARD: "/student/dashboard",
    DASHBOARD_MOCKUP: "/student/dashboard",
    STUDENT_CALENDAR: "/student/calendar/:id",
    STUDENT_CALENDAR_MOCKUP: "/student/calendar/",
    STUDENT_GRADE_BY_SECTION: "/student/grade/section/:sectionCode",
    EXPORT_STUDENT_GRADE: "/student/grade/section/:sectionCode/export",
  },

  INSTRUCTOR: {
    GET_ALL: "/instructor/get/all",
    GET_BY_ID: "/instructor/get/:id",
    CREATE: "/instructor/create",
    UPDATE: "/instructor/update",
    REMOVE: "/instructor/remove/:id",
    ARCHIVE: "/instructor/archive/:id",
    SEARCH: "/instructor/search",
    BULK_IMPORT: "/instructor/import",
    DASHBOARD: "/instructor/dashboard",
    INSTRUCTOR_DASHBOARD: "/instructor/dashboard/:id",
    EXPORT: "/instructor/export",
  },

  // Course API Endpoint
  COURSE: {
    GET_ALL: "/course/get/all",
    GET_BY_ID: "/course/get/:id",
    CREATE: "/course/create",
    UPDATE: "/course/update",
    REMOVE: "/course/remove/:id",
    ARCHIVE: "/course/archive/:id",
    SEARCH: "/course/search",
    BULK_CREATE: "/course/create/bulk",
    EXPORT: "/course/export",
  },

  // Section API Endpoint
  SECTION: {
    GET_ALL: "/section/get/all",
    GET_BY_ID: "/section/get/:id",
    CREATE: "/section/create",
    UPDATE: "/section/update",
    REMOVE: "/section/remove/:id",
    ARCHIVE: "/section/archive/:id",
    SEARCH: "/section/search",
    EXPORT: "/section/export",
    MARK_ATTENDANCE: "/section/attendance",
    UPDATE_ATTENDANCE: "/section/attendance/update",
    SECTION_MODULE: "/section/:sectionCode/module",
    SECTION_ATTENDANCE: "/section/:sectionCode/attendance",
    SECTION_ASSESSMENT: "/section/:sectionCode/assessment",
    SECTION_ANNOUNCEMENT: "/section/:sectionCode/announcement",
    SECTION_STUDENT: "/section/:sectionCode/student",
    SECTION_GRADE_SYSTEM: "/section/:sectionCode/grade/system",
    SECTION_STUDENT_GRADES: "/section/:sectionCode/grades",
    SECTION_STUDENT_GRADES_ANALYTICS: "/section/:sectionCode/analytics",
    REMOVE_STUDENT_IN_SECTION:
      "/section/:sectionCode/student/remove/:studentId",
    HELPER_CODE: "/section/code",
    SECTION_STUDENT_EXPORT: "/section/:sectionCode/student/export",
    SECTION_STUDENT_GRADES_EXPORT: "/section/:sectionCode/grades/export",
    ADD_STUDENTS_TO_SECTION_BY_CODE: "/section/:sectionCode/add/students",
    BULK_ADD_STUDENTS: "/section/:sectionCode/add/students/bulk",
    SCHEDULE: "/section/schedule",
  },

  MODULE: {
    GET_ALL: "/module/get/all",
    GET_BY_ID: "/module/get/:id",
    CREATE: "/module/create",
    UPDATE: "/module/update",
    REMOVE: "/module/remove/:id",
    SEARCH: "/module/search",
  },

  // Lesson API Endpoint
  LESSON: {
    GET_ALL: "/lesson/get/all",
    GET_BY_ID: "/lesson/get/:id",
    CREATE: "/lesson/create",
    UPDATE: "/lesson/update",
    REMOVE: "/lesson/remove/:id",
    SEARCH: "/lesson/search",
  },

  ANNOUNCEMENT: {
    GET_ALL: "/announcement/get/all",
    GET_BY_ID: "/announcement/get/:id",
    CREATE: "/announcement/create",
    UPDATE: "/announcement/update",
    REMOVE: "/announcement/remove/:id",
    SEARCH: "/announcement/search",
  },

  ASSESSMENT: {
    GET_ALL: "/assessment/get/all",
    GET_BY_ID: "/assessment/get/:id",
    CREATE: "/assessment/create",
    UPDATE: "/assessment/update",
    REMOVE: "/assessment/remove/:id",
    ARCHIVE: "/assessment/archive/:id",
    SEARCH: "/assessment/search",
    SUBMIT_ASSESSMENT: "/assessment/submit",
    BULK_IMPORT_QUESTIONS: "/assessment/bulk-import-questions/:id",
    GET_SECTION_ASSESSMENT_STUDENTS:
      "/assessment/:assessmentId/section/:sectionCode",
    GET_STUDENT_ASSESSMENT_RESULT:
      "/assessment/:assessmentNo/student/:studentId",
    UPDATE_STUDENT_RESULT: "/assessment/:assessmentId/student/:studentId",
  },

  ATTENDANCE: {
    GET_ALL: "/attendance/get/all",
    GET_BY_ID: "/attendance/get/:id",
    CREATE: "/attendance/create",
    UPDATE: "/attendance/update",
    REMOVE: "/attendance/remove/:id",
    SEARCH: "/attendance/search",
  },

  GRADE: {
    GET_ALL: "/grade/get/all",
    GET_BY_ID: "/grade/get/:id",
    CREATE: "/grade/create",
    UPDATE: "/grade/update",
    REMOVE: "/grade/remove/:id",
    SEARCH: "/grade/search",
  },

  // Attachments API Endpoint
  ATTACHMENT: {
    UPLOAD: "/attachment/upload",
    REMOVE: "/attachment/remove/:id",
  },

  // Notification API Endpoint
  NOTIFICATION: {
    GET_ALL: "/notification/get/all",
    GET_BY_ID: "/notification/get/:id",
    UPDATE: "/notification/update",
    SEARCH: "/notification/search",
    MARK_READ: "/notification/read",
    ARCHIVE: "/notification/archive/:id",
  },
  // Metrics API Endpoint
  METRICS: {
    SEARCH: "/metric/search",
    GET_ORGANIZATION_DASHBOARD: "/metric/organization/dashboard",
  },
  // Activity Log API Endpoint
  ACTIVITY_LOG: {
    GET_ALL: "/activity/get/all",
    GET_BY_ID: "/activity/get/:id",
    CREATE: "/activity/create",
    UPDATE: "/activity/update",
    DELETE: "/activity/delete/:id",
    SEARCH: "/activity/search",
    EXPORT: "/activity/export",
  },

  AUDIT_LOG: {
    GET_ALL: "/audit/get/all",
    GET_BY_ID: "/audit/get/:id",
    CREATE: "/audit/create",
    UPDATE: "/audit/update",
    DELETE: "/audit/delete/:id",
    SEARCH: "/audit/search",
    EXPORT: "/audit/export",
  },

  VOUCHER: {
    GET_ALL: "/voucher/get/all",
    GET_BY_ID: "/voucher/get/:id",
    CREATE: "/voucher/create",
    UPDATE: "/voucher/update",
    REMOVE: "/voucher/remove/:id",
    SEARCH: "/voucher/search",
    BULK_CREATE: "/voucher/create/bulk",
  },
  CLOUDINARY: {
    UPLOAD_IMAGE: "/cloudinary/upload/image",
    UPLOAD_MULTIPLE: "/cloudinary/upload/multiple",
    UPLOAD_DOCUMENT: "/cloudinary/upload/document",
    DELETE: "/cloudinary/delete",
  },
  FACULTY: {
    GET_ALL: "/faculty/get/all",
    GET_BY_ID: "/faculty/get/:id",
    CREATE: "/faculty/create",
    UPDATE: "/faculty/update",
    REMOVE: "/faculty/remove/:id",
    SEARCH: "/faculty/search",
    EXPORT: "/faculty/export",
    CODE: "/faculty/code",
  },

  CATEGORY: {
    GET_ALL: "/category/get/all",
    GET_BY_ID: "/category/get/:id",
    CREATE: "/category/create",
    UPDATE: "/category/update",
    REMOVE: "/category/remove/:id",
    SEARCH: "/category/search",
  },

  PROGRAM: {
    GET_ALL: "/program/get/all",
    GET_BY_ID: "/program/get/:id",
    CREATE: "/program/create",
    UPDATE: "/program/update",
    REMOVE: "/program/remove/:id",
    SEARCH: "/program/search",
  },

  CHECKLIST_TEMPLATE: {
    GET_ALL: "/checklist-template/get/all",
    GET_BY_ID: "/checklist-template/get/:id",
    CREATE: "/checklist-template/create",
    UPDATE: "/checklist-template/update",
    ARCHIVE: "/checklist-template/archive/:id",
    ADD_ITEM: "/checklist-template/:templateId/item",
    UPDATE_ITEM: "/checklist-template/:templateId/item/:itemId",
    REMOVE_ITEM: "/checklist-template/:templateId/item/:itemId",
  },

  EMPLOYEE_CHECKLIST: {
    GET_ALL: "/employee-checklist/get/all",
    GET_BY_ID: "/employee-checklist/get/:id",
    CREATE: "/employee-checklist/create",
    UPDATE: "/employee-checklist/update",
    ARCHIVE: "/employee-checklist/archive/:id",
    SEARCH: "/employee-checklist/search",
  },

  //... Add more API endpoints here
};
