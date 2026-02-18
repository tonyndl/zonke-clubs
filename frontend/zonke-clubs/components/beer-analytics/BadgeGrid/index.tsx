import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/ui";
import { Badge, UserBadge } from "@/types/beerAnalytics";
import { BadgeCard } from "../BadgeCard";
import { styles } from "./styles";

interface Props {
  unlockedBadges: UserBadge[];
  allBadges: Badge[];
}

export function BadgeGrid({ unlockedBadges, allBadges }: Props) {
  const unlockedBadgeIds = new Set(unlockedBadges.map((b) => b.id));

  // Show unlocked badges + non-hidden locked badges
  const visibleBadges = allBadges.filter(
    (badge) => unlockedBadgeIds.has(badge.id) || !badge.is_hidden,
  );

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.springify()} style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="trophy" size={24} color={Colors.gold} />
          <Text style={styles.title}>Achievements</Text>
        </View>
        <Text style={styles.badgeCount}>
          {unlockedBadges.length} / {allBadges.length}
        </Text>
      </Animated.View>

      <View style={styles.grid}>
        {visibleBadges.map((badge, index) => {
          const unlocked = unlockedBadgeIds.has(badge.id);
          const userBadge = unlocked
            ? unlockedBadges.find((ub) => ub.id === badge.id)
            : undefined;

          return (
            <BadgeCard
              key={badge.id}
              badge={badge}
              unlocked={unlocked}
              unlockedAt={userBadge?.unlocked_at}
              index={index}
            />
          );
        })}
      </View>
    </View>
  );
}
