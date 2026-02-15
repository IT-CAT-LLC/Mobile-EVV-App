import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View, useColorScheme, FlatList as RNFlatList } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { format, parseISO, addDays, subDays, isSameDay, startOfDay, isToday } from "date-fns";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText, ThemedView, useThemeColor } from "./Themed";
import { VisitCard } from "./VisitCard";
import { theme } from "@/theme";
import { useVisitStore, Visit } from "@/store/visitStore";
import { generateMockVisits } from "@/data/mockVisits";

type DayItem = {
  type: "day_header";
  date: string; // ISO date
  dateObj: Date;
};

type VisitItem = {
  type: "visit";
  visit: Visit;
};

type ListItem = DayItem | VisitItem;

type Props = {
  initialDate?: Date;
};

const INITIAL_DAYS_PAST = 30;
const INITIAL_DAYS_FUTURE = 60;
const LOAD_MORE_DAYS = 14;

export function DaySchedule({ initialDate = new Date() }: Props) {
  const router = useRouter();
  const isDarkMode = useColorScheme() === "dark";
  const backgroundColor = useThemeColor(theme.color.background);
  
  const { visits, setVisits, addVisits, loadedDateRange, loadMorePast, loadMoreFuture } = useVisitStore();
  
  const flatListRef = useRef<any>(null);
  const [dateRange, setDateRange] = useState(() => ({
    start: subDays(initialDate, INITIAL_DAYS_PAST),
    end: addDays(initialDate, INITIAL_DAYS_FUTURE),
  }));

  // Initialize with mock data on mount
  useEffect(() => {
    if (visits.length === 0) {
      const mockData = generateMockVisits(dateRange.start, dateRange.end);
      setVisits(mockData);
    }
  }, []);

  // Generate list items (day headers + visits)
  const listData = useMemo(() => {
    const items: ListItem[] = [];
    let currentDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    while (currentDate <= endDate) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      
      // Add day header
      items.push({
        type: "day_header",
        date: dateStr,
        dateObj: new Date(currentDate),
      });

      // Add visits for this day
      const dayVisits = visits
        .filter((visit) => visit.scheduledDate === dateStr)
        .sort((a, b) => 
          parseISO(a.scheduledStartTime).getTime() - parseISO(b.scheduledStartTime).getTime()
        );

      dayVisits.forEach((visit) => {
        items.push({
          type: "visit",
          visit,
        });
      });

      currentDate = addDays(currentDate, 1);
    }

    return items;
  }, [dateRange, visits]);

  // Find index of today for initial scroll
  const todayIndex = useMemo(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    return listData.findIndex(
      (item) => item.type === "day_header" && item.date === todayStr
    );
  }, [listData]);

  // Scroll to today on mount
  useEffect(() => {
    if (todayIndex > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: todayIndex,
          animated: false,
          viewPosition: 0,
        });
      }, 100);
    }
  }, [todayIndex]);

  // Handle scroll to index failures (required for web)
  const onScrollToIndexFailed = useCallback(
    (info: { index: number; highestMeasuredFrameIndex: number; averageItemLength: number }) => {
      const wait = new Promise((resolve) => setTimeout(resolve, 100));
      wait.then(() => {
        flatListRef.current?.scrollToIndex({
          index: info.index,
          animated: false,
        });
      });
    },
    []
  );

  const handleVisitPress = useCallback(
    (visit: Visit) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push({
        pathname: "/visit/[visitId]",
        params: { visitId: visit.id },
      });
    },
    [router]
  );

  const handleEndReached = useCallback(() => {
    // Load more future days
    const newEnd = addDays(dateRange.end, LOAD_MORE_DAYS);
    const newVisits = generateMockVisits(addDays(dateRange.end, 1), newEnd);
    addVisits(newVisits);
    setDateRange((prev) => ({ ...prev, end: newEnd }));
    loadMoreFuture();
  }, [dateRange.end, addVisits, loadMoreFuture]);

  const handleStartReached = useCallback(() => {
    // Load more past days
    const newStart = subDays(dateRange.start, LOAD_MORE_DAYS);
    const newVisits = generateMockVisits(newStart, subDays(dateRange.start, 1));
    addVisits(newVisits);
    setDateRange((prev) => ({ ...prev, start: newStart }));
    loadMorePast();
  }, [dateRange.start, addVisits, loadMorePast]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === "day_header") {
        const isTodayDate = isToday(item.dateObj);
        return (
          <DayHeader
            date={item.dateObj}
            isToday={isTodayDate}
            visitCount={
              visits.filter((v) => v.scheduledDate === item.date).length
            }
          />
        );
      }

      return <VisitCard visit={item.visit} onPress={handleVisitPress} />;
    },
    [handleVisitPress, visits]
  );

  const getItemType = useCallback((item: ListItem) => item.type, []);

  const keyExtractor = useCallback((item: ListItem) => {
    if (item.type === "day_header") {
      return `header-${item.date}`;
    }
    return `visit-${item.visit.id}`;
  }, []);

  return (
    <FlatList
      ref={flatListRef}
      data={listData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      onScrollToIndexFailed={onScrollToIndexFailed}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      initialNumToRender={20}
      maxToRenderPerBatch={10}
      windowSize={5}
      ListEmptyComponent={
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.empty}>
          <ThemedText fontWeight="bold" fontSize={theme.fontSize20}>
            No visits scheduled
          </ThemedText>
          <ThemedText
            fontSize={theme.fontSize16}
            color={theme.color.textSecondary}
          >
            Your scheduled visits will appear here
          </ThemedText>
        </Animated.View>
      }
    />
  );
}

function DayHeader({
  date,
  isToday,
  visitCount,
}: {
  date: Date;
  isToday: boolean;
  visitCount: number;
}) {
  const dayOfWeek = format(date, "EEEE");
  const dateFormatted = format(date, "MMMM d, yyyy");

  return (
    <Animated.View entering={FadeIn} style={styles.dayHeader}>
      <View style={styles.dayHeaderContent}>
        <View style={styles.dayHeaderTextContainer}>
          <ThemedText
            fontSize={theme.fontSize20}
            fontWeight="bold"
            color={isToday ? theme.color.reactBlue : undefined}
          >
            {isToday ? "Today" : dayOfWeek}
          </ThemedText>
          <ThemedText
            fontSize={theme.fontSize14}
            fontWeight="medium"
            color={theme.color.textSecondary}
          >
            {dateFormatted}
          </ThemedText>
        </View>
        {visitCount > 0 ? (
          <View style={styles.visitCountBadge}>
            <ThemedText
              fontSize={theme.fontSize12}
              fontWeight="semiBold"
              color={theme.color.reactBlue}
            >
              {visitCount} {visitCount === 1 ? "visit" : "visits"}
            </ThemedText>
          </View>
        ) : (
          <ThemedText
            fontSize={theme.fontSize12}
            fontWeight="medium"
            color={theme.color.textSecondary}
          >
            No visits
          </ThemedText>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dayHeader: {
    marginBottom: theme.space12,
    marginTop: theme.space24,
    paddingHorizontal: theme.space16,
  },
  dayHeaderContent: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayHeaderTextContainer: {
    gap: theme.space2,
  },
  empty: {
    alignItems: "center",
    flex: 1,
    gap: theme.space8,
    justifyContent: "center",
    paddingHorizontal: theme.space24,
    paddingTop: theme.space24,
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: theme.space8,
  },
  visitCountBadge: {
    backgroundColor: "rgba(8, 126, 164, 0.1)",
    borderRadius: theme.borderRadius6,
    paddingHorizontal: theme.space8,
    paddingVertical: theme.space4,
  },
});
