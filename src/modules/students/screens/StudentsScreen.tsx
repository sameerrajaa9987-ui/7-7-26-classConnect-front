import React, { useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { GraduationCap, Plus, Search, Phone } from "lucide-react-native";
import { useAuthStore } from "@shared/store/useAuthStore";
import { PERMISSIONS } from "@shared/permissions";
import { palette, layout } from "@shared/designSystem";
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
  Avatar,
  Fab,
} from "@shared/ui";
import { useStudents } from "@modules/students/hooks/useStudents";
import { StudentFormModal } from "@modules/students/components/StudentFormModal";

const STATUS_TONE: Record<
  string,
  "success" | "warning" | "neutral" | "danger"
> = {
  active: "success",
  inactive: "neutral",
  alumni: "info" as any,
  dropped: "danger",
};

export default function StudentsScreen() {
  const navigation = useNavigation<any>();
  const canWrite = useAuthStore((s) => s.hasPermission)(
    PERMISSIONS.STUDENTS_MANAGE,
  );
  const { width } = useWindowDimensions();
  const isWide = width >= layout.wideBreakpoint;
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading, refetch, isRefetching } = useStudents({
    limit: 200,
    search: search || undefined,
  });

  const students = data?.data || [];

  return (
    <Screen
      overline="Students"
      title="Students"
      subtitle="Admissions, profiles & the complete student lifecycle"
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
      right={
        canWrite ? (
          <Button
            label="Admit student"
            fullWidth={false}
            icon={<Plus size={16} color="#FFFFFF" strokeWidth={2.4} />}
            onPress={() => setShowForm(true)}
          />
        ) : undefined
      }
    >
      <View style={{ marginBottom: 16 }}>
        <TextField
          placeholder="Search by name, admission no., roll no. or phone"
          value={search}
          onChangeText={setSearch}
          leading={
            <Search size={18} color={palette.text.tertiary} strokeWidth={1.8} />
          }
        />
      </View>

      {students.length === 0 && !isLoading ? (
        <EmptyState
          icon={GraduationCap}
          title="No students yet"
          message={
            canWrite ? "Admit your first student to get started." : undefined
          }
        />
      ) : (
        <VStack gap={10}>
          {students.map((s) => (
            <Card
              key={s.id}
              onPress={() => navigation.navigate("StudentDetail", { id: s.id })}
            >
              <HStack align="center" gap={12}>
                <Avatar name={s.fullName} size={44} />
                <VStack gap={3} flex={1}>
                  <Text variant="label-lg" tone="primary" numberOfLines={1}>
                    {s.fullName}
                  </Text>
                  <Text variant="body-sm" tone="tertiary" numberOfLines={1}>
                    {s.admissionNo}
                    {s.rollNo ? ` · Roll ${s.rollNo}` : ""}
                    {s.batchName ? ` · ${s.batchName}` : ""}
                  </Text>
                  {s.phone ? (
                    <HStack gap={4} align="center">
                      <Phone
                        size={12}
                        color={palette.text.tertiary}
                        strokeWidth={1.8}
                      />
                      <Text variant="caption" tone="tertiary">
                        {s.phone}
                      </Text>
                    </HStack>
                  ) : null}
                </VStack>
                <StatusChip label={s.status} tone={STATUS_TONE[s.status]} />
              </HStack>
            </Card>
          ))}
        </VStack>
      )}

      {canWrite && !isWide ? (
        <Fab
          onPress={() => setShowForm(true)}
          icon={<Plus size={24} color="#FFFFFF" strokeWidth={2.4} />}
        />
      ) : null}

      <StudentFormModal visible={showForm} onClose={() => setShowForm(false)} />
    </Screen>
  );
}
