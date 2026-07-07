import React from "react";
import { View, Pressable, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GraduationCap, LogOut } from "lucide-react-native";
import { useAuthStore } from "@shared/store/useAuthStore";
import { palette, radius, layout } from "@shared/designSystem";
import { Text, VStack, HStack, Avatar } from "@shared/ui";
import { useUnreadCount } from "@modules/attendance/hooks/useAttendance";
import { useUnreadMessages } from "@modules/communication/hooks/useComm";
import { NAV_ITEMS, NavItem } from "./navItems";

interface Props {
  activeRoute: string;
  onNavigate: (name: string) => void;
}

export function Sidebar({ activeRoute, onNavigate }: Props) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const organization = useAuthStore((s) => s.organization);
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const logout = useAuthStore((s) => s.logout);
  const { data: unread = 0 } = useUnreadCount();
  const { data: msgUnread = 0 } = useUnreadMessages();

  const items = NAV_ITEMS.filter((it) => {
    if (it.adminOnly) return isAdmin();
    if (it.roles) return it.roles.includes(user?.role || "");
    if (it.anyPermissions)
      return it.anyPermissions.some((p) => hasPermission(p));
    if (it.permission) return hasPermission(it.permission);
    return true;
  });

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 20 }]}>
      {/* Brand */}
      <HStack
        gap={10}
        align="center"
        style={{ paddingHorizontal: 20, marginBottom: 24 }}
      >
        <View style={styles.logo}>
          <GraduationCap size={20} color="#FFFFFF" strokeWidth={2.4} />
        </View>
        <VStack gap={1} flex={1}>
          <Text variant="h4" tone="primary" numberOfLines={1}>
            ClassConnect Pro
          </Text>
          <Text variant="caption" tone="tertiary" numberOfLines={1}>
            {organization?.name || "Inventory"}
          </Text>
        </VStack>
      </HStack>

      {/* Nav */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 12 }}
      >
        {items.map((item) => (
          <React.Fragment key={item.name}>
            {item.section ? (
              <Text
                variant="label-sm"
                tone="tertiary"
                style={{
                  paddingHorizontal: 14,
                  marginTop: 14,
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                }}
              >
                {item.section}
              </Text>
            ) : null}
            <NavRow
              item={item}
              active={activeRoute === item.name}
              badge={
                item.name === "Notifications"
                  ? unread
                  : item.name === "Messages"
                    ? msgUnread
                    : 0
              }
              onPress={() => onNavigate(item.name)}
            />
          </React.Fragment>
        ))}
      </ScrollView>

      {/* User footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <HStack gap={10} align="center">
          <Avatar name={user?.fullName || "U"} size={38} />
          <VStack gap={1} flex={1}>
            <Text variant="label" tone="primary" numberOfLines={1}>
              {user?.fullName}
            </Text>
            <Text variant="caption" tone="tertiary" numberOfLines={1}>
              {user?.role === "admin" ? "Admin" : user?.roleLabel || "Staff"}
            </Text>
          </VStack>
          <Pressable
            onPress={() => logout()}
            hitSlop={8}
            style={styles.logoutBtn}
          >
            <LogOut size={18} color={palette.text.tertiary} strokeWidth={1.8} />
          </Pressable>
        </HStack>
      </View>
    </View>
  );
}

function NavRow({
  item,
  active,
  badge = 0,
  onPress,
}: {
  item: NavItem;
  active: boolean;
  badge?: number;
  onPress: () => void;
}) {
  const Icon = item.icon;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.navRow,
        active && styles.navRowActive,
        pressed && !active && { backgroundColor: palette.ink[50] },
      ]}
    >
      <Icon
        size={19}
        color={active ? palette.teal[700] : palette.text.tertiary}
        strokeWidth={active ? 2.2 : 1.8}
      />
      <Text
        variant="label-lg"
        style={{
          flex: 1,
          color: active ? palette.teal[700] : palette.text.secondary,
        }}
      >
        {item.label}
      </Text>
      {badge > 0 ? (
        <View style={styles.badge}>
          <Text variant="label-sm" style={{ color: "#FFFFFF" }}>
            {badge > 99 ? "99+" : badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: layout.sidebarWidth,
    flex: 1,
    backgroundColor: palette.surface.primary,
    borderRightWidth: 1,
    borderRightColor: palette.border.default,
  },
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: palette.danger.text,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: palette.teal[600],
    alignItems: "center",
    justifyContent: "center",
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.md,
    marginBottom: 4,
  },
  navRowActive: { backgroundColor: palette.teal[50] },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: palette.border.default,
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});
