import React from "react";
import { View, useWindowDimensions } from "react-native";
import {
  Users,
  GraduationCap,
  CalendarCheck2,
  Wallet,
  FileSpreadsheet,
  Boxes,
  Sparkles,
  TriangleAlert,
  TrendingUp,
  FileDown,
  Table,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { palette, radius, gradients, shadows } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  StatTile,
  StatusChip,
} from "@shared/ui";
import {
  useExecutive,
  useInsights,
  useAtRisk,
  useDownloadReport,
} from "@modules/analytics/hooks/useAnalytics";

const money = (p?: number | null) =>
  p == null
    ? "—"
    : "₹" + (p / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 });
export default function ExecutiveDashboardScreen() {
  const { width } = useWindowDimensions();
  const cols = width >= 1100 ? 4 : 2;
  const { data: ex, isLoading, refetch, isRefetching } = useExecutive();
  const { data: ins } = useInsights();
  const { data: atRisk } = useAtRisk();
  const download = useDownloadReport();

  const tiles = ex
    ? [
        { label: "Students", value: String(ex.students), icon: Users },
        {
          label: "Attendance (30d)",
          value:
            ex.attendance.percent != null ? `${ex.attendance.percent}%` : "—",
          icon: CalendarCheck2,
        },
        {
          label: "Fee collection",
          value: `${ex.fees.collectionPercent}%`,
          icon: Wallet,
        },
        {
          label: "Exam average",
          value: ex.exams.avgPercent != null ? `${ex.exams.avgPercent}%` : "—",
          icon: FileSpreadsheet,
        },
        { label: "Teachers", value: String(ex.teachers), icon: GraduationCap },
        { label: "Batches", value: String(ex.batches), icon: Users },
        {
          label: "Asset value",
          value: money(ex.inventory.totalValue),
          icon: Boxes,
        },
        {
          label: "New admissions",
          value: `+${ex.admissionsThisMonth}`,
          icon: TrendingUp,
        },
      ]
    : [];

  const maxRev = Math.max(1, ...(ex?.revenueTrend || []).map((r) => r.value));

  return (
    <Screen
      overline="Executive"
      title="Executive Dashboard"
      subtitle="360° institute overview & AI insights"
      refreshing={isLoading || isRefetching}
      onRefresh={refetch}
    >
      {/* KPI bento */}
      <View
        style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -6 }}
      >
        {tiles.map((t) => (
          <View key={t.label} style={{ width: `${100 / cols}%`, padding: 6 }}>
            <StatTile label={t.label} value={t.value} icon={t.icon} />
          </View>
        ))}
      </View>

      {/* AI Insights panel */}
      <LinearGradient
        colors={[...gradients.ai] as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: radius.xl,
          padding: 18,
          marginTop: 16,
          ...shadows.md,
        }}
      >
        <HStack gap={10} align="center" style={{ marginBottom: 12 }}>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={19} color="#FFFFFF" strokeWidth={2} />
          </View>
          <VStack gap={1} flex={1}>
            <Text variant="label-lg" tone="inverse">
              AI Recommendation Panel
            </Text>
            <Text variant="caption" style={{ color: "rgba(255,255,255,0.8)" }}>
              Real-time insights from your institute&rsquo;s data
            </Text>
          </VStack>
        </HStack>
        <VStack gap={8}>
          {(ins?.insights || []).map((i, idx) => (
            <View
              key={idx}
              style={{
                backgroundColor: "rgba(255,255,255,0.14)",
                borderRadius: radius.md,
                padding: 12,
              }}
            >
              <HStack gap={10} align="center">
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor:
                      i.tone === "danger"
                        ? "#FCA5A5"
                        : i.tone === "warning"
                          ? "#FDE68A"
                          : i.tone === "success"
                            ? "#A7F3D0"
                            : "#BFDBFE",
                  }}
                />
                <Text variant="label" tone="inverse" style={{ width: 44 }}>
                  {i.metric}
                </Text>
                <VStack gap={1} flex={1}>
                  <Text variant="label-sm" tone="inverse">
                    {i.title}
                  </Text>
                  <Text
                    variant="caption"
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  >
                    {i.message}
                  </Text>
                </VStack>
              </HStack>
            </View>
          ))}
          {(ins?.insights || []).length === 0 ? (
            <Text variant="body-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
              Insights appear as data accumulates.
            </Text>
          ) : null}
        </VStack>
      </LinearGradient>

      {/* Revenue trend */}
      {ex && ex.revenueTrend.some((r) => r.value > 0) ? (
        <Card style={{ marginTop: 16 }}>
          <Text variant="h4" tone="primary" style={{ marginBottom: 14 }}>
            Collection trend (6 months)
          </Text>
          <HStack gap={10} align="flex-end" style={{ height: 120 }}>
            {ex.revenueTrend.map((r) => (
              <VStack
                key={r.month}
                gap={6}
                flex={1}
                align="center"
                justify="flex-end"
              >
                <View
                  style={{
                    width: "70%",
                    height: Math.max(4, (r.value / maxRev) * 90),
                    backgroundColor: palette.cobalt[500],
                    borderRadius: 6,
                  }}
                />
                <Text variant="caption" tone="tertiary">
                  {r.month.slice(5)}
                </Text>
              </VStack>
            ))}
          </HStack>
        </Card>
      ) : null}

      {/* At-risk students */}
      <Card style={{ marginTop: 16 }}>
        <HStack gap={10} align="center" style={{ marginBottom: 12 }}>
          <TriangleAlert
            size={18}
            color={palette.danger.text}
            strokeWidth={2}
          />
          <Text variant="h4" tone="primary">
            At-risk students ({atRisk?.length ?? 0})
          </Text>
        </HStack>
        {(atRisk || []).length === 0 ? (
          <Text variant="body-sm" tone="tertiary">
            No students currently flagged. 🎉
          </Text>
        ) : (
          <VStack gap={10}>
            {(atRisk || []).map((r) => (
              <View
                key={r.studentId}
                style={{
                  padding: 12,
                  borderRadius: radius.md,
                  backgroundColor: palette.danger.bg,
                  borderWidth: 1,
                  borderColor: palette.danger.border,
                }}
              >
                <HStack
                  justify="space-between"
                  align="center"
                  style={{ marginBottom: 4 }}
                >
                  <Text variant="label" tone="primary">
                    {r.name}
                  </Text>
                  <Text variant="caption" tone="tertiary">
                    {r.admissionNo}
                    {r.batchName ? ` · ${r.batchName}` : ""}
                  </Text>
                </HStack>
                <HStack gap={6} wrap>
                  {r.reasons.map((reason, i) => (
                    <StatusChip key={i} label={reason} tone="danger" />
                  ))}
                </HStack>
              </View>
            ))}
          </VStack>
        )}
      </Card>

      {/* Report exports */}
      <Card style={{ marginTop: 16 }}>
        <Text variant="h4" tone="primary" style={{ marginBottom: 12 }}>
          Reports & exports
        </Text>
        <VStack gap={12}>
          {[
            { type: "students", label: "Students report" },
            { type: "fees", label: "Fee collection report" },
          ].map((r) => (
            <HStack key={r.type} justify="space-between" align="center">
              <Text variant="body-sm" tone="secondary">
                {r.label}
              </Text>
              <HStack gap={8}>
                <Button
                  label="Excel"
                  size="sm"
                  variant="secondary"
                  fullWidth={false}
                  icon={
                    <Table
                      size={14}
                      color={palette.text.primary}
                      strokeWidth={1.9}
                    />
                  }
                  onPress={() =>
                    download.mutate({ type: r.type, format: "excel" })
                  }
                />
                <Button
                  label="PDF"
                  size="sm"
                  variant="secondary"
                  fullWidth={false}
                  icon={
                    <FileDown
                      size={14}
                      color={palette.text.primary}
                      strokeWidth={1.9}
                    />
                  }
                  onPress={() =>
                    download.mutate({ type: r.type, format: "pdf" })
                  }
                />
              </HStack>
            </HStack>
          ))}
        </VStack>
      </Card>
    </Screen>
  );
}
