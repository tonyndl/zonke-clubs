# Video Upload Implementation - 30 Second Maximum Duration

## 🎥 Overview

I've extended the S3 storage system to support video uploads with a **30-second maximum duration** limit across the entire app (web and mobile).

---

## ✨ What's New

### **Backend Validation**

- **File type validation**: Only allows specific image and video formats
- **File size limit**: 50MB maximum
- **Video duration**: Enforced via client-side validation (30 seconds max)
- **Supported video formats**: MP4, MOV, AVI, MPEG

### **Frontend Components**

#### **Mobile (React Native) - MediaPicker**

- Replaces/extends `ImagePicker` with full media support
- **Camera recording** with 30-second limit
- **Library selection** with duration validation
- **Real-time duration display** during upload
- **Permission handling** for camera and library

#### **Admin Web - MediaUpload**

- Drag & drop for videos and images
- **Client-side duration validation** before upload
- **Video preview** with playback controls
- **Duration badge** showing current vs max duration
- **Error messaging** for oversized/too-long videos

---

## 🚀 Usage

### **Mobile (React Native)**

```tsx
import { MediaPicker } from "@/components/ui";

function CreatePost() {
  const handleUpload = (asset: any) => {
    console.log("Uploaded:", asset);
    // asset.meta.type will be 'image' or 'video'
    // asset.meta.duration will have video duration in seconds
  };

  return (
    <MediaPicker
      onUploadSuccess={handleUpload}
      entityType="post"
      entityId={postId}
      label="Upload Photo or Video"
      mediaType="both" // 'image' | 'video' | 'both'
      maxVideoDuration={30} // seconds
    />
  );
}
```

**Features:**

- ✅ Take photo with camera
- ✅ Record video with camera (30s max)
- ✅ Choose from library
- ✅ Duration validation before upload
- ✅ Visual duration indicator
- ✅ Permission requests

**Alert Options:**

```
Upload Media
├─ Take Photo
├─ Choose Photo
├─ Record Video (max 30s)
├─ Choose Video
└─ Cancel
```

---

### **Admin Web**

```tsx
import { MediaUpload } from "@/components/MediaUpload/MediaUpload";

function ClubGallery() {
  const handleUpload = (asset: any) => {
    console.log("Uploaded:", asset);
  };

  return (
    <MediaUpload
      onUploadSuccess={handleUpload}
      entityType="club"
      entityId={clubId}
      label="Upload Media"
      mediaType="both" // 'image' | 'video' | 'both'
      maxVideoDuration={30} // seconds
    />
  );
}
```

**Features:**

- ✅ Drag & drop support
- ✅ Click to browse files
- ✅ Video playback preview
- ✅ Duration validation before upload
- ✅ Error messages for invalid files
- ✅ File size and type validation

---

## 📋 Validation Rules

### **File Types**

**Images:**

- `image/jpeg`, `image/jpg`
- `image/png`
- `image/gif`
- `image/webp`

**Videos:**

- `video/mp4`
- `video/quicktime` (MOV)
- `video/x-msvideo` (AVI)
- `video/mpeg`

### **Limits**

| Constraint                  | Value      |
| --------------------------- | ---------- |
| Max video duration          | 30 seconds |
| Max file size               | 50MB       |
| Expires in (presigned URLs) | 7 days     |

---

## 🔧 Backend Changes

### **Assets Context** (`lib/backend/assets/assets.ex`)

**New Constants:**

```elixir
@max_video_duration 30  # 30 seconds
@max_file_size 50 * 1024 * 1024  # 50MB

@allowed_image_types ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
@allowed_video_types ["video/mp4", "video/quicktime", "video/x-msvideo", "video/mpeg"]
```

**New Validation Functions:**

```elixir
defp validate_file(%Plug.Upload{}) do
  with :ok <- validate_file_type(content_type),
       :ok <- validate_file_size(path),
       :ok <- validate_video_metadata(file) do
    :ok
  end
end

defp validate_file_type(content_type) # Checks against allowed types
defp validate_file_size(path)         # Checks 50MB limit
defp validate_video_metadata(file)    # Placeholder for server-side duration check
```

