/**
 * AppNavigator — responsive app shell.
 *
 *  - Wide screens (web / desktop ≥ wideBreakpoint): a permanent left Sidebar
 *    next to the content region.
 *  - Narrow screens (phones): content fills the screen with a top app bar; the
 *    Sidebar slides over as an overlay when the menu is tapped.
 *
 * Section routing is handled with local state; sections that need sub-screens
 * (Team → Add/Detail) host their own nested native-stack.
 */
import React, { useState, createContext, useContext } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  Modal,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Menu, GraduationCap } from "lucide-react-native";
import { palette, layout, radius } from "@shared/designSystem";
import { Text, HStack } from "@shared/ui";
import { Sidebar } from "./Sidebar";
import { NAV_ITEMS } from "./navItems";

import DashboardScreen from "@modules/dashboard/screens/DashboardScreen";
import CoursesScreen from "@modules/academics/screens/CoursesScreen";
import BatchesScreen from "@modules/academics/screens/BatchesScreen";
import SubjectsScreen from "@modules/academics/screens/SubjectsScreen";
import ClassroomsScreen from "@modules/academics/screens/ClassroomsScreen";
import TimetableScreen from "@modules/academics/screens/TimetableScreen";
import StudentsNavigator from "@modules/students/StudentsNavigator";
import AttendanceScreen from "@modules/attendance/screens/AttendanceScreen";
import NotificationsScreen from "@modules/attendance/screens/NotificationsScreen";
import FeesNavigator from "@modules/fees/FeesNavigator";
import FeeStructuresScreen from "@modules/fees/screens/FeeStructuresScreen";
import LearningScreen from "@modules/lms/screens/LearningScreen";
import ExamsNavigator from "@modules/exams/ExamsNavigator";
import MessagesScreen from "@modules/communication/screens/MessagesScreen";
import AnnouncementsScreen from "@modules/communication/screens/AnnouncementsScreen";
import InventoryScreen from "@modules/inventory/screens/InventoryScreen";
import HrScreen from "@modules/hr/screens/HrScreen";
import ExecutiveDashboardScreen from "@modules/analytics/screens/ExecutiveDashboardScreen";
import TeamNavigator from "@modules/team/TeamNavigator";
import AuditLogScreen from "@modules/team/screens/AuditLogScreen";
import SettingsScreen from "@modules/settings/screens/SettingsScreen";
import ProfileScreen from "@modules/profile/screens/ProfileScreen";

/** Lets any screen jump to another top-level section by name. */
export const SectionNav = createContext<(name: string) => void>(() => {});
export const useSectionNav = () => useContext(SectionNav);

// Sections registered so far (Phases 1–2). Later phases append here.
const SCREENS: Record<string, React.ComponentType> = {
  Dashboard: DashboardScreen,
  Students: StudentsNavigator,
  Attendance: AttendanceScreen,
  Fees: FeesNavigator,
  FeeStructures: FeeStructuresScreen,
  Learning: LearningScreen,
  Exams: ExamsNavigator,
  Messages: MessagesScreen,
  Announcements: AnnouncementsScreen,
  Inventory: InventoryScreen,
  HR: HrScreen,
  Executive: ExecutiveDashboardScreen,
  Notifications: NotificationsScreen,
  Courses: CoursesScreen,
  Batches: BatchesScreen,
  Subjects: SubjectsScreen,
  Rooms: ClassroomsScreen,
  Timetable: TimetableScreen,
  Team: TeamNavigator,
  AuditLog: AuditLogScreen,
  Settings: SettingsScreen,
  Profile: ProfileScreen,
};

export default function AppNavigator() {
  const { width } = useWindowDimensions();
  const isWide = width >= layout.wideBreakpoint;
  const [active, setActive] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = (name: string) => {
    setActive(name);
    setMenuOpen(false);
  };

  const ActiveScreen = SCREENS[active] || DashboardScreen;
  const activeLabel =
    NAV_ITEMS.find((i) => i.name === active)?.label || "ClassConnect Pro";

  return (
    <SectionNav.Provider value={navigate}>
      <View style={styles.root}>
        {isWide && <Sidebar activeRoute={active} onNavigate={navigate} />}

        <View style={{ flex: 1 }}>
          {!isWide && (
            <SafeAreaView edges={["top"]} style={styles.appBarSafe}>
              <HStack align="center" gap={12} style={styles.appBar}>
                <Pressable
                  onPress={() => setMenuOpen(true)}
                  hitSlop={8}
                  style={styles.menuBtn}
                >
                  <Menu
                    size={22}
                    color={palette.text.primary}
                    strokeWidth={2}
                  />
                </Pressable>
                <View style={styles.appBarLogo}>
                  <GraduationCap size={16} color="#FFFFFF" strokeWidth={2.4} />
                </View>
                <Text variant="h4" tone="primary">
                  {activeLabel}
                </Text>
              </HStack>
            </SafeAreaView>
          )}

          <View style={{ flex: 1 }}>
            <ActiveScreen />
          </View>
        </View>

        {/* Mobile slide-over sidebar */}
        {!isWide && (
          <Modal
            visible={menuOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setMenuOpen(false)}
          >
            <Pressable
              style={styles.backdrop}
              onPress={() => setMenuOpen(false)}
            >
              <Pressable
                style={styles.drawer}
                onPress={(e) => e.stopPropagation()}
              >
                <Sidebar activeRoute={active} onNavigate={navigate} />
              </Pressable>
            </Pressable>
          </Modal>
        )}
      </View>
    </SectionNav.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: palette.surface.secondary,
  },
  appBarSafe: { backgroundColor: palette.surface.primary },
  appBar: {
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: palette.surface.primary,
    borderBottomWidth: 1,
    borderBottomColor: palette.border.default,
  },
  menuBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  appBarLogo: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: palette.teal[600],
    alignItems: "center",
    justifyContent: "center",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.4)",
    flexDirection: "row",
  },
  drawer: { width: layout.sidebarWidth, height: "100%" },
});
