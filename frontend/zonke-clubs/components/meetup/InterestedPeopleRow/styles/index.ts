import { StyleSheet } from "react-native";
import { Colors } from "@/constants/ui";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(57, 243, 255, 0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.15)",
  },
  avatarsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrapper: {
    borderRadius: 14,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(57, 243, 255, 0.08)",
    borderWidth: 1.5,
    borderColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 13,
    backgroundColor: Colors.smoke,
  },
  avatarInitial: {
    color: Colors.gold,
    fontSize: 11,
    fontWeight: "700",
  },
  textContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 10,
  },
  textLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  lookingText: {
    color: Colors.platinum,
    fontSize: 12,
    fontWeight: "600",
  },
  activityIcons: {
    flexDirection: "row",
    gap: 2,
  },
  emoji: {
    fontSize: 14,
  },
});
