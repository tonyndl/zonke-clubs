import React, { useState, useEffect } from "react";
import { View, Text, Alert } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { Modal } from "../../modal";
import { styles, TRIM_BAR_WIDTH, MAX_DURATION } from "./styles";

interface Props {
  visible: boolean;
  videoUri: string;
  videoDuration: number; // in seconds
  onCancel: () => void;
  onConfirm: (startTime: number, endTime: number) => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function VideoTrimmerModal({
  visible,
  videoUri,
  videoDuration,
  onCancel,
  onConfirm,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Initial trim values - select first 30 seconds or entire video if shorter
  const initialEndTime = Math.min(videoDuration, MAX_DURATION);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(initialEndTime);

  const startHandleX = useSharedValue(0);
  const endHandleX = useSharedValue((endTime / videoDuration) * TRIM_BAR_WIDTH);

  const player = useVideoPlayer(videoUri, (p) => {
    p.loop = true;
    p.muted = false;
  });

  // Update current time from video player
  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
      const time = player.currentTime;
      setCurrentTime(time);

      // Loop within selected range
      if (time >= endTime) {
        player.currentTime = startTime;
      }
    }, 100);

    return () => clearInterval(interval);
  }, [player, startTime, endTime]);

  // Play from start time when trim range changes
  useEffect(() => {
    if (player) {
      player.currentTime = startTime;
    }
  }, [startTime]);

  const togglePlayPause = () => {
    if (!player) return;

    if (isPlaying) {
      player.pause();
    } else {
      player.currentTime = startTime;
      player.play();
    }
    setIsPlaying(!isPlaying);
  };

  const updateStartTime = (x: number) => {
    const clampedX = Math.max(0, Math.min(x, endHandleX.value - 20));
    const newStartTime = (clampedX / TRIM_BAR_WIDTH) * videoDuration;

    // Ensure at least 1 second and max 30 seconds
    const maxStart = Math.max(0, endTime - 1);
    setStartTime(Math.min(newStartTime, maxStart));
  };

  const updateEndTime = (x: number) => {
    const clampedX = Math.max(
      startHandleX.value + 20,
      Math.min(x, TRIM_BAR_WIDTH),
    );
    const newEndTime = (clampedX / TRIM_BAR_WIDTH) * videoDuration;

    // Ensure at least 1 second and max 30 seconds from start
    const maxEnd = Math.min(videoDuration, startTime + MAX_DURATION);
    const minEnd = startTime + 1;
    setEndTime(Math.max(minEnd, Math.min(newEndTime, maxEnd)));
  };

  const startHandleGesture = Gesture.Pan()
    .onUpdate((e) => {
      const newX =
        (startTime / videoDuration) * TRIM_BAR_WIDTH + e.translationX;
      startHandleX.value = Math.max(0, Math.min(newX, endHandleX.value - 20));
    })
    .onEnd(() => {
      runOnJS(updateStartTime)(startHandleX.value);
      startHandleX.value = withSpring(
        (startTime / videoDuration) * TRIM_BAR_WIDTH,
      );
    });

  const endHandleGesture = Gesture.Pan()
    .onUpdate((e) => {
      const newX = (endTime / videoDuration) * TRIM_BAR_WIDTH + e.translationX;
      endHandleX.value = Math.max(
        startHandleX.value + 20,
        Math.min(newX, TRIM_BAR_WIDTH),
      );
    })
    .onEnd(() => {
      runOnJS(updateEndTime)(endHandleX.value);
      endHandleX.value = withSpring((endTime / videoDuration) * TRIM_BAR_WIDTH);
    });

  const startHandleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: startHandleX.value }],
  }));

  const endHandleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: endHandleX.value }],
  }));

  const selectedRangeStyle = useAnimatedStyle(() => ({
    left: startHandleX.value,
    width: Math.max(0, endHandleX.value - startHandleX.value),
  }));

  const handleConfirm = () => {
    if (endTime - startTime > MAX_DURATION) {
      Alert.alert(
        "Error",
        `Selected range must be ${MAX_DURATION} seconds or less.`,
      );
      return;
    }

    if (endTime - startTime < 1) {
      Alert.alert("Error", "Selected range must be at least 1 second.");
      return;
    }

    onConfirm(startTime, endTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const selectedDuration = endTime - startTime;
  const currentProgress =
    ((currentTime - startTime) / (endTime - startTime)) * 100;

  if (!visible) return null;

  return (
    <Modal onDismiss={onCancel} sliding bgColor={Colors.bg}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <PressableScale onPress={onCancel}>
              <Ionicons name="close" size={28} color={Colors.platinum} />
            </PressableScale>
            <Text style={styles.headerTitle}>Trim Video</Text>
            <PressableScale onPress={handleConfirm} style={styles.doneButton}>
              <LinearGradient
                colors={[Colors.gold, "#C89D5C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.doneButtonGradient}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </LinearGradient>
            </PressableScale>
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="cut-outline" size={18} color={Colors.gold} />
            <Text style={styles.infoText}>
              Select up to 30 seconds • Drag handles to trim
            </Text>
          </View>

          {/* Video Preview */}
          <View style={styles.videoContainer}>
            <VideoView
              player={player}
              style={styles.video}
              contentFit="contain"
              nativeControls={false}
            />

            {/* Play/Pause Overlay */}
            <PressableScale
              onPress={togglePlayPause}
              style={styles.playOverlay}
            >
              <View style={styles.playButton}>
                <LinearGradient
                  colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0.6)"]}
                  style={styles.playButtonGradient}
                >
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={40}
                    color={Colors.platinum}
                  />
                </LinearGradient>
              </View>
            </PressableScale>

            {/* Progress indicator */}
            {isPlaying && currentProgress >= 0 && currentProgress <= 100 && (
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${currentProgress}%` },
                  ]}
                />
              </View>
            )}
          </View>

          {/* Duration Info - Compact */}
          <View style={styles.durationInfo}>
            <View style={styles.durationChip}>
              <Text style={styles.durationLabel}>Selected</Text>
              <Text
                style={[
                  styles.durationValue,
                  selectedDuration > MAX_DURATION && styles.durationValueError,
                ]}
              >
                {formatDuration(selectedDuration)}
              </Text>
            </View>
            <View style={styles.durationChip}>
              <Text style={styles.durationLabel}>Range</Text>
              <Text style={styles.durationValue}>
                {formatTime(startTime)} - {formatTime(endTime)}
              </Text>
            </View>
          </View>

          {/* Trim Timeline - Ultra Sleek */}
          <View style={styles.trimSection}>
            <View style={styles.trimContainer}>
              {/* Background timeline */}
              <View style={styles.timelineBackground}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.timelineGradient}
                />
              </View>

              {/* Selected range highlight */}
              <Animated.View style={[styles.selectedRange, selectedRangeStyle]}>
                <LinearGradient
                  colors={[
                    "rgba(217, 175, 98, 0.4)",
                    "rgba(217, 175, 98, 0.6)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.selectedGradient}
                />
                {/* Top and bottom borders for selected range */}
                <View style={styles.rangeBorderTop} />
                <View style={styles.rangeBorderBottom} />
              </Animated.View>

              {/* Start handle - Ultra thin */}
              <GestureDetector gesture={startHandleGesture}>
                <Animated.View
                  style={[styles.handle, styles.startHandle, startHandleStyle]}
                >
                  <LinearGradient
                    colors={[Colors.gold, "#C89D5C"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.handleGradient}
                  >
                    {/* Grip dots */}
                    <View style={styles.gripDots}>
                      <View style={styles.gripDot} />
                      <View style={styles.gripDot} />
                      <View style={styles.gripDot} />
                    </View>
                  </LinearGradient>
                  {/* Glow effect */}
                  <View style={[styles.handleGlow, styles.handleGlowLeft]} />
                </Animated.View>
              </GestureDetector>

              {/* End handle - Ultra thin */}
              <GestureDetector gesture={endHandleGesture}>
                <Animated.View
                  style={[styles.handle, styles.endHandle, endHandleStyle]}
                >
                  <LinearGradient
                    colors={[Colors.gold, "#C89D5C"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.handleGradient}
                  >
                    {/* Grip dots */}
                    <View style={styles.gripDots}>
                      <View style={styles.gripDot} />
                      <View style={styles.gripDot} />
                      <View style={styles.gripDot} />
                    </View>
                  </LinearGradient>
                  {/* Glow effect */}
                  <View style={[styles.handleGlow, styles.handleGlowRight]} />
                </Animated.View>
              </GestureDetector>

              {/* Current time indicator - Thin line */}
              <View
                style={[
                  styles.currentTimeIndicator,
                  { left: (currentTime / videoDuration) * TRIM_BAR_WIDTH },
                ]}
              />
            </View>

            {/* Timeline labels */}
            <View style={styles.timelineLabels}>
              <Text style={styles.timelineLabel}>0:00</Text>
              <Text style={styles.timelineLabelCenter}>
                {formatTime(videoDuration / 2)}
              </Text>
              <Text style={styles.timelineLabel}>
                {formatTime(videoDuration)}
              </Text>
            </View>
          </View>

          {selectedDuration > MAX_DURATION && (
            <View style={styles.warningBanner}>
              <Ionicons name="alert-circle" size={18} color="#ff6b6b" />
              <Text style={styles.warningText}>
                Selection too long • Max {MAX_DURATION}s allowed
              </Text>
            </View>
          )}
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
