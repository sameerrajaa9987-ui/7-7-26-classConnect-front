import React, { useEffect, useMemo, useState } from "react";
import { View, Pressable } from "react-native";
import {
  CheckCheck,
  CalendarDays,
  Users2,
  UserCog,
  Save,
} from "lucide-react-native";
import { useAuthStore } from "@shared/store/useAuthStore";
import { PERMISSIONS } from "@shared/permissions";
import { palette, radius } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  Select,
  TextField,
  StatusChip,
  EmptyState,
} from "@shared/ui";
import { apiErrorMessage } from "@api/apiClient";
import { useBatches } from "@modules/academics/hooks/useAcademics";
import {
  useRoster,
  useMarkAttendance,
  useStaffRoster,
  useMarkStaffAttendance,
} from "@modules/attendance/hooks/useAttendance";
import { AttStatus } from "@modules/attendance/types";

const todayStr = () => new Date().toISOString().slice(0, 10);

const STATUS_META: {
  key: AttStatus;
  label: string;
  tone: string;
  color: string;
}[] = [
  { key: "present", label: "P", tone: "success", color: palette.success.text },
  { key: "absent", label: "A", tone: "danger", color: palette.danger.text },
  { key: "late", label: "L", tone: "warning", color: palette.warning.text },
  { key: "leave", label: "Lv", tone: "info", color: palette.info.text },
];

export default function AttendanceScreen() {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canStaff =
    hasPermission(PERMISSIONS.STAFF_ATTENDANCE_MANAGE) ||
    hasPermission(PERMISSIONS.HR_MANAGE);
  const [mode, setMode] = useState<"students" | "staff">("students");

  return (
    <Screen
      overline="Attendance"
      title="Attendance"
      subtitle="One-click marking with instant parent alerts"
    >
      {canStaff ? (
        <HStack gap={8} style={{ marginBottom: 16 }}>
          <ModeTab
            icon={Users2}
            label="Students"
            active={mode === "students"}
            onPress={() => setMode("students")}
          />
          <ModeTab
            icon={UserCog}
            label="Staff"
            active={mode === "staff"}
            onPress={() => setMode("staff")}
          />
        </HStack>
      ) : null}
      {mode === "students" ? <StudentAttendance /> : <StaffAttendance />}
    </Screen>
  );
}

