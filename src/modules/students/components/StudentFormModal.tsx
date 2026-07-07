import React, { useEffect, useRef, useState } from "react";
import { View, Modal, Pressable, ScrollView } from "react-native";
import { X } from "lucide-react-native";
import { palette, radius, shadows } from "@shared/designSystem";
import { Text, VStack, HStack, Button, TextField, Select } from "@shared/ui";
import { apiErrorMessage } from "@api/apiClient";
import { useSaveStudent } from "@modules/students/hooks/useStudents";
import { useCourses, useBatches } from "@modules/academics/hooks/useAcademics";
import { Student } from "@modules/students/types";

interface Props {
  visible: boolean;
  onClose: () => void;
  editStudent?: Student | null;
}

const empty = {
  firstName: "",
  lastName: "",
  admissionNo: "",
  rollNo: "",
  gender: "",
  dateOfBirth: "",
  bloodGroup: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  courseId: null as string | null,
  batchId: null as string | null,
  g0name: "",
  g0phone: "",
  g0email: "",
  g1name: "",
  g1phone: "",
  g1email: "",
};

export function StudentFormModal({ visible, onClose, editStudent }: Props) {
  const mut = useSaveStudent();
  const { data: courses } = useCourses({ limit: 200 });
  const { data: batches } = useBatches({ limit: 200 });
  const [form, setForm] = useState({ ...empty });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (editStudent) {
      const g = editStudent.guardians;
      setForm({
        firstName: editStudent.firstName,
        lastName: editStudent.lastName,
        admissionNo: editStudent.admissionNo,
        rollNo: editStudent.rollNo,
        gender: editStudent.gender,
        dateOfBirth: editStudent.dateOfBirth
          ? editStudent.dateOfBirth.slice(0, 10)
          : "",
        bloodGroup: editStudent.bloodGroup,
        phone: editStudent.phone,
        email: editStudent.email,
        address: editStudent.address,
        city: editStudent.city,
        courseId: editStudent.courseId,
        batchId: editStudent.batchId,
        g0name: g[0]?.name || "",
        g0phone: g[0]?.phone || "",
        g0email: g[0]?.email || "",
        g1name: g[1]?.name || "",
        g1phone: g[1]?.phone || "",
        g1email: g[1]?.email || "",
      });
    } else {
      setForm({ ...empty });
    }
  }, [editStudent, visible]);

  const prev = useRef(mut.isPending);
  useEffect(() => {
    if (prev.current && !mut.isPending && !mut.error) onClose();
    prev.current = mut.isPending;
  }, [mut.isPending, mut.error, onClose]);

  const submit = () => {
    if (!form.firstName) return;
    const guardians = [];
    if (form.g0name || form.g0phone || form.g0email)
      guardians.push({
        relation: "Father",
        name: form.g0name,
        phone: form.g0phone,
        email: form.g0email,
        isPrimary: true,
      });
    if (form.g1name || form.g1phone || form.g1email)
      guardians.push({
        relation: "Mother",
        name: form.g1name,
        phone: form.g1phone,
        email: form.g1email,
      });

    const body: Record<string, unknown> = {
      firstName: form.firstName,
      lastName: form.lastName || undefined,
      rollNo: form.rollNo || undefined,
      gender: form.gender || undefined,
      dateOfBirth: form.dateOfBirth || undefined,
      bloodGroup: form.bloodGroup || undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      address: form.address || undefined,
      city: form.city || undefined,
      courseId: form.courseId,
      batchId: form.batchId,
      guardians,
    };
    if (!editStudent && form.admissionNo) body.admissionNo = form.admissionNo;
    mut.mutate({ id: editStudent?.id, body });
  };

  const courseOpts = (courses?.data || []).map((c) => ({
    value: c.id,
    label: c.name,
  }));
  const batchOpts = (batches?.data || [])
    .filter((b) => !form.courseId || b.courseId === form.courseId)
    .map((b) => ({ value: b.id, label: `${b.name} · ${b.courseName}` }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <HStack
            align="center"
            justify="space-between"
            style={{ marginBottom: 16 }}
          >
            <Text variant="h3" tone="primary">
              {editStudent ? "Edit student" : "Admit student"}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
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
            style={{ maxHeight: 480 }}
            showsVerticalScrollIndicator={false}
          >
            <VStack gap={14}>
              <HStack gap={12}>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="First name"
                    value={form.firstName}
                    onChangeText={(v) => set("firstName", v)}
                    placeholder="Ayaan"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="Last name"
                    value={form.lastName}
                    onChangeText={(v) => set("lastName", v)}
                    placeholder="Khan"
                  />
                </View>
              </HStack>
              {!editStudent ? (
                <TextField
                  label="Admission no. (optional)"
                  value={form.admissionNo}
                  onChangeText={(v) => set("admissionNo", v)}
                  placeholder="auto if blank"
                />
              ) : null}
              <HStack gap={12}>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="Roll no."
                    value={form.rollNo}
                    onChangeText={(v) => set("rollNo", v)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Select
                    label="Gender"
                    value={form.gender || null}
                    options={[
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                      { value: "other", label: "Other" },
                    ]}
                    onChange={(v) => set("gender", v || "")}
                    allowClear
                  />
                </View>
              </HStack>
              <HStack gap={12}>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="Date of birth"
                    value={form.dateOfBirth}
                    onChangeText={(v) => set("dateOfBirth", v)}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="Blood group"
                    value={form.bloodGroup}
                    onChangeText={(v) => set("bloodGroup", v)}
                    placeholder="B+"
                  />
                </View>
              </HStack>
              <Select
                label="Course"
                placeholder="Select course"
                value={form.courseId}
                options={courseOpts}
                onChange={(v) => set("courseId", v)}
                allowClear
              />
              <Select
                label="Batch"
                placeholder="Select batch"
                value={form.batchId}
                options={batchOpts}
                onChange={(v) => set("batchId", v)}
                allowClear
              />
              <HStack gap={12}>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="Phone"
                    value={form.phone}
                    onChangeText={(v) => set("phone", v)}
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="Email"
                    value={form.email}
                    onChangeText={(v) => set("email", v)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </HStack>
              <TextField
                label="Address"
                value={form.address}
                onChangeText={(v) => set("address", v)}
              />
              <TextField
                label="City"
                value={form.city}
                onChangeText={(v) => set("city", v)}
              />

              <Text variant="label-lg" tone="primary" style={{ marginTop: 4 }}>
                Guardians
              </Text>
              <TextField
                label="Father / Guardian name"
                value={form.g0name}
                onChangeText={(v) => set("g0name", v)}
              />
              <HStack gap={12}>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="Phone"
                    value={form.g0phone}
                    onChangeText={(v) => set("g0phone", v)}
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="Email"
                    value={form.g0email}
                    onChangeText={(v) => set("g0email", v)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </HStack>
              <TextField
                label="Mother name"
                value={form.g1name}
                onChangeText={(v) => set("g1name", v)}
              />
              <HStack gap={12}>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="Phone"
                    value={form.g1phone}
                    onChangeText={(v) => set("g1phone", v)}
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="Email"
                    value={form.g1email}
                    onChangeText={(v) => set("g1email", v)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </HStack>
            </VStack>
          </ScrollView>
          <Button
            label={editStudent ? "Save changes" : "Admit student"}
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
    maxWidth: 520,
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
};
