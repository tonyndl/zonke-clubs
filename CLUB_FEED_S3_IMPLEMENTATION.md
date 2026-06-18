# Club Feed S3 Storage Implementation

## Overview

Implemented a complete flow for uploading club feed media (images and videos) to S3 before creating posts. The approach follows: **Frontend → S3 Upload → Asset Records → Post Creation**.

---

## Architecture Flow

```
1. User selects media in AddPostModal
2. User clicks "Post"
3. Frontend uploads each media file to S3 via /api/assets
4. S3 returns asset IDs with URLs
5. Frontend creates post with asset_ids via /api/posts
6. Backend links assets to post and saves to database
7. Post is created with status="pending" for admin approval
```

---

## Backend Changes

### 1. Updated Post Schema

**File**: `backend/lib/backend/posts/post.ex`

- Added `has_many :assets` relationship
- Made `media_type` and `media_url` optional (legacy fields)
- Posts now primarily use the `assets` table for media

```elixir
schema "posts" do
  field :caption, :string
  field :status, :string, default: "pending"

  belongs_to :user, Backend.Accounts.User
  belongs_to :club, Backend.Clubs.Club
  has_many :assets, Backend.Assets.Asset  # New relationship

  timestamps()
end
```

### 2. Created Post API Controller

**File**: `backend/lib/backend_web/controllers/api/post_controller.ex`

**Endpoints**:

- `POST /api/posts` - Create post with asset IDs
- `GET /api/posts/:id` - Get single post with assets
- `GET /api/clubs/:club_id/posts` - List approved posts for a club

**Key Features**:

- Uses `Ecto.Multi` for transactional safety
- Validates assets belong to the user
- Links assets to post after creation
- Returns post with preloaded assets and user

### 3. Created Post JSON View

**File**: `backend/lib/backend_web/controllers/json/api/post_json.ex`

Returns:

```json
{
  "id": "post-uuid",
  "caption": "My post description",
  "status": "pending",
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "avatar_url": "https://..."
  },
  "assets": [
    {
      "id": "asset-uuid",
      "url": "http://localhost:4566/zonke-clubs-bucket/video_123_abc.mp4",
      "type": "video",
      "duration": 25.5,
      "start_time": 0,
      "end_time": 25.5,
      "meta": {
        "duration": 25.5,
        "start_time": 0,
        "end_time": 25.5
      }
    }
  ],
  "inserted_at": "2026-02-10T...",
  "updated_at": "2026-02-10T..."
}
```

### 4. Updated Router

**File**: `backend/lib/backend_web/router.ex`

Added to authenticated routes:

```elixir
# Posts (club feed)
post "/api/posts", PostController, :create
get "/api/posts/:id", PostController, :show
get "/api/clubs/:club_id/posts", PostController, :index
```

### 5. Enhanced Assets Context

**File**: `backend/lib/backend/assets/assets.ex`

- Validates file types (images + videos)
- Validates file size (max 50MB)
- Supports video metadata (duration, start_time, end_time)
- Generates unique filenames with timestamps

---

## Frontend Changes

### 1. Created Posts Service

**File**: `frontend/zonke-clubs/services/postsService.ts`

**Methods**:

- `uploadMedia()` - Upload single image/video to S3
- `createPost()` - Create post with asset IDs
- `getClubPosts()` - Get posts for a club
- `getPost()` - Get single post

**Upload with Progress**:

```typescript
await postsService.uploadMedia(
  { uri: "file:///...", type: "video", name: "video.mp4" },
  { duration: 25.5, start_time: 0, end_time: 25.5 },
  (progress) => console.log(`${progress}%`),
);
```

### 2. Enhanced API Service

**File**: `frontend/zonke-clubs/services/api.ts`

Added `upload()` method:

- Uses XMLHttpRequest for progress tracking
- Handles multipart/form-data
- Includes auth token
- Reports upload progress via callback

### 3. Updated AddPostModal

**File**: `frontend/zonke-clubs/components/post/AddPostModal.tsx`

**Changes**:

- Added `uploadProgress` to MediaItem interface
- Added `uploadMediaToS3()` function
- Updated `handlePost()` to:
  1. Upload all media to S3 first
  2. Collect asset IDs
  3. Create post with asset IDs
  4. Show success/error messages

**New Flow**:

```typescript
handlePost()
  → uploadMediaToS3() // Returns asset IDs
  → postsService.createPost({ club_id, asset_ids, caption })
  → Alert.alert('Success', 'Post submitted for approval!')
```

---

## Usage Example

### Mobile App - Creating a Post

```typescript
import postsService from "@/services/postsService";

// 1. Upload media files
const asset1 = await postsService.uploadMedia({
  uri: "file:///path/to/image.jpg",
  type: "image",
});

const asset2 = await postsService.uploadMedia(
  {
    uri: "file:///path/to/video.mp4",
    type: "video",
  },
  {
    duration: 25.5,
    start_time: 0,
    end_time: 25.5,
  },
  (progress) => console.log(`${progress}%`),
);

// 2. Create post
const post = await postsService.createPost({
  club_id: "club-uuid",
  asset_ids: [asset1.id, asset2.id],
  caption: "Check out this cool club night!",
});

console.log("Post created:", post.id);
// Post status is "pending" - admin must approve
```

### Backend - Asset Upload Flow

1. **Upload Asset**:

```bash
curl -X POST http://localhost:4000/api/assets \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@video.mp4" \
  -F "meta={\"duration\":25.5,\"start_time\":0,\"end_time\":25.5}"
```

2. **Response**:

