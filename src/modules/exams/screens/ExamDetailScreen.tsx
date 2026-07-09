import React, { useEffect, useRef, useState } from "react";
import { View, Modal, Pressable, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ArrowLeft,
  Save,
  Send,
  Trophy,
  TriangleAlert,
  BarChart3,
  FileSpreadsheet,
  Pencil,
  Trash2,
  X,
} from "lucide-react-native";
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
  StatusChip,
  EmptyState,
  confirm,
} from "@shared/ui";
import { apiErrorMessage } from "@api/apiClient";
import {
  useExam,
  useExamResults,
  useExamAnalytics,
  useEnterMarks,
  usePublishResults,
  useUpdateExam,
  useDeleteExam,
  useMyReportCard,
} from "@modules/exams/hooks/useExams";
import { useStudents } from "@modules/students/hooks/useStudents";
import { ExamResult } from "@modules/exams/types";

const GRADE_TONE = (g: string) =>
  g === "F" || g === "AB" ? "danger" : g.startsWith("A") ? "success" : "info";

export default function ExamDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const id: string = route.params?.id;
  const role = useAuthStore((s) => s.user?.role);
  const canMarks = useAuthStore((s) => s.hasPermission)(
    PERMISSIONS.MARKS_MANAGE,
  );
  const canPublish = useAuthStore((s) => s.hasPermission)(
    PERMISSIONS.EXAMS_MANAGE,
  );
  const isPortal = role === "student" || role === "parent";
  const { data: exam, isLoading } = useExam(id);

  return (
    <Screen
      overline="Examinations"
      title={exam?.name || "Exam"}
      subtitle={exam ? `${exam.batchName} · ${exam.totalMaxMarks} marks` : ""}
      scroll
      refreshing={isLoading}
    >
      <Pressable
        onPress={() => navigation.goBack()}
        hitSlop={6}
        style={{ marginBottom: 16 }}
      >
        <HStack gap={6} align="center">
          <ArrowLeft size={18} color={palette.text.link} strokeWidth={2} />
          <Text variant="label" tone="link">
            All exams
          </Text>
        </HStack>
      </Pressable>
      {!exam ? null : isPortal ? (
        <ReportCardView examId={id} />
      ) : (
        <StaffView
          examId={id}
          exam={exam}
          canMarks={canMarks}
          canPublish={canPublish}
        />
      )}
    </Screen>
  );
}

