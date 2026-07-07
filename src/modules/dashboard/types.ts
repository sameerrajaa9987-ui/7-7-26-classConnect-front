export interface DashboardSummary {
  people: {
    total: number;
    active: number;
    admins: number;
    teachers: number;
    staff: number;
    parents: number;
    students: number;
  };
  academics?: { courses: number; batches: number; subjects: number };
  students: { total: number };
  teachers: { total: number };
  attendance: { todayPercent: number | null };
  fees: {
    collected?: number;
    pending?: number;
    overdue?: number;
    collectionPercent?: number;
    todayCollection?: number;
    monthCollection?: number;
  };
}
