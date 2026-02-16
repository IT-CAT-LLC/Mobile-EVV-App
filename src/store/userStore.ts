import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserState {
  userName: string;
  isSignedIn: boolean;
  setUserName: (name: string) => void;
  signIn: (name: string) => void;
  signOut: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userName: "Maria Garcia",
      isSignedIn: true,
      setUserName: (name) => set({ userName: name }),
      signIn: (name) => set({ userName: name, isSignedIn: true }),
      signOut: () => set({ userName: "", isSignedIn: false }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
