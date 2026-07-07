export interface Payslip {
  id: string;
  userId: string;
  userName: string;
  roleLabel: string;
  month: string;
  basic: number;
  allowances: number;
  deductions: number;
  netPay: number;
  status: "pending" | "paid";
  paidDate: string | null;
  note: string;
}
export interface PayrollSummary {
  count: number;
  totalPayroll: number;
  paid: number;
  pending: number;
}
export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  roleLabel: string;
  type: "casual" | "sick" | "earned" | "unpaid";
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  reviewedByName: string;
  reviewedAt: string | null;
  reviewNote: string;
  createdAt: string;
}
