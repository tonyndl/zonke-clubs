import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
});
