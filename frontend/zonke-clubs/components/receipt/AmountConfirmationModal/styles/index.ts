import { StyleSheet } from "react-native";
import { Colors } from "@/constants/ui";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropBlur: {
    flex: 1,
  },
  modal: {
    maxHeight: "85%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
    borderTopWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.3)",
  },
  modalGradient: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.smoke,
    opacity: 0.3,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 16,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.platinum,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.smoke,
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 24,
  },
  amountSection: {
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.smoke,
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  amountDisplay: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(57, 243, 255, 0.3)",
  },
  amountDisplayGradient: {
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  currencySymbol: {
    fontSize: 48,
    fontWeight: "700",
    color: Colors.gold,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: "700",
    color: Colors.platinum,
    minWidth: 120,
    textAlign: "left",
  },
  amountViewContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  amountText: {
    fontSize: 48,
    fontWeight: "700",
    color: Colors.platinum,
  },
  quickAddSection: {
    marginBottom: 24,
  },
  quickAddLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.smoke,
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  quickAddButtons: {
    flexDirection: "row",
    gap: 12,
  },
  quickAddButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.2)",
  },
  quickAddButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  quickAddButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.gold,
  },
  infoCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "rgba(57, 243, 255, 0.05)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.1)",
    marginBottom: 32,
  },
  infoIconContainer: {
    marginTop: 2,
  },
  infoText: {
    flex: 1,
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
    fontSize: 17,
    fontWeight: "700",
    color: Colors.bgCard,
    letterSpacing: 0.3,
  },
  primaryButtonTextDisabled: {
    color: Colors.smoke,
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.gold,
    letterSpacing: 0.3,
  },
  secondaryButtonTextDisabled: {
    color: Colors.smoke,
    opacity: 0.5,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
  },
});
