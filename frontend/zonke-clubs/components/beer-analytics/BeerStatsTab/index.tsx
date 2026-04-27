import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/ui";
import {
  spendingService,
  SpendingStats,
  SpendingRecord,
} from "@/services/spendingService";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";
import { EmptyState } from "@/components/ui/EmptyState";

interface Props {
  userId: string;
  isOwnProfile: boolean;
  spendingVisible?: boolean;
}

function formatAmount(value: number): string {
  const [whole, dec] = value.toFixed(2).split(".");
  return whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + "." + dec;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("en-ZA", { month: "short" });
  return `${day} ${month}`;
}

function getRankColors(rank: number): {
  border: string;
  badge: string;
  trophyColor: string;
  tintBg: string;
} {
  if (rank === 1) {
    return {
      border: Colors.gold,
      badge: Colors.gold,
      trophyColor: Colors.gold,
      tintBg: "rgba(57,243,255,0.08)",
    };
  }
  if (rank === 2) {
    return {
      border: Colors.platinum,
      badge: Colors.platinum,
      trophyColor: Colors.platinum,
      tintBg: "rgba(229,228,226,0.06)",
    };
  }
  if (rank === 3) {
    return {
      border: Colors.smoke,
      badge: Colors.smoke,
      trophyColor: Colors.smoke,
      tintBg: "rgba(154,164,178,0.06)",
    };
  }
  return {
    border: "rgba(57,243,255,0.2)",
    badge: Colors.primaryBlue,
    trophyColor: Colors.primaryBlue,
    tintBg: "rgba(57,243,255,0.04)",
  };
}

