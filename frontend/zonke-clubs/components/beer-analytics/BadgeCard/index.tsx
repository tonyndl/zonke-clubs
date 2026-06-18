import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/ui";
import { Badge } from "@/types/beerAnalytics";
import { PressableScale } from "@/components/ui/PressableScale";
import { styles } from "./styles";

interface Props {
  badge: Badge;
  unlocked: boolean;
  unlockedAt?: string;
  index: number;
}

export function BadgeCard({ badge, unlocked, unlockedAt, index }: Props) {
  return (
    <Animated.View
      entering={FadeInDown.delay(50 * index).springify()}
      style={[styles.container, !unlocked && styles.containerLocked]}
    >
      <PressableScale disabled={!unlocked}>
        <View style={styles.content}>
          {/* Badge Icon */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: unlocked
                  ? `${badge.color}20`
                  : "rgba(107, 107, 123, 0.1)",
              },
            ]}
          >
            <Ionicons
              name={badge.icon as any}
              size={32}
              color={unlocked ? badge.color : Colors.smoke}
            />
          </View>

          {/* Badge Info */}
          <Text style={[styles.badgeName, !unlocked && styles.badgeNameLocked]}>
            {badge.name}
          </Text>
          <Text style={styles.badgeDescription} numberOfLines={2}>
            {badge.description}
          </Text>

          {/* Tier Badge */}
          {unlocked && badge.tier && (
            <View style={[styles.tierBadge, { borderColor: badge.color }]}>
              <Text style={[styles.tierText, { color: badge.color }]}>
                {badge.tier.toUpperCase()}
              </Text>
            </View>
          )}

          {/* Lock Overlay for locked badges */}
          {!unlocked && (
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={20} color={Colors.smoke} />
            </View>
          )}
        </View>
      </PressableScale>
    </Animated.View>
  );
}
