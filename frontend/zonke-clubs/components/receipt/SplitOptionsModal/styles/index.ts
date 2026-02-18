import { StyleSheet } from "react-native";
import { Colors } from "@/constants/ui";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(57, 243, 255, 0.1)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(57, 243, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.platinum,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.gold,
    fontWeight: "600",
  },
  doneButton: {
    width: 60,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.gold,
    textAlign: "right",
  },
  doneButtonTextDisabled: {
    color: Colors.smoke,
    opacity: 0.5,
  },
  toggleSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(18, 18, 26, 0.85)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.2)",
  },
  toggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.platinum,
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 13,
    color: Colors.smoke,
  },
  myShareSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.smoke,
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  myShareCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  myShareGradient: {
    padding: 16,
  },
  myShareContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  myShareLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  myAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  myAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.bgCard,
  },
  myShareName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.platinum,
  },
  myShareRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  myShareAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.gold,
  },
  friendsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(18, 18, 26, 0.85)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.1)",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.platinum,
  },
  friendsList: {
    flex: 1,
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(18, 18, 26, 0.85)",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.1)",
  },
  friendCardSelected: {
    backgroundColor: "rgba(57, 243, 255, 0.1)",
    borderColor: Colors.gold,
  },
  friendLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(57, 243, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  friendAvatarSelected: {
    backgroundColor: "rgba(57, 243, 255, 0.25)",
  },
  friendAvatarText: {
    fontSize: 24,
  },
  checkBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.bgCard,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.platinum,
  },
  friendNameSelected: {
    color: Colors.gold,
  },
  friendRight: {
    marginLeft: 12,
  },
  friendAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.gold,
  },
  customAmountInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.gold,
  },
  amountInput: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.platinum,
    minWidth: 80,
    textAlign: "left",
  },
  currencySymbolSmall: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.gold,
  },
  amountInputSmall: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.platinum,
    minWidth: 60,
    textAlign: "left",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(57, 243, 255, 0.2)",
  },
  footerBlur: {
    overflow: "hidden",
  },
  footerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.smoke,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.platinum,
  },
  remainingLabel: {
    color: Colors.gold,
  },
  remainingPositive: {
    color: "#EF4444",
  },
  remainingNegative: {
    color: "#10B981",
  },
  completeButton: {
    marginTop: 8,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.gold,
  },
  completeButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.bgCard,
    letterSpacing: 0.3,
  },
  completeButtonTextDisabled: {
    color: Colors.smoke,
  },
});
