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
  chartContainer: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.15)",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  brandInfo: {
    width: 100,
  },
  brandName: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.platinum,
    marginBottom: 2,
  },
  brandLitres: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.gold,
  },
  barContainer: {
    flex: 1,
    height: 24,
    backgroundColor: "rgba(57, 243, 255, 0.1)",
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 12,
  },
  bar: {
    height: "100%",
    borderRadius: 12,
  },
  brandCount: {
    width: 30,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.gold,
    textAlign: "right",
  },
});
