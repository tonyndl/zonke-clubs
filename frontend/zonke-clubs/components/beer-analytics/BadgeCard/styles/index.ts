import { StyleSheet } from "react-native";
import { Colors } from "@/constants/ui";

export const styles = StyleSheet.create({
  container: {
    width: "48%",
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.15)",
  },
  containerLocked: {
    opacity: 0.5,
  },
  content: {
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.platinum,
    marginBottom: 4,
    textAlign: "center",
  },
  badgeNameLocked: {
    color: Colors.smoke,
  },
  badgeDescription: {
    fontSize: 11,
    color: Colors.smoke,
    textAlign: "center",
    lineHeight: 14,
  },
  tierBadge: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  tierText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  lockOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
  },
});
