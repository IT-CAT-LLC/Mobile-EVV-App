import { StyleSheet, useColorScheme } from "react-native";
import {
  Button,
  ContextMenu,
  Host,
  HStack,
  Image,
  Text,
} from "@expo/ui/swift-ui";
import { buttonStyle, frame } from "@expo/ui/swift-ui/modifiers";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import * as Device from "expo-device";

import {
  useLanguageStore,
  languageLabels,
  languageOptions,
  Language,
} from "@/store/languageStore";
import { theme } from "@/theme";
import * as Haptics from "expo-haptics";

const isIpad = Device.osName === "iPadOS";

export function LanguageSelector() {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const isDarkMode = useColorScheme() === "dark";

  const handleSelect = (newLang: Language) => {
    if (language !== newLang) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setLanguage(newLang);
    }
  };

  return (
    <Host style={styles.container}>
      <ContextMenu
        modifiers={[
          buttonStyle(isLiquidGlassAvailable() ? "glass" : "bordered"),
        ]}
      >
        <ContextMenu.Items>
          {languageOptions.map((lang) => (
            <Button
              key={lang}
              onPress={() => handleSelect(lang)}
            >
              {language === lang ? `✓ ${languageLabels[lang]}` : languageLabels[lang]}
            </Button>
          ))}
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <HStack
            modifiers={[frame({ width: isIpad ? 70 : 60 })]}
            spacing={theme.space4}
          >
            <Text
              weight="semibold"
              size={theme.fontSize10}
              color={
                isLiquidGlassAvailable()
                  ? "primary"
                  : isDarkMode
                    ? "white"
                    : "black"
              }
            >
              {languageLabels[language].slice(0, 3).toUpperCase()}
            </Text>
            <Image
              systemName="chevron.down"
              size={theme.fontSize10}
              color={isLiquidGlassAvailable() ? "primary" : "gray"}
            />
          </HStack>
        </ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 34,
    width: 94,
  },
});
