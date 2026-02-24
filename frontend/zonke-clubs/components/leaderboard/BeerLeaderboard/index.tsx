import React, { useState, useMemo, ReactElement } from "react";
import { View, Text, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInRight, FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { styles } from "./styles";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  beerCount: number;
  litersConsumed: number; // total liters of beer consumed
  clubName?: string;
  favoriteBrand?: string;
  streak?: number; // consecutive days
  badges?: string[]; // achievement emojis
  weeklyAverage?: number;
  totalSpent?: number; // total money spent on beer
}

type LeaderboardFilter =
  | "all"
  | "castle_lite"
  | "stella_artois"
  | "heineken"
  | "corona"
  | "amstel"
  | "most_expensive";

const FILTER_CONFIG: Record<
  LeaderboardFilter,
  { label: string; icon?: string; emoji?: string | ReactElement }
> = {
  all: { label: "All Brands", emoji: "🍺" },
  castle_lite: { label: "Castle Lite", emoji: "🏰" },
  stella_artois: { label: "Stella", emoji: "⭐" },
  heineken: { label: "Heineken", emoji: "🟢" },
  corona: { label: "Corona", emoji: "🌞" },
  amstel: { label: "Amstel", emoji: "🔴" },
  most_expensive: {
    label: "Big Spenders",
    emoji: <Ionicons name="cash-outline" size={20} color="green" />,
  },
};

