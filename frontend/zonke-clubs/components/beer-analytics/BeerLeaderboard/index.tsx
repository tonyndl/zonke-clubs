import React, { useState } from "react";
import { View, Text, Image, ScrollView } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import {
  LeaderboardEntry,
  BrandLeaderboard,
  formatLitres,
} from "@/types/beerAnalytics";
import { styles } from "./styles";

interface Props {
  globalLeaderboard: LeaderboardEntry[];
  brandLeaderboards?: BrandLeaderboard[];
}

type TabType = "global" | string; // 'global' or brand name

export function BeerLeaderboard({
  globalLeaderboard,
  brandLeaderboards = [],
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("global");

  // Get top 3 brands for tabs
  const topBrands = brandLeaderboards.slice(0, 3);

  const currentLeaderboard =
    activeTab === "global"
      ? globalLeaderboard
      : brandLeaderboards.find((b) => b.brand === activeTab)?.entries || [];

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.springify()} style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="trophy" size={24} color={Colors.gold} />
          <Text style={styles.title}>Leaderboard</Text>
        </View>
      </Animated.View>

      {/* Tab Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScrollView}
        contentContainerStyle={styles.tabContainer}
      >
        <PressableScale
          style={[styles.tab, activeTab === "global" && styles.tabActive]}
          onPress={() => setActiveTab("global")}
        >
          <Ionicons
            name="globe"
            size={16}
            color={activeTab === "global" ? Colors.bg : Colors.smoke}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "global" && styles.tabTextActive,
            ]}
          >
            Global
          </Text>
        </PressableScale>

        {topBrands.map((brandBoard) => (
          <PressableScale
            key={brandBoard.brand}
            style={[
              styles.tab,
              activeTab === brandBoard.brand && styles.tabActive,
            ]}
            onPress={() => setActiveTab(brandBoard.brand)}
          >
            <Ionicons
              name="beer"
              size={16}
              color={activeTab === brandBoard.brand ? Colors.bg : Colors.smoke}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === brandBoard.brand && styles.tabTextActive,
              ]}
            >
              {brandBoard.brand}
            </Text>
          </PressableScale>
        ))}
      </ScrollView>

      {/* Leaderboard List */}
      <View style={styles.leaderboardContainer}>
        {currentLeaderboard.map((entry, index) => (
          <LeaderboardCard key={entry.user_id} entry={entry} index={index} />
        ))}

        {currentLeaderboard.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="sad-outline" size={48} color={Colors.smoke} />
            <Text style={styles.emptyText}>No rankings yet</Text>
          </View>
        )}
      </View>
    </View>
  );
}

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  index: number;
}

function LeaderboardCard({ entry, index }: LeaderboardCardProps) {
  const isTopThree = entry.rank <= 3;
  const isCurrentUser = entry.is_current_user;

  // Medal/rank colors
  const getRankColor = () => {
    if (entry.rank === 1) return "#FFD700"; // Gold
    if (entry.rank === 2) return "#C0C0C0"; // Silver
    if (entry.rank === 3) return "#CD7F32"; // Bronze
    return Colors.smoke;
  };

  const getRankIcon = () => {
    if (entry.rank === 1) return "trophy";
    if (entry.rank === 2) return "medal";
    if (entry.rank === 3) return "medal-outline";
    return null;
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      style={[
        styles.card,
        isTopThree && styles.cardTopThree,
        isCurrentUser && styles.cardCurrentUser,
      ]}
    >
      {/* {isCurrentUser && (
        <LinearGradient
          colors={['rgba(255, 215, 0, 0.15)', 'rgba(255, 215, 0, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      )} */}

      <View style={styles.cardContent}>
        {/* Rank */}
        <View
          style={[styles.rankBadge, isTopThree && styles.rankBadgeTopThree]}
        >
          {getRankIcon() ? (
            <Ionicons name={getRankIcon()!} size={20} color={getRankColor()} />
          ) : (
            <Text style={[styles.rankText, { color: getRankColor() }]}>
              #{entry.rank}
            </Text>
          )}
        </View>

        {/* Avatar */}
        <Image
          source={{ uri: entry.avatar_url || "https://via.placeholder.com/40" }}
          style={[styles.avatar, isTopThree && styles.avatarTopThree]}
        />

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text
            style={[
              styles.username,
              isCurrentUser && styles.usernameCurrentUser,
            ]}
            numberOfLines={1}
          >
            {entry.username}
            {isCurrentUser && " 🎯"}
          </Text>
          <View style={styles.statsRow}>
            <Ionicons name="beer" size={12} color={Colors.smoke} />
            <Text style={styles.statText}>{entry.total_beers} beers</Text>
          </View>
        </View>

        {/* Litres */}
        <View style={styles.litresContainer}>
          <Text
            style={[styles.litresText, isTopThree && styles.litresTextTopThree]}
          >
            {formatLitres(entry.total_litres)}
          </Text>
          <Text style={styles.litresLabel}>consumed</Text>
        </View>
      </View>

      {/* Top 3 Shimmer Effect */}
      {isTopThree && (
        <View style={styles.shimmerContainer}>
          {/* <LinearGradient
            colors={[
              'transparent',
              `${getRankColor()}20`,
              'transparent'
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shimmer}
          /> */}
        </View>
      )}
    </Animated.View>
  );
}
