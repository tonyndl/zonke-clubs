import React, { useState, useMemo } from "react";
import { View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInRight, FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { styles } from "./styles";
import { EmptyState } from "@/components/ui/EmptyState";

function formatAmount(value: number): string {
  const [whole, dec] = value.toFixed(2).split(".");
  return whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + "." + dec;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  clubName: string;
  totalSpent: number;
  streak?: number;
  badges?: string[];
}

type TimePeriod = "day" | "week" | "month";

const TIME_PERIODS: { value: TimePeriod; label: string }[] = [
  { value: "day", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

// Simulated entry counts per period (replaced by API param when live)
const PERIOD_LIMITS: Record<TimePeriod, number> = {
  day: 5,
  week: 10,
  month: 15,
};

export const BeerLeaderboard = () => {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("week");

  const filteredLeaderboard: LeaderboardEntry[] = [];

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  const getAvatarStyle = (rank: number) => {
    if (rank === 1) return styles.firstPlaceAvatar;
    if (rank === 2) return styles.secondPlaceAvatar;
    if (rank === 3) return styles.thirdPlaceAvatar;
    return null;
  };

  const renderItem = (entry: LeaderboardEntry, index: number) => {
    const medal = getMedalEmoji(entry.rank);
    return (
      <Animated.View
        key={entry.userId}
        entering={FadeInRight.delay(index * 50).springify()}
        style={[styles.leaderboardItem, entry.rank <= 3 && styles.topThreeItem]}
      >
        <PressableScale
          onPress={() => router.push(`/profile/${entry.userId}` as any)}
          style={styles.cardPressable}
        >
          <View style={styles.mainRow}>
            {/* Rank */}
            <View style={styles.rankContainer}>
              {medal ? (
                <Text style={styles.medalEmoji}>{medal}</Text>
              ) : (
                <Text style={styles.rankNumber}>#{entry.rank}</Text>
              )}
            </View>

            {/* Avatar */}
            <Image
              source={{
                uri: entry.avatarUrl || undefined,
              }}
              style={[styles.avatar, getAvatarStyle(entry.rank)]}
            />

            {/* User info */}
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {entry.username}
              </Text>
              <Text style={styles.clubName} numberOfLines={1}>
                {entry.clubName}
              </Text>
            </View>

            {/* Total spent */}
            <View style={styles.beerCountContainer}>
              <Text style={styles.beerCount}>
                R{formatAmount(entry.totalSpent)}
              </Text>
              <Text style={styles.litresLabel}>one night</Text>
            </View>
          </View>
        </PressableScale>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconContainer}>
            <Ionicons name="trophy" size={30} color={Colors.gold} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Top Bowlers</Text>
            <Text style={styles.subtitle}>
              Biggest spenders at nearby clubs
            </Text>
          </View>
        </View>
        <View style={styles.headerDivider} />
      </Animated.View>

      {/* Time Period Tabs */}
      <View style={styles.periodContainer}>
        {TIME_PERIODS.map((period) => {
          const isActive = selectedPeriod === period.value;
          return (
            <PressableScale
              key={period.value}
              style={[styles.periodTab, isActive && styles.periodTabActive]}
              onPress={() => setSelectedPeriod(period.value)}
            >
              <Text
                style={[
                  styles.periodLabel,
                  isActive && styles.periodLabelActive,
                ]}
              >
                {period.label}
              </Text>
            </PressableScale>
          );
        })}
      </View>

      {/* Leaderboard list */}
      <View style={styles.leaderboardList}>
        {filteredLeaderboard.length > 0 ? (
          filteredLeaderboard.map((entry, index) => renderItem(entry, index))
        ) : (
          <EmptyState
            icon="search-outline"
            title="No Entries Yet"
            subtitle="No entries for this club"
            style={{ minHeight: 300, justifyContent: "center" }}
          />
        )}
      </View>
    </View>
  );
};
