import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@modules/inventory/api/inventoryApi";

type Params = Record<string, string | number | undefined>;

export const useAssets = (params?: Params) =>
  useQuery({
    queryKey: ["assets", params],
    queryFn: () => inventoryApi.list(params),
  });
export const useInventoryAnalytics = () =>
  useQuery({
    queryKey: ["inventory-analytics"],
    queryFn: () => inventoryApi.analytics(),
  });
export const useAsset = (id?: string) =>
  useQuery({
    queryKey: ["asset", id],
    queryFn: () => inventoryApi.get(id!),
    enabled: !!id,
  });
export const useSaveAsset = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id?: string; body: any }) =>
      v.id ? inventoryApi.update(v.id, v.body) : inventoryApi.create(v.body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assets"] });
      qc.invalidateQueries({ queryKey: ["inventory-analytics"] });
      qc.invalidateQueries({ queryKey: ["asset"] });
    },
  });
};
export const useAddMaintenance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; body: any }) =>
      inventoryApi.addMaintenance(v.id, v.body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["asset"] });
      qc.invalidateQueries({ queryKey: ["assets"] });
      qc.invalidateQueries({ queryKey: ["inventory-analytics"] });
    },
  });
};
