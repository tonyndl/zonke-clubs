import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/ui";
import { styles } from "./styles";

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  type?: "success" | "error" | "info";
  duration?: number;
}

export function Toast({
  message,
  visible,
  onHide,
  type = "success",
  duration = 2000,
}: ToastProps) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      const slideIn = { duration: 200, easing: Easing.out(Easing.cubic) };
      const slideOut = { duration: 200, easing: Easing.in(Easing.cubic) };

      translateY.value = withSequence(
        withTiming(0, slideIn),
        withDelay(
          duration,
          withTiming(-100, slideOut, () => {
            runOnJS(onHide)();
          }),
        ),
      );
      opacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(duration, withTiming(0, { duration: 250 })),
      );
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getIcon = () => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "close-circle";
      case "info":
        return "information-circle";
      default:
        return "checkmark-circle";
    }
  };

  const getColor = () => {
    switch (type) {
      case "success":
        return "#10B981";
      case "error":
        return "#EF4444";
      case "info":
        return Colors.gold;
      default:
        return "#10B981";
    }
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={[styles.toast, { backgroundColor: getColor() }]}>
        <Ionicons name={getIcon()} size={24} color="white" />
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}
