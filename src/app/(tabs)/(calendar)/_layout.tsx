import { useThemeColor } from "@/components/Themed";
import { LanguageSelector } from "@/components/LanguageSelector";
import { UserMenu } from "@/components/UserMenu";
import { spaceScale, theme } from "@/theme";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import { Platform, StyleSheet, useColorScheme, View } from "react-native";

const lightImageSource = require("@/assets/images/conf.png");
const darkImageSource = require("@/assets/images/conf-dark.png");

export default function Layout() {
  const tabBarBackgroundColor = useThemeColor(theme.color.background);
  const isDarkMode = useColorScheme() === "dark";
  const imageSource = isDarkMode ? darkImageSource : lightImageSource;
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerLargeTitleShadowVisible: false,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: Platform.OS === "ios" ? "Calendar" : "",
          headerStyle: {
            backgroundColor: isLiquidGlassAvailable()
              ? "transparent"
              : tabBarBackgroundColor,
          },
          headerLeft: () => <Image source={imageSource} style={styles.image} />,
          headerRight: () => (
            <View style={styles.headerRight}>
              <LanguageSelector />
              <UserMenu />
            </View>
          ),
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.space8,
  },
  image: {
    height: spaceScale(20),
    width: spaceScale(72),
  },
});
