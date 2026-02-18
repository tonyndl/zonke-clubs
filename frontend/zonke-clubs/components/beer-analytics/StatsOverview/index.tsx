import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/ui";
import { BeerStats, formatLitres } from "@/types/beerAnalytics";
import { styles } from "./styles";

interface Props {
  stats: BeerStats;
}

export function StatsOverview({ stats }: Props) {
  const statCards = [
    {
      icon: "beer" as const,
      label: "Total Beers",
      value: stats.total_beers,
      color: Colors.gold,
    },
    {
      icon: "bar-chart" as const,
      label: "Unique Brands",
      value: stats.unique_brands,
      color: "#FF6B6B",
    },
    // {
    //   icon: 'color-palette' as const,
    //   label: 'Beer Types',
    //   value: stats.unique_types,
    //   color: '#4ECDC4',
    // },
    // {
    //   icon: 'flame' as const,
    //   label: 'Current Streak',
    //   value: `${stats.current_streak} days`,
    //   color: '#FF6B35',
    // },
  ];

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.springify()} style={styles.header}>
        <Ionicons name="stats-chart" size={24} color={Colors.gold} />
        <Text style={styles.title}>Your Beer Journey</Text>
      </Animated.View>

      {/* Hero Card - Total Litres & Rank */}
      <Animated.View
        entering={FadeInDown.delay(50).springify()}
        style={styles.heroCard}
      >
        {/* <LinearGradient
          colors={['rgba(255, 215, 0, 0.15)', 'rgba(255, 215, 0, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        /> */}
        <View style={styles.heroContent}>
          <View style={styles.heroLeft}>
            <View style={styles.heroIconContainer}>
              <Ionicons name="water" size={32} color={Colors.gold} />
            </View>
            <View>
              <Text style={styles.heroValue}>
                {formatLitres(stats.total_litres)}
              </Text>
              <Text style={styles.heroLabel}>Total Consumed</Text>
            </View>
          </View>
          {stats.global_rank && (
            <View style={styles.rankBadge}>
              <Ionicons name="trophy" size={18} color={Colors.gold} />
              <Text style={styles.rankText}>#{stats.global_rank}</Text>
              <Text style={styles.rankSubtext}>
                of {stats.total_users?.toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Stat Cards Grid */}
      <View style={styles.grid}>
        {statCards.map((card, index) => (
          <Animated.View
            key={card.label}
            entering={FadeInDown.delay(100 + 50 * index).springify()}
            style={styles.statCard}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${card.color}20` },
              ]}
            >
              <Ionicons name={card.icon} size={24} color={card.color} />
            </View>
            <Text style={styles.statValue}>{card.value}</Text>
            <Text style={styles.statLabel}>{card.label}</Text>
          </Animated.View>
        ))}
      </View>

      {/* Favorite Stats */}
      {stats.favorite_brand && (
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={styles.favoriteCard}
        >
          <Text style={styles.favoriteLabel}>Your Go-To Beer</Text>
          <Text style={styles.favoriteBrand}>{stats.favorite_brand}</Text>
          <Text style={styles.favoriteType}>{stats.favorite_type}</Text>
        </Animated.View>
      )}
    </View>
  );
}
