import { ThemedText, useThemeColor } from "@/components/Themed";
import { LanguageSelector } from "@/components/LanguageSelector";
import { UserMenu } from "@/components/UserMenu";
import { theme } from "@/theme";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function Layout() {
  const tabBarBackgroundColor = useThemeColor(theme.color.background);

  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerLargeTitleShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Inbox",
          headerTitle: () =>
            Platform.OS === "android" ? (
              <ThemedText fontSize={theme.fontSize20} fontWeight="bold">
                Inbox
              </ThemedText>
            ) : undefined,
          headerLeft: () => <LanguageSelector />,
          headerRight: () => <UserMenu />,
          headerStyle: {
            backgroundColor: isLiquidGlassAvailable()
              ? "transparent"
              : tabBarBackgroundColor,
          },
        }}
      />
    </Stack>
  );
}
