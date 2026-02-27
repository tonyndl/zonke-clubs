import React, { useState } from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { Modal } from "@/components/modal";
import { CalendarModal } from "@/components/ui/CalendarModal";
import { ActivityType, ACTIVITY_CONFIG, MeetupIntention } from "@/types/meetup";
import { styles } from "./styles";

interface Props {
  visible: boolean;
  clubName: string;
  existingIntention?: MeetupIntention;
  fixedDate?: string; // When provided, locks the date and hides date selection
  onClose: () => void;
  onSubmit: (
    activityType: ActivityType,
    plannedDate: string,
    message?: string,
  ) => void;
  onRemove?: () => void;
}

const ACTIVITIES: ActivityType[] = [
  "dancing_partner",
  "drinking_buddy",
  "new_friends",
  "open_to_anything",
];

// Get date string in YYYY-MM-DD format
const getDateString = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split("T")[0];
};

// Generate date options for the next 7 days
const generateDateOptions = () => {
  const options: { value: string; label: string; icon: string }[] = [];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    let label: string;
    let icon: string;

    if (i === 0) {
      label = "Tonight";
      icon = "today";
    } else if (i === 1) {
      label = "Tomorrow";
      icon = "sunny";
    } else {
      label = `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
      icon = "calendar";
    }

    options.push({ value: dateStr, label, icon });
  }

  return options;
};

export function PostIntentionModal({
  visible,
  clubName,
  existingIntention,
  fixedDate,
  onClose,
  onSubmit,
  onRemove,
}: Props) {
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(
    existingIntention?.activityType || null,
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    fixedDate || existingIntention?.plannedDate || getDateString(0),
  );
  const [message, setMessage] = useState<string>(
    existingIntention?.message || "",
  );
  const [showCalendar, setShowCalendar] = useState(false);

  const dateOptions = generateDateOptions();

  const handleSubmit = () => {
    if (!selectedActivity) return;
    onSubmit(selectedActivity, selectedDate, message || undefined);
    handleClose();
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    }
    handleClose();
  };

  const handleClose = () => {
    onClose();
    // Reset form after animation
    setTimeout(resetForm, 300);
  };

  const resetForm = () => {
    setSelectedActivity(existingIntention?.activityType || null);
    setSelectedDate(existingIntention?.plannedDate || getDateString(0));
    setMessage(existingIntention?.message || "");
  };

  if (!visible) return null;

  return (
    <Modal onDismiss={handleClose} sliding bgColor={Colors.bgCard}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {existingIntention ? "Edit Your Status" : "What are you looking for?"}
        </Text>
        <Text style={styles.subtitle}>at {clubName}</Text>
      </View>

      {/* Activity Options */}
      <View style={styles.activitiesGrid}>
        {ACTIVITIES.map((activity) => {
          const config = ACTIVITY_CONFIG[activity];
          const isSelected = selectedActivity === activity;

          return (
            <PressableScale
              key={activity}
              style={[
                styles.activityCard,
                isSelected && styles.activityCardSelected,
              ]}
              onPress={() => setSelectedActivity(activity)}
            >
              <Text style={styles.activityEmoji}>{config.emoji}</Text>
              <Text
                style={[
                  styles.activityLabel,
                  isSelected && styles.activityLabelSelected,
                ]}
              >
                {config.shortLabel}
              </Text>
              {isSelected && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark" size={14} color={Colors.bg} />
                </View>
              )}
            </PressableScale>
          );
        })}
      </View>

      {/* Date Selection — hidden when a fixed event date is provided */}
      {!fixedDate && (
        <View style={styles.dateSection}>
          <Text style={styles.sectionLabel}>When are you going?</Text>
          <ScrollView
            horizontal
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateOptionsContainer}
          >
            {dateOptions.map((option) => {
              const isSelected = selectedDate === option.value;
              return (
                <PressableScale
                  key={option.value}
                  style={[
                    styles.dateOption,
                    isSelected && styles.dateOptionSelected,
                  ]}
                  onPress={() => setSelectedDate(option.value)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={16}
                    color={isSelected ? Colors.bg : Colors.smoke}
                  />
                  <Text
                    style={[
                      styles.dateOptionText,
                      isSelected && styles.dateOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </PressableScale>
              );
            })}
            <PressableScale
              style={styles.moreDatesButton}
              onPress={() => setShowCalendar(true)}
            >
              <Ionicons
                name="calendar-outline"
                size={16}
                color={Colors.primaryBlue}
              />
              <Text style={styles.moreDatesText}>More</Text>
            </PressableScale>
          </ScrollView>
        </View>
      )}

      {/* Calendar Modal */}
      {!fixedDate && (
        <CalendarModal
          visible={showCalendar}
          onClose={() => setShowCalendar(false)}
          onDateConfirm={(date) => {
            setSelectedDate(date);
            setShowCalendar(false);
          }}
          initialDate={selectedDate}
          minDate={getDateString(0)}
          title="Select Date"
        />
      )}

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Add a message (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Tell others a bit about yourself..."
          placeholderTextColor={Colors.smoke}
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={150}
        />
        <Text style={styles.charCount}>{message.length}/150</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {existingIntention && onRemove && (
          <PressableScale style={styles.removeButton} onPress={handleRemove}>
            <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
            <Text style={styles.removeText}>Remove</Text>
          </PressableScale>
        )}

        <PressableScale
          style={[
            styles.submitButton,
            !selectedActivity && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!selectedActivity}
        >
          <Text style={styles.submitText}>
            {existingIntention ? "Update Status" : "Post Status"}
          </Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.bg} />
        </PressableScale>
      </View>
    </Modal>
  );
}
