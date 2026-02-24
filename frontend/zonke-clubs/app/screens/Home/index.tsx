import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ScrollView,
  TextInput,
  ImageBackground,
  ActivityIndicator,
  Dimensions,
  Modal,
  Image,
  useWindowDimensions,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInLeft,
  FadeOutLeft,
  FadeInRight,
  FadeOutRight,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { TextStroke } from "../Login/utils";
import { InterestedPeopleRow } from "@/components/meetup/InterestedPeopleRow";
import {
  getIntentionsForClub,
  MeetupIntention,
  ActivityType,
} from "@/types/meetup";
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
import { ClubVideoFeed } from "@/components/discover/ClubVideoFeed";
import { getAllClubVideos } from "@/data/clubVideos";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const EVENT_CARD_WIDTH = SCREEN_WIDTH * 0.72;
const EVENT_CARD_HEIGHT = 200;
const IG_IMAGE_HEIGHT = SCREEN_HEIGHT * 0.62;

type Club = {
  id: string;
  name: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  image: string;
};

type DiscoverEvent = ClubEvent & {
  clubName: string;
  clubId: string;
  clubLocation: string;
  tableReservationNumbers: string[];
};

type ViewMode = "clubs" | "leaderboard";
type ClubViewMode = "cards" | "videos";

