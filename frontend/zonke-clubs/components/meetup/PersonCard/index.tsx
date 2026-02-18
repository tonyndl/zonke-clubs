import React from "react";
import { View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import {
  MeetupIntention,
  ACTIVITY_CONFIG,
  formatPlannedDate,
} from "@/types/meetup";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { styles } from "./styles";

interface Props {
  intention: MeetupIntention;
  onConnect: () => void;
  isOwnIntention?: boolean;
  isRequested?: boolean;
  isAccepted?: boolean;
  threadId?: string;
}

export function PersonCard({
  intention,
  onConnect,
  isOwnIntention = false,
  isRequested = false,
  isAccepted = false,
  threadId,
}: Props) {
  const activity = ACTIVITY_CONFIG[intention.activityType];
  const displayName = intention.user.username;
  const plannedDateText = formatPlannedDate(intention.plannedDate);

  const handleCardPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (isRequested) {
      // Navigate to requests tab if already requested
      router.push("/(tabs)/requests");
    } else if (isAccepted && threadId) {
      // Navigate to chat if accepted
      router.push(`/chat/${threadId}` as any);
    } else {
      // Route to profile tab with userId and clubId parameters
      router.push(
        `/(tabs)/profile?userId=${intention.user.id}&clubId=${intention.clubId}` as any,
      );
    }
  };

  const handleChatPress = (e: any) => {
    e?.stopPropagation?.();
    if (threadId) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(`/chat/${threadId}` as any);
    }
  };

  return (
    <PressableScale onPress={handleCardPress} style={styles.card}>
      {/* Date Badge - Prominent at top */}
      <View style={styles.dateBadge}>
        <Ionicons name="calendar-outline" size={12} color={Colors.gold} />
        <Text style={styles.dateText}>{plannedDateText}</Text>
      </View>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { borderColor: activity.color }]}>
          {intention.user.avatarUrl ? (
            <Image
              source={{ uri: intention.user.avatarUrl }}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.avatarInitial}>
              {intention.user.username.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
      </View>

      {/* Name */}
      <Text style={styles.name} numberOfLines={1}>
        {displayName}
      </Text>

      {/* Activity */}
      <View style={styles.activityRow}>
        <Text style={styles.emoji}>{activity.emoji}</Text>
        <Text style={styles.activityText}>{activity.shortLabel}</Text>
      </View>

      {/* Message preview */}
      {intention.message && (
        <Text style={styles.message} numberOfLines={2}>
          &ldquo;{intention.message}&rdquo;
        </Text>
      )}

      {/* Connect/Chat/Requested button */}
      {!isOwnIntention && !isRequested && !isAccepted && (
        <PressableScale
          style={styles.connectButton}
          onPress={(e) => {
            e?.stopPropagation?.();
            onConnect();
          }}
        >
          <Ionicons name="person-add-outline" size={14} color={Colors.bg} />
          <Text style={styles.connectText}>Connect</Text>
        </PressableScale>
      )}

      {!isOwnIntention && isAccepted && threadId && (
        <PressableScale style={styles.chatButton} onPress={handleChatPress}>
          <Ionicons name="chatbubble-outline" size={14} color={Colors.bg} />
          <Text style={styles.chatText}>Chat</Text>
        </PressableScale>
      )}

      {!isOwnIntention && isRequested && !isAccepted && (
        <View style={styles.requestedBadge}>
          <View style={styles.requestedIconContainer}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.gold} />
          </View>
          <Text style={styles.requestedText}>Requested</Text>
        </View>
      )}

      {isOwnIntention && (
        <View style={styles.youBadge}>
          <Text style={styles.youText}>You</Text>
        </View>
      )}
    </PressableScale>
  );
}
