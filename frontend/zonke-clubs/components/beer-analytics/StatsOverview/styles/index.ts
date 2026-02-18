import { StyleSheet } from "react-native";
import { Colors } from "@/constants/ui";

export const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.platinum,
  },
  heroCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.gold,
    overflow: "hidden",
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  heroIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.bgSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  heroValue: {
    fontSize: 32,
    fontWeight: "900",
    color: Colors.gold,
    marginBottom: 4,
  },
  heroLabel: {
    fontSize: 13,
    color: Colors.lightGrey,
    fontWeight: "600",
  },
  rankBadge: {
    alignItems: "center",
    backgroundColor: Colors.bgSecondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  rankText: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.gold,
    marginTop: 4,
  },
  rankSubtext: {
    fontSize: 10,
    color: Colors.lightGrey,
    marginTop: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.15)",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.platinum,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.smoke,
    fontWeight: "600",
  },
  favoriteCard: {
    marginTop: 12,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.15)",
    alignItems: "center",
  },
  favoriteLabel: {
    fontSize: 12,
    color: Colors.smoke,
    fontWeight: "600",
    marginBottom: 8,
  },
  favoriteBrand: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.gold,
    marginBottom: 4,
  },
  favoriteType: {
    fontSize: 14,
    color: Colors.platinum,
  },
});
