import { StyleSheet, useColorScheme, Alert } from "react-native";
import {
  Button,
  ContextMenu,
  Host,
  HStack,
  Image,
  Text,
  VStack,
} from "@expo/ui/swift-ui";
import { buttonStyle, frame } from "@expo/ui/swift-ui/modifiers";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import * as Device from "expo-device";
import * as Haptics from "expo-haptics";

import { useUserStore } from "@/store/userStore";
import { theme } from "@/theme";

const isIpad = Device.osName === "iPadOS";

export function UserMenu() {
  const { userName, signOut } = useUserStore();
  const isDarkMode = useColorScheme() === "dark";

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive",
          onPress: () => signOut()
        },
      ]
    );
  };

  return (
    <Host style={styles.container}>
      <ContextMenu
        modifiers={[
          buttonStyle(isLiquidGlassAvailable() ? "glass" : "bordered"),
        ]}
      >
        <ContextMenu.Items>
          <VStack>
            <Text weight="semibold" size={theme.fontSize14}>
              {userName}
            </Text>
          </VStack>
          <Button onPress={handleSignOut} role="destructive">
            Sign Out
          </Button>
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <HStack
            modifiers={[frame({ width: isIpad ? 40 : 34 })]}
            spacing={theme.space4}
          >
            <Image
              systemName="person.circle.fill"
              size={theme.fontSize20}
              color={
                isLiquidGlassAvailable()
                  ? "primary"
                  : isDarkMode
                    ? "white"
                    : "gray"
              }
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
    width: 40,
  },
});
