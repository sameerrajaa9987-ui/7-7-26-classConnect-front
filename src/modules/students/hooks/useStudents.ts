import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentsApi } from "@modules/students/api/studentsApi";

type Params = Record<string, string | number | boolean | undefined>;

export const useStudents = (params?: Params) =>
  useQuery({
    queryKey: ["students", params],
    queryFn: () => studentsApi.list(params),
  });

export const useStudent = (id?: string) =>
  useQuery({
    queryKey: ["student", id],
    queryFn: () => studentsApi.get(id!),
    enabled: !!id,
  });

export const useSaveStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id?: string; body: Record<string, unknown> }) =>
      v.id ? studentsApi.update(v.id, v.body) : studentsApi.admit(v.body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["student"] });
      qc.invalidateQueries({ queryKey: ["batches"] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });
};

export const useCreateStudentLogin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: {
      id: string;
      type: "student" | "parent";
      guardianIndex?: number;
    }) =>
      studentsApi.createLogin(v.id, {
        type: v.type,
        guardianIndex: v.guardianIndex,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["student"] }),
  });
};
