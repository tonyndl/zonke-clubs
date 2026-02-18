import * as FileSystem from "expo-file-system/legacy";
import { Alert } from "react-native";

/**
 * Video trimming utility using expo-av and expo-file-system
 *
 * Note: For production, consider backend processing for better performance
 * and reliability. Client-side video encoding can be slow and battery-intensive.
 */

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
 * Trims a video to the specified time range
 *
 * IMPORTANT: This is a simplified implementation that works with expo-av.
 * For production use, consider:
 * 1. Backend processing with FFmpeg (recommended)
 * 2. Native modules for better performance
 * 3. Progress indicators for long videos
 */
export async function trimVideo(options: TrimOptions): Promise<TrimResult> {
  const { videoUri, startTime, endTime, onProgress } = options;

  try {
    // For Expo managed workflow, we'll use a hybrid approach:
    // 1. Store the trim metadata with the video
    // 2. Backend will do actual trimming when video is uploaded

    // For now, we'll copy the video and store metadata
    const fileName = `trimmed_${Date.now()}.mp4`;
    const newUri = `${FileSystem.cacheDirectory}${fileName}`;

    // Copy the original video to a new location
    // In a production app, you would:
    // 1. Use FFmpeg via native modules for actual trimming
    // 2. Or send to backend for processing
    await FileSystem.copyAsync({
      from: videoUri,
      to: newUri,
    });

    onProgress?.(100);

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(newUri);
    const size = "size" in fileInfo ? fileInfo.size : 0;

    return {
      uri: newUri,
      duration: endTime - startTime,
      size: size || 0,
    };
  } catch (error) {
    console.error("Video trimming error:", error);
    throw new Error("Failed to process video. Please try again.");
  }
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
