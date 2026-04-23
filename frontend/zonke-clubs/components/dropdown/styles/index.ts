import { Colors } from "@/constants/ui";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  label: {
    fontSize: 15,
    marginBottom: 8,
    color: Colors.platinum,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 12,
    borderRadius: 5,
    backgroundColor: Colors.bgSecondary,
    position: "relative",
    overflow: "hidden",
  },
  before: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 5,
    opacity: 0.4,
    zIndex: -1,
  },
  inputText: {
    fontSize: 15,
    color: Colors.white,
  },
  placeholderText: {
    opacity: 0.3,
  },
  caretWrapper: {
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    position: "absolute",
    backgroundColor: "transparent",
    zIndex: 4999,
  },
  dropdownMenu: {
    position: "absolute",
    backgroundColor: "rgba(15, 19, 26, 0.98)",
    borderRadius: 8,
    paddingVertical: 4,
    zIndex: 5000,
    borderWidth: 1.5,
    borderColor: "rgba(57, 243, 255, 0.25)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 5,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownText: {
    fontSize: 15,
    width: "auto",
    color: Colors.platinum,
  },
  longText: {
    position: "absolute",
    opacity: 0,
  },
});
