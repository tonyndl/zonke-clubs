import React, { useState } from "react";
import { Calendar, CalendarProps, DateData } from "react-native-calendars";
import { Colors } from "@/constants/ui";
import Animated, { FadeIn } from "react-native-reanimated";
import { styles } from "./styles";

export interface ModernCalendarProps {
  /**
   * Callback fired when a date is selected
   */
  onDateSelect: (date: string) => void;

  /**
   * Initially selected date (YYYY-MM-DD format)
   */
  selectedDate?: string;

  /**
   * Minimum selectable date (YYYY-MM-DD format)
   */
  minDate?: string;

  /**
   * Maximum selectable date (YYYY-MM-DD format)
   */
  maxDate?: string;

  /**
   * Dates to mark (highlight) on the calendar
   * Format: { 'YYYY-MM-DD': { marked: true, dotColor: 'color' } }
   */
  markedDates?: CalendarProps["markedDates"];

  /**
   * Show week numbers
   */
  showWeekNumbers?: boolean;

  /**
   * Calendar theme variant
   */
  variant?: "default" | "compact";
}

export function ModernCalendar({
  onDateSelect,
  selectedDate,
  minDate,
  maxDate,
  markedDates: customMarkedDates,
  showWeekNumbers = false,
  variant = "default",
}: ModernCalendarProps) {
  const [selected, setSelected] = useState(selectedDate || "");

  const handleDayPress = (day: DateData) => {
    setSelected(day.dateString);
    onDateSelect(day.dateString);
  };

  // Merge custom marked dates with selected date
  const markedDates = {
    ...customMarkedDates,
    [selected]: {
      ...customMarkedDates?.[selected],
      selected: true,
      selectedColor: Colors.gold,
      selectedTextColor: Colors.bg,
    },
  };

  const isCompact = variant === "compact";

  return (
    <Animated.View entering={FadeIn.springify()} style={styles.container}>
      <Calendar
        current={selected || undefined}
        onDayPress={handleDayPress}
        markedDates={markedDates}
        minDate={minDate}
        maxDate={maxDate}
        showWeekNumbers={showWeekNumbers}
        enableSwipeMonths={true}
        hideExtraDays={true}
        firstDay={1} // Monday
        theme={{
          calendarBackground: "transparent",
          textSectionTitleColor: Colors.lightGrey,
          textSectionTitleDisabledColor: Colors.smoke,
          selectedDayBackgroundColor: Colors.gold,
          selectedDayTextColor: Colors.bg,
          todayTextColor: Colors.primaryBlue,
          dayTextColor: Colors.platinum,
          textDisabledColor: Colors.smoke,
          dotColor: Colors.gold,
          selectedDotColor: Colors.bg,
          arrowColor: Colors.gold,
          disabledArrowColor: Colors.smoke,
          monthTextColor: Colors.platinum,
          indicatorColor: Colors.gold,
          textDayFontFamily: "System",
          textMonthFontFamily: "System",
          textDayHeaderFontFamily: "System",
          textDayFontWeight: "600",
          textMonthFontWeight: "800",
          textDayHeaderFontWeight: "600",
          textDayFontSize: isCompact ? 13 : 15,
          textMonthFontSize: isCompact ? 18 : 20,
          textDayHeaderFontSize: isCompact ? 11 : 12,
          // Modern styling
          "stylesheet.calendar.header": {
            header: {
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: isCompact ? 12 : 16,
              paddingHorizontal: 8,
              backgroundColor: Colors.bgCard,
              borderRadius: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: "rgba(57, 243, 255, 0.15)",
            },
            monthText: {
              fontSize: isCompact ? 18 : 20,
              fontWeight: "800",
              color: Colors.platinum,
              letterSpacing: 0.5,
            },
            arrow: {
              padding: 8,
            },
          },
          "stylesheet.calendar.main": {
            container: {
              paddingHorizontal: 0,
            },
            week: {
              marginTop: 4,
              marginBottom: 4,
              flexDirection: "row",
              justifyContent: "space-around",
            },
          },
          "stylesheet.day.basic": {
            base: {
              width: isCompact ? 36 : 42,
              height: isCompact ? 36 : 42,
              alignItems: "center",
              justifyContent: "center",
            },
            selected: {
              backgroundColor: Colors.gold,
              borderRadius: isCompact ? 18 : 21,
              shadowColor: Colors.gold,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3,
            },
            today: {
              backgroundColor: "rgba(57, 243, 255, 0.1)",
              borderRadius: isCompact ? 18 : 21,
              borderWidth: 1.5,
              borderColor: Colors.primaryBlue,
            },
            text: {
              fontSize: isCompact ? 13 : 15,
              fontWeight: "600",
              color: Colors.platinum,
            },
            selectedText: {
              color: Colors.bg,
              fontWeight: "800",
            },
            todayText: {
              color: Colors.primaryBlue,
              fontWeight: "700",
            },
            disabledText: {
              color: Colors.smoke,
              fontWeight: "400",
            },
          },
        }}
        style={[styles.calendar, isCompact && styles.calendarCompact]}
      />
    </Animated.View>
  );
}
