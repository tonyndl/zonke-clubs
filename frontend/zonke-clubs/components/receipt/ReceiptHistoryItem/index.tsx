import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/ui";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { styles } from "./styles";

type ReceiptItem = {
  id: string;
  type: "image" | "video";
  thumbnail: string;
  amount: number;
  date: Date;
  liked: boolean;
  likeCount: number;
  splitWith?: number;
};

type Props = {
  item: ReceiptItem;
  onPress: () => void;
  onLike: (id: string) => void;
};

export function ReceiptHistoryItem({ item, onPress, onLike }: Props) {
  const [isLiked, setIsLiked] = useState(item.liked);
  const [likeCount, setLikeCount] = useState(item.likeCount);
  const scale = useSharedValue(1);
  const heartScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount(newLikedState ? likeCount + 1 : likeCount - 1);
    onLike(item.id);

    // Animate heart
    heartScale.value = withSequence(
      withSpring(1.3, { damping: 10, stiffness: 300 }),
      withSpring(1, { damping: 10, stiffness: 300 }),
    );
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.card}>
          {/* Receipt Image/Video Preview */}
          <View style={styles.mediaContainer}>
            <Image
              source={{ uri: item.thumbnail }}
              style={styles.thumbnail}
              resizeMode="cover"
            />

            {/* Gradient Overlay */}
            <LinearGradient
              colors={["transparent", "rgba(11, 15, 26, 0.95)"]}
              style={styles.gradient}
            />

            {/* Video Indicator */}
            {item.type === "video" && (
              <View style={styles.videoIndicator}>
                <BlurView intensity={20} style={styles.videoIndicatorBlur}>
                  <Ionicons name="play" size={16} color={Colors.platinum} />
                </BlurView>
              </View>
            )}

            {/* Date Badge */}
            <View style={styles.dateBadge}>
              <BlurView intensity={30} style={styles.dateBadgeBlur}>
                <Ionicons name="time-outline" size={12} color={Colors.gold} />
                <Text style={styles.dateText}>{formatDate(item.date)}</Text>
              </BlurView>
            </View>

            {/* Like Button */}
            <TouchableOpacity
              style={styles.likeButton}
              onPress={handleLike}
              activeOpacity={0.7}
            >
              <BlurView intensity={30} style={styles.likeButtonBlur}>
                <Animated.View style={heartAnimatedStyle}>
                  <Ionicons
                    name={isLiked ? "heart" : "heart-outline"}
                    size={20}
                    color={isLiked ? "#EF4444" : Colors.platinum}
                  />
                </Animated.View>
                {likeCount > 0 && (
                  <Text
                    style={[
                      styles.likeCount,
                      isLiked && styles.likeCountActive,
                    ]}
                  >
                    {likeCount}
                  </Text>
                )}
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Total</Text>
              <Text style={styles.amount}>R{item.amount.toFixed(2)}</Text>
            </View>

            {item.splitWith && item.splitWith > 0 && (
              <View style={styles.splitInfo}>
                <View style={styles.splitBadge}>
                  <Ionicons name="people" size={12} color={Colors.gold} />
                  <Text style={styles.splitText}>
                    Split with {item.splitWith}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Border Glow */}
          <View style={styles.border} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
