import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Image, Pressable } from "react-native";
import Animated, { FadeInDown, FadeIn, FadeOut } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import {
  MeetupIntention,
  ACTIVITY_CONFIG,
  ActivityType,
  formatPlannedDate,
} from "@/types/meetup";
import { LinearGradient } from "expo-linear-gradient";

import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import { Modal } from "../modal";
import { styles } from "./styles";

interface Props {
  // visible: boolean;
  intentions: MeetupIntention[];
  // onClose: () => void;
  onConnect: (intention: MeetupIntention) => void;
  connectionStatuses?: Map<string, { status: string; threadId?: string }>; // Map of user_id to connection status
  currentUserId?: string | null;
  clubName?: string;
  clubId: string;
}

type ViewType = "grid" | "list";

// Helper to get day of week
function getDayOfWeek(dateStr: string): string {
  const date = new Date(dateStr);
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[date.getDay()];
}

export function PeopleBrowse({
  intentions,
  onConnect,
  connectionStatuses,
  currentUserId,
  clubName,
  clubId,
}: Props) {
  const router = useRouter();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const [selectedActivity, setSelectedActivity] = useState<
    ActivityType | "all"
  >("all");
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [showActivityPicker, setShowActivityPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Generate next 7 days for the week
  const availableDates = useMemo(() => {
    const dates: string[] = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Format as YYYY-MM-DD
      const dateStr = date.toISOString().split("T")[0];
      dates.push(dateStr);
    }

    return dates;
  }, []);

  // Filter intentions
  const filteredIntentions = useMemo(() => {
    // Backend already filters out current user, so start with all intentions
    let result = [...intentions];

    // Filter by date
    if (selectedDate !== "all") {
      result = result.filter((i) => i.plannedDate === selectedDate);
    }

    // Filter by activity
    if (selectedActivity !== "all") {
      result = result.filter((i) => i.activityType === selectedActivity);
    }

    // Sort by newest first
    result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return result;
  }, [intentions, selectedDate, selectedActivity]);

  // Activity counts (for current date filter)
  const activityCounts = useMemo(() => {
    const dateFiltered =
      selectedDate === "all"
        ? intentions
        : intentions.filter((i) => i.plannedDate === selectedDate);

    const counts: Record<ActivityType, number> = {
      dancing_partner: 0,
      drinking_buddy: 0,
      new_friends: 0,
      open_to_anything: 0,
    };
    dateFiltered.forEach((i) => {
      counts[i.activityType]++;
    });
    return counts;
  }, [intentions, selectedDate]);

  // Date counts (for current activity filter)
  const dateCounts = useMemo(() => {
    const counts: Record<string, number> = { all: intentions.length };

    // Initialize all dates with 0
    availableDates.forEach((date) => {
      counts[date] = 0;
    });

    const activityFiltered =
      selectedActivity === "all"
        ? intentions
        : intentions.filter((i) => i.activityType === selectedActivity);

    activityFiltered.forEach((i) => {
      if (counts.hasOwnProperty(i.plannedDate)) {
        counts[i.plannedDate]++;
      }
    });

    return counts;
  }, [intentions, selectedActivity, availableDates]);

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <PressableScale
          onPress={() => {
            // Navigate back to the club screen
            router.push(`/club/${clubId}` as any);
          }}
          style={styles.closeButton}
        >
          <Ionicons name="chevron-back" size={28} color={Colors.gold} />
        </PressableScale>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>People Looking to Meet</Text>
          {/* <Text style={styles.headerSubtitle}>
              {filteredIntentions.length} {filteredIntentions.length === 1 ? 'person' : 'people'} available
            </Text> */}
        </View>

        {/* <PressableScale onPress={onClose} style={styles.headerRight}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </PressableScale> */}
      </View>

      {/* Sleek Single-Line Filter Bar */}
      <View style={styles.sleekFilterBar}>
        {/* Date Selector */}
        <PressableScale
          style={styles.dateSelector}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={16} color={Colors.gold} />
          <Text style={styles.dateSelectorText}>
            {selectedDate === "all"
              ? "Any day"
              : formatPlannedDate(selectedDate)}
          </Text>
          <Ionicons name="chevron-down" size={14} color={Colors.lightGrey} />
        </PressableScale>

        {/* Divider */}
        <View style={styles.verticalDivider} />

        {/* Activity Selector */}
        <PressableScale
          style={styles.activitySelector}
          onPress={() => setShowActivityPicker(true)}
        >
          {selectedActivity === "all" ? (
            <>
              <Ionicons name="people-outline" size={16} color={Colors.gold} />
              <Text style={styles.activitySelectorText}>All</Text>
            </>
          ) : (
            <>
              <Text style={styles.activityEmoji}>
                {ACTIVITY_CONFIG[selectedActivity].emoji}
              </Text>
              <Text style={styles.activitySelectorText}>
                {ACTIVITY_CONFIG[selectedActivity].shortLabel}
              </Text>
            </>
          )}
          <Ionicons name="chevron-down" size={14} color={Colors.lightGrey} />
        </PressableScale>

        {/* Spacer */}
        <View style={styles.flexSpacer} />

        {/* Results Count */}
        {/* <Text style={styles.resultCount}>{filteredIntentions.length}</Text> */}

        {/* Divider */}
        <View style={styles.verticalDivider} />

        {/* View Mode Toggle */}
        <PressableScale
          style={styles.viewModeButton}
          onPress={() => setViewType(viewType === "grid" ? "list" : "grid")}
        >
          <Ionicons
            name={viewType === "grid" ? "grid" : "list"}
            size={18}
            color={Colors.platinum}
          />
        </PressableScale>
      </View>

      {/* Compact Date Picker Modal */}
      {showDatePicker && (
        <Modal
          onDismiss={() => setShowDatePicker(false)}
          bgColor={Colors.bgCard}
        >
          {/* <View style={styles.datePickerContent}> */}
          <Text style={styles.datePickerTitle}>Select Date</Text>

          {/* Compact Date Grid */}
          <View style={styles.dateGrid}>
            {/* All Days Option */}
            <PressableScale
              style={[
                styles.dateCard,
                selectedDate === "all" && styles.dateCardActive,
              ]}
              onPress={() => {
                setSelectedDate("all");
                setShowDatePicker(false);
              }}
            >
              <Ionicons
                name="calendar"
                size={20}
                color={selectedDate === "all" ? Colors.bg : Colors.gold}
              />
              <Text
                style={[
                  styles.dateCardLabel,
                  selectedDate === "all" && styles.dateCardLabelActive,
                ]}
              >
                All Days
              </Text>
            </PressableScale>

            {/* Individual Date Cards */}
            {availableDates.map((date, index) => {
              const isSelected = selectedDate === date;
              const dateObj = new Date(date);
              const isToday = index === 0; // First date is today
              const dayOfWeek = isToday
                ? "TODAY"
                : getDayOfWeek(date).slice(0, 3); // Mon, Tue, etc.
              const dayNum = dateObj.getDate();

              return (
                <PressableScale
                  key={date}
                  style={[styles.dateCard, isSelected && styles.dateCardActive]}
                  onPress={() => {
                    setSelectedDate(date);
                    setShowDatePicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dateCardDay,
                      isSelected && styles.dateCardDayActive,
                    ]}
                  >
                    {dayOfWeek}
                  </Text>
                  <Text
                    style={[
                      styles.dateCardNumber,
                      isSelected && styles.dateCardNumberActive,
                    ]}
                  >
                    {dayNum}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
          {/* </View> */}
        </Modal>
      )}

      {/* Activity Picker Modal */}
      {showActivityPicker && (
        <Modal
          onDismiss={() => setShowActivityPicker(false)}
          bgColor={Colors.bgCard}
        >
          {/* <View style={styles.activityPickerContent}> */}
          <Text style={styles.activityPickerTitle}>Select Activity</Text>

          {/* All Activities Option */}
          <PressableScale
            style={[
              styles.activityOption,
              selectedActivity === "all" && styles.activityOptionActive,
            ]}
            onPress={() => {
              setSelectedActivity("all");
              setShowActivityPicker(false);
            }}
          >
            <View style={styles.activityOptionLeft}>
              <View style={styles.activityOptionIcon}>
                <Ionicons name="apps" size={24} color={Colors.gold} />
              </View>
              <View style={styles.activityOptionTextContainer}>
                <Text style={styles.activityOptionLabel} numberOfLines={1}>
                  All Activities
                </Text>
              </View>
            </View>
            {selectedActivity === "all" && (
              <Ionicons name="checkmark-circle" size={24} color={Colors.gold} />
            )}
          </PressableScale>

          {/* Individual Activities */}
          {(
            [
              "dancing_partner",
              "drinking_buddy",
              "new_friends",
              "open_to_anything",
            ] as ActivityType[]
          ).map((type) => {
            const count = activityCounts[type];
            if (count === 0) return null;
            const config = ACTIVITY_CONFIG[type];
            const isSelected = selectedActivity === type;

            return (
              <PressableScale
                key={type}
                style={[
                  styles.activityOption,
                  isSelected && styles.activityOptionActive,
                ]}
                onPress={() => {
                  setSelectedActivity(type);
                  setShowActivityPicker(false);
                }}
              >
                <View style={styles.activityOptionLeft}>
                  <View style={styles.activityOptionIcon}>
                    <Text style={styles.activityOptionEmoji}>
                      {config.emoji}
                    </Text>
                  </View>
                  <View style={styles.activityOptionTextContainer}>
                    <Text style={styles.activityOptionLabel} numberOfLines={1}>
                      {config.label}
                    </Text>
                  </View>
                </View>
                {isSelected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={Colors.gold}
                  />
                )}
              </PressableScale>
            );
          })}
          {/* </View> */}
        </Modal>
      )}

      {/* People Grid/List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredIntentions.length > 0 ? (
          filteredIntentions.map((intention, index) => {
            const connectionStatus = connectionStatuses?.get(intention.user.id);
            return (
              <PersonExpandableCard
                key={intention.id}
                intention={intention}
                index={index}
                isExpanded={expandedCard === intention.id}
                onToggleExpand={() =>
                  setExpandedCard(
                    expandedCard === intention.id ? null : intention.id,
                  )
                }
                onConnect={() => onConnect(intention)}
                onViewProfile={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  // Route to profile tab with userId and clubId parameters
                  router.push(
                    `/(tabs)/profile?userId=${intention.user.id}&clubId=${intention.clubId}` as any,
                  );
                  // router.push({
                  //   pathname: `/(tabs)/profile?userId=${intention.user.id}`,
                  //   params: {
                  //     id: intention.user.id,
                  //     userData: JSON.stringify(intention.user),
                  //   },
                  // });
                }}
                viewType={viewType}
                connectionStatus={connectionStatus?.status}
                threadId={connectionStatus?.threadId}
                clubName={clubName}
              />
            );
          })
        ) : (
          <Animated.View entering={FadeIn} style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={Colors.smoke} />
            <Text style={styles.emptyTitle}>No matches found</Text>
            <Text style={styles.emptySubtitle}>
              Try selecting a different date or activity
            </Text>
            <PressableScale
              style={styles.resetButton}
              onPress={() => {
                setSelectedDate("all");
                setSelectedActivity("all");
              }}
            >
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </PressableScale>
          </Animated.View>
        )}

        {/* End Spacer */}
        <View style={styles.endSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

interface PersonCardProps {
  intention: MeetupIntention;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onConnect: () => void;
  onViewProfile: () => void;
  viewType: ViewType;
  connectionStatus?: string;
  threadId?: string;
  clubName?: string;
}

function PersonExpandableCard({
  intention,
  index,
  isExpanded,
  onToggleExpand,
  onConnect,
  onViewProfile,
  viewType,
  connectionStatus,
  threadId,
  clubName,
}: PersonCardProps) {
  const router = useRouter();
  const config = ACTIVITY_CONFIG[intention.activityType];
  const [imageError, setImageError] = React.useState(false);

  // Calculate time ago
  const getTimeAgo = () => {
    const now = new Date();
    const created = new Date(intention.createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify()}
      style={[styles.card, viewType === "list" && styles.cardList]}
    >
      <Pressable onPress={onViewProfile} style={styles.cardPressable}>
        {/* Background Image or Fallback */}
        {intention.user.avatarUrl && !imageError ? (
          <>
            <Image
              source={{
                uri: intention.user.avatarUrl,
                cache: "force-cache",
              }}
              style={styles.cardImage}
              resizeMode="cover"
              onLoad={() =>
                console.log("Image loaded:", intention.user.avatarUrl)
              }
              onError={(error) => {
                console.error(
                  "Image load error:",
                  error.nativeEvent.error,
                  "URL:",
                  intention.user.avatarUrl,
                );
                setImageError(true);
              }}
            />
            {/* Dark gradient overlay for readability */}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.85)"]}
              style={styles.cardGradient}
            />
          </>
        ) : (
          <View style={[styles.cardImage, styles.avatarFallback]}>
            <Text style={styles.avatarFallbackText}>
              {intention.user.username.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        {/* Dark Gradient Overlay
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.95)']}
          style={styles.cardGradient}
        /> */}

        {/* Activity Badge (Top Left) */}
        {!(viewType === "list" && isExpanded) && (
          <Animated.View
            exiting={FadeOut.duration(200)}
            style={styles.activityBadgeContainer}
          >
            <View style={styles.activityBadge}>
              <Text style={styles.activityBadgeEmoji}>{config.emoji}</Text>
              <Text style={styles.activityLabel}>{config.shortLabel}</Text>
            </View>
          </Animated.View>
        )}

        {/* Time Ago Badge (Top Right) */}
        {/* <View style={styles.timeAgoBadge}>
          <Ionicons name="time-outline" size={12} color={Colors.smoke} />
          <Text style={styles.timeAgoText}>{getTimeAgo()}</Text>
        </View> */}

        {/* Main Content (Bottom) */}
        <View style={styles.cardContent}>
          {/* User Info */}
          <View style={styles.userRow}>
            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{intention.user.username}</Text>
                {/* {intention.user.age && (
                  <View style={styles.ageBadge}>
                    <Text style={styles.ageText}>{intention.user.age}</Text>
                  </View>
                )} */}
              </View>

              {/* Club Name */}
              {(intention.clubName || clubName) && (
                <View style={styles.metaRow}>
                  <Ionicons name="location" size={14} color={Colors.gold} />
                  <Text style={styles.metaText}>
                    {intention.clubName || clubName}
                  </Text>
                </View>
              )}

              {/* Date & Time */}
              <View style={styles.metaRow}>
                <Ionicons name="calendar" size={14} color={Colors.gold} />
                <Text style={styles.metaText}>
                  {formatPlannedDate(intention.plannedDate)}
                </Text>
                {intention.time && (
                  <>
                    <View style={styles.metaDivider} />
                    <Ionicons name="time" size={14} color={Colors.gold} />
                    <Text style={styles.metaText}>{intention.time}</Text>
                  </>
                )}
              </View>
            </View>

            {/* Connect/Chat Button */}
            {connectionStatus === "accepted" && threadId ? (
              <PressableScale
                style={styles.connectButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/chat/${threadId}` as any);
                }}
              >
                <View style={styles.connectGradient}>
                  <Ionicons name="chatbubble" size={18} color={Colors.bg} />
                  <Text style={styles.connectText}>Chat</Text>
                </View>
              </PressableScale>
            ) : connectionStatus === "pending" ? (
              <View style={styles.requestedButton}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={Colors.gold}
                />
                <Text style={styles.requestedText}>Requested</Text>
              </View>
            ) : (
              <PressableScale style={styles.connectButton} onPress={onConnect}>
                <View style={styles.connectGradient}>
                  <Ionicons name="flash" size={18} color={Colors.bg} />
                  <Text style={styles.connectText}>Connect</Text>
                </View>
              </PressableScale>
            )}
          </View>

          {/* Message Preview */}
          {intention.message && (viewType === "grid" || isExpanded) && (
            <Animated.View entering={FadeIn} style={styles.messagePreview}>
              <Ionicons name="chatbubble" size={12} color={Colors.gold} />
              <Text
                style={styles.messageText}
                numberOfLines={isExpanded ? undefined : 2}
              >
                "{intention.message}"
              </Text>
            </Animated.View>
          )}

          {/* Expanded Bio */}
          {isExpanded && intention.user.bio && (
            <Animated.View
              entering={FadeIn.duration(300)}
              style={styles.bioSection}
            >
              <View style={styles.bioHeader}>
                <Ionicons name="person" size={14} color={Colors.gold} />
                <Text style={styles.bioLabel}>Bio</Text>
              </View>
              <Text style={styles.bioText}>{intention.user.bio}</Text>
            </Animated.View>
          )}

          {/* Expand Indicator */}
          {(intention.message || intention.user.bio) && (
            <PressableScale
              onPress={onToggleExpand}
              style={styles.expandIndicator}
            >
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={16}
                color={Colors.white}
              />
              <Text style={styles.expandText}>
                {isExpanded ? "Show less" : "Show more"}
              </Text>
            </PressableScale>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}
