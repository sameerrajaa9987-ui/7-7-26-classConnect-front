import React, { useEffect, useRef, useState } from "react";
import { View, Modal, Pressable, ScrollView } from "react-native";
import { ClipboardList, Plus, X, Pencil, Trash2 } from "lucide-react-native";
import { useAuthStore } from "@shared/store/useAuthStore";
import { PERMISSIONS } from "@shared/permissions";
import { palette, radius } from "@shared/designSystem";
import {
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
  useAssignments,
  useCreateAssignment,
  useUpdateAssignment,
  useDeleteAssignment,
  useAssignment,
  useSubmitAssignment,
  useGradeSubmission,
} from "@modules/lms/hooks/useLms";
import { useBatches } from "@modules/academics/hooks/useAcademics";
import { Assignment } from "@modules/lms/types";
import { ov } from "./LessonsTab";

export function AssignmentsTab() {
  const role = useAuthStore((s) => s.user?.role);
  const canManage = useAuthStore((s) => s.hasPermission)(
    PERMISSIONS.ASSIGNMENTS_MANAGE,
  );
  const isStudent = role === "student";
  const { data, isLoading } = useAssignments();
  const [showAdd, setShowAdd] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editA, setEditA] = useState<Assignment | null>(null);

  const list = data || [];

  return (
    <VStack gap={12}>
      {canManage ? (
        <Button
          label="New assignment"
          fullWidth={false}
          icon={<Plus size={16} color="#FFFFFF" strokeWidth={2.4} />}
          onPress={() => setShowAdd(true)}
        />
      ) : null}
      {list.length === 0 && !isLoading ? (
        <EmptyState
          icon={ClipboardList}
          title="No assignments"
          message={
            canManage
              ? "Set homework for a batch."
              : "Your assignments will appear here."
          }
        />
      ) : (
        list.map((a) => (
          <Card key={a.id} onPress={() => setDetailId(a.id)}>
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
                <ClipboardList
                  size={19}
                  color={palette.cobalt[600]}
                  strokeWidth={2}
                />
              </View>
              <VStack gap={2} flex={1}>
                <Text variant="label-lg" tone="primary" numberOfLines={1}>
                  {a.title}
                </Text>
                <Text variant="caption" tone="tertiary">
                  {a.batchName} · {a.maxMarks} marks
                  {a.dueDate ? ` · due ${a.dueDate.slice(0, 10)}` : ""}
                </Text>
              </VStack>
              {isStudent ? (
                <StatusChip
                  label={
                    a.mySubmission
                      ? a.mySubmission.status === "graded"
                        ? `${a.mySubmission.marks}/${a.maxMarks}`
                        : "Submitted"
                      : "Pending"
                  }
                  tone={
                    a.mySubmission
                      ? a.mySubmission.status === "graded"
                        ? "success"
                        : "info"
                      : "warning"
                  }
                />
              ) : (
                <StatusChip
                  label={`${a.gradedCount ?? 0}/${a.submissionCount ?? 0} graded`}
                  tone="neutral"
                />
              )}
            </HStack>
          </Card>
        ))
      )}
      <AssignmentFormModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
      />
      {editA ? (
        <AssignmentFormModal
          visible
          editAssignment={editA}
          onClose={() => setEditA(null)}
        />
      ) : null}
      {detailId ? (
        <AssignmentDetailModal
          id={detailId}
          isStudent={isStudent}
          canManage={canManage}
          onClose={() => setDetailId(null)}
          onEdit={(a) => {
            setDetailId(null);
            setEditA(a);
          }}
        />
      ) : null}
    </VStack>
  );
}

