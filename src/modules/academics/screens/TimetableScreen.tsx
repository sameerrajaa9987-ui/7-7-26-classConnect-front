import React, { useEffect, useRef, useState } from "react";
import { View, Modal, Pressable, ScrollView } from "react-native";
import { CalendarDays, Plus, X, Trash2, Clock } from "lucide-react-native";
import { useAuthStore } from "@shared/store/useAuthStore";
import { PERMISSIONS } from "@shared/permissions";
import { palette, radius, shadows } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  TextField,
  Select,
  EmptyState,
} from "@shared/ui";
import { apiErrorMessage } from "@api/apiClient";
import {
  useBatches,
  useBatchTimetable,
  useMyTimetable,
  useSaveTimetableEntry,
  useDeleteTimetableEntry,
  useSubjects,
  useClassrooms,
  useTeachers,
} from "@modules/academics/hooks/useAcademics";
import { DAY_LABELS, TimetableEntry } from "@modules/academics/types";

export default function TimetableScreen() {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canManage = hasPermission(PERMISSIONS.TIMETABLE_MANAGE);
  return canManage ? <ManageTimetable /> : <MyTimetable />;
}

/** Teacher / viewer read-only weekly timetable. */
function MyTimetable() {
  const { data, isLoading, refetch, isRefetching } = useMyTimetable();
  const entries = data || [];
  return (
    <Screen
      overline="Academics"
      title="My timetable"
      subtitle="Your weekly teaching schedule"
      refreshing={isLoading || isRefetching}
      onRefresh={refetch}
    >
      {entries.length === 0 && !isLoading ? (
        <EmptyState
          icon={CalendarDays}
          title="No periods scheduled"
          message="Your timetable will appear here once the coordinator schedules your classes."
        />
      ) : (
        <WeekGrid entries={entries} />
      )}
    </Screen>
  );
}

