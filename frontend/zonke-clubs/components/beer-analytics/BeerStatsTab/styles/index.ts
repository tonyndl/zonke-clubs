import { StyleSheet } from "react-native";
import { Colors } from "@/constants/ui";

export const styles = StyleSheet.create({
  // ── Layout ──────────────────────────────────────────
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 28,
  },

  // ── Section Title ────────────────────────────────────
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  sectionTitleBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: Colors.gold,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.platinum,
    letterSpacing: 0.4,
  },

  // ── Hero Card ────────────────────────────────────────
  heroCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.25)",
    overflow: "hidden",
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  heroIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(57,243,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.gold,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  heroAmount: {
    fontSize: 42,
    fontWeight: "900",
    color: Colors.platinum,
    letterSpacing: -1,
    marginBottom: 20,
  },
  heroDivider: {
    height: 1,
    backgroundColor: "rgba(57,243,255,0.15)",
    marginBottom: 20,
  },
  heroPillsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroPill: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  heroPillValue: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.platinum,
  },
  heroPillLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.smoke,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  heroPillSeparator: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(57,243,255,0.2)",
  },

  // ── Favorite Spot ────────────────────────────────────
  favoriteCard: {
    flexDirection: "row",
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.2)",
  },
  favoriteAccentStripe: {
    width: 4,
    borderRadius: 4,
  },
  favoriteCardInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  favoriteInfo: {
    flex: 1,
    marginRight: 12,
  },
  favoriteClubName: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.platinum,
    marginBottom: 4,
  },
  favoriteClubVisits: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.smoke,
  },

  // ── Leaderboard ──────────────────────────────────────
  rankingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
  },
  rankBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rankBadgeText: {
    fontSize: 14,
    fontWeight: "900",
  },
  rankingInfo: {
    flex: 1,
  },
  rankingClubName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.platinum,
    marginBottom: 3,
  },
  rankingMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rankingBestNight: {
    fontSize: 12,
    color: Colors.smoke,
    fontWeight: "500",
  },
  rankingMetaDot: {
    fontSize: 12,
    color: Colors.smoke,
  },
  rankingDate: {
    fontSize: 12,
    color: Colors.smoke,
    fontWeight: "500",
  },

  // ── Recent Visits ────────────────────────────────────
  historyList: {
    gap: 10,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.1)",
  },
  historyDateBadge: {
    backgroundColor: Colors.bgCard,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 52,
  },
  historyDateText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.gold,
    letterSpacing: 0.3,
  },
  historyMiddle: {
    flex: 1,
  },
  historyClubName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.platinum,
    marginBottom: 2,
  },
  historyNotes: {
    fontSize: 12,
    color: Colors.smoke,
    fontWeight: "400",
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.gold,
    marginLeft: 4,
  },

  // ── Loading ──────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    minHeight: 400,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  loadingGradientWrap: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 48,
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.15)",
  },
  loadingText: {
    color: Colors.smoke,
    fontSize: 14,
    fontWeight: "500",
  },

  // ── Error ─────────────────────────────────────────────
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
    gap: 8,
  },
  errorText: {
    color: Colors.smoke,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },
  errorSubtext: {
    color: Colors.lightGrey,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },

  // ── Empty ─────────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    minHeight: 400,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(57,243,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.15)",
  },
  emptyText: {
    color: Colors.platinum,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  emptySubtext: {
    color: Colors.lightGrey,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});
