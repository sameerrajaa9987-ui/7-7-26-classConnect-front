import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Wallet,
  Plus,
  X,
  TrendingUp,
  TriangleAlert,
  BellRing,
  Receipt,
} from "lucide-react-native";
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
  useRevenue,
  useInvoices,
  useGenerateInvoice,
  useStructures,
  useSendReminders,
} from "@modules/fees/hooks/useFees";
import { useStudents } from "@modules/students/hooks/useStudents";
import { formatMoney, InvoiceStatus } from "@modules/fees/types";

const STATUS_TONE: Record<
  InvoiceStatus,
  "success" | "warning" | "danger" | "neutral" | "info"
> = {
  paid: "success",
  partial: "warning",
  unpaid: "info",
  overdue: "danger",
  cancelled: "neutral",
};

export default function FeesScreen() {
  const navigation = useNavigation<any>();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canManage = hasPermission(PERMISSIONS.FEES_MANAGE);
  const isPortal = useAuthStore(
    (s) => s.user?.role === "parent" || s.user?.role === "student",
  );
  const { width } = useWindowDimensions();
  const isWide = width >= layout.wideBreakpoint;
  const cols = width >= 1100 ? 4 : 2;

  const { data: revenue } = useRevenue();
  const [status, setStatus] = useState<string | null>(null);
  const {
    data: invoices,
    isLoading,
    refetch,
    isRefetching,
  } = useInvoices({ status: status || undefined, limit: 200 });
  const reminders = useSendReminders();
  const [showGen, setShowGen] = useState(false);

  const list = invoices?.data || [];

  return (
    <Screen
      overline="Fees & Accounts"
      title="Fees"
      subtitle={
        isPortal
          ? "Your fee invoices & payments"
          : "Invoices, payments & collection"
      }
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
      right={
        canManage ? (
          <Button
            label="Generate invoice"
            fullWidth={false}
            icon={<Plus size={16} color="#FFFFFF" strokeWidth={2.4} />}
            onPress={() => setShowGen(true)}
          />
        ) : undefined
      }
    >
      {/* Revenue bento (staff only) */}
      {!isPortal && revenue ? (
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
              label: "Collected",
              value: formatMoney(revenue.collected),
              icon: Wallet,
            },
            {
              label: "Pending",
              value: formatMoney(revenue.pending),
              icon: Receipt,
            },
            {
              label: "Overdue",
              value: formatMoney(revenue.overdue),
              icon: TriangleAlert,
            },
            {
              label: "Collection",
              value: `${revenue.collectionPercent}%`,
              icon: TrendingUp,
            },
          ].map((t) => (
            <View key={t.label} style={{ width: `${100 / cols}%`, padding: 6 }}>
              <StatTile label={t.label} value={t.value} icon={t.icon} />
            </View>
          ))}
        </View>
      ) : null}

      {canManage ? (
        <HStack
          justify="space-between"
          align="center"
          style={{ marginBottom: 12, marginTop: 8 }}
        >
          <HStack gap={6} wrap>
            {[null, "unpaid", "partial", "overdue", "paid"].map((s) => (
              <Pressable
                key={s || "all"}
                onPress={() => setStatus(s)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: radius.full,
                  borderWidth: 1,
                  borderColor:
                    status === s ? palette.cobalt[600] : palette.border.default,
                  backgroundColor:
                    status === s ? palette.cobalt[50] : palette.surface.primary,
                }}
              >
                <Text
                  variant="label-sm"
                  style={{
                    color:
                      status === s
                        ? palette.cobalt[700]
                        : palette.text.secondary,
                  }}
                >
                  {s ? s[0].toUpperCase() + s.slice(1) : "All"}
                </Text>
              </Pressable>
            ))}
          </HStack>
          <Button
            label="Send reminders"
            size="sm"
            variant="secondary"
            fullWidth={false}
            loading={reminders.isPending}
            icon={
              <BellRing
                size={14}
                color={palette.text.primary}
                strokeWidth={1.9}
              />
            }
            onPress={() => reminders.mutate()}
          />
        </HStack>
      ) : null}

      {list.length === 0 && !isLoading ? (
        <EmptyState
          icon={Wallet}
          title="No invoices yet"
          message={
            canManage
              ? "Generate an invoice to bill a student."
              : "You have no fee invoices."
          }
        />
      ) : (
        <VStack gap={10}>
          {list.map((inv) => (
            <Card
              key={inv.id}
              onPress={() =>
                navigation.navigate("InvoiceDetail", { id: inv.id })
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
                  <Receipt
                    size={19}
                    color={palette.cobalt[600]}
                    strokeWidth={2}
                  />
                </View>
                <VStack gap={3} flex={1}>
                  <Text variant="label-lg" tone="primary" numberOfLines={1}>
                    {inv.studentName} · {inv.invoiceNo}
                  </Text>
                  <Text variant="caption" tone="tertiary" numberOfLines={1}>
                    {formatMoney(inv.netAmount)} · Due{" "}
                    {formatMoney(inv.dueAmount)}
                    {inv.dueDate ? ` · by ${inv.dueDate.slice(0, 10)}` : ""}
                  </Text>
                </VStack>
                <StatusChip label={inv.status} tone={STATUS_TONE[inv.status]} />
              </HStack>
            </Card>
          ))}
        </VStack>
      )}

      {canManage && !isWide ? (
        <Fab
          onPress={() => setShowGen(true)}
          icon={<Plus size={24} color="#FFFFFF" strokeWidth={2.4} />}
        />
      ) : null}

      <GenerateInvoiceModal
        visible={showGen}
        onClose={() => setShowGen(false)}
      />
    </Screen>
  );
}

function GenerateInvoiceModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const gen = useGenerateInvoice();
  const { data: students } = useStudents({ limit: 200 });
  const { data: structures } = useStructures();
  const [form, setForm] = useState({
    studentId: null as string | null,
    feeStructureId: null as string | null,
    discount: "",
    installmentCount: "1",
    dueDate: "",
    customName: "",
    customAmount: "",
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!visible)
      setForm({
        studentId: null,
        feeStructureId: null,
        discount: "",
        installmentCount: "1",
        dueDate: "",
        customName: "",
        customAmount: "",
      });
  }, [visible]);
  const prev = useRef(gen.isPending);
  useEffect(() => {
    if (prev.current && !gen.isPending && !gen.error) onClose();
    prev.current = gen.isPending;
  }, [gen.isPending, gen.error, onClose]);

  const submit = () => {
    if (!form.studentId) return;
    const body: Record<string, unknown> = {
      studentId: form.studentId,
      feeStructureId: form.feeStructureId || undefined,
      discountAmount: form.discount
        ? Math.round(Number(form.discount) * 100)
        : undefined,
      dueDate: form.dueDate || undefined,
      installmentCount: form.installmentCount
        ? Number(form.installmentCount)
        : undefined,
    };
    if (form.customName && form.customAmount) {
      body.lineItems = [
        {
          name: form.customName,
          amount: Math.round(Number(form.customAmount) * 100),
        },
      ];
    }
    gen.mutate(body);
  };

  const studentOpts = (students?.data || []).map((s) => ({
    value: s.id,
    label: `${s.fullName} · ${s.admissionNo}`,
  }));
  const structOpts = (structures || []).map((s) => ({
    value: s.id,
    label: `${s.name} · ${formatMoney(s.total)}`,
  }));

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
              Generate invoice
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={palette.text.tertiary} strokeWidth={2} />
            </Pressable>
          </HStack>
          {gen.error ? (
            <View style={styles.err}>
              <Text variant="body-sm" tone="danger">
                {apiErrorMessage(gen.error)}
              </Text>
            </View>
          ) : null}
          <ScrollView
            style={{ maxHeight: 440 }}
            showsVerticalScrollIndicator={false}
          >
            <VStack gap={14}>
              <Select
                label="Student"
                placeholder="Select student"
                value={form.studentId}
                options={studentOpts}
                onChange={(v) => set("studentId", v)}
              />
              <Select
                label="Fee structure"
                placeholder="Optional — pick a template"
                value={form.feeStructureId}
                options={structOpts}
                onChange={(v) => set("feeStructureId", v)}
                allowClear
              />
              <Text variant="caption" tone="tertiary">
                Or add a one-off line item:
              </Text>
              <HStack gap={12}>
                <View style={{ flex: 2 }}>
                  <TextField
                    label="Item name"
                    value={form.customName}
                    onChangeText={(v) => set("customName", v)}
                    placeholder="Exam fee"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="Amount (₹)"
                    value={form.customAmount}
                    onChangeText={(v) => set("customAmount", v)}
                    keyboardType="decimal-pad"
                  />
                </View>
              </HStack>
              <HStack gap={12}>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="Discount (₹)"
                    value={form.discount}
                    onChangeText={(v) => set("discount", v)}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="Installments"
                    value={form.installmentCount}
                    onChangeText={(v) => set("installmentCount", v)}
                    keyboardType="number-pad"
                  />
                </View>
              </HStack>
              <TextField
                label="Due date"
                value={form.dueDate}
                onChangeText={(v) => set("dueDate", v)}
                placeholder="YYYY-MM-DD"
              />
            </VStack>
          </ScrollView>
          <Button
            label="Generate invoice"
            size="lg"
            loading={gen.isPending}
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
