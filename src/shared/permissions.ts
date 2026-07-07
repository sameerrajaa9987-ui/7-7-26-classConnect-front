/**
 * Frontend mirror of the backend permission catalogue (config/roles.js). Keys
 * MUST match the server exactly — the server is the source of truth and enforces
 * every gate; this map only drives the UI (nav visibility, permission editor).
 */
export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard.view",

  COURSES_VIEW: "courses.view",
  COURSES_MANAGE: "courses.manage",
  BATCHES_MANAGE: "batches.manage",
  TIMETABLE_VIEW: "timetable.view",
  TIMETABLE_MANAGE: "timetable.manage",

  STUDENTS_VIEW: "students.view",
  STUDENTS_MANAGE: "students.manage",
  ADMISSIONS_MANAGE: "admissions.manage",

  ATTENDANCE_VIEW: "attendance.view",
  ATTENDANCE_MANAGE: "attendance.manage",
  STAFF_ATTENDANCE_MANAGE: "staff_attendance.manage",

  FEES_VIEW: "fees.view",
  FEES_MANAGE: "fees.manage",
  PAYMENTS_MANAGE: "payments.manage",

  LMS_VIEW: "lms.view",
  LMS_MANAGE: "lms.manage",
  ASSIGNMENTS_MANAGE: "assignments.manage",
  QUIZZES_MANAGE: "quizzes.manage",

  EXAMS_VIEW: "exams.view",
  EXAMS_MANAGE: "exams.manage",
  MARKS_MANAGE: "marks.manage",

  COMMUNICATION_VIEW: "communication.view",
  COMMUNICATION_MANAGE: "communication.manage",

  INVENTORY_VIEW: "inventory.view",
  INVENTORY_MANAGE: "inventory.manage",

  HR_VIEW: "hr.view",
  HR_MANAGE: "hr.manage",
  PAYROLL_MANAGE: "payroll.manage",

  REPORTS_VIEW: "reports.view",
  ANALYTICS_VIEW: "analytics.view",

  MANAGE_USERS: "users.manage",
  AUDIT_VIEW: "audit.view",
  SETTINGS_MANAGE: "settings.manage",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Human labels + grouping for the permission editor. */
export const PERMISSION_META: Record<
  string,
  { label: string; group: string; description: string }
> = {
  "dashboard.view": {
    label: "Dashboard",
    group: "Overview",
    description: "View the dashboard",
  },

  "courses.view": {
    label: "View Courses",
    group: "Academics",
    description: "Read programs, courses & subjects",
  },
  "courses.manage": {
    label: "Manage Courses",
    group: "Academics",
    description: "Create/edit programs, courses & subjects",
  },
  "batches.manage": {
    label: "Manage Batches",
    group: "Academics",
    description: "Batches, classes, sections & classrooms",
  },
  "timetable.view": {
    label: "View Timetable",
    group: "Academics",
    description: "Read the timetable",
  },
  "timetable.manage": {
    label: "Manage Timetable",
    group: "Academics",
    description: "Create & edit the timetable",
  },

  "students.view": {
    label: "View Students",
    group: "Students",
    description: "Read student profiles",
  },
  "students.manage": {
    label: "Manage Students",
    group: "Students",
    description: "Create/edit student profiles",
  },
  "admissions.manage": {
    label: "Admissions",
    group: "Students",
    description: "Process new admissions",
  },

  "attendance.view": {
    label: "View Attendance",
    group: "Attendance",
    description: "Read attendance records",
  },
  "attendance.manage": {
    label: "Mark Attendance",
    group: "Attendance",
    description: "Take & edit student attendance",
  },
  "staff_attendance.manage": {
    label: "Staff Attendance",
    group: "Attendance",
    description: "Mark teacher/staff attendance",
  },

  "fees.view": {
    label: "View Fees",
    group: "Fees & Accounts",
    description: "Read fee structures & dues",
  },
  "fees.manage": {
    label: "Manage Fees",
    group: "Fees & Accounts",
    description: "Fee structures, plans & invoices",
  },
  "payments.manage": {
    label: "Collect Payments",
    group: "Fees & Accounts",
    description: "Record payments & receipts",
  },

  "lms.view": {
    label: "View Learning",
    group: "LMS",
    description: "Access courses & study material",
  },
  "lms.manage": {
    label: "Manage Learning",
    group: "LMS",
    description: "Create courses, lessons & material",
  },
  "assignments.manage": {
    label: "Assignments",
    group: "LMS",
    description: "Create & grade assignments",
  },
  "quizzes.manage": {
    label: "Quizzes & Tests",
    group: "LMS",
    description: "Create & grade quizzes",
  },

  "exams.view": {
    label: "View Exams",
    group: "Examinations",
    description: "Read exams & results",
  },
  "exams.manage": {
    label: "Manage Exams",
    group: "Examinations",
    description: "Schedule exams",
  },
  "marks.manage": {
    label: "Marks Entry",
    group: "Examinations",
    description: "Enter marks & report cards",
  },

  "communication.view": {
    label: "View Messages",
    group: "Communication",
    description: "Read announcements & messages",
  },
  "communication.manage": {
    label: "Send Communication",
    group: "Communication",
    description: "Send announcements & messages",
  },

  "inventory.view": {
    label: "View Inventory",
    group: "Inventory & Assets",
    description: "Read assets & stock",
  },
  "inventory.manage": {
    label: "Manage Inventory",
    group: "Inventory & Assets",
    description: "Manage assets, stock & maintenance",
  },

  "hr.view": {
    label: "View HR",
    group: "HR & Payroll",
    description: "Read staff records",
  },
  "hr.manage": {
    label: "Manage HR",
    group: "HR & Payroll",
    description: "Staff records & leave",
  },
  "payroll.manage": {
    label: "Payroll",
    group: "HR & Payroll",
    description: "Run payroll",
  },

  "reports.view": {
    label: "Reports",
    group: "Insights",
    description: "View & export reports",
  },
  "analytics.view": {
    label: "AI Analytics",
    group: "Insights",
    description: "View AI insights & predictions",
  },

  "audit.view": {
    label: "Audit Logs",
    group: "Administration",
    description: "Read the audit trail",
  },
  "users.manage": {
    label: "User Management",
    group: "Administration",
    description: "Admin-only",
  },
  "settings.manage": {
    label: "Settings",
    group: "Administration",
    description: "Admin-only",
  },
};
