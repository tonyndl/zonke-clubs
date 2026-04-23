import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInRight,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { Toast } from "@/components/ui/Toast";
import * as Haptics from "expo-haptics";
import { userService } from "@/services/userService";
import { connectionService } from "@/services/connectionService";
import { clubsService, Club as ApiClub } from "@/services/clubsService";
import { User } from "@/services/authService";
import { TextStroke } from "../screens/Login/utils";
import { styles as profileStyles } from "./../(tabs)/profile/styles";
import { BeerStatsTab } from "@/components/beer-analytics/BeerStatsTab";
import { UserMediaGrid } from "@/components/profile/UserMediaGrid";
import { ClubFeedViewer } from "@/components/club/ClubFeedViewer";
import { ClubPost } from "@/types/post";
import postsService from "@/services/postsService";

const VIBE_OPTIONS = [
  { emoji: "💃", name: "Dancing" },
  { emoji: "🎉", name: "High Energy" },
  { emoji: "✨", name: "VIP Lounges" },
  { emoji: "😌", name: "Chilled" },
];

const getPlaceholderImage = (index: number) => {
  const images = [
    "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=400&q=60",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=60",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=400&q=60",
  ];
  return images[index % images.length];
};

export default function ViewProfileScreen() {
  const { id, clubId } = useLocalSearchParams<{
    id: string;
    clubId?: string;
  }>();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isRequestSending, setIsRequestSending] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [requestExpired, setRequestExpired] = useState(false);
  const [connectionAccepted, setConnectionAccepted] = useState(false);
  const [chatThreadId, setChatThreadId] = useState<string | undefined>(
    undefined,
  );
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "success",
  );

  const [activeTab, setActiveTab] = useState<"info" | "feed" | "beer-stats">(
    "info",
  );
  const [allClubs, setAllClubs] = useState<
    Array<{ id: string; name: string; image: string; location: string }>
  >([]);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
  const [userPosts, setUserPosts] = useState<ClubPost[]>([]);
  const [showFeedViewer, setShowFeedViewer] = useState(false);
  const [feedInitialIndex, setFeedInitialIndex] = useState(0);

  const clubNames: Record<string, string> = {};
  allClubs.forEach((club) => {
    clubNames[club.id] = club.name;
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    userService
      .getUserById(id)
      .then((fetchedUser) => setUser(fetchedUser))
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    clubsService
      .getClubs(false)
      .then((response) => {
        setAllClubs(
          response.clubs.map((club: ApiClub, index: number) => ({
            id: club.id,
            name: club.name,
            location: club.location.name,
            image: getPlaceholderImage(index),
          })),
        );
      })
      .catch(() => {})
      .finally(() => setLoadingClubs(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      postsService
        .getUserPostsById(id)
        .then((response) => {
          const posts = response.posts.map((post) => ({
            id: post.id,
            clubId: post.club_id,
            clubName: post.club_name || undefined,
            description: post.caption || undefined,
            likes: post.like_count || 0,
            likeCount: post.like_count || 0,
            isLiked: post.has_liked || false,
            comments: 0,
            status: post.status,
            isClubApproved: post.is_club_approved,
            clubApprovedAt: post.club_approved_at,
            pinnedAt: post.pinned_at || undefined,
            createdAt: post.inserted_at,
            media: post.assets.map((asset) => ({
              id: asset.id,
              type: asset.type as "image" | "video",
              url: asset.url,
              thumbnailUrl: asset.type === "video" ? asset.url : undefined,
              duration: asset.duration,
              startTime: asset.start_time || undefined,
              endTime: asset.end_time || undefined,
            })),
            user: {
              id: post.user.id,
              username: post.user.name,
              avatarUrl: post.user.avatar_url || undefined,
            },
          }));
          setUserPosts(posts);
        })
        .catch(() => {});
    }, [id]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      connectionService
        .getConnectionWithUser(id)
        .then(({ request }) => {
          if (!request) {
            setRequestSent(false);
            setRequestExpired(false);
            setConnectionAccepted(false);
            setChatThreadId(undefined);
          } else if (request.status === "accepted" && request.threadId) {
            setConnectionAccepted(true);
            setChatThreadId(request.threadId);
            setRequestSent(false);
            setRequestExpired(false);
          } else if (request.status === "pending") {
            const expired =
              !!request.plannedDate &&
              new Date(request.plannedDate) < new Date();
            setRequestSent(true);
            setRequestExpired(expired);
            setConnectionAccepted(false);
            setChatThreadId(undefined);
          } else {
            setRequestSent(false);
            setRequestExpired(false);
            setConnectionAccepted(false);
            setChatThreadId(undefined);
          }
        })
        .catch(() => {});
    }, [id]),
  );

  const handleSendConnectionRequest = () => {
    if (requestSent || !id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRequestSending(true);
    connectionService
      .createRequest({
        receiver_id: id,
        message: undefined,
        club_id: clubId || undefined,
      })
      .then(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setRequestSent(true);
        setToastMessage("Request sent!");
        setToastType("success");
        setToastVisible(true);
      })
      .catch(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setToastMessage("Failed to send request");
        setToastType("error");
        setToastVisible(true);
      })
      .finally(() => setIsRequestSending(false));
  };

  if (loading) {
    return (
      <SafeAreaView style={profileStyles.container} edges={["top"]}>
        <View style={profileStyles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={profileStyles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={profileStyles.container} edges={["top"]}>
        <View style={profileStyles.loadingContainer}>
          <Ionicons
            name="person-circle-outline"
            size={80}
            color={Colors.smoke}
          />
          <Text style={profileStyles.errorText}>
            {error || "User not found"}
          </Text>
          <PressableScale
            onPress={() => router.back()}
            style={profileStyles.errorButton}
          >
            <Text style={profileStyles.errorButtonText}>Go Back</Text>
          </PressableScale>
        </View>
      </SafeAreaView>
    );
  }

  const vibes: string[] = (user as any).vibes || [];
  const favoriteDrinks: string[] = (user as any).favorite_drinks || [];
  const bio: string = user.bio || "";
  const location = user.location;
  const favoriteClubIds: string[] = (user as any).favorite_club_ids || [];

  const getSelectedClubsData = () =>
    allClubs.filter((club) => favoriteClubIds.includes(club.id));

  return (
    <SafeAreaView style={profileStyles.container} edges={["top"]}>
      <KeyboardAwareScrollView
        style={profileStyles.scrollView}
        contentContainerStyle={profileStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInUp.springify()}
          style={profileStyles.header}
        >
          <PressableScale
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push("/(tabs)" as any);
              }
            }}
            style={profileStyles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color={Colors.gold} />
          </PressableScale>
          <TextStroke stroke={0.6} color={Colors.gold}>
            <Text style={profileStyles.headerTitle}>Profile</Text>
          </TextStroke>
        </Animated.View>

        {/* Profile Picture Section */}
        <Animated.View
          entering={FadeInUp.delay(100).springify()}
          style={profileStyles.profilePictureSection}
        >
          <View style={profileStyles.avatarSection}>
            <View style={profileStyles.avatarRing}>
              {user.avatar_url ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  style={profileStyles.avatarImage}
                />
              ) : (
                <View style={profileStyles.avatarPlaceholder}>
                  <Ionicons name="person" size={48} color={Colors.lightGrey} />
                </View>
              )}
            </View>
          </View>
          <Text style={profileStyles.userName}>{user.username}</Text>
        </Animated.View>

        {/* Connect Button */}
        <Animated.View
          entering={FadeInDown.delay(150).springify()}
          style={profileStyles.connectSection}
        >
          {connectionAccepted && chatThreadId ? (
            <PressableScale
              style={[profileStyles.connectButton, profileStyles.chatNowButton]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/chat/${chatThreadId}` as any);
              }}
            >
              <Ionicons name="chatbubble" size={20} color={Colors.white} />
              <Text style={profileStyles.chatNowButtonText}>Chat</Text>
            </PressableScale>
          ) : requestSent && !requestExpired ? (
            <PressableScale
              style={[
                profileStyles.connectButton,
                profileStyles.requestPendingButton,
              ]}
              disabled={true}
            >
              <Ionicons name="checkmark-circle" size={20} color={Colors.gold} />
              <Text style={profileStyles.requestPendingText}>Requested</Text>
            </PressableScale>
          ) : !requestSent ? (
            <PressableScale
              style={profileStyles.connectButton}
              onPress={handleSendConnectionRequest}
              disabled={isRequestSending}
            >
              <Ionicons name="person-add" size={20} color={Colors.bg} />
              <Text style={profileStyles.connectButtonText}>
                {isRequestSending ? "Sending..." : "Send Connection Request"}
              </Text>
            </PressableScale>
          ) : null}
        </Animated.View>

        {/* Tab Switcher */}
        <Animated.View
          entering={FadeInDown.delay(150).springify()}
          style={profileStyles.tabSwitcher}
        >
          <PressableScale
            style={StyleSheet.flatten([
              profileStyles.tab,
              activeTab === "info" && profileStyles.tabActive,
            ])}
            onPress={() => setActiveTab("info")}
          >
            <Ionicons
              name="person-circle"
              size={20}
              color={activeTab === "info" ? Colors.bg : Colors.lightGrey}
            />
            <Text
              style={StyleSheet.flatten([
                profileStyles.tabText,
                activeTab === "info" && profileStyles.tabTextActive,
              ])}
            >
              Info
            </Text>
          </PressableScale>
          <PressableScale
            style={StyleSheet.flatten([
              profileStyles.tab,
              activeTab === "feed" && profileStyles.tabActive,
            ])}
            onPress={() => setActiveTab("feed")}
          >
            <Ionicons
              name="images"
              size={20}
              color={activeTab === "feed" ? Colors.bg : Colors.lightGrey}
            />
            <Text
              style={StyleSheet.flatten([
                profileStyles.tabText,
                activeTab === "feed" && profileStyles.tabTextActive,
              ])}
            >
              Club Feed
            </Text>
          </PressableScale>
          <PressableScale
            style={StyleSheet.flatten([
              profileStyles.tab,
              activeTab === "beer-stats" && profileStyles.tabActive,
            ])}
            onPress={() => setActiveTab("beer-stats")}
          >
            <Ionicons
              name="wallet"
              size={20}
              color={activeTab === "beer-stats" ? Colors.bg : Colors.lightGrey}
            />
            <Text
              style={StyleSheet.flatten([
                profileStyles.tabText,
                activeTab === "beer-stats" && profileStyles.tabTextActive,
              ])}
            >
              Spending
            </Text>
          </PressableScale>
        </Animated.View>

        {/* Info Tab Content */}
        {activeTab === "info" && (
          <>
            {/* Bio Section */}
            {bio ? (
              <Animated.View
                entering={FadeInDown.delay(150).springify()}
                style={profileStyles.section}
              >
                <View style={profileStyles.sectionCard}>
                  <View style={profileStyles.sectionHeader}>
                    <View style={profileStyles.sectionHeaderLeft}>
                      <Ionicons name="person" size={20} color={Colors.gold} />
                      <Text style={profileStyles.sectionTitle}>Bio</Text>
                    </View>
                  </View>
                  <Text style={profileStyles.bioText}>{bio}</Text>
                </View>
              </Animated.View>
            ) : null}

            {/* Location Section */}
            {location && (
              <Animated.View
                entering={FadeInDown.delay(175).springify()}
                style={profileStyles.section}
              >
                <View style={profileStyles.sectionCard}>
                  <View
                    style={[profileStyles.sectionHeader, { marginBottom: 4 }]}
                  >
                    <View style={profileStyles.sectionHeaderLeft}>
                      <Ionicons name="location" size={20} color={Colors.gold} />
                      <Text style={profileStyles.sectionTitle}>Location</Text>
                    </View>
                  </View>
                  <View style={profileStyles.locationDisplay}>
                    <Ionicons
                      name="location"
                      size={16}
                      color={Colors.primaryBlue}
                    />
                    <Text style={profileStyles.locationText}>
                      {location.name}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Favorite Drinks Section */}
            {favoriteDrinks.length > 0 && (
              <Animated.View
                entering={FadeInDown.delay(200).springify()}
                style={profileStyles.section}
              >
                <View style={profileStyles.sectionCard}>
                  <View style={profileStyles.sectionHeader}>
                    <View style={profileStyles.sectionHeaderLeft}>
                      <Ionicons name="wine" size={20} color={Colors.gold} />
                      <Text style={profileStyles.sectionTitle}>
                        Favorite Drinks
                      </Text>
                    </View>
                  </View>
                  <View style={profileStyles.drinksContainer}>
                    {favoriteDrinks.map((drink, index) => (
                      <Animated.View
                        key={drink}
                        entering={SlideInRight.delay(index * 50).springify()}
                        style={profileStyles.drinkChip}
                      >
                        <Text style={profileStyles.drinkEmoji}>🥃</Text>
                        <Text style={profileStyles.drinkText}>{drink}</Text>
                      </Animated.View>
                    ))}
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Club Vibes Section */}
            {vibes.length > 0 && (
              <Animated.View
                entering={FadeInDown.delay(250).springify()}
                style={profileStyles.section}
              >
                <View style={profileStyles.sectionCard}>
                  <View style={profileStyles.sectionHeader}>
                    <View style={profileStyles.sectionHeaderLeft}>
                      <Ionicons name="flash" size={20} color={Colors.gold} />
                      <Text style={profileStyles.sectionTitle}>Vibe</Text>
                    </View>
                  </View>
                  <View style={profileStyles.vibesGrid}>
                    {VIBE_OPTIONS.filter((v) => vibes.includes(v.name)).map(
                      (vibe) => (
                        <View
                          key={vibe.name}
                          style={StyleSheet.flatten([
                            profileStyles.vibeChip,
                            profileStyles.vibeChipSelected,
                          ])}
                        >
                          <Text style={profileStyles.vibeEmoji}>
                            {vibe.emoji}
                          </Text>
                          <Text
                            style={[
                              profileStyles.vibeText,
                              profileStyles.vibeTextSelected,
                            ]}
                          >
                            {vibe.name}
                          </Text>
                        </View>
                      ),
                    )}
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Favourite Clubs Section */}
            {!loadingClubs && getSelectedClubsData().length > 0 && (
              <Animated.View
                entering={FadeInDown.delay(300).springify()}
                style={profileStyles.section}
              >
                <View style={profileStyles.sectionCard}>
                  <View style={profileStyles.sectionHeader}>
                    <View style={profileStyles.sectionHeaderLeft}>
                      <Ionicons name="heart" size={20} color={Colors.gold} />
                      <Text style={profileStyles.sectionTitle}>
                        Favourite Clubs
                      </Text>
                    </View>
                  </View>
                  <View style={profileStyles.clubsGrid}>
                    {getSelectedClubsData().map((club, index) => (
                      <Animated.View
                        key={club.id}
                        entering={FadeInDown.delay(index * 100).springify()}
                      >
                        <PressableScale
                          style={profileStyles.clubCard}
                          onPress={() => router.push(`/club/${club.id}` as any)}
                        >
                          <Image
                            source={{ uri: club.image }}
                            style={profileStyles.clubCardImage}
                          />
                          <View style={profileStyles.clubCardContent}>
                            <Text style={profileStyles.clubCardName}>
                              {club.name}
                            </Text>
                            <View style={profileStyles.clubCardLocation}>
                              <Ionicons
                                name="location"
                                size={12}
                                color={Colors.gold}
                              />
                              <Text style={profileStyles.clubCardLocationText}>
                                {club.location}
                              </Text>
                            </View>
                          </View>
                        </PressableScale>
                      </Animated.View>
                    ))}
                  </View>
                </View>
              </Animated.View>
            )}
          </>
        )}

        {/* Feed Tab Content */}
        {activeTab === "feed" && (
          <UserMediaGrid
            posts={userPosts}
            title="Club Vibes"
            onPostPress={(postIndex) => {
              setFeedInitialIndex(postIndex);
              setShowFeedViewer(true);
            }}
          />
        )}

        {/* Beer Stats Tab Content */}
        {activeTab === "beer-stats" && id && (
          <BeerStatsTab
            userId={id}
            isOwnProfile={false}
            spendingVisible={(user as any)?.spending_visible !== false}
          />
        )}

        <View style={{ height: 40 }} />
      </KeyboardAwareScrollView>

      {/* Feed Viewer */}
      <ClubFeedViewer
        visible={showFeedViewer}
        posts={userPosts}
        initialPostIndex={feedInitialIndex}
        onClose={() => setShowFeedViewer(false)}
        onPostLiked={(postId, liked, likeCount) => {
          setUserPosts((prev) =>
            prev.map((p) =>
              p.id === postId ? { ...p, isLiked: liked, likeCount } : p,
            ),
          );
        }}
      />

      <Toast
        message={toastMessage}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
        type={toastType}
      />
    </SafeAreaView>
  );
}
