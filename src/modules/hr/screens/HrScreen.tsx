import React, { useEffect, useRef, useState } from "react";
import { View, Modal, Pressable, ScrollView } from "react-native";
import {
  Wallet,
  CalendarClock,
  Plus,
  X,
  Check,
  IndianRupee,
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
} from "@shared/ui";
import { apiErrorMessage } from "@api/apiClient";
import {
  usePayroll,
  usePayrollSummary,
  useUpsertPayroll,
  useMarkPaid,
  useMyPayslips,
  useLeave,
  useApplyLeave,
  useReviewLeave,
} from "@modules/hr/hooks/useHr";
import { useTeachers } from "@modules/academics/hooks/useAcademics";

const money = (paise?: number) =>
  paise == null
    ? "—"
    : "₹" + (paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 });
const thisMonth = () => new Date().toISOString().slice(0, 7);

export default function HrScreen() {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canPayroll =
    hasPermission(PERMISSIONS.PAYROLL_MANAGE) ||
    hasPermission(PERMISSIONS.HR_MANAGE);
  const [tab, setTab] = useState<"payroll" | "leave">(
    canPayroll ? "payroll" : "leave",
  );

  return (
    <Screen
      overline="HR & Payroll"
      title="HR & Payroll"
      subtitle="Payroll runs & leave management"
    >
      <HStack gap={8} style={{ marginBottom: 16 }}>
        {canPayroll ? (
          <Tab
            icon={Wallet}
            label="Payroll"
            active={tab === "payroll"}
            onPress={() => setTab("payroll")}
          />
        ) : null}
        <Tab
          icon={CalendarClock}
          label="Leave"
          active={tab === "leave"}
          onPress={() => setTab("leave")}
        />
      </HStack>
      {tab === "payroll" && canPayroll ? <PayrollTab /> : <LeaveTab />}
    </Screen>
  );
}

function Tab({ icon: Icon, label, active, onPress }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: active ? palette.cobalt[600] : palette.border.default,
        backgroundColor: active ? palette.cobalt[50] : palette.surface.primary,
      }}
    >
      <Icon
        size={16}
        color={active ? palette.cobalt[600] : palette.text.tertiary}
        strokeWidth={2}
      />
      <Text
        variant="label"
        style={{ color: active ? palette.cobalt[700] : palette.text.secondary }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function PayrollTab() {
  const [month, setMonth] = useState(thisMonth());
  const { data: rows } = usePayroll(month);
  const { data: summary } = usePayrollSummary(month);
  const markPaid = useMarkPaid();
  const [showGen, setShowGen] = useState(false);

  return (
    <VStack gap={16}>
      <Card>
        <HStack gap={12} align="flex-end">
          <View style={{ flex: 1 }}>
            <TextField
              label="Month"
              value={month}
              onChangeText={setMonth}
              placeholder="YYYY-MM"
            />
          </View>
          <Button
            label="Generate payslip"
            fullWidth={false}
            icon={<Plus size={16} color="#FFFFFF" strokeWidth={2.4} />}
            onPress={() => setShowGen(true)}
          />
        </HStack>
      </Card>
      {summary ? (
        <HStack gap={10} wrap>
          <StatusChip
            label={`Payroll ${money(summary.totalPayroll)}`}
            tone="info"
          />
          <StatusChip label={`Paid ${money(summary.paid)}`} tone="success" />
          <StatusChip
            label={`Pending ${money(summary.pending)}`}
            tone="warning"
          />
        </HStack>
      ) : null}
      {(rows || []).length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No payslips"
          message={`Generate payslips for ${month}.`}
        />
      ) : (
        <VStack gap={10}>
          {(rows || []).map((p) => (
            <Card key={p.id}>
              <HStack align="center" gap={12}>
                <VStack gap={2} flex={1}>
                  <Text variant="label-lg" tone="primary">
                    {p.userName}
                  </Text>
                  <Text variant="caption" tone="tertiary">
                    {p.roleLabel} · Net {money(p.netPay)}
                  </Text>
                </VStack>
                {p.status === "paid" ? (
                  <StatusChip label="Paid" tone="success" />
                ) : (
                  <Button
                    label="Mark paid"
                    size="sm"
                    variant="secondary"
                    fullWidth={false}
                    loading={markPaid.isPending}
                    icon={
                      <Check
                        size={14}
                        color={palette.text.primary}
                        strokeWidth={2}
                      />
                    }
                    onPress={() => markPaid.mutate(p.id)}
                  />
                )}
              </HStack>
            </Card>
          ))}
        </VStack>
      )}
      <GeneratePayrollModal
        visible={showGen}
        month={month}
        onClose={() => setShowGen(false)}
      />
    </VStack>
  );
}

