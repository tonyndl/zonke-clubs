import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Modal,
  Image,
  Dimensions,
  StatusBar,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VideoView, useVideoPlayer } from "expo-video";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutRight,
} from "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { MediaAsset } from "@/types/post";
import { styles } from "./styles";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Props {
  visible: boolean;
  media: MediaAsset | null;
  allMedia: MediaAsset[];
  onClose: () => void;
}

export function MediaViewer({ visible, media, allMedia, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressBarWidthRef = useRef<number>(0);
  const insets = useSafeAreaInsets();

  // Find initial index when media changes
  React.useEffect(() => {
    if (media && allMedia.length > 0) {
      const index = allMedia.findIndex((m) => m.id === media.id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [media, allMedia]);

  if (!media || !visible) return null;

  const currentMedia = allMedia[currentIndex] || media;
  const isVideo = currentMedia.type === "video";
  const hasNext = currentIndex < allMedia.length - 1;
  const hasPrevious = currentIndex > 0;

  // Create video player for the current video
  const player = useVideoPlayer(isVideo ? currentMedia.url : "", (player) => {
    player.loop = false; // We'll handle looping manually for trimmed videos
    player.muted = isMuted;
    // Set a preview frame at start time (or 0.1s for non-trimmed)
    const previewTime = currentMedia.startTime || 0.1;
    player.currentTime = previewTime;
    // Don't auto-play here - let useEffect handle it with correct start time
  });

  // Update muted state
  useEffect(() => {
    if (player) {
      player.muted = isMuted;
    }
  }, [isMuted, player]);

  // Handle trimmed video playback
  useEffect(() => {
    if (!player || !isVideo) return;

    // Check if video is trimmed
    const isTrimmed =
      currentMedia.startTime !== undefined &&
      currentMedia.endTime !== undefined;

    if (isTrimmed) {
      // Start at trim start time
      player.currentTime = currentMedia.startTime || 0;
      player.play();

      // Monitor playback and loop within trimmed range + update progress
      const interval = setInterval(() => {
        const currentTime = player.currentTime;
        const startTime = currentMedia.startTime || 0;
        const endTime = currentMedia.endTime || currentMedia.duration || 0;
        const duration = endTime - startTime;

        // Update progress bar
        const progress = ((currentTime - startTime) / duration) * 100;
        setVideoProgress(Math.max(0, Math.min(100, progress)));

        // If we've reached the end of the trim, loop back to start
        if (currentTime >= endTime) {
          player.currentTime = startTime;
        }
      }, 100);

      return () => clearInterval(interval);
    } else {
      // For non-trimmed videos, just loop normally
      player.loop = true;
      player.play();

      // Update progress bar
      const interval = setInterval(() => {
        const currentTime = player.currentTime;
        const duration = currentMedia.duration || 1;
        const progress = (currentTime / duration) * 100;
        setVideoProgress(Math.max(0, Math.min(100, progress)));
      }, 100);

      return () => clearInterval(interval);
    }
  }, [player, currentMedia, isVideo]);

  const handleNext = () => {
    if (hasNext) {
      setCurrentIndex(currentIndex + 1);
      if (player) {
        player.pause();
      }
    }
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      setCurrentIndex(currentIndex - 1);
      if (player) {
        player.pause();
      }
    }
  };

  const togglePlayPause = () => {
    if (player) {
      if (player.playing) {
        player.pause();
      } else {
        player.play();
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVideoTap = () => {
    setShowControls(!showControls);
  };

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (showControls && isVideo) {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
      controlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, [showControls, isVideo]);

  const handleProgressBarLayout = (event: any) => {
    progressBarWidthRef.current = event.nativeEvent.layout.width;
  };

  const handleProgressBarPress = (event: any) => {
    if (!player || !isVideo || !progressBarWidthRef.current) return;

    const { locationX } = event.nativeEvent;
    const progress = Math.max(
      0,
      Math.min(1, locationX / progressBarWidthRef.current),
    );
    const duration = currentMedia.duration || 0;
    const newTime = progress * duration;

    const wasPlaying = player.playing;
    player.currentTime = newTime;
    if (wasPlaying) {
      player.play();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* Background Overlay */}
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.overlay}
          >
            <Pressable style={styles.videoTapArea} onPress={onClose} />
          </Animated.View>

          {/* Close Button */}
          <Animated.View
            entering={FadeIn.delay(200)}
            exiting={FadeOut}
            style={[styles.header, { top: insets.top }]}
          >
            <PressableScale onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={Colors.platinum} />
            </PressableScale>

            {/* Counter */}
            {/* <View style={styles.counter}>
            <Text style={styles.counterText}>
              {currentIndex + 1} / {allMedia.length}
            </Text>
          </View> */}
          </Animated.View>

          {/* Media Content */}
          <Animated.View
            key={currentMedia.id}
            entering={SlideInRight.springify()}
            exiting={SlideOutRight.springify()}
            style={styles.mediaContainer}
          >
            {isVideo ? (
              <View style={styles.videoWrapper}>
                <VideoView
                  player={player}
                  style={styles.video}
                  contentFit="cover"
                  nativeControls={false}
                  allowsFullscreen={false}
                />

                {/* Tap to show/hide controls */}
                <Pressable
                  style={styles.videoTapArea}
                  onPress={handleVideoTap}
                />

                {/* Bottom Controls */}
                {showControls && (
                  <Animated.View
                    entering={FadeIn}
                    exiting={FadeOut}
                    style={styles.bottomVideoControls}
                  >
                    <PressableScale
                      onPress={togglePlayPause}
                      style={styles.playPauseButton}
                    >
                      <Ionicons
                        name={player?.playing ? "pause" : "play"}
                        size={24}
                        color={Colors.platinum}
                      />
                    </PressableScale>

                    <Pressable
                      style={styles.progressBarContainer}
                      onPress={handleProgressBarPress}
                    >
                      <View
                        style={styles.progressBarBackground}
                        onLayout={handleProgressBarLayout}
                      >
                        <Animated.View
                          entering={FadeIn}
                          style={[
                            styles.progressBarFill,
                            { width: `${videoProgress}%` },
                          ]}
                        />
                      </View>
                    </Pressable>

                    <PressableScale
                      onPress={toggleMute}
                      style={styles.muteButton}
                    >
                      <Ionicons
                        name={isMuted ? "volume-mute" : "volume-high"}
                        size={24}
                        color={Colors.platinum}
                      />
                    </PressableScale>
                  </Animated.View>
                )}
              </View>
            ) : (
              <Image
                source={{ uri: currentMedia.url }}
                style={styles.image}
                resizeMode="contain"
              />
            )}
          </Animated.View>

          {/* Navigation Arrows */}
          {hasPrevious && (
            <Animated.View
              entering={FadeIn.delay(300)}
              exiting={FadeOut}
              style={[styles.navButton, styles.navButtonLeft]}
            >
              <PressableScale onPress={handlePrevious}>
                <View style={styles.navButtonInner}>
                  <Ionicons
                    name="chevron-back"
                    size={32}
                    color={Colors.platinum}
                  />
                </View>
              </PressableScale>
            </Animated.View>
          )}

          {hasNext && (
            <Animated.View
              entering={FadeIn.delay(300)}
              exiting={FadeOut}
              style={[styles.navButton, styles.navButtonRight]}
            >
              <PressableScale onPress={handleNext}>
                <View style={styles.navButtonInner}>
                  <Ionicons
                    name="chevron-forward"
                    size={32}
                    color={Colors.platinum}
                  />
                </View>
              </PressableScale>
            </Animated.View>
          )}

          {/* Media Type Badge */}
          <Animated.View
            entering={FadeIn.delay(400)}
            exiting={FadeOut}
            style={styles.footer}
          >
            {/* <View style={styles.typeBadge}>
            <Ionicons
              name={isVideo ? 'videocam' : 'image'}
              size={16}
              color={Colors.gold}
            />
            <Text style={styles.typeBadgeText}>
              {isVideo ? 'Video' : 'Photo'}
            </Text>
          </View> */}
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
