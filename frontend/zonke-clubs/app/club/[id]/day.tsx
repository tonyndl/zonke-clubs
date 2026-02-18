import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/ui";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

/**
 * DayLineupScreen
 * Shows the DJ lineup for a specific day and the requested songs for that day.
 * Expects query params: id (club id) and day (Mon|Tue|...)
 */
export default function DayLineupScreen() {
  const { id, day } = useLocalSearchParams() as { id: string; day?: string };
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  // Sample dummy data used as fallback / initial display
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

  const [lineup, setLineup] = useState<any[]>(sampleLineup);
  const [requests, setRequests] = useState<any[]>(sampleRequests);
  const [requestText, setRequestText] = useState("");
  const [votedRequests, setVotedRequests] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedTab, setSelectedTab] = useState<"lineup" | "requests">(
    "requests",
  );

  // compute the next calendar date for the given short weekday (Mon, Tue, ...)
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
    const todayJs = today.getDay(); // 0..6 (Sun..Sat)
    if (!dayShort || !map.hasOwnProperty(dayShort)) return today;
    const targetJs = map[dayShort];
    const diff = (targetJs - todayJs + 7) % 7;
    // If diff === 0, the selected weekday is today — show today's date (not the same weekday next week)
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

  const handleVote = async (item: any) => {
    if (!item) return;

    const alreadyVoted = !!votedRequests[item.id];
    const prevCount = item.count ?? item.requestsCount ?? 0;
    const newCount = Math.max(prevCount + (alreadyVoted ? -1 : 1), 0);

    // optimistic update: set new count or remove if zero
    setRequests((prev) => {
      const copy = prev.map((r) =>
        r.id === item.id ? { ...r, count: newCount } : r,
      );
      return copy.filter((r) => (r.count ?? r.requestsCount ?? 0) > 0);
    });

    setVotedRequests((prev) => {
      const copy = { ...prev };
      if (alreadyVoted) delete copy[item.id];
      else copy[item.id] = true;
      return copy;
    });

    try {
      // send vote toggle to backend; body includes vote: true/false
      const res = await fetch(`/api/clubs/${id}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ song: item.song, vote: !alreadyVoted }),
      });
      if (res.ok) {
        const json = await res.json();
        const serverObj = Array.isArray(json.data ?? json)
          ? (json.data ?? json)[0]
          : (json.data ?? json);
        if (serverObj) {
          // replace with server-provided object (may include canonical id and count)
          setRequests((prev) => {
            const replaced = prev.map((r) =>
              r.id === item.id ? serverObj : r,
            );
            return replaced.filter(
              (r) => (r.count ?? r.requestsCount ?? 0) > 0,
            );
          });
          // migrate voted flag if id changed
          if (serverObj.id && serverObj.id !== item.id) {
            setVotedRequests((prev) => {
              const copy = { ...prev };
              if (alreadyVoted) delete copy[item.id];
              else copy[serverObj.id] = true;
              delete copy[item.id];
              return copy;
            });
          }
        }
      }
    } catch (e) {
      // revert optimistic update on failure: restore prevCount or remove if prevCount was zero
      setRequests((prev) => {
        // if prevCount was zero then remove item, otherwise set back to prevCount
        if (prevCount === 0) return prev.filter((r) => r.id !== item.id);
        return prev.map((r) =>
          r.id === item.id ? { ...r, count: prevCount } : r,
        );
      });
      setVotedRequests((prev) => {
        const copy = { ...prev };
        if (alreadyVoted) copy[item.id] = true;
        else delete copy[item.id];
        return copy;
      });
    }
  };

  const submitRequest = async () => {
    const song = requestText.trim();
    if (!song) return;

    // Try to find existing requested song (case-insensitive match)
    const idx = requests.findIndex(
      (r) => (r.song ?? "").toLowerCase() === song.toLowerCase(),
    );
    if (idx !== -1) {
      // optimistic increment
      const existing = requests[idx];
      const updated = {
        ...existing,
        count: (existing.count ?? existing.requestsCount ?? 0) + 1,
      };
      setRequests((prev) => {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      });
      setVotedRequests((prev) => ({ ...prev, [existing.id]: true }));
      setRequestText("");

      return;
    }

    const temp = { id: `temp-${Date.now()}`, song, count: 1 };
    setRequests((prev) => [temp, ...prev]);
    setVotedRequests((prev) => ({ ...prev, [temp.id]: true }));
    setRequestText("");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 12 }}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {day} {displayDate}
          </Text>
          <Text style={styles.subtitle}>Song requests and Dj lineup</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ paddingHorizontal: 16, flex: 1 }}>
        {/* Inline switch (Requests first, Lineup second) - improved segmented control */}
        <View style={styles.switchRow}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === "requests"
                ? styles.tabActiveFilled
                : styles.tabButtonOutline,
            ]}
            onPress={() => setSelectedTab("requests")}
            activeOpacity={0.9}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "requests" && styles.tabTextActive,
              ]}
            >
              Requests
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === "lineup"
                ? styles.tabActiveFilled
                : styles.tabButtonOutline,
            ]}
            onPress={() => setSelectedTab("lineup")}
            activeOpacity={0.9}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "lineup" && styles.tabTextActive,
              ]}
            >
              Lineup
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 12 }} />

        {selectedTab === "lineup" ? (
          lineup.length === 0 ? (
            <Text style={styles.emptyText}>No DJs scheduled for {day}</Text>
          ) : (
            <FlatList
              data={lineup}
              keyExtractor={(i) => i.id}
              renderItem={({ item, index }) => (
                <View style={styles.djRow}>
                  <LinearGradient
                    colors={[
                      "rgba(57, 243, 255, 0.1)",
                      "rgba(57, 243, 255, 0.02)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.djRowGradient}
                  >
                    <View style={styles.djAvatarRing}>
                      <View style={styles.avatar}>
                        <Ionicons name="person" size={24} color={Colors.gold} />
                      </View>
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={styles.djName}>{item.name}</Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                          marginTop: 4,
                        }}
                      >
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color={Colors.gold}
                        />
                        <Text style={styles.djMeta}>
                          {item.playingFrom ?? "TBA"}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.djNumberBadge}>
                      <Text style={styles.djNumberText}>#{index + 1}</Text>
                    </View>
                  </LinearGradient>
                </View>
              )}
            />
          )
        ) : requests.length === 0 ? (
          <Text style={styles.emptyText}>No song requests for {day} yet.</Text>
        ) : (
          <>
            <View style={{ marginBottom: 12 }}>
              <View style={styles.requestInputRow}>
                <TextInput
                  placeholder="Request a song..."
                  placeholderTextColor="#6b7280"
                  value={requestText}
                  onChangeText={setRequestText}
                  style={styles.requestInput}
                  returnKeyType="send"
                  onSubmitEditing={submitRequest}
                />
                <TouchableOpacity
                  style={styles.requestAddButton}
                  onPress={submitRequest}
                  activeOpacity={0.8}
                >
                  <Ionicons name="send" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            <FlatList
              data={requests}
              keyExtractor={(r) => r.id}
              renderItem={({ item, index }) => (
                <View style={styles.requestRow}>
                  <Text style={styles.requestIndex}>{index + 1}.</Text>
                  <View style={{ marginLeft: 8, flex: 1 }}>
                    <Text style={styles.requestSong}>{item.song}</Text>
                    {/* <Text style={styles.requestBy}>Requested by {item.requestedBy ?? 'Guest'}</Text> */}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.requestCountPill,
                      votedRequests[item.id]
                        ? styles.requestCountPillVoted
                        : null,
                    ]}
                    onPress={() => handleVote(item)}
                    activeOpacity={votedRequests[item.id] ? 1 : 0.8}
                  >
                    <Text
                      style={[
                        styles.requestCountText,
                        votedRequests[item.id]
                          ? { color: Colors.bg, fontWeight: "700" }
                          : { color: Colors.white },
                      ]}
                    >
                      {item.count ?? item.requestsCount ?? 1}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  headerRow: {
    marginTop: 24,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    // alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "#b0b0b0",
    marginTop: 4,
  },
  switchRow: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    backgroundColor: "#0f131a",
    alignItems: "center",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonOutline: {
    backgroundColor: "transparent",
  },
  tabActiveFilled: {
    backgroundColor: Colors.primaryBlue,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.lightGrey,
  },
  tabTextActive: {
    color: Colors.bg,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#b0b0b0",
    textAlign: "center",
    marginTop: 50,
  },
  djRow: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.2)",
  },
  djRowGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  djAvatarRing: {
    padding: 2,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.velvet,
    alignItems: "center",
    justifyContent: "center",
  },
  djName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.platinum,
  },
  djMeta: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.gold,
  },
  djNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(57, 243, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(57, 243, 255, 0.4)",
  },
  djNumberText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primaryBlue,
  },
  requestInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#0f131a",
  },
  requestInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "400",
    color: "#fff",
  },
  requestAddButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  requestRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  requestIndex: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.white,
    width: 28,
  },
  requestSong: {
    fontSize: 16,
    fontWeight: "400",
    color: "#fff",
  },
  requestBy: {
    fontSize: 14,
    fontWeight: "400",
    color: "#b0b0b0",
    marginTop: 4,
  },
  requestCountPill: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#444",
  },
  requestCountPillVoted: {
    backgroundColor: Colors.primaryBlue,
  },
  requestCountText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
});
