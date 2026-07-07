import React, { useEffect, useRef, useState } from "react";
import { View, Modal, Pressable, ScrollView } from "react-native";
import { ListChecks, Plus, X, Trash2, CheckCircle2 } from "lucide-react-native";
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
} from "@shared/ui";
import { apiErrorMessage } from "@api/apiClient";
import {
  useQuizzes,
  useCreateQuiz,
  useQuiz,
  useAttemptQuiz,
} from "@modules/lms/hooks/useLms";
import { useBatches } from "@modules/academics/hooks/useAcademics";
import { ov } from "./LessonsTab";

export function QuizzesTab() {
  const role = useAuthStore((s) => s.user?.role);
  const canManage = useAuthStore((s) => s.hasPermission)(
    PERMISSIONS.QUIZZES_MANAGE,
  );
  const isStudent = role === "student";
  const { data, isLoading } = useQuizzes();
  const [showAdd, setShowAdd] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const list = data || [];

  return (
    <VStack gap={12}>
      {canManage ? (
        <Button
          label="Create quiz"
          fullWidth={false}
          icon={<Plus size={16} color="#FFFFFF" strokeWidth={2.4} />}
          onPress={() => setShowAdd(true)}
        />
      ) : null}
      {list.length === 0 && !isLoading ? (
        <EmptyState
          icon={ListChecks}
          title="No quizzes"
          message={
            canManage
              ? "Create an MCQ quiz for a batch."
              : "Quizzes will appear here."
          }
        />
      ) : (
        list.map((q: any) => (
          <Card
            key={q.id}
            onPress={
              isStudent && !q.myAttempt ? () => setAttemptId(q.id) : undefined
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
                <ListChecks
                  size={19}
                  color={palette.cobalt[600]}
                  strokeWidth={2}
                />
              </View>
              <VStack gap={2} flex={1}>
                <Text variant="label-lg" tone="primary" numberOfLines={1}>
                  {q.title}
                </Text>
                <Text variant="caption" tone="tertiary">
                  {q.batchName} · {q.questionCount} questions · {q.totalMarks}{" "}
                  marks
                </Text>
              </VStack>
              {isStudent ? (
                q.myAttempt ? (
                  <StatusChip
                    label={`${q.myAttempt.score}/${q.myAttempt.totalMarks}`}
                    tone="success"
                  />
                ) : (
                  <StatusChip label="Attempt" tone="info" />
                )
              ) : null}
            </HStack>
          </Card>
        ))
      )}
      <CreateQuizModal visible={showAdd} onClose={() => setShowAdd(false)} />
      {attemptId ? (
        <AttemptModal id={attemptId} onClose={() => setAttemptId(null)} />
      ) : null}
    </VStack>
  );
}

function CreateQuizModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const create = useCreateQuiz();
  const { data: batches } = useBatches({ limit: 200 });
  const [batchId, setBatchId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [qs, setQs] = useState([
    { text: "", options: ["", ""], correctIndex: 0, marks: "1" },
  ]);
  useEffect(() => {
    if (!visible) {
      setBatchId(null);
      setTitle("");
      setQs([{ text: "", options: ["", ""], correctIndex: 0, marks: "1" }]);
    }
  }, [visible]);
  const prev = useRef(create.isPending);
  useEffect(() => {
    if (prev.current && !create.isPending && !create.error) onClose();
    prev.current = create.isPending;
  }, [create.isPending, create.error, onClose]);

  const submit = () => {
    if (!batchId || !title) return;
    const questions = qs
      .filter((q) => q.text && q.options.filter(Boolean).length >= 2)
      .map((q) => ({
        text: q.text,
        options: q.options.filter(Boolean),
        correctIndex: Math.min(
          q.correctIndex,
          q.options.filter(Boolean).length - 1,
        ),
        marks: Number(q.marks) || 1,
      }));
    if (!questions.length) return;
    create.mutate({ batchId, title, questions });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={ov.backdrop}>
        <View style={[ov.sheet, { maxWidth: 520 }]}>
          <HStack
            align="center"
            justify="space-between"
            style={{ marginBottom: 12 }}
          >
            <Text variant="h3" tone="primary">
              Create quiz
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
            style={{ maxHeight: 460 }}
            showsVerticalScrollIndicator={false}
          >
            <VStack gap={14}>
              <Select
                label="Batch"
                placeholder="Select batch"
                value={batchId}
                options={(batches?.data || []).map((b) => ({
                  value: b.id,
                  label: `${b.name} · ${b.courseName}`,
                }))}
                onChange={setBatchId}
              />
              <TextField
                label="Quiz title"
                value={title}
                onChangeText={setTitle}
                placeholder="Algebra quiz"
              />
              {qs.map((q, qi) => (
                <Card key={qi}>
                  <VStack gap={10}>
                    <HStack justify="space-between" align="center">
                      <Text variant="label" tone="primary">
                        Question {qi + 1}
                      </Text>
                      {qs.length > 1 ? (
                        <Pressable
                          onPress={() =>
                            setQs((x) => x.filter((_, j) => j !== qi))
                          }
                        >
                          <Trash2
                            size={16}
                            color={palette.danger.text}
                            strokeWidth={1.8}
                          />
                        </Pressable>
                      ) : null}
                    </HStack>
                    <TextField
                      value={q.text}
                      onChangeText={(v) =>
                        setQs((x) =>
                          x.map((y, j) => (j === qi ? { ...y, text: v } : y)),
                        )
                      }
                      placeholder="Question text"
                    />
                    {q.options.map((opt, oi) => (
                      <HStack key={oi} gap={8} align="center">
                        <Pressable
                          onPress={() =>
                            setQs((x) =>
                              x.map((y, j) =>
                                j === qi ? { ...y, correctIndex: oi } : y,
                              ),
                            )
                          }
                        >
                          <CheckCircle2
                            size={20}
                            color={
                              q.correctIndex === oi
                                ? palette.success.text
                                : palette.text.tertiary
                            }
                            strokeWidth={2}
                          />
                        </Pressable>
                        <View style={{ flex: 1 }}>
                          <TextField
                            value={opt}
                            onChangeText={(v) =>
                              setQs((x) =>
                                x.map((y, j) =>
                                  j === qi
                                    ? {
                                        ...y,
                                        options: y.options.map((o, k) =>
                                          k === oi ? v : o,
                                        ),
                                      }
                                    : y,
                                ),
                              )
                            }
                            placeholder={`Option ${oi + 1}`}
                          />
                        </View>
                      </HStack>
                    ))}
                    <Button
                      label="Add option"
                      size="sm"
                      variant="secondary"
                      fullWidth={false}
                      onPress={() =>
                        setQs((x) =>
                          x.map((y, j) =>
                            j === qi
                              ? { ...y, options: [...y.options, ""] }
                              : y,
                          ),
                        )
                      }
                    />
                  </VStack>
                </Card>
              ))}
              <Button
                label="Add question"
                variant="secondary"
                onPress={() =>
                  setQs((x) => [
                    ...x,
                    {
                      text: "",
                      options: ["", ""],
                      correctIndex: 0,
                      marks: "1",
                    },
                  ])
                }
              />
            </VStack>
          </ScrollView>
          <Button
            label="Create quiz"
            size="lg"
            loading={create.isPending}
            onPress={submit}
            style={{ marginTop: 16 }}
          />
        </View>
      </View>
    </Modal>
  );
}

function AttemptModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: quiz } = useQuiz(id);
  const attempt = useAttemptQuiz();
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{
    score: number;
    totalMarks: number;
    correctCount: number;
    totalQuestions: number;
  } | null>(null);
  useEffect(() => {
    if (quiz?.questions) setAnswers(new Array(quiz.questions.length).fill(-1));
  }, [quiz]);

  const submit = () =>
    attempt.mutate({ id, answers }, { onSuccess: (r) => setResult(r) });

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={ov.backdrop}>
        <View style={[ov.sheet, { maxWidth: 520 }]}>
          <HStack
            align="center"
            justify="space-between"
            style={{ marginBottom: 12 }}
          >
            <Text variant="h3" tone="primary" numberOfLines={1}>
              {quiz?.title || "Quiz"}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={palette.text.tertiary} strokeWidth={2} />
            </Pressable>
          </HStack>
          {result ? (
            <VStack gap={12} align="center" style={{ paddingVertical: 12 }}>
              <CheckCircle2
                size={44}
                color={palette.success.text}
                strokeWidth={2}
              />
              <Text variant="display-sm" tone="primary">
                {result.score}/{result.totalMarks}
              </Text>
              <Text variant="body-sm" tone="tertiary">
                {result.correctCount} of {result.totalQuestions} correct
              </Text>
              <Button
                label="Done"
                size="lg"
                onPress={onClose}
                style={{ marginTop: 8 }}
              />
            </VStack>
          ) : !quiz?.questions ? (
            <Text variant="body-sm" tone="tertiary">
              Loading…
            </Text>
          ) : (
            <>
              {attempt.error ? (
                <View style={ov.err}>
                  <Text variant="body-sm" tone="danger">
                    {apiErrorMessage(attempt.error)}
                  </Text>
                </View>
              ) : null}
              <ScrollView
                style={{ maxHeight: 440 }}
                showsVerticalScrollIndicator={false}
              >
                <VStack gap={16}>
                  {quiz.questions.map((q, qi) => (
                    <VStack key={qi} gap={8}>
                      <Text variant="label-lg" tone="primary">
                        {qi + 1}. {q.text}
                      </Text>
                      {q.options.map((opt, oi) => {
                        const on = answers[qi] === oi;
                        return (
                          <Pressable
                            key={oi}
                            onPress={() =>
                              setAnswers((a) =>
                                a.map((x, j) => (j === qi ? oi : x)),
                              )
                            }
                            style={{
                              padding: 12,
                              borderRadius: radius.md,
                              borderWidth: 1.5,
                              borderColor: on
                                ? palette.cobalt[600]
                                : palette.border.default,
                              backgroundColor: on
                                ? palette.cobalt[50]
                                : palette.surface.primary,
                            }}
                          >
                            <Text
                              variant="body-sm"
                              style={{
                                color: on
                                  ? palette.cobalt[700]
                                  : palette.text.secondary,
                              }}
                            >
                              {opt}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </VStack>
                  ))}
                </VStack>
              </ScrollView>
              <Button
                label="Submit quiz"
                size="lg"
                loading={attempt.isPending}
                disabled={answers.some((a) => a < 0)}
                onPress={submit}
                style={{ marginTop: 16 }}
              />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
