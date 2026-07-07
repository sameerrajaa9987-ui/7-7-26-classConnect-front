export interface Executive {
  students: number;
  teachers: number;
  courses: number;
  batches: number;
  admissionsThisMonth: number;
  attendance: { percent: number | null; records: number };
  exams: {
    avgPercent: number | null;
    passPercent: number | null;
    resultsCount: number;
  };
  fees: {
    totalBilled: number;
    collected: number;
    pending: number;
    overdue: number;
    collectionPercent: number;
    todayCollection: number;
    monthCollection: number;
  };
  inventory: {
    totalAssets: number;
    totalValue: number;
    underMaintenance: number;
    lowStock: number;
  };
  revenueTrend: { month: string; value: number }[];
  admissionsTrend: { month: string; value: number }[];
}

export interface Insight {
  type: string;
  tone: "info" | "success" | "warning" | "danger";
  title: string;
  metric: string;
  message: string;
}
export interface InsightsResponse {
  insights: Insight[];
  atRiskCount: number;
  generatedAt: string;
  engine: string;
}
export interface AtRiskStudent {
  studentId: string;
  name: string;
  admissionNo: string;
  batchName: string;
  reasons: string[];
  riskScore: number;
}
