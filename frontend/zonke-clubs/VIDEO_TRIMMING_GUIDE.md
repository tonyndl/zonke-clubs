# Video Trimming Implementation Guide

## Overview

The video trimming feature allows users to trim videos longer than 30 seconds before posting. The implementation uses **expo-video** for the UI/UX and stores trim metadata with the video.

## Current Implementation

### Frontend (Mobile)

**Files:**

- `/components/post/VideoTrimmerModal.tsx` - Ultra-thin, modern trim UI
- `/components/post/AddPostModal.tsx` - Post creation with trim integration
- `/utils/videoProcessor.ts` - Video processing utilities

**How it works:**

1. User selects/records a video > 30 seconds
2. `VideoTrimmerModal` automatically opens
3. User drags ultra-thin handles to select 30-second segment
4. Video metadata is stored: `{ uri, startTime, endTime, duration }`
5. Processing overlay shows progress (currently just copies file)
6. Trimmed video data ready for upload

**Technologies:**

- **expo-video** - Video playback and preview
- **react-native-reanimated** - Smooth handle animations
- **react-native-gesture-handler** - Draggable trim controls
- **expo-linear-gradient** - Modern visual effects
- **expo-file-system** - File operations

### What's NOT Implemented Yet

⚠️ **Client-side video encoding is NOT implemented**

The current implementation:

- ✅ Provides beautiful trim UI
- ✅ Stores trim metadata (startTime, endTime)
- ✅ Shows processing overlay
- ❌ Does NOT actually encode/trim the video file
- ❌ Uploads full video with metadata

This is intentional! Here's why:

## Why Not Client-Side Trimming?

### Industry Standard: Backend Processing

Major apps (Instagram, TikTok, YouTube) do video processing on the **backend**:

**Pros:**

- ⚡ Faster uploads (no encoding delay)
- 🔋 Saves battery (encoding is CPU-intensive)
- ✅ More reliable (server-grade FFmpeg)
- 📱 Works on all devices (no compatibility issues)
- 🎯 Better UX (process in background)

**Cons of Client-Side:**

- 🐌 Slow on older devices (30+ seconds for encoding)
- 🔋 Drains battery significantly
- ❌ Can fail on low-end devices
- 📱 Requires native modules (FFmpeg)
- 🔴 Poor UX (user waits for encoding)

## Backend Implementation Guide

### Step 1: Update Backend Schema

Add trim metadata to posts table:

```elixir
# backend/priv/repo/migrations/XXXXXX_add_video_trim_metadata.exs
defmodule Backend.Repo.Migrations.AddVideoTrimMetadata do
  use Ecto.Migration

  def change do
    alter table(:posts) do
      add :video_trim_start, :float  # Start time in seconds
      add :video_trim_end, :float    # End time in seconds
    end
  end
end
```

### Step 2: Accept Trim Metadata in API

```elixir
# backend/lib/backend/posts/post.ex
@optional_fields [
  :description,
  :video_trim_start,
  :video_trim_end
]

def changeset(post, attrs) do
  post
  |> cast(attrs, @required_fields ++ @optional_fields)
  |> validate_required(@required_fields)
  |> validate_video_trim()
end

defp validate_video_trim(changeset) do
  start = get_field(changeset, :video_trim_start)
  end_ = get_field(changeset, :video_trim_end)

  if start && end_ do
    if end_ - start > 30 do
      add_error(changeset, :video_trim_end, "trim range must be 30 seconds or less")
    else
      changeset
    end
  else
    changeset
  end
end
```

### Step 3: Process Videos with FFmpeg

```elixir
# backend/lib/backend/posts/video_processor.ex
defmodule Backend.Posts.VideoProcessor do
  @moduledoc """
  Processes videos using FFmpeg to trim them according to metadata
  """

  def trim_video(video_path, start_time, end_time) do
    output_path = generate_output_path(video_path)
    duration = end_time - start_time

    # FFmpeg command to trim video
    System.cmd("ffmpeg", [
      "-i", video_path,
      "-ss", to_string(start_time),
      "-t", to_string(duration),
      "-c", "copy",  # Copy codec (fast, no re-encoding)
      "-y",
      output_path
    ])

    {:ok, output_path}
  rescue
    error ->
      {:error, "Failed to trim video: #{inspect(error)}"}
  end

  defp generate_output_path(original_path) do
    timestamp = :os.system_time(:millisecond)
    "trimmed_#{timestamp}_#{Path.basename(original_path)}"
  end
end
```

### Step 4: Background Job for Processing

```elixir
# backend/lib/backend/posts/posts.ex
def create_post(attrs, session) do
  with {:ok, post} <- create_post_record(attrs, session),
       {:ok, post} <- process_video_if_needed(post) do
    {:ok, post}
  end
end

defp process_video_if_needed(post) do
  if post.video_trim_start && post.video_trim_end do
    # Queue background job
    Backend.Jobs.TrimVideoJob.enqueue(post.id)
    {:ok, post}
  else
    {:ok, post}
  end
end
```

### Step 5: Update Mobile to Send Metadata

```typescript
// Already implemented! The MediaItem interface includes:
interface MediaItem {
  uri: string;
  type: "image" | "video";
  duration?: number;
  startTime?: number; // ✅ Already here
  endTime?: number; // ✅ Already here
}

// When posting, send this data to backend
const formData = new FormData();
formData.append("description", description);
formData.append("video", {
  uri: mediaItem.uri,
  type: "video/mp4",
  name: "video.mp4",
});

if (mediaItem.startTime && mediaItem.endTime) {
  formData.append("video_trim_start", mediaItem.startTime.toString());
  formData.append("video_trim_end", mediaItem.endTime.toString());
}
```

## Alternative: Client-Side Trimming (Not Recommended)

If you really need client-side trimming, you'll need:

1. **Create Expo Development Build** (can't use Expo Go)
2. **Install FFmpeg native module**:
   ```bash
   npm install react-native-ffmpeg
   ```
3. **Update videoProcessor.ts** to use FFmpeg
4. **Handle long processing times** (30+ seconds)
5. **Show progress** properly
6. **Handle errors** gracefully

## Recommended Approach

✅ **Use the current implementation** (UI + metadata)
✅ **Add backend processing** (steps above)
✅ **Process videos asynchronously** on server
✅ **Show "Processing..." state** in app until ready

This gives the best UX:

- Instant upload
- No battery drain
- Reliable processing
- Works on all devices

## Testing

**Current features to test:**

1. Select video > 30s → Trimmer opens automatically ✅
2. Drag handles to select 30s segment ✅
3. Ultra-thin modern UI ✅
4. Processing overlay shows ✅
5. Trim metadata stored in MediaItem ✅
6. Can't post untrimmed long videos ✅

**After backend implementation:**

1. Upload video with trim metadata
2. Backend trims video asynchronously
3. Trimmed version available in posts
4. Original video can be deleted

## Future Enhancements

- [ ] Real-time thumbnail strip (show frames along timeline)
- [ ] Multiple trim segments (Instagram-style)
- [ ] Trim videos in post editor (after posting)
- [ ] Auto-detect best moments (AI)
- [ ] Video filters and effects
- [ ] Audio trimming/sync

## Summary

**Current State:**

- ✅ Beautiful, modern trim UI
- ✅ Perfect UX for selecting 30s clips
- ✅ Metadata storage ready
- ⏳ Backend processing needed for actual trimming

**Next Steps:**

1. Add backend FFmpeg processing
2. Update API to accept trim metadata
3. Create background jobs for video processing
4. Test end-to-end workflow

The UI/UX is **production-ready**. Just needs backend support! 🎬✂️
