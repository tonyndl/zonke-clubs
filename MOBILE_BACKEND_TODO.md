# Mobile App Features Requiring Backend Implementation

This document outlines the features in the mobile app that currently use dummy/mock data and require backend API implementation.

## Current Status Summary

### ✅ Features WITH Backend Support (Implemented)

- **Clubs** - GET /api/clubs, GET /api/clubs/:id
- **Club Favorites** - POST /api/clubs/:id/like, DELETE /api/clubs/:id/like, GET /api/clubs/favorites
- **Connection Requests** - Full CRUD via /api/connection-requests/\*
- **Messaging** - Full support via /api/threads/_ and /api/messages/_
- **Intentions (Meetup)** - GET /api/clubs/:club_id/intentions, POST /api/intentions
- **DJ Schedules** - GET /api/clubs/:id/schedule
- **Events** - GET /api/clubs/:id/events
- **User Spending** - GET /api/spending/history, GET /api/spending/stats, GET /api/spending/club/:club_id

### ❌ Features NEEDING Backend Implementation

## 1. Posts & Content Sharing

**Current State:**

- Types defined in `types/post.ts`
- All mock data removed
- Profile screen cannot display user posts

**Backend Needed:**

```
User-facing endpoints:
- GET /api/clubs/:id/posts?page=1&per_page=20&status=approved
  Returns: { posts: ClubPost[], pagination: {...} }

- GET /api/posts/my-posts
  Returns: { posts: ClubPost[] } (user's own posts across all clubs)

- POST /api/posts
  Body: { club_id, media_type, media_url, caption? }
  Returns: { post: ClubPost }

- DELETE /api/posts/:id
  (user can only delete their own posts)

- POST /api/posts/:id/like
  Returns: { likes: number }

- DELETE /api/posts/:id/like
  Returns: { likes: number }
```

**Currently Exists:**

- Admin endpoints: GET /api/admin/posts, PUT /api/admin/posts/:id/approve, PUT /api/admin/posts/:id/reject
- Context: `Backend.Posts.list_posts/2`, `Backend.Posts.create_post/1`
- Schema: `Backend.Posts.Post`

**What's Missing:**

- User-facing controller for creating posts
- Public endpoint to fetch approved posts for a club
- Like/unlike functionality for posts
- User can fetch their own posts

**Migration Required:** None (schema exists)

**Implementation Checklist:**

- [ ] Create user-facing PostController (lib/backend_web/controllers/api/post_controller.ex)
- [ ] Add routes in router.ex for user post endpoints
- [ ] Implement post creation with media upload (integrate with Assets)
- [ ] Implement post likes (create schema and functions)
- [ ] Add JSON view for posts
- [ ] Update mobile app to use real API (remove TODO from types/post.ts)

---

## 2. DJ Lineup Song Requests

**Current State:**

- Screen: `app/club/[id]/day.tsx`
- Uses local dummy data: `sampleLineup`, `sampleRequests`
- Song requests stored only in component state

**Backend Needed:**

```
- POST /api/clubs/:club_id/song-requests
  Body: { song_name, day_of_week, requested_for_date? }
  Returns: { request: SongRequest }

- GET /api/clubs/:club_id/song-requests?day=Mon&date=2026-02-10
  Returns: { requests: SongRequest[] }

- POST /api/song-requests/:id/vote
  Toggle vote up/down
  Returns: { request: SongRequest }

- GET /api/clubs/:club_id/schedule (already exists, returns DJ lineup)
```

**Schema Needed:**

```elixir
schema "song_requests" do
  belongs_to :club, Club
  belongs_to :user, User
  field :song_name, :string
  field :day_of_week, :integer # 0-6 (Sunday-Saturday)
  field :requested_for_date, :date
  field :vote_count, :integer, default: 1
  field :voters, {:array, Ecto.UUID}, default: [] # User IDs who voted

  timestamps()
end
```

**Implementation Checklist:**

- [ ] Create migration for song_requests table
- [ ] Create schema Backend.SongRequests.SongRequest
- [ ] Create context Backend.SongRequests
- [ ] Create controller BackendWeb.API.SongRequestController
- [ ] Add routes in router.ex
- [ ] Update day.tsx to use real API

---

## 3. Receipt Scanning & Spending History (Social Feature)

**Current State:**

- Screen: `app/screens/Scan.tsx`
- Uses `MOCK_RECEIPTS` array (lines 41-100)
- Receipt history with images/videos, likes, split info

**Backend Needed:**

