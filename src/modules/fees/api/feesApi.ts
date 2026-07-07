import { apiClient } from "@api/apiClient";
import {
  Paginated,
  FeeStructure,
  Invoice,
  InvoiceListItem,
  Payment,
  Revenue,
} from "@modules/fees/types";

export const feesApi = {
  revenue: async () =>
    (await apiClient.get<{ data: Revenue }>("/fees/revenue")).data.data,

  listStructures: async () =>
    (await apiClient.get<{ data: FeeStructure[] }>("/fees/structures")).data
      .data,
  saveStructure: async (
    id: string | undefined,
    body: Record<string, unknown>,
  ) =>
    id
      ? (await apiClient.patch(`/fees/structures/${id}`, body)).data.data
      : (await apiClient.post("/fees/structures", body)).data.data,

  listInvoices: async (params?: Record<string, string | number | undefined>) =>
    (
      await apiClient.get<Paginated<InvoiceListItem>>("/fees/invoices", {
        params,
      })
    ).data,
  getInvoice: async (id: string) =>
    (await apiClient.get<{ data: Invoice }>(`/fees/invoices/${id}`)).data.data,
  generateInvoice: async (body: Record<string, unknown>) =>
    (await apiClient.post<{ data: Invoice }>("/fees/invoices", body)).data.data,
  cancelInvoice: async (id: string) =>
    (await apiClient.delete(`/fees/invoices/${id}`)).data,

  recordPayment: async (invoiceId: string, body: Record<string, unknown>) =>
    (
      await apiClient.post<{ data: { payment: Payment; invoice: Invoice } }>(
        `/fees/invoices/${invoiceId}/payments`,
        body,
      )
    ).data.data,
  listPayments: async (params?: Record<string, string | number | undefined>) =>
    (await apiClient.get<Paginated<Payment>>("/fees/payments", { params }))
      .data,

  sendReminders: async () =>
    (await apiClient.post("/fees/reminders")).data.data,
};
