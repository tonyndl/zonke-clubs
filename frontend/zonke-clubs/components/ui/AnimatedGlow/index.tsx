import React, { useEffect } from "react";
import { View, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { Colors } from "@/constants/ui";
import { styles } from "./styles";

type Props = {
  size: number;
  color?: string;
  intensity?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
};

export function AnimatedGlow({
  size,
  color = Colors.gold,
  intensity = 0.6,
  style,
  children,
}: Props) {
  const glowOpacity = useSharedValue(0.3);
  const scale = useSharedValue(1);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(intensity, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [intensity]);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Animated.View
        style={[
          styles.glow,
          {
            width: size + 20,
            height: size + 20,
            borderRadius: (size + 20) / 2,
            backgroundColor: color,
            shadowColor: color,
          },
          animatedGlowStyle,
        ]}
      />
      <View
        style={[
          styles.content,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        {children}
      </View>
    </View>
  );
}
