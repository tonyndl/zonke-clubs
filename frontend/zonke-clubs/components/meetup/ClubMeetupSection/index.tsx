import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { PersonCard } from "../PersonCard";
import {
  MeetupIntention,
  ACTIVITY_CONFIG,
  ActivityType,
  formatPlannedDate,
} from "@/types/meetup";
import { styles } from "./styles";

interface Props {
  clubId: string;
  intentions: MeetupIntention[];
  currentUserId?: string;
  userIntention?: MeetupIntention | null;
  connectionStatuses?: Map<string, { status: string; threadId?: string }>;
  onPostIntention: () => void;
  onConnect: (intention: MeetupIntention) => void;
}

type DateFilter = "all" | "tonight" | "tomorrow" | "later";

// Helper functions
function getDateFilter(dateStr: string): DateFilter {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) return "tonight";
  if (date.getTime() === tomorrow.getTime()) return "tomorrow";
  return "later";
}

const DATE_FILTERS: { key: DateFilter; label: string }[] = [
  { key: "all", label: "All Days" },
  { key: "tonight", label: "Tonight" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "later", label: "Coming Up" },
];

export function ClubMeetupSection({
  clubId,
  intentions,
  currentUserId,
  userIntention,
  connectionStatuses = new Map(),
  onPostIntention,
  onConnect,
}: Props) {
  const [selectedDateFilter, setSelectedDateFilter] =
    useState<DateFilter>("all");
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<
    ActivityType | "all"
  >("all");
  const PREVIEW_LIMIT = 4;

  // Backend already filters out current user's intentions, so we just use all intentions
  const otherIntentions = intentions;

  // Apply date filter
  const dateFilteredIntentions =
    selectedDateFilter === "all"
      ? otherIntentions
      : otherIntentions.filter(
          (i) => getDateFilter(i.plannedDate) === selectedDateFilter,
        );

  // Apply activity filter
  const filteredIntentions =
    selectedActivityFilter === "all"
      ? dateFilteredIntentions
      : dateFilteredIntentions.filter(
          (i) => i.activityType === selectedActivityFilter,
        );

  // Sort by date (tonight first)
  const sortedIntentions = [...filteredIntentions].sort((a, b) => {
    return (
      new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime()
    );
  });

  // Count for each date filter
  const dateCounts = {
    all: otherIntentions.length,
    tonight: otherIntentions.filter(
      (i) => getDateFilter(i.plannedDate) === "tonight",
    ).length,
    tomorrow: otherIntentions.filter(
      (i) => getDateFilter(i.plannedDate) === "tomorrow",
    ).length,
    later: otherIntentions.filter(
      (i) => getDateFilter(i.plannedDate) === "later",
    ).length,
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(50).springify()}
      style={styles.container}
    >
      {/* CTA to post intention */}
      <PressableScale style={styles.postCta} onPress={onPostIntention}>
        <View style={styles.postCtaIcon}>
          {userIntention ? (
            <Text style={{ fontSize: 22 }}>
              {ACTIVITY_CONFIG[userIntention.activityType].emoji}
            </Text>
          ) : (
            <Ionicons name="add" size={24} color={Colors.gold} />
          )}
        </View>
        <View style={styles.postCtaText}>
          <Text style={styles.postCtaTitle}>
            {userIntention
              ? `${ACTIVITY_CONFIG[userIntention.activityType].label}`
              : "When are you planning to visit?"}
          </Text>
          <Text style={styles.postCtaSubtitle}>
            {userIntention
              ? `${formatPlannedDate(userIntention.plannedDate)}${userIntention.plannedTime ? ` · ${userIntention.plannedTime}` : ""} · Tap to update`
              : "Let others know when you want to meet up"}
          </Text>
        </View>
        {userIntention && (
          <Ionicons name="pencil-outline" size={16} color={Colors.smoke} />
        )}
      </PressableScale>

      {/* Date Filter Pills */}
      {otherIntentions.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {DATE_FILTERS.map(({ key, label }) => {
            const isSelected = selectedDateFilter === key;
            const count = dateCounts[key];

            // Hide filters with 0 count (except 'all')
            if (key !== "all" && count === 0) return null;

            return (
              <PressableScale
                key={key}
                style={[
                  styles.dateFilterPill,
                  isSelected && styles.dateFilterPillActive,
                ]}
                onPress={() => setSelectedDateFilter(key)}
              >
                <Ionicons
                  name={
                    key === "tonight"
                      ? "moon"
                      : key === "tomorrow"
                        ? "sunny"
                        : "calendar"
                  }
                  size={14}
                  color={isSelected ? Colors.bg : Colors.smoke}
                />
                <Text
                  style={[
                    styles.filterText,
                    isSelected && styles.filterTextActive,
                  ]}
                >
                  {label}
                </Text>
                {/* <View style={[styles.filterCount, isSelected && styles.filterCountActive]}>
                  <Text style={[styles.filterCountText, isSelected && styles.filterCountTextActive]}>
                    {count}
                  </Text>
                </View> */}
              </PressableScale>
            );
          })}
        </ScrollView>
      )}

      {/* Activity Filter Pills */}
      {dateFilteredIntentions.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.activityFilterContainer}
          contentContainerStyle={styles.filterContent}
        >
          <PressableScale
            style={[
              styles.activityPill,
              selectedActivityFilter === "all" && styles.activityPillActive,
            ]}
            onPress={() => setSelectedActivityFilter("all")}
          >
            <Text
              style={[
                styles.activityPillText,
                selectedActivityFilter === "all" &&
                  styles.activityPillTextActive,
              ]}
            >
              All
            </Text>
          </PressableScale>
          {(
            [
              "dancing_partner",
              "drinking_buddy",
              "new_friends",
              "open_to_anything",
            ] as ActivityType[]
          ).map((type) => {
            const count = dateFilteredIntentions.filter(
              (i) => i.activityType === type,
            ).length;
            if (count === 0) return null;

            const config = ACTIVITY_CONFIG[type];
            const isSelected = selectedActivityFilter === type;

            return (
              <PressableScale
                key={type}
                style={[
                  styles.activityPill,
                  isSelected && styles.activityPillActive,
                ]}
                onPress={() => setSelectedActivityFilter(type)}
              >
                <Text style={styles.filterEmoji}>{config.emoji}</Text>
                <Text
                  style={[
                    styles.activityPillText,
                    isSelected && styles.activityPillTextActive,
                  ]}
                >
                  {config.shortLabel}
                </Text>
              </PressableScale>
            );
          })}
        </ScrollView>
      )}

      {/* People Grid */}
      {sortedIntentions.length > 0 ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.peopleContainer}
            contentContainerStyle={styles.peopleContent}
          >
            {sortedIntentions.slice(0, PREVIEW_LIMIT).map((intention) => {
              const connectionStatus = connectionStatuses.get(
                intention.user.id,
              );
              return (
                <PersonCard
                  key={intention.id}
                  intention={intention}
                  onConnect={() => onConnect(intention)}
                  isOwnIntention={intention.user.id === currentUserId}
                  isRequested={connectionStatus?.status === "pending"}
                  isAccepted={connectionStatus?.status === "accepted"}
                  threadId={connectionStatus?.threadId}
                />
              );
            })}
          </ScrollView>

          {/* View All Button */}
          {
            <Animated.View
              entering={FadeInDown.delay(100).springify()}
              style={styles.viewAllContainer}
            >
              <PressableScale
                style={styles.viewAllButton}
                onPress={() =>
                  router.push(`/people-browse?clubId=${clubId}` as any)
                }
              >
                <View style={styles.viewAllContent}>
                  <View style={styles.viewAllLeft}>
                    <Ionicons name="people" size={18} color={Colors.gold} />
                    <Text style={styles.viewAllText}>View All People</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors.gold}
                  />
                </View>
              </PressableScale>
            </Animated.View>
          }
        </>
      ) : otherIntentions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={40} color={Colors.smoke} />
          <Text style={styles.emptyTitle}>No one here yet</Text>
          <Text style={styles.emptySubtitle}>
            Be the first to let others know you want to meet!
          </Text>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No matches for this filter</Text>
          <Text style={styles.emptySubtitle}>
            Try selecting a different day or activity
          </Text>
        </View>
      )}
    </Animated.View>
  );
}
