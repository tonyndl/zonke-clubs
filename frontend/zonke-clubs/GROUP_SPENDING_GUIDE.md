# 🎉 Group Spending Feature - Implementation Guide

## Overview

The **Group Spending** feature provides a stunning, intuitive way for clubs to split bills among multiple members who spent money together. This feature makes it incredibly easy to track group expenses and fairly distribute costs.

## 🎨 UI/UX Highlights

### ✨ Multi-Step Flow with Beautiful Animations

1. **Amount Entry** - Large, prominent input with quick amount buttons (R50, R100, R200, R500)
2. **Member Selection** - Visual grid with avatar selection and real-time preview
3. **Split Configuration** - Toggle between equal split and custom amounts with live calculation
4. **Success Confirmation** - Celebratory animation when split is complete

### 🎯 Key Features

- **Step Indicator** - Visual progress through the 3-step process
- **Equal vs Custom Split** - Toggle to switch between automatic equal distribution and manual amounts
- **Real-time Validation** - Shows remaining/over amounts when custom splitting
- **Selected Members Preview** - Horizontal scroll showing selected members with remove option
- **Smooth Animations** - Spring animations, scale effects, and slide transitions
- **Glass Morphism** - BlurView effects for modern, premium feel
- **Gradient Accents** - Cyan/blue gradient highlights throughout

## 📁 File Structure

```
frontend/zonke-clubs/
├── components/
│   └── spending/
│       └── GroupSpendingModal.tsx       # Main group spending modal
└── app/
    └── manage/
        └── spending.tsx                  # Updated spending management screen
```

## 🚀 Usage

### Opening the Group Spending Modal

In the spending management screen, tap the **group icon** button (people icon) in the header:

```tsx
<PressableScale
  style={styles.groupButton}
  onPress={() => setShowGroupSpendingModal(true)}
>
  <Ionicons name="people" size={20} color={Colors.gold} />
</PressableScale>
```

### Integrating the Modal

```tsx
import {
  GroupSpendingModal,
  GroupSpendingData,
} from "@/components/spending/GroupSpendingModal";

function YourComponent() {
  const [showGroupSpending, setShowGroupSpending] = useState(false);

  const handleComplete = (data: GroupSpendingData) => {
    console.log("Total Amount:", data.totalAmount);
    console.log("Split Type:", data.splitType);
    console.log("Splits:", data.splits);

    // Process the group spending data
    // Send to API, update local state, etc.
  };

  return (
    <>
      <TouchableOpacity onPress={() => setShowGroupSpending(true)}>
        <Text>Start Group Spending</Text>
      </TouchableOpacity>

      <GroupSpendingModal
        visible={showGroupSpending}
        onClose={() => setShowGroupSpending(false)}
        onComplete={handleComplete}
        members={yourMembersList} // Optional: provide custom members
        clubName="Your Club Name" // Optional: customize club name
      />
    </>
  );
}
```

## 📊 Data Structure

### GroupSpendingData Type

```typescript
type GroupSpendingData = {
  totalAmount: number;
  splits: Array<{
    memberId: string;
    memberName: string;
    amount: number;
  }>;
  splitType: "equal" | "custom";
  timestamp: string;
};
```

### Member Type

```typescript
type Member = {
  id: string;
  name: string;
  avatar: string;
  username?: string;
  selected: boolean;
  amount: number;
};
```

## 🎭 Component Props

### GroupSpendingModal Props

| Prop         | Type                              | Required | Default      | Description                     |
| ------------ | --------------------------------- | -------- | ------------ | ------------------------------- |
| `visible`    | boolean                           | Yes      | -            | Controls modal visibility       |
| `onClose`    | () => void                        | Yes      | -            | Called when modal is closed     |
| `onComplete` | (data: GroupSpendingData) => void | Yes      | -            | Called when split is confirmed  |
| `members`    | Member[]                          | No       | MOCK_MEMBERS | Array of members to select from |
| `clubName`   | string                            | No       | 'The Club'   | Name of the club for display    |

## 🎨 Styling & Theme

The component uses the app's color constants from `@/constants/ui`:

```typescript
import { Colors, Gradients } from "@/constants/ui";

// Primary accent color (cyan/blue)
Colors.gold; // #39f3ff
Colors.goldLight; // #7ef9ff

// Gradients
Gradients.accent; // ['#39f3ff', '#7ef9ff', '#39f3ff']
```

## 📱 User Flow Example

### Scenario: Group of friends spent R1,200 at the club

1. **Club staff opens Group Spending**
   - Taps the group icon in spending management header

2. **Enter Total Amount**
   - Types "1200" or taps quick amount button
   - Large, prominent display shows: R1200.00
   - Taps "Continue"

