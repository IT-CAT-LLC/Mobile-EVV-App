import { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Modal,
  useColorScheme,
  Alert,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useUserStore } from "@/store/userStore";
import { ThemedText } from "@/components/Themed";
import { theme } from "@/theme";

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { userName, signOut } = useUserStore();
  const isDarkMode = useColorScheme() === "dark";

  const handleSignOut = () => {
    setIsOpen(false);
    if (Platform.OS === "web") {
      if (confirm("Are you sure you want to sign out?")) {
        signOut();
      }
    } else {
      Alert.alert(
        "Sign Out",
        "Are you sure you want to sign out?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Sign Out",
            style: "destructive",
            onPress: () => signOut(),
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setIsOpen(true)}
        style={[
          styles.button,
          {
            backgroundColor: isDarkMode ? "#2C2C2E" : "#F2F2F7",
          },
        ]}
      >
        <MaterialCommunityIcons
          name="account-circle"
          size={24}
          color={isDarkMode ? "#FFFFFF" : "#666666"}
        />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <View
            style={[
              styles.menu,
              {
                backgroundColor: isDarkMode ? "#2C2C2E" : "#FFFFFF",
                borderColor: isDarkMode ? "#38383A" : "#E5E5EA",
              },
            ]}
          >
            <View style={styles.userInfo}>
              <MaterialCommunityIcons
                name="account-circle"
                size={40}
                color={isDarkMode ? "#58C4DC" : "#087EA4"}
              />
              <ThemedText fontSize={theme.fontSize16} fontWeight="semiBold">
                {userName}
              </ThemedText>
            </View>

            <View style={[styles.divider, { backgroundColor: isDarkMode ? "#38383A" : "#E5E5EA" }]} />

            <Pressable
              onPress={handleSignOut}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { backgroundColor: isDarkMode ? "#1C1C1E" : "#F2F2F7" },
              ]}
            >
              <MaterialCommunityIcons
                name="logout"
                size={20}
                color="#EF4444"
              />
              <ThemedText fontSize={theme.fontSize14} style={{ color: "#EF4444" }}>
                Sign Out
              </ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: theme.borderRadius6,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  container: {
    height: 34,
    width: 34,
  },
  divider: {
    height: 1,
    marginVertical: theme.space8,
  },
  menu: {
    borderRadius: theme.borderRadius12,
    borderWidth: 1,
    marginTop: 60,
    minWidth: 200,
    padding: theme.space12,
    position: "absolute",
    right: theme.space16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
    }),
  },
  menuItem: {
    alignItems: "center",
    borderRadius: theme.borderRadius6,
    flexDirection: "row",
    gap: theme.space8,
    padding: theme.space8,
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    flex: 1,
  },
  userInfo: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.space12,
    padding: theme.space8,
  },
});
