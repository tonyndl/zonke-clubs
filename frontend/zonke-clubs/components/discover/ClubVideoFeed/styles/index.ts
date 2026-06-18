import { StyleSheet, Dimensions } from "react-native";
import { Colors } from "@/constants/ui";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const TAB_BAR_HEIGHT = 100;

export { SCREEN_HEIGHT, SCREEN_WIDTH, TAB_BAR_HEIGHT };

export const styles = StyleSheet.create({
  videoContainer: {
    width: SCREEN_WIDTH,
    height: "100%",
    backgroundColor: Colors.bg,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  video: {
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
    zIndex: 1,
  },
  centerPlayIcon: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  playIconBackground: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  tapArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 25,
    zIndex: 5,
  },
  nameContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rightControls: {
    position: "absolute",
    right: 12,
    bottom: 120,
    gap: 24,
    alignItems: "center",
    zIndex: 15,
  },
  bottomInfoWrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 36,
    zIndex: 15,
  },
  controlButton: {
    // alignItems: "center",
    gap: 4,
  },
  controlText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  bottomInfo: {
    gap: 8,
    marginBottom: 18,
  },
  clubBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(10, 10, 15, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  clubName: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    maxWidth: 200,
  },
  locationText: {
    color: Colors.platinum,
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 4,
    marginBottom: 20,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    color: Colors.platinum,
    fontSize: 12,
  },
  durationBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 10,
  },
  durationText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  progressTouchArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 25,
    justifyContent: "center",
    zIndex: 20,
  },
  progressTrack: {
    width: "100%",
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.gold,
    borderRadius: 2,
  },
  progressThumb: {
    position: "absolute",
    top: -4,
    right: -5,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: Colors.gold,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    color: Colors.smoke,
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
});
