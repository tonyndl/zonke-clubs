import { Colors } from "@/constants/ui";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f1a",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  logo: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  title: {
    color: "#0b0f1a",
    marginBottom: 24,
    fontSize: 28,
    letterSpacing: 1.8,
  },
  inputContainer: {
    marginBottom: 18,
  },
  inputBorder: {
    borderRadius: 14,
    padding: 1.5,
    marginBottom: 14,
    overflow: "hidden",
  },
  inputInnerContainer: {
    borderRadius: 14,
    backgroundColor: Colors.bg,
    padding: 1.5,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    backgroundColor: Colors.bg,
    borderRadius: 12,
    padding: 14,
    color: "#fff",
    flex: 1,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    padding: 8,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
    padding: 12,
    backgroundColor: Colors.primaryBlue,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.bg,
    fontSize: 16,
    fontWeight: "800",
  },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  footerText: {
    textAlign: "center",
    color: "#aaa",
  },
  link: {
    color: Colors.secondaryBlue,
    fontWeight: "600",
    marginLeft: 8,
  },
  linkSmall: {
    textAlign: "center",
    color: Colors.secondaryBlue,
    marginTop: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  modalCard: {
    width: "100%",
    backgroundColor: Colors.bgCard,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  modalIconGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.platinum,
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  modalMessage: {
    fontSize: 15,
    color: Colors.smoke,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalOkButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: Colors.primaryBlue,
  },
  modalOkText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.bg,
  },
});
