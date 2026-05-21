import { Dimensions, StyleSheet } from "react-native";
import { Colors } from "@/constants/ui";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export { SCREEN_WIDTH, SCREEN_HEIGHT };

export const EVENT_CARD_WIDTH =
  SCREEN_WIDTH * (SCREEN_WIDTH < 600 ? 0.65 : 0.5);
export const EVENT_CARD_HEIGHT = 200;
export const IG_IMAGE_HEIGHT = SCREEN_HEIGHT * 0.62;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: 16,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    paddingTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchIconBtn: {
    padding: 4,
    marginTop: 4,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(57, 243, 255, 0.1)",
    borderRadius: 10,
    padding: 2,
    gap: 2,
  },
  viewToggleButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  viewToggleButtonActive: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.gold,
  },

  // ── Tabs toggle ──────────────────────────────────────────────────────────
  toggleSlot: {
    overflow: "hidden",
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 4,
    marginTop: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.15)",
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  toggleButtonActive: {
    backgroundColor: Colors.gold,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  toggleButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.smoke,
    letterSpacing: 0.3,
  },
  toggleButtonTextActive: {
    color: Colors.bg,
    fontWeight: "800",
  },

  // ── Section headers ──────────────────────────────────────────────────────
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionHeader: {
    color: Colors.platinum,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(57, 243, 255, 0.2)",
  },

  // ── Events carousel ──────────────────────────────────────────────────────
  eventsSectionWrapper: {
    marginTop: 6,
    marginBottom: 4,
  },
  eventsTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventsCarousel: {
    marginHorizontal: -16,
    marginBottom: 8,
  },
  eventsCarouselContent: {
    paddingHorizontal: 16,
    paddingRight: 28,
  },

  // Event card
  eventCard: {
    width: EVENT_CARD_WIDTH,
    height: EVENT_CARD_HEIGHT,
    borderRadius: 18,
    overflow: "hidden",
    marginRight: 12,
    backgroundColor: Colors.bgCard,
  },
  eventCardBg: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  eventCardImageStyle: {
    borderRadius: 18,
  },

  // DJ count badge — top left
  eventDJBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "rgba(8,8,13,0.65)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.35)",
  },
  eventDJBadgeText: {
    color: Colors.gold,
    fontSize: 11,
    fontWeight: "700",
  },

  // Date badge — top right
  eventDateBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "rgba(8,8,13,0.65)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  eventDateBadgeTonight: {
    backgroundColor: Colors.gold,
    borderColor: "transparent",
  },
  eventDateBadgeText: {
    color: Colors.platinum,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  eventDateBadgeTextTonight: {
    color: Colors.bg,
  },

  // Card content
  eventCardContent: {
    padding: 12,
    paddingTop: 4,
  },
  eventCardTitle: {
    color: Colors.platinum,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.2,
    marginBottom: 3,
  },
  eventCardClubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  eventCardClubName: {
    color: Colors.secondaryBlue,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  eventCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  eventReservePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: "rgba(212,175,55,0.12)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.3)",
  },
  eventReserveText: {
    color: Colors.gold,
    fontSize: 11,
    fontWeight: "700",
  },
  eventPricePillVip: {
    backgroundColor: "rgba(212,175,55,0.15)",
    borderColor: "rgba(212,175,55,0.4)",
  },
  eventPriceTextVip: {
    color: Colors.gold,
  },
  eventTimePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: "rgba(8,8,13,0.65)",
  },
  eventStartTime: {
    color: Colors.platinum,
    fontSize: 11,
    fontWeight: "600",
  },

  // Skeleton / empty
  eventsLoadingRow: {
    flexDirection: "row",
    marginHorizontal: -16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  eventCardSkeleton: {
    width: EVENT_CARD_WIDTH,
    height: EVENT_CARD_HEIGHT,
    borderRadius: 18,
    backgroundColor: Colors.bgCard,
    opacity: 0.45,
    marginRight: 12,
  },
  eventsEmpty: {
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.08)",
    marginBottom: 8,
  },
  eventsEmptyText: {
    color: Colors.smoke,
    fontSize: 14,
    fontWeight: "500",
  },

  // ── Search bar ───────────────────────────────────────────────────────────
  searchRow: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.1)",
  },
  searchRowFocused: {
    borderColor: Colors.gold,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  searchInput: {
    flex: 1,
    color: Colors.white,
    paddingHorizontal: 12,
    fontSize: 15,
  },

  // ── Club cards ───────────────────────────────────────────────────────────
  listContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: Colors.bgCard,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cardImage: {
    width: "100%",
    height: 220,
    justifyContent: "flex-end",
  },
  cardImageStyle: {
    borderRadius: 20,
  },
  goldAccent: {
    position: "absolute",
    left: 0,
    top: 20,
    bottom: 20,
    width: 3,
    backgroundColor: Colors.gold,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  likeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(10, 10, 15, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    padding: 16,
    paddingTop: 8,
  },
  clubName: {
    color: Colors.platinum,
    fontWeight: "800",
    fontSize: 22,
    letterSpacing: 0.5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  locationText: {
    flexShrink: 1,
    color: Colors.white,
    fontSize: 13,
  },
  distancePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
    backgroundColor: "rgba(212,175,55,0.12)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.3)",
  },
  distancePillText: {
    color: Colors.gold,
    fontSize: 11,
    fontWeight: "600",
  },

  // ── Loading / Error ──────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  loadingText: {
    color: Colors.platinum,
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  errorText: {
    color: Colors.platinum,
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.gold,
    borderRadius: 12,
  },
  retryButtonText: {
    color: Colors.bg,
    fontSize: 16,
    fontWeight: "700",
  },

  // ── Video feed ───────────────────────────────────────────────────────────
  videoFeedContainer: {
    flex: 1,
    marginHorizontal: -16,
  },
  videoSearchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    marginTop: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.1)",
  },
  videoSearchRowFocused: {
    borderColor: Colors.gold,
    backgroundColor: "rgba(212, 175, 55, 0.05)",
  },
  videoSearchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.white,
    paddingVertical: 0,
  },

  // unused but kept for compatibility
  activeGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.gold,
    opacity: 0.1,
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.smoke,
    letterSpacing: 0.3,
  },
  toggleTextActive: {
    color: Colors.bg,
    fontWeight: "800",
  },
  toggleEmoji: {
    fontSize: 20,
  },

  // ── End-of-list label ─────────────────────────────────────────────────────
  clubsEndText: {
    color: Colors.smoke,
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 20,
  },

  // ── Nearby Clubs strip ────────────────────────────────────────────────────
  nearbySection: {
    marginBottom: 4,
  },
  nearbyScrollContent: {
    paddingHorizontal: 2,
    paddingBottom: 8,
    gap: 12,
  },
  nearbyCard: {
    width: 120,
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
  },
  nearbyCardImage: {
    width: 120,
    height: 160,
    justifyContent: "flex-end",
  },
  nearbyCardImageStyle: {
    borderRadius: 16,
  },
  nearbyCardGradient: {
    padding: 10,
    paddingTop: 32,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  nearbyDistanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    alignSelf: "flex-start",
    backgroundColor: Colors.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 6,
  },
  nearbyDistanceText: {
    color: Colors.bg,
    fontSize: 10,
    fontWeight: "700",
  },
  nearbyCardName: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 16,
  },
});

