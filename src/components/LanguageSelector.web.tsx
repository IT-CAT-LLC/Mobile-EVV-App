import { StyleSheet, useColorScheme } from "react-native";

import { ThemedPressable, ThemedText, ThemedView } from "./Themed";

import {
  useLanguageStore,
  languageLabels,
  languageOptions,
  Language,
} from "@/store/languageStore";
import { theme } from "@/theme";
import { useState } from "react";

export function LanguageSelector() {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const [isOpen, setIsOpen] = useState(false);
  const colorScheme = useColorScheme() ?? "light";
  const dropdownBg = theme.color.backgroundSecondary[colorScheme];

  const handlePress = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <ThemedView style={styles.wrapper}>
      <ThemedPressable
        style={styles.container}
        onPress={handlePress}
        backgroundColor={theme.color.backgroundSecondary}
      >
        <ThemedText fontSize={theme.fontSize12} fontWeight="semiBold">
          {languageLabels[language].slice(0, 3).toUpperCase()} ▼
        </ThemedText>
      </ThemedPressable>
      {isOpen && (
        <ThemedView
          style={[styles.dropdown, { backgroundColor: dropdownBg }]}
        >
          {languageOptions.map((lang) => (
            <ThemedPressable
              key={lang}
              style={[
                styles.option,
                lang === language && styles.selectedOption,
              ]}
              onPress={() => handleSelect(lang)}
            >
              <ThemedText
                style={styles.optionText}
                fontSize={theme.fontSize14}
                fontWeight={lang === language ? "semiBold" : "medium"}
              >
                {languageLabels[lang]}
              </ThemedText>
            </ThemedPressable>
          ))}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    zIndex: 100,
  },
  container: {
    alignSelf: "flex-end",
    borderRadius: theme.borderRadius40,
    height: 32,
    justifyContent: "center",
    paddingHorizontal: theme.space16,
  },
  dropdown: {
    position: "absolute",
    top: 36,
    right: 0,
    borderRadius: theme.borderRadius10,
    overflow: "hidden",
    minWidth: 120,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.25)",
  },
  option: {
    paddingVertical: theme.space12,
    paddingHorizontal: theme.space16,
  },
  optionText: {
    fontFamily: theme.fontFamily,
  },
  selectedOption: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
});
