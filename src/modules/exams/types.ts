export interface ExamSubject {
  subjectId: string;
  subjectName: string;
  maxMarks: number;
  passMarks: number;
  examDate: string | null;
}
export interface Exam {
  id: string;
  name: string;
  batchId: string;
  batchName: string;
  courseName: string;
  examType: string;
  session: string;
  startDate: string | null;
  endDate: string | null;
  subjects: ExamSubject[];
  totalMaxMarks: number;
  resultsPublished: boolean;
  createdByName: string;
  createdAt: string;
}

export interface ResultSubject {
  subjectId: string;
  subjectName: string;
  maxMarks: number;
  passMarks: number;
  marksObtained: number | null;
  isAbsent: boolean;
  grade: string;
  passed: boolean | null;
}
export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  subjects: ResultSubject[];
  totalMax: number;
  totalObtained: number;
  percentage: number;
  overallGrade: string;
  gpa: number;
  status: "pass" | "fail" | "incomplete";
  rank: number | null;
  remark: string;
}

export interface ExamAnalytics {
  exam: { id: string; name: string; batchName: string; totalMaxMarks: number };
  appeared: number;
  passPercent: number;
  classAverage: number;
  topper: { name: string; percentage: number } | null;
  subjects: { name: string; avgPercent: number; count: number }[];
  weakStudents: {
    studentId: string;
    name: string;
    percentage: number;
    status: string;
  }[];
}

export interface Performance {
  studentId: string;
  trend: {
    examName: string;
    percentage: number;
    grade: string;
    status: string;
  }[];
  average: number;
  examCount: number;
}
