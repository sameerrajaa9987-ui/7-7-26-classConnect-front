import { apiClient } from "@api/apiClient";
import { Payslip, PayrollSummary, LeaveRequest } from "@modules/hr/types";

export const hrApi = {
  listPayroll: (month?: string) =>
    apiClient
      .get<{ data: Payslip[] }>("/hr/payroll", { params: { month } })
      .then((r) => r.data.data),
  myPayslips: () =>
    apiClient
      .get<{ data: Payslip[] }>("/hr/payroll/mine")
      .then((r) => r.data.data),
  payrollSummary: (month?: string) =>
    apiClient
      .get<{ data: PayrollSummary }>("/hr/payroll/summary", {
        params: { month },
      })
      .then((r) => r.data.data),
  upsertPayroll: (body: any) =>
    apiClient
      .post<{ data: Payslip }>("/hr/payroll", body)
      .then((r) => r.data.data),
  markPaid: (id: string) =>
    apiClient
      .post<{ data: Payslip }>(`/hr/payroll/${id}/paid`)
      .then((r) => r.data.data),

  listLeave: (params?: { mine?: boolean; status?: string }) =>
    apiClient
      .get<{ data: LeaveRequest[] }>("/hr/leave", { params })
      .then((r) => r.data.data),
  applyLeave: (body: any) =>
    apiClient
      .post<{ data: LeaveRequest }>("/hr/leave", body)
      .then((r) => r.data.data),
  reviewLeave: (id: string, body: any) =>
    apiClient
      .post<{ data: LeaveRequest }>(`/hr/leave/${id}/review`, body)
      .then((r) => r.data.data),
};
