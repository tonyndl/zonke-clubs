import React, { useState } from "react";
import { View, Text, Modal as RNModal, Pressable } from "react-native";
import { BlurView } from "expo-blur";
import { Colors } from "@/constants/ui";
import { ModernCalendar } from "@/components/ui/ModernCalendar";
import { PressableScale } from "@/components/ui/PressableScale";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { styles } from "./styles";

interface CalendarModalProps {
  /**
   * Modal visibility
   */
  visible: boolean;

  /**
   * Callback when modal is closed
   */
  onClose: () => void;

  /**
   * Callback when a date is selected and confirmed
   */
  onDateConfirm: (date: string) => void;

  /**
   * Initially selected date (YYYY-MM-DD format)
   */
  initialDate?: string;

  /**
   * Minimum selectable date (YYYY-MM-DD format)
   */
  minDate?: string;

  /**
   * Maximum selectable date (YYYY-MM-DD format)
   */
  maxDate?: string;

  /**
   * Modal title
   */
  title?: string;

  /**
   * Show quick selection buttons (Today, Tomorrow, etc.)
   */
  showQuickButtons?: boolean;

  /**
   * Days of the week the club is closed (e.g., ["Monday", "Tuesday"]).
   * These days will be greyed out and not selectable.
   */
  closedDays?: string[];
}

export function CalendarModal({
  visible,
  onClose,
  onDateConfirm,
  initialDate,
  minDate,
  maxDate,
  title = "Select Date",
  showQuickButtons = true,
  closedDays = [],
}: CalendarModalProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate || "");

  // Build markedDates with disabled days for the next 6 months
  const disabledDates: Record<
    string,
    { disabled: boolean; disabledDotColor: string }
  > = {};
  if (closedDays.length > 0) {
    const dayNameToIndex: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };
    const closedIndices = closedDays
      .map((d) => dayNameToIndex[d])
      .filter((i) => i !== undefined);
    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + 6);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (closedIndices.includes(d.getDay())) {
        const key = d.toISOString().split("T")[0];
        disabledDates[key] = {
          disabled: true,
          disabledDotColor: "transparent",
        };
      }
    }
  }

  const isSelectedClosed = selectedDate in disabledDates;

  const handleConfirm = () => {
    if (selectedDate && !isSelectedClosed) {
      onDateConfirm(selectedDate);
      onClose();
    }
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return "No date selected";
    const date = new Date(selectedDate + "T00:00:00");
    return date.toLocaleDateString("en-ZA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={1000} tint="dark" style={{ flex: 1 }}>
        <Pressable
          style={{ flex: 1, justifyContent: "center", padding: 20 }}
          onPress={onClose}
        >
          <Pressable
            style={{
              backgroundColor: Colors.bgCard,
              borderRadius: 20,
              padding: 16,
            }}
            onPress={() => {}}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <PressableScale onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.platinum} />
              </PressableScale>
            </View>

            {/* Calendar */}
            <Animated.View entering={FadeInDown.delay(150).springify()}>
              <ModernCalendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                minDate={minDate}
                maxDate={maxDate}
                markedDates={disabledDates}
              />
            </Animated.View>

            {/* Selected Date Display */}
            {selectedDate && (
              <Animated.View
                entering={FadeInDown.delay(200).springify()}
                style={styles.selectedDateContainer}
              >
                <View style={styles.selectedDateCard}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.gold}
                  />
                  <Text style={styles.selectedDateText}>
                    {formatSelectedDate()}
                  </Text>
                </View>
              </Animated.View>
            )}

            {/* Confirm Button */}
            <Animated.View
              entering={FadeInDown.delay(250).springify()}
              style={styles.footer}
            >
              <PressableScale
                style={[
                  styles.confirmButton,
                  (!selectedDate || isSelectedClosed) &&
                    styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={!selectedDate || isSelectedClosed}
              >
                <Ionicons
                  name={
                    isSelectedClosed
                      ? "close-circle-outline"
                      : "calendar-outline"
                  }
                  size={20}
                  color={
                    selectedDate && !isSelectedClosed ? Colors.bg : Colors.smoke
                  }
                />
                <Text
                  style={[
                    styles.confirmButtonText,
                    (!selectedDate || isSelectedClosed) &&
                      styles.confirmButtonTextDisabled,
                  ]}
                >
                  {isSelectedClosed
                    ? "Club closed on this day"
                    : "Confirm Date"}
                </Text>
              </PressableScale>
            </Animated.View>
          </Pressable>
        </Pressable>
      </BlurView>
    </RNModal>
  );
}
