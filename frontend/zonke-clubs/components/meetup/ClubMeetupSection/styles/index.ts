import { StyleSheet } from "react-native";
import { Colors } from "@/constants/ui";

export const styles = StyleSheet.create({
  container: {},
  userIntentionCard: {
    backgroundColor: "rgba(57, 243, 255, 0.08)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gold,
    marginBottom: 16,
  },
  userIntentionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  userIntentionLabel: {
    color: Colors.smoke,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  editText: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: "600",
  },
  userIntentionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userIntentionEmoji: {
    fontSize: 28,
  },
  userIntentionText: {
    color: Colors.platinum,
    fontSize: 16,
    fontWeight: "700",
  },
  userDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  userDateText: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: "600",
  },
  userIntentionMessage: {
    color: Colors.smoke,
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 10,
  },
  postCta: {
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: 'space-between',
    backgroundColor: Colors.bgSecondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.25)",
    borderStyle: "dashed",
    marginBottom: 16,
  },
  postCtaIcon: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    backgroundColor: Colors.bgCard,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  postCtaText: {
    flex: 1,
  },
  postCtaTitle: {
    color: Colors.platinum,
    fontSize: 15,
    fontWeight: "700",
  },
  postCtaSubtitle: {
    color: Colors.smoke,
    fontSize: 12,
    marginTop: 2,
  },
  postCtaChevron: {
    // position: 'absolute',
    // right: 6,
    // margin: 'auto',
    // marginLeft: 2
  },
  filterContainer: {
    marginBottom: 12,
  },
  activityFilterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    gap: 8,
  },
  dateFilterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(57, 243, 255, 0.08)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.2)",
  },
  dateFilterPillActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  activityPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "transparent",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.15)",
  },
  activityPillActive: {
    backgroundColor: "rgba(57, 243, 255, 0.15)",
    borderColor: Colors.gold,
  },
  activityPillText: {
    color: Colors.smoke,
    fontSize: 12,
    fontWeight: "600",
  },
  activityPillTextActive: {
    color: Colors.platinum,
  },
  filterEmoji: {
    fontSize: 14,
  },
  filterText: {
    color: Colors.smoke,
    fontSize: 13,
    fontWeight: "600",
  },
  filterTextActive: {
    color: Colors.bg,
  },
  filterCount: {
    backgroundColor: "rgba(57, 243, 255, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
    alignItems: "center",
  },
  filterCountActive: {
    backgroundColor: "rgba(11, 15, 26, 0.3)",
  },
  filterCountText: {
    color: Colors.gold,
    fontSize: 11,
    fontWeight: "700",
  },
  filterCountTextActive: {
    color: Colors.bg,
  },
  peopleContainer: {
    marginHorizontal: -16,
  },
  peopleContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    backgroundColor: "rgba(57, 243, 255, 0.08)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.2)",
  },
  emptyIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(57, 243, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "rgba(57, 243, 255, 0.1)",
  },
  emptyTitle: {
    color: Colors.platinum,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    color: Colors.smoke,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  viewAllContainer: {
    marginTop: 12,
  },
  viewAllButton: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.2)",
  },
  viewAllContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  viewAllLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  viewAllText: {
    color: Colors.platinum,
    fontSize: 15,
    fontWeight: "700",
  },
});