**Updated Functions:**

- `upload_and_save/1` - Now validates file before upload
- `update_asset_with_file/2` - Now validates file before update

---

## 📊 Asset Response Format

```json
{
  "id": "asset-uuid",
  "filename": "video_1707486000_abc123.mp4",
  "url": "http://localhost:4566/zonke-clubs-bucket/video_1707486000_abc123.mp4?t=1707486000",
  "club_id": "club-uuid",
  "user_id": null,
  "post_id": null,
  "copied": false,
  "meta": {
    "type": "video",
    "duration": 25.4
  },
  "inserted_at": "2024-02-09T12:00:00Z",
  "updated_at": "2024-02-09T12:00:00Z"
}
```

**Key Fields:**

- `meta.type` - Either `"image"` or `"video"`
- `meta.duration` - Video duration in seconds (only for videos)

---

## 🎬 Client-Side Duration Validation

### **Mobile (React Native)**

Uses `expo-av` to load video metadata:

```tsx
const validateVideoDuration = async (uri: string): Promise<boolean> => {
  const video = new Audio.Sound();
  const status = await video.loadAsync({ uri }, {}, false);
  const duration = status.durationMillis / 1000;

  if (duration > maxVideoDuration) {
    Alert.alert("Video Too Long", `Max ${maxVideoDuration}s`);
    return false;
  }
  return true;
};
```

### **Web**

Uses HTML5 Video element metadata:

```tsx
const validateFile = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const videoElement = document.createElement("video");
    videoElement.preload = "metadata";

    videoElement.onloadedmetadata = () => {
      const duration = videoElement.duration;

      if (duration > maxVideoDuration) {
        setError(`Video must be ${maxVideoDuration}s or less`);
        resolve(false);
      } else {
        resolve(true);
      }
    };

    videoElement.src = URL.createObjectURL(file);
  });
};
```

---

## 🚨 Error Handling

### **Client Errors**

**Mobile:**

```
Alert: "Video Too Long"
Message: "Please select a video that is 30 seconds or shorter.
          Your video is 45 seconds."
```

**Web:**

```
ErrorMessage: "Video duration must be 30 seconds or less.
               Your video is 45 seconds."
```

### **Backend Errors**

```elixir
# File type error
{:error, "File type video/x-matroska not allowed. Supported: ..."}

# File size error
{:error, "File size 52428800 bytes exceeds maximum of 52428800 bytes (50MB)"}

# Upload failure
{:error, "Failed to upload file: ..."}
```

---

## 🎨 UI Features

### **Mobile**

- **Duration Badge**: Shows `25s / 30s` during preview
- **Video Icon**: `videocam` icon for videos
- **Change Button**: Tap to replace video
- **Remove Button**: X icon to delete
- **Loading State**: "Uploading..." overlay

### **Web**

- **Duration Badge**: Top-left corner shows `25s / 30s`
- **Video Preview**: Native HTML5 video player with controls
- **Drag & Drop**: Visual feedback when dragging
- **Error Messages**: Red error box below upload area
- **Progress**: "Uploading..." text during upload

---

## 📝 Example Implementations

### **Post Creation with Video**

```tsx
import { MediaPicker } from "@/components/ui";

function CreatePostScreen() {
  const [mediaAsset, setMediaAsset] = useState(null);

  return (
    <View>
      <MediaPicker
        onUploadSuccess={(asset) => {
          setMediaAsset(asset);
          // Use asset.url to display uploaded media
          // Use asset.meta.type to determine if image or video
        }}
        entityType="post"
        entityId={postId}
        mediaType="both"
        maxVideoDuration={30}
      />

      {mediaAsset && (
        <Text>
          Uploaded {mediaAsset.meta.type}
          {mediaAsset.meta.duration &&
            ` (${Math.round(mediaAsset.meta.duration)}s)`}
        </Text>
      )}
    </View>
  );
}
```

### **Club Media Gallery**

