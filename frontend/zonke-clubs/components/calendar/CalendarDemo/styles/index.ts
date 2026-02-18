import { StyleSheet } from "react-native";
import { Colors } from "@/constants/ui";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.platinum,
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.lightGrey,
    textAlign: "center",
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.platinum,
  },
  sectionDescription: {
    fontSize: 13,
    color: Colors.lightGrey,
    marginBottom: 16,
    lineHeight: 18,
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(217, 175, 98, 0.1)",
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(217, 175, 98, 0.3)",
  },
  resultText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.platinum,
  },
  openModalButton: {
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
  openModalButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.bg,
  },
  rangeButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  rangeButton: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(57, 243, 255, 0.15)",
  },
  rangeButtonSelected: {
    borderColor: Colors.gold,
    backgroundColor: "rgba(217, 175, 98, 0.1)",
  },
  rangeButtonLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.platinum,
    textAlign: "center",
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.platinum,
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.bgCard,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.1)",
  },
  featureText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.platinum,
  },
});