```json
{
  "id": "asset-uuid",
  "filename": "video_1707486000_abc123.mp4",
  "url": "http://localhost:4566/zonke-clubs-bucket/video_1707486000_abc123.mp4?t=...",
  "meta": {
    "duration": 25.5,
    "start_time": 0,
    "end_time": 25.5
  }
}
```

3. **Create Post**:

```bash
curl -X POST http://localhost:4000/api/posts \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "club_id": "club-uuid",
    "asset_ids": ["asset-uuid-1", "asset-uuid-2"],
    "caption": "Great night at the club!"
  }'
```

---

## Key Features

### ✅ Multiple Media Support

- Upload multiple images and videos per post
- Each asset stored separately in S3
- Linked to post via `assets` table

### ✅ Video Metadata Preservation

- Duration, start_time, end_time stored in asset.meta
- Supports trimmed videos from VideoTrimmerModal
- Frontend can reconstruct trim info for playback

### ✅ Upload Progress Tracking

- Real-time progress updates during upload
- Per-file progress tracking
- User feedback during long uploads

### ✅ Transactional Safety

- Uses Ecto.Multi for atomic operations
- Assets validated before post creation
- Rollback on failure

### ✅ Admin Moderation

- All posts start as "pending"
- Admins approve/reject via `/api/admin/posts`
- Only approved posts shown to users

### ✅ S3 Integration

- LocalStack for development (no AWS costs)
- Real AWS S3 for production
- Automatic URL generation with cache busting

---

## Database Schema

### Posts Table

```sql
posts:
  id (uuid)
  caption (text)
  status (string) - "pending", "approved", "rejected"
  user_id (uuid) → users.id
  club_id (uuid) → clubs.id
  media_type (string) - LEGACY, nullable
  media_url (string) - LEGACY, nullable
  inserted_at (timestamp)
  updated_at (timestamp)
```

### Assets Table

```sql
assets:
  id (uuid)
  filename (string)
  copied (boolean)
  meta (jsonb) - Stores video duration, trim info, etc.
  user_id (uuid) → users.id
  club_id (uuid) → clubs.id
  post_id (uuid) → posts.id  ← Links asset to post
  inserted_at (timestamp)
  updated_at (timestamp)
```

---

## API Endpoints

### Assets (File Upload)

| Method | Endpoint          | Description          | Auth     |
| ------ | ----------------- | -------------------- | -------- |
| POST   | `/api/assets`     | Upload file to S3    | Required |
| GET    | `/api/assets/:id` | Get asset details    | Required |
| DELETE | `/api/assets/:id` | Delete asset from S3 | Required |

### Posts (Club Feed)

| Method | Endpoint                    | Description             | Auth     |
| ------ | --------------------------- | ----------------------- | -------- |
| POST   | `/api/posts`                | Create post with assets | Required |
| GET    | `/api/posts/:id`            | Get single post         | Required |
| GET    | `/api/clubs/:club_id/posts` | List approved posts     | Required |

### Admin (Content Moderation)

| Method | Endpoint                       | Description    | Auth  |
| ------ | ------------------------------ | -------------- | ----- |
| GET    | `/api/admin/posts`             | List all posts | Admin |
| PUT    | `/api/admin/posts/:id/approve` | Approve post   | Admin |
| PUT    | `/api/admin/posts/:id/reject`  | Reject post    | Admin |
| GET    | `/api/admin/posts/stats`       | Get stats      | Admin |

---

## Testing

### 1. Start LocalStack

```bash
cd docker
docker-compose up -d
```

### 2. Start Backend

```bash
cd backend
mix phx.server
```

### 3. Test Upload from Mobile

1. Open AddPostModal
2. Select images/videos
3. Add caption
4. Click "Post"
5. Watch upload progress
6. See success message

### 4. Verify in S3

```bash
aws --endpoint-url=http://localhost:4566 s3 ls s3://zonke-clubs-bucket/
```

### 5. Check Database

```bash
cd backend
iex -S mix

# Check assets
Backend.Repo.all(Backend.Assets.Asset) |> Enum.map(& &1.filename)

# Check posts
Backend.Repo.all(Backend.Posts.Post)
|> Backend.Repo.preload(:assets)
|> Enum.map(&length(&1.assets))
```

---

## Production Considerations

### 1. S3 Bucket Setup

- Create real S3 bucket: `zonke-clubs-bucket`
- Enable CORS for web uploads
- Set lifecycle policies for old files

### 2. File Size Limits

- Current: 50MB max per file
- Adjust `@max_file_size` in `assets.ex` if needed
- Consider CDN for large files

### 3. Video Duration

- Current: Client-side 30s limit
- Consider server-side validation with ffprobe
- See comments in `assets.ex`

### 4. Security

- Presigned URLs expire in 7 days
- Assets validated to belong to user
- Admin approval before posts go live

---

## Migration Notes

### Existing Posts

Legacy `media_type` and `media_url` fields are still supported for backward compatibility. New posts use the `assets` relationship.

### Data Migration (if needed)

```elixir
# Migrate old posts to use assets table
Backend.Repo.all(Backend.Posts.Post)
|> Enum.filter(& &1.media_url)
|> Enum.each(fn post ->
  # Create asset from legacy media_url
  # Link to post
end)
```

---

## Summary

The club feed now uses a robust S3-based media storage system:

1. ✅ **Upload First** - Media uploaded to S3 before post creation
2. ✅ **Multiple Media** - Support for multiple images/videos per post
3. ✅ **Progress Tracking** - Real-time upload progress
4. ✅ **Video Metadata** - Preserves duration and trim information
5. ✅ **Admin Moderation** - All posts require approval
6. ✅ **Transactional** - Atomic operations with rollback
7. ✅ **Production Ready** - Works with LocalStack (dev) and AWS S3 (prod)

🎉 **Ready to use!**
