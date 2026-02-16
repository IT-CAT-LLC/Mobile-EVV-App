import { useState, useRef, useEffect } from "react";
import { StyleSheet, View, Pressable, useColorScheme } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useUserStore } from "@/store/userStore";
import { ThemedText } from "@/components/Themed";
import { theme } from "@/theme";

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { userName, signOut } = useUserStore();
  const isDarkMode = useColorScheme() === "dark";
  const menuRef = useRef<View>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      setIsOpen(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  const handleSignOut = () => {
    setIsOpen(false);
    if (confirm("Are you sure you want to sign out?")) {
      signOut();
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={(e) => {
          e.stopPropagation?.();
          setIsOpen(!isOpen);
        }}
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

      {isOpen && (
        <View
          ref={menuRef}
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: theme.borderRadius6,
    cursor: "pointer",
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  container: {
    height: 34,
    position: "relative",
    width: 34,
  },
  divider: {
    height: 1,
    marginVertical: theme.space8,
  },
  menu: {
    borderRadius: theme.borderRadius12,
    borderWidth: 1,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
    minWidth: 200,
    padding: theme.space12,
    position: "absolute",
    right: 0,
    top: 40,
    zIndex: 1000,
  },
  menuItem: {
    alignItems: "center",
    borderRadius: theme.borderRadius6,
    cursor: "pointer",
    flexDirection: "row",
    gap: theme.space8,
    padding: theme.space8,
  },
  userInfo: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.space12,
    padding: theme.space8,
  },
});
