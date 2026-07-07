import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { feesApi } from "@modules/fees/api/feesApi";

type Params = Record<string, string | number | undefined>;

export const useRevenue = () =>
  useQuery({ queryKey: ["fee-revenue"], queryFn: () => feesApi.revenue() });

export const useStructures = () =>
  useQuery({
    queryKey: ["fee-structures"],
    queryFn: () => feesApi.listStructures(),
  });
export const useSaveStructure = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id?: string; body: Record<string, unknown> }) =>
      feesApi.saveStructure(v.id, v.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fee-structures"] }),
  });
};

export const useInvoices = (params?: Params) =>
  useQuery({
    queryKey: ["invoices", params],
    queryFn: () => feesApi.listInvoices(params),
  });
export const useInvoice = (id?: string) =>
  useQuery({
    queryKey: ["invoice", id],
    queryFn: () => feesApi.getInvoice(id!),
    enabled: !!id,
  });
export const useGenerateInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      feesApi.generateInvoice(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["fee-revenue"] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });
};

export const useRecordPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { invoiceId: string; body: Record<string, unknown> }) =>
      feesApi.recordPayment(v.invoiceId, v.body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["invoice"] });
      qc.invalidateQueries({ queryKey: ["fee-revenue"] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });
};

export const useSendReminders = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => feesApi.sendReminders(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
};
