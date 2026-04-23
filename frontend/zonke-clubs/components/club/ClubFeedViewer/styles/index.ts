import { StyleSheet, Dimensions } from "react-native";
import { Colors } from "@/constants/ui";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },

  // ── Per-post full-screen page ───────────────────────────────────────────────
  feedItem: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "black",
    overflow: "hidden",
  },

  // ── Media ───────────────────────────────────────────────────────────────────
  mediaPage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  media: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },

  // ── Bottom gradient ─────────────────────────────────────────────────────────
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "55%",
    zIndex: 1,
  },

  // ── Center play icon ────────────────────────────────────────────────────────
  centerPlayIcon: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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

  // ── Tap area (full screen minus progress bar strip) ────────────────────────
  tapArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 25,
    zIndex: 5,
  },

  // ── Duration badge – top right ──────────────────────────────────────────────
  durationBadge: {
    position: "absolute",
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

  // ── Close button – top left ─────────────────────────────────────────────────
  closeButton: {
    position: "absolute",
    left: 16,
    zIndex: 100,
  },
  closeButtonInner: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Menu button – top right (owner only) ────────────────────────────────────
  menuButton: {
    position: "absolute",
    right: 16,
    zIndex: 100,
  },
  menuButtonInner: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.18)",
  },

  // ── Bottom info wrapper ─────────────────────────────────────────────────────
  bottomInfoWrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 36,
    zIndex: 15,
  },
  bottomInfo: {
    gap: 8,
    marginBottom: 18,
  },

  // ── Caption ─────────────────────────────────────────────────────────────────
  captionText: {
    color: Colors.platinum,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },

  // ── Club name row + like + mute ─────────────────────────────────────────────
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  clubBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(10,10,15,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gold,
    alignSelf: "flex-start",
  },
  clubName: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    maxWidth: 200,
  },
  rightActions: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 16,
  },

  // ── Location row ─────────────────────────────────────────────────────────────
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
  },
  locationText: {
    color: Colors.platinum,
    fontSize: 14,
    flexShrink: 1,
  },

  // ── Stats row (time ago) ─────────────────────────────────────────────────────
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

  // ── Pagination dots ─────────────────────────────────────────────────────────
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  dotActive: {
    backgroundColor: Colors.gold,
    width: 8,
  },

  // ── Progress bar ────────────────────────────────────────────────────────────
  progressTouchArea: {
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
});
