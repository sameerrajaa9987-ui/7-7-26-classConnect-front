export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}

export interface FeeComponent {
  name: string;
  amount: number; // paise
}
export interface FeeStructure {
  id: string;
  name: string;
  courseId: string | null;
  courseName: string;
  session: string;
  components: FeeComponent[];
  total: number;
  isActive: boolean;
}

export interface Installment {
  no: number;
  dueDate: string | null;
  amount: number;
  paidAmount: number;
  status: "unpaid" | "partial" | "paid";
}

export type InvoiceStatus =
  "unpaid" | "partial" | "paid" | "overdue" | "cancelled";

export interface InvoiceListItem {
  id: string;
  invoiceNo: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  batchName: string;
  netAmount: number;
  paidAmount: number;
  dueAmount: number;
  dueDate: string | null;
  status: InvoiceStatus;
  createdAt: string;
}

export interface Payment {
  id: string;
  receiptNo: string;
  invoiceId: string;
  invoiceNo: string;
  studentId: string;
  studentName: string;
  amount: number;
  method: string;
  reference: string;
  note: string;
  paidAt: string;
  collectedByName: string;
}

export interface Invoice extends InvoiceListItem {
  courseName: string;
  session: string;
  title: string;
  lineItems: FeeComponent[];
  grossAmount: number;
  discountAmount: number;
  discountReason: string;
  hasInstallments: boolean;
  installments: Installment[];
  payments?: Payment[];
}

export interface Revenue {
  totalBilled: number;
  collected: number;
  pending: number;
  overdue: number;
  collectionPercent: number;
  todayCollection: number;
  monthCollection: number;
}

/** Format integer paise as Indian rupees. */
export function formatMoney(paise: number | null | undefined): string {
  if (paise == null) return "—";
  const rupees = paise / 100;
  return (
    "₹" +
    rupees.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  );
}
