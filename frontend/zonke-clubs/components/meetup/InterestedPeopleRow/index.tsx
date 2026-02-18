import React from "react";
import { View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { MeetupIntention, ACTIVITY_CONFIG } from "@/types/meetup";
import { styles } from "./styles";

interface Props {
  intentions: MeetupIntention[];
  onPress?: () => void;
}

const MAX_AVATARS = 4;

// Helper to check if date is today
function isTonight(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return date.getTime() === today.getTime();
}

export function InterestedPeopleRow({ intentions, onPress }: Props) {
  if (intentions.length === 0) {
    return null;
  }

  // Prioritize showing people going tonight
  const sortedIntentions = [...intentions].sort((a, b) => {
    const aTonight = isTonight(a.plannedDate) ? 0 : 1;
    const bTonight = isTonight(b.plannedDate) ? 0 : 1;
    return aTonight - bTonight;
  });

  // Show first 3 avatars, then a "+" as 4th if there are more
  const displayedIntentions = sortedIntentions.slice(0, 3);
  const hasMore = intentions.length > 3;

  // Get unique activity types for icons
  const activityTypes = [...new Set(intentions.map((i) => i.activityType))];

  return (
    <PressableScale style={styles.container} onPress={onPress}>
      <View style={styles.avatarsContainer}>
        {displayedIntentions.map((intention, index) => (
          <View
            key={intention.id}
            style={[
              styles.avatarWrapper,
              { marginLeft: index > 0 ? -10 : 0, zIndex: 3 - index },
            ]}
          >
            <View style={styles.avatar}>
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
        ))}

        {/* Show + indicator if there are more people */}
        {hasMore && (
          <View style={[styles.avatarWrapper, { marginLeft: -10, zIndex: 0 }]}>
            <View style={styles.avatar}>
              <Ionicons name="add" size={16} color={Colors.gold} />
            </View>
          </View>
        )}
      </View>

      <View style={styles.textContainer}>
        <View style={styles.textLeft}>
          <Text style={styles.lookingText}>People looking to meet</Text>
        </View>
        <View style={styles.activityIcons}>
          {activityTypes.slice(0, 3).map((type) => (
            <Text key={type} style={styles.emoji}>
              {ACTIVITY_CONFIG[type].emoji}
            </Text>
          ))}
        </View>
      </View>
    </PressableScale>
  );
}
