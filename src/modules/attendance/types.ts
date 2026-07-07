export type AttStatus = "present" | "absent" | "late" | "leave" | "unmarked";

export interface RosterStudent {
  studentId: string;
  name: string;
  admissionNo: string;
  rollNo: string;
  status: AttStatus;
  remark: string;
}

export interface Roster {
  batch: { id: string; name: string; courseName: string };
  date: string;
  students: RosterStudent[];
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  leave: number;
  total: number;
  percent: number;
}

export interface AttendanceRecord {
  status: "present" | "absent" | "late" | "leave";
  date: string;
  batchName: string;
  remark: string;
}

export interface StudentHistory {
  student: { id: string; name: string };
  records: AttendanceRecord[];
  summary: AttendanceSummary;
}

export interface StaffRosterMember {
  userId: string;
  name: string;
  roleLabel: string;
  status: "present" | "absent" | "late" | "leave" | "half_day" | "unmarked";
  checkIn: string;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  tone: "info" | "success" | "warning" | "danger";
  read: boolean;
  createdAt: string;
}
