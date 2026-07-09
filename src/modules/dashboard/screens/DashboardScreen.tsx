import React from "react";
import { View, useWindowDimensions } from "react-native";
import {
  Users,
  UserRound,
  Sparkles,
  CalendarCheck2,
  Wallet,
  BookOpen,
  ClipboardList,
  Boxes,
  BarChart3,
  MessageSquare,
  Building2,
  ReceiptText,
} from "lucide-react-native";
import { useAuthStore } from "@shared/store/useAuthStore";
import { useDashboardSummary } from "@modules/dashboard/hooks/useDashboard";
import { useSectionNav } from "@navigation/AppNavigator";
import { palette } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  StatTile,
  GradientHero,
  StatusChip,
  Button,
} from "@shared/ui";

/** The full platform roadmap — Phase 1 modules are Live; the rest light up as
 *  later phases ship. Shown to admins/staff so the scope is visible from day 1. */
const MODULES: { icon: typeof Users; label: string; phase: number }[] = [
  { icon: Building2, label: "Institute, Team & Roles", phase: 1 },
  { icon: BookOpen, label: "Courses, Batches & Timetable", phase: 2 },
  { icon: UserRound, label: "Admissions & Student Records", phase: 3 },
  { icon: CalendarCheck2, label: "Attendance & Parent Alerts", phase: 4 },
  { icon: Wallet, label: "Fees, Payments & Receipts", phase: 5 },
  { icon: BookOpen, label: "LMS · Courses · Assignments", phase: 6 },
  { icon: ClipboardList, label: "Exams, Marks & Report Cards", phase: 7 },
  { icon: MessageSquare, label: "Communication & Parent App", phase: 8 },
  { icon: Boxes, label: "Inventory, Assets & HR/Payroll", phase: 9 },
  { icon: BarChart3, label: "AI Analytics, Reports & Exec", phase: 10 },
];

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
  const cols = width >= 1100 ? 4 : 2;
  const user = useAuthStore((s) => s.user);
  const organization = useAuthStore((s) => s.organization);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const go = useSectionNav();
  const { data, isLoading, refetch, isRefetching } = useDashboardSummary();

  const role = user?.role ?? "staff";
  const isPortal = role === "parent" || role === "student";
  const p = data?.people;

  const todayPct = data?.attendance?.todayPercent;
  const fees = data?.fees;
  const money = (paise?: number | null) =>
    paise == null
      ? "—"
      : "₹" +
        (paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 });
  const tiles = [
    { label: "Students", value: String(p?.students ?? 0), icon: UserRound },
    {
      label: "Attendance today",
      value: todayPct != null ? `${todayPct}%` : "—",
      icon: CalendarCheck2,
    },
    { label: "Fees collected", value: money(fees?.collected), icon: Wallet },
    { label: "Pending fees", value: money(fees?.pending), icon: ReceiptText },
  ];
  const tileWidth = `${100 / cols}%` as const;

  return (
    <Screen
      overline={greeting()}
      title={user?.firstName ? `Hello, ${user.firstName}` : "Dashboard"}
      subtitle={organization?.name || "ClassConnect Pro"}
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
    >
      <GradientHero variant="hero">
        <VStack gap={10}>
          <StatusChip label={roleLabel(role)} tone="info" />
          <Text variant="h2" tone="inverse">
            {isPortal
              ? "Welcome to your institute portal"
              : "Your institute, one intelligent platform"}
          </Text>
          <Text variant="body" style={{ color: "rgba(255,255,255,0.88)" }}>
            {isPortal
              ? "Attendance, fees, learning and progress updates will appear here as your institute goes live."
              : "Manage students, teachers, parents, fees, attendance, learning and administration — all connected and automated."}
          </Text>
          {isAdmin() && (
            <HStack gap={10} style={{ marginTop: 8 }} wrap>
              <Button
                label="Invite your team"
                variant="accent"
                fullWidth={false}
                onPress={() => go("Team")}
              />
              <Button
                label="Institute settings"
                variant="secondary"
                fullWidth={false}
                onPress={() => go("Settings")}
              />
            </HStack>
          )}
        </VStack>
      </GradientHero>

      {/* KPI bento — people in the institute (Phase 1). Academic KPIs join later. */}
      {!isPortal && (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginTop: 20,
            marginHorizontal: -6,
          }}
        >
          {tiles.map((t) => (
            <View key={t.label} style={{ width: tileWidth, padding: 6 }}>
              <StatTile label={t.label} value={t.value} icon={t.icon} />
            </View>
          ))}
        </View>
      )}

      {/* AI-insight card — the one place a gradient/glow is allowed (2026 brief). */}
      <GradientHero variant="ai" style={{ marginTop: 16 }}>
        <HStack gap={12} align="center">
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              backgroundColor: "rgba(255,255,255,0.18)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={20} color="#FFFFFF" strokeWidth={2} />
          </View>
          <VStack gap={3} flex={1}>
            <Text variant="label-lg" tone="inverse">
              AI Insights
            </Text>
            <Text variant="body-sm" style={{ color: "rgba(255,255,255,0.86)" }}>
              {isPortal
                ? "Personalised progress summaries will appear here."
                : "Attendance trends, fee forecasts and at-risk student alerts activate as you add academic data."}
            </Text>
          </VStack>
        </HStack>
      </GradientHero>

      {/* Platform roadmap — visible scope of the full build */}
      {!isPortal && (
        <>
          <Text
            variant="h3"
            tone="primary"
            style={{ marginTop: 28, marginBottom: 12 }}
          >
            Platform modules
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginHorizontal: -6,
            }}
          >
            {MODULES.map((m) => {
              const live = m.phase <= 10;
              return (
                <View
                  key={m.label}
                  style={{
                    width: cols >= 4 ? "33.33%" : "100%",
                    padding: 6,
                  }}
                >
                  <Card padded>
                    <HStack gap={12} align="center">
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          backgroundColor: live
                            ? palette.cobalt[50]
                            : palette.ink[50],
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <m.icon
                          size={18}
                          color={live ? palette.cobalt[600] : palette.ink[400]}
                          strokeWidth={1.9}
                        />
                      </View>
                      <VStack gap={4} flex={1}>
                        <Text
                          variant="label-lg"
                          tone="primary"
                          numberOfLines={1}
                        >
                          {m.label}
                        </Text>
                        <StatusChip
                          label={live ? "Live" : `Phase ${m.phase}`}
                          tone={live ? "success" : "neutral"}
                        />
                      </VStack>
                    </HStack>
                  </Card>
                </View>
              );
            })}
          </View>
        </>
      )}
    </Screen>
  );
}

function roleLabel(role: string) {
  switch (role) {
    case "admin":
      return "Administrator";
    case "teacher":
      return "Teacher";
    case "parent":
      return "Parent";
    case "student":
      return "Student";
    default:
      return "Staff";
  }
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