function ModeTab({ icon: Icon, label, active, onPress }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: active ? palette.cobalt[600] : palette.border.default,
        backgroundColor: active ? palette.cobalt[50] : palette.surface.primary,
      }}
    >
      <Icon
        size={16}
        color={active ? palette.cobalt[600] : palette.text.tertiary}
        strokeWidth={2}
      />
      <Text
        variant="label"
        style={{ color: active ? palette.cobalt[700] : palette.text.secondary }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function StudentAttendance() {
  const { data: batches } = useBatches({ limit: 200 });
  const [batchId, setBatchId] = useState<string | null>(null);
  const [date, setDate] = useState(todayStr());
  const { data: roster, isLoading } = useRoster(batchId || undefined, date);
  const mark = useMarkAttendance();

  const [statuses, setStatuses] = useState<Record<string, AttStatus>>({});
  useEffect(() => {
    if (roster) {
      const init: Record<string, AttStatus> = {};
      for (const s of roster.students) init[s.studentId] = s.status;
      setStatuses(init);
    }
  }, [roster]);

  const setAll = (v: AttStatus) => {
    const next: Record<string, AttStatus> = {};
    for (const s of roster?.students || []) next[s.studentId] = v;
    setStatuses(next);
  };

  const counts = useMemo(() => {
    const c = { present: 0, absent: 0, late: 0, leave: 0, unmarked: 0 };
    for (const s of roster?.students || [])
      c[statuses[s.studentId] || "unmarked"]++;
    return c;
  }, [statuses, roster]);

  const save = () => {
    const entries = (roster?.students || [])
      .filter(
        (s) => statuses[s.studentId] && statuses[s.studentId] !== "unmarked",
      )
      .map((s) => ({ studentId: s.studentId, status: statuses[s.studentId] }));
    if (!batchId || !entries.length) return;
    mark.mutate({ batchId, date, entries });
  };

  const batchOpts = (batches?.data || []).map((b) => ({
    value: b.id,
    label: `${b.name} · ${b.courseName}`,
  }));

  return (
    <VStack gap={16}>
      <Card>
        <VStack gap={12}>
          <Select
            label="Batch"
            placeholder="Select a batch"
            value={batchId}
            options={batchOpts}
            onChange={setBatchId}
          />
          <TextField
            label="Date"
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            leading={
              <CalendarDays
                size={18}
                color={palette.text.tertiary}
                strokeWidth={1.8}
              />
            }
          />
        </VStack>
      </Card>

      {mark.isError ? (
        <View style={errBox}>
          <Text variant="body-sm" tone="danger">
            {apiErrorMessage(mark.error)}
          </Text>
        </View>
      ) : null}
      {mark.isSuccess ? (
        <View style={okBox}>
          <Text variant="body-sm" tone="success">
            Attendance saved — parents alerted for absences.
          </Text>
        </View>
      ) : null}

      {!batchId ? (
        <EmptyState
          icon={Users2}
          title="Pick a batch"
          message="Select a batch and date to take attendance."
        />
      ) : (roster?.students || []).length === 0 && !isLoading ? (
        <EmptyState icon={Users2} title="No students in this batch" />
      ) : (
        <>
          <HStack justify="space-between" align="center">
            <HStack gap={6} wrap>
              <StatusChip label={`Present ${counts.present}`} tone="success" />
              <StatusChip label={`Absent ${counts.absent}`} tone="danger" />
              <StatusChip label={`Late ${counts.late}`} tone="warning" />
              <StatusChip label={`Leave ${counts.leave}`} tone="info" />
            </HStack>
            <Button
              label="All present"
              size="sm"
              variant="secondary"
              fullWidth={false}
              icon={
                <CheckCheck
                  size={15}
                  color={palette.text.primary}
                  strokeWidth={2}
                />
              }
              onPress={() => setAll("present")}
            />
          </HStack>

          <VStack gap={8}>
            {(roster?.students || []).map((s) => (
              <Card key={s.studentId}>
                <HStack align="center" gap={12}>
                  <VStack gap={2} flex={1}>
                    <Text variant="label-lg" tone="primary" numberOfLines={1}>
                      {s.name}
                    </Text>
                    <Text variant="caption" tone="tertiary">
                      {s.admissionNo}
                      {s.rollNo ? ` · Roll ${s.rollNo}` : ""}
                    </Text>
                  </VStack>
                  <HStack gap={6}>
                    {STATUS_META.map((st) => {
                      const on = statuses[s.studentId] === st.key;
                      return (
                        <Pressable
                          key={st.key}
                          onPress={() =>
                            setStatuses((p) => ({
                              ...p,
                              [s.studentId]: st.key,
                            }))
                          }
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: radius.md,
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: 1.5,
                            borderColor: on ? st.color : palette.border.default,
                            backgroundColor: on
                              ? st.color
                              : palette.surface.primary,
                          }}
                        >
                          <Text
                            variant="label"
                            style={{
                              color: on ? "#FFFFFF" : palette.text.tertiary,
                            }}
                          >
                            {st.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </HStack>
                </HStack>
              </Card>
            ))}
          </VStack>

          <Button
            label="Save attendance"
            size="lg"
            loading={mark.isPending}
            onPress={save}
            icon={<Save size={17} color="#FFFFFF" strokeWidth={2} />}
          />
        </>
      )}
    </VStack>
  );
}

function StaffAttendance() {
  const [date, setDate] = useState(todayStr());
  const { data: roster } = useStaffRoster(date);
  const mark = useMarkStaffAttendance();
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    if (roster) {
      const init: Record<string, string> = {};
      for (const s of roster.staff) init[s.userId] = s.status;
      setStatuses(init);
    }
  }, [roster]);

  const save = () => {
    const entries = (roster?.staff || [])
      .filter((s) => statuses[s.userId] && statuses[s.userId] !== "unmarked")
      .map((s) => ({ userId: s.userId, status: statuses[s.userId] }));
    if (!entries.length) return;
    mark.mutate({ date, entries });
  };

  return (
    <VStack gap={16}>
      <Card>
        <TextField
          label="Date"
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          leading={
            <CalendarDays
              size={18}
              color={palette.text.tertiary}
              strokeWidth={1.8}
            />
          }
        />
      </Card>
      {mark.isSuccess ? (
        <View style={okBox}>
          <Text variant="body-sm" tone="success">
            Staff attendance saved.
          </Text>
        </View>
      ) : null}
      <VStack gap={8}>
        {(roster?.staff || []).map((s) => (
          <Card key={s.userId}>
            <HStack align="center" gap={12}>
              <VStack gap={2} flex={1}>
                <Text variant="label-lg" tone="primary">
                  {s.name}
                </Text>
                <Text variant="caption" tone="tertiary">
                  {s.roleLabel}
                </Text>
              </VStack>
              <HStack gap={6}>
                {STATUS_META.map((st) => {
                  const on = statuses[s.userId] === st.key;
                  return (
                    <Pressable
                      key={st.key}
                      onPress={() =>
                        setStatuses((p) => ({ ...p, [s.userId]: st.key }))
                      }
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: radius.md,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 1.5,
                        borderColor: on ? st.color : palette.border.default,
                        backgroundColor: on
                          ? st.color
                          : palette.surface.primary,
                      }}
                    >
                      <Text
                        variant="label"
                        style={{
                          color: on ? "#FFFFFF" : palette.text.tertiary,
                        }}
                      >
                        {st.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </HStack>
            </HStack>
          </Card>
        ))}
      </VStack>
      <Button
        label="Save staff attendance"
        size="lg"
        loading={mark.isPending}
        onPress={save}
        icon={<Save size={17} color="#FFFFFF" strokeWidth={2} />}
      />
    </VStack>
  );
}

const errBox = {
  padding: 12,
  borderRadius: radius.md,
  backgroundColor: palette.danger.bg,
  borderWidth: 1,
  borderColor: palette.danger.border,
} as const;
const okBox = {
  padding: 12,
  borderRadius: radius.md,
  backgroundColor: palette.success.bg,
  borderWidth: 1,
  borderColor: palette.success.border,
} as const;
