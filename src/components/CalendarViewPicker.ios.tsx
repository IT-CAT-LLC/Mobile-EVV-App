import { theme } from "@/theme";
import { StyleSheet, View } from "react-native";
import { CalendarView } from "@/consts";
import { Host, Picker } from "@expo/ui/swift-ui";
import { GlassView } from "expo-glass-effect";

interface CalendarViewPickerProps {
  selectedView: CalendarView;
  onSelectView: (view: CalendarView) => void;
}

export function CalendarViewPicker({
  selectedView,
  onSelectView,
}: CalendarViewPickerProps) {
  return (
    <View style={{ paddingBottom: theme.space8 }}>
      <GlassView style={styles.glassView}>
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
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  picker: {
    height: 31,
  },
  glassView: {
    borderRadius: theme.borderRadius80,
    height: 32,
    marginHorizontal: theme.space16,
    marginTop: theme.space16,
    width: "auto",
  },
});
