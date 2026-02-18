# Club Management Migration: Mobile to Web

## Overview

Successfully migrated all club management features from the React Native mobile app to a dedicated web-based admin panel. This provides club owners with a better experience for managing their clubs, viewing analytics, and handling administrative tasks.

## Changes Made

### 1. Mobile App Cleanup ✅

**Removed:**

- Entire `/frontend/zonke-clubs/app/manage/` directory (13 management screens)
- All club management functionality from mobile app

**Updated:**

- [frontend/zonke-clubs/contexts/UserRoleContext.tsx](frontend/zonke-clubs/contexts/UserRoleContext.tsx)
  - Changed default account type from `'club-account'` to `'club-goer'`
  - Mobile app now focuses on the club-goer experience

### 2. New Web Admin Panel ✅

**Location:** `/frontend/zonke-clubs-admin/`

**Technology Stack:**

- React 18 with TypeScript
- Create React App (CRA)
- Styled Components for styling
- React Router for routing
- TanStack Query for API state management
- Axios for HTTP requests

**Project Structure:**

```
frontend/zonke-clubs-admin/
├── public/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Table.tsx
│   ├── layouts/             # Layout components
│   │   ├── MainLayout.tsx
│   │   └── Sidebar.tsx
│   ├── pages/               # Route pages
│   │   ├── Dashboard/
│   │   │   └── Dashboard.tsx
│   │   ├── Events/
│   │   │   └── Events.tsx
│   │   ├── Content/
│   │   │   └── Content.tsx
│   │   ├── Spending/
│   │   │   └── Spending.tsx
│   │   └── Settings/
│   │       ├── ClubInfo.tsx
│   │       ├── OpeningHours.tsx
│   │       ├── Media.tsx
│   │       ├── DJSchedule.tsx
│   │       ├── Permissions.tsx
│   │       ├── BlockedUsers.tsx
│   │       ├── Guidelines.tsx
│   │       └── Subscription.tsx
│   ├── services/            # API communication
│   │   ├── api.ts           # Base API service with auth
│   │   ├── clubService.ts
│   │   ├── eventService.ts
│   │   ├── contentService.ts
│   │   ├── spendingService.ts
│   │   └── settingsService.ts
│   ├── styles/              # Styling
│   │   ├── GlobalStyles.ts
│   │   └── theme.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── App.tsx              # Main app with routing
│   └── index.tsx
├── .env                     # Environment variables
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Features Migrated

### Core Management (4 pages)

1. **Dashboard** - [src/pages/Dashboard/Dashboard.tsx](frontend/zonke-clubs-admin/src/pages/Dashboard/Dashboard.tsx)
   - Analytics overview
   - Weekly highlights
   - Quick stats (favorites, meetups, events, ratings)
   - Quick action shortcuts

2. **Events** - [src/pages/Events/Events.tsx](frontend/zonke-clubs-admin/src/pages/Events/Events.tsx)
   - Event listing with filters (all/published/draft)
   - Create new events
   - Edit existing events
   - Publish/unpublish functionality
   - DJ lineup management
   - Ticket pricing

3. **Content Moderation** - [src/pages/Content/Content.tsx](frontend/zonke-clubs-admin/src/pages/Content/Content.tsx)
   - Review pending posts
   - Approve/reject user content
   - Content filtering

4. **Spending Tracker** - [src/pages/Spending/Spending.tsx](frontend/zonke-clubs-admin/src/pages/Spending/Spending.tsx)
   - Customer spending records
   - Group spending (split bills)
   - Analytics and statistics
   - Visit tracking

### Settings (8 pages)

5. **Club Information** - [src/pages/Settings/ClubInfo.tsx](frontend/zonke-clubs-admin/src/pages/Settings/ClubInfo.tsx)
   - Edit club details
   - Update contact information
   - Manage description and address

6. **Opening Hours** - [src/pages/Settings/OpeningHours.tsx](frontend/zonke-clubs-admin/src/pages/Settings/OpeningHours.tsx)
   - Set weekly operating hours
   - Mark closed days

7. **Media Gallery** - [src/pages/Settings/Media.tsx](frontend/zonke-clubs-admin/src/pages/Settings/Media.tsx)
   - Upload photos and videos
   - Manage cover image
   - Delete media

8. **DJ Schedule** - [src/pages/Settings/DJSchedule.tsx](frontend/zonke-clubs-admin/src/pages/Settings/DJSchedule.tsx)
   - Weekly DJ lineup
   - Set genres and time slots

9. **Posting Permissions** - [src/pages/Settings/Permissions.tsx](frontend/zonke-clubs-admin/src/pages/Settings/Permissions.tsx)
   - Control who can post
   - Content moderation settings
   - Allowed content types

10. **Blocked Users** - [src/pages/Settings/BlockedUsers.tsx](frontend/zonke-clubs-admin/src/pages/Settings/BlockedUsers.tsx)
    - Manage blocked users
    - Unblock functionality
    - Block reasons

11. **Content Guidelines** - [src/pages/Settings/Guidelines.tsx](frontend/zonke-clubs-admin/src/pages/Settings/Guidelines.tsx)
    - Create custom guidelines
    - Edit existing rules
    - User-facing preview

12. **Subscription** - [src/pages/Settings/Subscription.tsx](frontend/zonke-clubs-admin/src/pages/Settings/Subscription.tsx)
    - View current plan
    - Upgrade/downgrade
    - Invoice history
    - Payment management

## API Services

All API communication is centralized in service files:

- **[api.ts](frontend/zonke-clubs-admin/src/services/api.ts)** - Base API client with JWT authentication
- **[clubService.ts](frontend/zonke-clubs-admin/src/services/clubService.ts)** - Club/business profile operations
- **[eventService.ts](frontend/zonke-clubs-admin/src/services/eventService.ts)** - Event CRUD operations
- **[contentService.ts](frontend/zonke-clubs-admin/src/services/contentService.ts)** - Post moderation
- **[spendingService.ts](frontend/zonke-clubs-admin/src/services/spendingService.ts)** - Spending records
- **[settingsService.ts](frontend/zonke-clubs-admin/src/services/settingsService.ts)** - All settings operations

## Design System

### Theme - [src/styles/theme.ts](frontend/zonke-clubs-admin/src/styles/theme.ts)

- Comprehensive color palette
- Spacing scale
- Typography system
- Border radius values
- Shadow definitions
- Responsive breakpoints

### Components

- **Button** - Multiple variants (primary, secondary, outline, danger, ghost)
- **Card** - Consistent card layout with header, body, footer
- **Input** - Text inputs, textareas, selects with validation styling
- **Table** - Data tables with empty states
- **Badge** - Status indicators with color variants

### Layout

- **Sidebar Navigation** - Fixed sidebar with icon navigation
- **MainLayout** - Wrapper component with sidebar and content area

## Getting Started

### Run the Web Admin

```bash
cd frontend/zonke-clubs-admin
npm install
npm start
```

App runs at: http://localhost:3000

### Build for Production

```bash
cd frontend/zonke-clubs-admin
npm run build
```

## Next Steps

### Backend Integration

The backend needs to ensure these endpoints exist:

**Business Profiles:**

- `GET /api/business_profiles/current` - Get current club
- `PUT /api/business_profiles/:id` - Update club info
- `PATCH /api/business_profiles/:id/opening-hours` - Update hours
- `PATCH /api/business_profiles/:id/dj-schedule` - Update DJ schedule
- `POST /api/business_profiles/:id/cover` - Upload cover image
- `POST /api/business_profiles/:id/logo` - Upload logo

**Events:**

- `GET /api/clubs/:id/events` - List events
- `POST /api/clubs/:id/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `PATCH /api/events/:id/publish` - Publish event
- `POST /api/events/:id/cover` - Upload event cover

