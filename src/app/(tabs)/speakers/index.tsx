import React, { useCallback, useMemo } from "react";
import {
  Keyboard,
  Platform,
  SectionList,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { ThemedText, ThemedView, useThemeColor } from "@/components/Themed";
import { CareTeamCard } from "@/components/CareTeamCard";
import {
  useCareTeamStore,
  CareTeamMember,
  CareTeamRole,
  careTeamRoleLabels,
  careTeamRoleColors,
} from "@/store/careTeamStore";
import { theme } from "@/theme";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

type SectionData = {
  title: string;
  role: CareTeamRole;
  data: CareTeamMember[];
};

const ROLE_ORDER: CareTeamRole[] = ["care_recipient", "caregiver", "nurse", "case_manager"];

export default function CareTeam() {
  const careTeam = useCareTeamStore((state) => state.careTeam);
  const { height } = useWindowDimensions();
  const { bottom, top } = useSafeAreaInsets();
  const backgroundColor = useThemeColor(theme.color.background);
  const isDarkMode = backgroundColor === theme.color.background.dark;

  const params = useLocalSearchParams<{ q?: string }>();
  const searchText = params?.q?.toLowerCase() || "";

  // Filter and group by role
  const sections = useMemo(() => {
    const filtered = careTeam.filter((member) => {
      if (!searchText) return true;
      return (
        member.fullName.toLowerCase().includes(searchText) ||
        careTeamRoleLabels[member.role].toLowerCase().includes(searchText)
      );
    });

    const grouped: SectionData[] = ROLE_ORDER
      .map((role) => ({
        title: careTeamRoleLabels[role],
        role,
        data: filtered.filter((m) => m.role === role),
      }))
      .filter((section) => section.data.length > 0);

    return grouped;
  }, [careTeam, searchText]);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleMemberPress = useCallback((member: CareTeamMember) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Could navigate to member detail page in the future
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: CareTeamMember }) => {
      return <CareTeamCard member={item} onPress={handleMemberPress} />;
    },
    [handleMemberPress]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: SectionData }) => {
      const roleColor = isDarkMode
        ? careTeamRoleColors[section.role].dark
        : careTeamRoleColors[section.role].light;

      return (
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIndicator, { backgroundColor: roleColor }]} />
          <ThemedText
            fontSize={theme.fontSize16}
            fontWeight="bold"
            color={{ light: roleColor, dark: roleColor }}
          >
            {section.title}
          </ThemedText>
          <ThemedText
            fontSize={theme.fontSize14}
            fontWeight="medium"
            color={theme.color.textSecondary}
          >
            {section.data.length}
          </ThemedText>
        </View>
      );
    },
    [isDarkMode]
  );

  if (!careTeam.length) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText fontWeight="bold" fontSize={theme.fontSize20}>
          No care team members
        </ThemedText>
        <ThemedText
          fontSize={theme.fontSize16}
          color={theme.color.textSecondary}
        >
          Your care team will appear here
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <SectionList
      scrollToOverflowEnabled
      contentInsetAdjustmentBehavior="automatic"
      onScrollBeginDrag={dismissKeyboard}
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor }}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingBottom: Platform.select({ android: 100 + bottom, default: 0 }),
        },
        { minHeight: height - (bottom + top + 130) },
      ]}
      sections={sections}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={false}
      ListEmptyComponent={
        <Animated.View entering={FadeIn} exiting={FadeOut}>
          <ThemedView style={styles.noResultsContainer}>
            <ThemedText>
              No results found for{" "}
              <ThemedText fontWeight="bold">{searchText}</ThemedText>
            </ThemedText>
          </ThemedView>
        </Animated.View>
      }
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: theme.space16,
  },
  emptyContainer: {
    alignItems: "center",
    flex: 1,
    gap: theme.space8,
    justifyContent: "center",
    paddingHorizontal: theme.space24,
  },
  noResultsContainer: {
    padding: theme.space24,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.space8,
    marginBottom: theme.space12,
    marginTop: theme.space8,
    paddingHorizontal: theme.space16,
  },
  sectionIndicator: {
    borderRadius: 3,
    height: 18,
    width: 6,
  },
});
