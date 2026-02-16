import { useScrollToTop } from "@react-navigation/native";
import React, { useMemo } from "react";
import { Platform, StyleSheet, View, Linking, useColorScheme } from "react-native";
import { Pressable, ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";

import { ThemedText, ThemedView, useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";

// Mock data for notifications and todos
const mockNotifications = [
  {
    id: "notif-1",
    title: "Schedule Update",
    message: "Your visit with Eleanor Martinez has been rescheduled to 2:00 PM",
    time: "10 min ago",
    read: false,
    type: "schedule" as const,
  },
  {
    id: "notif-2",
    title: "Payment Processed",
    message: "Your weekly payment of $297.00 is being processed",
    time: "2 hours ago",
    read: false,
    type: "payment" as const,
  },
  {
    id: "notif-3",
    title: "New Training Available",
    message: "Complete your annual compliance training by March 1st",
    time: "1 day ago",
    read: true,
    type: "training" as const,
  },
];

const mockTodos = [
  {
    id: "todo-1",
    title: "Submit timesheet",
    dueDate: "Today",
    priority: "high" as const,
    completed: false,
  },
  {
    id: "todo-2",
    title: "Complete care plan review",
    dueDate: "Tomorrow",
    priority: "medium" as const,
    completed: false,
  },
  {
    id: "todo-3",
    title: "Update emergency contacts",
    dueDate: "This week",
    priority: "low" as const,
    completed: false,
  },
];

const contactInfo = {
  agencyName: "Sunshine Home Care",
  phone: "(555) 800-1234",
  email: "support@sunshinehomecare.com",
  address: "123 Care Street, Suite 100, Springfield, IL 62701",
  hours: "Mon-Fri: 8:00 AM - 6:00 PM",
};

export default function Info() {
  const backgroundColor = useThemeColor(theme.color.background);
  const cardBackground = useThemeColor({ light: "#FFFFFF", dark: "#1C1C1E" });
  const isDarkMode = useColorScheme() === "dark";
  const ref = React.useRef(null);
  const { bottom } = useSafeAreaInsets();

  useScrollToTop(ref);

  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  const handleCall = (phone: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`tel:${phone.replace(/[^0-9]/g, "")}`);
  };

  const handleEmail = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`mailto:${contactInfo.email}`);
  };

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    const colors = {
      high: isDarkMode ? "#F87171" : "#EF4444",
      medium: isDarkMode ? "#FBBF24" : "#F59E0B",
      low: isDarkMode ? "#60A5FA" : "#3B82F6",
    };
    return colors[priority];
  };

  const getNotificationIcon = (type: "schedule" | "payment" | "training") => {
    const icons = {
      schedule: "calendar-clock",
      payment: "cash-check",
      training: "school-outline",
    };
    return icons[type] as any;
  };

  return (
    <ScrollView
      style={{ backgroundColor }}
      ref={ref}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingBottom: Platform.select({ android: 100 + bottom, default: bottom + 20 }),
        paddingTop: theme.space8,
      }}
    >
      {/* Contact Info Card */}
      <Animated.View entering={FadeIn.delay(100)}>
        <View style={[styles.card, { backgroundColor: cardBackground }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name="office-building"
              size={24}
              color={isDarkMode ? "#58C4DC" : "#087EA4"}
            />
            <ThemedText fontSize={theme.fontSize18} fontWeight="semiBold">
              {contactInfo.agencyName}
            </ThemedText>
          </View>

          <View style={styles.contactRow}>
            <Pressable style={styles.contactButton} onPress={() => handleCall(contactInfo.phone)}>
              <MaterialCommunityIcons
                name="phone"
                size={20}
                color={isDarkMode ? "#34D399" : "#10B981"}
              />
              <View>
                <ThemedText fontSize={theme.fontSize12} color={theme.color.textSecondary}>
                  Office
                </ThemedText>
                <ThemedText fontSize={theme.fontSize14} fontWeight="medium">
                  {contactInfo.phone}
                </ThemedText>
              </View>
            </Pressable>
          </View>

          <Pressable style={styles.contactButton} onPress={handleEmail}>
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color={isDarkMode ? "#60A5FA" : "#3B82F6"}
            />
            <View style={{ flex: 1 }}>
              <ThemedText fontSize={theme.fontSize12} color={theme.color.textSecondary}>
                Email
              </ThemedText>
              <ThemedText fontSize={theme.fontSize14} fontWeight="medium">
                {contactInfo.email}
              </ThemedText>
            </View>
          </Pressable>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={18}
              color={isDarkMode ? "#9CA3AF" : "#6B7280"}
            />
            <ThemedText fontSize={theme.fontSize14} color={theme.color.textSecondary} style={{ flex: 1 }}>
              {contactInfo.address}
            </ThemedText>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={18}
              color={isDarkMode ? "#9CA3AF" : "#6B7280"}
            />
            <ThemedText fontSize={theme.fontSize14} color={theme.color.textSecondary}>
              {contactInfo.hours}
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      {/* Notifications Section */}
      <Animated.View entering={FadeIn.delay(200)}>
        <View style={styles.sectionHeader}>
          <ThemedText fontSize={theme.fontSize14} fontWeight="semiBold" color={theme.color.textSecondary}>
            NOTIFICATIONS
          </ThemedText>
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: isDarkMode ? "#DC2626" : "#EF4444" }]}>
              <ThemedText
                fontSize={theme.fontSize12}
                fontWeight="bold"
                color={{ light: "#FFFFFF", dark: "#FFFFFF" }}
              >
                {unreadCount}
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.listContainer}>
          {mockNotifications.map((notification) => {
            const notifColor = notification.read 
              ? (isDarkMode ? "#9CA3AF" : "#6B7280")
              : (isDarkMode ? "#58C4DC" : "#087EA4");
            return (
              <Pressable
                key={notification.id}
                style={[styles.rowCard, { backgroundColor: cardBackground, borderColor: isDarkMode ? "#38383A" : "#E5E5EA" }]}
              >
                <View style={[styles.rowIconContainer, { backgroundColor: `${notifColor}15` }]}>
                  <MaterialCommunityIcons
                    name={getNotificationIcon(notification.type)}
                    size={24}
                    color={notifColor}
                  />
                </View>
                <View style={styles.rowContent}>
                  <View style={styles.rowTopRow}>
                    <ThemedText fontSize={theme.fontSize16} fontWeight="semiBold" numberOfLines={1} style={{ flex: 1 }}>
                      {notification.title}
                    </ThemedText>
                    {!notification.read && (
                      <View style={[styles.unreadDot, { backgroundColor: notifColor }]} />
                    )}
                  </View>
                  <ThemedText
                    fontSize={theme.fontSize14}
                    color={theme.color.textSecondary}
                    numberOfLines={2}
                  >
                    {notification.message}
                  </ThemedText>
                  <View style={styles.rowBottomRow}>
                    <ThemedText fontSize={theme.fontSize12} color={theme.color.textSecondary}>
                      {notification.time}
                    </ThemedText>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      {/* Action Items / TODOs Section */}
      <Animated.View entering={FadeIn.delay(300)}>
        <View style={styles.sectionHeader}>
          <ThemedText fontSize={theme.fontSize14} fontWeight="semiBold" color={theme.color.textSecondary}>
            ACTION ITEMS
          </ThemedText>
          <View style={[styles.badge, { backgroundColor: isDarkMode ? "#F59E0B" : "#F59E0B" }]}>
            <ThemedText
              fontSize={theme.fontSize12}
              fontWeight="bold"
              color={{ light: "#FFFFFF", dark: "#000000" }}
            >
              {mockTodos.filter((t) => !t.completed).length}
            </ThemedText>
          </View>
        </View>

        <View style={styles.listContainer}>
          {mockTodos.map((todo) => {
            const priorityColor = getPriorityColor(todo.priority);
            return (
              <Pressable
                key={todo.id}
                style={[styles.rowCard, { backgroundColor: cardBackground, borderColor: isDarkMode ? "#38383A" : "#E5E5EA" }]}
              >
                <View style={[styles.rowIconContainer, { backgroundColor: `${priorityColor}15` }]}>
                  <MaterialCommunityIcons
                    name={todo.completed ? "check-circle" : "clipboard-text-outline"}
                    size={24}
                    color={priorityColor}
                  />
                </View>
                <View style={styles.rowContent}>
                  <View style={styles.rowTopRow}>
                    <ThemedText 
                      fontSize={theme.fontSize16} 
                      fontWeight="semiBold" 
                      numberOfLines={1} 
                      style={{ flex: 1, textDecorationLine: todo.completed ? 'line-through' : 'none' }}
                    >
                      {todo.title}
                    </ThemedText>
                    <View style={[styles.priorityBadge, { backgroundColor: `${priorityColor}20` }]}>
                      <ThemedText fontSize={theme.fontSize10} fontWeight="bold" style={{ color: priorityColor }}>
                        {todo.priority.toUpperCase()}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.rowBottomRow}>
                    <ThemedText fontSize={theme.fontSize12} color={theme.color.textSecondary}>
                      Due: {todo.dueDate}
                    </ThemedText>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color={isDarkMode ? "#6B7280" : "#9CA3AF"}
                    />
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      {/* App Info */}
      <Animated.View entering={FadeIn.delay(400)}>
        <View style={styles.appInfo}>
          <ThemedText fontSize={theme.fontSize12} color={theme.color.textSecondary}>
            EVV Tracking App v1.1.3
          </ThemedText>
          <ThemedText fontSize={theme.fontSize12} color={theme.color.textSecondary}>
            © 2026 IT-CAT LLC
          </ThemedText>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  appInfo: {
    alignItems: "center",
    gap: theme.space4,
    paddingTop: theme.space24,
  },
  badge: {
    borderRadius: 10,
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  card: {
    borderRadius: theme.borderRadius12,
    gap: theme.space12,
    marginHorizontal: theme.space16,
    padding: theme.space16,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.space12,
  },
  contactButton: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: theme.space8,
  },
  contactRow: {
    flexDirection: "row",
    gap: theme.space16,
  },
  infoRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: theme.space8,
  },
  listContainer: {
    gap: theme.space12,
    paddingHorizontal: theme.space16,
  },
  priorityBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rowBottomRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.space4,
  },
  rowCard: {
    borderRadius: theme.borderRadius12,
    borderWidth: 1,
    flexDirection: "row",
    padding: theme.space12,
  },
  rowContent: {
    flex: 1,
  },
  rowIconContainer: {
    alignItems: "center",
    borderRadius: theme.borderRadius10,
    height: 48,
    justifyContent: "center",
    marginRight: theme.space12,
    width: 48,
  },
  rowTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.space2,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.space8,
    marginBottom: theme.space8,
    marginTop: theme.space24,
    paddingHorizontal: theme.space16,
  },
  unreadDot: {
    borderRadius: 4,
    height: 8,
    marginLeft: theme.space8,
    width: 8,
  },
});
