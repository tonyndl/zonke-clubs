import { StyleSheet, Dimensions } from "react-native";
import { Colors } from "@/constants/ui";

const { width, height } = Dimensions.get("window");

export { width, height };

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
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(57, 243, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.platinum,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.smoke,
    marginTop: 2,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 24,
  },
  stepItem: {
    alignItems: "center",
    gap: 8,
  },
  stepCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(57, 243, 255, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(57, 243, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  stepCircleCompleted: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.smoke,
  },
  stepLabelActive: {
    color: Colors.gold,
    fontWeight: "700",
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: "rgba(57, 243, 255, 0.2)",
    marginHorizontal: 8,
  },
  stepLineCompleted: {
    backgroundColor: Colors.gold,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
  },

  // Amount Step
  amountContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.platinum,
    textAlign: "center",
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    color: Colors.smoke,
    textAlign: "center",
    marginBottom: 40,
  },
  amountInputContainer: {
    marginBottom: 32,
  },
  amountInputGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  currencySymbolLarge: {
    fontSize: 48,
    fontWeight: "800",
    color: Colors.gold,
    marginRight: 8,
  },
  amountInput: {
    fontSize: 56,
    fontWeight: "800",
    color: Colors.platinum,
    minWidth: 120,
    textAlign: "center",
  },
  quickAmounts: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 40,
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: "rgba(57, 243, 255, 0.1)",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.3)",
  },
  quickAmountText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.gold,
  },

  // Members Step
  membersContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(57, 243, 255, 0.1)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.2)",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.platinum,
    marginLeft: 8,
  },
  selectedPreview: {
    marginBottom: 16,
  },
  selectedPreviewContent: {
    gap: 12,
    paddingVertical: 4,
  },
  selectedMemberChip: {
    position: "relative",
  },
  selectedMemberAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: Colors.gold,
  },
  selectedMemberRemove: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  membersScroll: {
    flex: 1,
    marginBottom: 16,
  },
  membersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingBottom: 20,
  },
  memberCard: {
    width: (width - 72) / 3,
    aspectRatio: 0.85,
    backgroundColor: "rgba(57, 243, 255, 0.05)",
    borderRadius: 20,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(57, 243, 255, 0.2)",
    position: "relative",
  },
  memberCardSelected: {
    backgroundColor: "rgba(57, 243, 255, 0.15)",
    borderColor: Colors.gold,
  },
  memberAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
  },
  memberCheckBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  memberName: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.platinum,
    textAlign: "center",
  },
  memberNameSelected: {
    color: Colors.gold,
    fontWeight: "700",
  },

  // Split Step
  splitContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  splitTypeContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  splitTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "rgba(57, 243, 255, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(57, 243, 255, 0.2)",
    overflow: "hidden",
  },
  splitTypeButtonActive: {
    borderColor: Colors.gold,
  },
  splitTypeText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.smoke,
  },
  splitTypeTextActive: {
    color: Colors.bg,
    fontWeight: "700",
  },
  splitScroll: {
    flex: 1,
  },
  splitList: {
    gap: 12,
    paddingBottom: 240,
  },
  splitMemberCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(57, 243, 255, 0.05)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.2)",
  },
  splitMemberLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  splitMemberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  splitMemberInfo: {
    flex: 1,
  },
  splitMemberName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.platinum,
  },
  splitMemberEqual: {
    fontSize: 12,
    color: Colors.smoke,
    marginTop: 2,
  },
  splitMemberRight: {
    marginLeft: 12,
  },
  splitMemberAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.gold,
  },
  customAmountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  customCurrency: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.gold,
  },
  customAmountInput: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.platinum,
    minWidth: 80,
    textAlign: "right",
  },
  splitFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: "rgba(57, 243, 255, 0.2)",
  },
  splitFooterGradient: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  summaryRows: {
    marginBottom: 20,
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  stepFooter: {
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: "rgba(57, 243, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.2)",
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.platinum,
  },
  nextButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.bg,
  },
  confirmButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 18,
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.bg,
  },

  // Success State
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  successIcon: {
    marginBottom: 24,
  },
  successIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.platinum,
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 16,
    color: Colors.smoke,
    textAlign: "center",
  },
});
