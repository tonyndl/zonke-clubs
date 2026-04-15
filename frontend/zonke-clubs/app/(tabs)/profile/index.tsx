import React, { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInRight,
  ZoomIn,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { TextStroke } from "../../_screens/Login/utils";
import { LinearGradient } from "expo-linear-gradient";
import {
  router,
  useLocalSearchParams,
  useNavigation,
  useFocusEffect,
} from "expo-router";
import { UserMediaGrid } from "@/components/profile/UserMediaGrid";
import { ClubFeedViewer } from "@/components/club/ClubFeedViewer";
import { AddPostModal } from "@/components/post/AddPostModal";
import { BeerStatsTab } from "@/components/beer-analytics/BeerStatsTab";
import { ClubPost } from "@/types/post";
import { connectionService } from "@/services/connectionService";
import { Toast } from "@/components/ui/Toast";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Modal } from "@/components/modal";
import { useAuth } from "@/contexts/AuthContext";
import { authService, User } from "@/services/authService";
import { LocationPicker } from "@/components/ui/LocationPicker";
import { Location } from "@/services/locationService";
import { userService } from "@/services/userService";
import { Alert } from "react-native";
import { clubsService, Club as ApiClub } from "@/services/clubsService";
import postsService from "@/services/postsService";
import { intentionsService } from "@/services/intentionsService";
import {
  MeetupIntention,
  ACTIVITY_CONFIG,
  ActivityType,
  formatPlannedDate,
} from "@/types/meetup";
import { PostIntentionModal } from "@/components/meetup/PostIntentionModal";
import { styles } from "./_styles";

const intentionStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  emoji: {
    fontSize: 28,
  },
  activityLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#E2E8F0",
  },
  clubName: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionBtn: {
    padding: 8,
  },
});

const confirmStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 12,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,107,107,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E2E8F0",
  },
  body: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#94A3B8",
  },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: "#FF6B6B",
  },
  deleteText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});

// Placeholder images for clubs (we'll use random unsplash images)
const getPlaceholderImage = (index: number) => {
  const images = [
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=60",
  ];
  return images[index % images.length];
};

const VIBE_OPTIONS = [
  { emoji: "💃", name: "Dancing" },
  { emoji: "🎉", name: "High Energy" },
  { emoji: "✨", name: "VIP Lounges" },
  { emoji: "😌", name: "Chilled" },
];

// Mock current user ID - in real app, get from auth context
const CURRENT_USER_ID = "current-user";

// Mock user profiles database
const MOCK_USER_PROFILES: Record<string, any> = {
  "current-user": {
    id: "current-user",
    name: "Alex D.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    age: 26,
    bio: "Weekend warrior with a passion for good music and great vibes. Always down for a spontaneous night out!",
    favoriteDrinks: ["Black Label", "Hennessy", "Jameson"],
    vibes: ["Dancing", "High Energy", "VIP Lounges"],
    favoriteClubIds: ["1", "2", "5"],
  },
  user_1: {
    id: "user_1",
    name: "Sarah M.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    age: 24,
    bio: "Music lover and dance enthusiast. Always looking for new places to explore and great people to meet!",
    favoriteDrinks: ["Aperol Spritz", "Champagne", "Mojito"],
    vibes: ["Dancing", "High Energy", "Chilled"],
    favoriteClubIds: ["1", "3"],
  },
  user_2: {
    id: "user_2",
    name: "James K.",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    age: 28,
    bio: "Tech enthusiast who loves mixing business with pleasure. You'll find me at the best clubs every Friday!",
    favoriteDrinks: ["Whiskey", "Gin & Tonic", "Craft Beer"],
    vibes: ["VIP Lounges", "High Energy", "Chilled"],
    favoriteClubIds: ["2", "4", "6"],
  },
  user_3: {
    id: "user_3",
    name: "Emily R.",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    age: 25,
    bio: "Party planner by day, party-goer by night. Let's make some unforgettable memories!",
    favoriteDrinks: ["Vodka", "Tequila", "Margarita"],
    vibes: ["Dancing", "High Energy", "Live Music"],
    favoriteClubIds: ["1", "2", "3"],
  },
  user_4: {
    id: "user_4",
    name: "Marcus T.",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    age: 27,
    bio: "DJ and music producer. Always on the hunt for the next big sound and vibe.",
    favoriteDrinks: ["Red Bull", "Vodka", "Corona"],
    vibes: ["Live Music", "Dancing", "High Energy"],
    favoriteClubIds: ["3", "4", "5"],
  },
  user_5: {
    id: "user_5",
    name: "Lisa P.",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    age: 23,
    bio: "Fashion student living for the weekend. Love dressing up and hitting the town with good people!",
    favoriteDrinks: ["Rosé", "Prosecco", "Cosmopolitan"],
    vibes: ["VIP Lounges", "Chilled", "High Energy"],
    favoriteClubIds: ["5", "6"],
  },
  user_6: {
    id: "user_6",
    name: "David C.",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    age: 29,
    bio: "Finance guy who knows how to unwind. Premium vibes only!",
    favoriteDrinks: ["Champagne", "Johnny Walker Blue", "Cognac"],
    vibes: ["VIP Lounges", "Chilled", "High Energy"],
    favoriteClubIds: ["5", "6"],
  },
};

// Mock function to get user profile data by ID
const getUserProfile = (userId: string) => {
  // Return the profile if it exists in our mock database
  if (MOCK_USER_PROFILES[userId]) {
    return MOCK_USER_PROFILES[userId];
  }

  // Fallback for unknown users - generate a basic profile
  return {
    id: userId,
    name: "Guest User",
    avatar: "",
    age: 25,
    bio: "New to the club scene. Looking to connect and have a great time!",
    favoriteDrinks: ["Beer", "Vodka"],
    vibes: ["Dancing", "High Energy"],
    favoriteClubIds: ["1"],
  };
};

