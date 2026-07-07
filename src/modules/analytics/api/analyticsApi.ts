import { Platform } from "react-native";
import { apiClient } from "@api/apiClient";
import {
  Executive,
  InsightsResponse,
  AtRiskStudent,
} from "@modules/analytics/types";

export const analyticsApi = {
  executive: () =>
    apiClient
      .get<{ data: Executive }>("/analytics/executive")
      .then((r) => r.data.data),
  insights: () =>
    apiClient
      .get<{ data: InsightsResponse }>("/analytics/insights")
      .then((r) => r.data.data),
  atRisk: () =>
    apiClient
      .get<{ data: AtRiskStudent[] }>("/analytics/at-risk")
      .then((r) => r.data.data),

  /** Download a report as Excel/PDF. On web, triggers a browser download. */
  downloadReport: async (type: string, format: "excel" | "pdf") => {
    const res = await apiClient.get(`/analytics/reports/${type}`, {
      params: { format },
      responseType: "blob",
    });
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const blob = res.data as Blob;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}.${format === "excel" ? "xlsx" : "pdf"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
    return true;
  },
};