function AssignmentFormModal({
  visible,
  onClose,
  editAssignment,
}: {
  visible: boolean;
  onClose: () => void;
  editAssignment?: Assignment;
}) {
  const create = useCreateAssignment();
  const update = useUpdateAssignment();
  const isEdit = !!editAssignment;
  const mut = isEdit ? update : create;
  const { data: batches } = useBatches({ limit: 200 });
  const [form, setForm] = useState({
    batchId: null as string | null,
    title: "",
    maxMarks: "100",
    dueDate: "",
    description: "",
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  useEffect(() => {
    if (!visible) return;
    if (editAssignment) {
      setForm({
        batchId: String((editAssignment as any).batchId || ""),
        title: editAssignment.title || "",
        maxMarks: String(editAssignment.maxMarks ?? 100),
        dueDate: editAssignment.dueDate
          ? editAssignment.dueDate.slice(0, 10)
          : "",
        description: (editAssignment as any).description || "",
      });
    } else {
      setForm({
        batchId: null,
        title: "",
        maxMarks: "100",
        dueDate: "",
        description: "",
      });
    }
  }, [visible, editAssignment]);
  const prev = useRef(mut.isPending);
  useEffect(() => {
    if (prev.current && !mut.isPending && !mut.error) onClose();
    prev.current = mut.isPending;
  }, [mut.isPending, mut.error, onClose]);
  const submit = () => {
    if (!form.title || (!isEdit && !form.batchId)) return;
    const body = {
      title: form.title,
      maxMarks: Number(form.maxMarks) || 100,
      dueDate: form.dueDate || (isEdit ? null : undefined),
      description: form.description || undefined,
    };
    if (isEdit) {
      update.mutate({
        id: (editAssignment as any).id || (editAssignment as any)._id,
        body,
      });
    } else {
      create.mutate({ batchId: form.batchId, ...body });
    }
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
              {isEdit ? "Edit assignment" : "New assignment"}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={palette.text.tertiary} strokeWidth={2} />
            </Pressable>
          </HStack>
          {mut.error ? (
            <View style={ov.err}>
              <Text variant="body-sm" tone="danger">
                {apiErrorMessage(mut.error)}
              </Text>
            </View>
          ) : null}
          <VStack gap={14}>
            {isEdit ? null : (
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
            )}
            <TextField
              label="Title"
              value={form.title}
              onChangeText={(v) => set("title", v)}
              placeholder="Algebra worksheet"
            />
            <TextField
              label="Description"
              value={form.description}
              onChangeText={(v) => set("description", v)}
            />
            <HStack gap={12}>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Max marks"
                  value={form.maxMarks}
                  onChangeText={(v) => set("maxMarks", v)}
                  keyboardType="number-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Due date"
                  value={form.dueDate}
                  onChangeText={(v) => set("dueDate", v)}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </HStack>
          </VStack>
          <Button
            label={isEdit ? "Save changes" : "Create assignment"}
            size="lg"
            loading={mut.isPending}
            onPress={submit}
            style={{ marginTop: 18 }}
          />
        </View>
      </View>
    </Modal>
  );
}

function AssignmentDetailModal({
  id,
  isStudent,
  canManage,
  onClose,
  onEdit,
}: {
  id: string;
  isStudent: boolean;
  canManage: boolean;
  onClose: () => void;
  onEdit: (a: Assignment) => void;
}) {
  const { data: a } = useAssignment(id);
  const submit = useSubmitAssignment();
  const grade = useGradeSubmission();
  const del = useDeleteAssignment();
  const [text, setText] = useState("");
  const [grades, setGrades] = useState<Record<string, string>>({});

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={ov.backdrop}>
        <View style={ov.sheet}>
          <HStack
            align="center"
            justify="space-between"
            style={{ marginBottom: 12 }}
          >
            <Text variant="h3" tone="primary" numberOfLines={1}>
              {a?.title || "Assignment"}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={palette.text.tertiary} strokeWidth={2} />
            </Pressable>
          </HStack>
          {!a ? (
            <Text variant="body-sm" tone="tertiary">
              Loading…
            </Text>
          ) : (
            <ScrollView
              style={{ maxHeight: 460 }}
              showsVerticalScrollIndicator={false}
            >
              <VStack gap={12}>
                <Text variant="body-sm" tone="tertiary">
                  {a.batchName} · {a.maxMarks} marks
                  {a.dueDate ? ` · due ${a.dueDate.slice(0, 10)}` : ""}
                </Text>
                {a.description ? (
                  <Text variant="body-sm" tone="secondary">
                    {a.description}
                  </Text>
                ) : null}
                {canManage ? (
                  <HStack gap={10}>
                    <Button
                      label="Edit"
                      size="sm"
                      variant="secondary"
                      fullWidth={false}
                      icon={
                        <Pencil
                          size={15}
                          color={palette.cobalt[600]}
                          strokeWidth={2}
                        />
                      }
                      onPress={() => onEdit(a)}
                    />
                    <Button
                      label="Delete"
                      size="sm"
                      variant="destructive"
                      fullWidth={false}
                      loading={del.isPending}
                      icon={
                        <Trash2 size={15} color="#FFFFFF" strokeWidth={2} />
                      }
                      onPress={() =>
                        confirm(
                          `Delete assignment "${a.title}"? This can't be undone.`,
                          () =>
                            del.mutate((a as any).id || (a as any)._id, {
                              onSuccess: onClose,
                            }),
                        )
                      }
                    />
                  </HStack>
                ) : null}

                {isStudent ? (
                  a.mySubmission ? (
                    <Card>
                      <VStack gap={6}>
                        <StatusChip
                          label={
                            a.mySubmission.status === "graded"
                              ? `Graded ${a.mySubmission.marks}/${a.maxMarks}`
                              : "Submitted"
                          }
                          tone={
                            a.mySubmission.status === "graded"
                              ? "success"
                              : "info"
                          }
                        />
                        {a.mySubmission.text ? (
                          <Text variant="body-sm" tone="secondary">
                            {a.mySubmission.text}
                          </Text>
                        ) : null}
                        {a.mySubmission.feedback ? (
                          <Text variant="body-sm" tone="tertiary">
                            Feedback: {a.mySubmission.feedback}
                          </Text>
                        ) : null}
                      </VStack>
                    </Card>
                  ) : (
                    <VStack gap={10}>
                      <TextField
                        label="Your answer"
                        value={text}
                        onChangeText={setText}
                        placeholder="Type your submission…"
                      />
                      <Button
                        label="Submit assignment"
                        loading={submit.isPending}
                        onPress={() =>
                          submit.mutate(
                            { id, body: { text } },
                            { onSuccess: onClose },
                          )
                        }
                      />
                    </VStack>
                  )
                ) : (
                  <VStack gap={10}>
                    <Text variant="label-lg" tone="primary">
                      Submissions ({a.submissions?.length || 0})
                    </Text>
                    {(a.submissions || []).map((s) => (
                      <Card key={s.id}>
                        <VStack gap={8}>
                          <HStack justify="space-between" align="center">
                            <Text variant="label" tone="primary">
                              {s.studentName}
                            </Text>
                            <StatusChip
                              label={
                                s.status === "graded"
                                  ? `${s.marks}/${a.maxMarks}`
                                  : s.isLate
                                    ? "Late"
                                    : "Submitted"
                              }
                              tone={
                                s.status === "graded"
                                  ? "success"
                                  : s.isLate
                                    ? "warning"
                                    : "info"
                              }
                            />
                          </HStack>
                          {s.text ? (
                            <Text variant="body-sm" tone="secondary">
                              {s.text}
                            </Text>
                          ) : null}
                          {canManage && s.status !== "graded" ? (
                            <HStack gap={8} align="flex-end">
                              <View style={{ flex: 1 }}>
                                <TextField
                                  label="Marks"
                                  value={grades[s.id] || ""}
                                  onChangeText={(v) =>
                                    setGrades((g) => ({ ...g, [s.id]: v }))
                                  }
                                  keyboardType="number-pad"
                                />
                              </View>
                              <Button
                                label="Grade"
                                fullWidth={false}
                                loading={grade.isPending}
                                onPress={() =>
                                  grade.mutate({
                                    id: s.id,
                                    body: { marks: Number(grades[s.id] || 0) },
                                  })
                                }
                              />
                            </HStack>
                          ) : null}
                        </VStack>
                      </Card>
                    ))}
                    {(a.submissions || []).length === 0 ? (
                      <Text variant="body-sm" tone="tertiary">
                        No submissions yet.
                      </Text>
                    ) : null}
                  </VStack>
                )}
              </VStack>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