const getPlaceholderImage = (index: number) => {
  const images = [
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=60",
  ];
  return images[index % images.length];
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

    return (
      <View style={igStyles.page}>
        {/* Image zone */}
        <View style={igStyles.imageZone}>
          <Image
            source={{ uri: item.cover_image || getPlaceholderImage(index) }}
            style={StyleSheet.absoluteFill}
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
                {intentions.length > 0
                  ? `${intentions.length} Going`
                  : "Who's Going"}
              </Text>
            </PressableScale>

            <PressableScale
              style={[
                igStyles.solidBtn,
                !!userIntention && igStyles.solidBtnActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setShowPostIntention(true);
              }}
            >
              <Ionicons
                name={userIntention ? "checkmark-circle" : "add-circle-outline"}
                size={15}
                color={Colors.bg}
              />
              <Text style={igStyles.solidBtnText}>
                {userIntention ? "I'm Going" : "Join Meetup"}
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
          existingIntention={userIntention ?? undefined}
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
              .then(() => loadIntentions(currentEvent.clubId))
              .catch(() => {});
          }}
          onRemove={() => {
            if (userIntention) {
              intentionsService
                .deleteIntention(userIntention.id)
                .then(() => {
                  setUserIntention(null);
                  loadIntentions(currentEvent.clubId);
                })
                .catch(() => {});
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
            intentions={intentions}
            onConnect={(intention: MeetupIntention) => {
              connectionService
                .createRequest({
                  receiver_id: intention.user.id,
                  club_id: currentEvent.clubId,
                  intention_id: intention.id,
                })
                .then(() => loadConnectionStatuses())
                .catch(() => {});
            }}
            connectionStatuses={connectionStatuses}
            currentUserId={user?.id}
            clubName={currentEvent.clubName}
            clubId={currentEvent.clubId}
          />
        )}
      </Modal>
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
  const [eventsLoading, setEventsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("clubs");
  const [clubViewMode, setClubViewMode] = useState<ClubViewMode>(
    (params.clubViewMode as ClubViewMode) || "cards",
  );
  const [videoFeed, setVideoFeed] = useState<any[]>([]);
  const [videoSearchQuery, setVideoSearchQuery] = useState("");
  const [videoSearchFocused, setVideoSearchFocused] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);

  useEffect(() => {
    loadClubs();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadClubs();
    }, [user]),
  );

  const loadClubs = () => {
    setLoading(true);
    setEventsLoading(true);
    setError(null);

    clubsService
      .getClubs(!!user)
      .then((response) => {
        const formattedClubs = response.clubs.map(
          (club: ApiClub, index: number) => ({
            id: club.id,
            name: club.name,
            location: club.location,
            image: getPlaceholderImage(index),
          }),
        );
        setClubs(formattedClubs);

        if (user) {
          const likedState: Record<string, boolean> = {};
          response.clubs.forEach((club: ApiClub) => {
            if (club.is_liked !== undefined) {
              likedState[club.id] = club.is_liked;
            }
          });
          setLiked(likedState);
        }

        const videos = getAllClubVideos(
          response.clubs.map((club) => ({
            id: club.id,
            name: club.name,
            location: club.location,
          })),
        );
        setVideoFeed(videos);
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
            source={{ uri: item.cover_image || getPlaceholderImage(index) }}
            style={styles.eventCardBg}
            imageStyle={styles.eventCardImageStyle}
          >
            {/* Dark gradient overlay */}
            {/* <LinearGradient
              colors={["transparent", "rgba(8,8,13,0.45)", "rgba(8,8,13,0.94)"]}
              style={StyleSheet.absoluteFillObject}
            /> */}

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
  const renderClub = ({ item, index }: { item: Club; index: number }) => {
    const intentions = getIntentionsForClub([]);

    return (
      <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
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
                <Ionicons name="location-sharp" size={14} color={Colors.gold} />
                <Text
                  style={styles.locationText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.location.name}
                </Text>
              </View>

              <InterestedPeopleRow
                intentions={intentions}
                onPress={() =>
                  router.push(`/people-browse?clubId=${item.id}` as any)
                }
              />
            </View>
          </ImageBackground>
        </PressableScale>
      </Animated.View>
    );
  };

  const filteredClubs = clubs.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredVideos = videoFeed.filter(
    (video) =>
      video.clubName.toLowerCase().includes(videoSearchQuery.toLowerCase()) ||
      video.clubLocation
        ?.toLowerCase()
        .includes(videoSearchQuery.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        {/* Title + search icon side by side */}
        <View style={styles.titleRow}>
          <TextStroke stroke={0.6} color={Colors.secondaryBlue}>
            <Text style={styles.title}>Discover</Text>
          </TextStroke>
          <PressableScale
            style={styles.searchIconBtn}
            onPress={() => {
              const next = !showSearch;
              setShowSearch(next);
              if (!next) {
                setSearchQuery("");
                setSearchFocused(false);
              } else {
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Ionicons
              name={showSearch ? "close" : "search-outline"}
              size={20}
              color={showSearch ? Colors.gold : Colors.smoke}
            />
          </PressableScale>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.viewToggle}>
            <PressableScale
              style={[
                styles.viewToggleButton,
                clubViewMode === "cards" && styles.viewToggleButtonActive,
              ]}
              onPress={() => setClubViewMode("cards")}
            >
              <Ionicons
                name="grid"
                size={16}
                color={clubViewMode === "cards" ? Colors.gold : Colors.smoke}
              />
            </PressableScale>

            <PressableScale
              style={[
                styles.viewToggleButton,
                clubViewMode === "videos" && styles.viewToggleButtonActive,
              ]}
              onPress={() => setClubViewMode("videos")}
            >
              <Ionicons
                name="play-circle"
                size={16}
                color={clubViewMode === "videos" ? Colors.gold : Colors.smoke}
              />
            </PressableScale>
          </View>
        </View>
      </View>

      {/* ── Video Search Bar (videos mode only) ── */}
      {clubViewMode === "videos" && (
        <View
          style={[
            styles.videoSearchRow,
            videoSearchFocused && styles.videoSearchRowFocused,
          ]}
        >
          <Ionicons
            name="search"
            size={20}
            color={videoSearchFocused ? Colors.gold : Colors.white}
          />
          <TextInput
            placeholder="Search videos by club..."
            placeholderTextColor={Colors.lightGrey}
            value={videoSearchQuery}
            onChangeText={setVideoSearchQuery}
            onFocus={() => setVideoSearchFocused(true)}
            onBlur={() => setVideoSearchFocused(false)}
            style={styles.videoSearchInput}
          />
          {videoSearchQuery.length > 0 && (
            <PressableScale onPress={() => setVideoSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={Colors.smoke} />
            </PressableScale>
          )}
        </View>
      )}

      {/* ── Clubs / Leaderboard Toggle  ↔  Club Search Bar ── */}
      {clubViewMode === "cards" && (
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
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color={Colors.smoke}
                  />
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
      )}

      {/* ── Main Content ── */}
      {clubViewMode === "cards" ? (
        viewMode === "clubs" ? (
          <FlatList
            data={filteredClubs}
            keyExtractor={(item) => item.id}
            renderItem={renderClub}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <>
                {/* ── Events Carousel ── */}
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
                  <PressableScale
                    onPress={loadClubs}
                    style={styles.retryButton}
                  >
                    <Ionicons name="refresh" size={20} color={Colors.bg} />
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </PressableScale>
                </View>
              ) : null
            }
          />
        ) : (
          /* Leaderboard */
          <FlatList
            data={[{ key: "leaderboard" }]}
            renderItem={() => <BeerLeaderboard />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        /* Videos view */
        <View style={styles.videoFeedContainer}>
          <ClubVideoFeed
            videos={filteredVideos}
            onLike={toggleLike}
            likedClubs={liked}
          />
        </View>
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

const styles = StyleSheet.create({
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
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
    height: 52,
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    marginBottom: 16,
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
    height: 52,
    color: Colors.platinum,
    paddingHorizontal: 12,
    fontSize: 15,
  },

  // ── Club cards ───────────────────────────────────────────────────────────
  listContent: {
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
    flex: 1,
    color: Colors.white,
    fontSize: 13,
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
});

// ── Event viewer styles ───────────────────────────────────────────────────────
const igStyles = StyleSheet.create({
  // Root container
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  // Floating header (close + counter) — sits above the FlatList
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

  // ── Full-screen page ────────────────────────────────────────────────────────
  page: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: Colors.bg,
  },

  // Fixed-height image at the top of each page
  imageZone: {
    width: SCREEN_WIDTH,
    height: IG_IMAGE_HEIGHT,
  },

  // Content in normal flow below the image
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

  // Club name — dominant headline
  clubNameRow: {
    flexDirection: "column",
    alignItems: "center",
    // justifyContent: "space-between",
  },

  // DJ line
  djLine: {
    color: "rgba(57,243,255,0.75)",
    fontSize: 12,
    fontWeight: "400",
    letterSpacing: 0.5,
    lineHeight: 18,
    marginBottom: 12,
  },

  // ── Content panel ──────────────────────────────────────────────────────────
  contentPanel: {
    flex: 1,
    backgroundColor: "#0a0d14",
    paddingHorizontal: 16,
    paddingTop: 14,
    justifyContent: "space-between",
  },

  // Club name
  clubName: {
    color: Colors.gold,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  // Location row
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

  // Event title
  eventTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
    lineHeight: 26,
    marginTop: 4,
  },

  // Date · time meta
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

  // Description
  description: {
    color: Colors.white,
    fontSize: 14,
    lineHeight: 17,
  },

  // Reserve section
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

  // Action row — two equal buttons
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
    borderRadius: 12,
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

  // Legacy CTA (kept in case referenced elsewhere)
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
