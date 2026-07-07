import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  attendanceApi,
  staffAttendanceApi,
  notificationsApi,
} from "@modules/attendance/api/attendanceApi";

export const useRoster = (batchId?: string, date?: string) =>
  useQuery({
    queryKey: ["att-roster", batchId, date],
    queryFn: () => attendanceApi.roster(batchId!, date!),
    enabled: !!batchId && !!date,
  });

export const useMarkAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: attendanceApi.mark,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["att-roster"] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
      qc.invalidateQueries({ queryKey: ["att-summary"] });
    },
  });
};

export const useAttSummary = (batchId?: string, from?: string, to?: string) =>
  useQuery({
    queryKey: ["att-summary", batchId, from, to],
    queryFn: () => attendanceApi.summary(batchId!, from!, to!),
    enabled: !!batchId && !!from && !!to,
  });

export const useStudentAttendance = (
  studentId?: string,
  from?: string,
  to?: string,
) =>
  useQuery({
    queryKey: ["att-student", studentId, from, to],
    queryFn: () => attendanceApi.studentHistory(studentId!, from, to),
    enabled: !!studentId,
  });

export const useStaffRoster = (date?: string) =>
  useQuery({
    queryKey: ["staff-roster", date],
    queryFn: () => staffAttendanceApi.roster(date!),
    enabled: !!date,
  });

export const useMarkStaffAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: staffAttendanceApi.mark,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff-roster"] }),
  });
};

// Notifications
export const useNotifications = () =>
  useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list({ page: 1 }),
  });
export const useUnreadCount = () =>
  useQuery({
    queryKey: ["notif-unread"],
    queryFn: () => notificationsApi.unreadCount(),
    refetchInterval: 30000,
  });
export const useMarkNotifRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notif-unread"] });
    },
  });
};
export const useMarkAllNotifRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notif-unread"] });
    },
  });
};
