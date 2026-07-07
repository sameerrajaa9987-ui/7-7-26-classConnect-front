import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Building2, GraduationCap, Receipt } from "lucide-react-native";
import {
  useSettings,
  useUpdateSettings,
} from "@modules/settings/hooks/useSettings";
import { useAuthStore } from "@shared/store/useAuthStore";
import { apiErrorMessage } from "@api/apiClient";
import { palette, radius } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  TextField,
} from "@shared/ui";

const emptyInstitute = {
  legalName: "",
  addressLine1: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
  email: "",
  website: "",
  principalName: "",
  affiliationNo: "",
};

export default function SettingsScreen() {
  const { data, isLoading, refetch, isRefetching } = useSettings();
  const mut = useUpdateSettings();
  const org = useAuthStore((s) => s.organization);

  const [institute, setInstitute] = useState(emptyInstitute);
  const [academic, setAcademic] = useState({
    currentSession: "",
    passPercentage: "33",
  });
  const [fees, setFees] = useState({
    currency: "INR",
    invoicePrefix: "INV",
    receiptPrefix: "RCPT",
  });

  useEffect(() => {
    if (!data) return;
    setInstitute({
      legalName: data.institute.legalName,
      addressLine1: data.institute.addressLine1,
      city: data.institute.city,
      state: data.institute.state,
      pincode: data.institute.pincode,
      phone: data.institute.phone,
      email: data.institute.email,
      website: data.institute.website,
      principalName: data.institute.principalName,
      affiliationNo: data.institute.affiliationNo,
    });
    setAcademic({
      currentSession: data.academic.currentSession,
      passPercentage: String(data.academic.passPercentage),
    });
    setFees({
      currency: data.fees.currency,
      invoicePrefix: data.fees.invoicePrefix,
      receiptPrefix: data.fees.receiptPrefix,
    });
  }, [data]);

  const save = () =>
    mut.mutate({
      institute,
      academic: {
        currentSession: academic.currentSession,
        passPercentage: Number(academic.passPercentage) || 0,
      },
      fees,
    });

  const setInst = (k: keyof typeof institute) => (v: string) =>
    setInstitute((c) => ({ ...c, [k]: v }));

  return (
    <Screen
      overline="Administration"
      title="Settings"
      subtitle={
        org?.name ? `${org.name} · institute configuration` : "Configuration"
      }
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
      right={
        <Button
          label="Save"
          fullWidth={false}
          loading={mut.isPending}
          onPress={save}
        />
      }
    >
      {mut.isError && (
        <View style={errorBox}>
          <Text variant="body-sm" tone="danger">
            {apiErrorMessage(mut.error)}
          </Text>
        </View>
      )}
      {mut.isSuccess && (
        <View style={okBox}>
          <Text variant="body-sm" tone="success">
            Settings saved.
          </Text>
        </View>
      )}

      {/* Institute profile */}
      <SectionHeader
        icon={Building2}
        title="Institute profile"
        subtitle="Printed on ID cards, fee receipts & report cards"
      />
      <Card style={{ marginBottom: 24 }}>
        <VStack gap={16}>
          <TextField
            label="Legal name"
            value={institute.legalName}
            onChangeText={setInst("legalName")}
            placeholder="Bright Future Academy"
          />
          <TextField
            label="Address"
            value={institute.addressLine1}
            onChangeText={setInst("addressLine1")}
            placeholder="Street, area"
          />
          <HStack gap={12}>
            <View style={{ flex: 1 }}>
              <TextField
                label="City"
                value={institute.city}
                onChangeText={setInst("city")}
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextField
                label="State"
                value={institute.state}
                onChangeText={setInst("state")}
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextField
                label="PIN"
                value={institute.pincode}
                onChangeText={setInst("pincode")}
                keyboardType="number-pad"
              />
            </View>
          </HStack>
          <HStack gap={12}>
            <View style={{ flex: 1 }}>
              <TextField
                label="Phone"
                value={institute.phone}
                onChangeText={setInst("phone")}
                keyboardType="phone-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextField
                label="Email"
                value={institute.email}
                onChangeText={setInst("email")}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </HStack>
          <HStack gap={12}>
            <View style={{ flex: 1 }}>
              <TextField
                label="Principal / Director"
                value={institute.principalName}
                onChangeText={setInst("principalName")}
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextField
                label="Affiliation / Board no."
                value={institute.affiliationNo}
                onChangeText={setInst("affiliationNo")}
                placeholder="CBSE / University reg."
              />
            </View>
          </HStack>
        </VStack>
      </Card>

      {/* Academic session */}
      <SectionHeader
        icon={GraduationCap}
        title="Academic session"
        subtitle="Drives batches, attendance & report cards"
      />
      <Card style={{ marginBottom: 24 }}>
        <HStack gap={12}>
          <View style={{ flex: 1 }}>
            <TextField
              label="Current session"
              value={academic.currentSession}
              onChangeText={(v) =>
                setAcademic((a) => ({ ...a, currentSession: v }))
              }
              placeholder="2025-26"
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label="Pass percentage"
              value={academic.passPercentage}
              onChangeText={(v) =>
                setAcademic((a) => ({ ...a, passPercentage: v }))
              }
              keyboardType="number-pad"
            />
          </View>
        </HStack>
      </Card>

      {/* Fees & receipts */}
      <SectionHeader
        icon={Receipt}
        title="Fees & receipts"
        subtitle="Currency and document numbering"
      />
      <Card style={{ marginBottom: 24 }}>
        <HStack gap={12}>
          <View style={{ flex: 1 }}>
            <TextField
              label="Currency"
              value={fees.currency}
              onChangeText={(v) => setFees((f) => ({ ...f, currency: v }))}
              autoCapitalize="characters"
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label="Invoice prefix"
              value={fees.invoicePrefix}
              onChangeText={(v) => setFees((f) => ({ ...f, invoicePrefix: v }))}
              autoCapitalize="characters"
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label="Receipt prefix"
              value={fees.receiptPrefix}
              onChangeText={(v) => setFees((f) => ({ ...f, receiptPrefix: v }))}
              autoCapitalize="characters"
            />
          </View>
        </HStack>
      </Card>

      <Button
        label="Save settings"
        size="lg"
        loading={mut.isPending}
        onPress={save}
      />
    </Screen>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: any;
  title: string;
  subtitle: string;
}) {
  return (
    <HStack gap={12} align="center" style={{ marginBottom: 12 }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: palette.cobalt[50],
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={18} color={palette.cobalt[600]} strokeWidth={2} />
      </View>
      <VStack gap={1} flex={1}>
        <Text variant="h3" tone="primary">
          {title}
        </Text>
        <Text variant="caption" tone="tertiary">
          {subtitle}
        </Text>
      </VStack>
    </HStack>
  );
}

const errorBox = {
  padding: 14,
  borderRadius: radius.md,
  backgroundColor: palette.danger.bg,
  borderWidth: 1,
  borderColor: palette.danger.border,
  marginBottom: 16,
} as const;
const okBox = {
  padding: 14,
  borderRadius: radius.md,
  backgroundColor: palette.success.bg,
  borderWidth: 1,
  borderColor: palette.success.border,
  marginBottom: 16,
} as const;
