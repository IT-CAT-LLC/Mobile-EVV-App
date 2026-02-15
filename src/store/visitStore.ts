import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addDays, subDays, format, startOfDay } from "date-fns";

// Visit status enum
export type VisitStatus = 
  | "scheduled"
  | "in_progress" 
  | "completed"
  | "missed"
  | "cancelled";

export const visitStatusLabels: Record<VisitStatus, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  missed: "Missed",
  cancelled: "Cancelled",
};

export const visitStatusColors: Record<VisitStatus, { light: string; dark: string }> = {
  scheduled: { light: "#087EA4", dark: "#58C4DC" }, // React blue
  in_progress: { light: "#F59E0B", dark: "#FBBF24" }, // Amber
  completed: { light: "#10B981", dark: "#34D399" }, // Emerald
  missed: { light: "#EF4444", dark: "#F87171" }, // Red
  cancelled: { light: "#6B7280", dark: "#9CA3AF" }, // Gray
};

// Care recipient type
export type CareRecipient = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  profilePicture: string | null;
};

// Task type
export type VisitTask = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
};

// Visit type
export type Visit = {
  id: string;
  careRecipient: CareRecipient;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    formatted: string;
  };
  scheduledDate: string; // ISO date string
  scheduledStartTime: string; // ISO datetime string
  scheduledEndTime: string; // ISO datetime string
  scheduledDuration: number; // minutes
  actualClockIn: string | null; // ISO datetime string
  actualClockOut: string | null; // ISO datetime string
  status: VisitStatus;
  tasks: VisitTask[];
  notes: string | null;
};

// Store state type
type VisitStoreState = {
  visits: Visit[];
  loadedDateRange: {
    start: string; // ISO date
    end: string; // ISO date
  };
  setVisits: (visits: Visit[]) => void;
  addVisits: (visits: Visit[]) => void;
  updateVisit: (visitId: string, updates: Partial<Visit>) => void;
  getVisitsForDate: (date: string) => Visit[];
  loadMorePast: () => void;
  loadMoreFuture: () => void;
};

// Initial date range (7 days past, 14 days future)
const getInitialDateRange = () => {
  const today = new Date();
  return {
    start: format(subDays(today, 7), "yyyy-MM-dd"),
    end: format(addDays(today, 14), "yyyy-MM-dd"),
  };
};

export const useVisitStore = create<VisitStoreState>()(
  persist(
    (set, get) => ({
      visits: [],
      loadedDateRange: getInitialDateRange(),
      
      setVisits: (visits) => set({ visits }),
      
      addVisits: (newVisits) => set((state) => ({
        visits: [...state.visits, ...newVisits.filter(
          (v) => !state.visits.some((existing) => existing.id === v.id)
        )],
      })),
      
      updateVisit: (visitId, updates) => set((state) => ({
        visits: state.visits.map((visit) =>
          visit.id === visitId ? { ...visit, ...updates } : visit
        ),
      })),
      
      getVisitsForDate: (date) => {
        const state = get();
        const targetDate = startOfDay(new Date(date)).toISOString().split("T")[0];
        return state.visits.filter((visit) => {
          const visitDate = visit.scheduledDate.split("T")[0];
          return visitDate === targetDate;
        });
      },
      
      loadMorePast: () => set((state) => ({
        loadedDateRange: {
          ...state.loadedDateRange,
          start: format(subDays(new Date(state.loadedDateRange.start), 7), "yyyy-MM-dd"),
        },
      })),
      
      loadMoreFuture: () => set((state) => ({
        loadedDateRange: {
          ...state.loadedDateRange,
          end: format(addDays(new Date(state.loadedDateRange.end), 7), "yyyy-MM-dd"),
        },
      })),
    }),
    {
      name: "visit-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
