import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/ui";
import { ModernCalendar } from "@/components/ui/ModernCalendar";
import { CalendarModal } from "@/components/ui/CalendarModal";
import { PressableScale } from "@/components/ui/PressableScale";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { styles } from "./styles";

/**
 * CalendarDemo - Showcase all calendar features
 *
 * This component demonstrates:
 * 1. Inline calendar (default variant)
 * 2. Compact calendar variant
 * 3. Calendar modal with quick buttons
 * 4. Date range selection
 * 5. Marked dates
 */
export function CalendarDemo() {
  const [inlineDate, setInlineDate] = useState("");
  const [compactDate, setCompactDate] = useState("");
  const [modalDate, setModalDate] = useState("");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Get today and tomorrow for default values
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  // Create marked dates for demonstration
  const markedDates = {
    [today]: {
      marked: true,
      dotColor: Colors.gold,
    },
    [tomorrow]: {
      marked: true,
      dotColor: Colors.primaryBlue,
    },
  };

  // Create date range marked dates
  const getRangeMarkedDates = () => {
    if (!rangeStart || !rangeEnd) return {};

    const marked: any = {};
    const start = new Date(rangeStart);
    const end = new Date(rangeEnd);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      marked[dateStr] = {
        marked: true,
        dotColor: Colors.gold,
        selected: dateStr === rangeStart || dateStr === rangeEnd,
        selectedColor: Colors.gold,
      };
    }

    return marked;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "No date selected";
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-ZA", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
          <Text style={styles.title}>📅 Calendar Demo</Text>
          <Text style={styles.subtitle}>
            Showcase of all calendar features and variants
          </Text>
        </Animated.View>

        {/* 1. Inline Calendar (Default) */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={20} color={Colors.gold} />
            <Text style={styles.sectionTitle}>Inline Calendar (Default)</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Full-featured calendar that can be embedded anywhere
          </Text>

          <ModernCalendar
            selectedDate={inlineDate}
            onDateSelect={setInlineDate}
            markedDates={markedDates}
            minDate={today}
          />

          {inlineDate && (
            <View style={styles.resultCard}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.gold} />
              <Text style={styles.resultText}>{formatDate(inlineDate)}</Text>
            </View>
          )}
        </Animated.View>

        {/* 2. Compact Calendar */}
        <Animated.View
          entering={FadeInDown.delay(150).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={Colors.primaryBlue}
            />
            <Text style={styles.sectionTitle}>Compact Calendar</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Smaller variant perfect for inline forms and tight spaces
          </Text>

          <ModernCalendar
            selectedDate={compactDate}
            onDateSelect={setCompactDate}
            variant="compact"
            minDate={today}
          />

          {compactDate && (
            <View style={styles.resultCard}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={Colors.primaryBlue}
              />
              <Text style={styles.resultText}>{formatDate(compactDate)}</Text>
            </View>
          )}
        </Animated.View>

        {/* 3. Calendar Modal */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="albums" size={20} color={Colors.gold} />
            <Text style={styles.sectionTitle}>Calendar Modal</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Full-screen modal with quick selection buttons and confirmation
          </Text>

          <PressableScale
            style={styles.openModalButton}
            onPress={() => setShowModal(true)}
          >
            <Ionicons name="calendar" size={20} color={Colors.bg} />
            <Text style={styles.openModalButtonText}>Open Calendar Modal</Text>
          </PressableScale>

          {modalDate && (
            <View style={styles.resultCard}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.gold} />
              <Text style={styles.resultText}>{formatDate(modalDate)}</Text>
            </View>
          )}
        </Animated.View>

        {/* 4. Date Range Selection */}
        <Animated.View
          entering={FadeInDown.delay(250).springify()}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Ionicons
              name="swap-horizontal"
              size={20}
              color={Colors.primaryBlue}
            />
            <Text style={styles.sectionTitle}>Date Range Selection</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Select start and end dates for a range
          </Text>

          <View style={styles.rangeButtons}>
            <PressableScale
              style={[
                styles.rangeButton,
                rangeStart && styles.rangeButtonSelected,
              ]}
              onPress={() => {
                // Simple implementation: first click = start, second = end
                if (!rangeStart) {
                  setRangeStart(today);
                } else if (!rangeEnd) {
                  setRangeEnd(today);
                } else {
                  setRangeStart("");
                  setRangeEnd("");
                }
              }}
            >
              <Text style={styles.rangeButtonLabel}>
                Start:{" "}
                {rangeStart ? formatDate(rangeStart).split(",")[0] : "Not set"}
              </Text>
            </PressableScale>

            <PressableScale
              style={[
                styles.rangeButton,
                rangeEnd && styles.rangeButtonSelected,
              ]}
              onPress={() => {
                if (rangeStart && !rangeEnd) {
                  setRangeEnd(
                    new Date(Date.now() + 7 * 86400000)
                      .toISOString()
                      .split("T")[0],
                  );
                }
              }}
            >
              <Text style={styles.rangeButtonLabel}>
                End: {rangeEnd ? formatDate(rangeEnd).split(",")[0] : "Not set"}
              </Text>
            </PressableScale>
          </View>

          {rangeStart && rangeEnd && (
            <>
              <ModernCalendar
                selectedDate={rangeStart}
                onDateSelect={() => {}}
                markedDates={getRangeMarkedDates()}
                variant="compact"
              />

              <View style={styles.resultCard}>
                <Ionicons name="calendar" size={18} color={Colors.gold} />
                <Text style={styles.resultText}>
                  {formatDate(rangeStart)} → {formatDate(rangeEnd)}
                </Text>
              </View>
            </>
          )}
        </Animated.View>

        {/* Features List */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={styles.featuresSection}
        >
          <Text style={styles.featuresTitle}>✨ Features</Text>
          <View style={styles.featuresList}>
            {[
              "Beautiful gold & blue theme",
              "Two size variants (default & compact)",
              "Quick selection buttons",
              "Date range support",
              "Marked dates with dots",
              "Min/max date restrictions",
              "Swipe between months",
              "Smooth animations",
              "Touch-optimized (42px targets)",
              "Fully customizable",
            ].map((feature, index) => (
              <Animated.View
                key={index}
                entering={FadeInDown.delay(320 + index * 30).springify()}
                style={styles.featureItem}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={Colors.gold}
                />
                <Text style={styles.featureText}>{feature}</Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Calendar Modal */}
      <CalendarModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onDateConfirm={(date) => {
          setModalDate(date);
          setShowModal(false);
        }}
        initialDate={modalDate}
        title="Select a Date"
        minDate={today}
      />
    </SafeAreaView>
  );
}
