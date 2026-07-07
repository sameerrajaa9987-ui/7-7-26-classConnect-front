import React, { useState } from "react";
import {
  View,
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { X, Plus, Pencil } from "lucide-react-native";
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

export interface FieldOption {
  value: string;
  label: string;
}
export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "multiselect";
  placeholder?: string;
  options?: FieldOption[];
  required?: boolean;
}

export interface CrudRow {
  id: string;
  title: string;
  subtitle?: string;
  badge?: {
    label: string;
    tone?: "success" | "warning" | "danger" | "info" | "neutral";
  };
  raw: Record<string, any>;
}

interface Props {
  overline: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  rows: CrudRow[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  canWrite: boolean;
  fields: FieldDef[];
  /** Map a raw record to the form state for editing. */
  toForm: (raw: Record<string, any>) => Record<string, any>;
  /** Build the create/update payload from form state. */
  toPayload: (form: Record<string, any>) => Record<string, unknown>;
  emptyForm: Record<string, any>;
  saving: boolean;
  saveError?: unknown;
  onSave: (v: { id?: string; body: Record<string, unknown> }) => void;
  addLabel: string;
}

export function CrudScreen({
  overline,
  title,
  subtitle,
  icon: Icon,
  rows,
  loading,
  refreshing,
  onRefresh,
  canWrite,
  fields,
  toForm,
  toPayload,
  emptyForm,
  saving,
  saveError,
  onSave,
  addLabel,
}: Props) {
  const { width } = useWindowDimensions();
  const isWide = width >= layout.wideBreakpoint;
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();
  const [form, setForm] = useState<Record<string, any>>(emptyForm);

  const openCreate = () => {
    setEditId(undefined);
    setForm(emptyForm);
    setOpen(true);
  };
  const openEdit = (row: CrudRow) => {
    setEditId(row.id);
    setForm(toForm(row.raw));
    setOpen(true);
  };

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    onSave({ id: editId, body: toPayload(form) });
  };

  // Close the modal once a save succeeds (saving flips false with no error).
  const prevSaving = React.useRef(saving);
  React.useEffect(() => {
    if (prevSaving.current && !saving && !saveError) setOpen(false);
    prevSaving.current = saving;
  }, [saving, saveError]);

  return (
    <Screen
      overline={overline}
      title={title}
      subtitle={subtitle}
      refreshing={refreshing || loading}
      onRefresh={onRefresh}
      right={
        canWrite ? (
          <Button
            label={addLabel}
            fullWidth={false}
            icon={<Plus size={16} color="#FFFFFF" strokeWidth={2.4} />}
            onPress={openCreate}
          />
        ) : undefined
      }
    >
      {rows.length === 0 && !loading ? (
        <EmptyState
          icon={Icon}
          title={`No ${title.toLowerCase()} yet`}
          message={
            canWrite ? `Tap "${addLabel}" to create the first one.` : undefined
          }
        />
      ) : (
        <VStack gap={10}>
          {rows.map((row) => (
            <Card
              key={row.id}
              onPress={canWrite ? () => openEdit(row) : undefined}
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
                  <Icon size={19} color={palette.cobalt[600]} strokeWidth={2} />
                </View>
                <VStack gap={2} flex={1}>
                  <Text variant="label-lg" tone="primary" numberOfLines={1}>
                    {row.title}
                  </Text>
                  {row.subtitle ? (
                    <Text variant="body-sm" tone="tertiary" numberOfLines={1}>
                      {row.subtitle}
                    </Text>
                  ) : null}
                </VStack>
                {row.badge ? (
                  <StatusChip label={row.badge.label} tone={row.badge.tone} />
                ) : null}
                {canWrite ? (
                  <Pencil
                    size={16}
                    color={palette.text.tertiary}
                    strokeWidth={1.8}
                  />
                ) : null}
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
                {editId ? `Edit ${addLabel.replace(/^Add\s*/i, "")}` : addLabel}
              </Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                <X size={20} color={palette.text.tertiary} strokeWidth={2} />
              </Pressable>
            </HStack>

            {saveError ? (
              <View style={styles.errBox}>
                <Text variant="body-sm" tone="danger">
                  {apiErrorMessage(saveError)}
                </Text>
              </View>
            ) : null}

            <ScrollView
              style={{ maxHeight: 420 }}
              showsVerticalScrollIndicator={false}
            >
              <VStack gap={14}>
                {fields.map((f) => {
                  if (f.type === "select") {
                    return (
                      <Select
                        key={f.key}
                        label={f.label}
                        placeholder={f.placeholder}
                        value={form[f.key] ?? null}
                        options={f.options || []}
                        onChange={(v) => set(f.key, v)}
                        allowClear={!f.required}
                      />
                    );
                  }
                  if (f.type === "multiselect") {
                    const selected: string[] = form[f.key] || [];
                    return (
                      <View key={f.key}>
                        <Text
                          variant="label"
                          tone="secondary"
                          style={{ marginBottom: 6 }}
                        >
                          {f.label}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: 8,
                          }}
                        >
                          {(f.options || []).map((o) => {
                            const on = selected.includes(o.value);
                            return (
                              <Pressable
                                key={o.value}
                                onPress={() =>
                                  set(
                                    f.key,
                                    on
                                      ? selected.filter((x) => x !== o.value)
                                      : [...selected, o.value],
                                  )
                                }
                                style={[styles.chip, on && styles.chipOn]}
                              >
                                <Text
                                  variant="label-sm"
                                  style={{
                                    color: on
                                      ? "#FFFFFF"
                                      : palette.text.secondary,
                                  }}
                                >
                                  {o.label}
                                </Text>
                              </Pressable>
                            );
                          })}
                          {(f.options || []).length === 0 ? (
                            <Text variant="body-sm" tone="tertiary">
                              None available yet.
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    );
                  }
                  return (
                    <TextField
                      key={f.key}
                      label={f.label}
                      placeholder={f.placeholder}
                      value={form[f.key] != null ? String(form[f.key]) : ""}
                      onChangeText={(v) => set(f.key, v)}
                      keyboardType={
                        f.type === "number" ? "number-pad" : "default"
                      }
                    />
                  );
                })}
              </VStack>
            </ScrollView>

            <Button
              label={editId ? "Save changes" : "Create"}
              size="lg"
              loading={saving}
              onPress={submit}
              style={{ marginTop: 18 }}
            />
          </View>
        </View>
      </Modal>
    </Screen>
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
};
