import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

/**
 * A platform-safe wrapper around Notifications.useLastNotificationResponse
 * Returns null on web where the native implementation is not available
 */
export function useLastNotificationResponse() {
  // On native platforms, use the real hook
  if (Platform.OS !== "web") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return Notifications.useLastNotificationResponse();
  }
  // On web, return null since notifications aren't supported
  return null;
}
