import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Layers, Plus, X, Trash2 } from "lucide-react-native";
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
  StatusChip,
  EmptyState,
  Fab,
} from "@shared/ui";
import { apiErrorMessage } from "@api/apiClient";
import { useStructures, useSaveStructure } from "@modules/fees/hooks/useFees";
import { formatMoney, FeeStructure } from "@modules/fees/types";

export default function FeeStructuresScreen() {
  const canManage = useAuthStore((s) => s.hasPermission)(
    PERMISSIONS.FEES_MANAGE,
  );
  const { width } = useWindowDimensions();
  const isWide = width >= layout.wideBreakpoint;
  const { data, isLoading, refetch, isRefetching } = useStructures();
  const save = useSaveStructure();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();
  const [name, setName] = useState("");
  const [session, setSession] = useState("");
  const [rows, setRows] = useState<{ name: string; amount: string }[]>([
    { name: "", amount: "" },
  ]);

  const openCreate = () => {
    setEditId(undefined);
    setName("");
    setSession("");
    setRows([{ name: "", amount: "" }]);
    setOpen(true);
  };
  const openEdit = (s: FeeStructure) => {
    setEditId(s.id);
    setName(s.name);
    setSession(s.session);
    setRows(
      s.components.map((c) => ({
        name: c.name,
        amount: (c.amount / 100).toString(),
      })),
    );
    setOpen(true);
  };

  const prev = useRef(save.isPending);
  useEffect(() => {
    if (prev.current && !save.isPending && !save.error) setOpen(false);
    prev.current = save.isPending;
  }, [save.isPending, save.error]);

  const submit = () => {
    const components = rows
      .filter((r) => r.name && r.amount)
      .map((r) => ({
        name: r.name,
        amount: Math.round(Number(r.amount) * 100),
      }));
    if (!name || !components.length) return;
    save.mutate({
      id: editId,
      body: { name, session: session || undefined, components },
    });
  };

  const structures = data || [];

  return (
    <Screen
      overline="Fees & Accounts"
      title="Fee Structures"
      subtitle="Reusable fee templates per course"
      refreshing={isLoading || isRefetching}
      onRefresh={refetch}
      right={
        canManage ? (
          <Button
            label="Add structure"
            fullWidth={false}
            icon={<Plus size={16} color="#FFFFFF" strokeWidth={2.4} />}
            onPress={openCreate}
          />
        ) : undefined
      }
    >
      {structures.length === 0 && !isLoading ? (
        <EmptyState
          icon={Layers}
          title="No fee structures"
          message={
            canManage
              ? "Create a template of fee heads to bill students faster."
              : undefined
          }
        />
      ) : (
        <VStack gap={10}>
          {structures.map((s) => (
            <Card
              key={s.id}
              onPress={canManage ? () => openEdit(s) : undefined}
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
                  <Layers
                    size={19}
                    color={palette.cobalt[600]}
                    strokeWidth={2}
                  />
                </View>
                <VStack gap={2} flex={1}>
                  <Text variant="label-lg" tone="primary">
                    {s.name}
                  </Text>
                  <Text variant="caption" tone="tertiary">
                    {s.components.length} heads
                    {s.session ? ` · ${s.session}` : ""}
                  </Text>
                </VStack>
                <StatusChip label={formatMoney(s.total)} tone="info" />
              </HStack>
            </Card>
          ))}
        </VStack>
      )}
      {canManage && !isWide ? (
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
                {editId ? "Edit structure" : "Add fee structure"}
              </Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                <X size={20} color={palette.text.tertiary} strokeWidth={2} />
              </Pressable>
            </HStack>
            {save.error ? (
              <View style={styles.err}>
                <Text variant="body-sm" tone="danger">
                  {apiErrorMessage(save.error)}
                </Text>
              </View>
            ) : null}
            <ScrollView
              style={{ maxHeight: 440 }}
              showsVerticalScrollIndicator={false}
            >
              <VStack gap={14}>
                <TextField
                  label="Name"
                  value={name}
                  onChangeText={setName}
                  placeholder="Class 8 Annual"
                />
                <TextField
                  label="Session (optional)"
                  value={session}
                  onChangeText={setSession}
                  placeholder="2025-26"
                />
                <Text variant="label" tone="secondary">
                  Fee heads
                </Text>
                {rows.map((r, i) => (
                  <HStack key={i} gap={8} align="flex-end">
                    <View style={{ flex: 2 }}>
                      <TextField
                        label={i === 0 ? "Head" : undefined}
                        value={r.name}
                        onChangeText={(v) =>
                          setRows((rs) =>
                            rs.map((x, j) => (j === i ? { ...x, name: v } : x)),
                          )
                        }
                        placeholder="Tuition"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <TextField
                        label={i === 0 ? "Amount (₹)" : undefined}
                        value={r.amount}
                        onChangeText={(v) =>
                          setRows((rs) =>
                            rs.map((x, j) =>
                              j === i ? { ...x, amount: v } : x,
                            ),
                          )
                        }
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <Pressable
                      onPress={() =>
                        setRows((rs) => rs.filter((_, j) => j !== i))
                      }
                      style={{
                        height: 50,
                        justifyContent: "center",
                        paddingHorizontal: 6,
                      }}
                    >
                      <Trash2
                        size={18}
                        color={palette.danger.text}
                        strokeWidth={1.8}
                      />
                    </Pressable>
                  </HStack>
                ))}
                <Button
                  label="Add head"
                  variant="secondary"
                  fullWidth={false}
                  icon={
                    <Plus
                      size={14}
                      color={palette.text.primary}
                      strokeWidth={2}
                    />
                  }
                  onPress={() =>
                    setRows((rs) => [...rs, { name: "", amount: "" }])
                  }
                />
              </VStack>
            </ScrollView>
            <Button
              label={editId ? "Save changes" : "Create structure"}
              size="lg"
              loading={save.isPending}
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
