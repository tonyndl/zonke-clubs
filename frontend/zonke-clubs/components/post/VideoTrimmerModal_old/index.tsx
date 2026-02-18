import React, { useState, useEffect } from "react";
import { View, Text, Alert } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { Modal } from "../modal";
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
    const clampedX = Math.max(0, Math.min(x, endHandleX.value - 10));
    const newStartTime = (clampedX / TRIM_BAR_WIDTH) * videoDuration;

    // Ensure at least 1 second and max 30 seconds
    const maxStart = Math.max(0, endTime - 1);
    setStartTime(Math.min(newStartTime, maxStart));
  };

  const updateEndTime = (x: number) => {
    const clampedX = Math.max(
      startHandleX.value + 10,
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
      startHandleX.value = Math.max(
        0,
        Math.min(
          e.translationX + (startTime / videoDuration) * TRIM_BAR_WIDTH,
          endHandleX.value - 10,
        ),
      );
    })
    .onEnd(() => {
      runOnJS(updateStartTime)(startHandleX.value);
    });

  const endHandleGesture = Gesture.Pan()
    .onUpdate((e) => {
      endHandleX.value = Math.max(
        startHandleX.value + 10,
        Math.min(
          e.translationX + (endTime / videoDuration) * TRIM_BAR_WIDTH,
          TRIM_BAR_WIDTH,
        ),
      );
    })
    .onEnd(() => {
      runOnJS(updateEndTime)(endHandleX.value);
    });

  const startHandleStyle = useAnimatedStyle(() => ({
    left: startHandleX.value,
  }));

  const endHandleStyle = useAnimatedStyle(() => ({
    left: endHandleX.value,
  }));

  const selectedRangeStyle = useAnimatedStyle(() => ({
    left: startHandleX.value,
    width: endHandleX.value - startHandleX.value,
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
              <Text style={styles.doneButtonText}>Done</Text>
            </PressableScale>
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={20} color={Colors.gold} />
            <Text style={styles.infoText}>
              Videos must be 30 seconds or less. Select the part you want to
              keep.
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
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={48}
                  color={Colors.platinum}
                />
              </View>
            </PressableScale>
          </View>

          {/* Duration Info */}
          <View style={styles.durationInfo}>
            <View style={styles.durationRow}>
              <Text style={styles.durationLabel}>Selected:</Text>
              <Text
                style={[
                  styles.durationValue,
                  selectedDuration > MAX_DURATION && styles.durationValueError,
                ]}
              >
                {formatTime(selectedDuration)} / {MAX_DURATION}s
              </Text>
            </View>
            <View style={styles.durationRow}>
              <Text style={styles.durationLabel}>Range:</Text>
              <Text style={styles.durationValue}>
                {formatTime(startTime)} - {formatTime(endTime)}
              </Text>
            </View>
          </View>

          {/* Trim Timeline */}
          <View style={styles.trimSection}>
            <Text style={styles.trimLabel}>
              Drag handles to select 30-second segment
            </Text>

            <View style={styles.trimContainer}>
              {/* Full timeline bar */}
              <View style={styles.timelineBar} />

              {/* Selected range highlight */}
              <Animated.View
                style={[styles.selectedRange, selectedRangeStyle]}
              />

              {/* Start handle */}
              <GestureDetector gesture={startHandleGesture}>
                <Animated.View
                  style={[styles.handle, styles.startHandle, startHandleStyle]}
                >
                  <View style={styles.handleLine} />
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors.bg}
                  />
                </Animated.View>
              </GestureDetector>

              {/* End handle */}
              <GestureDetector gesture={endHandleGesture}>
                <Animated.View
                  style={[styles.handle, styles.endHandle, endHandleStyle]}
                >
                  <Ionicons name="chevron-back" size={20} color={Colors.bg} />
                  <View style={styles.handleLine} />
                </Animated.View>
              </GestureDetector>

              {/* Current time indicator */}
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
              <Text style={styles.timelineLabel}>
                {formatTime(videoDuration)}
              </Text>
            </View>
          </View>

          {selectedDuration > MAX_DURATION && (
            <View style={styles.warningBanner}>
              <Ionicons name="warning" size={20} color="#ff6b6b" />
              <Text style={styles.warningText}>
                Selection is too long. Maximum {MAX_DURATION} seconds allowed.
              </Text>
            </View>
          )}
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
