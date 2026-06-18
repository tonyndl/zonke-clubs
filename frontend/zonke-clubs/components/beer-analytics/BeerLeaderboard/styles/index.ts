import { StyleSheet } from "react-native";
import { Colors } from "@/constants/ui";

export const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.platinum,
  },
  tabScrollView: {
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 8,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "rgba(57, 243, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.2)",
  },
  tabActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
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
  leaderboardContainer: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.15)",
    overflow: "hidden",
  },
  card: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(57, 243, 255, 0.1)",
    overflow: "hidden",
  },
  cardTopThree: {
    borderBottomWidth: 2,
    borderBottomColor: "rgba(255, 215, 0, 0.3)",
  },
  cardCurrentUser: {
    borderWidth: 2,
    borderColor: "rgba(255, 215, 0, 0.5)",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(57, 243, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  rankBadgeTopThree: {
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  rankText: {
    fontSize: 13,
    fontWeight: "700",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(57, 243, 255, 0.3)",
  },
  avatarTopThree: {
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.platinum,
    marginBottom: 4,
  },
  usernameCurrentUser: {
    color: Colors.gold,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.smoke,
  },
  litresContainer: {
    alignItems: "flex-end",
  },
  litresText: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.gold,
  },
  litresTextTopThree: {
    fontSize: 20,
  },
  litresLabel: {
    fontSize: 10,
    color: Colors.smoke,
    marginTop: 2,
  },
  shimmerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
  },
  shimmer: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    color: Colors.smoke,
    fontSize: 14,
    marginTop: 12,
  },
});