function GeneratePayrollModal({
  visible,
  month,
  onClose,
}: {
  visible: boolean;
  month: string;
  onClose: () => void;
}) {
  const gen = useUpsertPayroll();
  const { data: teachers } = useTeachers();
  const [form, setForm] = useState({
    userId: null as string | null,
    basic: "",
    allowances: "",
    deductions: "",
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  useEffect(() => {
    if (!visible)
      setForm({ userId: null, basic: "", allowances: "", deductions: "" });
  }, [visible]);
  const prev = useRef(gen.isPending);
  useEffect(() => {
    if (prev.current && !gen.isPending && !gen.error) onClose();
    prev.current = gen.isPending;
  }, [gen.isPending, gen.error, onClose]);
  const submit = () => {
    if (!form.userId || !form.basic) return;
    gen.mutate({
      userId: form.userId,
      month,
      basic: Math.round(Number(form.basic) * 100),
      allowances: form.allowances
        ? Math.round(Number(form.allowances) * 100)
        : 0,
      deductions: form.deductions
        ? Math.round(Number(form.deductions) * 100)
        : 0,
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
              Payslip · {month}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={palette.text.tertiary} strokeWidth={2} />
            </Pressable>
          </HStack>
          {gen.error ? (
            <View style={ov.err}>
              <Text variant="body-sm" tone="danger">
                {apiErrorMessage(gen.error)}
              </Text>
            </View>
          ) : null}
          <VStack gap={14}>
            <Select
              label="Staff"
              placeholder="Select staff"
              value={form.userId}
              options={(teachers || []).map((t) => ({
                value: t.id,
                label: `${t.name} · ${t.roleLabel || t.role}`,
              }))}
              onChange={(v) => set("userId", v)}
            />
            <TextField
              label="Basic (₹)"
              value={form.basic}
              onChangeText={(v) => set("basic", v)}
              keyboardType="decimal-pad"
            />
            <HStack gap={12}>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Allowances (₹)"
                  value={form.allowances}
                  onChangeText={(v) => set("allowances", v)}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Deductions (₹)"
                  value={form.deductions}
                  onChangeText={(v) => set("deductions", v)}
                  keyboardType="decimal-pad"
                />
              </View>
            </HStack>
          </VStack>
          <Button
            label="Save payslip"
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

function LeaveTab() {
  const canReview = useAuthStore((s) => s.hasPermission)(PERMISSIONS.HR_MANAGE);
  const { data: mine } = useLeave({ mine: true });
  const { data: all } = useLeave(canReview ? {} : undefined);
  const apply = useApplyLeave();
  const review = useReviewLeave();
  const [form, setForm] = useState({
    type: "casual",
    fromDate: "",
    toDate: "",
    reason: "",
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const submit = () => {
    if (!form.fromDate || !form.toDate) return;
    apply.mutate(
      { ...form, reason: form.reason || undefined },
      {
        onSuccess: () =>
          setForm({ type: "casual", fromDate: "", toDate: "", reason: "" }),
      },
    );
  };
  const pending = (all || []).filter((l) => l.status === "pending");

  return (
    <VStack gap={16}>
      <Card>
        <Text variant="h4" tone="primary" style={{ marginBottom: 12 }}>
          Apply for leave
        </Text>
        {apply.error ? (
          <View style={ov.err}>
            <Text variant="body-sm" tone="danger">
              {apiErrorMessage(apply.error)}
            </Text>
          </View>
        ) : null}
        <VStack gap={12}>
          <Select
            label="Type"
            value={form.type}
            options={[
              { value: "casual", label: "Casual" },
              { value: "sick", label: "Sick" },
              { value: "earned", label: "Earned" },
              { value: "unpaid", label: "Unpaid" },
            ]}
            onChange={(v) => set("type", v || "casual")}
          />
          <HStack gap={12}>
            <View style={{ flex: 1 }}>
              <TextField
                label="From"
                value={form.fromDate}
                onChangeText={(v) => set("fromDate", v)}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextField
                label="To"
                value={form.toDate}
                onChangeText={(v) => set("toDate", v)}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </HStack>
          <TextField
            label="Reason"
            value={form.reason}
            onChangeText={(v) => set("reason", v)}
          />
          <Button label="Apply" loading={apply.isPending} onPress={submit} />
        </VStack>
      </Card>

      {canReview && pending.length ? (
        <Card>
          <Text variant="h4" tone="primary" style={{ marginBottom: 12 }}>
            Pending requests
          </Text>
          <VStack gap={12}>
            {pending.map((l) => (
              <View
                key={l.id}
                style={{
                  paddingBottom: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: palette.border.subtle,
                }}
              >
                <HStack
                  justify="space-between"
                  align="center"
                  style={{ marginBottom: 8 }}
                >
                  <VStack gap={1}>
                    <Text variant="label" tone="primary">
                      {l.userName}
                    </Text>
                    <Text variant="caption" tone="tertiary">
                      {l.type} · {l.days}d · {l.fromDate.slice(0, 10)}→
                      {l.toDate.slice(0, 10)}
                    </Text>
                  </VStack>
                  <StatusChip label="pending" tone="warning" />
                </HStack>
                <HStack gap={8}>
                  <Button
                    label="Approve"
                    size="sm"
                    fullWidth={false}
                    onPress={() =>
                      review.mutate({ id: l.id, body: { decision: "approve" } })
                    }
                  />
                  <Button
                    label="Reject"
                    size="sm"
                    variant="secondary"
                    fullWidth={false}
                    onPress={() =>
                      review.mutate({ id: l.id, body: { decision: "reject" } })
                    }
                  />
                </HStack>
              </View>
            ))}
          </VStack>
        </Card>
      ) : null}

      <Card>
        <Text variant="h4" tone="primary" style={{ marginBottom: 12 }}>
          My leave
        </Text>
        {(mine || []).length === 0 ? (
          <Text variant="body-sm" tone="tertiary">
            No leave requests yet.
          </Text>
        ) : (
          <VStack gap={10}>
            {(mine || []).map((l) => (
              <HStack key={l.id} align="center" gap={12}>
                <VStack gap={1} flex={1}>
                  <Text variant="body-sm" tone="primary">
                    {l.type} · {l.days} day{l.days > 1 ? "s" : ""}
                  </Text>
                  <Text variant="caption" tone="tertiary">
                    {l.fromDate.slice(0, 10)} → {l.toDate.slice(0, 10)}
                  </Text>
                </VStack>
                <StatusChip
                  label={l.status}
                  tone={
                    l.status === "approved"
                      ? "success"
                      : l.status === "rejected"
                        ? "danger"
                        : "warning"
                  }
                />
              </HStack>
            ))}
          </VStack>
        )}
      </Card>
    </VStack>
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
    maxWidth: 460,
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
