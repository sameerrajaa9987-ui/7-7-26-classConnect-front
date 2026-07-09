import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { examsApi } from "@modules/exams/api/examsApi";

export const useExams = (batchId?: string) =>
  useQuery({
    queryKey: ["exams", batchId],
    queryFn: () => examsApi.list(batchId),
  });
export const useExam = (id?: string) =>
  useQuery({
    queryKey: ["exam", id],
    queryFn: () => examsApi.get(id!),
    enabled: !!id,
  });
export const useCreateExam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: any) => examsApi.create(b),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exams"] }),
  });
};
export const useUpdateExam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; body: any }) =>
      examsApi.update(v.id, v.body),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["exams"] });
      qc.invalidateQueries({ queryKey: ["exam", v.id] });
    },
  });
};
export const useDeleteExam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => examsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exams"] }),
  });
};
export const useEnterMarks = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; body: any }) =>
      examsApi.enterMarks(v.id, v.body),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["exam-results", v.id] });
      qc.invalidateQueries({ queryKey: ["exam-analytics", v.id] });
    },
  });
};
export const useExamResults = (id?: string) =>
  useQuery({
    queryKey: ["exam-results", id],
    queryFn: () => examsApi.results(id!),
    enabled: !!id,
  });
export const useExamAnalytics = (id?: string) =>
  useQuery({
    queryKey: ["exam-analytics", id],
    queryFn: () => examsApi.analytics(id!),
    enabled: !!id,
  });
export const useReportCard = (id?: string, studentId?: string) =>
  useQuery({
    queryKey: ["report-card", id, studentId],
    queryFn: () => examsApi.reportCard(id!, studentId!),
    enabled: !!id && !!studentId,
  });
export const useMyReportCard = (id?: string, enabled = true) =>
  useQuery({
    queryKey: ["my-report-card", id],
    queryFn: () => examsApi.myReportCard(id!),
    enabled: !!id && enabled,
    retry: false,
  });
export const usePublishResults = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => examsApi.publish(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exam"] });
      qc.invalidateQueries({ queryKey: ["exams"] });
    },
  });
};
export const usePerformance = (studentId?: string) =>
  useQuery({
    queryKey: ["performance", studentId],
    queryFn: () => examsApi.performance(studentId!),
    enabled: !!studentId,
  });
