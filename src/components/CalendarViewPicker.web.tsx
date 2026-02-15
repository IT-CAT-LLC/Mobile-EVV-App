import { useThemeColor, ThemedText } from "./Themed";
import { theme } from "@/theme";
import {
  useWindowDimensions,
  View,
  StyleSheet,
  Pressable,
  useColorScheme,
} from "react-native";
import { CalendarView } from "@/consts";

interface CalendarViewPickerProps {
  selectedView: CalendarView;
  onSelectView: (view: CalendarView) => void;
}

const options: { value: CalendarView; label: string }[] = [
  { value: CalendarView.Day, label: "Day" },
  { value: CalendarView.Month, label: "Month" },
];

export function CalendarViewPicker({
  selectedView,
  onSelectView,
}: CalendarViewPickerProps) {
  const backgroundColor = useThemeColor(theme.color.background);
  const width = useWindowDimensions().width;
  const tintColor = useThemeColor(theme.color.reactBlue);
  const backgroundSecondary = useThemeColor(theme.color.backgroundSecondary);
  const colorScheme = useColorScheme() ?? "light";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
        },
      ]}
    >
      <View
        style={[
          styles.picker,
          {
            width: Math.min(width - theme.space24 * 2, 400),
            backgroundColor: backgroundSecondary,
          },
        ]}
      >
        {options.map((option) => {
          const isSelected = selectedView === option.value;
          return (
            <Pressable
              key={option.value}
              style={[
                styles.option,
                isSelected && {
                  backgroundColor: tintColor,
                },
              ]}
              onPress={() => onSelectView(option.value)}
            >
              <ThemedText
                fontSize={theme.fontSize14}
                fontWeight="semiBold"
                style={[
                  styles.optionText,
                  isSelected && {
                    color: colorScheme === "dark" ? "#000" : "#fff",
                  },
                ]}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.space8,
    alignItems: "center",
  },
  picker: {
    flexDirection: "row",
    borderRadius: theme.borderRadius10,
    padding: 4,
    height: 40,
  },
  option: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.borderRadius6,
  },
  optionText: {
    textAlign: "center",
  },
});
