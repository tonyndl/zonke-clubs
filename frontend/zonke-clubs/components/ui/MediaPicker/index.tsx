import React, { useState } from "react";
import { View, Text, Image, Alert, ActivityIndicator } from "react-native";
import * as ExpoImagePicker from "expo-image-picker";
import { VideoView, useVideoPlayer } from "expo-video";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { styles } from "./styles";

interface MediaPickerProps {
  onUploadSuccess: (asset: any) => void;
  entityType: "user" | "club" | "post";
  entityId: string;
  existingMediaUrl?: string;
  label?: string;
  mediaType?: "image" | "video" | "both";
  maxVideoDuration?: number; // in seconds
}

export function MediaPicker({
  onUploadSuccess,
  entityType,
  entityId,
  existingMediaUrl,
  label = "Upload Media",
  mediaType = "both",
  maxVideoDuration = 30, // 30 seconds default
}: MediaPickerProps) {
  const [mediaUri, setMediaUri] = useState<string | null>(
    existingMediaUrl || null,
  );
  const [mediaTypeSelected, setMediaTypeSelected] = useState<
    "image" | "video" | null
  >(null);
  const [isUploading, setIsUploading] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number>(0);

  const videoPlayer = useVideoPlayer(
    mediaTypeSelected === "video" && mediaUri ? { uri: mediaUri } : null,
    (player) => {
      player.loop = true;
    },
  );

  const requestPermission = async () => {
    const { status } =
      await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need media library permissions to upload files!",
      );
      return false;
    }
    return true;
  };

  const validateVideoDuration = (
    durationMs: number | null | undefined,
  ): boolean => {
    if (!durationMs) return true;
    const duration = durationMs / 1000;
    setVideoDuration(duration);
    if (duration > maxVideoDuration) {
      Alert.alert(
        "Video Too Long",
        `Please select a video that is ${maxVideoDuration} seconds or shorter. Your video is ${Math.round(duration)} seconds.`,
      );
      return false;
    }
    return true;
  };

  const pickMedia = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const mediaTypes =
      mediaType === "image"
        ? ExpoImagePicker.MediaTypeOptions.Images
        : mediaType === "video"
          ? ExpoImagePicker.MediaTypeOptions.Videos
          : ExpoImagePicker.MediaTypeOptions.All;

    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes,
      allowsEditing: mediaType !== "video", // Don't allow editing for videos
      aspect: mediaType === "image" ? [4, 3] : undefined,
      quality: 0.8,
      videoMaxDuration: maxVideoDuration,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const type = asset.type || "image";

      // Validate video duration if it's a video
      if (type === "video") {
        const isValid = validateVideoDuration(asset.duration);
        if (!isValid) return;
      }

      setMediaUri(asset.uri);
      setMediaTypeSelected(type as "image" | "video");
      uploadMedia(asset, type as "image" | "video");
    }
  };

  const recordVideo = async () => {
    const { status } = await ExpoImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera permissions to record videos!",
      );
      return;
    }

    const result = await ExpoImagePicker.launchCameraAsync({
      mediaTypes: ExpoImagePicker.MediaTypeOptions.Videos,
      videoMaxDuration: maxVideoDuration,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];

      // Validate duration
      const isValid = validateVideoDuration(asset.duration);
      if (!isValid) return;

      setMediaUri(asset.uri);
      setMediaTypeSelected("video");
      uploadMedia(asset, "video");
    }
  };

  const takePhoto = async () => {
    const { status } = await ExpoImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera permissions to take photos!",
      );
      return;
    }

    const result = await ExpoImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setMediaTypeSelected("image");
      uploadMedia(result.assets[0], "image");
    }
  };

  const uploadMedia = (
    asset: ExpoImagePicker.ImagePickerAsset,
    type: "image" | "video",
  ) => {
    setIsUploading(true);

    const formData = new FormData();
    const fileUri = asset.uri;
    const filename =
      fileUri.split("/").pop() || `${type}.${type === "video" ? "mp4" : "jpg"}`;
    const match = /\.(\w+)$/.exec(filename);
    const mimeType =
      type === "video"
        ? `video/${match ? match[1] : "mp4"}`
        : `image/${match ? match[1] : "jpeg"}`;

    formData.append("file", {
      uri: fileUri,
      name: filename,
      type: mimeType,
    } as any);
    formData.append(`${entityType}_id`, entityId);
    formData.append(
      "meta",
      JSON.stringify({
        type,
        duration: type === "video" ? videoDuration : undefined,
      }),
    );

    fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/assets`, {
      method: "POST",
      headers: { "Content-Type": "multipart/form-data" },
      body: formData,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Upload failed");
        return response.json();
      })
      .then((data) => {
        setIsUploading(false);
        onUploadSuccess(data);
        Alert.alert(
          "Success",
          `${type === "video" ? "Video" : "Image"} uploaded successfully!`,
        );
      })
      .catch(() => {
        setIsUploading(false);
        Alert.alert("Error", `Failed to upload ${type}. Please try again.`);
        setMediaUri(existingMediaUrl || null);
        setMediaTypeSelected(null);
      });
  };

  const showMediaOptions = () => {
    const options: any[] = [];

    if (mediaType === "image" || mediaType === "both") {
      options.push({
        text: "Take Photo",
        onPress: takePhoto,
      });
      options.push({
        text: "Choose Photo",
        onPress: () => pickMedia(),
      });
    }

    if (mediaType === "video" || mediaType === "both") {
      options.push({
        text: `Record Video (max ${maxVideoDuration}s)`,
        onPress: recordVideo,
      });
      options.push({
        text: "Choose Video",
        onPress: () => pickMedia(),
      });
    }

    options.push({
      text: "Cancel",
      style: "cancel",
    });

    Alert.alert("Upload Media", "Choose an option", options);
  };

  const handleRemove = () => {
    Alert.alert("Remove Media", "Are you sure you want to remove this media?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setMediaUri(null);
          setMediaTypeSelected(null);
          setVideoDuration(0);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {mediaUri ? (
        <View style={styles.mediaContainer}>
          {mediaTypeSelected === "video" ? (
            <VideoView
              player={videoPlayer}
              style={styles.video}
              nativeControls
              contentFit="contain"
            />
          ) : (
            <Image source={{ uri: mediaUri }} style={styles.image} />
          )}

          <PressableScale style={styles.removeButton} onPress={handleRemove}>
            <Ionicons name="close-circle" size={32} color="#ff6b6b" />
          </PressableScale>

          {!isUploading && (
            <PressableScale
              style={styles.changeButton}
              onPress={showMediaOptions}
            >
              <Ionicons
                name={mediaTypeSelected === "video" ? "videocam" : "camera"}
                size={20}
                color={Colors.bg}
              />
              <Text style={styles.changeButtonText}>Change</Text>
            </PressableScale>
          )}

          {mediaTypeSelected === "video" && videoDuration > 0 && (
            <View style={styles.durationBadge}>
              <Ionicons name="time-outline" size={14} color={Colors.bg} />
              <Text style={styles.durationText}>
                {Math.round(videoDuration)}s / {maxVideoDuration}s
              </Text>
            </View>
          )}
        </View>
      ) : (
        <PressableScale style={styles.uploadButton} onPress={showMediaOptions}>
          <Ionicons
            name={
              mediaType === "video"
                ? "videocam-outline"
                : mediaType === "image"
                  ? "image-outline"
                  : "cloud-upload-outline"
            }
            size={48}
            color={Colors.gold}
          />
          <Text style={styles.uploadText}>
            {isUploading
              ? "Uploading..."
              : `Tap to upload ${mediaType === "both" ? "media" : mediaType}`}
          </Text>
          <Text style={styles.uploadHint}>
            {mediaType === "video" && `Max ${maxVideoDuration} seconds`}
            {mediaType === "image" && "Take a photo or choose from library"}
            {mediaType === "both" &&
              `Photos or videos (max ${maxVideoDuration}s)`}
          </Text>
        </PressableScale>
      )}

      {isUploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={styles.uploadingText}>Uploading...</Text>
        </View>
      )}
    </View>
  );
}
