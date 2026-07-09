import { apiClient } from "@api/apiClient";
import {
  Lesson,
  Assignment,
  Submission,
  Quiz,
  Certificate,
} from "@modules/lms/types";

const g = <T>(p: string, params?: any) =>
  apiClient.get<{ data: T }>(p, { params }).then((r) => r.data.data);
const post = <T>(p: string, body?: any) =>
  apiClient.post<{ data: T }>(p, body).then((r) => r.data.data);
const patch = <T>(p: string, body?: any) =>
  apiClient.patch<{ data: T }>(p, body).then((r) => r.data.data);
const del = <T = any>(p: string) =>
  apiClient.delete<{ data: T }>(p).then((r) => r.data.data);

export const lmsApi = {
  // Lessons
  listLessons: (courseId?: string) => g<Lesson[]>("/lms/lessons", { courseId }),
  createLesson: (body: any) => post<Lesson>("/lms/lessons", body),
  updateLesson: (id: string, body: any) =>
    patch<Lesson>(`/lms/lessons/${id}`, body),
  removeLesson: (id: string) => del(`/lms/lessons/${id}`),
  completeLesson: (id: string) =>
    post<{ total: number; completed: number; percent: number }>(
      `/lms/lessons/${id}/complete`,
    ),
  // Assignments
  listAssignments: (batchId?: string) =>
    g<Assignment[]>("/lms/assignments", { batchId }),
  createAssignment: (body: any) => post<Assignment>("/lms/assignments", body),
  updateAssignment: (id: string, body: any) =>
    patch<Assignment>(`/lms/assignments/${id}`, body),
  removeAssignment: (id: string) => del(`/lms/assignments/${id}`),
  getAssignment: (id: string) => g<Assignment>(`/lms/assignments/${id}`),
  submitAssignment: (id: string, body: any) =>
    post<Submission>(`/lms/assignments/${id}/submit`, body),
  gradeSubmission: (id: string, body: any) =>
    post<Submission>(`/lms/submissions/${id}/grade`, body),
  // Quizzes
  listQuizzes: (batchId?: string) => g<Quiz[]>("/lms/quizzes", { batchId }),
  createQuiz: (body: any) => post<Quiz>("/lms/quizzes", body),
  updateQuiz: (id: string, body: any) =>
    patch<Quiz>(`/lms/quizzes/${id}`, body),
  removeQuiz: (id: string) => del(`/lms/quizzes/${id}`),
  getQuiz: (id: string) => g<Quiz>(`/lms/quizzes/${id}`),
  attemptQuiz: (id: string, answers: number[]) =>
    post<{
      score: number;
      totalMarks: number;
      correctCount: number;
      totalQuestions: number;
    }>(`/lms/quizzes/${id}/attempt`, { answers }),
  quizResults: (id: string) => g<any>(`/lms/quizzes/${id}/results`),
  // Certificates
  listCertificates: (studentId?: string) =>
    g<Certificate[]>("/lms/certificates", { studentId }),
  issueCertificate: (body: any) => post<Certificate>("/lms/certificates", body),
};
