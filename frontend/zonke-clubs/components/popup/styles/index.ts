import { Colors } from "@/constants/ui";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    zIndex: 1,
    overflow: "hidden",
  },
  placeholderText: {
    opacity: 0.3,
  },
  iconWrapper: {
    alignItems: "center",
    paddingHorizontal: 2,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    position: "absolute",
    backgroundColor: "transparent",
    zIndex: 4999,
  },
  popupMenu: {
    position: "absolute",
    backgroundColor: "rgba(20, 25, 35, 0.95)", // Dark semi-transparent background
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
    zIndex: 5000,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.2)", // Subtle cyan border
    overflow: "hidden",
  },
  popupItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginVertical: 2,
    marginHorizontal: 6,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 16,
    marginVertical: 4,
  },
  popupText: {
    fontSize: 16,
    width: "auto",
    color: Colors.platinum || "#E5E7EB",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  longText: {
    position: "absolute",
    opacity: 0,
  },
  label: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: 500,
  },
  dot: {
    borderWidth: 1,
    borderColor: Colors.gold,
    width: 6,
    height: 6,
    borderRadius: "50%",
    backgroundColor: Colors.gold,
  },
});