export const igStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  pageCounter: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  page: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: Colors.bg,
  },

  imageZone: {
    width: SCREEN_WIDTH,
    height: IG_IMAGE_HEIGHT,
  },

  pageContent: {
    flex: 1,
  },
  pageContentInner: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 16,
    justifyContent: "space-between",
  },

  clubNameRow: {
    flexDirection: "column",
    alignItems: "center",
  },

  djLine: {
    color: "rgba(57,243,255,0.75)",
    fontSize: 12,
    fontWeight: "400",
    letterSpacing: 0.5,
    lineHeight: 18,
    marginBottom: 12,
  },

  contentPanel: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 16,
    paddingTop: 14,
    justifyContent: "space-between",
  },

  clubName: {
    color: Colors.gold,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    color: Colors.white,
    fontSize: 14,
    flex: 1,
  },

  eventTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
    lineHeight: 26,
    marginTop: 4,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  metaDate: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
  },
  metaTime: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: "400",
  },

  description: {
    color: Colors.white,
    fontSize: 14,
    lineHeight: 17,
  },

  reserveSection: {
    gap: 6,
    marginTop: 2,
  },
  reserveLabel: {
    color: Colors.gold,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
  },
  reserveScroll: {
    marginHorizontal: -22,
  },
  reservePillsRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingHorizontal: 22,
  },
  reservePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(57,243,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.2)",
  },
  reservePillText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.2,
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  ghostBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.35)",
    backgroundColor: "rgba(57,243,255,0.04)",
  },
  ghostBtnText: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: "600",
  },
  solidBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 6,
    backgroundColor: Colors.gold,
  },
  solidBtnActive: {
    backgroundColor: Colors.accentLight,
  },
  solidBtnText: {
    color: Colors.bg,
    fontSize: 13,
    fontWeight: "700",
  },

  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 16,
  },
  viewBtnText: {
    color: Colors.bg,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
