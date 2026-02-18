import { StyleSheet, Dimensions } from "react-native";
import { Colors } from "@/constants/ui";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const TRIM_BAR_WIDTH = SCREEN_WIDTH - 48;
export const MAX_DURATION = 30;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.platinum,
  },
  doneButton: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  doneButtonText: {
    color: Colors.bg,
    fontSize: 15,
    fontWeight: "700",
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(217, 175, 98, 0.1)",
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.platinum,
    lineHeight: 18,
  },
  videoContainer: {
    aspectRatio: 9 / 16,
    backgroundColor: Colors.bgCard,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  video: {
    flex: 1,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  durationInfo: {
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 8,
  },
  durationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  durationLabel: {
    fontSize: 14,
    color: Colors.smoke,
    fontWeight: "600",
  },
  durationValue: {
    fontSize: 16,
    color: Colors.gold,
    fontWeight: "700",
  },
  durationValueError: {
    color: "#ff6b6b",
  },
  trimSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  trimLabel: {
    fontSize: 12,
    color: Colors.smoke,
    marginBottom: 12,
    textAlign: "center",
  },
  trimContainer: {
    height: 60,
    position: "relative",
    marginBottom: 8,
  },
  timelineBar: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: Colors.bgCard,
    borderRadius: 8,
  },
  selectedRange: {
    position: "absolute",
    top: 20,
    height: 40,
    backgroundColor: "rgba(217, 175, 98, 0.3)",
    borderWidth: 2,
    borderColor: Colors.gold,
    borderRadius: 8,
  },
  handle: {
    position: "absolute",
    top: 10,
    width: 40,
    height: 60,
    backgroundColor: Colors.gold,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  startHandle: {},
  endHandle: {},
  handleLine: {
    width: 3,
    height: 30,
    backgroundColor: Colors.bg,
    borderRadius: 2,
  },
  currentTimeIndicator: {
    position: "absolute",
    top: 15,
    width: 2,
    height: 50,
    backgroundColor: Colors.primaryBlue,
  },
  timelineLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timelineLabel: {
    fontSize: 11,
    color: Colors.smoke,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: "#ff6b6b",
    fontWeight: "600",
  },
});
