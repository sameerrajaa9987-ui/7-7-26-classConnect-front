import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Users2,
  BookMarked,
  DoorOpen,
  CalendarDays,
  CalendarCheck2,
  Wallet,
  Layers,
  PlayCircle,
  FileSpreadsheet,
  MessageSquare,
  Megaphone,
  Boxes,
  BadgeIndianRupee,
  Sparkles,
  Bell,
  Users,
  ScrollText,
  Settings,
  UserRound,
  type LucideIcon,
} from "lucide-react-native";
import { PERMISSIONS } from "@shared/permissions";

export interface NavItem {
  name: string;
  label: string;
  icon: LucideIcon;
  /** Visible if the user holds this permission (admins always pass). */
  permission?: string;
  /** Visible if the user holds ANY of these permissions. */
  anyPermissions?: string[];
  /** Visible if the user's role is in this list. */
  roles?: string[];
  /** Visible to Admin only. */
  adminOnly?: boolean;
  /** Optional section heading rendered above this item in the sidebar. */
  section?: string;
}

/**
 * Navigation. Each item is gated by permission so the sidebar reflects exactly
 * what the signed-in user (admin / teacher / accountant / parent / student) can
 * do. Later phases append their modules here.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    name: "Dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    name: "Executive",
    label: "Executive & AI",
    icon: Sparkles,
    anyPermissions: [PERMISSIONS.ANALYTICS_VIEW, PERMISSIONS.REPORTS_VIEW],
  },

  // Phase 3 — Students
  {
    name: "Students",
    label: "Students",
    icon: GraduationCap,
    section: "People",
    anyPermissions: [
      PERMISSIONS.STUDENTS_VIEW,
      PERMISSIONS.STUDENTS_MANAGE,
      PERMISSIONS.ATTENDANCE_VIEW,
      PERMISSIONS.FEES_VIEW,
    ],
  },

  // Phase 4 — Attendance
  {
    name: "Attendance",
    label: "Attendance",
    icon: CalendarCheck2,
    anyPermissions: [
      PERMISSIONS.ATTENDANCE_MANAGE,
      PERMISSIONS.STAFF_ATTENDANCE_MANAGE,
    ],
  },
  {
    name: "Learning",
    label: "Learning",
    icon: PlayCircle,
    anyPermissions: [
      PERMISSIONS.LMS_VIEW,
      PERMISSIONS.LMS_MANAGE,
      PERMISSIONS.ASSIGNMENTS_MANAGE,
      PERMISSIONS.QUIZZES_MANAGE,
    ],
  },
  {
    name: "Exams",
    label: "Exams",
    icon: FileSpreadsheet,
    anyPermissions: [
      PERMISSIONS.EXAMS_VIEW,
      PERMISSIONS.EXAMS_MANAGE,
      PERMISSIONS.MARKS_MANAGE,
    ],
  },
  {
    name: "Fees",
    label: "Fees",
    icon: Wallet,
    anyPermissions: [
      PERMISSIONS.FEES_VIEW,
      PERMISSIONS.FEES_MANAGE,
      PERMISSIONS.PAYMENTS_MANAGE,
    ],
  },
  {
    name: "FeeStructures",
    label: "Fee Structures",
    icon: Layers,
    permission: PERMISSIONS.FEES_MANAGE,
  },
  // Phase 8 — Communication
  {
    name: "Messages",
    label: "Messages",
    icon: MessageSquare,
    section: "Communication",
    permission: PERMISSIONS.COMMUNICATION_VIEW,
  },
  {
    name: "Announcements",
    label: "Announcements",
    icon: Megaphone,
    permission: PERMISSIONS.COMMUNICATION_VIEW,
  },
  {
    name: "Notifications",
    label: "Notifications",
    icon: Bell,
    // Everyone gets their own notification inbox.
  },

  // Phase 2 — Academics
  {
    name: "Courses",
    label: "Courses",
    icon: BookOpen,
    section: "Academics",
    anyPermissions: [PERMISSIONS.COURSES_VIEW, PERMISSIONS.COURSES_MANAGE],
  },
  {
    name: "Batches",
    label: "Batches",
    icon: Users2,
    anyPermissions: [
      PERMISSIONS.BATCHES_MANAGE,
      PERMISSIONS.ATTENDANCE_VIEW,
      PERMISSIONS.STUDENTS_VIEW,
    ],
  },
  {
    name: "Subjects",
    label: "Subjects",
    icon: BookMarked,
    permission: PERMISSIONS.COURSES_MANAGE,
  },
  {
    name: "Rooms",
    label: "Rooms",
    icon: DoorOpen,
    permission: PERMISSIONS.BATCHES_MANAGE,
  },
  {
    name: "Timetable",
    label: "Timetable",
    icon: CalendarDays,
    anyPermissions: [PERMISSIONS.TIMETABLE_VIEW, PERMISSIONS.TIMETABLE_MANAGE],
  },

  // Phase 9 — Operations
  {
    name: "Inventory",
    label: "Inventory",
    icon: Boxes,
    section: "Operations",
    anyPermissions: [PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_MANAGE],
  },
  {
    name: "HR",
    label: "HR & Payroll",
    icon: BadgeIndianRupee,
    // Staff/teachers see it to apply for leave; managers get payroll + review.
    roles: ["admin", "staff", "teacher"],
  },

  // Administration
  {
    name: "Team",
    label: "Team & Access",
    icon: Users,
    section: "Administration",
    adminOnly: true,
  },
  {
    name: "AuditLog",
    label: "Audit Logs",
    icon: ScrollText,
    permission: PERMISSIONS.AUDIT_VIEW,
  },
  { name: "Settings", label: "Settings", icon: Settings, adminOnly: true },
  { name: "Profile", label: "Profile", icon: UserRound },
];