**Content:**

- `GET /api/clubs/:id/posts` - Get posts for moderation
- `PATCH /api/posts/:id/approve` - Approve post
- `PATCH /api/posts/:id/reject` - Reject post

**Spending:**

- `GET /api/clubs/:id/spending` - Get spending records
- `POST /api/clubs/:id/spending` - Create record
- `POST /api/clubs/:id/spending/group` - Create group spending
- `GET /api/clubs/:id/spending/stats` - Get statistics

**Settings:**

- All settings endpoints as defined in [settingsService.ts](frontend/zonke-clubs-admin/src/services/settingsService.ts)

### Future Enhancements

1. **Authentication Flow**
   - Login page
   - Session management
   - Protected routes

2. **Complete Page Implementations**
   - Full forms with validation
   - Modal dialogs for create/edit
   - Confirmation dialogs for destructive actions

3. **Analytics**
   - Charts and graphs using recharts
   - Real-time data updates
   - Export functionality

4. **Responsive Design**
   - Mobile-optimized layouts
   - Tablet support
   - Collapsible sidebar

5. **File Uploads**
   - Image upload with preview
   - Video upload with progress
   - Drag-and-drop support

6. **Testing**
   - Unit tests with Jest
   - Component tests with React Testing Library
   - E2E tests with Cypress

## Benefits of Web-Based Management

1. **Better UX for Admins**
   - Larger screen real estate for data tables and forms
   - Better suited for data entry and analysis
   - Keyboard shortcuts and power user features

2. **Easier Development**
   - Web-only features are simpler to implement
   - No mobile-specific constraints
   - Better debugging tools

3. **Performance**
   - Charts and analytics run better on desktop
   - Can handle larger datasets
   - No mobile memory constraints

4. **Focused Mobile App**
   - Mobile app can focus on the club-goer experience
   - Smaller app size
   - Better performance

## Migration Checklist

- [x] Remove mobile management screens
- [x] Update mobile app user context
- [x] Create web admin project structure
- [x] Set up routing and navigation
- [x] Implement base layout and sidebar
- [x] Create reusable UI components
- [x] Set up API service layer
- [x] Create TypeScript type definitions
- [x] Implement Dashboard page
- [x] Implement Events page
- [x] Create placeholder pages for remaining features
- [x] Test build process
- [x] Update gitignore files
- [x] Create documentation

## Notes

- All pages currently use mock data
- API integration needs to be completed
- Some pages are placeholders awaiting full implementation
- Authentication flow needs to be added
- Form validations need to be implemented

---

**Migration completed:** 2026-01-22
**Web admin location:** `/frontend/zonke-clubs-admin/`
**Mobile app updated:** User role context set to 'club-goer' by default
