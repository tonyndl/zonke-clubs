import React, { useRef, useState, useCallback, useEffect, memo } from "react";
import { View, Text, FlatList, ViewToken, Pressable } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";

import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { ClubVideo } from "@/services/clubsService";
import { formatTimeAgo } from "@/data/clubVideos";
import { styles, SCREEN_HEIGHT, TAB_BAR_HEIGHT } from "./styles";

type VideoItem = ClubVideo & {
  clubId: string;
  clubName: string;
  clubLocation?: string;
};

type Props = {
  videos: VideoItem[];
  onLike?: (clubId: string) => void;
  likedClubs?: Record<string, boolean>;
};

type VideoPlayerProps = {
  item: VideoItem;
  isActive: boolean;
  onLike?: (clubId: string) => void;
  isLiked: boolean;
  isScreenFocused: boolean;
};

const VideoPlayer: React.FC<VideoPlayerProps> = memo(
  ({ item, isActive, onLike, isLiked, isScreenFocused }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

    const player = useVideoPlayer(item.url, (player) => {
      player.loop = true;
      player.muted = isMuted;
    });

    useEffect(() => {
      // Only play if both the video is active AND the screen is focused
      if (isActive && isScreenFocused) {
        player.play();
        setIsPlaying(true);
      } else {
        player.pause();
        setIsPlaying(false);
        if (!isScreenFocused) {
          player.currentTime = 0;
        }
      }
    }, [isActive, isScreenFocused, player]);

    useEffect(() => {
      player.muted = isMuted;
    }, [isMuted, player]);

    // Auto-hide controls after 3 seconds
    useEffect(() => {
      if (showControls && isPlaying) {
        // Clear existing timeout
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }

        // Set new timeout to hide controls
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }

      // Cleanup timeout on unmount
      return () => {
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      };
    }, [showControls, isPlaying]);

    const toggleMute = () => {
      setIsMuted(!isMuted);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleLike = () => {
      if (onLike) {
        onLike(item.clubId);
      }
    };

    const goToClub = () => {
      router.push(`/club/${item.clubId}` as any);
    };

    const handleVideoTap = () => {
      if (showControls) {
        // If controls are showing, toggle play/pause
        if (player.playing) {
          player.pause();
          setIsPlaying(false);
        } else {
          player.play();
          setIsPlaying(true);
        }
      } else {
        // If controls are hidden, show them
        setShowControls(true);
      }
    };

    return (
      <View style={styles.videoContainer}>
        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          nativeControls={false}
        />

        {/* Gradient overlay for better text readability */}
        {showControls && (
          <LinearGradient
            colors={["transparent", "transparent", "rgba(10, 10, 15, 0.85)"]}
            style={styles.gradient}
            pointerEvents="none"
          />
        )}

        {/* Center Play/Pause Icon */}
        {showControls && !isPlaying && (
          <Animated.View
            entering={ZoomIn.duration(250).springify()}
            exiting={ZoomOut.duration(200)}
            style={styles.centerPlayIcon}
            pointerEvents="none"
          >
            <View style={styles.playIconBackground}>
              <Ionicons name="play" size={52} color={Colors.white} />
            </View>
          </Animated.View>
        )}

        {/* Tap area for play/pause and showing controls - behind controls */}
        <Pressable style={styles.tapArea} onPress={handleVideoTap} />

        {/* Right side controls - above tap area */}
        {showControls && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={styles.rightControls}
            pointerEvents="box-none"
          >
            {/* Mute toggle */}
            <PressableScale onPress={toggleMute} style={styles.controlButton}>
              <Ionicons
                name={isMuted ? "volume-mute" : "volume-high"}
                size={28}
                color={Colors.white}
              />
            </PressableScale>
          </Animated.View>
        )}

        {/* Bottom info - above tap area */}
        {showControls && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={styles.bottomInfoWrapper}
            pointerEvents="box-none"
          >
            <Pressable onPress={goToClub} style={styles.bottomInfo}>
              <View style={styles.clubBadge}>
                <Ionicons name="location" size={14} color={Colors.gold} />
                <Text style={styles.clubName} numberOfLines={1}>
                  {item.clubName}
                </Text>
              </View>

              {item.clubLocation && (
                <Text style={styles.locationText}>{item.clubLocation}</Text>
              )}

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={Colors.smoke}
                  />
                  <Text style={styles.statText}>
                    {formatTimeAgo(item.uploaded_at)}
                  </Text>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        )}
      </View>
    );
  },
);

export const ClubVideoFeed: React.FC<Props> = ({
  videos,
  onLike,
  likedClubs = {},
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  // Calculate video height: screen height minus tab bar and safe area
  const VIDEO_HEIGHT = SCREEN_HEIGHT - TAB_BAR_HEIGHT - insets.top;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const index = viewableItems[0].index;
        if (index !== null) {
          setCurrentIndex(index);
        }
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  const renderItem = useCallback(
    ({ item, index }: { item: VideoItem; index: number }) => (
      <View style={{ height: VIDEO_HEIGHT }}>
        <VideoPlayer
          item={item}
          isActive={index === currentIndex}
          onLike={onLike}
          isLiked={likedClubs[item.clubId] || false}
          isScreenFocused={isFocused}
        />
      </View>
    ),
    [currentIndex, onLike, likedClubs, VIDEO_HEIGHT, isFocused],
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: VIDEO_HEIGHT,
      offset: VIDEO_HEIGHT * index,
      index,
    }),
    [VIDEO_HEIGHT],
  );

  if (videos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="videocam-off-outline" size={64} color={Colors.smoke} />
        <Text style={styles.emptyText}>No videos available</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={videos}
      renderItem={renderItem}
      keyExtractor={(item) => `${item.clubId}-${item.id}`}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      snapToInterval={VIDEO_HEIGHT}
      snapToAlignment="start"
      decelerationRate="fast"
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      getItemLayout={getItemLayout}
      removeClippedSubviews
      maxToRenderPerBatch={2}
      windowSize={3}
    />
  );
};
