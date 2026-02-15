import React, { useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  useColorScheme,
} from "react-native";
import { ThemedText, ThemedView, useThemeColor } from "./Themed";
import { theme } from "@/theme";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

interface MonthCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  currentMonth: Date;
  onChangeMonth: (date: Date) => void;
  eventsPerDay?: Record<string, number>;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthCalendar({
  selectedDate,
  onSelectDate,
  currentMonth,
  onChangeMonth,
  eventsPerDay = {},
}: MonthCalendarProps) {
  const colorScheme = useColorScheme() ?? "light";
  const tintColor = useThemeColor(theme.color.reactBlue);
  const textColor = useThemeColor(theme.color.text);
  const textSecondary = useThemeColor(theme.color.textSecondary);
  const backgroundColor = useThemeColor(theme.color.background);
  const backgroundSecondary = useThemeColor(theme.color.backgroundSecondary);

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows: Date[][] = [];
    let days: Date[] = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        days.push(day);
        day = addDays(day, 1);
      }
      rows.push(days);
      days = [];
    }

    return rows;
  }, [currentMonth]);

  const handlePrevMonth = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onChangeMonth(subMonths(currentMonth, 1));
  }, [currentMonth, onChangeMonth]);

  const handleNextMonth = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onChangeMonth(addMonths(currentMonth, 1));
  }, [currentMonth, onChangeMonth]);

  const handleDateSelect = useCallback(
    (date: Date) => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      onSelectDate(date);
    },
    [onSelectDate],
  );

  return (
    <ThemedView style={styles.container}>
      {/* Month Header */}
      <View style={styles.header}>
        <Pressable onPress={handlePrevMonth} style={styles.navButton}>
          <ThemedText fontSize={theme.fontSize20} fontWeight="semiBold">
            ‹
          </ThemedText>
        </Pressable>
        <ThemedText fontSize={theme.fontSize18} fontWeight="bold">
          {format(currentMonth, "MMMM yyyy")}
        </ThemedText>
        <Pressable onPress={handleNextMonth} style={styles.navButton}>
          <ThemedText fontSize={theme.fontSize20} fontWeight="semiBold">
            ›
          </ThemedText>
        </Pressable>
      </View>

      {/* Weekday Headers */}
      <View style={styles.weekdaysRow}>
        {WEEKDAYS.map((day) => (
          <View key={day} style={styles.weekdayCell}>
            <ThemedText
              fontSize={theme.fontSize12}
              fontWeight="semiBold"
              color={theme.color.textSecondary}
            >
              {day}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekRow}>
          {week.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const eventCount = eventsPerDay[dateKey] || 0;

            return (
              <Pressable
                key={dateKey}
                style={[
                  styles.dayCell,
                  isSelected && { backgroundColor: tintColor },
                  !isSelected && isToday && {
                    borderWidth: 2,
                    borderColor: tintColor,
                  },
                ]}
                onPress={() => handleDateSelect(day)}
              >
                <ThemedText
                  fontSize={theme.fontSize14}
                  fontWeight={isSelected || isToday ? "semiBold" : undefined}
                  style={[
                    !isCurrentMonth && { opacity: 0.3 },
                    isSelected && {
                      color: colorScheme === "dark" ? "#000" : "#fff",
                    },
                  ]}
                >
                  {format(day, "d")}
                </ThemedText>
                {eventCount > 0 && (
                  <View
                    style={[
                      styles.eventDot,
                      {
                        backgroundColor: isSelected
                          ? colorScheme === "dark"
                            ? "#000"
                            : "#fff"
                          : tintColor,
                      },
                    ]}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.space16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.space16,
    paddingHorizontal: theme.space8,
  },
  navButton: {
    padding: theme.space8,
    width: 44,
    alignItems: "center",
  },
  weekdaysRow: {
    flexDirection: "row",
    marginBottom: theme.space8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: theme.space4,
  },
  weekRow: {
    flexDirection: "row",
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius10,
    margin: 2,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: "absolute",
    bottom: 6,
  },
});
