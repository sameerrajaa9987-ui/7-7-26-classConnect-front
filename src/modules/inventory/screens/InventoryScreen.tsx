import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Boxes, Plus, X, Wrench, Search, QrCode } from "lucide-react-native";
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
  StatTile,
  Fab,
} from "@shared/ui";
import { apiErrorMessage } from "@api/apiClient";
import {
  useAssets,
  useInventoryAnalytics,
  useSaveAsset,
  useAsset,
  useAddMaintenance,
} from "@modules/inventory/hooks/useInventory";
import {
  useClassrooms,
  useTeachers,
} from "@modules/academics/hooks/useAcademics";
import { ASSET_CATEGORIES } from "@modules/inventory/types";

const money = (paise?: number) =>
  paise == null
    ? "—"
    : "₹" + (paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 });
const STATUS_TONE: Record<
  string,
  "success" | "warning" | "danger" | "neutral"
> = {
  active: "success",
  under_maintenance: "warning",
  retired: "neutral",
  lost: "danger",
};

export default function InventoryScreen() {
  const canManage = useAuthStore((s) => s.hasPermission)(
    PERMISSIONS.INVENTORY_MANAGE,
  );
  const { width } = useWindowDimensions();
  const isWide = width >= layout.wideBreakpoint;
  const cols = width >= 1100 ? 4 : 2;
  const [search, setSearch] = useState("");
  const { data: analytics } = useInventoryAnalytics();
  const { data, isLoading, refetch, isRefetching } = useAssets({
    limit: 200,
    search: search || undefined,
  });
  const [showAdd, setShowAdd] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const assets = data?.data || [];

  return (
    <Screen
      overline="Inventory & Assets"
      title="Inventory"
      subtitle="Assets, QR tracking, maintenance & warranty"
      refreshing={isLoading || isRefetching}
      onRefresh={refetch}
      right={
        canManage ? (
          <Button
            label="Add asset"
            fullWidth={false}
            icon={<Plus size={16} color="#FFFFFF" strokeWidth={2.4} />}
            onPress={() => setShowAdd(true)}
          />
        ) : undefined
      }
    >
      {analytics ? (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginHorizontal: -6,
            marginBottom: 8,
          }}
        >
          {[
            {
              label: "Total assets",
              value: String(analytics.totalAssets),
              icon: Boxes,
            },
            {
              label: "Asset value",
              value: money(analytics.totalValue),
              icon: Boxes,
            },
            {
              label: "Under maintenance",
              value: String(analytics.underMaintenance),
              icon: Wrench,
            },
            {
              label: "Low stock",
              value: String(analytics.lowStock),
              icon: Boxes,
            },
          ].map((t) => (
            <View key={t.label} style={{ width: `${100 / cols}%`, padding: 6 }}>
              <StatTile label={t.label} value={t.value} icon={t.icon} />
            </View>
          ))}
        </View>
      ) : null}

      <View style={{ marginBottom: 16, marginTop: 8 }}>
        <TextField
          placeholder="Search by name, tag, serial or vendor"
          value={search}
          onChangeText={setSearch}
          leading={
            <Search size={18} color={palette.text.tertiary} strokeWidth={1.8} />
          }
        />
      </View>

      {assets.length === 0 && !isLoading ? (
        <EmptyState
          icon={Boxes}
          title="No assets yet"
          message={canManage ? "Add your first tracked asset." : undefined}
        />
      ) : (
        <VStack gap={10}>
          {assets.map((a) => (
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
                  <QrCode
                    size={19}
                    color={palette.cobalt[600]}
                    strokeWidth={2}
                  />
                </View>
                <VStack gap={2} flex={1}>
                  <Text variant="label-lg" tone="primary" numberOfLines={1}>
                    {a.name}
                  </Text>
                  <Text variant="caption" tone="tertiary" numberOfLines={1}>
                    {a.assetTag} · {a.category}
                    {a.assignedToName ? ` · ${a.assignedToName}` : ""}
                  </Text>
                </VStack>
                <VStack gap={4} align="flex-end">
                  <StatusChip
                    label={a.status.replace("_", " ")}
                    tone={STATUS_TONE[a.status]}
                  />
                  {a.lowStock ? (
                    <StatusChip label="Low stock" tone="danger" />
                  ) : null}
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
      <AssetFormModal visible={showAdd} onClose={() => setShowAdd(false)} />
      {detailId ? (
        <AssetDetailModal
          id={detailId}
          canManage={canManage}
          onClose={() => setDetailId(null)}
        />
      ) : null}
    </Screen>
  );
}

function AssetFormModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const save = useSaveAsset();
  const { data: rooms } = useClassrooms({ limit: 200 });
  const { data: teachers } = useTeachers();
  const [form, setForm] = useState({
    name: "",
    category: "IT Equipment",
    vendor: "",
    purchaseValue: "",
    warrantyExpiry: "",
    quantity: "1",
    minStock: "0",
    assignedToType: "none",
    assignedToId: null as string | null,
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  useEffect(() => {
    if (!visible)
      setForm({
        name: "",
        category: "IT Equipment",
        vendor: "",
        purchaseValue: "",
        warrantyExpiry: "",
        quantity: "1",
        minStock: "0",
        assignedToType: "none",
        assignedToId: null,
      });
  }, [visible]);
  const prev = useRef(save.isPending);
  useEffect(() => {
    if (prev.current && !save.isPending && !save.error) onClose();
    prev.current = save.isPending;
  }, [save.isPending, save.error, onClose]);
  const submit = () => {
    if (!form.name) return;
    save.mutate({
      body: {
        name: form.name,
        category: form.category,
        vendor: form.vendor || undefined,
        purchaseValue: form.purchaseValue
          ? Math.round(Number(form.purchaseValue) * 100)
          : undefined,
        warrantyExpiry: form.warrantyExpiry || undefined,
        quantity: Number(form.quantity) || 1,
        minStock: Number(form.minStock) || 0,
        assignedToType: form.assignedToType,
        assignedToId:
          form.assignedToType !== "none" ? form.assignedToId : undefined,
      },
    });
  };
  const assignOpts =
    form.assignedToType === "room"
      ? (rooms?.data || []).map((r) => ({ value: r.id, label: r.name }))
      : (teachers || []).map((t) => ({ value: t.id, label: t.name }));
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
              Add asset
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={palette.text.tertiary} strokeWidth={2} />
            </Pressable>
          </HStack>
          {save.error ? (
            <View style={ov.err}>
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
                value={form.name}
                onChangeText={(v) => set("name", v)}
                placeholder="Dell Laptop"
              />
              <Select
                label="Category"
                value={form.category}
                options={ASSET_CATEGORIES.map((c) => ({ value: c, label: c }))}
                onChange={(v) => set("category", v || "Other")}
              />
              <HStack gap={12}>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="Value (₹)"
                    value={form.purchaseValue}
                    onChangeText={(v) => set("purchaseValue", v)}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="Vendor"
                    value={form.vendor}
                    onChangeText={(v) => set("vendor", v)}
                  />
                </View>
              </HStack>
              <TextField
                label="Warranty expiry"
                value={form.warrantyExpiry}
                onChangeText={(v) => set("warrantyExpiry", v)}
                placeholder="YYYY-MM-DD"
              />
              <HStack gap={12}>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="Quantity"
                    value={form.quantity}
                    onChangeText={(v) => set("quantity", v)}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="Min stock"
                    value={form.minStock}
                    onChangeText={(v) => set("minStock", v)}
                    keyboardType="number-pad"
                  />
                </View>
              </HStack>
              <Select
                label="Assign to"
                value={form.assignedToType}
                options={[
                  { value: "none", label: "Unassigned" },
                  { value: "room", label: "A room" },
                  { value: "staff", label: "A staff member" },
                ]}
                onChange={(v) => {
                  set("assignedToType", v || "none");
                  set("assignedToId", null);
                }}
              />
              {form.assignedToType !== "none" ? (
                <Select
                  label="Assignee"
                  placeholder="Select"
                  value={form.assignedToId}
                  options={assignOpts}
                  onChange={(v) => set("assignedToId", v)}
                />
              ) : null}
            </VStack>
          </ScrollView>
          <Button
            label="Add asset"
            size="lg"
            loading={save.isPending}
            onPress={submit}
            style={{ marginTop: 18 }}
          />
        </View>
      </View>
    </Modal>
  );
}

function AssetDetailModal({
  id,
  canManage,
  onClose,
}: {
  id: string;
  canManage: boolean;
  onClose: () => void;
}) {
  const { data: a } = useAsset(id);
  const maint = useAddMaintenance();
  const [desc, setDesc] = useState("");
  const [cost, setCost] = useState("");
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
              {a?.name || "Asset"}
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
              style={{ maxHeight: 480 }}
              showsVerticalScrollIndicator={false}
            >
              <VStack gap={12}>
                <Text variant="caption" tone="tertiary">
                  {a.assetTag} · {a.category}
                  {a.assignedToName ? ` · ${a.assignedToName}` : ""}
                </Text>
                <HStack gap={8} wrap>
                  <StatusChip
                    label={a.status.replace("_", " ")}
                    tone={STATUS_TONE[a.status]}
                  />
                  {a.purchaseValue ? (
                    <StatusChip label={money(a.purchaseValue)} tone="info" />
                  ) : null}
                  {a.warrantyExpiry ? (
                    <StatusChip
                      label={`Warranty ${a.warrantyExpiry.slice(0, 10)}`}
                      tone="warning"
                    />
                  ) : null}
                </HStack>
                <Card>
                  <Text
                    variant="label-lg"
                    tone="primary"
                    style={{ marginBottom: 8 }}
                  >
                    Maintenance history
                  </Text>
                  {(a.maintenance || []).length === 0 ? (
                    <Text variant="body-sm" tone="tertiary">
                      No maintenance logged.
                    </Text>
                  ) : (
                    <VStack gap={8}>
                      {(a.maintenance || []).map((m) => (
                        <HStack key={m.id} gap={10} align="center">
                          <Wrench
                            size={15}
                            color={palette.text.tertiary}
                            strokeWidth={1.8}
                          />
                          <VStack gap={1} flex={1}>
                            <Text variant="body-sm" tone="primary">
                              {m.type} · {money(m.cost)}
                            </Text>
                            <Text variant="caption" tone="tertiary">
                              {m.description ||
                                new Date(m.date).toLocaleDateString()}
                            </Text>
                          </VStack>
                        </HStack>
                      ))}
                    </VStack>
                  )}
                </Card>
                {canManage ? (
                  <Card>
                    <Text
                      variant="label-lg"
                      tone="primary"
                      style={{ marginBottom: 8 }}
                    >
                      Log maintenance
                    </Text>
                    <VStack gap={10}>
                      <TextField
                        label="Description"
                        value={desc}
                        onChangeText={setDesc}
                        placeholder="Screen replacement"
                      />
                      <TextField
                        label="Cost (₹)"
                        value={cost}
                        onChangeText={setCost}
                        keyboardType="decimal-pad"
                      />
                      <Button
                        label="Add maintenance"
                        loading={maint.isPending}
                        onPress={() =>
                          maint.mutate(
                            {
                              id,
                              body: {
                                type: "repair",
                                description: desc,
                                cost: cost ? Math.round(Number(cost) * 100) : 0,
                                setUnderMaintenance: true,
                              },
                            },
                            {
                              onSuccess: () => {
                                setDesc("");
                                setCost("");
                              },
                            },
                          )
                        }
                      />
                    </VStack>
                  </Card>
                ) : null}
              </VStack>
            </ScrollView>
          )}
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
