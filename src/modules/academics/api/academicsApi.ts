import { apiClient } from "@api/apiClient";
import {
  Paginated,
  Subject,
  Classroom,
  Course,
  Batch,
  TimetableEntry,
} from "@modules/academics/types";

type ListParams = Record<string, string | number | boolean | undefined>;

function crud<T>(base: string) {
  return {
    list: async (params?: ListParams) => {
      const res = await apiClient.get<Paginated<T>>(base, { params });
      return res.data;
    },
    get: async (id: string) => {
      const res = await apiClient.get<{ data: T }>(`${base}/${id}`);
      return res.data.data;
    },
    create: async (payload: Record<string, unknown>) => {
      const res = await apiClient.post<{ data: T }>(base, payload);
      return res.data.data;
    },
    update: async (id: string, payload: Record<string, unknown>) => {
      const res = await apiClient.patch<{ data: T }>(`${base}/${id}`, payload);
      return res.data.data;
    },
    remove: async (id: string) => {
      const res = await apiClient.delete(`${base}/${id}`);
      return res.data;
    },
  };
}

export interface TeacherRef {
  id: string;
  name: string;
  role: string;
  roleLabel: string;
}
export const teachersApi = {
  list: async () => {
    const res = await apiClient.get<{ data: TeacherRef[] }>("/users/teachers");
    return res.data.data;
  },
};

export const subjectsApi = crud<Subject>("/subjects");
export const classroomsApi = crud<Classroom>("/classrooms");
export const coursesApi = crud<Course>("/courses");
export const batchesApi = crud<Batch>("/batches");

export const timetableApi = {
  byBatch: async (batchId: string) => {
    const res = await apiClient.get<{ data: TimetableEntry[] }>(
      `/timetable/batch/${batchId}`,
    );
    return res.data.data;
  },
  mine: async () => {
    const res = await apiClient.get<{ data: TimetableEntry[] }>(
      "/timetable/mine",
    );
    return res.data.data;
  },
  create: async (payload: Record<string, unknown>) => {
    const res = await apiClient.post<{ data: TimetableEntry }>(
      "/timetable",
      payload,
    );
    return res.data.data;
  },
  remove: async (id: string) => {
    const res = await apiClient.delete(`/timetable/${id}`);
    return res.data;
  },
};
