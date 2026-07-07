import { useMutation, useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@modules/analytics/api/analyticsApi";

export const useExecutive = () =>
  useQuery({
    queryKey: ["executive"],
    queryFn: () => analyticsApi.executive(),
  });
export const useInsights = () =>
  useQuery({ queryKey: ["insights"], queryFn: () => analyticsApi.insights() });
export const useAtRisk = () =>
  useQuery({ queryKey: ["at-risk"], queryFn: () => analyticsApi.atRisk() });
export const useDownloadReport = () =>
  useMutation({
    mutationFn: (v: { type: string; format: "excel" | "pdf" }) =>
      analyticsApi.downloadReport(v.type, v.format),
  });
