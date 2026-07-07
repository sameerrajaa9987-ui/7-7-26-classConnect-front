import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lmsApi } from "@modules/lms/api/lmsApi";

export const useLessons = (courseId?: string) =>
  useQuery({
    queryKey: ["lessons", courseId],
    queryFn: () => lmsApi.listLessons(courseId),
  });
export const useCreateLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: any) => lmsApi.createLesson(b),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lessons"] }),
  });
};
export const useCompleteLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => lmsApi.completeLesson(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lessons"] }),
  });
};

export const useAssignments = (batchId?: string) =>
  useQuery({
    queryKey: ["assignments", batchId],
    queryFn: () => lmsApi.listAssignments(batchId),
  });
export const useAssignment = (id?: string) =>
  useQuery({
    queryKey: ["assignment", id],
    queryFn: () => lmsApi.getAssignment(id!),
    enabled: !!id,
  });
export const useCreateAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: any) => lmsApi.createAssignment(b),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assignments"] }),
  });
};
export const useSubmitAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; body: any }) =>
      lmsApi.submitAssignment(v.id, v.body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments"] });
      qc.invalidateQueries({ queryKey: ["assignment"] });
    },
  });
};
export const useGradeSubmission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; body: any }) =>
      lmsApi.gradeSubmission(v.id, v.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assignment"] }),
  });
};

export const useQuizzes = (batchId?: string) =>
  useQuery({
    queryKey: ["quizzes", batchId],
    queryFn: () => lmsApi.listQuizzes(batchId),
  });
export const useQuiz = (id?: string) =>
  useQuery({
    queryKey: ["quiz", id],
    queryFn: () => lmsApi.getQuiz(id!),
    enabled: !!id,
  });
export const useCreateQuiz = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: any) => lmsApi.createQuiz(b),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quizzes"] }),
  });
};
export const useAttemptQuiz = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; answers: number[] }) =>
      lmsApi.attemptQuiz(v.id, v.answers),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quizzes"] });
      qc.invalidateQueries({ queryKey: ["quiz"] });
    },
  });
};

export const useCertificates = () =>
  useQuery({
    queryKey: ["certificates"],
    queryFn: () => lmsApi.listCertificates(),
  });
export const useIssueCertificate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: any) => lmsApi.issueCertificate(b),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["certificates"] }),
  });
};
