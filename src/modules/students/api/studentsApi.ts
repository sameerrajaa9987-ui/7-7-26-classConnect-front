import { apiClient } from "@api/apiClient";
import {
  Paginated,
  Student,
  StudentListItem,
  CreatedLogin,
} from "@modules/students/types";

type ListParams = Record<string, string | number | boolean | undefined>;

export const studentsApi = {
  list: async (params?: ListParams) => {
    const res = await apiClient.get<Paginated<StudentListItem>>("/students", {
      params,
    });
    return res.data;
  },
  get: async (id: string) => {
    const res = await apiClient.get<{ data: Student }>(`/students/${id}`);
    return res.data.data;
  },
  admit: async (payload: Record<string, unknown>) => {
    const res = await apiClient.post<{ data: Student }>("/students", payload);
    return res.data.data;
  },
  update: async (id: string, payload: Record<string, unknown>) => {
    const res = await apiClient.patch<{ data: Student }>(
      `/students/${id}`,
      payload,
    );
    return res.data.data;
  },
  remove: async (id: string) => {
    const res = await apiClient.delete(`/students/${id}`);
    return res.data;
  },
  createLogin: async (
    id: string,
    body: { type: "student" | "parent"; guardianIndex?: number },
  ) => {
    const res = await apiClient.post<{ data: CreatedLogin }>(
      `/students/${id}/create-login`,
      body,
    );
    return res.data.data;
  },
};
