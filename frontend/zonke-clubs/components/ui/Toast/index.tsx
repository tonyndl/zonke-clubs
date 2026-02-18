import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/ui";
import { LinearGradient } from "expo-linear-gradient";
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
  duration = 3000,
}: ToastProps) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Show toast
      translateY.value = withSpring(0, { damping: 15 });
      opacity.value = withSpring(1);

      // Hide after duration
      translateY.value = withDelay(
        duration,
        withSpring(-100, { damping: 15 }, () => {
          runOnJS(onHide)();
        }),
      );
      opacity.value = withDelay(duration, withSpring(0));
    }
  }, [visible, duration, onHide]);

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

  const getColors = (): [string, string] => {
    switch (type) {
      case "success":
        return ["#10B981", "#059669"];
      case "error":
        return ["#EF4444", "#DC2626"];
      case "info":
        return [Colors.gold, "#E6A854"];
      default:
        return ["#10B981", "#059669"];
    }
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LinearGradient
        colors={getColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.toast}
      >
        <Ionicons name={getIcon()} size={24} color="white" />
        <Text style={styles.message}>{message}</Text>
      </LinearGradient>
    </Animated.View>
  );
}
