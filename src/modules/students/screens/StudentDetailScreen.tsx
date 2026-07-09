import React, { useState } from "react";
import { View, Pressable, Modal } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import QRCode from "react-native-qrcode-svg";
import {
  ArrowLeft,
  Pencil,
  KeyRound,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Cake,
  Droplet,
  X,
  CheckCircle2,
} from "lucide-react-native";
import { useAuthStore } from "@shared/store/useAuthStore";
import { PERMISSIONS } from "@shared/permissions";
import { palette, radius, shadows, gradients } from "@shared/designSystem";
import { LinearGradient } from "expo-linear-gradient";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  StatusChip,
  Avatar,
} from "@shared/ui";
import {
  useStudent,
  useCreateStudentLogin,
} from "@modules/students/hooks/useStudents";
import { StudentFormModal } from "@modules/students/components/StudentFormModal";
import { useStudentAttendance } from "@modules/attendance/hooks/useAttendance";
import { CreatedLogin } from "@modules/students/types";

export default function StudentDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const id: string = route.params?.id;
  const canManage = useAuthStore((s) => s.hasPermission)(
    PERMISSIONS.STUDENTS_MANAGE,
  );
  const { data: s, isLoading, refetch, isRefetching } = useStudent(id);
  const { data: att } = useStudentAttendance(id);
  const loginMut = useCreateStudentLogin();
  const [creds, setCreds] = useState<CreatedLogin | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  const makeLogin = (type: "student" | "parent", guardianIndex?: number) =>
    loginMut.mutate(
      { id, type, guardianIndex },
      { onSuccess: (data) => setCreds(data) },
    );

  return (
    <Screen
      overline="Students"
      title={s?.fullName || "Student"}
      subtitle={s ? `${s.admissionNo} · ${s.batchName || "Unassigned"}` : ""}
      refreshing={isRefetching || isLoading}
      onRefresh={refetch}
      right={
        canManage && s ? (
          <Button
            label="Edit"
            variant="secondary"
            fullWidth={false}
            icon={
              <Pencil
                size={15}
                color={palette.text.primary}
                strokeWidth={1.9}
              />
            }
            onPress={() => setShowEdit(true)}
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
            All students
          </Text>
        </HStack>
      </Pressable>

      {!s ? null : (
        <VStack gap={16}>
          {/* Digital ID card */}
          <LinearGradient
            colors={[...gradients.hero] as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.idCard}
          >
            <HStack gap={16} align="center">
              <Avatar name={s.fullName} size={64} />
              <VStack gap={3} flex={1}>
                <Text
                  variant="caption"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  SMART STUDENT ID
                </Text>
                <Text variant="h3" tone="inverse" numberOfLines={1}>
                  {s.fullName}
                </Text>
                <Text
                  variant="body-sm"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  {s.studentId} · {s.courseName || "—"}
                </Text>
                <Text
                  variant="caption"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  {s.batchName || "Unassigned"} · {s.session || ""}
                </Text>
              </VStack>
              <View style={styles.qrBox}>
                <QRCode
                  value={s.qrValue}
                  size={76}
                  backgroundColor="#FFFFFF"
                  color="#0E121A"
                />
              </View>
            </HStack>
          </LinearGradient>

          {/* Attendance overview */}
          {att && att.summary.total > 0 ? (
            <Card>
              <HStack align="center" justify="space-between">
                <VStack gap={2}>
                  <Text variant="h4" tone="primary">
                    Attendance
                  </Text>
                  <Text variant="body-sm" tone="tertiary">
                    {att.summary.present + att.summary.late}/{att.summary.total}{" "}
                    days present
                  </Text>
                </VStack>
                <HStack gap={16} align="center">
                  <HStack gap={8} wrap>
                    <StatusChip
                      label={`P ${att.summary.present}`}
                      tone="success"
                    />
                    <StatusChip
                      label={`A ${att.summary.absent}`}
                      tone="danger"
                    />
                    <StatusChip
                      label={`L ${att.summary.late}`}
                      tone="warning"
                    />
                  </HStack>
                  <View style={{ alignItems: "center" }}>
                    <Text
                      variant="h2"
                      style={{
                        color:
                          att.summary.percent >= 75
                            ? palette.success.text
                            : palette.warning.text,
                      }}
                    >
                      {att.summary.percent}%
                    </Text>
                  </View>
                </HStack>
              </HStack>
            </Card>
          ) : null}

          {/* Personal details */}
          <Card>
            <Text variant="h4" tone="primary" style={{ marginBottom: 12 }}>
              Personal details
            </Text>
            <VStack gap={10}>
              <Detail
                icon={Cake}
                label="Date of birth"
                value={s.dateOfBirth ? s.dateOfBirth.slice(0, 10) : "—"}
              />
              <Detail
                icon={Droplet}
                label="Blood group"
                value={s.bloodGroup || "—"}
              />
              <Detail icon={Phone} label="Phone" value={s.phone || "—"} />
              <Detail icon={Mail} label="Email" value={s.email || "—"} />
              <Detail
                icon={MapPin}
                label="Address"
                value={[s.address, s.city].filter(Boolean).join(", ") || "—"}
              />
            </VStack>
          </Card>

          {/* Portal access */}
          <Card>
            <HStack
              align="center"
              justify="space-between"
              style={{ marginBottom: 12 }}
            >
              <Text variant="h4" tone="primary">
                Portal access
              </Text>
              <StatusChip
                label={s.hasLogin ? "Student login active" : "No student login"}
                tone={s.hasLogin ? "success" : "neutral"}
              />
            </HStack>
            {canManage && !s.hasLogin ? (
              <Button
                label="Create student login"
                variant="secondary"
                icon={
                  <KeyRound
                    size={16}
                    color={palette.text.primary}
                    strokeWidth={1.9}
                  />
                }
                loading={loginMut.isPending}
                onPress={() => makeLogin("student")}
                style={{ marginBottom: 8 }}
              />
            ) : null}
            <Text variant="caption" tone="tertiary">
              Portal accounts are privacy-scoped — parents & students only ever
              see this student&rsquo;s data.
            </Text>
          </Card>

          {/* Guardians */}
          <Card>
            <Text variant="h4" tone="primary" style={{ marginBottom: 12 }}>
              Guardians
            </Text>
            {s.guardians.length === 0 ? (
              <Text variant="body-sm" tone="tertiary">
                No guardians on record.
              </Text>
            ) : (
              <VStack gap={12}>
                {s.guardians.map((g, i) => (
                  <HStack key={i} align="center" gap={12}>
                    <View style={styles.gIcon}>
                      <UserPlus
                        size={17}
                        color={palette.cobalt[600]}
                        strokeWidth={1.9}
                      />
                    </View>
                    <VStack gap={2} flex={1}>
                      <Text variant="label-lg" tone="primary">
                        {g.name || g.relation || "Guardian"}
                      </Text>
                      <Text variant="caption" tone="tertiary">
                        {[g.relation, g.phone, g.email]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </Text>
                    </VStack>
                    {g.hasLogin ? (
                      <StatusChip label="Login active" tone="success" />
                    ) : canManage ? (
                      <Button
                        label="Create login"
                        size="sm"
                        variant="secondary"
                        fullWidth={false}
                        loading={loginMut.isPending}
                        onPress={() => makeLogin("parent", i)}
                      />
                    ) : null}
                  </HStack>
                ))}
              </VStack>
            )}
          </Card>
        </VStack>
      )}

      {/* Credentials reveal modal */}
      <Modal
        visible={!!creds}
        transparent
        animationType="fade"
        onRequestClose={() => setCreds(null)}
      >
        <View style={styles.backdrop}>
          <View style={styles.credSheet}>
            <HStack
              align="center"
              justify="space-between"
              style={{ marginBottom: 12 }}
            >
              <HStack gap={8} align="center">
                <CheckCircle2
                  size={20}
                  color={palette.success.text}
                  strokeWidth={2}
                />
                <Text variant="h3" tone="primary">
                  Login created
                </Text>
              </HStack>
              <Pressable onPress={() => setCreds(null)} hitSlop={8}>
                <X size={20} color={palette.text.tertiary} strokeWidth={2} />
              </Pressable>
            </HStack>
            <Text
              variant="body-sm"
              tone="tertiary"
              style={{ marginBottom: 14 }}
            >
              Share these {creds?.role} portal credentials. The password is
              shown only once.
            </Text>
            <CredRow label="Email" value={creds?.email || ""} />
            <CredRow
              label="Temporary password"
              value={creds?.tempPassword || ""}
            />
            <Button
              label="Done"
              size="lg"
              onPress={() => setCreds(null)}
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>

      <StudentFormModal
        visible={showEdit}
        onClose={() => setShowEdit(false)}
        editStudent={s}
      />
    </Screen>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <HStack gap={10} align="center">
      <Icon size={16} color={palette.text.tertiary} strokeWidth={1.8} />
      <Text variant="body-sm" tone="tertiary" style={{ width: 110 }}>
        {label}
      </Text>
      <Text variant="body-sm" tone="primary" style={{ flex: 1 }}>
        {value}
      </Text>
    </HStack>
  );
}

function CredRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.credRow}>
      <Text variant="caption" tone="tertiary">
        {label}
      </Text>
      <Text variant="label-lg" tone="primary">
        {value}
      </Text>
    </View>
  );
}

const styles = {
  idCard: { borderRadius: radius.xl, padding: 20, ...shadows.md },
  qrBox: { padding: 8, backgroundColor: "#FFFFFF", borderRadius: radius.md },
  gIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: palette.cobalt[50],
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 20,
  },
  credSheet: {
    width: "100%" as const,
    maxWidth: 420,
    backgroundColor: palette.surface.primary,
    borderRadius: radius.xl,
    padding: 22,
    ...shadows.lg,
  },
  credRow: {
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: palette.surface.secondary,
    marginBottom: 10,
  },
};