// This profile screen now handles both editable (own profile) and read-only (other users) modes
export default function ProfileScreen() {
  const params = useLocalSearchParams<{
    userId?: string;
    requestData?: string;
    clubId?: string;
  }>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Get authenticated user from context
  const { user: authUser, isLoading: authLoading, refreshUser } = useAuth();

  const viewingUserId = params.userId ?? authUser?.id ?? CURRENT_USER_ID;
  const isOwnProfile =
    !params.userId || (authUser && viewingUserId === authUser.id);

  // Parse connection request data if passed from requests screen
  const existingRequest = React.useMemo(() => {
    if (!params.requestData) return null;
    try {
      return JSON.parse(decodeURIComponent(params.requestData));
    } catch {
      return null;
    }
  }, [params.requestData]);

  // State for viewing other users' profiles
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [loadingViewingUser, setLoadingViewingUser] = useState(false);
  const [viewingUserError, setViewingUserError] = useState<string | null>(null);

  // Fetch other user's profile from API
  useEffect(() => {
    if (!isOwnProfile && viewingUserId) {
      setLoadingViewingUser(true);
      setViewingUserError(null);

      userService
        .getUserById(viewingUserId)
        .then((user) => {
          setViewingUser(user);
        })
        .catch((error) => {
          console.error("Failed to load user profile:", error);
          setViewingUserError("Failed to load user profile");
        })
        .finally(() => {
          setLoadingViewingUser(false);
        });
    }
  }, [isOwnProfile, viewingUserId]);

  // Get user profile data - use real data for own profile or fetched user for others
  const userProfileData =
    isOwnProfile && authUser
      ? {
          id: authUser.id,
          name: authUser.username,
          avatar: authUser.avatar_url || "",
          age: 26, // This would come from backend if we add it
          bio: authUser.bio || "",
          favoriteDrinks: authUser.favorite_drinks || [],
          vibes: authUser.vibes || [],
          favoriteClubIds: [],
        }
      : viewingUser
        ? {
            id: viewingUser.id,
            name: viewingUser.username,
            avatar: viewingUser.avatar_url || "",
            age: 26,
            bio: viewingUser.bio || "",
            favoriteDrinks: viewingUser.favorite_drinks || [],
            vibes: viewingUser.vibes || [],
            favoriteClubIds: [],
          }
        : {
            id: viewingUserId,
            name: "Loading...",
            avatar: "",
            age: 25,
            bio: "",
            favoriteDrinks: [],
            vibes: ["Dancing", "High Energy", "Live Music"], // Default dummy vibes
            favoriteClubIds: [],
          };

  // Hide tab bar when viewing other users' profiles
  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: isOwnProfile
        ? {
            backgroundColor: Colors.bgCard,
            height: 50 + insets.bottom,
            paddingBottom: insets.bottom + 10,
            paddingTop: 10,
          }
        : {
            display: "none",
          },
    });

    // Cleanup: restore tab bar when leaving
    return () => {
      navigation.setOptions({
        tabBarStyle: {
          backgroundColor: Colors.bgCard,
          height: 50 + insets.bottom,
          paddingBottom: insets.bottom + 10,
          paddingTop: 10,
        },
      });
    };
  }, [isOwnProfile, navigation, insets.bottom]);

  // Listen for tab press to reset to own profile
  useEffect(() => {
    const unsubscribe = navigation.addListener("tabPress" as any, (e: any) => {
      // If viewing another user's profile and tab is pressed, reset to own profile
      if (!isOwnProfile && params.userId) {
        e.preventDefault();
        router.replace("/(tabs)/profile" as any);
      }
    });

    return unsubscribe;
  }, [navigation, isOwnProfile, params.userId]);

  const [avatarUri, setAvatarUri] = useState<string | null>(
    authUser?.avatar_url || null,
  );
  const [bio, setBio] = useState(userProfileData.bio);
  const [favoriteDrinks, setFavoriteDrinks] = useState<string[]>(
    userProfileData.favoriteDrinks,
  );
  const [selectedVibes, setSelectedVibes] = useState<string[]>(
    userProfileData.vibes,
  );
  const [location, setLocation] = useState<Location | null>(
    authUser?.location || null,
  );
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);

  // Track original values for change detection
  const [originalAvatar, setOriginalAvatar] = useState(
    authUser?.avatar_url || null,
  );

  // Update avatar when user data is refreshed from server
  useEffect(() => {
    if (authUser?.avatar_url !== avatarUri && !hasChanges()) {
      setAvatarUri(authUser?.avatar_url || null);
      setOriginalAvatar(authUser?.avatar_url || null);
    }
  }, [authUser?.avatar_url]);
  const [originalBio, setOriginalBio] = useState(userProfileData.bio);
  const [originalDrinks, setOriginalDrinks] = useState<string[]>(
    userProfileData.favoriteDrinks,
  );
  const [originalVibes, setOriginalVibes] = useState<string[]>(
    userProfileData.vibes,
  );
  const [originalLocation, setOriginalLocation] = useState<Location | null>(
    authUser?.location || null,
  );
  const [originalClubs, setOriginalClubs] = useState<string[]>([]);

  // Save state
  const [isSaving, setIsSaving] = useState(false);

  // Modal states
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showDrinkModal, setShowDrinkModal] = useState(false);
  const [showClubModal, setShowClubModal] = useState(false);
  const [newDrink, setNewDrink] = useState("");
  const [clubSearchQuery, setClubSearchQuery] = useState("");
  const debouncedClubSearch = useDebounce(clubSearchQuery, 300);

  // Tab state
  const [activeTab, setActiveTab] = useState<"info" | "feed" | "beer-stats">(
    "info",
  );

  // Feed viewer state
  const [showFeedViewer, setShowFeedViewer] = useState(false);
  const [feedInitialIndex, setFeedInitialIndex] = useState(0);

  // Add post modal state
  const [showAddPostModal, setShowAddPostModal] = useState(false);

  // User posts - TODO: Fetch from backend when posts API is implemented
  // For now, posts feature requires backend implementation (see MOBILE_BACKEND_TODO.md)
  const [userPosts, setUserPosts] = useState<ClubPost[]>([]);

  // Connection request state (for viewing other users' profiles)
  const [isRequestSending, setIsRequestSending] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [connectionAccepted, setConnectionAccepted] = useState(false);
  const [chatThreadId, setChatThreadId] = useState<string | undefined>(
    undefined,
  );
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "success",
  );

  // My plans (intentions) state
  const [myIntentions, setMyIntentions] = useState<MeetupIntention[]>([]);
  const [editingIntention, setEditingIntention] =
    useState<MeetupIntention | null>(null);
  const [deletingIntentionId, setDeletingIntentionId] = useState<string | null>(
    null,
  );
  // Set of "clubId:date" strings for dates that have a big event
  const [bigEventDates, setBigEventDates] = useState<Set<string>>(new Set());

  // Clubs state (loaded from backend)
  const [allClubs, setAllClubs] = useState<
    Array<{ id: string; name: string; image: string; location: string }>
  >([]);
  // Full data for the user's saved favorite clubs (used for profile display, separate from search results)
  const [favoriteClubsData, setFavoriteClubsData] = useState<
    Array<{ id: string; name: string; image: string; location: string }>
  >([]);
  const [loadingClubs, setLoadingClubs] = useState(true);

  // Map club IDs to names for display
  const clubNames: Record<string, string> = {};
  allClubs.forEach((club) => {
    clubNames[club.id] = club.name;
  });

  // Load user's posts from backend
  const loadUserPosts = () => {
    const fetch = isOwnProfile
      ? postsService.getUserPosts()
      : postsService.getUserPostsById(viewingUserId);

    fetch
      .then((response) => {
        // Convert backend posts to ClubPost format
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
            username: post.user.username,
            avatarUrl: post.user.avatar_url || undefined,
          },
        }));
        setUserPosts(posts);
      })
      .catch((error) => {
        console.error("Failed to load posts:", error);
      });
  };

  // Load the current user's own active intentions
  const loadMyIntentions = () => {
    if (!isOwnProfile) return;
    intentionsService
      .getMyIntentions()
      .then((response) => {
        setMyIntentions(response.intentions);

        // Fetch events for each unique club to identify big event dates
        const uniqueClubIds = [
          ...new Set(response.intentions.map((i: MeetupIntention) => i.clubId)),
        ];
        Promise.all(
          uniqueClubIds.map((clubId) =>
            clubsService
              .getClubEvents(clubId as string)
              .catch(() => ({ events: [] })),
          ),
        ).then((results) => {
          const dateSet = new Set<string>();
          results.forEach((res, idx) => {
            const clubId = uniqueClubIds[idx] as string;
            (res.events || []).forEach((event: any) => {
              dateSet.add(`${clubId}:${event.date}`);
            });
          });
          setBigEventDates(dateSet);
        });
      })
      .catch((error) => {
        console.error("Failed to load my intentions:", error);
      });
  };

  const handleDeleteIntention = (id: string) => {
    intentionsService
      .deleteIntention(id)
      .then(() => {
        setMyIntentions((prev) => prev.filter((i) => i.id !== id));
        setEditingIntention(null);
        setToastMessage("Plan removed");
        setToastType("info");
        setToastVisible(true);
      })
      .catch((error) => {
        console.error("Failed to delete intention:", error);
        setToastMessage("Failed to remove plan");
        setToastType("error");
        setToastVisible(true);
      });
  };

  const handleUpdateIntention = (
    activityType: ActivityType,
    plannedDate: string,
    message?: string,
  ) => {
    if (!editingIntention) return;
    intentionsService
      .updateIntention(editingIntention.id, {
        activity_type: activityType,
        planned_date: plannedDate,
        message: message,
      })
      .then((response) => {
        setMyIntentions((prev) =>
          prev.map((i) =>
            i.id === response.intention.id ? response.intention : i,
          ),
        );
        setEditingIntention(null);
        setToastMessage("Plan updated!");
        setToastType("success");
        setToastVisible(true);
      })
      .catch((error) => {
        console.error("Failed to update intention:", error);
        setToastMessage("Failed to update plan");
        setToastType("error");
        setToastVisible(true);
      });
  };

  // OLD Feed media items - mix of photos and videos (DEPRECATED - keeping for reference)
  const [feedItems] = useState([
    {
      id: "1",
      type: "image",
      uri: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=60",
      club: "The BeatBox",
      likes: 234,
      aspectRatio: 1.2,
    },
    {
      id: "2",
      type: "video",
      uri: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=60",
      club: "Neon Dreams",
      likes: 567,
      views: 1234,
      duration: "0:15",
      aspectRatio: 0.8,
    },
    {
      id: "3",
      type: "image",
      uri: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800&q=60",
      club: "Velvet Room",
      likes: 189,
      aspectRatio: 1.5,
    },
    {
      id: "4",
      type: "video",
      uri: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=60",
      club: "The BeatBox",
      likes: 445,
      views: 2100,
      duration: "0:22",
      aspectRatio: 0.75,
    },
    {
      id: "5",
      type: "image",
      uri: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=60",
      club: "Club Euphoria",
      likes: 312,
      aspectRatio: 1.1,
    },
    {
      id: "6",
      type: "image",
      uri: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=60",
      club: "District 7",
      likes: 678,
      aspectRatio: 1.3,
    },
  ]);

  // Sync profile data when user data changes
  useEffect(() => {
    if (isOwnProfile && authUser) {
      setBio(authUser.bio || "");
      setFavoriteDrinks(authUser.favorite_drinks || []);
      setSelectedVibes(authUser.vibes || []);
      setOriginalBio(authUser.bio || "");
      setOriginalDrinks(authUser.favorite_drinks || []);
      setOriginalVibes(authUser.vibes || []);
    } else if (viewingUser) {
      setBio(viewingUser.bio || "");
      setFavoriteDrinks(viewingUser.favorite_drinks || []);
      setSelectedVibes(viewingUser.vibes || []);
    }
  }, [authUser, viewingUser, isOwnProfile]);

  // Load clubs and user's favorites
  useEffect(() => {
    loadClubsAndFavorites();
  }, [isOwnProfile, viewingUserId, authUser]);

  // Refresh user profile data when screen is focused (to sync avatar across devices)
  useFocusEffect(
    React.useCallback(() => {
      if (isOwnProfile) {
        refreshUser()
          .then(() => {})
          .catch((error) => {
            console.error("[Profile] Error refreshing user profile:", error);
          });
      }
    }, [isOwnProfile, refreshUser]),
  );

  // Reload favorites when screen comes into focus (e.g., after unliking on discover screen)
  useFocusEffect(
    React.useCallback(() => {
      if (isOwnProfile && authUser) {
        clubsService
          .getFavoriteClubs()
          .then((favoritesResponse) => {
            const favoriteIds = favoritesResponse.clubs.map(
              (club: ApiClub) => club.id,
            );
            // Update both current and original state to prevent "unsaved changes" prompt
            setSelectedClubs(favoriteIds);
            setOriginalClubs(favoriteIds);
          })
          .catch((error) => {
            console.error(
              "[Profile] Failed to reload favorites on focus:",
              error,
            );
          });
      }
    }, [isOwnProfile, authUser]),
  );

  // Load user posts when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadUserPosts();
    }, [isOwnProfile, viewingUserId]),
  );

  // Load own meetup intentions when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadMyIntentions();
    }, [isOwnProfile]),
  );

  // Check connection request status when viewing other users' profiles
  useFocusEffect(
    React.useCallback(() => {
      if (!isOwnProfile && viewingUserId) {
        // Check both sent and received requests
        Promise.all([
          connectionService.getSentRequests(),
          connectionService.getReceivedRequests(),
        ])
          .then(([sentResponse, receivedResponse]) => {
            // Check if we've sent a request to this user
            const sentRequest = sentResponse.requests.find(
              (req: any) => req.receiver.id === viewingUserId,
            );

            // Check if we've received a request from this user
            const receivedRequest = receivedResponse.requests.find(
              (req: any) => req.sender.id === viewingUserId,
            );

            const request = sentRequest || receivedRequest;

            if (request) {
              // Check if the request is accepted
              if (request.status === "accepted" && request.threadId) {
                setConnectionAccepted(true);
                setChatThreadId(request.threadId);
                setRequestSent(false); // Don't show "Requested" when accepted
              } else {
                // Request is pending
                setRequestSent(true);
                setConnectionAccepted(false);
                setChatThreadId(undefined);
              }
            } else {
              setRequestSent(false);
              setConnectionAccepted(false);
              setChatThreadId(undefined);
            }
          })
          .catch((error) => {
            console.error(
              "[Profile] Failed to check connection status:",
              error,
            );
          });
      }
    }, [isOwnProfile, viewingUserId]),
  );

  const loadClubsAndFavorites = () => {
    setLoadingClubs(true);

    const favoritesPromise =
      isOwnProfile && authUser
        ? clubsService
            .getFavoriteClubs()
            .then((favoritesResponse) => {
              const favoriteIds = favoritesResponse.clubs.map(
                (club: ApiClub) => club.id,
              );
              setSelectedClubs(favoriteIds);
              setOriginalClubs(favoriteIds);
              const favData = favoritesResponse.clubs.map(
                (club: ApiClub, index: number) => ({
                  id: club.id,
                  name: club.name,
                  location: club.location.name,
                  image: getPlaceholderImage(index),
                }),
              );
              setFavoriteClubsData(favData);
            })
            .catch((error) => {
              console.error("[Profile] Failed to load favorites:", error);
              setSelectedClubs([]);
              setOriginalClubs([]);
            })
        : Promise.resolve();

    favoritesPromise.finally(() => {
      setLoadingClubs(false);
    });
  };

  // Fetch clubs from API when user types in the club search modal
  useEffect(() => {
    if (!debouncedClubSearch.trim()) {
      setAllClubs([]);
      return;
    }
    clubsService
      .getClubs(false, 1, 50, debouncedClubSearch)
      .then((response) => {
        const formatted = response.clubs.map(
          (club: ApiClub, index: number) => ({
            id: club.id,
            name: club.name,
            location: club.location.name,
            image: getPlaceholderImage(index),
          }),
        );
        setAllClubs(formatted);
      })
      .catch((err) => console.error("[Profile] Club search failed", err));
  }, [debouncedClubSearch]);

  const pickImage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowAvatarModal(false);

    ImagePicker.requestMediaLibraryPermissionsAsync()
      .then(({ status }) => {
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "We need access to your photos to change your profile picture.",
          );
          return Promise.reject("Permission denied");
        }
        return ImagePicker.launchImageLibraryAsync({
          mediaTypes: "images",
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      })
      .then((result) => {
        if (!result.canceled) {
          setAvatarUri(result.assets[0].uri);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      })
      .catch((error) => {
        if (error !== "Permission denied") {
          console.error("Error picking image:", error);
        }
      });
  };

  const removeAvatar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowAvatarModal(false);

    Alert.alert(
      "Remove Profile Picture",
      "Are you sure you want to remove your profile picture?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setAvatarUri(null);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ],
    );
  };

  const handleSendConnectionRequest = async () => {
    if (requestSent) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRequestSending(true);

    try {
      // Use clubId from params, or fallback to default club
      const clubId = params.clubId || "3f1b5bd3-a899-44c1-bfda-ee83f940accb"; // The Grand Africa Café & Beach (default)

      await connectionService.createRequest({
        receiver_id: viewingUserId,
        message: undefined,
        club_id: clubId,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setRequestSent(true);
      setToastMessage("Request sent!");
      setToastType("success");
      setToastVisible(true);
    } catch (error) {
      console.error("Failed to send connection request:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setToastMessage("Failed to send request");
      setToastType("error");
      setToastVisible(true);
    } finally {
      setIsRequestSending(false);
    }
  };

  const toggleVibe = (name: string) => {
    setSelectedVibes((prev) =>
      prev.includes(name) ? prev.filter((v) => v !== name) : [...prev, name],
    );
  };

  const addDrink = () => {
    if (newDrink.trim() && !favoriteDrinks.includes(newDrink.trim())) {
      setFavoriteDrinks([...favoriteDrinks, newDrink.trim()]);
      setNewDrink("");
      setShowDrinkModal(false);
    }
  };

  const removeDrink = (drink: string) => {
    setFavoriteDrinks(favoriteDrinks.filter((d) => d !== drink));
  };

  const toggleClub = (clubId: string) => {
    const isCurrentlySelected = selectedClubs.includes(clubId);

    // Update local state only (changes will be saved when user presses "Save Changes")
    setSelectedClubs((prev) =>
      isCurrentlySelected
        ? prev.filter((c) => c !== clubId)
        : [...prev, clubId],
    );

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getSelectedClubsData = () => {
    return favoriteClubsData.filter((club) => selectedClubs.includes(club.id));
  };

  const closeClubModal = () => {
    // Merge newly selected clubs from search results into favoriteClubsData
    setFavoriteClubsData((prev) => {
      const existingIds = new Set(prev.map((c) => c.id));
      const additions = allClubs.filter(
        (c) => selectedClubs.includes(c.id) && !existingIds.has(c.id),
      );
      const merged = [...prev, ...additions].filter((c) =>
        selectedClubs.includes(c.id),
      );
      return merged;
    });
    setClubSearchQuery("");
    setAllClubs([]);
    closeClubModal();
  };

  const handleAddPost = () => {
    setShowAddPostModal(false);
    loadUserPosts();
    setToastMessage("Post added successfully!");
    setToastType("success");
    setToastVisible(true);
  };

  // Check if profile has been modified
  const hasChanges = () => {
    const avatarChanged = avatarUri !== originalAvatar;
    const bioChanged = bio !== originalBio;
    const drinksChanged =
      JSON.stringify([...favoriteDrinks].sort()) !==
      JSON.stringify([...originalDrinks].sort());
    const vibesChanged =
      JSON.stringify([...selectedVibes].sort()) !==
      JSON.stringify([...originalVibes].sort());
    const locationChanged =
      JSON.stringify(location) !== JSON.stringify(originalLocation);
    const clubsChanged =
      JSON.stringify([...selectedClubs].sort()) !==
      JSON.stringify([...originalClubs].sort());

    return (
      avatarChanged ||
      bioChanged ||
      drinksChanged ||
      vibesChanged ||
      locationChanged ||
      clubsChanged
    );
  };

  const handleSaveProfile = () => {
    if (!hasChanges()) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);

    // Upload avatar to S3 first if it's a local file
    const uploadAvatarIfNeeded = () => {
      if (
        avatarUri &&
        avatarUri !== originalAvatar &&
        avatarUri.startsWith("file://")
      ) {
        // Local file - upload to S3
        const extension = avatarUri.toLowerCase().endsWith(".heic")
          ? "jpg"
          : "jpg";
        return postsService
          .uploadMedia({
            uri: avatarUri,
            type: "image",
            name: `avatar_${Date.now()}.${extension}`,
          })
          .then((asset) => {
            return asset.url;
          })
          .catch((error) => {
            console.error("❌ Avatar upload failed:", error);
            throw new Error(
              `Failed to upload avatar: ${error.message || error}`,
            );
          });
      } else {
        // Either no change, removal (null), or already an S3 URL
        return Promise.resolve(avatarUri);
      }
    };

    uploadAvatarIfNeeded()
      .then((uploadedAvatarUrl) => {
        const profileData: any = {
          bio: bio.trim() || undefined,
          vibes: selectedVibes.length > 0 ? selectedVibes : undefined,
          favorite_drinks:
            favoriteDrinks.length > 0 ? favoriteDrinks : undefined,
          location: location || undefined,
        };

        // Handle avatar_url separately to distinguish between "no change" and "remove"
        if (avatarUri !== originalAvatar) {
          profileData.avatar_url = uploadedAvatarUrl; // Use S3 URL or null
        }

        // Determine which clubs were added/removed
        const clubsAdded = selectedClubs.filter(
          (id) => !originalClubs.includes(id),
        );
        const clubsRemoved = originalClubs.filter(
          (id) => !selectedClubs.includes(id),
        );

        // Build array of promises for all updates
        const updates: Promise<any>[] = [];

        // Add profile update
        updates.push(authService.updateProfile(profileData));

        // Add like/unlike promises for clubs
        clubsAdded.forEach((clubId) => {
          updates.push(clubsService.likeClub(clubId));
        });
        clubsRemoved.forEach((clubId) => {
          updates.push(clubsService.unlikeClub(clubId));
        });

        // Execute all updates
        return Promise.all(updates);
      })
      .then(() => {
        return refreshUser();
      })
      .then(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setToastMessage("Profile updated successfully!");
        setToastType("success");
        setToastVisible(true);

        // Update original values to current values so hasChanges() returns false
        setOriginalAvatar(avatarUri);
        setOriginalBio(bio);
        setOriginalDrinks([...favoriteDrinks]);
        setOriginalVibes([...selectedVibes]);
        setOriginalLocation(location);
        setOriginalClubs([...selectedClubs]);
      })
      .catch((error) => {
        console.error("❌ Profile update failed:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        const errorMessage =
          error.message || "Failed to save profile changes. Please try again.";
        setToastMessage(errorMessage);
        setToastType("error");
        setToastVisible(true);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If not authenticated, show message
  if (!authUser && isOwnProfile) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <Ionicons
            name="person-circle-outline"
            size={80}
            color={Colors.lightGrey}
          />
          <Text style={styles.notAuthText}>
            Please log in to view your profile
          </Text>
          <PressableScale
            style={styles.loginButton}
            onPress={() => router.push("/screens/Login" as any)}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </PressableScale>
        </View>
      </SafeAreaView>
    );
  }

  // Show loading state when fetching other user's profile
  if (loadingViewingUser) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if failed to load user
  if (viewingUserError && !isOwnProfile) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <Ionicons
            name="person-circle-outline"
            size={80}
            color={Colors.smoke}
          />
          <Text style={styles.errorText}>{viewingUserError}</Text>
          <PressableScale
            onPress={() => router.back()}
            style={styles.errorButton}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </PressableScale>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.springify()} style={styles.header}>
          {!isOwnProfile && (
            <PressableScale
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // If we came from people browse (has clubId), replace current screen to avoid loop
                if (params.clubId) {
                  // Use negative delta to go back multiple times to get out of tab navigation
                  router.navigate(
                    `/people-browse?clubId=${params.clubId}` as any,
                  );
                } else if (router.canGoBack()) {
                  router.back();
                } else {
                  // Fallback to discover tab
                  router.push("/(tabs)/discover" as any);
                }
              }}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={28} color={Colors.gold} />
            </PressableScale>
          )}
          <TextStroke stroke={0.6} color={Colors.secondaryBlue}>
            <Text style={styles.headerTitle}>Profile</Text>
          </TextStroke>
          {isOwnProfile && (
            <PressableScale
              onPress={() => router.push("/settings")}
              style={styles.settingsButton}
            >
              <Ionicons name="settings-outline" size={24} color={Colors.gold} />
            </PressableScale>
          )}
        </Animated.View>

        {/* Profile Picture Section */}
        <Animated.View
          entering={FadeInUp.delay(100).springify()}
          style={styles.profilePictureSection}
        >
          <View style={styles.avatarSection}>
            <PressableScale
              onPress={() => isOwnProfile && setShowAvatarModal(true)}
            >
              <View style={styles.avatarRing}>
                {(() => {
                  // If user changed avatar, use the new value (could be null or new URI)
                  // Otherwise, use the current profile avatar (own or viewing user)
                  const hasAvatarChange = avatarUri !== originalAvatar;
                  const displayAvatar = hasAvatarChange
                    ? avatarUri
                    : isOwnProfile
                      ? authUser?.avatar_url
                      : userProfileData.avatar;

                  return displayAvatar ? (
                    <Image
                      source={{ uri: displayAvatar }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons
                        name="person"
                        size={48}
                        color={Colors.lightGrey}
                      />
                    </View>
                  );
                })()}
              </View>
            </PressableScale>
            {isOwnProfile && (
              <PressableScale
                style={styles.avatarEditBadge}
                onPress={pickImage}
              >
                <Ionicons name="camera" size={18} color={Colors.bg} />
              </PressableScale>
            )}
          </View>
          <Text style={styles.userName}>{userProfileData.name}</Text>
          {/* {authUser && isOwnProfile && (
            <View style={styles.userInfoChip}>
              <Ionicons name="mail-outline" size={14} color={Colors.lightGrey} />
              <Text style={styles.userInfoText}>{authUser.email || authUser.username}</Text>
            </View>
          )} */}
          {/* {authUser && isOwnProfile && (
            <View style={styles.userInfoChip}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.gold} />
              <Text style={styles.userRoleText}>
                {authUser.role === 'club_owner' ? 'Club Owner' : 'Club Goer'}
              </Text>
            </View>
          )} */}
        </Animated.View>

        {/* Connect Button (only for other users' profiles) */}
        {!isOwnProfile && (
          <Animated.View
            entering={FadeInDown.delay(150).springify()}
            style={styles.connectSection}
          >
            {(existingRequest?.status === "accepted" || connectionAccepted) &&
            (existingRequest?.threadId || chatThreadId) ? (
              // Show Chat button for accepted requests
              <PressableScale
                style={[styles.connectButton, styles.chatNowButton]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const threadId = existingRequest?.threadId || chatThreadId;
                  router.push(`/chat/${threadId}` as any);
                }}
              >
                <Ionicons name="chatbubble" size={20} color={Colors.white} />
                <Text style={styles.chatNowButtonText}>Chat</Text>
              </PressableScale>
            ) : existingRequest?.status === "pending" || requestSent ? (
              // Show Requested for pending requests
              <PressableScale
                style={[styles.connectButton, styles.requestPendingButton]}
                disabled={true}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={Colors.gold}
                />
                <Text style={styles.requestPendingText}>Requested</Text>
              </PressableScale>
            ) : (
              // Show Send Connection Request if no existing request
              <PressableScale
                style={[styles.connectButton]}
                onPress={handleSendConnectionRequest}
                disabled={isRequestSending}
              >
                <Ionicons name="person-add" size={20} color={Colors.bg} />
                <Text style={styles.connectButtonText}>
                  {isRequestSending ? "Sending..." : "Send Connection Request"}
                </Text>
              </PressableScale>
            )}
          </Animated.View>
        )}

        {/* Tab Switcher */}
        <Animated.View
          entering={FadeInDown.delay(150).springify()}
          style={styles.tabSwitcher}
        >
          <PressableScale
            style={StyleSheet.flatten([
              styles.tab,
              activeTab === "info" && styles.tabActive,
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
                styles.tabText,
                activeTab === "info" && styles.tabTextActive,
              ])}
            >
              Info
            </Text>
          </PressableScale>
          <PressableScale
            style={StyleSheet.flatten([
              styles.tab,
              activeTab === "feed" && styles.tabActive,
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
                styles.tabText,
                activeTab === "feed" && styles.tabTextActive,
              ])}
            >
              Club Feed
            </Text>
          </PressableScale>
          <PressableScale
            style={StyleSheet.flatten([
              styles.tab,
              activeTab === "beer-stats" && styles.tabActive,
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
                styles.tabText,
                activeTab === "beer-stats" && styles.tabTextActive,
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
            {(isOwnProfile || bio) && (
              <Animated.View
                entering={FadeInDown.delay(150).springify()}
                style={styles.section}
              >
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionHeaderLeft}>
                      <Ionicons name="person" size={20} color={Colors.gold} />
                      <Text style={styles.sectionTitle}>Bio</Text>
                    </View>
                  </View>
                  {isOwnProfile ? (
                    <View style={styles.bioEditContainer}>
                      <TextInput
                        style={styles.bioInput}
                        value={bio}
                        onChangeText={setBio}
                        multiline
                        maxLength={200}
                        placeholder="Tell people about yourself..."
                        placeholderTextColor={Colors.lightGrey}
                      />
                      <Text style={styles.charCount}>{bio.length}/200</Text>
                    </View>
                  ) : (
                    <Text style={styles.bioText}>{bio}</Text>
                  )}
                </View>
              </Animated.View>
            )}

            {/* My Plans Section — only visible on own profile */}
            {isOwnProfile && (
              <Animated.View
                entering={FadeInDown.delay(165).springify()}
                style={styles.section}
              >
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionHeaderLeft}>
                      <Ionicons name="calendar" size={20} color={Colors.gold} />
                      <Text style={styles.sectionTitle}>My Plans</Text>
                    </View>
                  </View>
                  {myIntentions.length === 0 ? (
                    <Text style={styles.emptyText}>No active plans</Text>
                  ) : (
                    myIntentions.map((intention, idx) => {
                      const config = ACTIVITY_CONFIG[intention.activityType];
                      const isLast = idx === myIntentions.length - 1;
                      const isBigEvent = bigEventDates.has(
                        `${intention.clubId}:${intention.plannedDate}`,
                      );
                      return (
                        <View
                          key={intention.id}
                          style={[
                            intentionStyles.card,
                            isLast && { borderBottomWidth: 0 },
                          ]}
                        >
                          <View style={intentionStyles.cardLeft}>
                            <Text style={intentionStyles.emoji}>
                              {config.emoji}
                            </Text>
                            <View>
                              <Text style={intentionStyles.activityLabel}>
                                {config.shortLabel}
                              </Text>
                              <Text style={intentionStyles.clubName}>
                                {intention.clubName || "Unknown Club"}
                              </Text>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 4,
                                  marginTop: 2,
                                }}
                              >
                                {isBigEvent && (
                                  <Ionicons
                                    name="trophy"
                                    size={11}
                                    color={Colors.accent}
                                  />
                                )}
                                <Text style={intentionStyles.date}>
                                  {formatPlannedDate(intention.plannedDate)}
                                </Text>
                              </View>
                            </View>
                          </View>
                          <View style={intentionStyles.cardActions}>
                            <TouchableOpacity
                              onPress={() => setEditingIntention(intention)}
                              style={intentionStyles.actionBtn}
                            >
                              <Ionicons
                                name="pencil-outline"
                                size={17}
                                color={Colors.gold}
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() =>
                                setDeletingIntentionId(intention.id)
                              }
                              style={intentionStyles.actionBtn}
                            >
                              <Ionicons
                                name="trash-outline"
                                size={17}
                                color="#FF6B6B"
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              </Animated.View>
            )}

            {/* Location Section */}
            {(isOwnProfile || location) && (
              <Animated.View
                entering={FadeInDown.delay(175).springify()}
                style={styles.section}
              >
                <View style={styles.sectionCard}>
                  <View style={[styles.sectionHeader, { marginBottom: 4 }]}>
                    <View style={styles.sectionHeaderLeft}>
                      <Ionicons name="location" size={20} color={Colors.gold} />
                      <Text style={styles.sectionTitle}>Location</Text>
                    </View>
                  </View>
                  {isOwnProfile ? (
                    <LocationPicker
                      value={location}
                      onChange={setLocation}
                      placeholder="Search for your location..."
                    />
                  ) : (
                    <View style={styles.locationDisplay}>
                      <Ionicons
                        name="location"
                        size={16}
                        color={Colors.primaryBlue}
                      />
                      <Text style={styles.locationText}>{location!.name}</Text>
                    </View>
                  )}
                </View>
              </Animated.View>
            )}

            {/* Favorite Drinks Section */}
            {(isOwnProfile || favoriteDrinks.length > 0) && (
              <Animated.View
                entering={FadeInDown.delay(200).springify()}
                style={styles.section}
              >
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionHeaderLeft}>
                      <Ionicons name="wine" size={20} color={Colors.gold} />
                      <Text style={styles.sectionTitle}>Favorite Drinks</Text>
                    </View>
                    {isOwnProfile && (
                      <PressableScale
                        style={styles.addButton}
                        onPress={() => setShowDrinkModal(true)}
                      >
                        <Ionicons name="add" size={18} color={Colors.gold} />
                      </PressableScale>
                    )}
                  </View>
                  {isOwnProfile && (
                    <Text style={styles.sectionSubtitle}>
                      Add your favorite drink brands
                    </Text>
                  )}
                  <View style={styles.drinksContainer}>
                    {favoriteDrinks.map((drink, index) => (
                      <Animated.View
                        key={drink}
                        entering={SlideInRight.delay(index * 50).springify()}
                        style={styles.drinkChip}
                      >
                        <Text style={styles.drinkEmoji}>🥃</Text>
                        <Text style={styles.drinkText}>{drink}</Text>
                        {isOwnProfile && (
                          <TouchableOpacity
                            onPress={() => removeDrink(drink)}
                            style={styles.removeButton}
                          >
                            <Ionicons
                              name="close-circle"
                              size={18}
                              color={Colors.primaryBlue}
                            />
                          </TouchableOpacity>
                        )}
                      </Animated.View>
                    ))}
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Club Vibes Section */}
            {(isOwnProfile || selectedVibes.length > 0) && (
              <Animated.View
                entering={FadeInDown.delay(250).springify()}
                style={styles.section}
              >
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionHeaderLeft}>
                      <Ionicons name="flash" size={20} color={Colors.gold} />
                      <Text style={styles.sectionTitle}>My Vibe</Text>
                    </View>
                  </View>
                  {isOwnProfile && (
                    <Text style={styles.sectionSubtitle}>
                      Select your club preferences
                    </Text>
                  )}
                  {selectedVibes.length === 0 && !isOwnProfile ? (
                    <Text style={styles.emptyText}>No vibes selected yet</Text>
                  ) : (
                    <View style={styles.vibesGrid}>
                      {VIBE_OPTIONS.map((vibe) => {
                        const isSelected = selectedVibes.includes(vibe.name);
                        return isOwnProfile ? (
                          <PressableScale
                            key={vibe.name}
                            style={StyleSheet.flatten([
                              styles.vibeChip,
                              isSelected && styles.vibeChipSelected,
                            ])}
                            onPress={() => toggleVibe(vibe.name)}
                          >
                            <Text style={styles.vibeEmoji}>{vibe.emoji}</Text>
                            <Text
                              style={[
                                styles.vibeText,
                                isSelected && styles.vibeTextSelected,
                              ]}
                            >
                              {vibe.name}
                            </Text>
                            {isSelected && (
                              <Animated.View
                                entering={ZoomIn.springify()}
                                style={styles.checkmark}
                              >
                                <Ionicons
                                  name="checkmark"
                                  size={10}
                                  color={Colors.bg}
                                />
                              </Animated.View>
                            )}
                          </PressableScale>
                        ) : isSelected ? (
                          <View
                            key={vibe.name}
                            style={StyleSheet.flatten([
                              styles.vibeChip,
                              styles.vibeChipSelected,
                            ])}
                          >
                            <Text style={styles.vibeEmoji}>{vibe.emoji}</Text>
                            <Text
                              style={[styles.vibeText, styles.vibeTextSelected]}
                            >
                              {vibe.name}
                            </Text>
                          </View>
                        ) : null;
                      })}
                    </View>
                  )}
                </View>
              </Animated.View>
            )}

            {/* Favourite Clubs Section */}
            <Animated.View
              entering={FadeInDown.delay(300).springify()}
              style={styles.section}
            >
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeaderLeft}>
                    <Ionicons name="heart" size={20} color={Colors.gold} />
                    <Text style={styles.sectionTitle}>Favourite Clubs</Text>
                  </View>
                  {isOwnProfile && (
                    <PressableScale
                      style={styles.addButton}
                      onPress={() => setShowClubModal(true)}
                    >
                      <Ionicons name="add" size={18} color={Colors.gold} />
                    </PressableScale>
                  )}
                </View>
                {isOwnProfile && (
                  <Text style={styles.sectionSubtitle}>
                    Search and select your favorite spots
                  </Text>
                )}
                <View style={styles.clubsGrid}>
                  {loadingClubs ? (
                    <View style={{ padding: 20, alignItems: "center" }}>
                      <ActivityIndicator size="small" color={Colors.gold} />
                      <Text style={styles.sectionSubtitle}>
                        Loading clubs...
                      </Text>
                    </View>
                  ) : getSelectedClubsData().length === 0 ? (
                    <View style={{ padding: 20, alignItems: "center" }}>
                      <Ionicons
                        name="heart-outline"
                        size={48}
                        color={Colors.lightGrey}
                      />
                      <Text
                        style={[
                          styles.sectionSubtitle,
                          { marginTop: 12, textAlign: "center" },
                        ]}
                      >
                        {isOwnProfile
                          ? "No favorite clubs yet. Tap + to add some!"
                          : "No favorite clubs"}
                      </Text>
                    </View>
                  ) : null}
                  {!loadingClubs &&
                    getSelectedClubsData().map((club, index) => (
                      <Animated.View
                        key={club.id}
                        entering={FadeInDown.delay(index * 100).springify()}
                      >
                        <PressableScale
                          style={styles.clubCard}
                          onPress={() => router.push(`/club/${club.id}` as any)}
                        >
                          <Image
                            source={{ uri: club.image }}
                            style={styles.clubCardImage}
                          />
                          <View style={styles.clubCardContent}>
                            <Text style={styles.clubCardName}>{club.name}</Text>
                            <View style={styles.clubCardLocation}>
                              <Ionicons
                                name="location"
                                size={12}
                                color={Colors.gold}
                              />
                              <Text style={styles.clubCardLocationText}>
                                {club.location}
                              </Text>
                            </View>
                          </View>
                          {isOwnProfile && (
                            <TouchableOpacity
                              style={styles.clubRemoveButton}
                              onPress={(e) => {
                                e.stopPropagation();
                                toggleClub(club.id);
                              }}
                            >
                              <Ionicons
                                name="close-circle"
                                size={24}
                                color={Colors.gold}
                              />
                            </TouchableOpacity>
                          )}
                        </PressableScale>
                      </Animated.View>
                    ))}
                </View>
              </View>
            </Animated.View>
          </>
        )}

        {/* Feed Tab Content */}
        {activeTab === "feed" && (
          <UserMediaGrid
            posts={userPosts}
            title={isOwnProfile ? "My Club Vibes" : "Club Vibes"}
            onPostPress={(postIndex) => {
              setFeedInitialIndex(postIndex);
              setShowFeedViewer(true);
            }}
            onAddPost={
              isOwnProfile ? () => setShowAddPostModal(true) : undefined
            }
          />
        )}

        {/* Beer Stats Tab Content */}
        {activeTab === "beer-stats" && (
          <BeerStatsTab
            userId={viewingUserId}
            isOwnProfile={isOwnProfile}
            spendingVisible={viewingUser?.spending_visible !== false}
          />
        )}

        <View />
      </KeyboardAwareScrollView>

      {/* Add Drink Modal - only for own profile */}
      {isOwnProfile && showDrinkModal && (
        <Modal
          onDismiss={() => setShowDrinkModal(false)}
          bgColor={Colors.bgCard}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Favorite Drink</Text>
            <TouchableOpacity onPress={() => setShowDrinkModal(false)}>
              <Ionicons name="close" size={24} color={Colors.platinum} />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>
            Enter the brand name (e.g., Black Label, Hennessy)
          </Text>
          <TextInput
            style={styles.modalInput}
            value={newDrink}
            onChangeText={setNewDrink}
            placeholder="Brand name..."
            placeholderTextColor={Colors.lightGrey}
            autoFocus
            onSubmitEditing={addDrink}
          />
          <PressableScale style={styles.modalButton} onPress={addDrink}>
            <Text style={styles.modalButtonText}>Add Drink</Text>
            <Ionicons name="checkmark" size={20} color={Colors.bg} />
          </PressableScale>
          {/* </Animated.View> */}
        </Modal>
      )}

      {/* Club Selection Modal - only for own profile */}
      {isOwnProfile && showClubModal && (
        <Modal
          onDismiss={() => closeClubModal()}
          bgColor={Colors.bgCard}
          sliding
          noScroll
        >
          <View style={{ paddingBottom: 16 }}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search Clubs</Text>
              <TouchableOpacity
                onPress={() => closeClubModal()}
                style={styles.modalClose}
              >
                <Ionicons name="close" size={24} color={Colors.gold} />
              </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color={Colors.lightGrey} />
              <TextInput
                style={styles.searchInput}
                value={clubSearchQuery}
                onChangeText={setClubSearchQuery}
                placeholder="Search clubs..."
                placeholderTextColor={Colors.lightGrey}
              />
            </View>
            <ScrollView
              style={{ maxHeight: 360 }}
              contentContainerStyle={{ paddingBottom: 8 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {!clubSearchQuery.trim() ? (
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingTop: 28,
                    paddingBottom: 28,
                    gap: 10,
                  }}
                >
                  <Ionicons name="search" size={40} color={Colors.lightGrey} />
                  <Text style={{ color: Colors.lightGrey, fontSize: 14 }}>
                    Search for a club
                  </Text>
                </View>
              ) : allClubs.length === 0 ? (
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingTop: 28,
                    paddingBottom: 28,
                    gap: 10,
                  }}
                >
                  <Ionicons
                    name="business-outline"
                    size={40}
                    color={Colors.lightGrey}
                  />
                  <Text style={{ color: Colors.lightGrey, fontSize: 14 }}>
                    No clubs found
                  </Text>
                </View>
              ) : null}
              {allClubs.map((club) => {
                const isSelected = selectedClubs.includes(club.id);
                return (
                  <PressableScale
                    key={club.id}
                    style={StyleSheet.flatten([
                      styles.clubListItem,
                      isSelected && styles.clubListItemSelected,
                    ])}
                    onPress={() => toggleClub(club.id)}
                  >
                    <Image
                      source={{ uri: club.image }}
                      style={styles.clubListItemImage}
                    />
                    <View style={styles.clubListItemContent}>
                      <Text style={styles.clubListItemName}>{club.name}</Text>
                      <View style={styles.clubListItemLocation}>
                        <Ionicons
                          name="location"
                          size={12}
                          color={Colors.lightGrey}
                        />
                        <Text style={styles.clubListItemLocationText}>
                          {club.location}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={StyleSheet.flatten([
                        styles.clubListItemCheckbox,
                        isSelected && styles.clubListItemCheckboxSelected,
                      ])}
                    >
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={Colors.bg}
                        />
                      )}
                    </View>
                  </PressableScale>
                );
              })}
            </ScrollView>
            {JSON.stringify([...selectedClubs].sort()) !==
              JSON.stringify([...originalClubs].sort()) && (
              <PressableScale
                style={[styles.modalButton, { marginTop: 12 }]}
                onPress={() => closeClubModal()}
              >
                <Text style={styles.modalButtonText}>Done</Text>
                <Ionicons name="checkmark" size={20} color={Colors.bg} />
              </PressableScale>
            )}
          </View>
        </Modal>
      )}

      {/* Avatar Viewer Modal */}
      {isOwnProfile && showAvatarModal && (
        <Modal onDismiss={() => setShowAvatarModal(false)} bgColor={Colors.bg}>
          <View style={styles.avatarModalContent}>
            <View style={styles.avatarModalHeader}>
              <TouchableOpacity
                onPress={() => setShowAvatarModal(false)}
                style={{ position: "absolute", right: 0 }}
              >
                <Ionicons name="close" size={28} color={Colors.gold} />
              </TouchableOpacity>
            </View>

            {/* Full Size Avatar */}
            <View style={styles.fullAvatarContainer}>
              {(() => {
                // Use same logic as main avatar display
                const hasAvatarChange = avatarUri !== originalAvatar;
                const displayAvatar = hasAvatarChange
                  ? avatarUri
                  : authUser?.avatar_url;

                return displayAvatar ? (
                  <Image
                    source={{ uri: displayAvatar }}
                    style={styles.fullAvatar}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.fullAvatarPlaceholder}>
                    <Ionicons
                      name="person"
                      size={120}
                      color={Colors.primaryBlue}
                    />
                  </View>
                );
              })()}
            </View>

            {/* Action Buttons */}
            <View style={styles.avatarActionsContainer}>
              <PressableScale
                style={styles.avatarActionButton}
                onPress={pickImage}
              >
                <Ionicons name="camera" size={24} color={Colors.bg} />
                <Text style={styles.avatarActionText}>Change Photo</Text>
              </PressableScale>

              {(() => {
                // Only show remove button if there's currently an avatar to display
                const hasAvatarChange = avatarUri !== originalAvatar;
                const displayAvatar = hasAvatarChange
                  ? avatarUri
                  : authUser?.avatar_url;

                return displayAvatar ? (
                  <PressableScale
                    style={[
                      styles.avatarActionButton,
                      styles.avatarRemoveButton,
                    ]}
                    onPress={removeAvatar}
                  >
                    <Ionicons name="trash" size={24} color="#ff3b30" />
                    <Text
                      style={[styles.avatarActionText, styles.avatarRemoveText]}
                    >
                      Remove Photo
                    </Text>
                  </PressableScale>
                ) : null;
              })()}
            </View>
          </View>
        </Modal>
      )}

      {/* Feed Viewer Modal */}
      <ClubFeedViewer
        visible={showFeedViewer}
        posts={userPosts}
        initialPostIndex={feedInitialIndex}
        currentUserId={authUser?.id}
        onClose={() => {
          setShowFeedViewer(false);
        }}
        onPostDeleted={(postId) => {
          setUserPosts(userPosts.filter((p) => p.id !== postId));
          setToastMessage("Post deleted");
          setToastType("success");
          setToastVisible(true);
        }}
        onPostUpdated={(postId, updatedCaption) => {
          setUserPosts(
            userPosts.map((p) =>
              p.id === postId ? { ...p, description: updatedCaption } : p,
            ),
          );
        }}
        onPostLiked={(postId, liked, likeCount) => {
          setUserPosts(
            userPosts.map((p) =>
              p.id === postId
                ? {
                    ...p,
                    isLiked: liked,
                    likes: likeCount,
                    likeCount: likeCount,
                  }
                : p,
            ),
          );
        }}
        onPostPinToggled={(postId, pinnedAt) => {
          const updated = userPosts.map((p) =>
            p.id === postId ? { ...p, pinnedAt } : p,
          );
          const sorted = [...updated].sort((a, b) => {
            if (a.pinnedAt && !b.pinnedAt) return -1;
            if (!a.pinnedAt && b.pinnedAt) return 1;
            if (a.pinnedAt && b.pinnedAt) {
              return (
                new Date(b.pinnedAt).getTime() - new Date(a.pinnedAt).getTime()
              );
            }
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
          setUserPosts(sorted);
        }}
      />

      {/* Add Post Modal */}
      {showAddPostModal && (
        <AddPostModal
          visible={showAddPostModal}
          onClose={() => setShowAddPostModal(false)}
          onPost={handleAddPost}
          showClubSelector={true}
          availableClubs={allClubs}
        />
      )}

      {/* Edit Intention Modal */}
      {editingIntention && (
        <PostIntentionModal
          visible={!!editingIntention}
          clubName={editingIntention.clubName || ""}
          existingIntention={editingIntention}
          onClose={() => setEditingIntention(null)}
          onSubmit={handleUpdateIntention}
          onRemove={() => handleDeleteIntention(editingIntention.id)}
        />
      )}

      {/* Delete Intention Confirmation Modal */}
      {deletingIntentionId && (
        <Modal onDismiss={() => setDeletingIntentionId(null)}>
          <View style={confirmStyles.container}>
            <View style={confirmStyles.iconWrap}>
              <Ionicons name="trash-outline" size={32} color="#FF6B6B" />
            </View>
            <Text style={confirmStyles.title}>Remove Plan</Text>
            <Text style={confirmStyles.body}>
              Are you sure you want to remove this meetup plan?
            </Text>
            <View style={confirmStyles.actions}>
              <TouchableOpacity
                style={confirmStyles.cancelBtn}
                onPress={() => setDeletingIntentionId(null)}
              >
                <Text style={confirmStyles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={confirmStyles.deleteBtn}
                onPress={() => {
                  handleDeleteIntention(deletingIntentionId);
                  setDeletingIntentionId(null);
                }}
              >
                <Ionicons name="trash-outline" size={16} color="#fff" />
                <Text style={confirmStyles.deleteText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Save Button - Fixed at bottom when changes detected */}
      {isOwnProfile && hasChanges() && (
        <Animated.View
          entering={FadeInUp.springify()}
          style={styles.saveButtonContainer}
        >
          <PressableScale
            onPress={handleSaveProfile}
            style={styles.saveButton}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={Colors.bg} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color={Colors.bg} />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </PressableScale>
        </Animated.View>
      )}

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
        type={toastType}
      />
    </SafeAreaView>
  );
}