function StaffView({ examId, exam, canMarks, canPublish }: any) {
  const navigation = useNavigation<any>();
  const { data: students } = useStudents({ batchId: exam.batchId, limit: 200 });
  const { data: results } = useExamResults(examId);
  const { data: analytics } = useExamAnalytics(examId);
  const enter = useEnterMarks();
  const publish = usePublishResults();
  const del = useDeleteExam();
  const [showEdit, setShowEdit] = useState(false);
  const [subjectId, setSubjectId] = useState<string | null>(
    exam.subjects[0]?.subjectId ?? null,
  );
  const [marks, setMarks] = useState<Record<string, string>>({});

  const subject = exam.subjects.find((s: any) => s.subjectId === subjectId);
  const roster = students?.data || [];

  useEffect(() => {
    // Prefill from existing results for the chosen subject.
    const next: Record<string, string> = {};
    for (const r of results || []) {
      const sub = r.subjects.find((x) => x.subjectId === subjectId);
      if (sub && sub.marksObtained != null)
        next[r.studentId] = String(sub.marksObtained);
    }
    setMarks(next);
  }, [subjectId, results]);

  const save = () => {
    const entries = roster
      .filter((s) => marks[s.id] !== undefined && marks[s.id] !== "")
      .map((s) => ({ studentId: s.id, marksObtained: Number(marks[s.id]) }));
    if (!subjectId || !entries.length) return;
    enter.mutate({ id: examId, body: { subjectId, entries } });
  };

  return (
    <VStack gap={16}>
      {/* Manage: edit / delete */}
      {canPublish ? (
        <HStack gap={10}>
          <Button
            label="Edit exam"
            size="sm"
            variant="secondary"
            fullWidth={false}
            icon={
              <Pencil size={15} color={palette.cobalt[600]} strokeWidth={2} />
            }
            onPress={() => setShowEdit(true)}
          />
          <Button
            label="Delete exam"
            size="sm"
            variant="destructive"
            fullWidth={false}
            loading={del.isPending}
            icon={<Trash2 size={15} color="#FFFFFF" strokeWidth={2} />}
            onPress={() =>
              confirm(
                `Delete exam "${exam.name}"? Entered marks and report cards will be removed. This can't be undone.`,
                () =>
                  del.mutate(examId, { onSuccess: () => navigation.goBack() }),
              )
            }
          />
        </HStack>
      ) : null}
      {showEdit ? (
        <EditExamModal exam={exam} onClose={() => setShowEdit(false)} />
      ) : null}

      {/* Analytics */}
      {analytics && analytics.appeared > 0 ? (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginHorizontal: -6,
          }}
        >
          {[
            {
              label: "Appeared",
              value: String(analytics.appeared),
              icon: BarChart3,
            },
            {
              label: "Pass %",
              value: `${analytics.passPercent}%`,
              icon: BarChart3,
            },
            {
              label: "Class avg",
              value: `${analytics.classAverage}%`,
              icon: BarChart3,
            },
            {
              label: "Weak students",
              value: String(analytics.weakStudents.length),
              icon: TriangleAlert,
            },
          ].map((t) => (
            <View
              key={t.label}
              style={{ width: "25%", padding: 6, minWidth: 130 }}
            >
              <Card>
                <VStack gap={2}>
                  <Text variant="h3" tone="primary">
                    {t.value}
                  </Text>
                  <Text variant="caption" tone="tertiary">
                    {t.label}
                  </Text>
                </VStack>
              </Card>
            </View>
          ))}
        </View>
      ) : null}
      {analytics?.topper ? (
        <Card>
          <HStack gap={10} align="center">
            <Trophy size={18} color={palette.warning.text} strokeWidth={2} />
            <Text variant="body-sm" tone="secondary">
              Topper:{" "}
              <Text variant="label" tone="primary">
                {analytics.topper.name}
              </Text>{" "}
              ({analytics.topper.percentage}%)
            </Text>
          </HStack>
        </Card>
      ) : null}

      {/* Marks entry */}
      {canMarks ? (
        <Card>
          <Text variant="h4" tone="primary" style={{ marginBottom: 12 }}>
            Marks entry
          </Text>
          <VStack gap={12}>
            <Select
              label="Subject"
              value={subjectId}
              options={exam.subjects.map((s: any) => ({
                value: s.subjectId,
                label: `${s.subjectName} (/${s.maxMarks})`,
              }))}
              onChange={setSubjectId}
            />
            {enter.error ? (
              <Text variant="body-sm" tone="danger">
                {apiErrorMessage(enter.error)}
              </Text>
            ) : null}
            {roster.map((s) => (
              <HStack key={s.id} gap={12} align="center">
                <VStack gap={1} flex={1}>
                  <Text variant="body-sm" tone="primary">
                    {s.fullName}
                  </Text>
                  <Text variant="caption" tone="tertiary">
                    {s.admissionNo}
                  </Text>
                </VStack>
                <View style={{ width: 90 }}>
                  <TextField
                    value={marks[s.id] || ""}
                    onChangeText={(v) => setMarks((m) => ({ ...m, [s.id]: v }))}
                    keyboardType="number-pad"
                    placeholder={`/${subject?.maxMarks ?? 100}`}
                  />
                </View>
              </HStack>
            ))}
            <Button
              label={`Save ${subject?.subjectName || ""} marks`}
              loading={enter.isPending}
              onPress={save}
              icon={<Save size={16} color="#FFFFFF" strokeWidth={2} />}
            />
          </VStack>
        </Card>
      ) : null}

      {/* Results table */}
      {(results || []).length ? (
        <Card>
          <HStack
            justify="space-between"
            align="center"
            style={{ marginBottom: 12 }}
          >
            <Text variant="h4" tone="primary">
              Results
            </Text>
            {canPublish && !exam.resultsPublished ? (
              <Button
                label="Publish results"
                size="sm"
                fullWidth={false}
                loading={publish.isPending}
                icon={<Send size={14} color="#FFFFFF" strokeWidth={2} />}
                onPress={() => publish.mutate(examId)}
              />
            ) : exam.resultsPublished ? (
              <StatusChip label="Published" tone="success" />
            ) : null}
          </HStack>
          <VStack gap={8}>
            {(results || []).map((r) => (
              <HStack key={r.id} align="center" gap={12}>
                <View style={{ width: 26, alignItems: "center" }}>
                  <Text variant="label-sm" tone="tertiary">
                    {r.rank ?? "–"}
                  </Text>
                </View>
                <VStack gap={1} flex={1}>
                  <Text variant="body-sm" tone="primary">
                    {r.studentName}
                  </Text>
                  <Text variant="caption" tone="tertiary">
                    {r.totalObtained}/{r.totalMax} · {r.percentage}%
                  </Text>
                </VStack>
                <StatusChip
                  label={r.status === "incomplete" ? "—" : r.overallGrade}
                  tone={
                    r.status === "incomplete"
                      ? "neutral"
                      : GRADE_TONE(r.overallGrade)
                  }
                />
              </HStack>
            ))}
          </VStack>
        </Card>
      ) : null}
    </VStack>
  );
}

