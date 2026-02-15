import { useScrollToTop } from "@react-navigation/native";
import { Stack, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Platform, RefreshControl, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { format, parseISO, isSameDay, startOfDay } from "date-fns";

import { ActivityCard } from "@/components/ActivityCard";
import { NotFound } from "@/components/NotFound";
import { TalkCard } from "@/components/TalkCard";
import { CalendarView, ConferenceDay } from "@/consts";
import { useReactConfStore } from "@/store/reactConfStore";
import { useCalendarStore } from "@/store/calendarStore";
import { CalendarViewPicker } from "@/components/CalendarViewPicker";
import { DateStrip } from "@/components/DateStrip";
import { MonthCalendar } from "@/components/MonthCalendar";
import { useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
import { Session } from "@/types";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CurrentlyLive,
  type CurrentlyLiveSession,
} from "@/components/CurrentlyLive";

const AnimatedFlatList = Animated.FlatList;

const HEADER_SCROLL_OFFSET = isLiquidGlassAvailable() ? 110 : 90;

export default function Schedule() {
  const scrollRef = useRef<FlatList>(null);
  useScrollToTop(scrollRef as any);
  const backgroundColor = useThemeColor(theme.color.background);
  const isLiquidGlass = isLiquidGlassAvailable();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const insets = useSafeAreaInsets();
  const animatedTranslateY = useSharedValue(0);
  const isScrolledDown = useSharedValue(false);

  // Calendar store state
  const selectedDate = useCalendarStore((state) => state.selectedDate);
  const calendarView = useCalendarStore((state) => state.calendarView);
  const setSelectedDate = useCalendarStore((state) => state.setSelectedDate);
  const setCalendarView = useCalendarStore((state) => state.setCalendarView);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    animatedTranslateY.value = interpolate(
      event.contentOffset.y,
      [-HEADER_SCROLL_OFFSET, 0],
      [0, HEADER_SCROLL_OFFSET],
      Extrapolation.CLAMP,
    );

    isScrolledDown.value = event.contentOffset.y > 10;
  });

  const stickyHeaderStyle = useAnimatedStyle(() => {
    if (Platform.OS !== "ios") {
      return {};
    }

    return {
      transform: [{ translateY: animatedTranslateY.value }],
      backgroundColor: isLiquidGlass ? "transparent" : backgroundColor,
    };
  });

  const { dayOne, dayTwo } = useReactConfStore((state) => state.schedule);
  const refreshSchedule = useReactConfStore((state) => state.refreshData);

  // Combine all sessions for filtering by date
  const allSessions = useMemo(
    () => [...dayOne, ...dayTwo],
    [dayOne, dayTwo],
  );

  // Calculate events per day for DateStrip and MonthCalendar
  const eventsPerDay = useMemo(() => {
    const counts: Record<string, number> = {};
    allSessions.forEach((session) => {
      if (session.startsAt) {
        const dateKey = format(parseISO(session.startsAt), "yyyy-MM-dd");
        counts[dateKey] = (counts[dateKey] || 0) + 1;
      }
    });
    return counts;
  }, [allSessions]);

  // Filter sessions by selected date
  const data = useMemo(() => {
    const selectedDateObj = parseISO(selectedDate);
    return allSessions.filter((session) => {
      if (!session.startsAt) return false;
      const sessionDate = startOfDay(parseISO(session.startsAt));
      return isSameDay(sessionDate, selectedDateObj);
    });
  }, [allSessions, selectedDate]);

  // Determine which ConferenceDay the selected date corresponds to (for TalkCard)
  const selectedConferenceDay = useMemo(() => {
    if (dayOne.length > 0 && dayOne[0].startsAt) {
      const dayOneDate = format(parseISO(dayOne[0].startsAt), "yyyy-MM-dd");
      if (selectedDate === dayOneDate) return ConferenceDay.One;
    }
    return ConferenceDay.Two;
  }, [dayOne, selectedDate]);

  const renderItem = useCallback(
    ({ item }: { item: Session }) => {
      if (item.isServiceSession) {
        return <ActivityCard session={item} />;
      } else {
        return <TalkCard key={item.id} session={item} day={selectedConferenceDay} />;
      }
    },
    [selectedConferenceDay],
  );

  useFocusEffect(() => {
    refreshSchedule({ ttlMs: 60_000 });
  });

  const handleSelectDate = useCallback(
    (date: Date) => {
      setSelectedDate(format(date, "yyyy-MM-dd"));
      if (isScrolledDown.value) {
        scrollRef.current?.scrollToOffset({
          offset: -30 - insets.top,
          animated: true,
        });
      }
    },
    [insets.top, isScrolledDown, setSelectedDate],
  );

  const handleViewChange = useCallback(
    (view: CalendarView) => {
      setCalendarView(view);
    },
    [setCalendarView],
  );

  const handleChangeMonth = useCallback(
    (date: Date) => {
      setCurrentMonth(date);
    },
    [],
  );

  const renderStickyHeader = useMemo(
    () => (
      <Animated.View style={stickyHeaderStyle}>
        <CalendarViewPicker
          selectedView={calendarView}
          onSelectView={handleViewChange}
        />
        {calendarView === CalendarView.Day && (
          <DateStrip
            selectedDate={parseISO(selectedDate)}
            onSelectDate={handleSelectDate}
            eventsPerDay={eventsPerDay}
          />
        )}
        {calendarView === CalendarView.Month && (
          <MonthCalendar
            selectedDate={parseISO(selectedDate)}
            onSelectDate={handleSelectDate}
            currentMonth={currentMonth}
            onChangeMonth={handleChangeMonth}
            eventsPerDay={eventsPerDay}
          />
        )}
      </Animated.View>
    ),
    [handleViewChange, handleSelectDate, handleChangeMonth, calendarView, selectedDate, currentMonth, stickyHeaderStyle, eventsPerDay],
  );

  if (!dayOne.length || !dayTwo.length) {
    return <NotFound message="Schedule unavailable" />;
  }

  const handleRefreshSchedule = async () => {
    setIsRefreshing(true);
    await Promise.all([
      new Promise((resolve) => setTimeout(resolve, 1000)),
      refreshSchedule(),
    ]);
    setIsRefreshing(false);
  };

  const handleScrollToSession = (currentlyLive: CurrentlyLiveSession) => {
    // Get the date of the session from the day
    const sessionsForDay = currentlyLive.day === ConferenceDay.One ? dayOne : dayTwo;
    if (sessionsForDay.length > 0 && sessionsForDay[0].startsAt) {
      const dateStr = format(parseISO(sessionsForDay[0].startsAt), "yyyy-MM-dd");
      setSelectedDate(dateStr);
    }
    setTimeout(() => {
      scrollRef.current?.scrollToIndex({
        index: currentlyLive.sessionIndex,
        animated: true,
        viewOffset: Platform.select({
          android: 50,
          default: isLiquidGlass
            ? isScrolledDown.value
              ? 155
              : 87
            : isScrolledDown.value
              ? 125
              : 120,
        }),
      });
    }, 200);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <CurrentlyLive scrollToSession={handleScrollToSession} />
          ),
        }}
      />
      <AnimatedFlatList
        ref={scrollRef}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefreshSchedule}
          />
        }
        style={{ backgroundColor }}
        contentContainerStyle={{
          paddingBottom: Platform.select({
            android: 100 + insets.bottom,
            default: 0,
          }),
        }}
        contentInsetAdjustmentBehavior="automatic"
        scrollToOverflowEnabled
        onScroll={scrollHandler}
        data={data}
        ListHeaderComponent={renderStickyHeader}
        stickyHeaderIndices={[0]}
        keyExtractor={(item: Session) => item.id}
        renderItem={renderItem}
      />
    </>
  );
}
