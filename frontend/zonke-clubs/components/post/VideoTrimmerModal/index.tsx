import React, { useState, useRef, useEffect } from "react";
import { View, Text, Alert, Pressable } from "react-native";
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
import { Modal } from "@/components/modal";
import { styles, TRIM_BAR_WIDTH, MAX_DURATION } from "./styles";

interface Props {
  visible: boolean;
  videoUri: string;
  videoDuration: number; // in seconds
  onCancel: () => void;
  onConfirm: (startTime: number, endTime: number) => void;
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
  const [showControls, setShowControls] = useState(true);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressBarWidthRef = useRef<number>(0);

  // Initial trim values - select first 30 seconds or entire video if shorter
  const initialEndTime = Math.min(videoDuration, MAX_DURATION);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(initialEndTime);

  const startHandleX = useSharedValue(0);
  const endHandleX = useSharedValue((endTime / videoDuration) * TRIM_BAR_WIDTH);

  // Track initial positions when gesture starts
  const startHandleInitialX = useSharedValue(0);
  const endHandleInitialX = useSharedValue(0);

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

  // Sync animated values with state changes
  useEffect(() => {
    startHandleX.value = withSpring(
      (startTime / videoDuration) * TRIM_BAR_WIDTH,
    );
    endHandleX.value = withSpring((endTime / videoDuration) * TRIM_BAR_WIDTH);
  }, [startTime, endTime]);

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

