import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Megaphone, Plus, X } from "lucide-react-native";
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
  useAnnouncements,
  useCreateAnnouncement,
} from "@modules/communication/hooks/useComm";
import { useBatches } from "@modules/academics/hooks/useAcademics";

const TONE_TONE: Record<string, "info" | "success" | "warning" | "danger"> = {
  info: "info",
  success: "success",
  warning: "warning",
  danger: "danger",
};

export default function AnnouncementsScreen() {
  const canManage = useAuthStore((s) => s.hasPermission)(
    PERMISSIONS.COMMUNICATION_MANAGE,
  );
  const { width } = useWindowDimensions();
  const isWide = width >= layout.wideBreakpoint;
  const { data, isLoading, refetch, isRefetching } = useAnnouncements();
  const [showAdd, setShowAdd] = useState(false);
  const list = data || [];

  return (
    <Screen
      overline="Communication"
      title="Announcements"
      subtitle="Broadcasts to your institute"
      refreshing={isLoading || isRefetching}
      onRefresh={refetch}
      right={
        canManage ? (
          <Button
            label="New announcement"
            fullWidth={false}
            icon={<Plus size={16} color="#FFFFFF" strokeWidth={2.4} />}
            onPress={() => setShowAdd(true)}
          />
        ) : undefined
      }
    >
      {list.length === 0 && !isLoading ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements"
          message={
            canManage
              ? "Broadcast a notice to the whole institute, a role or a batch."
              : "Announcements from your institute will appear here."
          }
        />
      ) : (
        <VStack gap={10}>
          {list.map((a) => (
            <Card key={a.id}>
              <HStack gap={12} align="flex-start">
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
                  <Megaphone
                    size={19}
                    color={palette.cobalt[600]}
                    strokeWidth={2}
                  />
                </View>
                <VStack gap={4} flex={1}>
                  <HStack justify="space-between" align="center">
                    <Text variant="label-lg" tone="primary" numberOfLines={1}>
                      {a.title}
                    </Text>
                    <StatusChip
                      label={audienceLabel(a)}
                      tone={TONE_TONE[a.tone]}
                    />
                  </HStack>
                  {a.body ? (
                    <Text variant="body-sm" tone="secondary">
                      {a.body}
                    </Text>
                  ) : null}
                  <Text variant="caption" tone="tertiary">
                    {a.createdByName} · {new Date(a.createdAt).toLocaleString()}
                  </Text>
                </VStack>
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
      <ComposeModal visible={showAdd} onClose={() => setShowAdd(false)} />
    </Screen>
  );
}

function audienceLabel(a: any) {
  if (a.audience === "all") return "Everyone";
  if (a.audience === "role") return `All ${a.roleTarget}s`;
  if (a.audience === "batch") return a.batchName || "Batch";
  return `${a.recipientCount ?? ""} people`;
}

function ComposeModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const create = useCreateAnnouncement();
  const { data: batches } = useBatches({ limit: 200 });
  const [form, setForm] = useState({
    title: "",
    body: "",
    tone: "info",
    audience: "all",
    roleTarget: "parent",
    batchId: null as string | null,
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  useEffect(() => {
    if (!visible)
      setForm({
        title: "",
        body: "",
        tone: "info",
        audience: "all",
        roleTarget: "parent",
        batchId: null,
      });
  }, [visible]);
  const prev = useRef(create.isPending);
  useEffect(() => {
    if (prev.current && !create.isPending && !create.error) onClose();
    prev.current = create.isPending;
  }, [create.isPending, create.error, onClose]);
  const submit = () => {
    if (!form.title) return;
    const body: any = {
      title: form.title,
      body: form.body || undefined,
      tone: form.tone,
      audience: form.audience,
    };
    if (form.audience === "role") body.roleTarget = form.roleTarget;
    if (form.audience === "batch") body.batchId = form.batchId;
    create.mutate(body);
  };
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
              New announcement
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={palette.text.tertiary} strokeWidth={2} />
            </Pressable>
          </HStack>
          {create.error ? (
            <View style={styles.err}>
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
                label="Title"
                value={form.title}
                onChangeText={(v) => set("title", v)}
                placeholder="Sports Day"
              />
              <TextField
                label="Message"
                value={form.body}
                onChangeText={(v) => set("body", v)}
                placeholder="Details…"
              />
              <Select
                label="Audience"
                value={form.audience}
                options={[
                  { value: "all", label: "Everyone" },
                  { value: "role", label: "A role" },
                  { value: "batch", label: "A batch" },
                ]}
                onChange={(v) => set("audience", v || "all")}
              />
              {form.audience === "role" ? (
                <Select
                  label="Role"
                  value={form.roleTarget}
                  options={[
                    { value: "parent", label: "Parents" },
                    { value: "student", label: "Students" },
                    { value: "teacher", label: "Teachers" },
                    { value: "staff", label: "Staff" },
                  ]}
                  onChange={(v) => set("roleTarget", v || "parent")}
                />
              ) : null}
              {form.audience === "batch" ? (
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
              ) : null}
              <Select
                label="Tone"
                value={form.tone}
                options={[
                  { value: "info", label: "Info" },
                  { value: "success", label: "Positive" },
                  { value: "warning", label: "Warning" },
                  { value: "danger", label: "Urgent" },
                ]}
                onChange={(v) => set("tone", v || "info")}
              />
            </VStack>
          </ScrollView>
          <Button
            label="Send announcement"
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
