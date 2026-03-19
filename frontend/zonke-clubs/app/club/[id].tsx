import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
  Linking,
  FlatList,
  Dimensions,
  Pressable,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { ClubMeetupSection } from "@/components/meetup/ClubMeetupSection";
import { PostIntentionModal } from "@/components/meetup/PostIntentionModal";
import { ConnectSheet } from "@/components/meetup/ConnectSheet";
import {
  MeetupIntention,
  ActivityType,
  getIntentionsForClub,
} from "@/types/meetup";
import { ClubMediaGrid } from "@/components/club/ClubMediaGrid";
import { MediaViewer } from "@/components/club/MediaViewer";
import { ClubFeedViewer } from "@/components/club/ClubFeedViewer";
import { AddPostModal } from "@/components/post/AddPostModal";
import { MediaAsset, ClubPost } from "@/types/post";
import * as Haptics from "expo-haptics";
import { Toast } from "@/components/ui/Toast";
import {
  clubsService,
  Club as ApiClub,
  DJSchedule,
  ClubEvent,
  ClubPost as ApiClubPost,
} from "@/services/clubsService";
import { intentionsService } from "@/services/intentionsService";
import {
  connectionService,
  transformRequest,
} from "@/services/connectionService";
import { useAuth } from "@/contexts/AuthContext";
import { websocketService } from "@/services/websocketService";
import { ConnectionRequest } from "@/types/connection";
import {
  strobeService,
  type StrobeSessionInfo,
} from "@/services/strobeService";

const HEADER_HEIGHT = 300;

type Gig = {
  id: string;
  date: string;
  time: string;
  headliner: string;
  genre?: string;
  djs: string[];
  cover_image?: string;
};

type DJ = {
  id: string;
  name: string;
  playingFrom?: string;
  instagram?: string;
  tiktok?: string;
};

type SectionTab = "info" | "people";

const getDJInitial = (name: string): string => {
  const trimmed = name.trim();
  if (/^dj\s+/i.test(trimmed)) {
    return trimmed
      .replace(/^dj\s+/i, "")
      .charAt(0)
      .toUpperCase();
  }
  return trimmed.charAt(0).toUpperCase();
};

