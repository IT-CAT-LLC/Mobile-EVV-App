import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Platform, StyleSheet, View, useWindowDimensions, useColorScheme, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  Easing,
  useAnimatedReaction,
  useDerivedValue,
  withTiming,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { Pressable, ScrollView } from "react-native-gesture-handler";
import { Canvas, Fill, Shader, Skia, vec } from "@shopify/react-native-skia";
import { Image } from "expo-image";
import { format, parseISO } from "date-fns";

import { NotFound } from "@/components/NotFound";
import { ThemedText, ThemedView, useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
import { HeaderButton } from "@/components/HeaderButtons/HeaderButton";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { scheduleOnRN } from "react-native-worklets";
import { osName } from "expo-device";
import { useVisitStore, visitStatusLabels, visitStatusColors, Visit, VisitTask } from "@/store/visitStore";
import { Button } from "@/components/Button";
import { generateMockVisits } from "@/data/mockVisits";
import { subDays, addDays } from "date-fns";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const source = Platform.OS !== "web" ? Skia.RuntimeEffect.Make(`
uniform float sheetAnim;
uniform vec2 size;

vec4 main(vec2 pos) {
  vec2 normalized = pos/vec2(256);
  vec2 offset;
  float dist;
  offset = (pos - vec2(size.x/2, -size.y));
  dist = sqrt(pow(offset.x, 2.0) + pow(offset.y, 2.0)) / sqrt(pow(size.x/2, 2.0) + pow(size.y/2, 2.0));
  float anim = 1 - sheetAnim;

  offset = (pos - vec2(size.x*anim, size.y*anim));
  dist = sqrt(pow(offset.x, 2.0) + pow(offset.y, 2.0)) / sqrt(pow(size.x/2, 2.0) + pow(size.x/2, 2.0)) - pow(sheetAnim,1.3);
  float mixVal = max(0.0,dist);
  vec4 colorA = vec4(0.345, 0.769, 0.863, 1.0) + vec4(1.0, normalized.x, normalized.y,1.0) / 6.0;
  vec4 colorB = vec4(0.031, 0.494, 0.643, 1.0);

  vec4 color = mix(colorA, colorB, mixVal);
  return vec4(color);
}`) : null;

export default function VisitDetail() {
  const params = useLocalSearchParams();
  const visitId = params.visitId as string | undefined;
  const visits = useVisitStore((state) => state.visits);
  const setVisits = useVisitStore((state) => state.setVisits);
  const updateVisit = useVisitStore((state) => state.updateVisit);
  const { width, height } = useWindowDimensions();
  const drawerHeight = height;
  const highlightColor = useThemeColor(theme.color.reactBlue);
  const isDarkMode = useColorScheme() === "dark";

  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Initialize visits if store is empty (happens on direct navigation)
  React.useEffect(() => {
    if (visits.length === 0) {
      const today = new Date();
      const mockData = generateMockVisits(subDays(today, 30), addDays(today, 60));
      setVisits(mockData);
    }
  }, [visits.length, setVisits]);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const overscrollAmount = useSharedValue(0);
  const sheetAnim = useSharedValue(0);
  const hasTriggeredHaptic = useSharedValue(false);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event;
    const scrollPastBottom = Math.max(
      0,
      contentOffset.y + layoutMeasurement.height - contentSize.height - 20
    );
    overscrollAmount.value = scrollPastBottom;
  });

  useAnimatedReaction(
    () => overscrollAmount.value,
    (amount) => {
      if (amount > 0 && !hasTriggeredHaptic.value) {
        hasTriggeredHaptic.value = true;
        scheduleOnRN(triggerHaptic);
      } else if (amount === 0) {
        hasTriggeredHaptic.value = false;
      }

      const normalizedAmount = Math.min(amount / 100, 1);
      sheetAnim.value = withTiming(normalizedAmount, {
        duration: 600,
        easing: Easing.out(Easing.quad),
      });
    },
    []
  );

  const uniforms = useDerivedValue(
    () => ({
      sheetAnim: sheetAnim.value,
      size: vec(width, drawerHeight),
    }),
    [sheetAnim]
  );

  const opacityStyle = useAnimatedStyle(() => ({
    opacity: sheetAnim.value * 0.4,
  }));

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

      <ThemedView
        style={styles.container}
        color={
          isLiquidGlassAvailable()
            ? theme.color.transparent
            : theme.color.background
        }
      >
        {isLiquidGlassAvailable() && osName !== "iPadOS" && source ? (
          <View style={[styles.absolute, { height: drawerHeight }]}>
            <Animated.View style={[opacityStyle, styles.absolute]}>
              <Canvas
                style={{
                  width: width,
                  height: drawerHeight,
                  transform: [{ scale: 2 }],
                }}
              >
                <Fill>
                  <Shader source={source} uniforms={uniforms} />
                </Fill>
              </Canvas>
            </Animated.View>
          </View>
        ) : null}
        <AnimatedScrollView
          onScroll={scrollHandler}
          style={styles.container}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: insets.bottom + theme.space24,
            paddingTop: Platform.select({
              ios: theme.space16,
              default: theme.space16,
            }),
          }}
        >
          {/* Header with care recipient info */}
          <View style={styles.header} collapsable={false}>
            {/* Status Badge */}
            <View style={[styles.statusBadgeLarge, { backgroundColor: `${statusColor}20` }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <ThemedText
                fontSize={theme.fontSize14}
                fontWeight="semiBold"
                color={{ light: statusColor, dark: statusColor }}
              >
                {visitStatusLabels[visit.status]}
              </ThemedText>
            </View>

            {/* Care Recipient */}
            <View style={styles.careRecipientHeader}>
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
              <ThemedText
                fontWeight="bold"
                fontSize={theme.fontSize28}
                style={styles.recipientName}
              >
                {visit.careRecipient.fullName}
              </ThemedText>
            </View>
          </View>

          <ThemedView
            color={
              isLiquidGlassAvailable()
                ? theme.color.transparent
                : theme.color.background
            }
            style={styles.content}
          >
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
          </ThemedView>
        </AnimatedScrollView>
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
          style={task.completed && styles.taskCompleted}
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
      <ThemedText fontSize={theme.fontSize18} fontWeight="semiBold">
        {title}
      </ThemedText>
      <ThemedText
        fontSize={theme.fontSize16}
        fontWeight="medium"
        color={theme.color.textSecondary}
      >
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  absolute: {
    position: "absolute",
  },
  actionButtons: {
    gap: theme.space12,
    marginTop: theme.space16,
  },
  avatarLarge: {
    borderRadius: theme.borderRadius40,
    height: 80,
    width: 80,
  },
  avatarPlaceholder: {
    alignItems: "center",
    backgroundColor: "#087EA4",
    justifyContent: "center",
  },
  careRecipientHeader: {
    alignItems: "center",
    gap: theme.space12,
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
  content: {
    gap: theme.space8,
    paddingHorizontal: theme.space24,
    paddingTop: theme.space16,
  },
  header: {
    alignItems: "center",
    gap: theme.space16,
    paddingHorizontal: theme.space24,
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
    marginBottom: theme.space16,
  },
  recipientName: {
    textAlign: "center",
  },
  sectionContainer: {
    gap: theme.space4,
    marginBottom: theme.space24,
  },
  statusBadgeLarge: {
    alignItems: "center",
    borderRadius: theme.borderRadius10,
    flexDirection: "row",
    gap: theme.space8,
    paddingHorizontal: theme.space16,
    paddingVertical: theme.space8,
  },
  statusDot: {
    borderRadius: 6,
    height: 12,
    width: 12,
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
    marginBottom: theme.space24,
  },
  tasksList: {
    gap: theme.space4,
  },
});
