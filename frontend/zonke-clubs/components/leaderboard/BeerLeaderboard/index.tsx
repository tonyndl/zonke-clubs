import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Image } from "react-native";
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

type ClubFilter =
  | "all"
  | "The BeatBox"
  | "Club Euphoria"
  | "Neon Dreams"
  | "District 7"
  | "Velvet Room";

const NEARBY_CLUBS: ClubFilter[] = [
  "all",
  "The BeatBox",
  "Club Euphoria",
  "Neon Dreams",
  "District 7",
  "Velvet Room",
];

const CLUB_EMOJIS: Record<ClubFilter, string> = {
  all: "🏆",
  "The BeatBox": "🎵",
  "Club Euphoria": "✨",
  "Neon Dreams": "💜",
  "District 7": "🔥",
  "Velvet Room": "🎭",
};

// TODO: Replace with real API — GET /api/spending/leaderboard?nearby=true
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: "1",
    username: "marcus_j",
    avatarUrl: "https://i.pravatar.cc/150?img=12",
    clubName: "The BeatBox",
    totalSpent: 4200,
    streak: 12,
    badges: ["🏆", "🔥", "⭐"],
  },
  {
    rank: 2,
    userId: "2",
    username: "sarah_miller",
    avatarUrl: "https://i.pravatar.cc/150?img=47",
    clubName: "Club Euphoria",
    totalSpent: 3850,
    streak: 8,
    badges: ["🏆", "⭐"],
  },
  {
    rank: 3,
    userId: "3",
    username: "david_chen",
    avatarUrl: "https://i.pravatar.cc/150?img=33",
    clubName: "Neon Dreams",
    totalSpent: 3600,
    streak: 5,
    badges: ["🏆"],
  },
  {
    rank: 4,
    userId: "4",
    username: "emma_wilson",
    avatarUrl: "https://i.pravatar.cc/150?img=23",
    clubName: "District 7",
    totalSpent: 3200,
    streak: 3,
    badges: ["⭐"],
  },
  {
    rank: 5,
    userId: "5",
    username: "alex_rodriguez",
    avatarUrl: "https://i.pravatar.cc/150?img=14",
    clubName: "Velvet Room",
    totalSpent: 2900,
    streak: 7,
    badges: ["🔥"],
  },
  {
    rank: 6,
    userId: "6",
    username: "james_brown",
    avatarUrl: "https://i.pravatar.cc/150?img=15",
    clubName: "The BeatBox",
    totalSpent: 2600,
    streak: 4,
    badges: ["⭐"],
  },
  {
    rank: 7,
    userId: "7",
    username: "lisa_anderson",
    avatarUrl: "https://i.pravatar.cc/150?img=25",
    clubName: "Club Euphoria",
    totalSpent: 2400,
    streak: 6,
    badges: ["🔥"],
  },
  {
    rank: 8,
    userId: "8",
    username: "michael_taylor",
    avatarUrl: "https://i.pravatar.cc/150?img=13",
    clubName: "Neon Dreams",
    totalSpent: 2200,
    streak: 2,
    badges: [],
  },
  {
    rank: 9,
    userId: "9",
    username: "jessica_m",
    avatarUrl: "https://i.pravatar.cc/150?img=24",
    clubName: "District 7",
    totalSpent: 2050,
    streak: 5,
    badges: ["🔥"],
  },
  {
    rank: 10,
    userId: "10",
    username: "daniel_lee",
    avatarUrl: "https://i.pravatar.cc/150?img=11",
    clubName: "Velvet Room",
    totalSpent: 1900,
    streak: 3,
    badges: [],
  },
  {
    rank: 11,
    userId: "11",
    username: "sophie_w",
    avatarUrl: "https://i.pravatar.cc/150?img=26",
    clubName: "The BeatBox",
    totalSpent: 1750,
    streak: 4,
    badges: [],
  },
  {
    rank: 12,
    userId: "12",
    username: "ryan_davis",
    avatarUrl: "https://i.pravatar.cc/150?img=16",
    clubName: "Club Euphoria",
    totalSpent: 1620,
    streak: 2,
    badges: [],
  },
  {
    rank: 13,
    userId: "13",
    username: "olivia_t",
    avatarUrl: "https://i.pravatar.cc/150?img=27",
    clubName: "Neon Dreams",
    totalSpent: 1500,
    streak: 5,
    badges: [],
  },
  {
    rank: 14,
    userId: "14",
    username: "nathan_moore",
    avatarUrl: "https://i.pravatar.cc/150?img=17",
    clubName: "District 7",
    totalSpent: 1380,
    streak: 3,
    badges: [],
  },
  {
    rank: 15,
    userId: "15",
    username: "hannah_g",
    avatarUrl: "https://i.pravatar.cc/150?img=28",
    clubName: "Velvet Room",
    totalSpent: 1250,
    streak: 2,
    badges: [],
  },
];

export const BeerLeaderboard = () => {
  const router = useRouter();
  const [selectedClub, setSelectedClub] = useState<ClubFilter>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("week");

  const filteredLeaderboard = useMemo(() => {
    const byClub =
      selectedClub === "all"
        ? [...MOCK_LEADERBOARD]
        : MOCK_LEADERBOARD.filter((e) => e.clubName === selectedClub);

    const sorted = byClub
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, PERIOD_LIMITS[selectedPeriod])
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    return sorted;
  }, [selectedClub, selectedPeriod]);

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
                uri: entry.avatarUrl || "https://via.placeholder.com/40",
              }}
              style={[styles.avatar, getAvatarStyle(entry.rank)]}
            />

            {/* User info */}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{entry.username}</Text>
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
              {selectedClub === "all"
                ? "Biggest spenders at nearby clubs"
                : `Top spenders at ${selectedClub}`}
            </Text>
          </View>
        </View>
        <View style={styles.headerDivider} />
      </Animated.View>

      {/* Nearby Club Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {NEARBY_CLUBS.map((club) => {
          const isActive = selectedClub === club;
          return (
            <PressableScale
              key={club}
              style={[styles.filterPill, isActive && styles.filterPillActive]}
              onPress={() => setSelectedClub(club)}
            >
              <Text style={styles.filterEmoji}>{CLUB_EMOJIS[club]}</Text>
              <Text
                style={[
                  styles.filterLabel,
                  isActive && styles.filterLabelActive,
                ]}
              >
                {club === "all" ? "All Clubs" : club}
              </Text>
            </PressableScale>
          );
        })}
      </ScrollView>

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
            style={{ flex: 0, paddingVertical: 60 }}
          />
        )}
      </View>
    </View>
  );
};
