import { apiClient } from "@api/apiClient";
import {
  Roster,
  AttendanceSummary,
  StudentHistory,
  StaffRosterMember,
  AppNotification,
} from "@modules/attendance/types";

export const attendanceApi = {
  roster: async (batchId: string, date: string) => {
    const res = await apiClient.get<{ data: Roster }>("/attendance/roster", {
      params: { batchId, date },
    });
    return res.data.data;
  },
  mark: async (body: {
    batchId: string;
    date: string;
    entries: { studentId: string; status: string; remark?: string }[];
  }) => {
    const res = await apiClient.post("/attendance/mark", body);
    return res.data.data;
  },
  summary: async (batchId: string, from: string, to: string) => {
    const res = await apiClient.get<{ data: AttendanceSummary }>(
      "/attendance/summary",
      {
        params: { batchId, from, to },
      },
    );
    return res.data.data;
  },
  studentHistory: async (studentId: string, from?: string, to?: string) => {
    const res = await apiClient.get<{ data: StudentHistory }>(
      `/attendance/student/${studentId}`,
      { params: { from, to } },
    );
    return res.data.data;
  },
};

export const staffAttendanceApi = {
  roster: async (date: string) => {
    const res = await apiClient.get<{
      data: { date: string; staff: StaffRosterMember[] };
    }>("/staff-attendance/roster", { params: { date } });
    return res.data.data;
  },
  mark: async (body: {
    date: string;
    entries: { userId: string; status: string; checkIn?: string }[];
  }) => {
    const res = await apiClient.post("/staff-attendance/mark", body);
    return res.data.data;
  },
};

export const notificationsApi = {
  list: async (params?: { page?: number; unreadOnly?: boolean }) => {
    const res = await apiClient.get<{
      data: AppNotification[];
      meta: { unread: number; total: number };
    }>("/notifications", { params });
    return res.data;
  },
  unreadCount: async () => {
    const res = await apiClient.get<{ data: { unread: number } }>(
      "/notifications/unread-count",
    );
    return res.data.data.unread;
  },
  markRead: async (id: string) =>
    (await apiClient.post(`/notifications/${id}/read`)).data,
  markAllRead: async () =>
    (await apiClient.post("/notifications/read-all")).data,
};
