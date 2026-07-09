import React from "react";
import { View } from "react-native";
import {
  Bell,
  CheckCheck,
  CalendarX2,
  Wallet,
  Megaphone,
  Info,
} from "lucide-react-native";
import { palette, radius } from "@shared/designSystem";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  EmptyState,
} from "@shared/ui";
import {
  useNotifications,
  useMarkNotifRead,
  useMarkAllNotifRead,
} from "@modules/attendance/hooks/useAttendance";
import { AppNotification } from "@modules/attendance/types";

const TONE_COLOR: Record<string, string> = {
  success: palette.success.text,
  warning: palette.warning.text,
  danger: palette.danger.text,
  info: palette.info.text,
};
const TYPE_ICON: Record<string, any> = {
  attendance: CalendarX2,
  fee: Wallet,
  announcement: Megaphone,
  general: Info,
};

export default function NotificationsScreen() {
  const { data, isLoading, refetch, isRefetching } = useNotifications();
  const markRead = useMarkNotifRead();
  const markAll = useMarkAllNotifRead();
  const items = data?.data || [];
  const unread = data?.meta?.unread || 0;

  return (
    <Screen
      overline="Notifications"
      title="Notifications"
      subtitle={unread ? `${unread} unread` : "You're all caught up"}
      refreshing={isLoading || isRefetching}
      onRefresh={refetch}
      right={
        unread ? (
          <Button
            label="Mark all read"
            variant="secondary"
            fullWidth={false}
            icon={
              <CheckCheck
                size={15}
                color={palette.text.primary}
                strokeWidth={2}
              />
            }
            onPress={() => markAll.mutate()}
          />
        ) : undefined
      }
    >
      {items.length === 0 && !isLoading ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          message="Attendance alerts, fee reminders and announcements will appear here."
        />
      ) : (
        <VStack gap={10}>
          {items.map((n: AppNotification) => {
            const Icon = TYPE_ICON[n.type] || Info;
            const color = TONE_COLOR[n.tone] || palette.info.text;
            return (
              <Card
                key={n.id}
                onPress={n.read ? undefined : () => markRead.mutate(n.id)}
                style={
                  n.read
                    ? undefined
                    : { borderColor: palette.cobalt[200], borderWidth: 1 }
                }
              >
                <HStack gap={12} align="flex-start">
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: radius.md,
                      backgroundColor: color + "18",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={18} color={color} strokeWidth={2} />
                  </View>
                  <VStack gap={3} flex={1}>
                    <HStack justify="space-between" align="center">
                      <Text variant="label-lg" tone="primary" numberOfLines={1}>
                        {n.title}
                      </Text>
                      {!n.read ? (
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: palette.cobalt[600],
                          }}
                        />
                      ) : null}
                    </HStack>
                    <Text variant="body-sm" tone="tertiary">
                      {n.body}
                    </Text>
                    <Text variant="caption" tone="tertiary">
                      {new Date(n.createdAt).toLocaleString()}
                    </Text>
                  </VStack>
                </HStack>
              </Card>
            );
          })}
        </VStack>
      )}
    </Screen>
  );
}
