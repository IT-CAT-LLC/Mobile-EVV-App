import { StyleSheet, View, useColorScheme, Linking } from "react-native";
import { useMemo } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { ThemedText, ThemedView, useThemeColor } from "./Themed";
import { theme } from "@/theme";
import {
  CareTeamMember,
  careTeamRoleLabels,
  careTeamRoleColors,
  careTeamRoleIcons,
} from "@/store/careTeamStore";

type Props = {
  member: CareTeamMember;
  onPress?: (member: CareTeamMember) => void;
};

export function CareTeamCard({ member, onPress }: Props) {
  const isDarkMode = useColorScheme() === "dark";
  const roleColor = isDarkMode
    ? careTeamRoleColors[member.role].dark
    : careTeamRoleColors[member.role].light;

  const gestureTap = useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(10)
        .runOnJS(true)
        .onEnd(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress?.(member);
        }),
    [onPress, member]
  );

  const handleCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`tel:${member.phoneNumber}`);
  };

  const handleEmail = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`mailto:${member.email}`);
  };

  const initials = `${member.firstName[0]}${member.lastName[0]}`;
  const iconName = careTeamRoleIcons[member.role] as keyof typeof MaterialCommunityIcons.glyphMap;

  // Role-specific subtitle
  const subtitle = (() => {
    switch (member.role) {
      case "nurse":
        return member.specialty;
      case "case_manager":
        return member.organization;
      case "caregiver":
        return member.certifications?.join(" • ");
      case "care_recipient":
        return member.address;
      default:
        return undefined;
    }
  })();

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut}>
      <GestureDetector gesture={gestureTap}>
        <ThemedView
          color={theme.color.backgroundSecondary}
          style={styles.container}
        >
          {/* Role indicator bar */}
          <View style={[styles.roleBar, { backgroundColor: roleColor }]} />

          <View style={styles.content}>
            {/* Header: Avatar + Info */}
            <View style={styles.header}>
              {member.profilePicture ? (
                <Image
                  source={{ uri: member.profilePicture }}
                  style={styles.avatar}
                  transition={300}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: roleColor }]}>
                  <ThemedText
                    fontSize={theme.fontSize18}
                    fontWeight="bold"
                    color={{ light: "#FFFFFF", dark: "#FFFFFF" }}
                  >
                    {initials}
                  </ThemedText>
                </View>
              )}

              <View style={styles.info}>
                <ThemedText
                  fontSize={theme.fontSize18}
                  fontWeight="semiBold"
                  numberOfLines={1}
                >
                  {member.fullName}
                </ThemedText>

                {/* Role badge */}
                <View style={[styles.roleBadge, { backgroundColor: `${roleColor}20` }]}>
                  <MaterialCommunityIcons
                    name={iconName}
                    size={14}
                    color={roleColor}
                  />
                  <ThemedText
                    fontSize={theme.fontSize12}
                    fontWeight="medium"
                    color={{ light: roleColor, dark: roleColor }}
                  >
                    {careTeamRoleLabels[member.role]}
                  </ThemedText>
                </View>

                {subtitle && (
                  <ThemedText
                    fontSize={theme.fontSize14}
                    fontWeight="medium"
                    color={theme.color.textSecondary}
                    numberOfLines={1}
                  >
                    {subtitle}
                  </ThemedText>
                )}
              </View>
            </View>

            {/* Contact buttons */}
            <View style={styles.contactButtons}>
              <GestureDetector
                gesture={Gesture.Tap().runOnJS(true).onEnd(handleCall)}
              >
                <View style={styles.contactButton}>
                  <MaterialCommunityIcons
                    name="phone"
                    size={20}
                    color={roleColor}
                  />
                  <ThemedText
                    fontSize={theme.fontSize12}
                    fontWeight="medium"
                    color={{ light: roleColor, dark: roleColor }}
                  >
                    Call
                  </ThemedText>
                </View>
              </GestureDetector>

              <GestureDetector
                gesture={Gesture.Tap().runOnJS(true).onEnd(handleEmail)}
              >
                <View style={styles.contactButton}>
                  <MaterialCommunityIcons
                    name="email"
                    size={20}
                    color={roleColor}
                  />
                  <ThemedText
                    fontSize={theme.fontSize12}
                    fontWeight="medium"
                    color={{ light: roleColor, dark: roleColor }}
                  >
                    Email
                  </ThemedText>
                </View>
              </GestureDetector>
            </View>
          </View>
        </ThemedView>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: theme.borderRadius20,
    height: 56,
    width: 56,
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  contactButton: {
    alignItems: "center",
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    borderRadius: theme.borderRadius10,
    flex: 1,
    flexDirection: "row",
    gap: theme.space8,
    justifyContent: "center",
    paddingVertical: theme.space12,
  },
  contactButtons: {
    flexDirection: "row",
    gap: theme.space12,
    marginTop: theme.space12,
  },
  container: {
    borderRadius: theme.borderRadius12,
    flexDirection: "row",
    marginBottom: theme.space16,
    marginHorizontal: theme.space16,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    padding: theme.space16,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.space12,
  },
  info: {
    flex: 1,
    gap: theme.space4,
  },
  roleBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: theme.borderRadius6,
    flexDirection: "row",
    gap: theme.space4,
    paddingHorizontal: theme.space8,
    paddingVertical: theme.space2,
  },
  roleBar: {
    width: 4,
  },
});