// TODO: This feature requires backend implementation
// Backend needs a global leaderboard endpoint (GET /api/spending/leaderboard)
// Currently only per-club leaderboard exists (GET /api/admin/spending-records/leaderboard)
// For now, using mock data for UI demonstration
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: "1",
    username: "marcus_j",
    avatarUrl: "https://i.pravatar.cc/150?img=12",
    beerCount: 47,
    litersConsumed: 23.5, // 47 * 0.5L
    clubName: "The BeatBox",
    favoriteBrand: "Castle Lite",
    streak: 12,
    badges: ["🏆", "🔥", "⭐"],
    weeklyAverage: 8.2,
    totalSpent: 2350,
  },
  {
    rank: 2,
    userId: "2",
    username: "sarah_miller",
    avatarUrl: "https://i.pravatar.cc/150?img=47",
    beerCount: 42,
    litersConsumed: 21.0, // 42 * 0.5L
    clubName: "Club Euphoria",
    favoriteBrand: "Stella Artois",
    streak: 8,
    badges: ["🏆", "⭐"],
    weeklyAverage: 7.5,
    totalSpent: 3150,
  },
  {
    rank: 3,
    userId: "3",
    username: "david_chen",
    avatarUrl: "https://i.pravatar.cc/150?img=33",
    beerCount: 38,
    litersConsumed: 19.0, // 38 * 0.5L
    clubName: "Neon Dreams",
    favoriteBrand: "Heineken",
    streak: 5,
    badges: ["🏆"],
    weeklyAverage: 6.8,
    totalSpent: 2660,
  },
  {
    rank: 4,
    userId: "4",
    username: "emma_wilson",
    avatarUrl: "https://i.pravatar.cc/150?img=23",
    beerCount: 35,
    litersConsumed: 17.5, // 35 * 0.5L
    clubName: "District 7",
    favoriteBrand: "Corona",
    streak: 3,
    badges: ["⭐"],
    weeklyAverage: 6.2,
    totalSpent: 2800,
  },
  {
    rank: 5,
    userId: "5",
    username: "alex_rodriguez",
    avatarUrl: "https://i.pravatar.cc/150?img=14",
    beerCount: 31,
    litersConsumed: 15.5, // 31 * 0.5L
    clubName: "Velvet Room",
    favoriteBrand: "Amstel",
    streak: 7,
    badges: ["🔥"],
    weeklyAverage: 5.9,
    totalSpent: 1860,
  },
  {
    rank: 6,
    userId: "6",
    username: "james_brown",
    avatarUrl: "https://i.pravatar.cc/150?img=15",
    beerCount: 28,
    litersConsumed: 14.0, // 28 * 0.5L
    clubName: "The BeatBox",
    favoriteBrand: "Castle Lite",
    streak: 4,
    badges: ["⭐"],
    weeklyAverage: 5.2,
    totalSpent: 1400,
  },
  {
    rank: 7,
    userId: "7",
    username: "lisa_anderson",
    avatarUrl: "https://i.pravatar.cc/150?img=25",
    beerCount: 25,
    litersConsumed: 12.5, // 25 * 0.5L
    clubName: "Club Euphoria",
    favoriteBrand: "Stella Artois",
    streak: 6,
    badges: ["🔥"],
    weeklyAverage: 4.8,
    totalSpent: 1875,
  },
  {
    rank: 8,
    userId: "8",
    username: "michael_taylor",
    avatarUrl: "https://i.pravatar.cc/150?img=13",
    beerCount: 23,
    litersConsumed: 11.5, // 23 * 0.5L
    clubName: "Neon Dreams",
    favoriteBrand: "Heineken",
    streak: 2,
    badges: [],
    weeklyAverage: 4.5,
    totalSpent: 1610,
  },
  {
    rank: 9,
    userId: "9",
    username: "jessica_martinez",
    avatarUrl: "https://i.pravatar.cc/150?img=24",
    beerCount: 21,
    litersConsumed: 10.5, // 21 * 0.5L
    clubName: "District 7",
    favoriteBrand: "Corona",
    streak: 5,
    badges: ["🔥"],
    weeklyAverage: 4.2,
    totalSpent: 1680,
  },
  {
    rank: 10,
    userId: "10",
    username: "daniel_lee",
    avatarUrl: "https://i.pravatar.cc/150?img=11",
    beerCount: 19,
    litersConsumed: 9.5, // 19 * 0.5L
    clubName: "Velvet Room",
    favoriteBrand: "Amstel",
    streak: 3,
    badges: [],
    weeklyAverage: 3.8,
    totalSpent: 1140,
  },
  // Additional Castle Lite drinkers
  {
    rank: 11,
    userId: "11",
    username: "sophie_williams",
    avatarUrl: "https://i.pravatar.cc/150?img=26",
    beerCount: 18,
    litersConsumed: 9.0,
    clubName: "The BeatBox",
    favoriteBrand: "Castle Lite",
    streak: 4,
    badges: [],
    weeklyAverage: 3.6,
    totalSpent: 1080,
  },
  {
    rank: 12,
    userId: "12",
    username: "ryan_davis",
    avatarUrl: "https://i.pravatar.cc/150?img=16",
    beerCount: 17,
    litersConsumed: 8.5,
    clubName: "Neon Dreams",
    favoriteBrand: "Castle Lite",
    streak: 2,
    badges: [],
    weeklyAverage: 3.4,
    totalSpent: 1020,
  },
  {
    rank: 13,
    userId: "13",
    username: "olivia_thompson",
    avatarUrl: "https://i.pravatar.cc/150?img=27",
    beerCount: 16,
    litersConsumed: 8.0,
    clubName: "Club Euphoria",
    favoriteBrand: "Castle Lite",
    streak: 5,
    badges: [],
    weeklyAverage: 3.2,
    totalSpent: 960,
  },
  {
    rank: 14,
    userId: "14",
    username: "nathan_moore",
    avatarUrl: "https://i.pravatar.cc/150?img=17",
    beerCount: 15,
    litersConsumed: 7.5,
    clubName: "District 7",
    favoriteBrand: "Castle Lite",
    streak: 3,
    badges: [],
    weeklyAverage: 3.0,
    totalSpent: 900,
  },
  {
    rank: 15,
    userId: "15",
    username: "hannah_garcia",
    avatarUrl: "https://i.pravatar.cc/150?img=28",
    beerCount: 14,
    litersConsumed: 7.0,
    clubName: "Velvet Room",
    favoriteBrand: "Castle Lite",
    streak: 2,
    badges: [],
    weeklyAverage: 2.8,
    totalSpent: 840,
  },
  {
    rank: 16,
    userId: "16",
    username: "chris_white",
    avatarUrl: "https://i.pravatar.cc/150?img=18",
    beerCount: 13,
    litersConsumed: 6.5,
    clubName: "The BeatBox",
    favoriteBrand: "Castle Lite",
    streak: 1,
    badges: [],
    weeklyAverage: 2.6,
    totalSpent: 780,
  },
  {
    rank: 17,
    userId: "17",
    username: "zoe_harris",
    avatarUrl: "https://i.pravatar.cc/150?img=29",
    beerCount: 12,
    litersConsumed: 6.0,
    clubName: "Neon Dreams",
    favoriteBrand: "Castle Lite",
    streak: 4,
    badges: [],
    weeklyAverage: 2.4,
    totalSpent: 720,
  },
  {
    rank: 18,
    userId: "18",
    username: "brandon_clark",
    avatarUrl: "https://i.pravatar.cc/150?img=19",
    beerCount: 11,
    litersConsumed: 5.5,
    clubName: "Club Euphoria",
    favoriteBrand: "Castle Lite",
    streak: 2,
    badges: [],
    weeklyAverage: 2.2,
    totalSpent: 660,
  },
  // Additional Stella Artois drinkers
  {
    rank: 19,
    userId: "19",
    username: "megan_lewis",
    avatarUrl: "https://i.pravatar.cc/150?img=30",
    beerCount: 22,
    litersConsumed: 11.0,
    clubName: "Velvet Room",
    favoriteBrand: "Stella Artois",
    streak: 6,
    badges: [],
    weeklyAverage: 4.4,
    totalSpent: 1650,
  },
  {
    rank: 20,
    userId: "20",
    username: "tyler_walker",
    avatarUrl: "https://i.pravatar.cc/150?img=20",
    beerCount: 20,
    litersConsumed: 10.0,
    clubName: "District 7",
    favoriteBrand: "Stella Artois",
    streak: 3,
    badges: [],
    weeklyAverage: 4.0,
    totalSpent: 1500,
  },
  {
    rank: 21,
    userId: "21",
    username: "ashley_hall",
    avatarUrl: "https://i.pravatar.cc/150?img=31",
    beerCount: 19,
    litersConsumed: 9.5,
    clubName: "The BeatBox",
    favoriteBrand: "Stella Artois",
    streak: 5,
    badges: [],
    weeklyAverage: 3.8,
    totalSpent: 1425,
  },
  {
    rank: 22,
    userId: "22",
    username: "jordan_allen",
    avatarUrl: "https://i.pravatar.cc/150?img=21",
    beerCount: 18,
    litersConsumed: 9.0,
    clubName: "Neon Dreams",
    favoriteBrand: "Stella Artois",
    streak: 2,
    badges: [],
    weeklyAverage: 3.6,
    totalSpent: 1350,
  },
  {
    rank: 23,
    userId: "23",
    username: "rachel_young",
    avatarUrl: "https://i.pravatar.cc/150?img=32",
    beerCount: 17,
    litersConsumed: 8.5,
    clubName: "Club Euphoria",
    favoriteBrand: "Stella Artois",
    streak: 4,
    badges: [],
    weeklyAverage: 3.4,
    totalSpent: 1275,
  },
  {
    rank: 24,
    userId: "24",
    username: "kevin_king",
    avatarUrl: "https://i.pravatar.cc/150?img=22",
    beerCount: 16,
    litersConsumed: 8.0,
    clubName: "District 7",
    favoriteBrand: "Stella Artois",
    streak: 3,
    badges: [],
    weeklyAverage: 3.2,
    totalSpent: 1200,
  },
  {
    rank: 25,
    userId: "25",
    username: "samantha_scott",
    avatarUrl: "https://i.pravatar.cc/150?img=34",
    beerCount: 15,
    litersConsumed: 7.5,
    clubName: "Velvet Room",
    favoriteBrand: "Stella Artois",
    streak: 2,
    badges: [],
    weeklyAverage: 3.0,
    totalSpent: 1125,
  },
  {
    rank: 26,
    userId: "26",
    username: "jacob_green",
    avatarUrl: "https://i.pravatar.cc/150?img=35",
    beerCount: 14,
    litersConsumed: 7.0,
    clubName: "The BeatBox",
    favoriteBrand: "Stella Artois",
    streak: 1,
    badges: [],
    weeklyAverage: 2.8,
    totalSpent: 1050,
  },
  // Additional Heineken drinkers
  {
    rank: 27,
    userId: "27",
    username: "nicole_adams",
    avatarUrl: "https://i.pravatar.cc/150?img=36",
    beerCount: 21,
    litersConsumed: 10.5,
    clubName: "Neon Dreams",
    favoriteBrand: "Heineken",
    streak: 5,
    badges: [],
    weeklyAverage: 4.2,
    totalSpent: 1470,
  },
  {
    rank: 28,
    userId: "28",
    username: "andrew_baker",
    avatarUrl: "https://i.pravatar.cc/150?img=37",
    beerCount: 20,
    litersConsumed: 10.0,
    clubName: "Club Euphoria",
    favoriteBrand: "Heineken",
    streak: 4,
    badges: [],
    weeklyAverage: 4.0,
    totalSpent: 1400,
  },
  {
    rank: 29,
    userId: "29",
    username: "lauren_nelson",
    avatarUrl: "https://i.pravatar.cc/150?img=38",
    beerCount: 19,
    litersConsumed: 9.5,
    clubName: "District 7",
    favoriteBrand: "Heineken",
    streak: 3,
    badges: [],
    weeklyAverage: 3.8,
    totalSpent: 1330,
  },
  {
    rank: 30,
    userId: "30",
    username: "justin_carter",
    avatarUrl: "https://i.pravatar.cc/150?img=39",
    beerCount: 18,
    litersConsumed: 9.0,
    clubName: "Velvet Room",
    favoriteBrand: "Heineken",
    streak: 2,
    badges: [],
    weeklyAverage: 3.6,
    totalSpent: 1260,
  },
  {
    rank: 31,
    userId: "31",
    username: "brittany_mitchell",
    avatarUrl: "https://i.pravatar.cc/150?img=40",
    beerCount: 17,
    litersConsumed: 8.5,
    clubName: "The BeatBox",
    favoriteBrand: "Heineken",
    streak: 4,
    badges: [],
    weeklyAverage: 3.4,
    totalSpent: 1190,
  },
  {
    rank: 32,
    userId: "32",
    username: "dylan_perez",
    avatarUrl: "https://i.pravatar.cc/150?img=41",
    beerCount: 16,
    litersConsumed: 8.0,
    clubName: "Neon Dreams",
    favoriteBrand: "Heineken",
    streak: 3,
    badges: [],
    weeklyAverage: 3.2,
    totalSpent: 1120,
  },
  {
    rank: 33,
    userId: "33",
    username: "amanda_roberts",
    avatarUrl: "https://i.pravatar.cc/150?img=42",
    beerCount: 15,
    litersConsumed: 7.5,
    clubName: "Club Euphoria",
    favoriteBrand: "Heineken",
    streak: 2,
    badges: [],
    weeklyAverage: 3.0,
    totalSpent: 1050,
  },
  {
    rank: 34,
    userId: "34",
    username: "connor_turner",
    avatarUrl: "https://i.pravatar.cc/150?img=43",
    beerCount: 14,
    litersConsumed: 7.0,
    clubName: "District 7",
    favoriteBrand: "Heineken",
    streak: 1,
    badges: [],
    weeklyAverage: 2.8,
    totalSpent: 980,
  },
  // Additional Corona drinkers
  {
    rank: 35,
    userId: "35",
    username: "victoria_phillips",
    avatarUrl: "https://i.pravatar.cc/150?img=44",
    beerCount: 20,
    litersConsumed: 10.0,
    clubName: "Velvet Room",
    favoriteBrand: "Corona",
    streak: 6,
    badges: [],
    weeklyAverage: 4.0,
    totalSpent: 1600,
  },
  {
    rank: 36,
    userId: "36",
    username: "mason_campbell",
    avatarUrl: "https://i.pravatar.cc/150?img=45",
    beerCount: 19,
    litersConsumed: 9.5,
    clubName: "The BeatBox",
    favoriteBrand: "Corona",
    streak: 5,
    badges: [],
    weeklyAverage: 3.8,
    totalSpent: 1520,
  },
  {
    rank: 37,
    userId: "37",
    username: "madison_parker",
    avatarUrl: "https://i.pravatar.cc/150?img=46",
    beerCount: 18,
    litersConsumed: 9.0,
    clubName: "Neon Dreams",
    favoriteBrand: "Corona",
    streak: 4,
    badges: [],
    weeklyAverage: 3.6,
    totalSpent: 1440,
  },
  {
    rank: 38,
    userId: "38",
    username: "ethan_evans",
    avatarUrl: "https://i.pravatar.cc/150?img=48",
    beerCount: 17,
    litersConsumed: 8.5,
    clubName: "Club Euphoria",
    favoriteBrand: "Corona",
    streak: 3,
    badges: [],
    weeklyAverage: 3.4,
    totalSpent: 1360,
  },
  {
    rank: 39,
    userId: "39",
    username: "kayla_edwards",
    avatarUrl: "https://i.pravatar.cc/150?img=49",
    beerCount: 16,
    litersConsumed: 8.0,
    clubName: "District 7",
    favoriteBrand: "Corona",
    streak: 2,
    badges: [],
    weeklyAverage: 3.2,
    totalSpent: 1280,
  },
  {
    rank: 40,
    userId: "40",
    username: "logan_collins",
    avatarUrl: "https://i.pravatar.cc/150?img=50",
    beerCount: 15,
    litersConsumed: 7.5,
    clubName: "Velvet Room",
    favoriteBrand: "Corona",
    streak: 4,
    badges: [],
    weeklyAverage: 3.0,
    totalSpent: 1200,
  },
  {
    rank: 41,
    userId: "41",
    username: "alexis_stewart",
    avatarUrl: "https://i.pravatar.cc/150?img=51",
    beerCount: 14,
    litersConsumed: 7.0,
    clubName: "The BeatBox",
    favoriteBrand: "Corona",
    streak: 3,
    badges: [],
    weeklyAverage: 2.8,
    totalSpent: 1120,
  },
  {
    rank: 42,
    userId: "42",
    username: "cameron_sanchez",
    avatarUrl: "https://i.pravatar.cc/150?img=52",
    beerCount: 13,
    litersConsumed: 6.5,
    clubName: "Neon Dreams",
    favoriteBrand: "Corona",
    streak: 2,
    badges: [],
    weeklyAverage: 2.6,
    totalSpent: 1040,
  },
  // Additional Amstel drinkers
  {
    rank: 43,
    userId: "43",
    username: "taylor_morris",
    avatarUrl: "https://i.pravatar.cc/150?img=53",
    beerCount: 18,
    litersConsumed: 9.0,
    clubName: "Club Euphoria",
    favoriteBrand: "Amstel",
    streak: 5,
    badges: [],
    weeklyAverage: 3.6,
    totalSpent: 1080,
  },
  {
    rank: 44,
    userId: "44",
    username: "austin_rogers",
    avatarUrl: "https://i.pravatar.cc/150?img=54",
    beerCount: 17,
    litersConsumed: 8.5,
    clubName: "District 7",
    favoriteBrand: "Amstel",
    streak: 4,
    badges: [],
    weeklyAverage: 3.4,
    totalSpent: 1020,
  },
  {
    rank: 45,
    userId: "45",
    username: "morgan_reed",
    avatarUrl: "https://i.pravatar.cc/150?img=55",
    beerCount: 16,
    litersConsumed: 8.0,
    clubName: "Velvet Room",
    favoriteBrand: "Amstel",
    streak: 3,
    badges: [],
    weeklyAverage: 3.2,
    totalSpent: 960,
  },
  {
    rank: 46,
    userId: "46",
    username: "hunter_cook",
    avatarUrl: "https://i.pravatar.cc/150?img=56",
    beerCount: 15,
    litersConsumed: 7.5,
    clubName: "The BeatBox",
    favoriteBrand: "Amstel",
    streak: 2,
    badges: [],
    weeklyAverage: 3.0,
    totalSpent: 900,
  },
  {
    rank: 47,
    userId: "47",
    username: "destiny_morgan",
    avatarUrl: "https://i.pravatar.cc/150?img=57",
    beerCount: 14,
    litersConsumed: 7.0,
    clubName: "Neon Dreams",
    favoriteBrand: "Amstel",
    streak: 4,
    badges: [],
    weeklyAverage: 2.8,
    totalSpent: 840,
  },
  {
    rank: 48,
    userId: "48",
    username: "blake_bell",
    avatarUrl: "https://i.pravatar.cc/150?img=58",
    beerCount: 13,
    litersConsumed: 6.5,
    clubName: "Club Euphoria",
    favoriteBrand: "Amstel",
    streak: 3,
    badges: [],
    weeklyAverage: 2.6,
    totalSpent: 780,
  },
  {
    rank: 49,
    userId: "49",
    username: "sydney_murphy",
    avatarUrl: "https://i.pravatar.cc/150?img=59",
    beerCount: 12,
    litersConsumed: 6.0,
    clubName: "District 7",
    favoriteBrand: "Amstel",
    streak: 2,
    badges: [],
    weeklyAverage: 2.4,
    totalSpent: 720,
  },
  {
    rank: 50,
    userId: "50",
    username: "parker_bailey",
    avatarUrl: "https://i.pravatar.cc/150?img=60",
    beerCount: 11,
    litersConsumed: 5.5,
    clubName: "Velvet Room",
    favoriteBrand: "Amstel",
    streak: 1,
    badges: [],
    weeklyAverage: 2.2,
    totalSpent: 660,
  },
];

