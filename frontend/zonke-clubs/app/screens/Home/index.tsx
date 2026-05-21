import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TextInput,
  ImageBackground,
  ActivityIndicator,
  Modal,
  Image,
  useWindowDimensions,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useScrollToTop } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInLeft,
  FadeOutLeft,
  FadeInRight,
  FadeOutRight,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { getDistance } from "geolib";

import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { TextStroke } from "../Login/utils";
import { getIntentionsForClub, MeetupIntention } from "@/types/meetup";
import { PostIntentionModal } from "@/components/meetup/PostIntentionModal";
import { PeopleBrowse } from "@/components/meetup/PeopleBrowseModal";
import { intentionsService } from "@/services/intentionsService";
import { connectionService } from "@/services/connectionService";
import { BeerLeaderboard } from "@/components/leaderboard/BeerLeaderboard";
import {
  clubsService,
  Club as ApiClub,
  ClubEvent,
} from "@/services/clubsService";
import { useAuth } from "@/contexts/AuthContext";
import { Toast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDebounce } from "@/hooks/useDebounce";
import {
  styles,
  igStyles,
  EVENT_CARD_WIDTH,
  EVENT_CARD_HEIGHT,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} from "./styles";

type Club = {
  id: string;
  name: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  image: string;
  distance?: number;
};

type DiscoverEvent = ClubEvent & {
  clubName: string;
  clubId: string;
  clubLocation: string;
  tableReservationNumbers: string[];
};

type ViewMode = "clubs" | "leaderboard";

const formatDistance = (metres: number): string => {
  if (metres < 1000) return `${metres} m`;
  return `${(metres / 1000).toFixed(1)} km`;
};

const formatEventDate = (dateStr: string): string => {
  const date = new Date(dateStr + "T00:00:00");
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
};

