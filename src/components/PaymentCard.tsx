import { StyleSheet, View, useColorScheme } from "react-native";
import { useMemo } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { format, parseISO } from "date-fns";
import * as Haptics from "expo-haptics";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { ThemedText, ThemedView, useThemeColor } from "./Themed";
import { theme } from "@/theme";
import { 
  Payment, 
  paymentStatusLabels, 
  paymentStatusColors,
  paymentTypeLabels,
  formatCurrency,
} from "@/store/stipendStore";

type Props = {
  payment: Payment;
  onPress?: (payment: Payment) => void;
};

export function PaymentCard({ payment, onPress }: Props) {
  const isDarkMode = useColorScheme() === "dark";
  const statusColor = isDarkMode 
    ? paymentStatusColors[payment.status].dark 
    : paymentStatusColors[payment.status].light;

  const cardBackground = useThemeColor({ light: "#FFFFFF", dark: "#1C1C1E" });
  const borderColor = useThemeColor({ light: "#E5E5EA", dark: "#38383A" });

  const gestureTap = useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(10)
        .runOnJS(true)
        .onEnd(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress?.(payment);
        }),
    [onPress, payment]
  );

  const getPaymentIcon = () => {
    switch (payment.type) {
      case "visit_payment":
        return "cash-check";
      case "bonus":
        return "star-circle";
      case "adjustment":
        return "swap-horizontal-circle";
      case "stipend":
        return "wallet";
      default:
        return "cash";
    }
  };

  const formattedDate = format(parseISO(payment.date), "MMM d, yyyy");
  const formattedDepositDate = payment.depositDate 
    ? format(parseISO(payment.depositDate), "MMM d") 
    : null;

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut}>
      <GestureDetector gesture={gestureTap}>
        <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
          {/* Left icon */}
          <View style={[styles.iconContainer, { backgroundColor: `${statusColor}15` }]}>
            <MaterialCommunityIcons 
              name={getPaymentIcon()} 
              size={24} 
              color={statusColor} 
            />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.topRow}>
              <ThemedText
                fontSize={theme.fontSize16}
                fontWeight="semiBold"
                numberOfLines={1}
                style={styles.description}
              >
                {payment.description}
              </ThemedText>
              <ThemedText
                fontSize={theme.fontSize18}
                fontWeight="bold"
                color={{ light: statusColor, dark: statusColor }}
              >
                {formatCurrency(payment.amount)}
              </ThemedText>
            </View>
            
            <View style={styles.bottomRow}>
              <View style={styles.dateInfo}>
                <ThemedText
                  fontSize={theme.fontSize12}
                  color={theme.color.textSecondary}
                >
                  {formattedDate}
                </ThemedText>
                {payment.type !== "visit_payment" && (
                  <View style={[styles.typeBadge, { backgroundColor: `${statusColor}15` }]}>
                    <ThemedText
                      fontSize={theme.fontSize10}
                      fontWeight="medium"
                      color={{ light: statusColor, dark: statusColor }}
                    >
                      {paymentTypeLabels[payment.type]}
                    </ThemedText>
                  </View>
                )}
              </View>
              
              <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                {payment.status === "completed" && (
                  <MaterialCommunityIcons name="check-circle" size={14} color={statusColor} />
                )}
                {payment.status === "processing" && (
                  <MaterialCommunityIcons name="progress-clock" size={14} color={statusColor} />
                )}
                {payment.status === "pending" && (
                  <MaterialCommunityIcons name="clock-outline" size={14} color={statusColor} />
                )}
                <ThemedText
                  fontSize={theme.fontSize12}
                  fontWeight="medium"
                  color={{ light: statusColor, dark: statusColor }}
                >
                  {paymentStatusLabels[payment.status]}
                  {formattedDepositDate && ` • ${formattedDepositDate}`}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    borderRadius: theme.borderRadius12,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: theme.space12,
    marginHorizontal: theme.space16,
    padding: theme.space16,
  },
  iconContainer: {
    alignItems: "center",
    borderRadius: theme.borderRadius12,
    height: 48,
    justifyContent: "center",
    marginRight: theme.space12,
    width: 48,
  },
  content: {
    flex: 1,
    gap: theme.space8,
  },
  topRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  description: {
    flex: 1,
    marginRight: theme.space8,
  },
  bottomRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateInfo: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.space8,
  },
  typeBadge: {
    borderRadius: theme.borderRadius4,
    paddingHorizontal: theme.space4,
    paddingVertical: theme.space2,
  },
  statusBadge: {
    alignItems: "center",
    borderRadius: theme.borderRadius6,
    flexDirection: "row",
    gap: theme.space4,
    paddingHorizontal: theme.space8,
    paddingVertical: theme.space4,
  },
});
