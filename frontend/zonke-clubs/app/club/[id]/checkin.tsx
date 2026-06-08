import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Switch,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { checkinService, OpenUser } from "@/services/checkinService";
import { connectionService } from "@/services/connectionService";
import { clubsService } from "@/services/clubsService";
import { Toast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CheckinScreen() {
  const { id: clubId } = useLocalSearchParams<{ id: string }>();

  const [clubName, setClubName] = useState<string>("");
  const [clubBanner, setClubBanner] = useState<string | undefined>(undefined);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [togglingOpen, setTogglingOpen] = useState(false);
  const [openUsers, setOpenUsers] = useState<OpenUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [connectingTo, setConnectingTo] = useState<string | null>(null);
  const [connectionStatuses, setConnectionStatuses] = useState<
    Record<string, "pending" | "accepted" | "none">
  >({});
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "success",
  );

  const showToast = (msg: string, type: "success" | "error" | "info") => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  // Load club info
  useEffect(() => {
    if (!clubId) return;
    clubsService
      .getClub(clubId)
      .then(({ club }) => {
        setClubName(club.name);
        setClubBanner(club.banner_image_url ?? undefined);
      })
      .catch(() => {});
  }, [clubId]);

  // Load my check-in status + connection statuses
  const loadStatus = useCallback(() => {
    if (!clubId) return;
    setLoading(true);
    checkinService
      .getMyCheckin(clubId)
      .then(({ checkin }) => {
        setIsCheckedIn(!!checkin);
        setIsOpen(checkin?.is_open ?? true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    Promise.all([
      connectionService.getSentRequests(),
      connectionService.getReceivedRequests(),
    ])
      .then(([sent, received]) => {
        const map: Record<string, "pending" | "accepted"> = {};
        sent.requests.forEach((r) => {
          map[r.receiver.id] = r.status === "accepted" ? "accepted" : "pending";
        });
        received.requests.forEach((r) => {
          map[r.sender.id] = r.status === "accepted" ? "accepted" : "pending";
        });
        setConnectionStatuses(map);
      })
      .catch(() => {});
  }, [clubId]);

  const loadOpenUsers = useCallback(() => {
    if (!clubId || !isCheckedIn) return;
    setLoadingUsers(true);
    checkinService
      .getOpenUsers(clubId)
      .then(({ users }) => setOpenUsers(users))
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  }, [clubId, isCheckedIn]);

  useFocusEffect(
    useCallback(() => {
      loadStatus();
    }, [loadStatus]),
  );

  useEffect(() => {
    loadOpenUsers();
  }, [loadOpenUsers]);

  const handleCheckin = () => {
    if (!clubId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    checkinService
      .checkin(clubId)
      .then(({ checkin }) => {
        setIsCheckedIn(true);
        setIsOpen(checkin.is_open);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast(`Checked in to ${clubName}!`, "success");
        loadOpenUsers();
      })
      .catch(() => showToast("Failed to check in", "error"));
  };

  const handleCheckout = () => {
    if (!clubId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    checkinService
      .checkout(clubId)
      .then(() => {
        setIsCheckedIn(false);
        setOpenUsers([]);
        showToast("Checked out", "info");
      })
      .catch(() => showToast("Failed to check out", "error"));
  };

  const handleToggleOpen = (val: boolean) => {
    if (!clubId) return;
    setIsOpen(val);
    setTogglingOpen(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    checkinService
      .setOpen(clubId, val)
      .then(() => {
        if (val) loadOpenUsers();
        else setOpenUsers([]);
      })
      .catch(() => setIsOpen(!val))
      .finally(() => setTogglingOpen(false));
  };

  const handleConnect = (userId: string) => {
    setConnectingTo(userId);
    connectionService
      .createRequest({ receiver_id: userId, club_id: clubId })
      .then(() => {
        setConnectionStatuses((prev) => ({ ...prev, [userId]: "pending" }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast("Connection request sent!", "success");
      })
      .catch(() => showToast("Failed to send request", "error"))
      .finally(() => setConnectingTo(null));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ActivityIndicator
          size="large"
          color={Colors.gold}
          style={{ flex: 1 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <Animated.View entering={FadeInUp.springify()} style={styles.header}>
        <PressableScale onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={Colors.gold} />
        </PressableScale>
        <Text style={styles.headerTitle}>Club Check-In</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Club banner + name */}
        <Animated.View
          entering={FadeInDown.delay(50).springify()}
          style={styles.clubCard}
        >
          {clubBanner ? (
            <Image source={{ uri: clubBanner }} style={styles.clubBanner} />
          ) : (
            <View style={[styles.clubBanner, styles.clubBannerPlaceholder]}>
              <Ionicons name="storefront" size={40} color={Colors.smoke} />
            </View>
          )}
          <View style={styles.clubOverlay}>
            <Text style={styles.clubName}>{clubName}</Text>
          </View>
        </Animated.View>

        {/* Check-in status card */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.card}
        >
          {isCheckedIn ? (
            <>
              <View style={styles.checkedInRow}>
                <View style={styles.checkedInBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                  <Text style={styles.checkedInText}>Checked In</Text>
                </View>
                <TouchableOpacity
                  onPress={handleCheckout}
                  style={styles.checkoutBtn}
                >
                  <Text style={styles.checkoutBtnText}>Leave</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <View style={styles.openRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.openLabel}>Open to meet people</Text>
                  <Text style={styles.openSub}>
                    Let others at this club see you and connect
                  </Text>
                </View>
                <Switch
                  value={isOpen}
                  onValueChange={handleToggleOpen}
                  disabled={togglingOpen}
                  trackColor={{
                    false: Colors.bgCard,
                    true: Colors.primaryBlue,
                  }}
                  thumbColor={Colors.white}
                />
              </View>
            </>
          ) : (
            <View style={{ alignItems: "center", gap: 12 }}>
              <Ionicons name="qr-code-outline" size={48} color={Colors.smoke} />
              <Text style={styles.notCheckedInText}>
                Scan the QR code on your wristband to check in
              </Text>
              <PressableScale style={styles.checkinBtn} onPress={handleCheckin}>
                <Ionicons name="log-in-outline" size={20} color={Colors.bg} />
                <Text style={styles.checkinBtnText}>Check In Now</Text>
              </PressableScale>
            </View>
          )}
        </Animated.View>

        {/* Open users list */}
        {isCheckedIn && isOpen && (
          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people" size={18} color={Colors.gold} />
              <Text style={styles.sectionTitle}>
                {openUsers.length > 0
                  ? `${openUsers.length} Open to Meet`
                  : "Open to Meet"}
              </Text>
            </View>

            {loadingUsers ? (
              <ActivityIndicator
                color={Colors.gold}
                style={{ marginTop: 24 }}
              />
            ) : openUsers.length === 0 ? (
              <EmptyState
                icon="people-outline"
                title="No one yet"
                subtitle="Be the first to check in and open up — others will appear here"
                style={{ paddingVertical: 40 }}
              />
            ) : (
              openUsers.map((entry) => {
                const status = connectionStatuses[entry.user.id] ?? "none";
                return (
                  <Animated.View
                    key={entry.checkin_id}
                    entering={FadeInDown.springify()}
                    style={styles.userCard}
                  >
                    <PressableScale
                      onPress={() =>
                        router.push(`/profile/${entry.user.id}` as any)
                      }
                    >
                      <Image
                        source={{ uri: entry.user.avatar_url || undefined }}
                        style={styles.avatar}
                      />
                    </PressableScale>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.username}>{entry.user.username}</Text>
                      {!!entry.user.bio && (
                        <Text style={styles.bio} numberOfLines={1}>
                          {entry.user.bio}
                        </Text>
                      )}
                    </View>

                    {status === "accepted" ? (
                      <PressableScale
                        style={[styles.connectBtn, styles.connectBtnAccepted]}
                        onPress={() => router.push("/(tabs)/chats" as any)}
                      >
                        <Ionicons
                          name="chatbubble-outline"
                          size={14}
                          color={Colors.bg}
                        />
                        <Text style={styles.connectBtnText}>Chat</Text>
                      </PressableScale>
                    ) : status === "pending" ? (
                      <View
                        style={[styles.connectBtn, styles.connectBtnPending]}
                      >
                        <Text
                          style={[
                            styles.connectBtnText,
                            { color: Colors.smoke },
                          ]}
                        >
                          Pending
                        </Text>
                      </View>
                    ) : (
                      <PressableScale
                        style={styles.connectBtn}
                        onPress={() => handleConnect(entry.user.id)}
                        disabled={connectingTo === entry.user.id}
                      >
                        {connectingTo === entry.user.id ? (
                          <ActivityIndicator size="small" color={Colors.bg} />
                        ) : (
                          <>
                            <Ionicons
                              name="person-add-outline"
                              size={14}
                              color={Colors.bg}
                            />
                            <Text style={styles.connectBtnText}>Connect</Text>
                          </>
                        )}
                      </PressableScale>
                    )}
                  </Animated.View>
                );
              })
            )}
          </Animated.View>
        )}
      </ScrollView>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: Colors.gold,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40, gap: 16 },
  clubCard: {
    borderRadius: 20,
    overflow: "hidden",
    height: 160,
    backgroundColor: Colors.bgCard,
  },
  clubBanner: { width: "100%", height: "100%" },
  clubBannerPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.bgCard,
  },
  clubOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(8,8,13,0.6)",
  },
  clubName: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.1)",
    gap: 12,
  },
  checkedInRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  checkedInBadge: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkedInText: { color: "#22c55e", fontSize: 16, fontWeight: "700" },
  checkoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  checkoutBtnText: { color: Colors.smoke, fontSize: 13, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.06)" },
  openRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  openLabel: { color: Colors.white, fontSize: 15, fontWeight: "600" },
  openSub: { color: Colors.smoke, fontSize: 12, marginTop: 2 },
  notCheckedInText: {
    color: Colors.smoke,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  checkinBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primaryBlue,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  checkinBtnText: { color: Colors.bg, fontSize: 16, fontWeight: "700" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: { color: Colors.platinum, fontSize: 17, fontWeight: "700" },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(57,243,255,0.08)",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.bgCard,
  },
  username: { color: Colors.white, fontSize: 15, fontWeight: "700" },
  bio: { color: Colors.smoke, fontSize: 12, marginTop: 2 },
  connectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.primaryBlue,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  connectBtnAccepted: { backgroundColor: Colors.gold },
  connectBtnPending: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.smoke,
  },
  connectBtnText: { color: Colors.bg, fontSize: 12, fontWeight: "700" },
});
