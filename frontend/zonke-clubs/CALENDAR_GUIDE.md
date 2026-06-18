# Modern Calendar Component Guide 📅

## Overview

The app now features beautiful, modern calendar components that can be used throughout the application. The calendar uses `react-native-calendars` with custom styling to match your app's design.

## Components

### 1. ModernCalendar (`components/ui/ModernCalendar.tsx`)

The base calendar component with stunning styling.

**Features:**

- ✨ Beautiful gold accent color
- 🎨 Dark theme matching app design
- 📱 Responsive and touch-friendly
- 🔄 Swipe between months
- 📍 Marked dates support
- 🎯 Min/max date restrictions
- 💫 Smooth animations

**Props:**

```typescript
interface ModernCalendarProps {
  onDateSelect: (date: string) => void;
  selectedDate?: string; // YYYY-MM-DD
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD
  markedDates?: {
    [date: string]: {
      marked?: boolean;
      dotColor?: string;
    };
  };
  showWeekNumbers?: boolean;
  variant?: "default" | "compact";
}
```

**Usage Example:**

```tsx
import { ModernCalendar } from "@/components/ui/ModernCalendar";

function MyComponent() {
  const [selectedDate, setSelectedDate] = useState("2024-02-09");

  return (
    <ModernCalendar
      selectedDate={selectedDate}
      onDateSelect={setSelectedDate}
      minDate="2024-02-01"
      maxDate="2024-12-31"
    />
  );
}
```

### 2. CalendarModal (`components/ui/CalendarModal.tsx`)

A full-featured modal with calendar, quick selection buttons, and confirmation.

**Features:**

- 📅 Full calendar view
- ⚡ Quick selection buttons (Today, Tomorrow, Next Week)
- ✅ Date confirmation
- 📝 Selected date preview
- 🎨 Animated transitions
- 🚀 Easy to integrate

**Props:**

```typescript
interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  onDateConfirm: (date: string) => void;
  initialDate?: string;
  minDate?: string;
  maxDate?: string;
  title?: string;
  showQuickButtons?: boolean;
}
```

**Usage Example:**

```tsx
import { CalendarModal } from "@/components/ui/CalendarModal";

function MyComponent() {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  return (
    <>
      <Button onPress={() => setShowCalendar(true)}>Select Date</Button>

      <CalendarModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onDateConfirm={(date) => {
          setSelectedDate(date);
          setShowCalendar(false);
        }}
        title="Choose Your Date"
        minDate={new Date().toISOString().split("T")[0]}
      />
    </>
  );
}
```

## Implementation Examples

### ✅ Already Implemented

**PostIntentionModal** (`components/meetup/PostIntentionModal.tsx`)

- Quick date buttons for next 7 days
- "More" button opens full calendar modal
- Perfect blend of quick selection and full calendar access

### Usage in Other Components

#### Event Creation

```tsx
import { CalendarModal } from "@/components/ui/CalendarModal";

function CreateEventForm() {
  const [showCalendar, setShowCalendar] = useState(false);
  const [eventDate, setEventDate] = useState("");

  return (
    <>
      <TouchableOpacity onPress={() => setShowCalendar(true)}>
        <Text>{eventDate || "Select event date"}</Text>
      </TouchableOpacity>

      <CalendarModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onDateConfirm={setEventDate}
        title="Event Date"
        minDate={new Date().toISOString().split("T")[0]}
        showQuickButtons={false} // Hide quick buttons for events
      />
    </>
  );
}
```

#### Booking/Reservation

```tsx
import { ModernCalendar } from "@/components/ui/ModernCalendar";

function BookingScreen() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const markedDates = {
    [checkIn]: { selected: true, selectedColor: Colors.gold },
    [checkOut]: { selected: true, selectedColor: Colors.primaryBlue },
  };

  return (
    <View>
      <Text>Select Check-in Date</Text>
      <ModernCalendar
        selectedDate={checkIn}
        onDateSelect={setCheckIn}
        markedDates={markedDates}
        minDate={new Date().toISOString().split("T")[0]}
      />
    </View>
  );
}
```

#### Date Range Picker

```tsx
const getDateRange = (start: string, end: string) => {
  const markedDates: any = {};
  const startDate = new Date(start);
  const endDate = new Date(end);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    markedDates[dateStr] = {
      marked: true,
      dotColor: Colors.gold,
    };
  }

  return markedDates;
};
```

## Customization

### Colors

All colors are defined in `@/constants/ui` and can be customized:

- `Colors.gold` - Selected date background
- `Colors.primaryBlue` - Today's date
- `Colors.platinum` - Regular dates
- `Colors.smoke` - Disabled dates

### Variants

The `ModernCalendar` supports two variants:

- `default` - Regular size (best for modals)
- `compact` - Smaller size (best for inline forms)

## Best Practices

1. **Use CalendarModal for user-initiated date selection**
   - Booking forms
   - Event creation
   - Appointment scheduling

2. **Use ModernCalendar inline for always-visible calendars**
   - Availability calendars
   - Scheduling dashboards
   - Multi-date selection

3. **Combine quick buttons with full calendar**
   - Show quick options for common selections
   - Provide full calendar for custom dates

4. **Set appropriate min/max dates**
   - Prevent past dates for future events
   - Limit booking windows
   - Enforce business rules

## Accessibility

The calendar components are fully accessible with:

- Touch-friendly tap targets (42x42px minimum)
- Clear visual indicators
- High contrast colors
- Screen reader support (via react-native-calendars)

## Performance

- Lazy rendering of dates
- Efficient month switching
- Smooth animations
- Minimal re-renders

---

**Need help?** Check the component files for more examples and prop documentation!
