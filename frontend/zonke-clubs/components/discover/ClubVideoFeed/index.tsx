import React, { useRef, useState, useCallback, useEffect, memo } from "react";
import {
  View,
  Text,
  FlatList,
  ViewToken,
  Pressable,
  PanResponder,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
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
import { styles } from "./styles";

type VideoItem = ClubVideo & {
  clubId: string;
  clubName: string;
  clubLocation?: string;
};

type Props = {
  videos: VideoItem[];
};

type VideoPlayerProps = {
  item: VideoItem;
  isActive: boolean;
  isScreenFocused: boolean;
};

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const VideoPlayer: React.FC<VideoPlayerProps> = memo(
  ({ item, isActive, isScreenFocused }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );
    const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
      null,
    );
    const trackWidthRef = useRef(0);
    const isDraggingRef = useRef(false);

    const player = useVideoPlayer(item.url, (player) => {
      player.loop = true;
      player.muted = isMuted;
    });

    const playerRef = useRef(player);
    playerRef.current = player;

    const seekToRatio = useCallback((locationX: number) => {
      const ratio = Math.max(0, Math.min(1, locationX / trackWidthRef.current));
      const seekTime = ratio * (playerRef.current.duration ?? 0);
      playerRef.current.currentTime = seekTime;
      setProgress(ratio);
      setCurrentTime(seekTime);
    }, []);

    const progressPanResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          isDraggingRef.current = true;
          seekToRatio(e.nativeEvent.locationX);
        },
        onPanResponderMove: (e) => {
          seekToRatio(e.nativeEvent.locationX);
        },
        onPanResponderRelease: (e) => {
          seekToRatio(e.nativeEvent.locationX);
          isDraggingRef.current = false;
        },
        onPanResponderTerminate: () => {
          isDraggingRef.current = false;
        },
      }),
    ).current;

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

    // Poll progress while active
    useEffect(() => {
      if (isActive && isScreenFocused) {
        progressIntervalRef.current = setInterval(() => {
          if (isDraggingRef.current) return;
          const dur = player.duration ?? 0;
          const cur = player.currentTime ?? 0;
          setDuration(dur);
          setCurrentTime(cur);
          setProgress(dur > 0 ? cur / dur : 0);
        }, 250);
      } else {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setProgress(0);
        setCurrentTime(0);
      }
      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      };
    }, [isActive, isScreenFocused, player]);

    // Auto-hide controls after 3 seconds (playing or paused)
    useEffect(() => {
      if (showControls) {
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
      return () => {
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      };
    }, [showControls]);

    const toggleMute = () => {
      setIsMuted(!isMuted);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const goToClub = () => {
      router.push(`/club/${item.clubId}` as any);
    };

    const handleVideoTap = () => {
      setShowControls(true);
      if (player.playing) {
        player.pause();
        setIsPlaying(false);
      } else {
        player.play();
        setIsPlaying(true);
      }
    };

    return (
      <View style={styles.videoContainer}>
        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          surfaceType="textureView"
          nativeControls={false}
        />

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

        {/* Countdown timer — top right, shown with controls */}
        {showControls && duration > 0 && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={styles.durationBadge}
            pointerEvents="none"
          >
            <Text style={styles.durationText}>
              {formatDuration(duration - currentTime)}
            </Text>
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
          ></Animated.View>
        )}

        {/* Bottom info - above tap area */}
        {showControls && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={styles.bottomInfoWrapper}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.bottomInfo}>
              <View style={styles.nameContainer}>
                <Pressable onPress={goToClub} style={styles.clubBadge}>
                  <Ionicons name="home" size={14} color={Colors.gold} />
                  <Text style={styles.clubName} numberOfLines={1}>
                    {item.clubName}
                  </Text>
                </Pressable>

                {/* Mute toggle */}
                <PressableScale
                  onPress={toggleMute}
                  style={styles.controlButton}
                >
                  <Ionicons
                    name={isMuted ? "volume-mute" : "volume-high"}
                    size={28}
                    color={Colors.white}
                  />
                </PressableScale>
              </View>

              {item.clubLocation && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 4,
                  }}
                >
                  <Ionicons
                    name="location"
                    size={12}
                    color={Colors.smoke}
                    style={{ marginTop: 3 }}
                  />
                  <Text style={styles.locationText}>{item.clubLocation}</Text>
                </View>
              )}

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={Colors.platinum}
                  />
                  <Text style={styles.statText}>
                    {formatTimeAgo(item.uploaded_at)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Progress bar — always visible, draggable to seek */}
            <View
              style={styles.progressTouchArea}
              onLayout={(e) => {
                trackWidthRef.current = e.nativeEvent.layout.width;
              }}
              {...progressPanResponder.panHandlers}
            >
              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${progress * 100}%` }]}
                >
                  <View style={styles.progressThumb} />
                </View>
              </View>
            </View>
          </Animated.View>
        )}
      </View>
    );
  },
);

export const ClubVideoFeed: React.FC<Props> = ({ videos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const isFocused = useIsFocused();

  const VIDEO_HEIGHT = containerHeight;

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
          isScreenFocused={isFocused}
        />
      </View>
    ),
    [currentIndex, VIDEO_HEIGHT, isFocused],
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
    <View
      style={{ flex: 1 }}
      onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
    >
      {containerHeight > 0 && (
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
      )}
    </View>
  );
};
