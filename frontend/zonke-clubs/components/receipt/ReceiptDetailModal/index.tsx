import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/ui";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { styles } from "./styles";

type ReceiptItem = {
  id: string;
  type: "image" | "video";
  thumbnail: string;
  amount: number;
  date: Date;
  liked: boolean;
  likeCount: number;
  splitWith?: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  receipt: ReceiptItem | null;
  onLike: (id: string) => void;
};

export function ReceiptDetailModal({
  visible,
  onClose,
  receipt,
  onLike,
}: Props) {
  const [isLiked, setIsLiked] = useState(receipt?.liked || false);
  const [likeCount, setLikeCount] = useState(receipt?.likeCount || 0);
  const heartScale = useSharedValue(1);

  React.useEffect(() => {
    if (receipt) {
      setIsLiked(receipt.liked);
      setLikeCount(receipt.likeCount);
    }
  }, [receipt]);

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handleLike = () => {
    if (!receipt) return;

    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount(newLikedState ? likeCount + 1 : likeCount - 1);
    onLike(receipt.id);

    // Animate heart
    heartScale.value = withSequence(
      withSpring(1.5, { damping: 10, stiffness: 300 }),
      withSpring(1, { damping: 10, stiffness: 300 }),
    );
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!receipt) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.bg, Colors.bgCard]}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="close" size={28} color={Colors.platinum} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Receipt Details</Text>

            <TouchableOpacity style={styles.moreButton}>
              <Ionicons
                name="ellipsis-horizontal"
                size={24}
                color={Colors.platinum}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Receipt Image/Video */}
            <View style={styles.mediaSection}>
              <View style={styles.mediaContainer}>
                <Image
                  source={{ uri: receipt.thumbnail }}
                  style={styles.media}
                  resizeMode="cover"
                />

                {receipt.type === "video" && (
                  <TouchableOpacity style={styles.playButton}>
                    <BlurView intensity={30} style={styles.playButtonBlur}>
                      <Ionicons name="play" size={40} color={Colors.platinum} />
                    </BlurView>
                  </TouchableOpacity>
                )}
              </View>

              {/* Interaction Bar */}
              <View style={styles.interactionBar}>
                <TouchableOpacity
                  style={styles.likeButtonLarge}
                  onPress={handleLike}
                  activeOpacity={0.7}
                >
                  <Animated.View style={heartAnimatedStyle}>
                    <Ionicons
                      name={isLiked ? "heart" : "heart-outline"}
                      size={28}
                      color={isLiked ? "#EF4444" : Colors.platinum}
                    />
                  </Animated.View>
                  <Text
                    style={[
                      styles.interactionText,
                      isLiked && styles.likedText,
                    ]}
                  >
                    {likeCount}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.shareButton}>
                  <Ionicons
                    name="share-outline"
                    size={24}
                    color={Colors.platinum}
                  />
                  <Text style={styles.interactionText}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.downloadButton}>
                  <Ionicons
                    name="download-outline"
                    size={24}
                    color={Colors.platinum}
                  />
                  <Text style={styles.interactionText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Receipt Info Card */}
            <View style={styles.infoCard}>
              <LinearGradient
                colors={[
                  "rgba(57, 243, 255, 0.15)",
                  "rgba(57, 243, 255, 0.05)",
                ]}
                style={styles.infoGradient}
              >
                {/* Amount Section */}
                <View style={styles.amountSection}>
                  <View style={styles.amountIconContainer}>
                    <Ionicons name="cash" size={32} color={Colors.gold} />
                  </View>
                  <View style={styles.amountTextContainer}>
                    <Text style={styles.amountLabel}>Total Amount</Text>
                    <Text style={styles.amountValue}>
                      R{receipt.amount.toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Date Section */}
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={Colors.gold}
                    />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Date & Time</Text>
                    <Text style={styles.infoValue}>
                      {formatFullDate(receipt.date)}
                    </Text>
                  </View>
                </View>

                {/* Split Info */}
                {receipt.splitWith && receipt.splitWith > 0 && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <View style={styles.infoIconContainer}>
                        <Ionicons
                          name="people-outline"
                          size={20}
                          color={Colors.gold}
                        />
                      </View>
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Split With</Text>
                        <Text style={styles.infoValue}>
                          {receipt.splitWith}{" "}
                          {receipt.splitWith === 1 ? "person" : "people"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <View style={styles.infoIconContainer}>
                        <Ionicons
                          name="wallet-outline"
                          size={20}
                          color={Colors.gold}
                        />
                      </View>
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Your Share</Text>
                        <Text style={styles.infoValue}>
                          R
                          {(receipt.amount / (receipt.splitWith + 1)).toFixed(
                            2,
                          )}
                        </Text>
                      </View>
                    </View>
                  </>
                )}

                <View style={styles.divider} />

                {/* Type Section */}
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons
                      name={
                        receipt.type === "video"
                          ? "videocam-outline"
                          : "image-outline"
                      }
                      size={20}
                      color={Colors.gold}
                    />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Receipt Type</Text>
                    <Text style={styles.infoValue}>
                      {receipt.type === "video"
                        ? "Video Receipt"
                        : "Photo Receipt"}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
                <View style={styles.actionButtonContent}>
                  <Ionicons name="send-outline" size={20} color={Colors.gold} />
                  <Text style={styles.actionButtonText}>Send Reminder</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
                <View style={styles.actionButtonContent}>
                  <Ionicons
                    name="create-outline"
                    size={20}
                    color={Colors.gold}
                  />
                  <Text style={styles.actionButtonText}>Edit Details</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                activeOpacity={0.8}
              >
                <View style={styles.actionButtonContent}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  <Text style={[styles.actionButtonText, styles.deleteText]}>
                    Delete Receipt
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
}