// ── Event viewer screen (full-screen vertical pager) ─────────────────────────
type EventViewerProps = {
  events: DiscoverEvent[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
};

const EventInstagramModal = ({
  events,
  initialIndex,
  visible,
  onClose,
}: EventViewerProps) => {
  const flatListRef = useRef<FlatList<DiscoverEvent>>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const { user } = useAuth();

  // Meetup state
  const [intentions, setIntentions] = useState<MeetupIntention[]>([]);
  const [userIntention, setUserIntention] = useState<MeetupIntention | null>(
    null,
  );
  const [connectionStatuses, setConnectionStatuses] = useState<
    Map<string, { status: string; threadId?: string }>
  >(new Map());
  const [showPostIntention, setShowPostIntention] = useState(false);
  const [showPeopleBrowse, setShowPeopleBrowse] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "success",
  );

  const currentEvent = events[currentIndex];

  const loadIntentions = (clubId: string) => {
    intentionsService
      .getClubIntentions(clubId)
      .then((response) => {
        const all = getIntentionsForClub(response.intentions);
        const mine = user?.id
          ? all.find((i) => i.user.id === user.id) || null
          : null;
        const others = user?.id
          ? all.filter((i) => i.user.id !== user.id)
          : all;
        setUserIntention(mine);
        setIntentions(others);
      })
      .catch(() => setIntentions([]));
  };

  const loadConnectionStatuses = () => {
    Promise.all([
      connectionService.getReceivedRequests(),
      connectionService.getSentRequests(),
    ])
      .then(([receivedReqs, sentReqs]) => {
        const map = new Map<string, { status: string; threadId?: string }>();
        receivedReqs.requests.forEach((req) => {
          map.set(req.sender.id, {
            status: req.status,
            threadId: req.threadId,
          });
        });
        sentReqs.requests.forEach((req) => {
          map.set(req.receiver.id, {
            status: req.status,
            threadId: req.threadId,
          });
        });
        setConnectionStatuses(map);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (visible && currentEvent?.clubId) {
      loadIntentions(currentEvent.clubId);
      loadConnectionStatuses();
    }
  }, [visible, currentIndex]);

  // Jump to the tapped event when the screen opens
  useEffect(() => {
    if (visible && events.length > 0) {
      const t = setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: initialIndex,
          animated: false,
        });
        setCurrentIndex(initialIndex);
      }, 60);
      return () => clearTimeout(t);
    }
  }, [visible, initialIndex]);

  const renderPage = ({
    item,
    index,
  }: {
    item: DiscoverEvent;
    index: number;
  }) => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000)
      .toISOString()
      .split("T")[0];
    const isToday = item.date === today;
    const isTomorrow = item.date === tomorrow;
    const dateLabel = isToday
      ? "Tonight"
      : isTomorrow
        ? "Tomorrow"
        : formatEventDate(item.date);
    const eventIntentions = intentions.filter(
      (i) => i.plannedDate === item.date,
    );
    const userIntentionForEvent =
      userIntention?.plannedDate === item.date ? userIntention : null;

    return (
      <View style={igStyles.page}>
        {/* Image zone */}
        <View style={igStyles.imageZone}>
          <Image
            source={{ uri: item.cover_image }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            resizeMode="cover"
          />
          {/* Subtle fade into panel at the bottom edge */}
        </View>

        {/* Content panel */}
        <View style={igStyles.contentPanel}>
          {/* Club name — tappable heading */}
          <PressableScale
            onPress={() => {
              onClose();
              router.push(`/club/${item.clubId}` as any);
            }}
            style={igStyles.clubNameRow}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Text style={igStyles.clubName} numberOfLines={1}>
                {item.clubName}
              </Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.gold} />
            </View>
            {/* Location */}
            {!!item.clubLocation && (
              <View style={igStyles.locationRow}>
                <Ionicons name="location-sharp" size={16} color={Colors.gold} />
                <Text style={igStyles.locationText} numberOfLines={1}>
                  {item.clubLocation}
                </Text>
              </View>
            )}
          </PressableScale>

          <View style={{ gap: 6 }}>
            {/* Event title */}
            <Text style={igStyles.eventTitle} numberOfLines={2}>
              {item.title}
            </Text>

            {/* Date · time */}
            <View style={igStyles.metaRow}>
              <View style={{ flexDirection: "row", gap: 4 }}>
                <Ionicons
                  name="calendar-outline"
                  size={12}
                  color={Colors.gold}
                />
                <Text style={igStyles.metaDate}>{dateLabel.toUpperCase()}</Text>
              </View>

              <View style={{ flexDirection: "row", gap: 4 }}>
                <Ionicons name="time-outline" size={12} color={Colors.gold} />
                <Text style={igStyles.metaTime}>
                  {item.start_time} – {item.end_time}
                </Text>
              </View>
            </View>

            {/* Description */}
            {!!item.description && (
              <Text style={igStyles.description} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>

          {/* Reserve a table */}
          {item.tableReservationNumbers.length > 0 && (
            <View style={igStyles.reserveSection}>
              <Text style={igStyles.reserveLabel}>RESERVE A TABLE</Text>
              <ScrollView
                horizontal
                keyboardShouldPersistTaps="handled"
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={igStyles.reservePillsRow}
                style={igStyles.reserveScroll}
              >
                {item.tableReservationNumbers.map((num, idx) => (
                  <PressableScale
                    key={idx}
                    style={igStyles.reservePill}
                    onPress={() => Linking.openURL(`tel:${num}`)}
                  >
                    <Ionicons
                      name="call-outline"
                      size={11}
                      color={Colors.gold}
                    />
                    <Text style={igStyles.reservePillText}>{num}</Text>
                  </PressableScale>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Action buttons */}
          <View style={igStyles.actionRow}>
            <PressableScale
              style={igStyles.ghostBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowPeopleBrowse(true);
              }}
            >
              <Ionicons name="people-outline" size={15} color={Colors.gold} />
              <Text style={igStyles.ghostBtnText}>
                {eventIntentions.length > 0
                  ? `${eventIntentions.length} Going`
                  : "Who's Going"}
              </Text>
            </PressableScale>

            <PressableScale
              style={[
                igStyles.solidBtn,
                !!userIntentionForEvent && igStyles.solidBtnActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setShowPostIntention(true);
              }}
            >
              <Ionicons
                name={
                  userIntentionForEvent
                    ? "checkmark-circle"
                    : "add-circle-outline"
                }
                size={15}
                color={Colors.bg}
              />
              <Text style={igStyles.solidBtnText}>
                {userIntentionForEvent ? "I'm in Meetup" : "Meetup"}
              </Text>
            </PressableScale>
          </View>

          <SafeAreaView edges={["bottom"]} />
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      statusBarTranslucent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={igStyles.container}>
        {/* Floating header: close + page counter */}
        <SafeAreaView style={igStyles.floatingHeader} edges={["top"]}>
          <View style={igStyles.headerRow}>
            <PressableScale onPress={onClose} style={igStyles.closeBtn}>
              <Ionicons name="close" size={18} color={Colors.gold} />
            </PressableScale>
          </View>
        </SafeAreaView>

        {/* Vertical paging list */}
        <FlatList
          ref={flatListRef}
          keyboardShouldPersistTaps="handled"
          data={events}
          renderItem={renderPage}
          keyExtractor={(item) => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(
              e.nativeEvent.contentOffset.y / SCREEN_HEIGHT,
            );
            setCurrentIndex(idx);
          }}
          getItemLayout={(_, index) => ({
            length: SCREEN_HEIGHT,
            offset: SCREEN_HEIGHT * index,
            index,
          })}
        />
      </View>

      {/* Post intention modal */}
      {currentEvent && (
        <PostIntentionModal
          visible={showPostIntention}
          clubName={currentEvent.clubName}
          existingIntention={
            userIntention?.plannedDate === currentEvent.date
              ? (userIntention ?? undefined)
              : undefined
          }
          fixedDate={currentEvent.date}
          onClose={() => setShowPostIntention(false)}
          onSubmit={(activityType, plannedDate, message) => {
            intentionsService
              .createIntention({
                club_id: currentEvent.clubId,
                activity_type: activityType,
                planned_date: plannedDate,
                message,
              })
              .then(() => {
                loadIntentions(currentEvent.clubId);
                setToastMessage(
                  "You're in! Interested people can now link up with you.",
                );
                setToastType("success");
                setToastVisible(true);
              })
              .catch(() => {
                setToastMessage("Failed to post status");
                setToastType("error");
                setToastVisible(true);
              });
          }}
          onRemove={() => {
            const intentionToRemove =
              userIntention?.plannedDate === currentEvent.date
                ? userIntention
                : null;
            if (intentionToRemove) {
              intentionsService
                .deleteIntention(intentionToRemove.id)
                .then(() => {
                  setUserIntention(null);
                  loadIntentions(currentEvent.clubId);
                  setToastMessage("Status removed");
                  setToastType("info");
                  setToastVisible(true);
                })
                .catch(() => {
                  setToastMessage("Failed to remove status");
                  setToastType("error");
                  setToastVisible(true);
                });
            }
          }}
        />
      )}

      {/* Browse people modal */}
      <Modal
        visible={showPeopleBrowse}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setShowPeopleBrowse(false)}
      >
        {currentEvent && (
          <PeopleBrowse
            intentions={intentions.filter(
              (i) => i.plannedDate === currentEvent.date,
            )}
            onClose={() => setShowPeopleBrowse(false)}
            onConnect={(intention: MeetupIntention) => {
              connectionService
                .createRequest({
                  receiver_id: intention.user.id,
                  club_id: currentEvent.clubId,
                  intention_id: intention.id,
                })
                .then(() => {
                  loadConnectionStatuses();
                  setToastMessage("Connection request sent!");
                  setToastType("success");
                  setToastVisible(true);
                })
                .catch(() => {
                  setToastMessage("Failed to send request");
                  setToastType("error");
                  setToastVisible(true);
                });
            }}
            connectionStatuses={connectionStatuses}
            currentUserId={user?.id}
            clubName={currentEvent.clubName}
            clubId={currentEvent.clubId}
          />
        )}
      </Modal>
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </Modal>
  );
};

export const HomeScreen = () => {
  const { width: winWidth, height: winHeight } = useWindowDimensions();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<DiscoverEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const [clubsPage, setClubsPage] = useState(1);
  const CLUBS_PAGE_SIZE = 6;
  const [eventsLoading, setEventsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("clubs");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<Club[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [userCoords, setUserCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const listRef = useRef<FlatList>(null);
  useScrollToTop(listRef);

  useEffect(() => {
    Location.requestForegroundPermissionsAsync()
      .then(({ status }) => {
        if (status !== "granted") return null;
        return Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      })
      .then((pos) => {
        if (pos) {
          setUserCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadClubs();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadClubs();
    }, [user]),
  );

  // When search query changes, fetch from API instead of filtering locally
  useEffect(() => {
    if (!debouncedSearchQuery) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    clubsService
      .getClubs(!!user, 1, 50, debouncedSearchQuery)
      .then((response) => {
        const formatted = response.clubs.map(
          (club: ApiClub, index: number) => ({
            id: club.id,
            name: club.name,
            location: club.location,
            image: club.banner_image_url || undefined,
          }),
        );
        setSearchResults(formatted);
      })
      .catch((err) => console.error("Club search failed", err))
      .finally(() => setSearchLoading(false));
  }, [debouncedSearchQuery, user]);

  const loadClubs = () => {
    setLoading(true);
    setEventsLoading(true);
    setError(null);
    setCurrentPage(1);
    setClubsPage(1);
    clubsService
      .getClubs(!!user, 1)
      .then((response) => {
        const formattedClubs = response.clubs.map(
          (club: ApiClub, index: number) => ({
            id: club.id,
            name: club.name,
            location: club.location,
            image: club.banner_image_url || undefined,
          }),
        );
        setClubs(formattedClubs);
        setMaxPage(response.paginate.max_page);

        if (user) {
          const likedState: Record<string, boolean> = {};
          response.clubs.forEach((club: ApiClub) => {
            if (club.is_liked !== undefined) {
              likedState[club.id] = club.is_liked;
            }
          });
          setLiked(likedState);
        }

        setError(null);

        // Fetch published events for all clubs in parallel
        Promise.all(
          response.clubs.map((club) =>
            clubsService
              .getClubEvents(club.id)
              .then((res) =>
                (res.events || [])
                  .filter((e) => e.status === "published")
                  .map((e) => ({
                    ...e,
                    clubName: club.name,
                    clubId: club.id,
                    clubLocation: club.location?.name || "",
                    tableReservationNumbers:
                      club.table_reservation_numbers || [],
                  })),
              )
              .catch(() => [] as DiscoverEvent[]),
          ),
        ).then((eventsArrays) => {
          const allEvents = (eventsArrays as DiscoverEvent[][])
            .flat()
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            );
          setEvents(allEvents);
          setEventsLoading(false);
        });
      })
      .catch((error) => {
        console.error("Failed to load clubs:", error);
        setError(
          "Unable to connect to server. Please check if the backend is running.",
        );
        setEventsLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const loadMoreClubs = () => {
    if (loadingMore || currentPage >= maxPage) return;

    const nextPage = currentPage + 1;
    setLoadingMore(true);
    clubsService
      .getClubs(!!user, nextPage)
      .then((response) => {
        const newClubs = response.clubs.map((club: ApiClub, index: number) => ({
          id: club.id,
          name: club.name,
          location: club.location,
          image: club.banner_image_url || undefined,
        }));
        setClubs((prev) => [...prev, ...newClubs]);
        setCurrentPage(nextPage);
        setMaxPage(response.paginate.max_page);

        if (user) {
          const likedState: Record<string, boolean> = {};
          response.clubs.forEach((club: ApiClub) => {
            if (club.is_liked !== undefined) {
              likedState[club.id] = club.is_liked;
            }
          });
          setLiked((prev) => ({ ...prev, ...likedState }));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  };

  const toggleLike = (clubId: string) => {
    if (!user) return;

    const isCurrentlyLiked = liked[clubId] || false;
    setLiked((prev) => ({ ...prev, [clubId]: !isCurrentlyLiked }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const apiCall = isCurrentlyLiked
      ? clubsService.unlikeClub(clubId)
      : clubsService.likeClub(clubId);

    apiCall
      .then(() => {})
      .catch((error) => {
        console.error("Failed to toggle like:", error);
        setLiked((prev) => ({ ...prev, [clubId]: isCurrentlyLiked }));
      });
  };

  const openClub = (club: Club) => {
    router.push(`/club/${club.id}` as any);
  };

  // ── Event card renderer ─────────────────────────────────────────────────
  const renderEventCard = ({
    item,
    index,
  }: {
    item: DiscoverEvent;
    index: number;
  }) => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000)
      .toISOString()
      .split("T")[0];
    const isToday = item.date === today;
    const isTomorrow = item.date === tomorrow;
    const dateLabel = isToday
      ? "Tonight"
      : isTomorrow
        ? "Tomorrow"
        : formatEventDate(item.date);

    return (
      <Animated.View entering={FadeInDown.delay(index * 70).springify()}>
        <PressableScale
          onPress={() => setFullscreenIndex(index)}
          style={styles.eventCard}
        >
          <ImageBackground
            source={{ uri: item.cover_image }}
            style={styles.eventCardBg}
            imageStyle={styles.eventCardImageStyle}
          >
            {/* DJ count badge — top left */}
            {item.dj_lineup && item.dj_lineup.length > 0 && (
              <View style={styles.eventDJBadge}>
                <Text style={styles.eventDJBadgeText}>{item.clubName}</Text>
              </View>
            )}

            {/* Date badge — top right */}
            <View
              style={[
                styles.eventDateBadge,
                isToday && styles.eventDateBadgeTonight,
              ]}
            >
              {isToday && <Ionicons name="flame" size={11} color={Colors.bg} />}
              <Text
                style={[
                  styles.eventDateBadgeText,
                  isToday && styles.eventDateBadgeTextTonight,
                ]}
              >
                {dateLabel}
              </Text>
            </View>

            {/* Bottom content */}
            <View style={styles.eventCardContent}>
              <View style={styles.eventCardFooter}>
                <View style={{ flex: 1 }} />
                <View style={styles.eventTimePill}>
                  <Ionicons name="time-outline" size={10} color={Colors.gold} />
                  <Text style={styles.eventStartTime}>{item.start_time}</Text>
                </View>
              </View>
            </View>
          </ImageBackground>
        </PressableScale>
      </Animated.View>
    );
  };

  // ── Club card renderer ──────────────────────────────────────────────────
  const renderClub = useCallback(
    ({ item }: { item: Club; index: number }) => {
      return (
        <View>
          <PressableScale onPress={() => openClub(item)} style={styles.card}>
            <ImageBackground
              source={{ uri: item.image }}
              style={styles.cardImage}
              imageStyle={styles.cardImageStyle}
            >
              <View style={styles.goldAccent} />

              <PressableScale
                style={styles.likeButton}
                onPress={() => toggleLike(item.id)}
              >
                <Ionicons
                  name={liked[item.id] ? "heart" : "heart-outline"}
                  size={24}
                  color={liked[item.id] ? Colors.gold : Colors.platinum}
                />
              </PressableScale>

              <View style={styles.cardContent}>
                <Text style={styles.clubName}>{item.name}</Text>

                <View style={styles.locationRow}>
                  <Ionicons
                    name="location-sharp"
                    size={14}
                    color={Colors.gold}
                  />
                  <Text
                    style={styles.locationText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.location.name}
                  </Text>
                  {item.distance != null && (
                    <View style={styles.distancePill}>
                      <Ionicons name="navigate" size={10} color={Colors.gold} />
                      <Text style={styles.distancePillText}>
                        {formatDistance(item.distance)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </ImageBackground>
          </PressableScale>
        </View>
      );
    },
    [liked, userCoords],
  );

  const filteredClubs = useMemo(
    () =>
      clubs.map((c) => ({
        ...c,
        distance:
          userCoords && c.location.latitude && c.location.longitude
            ? getDistance(userCoords, {
                latitude: c.location.latitude,
                longitude: c.location.longitude,
              })
            : undefined,
      })),
    [clubs, userCoords],
  );

  // Reset local page when search changes
  useEffect(() => {
    setClubsPage(1);
  }, [debouncedSearchQuery]);

  const displayedClubs = useMemo(
    () => filteredClubs.slice(0, clubsPage * CLUBS_PAGE_SIZE),
    [filteredClubs, clubsPage],
  );

  const hasMoreClubs =
    displayedClubs.length < filteredClubs.length || currentPage < maxPage;

  const handleClubsEndReached = useCallback(() => {
    if (loadingMore || debouncedSearchQuery) return;

    if (displayedClubs.length < filteredClubs.length) {
      setLoadingMore(true);
      setTimeout(() => {
        setClubsPage((p) => p + 1);
        setLoadingMore(false);
      }, 400);
      return;
    }

    loadMoreClubs();
  }, [
    loadingMore,
    debouncedSearchQuery,
    displayedClubs.length,
    filteredClubs.length,
  ]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        {/* Title + search icon side by side */}
        <View style={styles.titleRow}>
          <TextStroke stroke={0.6} color={Colors.gold}>
            <Text style={styles.title}>Discover</Text>
          </TextStroke>
          <PressableScale
            style={styles.searchIconBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const next = !showSearch;
              setShowSearch(next);
              if (!next) {
                setSearchQuery("");
                setSearchFocused(false);
              } else {
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }
            }}
          >
            <Ionicons
              name={showSearch ? "close" : "search-outline"}
              size={20}
              color={showSearch ? Colors.gold : Colors.smoke}
            />
          </PressableScale>
        </View>
      </View>

      {/* ── Clubs / Leaderboard Toggle  ↔  Club Search Bar ── */}
      <View style={styles.toggleSlot}>
        {showSearch ? (
          <Animated.View
            key="search"
            entering={FadeInLeft.duration(220).springify()}
            exiting={FadeOutLeft.duration(180)}
            style={[styles.toggleContainer, styles.searchRow]}
          >
            <Ionicons name="search" size={16} color={Colors.smoke} />
            <TextInput
              ref={searchInputRef}
              placeholder="Search clubs..."
              placeholderTextColor={Colors.smoke}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={styles.searchInput}
              returnKeyType="search"
              autoFocus
            />
            {searchQuery.length > 0 && (
              <PressableScale onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={16} color={Colors.smoke} />
              </PressableScale>
            )}
          </Animated.View>
        ) : (
          <Animated.View
            key="toggle"
            entering={FadeInRight.duration(220).springify()}
            exiting={FadeOutRight.duration(180)}
            style={styles.toggleContainer}
          >
            <PressableScale
              style={[
                styles.toggleButton,
                viewMode === "clubs" && styles.toggleButtonActive,
              ]}
              onPress={() => {
                setViewMode("clubs");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  viewMode === "clubs" && styles.toggleButtonTextActive,
                ]}
              >
                Clubs
              </Text>
            </PressableScale>
            <PressableScale
              style={[
                styles.toggleButton,
                viewMode === "leaderboard" && styles.toggleButtonActive,
              ]}
              onPress={() => {
                setViewMode("leaderboard");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  viewMode === "leaderboard" && styles.toggleButtonTextActive,
                ]}
              >
                Leaderboard
              </Text>
            </PressableScale>
          </Animated.View>
        )}
      </View>

      {/* ── Main Content ── */}
      {viewMode === "clubs" ? (
        <FlatList
          ref={listRef}
          keyboardShouldPersistTaps="handled"
          data={debouncedSearchQuery ? searchResults : displayedClubs}
          keyExtractor={(item) => item.id}
          renderItem={renderClub}
          extraData={{ liked, userCoords }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={
            debouncedSearchQuery ? undefined : handleClubsEndReached
          }
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            debouncedSearchQuery ? (
              searchLoading ? (
                <ActivityIndicator
                  size="small"
                  color={Colors.gold}
                  style={{ marginVertical: 16 }}
                />
              ) : searchResults.length === 0 ? (
                <Text style={styles.clubsEndText}>No clubs found</Text>
              ) : null
            ) : filteredClubs.length > 0 ? (
              loadingMore ? (
                <ActivityIndicator
                  size="small"
                  color={Colors.gold}
                  style={{ marginVertical: 16 }}
                />
              ) : !hasMoreClubs ? (
                <Text style={styles.clubsEndText}>
                  {filteredClubs.length}{" "}
                  {filteredClubs.length === 1 ? "club" : "clubs"} near you
                </Text>
              ) : null
            ) : null
          }
          ListHeaderComponent={
            <>
              {/* ── Events Carousel ── */}
              {events.length > 0 && (
                <View style={styles.eventsSectionWrapper}>
                  <View style={styles.sectionHeaderRow}>
                    <View style={styles.eventsTitleRow}>
                      <Ionicons name="flame" size={16} color={Colors.gold} />
                      <Text style={[styles.sectionHeader, { marginLeft: 6 }]}>
                        Upcoming Events
                      </Text>
                    </View>
                    <View
                      style={[styles.sectionHeaderLine, { marginLeft: 8 }]}
                    />
                  </View>

                  {eventsLoading ? (
                    <View style={styles.eventsLoadingRow}>
                      {[0, 1, 2].map((i) => (
                        <View key={i} style={styles.eventCardSkeleton} />
                      ))}
                    </View>
                  ) : events.length > 0 ? (
                    <FlatList
                      keyboardShouldPersistTaps="handled"
                      data={events}
                      keyExtractor={(item) => item.id}
                      renderItem={renderEventCard}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.eventsCarousel}
                      contentContainerStyle={styles.eventsCarouselContent}
                      snapToInterval={EVENT_CARD_WIDTH + 12}
                      snapToAlignment="start"
                      decelerationRate="fast"
                    />
                  ) : (
                    <View style={styles.eventsEmpty}>
                      <Ionicons
                        name="calendar-outline"
                        size={26}
                        color={Colors.smoke}
                      />
                      <Text style={styles.eventsEmptyText}>
                        No upcoming events nearby
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* ── Clubs Near You header ── */}
              <View style={styles.sectionHeaderRow}>
                <View style={styles.eventsTitleRow}>
                  <Ionicons name="location" size={16} color={Colors.gold} />
                  <Text style={[styles.sectionHeader, { marginLeft: 6 }]}>
                    Clubs Near You
                  </Text>
                </View>
                <View style={styles.sectionHeaderLine} />
              </View>
            </>
          }
          ListEmptyComponent={
            loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.gold} />
                <Text style={styles.loadingText}>Loading clubs...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color={Colors.gold} />
                <Text style={styles.errorText}>{error}</Text>
                <PressableScale onPress={loadClubs} style={styles.retryButton}>
                  <Ionicons name="refresh" size={20} color={Colors.bg} />
                  <Text style={styles.retryButtonText}>Retry</Text>
                </PressableScale>
              </View>
            ) : (
              <EmptyState
                icon="storefront-outline"
                title="No clubs yet"
                subtitle="Clubs in your area will appear here once they sign up."
                style={{ paddingTop: 80 }}
              />
            )
          }
        />
      ) : (
        /* Leaderboard */
        <BeerLeaderboard />
      )}
      {/* ── Instagram-style Event Viewer ── */}
      <EventInstagramModal
        events={events}
        initialIndex={fullscreenIndex ?? 0}
        visible={fullscreenIndex !== null}
        onClose={() => setFullscreenIndex(null)}
      />
    </SafeAreaView>
  );
};
