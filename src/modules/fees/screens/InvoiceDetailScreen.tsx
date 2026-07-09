import React, { useEffect, useRef, useState } from "react";
import { View, Pressable, Modal } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ArrowLeft,
  X,
  IndianRupee,
  CheckCircle2,
  Receipt,
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
} from "@shared/ui";
import { apiErrorMessage } from "@api/apiClient";
import { useInvoice, useRecordPayment } from "@modules/fees/hooks/useFees";
import { formatMoney } from "@modules/fees/types";

export default function InvoiceDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const id: string = route.params?.id;
  const canPay =
    useAuthStore((s) => s.hasPermission)(PERMISSIONS.PAYMENTS_MANAGE) ||
    useAuthStore.getState().hasPermission(PERMISSIONS.FEES_MANAGE);
  const { data: inv, isLoading, refetch, isRefetching } = useInvoice(id);
  const [showPay, setShowPay] = useState(false);

  return (
    <Screen
      overline="Fees & Accounts"
      title={inv ? inv.invoiceNo : "Invoice"}
      subtitle={inv ? `${inv.studentName} · ${inv.batchName || ""}` : ""}
      refreshing={isLoading || isRefetching}
      onRefresh={refetch}
      right={
        canPay && inv && inv.dueAmount > 0 && inv.status !== "cancelled" ? (
          <Button
            label="Record payment"
            fullWidth={false}
            icon={<IndianRupee size={15} color="#FFFFFF" strokeWidth={2.2} />}
            onPress={() => setShowPay(true)}
          />
        ) : undefined
      }
    >
      <Pressable
        onPress={() => navigation.goBack()}
        hitSlop={6}
        style={{ marginBottom: 16 }}
      >
        <HStack gap={6} align="center">
          <ArrowLeft size={18} color={palette.text.link} strokeWidth={2} />
          <Text variant="label" tone="link">
            Back
          </Text>
        </HStack>
      </Pressable>

      {!inv ? null : (
        <VStack gap={16}>
          {/* Summary */}
          <Card>
            <HStack justify="space-between" align="flex-start">
              <VStack gap={4}>
                <Text variant="h2" tone="primary">
                  {formatMoney(inv.netAmount)}
                </Text>
                <Text variant="body-sm" tone="tertiary">
                  Paid {formatMoney(inv.paidAmount)} · Due{" "}
                  {formatMoney(inv.dueAmount)}
                </Text>
                {inv.dueDate ? (
                  <Text variant="caption" tone="tertiary">
                    Due by {inv.dueDate.slice(0, 10)}
                  </Text>
                ) : null}
              </VStack>
              <StatusChip
                label={inv.status}
                tone={
                  inv.status === "paid"
                    ? "success"
                    : inv.status === "overdue"
                      ? "danger"
                      : inv.status === "partial"
                        ? "warning"
                        : "info"
                }
              />
            </HStack>
          </Card>

          {/* Line items */}
          <Card>
            <Text variant="h4" tone="primary" style={{ marginBottom: 12 }}>
              Fee breakdown
            </Text>
            <VStack gap={8}>
              {inv.lineItems.map((l, i) => (
                <HStack key={i} justify="space-between">
                  <Text variant="body-sm" tone="secondary">
                    {l.name}
                  </Text>
                  <Text variant="body-sm" tone="primary">
                    {formatMoney(l.amount)}
                  </Text>
                </HStack>
              ))}
              {inv.discountAmount > 0 ? (
                <HStack justify="space-between">
                  <Text variant="body-sm" tone="success">
                    Discount
                    {inv.discountReason ? ` (${inv.discountReason})` : ""}
                  </Text>
                  <Text variant="body-sm" tone="success">
                    − {formatMoney(inv.discountAmount)}
                  </Text>
                </HStack>
              ) : null}
              <View
                style={{
                  height: 1,
                  backgroundColor: palette.border.default,
                  marginVertical: 4,
                }}
              />
              <HStack justify="space-between">
                <Text variant="label-lg" tone="primary">
                  Net payable
                </Text>
                <Text variant="label-lg" tone="primary">
                  {formatMoney(inv.netAmount)}
                </Text>
              </HStack>
            </VStack>
          </Card>

          {/* Installments */}
          {inv.hasInstallments ? (
            <Card>
              <Text variant="h4" tone="primary" style={{ marginBottom: 12 }}>
                Installments
              </Text>
              <VStack gap={8}>
                {inv.installments.map((ins) => (
                  <HStack key={ins.no} align="center" gap={12}>
                    <View
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        backgroundColor: palette.cobalt[50],
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text variant="label-sm" tone="accent">
                        {ins.no}
                      </Text>
                    </View>
                    <VStack gap={1} flex={1}>
                      <Text variant="body-sm" tone="primary">
                        {formatMoney(ins.amount)}
                      </Text>
                      {ins.dueDate ? (
                        <Text variant="caption" tone="tertiary">
                          Due {ins.dueDate.slice(0, 10)}
                        </Text>
                      ) : null}
                    </VStack>
                    <StatusChip
                      label={ins.status}
                      tone={
                        ins.status === "paid"
                          ? "success"
                          : ins.status === "partial"
                            ? "warning"
                            : "neutral"
                      }
                    />
                  </HStack>
                ))}
              </VStack>
            </Card>
          ) : null}

          {/* Receipts */}
          <Card>
            <Text variant="h4" tone="primary" style={{ marginBottom: 12 }}>
              Receipts
            </Text>
            {(inv.payments || []).length === 0 ? (
              <Text variant="body-sm" tone="tertiary">
                No payments yet.
              </Text>
            ) : (
              <VStack gap={10}>
                {(inv.payments || []).map((p) => (
                  <HStack key={p.id} align="center" gap={12}>
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: radius.md,
                        backgroundColor: palette.success.bg,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Receipt
                        size={17}
                        color={palette.success.text}
                        strokeWidth={2}
                      />
                    </View>
                    <VStack gap={1} flex={1}>
                      <Text variant="label" tone="primary">
                        {formatMoney(p.amount)} · {p.method.toUpperCase()}
                      </Text>
                      <Text variant="caption" tone="tertiary">
                        {p.receiptNo} ·{" "}
                        {new Date(p.paidAt).toLocaleDateString()}
                        {p.collectedByName ? ` · ${p.collectedByName}` : ""}
                      </Text>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            )}
          </Card>
        </VStack>
      )}

      {inv ? (
        <RecordPaymentModal
          visible={showPay}
          onClose={() => setShowPay(false)}
          invoiceId={inv.id}
          dueAmount={inv.dueAmount}
        />
      ) : null}
    </Screen>
  );
}

function RecordPaymentModal({
  visible,
  onClose,
  invoiceId,
  dueAmount,
}: {
  visible: boolean;
  onClose: () => void;
  invoiceId: string;
  dueAmount: number;
}) {
  const pay = useRecordPayment();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<string | null>("cash");
  const [reference, setReference] = useState("");

  useEffect(() => {
    if (visible) {
      setAmount((dueAmount / 100).toString());
      setMethod("cash");
      setReference("");
    }
  }, [visible, dueAmount]);
  const prev = useRef(pay.isPending);
  useEffect(() => {
    if (prev.current && !pay.isPending && !pay.error) onClose();
    prev.current = pay.isPending;
  }, [pay.isPending, pay.error, onClose]);

  const submit = () => {
    const paise = Math.round(Number(amount) * 100);
    if (!paise || paise < 1) return;
    pay.mutate({
      invoiceId,
      body: {
        amount: paise,
        method: method || "cash",
        reference: reference || undefined,
      },
    });
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
              Record payment
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={palette.text.tertiary} strokeWidth={2} />
            </Pressable>
          </HStack>
          {pay.error ? (
            <View style={styles.err}>
              <Text variant="body-sm" tone="danger">
                {apiErrorMessage(pay.error)}
              </Text>
            </View>
          ) : null}
          <VStack gap={14}>
            <Text variant="body-sm" tone="tertiary">
              Due: {formatMoney(dueAmount)}
            </Text>
            <TextField
              label="Amount (₹)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
            <Select
              label="Method"
              value={method}
              options={[
                { value: "cash", label: "Cash" },
                { value: "upi", label: "UPI" },
                { value: "card", label: "Card" },
                { value: "netbanking", label: "Net Banking" },
                { value: "cheque", label: "Cheque" },
                { value: "wallet", label: "Wallet" },
              ]}
              onChange={setMethod}
            />
            <TextField
              label="Reference (optional)"
              value={reference}
              onChangeText={setReference}
              placeholder="Txn / cheque no."
            />
          </VStack>
          <Button
            label="Record payment"
            size="lg"
            loading={pay.isPending}
            onPress={submit}
            icon={<CheckCircle2 size={17} color="#FFFFFF" strokeWidth={2} />}
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
    maxWidth: 440,
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
  },
};
