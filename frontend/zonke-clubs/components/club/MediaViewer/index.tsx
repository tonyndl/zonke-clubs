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

  // Compute derived values before hooks (null-safe)
  const currentMedia = allMedia[currentIndex] ?? media;
  const isVideo = currentMedia?.type === "video";

  // Create video player — must be called unconditionally (Rules of Hooks)
  const player = useVideoPlayer(
    isVideo && currentMedia ? currentMedia.url : "",
    (p) => {
      p.loop = false;
      p.muted = isMuted;
      const previewTime = currentMedia?.startTime || 0.1;
      p.currentTime = previewTime;
    },
  );

  // Update muted state
  useEffect(() => {
    if (player) {
      player.muted = isMuted;
    }
  }, [isMuted, player]);

  // Handle trimmed video playback
  useEffect(() => {
    if (!player || !isVideo || !currentMedia) return;

    const isTrimmed =
      currentMedia.startTime != null && currentMedia.endTime != null;

    if (isTrimmed) {
      player.currentTime = currentMedia.startTime || 0;
      player.play();

      const interval = setInterval(() => {
        const currentTime = player.currentTime;
        const startTime = currentMedia.startTime || 0;
        const endTime = currentMedia.endTime || currentMedia.duration || 0;
        const duration = endTime - startTime;

        const progress = ((currentTime - startTime) / duration) * 100;
        setVideoProgress(Math.max(0, Math.min(100, progress)));

        if (currentTime >= endTime) {
          player.currentTime = startTime;
        }
      }, 100);

      return () => clearInterval(interval);
    } else {
      player.loop = true;
      player.play();

      const interval = setInterval(() => {
        const currentTime = player.currentTime;
        const duration = player.duration || currentMedia.duration || 0;
        if (!duration) return;
        const progress = (currentTime / duration) * 100;
        setVideoProgress(Math.max(0, Math.min(100, progress)));
      }, 100);

      return () => clearInterval(interval);
    }
  }, [player, currentMedia, isVideo]);

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

  // Early return AFTER all hooks
  if (!media || !visible || !currentMedia) return null;

  const hasNext = currentIndex < allMedia.length - 1;
  const hasPrevious = currentIndex > 0;

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
    const duration = player.duration || currentMedia.duration || 0;
    if (!duration) return;
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

          {/* Footer */}
          <Animated.View
            entering={FadeIn.delay(400)}
            exiting={FadeOut}
            style={styles.footer}
          />
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
