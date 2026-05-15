import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/ui";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { PressableScale } from "@/components/ui/PressableScale";
import * as Haptics from "expo-haptics";

export default function DayLineupScreen() {
  const { id, day } = useLocalSearchParams() as { id: string; day?: string };
  const router = useRouter();

  const sampleLineup = [
    { id: "d1", name: "DJ Nova", playingFrom: "10:00 PM" },
    { id: "d2", name: "Rass Da Dany", playingFrom: "11:30 PM" },
    { id: "d3", name: "Lo-fi Beats", playingFrom: "1:00 AM" },
  ];

  const sampleRequests = [
    { id: "r1", song: "Losing It - Fisher", count: 100 },
    { id: "r2", song: "Promises - Calvin Harris", count: 65 },
    { id: "r3", song: "Turn On The Lights - Fred again..", count: 50 },
    { id: "r4", song: "Head & Heart - Joel Corry", count: 28 },
  ];

  const [lineup] = useState<any[]>(sampleLineup);
  const [requests, setRequests] = useState<any[]>(sampleRequests);
  const [requestText, setRequestText] = useState("");
  const inputRef = useRef<TextInput>(null);
  const [votedRequests, setVotedRequests] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedTab, setSelectedTab] = useState<"lineup" | "requests">(
    "requests",
  );

  const getNextWeekdayDate = (dayShort?: string) => {
    const map: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    const today = new Date();
    if (!dayShort || !map.hasOwnProperty(dayShort)) return today;
    const diff = (map[dayShort] - today.getDay() + 7) % 7;
    if (diff === 0) return today;
    const next = new Date(today);
    next.setDate(today.getDate() + diff);
    return next;
  };

  const formatShortDate = (d: Date) => {
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
    return `${d.getDate()} ${months[d.getMonth()]}`;
  };

  const selectedDate = getNextWeekdayDate(day as string);
  const displayDate = formatShortDate(selectedDate);
  const maxCount = requests.reduce((m, r) => Math.max(m, r.count ?? 0), 1);

  const handleVote = (item: any) => {
    if (!item) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const alreadyVoted = !!votedRequests[item.id];
    const prevCount = item.count ?? 0;
    const newCount = Math.max(prevCount + (alreadyVoted ? -1 : 1), 0);

    setRequests((prev) =>
      prev
        .map((r) => (r.id === item.id ? { ...r, count: newCount } : r))
        .filter((r) => (r.count ?? 0) > 0)
        .sort((a, b) => (b.count ?? 0) - (a.count ?? 0)),
    );
    setVotedRequests((prev) => {
      const copy = { ...prev };
      if (alreadyVoted) delete copy[item.id];
      else copy[item.id] = true;
      return copy;
    });
  };

  const submitRequest = () => {
    const song = requestText.trim();
    if (!song) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const idx = requests.findIndex(
      (r) => (r.song ?? "").toLowerCase() === song.toLowerCase(),
    );
    if (idx !== -1) {
      const existing = requests[idx];
      setRequests((prev) =>
        prev
          .map((r) =>
            r.id === existing.id ? { ...r, count: (r.count ?? 0) + 1 } : r,
          )
          .sort((a, b) => (b.count ?? 0) - (a.count ?? 0)),
      );
      setVotedRequests((prev) => ({ ...prev, [existing.id]: true }));
    } else {
      const temp = { id: `temp-${Date.now()}`, song, count: 1 };
      setRequests((prev) => [temp, ...prev]);
      setVotedRequests((prev) => ({ ...prev, [temp.id]: true }));
    }
    setRequestText("");
  };

  const rankColor = (index: number) => {
    if (index === 0) return "#FFD700";
    if (index === 1) return "#C0C0C0";
    if (index === 2) return "#CD7F32";
    return Colors.smoke;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <PressableScale onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={Colors.platinum} />
        </PressableScale>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {day} {displayDate}
          </Text>
          <Text style={styles.subtitle}>Song requests & DJ lineup</Text>
        </View>
      </View>

      <View style={styles.body}>
        {/* ── Tab switcher ── */}
        <View style={styles.tabRow}>
          {(["requests", "lineup"] as const).map((tab) => (
            <PressableScale
              key={tab}
              style={[
                styles.tabBtn,
                selectedTab === tab && styles.tabBtnActive,
              ]}
              onPress={() => {
                setSelectedTab(tab);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Ionicons
                name={tab === "requests" ? "musical-notes" : "people"}
                size={14}
                color={selectedTab === tab ? Colors.bg : Colors.smoke}
                style={{ marginRight: 5 }}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.tabTextActive,
                ]}
              >
                {tab === "requests" ? "Requests" : "Lineup"}
              </Text>
            </PressableScale>
          ))}
        </View>

        {/* ── Requests tab ── */}
        {selectedTab === "requests" && (
          <>
            {/* Input */}
            <View style={styles.inputCard}>
              <Ionicons name="musical-note" size={18} color={Colors.gold} />
              <TextInput
                ref={inputRef}
                placeholder="Request a song..."
                placeholderTextColor={Colors.smoke}
                value={requestText}
                onChangeText={setRequestText}
                style={styles.input}
                returnKeyType="send"
                onSubmitEditing={submitRequest}
              />
              <PressableScale
                style={[
                  styles.sendBtn,
                  !!requestText.trim() && styles.sendBtnActive,
                ]}
                onPress={() => {
                  submitRequest();
                  inputRef.current?.focus();
                }}
              >
                <Ionicons
                  name="send"
                  size={15}
                  color={requestText.trim() ? Colors.bg : Colors.smoke}
                />
              </PressableScale>
            </View>

            {requests.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="musical-notes-outline"
                  size={40}
                  color={Colors.smoke}
                />
                <Text style={styles.emptyText}>No requests yet</Text>
                <Text style={styles.emptySubtext}>
                  Be the first to request a song!
                </Text>
              </View>
            ) : (
              <FlatList
                data={requests}
                keyExtractor={(r) => r.id}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32 }}
                renderItem={({ item, index }) => {
                  const voted = !!votedRequests[item.id];
                  const count = item.count ?? 0;
                  const barWidth = `${Math.round((count / maxCount) * 100)}%`;
                  const isTop = index === 0;

                  return (
                    <View
                      style={[styles.songCard, isTop && styles.songCardTop]}
                    >
                      {/* Progress bar background */}
                      <View
                        style={[
                          styles.progressBar,
                          { width: barWidth as any },
                          isTop && styles.progressBarTop,
                        ]}
                      />

                      {/* Rank */}
                      <Text style={[styles.rank, { color: rankColor(index) }]}>
                        {index + 1}
                      </Text>

                      {/* Song info */}
                      <View style={styles.songInfo}>
                        <Text style={styles.songName} numberOfLines={1}>
                          {item.song}
                        </Text>
                      </View>

                      {/* Vote button */}
                      <PressableScale
                        onPress={() => handleVote(item)}
                        style={[
                          styles.votePill,
                          voted && styles.votePillActive,
                        ]}
                      >
                        <Ionicons
                          name={
                            voted
                              ? "arrow-up-circle"
                              : "arrow-up-circle-outline"
                          }
                          size={15}
                          color={voted ? Colors.bg : Colors.gold}
                        />
                        <Text
                          style={[
                            styles.voteCount,
                            voted && styles.voteCountActive,
                          ]}
                        >
                          {count}
                        </Text>
                      </PressableScale>
                    </View>
                  );
                }}
              />
            )}
          </>
        )}

        {/* ── Lineup tab ── */}
        {selectedTab === "lineup" &&
          (lineup.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="person-outline" size={40} color={Colors.smoke} />
              <Text style={styles.emptyText}>No DJs scheduled</Text>
              <Text style={styles.emptySubtext}>
                Check back closer to the night
              </Text>
            </View>
          ) : (
            <FlatList
              data={lineup}
              keyExtractor={(i) => i.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 32 }}
              renderItem={({ item, index }) => (
                <View style={styles.djCard}>
                  <LinearGradient
                    colors={["rgba(57,243,255,0.08)", "rgba(57,243,255,0.02)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.djGradient}
                  >
                    <View style={styles.djSlot}>
                      <Text style={styles.djSlotText}>#{index + 1}</Text>
                    </View>

                    <View style={styles.djAvatar}>
                      <Ionicons name="person" size={22} color={Colors.gold} />
                    </View>

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.djName}>{item.name}</Text>
                      <View style={styles.djTimeRow}>
                        <Ionicons
                          name="time-outline"
                          size={12}
                          color={Colors.gold}
                        />
                        <Text style={styles.djTime}>
                          {item.playingFrom ?? "TBA"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.djLiveBadge}>
                      <View style={styles.djLiveDot} />
                      <Text style={styles.djLiveText}>SET</Text>
                    </View>
                  </LinearGradient>
                </View>
              )}
            />
          ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.bgCard,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.15)",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.platinum,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.smoke,
    marginTop: 2,
  },

  body: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // ── Tabs ─────────────────────────────────────────────────────────────────────
  tabRow: {
    flexDirection: "row",
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.12)",
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: Colors.gold,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.smoke,
  },
  tabTextActive: {
    color: Colors.bg,
  },

  // ── Input ─────────────────────────────────────────────────────────────────────
  inputCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.12)",
    gap: 10,
  },
  inputCardFocused: {
    borderColor: Colors.gold,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.white,
    paddingVertical: 12,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(57,243,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.2)",
  },
  sendBtnActive: {
    backgroundColor: Colors.gold,
    borderColor: "transparent",
  },

  // ── Song rows ─────────────────────────────────────────────────────────────────
  songCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.08)",
    overflow: "hidden",
    gap: 10,
  },
  songCardTop: {
    borderColor: "rgba(57,243,255,0.25)",
  },
  progressBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(57,243,255,0.05)",
    borderRadius: 14,
  },
  progressBarTop: {
    backgroundColor: "rgba(57,243,255,0.09)",
  },
  rank: {
    fontSize: 16,
    fontWeight: "800",
    width: 24,
    textAlign: "center",
  },
  songInfo: {
    flex: 1,
  },
  songName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.platinum,
    letterSpacing: 0.1,
  },
  votePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(57,243,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.25)",
  },
  votePillActive: {
    backgroundColor: Colors.gold,
    borderColor: "transparent",
  },
  voteCount: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.gold,
  },
  voteCountActive: {
    color: Colors.bg,
  },

  // ── DJ cards ──────────────────────────────────────────────────────────────────
  djCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.18)",
  },
  djGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 0,
  },
  djSlot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(57,243,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  djSlotText: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.gold,
  },
  djAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.velvet,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  djName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.platinum,
  },
  djTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  djTime: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.gold,
  },
  djLiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(57,243,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.2)",
  },
  djLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.gold,
  },
  djLiveText: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.gold,
    letterSpacing: 1,
  },

  // ── Empty state ───────────────────────────────────────────────────────────────
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingBottom: 80,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.platinum,
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.smoke,
  },
});
