import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  subjectsApi,
  classroomsApi,
  coursesApi,
  batchesApi,
  timetableApi,
  teachersApi,
} from "@modules/academics/api/academicsApi";

type Params = Record<string, string | number | boolean | undefined>;

// ---- Teacher directory (for assignment selects) ----
export const useTeachers = () =>
  useQuery({
    queryKey: ["teachers-directory"],
    queryFn: () => teachersApi.list(),
  });

// ---- Subjects ----
export const useSubjects = (params?: Params) =>
  useQuery({
    queryKey: ["subjects", params],
    queryFn: () => subjectsApi.list(params),
  });
export const useSaveSubject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id?: string; body: Record<string, unknown> }) =>
      v.id ? subjectsApi.update(v.id, v.body) : subjectsApi.create(v.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });
};

// ---- Classrooms ----
export const useClassrooms = (params?: Params) =>
  useQuery({
    queryKey: ["classrooms", params],
    queryFn: () => classroomsApi.list(params),
  });
export const useSaveClassroom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id?: string; body: Record<string, unknown> }) =>
      v.id ? classroomsApi.update(v.id, v.body) : classroomsApi.create(v.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["classrooms"] }),
  });
};

// ---- Courses ----
export const useCourses = (params?: Params) =>
  useQuery({
    queryKey: ["courses", params],
    queryFn: () => coursesApi.list(params),
  });
export const useSaveCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id?: string; body: Record<string, unknown> }) =>
      v.id ? coursesApi.update(v.id, v.body) : coursesApi.create(v.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
};

// ---- Batches ----
export const useBatches = (params?: Params) =>
  useQuery({
    queryKey: ["batches", params],
    queryFn: () => batchesApi.list(params),
  });
export const useBatch = (id?: string) =>
  useQuery({
    queryKey: ["batch", id],
    queryFn: () => batchesApi.get(id!),
    enabled: !!id,
  });
export const useSaveBatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id?: string; body: Record<string, unknown> }) =>
      v.id ? batchesApi.update(v.id, v.body) : batchesApi.create(v.body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["batches"] });
      qc.invalidateQueries({ queryKey: ["batch"] });
    },
  });
};

// ---- Timetable ----
export const useBatchTimetable = (batchId?: string) =>
  useQuery({
    queryKey: ["timetable", "batch", batchId],
    queryFn: () => timetableApi.byBatch(batchId!),
    enabled: !!batchId,
  });
export const useMyTimetable = () =>
  useQuery({
    queryKey: ["timetable", "mine"],
    queryFn: () => timetableApi.mine(),
  });
export const useSaveTimetableEntry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => timetableApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["timetable"] }),
  });
};
export const useDeleteTimetableEntry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => timetableApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["timetable"] }),
  });
};
