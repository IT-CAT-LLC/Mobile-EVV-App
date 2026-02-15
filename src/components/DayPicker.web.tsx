import { useThemeColor } from "./Themed";
import { theme } from "@/theme";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { ConferenceDay } from "@/consts";

interface DayPickerProps {
  selectedDay: ConferenceDay;
  onSelectDay: (day: ConferenceDay) => void;
}

export function DayPicker({ selectedDay, onSelectDay }: DayPickerProps) {
  const backgroundColor = useThemeColor(theme.color.background);
  const tintColor = useThemeColor(theme.color.reactBlue);
  const textColor = useThemeColor({ light: "#FFFFFF", dark: "#121212" });
  const inactiveTextColor = useThemeColor(theme.color.textSecondary);
  const backgroundSecondary = useThemeColor(theme.color.backgroundSecondary);

  const options = [
    { label: "Day 1", value: ConferenceDay.One },
    { label: "Day 2", value: ConferenceDay.Two },
  ];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: backgroundColor },
      ]}
    >
      <View style={[styles.pickerContainer, { backgroundColor: backgroundSecondary }]}>
        {options.map((option) => {
          const isSelected = selectedDay === option.value;
          return (
            <Pressable
              key={option.value}
              style={[
                styles.option,
                isSelected && { backgroundColor: tintColor },
              ]}
              onPress={() => onSelectDay(option.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: isSelected ? textColor : inactiveTextColor },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.space4,
    paddingHorizontal: theme.space16,
  },
  pickerContainer: {
    flexDirection: "row",
    borderRadius: theme.borderRadius80,
    padding: 4,
  },
  option: {
    flex: 1,
    paddingVertical: theme.space8,
    paddingHorizontal: theme.space16,
    borderRadius: theme.borderRadius80,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