export function BeerStatsTab({
  userId,
  isOwnProfile,
  spendingVisible = false,
}: Props) {
  const [stats, setStats] = useState<SpendingStats | null>(null);
  const [history, setHistory] = useState<SpendingRecord[]>([]);
  const [rankings, setRankings] = useState<
    Array<{
      club_id: string;
      club_name: string;
      rank: number;
      best_amount: number;
      best_amount_date?: string;
    }>
  >([]);
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
      spendingService.getHistory(10),
      spendingService.getRankings(),
    ])
      .then(([statsData, historyData, rankingsData]) => {
        setStats(statsData);
        setHistory(historyData.spending_records);
        setRankings(rankingsData.rankings || []);
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
      <EmptyState
        icon="lock-closed"
        title="Spending data is private"
        subtitle="This member has chosen to keep their spending private"
      />
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
      <EmptyState
        icon="alert-circle-outline"
        title={error || "No spending data available"}
        subtitle="Clubs you visit will add your spending records here"
      />
    );
  }

  const hasData = stats.total_visits > 0;

  if (!hasData) {
    return (
      <EmptyState
        icon="beer-outline"
        title="No spending records yet"
        subtitle="When you visit clubs, they'll add your spending records here"
      />
    );
  }

  const totalSpent = stats.total_spent ?? 0;
  const avgPerVisit = stats.average_per_visit ?? 0;
  const favoriteClub = stats.most_visited_club ?? null;

  // Derive best night from history (max single-visit amount)
  const bestNight =
    history.length > 0 ? Math.max(...history.map((r) => Number(r.amount))) : 0;

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero Card ─────────────────────────────────── */}
      <Animated.View
        entering={FadeInDown.delay(80).springify()}
        style={styles.section}
      >
        <LinearGradient
          colors={["rgba(57,243,255,0.18)", "rgba(57,243,255,0.04)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          {/* Wallet icon + label */}
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="wallet" size={20} color={Colors.gold} />
            </View>
            <Text style={styles.heroLabel}>Total Spent</Text>
          </View>

          {/* Big total */}
          <Text style={styles.heroAmount}>R{formatAmount(totalSpent)}</Text>

          {/* Divider */}
          <View style={styles.heroDivider} />

          {/* Three inline pills */}
          <View style={styles.heroPillsRow}>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillValue}>{stats.total_visits}</Text>
              <Text style={styles.heroPillLabel}>Visits</Text>
            </View>

            <View style={styles.heroPillSeparator} />

            <View style={styles.heroPill}>
              <Text style={styles.heroPillValue}>
                R{formatAmount(avgPerVisit)}
              </Text>
              <Text style={styles.heroPillLabel}>Avg / Visit</Text>
            </View>

            <View style={styles.heroPillSeparator} />

            <View style={styles.heroPill}>
              <Text style={styles.heroPillValue}>
                {bestNight > 0 ? `R${formatAmount(bestNight)}` : "—"}
              </Text>
              <Text style={styles.heroPillLabel}>Best Night</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* ── Favorite Spot ─────────────────────────────── */}
      {favoriteClub && (
        <Animated.View
          entering={FadeInDown.delay(160).springify()}
          style={styles.section}
        >
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionTitleBar} />
            <Text style={styles.sectionTitle}>Favorite Spot</Text>
          </View>

          <View style={styles.favoriteCard}>
            {/* Accent stripe */}
            <LinearGradient
              colors={[Colors.primaryBlue, Colors.secondaryBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.favoriteAccentStripe}
            />

            <View style={styles.favoriteCardInner}>
              <View style={styles.favoriteInfo}>
                <Text style={styles.favoriteClubName} numberOfLines={1}>
                  {favoriteClub.club_name}
                </Text>
                <Text style={styles.favoriteClubVisits}>
                  {favoriteClub.visit_count} visit
                  {favoriteClub.visit_count !== 1 ? "s" : ""}
                </Text>
              </View>
              <Ionicons name="heart" size={28} color={Colors.gold} />
            </View>
          </View>
        </Animated.View>
      )}

      {/* ── Leaderboard ───────────────────────────────── */}
      {rankings.length > 0 && (
        <Animated.View
          entering={FadeInDown.delay(240).springify()}
          style={styles.section}
        >
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionTitleBar} />
            <Text style={styles.sectionTitle}>Leaderboard</Text>
          </View>

          {rankings.map((r, index) => {
            const rc = getRankColors(r.rank);
            return (
              <Animated.View
                key={r.club_id}
                entering={FadeInDown.delay(270 + index * 55).springify()}
                style={[
                  styles.rankingCard,
                  {
                    borderColor: rc.border,
                    backgroundColor: rc.tintBg,
                  },
                ]}
              >
                {/* Rank badge */}
                <View
                  style={[
                    styles.rankBadge,
                    { backgroundColor: rc.badge + "22", borderColor: rc.badge },
                  ]}
                >
                  <Text style={[styles.rankBadgeText, { color: rc.badge }]}>
                    {r.rank}
                  </Text>
                </View>

                {/* Club info */}
                <View style={styles.rankingInfo}>
                  <Text style={styles.rankingClubName} numberOfLines={1}>
                    {r.club_name}
                  </Text>
                  <View style={styles.rankingMeta}>
                    <Text style={styles.rankingBestNight}>
                      R{formatAmount(Number(r.best_amount))}
                    </Text>
                    {r.best_amount_date ? (
                      <>
                        <Text style={styles.rankingMetaDot}>·</Text>
                        <Text style={styles.rankingDate}>
                          {formatDate(r.best_amount_date)}
                        </Text>
                      </>
                    ) : null}
                  </View>
                </View>

                {/* Trophy */}
                <Ionicons name="trophy" size={22} color={rc.trophyColor} />
              </Animated.View>
            );
          })}
        </Animated.View>
      )}

      {/* ── Recent Visits ─────────────────────────────── */}
      {history.length > 0 && (
        <Animated.View
          entering={FadeInDown.delay(320).springify()}
          style={styles.section}
        >
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionTitleBar} />
            <Text style={styles.sectionTitle}>Recent Visits</Text>
          </View>

          <View style={styles.historyList}>
            {history.map((record, index) => (
              <Animated.View
                key={record.id}
                entering={FadeInDown.delay(360 + index * 45).springify()}
                style={styles.historyItem}
              >
                {/* Date badge */}
                <View style={styles.historyDateBadge}>
                  <Text style={styles.historyDateText}>
                    {formatDate(record.visit_date)}
                  </Text>
                </View>

                {/* Club + notes */}
                <View style={styles.historyMiddle}>
                  <Text style={styles.historyClubName} numberOfLines={1}>
                    {record.club?.name || "Unknown Club"}
                  </Text>
                  {record.notes ? (
                    <Text style={styles.historyNotes} numberOfLines={1}>
                      {record.notes}
                    </Text>
                  ) : null}
                </View>

                {/* Amount */}
                <Text style={styles.historyAmount}>
                  R{formatAmount(Number(record.amount))}
                </Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      )}

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}
