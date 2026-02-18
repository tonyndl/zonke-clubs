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
  list: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.15)",
    overflow: "hidden",
  },
  beerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(57, 243, 255, 0.1)",
  },
  beerItemLast: {
    borderBottomWidth: 0,
  },
  beerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(57, 243, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  beerInfo: {
    flex: 1,
  },
  beerBrand: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.platinum,
    marginBottom: 4,
  },
  beerType: {
    fontSize: 12,
    color: Colors.smoke,
  },
  beerDate: {
    fontSize: 12,
    color: Colors.smoke,
    fontWeight: "600",
  },
});
