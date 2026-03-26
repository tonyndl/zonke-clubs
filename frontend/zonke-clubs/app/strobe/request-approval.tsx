import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/ui";
import { clubsService, type Club } from "@/services/clubsService";
import { strobeService, type StrobeApproval } from "@/services/strobeService";

export default function RequestApprovalScreen() {
  const router = useRouter();

  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [requesting, setRequesting] = useState<string | null>(null);
  const [requested, setRequested] = useState<Set<string>>(new Set());
  const [approvedClubIds, setApprovedClubIds] = useState<Set<string>>(
    new Set(),
  );
  const [pendingClubIds, setPendingClubIds] = useState<Set<string>>(new Set());
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    loadClubs();
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadClubs = () => {
    setLoading(true);
    Promise.all([
      clubsService.getClubs(true, 1, 50),
      strobeService.getMyApprovals(),
    ])
      .then(([clubsRes, approvals]) => {
        if (!isMountedRef.current) return;
        setClubs(clubsRes.clubs || []);
        const approved = new Set<string>();
        const pending = new Set<string>();
        approvals.forEach((a) => {
          if (a.status === "approved") approved.add(a.club_id);
          else if (a.status === "pending") pending.add(a.club_id);
        });
        setApprovedClubIds(approved);
        setPendingClubIds(pending);
      })
      .catch((err) => console.error("Failed to load clubs", err))
      .finally(() => {
        if (isMountedRef.current) setLoading(false);
      });
  };

  const handleRequest = (club: Club) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRequesting(club.id);

    strobeService
      .requestApproval(club.id)
      .then(() => {
        if (!isMountedRef.current) return;
        setRequested((prev) => new Set([...prev, club.id]));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      })
      .catch((err) => {
        console.error("Failed to request approval", err);
        if (!isMountedRef.current) return;
        Alert.alert("Error", "Could not send request. Please try again.");
      })
      .finally(() => {
        if (isMountedRef.current) setRequesting(null);
      });
  };

  const filteredClubs = clubs.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.platinum} />
        </Pressable>
        <Text style={styles.headerTitle}>REQUEST APPROVAL</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Info banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={18} color={Colors.accent} />
        <Text style={styles.infoText}>
          Select the club you're performing at. A club admin will approve your
          request — approvals last 24 hours.
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={Colors.smoke} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search clubs..."
          placeholderTextColor={Colors.smoke}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={Colors.smoke} />
          </Pressable>
        )}
      </View>

      {loading ? (
        <ActivityIndicator
          color={Colors.accent}
          style={{ marginTop: 40 }}
          size="large"
        />
      ) : (
        <FlatList
          data={filteredClubs}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="business" size={40} color={Colors.smoke} />
              <Text style={styles.emptyText}>No clubs found</Text>
            </View>
          }
          renderItem={({ item: club }) => {
            const isRequesting = requesting === club.id;
            const isSentNow = requested.has(club.id);
            const isApproved = approvedClubIds.has(club.id);
            const isPending = pendingClubIds.has(club.id) || isSentNow;
            const isDisabled = isApproved || isPending || isRequesting;

            return (
              <View style={styles.clubCard}>
                <View style={styles.clubInfo}>
                  <Text style={styles.clubName}>{club.name}</Text>
                  {club.location?.name ? (
                    <Text style={styles.clubLocation}>
                      <Ionicons
                        name="location"
                        size={11}
                        color={Colors.smoke}
                      />{" "}
                      {club.location.name}
                    </Text>
                  ) : null}
                </View>

                <Pressable
                  style={[
                    styles.requestBtn,
                    isApproved && styles.requestBtnApproved,
                    isPending && !isApproved && styles.requestBtnDone,
                    isRequesting && styles.requestBtnLoading,
                  ]}
                  onPress={() => !isDisabled && handleRequest(club)}
                  disabled={isDisabled}
                >
                  {isRequesting ? (
                    <ActivityIndicator size="small" color={Colors.accent} />
                  ) : isApproved ? (
                    <>
                      <Ionicons
                        name="shield-checkmark"
                        size={14}
                        color="#00C853"
                      />
                      <Text
                        style={[styles.requestBtnText, { color: "#00C853" }]}
                      >
                        APPROVED
                      </Text>
                    </>
                  ) : isPending ? (
                    <>
                      <Ionicons name="time" size={14} color={Colors.accent} />
                      <Text
                        style={[
                          styles.requestBtnText,
                          { color: Colors.accent },
                        ]}
                      >
                        PENDING
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="send" size={14} color="#000" />
                      <Text style={styles.requestBtnText}>REQUEST</Text>
                    </>
                  )}
                </Pressable>
              </View>
            );
          }}
        />
      )}

      {/* Done button once at least one request sent */}
      {requested.size > 0 && (
        <View style={styles.footer}>
          <Pressable style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>DONE — WAITING FOR APPROVAL</Text>
          </Pressable>
        </View>
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
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.platinum,
    letterSpacing: 3,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "rgba(57,243,255,0.08)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.2)",
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.smoke,
    lineHeight: 18,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.platinum,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  clubCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  clubInfo: {
    flex: 1,
    gap: 3,
  },
  clubName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.platinum,
  },
  clubLocation: {
    fontSize: 11,
    color: Colors.smoke,
  },
  requestBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    minWidth: 90,
    justifyContent: "center",
  },
  requestBtnApproved: {
    backgroundColor: "rgba(0,200,83,0.1)",
    borderWidth: 1,
    borderColor: "#00C853",
  },
  requestBtnDone: {
    backgroundColor: "rgba(57,243,255,0.1)",
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  requestBtnLoading: {
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  requestBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#000",
    letterSpacing: 1,
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.smoke,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 36,
    backgroundColor: Colors.bg,
  },
  doneBtn: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.accent,
    letterSpacing: 1.5,
  },
});
