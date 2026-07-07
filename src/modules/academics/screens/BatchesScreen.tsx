import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Users2, Plus, X, Clock, UserCog, DoorOpen } from "lucide-react-native";
import { useAuthStore } from "@shared/store/useAuthStore";
import { PERMISSIONS } from "@shared/permissions";
import { palette, radius, shadows, layout } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  TextField,
  Select,
  StatusChip,
  EmptyState,
  Fab,
} from "@shared/ui";
import { apiErrorMessage } from "@api/apiClient";
import {
  useBatches,
  useSaveBatch,
  useCourses,
  useClassrooms,
  useSubjects,
  useTeachers,
} from "@modules/academics/hooks/useAcademics";
import { Batch, DAY_LABELS } from "@modules/academics/types";

const STATUS_TONE: Record<string, "success" | "warning" | "neutral"> = {
  active: "success",
  upcoming: "warning",
  completed: "neutral",
};

const emptyForm = {
  name: "",
  courseId: null as string | null,
  classTeacherId: null as string | null,
  roomId: null as string | null,
  subjectIds: [] as string[],
  daysOfWeek: [] as number[],
  startTime: "",
  endTime: "",
  capacity: "",
  status: "active",
};

export default function BatchesScreen() {
  const canWrite = useAuthStore((s) => s.hasPermission)(
    PERMISSIONS.BATCHES_MANAGE,
  );
  const { width } = useWindowDimensions();
  const isWide = width >= layout.wideBreakpoint;
  const { data, isLoading, refetch, isRefetching } = useBatches({ limit: 200 });
  const { data: courses } = useCourses({ limit: 200 });
  const { data: rooms } = useClassrooms({ limit: 200 });
  const { data: subjects } = useSubjects({ limit: 200 });
  const { data: teachers } = useTeachers();
  const mut = useSaveBatch();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();
  const [form, setForm] = useState({ ...emptyForm });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const prevSaving = useRef(mut.isPending);
  useEffect(() => {
    if (prevSaving.current && !mut.isPending && !mut.error) setOpen(false);
    prevSaving.current = mut.isPending;
  }, [mut.isPending, mut.error]);

  const openCreate = () => {
    setEditId(undefined);
    setForm({ ...emptyForm });
    setOpen(true);
  };
  const openEdit = (b: Batch) => {
    setEditId(b.id);
    setForm({
      name: b.name,
      courseId: b.courseId,
      classTeacherId: b.classTeacherId,
      roomId: b.roomId,
      subjectIds: b.subjects.map((s) => s.subjectId),
      daysOfWeek: b.daysOfWeek,
      startTime: b.startTime,
      endTime: b.endTime,
      capacity: String(b.capacity || ""),
      status: b.status,
    });
    setOpen(true);
  };

  const submit = () => {
    if (!form.name || !form.courseId) return;
    mut.mutate({
      id: editId,
      body: {
        name: form.name,
        courseId: form.courseId,
        classTeacherId: form.classTeacherId,
        roomId: form.roomId,
        subjects: form.subjectIds.map((id) => ({ subjectId: id })),
        daysOfWeek: form.daysOfWeek,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        status: form.status,
      },
    });
  };

  const batches = data?.data || [];
  const courseOpts = (courses?.data || []).map((c) => ({
    value: c.id,
    label: c.name,
  }));
  const roomOpts = (rooms?.data || []).map((r) => ({
    value: r.id,
    label: r.name,
  }));
  const teacherOpts = (teachers || []).map((t) => ({
    value: t.id,
    label: t.name,
  }));

  return (
    <Screen
      overline="Academics"
      title="Batches"
      subtitle="Cohorts / sections with teacher, room & schedule"
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
      right={
        canWrite ? (
          <Button
            label="Add batch"
            fullWidth={false}
            icon={<Plus size={16} color="#FFFFFF" strokeWidth={2.4} />}
            onPress={openCreate}
          />
        ) : undefined
      }
    >
      {batches.length === 0 && !isLoading ? (
        <EmptyState
          icon={Users2}
          title="No batches yet"
          message={
            canWrite ? "Create a course first, then add a batch." : undefined
          }
        />
      ) : (
        <VStack gap={10}>
          {batches.map((b) => (
            <Card key={b.id} onPress={canWrite ? () => openEdit(b) : undefined}>
              <HStack align="center" gap={12}>
                <View style={styles.iconWrap}>
                  <Users2
                    size={19}
                    color={palette.cobalt[600]}
                    strokeWidth={2}
                  />
                </View>
                <VStack gap={3} flex={1}>
                  <Text variant="label-lg" tone="primary" numberOfLines={1}>
                    {b.name}
                  </Text>
                  <Text variant="body-sm" tone="tertiary" numberOfLines={1}>
                    {b.courseName} · {b.code}
                  </Text>
                  <HStack gap={12} wrap>
                    {b.classTeacherName ? (
                      <Meta icon={UserCog} text={b.classTeacherName} />
                    ) : null}
                    {b.roomName ? (
                      <Meta icon={DoorOpen} text={b.roomName} />
                    ) : null}
                    {b.startTime ? (
                      <Meta icon={Clock} text={`${b.startTime}–${b.endTime}`} />
                    ) : null}
                  </HStack>
                </VStack>
                <VStack gap={6} align="flex-end">
                  <StatusChip label={b.status} tone={STATUS_TONE[b.status]} />
                  <Text variant="caption" tone="tertiary">
                    {b.enrolledCount}/{b.capacity || "∞"}
                  </Text>
                </VStack>
              </HStack>
            </Card>
          ))}
        </VStack>
      )}

      {canWrite && !isWide ? (
        <Fab
          onPress={openCreate}
          icon={<Plus size={24} color="#FFFFFF" strokeWidth={2.4} />}
        />
      ) : null}

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
                {editId ? "Edit batch" : "Add batch"}
              </Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                <X size={20} color={palette.text.tertiary} strokeWidth={2} />
              </Pressable>
            </HStack>

            {mut.error ? (
              <View style={styles.errBox}>
                <Text variant="body-sm" tone="danger">
                  {apiErrorMessage(mut.error)}
                </Text>
              </View>
            ) : null}

            <ScrollView
              style={{ maxHeight: 460 }}
              showsVerticalScrollIndicator={false}
            >
              <VStack gap={14}>
                <TextField
                  label="Batch name"
                  placeholder="Class 8 - A · FSD Batch A1 Morning"
                  value={form.name}
                  onChangeText={(v) => set("name", v)}
                />
                <Select
                  label="Course"
                  placeholder="Select course"
                  value={form.courseId}
                  options={courseOpts}
                  onChange={(v) => set("courseId", v)}
                />
                <Select
                  label="Class teacher"
                  placeholder="Select teacher"
                  value={form.classTeacherId}
                  options={teacherOpts}
                  onChange={(v) => set("classTeacherId", v)}
                  allowClear
                />
                <Select
                  label="Room"
                  placeholder="Select room"
                  value={form.roomId}
                  options={roomOpts}
                  onChange={(v) => set("roomId", v)}
                  allowClear
                />
                <View>
                  <Text
                    variant="label"
                    tone="secondary"
                    style={{ marginBottom: 6 }}
                  >
                    Subjects
                  </Text>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                  >
                    {(subjects?.data || []).map((s) => {
                      const on = form.subjectIds.includes(s.id);
                      return (
                        <Pressable
                          key={s.id}
                          onPress={() =>
                            set(
                              "subjectIds",
                              on
                                ? form.subjectIds.filter((x) => x !== s.id)
                                : [...form.subjectIds, s.id],
                            )
                          }
                          style={[styles.chip, on && styles.chipOn]}
                        >
                          <Text
                            variant="label-sm"
                            style={{
                              color: on ? "#FFFFFF" : palette.text.secondary,
                            }}
                          >
                            {s.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
                <View>
                  <Text
                    variant="label"
                    tone="secondary"
                    style={{ marginBottom: 6 }}
                  >
                    Class days
                  </Text>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                  >
                    {DAY_LABELS.map((d, i) => {
                      const on = form.daysOfWeek.includes(i);
                      return (
                        <Pressable
                          key={d}
                          onPress={() =>
                            set(
                              "daysOfWeek",
                              on
                                ? form.daysOfWeek.filter((x) => x !== i)
                                : [...form.daysOfWeek, i],
                            )
                          }
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
                      label="Start time"
                      placeholder="09:00"
                      value={form.startTime}
                      onChangeText={(v) => set("startTime", v)}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextField
                      label="End time"
                      placeholder="14:00"
                      value={form.endTime}
                      onChangeText={(v) => set("endTime", v)}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextField
                      label="Capacity"
                      placeholder="40"
                      value={form.capacity}
                      onChangeText={(v) => set("capacity", v)}
                      keyboardType="number-pad"
                    />
                  </View>
                </HStack>
                <Select
                  label="Status"
                  value={form.status}
                  options={[
                    { value: "active", label: "Active" },
                    { value: "upcoming", label: "Upcoming" },
                    { value: "completed", label: "Completed" },
                  ]}
                  onChange={(v) => set("status", v || "active")}
                />
              </VStack>
            </ScrollView>

            <Button
              label={editId ? "Save changes" : "Create batch"}
              size="lg"
              loading={mut.isPending}
              onPress={submit}
              style={{ marginTop: 18 }}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function Meta({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <HStack gap={4} align="center">
      <Icon size={13} color={palette.text.tertiary} strokeWidth={1.8} />
      <Text variant="caption" tone="tertiary">
        {text}
      </Text>
    </HStack>
  );
}

const styles = {
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: palette.cobalt[50],
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 20,
  },
  sheet: {
    width: "100%" as const,
    maxWidth: 480,
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
};