```tsx
import { MediaUpload } from "@/components/MediaUpload/MediaUpload";

function ClubGallery() {
  const [media, setMedia] = useState([]);

  return (
    <div>
      <MediaUpload
        onUploadSuccess={(asset) => {
          setMedia([...media, asset]);
        }}
        entityType="club"
        entityId={clubId}
        mediaType="both"
        maxVideoDuration={30}
      />

      <div className="gallery">
        {media.map((item) =>
          item.meta.type === "video" ? (
            <video key={item.id} src={item.url} controls />
          ) : (
            <img key={item.id} src={item.url} alt="" />
          ),
        )}
      </div>
    </div>
  );
}
```

---

## 🔄 Migration from ImagePicker

### **Before (Images Only)**

```tsx
<ImagePicker
  onUploadSuccess={handleUpload}
  entityType="user"
  entityId={userId}
/>
```

### **After (Images + Videos)**

```tsx
<MediaPicker
  onUploadSuccess={handleUpload}
  entityType="user"
  entityId={userId}
  mediaType="both" // NEW: supports videos
  maxVideoDuration={30} // NEW: 30s limit
/>
```

**Backward Compatible:**

- `ImagePicker` still exists for image-only use cases
- `MediaPicker` is a superset with video support

---

## 🎯 Key Differences: Images vs Videos

| Feature            | Images               | Videos                      |
| ------------------ | -------------------- | --------------------------- |
| Edit before upload | ✅ Yes (crop/rotate) | ❌ No                       |
| Duration limit     | N/A                  | ✅ 30 seconds               |
| Preview            | Static image         | Video player with controls  |
| Metadata           | N/A                  | Duration in `meta.duration` |
| Icon               | `image-outline`      | `videocam-outline`          |
| Size limit         | 50MB                 | 50MB                        |

---

## 🧪 Testing

### **Test Video Upload (Mobile)**

1. Open MediaPicker
2. Tap "Record Video (max 30s)"
3. Record for 25 seconds → ✅ Upload succeeds
4. Record for 35 seconds → ❌ Error: "Video too long"

### **Test Video Upload (Web)**

1. Drag a 20s MP4 file → ✅ Upload succeeds
2. Drag a 40s MP4 file → ❌ Error message displayed
3. Click to browse, select MOV file → ✅ Upload succeeds

### **Verify Backend**

```bash
# Check uploaded video in LocalStack
aws --endpoint-url=http://localhost:4566 s3 ls s3://zonke-clubs-bucket/

# Download and check duration
aws --endpoint-url=http://localhost:4566 s3 cp \
  s3://zonke-clubs-bucket/video_xyz.mp4 ./test.mp4

ffprobe -v error -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 test.mp4
```

---

## 🚀 Production Considerations

### **Future Enhancements**

1. **Server-Side Duration Validation**
   - Install `ffmpeg`/`ffprobe` on server
   - Validate duration on backend (don't trust client)

   ```elixir
   System.cmd("ffprobe", [
     "-v", "error",
     "-show_entries", "format=duration",
     "-of", "default=noprint_wrappers=1:nokey=1",
     path
   ])
   ```

2. **Video Transcoding**
   - Convert all videos to web-optimized MP4
   - Generate thumbnail images
   - Create multiple quality versions

3. **Streaming**
   - Use CloudFront for video delivery
   - Enable HLS/DASH for adaptive streaming

4. **Compression**
   - Client-side video compression before upload
   - Reduce file sizes automatically

---

## 📚 Summary

✅ **30-second video limit** enforced on mobile and web
✅ **Client-side duration validation** before upload
✅ **File type and size validation** on backend
✅ **Drag & drop** support on web
✅ **Camera recording** on mobile with duration limit
✅ **Video preview** with playback controls
✅ **Error messaging** for invalid files
✅ **Duration badges** showing time limits
✅ **Backward compatible** with existing ImagePicker

**Components:**

- `MediaPicker` (Mobile) - `/components/ui/MediaPicker.tsx`
- `MediaUpload` (Web) - `/components/MediaUpload/MediaUpload.tsx`

🎉 **Ready to upload videos with 30-second limit!** 🚀
