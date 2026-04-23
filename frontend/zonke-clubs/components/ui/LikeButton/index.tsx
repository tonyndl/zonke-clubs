import React, { useState, useEffect } from "react";
import { Pressable, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/ui";
import * as Haptics from "expo-haptics";
import { styles } from "./styles";

interface Props {
  isLiked: boolean;
  likeCount: number;
  onToggleLike: () => void;
  size?: "small" | "medium" | "large";
  showCount?: boolean;
}

const SIZES = {
  small: { icon: 20, text: 12 },
  medium: { icon: 28, text: 14 },
  large: { icon: 36, text: 16 },
};

export function LikeButton({
  isLiked,
  likeCount,
  onToggleLike,
  size = "medium",
  showCount = true,
}: Props) {
  const scale = useSharedValue(1);
  const [liked, setLiked] = useState(isLiked);
  const [count, setCount] = useState(likeCount);

  // Update when props change
  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

  useEffect(() => {
    setCount(likeCount);
  }, [likeCount]);

  const handlePress = () => {
    // Optimistic UI update
    const newLiked = !liked;
    const newCount = newLiked ? count + 1 : count - 1;

    setLiked(newLiked);
    setCount(newCount);

    // Animate
    scale.value = withSequence(
      withSpring(1.3, { damping: 10 }),
      withSpring(1, { damping: 10 }),
    );

    // Haptic feedback
    if (newLiked) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Call the actual API
    onToggleLike();
  };

  const iconSize = SIZES[size].icon;
  const textSize = SIZES[size].text;

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      {showCount && count > 0 && (
        <Text style={[styles.count, { fontSize: textSize }]}>
          {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
        </Text>
      )}

      <Animated.View style={[styles.iconContainer]}>
        <Ionicons
          name={liked ? "heart" : "heart-outline"}
          size={iconSize}
          color={liked ? "#FF4458" : Colors.platinum}
        />
      </Animated.View>
    </Pressable>
  );
}
