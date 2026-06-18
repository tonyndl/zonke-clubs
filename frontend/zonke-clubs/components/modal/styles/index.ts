import { Colors } from "@/constants/ui";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100000,
    elevation: 10000,
    flex: 1,
    flexDirection: "column",
  },
  keyboardView: {
    flex: 1,
    alignItems: "center",
  },
  modalWrapper: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    width: "100%",
    paddingHorizontal: 12,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  centerModal: {
    margin: "auto",
    width: "90%",
    padding: 20,
    marginHorizontal: 15,
    borderRadius: 15,
  },
});
