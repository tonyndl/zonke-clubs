import * as FileSystem from "expo-file-system/legacy";

// Lazy-load ffmpeg-kit-react-native — it's a native module unavailable in Expo Go.
// In Expo Go the require() throws, so we fall back to a no-op trim (original file
// is uploaded with start_time/end_time metadata so the server can handle it).
let _FFmpegKit: any = null;
let _ReturnCode: any = null;
try {
  const mod = require("ffmpeg-kit-react-native");
  _FFmpegKit = mod.FFmpegKit;
  _ReturnCode = mod.ReturnCode;
} catch (_) {
  console.warn(
    "ffmpeg-kit-react-native not available (Expo Go). " +
      "Video will be uploaded without client-side trimming.",
  );
}

interface TrimOptions {
  videoUri: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  onProgress?: (progress: number) => void;
}

interface TrimResult {
  uri: string;
  duration: number;
  size: number;
}

/**
 * Trims a video to the specified time range using FFmpeg.
 * Uses stream copy (-c copy) for fast, lossless cutting without re-encoding.
 * Falls back to returning the original URI when running in Expo Go
 * (ffmpeg-kit-react-native is a native module not bundled with Expo Go).
 */
export async function trimVideo(options: TrimOptions): Promise<TrimResult> {
  const { videoUri, startTime, endTime, onProgress } = options;
  const duration = endTime - startTime;

  onProgress?.(5);

  // Expo Go fallback — skip client-side trim, upload original with metadata
  if (!_FFmpegKit) {
    const fileInfo = await FileSystem.getInfoAsync(videoUri);
    const size = "size" in fileInfo ? fileInfo.size : 0;
    onProgress?.(100);
    return { uri: videoUri, duration, size: size || 0 };
  }

  const fileName = `trimmed_${Date.now()}.mp4`;
  const outputUri = `${FileSystem.cacheDirectory}${fileName}`;

  // Normalize input URI — FFmpegKit handles file:// URIs on both platforms.
  const inputPath = videoUri.startsWith("file://")
    ? videoUri
    : `file://${videoUri}`;
  const outputPath = outputUri.startsWith("file://")
    ? outputUri
    : `file://${outputUri}`;

  // -ss before -i = fast input seek (keyframe-accurate, near-instant)
  // -t = duration to extract
  // -c copy = no re-encoding (lossless, very fast)
  // -avoid_negative_ts make_zero = fix timestamp issues at trim boundaries
  const command = `-ss ${startTime} -i "${inputPath}" -t ${duration} -c copy -avoid_negative_ts make_zero "${outputPath}"`;

  const session = await _FFmpegKit.execute(command);
  const returnCode = await session.getReturnCode();

  if (!_ReturnCode.isSuccess(returnCode)) {
    const logs = await session.getLogsAsString();
    console.error("FFmpeg trim failed:", logs);
    throw new Error("Failed to trim video. Please try again.");
  }

  onProgress?.(95);

  const fileInfo = await FileSystem.getInfoAsync(outputUri);
  const size = "size" in fileInfo ? fileInfo.size : 0;

  onProgress?.(100);

  return { uri: outputUri, duration, size: size || 0 };
}

/**
 * Gets the size of a video file
 */
export async function getVideoSize(uri: string): Promise<number> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    return "size" in fileInfo ? fileInfo.size : 0;
  } catch (error) {
    console.error("Error getting video size:", error);
    return 0;
  }
}

/**
 * Clears cached trimmed videos to free up space
 */
export async function clearTrimmedVideos(): Promise<void> {
  try {
    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) return;

    const files = await FileSystem.readDirectoryAsync(cacheDir);
    const trimmedFiles = files.filter((file) => file.startsWith("trimmed_"));

    for (const file of trimmedFiles) {
      await FileSystem.deleteAsync(`${cacheDir}${file}`, { idempotent: true });
    }
  } catch (error) {
    console.error("Error clearing trimmed videos:", error);
  }
}

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
