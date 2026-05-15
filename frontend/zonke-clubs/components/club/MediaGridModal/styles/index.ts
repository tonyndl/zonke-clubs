import { StyleSheet, Dimensions } from "react-native";
import { Colors } from "@/constants/ui";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_SPACING = 8;
const GRID_PADDING = 16;
const ITEM_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_SPACING) / 2;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingBottom: 0,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerBorder: {
    height: 2,
    width: "100%",
  },
  closeButton: {
    position: "absolute",
    left: 16,
    top: 0,
    width: 40,
    height: 40,
  },
  closeButtonGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.3)",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.gold,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.smoke,
    marginTop: 2,
  },
  headerRight: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  counterBadge: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255, 215, 0, 0.4)",
  },
  counterText: {
    color: Colors.gold,
    fontSize: 14,
    fontWeight: "800",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: Colors.bgCard,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.15)",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: Colors.gold,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.smoke,
  },
  tabTextActive: {
    color: Colors.bg,
    fontWeight: "700",
  },
  tabBadge: {
    backgroundColor: "rgba(57, 243, 255, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
    alignItems: "center",
  },
  tabBadgeActive: {
    backgroundColor: "rgba(11, 15, 26, 0.3)",
  },
  tabBadgeText: {
    color: Colors.gold,
    fontSize: 10,
    fontWeight: "700",
  },
  tabBadgeTextActive: {
    color: Colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  gridContent: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: 16,
    paddingBottom: 32,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    marginBottom: GRID_SPACING,
  },
  gridItemPressable: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.bgCard,
  },
  gridItemPressed: {
    opacity: 0.7,
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  videoIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.platinum,
  },
  durationBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    color: Colors.platinum,
    fontSize: 11,
    fontWeight: "700",
  },
  likeBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  likeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    color: Colors.smoke,
    fontSize: 16,
    marginTop: 16,
  },
});
