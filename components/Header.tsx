import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Avatar } from "@/components/Avatar";
import { useTheme } from "@/hooks/useTheme";
import { useTaskStore } from "@/store/taskStore";
import { useStreakStore } from "@/store/streakStore"; // Import useStreakStore
import { router } from "expo-router";
import React, { useMemo, useState, useEffect, useRef } from "react"; // Import useState, useEffect, useRef
import { createTypography } from "../styles/typography"; // Import createTypography
import { Bell } from "lucide-react-native"; // Import Bell icon instead of IoIosNotificationsOutline
import NotificationsDropdown from "./NotificationsDropdown"; // Import NotificationsDropdown
// import { TeamInvitation } from '@/types/task'; // No longer needed here

export default function Header() {
  const { colors } = useTheme();
  const typography = useMemo(() => createTypography(colors), [colors]); // Initialize typography
  const user = useTaskStore((state) => state.user);
  const tasks = useTaskStore((state) => state.tasks);
  const logout = useTaskStore((state) => state.logout);
  const pendingInvitations = useTaskStore((state) => state.pendingInvitations); // Get pendingInvitations from store
  const { currentStreak, bestStreak } = useStreakStore((state) => state.streak); // Get streak data
  const [isNotificationsDropdownVisible, setNotificationsDropdownVisible] =
    useState(false); // New state for dropdown visibility

  const animatedTexts = useMemo(
    () => [
      "Start Working on yourself man.",
      "Stay focused, stay driven.",
      "You got this!",
    ],
    []
  );
  const [currentAnimatedTextIndex, setCurrentAnimatedTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnimatedTextIndex(
        (prevIndex) => (prevIndex + 1) % animatedTexts.length
      );
    }, 10000); // Change text every 5 seconds

    return () => clearInterval(interval);
  }, [animatedTexts]);
  // const [mockInvitations, setMockInvitations] = useState<TeamInvitation[]>([
  //   { id: 'inv1', teamId: 'teamA', teamName: 'Alpha Team', inviterName: 'Alice' },
  //   { id: 'inv2', teamId: 'teamB', teamName: 'Beta Squad', inviterName: 'Bob' },
  // ]); // Mock invitations

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const handleProfile = () => {
    router.push("/profile");
  };

  const handleNotifications = () => {
    setNotificationsDropdownVisible((prev) => !prev);
  };

  // const handleAcceptInvitation = (invitationId: string, teamId: string) => {
  //   console.log(`Accepted invitation ${invitationId} for team ${teamId}`);
  //   // Implement actual acceptance logic using useTaskStore action
  //   setMockInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
  //   setPendingInvitationsCount((prev) => prev - 1);
  // };

  // const handleRejectInvitation = (invitationId: string, teamId: string) => {
  //   console.log(`Rejected invitation ${invitationId} for team ${teamId}`);
  //   // Implement actual rejection logic using useTaskStore action
  //   setMockInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
  //   setPendingInvitationsCount((prev) => prev - 1);
  // };

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerText, { color: colors.textPrimary }]}>
            Hello! {""}
          </Text>
          <Text style={[styles.headerHeading, { color: colors.textPrimary }]}>
            {user?.name || user?.email}
          </Text>
        </View>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          {tasks.length.toString().padStart(2, "0")} tasks pending
        </Text>
        {/* Streak Information */}
        <View style={styles.streakContainer}>
          <Text style={[typography.small, { color: colors.textSecondary }]}>
            🔥{currentStreak} Days
          </Text>
          <Text
            style={[
              typography.small,
              { color: colors.textSecondary, marginLeft: 8 },
            ]}
          >
            🏆 Best Streak: {bestStreak} Days
          </Text>

         
        </View>
        <Text style={styles.titleheading}>
            {animatedTexts[currentAnimatedTextIndex]}
            {""}
          </Text>
      </View>
      <View style={styles.notificationProfileContainer}>
        <TouchableOpacity onPress={handleNotifications}>
          <Bell size={24} color={colors.textPrimary} />
          {pendingInvitations.length > 0 && (
            <View
              style={[
                styles.notificationBadge,
                { backgroundColor: colors.notification },
              ]}
            >
              <Text style={[styles.notificationCount, { color: colors.white }]}>
                {pendingInvitations.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleProfile}>
          <Avatar
            seed={user?.email || "guest"}
            size={40}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>
      <NotificationsDropdown
        isVisible={isNotificationsDropdownVisible}
        onClose={() => setNotificationsDropdownVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  headerTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streakContainer: {
    flexDirection: "row",
    marginTop: 4,
  },
  headerHeading: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    lineHeight: 32,
  },
  headerText: {
    fontSize: 28,
    fontFamily: "Poppins-lightItalic",
    lineHeight: 32,
  },
  notificationProfileContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    paddingBottom:40 // Increased gap for better spacing
  },
  notificationBadge: {
    position: "absolute",
    right: -5,
    top: -5,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationCount: {
    fontSize: 12,
    fontWeight: "bold",
  },
  titleheading:{
    fontSize: 18,
    paddingTop:10,
    fontFamily:'Poppins-lightItalic',
  }
});
