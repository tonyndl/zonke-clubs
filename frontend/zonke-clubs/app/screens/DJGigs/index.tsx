import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { TextStroke } from "../Login/utils";
import { djService, DJGig } from "@/services/djService";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatSpecificDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function DJGigsScreen() {
  const [gigs, setGigs] = useState<DJGig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setError(null);
      djService
        .getMyGigs()
        .then((res) => setGigs(res.schedules))
        .catch(() => setError("Failed to load gigs"))
        .finally(() => setLoading(false));
    }, []),
  );

  const weekly = gigs.filter((g) => g.type === "weekly");
  const specific = gigs
    .filter((g) => g.type === "specific")
    .sort((a, b) =>
      (a.specific_date ?? "").localeCompare(b.specific_date ?? ""),
    );

  const renderGig = ({ item, index }: { item: DJGig; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <PressableScale
        onPress={() => router.push(`/club/${item.club_id}` as any)}
        style={styles.card}
      >
        {/* Left accent */}
        <LinearGradient
          colors={["rgba(57,243,255,0.8)", "rgba(200,107,255,0.6)"]}
          style={styles.accent}
        />

        <View style={styles.cardBody}>
          {/* Date / day pill */}
          <View style={styles.datePill}>
            {item.type === "weekly" ? (
              <>
                <Ionicons name="repeat" size={12} color={Colors.gold} />
                <Text style={styles.datePillText}>
                  Every {item.day ?? DAY_NAMES[item.day_of_week ?? 0]}
                </Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="calendar-outline"
                  size={12}
                  color={Colors.gold}
                />
                <Text style={styles.datePillText}>
                  {item.specific_date
                    ? formatSpecificDate(item.specific_date)
                    : "—"}
                </Text>
              </>
            )}
          </View>

          {/* Club name */}
          <Text style={styles.clubName} numberOfLines={1}>
            {item.club_name ?? "Club"}
          </Text>

          {/* Location */}
          {item.club_location?.name && (
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={13} color={Colors.smoke} />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.club_location.name}
              </Text>
            </View>
          )}

          {/* Time */}
          {item.start_time && (
            <View style={styles.timeRow}>
              <Ionicons name="time-outline" size={13} color={Colors.smoke} />
              <Text style={styles.timeText}>
                {item.start_time}
                {item.end_time ? ` – ${item.end_time}` : ""}
              </Text>
            </View>
          )}

          {/* Notes */}
          {item.notes ? (
            <Text style={styles.notes} numberOfLines={2}>
              {item.notes}
            </Text>
          ) : null}
        </View>

        <Ionicons name="chevron-forward" size={18} color={Colors.smoke} />
      </PressableScale>
    </Animated.View>
  );

  const sections: Array<{ title: string; data: DJGig[] }> = [];
  if (weekly.length > 0) sections.push({ title: "Recurring", data: weekly });
  if (specific.length > 0) sections.push({ title: "Upcoming", data: specific });

  const flatData: Array<DJGig | { sectionTitle: string }> = sections.flatMap(
    (s) => [{ sectionTitle: s.title }, ...s.data],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <Animated.View entering={FadeInUp.springify()} style={styles.header}>
        <PressableScale onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={Colors.gold} />
        </PressableScale>
        <TextStroke stroke={0.6} color={Colors.gold}>
          <Text style={styles.title}>My Gigs</Text>
        </TextStroke>
        <View style={{ width: 44 }} />
      </Animated.View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.gold} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons
            name="alert-circle-outline"
            size={44}
            color={Colors.smoke}
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : flatData.length === 0 ? (
        <View style={styles.center}>
          <Ionicons
            name="musical-notes-outline"
            size={52}
            color={Colors.smoke}
          />
          <Text style={styles.emptyTitle}>No gigs booked yet</Text>
          <Text style={styles.emptySubtitle}>
            Club admins book you when they add you to their schedule.
          </Text>
        </View>
      ) : (
        <FlatList
          data={flatData}
          keyExtractor={(item, i) =>
            "sectionTitle" in item ? `section-${i}` : item.id
          }
          renderItem={({ item, index }) => {
            if ("sectionTitle" in item) {
              return (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{item.sectionTitle}</Text>
                  <View style={styles.sectionLine} />
                </View>
              );
            }
            return renderGig({
              item,
              index: flatData
                .filter((d): d is DJGig => !("sectionTitle" in d))
                .indexOf(item),
            });
          }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 4,
    marginBottom: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    color: Colors.smoke,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  accent: {
    width: 4,
    alignSelf: "stretch",
  },
  cardBody: {
    flex: 1,
    padding: 14,
    gap: 4,
  },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: "rgba(212,175,55,0.12)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.3)",
    marginBottom: 4,
  },
  datePillText: {
    color: Colors.gold,
    fontSize: 11,
    fontWeight: "700",
  },
  clubName: {
    color: Colors.platinum,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    color: Colors.smoke,
    fontSize: 12,
    flex: 1,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    color: Colors.smoke,
    fontSize: 12,
  },
  notes: {
    color: Colors.smoke,
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 2,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  errorText: {
    color: Colors.smoke,
    fontSize: 15,
    textAlign: "center",
  },
  emptyTitle: {
    color: Colors.platinum,
    fontSize: 20,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: Colors.smoke,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
