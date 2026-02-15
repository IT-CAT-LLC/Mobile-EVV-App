import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Language = "en" | "es" | "pt";

export const languageLabels: Record<Language, string> = {
  en: "English",
  es: "Español",
  pt: "Português",
};

export const languageOptions: Language[] = ["en", "es", "pt"];

type LanguageState = {
  language: Language;
  setLanguage: (language: Language) => void;
};

export const useLanguageStore = create(
  persist<LanguageState>(
    (set) => ({
      language: "en",
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "language-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
