import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/ui";
import postsService from "@/services/postsService";
import { styles } from "./styles";

interface EditPostModalProps {
  visible: boolean;
  postId: string;
  initialCaption: string;
  onClose: () => void;
  onSuccess: (updatedCaption: string) => void;
}

export function EditPostModal({
  visible,
  postId,
  initialCaption,
  onClose,
  onSuccess,
}: EditPostModalProps) {
  const [caption, setCaption] = useState(initialCaption);
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSave = () => {
    setIsLoading(true);
    postsService
      .updatePost(postId, caption)
      .then(() => {
        onSuccess(caption);
        onClose();
      })
      .catch((error) => {
        console.error("Failed to update post:", error);
        Alert.alert("Error", "Failed to update post. Please try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleClose = () => {
    if (!isLoading) {
      setCaption(initialCaption);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.backdrop} />
        <View style={[styles.modalContent, { paddingTop: insets.top + 20 }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleClose}
              disabled={isLoading}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={28} color={Colors.platinum} />
            </TouchableOpacity>
            <Text style={styles.title}>Edit Post</Text>
            <TouchableOpacity
              onPress={handleSave}
              disabled={isLoading}
              style={styles.saveButton}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.gold} />
              ) : (
                <Ionicons name="checkmark" size={28} color={Colors.gold} />
              )}
            </TouchableOpacity>
          </View>

          {/* Caption Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Caption</Text>
            <TextInput
              style={styles.textInput}
              value={caption}
              onChangeText={setCaption}
              placeholder="Add a caption to your post..."
              placeholderTextColor={Colors.smoke}
              multiline
              numberOfLines={6}
              maxLength={500}
              editable={!isLoading}
              autoFocus
            />
            <Text style={styles.characterCount}>{caption.length}/500</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
