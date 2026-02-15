import React, { useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
} from "react-native";
import { ThemedText, ThemedView, useThemeColor } from "./Themed";
import { theme } from "@/theme";
import { format, addDays, subDays, isSameDay } from "date-fns";

interface DateStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  eventsPerDay?: Record<string, number>;
}

export function DateStrip({
  selectedDate,
  onSelectDate,
  eventsPerDay = {},
}: DateStripProps) {
  const tintColor = useThemeColor(theme.color.reactBlue);
  const backgroundSecondary = useThemeColor(theme.color.backgroundSecondary);

  const isToday = isSameDay(selectedDate, new Date());
  const dateKey = format(selectedDate, "yyyy-MM-dd");
  const eventCount = eventsPerDay[dateKey] || 0;

  const handlePrevDay = useCallback(() => {
    onSelectDate(subDays(selectedDate, 1));
  }, [selectedDate, onSelectDate]);

  const handleNextDay = useCallback(() => {
    onSelectDate(addDays(selectedDate, 1));
  }, [selectedDate, onSelectDate]);

  const handleToday = useCallback(() => {
    onSelectDate(new Date());
  }, [onSelectDate]);

  return (
    <ThemedView style={styles.container}>
      {/* Day Card - Similar to TalkCard/Bookmark style */}
      <ThemedView
        color={theme.color.backgroundSecondary}
        style={styles.dayCard}
      >
        {/* Navigation Row */}
        <View style={styles.navRow}>
          <Pressable
            onPress={handlePrevDay}
            style={[styles.navButton, { backgroundColor: backgroundSecondary }]}
          >
            <ThemedText fontSize={theme.fontSize20} fontWeight="bold">
              ‹
            </ThemedText>
          </Pressable>

          <Pressable onPress={handleToday} style={styles.dateCenter}>
            {isToday && (
              <View style={[styles.todayBadge, { backgroundColor: tintColor }]}>
                <ThemedText
                  fontSize={theme.fontSize10}
                  fontWeight="bold"
                  style={{ color: "#fff" }}
                >
                  TODAY
                </ThemedText>
              </View>
            )}
          </Pressable>

          <Pressable
            onPress={handleNextDay}
            style={[styles.navButton, { backgroundColor: backgroundSecondary }]}
          >
            <ThemedText fontSize={theme.fontSize20} fontWeight="bold">
              ›
            </ThemedText>
          </Pressable>
        </View>

        {/* Main Date Display */}
        <Pressable onPress={handleToday} style={styles.mainDateSection}>
          <ThemedText
            fontSize={theme.fontSize14}
            fontWeight="medium"
            color={theme.color.textSecondary}
            style={styles.dayOfWeek}
          >
            {format(selectedDate, "EEEE")}
          </ThemedText>

          <View style={styles.dateRow}>
            <ThemedText
              fontSize={48}
              fontWeight="bold"
              style={[isToday && { color: tintColor }]}
            >
              {format(selectedDate, "d")}
            </ThemedText>
            <View style={styles.monthYearColumn}>
              <ThemedText fontSize={theme.fontSize18} fontWeight="bold">
                {format(selectedDate, "MMMM")}
              </ThemedText>
              <ThemedText
                fontSize={theme.fontSize14}
                fontWeight="medium"
                color={theme.color.textSecondary}
              >
                {format(selectedDate, "yyyy")}
              </ThemedText>
            </View>
          </View>
        </Pressable>

        {/* Event Count / EVV Status Section */}
        <View style={styles.statusSection}>
          {eventCount > 0 ? (
            <ThemedText
              fontSize={theme.fontSize14}
              fontWeight="medium"
              color={theme.color.textSecondary}
            >
              {eventCount} {eventCount === 1 ? "session" : "sessions"} scheduled
            </ThemedText>
          ) : (
            <ThemedText
              fontSize={theme.fontSize14}
              fontWeight="medium"
              color={theme.color.textSecondary}
            >
              No sessions scheduled
            </ThemedText>
          )}
        </View>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.space8,
    paddingHorizontal: theme.space16,
  },
  dayCard: {
    borderRadius: theme.borderRadius32,
    padding: theme.space24,
    gap: theme.space16,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius12,
  },
  dateCenter: {
    flex: 1,
    alignItems: "center",
  },
  todayBadge: {
    paddingHorizontal: theme.space12,
    paddingVertical: theme.space4,
    borderRadius: theme.borderRadius12,
  },
  mainDateSection: {
    alignItems: "center",
    gap: theme.space8,
  },
  dayOfWeek: {
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space16,
  },
  monthYearColumn: {
    alignItems: "flex-start",
  },
  statusSection: {
    alignItems: "center",
    paddingTop: theme.space8,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.2)",
  },
});
