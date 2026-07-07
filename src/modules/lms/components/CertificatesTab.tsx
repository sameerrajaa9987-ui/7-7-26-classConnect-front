import React, { useEffect, useRef, useState } from "react";
import { View, Modal, Pressable } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Award, Plus, X } from "lucide-react-native";
import { useAuthStore } from "@shared/store/useAuthStore";
import { PERMISSIONS } from "@shared/permissions";
import { palette, radius, gradients, shadows } from "@shared/designSystem";
import { LinearGradient } from "expo-linear-gradient";
import {
  Text,
  VStack,
  HStack,
  Button,
  Select,
  TextField,
  EmptyState,
} from "@shared/ui";
import { apiErrorMessage } from "@api/apiClient";
import {
  useCertificates,
  useIssueCertificate,
} from "@modules/lms/hooks/useLms";
import { useStudents } from "@modules/students/hooks/useStudents";
import { useCourses } from "@modules/academics/hooks/useAcademics";
import { ov } from "./LessonsTab";

export function CertificatesTab() {
  const canIssue =
    useAuthStore((s) => s.hasPermission)(PERMISSIONS.LMS_MANAGE) ||
    useAuthStore.getState().hasPermission(PERMISSIONS.STUDENTS_MANAGE);
  const { data, isLoading } = useCertificates();
  const [showIssue, setShowIssue] = useState(false);
  const certs = data || [];

  return (
    <VStack gap={12}>
      {canIssue ? (
        <Button
          label="Issue certificate"
          fullWidth={false}
          icon={<Plus size={16} color="#FFFFFF" strokeWidth={2.4} />}
          onPress={() => setShowIssue(true)}
        />
      ) : null}
      {certs.length === 0 && !isLoading ? (
        <EmptyState
          icon={Award}
          title="No certificates"
          message={
            canIssue
              ? "Issue a certificate of completion to a student."
              : "Your certificates will appear here."
          }
        />
      ) : (
        certs.map((c) => (
          <LinearGradient
            key={c.id}
            colors={[...gradients.hero] as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: radius.xl, padding: 18, ...shadows.md }}
          >
            <HStack gap={14} align="center">
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: radius.md,
                  backgroundColor: "rgba(255,255,255,0.18)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Award size={22} color="#FFFFFF" strokeWidth={2} />
              </View>
              <VStack gap={2} flex={1}>
                <Text
                  variant="caption"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  {c.certificateNo}
                </Text>
                <Text variant="label-lg" tone="inverse" numberOfLines={1}>
                  {c.title}
                </Text>
                <Text
                  variant="caption"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  {c.studentName}
                  {c.courseName ? ` · ${c.courseName}` : ""} ·{" "}
                  {c.issuedDate.slice(0, 10)}
                </Text>
              </VStack>
              <View
                style={{
                  padding: 6,
                  backgroundColor: "#FFFFFF",
                  borderRadius: radius.sm,
                }}
              >
                <QRCode
                  value={c.qrValue}
                  size={54}
                  backgroundColor="#FFFFFF"
                  color="#0E121A"
                />
              </View>
            </HStack>
          </LinearGradient>
        ))
      )}
      <IssueModal visible={showIssue} onClose={() => setShowIssue(false)} />
    </VStack>
  );
}

function IssueModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const issue = useIssueCertificate();
  const { data: students } = useStudents({ limit: 200 });
  const { data: courses } = useCourses({ limit: 200 });
  const [form, setForm] = useState({
    studentId: null as string | null,
    courseId: null as string | null,
    title: "Certificate of Completion",
    remark: "",
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  useEffect(() => {
    if (!visible)
      setForm({
        studentId: null,
        courseId: null,
        title: "Certificate of Completion",
        remark: "",
      });
  }, [visible]);
  const prev = useRef(issue.isPending);
  useEffect(() => {
    if (prev.current && !issue.isPending && !issue.error) onClose();
    prev.current = issue.isPending;
  }, [issue.isPending, issue.error, onClose]);
  const submit = () => {
    if (!form.studentId) return;
    issue.mutate({
      studentId: form.studentId,
      courseId: form.courseId || undefined,
      title: form.title,
      remark: form.remark || undefined,
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
              Issue certificate
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={palette.text.tertiary} strokeWidth={2} />
            </Pressable>
          </HStack>
          {issue.error ? (
            <View style={ov.err}>
              <Text variant="body-sm" tone="danger">
                {apiErrorMessage(issue.error)}
              </Text>
            </View>
          ) : null}
          <VStack gap={14}>
            <Select
              label="Student"
              placeholder="Select student"
              value={form.studentId}
              options={(students?.data || []).map((s) => ({
                value: s.id,
                label: `${s.fullName} · ${s.admissionNo}`,
              }))}
              onChange={(v) => set("studentId", v)}
            />
            <Select
              label="Course (optional)"
              placeholder="Select course"
              value={form.courseId}
              options={(courses?.data || []).map((c) => ({
                value: c.id,
                label: c.name,
              }))}
              onChange={(v) => set("courseId", v)}
              allowClear
            />
            <TextField
              label="Title"
              value={form.title}
              onChangeText={(v) => set("title", v)}
            />
            <TextField
              label="Remark (optional)"
              value={form.remark}
              onChangeText={(v) => set("remark", v)}
            />
          </VStack>
          <Button
            label="Issue certificate"
            size="lg"
            loading={issue.isPending}
            onPress={submit}
            style={{ marginTop: 18 }}
          />
        </View>
      </View>
    </Modal>
  );
}
