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
});
