import { StyleSheet, Dimensions } from "react-native";
import { Colors } from "@/constants/ui";

const { width } = Dimensions.get("window");

export { width };

export const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropBlur: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modal: {
    width: width - 40,
    maxHeight: "85%",
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.3)",
  },
  modalGradient: {
    padding: 24,
  },
  iconSection: {
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
  },
  iconOuter: {
    borderRadius: 60,
    overflow: "hidden",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  confettiContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  confetti: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.platinum,
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.smoke,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  summaryCard: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.2)",
    marginBottom: 20,
  },
  summaryGradient: {
    padding: 20,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.platinum,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(57, 243, 255, 0.2)",
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: Colors.smoke,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.platinum,
  },
  summaryLabelHighlight: {
    fontSize: 17,
    color: Colors.gold,
    fontWeight: "700",
  },
  summaryValueHighlight: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.gold,
  },
  splitsSection: {
    gap: 12,
  },
  splitsHeader: {
    fontSize: 14,
    color: Colors.smoke,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  splitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(57, 243, 255, 0.05)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.1)",
  },
  splitLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  splitAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  splitAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.bgCard,
  },
  splitName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.platinum,
  },
  splitAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.gold,
  },
  infoSection: {
    maxHeight: 200,
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "rgba(57, 243, 255, 0.05)",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.1)",
    marginBottom: 10,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(57, 243, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.platinum,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 13,
    color: Colors.smoke,
    lineHeight: 18,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.bgCard,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.gold,
    letterSpacing: 0.3,
  },
});
