# Calendar Component Usage Examples 🗓️

## Quick Start

The calendar is already implemented! Here are the easiest ways to use it:

---

## Example 1: Simple Date Picker Button

```tsx
import { useState } from "react";
import { TouchableOpacity, Text } from "react-native";
import { CalendarModal } from "@/components/ui/CalendarModal";

function MyComponent() {
  const [date, setDate] = useState("");
  const [showCal, setShowCal] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setShowCal(true)}>
        <Text>{date || "Pick a date"}</Text>
      </TouchableOpacity>

      <CalendarModal
        visible={showCal}
        onClose={() => setShowCal(false)}
        onDateConfirm={setDate}
        title="Select Date"
      />
    </>
  );
}
```

---

## Example 2: Booking Form with Date Range

```tsx
import { useState } from "react";
import { View } from "react-native";
import { ModernCalendar } from "@/components/ui/ModernCalendar";
import { Colors } from "@/constants/ui";

function BookingForm() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  // Create marked dates showing the range
  const markedDates = {};
  if (checkIn && checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      markedDates[dateStr] = {
        marked: true,
        selected: dateStr === checkIn || dateStr === checkOut,
        selectedColor: Colors.gold,
      };
    }
  }

  return (
    <View>
      <ModernCalendar
        selectedDate={checkIn}
        onDateSelect={(date) => {
          if (!checkIn) {
            setCheckIn(date);
          } else if (!checkOut && date > checkIn) {
            setCheckOut(date);
          } else {
            setCheckIn(date);
            setCheckOut("");
          }
        }}
        markedDates={markedDates}
        minDate={new Date().toISOString().split("T")[0]}
      />
    </View>
  );
}
```

---

## Example 3: Event Creation with Calendar

```tsx
import { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { CalendarModal } from "@/components/ui/CalendarModal";
import { PressableScale } from "@/components/ui/PressableScale";
import { Colors } from "@/constants/ui";

function CreateEventForm() {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "Select date";
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-ZA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <View>
      <TextInput
        placeholder="Event name"
        value={eventName}
        onChangeText={setEventName}
      />

      <PressableScale
        onPress={() => setShowCalendar(true)}
        style={{
          backgroundColor: Colors.bgCard,
          padding: 16,
          borderRadius: 12,
          marginTop: 12,
        }}
      >
        <Text style={{ color: eventDate ? Colors.platinum : Colors.smoke }}>
          {formatDisplayDate(eventDate)}
        </Text>
      </PressableScale>

      <CalendarModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onDateConfirm={(date) => {
          setEventDate(date);
          setShowCalendar(false);
        }}
        title="Event Date"
        minDate={new Date().toISOString().split("T")[0]}
        showQuickButtons={true}
      />
    </View>
  );
}
```

---

## Example 4: Availability Calendar (Inline)

```tsx
import { useState } from "react";
import { View } from "react-native";
import { ModernCalendar } from "@/components/ui/ModernCalendar";
import { Colors } from "@/constants/ui";

function AvailabilityCalendar() {
  const [selectedDate, setSelectedDate] = useState("");

  // Mark available dates
  const availableDates = {
    "2024-02-10": { marked: true, dotColor: Colors.primaryBlue },
    "2024-02-12": { marked: true, dotColor: Colors.primaryBlue },
    "2024-02-15": { marked: true, dotColor: Colors.primaryBlue },
  };

  return (
    <View>
      <ModernCalendar
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        markedDates={availableDates}
        variant="default"
      />
    </View>
  );
}
```

---

## Example 5: Compact Calendar in Form

```tsx
import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ModernCalendar } from "@/components/ui/ModernCalendar";
import { Colors } from "@/constants/ui";

function CompactFormCalendar() {
  const [date, setDate] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select your preferred date:</Text>

      <ModernCalendar
        selectedDate={date}
        onDateSelect={setDate}
        variant="compact" // 👈 Use compact for inline forms
        minDate={new Date().toISOString().split("T")[0]}
      />

      {date && (
        <Text style={styles.selected}>
          Selected: {new Date(date + "T00:00:00").toDateString()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.platinum,
    marginBottom: 12,
  },
  selected: {
    fontSize: 14,
    color: Colors.gold,
    marginTop: 12,
  },
});
```

---

## Already Implemented ✅

The calendar is already being used in:

1. **PostIntentionModal** (`components/meetup/PostIntentionModal.tsx`)
   - Quick date selection buttons
   - "More" button opens full calendar modal

---

## Props Reference

### ModernCalendar Props

| Prop              | Type                     | Default      | Description                        |
| ----------------- | ------------------------ | ------------ | ---------------------------------- |
| `onDateSelect`    | `(date: string) => void` | **required** | Callback when date is selected     |
| `selectedDate`    | `string`                 | `undefined`  | Initial selected date (YYYY-MM-DD) |
| `minDate`         | `string`                 | `undefined`  | Minimum selectable date            |
| `maxDate`         | `string`                 | `undefined`  | Maximum selectable date            |
| `markedDates`     | `object`                 | `undefined`  | Dates to mark/highlight            |
| `showWeekNumbers` | `boolean`                | `false`      | Show week numbers                  |
| `variant`         | `'default' \| 'compact'` | `'default'`  | Size variant                       |

### CalendarModal Props

| Prop               | Type                     | Default         | Description                  |
| ------------------ | ------------------------ | --------------- | ---------------------------- |
| `visible`          | `boolean`                | **required**    | Modal visibility             |
| `onClose`          | `() => void`             | **required**    | Close callback               |
| `onDateConfirm`    | `(date: string) => void` | **required**    | Date confirmed callback      |
| `initialDate`      | `string`                 | `undefined`     | Initial selected date        |
| `minDate`          | `string`                 | `undefined`     | Minimum selectable date      |
| `maxDate`          | `string`                 | `undefined`     | Maximum selectable date      |
| `title`            | `string`                 | `'Select Date'` | Modal title                  |
| `showQuickButtons` | `boolean`                | `true`          | Show quick selection buttons |

---

## Tips & Best Practices

### 1. Date Format

Always use ISO format: `YYYY-MM-DD`

```tsx
// ✅ Good
const today = new Date().toISOString().split("T")[0];
// "2024-02-09"

// ❌ Bad
const today = new Date().toString();
// "Fri Feb 09 2024 ..."
```

### 2. Display Formatting

For user-friendly display:

```tsx
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-ZA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
```

### 3. Prevent Past Dates

```tsx
const today = new Date().toISOString().split("T")[0];

<CalendarModal
  minDate={today}
  // ...other props
/>;
```

### 4. Date Range Helper

```tsx
const createDateRange = (start: string, end: string) => {
  const markedDates: any = {};
  const startDate = new Date(start);
  const endDate = new Date(end);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    markedDates[dateStr] = {
      marked: true,
      selected: dateStr === start || dateStr === end,
      selectedColor: Colors.gold,
    };
  }

  return markedDates;
};
```

---

## Testing the Calendar

To see all features in action, check out:

- **CalendarDemo** component in `components/calendar/CalendarDemo.tsx`
- Shows all variants and features
- Live examples of each use case

---

Need more help? Check the main [CALENDAR_GUIDE.md](./CALENDAR_GUIDE.md) for full documentation!