/** Coordinator/admin editable timetable, per batch. */
function ManageTimetable() {
  const [batchId, setBatchId] = useState<string | null>(null);
  const { data: batches } = useBatches({ limit: 200 });
  const { data: subjects } = useSubjects({ limit: 200 });
  const { data: rooms } = useClassrooms({ limit: 200 });
  const { data: teachers } = useTeachers();
  const {
    data: entries,
    isLoading,
    refetch,
    isRefetching,
  } = useBatchTimetable(batchId || undefined);
  const save = useSaveTimetableEntry();
  const del = useDeleteTimetableEntry();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    dayOfWeek: 1,
    startTime: "",
    endTime: "",
    subjectId: null as string | null,
    teacherId: null as string | null,
    roomId: null as string | null,
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const prevSaving = useRef(save.isPending);
  useEffect(() => {
    if (prevSaving.current && !save.isPending && !save.error) setOpen(false);
    prevSaving.current = save.isPending;
  }, [save.isPending, save.error]);

  const batchOpts = (batches?.data || []).map((b) => ({
    value: b.id,
    label: `${b.name} · ${b.courseName}`,
  }));

  const submit = () => {
    if (!batchId || !form.startTime || !form.endTime) return;
    save.mutate({
      batchId,
      dayOfWeek: form.dayOfWeek,
      startTime: form.startTime,
      endTime: form.endTime,
      subjectId: form.subjectId,
      teacherId: form.teacherId,
      roomId: form.roomId,
    });
  };

  return (
    <Screen
      overline="Academics"
      title="Timetable"
      subtitle="Build the weekly schedule per batch"
      refreshing={isLoading || isRefetching}
      onRefresh={refetch}
    >
      <Card style={{ marginBottom: 16 }}>
        <Select
          label="Batch"
          placeholder="Select a batch to schedule"
          value={batchId}
          options={batchOpts}
          onChange={setBatchId}
        />
      </Card>

      {!batchId ? (
        <EmptyState
          icon={CalendarDays}
          title="Pick a batch"
          message="Choose a batch above to view and edit its weekly timetable."
        />
      ) : (
        <>
          <HStack justify="flex-end" style={{ marginBottom: 12 }}>
            <Button
              label="Add period"
              fullWidth={false}
              icon={<Plus size={16} color="#FFFFFF" strokeWidth={2.4} />}
              onPress={() => {
                setForm({
                  dayOfWeek: 1,
                  startTime: "",
                  endTime: "",
                  subjectId: null,
                  teacherId: null,
                  roomId: null,
                });
                setOpen(true);
              }}
            />
          </HStack>
          {(entries || []).length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No periods yet"
              message='Tap "Add period" to schedule the first class.'
            />
          ) : (
            <WeekGrid
              entries={entries || []}
              onDelete={(id) => del.mutate(id)}
            />
          )}
        </>
      )}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <HStack
              align="center"
              justify="space-between"
              style={{ marginBottom: 16 }}
            >
              <Text variant="h3" tone="primary">
                Add period
              </Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                <X size={20} color={palette.text.tertiary} strokeWidth={2} />
              </Pressable>
            </HStack>
            {save.error ? (
              <View style={styles.errBox}>
                <Text variant="body-sm" tone="danger">
                  {apiErrorMessage(save.error)}
                </Text>
              </View>
            ) : null}
            <ScrollView
              style={{ maxHeight: 420 }}
              showsVerticalScrollIndicator={false}
            >
              <VStack gap={14}>
                <View>
                  <Text
                    variant="label"
                    tone="secondary"
                    style={{ marginBottom: 6 }}
                  >
                    Day
                  </Text>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                  >
                    {DAY_LABELS.map((d, i) => {
                      const on = form.dayOfWeek === i;
                      return (
                        <Pressable
                          key={d}
                          onPress={() => set("dayOfWeek", i)}
                          style={[styles.chip, on && styles.chipOn]}
                        >
                          <Text
                            variant="label-sm"
                            style={{
                              color: on ? "#FFFFFF" : palette.text.secondary,
                            }}
                          >
                            {d}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
                <HStack gap={12}>
                  <View style={{ flex: 1 }}>
                    <TextField
                      label="Start"
                      placeholder="09:00"
                      value={form.startTime}
                      onChangeText={(v) => set("startTime", v)}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextField
                      label="End"
                      placeholder="10:00"
                      value={form.endTime}
                      onChangeText={(v) => set("endTime", v)}
                    />
                  </View>
                </HStack>
                <Select
                  label="Subject"
                  placeholder="Select subject"
                  value={form.subjectId}
                  options={(subjects?.data || []).map((s) => ({
                    value: s.id,
                    label: s.name,
                  }))}
                  onChange={(v) => set("subjectId", v)}
                  allowClear
                />
                <Select
                  label="Teacher"
                  placeholder="Select teacher"
                  value={form.teacherId}
                  options={(teachers || []).map((t) => ({
                    value: t.id,
                    label: t.name,
                  }))}
                  onChange={(v) => set("teacherId", v)}
                  allowClear
                />
                <Select
                  label="Room"
                  placeholder="Select room"
                  value={form.roomId}
                  options={(rooms?.data || []).map((r) => ({
                    value: r.id,
                    label: r.name,
                  }))}
                  onChange={(v) => set("roomId", v)}
                  allowClear
                />
              </VStack>
            </ScrollView>
            <Button
              label="Add to timetable"
              size="lg"
              loading={save.isPending}
              onPress={submit}
              style={{ marginTop: 18 }}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function WeekGrid({
  entries,
  onDelete,
}: {
  entries: TimetableEntry[];
  onDelete?: (id: string) => void;
}) {
  const byDay: Record<number, TimetableEntry[]> = {};
  for (const e of entries) (byDay[e.dayOfWeek] ||= []).push(e);
  const days = Object.keys(byDay)
    .map(Number)
    .sort((a, b) => a - b);
  return (
    <VStack gap={16}>
      {days.map((day) => (
        <View key={day}>
          <Text variant="h4" tone="primary" style={{ marginBottom: 8 }}>
            {fullDay(day)}
          </Text>
          <VStack gap={8}>
            {byDay[day]
              .slice()
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((e) => (
                <Card key={e.id}>
                  <HStack align="center" gap={12}>
                    <View style={styles.timeBox}>
                      <Text variant="label-sm" tone="accent">
                        {e.startTime}
                      </Text>
                      <Text variant="caption" tone="tertiary">
                        {e.endTime}
                      </Text>
                    </View>
                    <VStack gap={2} flex={1}>
                      <Text variant="label-lg" tone="primary" numberOfLines={1}>
                        {e.subjectName || "Period"}
                      </Text>
                      <Text variant="body-sm" tone="tertiary" numberOfLines={1}>
                        {[e.teacherName, e.roomName]
                          .filter(Boolean)
                          .join(" · ") || e.batchName}
                      </Text>
                    </VStack>
                    {onDelete ? (
                      <Pressable onPress={() => onDelete(e.id)} hitSlop={8}>
                        <Trash2
                          size={17}
                          color={palette.danger.text}
                          strokeWidth={1.9}
                        />
                      </Pressable>
                    ) : null}
                  </HStack>
                </Card>
              ))}
          </VStack>
        </View>
      ))}
    </VStack>
  );
}

const fullDay = (d: number) =>
  [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][d];

const styles = {
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 20,
  },
  sheet: {
    width: "100%" as const,
    maxWidth: 460,
    backgroundColor: palette.surface.primary,
    borderRadius: radius.xl,
    padding: 22,
    ...shadows.lg,
  },
  errBox: {
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: palette.danger.bg,
    borderWidth: 1,
    borderColor: palette.danger.border,
    marginBottom: 14,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.primary,
  },
  chipOn: {
    backgroundColor: palette.cobalt[600],
    borderColor: palette.cobalt[600],
  },
  timeBox: {
    width: 58,
    alignItems: "center" as const,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: palette.cobalt[50],
  },
};
