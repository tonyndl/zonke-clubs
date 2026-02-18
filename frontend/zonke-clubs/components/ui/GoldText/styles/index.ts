import { StyleSheet } from "react-native";
import { Colors } from "@/constants/ui";

export const styles = StyleSheet.create({
  base: {
    color: Colors.gold,
    textShadowColor: "rgba(212, 175, 55, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  body: {
    fontSize: 14,
    fontWeight: "600",
  },
});
