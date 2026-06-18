import { StyleSheet } from "react-native";
import { Colors } from "@/constants/ui";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  count: {
    color: Colors.platinum,
    fontWeight: "700",
  },
});