3. **Select Members**
   - Scrolls through member grid (3 columns)
   - Taps on 4 friends: Alex, Sarah, Michael, Emma
   - Selected members appear in preview bar at top
   - Each selected member shows gold border and checkmark
   - Taps "Split Bill"

4. **Configure Split**
   - By default, "Equal Split" is ON
   - Shows each person owes: R300.00
   - Can toggle to "Custom Split" to adjust individual amounts
   - Bottom summary shows:
     - Total Amount: R1,200.00
     - Allocated: R1,200.00
     - Remaining: R0.00 ✅

5. **Confirm**
   - Taps "Confirm Split"
   - Success animation plays
   - Modal closes after 2 seconds
   - Group spending record appears in history

## 🎯 Features Breakdown

### Step 1: Amount Entry

- **Large input** with currency symbol (R)
- **Quick amount buttons** for common values
- **Auto-focus** on input for fast entry
- **Validation** - must be > 0 to continue

### Step 2: Member Selection

- **Search bar** to filter members by name/username
- **Visual grid** with 3 columns of member cards
- **Selected preview** - horizontal scroll showing selected members
- **Tap to toggle** - intuitive selection/deselection
- **Visual feedback** - gold borders, checkmarks, color changes

### Step 3: Split Configuration

- **Toggle switch** between equal and custom splits
- **Equal Split**: Automatically divides amount equally
- **Custom Split**: Editable amount for each member
- **Real-time calculation** showing remaining/over amounts
- **Visual validation** - red for over, green for exact match
- **Sticky footer** with summary and actions

## 🎬 Animations

### Entry Animations

```typescript
// Modal slide-in
Animated.spring(slideAnim, {
  toValue: 1,
  useNativeDriver: true,
  tension: 65,
  friction: 8,
});

// Step content scale-in
Animated.spring(scaleAnim, {
  toValue: 1,
  useNativeDriver: true,
  tension: 80,
  friction: 6,
});
```

### Success Animation

```typescript
// Confetti effect on completion
Animated.timing(confettiAnim, {
  toValue: 1,
  duration: 800,
  useNativeDriver: true,
});
```

## 🔧 Customization

### Custom Members List

```typescript
const myMembers: Member[] = [
  {
    id: '1',
    name: 'John Doe',
    avatar: 'https://example.com/avatar1.jpg',
    username: 'johnd',
    selected: false,
    amount: 0,
  },
  // ... more members
];

<GroupSpendingModal
  members={myMembers}
  // ... other props
/>
```

### Custom Colors

Update `frontend/zonke-clubs/constants/ui.ts`:

```typescript
export const Colors = {
  // Change accent colors
  gold: "#your-color",
  goldLight: "#your-light-color",
  // ... other colors
};
```

## 🐛 Troubleshooting

### Modal not showing?

- Ensure `visible` prop is set to `true`
- Check if modal is being rendered (not conditionally excluded)

### Members not appearing?

- Verify `members` array is properly formatted
- Check avatar URLs are accessible
- Ensure member objects have required fields: `id`, `name`, `avatar`

### Calculation issues?

- Split validation requires total allocated = total amount (within 0.01 tolerance)
- Check that all amounts are valid numbers
- Verify decimal precision (2 decimal places)

## 🚀 Future Enhancements

Potential features to add:

1. **Receipt Scanner Integration**
   - Connect to existing `ReceiptScannerModal`
   - Auto-populate total amount from scanned receipt

2. **Saved Groups**
   - Save frequently used member groups
   - Quick select from saved groups

3. **Payment Tracking**
   - Mark who has paid their share
   - Send payment reminders

4. **History & Analytics**
   - View past group spendings
   - Charts showing spending patterns
   - Top spenders leaderboard

5. **Split Methods**
   - By percentage
   - By items ordered
   - Unequal splits with reasons

6. **Multi-Currency Support**
   - Handle multiple currencies
   - Auto-conversion rates

## 📝 Notes

- The component uses mock data by default for development
- All amounts are in South African Rand (R)
- Animations use `react-native-reanimated` for performance
- BlurView requires `expo-blur` package
- Step validation prevents skipping required steps

## 🎨 Design System

The component follows the app's design system:

- **Typography**: San Francisco (iOS), Roboto (Android)
- **Spacing**: 4px base unit (gap: 8, 12, 16, 20, 24...)
- **Border Radius**: 12px, 16px, 20px, 24px for cards/buttons
- **Colors**: Dark theme with cyan accents
- **Shadows**: Minimal, uses borders and backgrounds instead
- **Animations**: Spring-based, natural feel

## 📦 Dependencies

Required packages (already in the project):

- `expo-linear-gradient` - Gradient backgrounds
- `expo-blur` - BlurView effects
- `react-native-reanimated` - Smooth animations
- `@expo/vector-icons` - Icons (Ionicons)

---

**Created by**: Claude Code
**Date**: January 2026
**Version**: 1.0.0
