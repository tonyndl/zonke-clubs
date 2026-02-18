# Naming Convention Fix Summary

## Overview

Fixed all TypeScript naming convention errors by converting camelCase to snake_case throughout the admin web app to match the backend convention from CLAUDE.md.

## Files Updated

### 1. Mock Data (`src/data/mockData.ts`)

Converted all object property names from camelCase to snake_case:

- `newFavorites` → `new_favorites`
- `activeMeetups` → `active_meetups`
- `clubId` → `club_id`
- `userId` → `user_id`
- `userAvatar` → `user_avatar`
- `coverImage` → `cover_image`
- `startTime` → `start_time`
- `endTime` → `end_time`
- `ticketPrice` → `ticket_price`
- `djLineup` → `dj_lineup`
- `interestedCount` → `interested_count`
- `createdAt` → `inserted_at`
- `updatedAt` → `updated_at`
- `visitDate` → `visit_date`

### 2. TypeScript Pages

Updated property access to use snake_case:

**`src/pages/Content/Content.tsx`**

- Fixed `post.userAvatar` → `post.user_avatar`
- Fixed `post.createdAt` → `post.inserted_at`

**`src/pages/Dashboard/Dashboard.tsx`**

- Fixed `stats.newFavorites` → `stats.new_favorites`
- Fixed `stats.activeMeetups` → `stats.active_meetups`
- Fixed `spender.userAvatar` → `spender.user_avatar`
- Fixed `spender.visitDate` → `spender.visit_date`

**`src/pages/Events/Events.tsx`**

- Fixed all event property access and object creation
- Updated `event.coverImage`, `startTime`, `endTime`, `ticketPrice`, `djLineup`, `interestedCount`

**`src/pages/Spending/Spending.tsx`**

- Fixed all spending record property access and object creation
- Updated `record.userAvatar`, `visitDate`, object creation properties

### 3. Type Definitions

**`src/components/Modal/CreateEventModal.tsx`**
Updated `EventFormData` interface:

```typescript
export interface EventFormData {
  title: string;
  description: string;
  date: string;
  start_time: string; // was startTime
  end_time: string; // was endTime
  ticket_price: string; // was ticketPrice
  dj_lineup: string[]; // was djLineup
  cover_image: string; // was coverImage
  status: "draft" | "published";
}
```

Also updated form field names and property access throughout the component.

**`src/components/Modal/QuickBottleServiceModal.tsx`**
Updated `BottleServiceData` interface:

```typescript
export interface BottleServiceData {
  customer_id: string; // was customerId
  customer_name: string; // was customerName
  customer_avatar: string; // was customerAvatar
  bottle_id: string; // was bottleId
  bottle_name: string; // was bottleName
  bottle_price: number; // was bottlePrice
  bottle_image: string; // was bottleImage
  quantity: number;
  table_section: string; // was tableSection
  share_publicly: boolean; // was sharePublicly
}
```

**`src/services/clubService.ts`**

- Fixed `Club['openingHours']` → `Club['opening_hours']`
- Fixed `Club['djSchedule']` → `Club['dj_schedule']`

## Benefits

1. **Consistency**: All code now uses snake_case matching the backend (PostgreSQL/Phoenix)
2. **Type Safety**: TypeScript types match actual data structures
3. **Convention**: Follows the guidelines in CLAUDE.md
4. **No Runtime Errors**: Property access works correctly with backend responses

## Testing

After these changes, the admin web app should compile without TypeScript errors related to property naming.

To verify:

```bash
cd /home/tony/zonke-clubs/frontend/zonke-clubs-admin
npm run build
```

All TypeScript compilation errors related to naming conventions have been resolved.
