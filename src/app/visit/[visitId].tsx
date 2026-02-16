import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme, Linking, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { ScrollView } from "react-native-gesture-handler";
import { Image } from "expo-image";
import { format, parseISO, subDays, addDays } from "date-fns";

import { NotFound } from "@/components/NotFound";
import { ThemedText, ThemedView, useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
import { HeaderButton } from "@/components/HeaderButtons/HeaderButton";
import { osName } from "expo-device";
import { useVisitStore, visitStatusLabels, visitStatusColors, VisitTask } from "@/store/visitStore";
import { Button } from "@/components/Button";
import { generateMockVisits } from "@/data/mockVisits";

export default function VisitDetail() {
  const params = useLocalSearchParams();
  const visitId = params.visitId as string | undefined;
  const visits = useVisitStore((state) => state.visits);
  const setVisits = useVisitStore((state) => state.setVisits);
  const updateVisit = useVisitStore((state) => state.updateVisit);
  const isDarkMode = useColorScheme() === "dark";
  const router = useRouter();
  const borderColor = useThemeColor(theme.color.border);

  // Initialize visits if store is empty (happens on direct navigation)
  React.useEffect(() => {
    if (visits.length === 0) {
      const today = new Date();
      const mockData = generateMockVisits(subDays(today, 30), addDays(today, 60));
      setVisits(mockData);
    }
  }, [visits.length, setVisits]);

  const visit = visits.find((v) => v.id === visitId);

  const statusColor = visit
    ? isDarkMode
      ? visitStatusColors[visit.status].dark
      : visitStatusColors[visit.status].light
    : "#000";

  const handleCall = () => {
    if (visit) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Linking.openURL(`tel:${visit.careRecipient.phoneNumber}`);
    }
  };

  const handleDirections = () => {
    if (visit) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const address = encodeURIComponent(visit.address.formatted);
      Linking.openURL(`maps://?q=${address}`);
    }
  };

  const handleClockIn = () => {
    if (visit) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      updateVisit(visit.id, {
        status: "in_progress",
        actualClockIn: new Date().toISOString(),
      });
    }
  };

  const handleClockOut = () => {
    if (visit) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      updateVisit(visit.id, {
        status: "completed",
        actualClockOut: new Date().toISOString(),
      });
    }
  };

  const toggleTask = (taskId: string) => {
    if (visit) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const updatedTasks = visit.tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      updateVisit(visit.id, { tasks: updatedTasks });
    }
  };

  // Show loading/placeholder if visits not loaded yet
  if (visits.length === 0) {
    return (
      <ThemedView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ThemedText fontSize={theme.fontSize16}>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!visit) {
    return <NotFound message="Visit not found" />;
  }

  const initials = `${visit.careRecipient.firstName[0]}${visit.careRecipient.lastName[0]}`;

  return (
    <>
      <Stack.Screen
        options={{
          title: "",
          headerLeft: () =>
            Platform.select({
              ios: (
                <HeaderButton
                  buttonProps={{ onPress: router.back }}
                  style={{ padding: osName === "iPadOS" ? 40 : 0 }}
                />
              ),
              default: undefined,
            }),
        }}
      />

      <ThemedView style={styles.container} color={theme.color.background}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        >
          {/* Header with care recipient info */}
          <View style={styles.centered}>
            {/* Avatar */}
            {visit.careRecipient.profilePicture ? (
              <Image
                source={{ uri: visit.careRecipient.profilePicture }}
                style={styles.avatarLarge}
                transition={300}
              />
            ) : (
              <View style={[styles.avatarLarge, styles.avatarPlaceholder]}>
                <ThemedText
                  fontSize={theme.fontSize24}
                  fontWeight="bold"
                  color={{ light: "#FFFFFF", dark: "#FFFFFF" }}
                >
                  {initials}
                </ThemedText>
              </View>
            )}

            {/* Name */}
            <ThemedText fontWeight="bold" fontSize={theme.fontSize24}>
              {visit.careRecipient.fullName}
            </ThemedText>

            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <ThemedText
                fontSize={theme.fontSize14}
                fontWeight="semiBold"
                color={{ light: statusColor, dark: statusColor }}
              >
                {visitStatusLabels[visit.status]}
              </ThemedText>
            </View>

            <View style={[styles.separator, { borderBottomColor: borderColor }]} />
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Pressable style={styles.quickActionButton} onPress={handleCall}>
              <ThemedText fontSize={theme.fontSize24}>📞</ThemedText>
              <ThemedText fontSize={theme.fontSize14} fontWeight="medium">
                Call
              </ThemedText>
            </Pressable>
            <Pressable style={styles.quickActionButton} onPress={handleDirections}>
              <ThemedText fontSize={theme.fontSize24}>🗺️</ThemedText>
              <ThemedText fontSize={theme.fontSize14} fontWeight="medium">
                Directions
              </ThemedText>
            </Pressable>
          </View>

          {/* Address Section */}
          <Section title="Address" value={visit.address.formatted} />

          {/* Phone Section */}
          <Section title="Phone" value={visit.careRecipient.phoneNumber} />

          {/* Time Section */}
          <Section
            title="Scheduled Time"
            value={`${format(parseISO(visit.scheduledStartTime), "h:mm a")} - ${format(parseISO(visit.scheduledEndTime), "h:mm a")} (${visit.scheduledDuration} min)`}
          />

          {/* Clock Times */}
          {visit.actualClockIn && (
            <Section
              title="Clocked In"
              value={format(parseISO(visit.actualClockIn), "h:mm a")}
            />
          )}
          {visit.actualClockOut && (
            <Section
              title="Clocked Out"
              value={format(parseISO(visit.actualClockOut), "h:mm a")}
            />
          )}

          {/* Tasks Section */}
          {visit.tasks.length > 0 && (
            <View style={styles.tasksSection}>
              <ThemedText fontSize={theme.fontSize18} fontWeight="semiBold">
                Tasks ({visit.tasks.filter((t) => t.completed).length}/{visit.tasks.length})
              </ThemedText>
              <View style={styles.tasksList}>
                {visit.tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={() => toggleTask(task.id)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Notes Section */}
          {visit.notes && <Section title="Notes" value={visit.notes} />}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {visit.status === "scheduled" && (
              <Button title="Clock In" onPress={handleClockIn} />
            )}
            {visit.status === "in_progress" && (
              <Button title="Clock Out" onPress={handleClockOut} />
            )}
          </View>
        </ScrollView>
      </ThemedView>
    </>
  );
}

function TaskItem({
  task,
  onToggle,
}: {
  task: VisitTask;
  onToggle: () => void;
}) {
  return (
    <Pressable style={styles.taskItem} onPress={onToggle}>
      <View style={[styles.checkbox, task.completed && styles.checkboxCompleted]}>
        {task.completed && (
          <ThemedText
            fontSize={theme.fontSize12}
            color={{ light: "#FFFFFF", dark: "#FFFFFF" }}
          >
            ✓
          </ThemedText>
        )}
      </View>
      <View style={styles.taskContent}>
        <ThemedText
          fontSize={theme.fontSize16}
          fontWeight="medium"
          style={task.completed ? styles.taskCompleted : undefined}
        >
          {task.title}
        </ThemedText>
        {task.description && (
          <ThemedText
            fontSize={theme.fontSize14}
            color={theme.color.textSecondary}
          >
            {task.description}
          </ThemedText>
        )}
      </View>
    </Pressable>
  );
}

function Section({ title, value }: { title: string; value: string | null }) {
  if (!value) {
    return null;
  }

  return (
    <View style={styles.sectionContainer}>
      <ThemedText fontSize={theme.fontSize14} fontWeight="medium" color={theme.color.textSecondary}>
        {title}
      </ThemedText>
      <ThemedText fontSize={theme.fontSize16} fontWeight="medium">
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButtons: {
    gap: theme.space12,
    marginTop: theme.space16,
  },
  avatarLarge: {
    borderRadius: 40,
    height: 80,
    marginBottom: theme.space16,
    width: 80,
  },
  avatarPlaceholder: {
    alignItems: "center",
    backgroundColor: "#087EA4",
    justifyContent: "center",
  },
  centered: {
    alignItems: "center",
  },
  checkbox: {
    alignItems: "center",
    borderColor: "#CCC",
    borderRadius: theme.borderRadius6,
    borderWidth: 2,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  checkboxCompleted: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.space16,
    paddingTop: theme.space24,
  },
  quickActionButton: {
    alignItems: "center",
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    borderRadius: theme.borderRadius12,
    flex: 1,
    gap: theme.space4,
    paddingHorizontal: theme.space16,
    paddingVertical: theme.space12,
  },
  quickActions: {
    flexDirection: "row",
    gap: theme.space12,
    marginBottom: theme.space24,
  },
  sectionContainer: {
    gap: theme.space4,
    marginBottom: theme.space16,
  },
  separator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: theme.space24,
    width: "100%",
  },
  statusBadge: {
    alignItems: "center",
    borderRadius: theme.borderRadius10,
    flexDirection: "row",
    gap: theme.space8,
    marginTop: theme.space8,
    paddingHorizontal: theme.space12,
    paddingVertical: theme.space8,
  },
  statusDot: {
    borderRadius: 6,
    height: 10,
    width: 10,
  },
  taskCompleted: {
    opacity: 0.5,
    textDecorationLine: "line-through",
  },
  taskContent: {
    flex: 1,
    gap: theme.space2,
  },
  taskItem: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: theme.space12,
    paddingVertical: theme.space8,
  },
  tasksSection: {
    gap: theme.space12,
    marginBottom: theme.space16,
  },
  tasksList: {
    gap: theme.space4,
  },
});
