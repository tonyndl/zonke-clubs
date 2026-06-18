import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  Image,
  Pressable,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { LinearGradient } from "expo-linear-gradient";
import { MediaAsset } from "@/types/post";
import { styles } from "./styles";

interface Props {
  visible: boolean;
  media: MediaAsset[];
  initialTab?: "all" | "photos" | "videos";
  onClose: () => void;
  onMediaPress: (media: MediaAsset, allMedia: MediaAsset[]) => void;
}

type TabType = "all" | "photos" | "videos";

export function MediaGridModal({
  visible,
  media,
  initialTab = "all",
  onClose,
  onMediaPress,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const insets = useSafeAreaInsets();

  // Reset tab when modal opens
  useEffect(() => {
    if (visible) {
      setActiveTab(initialTab);
    }
  }, [visible, initialTab]);

  const photos = media.filter((m) => m.type === "image");
  const videos = media.filter((m) => m.type === "video");

  const displayMedia =
    activeTab === "photos" ? photos : activeTab === "videos" ? videos : media;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent
      />
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={[
            "rgba(11, 15, 26, 0.98)",
            "rgba(11, 15, 26, 0.95)",
            "rgba(11, 15, 26, 0.90)",
          ]}
          style={[styles.header, { paddingTop: insets.top + 12 }]}
        >
          <View style={styles.headerContent}>
            <PressableScale onPress={onClose} style={styles.closeButton}>
              <View style={styles.closeButtonGradient}>
                <Ionicons name="close" size={24} color={Colors.gold} />
              </View>
            </PressableScale>

            <View style={styles.headerCenter}>
              <View style={styles.titleRow}>
                <Ionicons name="images" size={24} color={Colors.gold} />
                <Text style={styles.headerTitle}>Gallery</Text>
              </View>
              <Text style={styles.headerSubtitle}>
                {displayMedia.length}{" "}
                {displayMedia.length === 1 ? "item" : "items"}
              </Text>
            </View>

            {/* <View style={styles.headerRight}>
              <LinearGradient
                colors={['rgba(255, 215, 0, 0.2)', 'rgba(255, 215, 0, 0.1)']}
                style={styles.counterBadge}
              >
                <Text style={styles.counterText}>{displayMedia.length}</Text>
              </LinearGradient>
            </View> */}
          </View>

          {/* Decorative bottom border */}
          <LinearGradient
            colors={[
              "rgba(57, 243, 255, 0.3)",
              "rgba(255, 215, 0, 0.3)",
              "rgba(57, 243, 255, 0.3)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerBorder}
          />
        </LinearGradient>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <PressableScale
            style={[styles.tab, activeTab === "all" && styles.tabActive]}
            onPress={() => setActiveTab("all")}
          >
            <Ionicons
              name="grid"
              size={18}
              color={activeTab === "all" ? Colors.bg : Colors.smoke}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "all" && styles.tabTextActive,
              ]}
            >
              All
            </Text>
            <View
              style={[
                styles.tabBadge,
                activeTab === "all" && styles.tabBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.tabBadgeText,
                  activeTab === "all" && styles.tabBadgeTextActive,
                ]}
              >
                {media.length}
              </Text>
            </View>
          </PressableScale>

          <PressableScale
            style={[styles.tab, activeTab === "photos" && styles.tabActive]}
            onPress={() => setActiveTab("photos")}
          >
            <Ionicons
              name="images"
              size={18}
              color={activeTab === "photos" ? Colors.bg : Colors.smoke}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "photos" && styles.tabTextActive,
              ]}
            >
              Photos
            </Text>
            <View
              style={[
                styles.tabBadge,
                activeTab === "photos" && styles.tabBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.tabBadgeText,
                  activeTab === "photos" && styles.tabBadgeTextActive,
                ]}
              >
                {photos.length}
              </Text>
            </View>
          </PressableScale>

          <PressableScale
            style={[styles.tab, activeTab === "videos" && styles.tabActive]}
            onPress={() => setActiveTab("videos")}
          >
            <Ionicons
              name="videocam"
              size={18}
              color={activeTab === "videos" ? Colors.bg : Colors.smoke}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "videos" && styles.tabTextActive,
              ]}
            >
              Videos
            </Text>
            <View
              style={[
                styles.tabBadge,
                activeTab === "videos" && styles.tabBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.tabBadgeText,
                  activeTab === "videos" && styles.tabBadgeTextActive,
                ]}
              >
                {videos.length}
              </Text>
            </View>
          </PressableScale>
        </View>

        {/* Grid */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        >
          {displayMedia.length > 0 ? (
            <View style={styles.grid}>
              {displayMedia.map((item) => (
                <MediaGridItem
                  key={item.id}
                  media={item}
                  onPress={() => onMediaPress(item, displayMedia)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name={
                  activeTab === "photos"
                    ? "images-outline"
                    : activeTab === "videos"
                      ? "videocam-outline"
                      : "image-outline"
                }
                size={64}
                color={Colors.smoke}
              />
              <Text style={styles.emptyText}>
                No{" "}
                {activeTab === "photos"
                  ? "photos"
                  : activeTab === "videos"
                    ? "videos"
                    : "media"}{" "}
                available
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

interface MediaGridItemProps {
  media: MediaAsset;
  onPress: () => void;
}

function MediaGridItem({ media, onPress }: MediaGridItemProps) {
  const isVideo = media.type === "video";
  const imageUrl = isVideo ? media.thumbnailUrl : media.url;
  const hasLikes = media.likeCount !== undefined && media.likeCount > 0;

  return (
    <View style={styles.gridItem}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.gridItemPressable,
          pressed && styles.gridItemPressed,
        ]}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.gridImage}
          resizeMode="cover"
        />

        {/* Video Indicator */}
        {isVideo && (
          <>
            <View style={styles.videoOverlay} />
            <View style={styles.videoIndicator}>
              <Ionicons name="play" size={28} color={Colors.platinum} />
            </View>
            {media.duration && (
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>
                  {formatDuration(media.duration)}
                </Text>
              </View>
            )}
          </>
        )}

        {/* Like Count Badge */}
        {hasLikes && (
          <View style={styles.likeBadge}>
            <Ionicons
              name={media.isLiked ? "heart" : "heart-outline"}
              size={12}
              color={media.isLiked ? "#FF4458" : Colors.white}
            />
            <Text style={styles.likeText}>{media.likeCount}</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

// Helper function to format video duration
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
