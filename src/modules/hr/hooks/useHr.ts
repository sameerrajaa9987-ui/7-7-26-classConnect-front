import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { hrApi } from "@modules/hr/api/hrApi";

export const usePayroll = (month?: string, enabled = true) =>
  useQuery({
    queryKey: ["payroll", month],
    queryFn: () => hrApi.listPayroll(month),
    enabled,
  });
export const useMyPayslips = (enabled = true) =>
  useQuery({
    queryKey: ["my-payslips"],
    queryFn: () => hrApi.myPayslips(),
    enabled,
  });
export const usePayrollSummary = (month?: string, enabled = true) =>
  useQuery({
    queryKey: ["payroll-summary", month],
    queryFn: () => hrApi.payrollSummary(month),
    enabled,
  });
export const useUpsertPayroll = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: any) => hrApi.upsertPayroll(b),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payroll"] });
      qc.invalidateQueries({ queryKey: ["payroll-summary"] });
    },
  });
};
export const useMarkPaid = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hrApi.markPaid(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payroll"] });
      qc.invalidateQueries({ queryKey: ["payroll-summary"] });
    },
  });
};

export const useLeave = (params?: { mine?: boolean; status?: string }) =>
  useQuery({
    queryKey: ["leave", params],
    queryFn: () => hrApi.listLeave(params),
  });
export const useApplyLeave = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: any) => hrApi.applyLeave(b),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leave"] }),
  });
};
export const useReviewLeave = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; body: any }) =>
      hrApi.reviewLeave(v.id, v.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leave"] }),
  });
};
