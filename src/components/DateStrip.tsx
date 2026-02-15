import React, { useRef, useCallback, useMemo, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  useColorScheme,
  FlatList,
  Dimensions,
} from "react-native";
import { ThemedText, useThemeColor } from "./Themed";
import { theme } from "@/theme";
import { format, addDays, subDays, isSameDay, startOfDay } from "date-fns";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

interface DateStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  eventsPerDay?: Record<string, number>;
}

const DAY_WIDTH = 60;
const VISIBLE_DAYS = 365; // Days to generate in each direction

export function DateStrip({
  selectedDate,
  onSelectDate,
  eventsPerDay = {},
}: DateStripProps) {
  const flatListRef = useRef<FlatList>(null);
  const colorScheme = useColorScheme() ?? "light";
  const tintColor = useThemeColor(theme.color.reactBlue);
  const backgroundColor = useThemeColor(theme.color.background);
  const backgroundSecondary = useThemeColor(theme.color.backgroundSecondary);

  // Generate array of dates centered around today
  const dates = useMemo(() => {
    const today = startOfDay(new Date());
    const result: Date[] = [];

    for (let i = -VISIBLE_DAYS; i <= VISIBLE_DAYS; i++) {
      result.push(addDays(today, i));
    }

    return result;
  }, []);

  // Find index of selected date
  const selectedIndex = useMemo(() => {
    return dates.findIndex((d) => isSameDay(d, selectedDate));
  }, [dates, selectedDate]);

  // Initial scroll to selected date
  useEffect(() => {
    if (selectedIndex >= 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: selectedIndex,
          animated: false,
          viewPosition: 0.5,
        });
      }, 100);
    }
  }, []);

  // Scroll to selected date when it changes
  useEffect(() => {
    if (selectedIndex >= 0 && flatListRef.current) {
      flatListRef.current?.scrollToIndex({
        index: selectedIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [selectedIndex]);

  const handleDateSelect = useCallback(
    (date: Date) => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onSelectDate(date);
    },
    [onSelectDate],
  );

  const renderItem = useCallback(
    ({ item: date }: { item: Date }) => {
      const dateKey = format(date, "yyyy-MM-dd");
      const isSelected = isSameDay(date, selectedDate);
      const isToday = isSameDay(date, new Date());
      const eventCount = eventsPerDay[dateKey] || 0;
      const dayName = format(date, "EEE");
      const dayNum = format(date, "d");

      return (
        <Pressable
          style={[
            styles.dayItem,
            isSelected && { backgroundColor: tintColor },
            !isSelected && { backgroundColor: backgroundSecondary },
          ]}
          onPress={() => handleDateSelect(date)}
        >
          <ThemedText
            fontSize={theme.fontSize10}
            fontWeight="semiBold"
            style={[
              styles.dayName,
              isSelected && {
                color: colorScheme === "dark" ? "#000" : "#fff",
              },
              isToday && !isSelected && { color: tintColor },
            ]}
          >
            {dayName}
          </ThemedText>
          <ThemedText
            fontSize={theme.fontSize18}
            fontWeight={isSelected || isToday ? "bold" : "semiBold"}
            style={[
              isSelected && {
                color: colorScheme === "dark" ? "#000" : "#fff",
              },
              isToday && !isSelected && { color: tintColor },
            ]}
          >
            {dayNum}
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
    },
    [
      selectedDate,
      eventsPerDay,
      tintColor,
      backgroundSecondary,
      colorScheme,
      handleDateSelect,
    ],
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: DAY_WIDTH + 8,
      offset: (DAY_WIDTH + 8) * index,
      index,
    }),
    [],
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <FlatList
        ref={flatListRef}
        data={dates}
        renderItem={renderItem}
        keyExtractor={(item) => format(item, "yyyy-MM-dd")}
        horizontal
        showsHorizontalScrollIndicator={false}
        getItemLayout={getItemLayout}
        initialScrollIndex={VISIBLE_DAYS}
        contentContainerStyle={styles.listContent}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: false,
              viewPosition: 0.5,
            });
          }, 100);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.space8,
  },
  listContent: {
    paddingHorizontal: theme.space16,
  },
  dayItem: {
    width: DAY_WIDTH,
    height: 70,
    marginHorizontal: 4,
    borderRadius: theme.borderRadius12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.space8,
  },
  dayName: {
    marginBottom: theme.space4,
    textTransform: "uppercase",
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: theme.space4,
  },
});
