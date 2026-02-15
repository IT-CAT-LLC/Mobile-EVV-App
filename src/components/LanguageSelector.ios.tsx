import { StyleSheet, useColorScheme } from "react-native";
import {
  ContextMenu,
  Host,
  HStack,
  Image,
  Picker,
  Text,
} from "@expo/ui/swift-ui";
import { buttonStyle, frame } from "@expo/ui/swift-ui/modifiers";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import * as Device from "expo-device";

import {
  useLanguageStore,
  languageLabels,
  languageOptions,
} from "@/store/languageStore";
import { theme } from "@/theme";
import * as Haptics from "expo-haptics";

const isIpad = Device.osName === "iPadOS";
const options = languageOptions.map((lang) => languageLabels[lang]);

export function LanguageSelector() {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const isDarkMode = useColorScheme() === "dark";

  const selectedIndex = languageOptions.indexOf(language);

  const handleSelect = (newIndex: number) => {
    if (selectedIndex !== newIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setLanguage(languageOptions[newIndex]);
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
          <Picker
            selectedIndex={selectedIndex}
            options={options}
            onOptionSelected={({ nativeEvent: { index } }) =>
              handleSelect(index)
            }
          />
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
