import { StyleSheet } from "react-native";
import { Colors } from "@/constants/ui";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.platinum,
    marginBottom: 12,
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.smoke,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.bgCard,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.platinum,
    marginTop: 12,
  },
  uploadHint: {
    fontSize: 13,
    color: Colors.smoke,
    marginTop: 6,
  },
  imageContainer: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 16,
  },
  removeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 16,
  },
  changeButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.gold,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.bg,
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  uploadingText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.gold,
  },
});
