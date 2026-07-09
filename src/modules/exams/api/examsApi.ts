import { apiClient } from "@api/apiClient";
import {
  Exam,
  ExamResult,
  ExamAnalytics,
  Performance,
} from "@modules/exams/types";

const g = <T>(p: string, params?: any) =>
  apiClient.get<{ data: T }>(p, { params }).then((r) => r.data.data);

export const examsApi = {
  list: (batchId?: string) => g<Exam[]>("/exams", { batchId }),
  create: (body: any) =>
    apiClient.post<{ data: Exam }>("/exams", body).then((r) => r.data.data),
  update: (id: string, body: any) =>
    apiClient
      .patch<{ data: Exam }>(`/exams/${id}`, body)
      .then((r) => r.data.data),
  remove: (id: string) =>
    apiClient.delete(`/exams/${id}`).then((r) => r.data.data),
  get: (id: string) => g<Exam>(`/exams/${id}`),
  enterMarks: (id: string, body: any) =>
    apiClient.post(`/exams/${id}/marks`, body).then((r) => r.data.data),
  results: (id: string) => g<ExamResult[]>(`/exams/${id}/results`),
  analytics: (id: string) => g<ExamAnalytics>(`/exams/${id}/analytics`),
  reportCard: (id: string, studentId: string) =>
    g<{ exam: Exam; result: ExamResult }>(`/exams/${id}/result/${studentId}`),
  myReportCard: (id: string) =>
    g<{ exam: Exam; result: ExamResult }>(`/exams/${id}/my-result`),
  publish: (id: string) =>
    apiClient.post(`/exams/${id}/publish`).then((r) => r.data.data),
  performance: (studentId: string) =>
    g<Performance>(`/exams/performance/${studentId}`),
};