export default function ClubScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const clubId = id ?? "3f1b5bd3-a899-44c1-bfda-ee83f940accb"; // The Grand Africa Café & Beach (default fallback)
  const scrollY = useSharedValue(0);
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // Section tab state
  const [activeSection, setActiveSection] = useState<SectionTab>("info");

  // Modal state
  const [showIntentionModal, setShowIntentionModal] = useState(false);
  const [showConnectSheet, setShowConnectSheet] = useState(false);
  const [selectedIntention, setSelectedIntention] =
    useState<MeetupIntention | null>(null);
  const [userIntention, setUserIntention] = useState<MeetupIntention | null>(
    null,
  );

  // Media viewer state
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset | null>(null);
  const [viewerMediaList, setViewerMediaList] = useState<MediaAsset[]>([]);

  // Feed viewer state
  const [showFeedViewer, setShowFeedViewer] = useState(false);
  const [feedInitialIndex, setFeedInitialIndex] = useState(0);

  // Add post modal state
  const [showAddPostModal, setShowAddPostModal] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "success",
  );

  // Club data from API
  const [club, setClub] = useState<ApiClub | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Intentions data from API
  const [intentions, setIntentions] = useState<MeetupIntention[]>([]);
  const [loadingIntentions, setLoadingIntentions] = useState(false);

  // Track connection statuses (includes sent and received requests with their status and threadId)
  const [connectionStatuses, setConnectionStatuses] = useState<
    Map<string, { status: string; threadId?: string }>
  >(new Map());

  // Get posts for this club
  const [clubPosts, setClubPosts] = useState<ClubPost[]>([]);

  // Schedule and events data from API
  const [schedules, setSchedules] = useState<DJSchedule[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [loadingDay, setLoadingDay] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Week selection for DJ lineup: 'current' or 'upcoming'
  const [selectedWeekView, setSelectedWeekView] = useState<
    "current" | "upcoming"
  >("current");

  // Active strobe session banner
  const [activeStrobe, setActiveStrobe] = useState<StrobeSessionInfo | null>(
    null,
  );

  // Fetch club data
  useEffect(() => {
    loadClub();
    loadIntentions();
    loadRequestedUsers();
    loadEvents();
  }, [clubId]);

  // Reload schedules when the selected week view changes
  useEffect(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentSunday = new Date(today);
    currentSunday.setDate(today.getDate() - today.getDay());

    if (selectedWeekView === "upcoming") {
      const nextSunday = new Date(currentSunday);
      nextSunday.setDate(currentSunday.getDate() + 7);
      const y = nextSunday.getFullYear();
      const m = String(nextSunday.getMonth() + 1).padStart(2, "0");
      const d = String(nextSunday.getDate()).padStart(2, "0");
      loadSchedules(`${y}-${m}-${d}`);
    } else {
      loadSchedules();
    }
  }, [selectedWeekView, clubId]);

  // Load posts when club data is available
  useEffect(() => {
    if (club) {
      loadClubPosts();
    }
  }, [clubId, club]);

  // Poll for active strobe session every 10s
  useEffect(() => {
    let cancelled = false;

    const check = () => {
      strobeService
        .getActiveSession(clubId)
        .then((session) => {
          if (!cancelled) setActiveStrobe(session);
        })
        .catch(() => {});
    };

    check();
    const interval = setInterval(check, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [clubId]);

  const loadClubPosts = () => {
    clubsService
      .getClubPosts(clubId, 1, 100)
      .then((response) => {
        // Transform API response to match ClubPost type expected by UI components
        const transformedPosts: ClubPost[] = response.posts.map(
          (apiPost: ApiClubPost) => ({
            id: apiPost.id,
            clubId: apiPost.club_id,
            description: apiPost.caption || undefined,
            media: apiPost.assets.map((asset) => ({
              id: asset.id,
              type: (asset.type as "image" | "video") || "image",
              url: asset.url,
              thumbnailUrl: asset.type === "video" ? asset.url : undefined,
              duration: asset.duration,
              startTime: asset.start_time,
              endTime: asset.end_time,
              width: 600,
              height: 800,
            })),
            likeCount: apiPost.like_count || 0,
            isLiked: apiPost.has_liked || false,
            comments: 0, // TODO: Implement comments when backend supports it
            createdAt: apiPost.inserted_at,
            status: apiPost.status as "pending" | "approved" | "rejected",
            isClubApproved: apiPost.is_club_approved,
            clubApprovedAt: apiPost.club_approved_at || undefined,
            user: apiPost.user
              ? {
                  id: apiPost.user.id,
                  username: apiPost.user.username,
                  avatarUrl: apiPost.user.avatar_url || undefined,
                }
              : undefined,
          }),
        );

        setClubPosts(transformedPosts);
      })
      .catch((error) => {
        console.error("Failed to load club posts:", error);
        setClubPosts([]);
      });
  };

  // Listen for WebSocket connection request updates
  useEffect(() => {
    const handleRequestAccepted = (payload: any) => {
      // Transform the request from snake_case to camelCase
      const transformedRequest = transformRequest(payload.request);

      // Update the connection status map
      setConnectionStatuses((prevStatuses) => {
        const newStatuses = new Map(prevStatuses);

        // Update status for the receiver (the person we sent the request to)
        newStatuses.set(transformedRequest.receiver.id, {
          status: transformedRequest.status,
          threadId: transformedRequest.threadId,
        });

        return newStatuses;
      });
    };

    const handleNewRequest = (payload: any) => {
      // Transform the request from snake_case to camelCase
      const transformedRequest = transformRequest(payload.request);

      // Update the connection status map
      setConnectionStatuses((prevStatuses) => {
        const newStatuses = new Map(prevStatuses);

        // Add status for the sender (the person who sent us the request)
        newStatuses.set(transformedRequest.sender.id, {
          status: transformedRequest.status,
          threadId: transformedRequest.threadId,
        });

        return newStatuses;
      });
    };

    websocketService.on("connection_request_accepted", handleRequestAccepted);
    websocketService.on("new_connection_request", handleNewRequest);

    return () => {
      websocketService.off(
        "connection_request_accepted",
        handleRequestAccepted,
      );
      websocketService.off("new_connection_request", handleNewRequest);
    };
  }, []);

  const loadClub = () => {
    setLoading(true);
    setError(null);
    clubsService
      .getClub(clubId)
      .then((response) => {
        setClub(response.club);
      })
      .catch((error) => {
        console.error("Failed to load club:", error);
        setError("Unable to load club details");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const loadIntentions = () => {
    setLoadingIntentions(true);
    // Fetch all intentions (no exclusion) so we can also find the current user's own
    intentionsService
      .getClubIntentions(clubId)
      .then((response) => {
        const allIntentions = getIntentionsForClub(response.intentions);
        // Split: user's own intention vs others
        const myIntention = user?.id
          ? allIntentions.find((i) => i.user.id === user.id) || null
          : null;
        const otherIntentions = user?.id
          ? allIntentions.filter((i) => i.user.id !== user.id)
          : allIntentions;
        setUserIntention(myIntention);
        setIntentions(otherIntentions);
      })
      .catch((error) => {
        console.error("Failed to load intentions:", error);
        setIntentions([]);
      })
      .finally(() => {
        setLoadingIntentions(false);
      });
  };

  const loadRequestedUsers = () => {
    // Fetch both sent and received connection requests to properly track bidirectional status
    Promise.all([
      connectionService.getReceivedRequests(),
      connectionService.getSentRequests(),
    ])
      .then(([receivedReqs, sentReqs]) => {
        // Build connection status map
        const statusMap = new Map<
          string,
          { status: string; threadId?: string }
        >();

        // Process received requests (where we are the receiver)
        receivedReqs.requests.forEach((req: ConnectionRequest) => {
          statusMap.set(req.sender.id, {
            status: req.status,
            threadId: req.threadId,
          });
        });

        // Process sent requests (where we are the sender)
        sentReqs.requests.forEach((req: ConnectionRequest) => {
          statusMap.set(req.receiver.id, {
            status: req.status,
            threadId: req.threadId,
          });
        });

        setConnectionStatuses(statusMap);
      })
      .catch((error) => {
        console.error("Failed to load connection requests:", error);
      });
  };

  const getWeekStartString = (weekSunday: Date): string => {
    const y = weekSunday.getFullYear();
    const m = String(weekSunday.getMonth() + 1).padStart(2, "0");
    const d = String(weekSunday.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const loadSchedules = (weekStart?: string) => {
    setLoadingSchedules(true);
    clubsService
      .getClubSchedule(clubId, weekStart)
      .then((response) => {
        setSchedules(response.schedules);
      })
      .catch((error) => {
        console.error("❌ Failed to load schedules:", error);
        setSchedules([]);
      })
      .finally(() => {
        setLoadingSchedules(false);
      });
  };

  const loadEvents = () => {
    setLoadingEvents(true);
    clubsService
      .getClubEvents(clubId)
      .then((response) => {
        setEvents(response.events);
      })
      .catch((error) => {
        console.error("Failed to load events:", error);
        setEvents([]);
      })
      .finally(() => {
        setLoadingEvents(false);
      });
  };

  // Handle media press
  const handleMediaPress = (media: MediaAsset, allMedia: MediaAsset[]) => {
    setSelectedMedia(media);
    setViewerMediaList(allMedia);
    setShowMediaViewer(true);
  };

  // Handle add post
  const handleAddPost = (media: any[], description: string) => {
    const newPost: ClubPost = {
      id: `club_post_${Date.now()}`,
      clubId: clubId,
      description: description || undefined,
      media: media.map((item, index) => ({
        id: `media_${Date.now()}_${index}`,
        type: item.type,
        url: item.uri,
        thumbnailUrl: item.type === "video" ? item.uri : undefined,
        duration: item.duration,
        startTime: item.startTime, // For trimmed videos
        endTime: item.endTime, // For trimmed videos
        width: 600,
        height: 800,
      })),
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
    };

    setClubPosts([newPost, ...clubPosts]);
  };

  // Get opening hours from club data or fallback to deriving from schedules
  const openingHours: Record<string, string> = React.useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayMap: Record<string, string> = {
      Mon: "Monday",
      Tue: "Tuesday",
      Wed: "Wednesday",
      Thu: "Thursday",
      Fri: "Friday",
      Sat: "Saturday",
      Sun: "Sunday",
    };
    const hoursMap: Record<string, string> = {};

    // Check if club has explicit opening hours set
    if (club?.opening_hours && Object.keys(club.opening_hours).length > 0) {
      // Use explicit opening hours from club settings
      days.forEach((day) => {
        const fullDayName = dayMap[day];
        const dayHours = club.opening_hours[fullDayName];

        if (dayHours && dayHours.open && dayHours.close) {
          // Format times (HH:MM to HH:MM AM/PM)
          const formatTime = (time: string) => {
            const [hours, minutes] = time.split(":").map(Number);
            const period = hours >= 12 ? "PM" : "AM";
            const displayHours =
              hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
            return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
          };

          hoursMap[day] =
            `${formatTime(dayHours.open)} – ${formatTime(dayHours.close)}`;
        } else {
          hoursMap[day] = "Closed";
        }
      });
    } else {
      // Fallback: Derive from DJ schedules
      days.forEach((day) => {
        const daySchedules = schedules.filter((s) => s.day === day);
        if (daySchedules.length === 0) {
          hoursMap[day] = "Closed";
        } else {
          const times = daySchedules
            .filter((s) => s.start_time && s.end_time)
            .map((s) => ({ start: s.start_time!, end: s.end_time! }));

          if (times.length === 0) {
            hoursMap[day] = "Open";
          } else {
            const earliest = times.reduce(
              (min, t) => (t.start < min ? t.start : min),
              times[0].start,
            );
            const latest = times.reduce(
              (max, t) => (t.end > max ? t.end : max),
              times[0].end,
            );

            const formatTime = (time: string) => {
              const [hours, minutes] = time.split(":").map(Number);
              const period = hours >= 12 ? "PM" : "AM";
              const displayHours =
                hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
              return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
            };

            hoursMap[day] = `${formatTime(earliest)} – ${formatTime(latest)}`;
          }
        }
      });
    }

    return hoursMap;
  }, [club, schedules]);

  // Create a mapping of DJ IDs to DJ names
  const djIdToNameMap = React.useMemo(() => {
    const map = new Map<string, string>();
    schedules.forEach((schedule) => {
      map.set(schedule.dj_id, schedule.dj_name);
    });
    return map;
  }, [schedules]);

  // Transform events into upcoming gigs
  const upcomingGigs: Gig[] = React.useMemo(() => {
    return events.map((event) => {
      // Format date (YYYY-MM-DD to "Fri, 2 Jan")
      // Parse date in local timezone to avoid UTC conversion issues
      const [year, month, day] = event.date.split("-").map(Number);
      const eventDate = new Date(year, month - 1, day); // month is 0-indexed
      const dayOfWeek = eventDate.toLocaleDateString("en-US", {
        weekday: "short",
      });
      const dayNum = eventDate.getDate();
      const monthName = eventDate.toLocaleDateString("en-US", {
        month: "short",
      });
      const formattedDate = `${dayOfWeek}, ${dayNum} ${monthName}`;

      // Format time (HH:MM to HH:MM AM/PM)
      const [hours, minutes] = event.start_time.split(":").map(Number);
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const formattedTime = `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;

      // Extract DJ names from lineup objects (backend now returns DJ objects with id and name)
      const djNames = event.dj_lineup.map((dj) => dj.name).filter(Boolean);

      return {
        id: event.id,
        date: formattedDate,
        time: formattedTime,
        headliner: event.title,
        genre: event.genre || undefined,
        djs: djNames,
        cover_image: event.cover_image || undefined,
      };
    });
  }, [events]); // Removed djIdToNameMap dependency - no longer needed

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  // Use local date to avoid timezone issues
  const nowForIndex = new Date();
  const todayForIndex = new Date(
    nowForIndex.getFullYear(),
    nowForIndex.getMonth(),
    nowForIndex.getDate(),
  );
  const dayIndex = todayForIndex.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const [selectedDay, setSelectedDay] = useState<string>(daysOfWeek[dayIndex]);
  const dayTabsScrollRef = useRef<any>(null);

  // Brief loading flash when switching day tabs
  useEffect(() => {
    setLoadingDay(true);
    const timer = setTimeout(() => setLoadingDay(false), 150);
    return () => clearTimeout(timer);
  }, [selectedDay]);

  // Scroll today's day tab into view on mount
  useEffect(() => {
    if (dayIndex > 0) {
      const estimatedTabWidth = 78; // paddingHorizontal(32) + text(~36) + marginRight(10)
      setTimeout(() => {
        dayTabsScrollRef.current?.scrollTo({
          x: dayIndex * estimatedTabWidth,
          animated: true,
        });
      }, 400);
    }
  }, []);

  // Calculate the Sunday that starts the current week
  const getWeekSunday = React.useCallback((): Date => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay());
    return sunday;
  }, []);

  // Calculate the Sunday that starts the upcoming week
  const getUpcomingWeekSunday = React.useCallback((): Date => {
    const sun = getWeekSunday();
    const next = new Date(sun);
    next.setDate(sun.getDate() + 7);
    return next;
  }, [getWeekSunday]);

  // The Sunday for the currently-selected week view
  const activeSunday = React.useMemo(
    () =>
      selectedWeekView === "upcoming"
        ? getUpcomingWeekSunday()
        : getWeekSunday(),
    [selectedWeekView, getWeekSunday, getUpcomingWeekSunday],
  );

  // Get the date label for a specific day abbreviation within the active week
  const getDayDate = React.useCallback(
    (dayAbbr: string) => {
      const dayMap: Record<string, number> = {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
      };
      const targetDate = new Date(activeSunday);
      targetDate.setDate(activeSunday.getDate() + dayMap[dayAbbr]);
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
      return `${months[targetDate.getMonth()]} ${targetDate.getDate()}`;
    },
    [activeSunday],
  );

  // Week range label for the active week e.g. "Feb 16 – Feb 22"
  const weekRangeLabel = React.useMemo(() => {
    const saturday = new Date(activeSunday);
    saturday.setDate(activeSunday.getDate() + 6);
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
    return `${months[activeSunday.getMonth()]} ${activeSunday.getDate()} – ${months[saturday.getMonth()]} ${saturday.getDate()}`;
  }, [activeSunday]);

  // Transform schedules into DJ schedule grouped by day
  // If a day has a big event, show the event's DJ lineup instead of regular schedule
  const djSchedule: Record<string, DJ[]> = React.useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const scheduleMap: Record<string, DJ[]> = {};

    const dayIndexMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };

    days.forEach((day) => {
      // Get the exact date for this day within the active week (Sun–Sat)
      const targetDate = new Date(activeSunday);
      targetDate.setDate(activeSunday.getDate() + dayIndexMap[day]);

      // Format date as YYYY-MM-DD to match event dates
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, "0");
      const dayNum = String(targetDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${dayNum}`;

      // Check if there's an event on this date
      const eventOnThisDay = events.find((e) => {
        return e.date === dateString;
      });

      if (eventOnThisDay) {
        // Use event's DJ lineup

        scheduleMap[day] = eventOnThisDay.dj_lineup.map((dj) => {
          // Format event start time for display
          let playingFrom: string | undefined;
          if (eventOnThisDay.start_time) {
            const [hours, minutes] = eventOnThisDay.start_time
              .split(":")
              .map(Number);
            const period = hours >= 12 ? "PM" : "AM";
            const displayHours =
              hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
            playingFrom = `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
          }

          return {
            id: dj.id,
            name: dj.name,
            playingFrom,
            instagram: dj.instagram,
            tiktok: dj.tiktok,
          };
        });
      } else {
        // Use regular weekly schedule
        const daySchedules = schedules.filter((s) => s.day === day);

        scheduleMap[day] = daySchedules.map((schedule) => {
          // Format time if available
          let playingFrom: string | undefined;
          if (schedule.start_time) {
            const [hours, minutes] = schedule.start_time.split(":").map(Number);
            const period = hours >= 12 ? "PM" : "AM";
            const displayHours =
              hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
            playingFrom = `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
          }

          return {
            id: schedule.id,
            name: schedule.dj_name,
            playingFrom,
            instagram: schedule.dj_instagram,
            tiktok: schedule.dj_tiktok,
          };
        });
      }
    });

    return scheduleMap;
  }, [schedules, events, activeSunday]);

  // Check if a day has a big event within the active week
  const dayHasEvent = React.useCallback(
    (dayAbbr: string): boolean => {
      const dayMap: Record<string, number> = {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
      };
      const targetDate = new Date(activeSunday);
      targetDate.setDate(activeSunday.getDate() + dayMap[dayAbbr]);

      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, "0");
      const dayNum = String(targetDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${dayNum}`;

      return events.some((e) => e.date === dateString);
    },
    [events, activeSunday],
  );

  const parseTimeToMinutes = (t: string) => {
    const m = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!m) return null;
    let hh = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    const ampm = m[3].toUpperCase();
    if (ampm === "AM" && hh === 12) hh = 0;
    if (ampm === "PM" && hh !== 12) hh += 12;
    return hh * 60 + mm;
  };

  const isDayOpenNow = (dayShort: string) => {
    const hours = openingHours[dayShort];
    if (!hours || hours.toLowerCase().includes("closed")) return false;
    const parts = hours.split(/–|-/).map((p) => p.trim());
    if (parts.length !== 2) return true;
    const start = parseTimeToMinutes(parts[0]);
    const end = parseTimeToMinutes(parts[1]);
    if (start == null || end == null) return true;
    const now = new Date();
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    if (start <= end) {
      return minutesNow >= start && minutesNow <= end;
    }
    return minutesNow >= start || minutesNow <= end;
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, HEADER_HEIGHT],
          [0, -HEADER_HEIGHT / 2],
          Extrapolation.CLAMP,
        ),
      },
      {
        scale: interpolate(
          scrollY.value,
          [-100, 0],
          [1.2, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  // const overlayAnimatedStyle = useAnimatedStyle(() => ({
  //   opacity: interpolate(
  //     scrollY.value,
  //     [0, HEADER_HEIGHT / 2],
  //     [0.4, 0.8],
  //     Extrapolation.CLAMP
  //   ),
  // }));

  // Use local date to avoid timezone issues
  const now = new Date();
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayIndexLocal = todayLocal.getDay(); // 0 = Sunday
  const orderedDays = daysOfWeek; // Always Sun → Sat for the current week

  // Placeholder image for club cover
  const coverImage =
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1400&q=60";

  // Show loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <PressableScale
          onPress={() => router.back()}
          style={[styles.backButton, { top: insets.top + 8 }]}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.platinum} />
        </PressableScale>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={styles.loadingText}>Loading club...</Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (error || !club) {
    return (
      <View style={styles.container}>
        <PressableScale
          onPress={() => router.back()}
          style={[styles.backButton, { top: insets.top + 8 }]}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.platinum} />
        </PressableScale>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={Colors.gold} />
          <Text style={styles.errorText}>{error || "Club not found"}</Text>
          <PressableScale onPress={loadClub} style={styles.retryButton}>
            <Ionicons name="refresh" size={20} color={Colors.bg} />
            <Text style={styles.retryButtonText}>Retry</Text>
          </PressableScale>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Parallax Header */}
      <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
        <ImageBackground source={{ uri: coverImage }} style={styles.coverImage}>
          {/* <Animated.View style={[styles.coverOverlay, overlayAnimatedStyle]} /> */}
        </ImageBackground>
      </Animated.View>

      {/* Back Button */}
      <PressableScale
        onPress={() => router.back()}
        style={[styles.backButton, { top: insets.top + 8 }]}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.platinum} />
      </PressableScale>

      {/* Content */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Spacer for header */}
        <View style={{ height: HEADER_HEIGHT - 60 }} />

        {/* Club Name */}
        <Animated.View entering={FadeInUp.springify()}>
          <Text style={styles.clubName}>{club.name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={14} color={Colors.gold} />
            <Text style={styles.locationText}>{club.location.name}</Text>
          </View>
        </Animated.View>

        {/* DJ Strobe active banner */}
        {activeStrobe && (
          <Pressable
            style={styles.strobeBanner}
            onPress={() =>
              router.push(
                `/strobe/join?clubId=${clubId}&clubName=${encodeURIComponent(club.name)}` as any,
              )
            }
          >
            <Ionicons name="flash" size={18} color="#000" />
            <View style={{ flex: 1 }}>
              <Text style={styles.strobeBannerTitle}>DJ STROBE ACTIVE</Text>
              <Text style={styles.strobeBannerSub}>
                {activeStrobe.bpm} BPM ·{" "}
                {activeStrobe.effect.replace("_", " ").toUpperCase()} · Tap to
                sync your flash
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#000" />
          </Pressable>
        )}

        {/* Section Tab Switcher */}
        <Animated.View
          entering={FadeInDown.delay(50).springify()}
          style={styles.tabSwitcher}
        >
          <PressableScale
            style={[
              styles.tabSwitcherButton,
              activeSection === "info" && styles.tabSwitcherButtonActive,
            ]}
            onPress={() => setActiveSection("info")}
          >
            <Ionicons
              name="information-circle"
              size={20}
              color={activeSection === "info" ? Colors.bg : Colors.lightGrey}
            />
            <Text
              style={[
                styles.tabSwitcherText,
                activeSection === "info" && styles.tabSwitcherTextActive,
              ]}
            >
              Club Info
            </Text>
          </PressableScale>

          <PressableScale
            style={[
              styles.tabSwitcherButton,
              activeSection === "people" && styles.tabSwitcherButtonActive,
            ]}
            onPress={() => setActiveSection("people")}
          >
            <Ionicons
              name="people"
              size={20}
              color={activeSection === "people" ? Colors.bg : Colors.lightGrey}
            />
            <Text
              style={[
                styles.tabSwitcherText,
                activeSection === "people" && styles.tabSwitcherTextActive,
              ]}
            >
              People & Content
            </Text>
          </PressableScale>
        </Animated.View>

        {/* ========== SECTION 1: CLUB INFORMATION ========== */}
        {activeSection === "info" && (
          <>
            {/* Opening Hours */}
            <Animated.View
              entering={FadeInDown.delay(150).springify()}
              style={styles.sectionCard}
            >
              <Text style={styles.subsectionTitle}>Opening Hours</Text>
              <View style={styles.hoursCardInner}>
                {orderedDays.map((day) => {
                  const hours = openingHours[day];
                  const openNow = isDayOpenNow(day);
                  const isToday = day === daysOfWeek[dayIndex];

                  return (
                    <PressableScale
                      key={day}
                      onPress={() =>
                        router.push(`/club/${club.id}/day?day=${day}` as any)
                      }
                      style={[
                        styles.hourRow,
                        openNow && styles.hourRowOpen,
                        isToday && styles.hourRowToday,
                      ]}
                    >
                      <View style={styles.hourDayWrap}>
                        {openNow && <View style={styles.openDot} />}
                        <View style={styles.dayNameDateWrap}>
                          <Text
                            style={[
                              styles.hourDay,
                              openNow && styles.hourDayOpen,
                              isToday && styles.hourDayToday,
                            ]}
                          >
                            {day}
                          </Text>
                          <Text style={styles.dayDate}>{getDayDate(day)}</Text>
                        </View>
                        {isToday && (
                          <Text style={styles.todayBadge}>Today</Text>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.hourText,
                          openNow && styles.hourTextOpen,
                        ]}
                      >
                        {hours}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>
            </Animated.View>

            {/* Upcoming Events */}
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              style={styles.sectionCard}
            >
              <View style={styles.eventsHeader}>
                <Text style={[styles.subsectionTitle, { marginBottom: 0 }]}>
                  Upcoming Big Events
                </Text>
                {upcomingGigs.length > 0 && (
                  <View style={styles.eventCountBadge}>
                    <Text style={styles.eventCountText}>
                      {upcomingGigs.length}
                    </Text>
                  </View>
                )}
              </View>
              {upcomingGigs.length === 0 && (
                <View style={styles.noEventsContainer}>
                  <View style={styles.noEventsIconWrap}>
                    <Ionicons
                      name="calendar-outline"
                      size={28}
                      color={Colors.gold}
                    />
                  </View>
                  <Text style={styles.noEventsTitle}>
                    Nothing scheduled yet
                  </Text>
                  <Text style={styles.noEventsSub}>
                    Big events will appear here when they're announced
                  </Text>
                </View>
              )}
              {upcomingGigs.length > 0 && (
                <FlatList
                  data={upcomingGigs}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(gig) => gig.id}
                  contentContainerStyle={styles.gigCarouselContent}
                  snapToInterval={SCREEN_WIDTH * 0.62 + 12}
                  decelerationRate="fast"
                  renderItem={({ item: gig, index }) => (
                    <PressableScale
                      style={[
                        styles.gigCarouselCard,
                        index === upcomingGigs.length - 1 && { marginRight: 0 },
                      ]}
                      onPress={() => {
                        if (gig.cover_image) {
                          const asset: MediaAsset = {
                            id: gig.id,
                            type: "image",
                            url: gig.cover_image,
                          };
                          handleMediaPress(asset, [asset]);
                        }
                      }}
                    >
                      <LinearGradient
                        colors={["rgba(57,243,255,0.12)", "rgba(0,0,0,0)"]}
                        style={styles.gigCarouselGradient}
                      />
                      <View style={styles.gigCarouselDateBadge}>
                        <Text style={styles.gigCarouselDateDay}>
                          {gig.date.split(",")[0]}
                        </Text>
                        <Text style={styles.gigCarouselDateNum}>
                          {gig.date.split(" ")[1]}
                        </Text>
                      </View>
                      <View style={styles.gigCarouselBody}>
                        <Text
                          style={styles.gigCarouselHeadliner}
                          numberOfLines={2}
                        >
                          {gig.headliner}
                        </Text>
                        <Text style={styles.gigCarouselMeta}>{gig.time}</Text>
                      </View>
                      {gig.djs.length > 0 && (
                        <View style={styles.gigCarouselDJsRow}>
                          {gig.djs.slice(0, 3).map((name, i) => (
                            <View key={i} style={styles.gigCarouselDJChip}>
                              <View style={styles.gigCarouselDJAvatar}>
                                <Text style={styles.gigCarouselDJInitial}>
                                  {getDJInitial(name)}
                                </Text>
                              </View>
                              <Text
                                style={styles.gigCarouselDJName}
                                numberOfLines={1}
                              >
                                {name}
                              </Text>
                            </View>
                          ))}
                          {gig.djs.length > 3 && (
                            <Text style={styles.gigCarouselDJMore}>
                              +{gig.djs.length - 3}
                            </Text>
                          )}
                        </View>
                      )}
                    </PressableScale>
                  )}
                />
              )}
            </Animated.View>

            {/* DJ Lineup */}
            <Animated.View
              entering={FadeInDown.delay(250).springify()}
              style={styles.sectionCard}
            >
              <View style={styles.lineupHeader}>
                <View>
                  <Text style={styles.subsectionTitle}>DJ Lineup</Text>
                  <Text style={styles.weekRangeLabel}>{weekRangeLabel}</Text>
                </View>
                <View style={styles.weekToggle}>
                  <PressableScale
                    onPress={() => {
                      setSelectedWeekView("current");
                      setSelectedDay(daysOfWeek[dayIndex]);
                      setTimeout(() => {
                        dayTabsScrollRef.current?.scrollTo({
                          x: dayIndex * 78,
                          animated: true,
                        });
                      }, 50);
                    }}
                    style={[
                      styles.weekToggleBtn,
                      selectedWeekView === "current" &&
                        styles.weekToggleBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.weekToggleBtnText,
                        selectedWeekView === "current" &&
                          styles.weekToggleBtnTextActive,
                      ]}
                    >
                      This Week
                    </Text>
                  </PressableScale>
                  <PressableScale
                    onPress={() => {
                      setSelectedWeekView("upcoming");
                      setSelectedDay("Sun");
                      setTimeout(() => {
                        dayTabsScrollRef.current?.scrollTo({
                          x: 0,
                          animated: true,
                        });
                      }, 50);
                    }}
                    style={[
                      styles.weekToggleBtn,
                      selectedWeekView === "upcoming" &&
                        styles.weekToggleBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.weekToggleBtnText,
                        selectedWeekView === "upcoming" &&
                          styles.weekToggleBtnTextActive,
                      ]}
                    >
                      Next Week
                    </Text>
                  </PressableScale>
                </View>
              </View>

              {/* {loadingSchedules ? (
                <ActivityIndicator
                  size="small"
                  color={Colors.accent}
                  style={{ marginVertical: 16 }}
                />
              ) : null} */}

              <Animated.ScrollView
                ref={dayTabsScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.dayTabs}
              >
                {orderedDays.map((d) => {
                  const hasEvent = dayHasEvent(d);
                  const isToday =
                    selectedWeekView === "current" &&
                    d === daysOfWeek[todayIndexLocal];
                  return (
                    <PressableScale
                      key={d}
                      onPress={() => setSelectedDay(d)}
                      style={[
                        styles.dayTab,
                        selectedDay === d && styles.dayTabActive,
                        isToday && selectedDay !== d && styles.dayTabToday,
                      ]}
                    >
                      <View style={styles.dayTabContent}>
                        <Text
                          style={[
                            styles.dayTabText,
                            selectedDay === d && styles.dayTabTextActive,
                            isToday &&
                              selectedDay !== d &&
                              styles.dayTabTodayText,
                          ]}
                        >
                          {isToday ? "Today" : d}
                        </Text>
                        {hasEvent && (
                          <Ionicons
                            name="trophy"
                            size={14}
                            color={
                              selectedDay === d ? Colors.bg : Colors.accent
                            }
                            style={{ marginLeft: 4 }}
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.dayTabDate,
                          selectedDay === d && styles.dayTabDateActive,
                        ]}
                      >
                        {getDayDate(d)}
                      </Text>
                      {isToday && (
                        <View
                          style={[
                            styles.todayDot,
                            selectedDay === d && styles.todayDotActive,
                          ]}
                        />
                      )}
                    </PressableScale>
                  );
                })}
              </Animated.ScrollView>

              {loadingSchedules || loadingDay ? (
                <ActivityIndicator
                  size="small"
                  color={Colors.accent}
                  style={{ marginVertical: 16 }}
                />
              ) : (djSchedule[selectedDay] || []).length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons
                    name={
                      openingHours[selectedDay]
                        ?.toLowerCase()
                        .includes("closed")
                        ? "moon"
                        : "musical-note"
                    }
                    size={32}
                    color={Colors.lightGrey}
                  />
                  <Text style={styles.emptyText}>
                    {openingHours[selectedDay]?.toLowerCase().includes("closed")
                      ? "Club is closed on " + selectedDay
                      : "No DJs scheduled for " + selectedDay}
                  </Text>
                </View>
              ) : (
                <Animated.ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ paddingVertical: 4 }}
                  contentContainerStyle={{ alignItems: "stretch" }}
                >
                  {(djSchedule[selectedDay] || []).map((dj, index) => (
                    <Animated.View
                      key={dj.id}
                      entering={FadeInDown.delay(100 + index * 50).springify()}
                      style={{ alignSelf: "stretch" }}
                    >
                      <View style={styles.djCard}>
                        <LinearGradient
                          colors={[
                            "rgba(57, 243, 255, 0.15)",
                            "rgba(57, 243, 255, 0.05)",
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.djCardGradient}
                        >
                          <View style={styles.djAvatarRing}>
                            <View style={styles.djAvatar}>
                              <Text style={styles.djAvatarInitial}>
                                {getDJInitial(dj.name)}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.djName}>{dj.name}</Text>
                          {(dj.instagram || dj.tiktok) && (
                            <View style={styles.djSocials}>
                              {dj.instagram && (
                                <PressableScale
                                  style={styles.djSocialBtn}
                                  onPress={() =>
                                    Linking.openURL(
                                      `https://instagram.com/${dj.instagram}`,
                                    )
                                  }
                                >
                                  <FontAwesome5
                                    name="instagram"
                                    size={12}
                                    color="#C13584"
                                    brand
                                    style={{ marginRight: 5 }}
                                  />
                                  <Text
                                    style={styles.djSocialLabel}
                                    numberOfLines={1}
                                  >
                                    @{dj.instagram}
                                  </Text>
                                </PressableScale>
                              )}
                              {dj.tiktok && (
                                <PressableScale
                                  style={styles.djSocialBtn}
                                  onPress={() =>
                                    Linking.openURL(
                                      `https://tiktok.com/@${dj.tiktok}`,
                                    )
                                  }
                                >
                                  <FontAwesome5
                                    name="tiktok"
                                    size={12}
                                    color={Colors.platinum}
                                    brand
                                    style={{ marginRight: 5 }}
                                  />
                                  <Text
                                    style={styles.djSocialLabel}
                                    numberOfLines={1}
                                  >
                                    @{dj.tiktok}
                                  </Text>
                                </PressableScale>
                              )}
                            </View>
                          )}
                        </LinearGradient>
                      </View>
                    </Animated.View>
                  ))}
                </Animated.ScrollView>
              )}
            </Animated.View>

            {/* About */}
            <Animated.View
              entering={FadeInDown.delay(100).springify()}
              style={styles.sectionCard}
            >
              <Text style={styles.subsectionTitle}>About</Text>
              <Text style={styles.aboutText}>{club.description}</Text>

              {/* Vibes */}
              {club.vibes && club.vibes.length > 0 && (
                <View style={styles.vibesContainer}>
                  {club.vibes.map((vibe, index) => (
                    <View key={index} style={styles.vibeBadge}>
                      <Text style={styles.vibeText}>{vibe}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Music Genres */}
              {club.music_genres && club.music_genres.length > 0 && (
                <View style={styles.genresSection}>
                  <Text style={styles.genresTitle}>Music:</Text>
                  <Text style={styles.genresText}>
                    {club.music_genres.join(", ")}
                  </Text>
                </View>
              )}

              {/* Entry Fee */}
              {club.entry_fee && (
                <View style={styles.feeSection}>
                  <Ionicons name="cash-outline" size={18} color={Colors.gold} />
                  <Text style={styles.feeText}>{club.entry_fee}</Text>
                </View>
              )}

              {/* Dress Code */}
              {club.dress_code && (
                <View style={styles.dressCodeSection}>
                  <Ionicons
                    name="shirt-outline"
                    size={18}
                    color={Colors.gold}
                  />
                  <Text style={styles.dressCodeText}>{club.dress_code}</Text>
                </View>
              )}

              {/* Reserve Table & Enquiries */}
              {((club.table_reservation_numbers &&
                club.table_reservation_numbers.length > 0) ||
                club.phone) && (
                <View style={styles.reserveBlock}>
                  <View style={styles.contactBlockHeader}>
                    <Ionicons
                      name="call-outline"
                      size={14}
                      color={Colors.accent}
                    />
                    <Text style={styles.contactBlockLabel}>
                      Reserve Table & Enquiries
                    </Text>
                  </View>
                  {[
                    ...(club.table_reservation_numbers || []),
                    ...(club.phone &&
                    !(club.table_reservation_numbers || []).includes(club.phone)
                      ? [club.phone]
                      : []),
                  ].map((num, i) => (
                    <PressableScale
                      key={i}
                      style={styles.callButton}
                      onPress={() => Linking.openURL(`tel:${num}`)}
                    >
                      <View style={styles.callButtonLeft}>
                        <View style={styles.callIconCircle}>
                          <Ionicons
                            name="call"
                            size={16}
                            color={Colors.accent}
                          />
                        </View>
                        <View>
                          <Text style={styles.callButtonNumber}>{num}</Text>
                          <Text style={styles.callButtonSub}>Tap to call</Text>
                        </View>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color="rgba(57,243,255,0.4)"
                      />
                    </PressableScale>
                  ))}
                </View>
              )}

              {/* Email & Location */}
              <View style={styles.contactRow}>
                {club.email && (
                  <View style={styles.contactItem}>
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={Colors.gold}
                    />
                    <Text style={styles.contactText}>{club.email}</Text>
                  </View>
                )}
                <View style={styles.contactItem}>
                  <Ionicons
                    name="location-outline"
                    size={18}
                    color={Colors.gold}
                  />
                  <Text style={styles.contactText}>{club.location.name}</Text>
                </View>
              </View>
            </Animated.View>
          </>
        )}

        {/* ========== SECTION 2: PEOPLE & CONTENT ========== */}
        {activeSection === "people" && (
          <>
            {/* People Looking to Meet */}
            <Animated.View
              entering={FadeInDown.delay(100).springify()}
              style={styles.sectionCard}
            >
              <Text style={styles.subsectionTitle}>People Looking to Meet</Text>
              {loadingIntentions ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={Colors.gold} />
                  <Text style={styles.loadingText}>Loading intentions...</Text>
                </View>
              ) : (
                <ClubMeetupSection
                  clubId={clubId}
                  intentions={intentions}
                  currentUserId={user?.id}
                  userIntention={userIntention}
                  connectionStatuses={connectionStatuses}
                  onPostIntention={() => setShowIntentionModal(true)}
                  onConnect={(intention: MeetupIntention) => {
                    setSelectedIntention(intention);
                    setShowConnectSheet(true);
                  }}
                />
              )}
            </Animated.View>

            {/* Photos & Videos */}
            <Animated.View
              entering={FadeInDown.delay(150).springify()}
              style={styles.sectionCard}
            >
              <ClubMediaGrid
                posts={clubPosts}
                onMediaPress={handleMediaPress}
                onPostPress={(postIndex) => {
                  setFeedInitialIndex(postIndex);
                  setShowFeedViewer(true);
                }}
                // Only show add button if user is the club admin
                onAddPost={
                  club.admin_id === user?.id
                    ? () => setShowAddPostModal(true)
                    : undefined
                }
              />
            </Animated.View>
          </>
        )}

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Post Intention Modal */}
      {showIntentionModal && (
        <PostIntentionModal
          visible={showIntentionModal}
          clubName={club.name}
          existingIntention={userIntention || undefined}
          onClose={() => setShowIntentionModal(false)}
          onSubmit={(
            activityType: ActivityType,
            plannedDate: string,
            message?: string,
          ) => {
            // Create intention via API
            intentionsService
              .createIntention({
                activity_type: activityType,
                club_id: clubId,
                planned_date: plannedDate,
                message: message,
              })
              .then((response) => {
                setUserIntention(response.intention);
                setShowIntentionModal(false);

                // Reload intentions to show the new one
                loadIntentions();

                // Show success toast
                setToastMessage("Your intention has been posted!");
                setToastType("success");
                setToastVisible(true);

                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success,
                );
              })
              .catch((error) => {
                console.error("Failed to create intention:", error);
                setToastMessage("Failed to post intention. Please try again.");
                setToastType("error");
                setToastVisible(true);

                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Error,
                );
              });
          }}
          onRemove={() => {
            // Delete intention via API if it exists
            if (userIntention?.id) {
              intentionsService
                .deleteIntention(userIntention.id)
                .then(() => {
                  setUserIntention(null);
                  setShowIntentionModal(false);

                  // Reload intentions
                  loadIntentions();

                  // Show success toast
                  setToastMessage("Your intention has been removed");
                  setToastType("info");
                  setToastVisible(true);
                })
                .catch((error) => {
                  console.error("Failed to delete intention:", error);
                  setToastMessage("Failed to remove intention");
                  setToastType("error");
                  setToastVisible(true);
                });
            } else {
              setUserIntention(null);
              setShowIntentionModal(false);
            }
          }}
        />
      )}

      {/* Connect Sheet */}
      <ConnectSheet
        visible={showConnectSheet}
        intention={selectedIntention}
        onClose={() => {
          setShowConnectSheet(false);
          setSelectedIntention(null);
        }}
        onSendRequest={(message?: string) => {
          // Handle connection request
          if (selectedIntention) {
            connectionService
              .createRequest({
                receiver_id: selectedIntention.user.id,
                message: message,
                club_id: clubId,
                intention_id: selectedIntention.id,
              })
              .then(() => {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success,
                );

                // Update connection status map to reflect pending request
                setConnectionStatuses((prev) => {
                  const newMap = new Map(prev);
                  newMap.set(selectedIntention.user.id, {
                    status: "pending",
                  });
                  return newMap;
                });

                // Show success toast notification first
                setToastMessage("Request sent!");
                setToastType("success");
                setToastVisible(true);

                // Close sheet after a brief delay to ensure toast is visible
                setTimeout(() => {
                  setShowConnectSheet(false);
                  setSelectedIntention(null);
                }, 100);
              })
              .catch((error) => {
                console.error("Failed to send connection request:", error);
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Error,
                );

                // Show error toast notification
                setToastMessage("Failed to send request");
                setToastType("error");
                setToastVisible(true);
              });
          }
        }}
      />

      {/* Media Viewer Modal */}
      <MediaViewer
        visible={showMediaViewer}
        media={selectedMedia}
        allMedia={viewerMediaList}
        onClose={() => {
          setShowMediaViewer(false);
          setSelectedMedia(null);
          setViewerMediaList([]);
        }}
      />

      {/* Feed Viewer Modal */}
      <ClubFeedViewer
        visible={showFeedViewer}
        posts={clubPosts}
        initialPostIndex={feedInitialIndex}
        currentUserId={user?.id}
        onClose={() => {
          setShowFeedViewer(false);
        }}
        onPostDeleted={(postId) => {
          setClubPosts(clubPosts.filter((p) => p.id !== postId));
          setToastMessage("Post deleted");
          setToastType("success");
          setToastVisible(true);
        }}
        onPostUpdated={(postId, updatedCaption) => {
          setClubPosts(
            clubPosts.map((p) =>
              p.id === postId ? { ...p, description: updatedCaption } : p,
            ),
          );
        }}
        onPostLiked={(postId, liked, likeCount) => {
          setClubPosts(
            clubPosts.map((p) =>
              p.id === postId
                ? { ...p, isLiked: liked, likeCount: likeCount }
                : p,
            ),
          );
        }}
      />

      {/* Add Post Modal */}
      <AddPostModal
        visible={showAddPostModal}
        onClose={() => setShowAddPostModal(false)}
        onPost={handleAddPost}
        preselectedClubId={clubId}
        clubName={club.name}
        showClubSelector={false}
      />

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
        type={toastType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  strobeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
  },
  strobeBannerTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#000",
    letterSpacing: 1.5,
  },
  strobeBannerSub: {
    fontSize: 11,
    color: "rgba(0,0,0,0.65)",
    marginTop: 1,
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 0,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: "absolute",
    top: 48,
    left: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(10, 10, 15, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  settingsButton: {
    position: "absolute",
    top: 48,
    right: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(10, 10, 15, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  infoCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.15)",
  },
  clubName: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.platinum,
    letterSpacing: 0.5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationText: {
    color: Colors.white,
    fontSize: 14,
  },
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 6,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.15)",
    gap: 6,
  },
  tabSwitcherButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  tabSwitcherButtonActive: {
    backgroundColor: Colors.gold,
  },
  tabSwitcherText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.lightGrey,
  },
  tabSwitcherTextActive: {
    color: Colors.bg,
  },
  section: {
    marginTop: 24,
  },
  sectionCard: {
    marginTop: 20,
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.15)",
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.gold,
    letterSpacing: 0.5,
    marginBottom: 14,
    textTransform: "uppercase",
  },
  weekRangeLabel: {
    fontSize: 13,
    color: Colors.lightGrey,
    marginTop: 2,
    marginBottom: 14,
  },
  lineupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  weekToggle: {
    flexDirection: "row",
    gap: 6,
  },
  weekToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.25)",
    backgroundColor: "transparent",
  },
  weekToggleBtnActive: {
    borderColor: Colors.accent,
    backgroundColor: "rgba(57, 243, 255, 0.12)",
  },
  weekToggleBtnText: {
    fontSize: 11,
    color: Colors.lightGrey,
    fontWeight: "600",
  },
  weekToggleBtnTextActive: {
    color: Colors.accent,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.platinum,
    letterSpacing: 0.5,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(57, 243, 255, 0.2)",
    marginLeft: 16,
  },
  noEventsContainer: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 10,
  },
  noEventsIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(57,243,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  noEventsTitle: {
    color: Colors.platinum,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  noEventsSub: {
    color: Colors.smoke,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  gigCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgSecondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.2)",
  },
  gigDateBox: {
    width: 56,
    alignItems: "center",
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: "rgba(57, 243, 255, 0.2)",
  },
  gigDateDay: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.gold,
    textTransform: "uppercase",
  },
  gigDateNum: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.platinum,
  },
  gigInfo: {
    flex: 1,
    marginLeft: 16,
  },
  gigHeadliner: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.platinum,
  },
  gigMeta: {
    fontSize: 13,
    color: Colors.lightGrey,
    marginTop: 4,
  },
  gigPrice: {
    backgroundColor: "rgba(57, 243, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  gigPriceText: {
    color: Colors.gold,
    fontWeight: "700",
    fontSize: 14,
  },
  eventsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  eventCountBadge: {
    backgroundColor: "rgba(57, 243, 255, 0.15)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.3)",
    marginBottom: 2,
  },
  eventCountText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  gigCarouselContent: {
    paddingBottom: 4,
  },
  gigCarouselCard: {
    width: SCREEN_WIDTH * 0.62,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 18,
    padding: 18,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.2)",
    overflow: "hidden",
    justifyContent: "space-between",
    minHeight: 160,
  },
  gigCarouselGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    borderRadius: 18,
  },
  gigCarouselDateBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
    marginBottom: 10,
  },
  gigCarouselDateDay: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.gold,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  gigCarouselDateNum: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.platinum,
    lineHeight: 28,
  },
  gigCarouselBody: {
    flex: 1,
  },
  gigCarouselHeadliner: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.platinum,
    lineHeight: 20,
    marginBottom: 4,
  },
  gigCarouselMeta: {
    fontSize: 12,
    color: Colors.lightGrey,
    marginBottom: 8,
  },
  gigCarouselDJsRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(57, 243, 255, 0.15)",
    gap: 6,
  },
  gigCarouselDJChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  gigCarouselDJAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(57, 243, 255, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  gigCarouselDJInitial: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.accent,
  },
  gigCarouselDJName: {
    fontSize: 12,
    color: Colors.lightGrey,
    fontWeight: "500",
    flex: 1,
  },
  gigCarouselDJMore: {
    fontSize: 11,
    color: Colors.smoke,
    fontWeight: "600",
    marginTop: 2,
  },
  hoursCardInner: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.2)",
  },
  hourRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  hourRowOpen: {
    backgroundColor: Colors.bgSecondary,
  },
  hourRowToday: {
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.3)",
  },
  hourDayWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  openDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gold,
  },
  dayNameDateWrap: {
    flexDirection: "column",
    gap: 2,
  },
  hourDay: {
    fontSize: 14,
    color: Colors.lightGrey,
    width: 40,
  },
  hourDayOpen: {
    color: Colors.gold,
    fontWeight: "700",
  },
  hourDayToday: {
    color: Colors.platinum,
    fontWeight: "700",
  },
  dayDate: {
    fontSize: 10,
    color: Colors.lightGrey,
    opacity: 0.7,
  },
  todayBadge: {
    fontSize: 10,
    color: Colors.gold,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  hourText: {
    fontSize: 14,
    color: Colors.platinum,
  },
  hourTextOpen: {
    color: Colors.champagne,
    fontWeight: "600",
  },
  dayTabs: {
    marginBottom: 16,
  },
  dayTab: {
    width: 70,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: Colors.bgSecondary,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.2)",
  },
  dayTabActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  dayTabToday: {
    borderColor: Colors.gold,
    borderWidth: 1.5,
  },
  dayTabTodayText: {
    color: Colors.gold,
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.gold,
    alignSelf: "center",
    marginTop: 4,
  },
  todayDotActive: {
    backgroundColor: Colors.bg,
  },
  dayTabContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  dayTabText: {
    color: Colors.lightGrey,
    fontWeight: "700",
    fontSize: 14,
  },
  dayTabTextActive: {
    color: Colors.bg,
  },
  dayTabDate: {
    color: Colors.lightGrey,
    fontSize: 10,
    marginTop: 2,
    opacity: 0.7,
  },
  dayTabDateActive: {
    color: Colors.bg,
    opacity: 0.8,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.2)",
  },
  emptyText: {
    color: Colors.lightGrey,
    marginTop: 12,
    fontSize: 14,
  },
  djCard: {
    width: 130,
    marginRight: 12,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.3)",
    backgroundColor: Colors.bgSecondary,
    flex: 1,
  },
  djAvatarRing: {
    padding: 3,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.gold,
    marginBottom: 12,
  },
  djAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.velvet,
    alignItems: "center",
    justifyContent: "center",
  },
  djAvatarInitial: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.gold,
    letterSpacing: 0.5,
  },
  djName: {
    color: Colors.platinum,
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center",
  },
  djSocials: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 5,
    marginTop: "auto" as any,
    paddingTop: 10,
    width: "100%",
  },
  djSocialBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.25)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  djSocialLabel: {
    color: Colors.platinum,
    fontSize: 10,
    fontWeight: "600",
    flexShrink: 1,
  },
  djTimeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  djTime: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: "600",
  },
  djCardGradient: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    borderRadius: 16,
    overflow: "hidden",
    padding: 16,
  },
  djBadge: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  djBadgeText: {
    color: Colors.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  aboutText: {
    color: Colors.platinum,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 20,
  },
  contactRow: {
    marginTop: 20,
    gap: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contactText: {
    color: Colors.lightGrey,
    fontSize: 14,
  },
  reserveBlock: {
    marginTop: 20,
    marginBottom: 4,
  },
  enquiryBlock: {
    marginTop: 16,
    marginBottom: 4,
  },
  contactBlockHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  contactBlockLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.accent,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(57, 243, 255, 0.07)",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.2)",
    marginBottom: 8,
  },
  callButtonBlue: {
    backgroundColor: "rgba(57, 243, 255, 0.07)",
    borderColor: "rgba(57, 243, 255, 0.2)",
  },
  callButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  callIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(57, 243, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  callIconCircleBlue: {
    backgroundColor: "rgba(57, 243, 255, 0.12)",
  },
  callButtonNumber: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.platinum,
    letterSpacing: 0.3,
  },
  callButtonSub: {
    fontSize: 11,
    color: Colors.smoke,
    marginTop: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  vibesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  vibeBadge: {
    backgroundColor: "rgba(57, 243, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.3)",
  },
  vibeText: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: "600",
  },
  genresSection: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  genresTitle: {
    color: Colors.gold,
    fontSize: 14,
    fontWeight: "700",
  },
  genresText: {
    color: Colors.platinum,
    fontSize: 14,
    flex: 1,
  },
  feeSection: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  feeText: {
    color: Colors.platinum,
    fontSize: 14,
  },
  dressCodeSection: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dressCodeText: {
    color: Colors.platinum,
    fontSize: 14,
  },
});
