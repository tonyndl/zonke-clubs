import React, { useState } from "react";
import { View, Text } from "react-native";
import { Colors } from "@/constants/ui";
import { Modal } from "@/components/modal";
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
}: CalendarModalProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate || "");

  const handleConfirm = () => {
    if (selectedDate) {
      onDateConfirm(selectedDate);
      onClose();
    }
  };

  const handleQuickSelect = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    const dateStr = date.toISOString().split("T")[0];
    setSelectedDate(dateStr);
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

  if (!visible) return null;

  return (
    <Modal onDismiss={onClose} bgColor={Colors.bgCard}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <PressableScale onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.platinum} />
        </PressableScale>
      </View>

      {/* Quick Selection Buttons */}
      {showQuickButtons && (
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.quickButtons}
        >
          <PressableScale
            style={styles.quickButton}
            onPress={() => handleQuickSelect(0)}
          >
            <Ionicons name="today" size={16} color={Colors.primaryBlue} />
            <Text style={styles.quickButtonText}>Today</Text>
          </PressableScale>

          <PressableScale
            style={styles.quickButton}
            onPress={() => handleQuickSelect(1)}
          >
            <Ionicons name="sunny" size={16} color={Colors.gold} />
            <Text style={styles.quickButtonText}>Tomorrow</Text>
          </PressableScale>

          <PressableScale
            style={styles.quickButton}
            onPress={() => handleQuickSelect(7)}
          >
            <Ionicons name="calendar" size={16} color={Colors.smoke} />
            <Text style={styles.quickButtonText}>Next Week</Text>
          </PressableScale>
        </Animated.View>
      )}

      {/* Calendar */}
      <Animated.View entering={FadeInDown.delay(150).springify()}>
        <ModernCalendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          minDate={minDate}
          maxDate={maxDate}
        />
      </Animated.View>

      {/* Selected Date Display */}
      {selectedDate && (
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.selectedDateContainer}
        >
          <View style={styles.selectedDateCard}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.gold} />
            <Text style={styles.selectedDateText}>{formatSelectedDate()}</Text>
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
            !selectedDate && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={!selectedDate}
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color={selectedDate ? Colors.bg : Colors.smoke}
          />
          <Text
            style={[
              styles.confirmButtonText,
              !selectedDate && styles.confirmButtonTextDisabled,
            ]}
          >
            Confirm Date
          </Text>
        </PressableScale>
      </Animated.View>
    </Modal>
  );
}
