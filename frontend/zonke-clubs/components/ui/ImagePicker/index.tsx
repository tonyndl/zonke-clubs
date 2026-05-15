import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import * as ExpoImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { styles } from "./styles";

interface ImagePickerProps {
  onUploadSuccess: (asset: any) => void;
  entityType: "user" | "club" | "post";
  entityId: string;
  existingImageUrl?: string;
  label?: string;
}

export function ImagePicker({
  onUploadSuccess,
  entityType,
  entityId,
  existingImageUrl,
  label = "Upload Image",
}: ImagePickerProps) {
  const [imageUri, setImageUri] = useState<string | null>(
    existingImageUrl || null,
  );
  const [isUploading, setIsUploading] = useState(false);

  const requestPermission = async () => {
    const { status } =
      await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera roll permissions to upload images!",
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      uploadImage(result.assets[0]);
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
      setImageUri(result.assets[0].uri);
      uploadImage(result.assets[0]);
    }
  };

  const uploadImage = (asset: ExpoImagePicker.ImagePickerAsset) => {
    setIsUploading(true);

    const formData = new FormData();
    const fileUri = asset.uri;
    const filename = fileUri.split("/").pop() || "image.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("file", { uri: fileUri, name: filename, type } as any);
    formData.append(`${entityType}_id`, entityId);

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
        Alert.alert("Success", "Image uploaded successfully!");
      })
      .catch(() => {
        setIsUploading(false);
        Alert.alert("Error", "Failed to upload image. Please try again.");
        setImageUri(existingImageUrl || null);
      });
  };

  const showImageOptions = () => {
    Alert.alert("Upload Image", "Choose an option", [
      {
        text: "Take Photo",
        onPress: takePhoto,
      },
      {
        text: "Choose from Library",
        onPress: pickImage,
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const handleRemove = () => {
    Alert.alert("Remove Image", "Are you sure you want to remove this image?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => setImageUri(null),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
            <Ionicons name="close-circle" size={32} color="#ff6b6b" />
          </TouchableOpacity>
          {!isUploading && (
            <TouchableOpacity
              style={styles.changeButton}
              onPress={showImageOptions}
            >
              <Ionicons name="camera" size={20} color={Colors.bg} />
              <Text style={styles.changeButtonText}>Change</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <PressableScale style={styles.uploadButton} onPress={showImageOptions}>
          <Ionicons name="image-outline" size={48} color={Colors.gold} />
          <Text style={styles.uploadText}>
            {isUploading ? "Uploading..." : "Tap to upload image"}
          </Text>
          <Text style={styles.uploadHint}>
            Take a photo or choose from library
          </Text>
        </PressableScale>
      )}

      {isUploading && (
        <View style={styles.uploadingOverlay}>
          <Text style={styles.uploadingText}>Uploading...</Text>
        </View>
      )}
    </View>
  );
}
