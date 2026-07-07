export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  type: "theory" | "practical" | "both";
  description: string;
  isActive: boolean;
}

export interface Classroom {
  id: string;
  name: string;
  code: string;
  type: "classroom" | "lab" | "hall" | "auditorium" | "other";
  capacity: number;
  building: string;
  floor: string;
  isActive: boolean;
}

export interface CourseSubjectRef {
  subjectId: string;
  subjectName: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  durationMonths: number;
  subjects: CourseSubjectRef[];
  subjectCount: number;
  isActive: boolean;
}

export interface BatchSubjectRef {
  subjectId: string;
  subjectName: string;
  teacherId: string | null;
  teacherName: string;
}

export interface Batch {
  id: string;
  name: string;
  code: string;
  courseId: string | null;
  courseName: string;
  session: string;
  classTeacherId: string | null;
  classTeacherName: string;
  roomId: string | null;
  roomName: string;
  subjects: BatchSubjectRef[];
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  startDate: string | null;
  endDate: string | null;
  capacity: number;
  enrolledCount: number;
  status: "upcoming" | "active" | "completed";
  isActive: boolean;
}

export interface TimetableEntry {
  id: string;
  batchId: string | null;
  batchName: string;
  courseName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subjectId: string | null;
  subjectName: string;
  teacherId: string | null;
  teacherName: string;
  roomId: string | null;
  roomName: string;
}

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
