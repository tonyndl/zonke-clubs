import { StyleSheet, Dimensions } from "react-native";
import { Colors } from "@/constants/ui";

const { width } = Dimensions.get("window");

export const ITEM_WIDTH = (width - 60) / 2;

export const styles = StyleSheet.create({
  container: {
    width: ITEM_WIDTH,
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(18, 18, 26, 0.85)",
    position: "relative",
  },
  mediaContainer: {
    width: "100%",
    height: ITEM_WIDTH * 1.2,
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(57, 243, 255, 0.05)",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },
  videoIndicator: {
    position: "absolute",
    top: 12,
    left: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  videoIndicatorBlur: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  dateBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  dateBadgeBlur: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  dateText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.platinum,
    letterSpacing: 0.3,
  },
  likeButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    borderRadius: 20,
    overflow: "hidden",
  },
  likeButtonBlur: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  likeCount: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.platinum,
  },
  likeCountActive: {
    color: "#EF4444",
  },
  infoSection: {
    padding: 12,
    gap: 8,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 12,
    color: Colors.smoke,
    fontWeight: "500",
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.gold,
    letterSpacing: 0.3,
  },
  splitInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  splitBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(57, 243, 255, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  splitText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.gold,
  },
  border: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.2)",
    borderRadius: 16,
    pointerEvents: "none",
  },
});