```
- POST /api/receipts
  Body: { club_id, media_url, media_type, amount, items?, split_with? }
  Returns: { receipt: Receipt }

- GET /api/receipts/history
  Returns: { receipts: Receipt[] }

- POST /api/receipts/:id/like
  Returns: { likes: number }

- DELETE /api/receipts/:id/like
  Returns: { likes: number }

- DELETE /api/receipts/:id
```

**Schema Needed:**

```elixir
schema "receipts" do
  belongs_to :club, Club
  belongs_to :user, User
  field :media_url, :string
  field :media_type, :string # 'image' | 'video'
  field :amount, :decimal
  field :items, {:array, :map} # [%{name, price, quantity}]
  field :split_with_count, :integer
  field :like_count, :integer, default: 0

  timestamps()
end

schema "receipt_likes" do
  belongs_to :receipt, Receipt
  belongs_to :user, User
  timestamps()
end
```

**Note:** This overlaps with the existing `spending_records` functionality but adds a social/shareable aspect with media and likes.

**Implementation Checklist:**

- [ ] Decide: Extend spending_records or create separate receipts feature?
- [ ] Create migration
- [ ] Create schema and context
- [ ] Create controller and routes
- [ ] Update Scan.tsx to use real API

---

## 4. Global Beer/Spending Leaderboard

**Current State:**

- Component: `components/leaderboard/BeerLeaderboard.tsx`
- Uses massive `MOCK_LEADERBOARD` array (50+ entries)
- Shows global leaderboard across all clubs
- Filter by brand, sort by consumption or spending

**Backend Needed:**

```
- GET /api/spending/global-leaderboard?limit=50&time_period=week&brand=castle_lite
  Returns: {
    leaderboard: [{
      rank, user_id, first_name, last_name, avatar_url,
      beer_count, liters_consumed, total_spent,
      club_name, favorite_brand, streak, badges
    }]
  }
```

**Currently Exists:**

- Per-club leaderboard: GET /api/admin/spending-records/leaderboard (admin only)
- User spending: GET /api/spending/stats, GET /api/spending/history

**What's Missing:**

- Global (cross-club) leaderboard endpoint
- Brand filtering capability
- Streak tracking
- Badge system

**Implementation Checklist:**

- [ ] Add GET /api/spending/global-leaderboard endpoint in SpendingController
- [ ] Implement Backend.Spending.SpendingRecords.get_global_leaderboard/1
- [ ] Add brand filtering logic
- [ ] (Optional) Implement streak calculation
- [ ] (Optional) Implement badge system
- [ ] Update BeerLeaderboard.tsx to use real API

---

## 5. Group Spending / Bill Splitting (User-Facing)

**Current State:**

- Component: `components/spending/GroupSpendingModal.tsx`
- Component: `components/receipt/SplitOptionsModal.tsx`
- Uses `MOCK_MEMBERS` and `MOCK_FRIENDS` arrays
- UI for splitting bills with friends

**Backend Needed:**

```
User-facing endpoints to create group spending:
- POST /api/spending/group
  Body: {
    club_id,
    total_amount,
    members: [{ user_id, amount }],
    split_type: 'equal' | 'custom'
  }
  Returns: { spending_records: SpendingRecord[] }
```

**Currently Exists:**

- Admin can create group spending: POST /api/admin/spending-records (with records array)
- Schema fields exist: group_outing_id, split_type, original_amount, participant_ids

**What's Missing:**

- User-facing endpoint to create group spending
- Friend list / connections integration for selecting split participants
- Notifications for people included in splits

**Implementation Checklist:**

- [ ] Add user-facing route: POST /api/spending/group
- [ ] Update SpendingController to handle user-initiated group spending
- [ ] Integrate with connection requests (friends list) for member selection
- [ ] Add notifications when included in a split
- [ ] Update GroupSpendingModal.tsx to use real API

---

## 6. Day-specific Features (Minor)

**Current State:**

- `app/club/[id]/day.tsx` line 17: Hardcoded fallback clubId for testing

**Backend Status:**

- DJ schedule endpoint exists: GET /api/clubs/:id/schedule
- Just needs song requests (covered in #2 above)

---

## Implementation Priority Recommendation

**High Priority (Core Social Features):**

1. **Posts & Content Sharing** - Core engagement feature
2. **Global Leaderboard** - Gamification, user engagement
3. **Song Requests** - Unique club interaction feature

**Medium Priority:** 4. **User-Facing Group Spending** - Convenience feature, schema exists 5. **Receipt Scanning** - Social proof, nice-to-have

**Notes:**

- Many schemas already exist (spending_records, posts)
- Main work is creating user-facing controllers and routes
- Consider batch implementation: Do all spending features together (leaderboard + group spending)
