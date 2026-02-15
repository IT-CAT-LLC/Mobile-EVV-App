import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CalendarView } from "@/consts";

type CalendarState = {
  selectedDate: string; // ISO date string YYYY-MM-DD
  calendarView: CalendarView;
  setSelectedDate: (date: string) => void;
  setCalendarView: (view: CalendarView) => void;
};

const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

export const useCalendarStore = create(
  persist<CalendarState>(
    (set) => ({
      selectedDate: getTodayString(),
      calendarView: CalendarView.Day,
      setSelectedDate: (date) => set({ selectedDate: date }),
      setCalendarView: (view) => set({ calendarView: view }),
    }),
    {
      name: "calendar-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
