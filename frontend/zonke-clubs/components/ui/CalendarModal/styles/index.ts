import { StyleSheet } from "react-native";
import { Colors } from "@/constants/ui";

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.platinum,
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.bgSecondary,
  },
  quickButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  quickButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.bgSecondary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.15)",
  },
  quickButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.platinum,
  },
  selectedDateContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  selectedDateCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(217, 175, 98, 0.1)",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(217, 175, 98, 0.3)",
  },
  selectedDateText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.platinum,
  },
  footer: {
    marginTop: 16,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.gold,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: Colors.bgSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.bg,
  },
  confirmButtonTextDisabled: {
    color: Colors.smoke,
  },
});
