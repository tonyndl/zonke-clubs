import React, { useEffect } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { styles } from "./styles";

type Props = {
  width: number;
  height: number;
  style?: ViewStyle;
};

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export function ShimmerEffect({ width, height, style }: Props) {
  const translateX = useSharedValue(-width);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(width, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [width]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={[styles.container, { width, height }, style]}>
      <Animated.View
        style={[styles.shimmer, { width: width * 2, height }, animatedStyle]}
      >
        <LinearGradient
          colors={["transparent", "rgba(212, 175, 55, 0.15)", "transparent"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}
