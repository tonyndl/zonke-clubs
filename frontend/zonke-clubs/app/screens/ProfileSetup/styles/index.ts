import { StyleSheet, Dimensions } from "react-native";
import { Colors } from "@/constants/ui";

const screenWidth = Dimensions.get("window").width;
const containerPadding = 20;
const cardGap = 12;
const availableWidth = screenWidth - containerPadding * 2;
const VIBE_CARD_WIDTH = (availableWidth - cardGap) / 2;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
    alignItems: "center",
    justifyContent: "center",
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: "absolute",
    right: 0,
  },
  skipText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.gold,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.bgCard,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.gold,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: Colors.lightGrey,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  stepHeader: {
    marginBottom: 32,
    alignItems: "center",
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
  },
  stepSubtitle: {
    fontSize: 14,
    color: Colors.lightGrey,
    lineHeight: 20,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.bgCard,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(57,243,255,0.2)",
    borderStyle: "dashed",
    borderRadius: 60,
  },
  avatarGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.bg,
  },
  avatarLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primaryBlue,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  iconGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.gold,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.lightGrey,
    marginBottom: 16,
    marginLeft: 56,
  },
  bioContainer: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.1)",
  },
  bioInput: {
    fontSize: 14,
    color: Colors.white,
    minHeight: 90,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: Colors.lightGrey,
    textAlign: "right",
    marginTop: 8,
  },
  vibesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  vibeCard: {
    width: VIBE_CARD_WIDTH,
    height: 120,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.bgCard,
    borderWidth: 2,
    borderColor: "transparent",
  },
  vibeCardSelected: {
    borderColor: Colors.gold,
  },
  vibeCardGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  },
  vibeCardContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  vibeEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  vibeName: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.platinum,
    textAlign: "center",
  },
  vibeNameSelected: {
    color: Colors.white,
    fontWeight: "700",
  },
  checkmarkContainer: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  drinksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  drinkCard: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: Colors.bgCard,
    borderWidth: 2,
    borderColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  drinkCardSelected: {
    borderColor: Colors.gold,
    // backgroundColor: 'rgba(194,158,85,0.1)',
  },
  drinkEmoji: {
    fontSize: 24,
  },
  drinkName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.platinum,
  },
  drinkNameSelected: {
    color: Colors.white,
    fontWeight: "700",
  },
  checkmarkSmall: {
    marginLeft: 4,
  },
  bottomSpacer: {
    height: 80,
  },
  footer: {
    padding: 16,
    paddingBottom: 20,
    backgroundColor: Colors.bg,
    borderTopWidth: 0,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.gold,
    paddingVertical: 16,
    borderRadius: 16,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.bgCard,
    shadowOpacity: 0,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.bg,
  },
  nextButtonTextDisabled: {
    color: Colors.lightGrey,
  },
});