export const BeerLeaderboard = () => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] =
    useState<LeaderboardFilter>("all");

  // Filter and sort leaderboard based on selected filter
  const filteredLeaderboard = useMemo(() => {
    let filtered = [...MOCK_LEADERBOARD];

    // Apply brand filter
    if (selectedFilter !== "all" && selectedFilter !== "most_expensive") {
      const brandName = selectedFilter
        .replace("_", " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      filtered = filtered.filter(
        (entry) =>
          entry.favoriteBrand?.toLowerCase() === brandName.toLowerCase(),
      );
    }

    // Sort by total spent if "most_expensive" filter, otherwise sort by liters consumed
    if (selectedFilter === "most_expensive") {
      filtered = filtered.sort(
        (a, b) => (b.totalSpent || 0) - (a.totalSpent || 0),
      );
    } else {
      filtered = filtered.sort((a, b) => b.litersConsumed - a.litersConsumed);
    }

    // Re-assign ranks
    return filtered.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }, [selectedFilter]);

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return null;
    }
  };

  const getAvatarStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return styles.firstPlaceAvatar;
      case 2:
        return styles.secondPlaceAvatar;
      case 3:
        return styles.thirdPlaceAvatar;
      default:
        return null;
    }
  };

  const renderLeaderboardItem = (entry: LeaderboardEntry, index: number) => {
    const medal = getMedalEmoji(entry.rank);

    const handleProfilePress = () => {
      router.push(`/profile/${entry.userId}` as any);
    };

    return (
      <Animated.View
        key={entry.userId}
        entering={FadeInRight.delay(index * 50).springify()}
        style={[styles.leaderboardItem, entry.rank <= 3 && styles.topThreeItem]}
      >
        <PressableScale
          onPress={handleProfilePress}
          style={styles.cardPressable}
        >
          {/* Main Row */}
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
              {/* {entry.clubName && (
              <Text style={styles.clubName} numberOfLines={1}>
                {entry.clubName}
              </Text>
            )} */}
            </View>

            {/* Liters consumed or Amount spent */}
            <View style={styles.beerCountContainer}>
              {selectedFilter === "most_expensive" ? (
                <>
                  <Ionicons name="cash-outline" size={20} color={Colors.gold} />
                  <Text style={styles.beerCount}>${entry.totalSpent}</Text>
                </>
              ) : (
                <View>
                  <Text style={styles.beerCount}>{entry.litersConsumed} L</Text>
                  <Text style={styles.litresLabel}>consumed</Text>
                </View>
              )}
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
            {/* <Text style={styles.beerIcon}>🍺</Text> */}
            <Ionicons name="wine" size={30} color={Colors.gold} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Top Bowlers</Text>
            <Text style={styles.subtitle}>
              {selectedFilter === "most_expensive"
                ? "Biggest spenders this month"
                : "Top drinkers this month"}
            </Text>
          </View>
        </View>
        <View style={styles.headerDivider} />
      </Animated.View>

      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {(Object.keys(FILTER_CONFIG) as LeaderboardFilter[]).map((filter) => {
          const config = FILTER_CONFIG[filter];
          const isActive = selectedFilter === filter;

          return (
            <PressableScale
              key={filter}
              style={[styles.filterPill, isActive && styles.filterPillActive]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={styles.filterEmoji}>{config.emoji}</Text>
              <Text
                style={[
                  styles.filterLabel,
                  isActive && styles.filterLabelActive,
                ]}
              >
                {config.label}
              </Text>
            </PressableScale>
          );
        })}
      </ScrollView>

      {/* Leaderboard list - Full Width */}
      <View style={styles.leaderboardList}>
        {filteredLeaderboard.length > 0 ? (
          filteredLeaderboard.map((entry, index) =>
            renderLeaderboardItem(entry, index),
          )
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={Colors.smoke} />
            <Text style={styles.emptyText}>No entries for this filter</Text>
          </View>
        )}
      </View>
    </View>
  );
};
