import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { Colors } from "@/constants/ui";
import {
  spendingService,
  SpendingStats,
  SpendingRecord,
} from "@/services/spendingService";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";

interface Props {
  userId: string;
  isOwnProfile: boolean;
  spendingVisible?: boolean;
}

export function BeerStatsTab({
  userId,
  isOwnProfile,
  spendingVisible = false,
}: Props) {
  const [stats, setStats] = useState<SpendingStats | null>(null);
  const [history, setHistory] = useState<SpendingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canView = isOwnProfile || spendingVisible;

  useEffect(() => {
    if (canView) {
      loadSpendingData();
    }
  }, [userId, canView]);

  const loadSpendingData = () => {
    setLoading(true);
    setError(null);

    Promise.all([
      spendingService.getStats(),
      spendingService.getHistory(10), // Get last 10 records
    ])
      .then(([statsData, historyData]) => {
        setStats(statsData);
        setHistory(historyData.spending_records);
      })
      .catch((err) => {
        console.error("[BeerStatsTab] Failed to load spending data:", err);
        setError("Failed to load spending data");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (!canView) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="lock-closed" size={48} color={Colors.lightGrey} />
        <Text style={styles.emptyText}>Spending data is private</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Loading spending data...</Text>
      </View>
    );
  }

  if (error || !stats) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={Colors.smoke} />
        <Text style={styles.errorText}>
          {error || "No spending data available"}
        </Text>
        <Text style={styles.errorSubtext}>
          Clubs you visit will add your spending records here
        </Text>
      </View>
    );
  }

  const hasData = stats.total_visits > 0;

  if (!hasData) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="beer-outline" size={64} color={Colors.lightGrey} />
        <Text style={styles.emptyText}>No spending records yet</Text>
        <Text style={styles.emptySubtext}>
          When you visit clubs, they'll add your spending records here
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Stats Overview */}
      <Animated.View
        entering={FadeInDown.delay(100).springify()}
        style={styles.section}
      >
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="wallet" size={24} color={Colors.gold} />
            <Text style={styles.statValue}>
              R{parseFloat(stats.total_spending || "0").toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="calendar" size={24} color={Colors.primaryBlue} />
            <Text style={styles.statValue}>{stats.total_visits}</Text>
            <Text style={styles.statLabel}>Visits</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="bar-chart" size={24} color={Colors.gold} />
            <Text style={styles.statValue}>
              R{parseFloat(stats.average_spending || "0").toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Avg/Visit</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color={Colors.primaryBlue} />
            <Text style={styles.statValue}>
              R{parseFloat(stats.max_spending || "0").toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Best Night</Text>
          </View>
        </View>
      </Animated.View>

      {/* Favorite Club */}
      {stats.favorite_club && (
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Favorite Spot</Text>
          <View style={styles.favoriteClubCard}>
            <View style={styles.favoriteClubHeader}>
              <Ionicons name="heart" size={24} color="#ff3b30" />
              <View style={styles.favoriteClubInfo}>
                <Text style={styles.favoriteClubName}>
                  {stats.favorite_club.name}
                </Text>
                <Text style={styles.favoriteClubVisits}>
                  {stats.favorite_club.visit_count} visit
                  {stats.favorite_club.visit_count > 1 ? "s" : ""}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Clubs Visited */}
      {stats.clubs_visited && stats.clubs_visited > 0 && (
        <Animated.View
          entering={FadeInDown.delay(250).springify()}
          style={styles.section}
        >
          <View style={styles.clubsVisitedCard}>
            <Ionicons name="location" size={20} color={Colors.gold} />
            <Text style={styles.clubsVisitedText}>
              Visited {stats.clubs_visited} club
              {stats.clubs_visited > 1 ? "s" : ""}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Recent Spending History */}
      {history.length > 0 && (
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Recent Visits</Text>
          <View style={styles.historyList}>
            {history.map((record, index) => (
              <Animated.View
                key={record.id}
                entering={FadeInDown.delay(350 + index * 50).springify()}
                style={styles.historyItem}
              >
                <View style={styles.historyItemLeft}>
                  <View style={styles.historyIconContainer}>
                    <Ionicons name="beer" size={20} color={Colors.gold} />
                  </View>
                  <View style={styles.historyItemInfo}>
                    <Text style={styles.historyItemClub}>
                      {record.club?.name || "Unknown Club"}
                    </Text>
                    <Text style={styles.historyItemDate}>
                      {new Date(record.visit_date).toLocaleDateString("en-ZA", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                </View>
                <View style={styles.historyItemRight}>
                  <Text style={styles.historyItemAmount}>
                    R{parseFloat(record.amount).toFixed(2)}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
