import { theme } from "@/theme";
import { StyleSheet, View } from "react-native";
import { CalendarView } from "@/consts";
import { Host, Picker } from "@expo/ui/swift-ui";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";

interface CalendarViewPickerProps {
  selectedView: CalendarView;
  onSelectView: (view: CalendarView) => void;
}

export function CalendarViewPicker({
  selectedView,
  onSelectView,
}: CalendarViewPickerProps) {
  const isLiquidGlass = isLiquidGlassAvailable();

  const pickerContent = (
    <Host matchContents style={styles.picker}>
      <Picker
        options={["Day", "Month"]}
        selectedIndex={selectedView === CalendarView.Day ? 0 : 1}
        onOptionSelected={({ nativeEvent: { index } }) => {
          onSelectView(index === 0 ? CalendarView.Day : CalendarView.Month);
        }}
        variant="segmented"
      />
    </Host>
  );

  return (
    <View style={styles.container}>
      {isLiquidGlass ? (
        <GlassView style={styles.glassView}>
          {pickerContent}
        </GlassView>
      ) : (
        <View style={styles.pickerWrapper}>
          {pickerContent}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: theme.space8,
  },
  picker: {
    height: 32,
  },
  pickerWrapper: {
    marginHorizontal: theme.space16,
    marginTop: theme.space16,
  },
  glassView: {
    borderRadius: 10,
    marginHorizontal: theme.space16,
    marginTop: theme.space16,
  },
});
