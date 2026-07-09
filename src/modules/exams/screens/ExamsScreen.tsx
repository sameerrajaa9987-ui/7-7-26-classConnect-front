import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FileSpreadsheet, Plus, X } from "lucide-react-native";
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
import { useExams, useCreateExam } from "@modules/exams/hooks/useExams";
import { useBatches, useSubjects } from "@modules/academics/hooks/useAcademics";

const TYPE_LABEL: Record<string, string> = {
  unit_test: "Unit Test",
  midterm: "Midterm",
  final: "Final",
  term: "Term",
  practical: "Practical",
  other: "Other",
};

export default function ExamsScreen() {
  const navigation = useNavigation<any>();
  const canManage = useAuthStore((s) => s.hasPermission)(
    PERMISSIONS.EXAMS_MANAGE,
  );
  const { width } = useWindowDimensions();
  const isWide = width >= layout.wideBreakpoint;
  const { data, isLoading, refetch, isRefetching } = useExams();
  const [showAdd, setShowAdd] = useState(false);
  const exams = data || [];

  return (
    <Screen
      overline="Examinations"
      title="Exams"
      subtitle="Schedules, marks entry & report cards"
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
      right={
        canManage ? (
          <Button
            label="Schedule exam"
            fullWidth={false}
            icon={<Plus size={16} color="#FFFFFF" strokeWidth={2.4} />}
            onPress={() => setShowAdd(true)}
          />
        ) : undefined
      }
    >
      {exams.length === 0 && !isLoading ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="No exams yet"
          message={
            canManage
              ? "Schedule an exam for a batch."
              : "Your exams & results will appear here."
          }
        />
      ) : (
        <VStack gap={10}>
          {exams.map((e) => (
            <Card
              key={e.id}
              onPress={() => navigation.navigate("ExamDetail", { id: e.id })}
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
                  <FileSpreadsheet
                    size={19}
                    color={palette.cobalt[600]}
                    strokeWidth={2}
                  />
                </View>
                <VStack gap={2} flex={1}>
                  <Text variant="label-lg" tone="primary" numberOfLines={1}>
                    {e.name}
                  </Text>
                  <Text variant="caption" tone="tertiary">
                    {e.batchName} · {TYPE_LABEL[e.examType]} ·{" "}
                    {e.subjects.length} subjects · {e.totalMaxMarks} marks
                  </Text>
                </VStack>
                <StatusChip
                  label={e.resultsPublished ? "Published" : "Draft"}
                  tone={e.resultsPublished ? "success" : "neutral"}
                />
              </HStack>
            </Card>
          ))}
        </VStack>
      )}
      {canManage && !isWide ? (
        <Fab
          onPress={() => setShowAdd(true)}
          icon={<Plus size={24} color="#FFFFFF" strokeWidth={2.4} />}
        />
      ) : null}
      <CreateExamModal visible={showAdd} onClose={() => setShowAdd(false)} />
    </Screen>
  );
}

function CreateExamModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const create = useCreateExam();
  const { data: batches } = useBatches({ limit: 200 });
  const { data: subjects } = useSubjects({ limit: 200 });
  const [form, setForm] = useState({
    name: "",
    batchId: null as string | null,
    examType: "term",
    subjectIds: [] as string[],
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  useEffect(() => {
    if (!visible)
      setForm({ name: "", batchId: null, examType: "term", subjectIds: [] });
  }, [visible]);
  const prev = useRef(create.isPending);
  useEffect(() => {
    if (prev.current && !create.isPending && !create.error) onClose();
    prev.current = create.isPending;
  }, [create.isPending, create.error, onClose]);
  const submit = () => {
    if (!form.name || !form.batchId || !form.subjectIds.length) return;
    const subs = (subjects?.data || [])
      .filter((s) => form.subjectIds.includes(s.id))
      .map((s) => ({
        subjectId: s.id,
        subjectName: s.name,
        maxMarks: 100,
        passMarks: 33,
      }));
    create.mutate({
      name: form.name,
      batchId: form.batchId,
      examType: form.examType,
      subjects: subs,
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
              Schedule exam
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
          <ScrollView
            style={{ maxHeight: 440 }}
            showsVerticalScrollIndicator={false}
          >
            <VStack gap={14}>
              <TextField
                label="Exam name"
                value={form.name}
                onChangeText={(v) => set("name", v)}
                placeholder="Term 1 Exam"
              />
              <Select
                label="Batch"
                placeholder="Select batch"
                value={form.batchId}
                options={(batches?.data || []).map((b) => ({
                  value: b.id,
                  label: `${b.name} · ${b.courseName}`,
                }))}
                onChange={(v) => set("batchId", v)}
              />
              <Select
                label="Type"
                value={form.examType}
                options={[
                  { value: "term", label: "Term" },
                  { value: "unit_test", label: "Unit Test" },
                  { value: "midterm", label: "Midterm" },
                  { value: "final", label: "Final" },
                  { value: "practical", label: "Practical" },
                ]}
                onChange={(v) => set("examType", v || "term")}
              />
              <View>
                <Text
                  variant="label"
                  tone="secondary"
                  style={{ marginBottom: 6 }}
                >
                  Subjects (100 marks each)
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
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 7,
                          borderRadius: radius.full,
                          borderWidth: 1,
                          borderColor: on
                            ? palette.cobalt[600]
                            : palette.border.default,
                          backgroundColor: on
                            ? palette.cobalt[600]
                            : palette.surface.primary,
                        }}
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
            </VStack>
          </ScrollView>
          <Button
            label="Schedule exam"
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
