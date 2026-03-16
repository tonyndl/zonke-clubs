import React, { useState, useEffect } from "react";
import { View, Text, Image, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "expo-router";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { Toast } from "@/components/ui/Toast";
import * as Haptics from "expo-haptics";
import { StyleSheet } from "react-native";
import { userService } from "@/services/userService";
import { connectionService } from "@/services/connectionService";
import { User } from "@/services/authService";
import { TextStroke } from "../_screens/Login/utils";

const VIBE_OPTIONS = [
  { emoji: "💃", name: "Dancing" },
  { emoji: "🎉", name: "High Energy" },
  { emoji: "✨", name: "VIP Lounges" },
  { emoji: "🎵", name: "Live Music" },
  { emoji: "🍸", name: "Cocktail Bars" },
  { emoji: "🌆", name: "Rooftop" },
];

export default function ViewProfileScreen() {
  const { id, clubId } = useLocalSearchParams<{
    id: string;
    clubId?: string;
  }>();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isRequestSending, setIsRequestSending] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [connectionAccepted, setConnectionAccepted] = useState(false);
  const [chatThreadId, setChatThreadId] = useState<string | undefined>(
    undefined,
  );
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "success",
  );

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    userService
      .getUserById(id)
      .then((fetchedUser) => {
        setUser(fetchedUser);
      })
      .catch(() => {
        setError("Failed to load profile");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  useFocusEffect(
    React.useCallback(() => {
      if (!id) return;
      Promise.all([
        connectionService.getSentRequests(),
        connectionService.getReceivedRequests(),
      ])
        .then(([sentResponse, receivedResponse]) => {
          const sentRequest = sentResponse.requests.find(
            (req: any) => req.receiver.id === id,
          );
          const receivedRequest = receivedResponse.requests.find(
            (req: any) => req.sender.id === id,
          );
          const request = sentRequest || receivedRequest;
          if (request) {
            if (request.status === "accepted" && request.threadId) {
              setConnectionAccepted(true);
              setChatThreadId(request.threadId);
              setRequestSent(false);
            } else {
              setRequestSent(true);
              setConnectionAccepted(false);
              setChatThreadId(undefined);
            }
          } else {
            setRequestSent(false);
            setConnectionAccepted(false);
            setChatThreadId(undefined);
          }
        })
        .catch(() => {});
    }, [id]),
  );

  const handleSendConnectionRequest = () => {
    if (requestSent || !id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRequestSending(true);
    connectionService
      .createRequest({
        receiver_id: id,
        message: undefined,
        club_id: clubId || "3f1b5bd3-a899-44c1-bfda-ee83f940accb",
      })
      .then(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setRequestSent(true);
        setToastMessage("Request sent!");
        setToastType("success");
        setToastVisible(true);
      })
      .catch(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setToastMessage("Failed to send request");
        setToastType("error");
        setToastVisible(true);
      })
      .finally(() => {
        setIsRequestSending(false);
      });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.gold} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centered}>
          <Ionicons
            name="person-circle-outline"
            size={80}
            color={Colors.smoke}
          />
          <Text style={styles.errorText}>{error || "User not found"}</Text>
          <PressableScale onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </PressableScale>
        </View>
      </SafeAreaView>
    );
  }

  const vibes: string[] = (user as any).vibes || [];
  const favoriteDrinks: string[] = (user as any).favorite_drinks || [];
  const bio: string = user.bio || "";
  const location = user.location;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <Animated.View entering={FadeInUp.springify()} style={styles.header}>
        <PressableScale
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push("/(tabs)" as any);
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color={Colors.gold} />
        </PressableScale>
        <TextStroke stroke={0.6} color={Colors.gold}>
          <Text style={styles.headerTitle}>Profile</Text>
        </TextStroke>
        <View style={{ width: 44 }} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar & Name */}
        <Animated.View
          entering={FadeInUp.delay(50).springify()}
          style={styles.profileSection}
        >
          <View style={styles.avatarRing}>
            {user.avatar_url ? (
              <Image
                source={{ uri: user.avatar_url }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={48} color={Colors.lightGrey} />
              </View>
            )}
          </View>
          <Text style={styles.userName}>{user.username}</Text>
          {location && (
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={Colors.gold} />
              <Text style={styles.locationText}>{location.name}</Text>
            </View>
          )}
        </Animated.View>

        {/* Connection Button */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.connectSection}
        >
          {connectionAccepted && chatThreadId ? (
            <PressableScale
              style={[styles.connectButton, styles.chatButton]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/chat/${chatThreadId}` as any);
              }}
            >
              <Ionicons name="chatbubble" size={20} color={Colors.white} />
              <Text style={styles.chatButtonText}>Chat</Text>
            </PressableScale>
          ) : requestSent ? (
            <PressableScale
              style={[styles.connectButton, styles.requestedButton]}
              disabled={true}
            >
              <Ionicons name="checkmark-circle" size={20} color={Colors.gold} />
              <Text style={styles.requestedText}>Requested</Text>
            </PressableScale>
          ) : (
            <PressableScale
              style={styles.connectButton}
              onPress={handleSendConnectionRequest}
              disabled={isRequestSending}
            >
              <Ionicons name="person-add" size={20} color={Colors.bg} />
              <Text style={styles.connectButtonText}>
                {isRequestSending ? "Sending..." : "Send Connection Request"}
              </Text>
            </PressableScale>
          )}
        </Animated.View>

        {/* Bio */}
        {bio ? (
          <Animated.View
            entering={FadeInDown.delay(150).springify()}
            style={styles.section}
          >
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person" size={18} color={Colors.gold} />
                <Text style={styles.sectionTitle}>Bio</Text>
              </View>
              <Text style={styles.bioText}>{bio}</Text>
            </View>
          </Animated.View>
        ) : null}

        {/* Favorite Drinks */}
        {favoriteDrinks.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={styles.section}
          >
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="wine" size={18} color={Colors.gold} />
                <Text style={styles.sectionTitle}>Favorite Drinks</Text>
              </View>
              <View style={styles.chipsRow}>
                {favoriteDrinks.map((drink) => (
                  <View key={drink} style={styles.chip}>
                    <Text style={styles.chipEmoji}>🥃</Text>
                    <Text style={styles.chipText}>{drink}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Vibes */}
        {vibes.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(250).springify()}
            style={styles.section}
          >
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="flash" size={18} color={Colors.gold} />
                <Text style={styles.sectionTitle}>My Vibe</Text>
              </View>
              <View style={styles.chipsRow}>
                {VIBE_OPTIONS.filter((v) => vibes.includes(v.name)).map(
                  (vibe) => (
                    <View key={vibe.name} style={styles.vibeChip}>
                      <Text style={styles.chipEmoji}>{vibe.emoji}</Text>
                      <Text style={styles.vibeChipText}>{vibe.name}</Text>
                    </View>
                  ),
                )}
              </View>
            </View>
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <Toast
        message={toastMessage}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
        type={toastType}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f1a",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  errorText: {
    color: "#9ca3af",
    fontSize: 16,
    textAlign: "center",
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#1a2035",
    borderRadius: 12,
  },
  backBtnText: {
    color: Colors.gold,
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 1.4,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  profileSection: {
    alignItems: "center",
    paddingBottom: 24,
    gap: 12,
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.gold,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a2035",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.white,
    letterSpacing: 0.5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    color: "#9ca3af",
    fontSize: 14,
  },
  connectSection: {
    marginBottom: 20,
  },
  connectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.gold,
  },
  connectButtonText: {
    color: "#0b0f1a",
    fontSize: 16,
    fontWeight: "700",
  },
  chatButton: {
    backgroundColor: "#1a2035",
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  chatButtonText: {
    color: Colors.gold,
    fontSize: 16,
    fontWeight: "700",
  },
  requestedButton: {
    backgroundColor: "#1a2035",
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  requestedText: {
    color: Colors.gold,
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
    letterSpacing: 0.5,
  },
  bioText: {
    color: "#d1d5db",
    fontSize: 15,
    lineHeight: 22,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1a2035",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipText: {
    color: "#d1d5db",
    fontSize: 14,
    fontWeight: "500",
  },
  vibeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.gold + "22",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gold + "44",
  },
  vibeChipText: {
    color: Colors.gold,
    fontSize: 14,
    fontWeight: "500",
  },
  lightGrey: {
    color: "#9ca3af",
  },
});
