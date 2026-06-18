import { StyleSheet } from "react-native";
import { Colors } from "@/constants/ui";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    flex: 1,
    backgroundColor: Colors.charcoal,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.platinum,
    letterSpacing: 0.5,
  },
  saveButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    marginTop: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.platinum,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  textInput: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.platinum,
    minHeight: 140,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.2)",
  },
  characterCount: {
    fontSize: 12,
    color: Colors.smoke,
    textAlign: "right",
    marginTop: 8,
  },
});
