export interface Lesson {
  id: string;
  courseId: string;
  courseName: string;
  subjectName: string;
  title: string;
  description: string;
  type: "video" | "document" | "link" | "text";
  url: string;
  content: string;
  durationMinutes: number;
  order: number;
  isPublished: boolean;
  completed?: boolean;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  text: string;
  attachmentUrl: string;
  submittedAt: string;
  isLate: boolean;
  status: "submitted" | "graded";
  marks: number | null;
  feedback: string;
  gradedByName: string;
}

export interface Assignment {
  id: string;
  batchId: string;
  batchName: string;
  courseName: string;
  subjectName: string;
  title: string;
  description: string;
  attachmentUrl: string;
  dueDate: string | null;
  maxMarks: number;
  isPublished: boolean;
  createdByName: string;
  submissionCount?: number;
  gradedCount?: number;
  mySubmission?: Submission | null;
  submissions?: Submission[];
  createdAt: string;
}

export interface QuizQuestion {
  text: string;
  options: string[];
  marks: number;
  correctIndex?: number;
}
export interface Quiz {
  id: string;
  batchId: string;
  batchName: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  totalMarks: number;
  questionCount: number;
  questions?: QuizQuestion[];
  myAttempt?: { score: number; totalMarks: number } | null;
}

export interface Certificate {
  id: string;
  certificateNo: string;
  studentId: string;
  studentName: string;
  courseName: string;
  title: string;
  remark: string;
  issuedDate: string;
  qrValue: string;
}
