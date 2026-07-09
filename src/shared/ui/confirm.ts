import { Alert, Platform } from "react-native";

/**
 * Cross-platform confirm dialog. On web uses window.confirm; on native uses a
 * destructive Alert. Calls `onYes` only when the user confirms.
 */
export function confirm(
  message: string,
  onYes: () => void,
  title = "Please confirm",
) {
  if (Platform.OS === "web") {
    if (window.confirm(message)) onYes();
  } else {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: "Confirm", style: "destructive", onPress: onYes },
    ]);
  }
}
