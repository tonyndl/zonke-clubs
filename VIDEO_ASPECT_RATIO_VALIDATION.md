# Video Aspect Ratio Guide - Discover Tab Feed

## Overview

Guide for optimal video aspect ratios to ensure videos fit perfectly on the discover tab feed (TikTok-style vertical video player).

## Current Implementation

### Video Display ([ClubVideoFeed.tsx](frontend/zonke-clubs/components/discover/ClubVideoFeed.tsx))

The discover tab uses **`contentFit="cover"`** which:

- Scales the video to fill the entire container
- Maintains the video's aspect ratio
- Crops edges if the aspect ratio doesn't match the screen
- Ensures no black bars (letterboxing)

```typescript
<VideoView
  player={player}
  style={styles.video}
  contentFit="cover"  // Fills screen, crops if needed
  nativeControls={false}
/>
```

### Container Dimensions

- **Width**: Full screen width (`SCREEN_WIDTH`)
- **Height**: `SCREEN_HEIGHT - TAB_BAR_HEIGHT - insets.top`
  - Accounts for tab bar (~100px)
  - Accounts for device notches/status bar

## Recommended Video Specifications

### Optimal Resolutions (9:16 ratio)

For videos to fit perfectly without cropping:

- **1080x1920** (Full HD) - Best quality for high-end devices
- **720x1280** (HD) - Good balance of quality and file size
- **540x960** (SD) - Acceptable for lower-end devices

### Why 9:16?

- **Industry Standard**: Used by TikTok, Instagram Reels, YouTube Shorts
- **Natural Fit**: Matches typical phone screen ratios (varies from ~1:1.75 to ~1:1.85)
- **Minimal Cropping**: On most devices, 9:16 videos require little to no cropping

### What Happens with Other Ratios?

With `contentFit="cover"`:

| Aspect Ratio          | Result                              | Example Resolutions |
| --------------------- | ----------------------------------- | ------------------- |
| **9:16 (Vertical)**   | ✅ Perfect fit, minimal/no cropping | 1080x1920, 720x1280 |
| **16:9 (Horizontal)** | ⚠️ Significant cropping on sides    | 1920x1080, 1280x720 |
| **1:1 (Square)**      | ⚠️ Cropping on top/bottom           | 1080x1080, 720x720  |
| **4:5 (Instagram)**   | ⚠️ Moderate cropping on top/bottom  | 1080x1350           |

## Frontend Implementation

### Metadata Tracking

The frontend now captures video dimensions for metadata purposes:

**[postsService.ts](frontend/zonke-clubs/services/postsService.ts):**

```typescript
meta: {
  duration?: number;
  start_time?: number;
  end_time?: number;
  width?: number;   // Video width
  height?: number;  // Video height
}
```

**[AddPostModal.tsx](frontend/zonke-clubs/components/post/AddPostModal.tsx):**

- Captures width/height from ImagePicker when selecting videos
- Stores dimensions in MediaItem interface
- Sends dimensions in metadata on upload
- Preserves dimensions after video trimming

### Why Track Dimensions?

While not currently validated, tracking dimensions enables:

- Future analytics on video formats
- Potential UI hints to users about optimal formats
- Debugging video display issues
- Future auto-cropping or format conversion features

## User Experience

### Current Behavior

1. **All videos accepted**: No aspect ratio restrictions on upload
2. **Automatic fitting**: Videos automatically scaled to fill screen
3. **Cropping when needed**: Videos with non-vertical ratios will be cropped to fit

### Display Quality by Ratio

- **9:16 videos**: Display perfectly, utilize full screen
- **Other ratios**: May have portions cropped, but still usable
- **16:9 videos**: Will show "zoomed in" with sides cropped

## Best Practices for Content Creators

### Recommendations

1. **Film in 9:16** (vertical) when possible
2. **Keep important content centered** to avoid cropping issues
3. **Use 1080x1920 resolution** for best quality
4. **Avoid text/logos near edges** if not filming in 9:16

### Mobile Recording Tips

- Most phone cameras default to 16:9 (horizontal)
- Use camera apps that support vertical video recording
- Record in portrait mode for 9:16 naturally

## Technical Details

### Video Container Sizing

```typescript
// Calculate available height
const VIDEO_HEIGHT = SCREEN_HEIGHT - TAB_BAR_HEIGHT - insets.top;

// Each video gets full width and calculated height
<View style={{ height: VIDEO_HEIGHT }}>
  <VideoPlayer ... />
</View>
```

### Performance Optimization

- `contentFit="cover"` is GPU-accelerated
- Efficient rendering on all devices
- Smooth scrolling in feed

## Future Enhancements

Possible future features:

1. **Upload hints**: Show aspect ratio suggestions during upload
2. **Preview cropping**: Let users see how their video will display
3. **Auto-rotation**: Detect and rotate horizontal videos
4. **Smart cropping**: AI-based cropping to keep important content visible
5. **Format warnings**: Gentle notifications about suboptimal aspect ratios

## Summary

**Current State:**

- ✅ All video formats accepted
- ✅ Videos automatically fit to screen using `contentFit="cover"`
- ✅ Smooth TikTok-style vertical scrolling
- ✅ Dimensions tracked in metadata

**Recommendation:**

- 📱 **Film in 9:16 (vertical)** for best results
- 🎥 **1080x1920 resolution** for optimal quality
- 🎯 **Center important content** to avoid cropping
