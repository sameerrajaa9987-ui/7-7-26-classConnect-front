import React, { useState } from "react";
import { Pressable, ScrollView } from "react-native";
import {
  PlayCircle,
  ClipboardList,
  ListChecks,
  Award,
} from "lucide-react-native";
import { useAuthStore } from "@shared/store/useAuthStore";
import { palette, radius } from "@shared/designSystem";
import { Screen, Text } from "@shared/ui";
import { LessonsTab } from "@modules/lms/components/LessonsTab";
import { AssignmentsTab } from "@modules/lms/components/AssignmentsTab";
import { QuizzesTab } from "@modules/lms/components/QuizzesTab";
import { CertificatesTab } from "@modules/lms/components/CertificatesTab";

const TABS = [
  { key: "lessons", label: "Lessons", icon: PlayCircle },
  { key: "assignments", label: "Assignments", icon: ClipboardList },
  { key: "quizzes", label: "Quizzes", icon: ListChecks },
  { key: "certificates", label: "Certificates", icon: Award },
] as const;

export default function LearningScreen() {
  const isStudent = useAuthStore((s) => s.user?.role === "student");
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("lessons");

  return (
    <Screen
      overline="Learning"
      title={isStudent ? "My Learning" : "Learning (LMS)"}
      subtitle="Video lessons, assignments, quizzes & certificates"
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16 }}
        contentContainerStyle={{ gap: 8 }}
      >
        {TABS.map((t) => {
          const on = tab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: on ? palette.cobalt[600] : palette.border.default,
                backgroundColor: on
                  ? palette.cobalt[50]
                  : palette.surface.primary,
              }}
            >
              <t.icon
                size={16}
                color={on ? palette.cobalt[600] : palette.text.tertiary}
                strokeWidth={2}
              />
              <Text
                variant="label"
                style={{
                  color: on ? palette.cobalt[700] : palette.text.secondary,
                }}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {tab === "lessons" ? (
        <LessonsTab />
      ) : tab === "assignments" ? (
        <AssignmentsTab />
      ) : tab === "quizzes" ? (
        <QuizzesTab />
      ) : (
        <CertificatesTab />
      )}
    </Screen>
  );
}
