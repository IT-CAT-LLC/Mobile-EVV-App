import { StyleSheet, View, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { format, parseISO } from "date-fns";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";

import { ThemedText, ThemedView, useThemeColor } from "./Themed";
import { theme } from "@/theme";
import { Visit, visitStatusLabels, visitStatusColors } from "@/store/visitStore";

type Props = {
  visit: Visit;
  onPress?: (visit: Visit) => void;
};

export function VisitCard({ visit, onPress }: Props) {
  const isDarkMode = useColorScheme() === "dark";
  const statusColor = isDarkMode 
    ? visitStatusColors[visit.status].dark 
    : visitStatusColors[visit.status].light;

  const gestureTap = useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(10)
        .runOnJS(true)
        .onEnd(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress?.(visit);
        }),
    [onPress, visit]
  );

  const startTime = format(parseISO(visit.scheduledStartTime), "h:mm a");
  const endTime = format(parseISO(visit.scheduledEndTime), "h:mm a");
  const timeRange = `${startTime} - ${endTime}`;

  const initials = `${visit.careRecipient.firstName[0]}${visit.careRecipient.lastName[0]}`;

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut}>
      <GestureDetector gesture={gestureTap}>
        <ThemedView style={styles.container}>
          {/* Main card */}
          <ThemedView
            color={theme.color.backgroundSecondary}
            style={styles.card}
          >
            {/* Status indicator bar */}
            <View style={[styles.statusBar, { backgroundColor: statusColor }]} />

            {/* Content */}
            <View style={styles.content}>
              {/* Header row: Avatar + Name + Status */}
              <View style={styles.header}>
                {visit.careRecipient.profilePicture ? (
                  <Image
                    source={{ uri: visit.careRecipient.profilePicture }}
                    style={styles.avatar}
                    transition={300}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <ThemedText
                      fontSize={theme.fontSize14}
                      fontWeight="bold"
                      color={{ light: "#FFFFFF", dark: "#FFFFFF" }}
                    >
                      {initials}
                    </ThemedText>
                  </View>
                )}

                <View style={styles.headerText}>
                  <ThemedText
                    fontSize={theme.fontSize16}
                    fontWeight="semiBold"
                    numberOfLines={1}
                  >
                    {visit.careRecipient.fullName}
                  </ThemedText>
                  <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <ThemedText
                      fontSize={theme.fontSize12}
                      fontWeight="medium"
                      color={{ light: statusColor, dark: statusColor }}
                    >
                      {visitStatusLabels[visit.status]}
                    </ThemedText>
                  </View>
                </View>
              </View>

              {/* Address */}
              <View style={styles.infoRow}>
                <ThemedText
                  fontSize={theme.fontSize14}
                  color={theme.color.textSecondary}
                  numberOfLines={1}
                >
                  📍 {visit.address.formatted}
                </ThemedText>
              </View>

              {/* Time and Duration */}
              <View style={styles.footer}>
                <ThemedText
                  fontSize={theme.fontSize14}
                  fontWeight="medium"
                  color={theme.color.textSecondary}
                >
                  🕐 {timeRange}
                </ThemedText>
                <ThemedText
                  fontSize={theme.fontSize12}
                  fontWeight="medium"
                  color={theme.color.textSecondary}
                >
                  {visit.scheduledDuration} min
                </ThemedText>
              </View>

              {/* Tasks preview */}
              {visit.tasks.length > 0 && (
                <View style={styles.tasksPreview}>
                  <ThemedText
                    fontSize={theme.fontSize12}
                    fontWeight="medium"
                    color={theme.color.textSecondary}
                  >
                    {visit.tasks.filter((t) => t.completed).length}/{visit.tasks.length} tasks
                  </ThemedText>
                </View>
              )}
            </View>
          </ThemedView>
        </ThemedView>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.space16,
    marginBottom: theme.space16,
  },
  card: {
    borderRadius: theme.borderRadius12,
    flex: 1,
    flexDirection: "row",
    overflow: "hidden",
  },
  statusBar: {
    width: 4,
  },
  content: {
    flex: 1,
    gap: theme.space8,
    padding: theme.space16,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.space12,
  },
  avatar: {
    borderRadius: theme.borderRadius20,
    height: 40,
    width: 40,
  },
  avatarPlaceholder: {
    alignItems: "center",
    backgroundColor: "#087EA4",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
    gap: theme.space4,
  },
  statusBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: theme.borderRadius6,
    flexDirection: "row",
    gap: theme.space4,
    paddingHorizontal: theme.space8,
    paddingVertical: theme.space2,
  },
  statusDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  infoRow: {
    flexDirection: "row",
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tasksPreview: {
    alignItems: "center",
    borderRadius: theme.borderRadius6,
    flexDirection: "row",
    gap: theme.space8,
  },
});
