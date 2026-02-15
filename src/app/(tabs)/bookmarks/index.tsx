import React, { useCallback, useMemo } from "react";
import { Platform, StyleSheet, View, SectionList, useColorScheme } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { ThemedText, ThemedView, useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
import { PaymentCard } from "@/components/PaymentCard";
import { useStipendStore, Payment, formatCurrency } from "@/store/stipendStore";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PaymentSection = {
  title: string;
  data: Payment[];
};

export default function Stipend() {
  const isDarkMode = useColorScheme() === "dark";
  const payments = useStipendStore((state) => state.payments);
  const balance = useStipendStore((state) => state.balance);
  const pendingBalance = useStipendStore((state) => state.pendingBalance);
  
  const backgroundColor = useThemeColor(theme.color.background);
  const cardBackground = useThemeColor({ light: "#FFFFFF", dark: "#1C1C1E" });
  const greenColor = isDarkMode ? "#34D399" : "#10B981";
  const amberColor = isDarkMode ? "#FBBF24" : "#F59E0B";

  const { bottom } = useSafeAreaInsets();

  // Group payments by status
  const sections = useMemo(() => {
    const pending = payments.filter((p) => p.status === "pending" || p.status === "processing");
    const completed = payments.filter((p) => p.status === "completed");
    
    const result: PaymentSection[] = [];
    
    if (pending.length > 0) {
      result.push({
        title: "Pending",
        data: pending.sort((a, b) => b.date.localeCompare(a.date)),
      });
    }
    
    if (completed.length > 0) {
      result.push({
        title: "Deposited",
        data: completed.sort((a, b) => b.date.localeCompare(a.date)),
      });
    }
    
    return result;
  }, [payments]);

  const handlePaymentPress = useCallback((payment: Payment) => {
    // Could navigate to payment detail in the future
    console.log("Payment pressed:", payment.id);
  }, []);

  const renderSectionHeader = useCallback(
    ({ section }: { section: PaymentSection }) => (
      <ThemedView style={styles.sectionHeader} color={theme.color.background}>
        <ThemedText
          fontSize={theme.fontSize14}
          fontWeight="semiBold"
          color={theme.color.textSecondary}
          style={styles.sectionTitle}
        >
          {section.title.toUpperCase()}
        </ThemedText>
      </ThemedView>
    ),
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: Payment }) => (
      <PaymentCard payment={item} onPress={handlePaymentPress} />
    ),
    [handlePaymentPress]
  );

  const ListHeader = useMemo(
    () => (
      <View style={styles.header}>
        {/* Balance Cards */}
        <View style={styles.balanceCards}>
          {/* Total Earnings */}
          <View style={[styles.balanceCard, { backgroundColor: cardBackground }]}>
            <View style={styles.balanceIcon}>
              <MaterialCommunityIcons 
                name="wallet-outline" 
                size={24} 
                color={greenColor} 
              />
            </View>
            <ThemedText
              fontSize={theme.fontSize12}
              color={theme.color.textSecondary}
            >
              Total Deposited
            </ThemedText>
            <ThemedText
              fontSize={theme.fontSize28}
              fontWeight="bold"
              color={{ light: greenColor, dark: greenColor }}
            >
              {formatCurrency(balance)}
            </ThemedText>
          </View>
          
          {/* Pending */}
          <View style={[styles.balanceCard, { backgroundColor: cardBackground }]}>
            <View style={styles.balanceIcon}>
              <MaterialCommunityIcons 
                name="clock-outline" 
                size={24} 
                color={amberColor} 
              />
            </View>
            <ThemedText
              fontSize={theme.fontSize12}
              color={theme.color.textSecondary}
            >
              Pending
            </ThemedText>
            <ThemedText
              fontSize={theme.fontSize28}
              fontWeight="bold"
              color={{ light: amberColor, dark: amberColor }}
            >
              {formatCurrency(pendingBalance)}
            </ThemedText>
          </View>
        </View>
        
        {/* Quick Stats */}
        <View style={[styles.statsCard, { backgroundColor: cardBackground }]}>
          <View style={styles.statItem}>
            <ThemedText
              fontSize={theme.fontSize24}
              fontWeight="bold"
            >
              {payments.filter((p) => p.status === "completed").length}
            </ThemedText>
            <ThemedText
              fontSize={theme.fontSize12}
              color={theme.color.textSecondary}
            >
              Deposits
            </ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText
              fontSize={theme.fontSize24}
              fontWeight="bold"
            >
              {payments.filter((p) => p.type === "bonus").length}
            </ThemedText>
            <ThemedText
              fontSize={theme.fontSize12}
              color={theme.color.textSecondary}
            >
              Bonuses
            </ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText
              fontSize={theme.fontSize24}
              fontWeight="bold"
            >
              {payments.filter((p) => p.status === "pending" || p.status === "processing").length}
            </ThemedText>
            <ThemedText
              fontSize={theme.fontSize12}
              color={theme.color.textSecondary}
            >
              Pending
            </ThemedText>
          </View>
        </View>
      </View>
    ),
    [balance, pendingBalance, payments, cardBackground, greenColor, amberColor]
  );

  return (
    <SectionList
      sections={sections}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={(item) => item.id}
      style={{ backgroundColor }}
      contentContainerStyle={[
        styles.listContent,
        {
          paddingBottom: Platform.select({ android: 100 + bottom, default: bottom + 20 }),
        },
      ]}
      contentInsetAdjustmentBehavior="automatic"
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.empty}>
          <MaterialCommunityIcons 
            name="cash-off" 
            size={64} 
            color={isDarkMode ? "#4A4A4A" : "#D1D5DB"} 
          />
          <ThemedText fontWeight="bold" fontSize={theme.fontSize20}>
            No payments yet
          </ThemedText>
          <ThemedText
            fontSize={theme.fontSize16}
            color={theme.color.textSecondary}
            style={styles.emptyText}
          >
            Complete visits to start earning. Your payments will appear here.
          </ThemedText>
        </Animated.View>
      }
    />
  );
}

const styles = StyleSheet.create({
  header: {
    gap: theme.space16,
    paddingBottom: theme.space8,
    paddingHorizontal: theme.space16,
    paddingTop: theme.space8,
  },
  balanceCards: {
    flexDirection: "row",
    gap: theme.space12,
  },
  balanceCard: {
    borderRadius: theme.borderRadius12,
    flex: 1,
    gap: theme.space4,
    padding: theme.space16,
  },
  balanceIcon: {
    marginBottom: theme.space4,
  },
  statsCard: {
    borderRadius: theme.borderRadius12,
    flexDirection: "row",
    padding: theme.space16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
    gap: theme.space2,
  },
  statDivider: {
    backgroundColor: "#E5E5EA",
    width: 1,
  },
  sectionHeader: {
    paddingHorizontal: theme.space16,
    paddingTop: theme.space16,
    paddingBottom: theme.space8,
  },
  sectionTitle: {
    letterSpacing: 1,
  },
  listContent: {
    paddingTop: theme.space8,
  },
  empty: {
    alignItems: "center",
    gap: theme.space12,
    paddingHorizontal: theme.space24,
    paddingTop: theme.space24,
  },
  emptyText: {
    textAlign: "center",
  },
});
