import React, { useEffect, useRef, useState } from "react";
import { View, Modal, Pressable, ScrollView, Linking } from "react-native";
import {
  PlayCircle,
  FileText,
  Link2,
  BookOpen,
  Plus,
  X,
  CheckCircle2,
  Circle,
} from "lucide-react-native";
import { useAuthStore } from "@shared/store/useAuthStore";
import { PERMISSIONS } from "@shared/permissions";
import { palette, radius, shadows } from "@shared/designSystem";
import {
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
  useLessons,
  useCreateLesson,
  useCompleteLesson,
} from "@modules/lms/hooks/useLms";
import { useCourses } from "@modules/academics/hooks/useAcademics";
import { Lesson } from "@modules/lms/types";

const TYPE_ICON: Record<string, any> = {
  video: PlayCircle,
  document: FileText,
  link: Link2,
  text: BookOpen,
};

export function LessonsTab() {
  const canManage = useAuthStore((s) => s.hasPermission)(
    PERMISSIONS.LMS_MANAGE,
  );
  const isStudent = useAuthStore((s) => s.user?.role === "student");
  const { data, isLoading } = useLessons();
  const complete = useCompleteLesson();
  const [showAdd, setShowAdd] = useState(false);

  const lessons = data || [];
  const done = lessons.filter((l) => l.completed).length;

  return (
    <VStack gap={12}>
      {isStudent && lessons.length ? (
        <Card>
          <HStack justify="space-between" align="center">
            <VStack gap={2}>
              <Text variant="label-lg" tone="primary">
                Your progress
              </Text>
              <Text variant="body-sm" tone="tertiary">
                {done} of {lessons.length} lessons completed
              </Text>
            </VStack>
            <Text variant="h2" style={{ color: palette.cobalt[600] }}>
              {lessons.length ? Math.round((done / lessons.length) * 100) : 0}%
            </Text>
          </HStack>
        </Card>
      ) : null}
      {canManage ? (
        <Button
          label="Add lesson"
          fullWidth={false}
          icon={<Plus size={16} color="#FFFFFF" strokeWidth={2.4} />}
          onPress={() => setShowAdd(true)}
        />
      ) : null}

      {lessons.length === 0 && !isLoading ? (
        <EmptyState
          icon={PlayCircle}
          title="No lessons yet"
          message={
            canManage
              ? "Add video lessons and study material."
              : "Lessons will appear here."
          }
        />
      ) : (
        lessons.map((l) => {
          const Icon = TYPE_ICON[l.type] || PlayCircle;
          return (
            <Card
              key={l.id}
              onPress={
                l.url ? () => Linking.openURL(l.url).catch(() => {}) : undefined
              }
            >
              <HStack align="center" gap={12}>
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: radius.md,
                    backgroundColor: palette.cobalt[50],
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} color={palette.cobalt[600]} strokeWidth={2} />
                </View>
                <VStack gap={2} flex={1}>
                  <Text variant="label-lg" tone="primary" numberOfLines={1}>
                    {l.title}
                  </Text>
                  <Text variant="caption" tone="tertiary">
                    {l.courseName}
                    {l.durationMinutes
                      ? ` · ${l.durationMinutes} min`
                      : ""} · {l.type}
                  </Text>
                </VStack>
                {isStudent ? (
                  <Pressable
                    onPress={() => !l.completed && complete.mutate(l.id)}
                    hitSlop={8}
                  >
                    {l.completed ? (
                      <CheckCircle2
                        size={24}
                        color={palette.success.text}
                        strokeWidth={2}
                      />
                    ) : (
                      <Circle
                        size={24}
                        color={palette.text.tertiary}
                        strokeWidth={1.8}
                      />
                    )}
                  </Pressable>
                ) : null}
              </HStack>
            </Card>
          );
        })
      )}

      <AddLessonModal visible={showAdd} onClose={() => setShowAdd(false)} />
    </VStack>
  );
}

function AddLessonModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const create = useCreateLesson();
  const { data: courses } = useCourses({ limit: 200 });
  const [form, setForm] = useState({
    courseId: null as string | null,
    title: "",
    type: "video",
    url: "",
    durationMinutes: "",
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  useEffect(() => {
    if (!visible)
      setForm({
        courseId: null,
        title: "",
        type: "video",
        url: "",
        durationMinutes: "",
      });
  }, [visible]);
  const prev = useRef(create.isPending);
  useEffect(() => {
    if (prev.current && !create.isPending && !create.error) onClose();
    prev.current = create.isPending;
  }, [create.isPending, create.error, onClose]);
  const submit = () => {
    if (!form.courseId || !form.title) return;
    create.mutate({
      courseId: form.courseId,
      title: form.title,
      type: form.type,
      url: form.url || undefined,
      durationMinutes: form.durationMinutes
        ? Number(form.durationMinutes)
        : undefined,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={ov.backdrop}>
        <View style={ov.sheet}>
          <HStack
            align="center"
            justify="space-between"
            style={{ marginBottom: 16 }}
          >
            <Text variant="h3" tone="primary">
              Add lesson
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={palette.text.tertiary} strokeWidth={2} />
            </Pressable>
          </HStack>
          {create.error ? (
            <View style={ov.err}>
              <Text variant="body-sm" tone="danger">
                {apiErrorMessage(create.error)}
              </Text>
            </View>
          ) : null}
          <VStack gap={14}>
            <Select
              label="Course"
              placeholder="Select course"
              value={form.courseId}
              options={(courses?.data || []).map((c) => ({
                value: c.id,
                label: c.name,
              }))}
              onChange={(v) => set("courseId", v)}
            />
            <TextField
              label="Title"
              value={form.title}
              onChangeText={(v) => set("title", v)}
              placeholder="Intro to Algebra"
            />
            <Select
              label="Type"
              value={form.type}
              options={[
                { value: "video", label: "Video" },
                { value: "document", label: "Document" },
                { value: "link", label: "Link" },
                { value: "text", label: "Text note" },
              ]}
              onChange={(v) => set("type", v || "video")}
            />
            <TextField
              label="URL"
              value={form.url}
              onChangeText={(v) => set("url", v)}
              placeholder="https://…"
              autoCapitalize="none"
            />
            <TextField
              label="Duration (min)"
              value={form.durationMinutes}
              onChangeText={(v) => set("durationMinutes", v)}
              keyboardType="number-pad"
            />
          </VStack>
          <Button
            label="Add lesson"
            size="lg"
            loading={create.isPending}
            onPress={submit}
            style={{ marginTop: 18 }}
          />
        </View>
      </View>
    </Modal>
  );
}

export const ov = {
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
  err: {
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: palette.danger.bg,
    borderWidth: 1,
    borderColor: palette.danger.border,
    marginBottom: 14,
  },
};
