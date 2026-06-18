import { StyleSheet, Dimensions } from "react-native";
import { Colors } from "@/constants/ui";

const { width } = Dimensions.get("window");

export { width };

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(57, 243, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.platinum,
  },
  moreButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(57, 243, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  mediaSection: {
    marginBottom: 24,
  },
  mediaContainer: {
    width: "100%",
    height: width * 1.2,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(18, 18, 26, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.2)",
    marginBottom: 16,
  },
  media: {
    width: "100%",
    height: "100%",
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -50,
    marginLeft: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
  },
  playButtonBlur: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  interactionBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(18, 18, 26, 0.85)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.2)",
  },
  likeButtonLarge: {
    alignItems: "center",
    gap: 8,
  },
  shareButton: {
    alignItems: "center",
    gap: 8,
  },
  downloadButton: {
    alignItems: "center",
    gap: 8,
  },
  interactionText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.smoke,
  },
  likedText: {
    color: "#EF4444",
  },
  infoCard: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.2)",
    marginBottom: 24,
  },
  infoGradient: {
    padding: 20,
  },
  amountSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  amountIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(57, 243, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  amountTextContainer: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 14,
    color: Colors.smoke,
    fontWeight: "500",
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.gold,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(57, 243, 255, 0.2)",
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(57, 243, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.smoke,
    fontWeight: "500",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.platinum,
    lineHeight: 22,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: "rgba(57, 243, 255, 0.1)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.2)",
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.gold,
    letterSpacing: 0.3,
  },
  deleteButton: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  deleteText: {
    color: "#EF4444",
  },
});