function EditExamModal({ exam, onClose }: { exam: any; onClose: () => void }) {
  const update = useUpdateExam();
  const [name, setName] = useState(exam.name || "");
  const [examType, setExamType] = useState(exam.examType || "term");
  const prev = useRef(update.isPending);
  useEffect(() => {
    if (prev.current && !update.isPending && !update.error) onClose();
    prev.current = update.isPending;
  }, [update.isPending, update.error, onClose]);
  const submit = () => {
    if (!name) return;
    update.mutate({ id: exam.id || exam._id, body: { name, examType } });
  };
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={mstyle.backdrop}>
        <View style={mstyle.sheet}>
          <HStack
            align="center"
            justify="space-between"
            style={{ marginBottom: 16 }}
          >
            <Text variant="h3" tone="primary">
              Edit exam
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={palette.text.tertiary} strokeWidth={2} />
            </Pressable>
          </HStack>
          {update.error ? (
            <View style={mstyle.err}>
              <Text variant="body-sm" tone="danger">
                {apiErrorMessage(update.error)}
              </Text>
            </View>
          ) : null}
          <VStack gap={14}>
            <TextField
              label="Exam name"
              value={name}
              onChangeText={setName}
              placeholder="Term 1 Exam"
            />
            <Select
              label="Type"
              value={examType}
              options={[
                { value: "term", label: "Term" },
                { value: "unit_test", label: "Unit Test" },
                { value: "midterm", label: "Midterm" },
                { value: "final", label: "Final" },
                { value: "practical", label: "Practical" },
                { value: "other", label: "Other" },
              ]}
              onChange={(v) => setExamType(v || "term")}
            />
            <Text variant="caption" tone="tertiary">
              To change subjects, delete this exam and create a new one (only
              possible before marks are entered).
            </Text>
          </VStack>
          <Button
            label="Save changes"
            size="lg"
            loading={update.isPending}
            onPress={submit}
            style={{ marginTop: 18 }}
          />
        </View>
      </View>
    </Modal>
  );
}

const mstyle = {
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

function ReportCardView({ examId }: { examId: string }) {
  const { data, isLoading, error } = useMyReportCard(examId);
  if (isLoading)
    return (
      <Text variant="body-sm" tone="tertiary">
        Loading…
      </Text>
    );
  if (error)
    return (
      <EmptyState
        icon={FileSpreadsheet}
        title="Results not available"
        message="Your report card will appear here once results are published."
      />
    );
  const r = data!.result;
  return (
    <VStack gap={16}>
      <Card>
        <HStack justify="space-between" align="flex-start">
          <VStack gap={4}>
            <Text variant="display-sm" tone="primary">
              {r.percentage}%
            </Text>
            <Text variant="body-sm" tone="tertiary">
              {r.totalObtained}/{r.totalMax} · Grade {r.overallGrade}
              {r.rank ? ` · Rank ${r.rank}` : ""}
            </Text>
          </VStack>
          <StatusChip
            label={r.status}
            tone={
              r.status === "pass"
                ? "success"
                : r.status === "fail"
                  ? "danger"
                  : "neutral"
            }
          />
        </HStack>
      </Card>
      <Card>
        <Text variant="h4" tone="primary" style={{ marginBottom: 12 }}>
          Subjects
        </Text>
        <VStack gap={10}>
          {r.subjects.map((s) => (
            <HStack key={s.subjectId} align="center" gap={12}>
              <VStack gap={1} flex={1}>
                <Text variant="body-sm" tone="primary">
                  {s.subjectName}
                </Text>
                <Text variant="caption" tone="tertiary">
                  {s.isAbsent ? "Absent" : `${s.marksObtained}/${s.maxMarks}`}
                </Text>
              </VStack>
              <StatusChip
                label={s.grade || "—"}
                tone={GRADE_TONE(s.grade || "")}
              />
            </HStack>
          ))}
        </VStack>
      </Card>
    </VStack>
  );
}
