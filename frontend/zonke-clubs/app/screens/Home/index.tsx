import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { TextStroke } from "../Login/utils";
import { InterestedPeopleRow } from "@/components/meetup/InterestedPeopleRow";
import { getIntentionsForClub } from "@/types/meetup";
import { BeerLeaderboard } from "@/components/leaderboard/BeerLeaderboard";
import { clubsService, Club as ApiClub } from "@/services/clubsService";
import { useAuth } from "@/contexts/AuthContext";
import { ClubVideoFeed } from "@/components/discover/ClubVideoFeed";
import { getAllClubVideos } from "@/data/clubVideos";

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

type ViewMode = "clubs" | "leaderboard";
type ClubViewMode = "cards" | "videos";

// Placeholder images for clubs (we'll use random unsplash images)
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

export const HomeScreen = () => {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [searchFocused, setSearchFocused] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("clubs");
  const [clubViewMode, setClubViewMode] = useState<ClubViewMode>(
    (params.clubViewMode as ClubViewMode) || "cards",
  );
  const [videoFeed, setVideoFeed] = useState<any[]>([]);
  const [videoSearchQuery, setVideoSearchQuery] = useState("");
  const [videoSearchFocused, setVideoSearchFocused] = useState(false);

  useEffect(() => {
    loadClubs();
  }, []);

  // Reload clubs when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadClubs();
    }, [user]),
  );

  console.log(
    "vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv",
    clubs,
  );

  const loadClubs = () => {
    setLoading(true);
    setError(null);
    // Pass true if user is authenticated to get is_liked field
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

        // Initialize liked state from API response (is_liked field)
        if (user) {
          const likedState: Record<string, boolean> = {};
          response.clubs.forEach((club: ApiClub) => {
            if (club.is_liked !== undefined) {
              likedState[club.id] = club.is_liked;
            }
          });
          setLiked(likedState);
        }

        // Generate video feed from clubs
        const videos = getAllClubVideos(
          response.clubs.map((club) => ({
            id: club.id,
            name: club.name,
            location: club.location,
          })),
        );
        setVideoFeed(videos);

        setError(null);
      })
      .catch((error) => {
        console.error("Failed to load clubs:", error);
        setError(
          "Unable to connect to server. Please check if the backend is running.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const toggleLike = (clubId: string) => {
    // If user is not authenticated, do nothing or redirect to login
    if (!user) {
      return;
    }

    const isCurrentlyLiked = liked[clubId] || false;

    // Optimistic update
    setLiked((prev) => ({ ...prev, [clubId]: !isCurrentlyLiked }));

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Call backend API
    const apiCall = isCurrentlyLiked
      ? clubsService.unlikeClub(clubId)
      : clubsService.likeClub(clubId);

    apiCall
      .then(() => {
        // Success - optimistic update already applied
      })
      .catch((error) => {
        console.error("Failed to toggle like:", error);
        // Revert optimistic update on error
        setLiked((prev) => ({ ...prev, [clubId]: isCurrentlyLiked }));
      });
  };

  const openClub = (club: Club) => {
    router.push(`/club/${club.id}` as any);
  };

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
            {/* Gradient overlay for better text readability */}
            {/* <LinearGradient
              colors={['transparent', 'rgba(10, 10, 15, 0.4)', 'rgba(10, 10, 15, 0.6)']}
              style={styles.cardGradient}
            /> */}

            {/* Accent line */}
            <View style={styles.goldAccent} />

            {/* Like button */}
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

            {/* Card content */}
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

              {/* People looking to meet */}
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
      {/* Header with View Toggle or Search */}
      <View style={styles.header}>
        <TextStroke stroke={0.6} color={Colors.secondaryBlue}>
          <Text style={styles.title}>Discover</Text>
        </TextStroke>

        {/* Compact View Mode Toggle */}
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

      {/* Video Search Bar - only show in videos mode */}
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

      {/* Clubs/Leaderboard Toggle - only show in cards mode */}
      {clubViewMode === "cards" && (
        <View style={styles.toggleContainer}>
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
        </View>
      )}

      {/* Clubs Content */}
      {clubViewMode === "cards" ? (
        viewMode === "clubs" ? (
          <>
            {/* Search bar */}
            <View
              style={[
                styles.searchRow,
                searchFocused && styles.searchRowFocused,
              ]}
            >
              <Ionicons
                name="search"
                size={20}
                color={searchFocused ? Colors.gold : Colors.white}
              />
              <TextInput
                placeholder="Search clubs..."
                placeholderTextColor={Colors.lightGrey}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setSearchFocused(true)}
                // onBlur={() => setSearchFocused(false)}
                style={styles.searchInput}
              />
              {searchQuery.length > 0 && (
                <PressableScale onPress={() => setSearchQuery("")}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={Colors.smoke}
                  />
                </PressableScale>
              )}
            </View>

            {/* Section Header */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>Clubs Near You</Text>
              <View style={styles.sectionHeaderLine} />
            </View>

            {/* Loading state */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.gold} />
                <Text style={styles.loadingText}>Loading clubs...</Text>
              </View>
            ) : error ? (
              /* Error state */
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color={Colors.gold} />
                <Text style={styles.errorText}>{error}</Text>
                <PressableScale onPress={loadClubs} style={styles.retryButton}>
                  <Ionicons name="refresh" size={20} color={Colors.bg} />
                  <Text style={styles.retryButtonText}>Retry</Text>
                </PressableScale>
              </View>
            ) : (
              /* Clubs list */
              <FlatList
                data={filteredClubs}
                keyExtractor={(item) => item.id}
                renderItem={renderClub}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            )}
          </>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: 16,
  },
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
    overflow: "hidden",
    position: "relative",
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
  activeGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.gold,
    opacity: 0.1,
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
  searchRow: {
    height: 52,
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    marginVertical: 16,
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
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
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
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(57, 243, 255, 0.1)",
    borderRadius: 10,
    padding: 2,
    gap: 2,
    // borderWidth: 1,
    // borderColor: 'rgba(255, 255, 255, 0.1)',
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
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
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
});
