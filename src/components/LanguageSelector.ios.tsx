import { StyleSheet } from "react-native";
import { useActionSheet } from "@expo/react-native-action-sheet";

import { ThemedPressable, ThemedText } from "./Themed";

import {
  useLanguageStore,
  languageLabels,
  languageOptions,
  Language,
} from "@/store/languageStore";
import { theme } from "@/theme";
import * as Haptics from "expo-haptics";

export function LanguageSelector() {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const { showActionSheetWithOptions } = useActionSheet();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const options = [...languageOptions.map((lang) => languageLabels[lang]), "Cancel"];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: "Select Language",
      },
      (selectedIndex) => {
        if (selectedIndex !== undefined && selectedIndex !== cancelButtonIndex) {
          const selectedLang = languageOptions[selectedIndex];
          if (selectedLang !== language) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setLanguage(selectedLang);
          }
        }
      },
    );
  };

  return (
    <ThemedPressable
      style={styles.container}
      onPress={handlePress}
      backgroundColor={theme.color.backgroundSecondary}
    >
      <ThemedText fontSize={theme.fontSize12} fontWeight="semiBold">
        {languageLabels[language].slice(0, 3).toUpperCase()}
      </ThemedText>
    </ThemedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-end",
    borderRadius: theme.borderRadius40,
    height: 32,
    justifyContent: "center",
    paddingHorizontal: theme.space16,
  },
});
