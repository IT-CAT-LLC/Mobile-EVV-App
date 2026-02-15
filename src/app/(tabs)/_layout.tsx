import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import { Tabs } from "expo-router";
import React from "react";
import {
  ColorValue,
  ImageSourcePropType,
  Platform,
  // eslint-disable-next-line react-native/split-platform-components
  DynamicColorIOS,
} from "react-native";

import { theme } from "@/theme";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { useThemeColor } from "@/components/Themed";

// Web-specific tab layout using standard Tabs component
function WebTabLayout() {
  const tintColor = useThemeColor(theme.color.reactBlue);
  const inactiveTintColor = useThemeColor({
    light: "#00000090",
    dark: "#FFFFFF90",
  });
  const backgroundColor = useThemeColor(theme.color.background);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        tabBarInactiveTintColor: inactiveTintColor,
        tabBarStyle: {
          backgroundColor,
          borderTopColor: inactiveTintColor + "30",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="(calendar)"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="calendar-blank"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: "Stipend",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="speakers"
        options={{
          title: "Care Team",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-group"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="info"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="bell-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

// Todo (betomoedano): In the future we can remove this type. Learn more: https://exponent-internal.slack.com/archives/C0447EFTS74/p1758042759724779?thread_ts=1758039375.241799&cid=C0447EFTS74
type VectorIconFamily = {
  getImageSource: (
    name: string,
    size: number,
    color: ColorValue,
  ) => Promise<ImageSourcePropType>;
};

// Native tab layout using NativeTabs component (iOS/Android only)
function NativeTabLayout() {
  const tintColor = useThemeColor(theme.color.reactBlue);
  const inactiveTintColor = useThemeColor({
    light: "#00000090",
    dark: "#FFFFFF90",
  });

  const labelSelectedStyle =
    Platform.OS === "ios" ? { color: tintColor } : undefined;

  return (
    <NativeTabs
      badgeBackgroundColor={tintColor}
      labelStyle={{
        color:
          Platform.OS === "ios" && isLiquidGlassAvailable()
            ? DynamicColorIOS({
                light: theme.colorBlack,
                dark: theme.colorWhite,
              })
            : inactiveTintColor,
      }}
      iconColor={
        Platform.OS === "ios" && isLiquidGlassAvailable()
          ? DynamicColorIOS({
              light: theme.colorBlack,
              dark: theme.colorWhite,
            })
          : inactiveTintColor
      }
      tintColor={
        Platform.OS === "ios"
          ? DynamicColorIOS(theme.color.reactBlue)
          : inactiveTintColor
      }
      labelVisibilityMode="labeled"
      indicatorColor={tintColor + "25"}
      disableTransparentOnScrollEdge={true} // Used to prevent transparent background on iOS 18 and older
    >
      <NativeTabs.Trigger name="(calendar)">
        {Platform.select({
          ios: <Icon sf="calendar" />,
          android: (
            <Icon
              src={
                <VectorIcon
                  family={MaterialCommunityIcons as VectorIconFamily}
                  name="calendar-blank"
                />
              }
              selectedColor={tintColor}
            />
          ),
        })}
        <Label selectedStyle={labelSelectedStyle}>Calendar</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="bookmarks">
        {Platform.select({
          ios: <Icon sf="creditcard" selectedColor={tintColor} />,
          android: (
            <Icon
              src={
                <VectorIcon
                  family={MaterialCommunityIcons as VectorIconFamily}
                  name="wallet-outline"
                />
              }
              selectedColor={tintColor}
            />
          ),
        })}
        <Label selectedStyle={labelSelectedStyle}>Stipend</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="speakers"
        role={isLiquidGlassAvailable() ? "search" : undefined}
      >
        {Platform.select({
          ios: <Icon sf="person.3" />,
          android: (
            <Icon
              src={
                <VectorIcon
                  family={MaterialCommunityIcons as VectorIconFamily}
                  name="account-group"
                />
              }
              selectedColor={tintColor}
            />
          ),
        })}
        <Label selectedStyle={labelSelectedStyle}>Care Team</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="info">
        {Platform.select({
          ios: <Icon sf="bell" selectedColor={tintColor} />,
          android: (
            <Icon
              src={
                <VectorIcon
                  family={MaterialCommunityIcons as VectorIconFamily}
                  name="bell-outline"
                />
              }
              selectedColor={tintColor}
            />
          ),
        })}
        <Label selectedStyle={labelSelectedStyle}>Inbox</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

// Export the appropriate layout based on platform
export default function TabLayout() {
  if (Platform.OS === "web") {
    return <WebTabLayout />;
  }
  return <NativeTabLayout />;
}