  const handleVideoTap = () => {
    setShowControls(!showControls);
  };

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (showControls) {
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
  }, [showControls]);

  const handleProgressBarLayout = (event: any) => {
    progressBarWidthRef.current = event.nativeEvent.layout.width;
  };

  const handleProgressBarPress = (event: any) => {
    if (!player || !progressBarWidthRef.current) return;

    const { locationX } = event.nativeEvent;
    const progress = Math.max(
      0,
      Math.min(1, locationX / progressBarWidthRef.current),
    );
    const duration = endTime - startTime;
    const newTime = startTime + progress * duration;

    const wasPlaying = player.playing;
    player.currentTime = newTime;
    setCurrentTime(newTime);
    if (wasPlaying) {
      player.play();
    }
  };

  const updateStartTime = (x: number) => {
    const clampedX = Math.max(0, Math.min(x, TRIM_BAR_WIDTH));
    const newStartTime = (clampedX / TRIM_BAR_WIDTH) * videoDuration;

    // Allow any position but maintain minimum 1 second gap with end handle
    const constrainedStart = Math.max(0, Math.min(newStartTime, endTime - 1));

    setStartTime(constrainedStart);
  };

  const updateEndTime = (x: number) => {
    const clampedX = Math.max(0, Math.min(x, TRIM_BAR_WIDTH));
    const newEndTime = (clampedX / TRIM_BAR_WIDTH) * videoDuration;

    // Allow any position but maintain minimum 1 second gap with start handle
    const minAllowedEnd = startTime + 1;
    const constrainedEnd = Math.max(
      minAllowedEnd,
      Math.min(newEndTime, videoDuration),
    );

    setEndTime(constrainedEnd);
  };

  const startHandleGesture = Gesture.Pan()
    .onBegin(() => {
      startHandleInitialX.value = startHandleX.value;
    })
    .onUpdate((e) => {
      const newX = startHandleInitialX.value + e.translationX;
      startHandleX.value = Math.max(0, Math.min(newX, TRIM_BAR_WIDTH));
    })
    .onEnd(() => {
      runOnJS(updateStartTime)(startHandleX.value);
    });

  const endHandleGesture = Gesture.Pan()
    .onBegin(() => {
      endHandleInitialX.value = endHandleX.value;
    })
    .onUpdate((e) => {
      const newX = endHandleInitialX.value + e.translationX;
      endHandleX.value = Math.max(0, Math.min(newX, TRIM_BAR_WIDTH));
    })
    .onEnd(() => {
      runOnJS(updateEndTime)(endHandleX.value);
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
    const selectedDuration = endTime - startTime;

    if (selectedDuration > MAX_DURATION) {
      Alert.alert(
        "Error",
        `Selected range must be ${MAX_DURATION} seconds or less.`,
      );
      return;
    }

    if (selectedDuration < 1) {
      Alert.alert("Error", "Selected range must be at least 1 second.");
      return;
    }

    if (
      videoDuration <= MAX_DURATION &&
      startTime === 0 &&
      Math.abs(endTime - videoDuration) < 0.1
    ) {
      onConfirm(0, videoDuration);
    } else {
      onConfirm(startTime, endTime);
    }
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
    <Modal
      onDismiss={onCancel}
      sliding
      bgColor={Colors.bg}
      disableKeyboardAvoid
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <PressableScale onPress={onCancel} style={styles.closebtn}>
              <Ionicons name="close" size={28} color={Colors.gold} />
            </PressableScale>
            <Text style={styles.headerTitle}>Trim Video</Text>
            <PressableScale onPress={handleConfirm} style={styles.doneButton}>
              <View style={styles.doneButtonGradient}>
                <Text style={styles.doneButtonText}>Done</Text>
              </View>
            </PressableScale>
          </View>

          {/* Content */}
          <View style={styles.content}>
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

              {/* Tap to show/hide controls */}
              <Pressable style={styles.videoTapArea} onPress={handleVideoTap} />

              {/* Bottom Controls */}
              {showControls && (
                <View style={styles.trimmerVideoControls}>
                  <PressableScale
                    onPress={togglePlayPause}
                    style={styles.trimmerPlayButton}
                  >
                    <Ionicons
                      name={isPlaying ? "pause" : "play"}
                      size={24}
                      color={Colors.platinum}
                    />
                  </PressableScale>

                  {/* Progress indicator */}
                  {currentProgress >= 0 && currentProgress <= 100 && (
                    <Pressable
                      style={styles.trimmerProgressContainer}
                      onPress={handleProgressBarPress}
                    >
                      <View
                        style={styles.progressBar}
                        onLayout={handleProgressBarLayout}
                      >
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${currentProgress}%` },
                          ]}
                        />
                      </View>
                    </Pressable>
                  )}
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
                    selectedDuration > MAX_DURATION &&
                      styles.durationValueError,
                  ]}
                >
                  {formatTime(selectedDuration)}
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
                <Animated.View
                  style={[styles.selectedRange, selectedRangeStyle]}
                >
                  <View style={styles.selectedGradient} />
                  {/* Top and bottom borders for selected range */}
                  <View style={styles.rangeBorderTop} />
                  <View style={styles.rangeBorderBottom} />
                </Animated.View>

                {/* Start handle - Easier to drag */}
                <GestureDetector gesture={startHandleGesture}>
                  <Animated.View
                    style={[
                      styles.handleTouchArea,
                      styles.startHandleTouchArea,
                      startHandleStyle,
                    ]}
                  >
                    <View style={[styles.handle, styles.startHandle]}>
                      <View style={styles.handleGradient}>
                        {/* Grip dots */}
                        <View style={styles.gripDots}>
                          <View style={styles.gripDot} />
                          <View style={styles.gripDot} />
                          <View style={styles.gripDot} />
                        </View>
                      </View>
                      {/* Glow effect */}
                      <View
                        style={[styles.handleGlow, styles.handleGlowLeft]}
                      />
                    </View>
                  </Animated.View>
                </GestureDetector>

                {/* End handle - Easier to drag */}
                <GestureDetector gesture={endHandleGesture}>
                  <Animated.View
                    style={[
                      styles.handleTouchArea,
                      styles.endHandleTouchArea,
                      endHandleStyle,
                    ]}
                  >
                    <View style={[styles.handle, styles.endHandle]}>
                      <View style={styles.handleGradient}>
                        {/* Grip dots */}
                        <View style={styles.gripDots}>
                          <View style={styles.gripDot} />
                          <View style={styles.gripDot} />
                          <View style={styles.gripDot} />
                        </View>
                      </View>
                      {/* Glow effect */}
                      <View
                        style={[styles.handleGlow, styles.handleGlowRight]}
                      />
                    </View>
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

            {selectedDuration > MAX_DURATION + 0.1 && (
              <View style={styles.warningBanner}>
                <Ionicons name="alert-circle" size={18} color="#ff6b6b" />
                <Text style={styles.warningText}>
                  Selection too long • Max {MAX_DURATION}s allowed
                </Text>
              </View>
            )}
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
