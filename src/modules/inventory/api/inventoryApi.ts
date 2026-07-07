import { apiClient } from "@api/apiClient";
import { Asset, InventoryAnalytics, Paginated } from "@modules/inventory/types";

export const inventoryApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    apiClient
      .get<Paginated<Asset>>("/inventory", { params })
      .then((r) => r.data),
  analytics: () =>
    apiClient
      .get<{ data: InventoryAnalytics }>("/inventory/analytics")
      .then((r) => r.data.data),
  get: (id: string) =>
    apiClient.get<{ data: Asset }>(`/inventory/${id}`).then((r) => r.data.data),
  create: (body: any) =>
    apiClient
      .post<{ data: Asset }>("/inventory", body)
      .then((r) => r.data.data),
  update: (id: string, body: any) =>
    apiClient
      .patch<{ data: Asset }>(`/inventory/${id}`, body)
      .then((r) => r.data.data),
  addMaintenance: (id: string, body: any) =>
    apiClient
      .post(`/inventory/${id}/maintenance`, body)
      .then((r) => r.data.data),
};
