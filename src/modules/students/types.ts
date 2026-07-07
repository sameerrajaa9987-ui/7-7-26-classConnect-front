export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}

export interface Guardian {
  relation: string;
  name: string;
  phone: string;
  email: string;
  userId: string | null;
  hasLogin: boolean;
  isPrimary: boolean;
}

export interface StudentListItem {
  id: string;
  admissionNo: string;
  studentId: string;
  rollNo: string;
  fullName: string;
  courseName: string;
  batchName: string;
  phone: string;
  photoUrl: string;
  status: "active" | "inactive" | "alumni" | "dropped";
  hasLogin: boolean;
  createdAt: string;
}

export interface Student {
  id: string;
  admissionNo: string;
  studentId: string;
  rollNo: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gender: "male" | "female" | "other" | "";
  dateOfBirth: string | null;
  bloodGroup: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  photoUrl: string;
  courseId: string | null;
  courseName: string;
  batchId: string | null;
  batchName: string;
  session: string;
  admissionDate: string | null;
  userId: string | null;
  hasLogin: boolean;
  guardians: Guardian[];
  status: "active" | "inactive" | "alumni" | "dropped";
  qrValue: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatedLogin {
  email: string;
  tempPassword: string;
  role: "student" | "parent";
  reused?: boolean;
}
