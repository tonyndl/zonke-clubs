import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  useWindowDimensions,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { MediaGridModal } from "../MediaGridModal";
import { ClubPost, MediaAsset } from "@/types/post";
import { styles } from "./styles";
import { EmptyState } from "@/components/ui/EmptyState";

const GRID_SPACING = 8;

// Calculate number of columns based on screen width
// Maximum 3 columns per row
const getNumColumns = (width: number) => {
  if (width >= 600) return 3; // Tablets and larger - max 3 columns
  return 2; // Small phones - 2 columns
};

interface Props {
  posts: ClubPost[];
  onMediaPress: (media: MediaAsset, allMedia: MediaAsset[]) => void;
  onPostPress?: (postIndex: number) => void;
  onAddPost?: () => void;
}

type TabType = "all" | "photos" | "videos";

export function ClubMediaGrid({
  posts,
  onMediaPress,
  onPostPress,
  onAddPost,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [modalVisible, setModalVisible] = useState(false);
  const PREVIEW_LIMIT = 6;

  // Get screen width and calculate number of columns
  const { width } = useWindowDimensions();
  const numColumns = getNumColumns(width);

  // Extract all media from posts and map them to their post indices
  // Also attach post metadata (like count, isLiked) to each media item
  const mediaWithPostIndex: Array<{ media: MediaAsset; postIndex: number }> =
    [];
  posts.forEach((post, postIndex) => {
    post.media.forEach((media) => {
      // Attach post metadata to media
      const enrichedMedia: MediaAsset = {
        ...media,
        postId: post.id,
        likeCount: post.likeCount,
        isLiked: post.isLiked,
      };
      mediaWithPostIndex.push({ media: enrichedMedia, postIndex });
    });
  });

  const allMedia: MediaAsset[] = mediaWithPostIndex.map((item) => item.media);
  const photos = mediaWithPostIndex.filter(
    (item) => item.media.type === "image",
  );
  const videos = mediaWithPostIndex.filter(
    (item) => item.media.type === "video",
  );

  // Determine which media to display based on tab
  const fullMediaWithIndex =
    activeTab === "photos"
      ? photos
      : activeTab === "videos"
        ? videos
        : mediaWithPostIndex;
  const displayMediaWithIndex = fullMediaWithIndex.slice(0, PREVIEW_LIMIT);
  const displayMedia = displayMediaWithIndex.map((item) => item.media);

  const photoCount = photos.length;
  const videoCount = videos.length;

  return (
    <Animated.View
      entering={FadeInDown.delay(150).springify()}
      style={styles.container}
    >
      {/* Header with title and optional add button */}
      <View style={styles.headerActions}>
        <Text style={styles.subsectionTitle}>Photos & Videos</Text>
        {onAddPost && (
          <PressableScale style={styles.addButton} onPress={onAddPost}>
            <Ionicons name="add" size={18} color={Colors.gold} />
          </PressableScale>
        )}
      </View>

      {/* Content Section - Tab Bar and Grid */}
      <View style={styles.contentSection}>
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
          </PressableScale>
        </View>

        {/* Grid */}
        {displayMedia.length > 0 ? (
          <>
            <View style={styles.grid}>
              {displayMediaWithIndex.map((item, index) => (
                <MediaGridItem
                  key={item.media.id}
                  media={item.media}
                  numColumns={numColumns}
                  onPress={() => {
                    if (onPostPress) {
                      onPostPress(item.postIndex);
                    } else {
                      onMediaPress(item.media, displayMedia);
                    }
                  }}
                  index={index}
                />
              ))}
            </View>

            {/* View All Button */}
            {fullMediaWithIndex.length > PREVIEW_LIMIT && (
              <Animated.View
                entering={FadeInDown.delay(100).springify()}
                style={styles.viewAllContainer}
              >
                <PressableScale
                  style={styles.viewAllButton}
                  onPress={() => setModalVisible(true)}
                >
                  <View style={styles.viewAllContent}>
                    <View style={styles.viewAllLeft}>
                      <Ionicons
                        name={
                          activeTab === "photos"
                            ? "images"
                            : activeTab === "videos"
                              ? "videocam"
                              : "grid"
                        }
                        size={18}
                        color={Colors.gold}
                      />
                      <Text style={styles.viewAllText}>
                        View All {fullMediaWithIndex.length}{" "}
                        {activeTab === "all"
                          ? "Items"
                          : activeTab === "photos"
                            ? "Photos"
                            : "Videos"}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={Colors.gold}
                    />
                  </View>
                </PressableScale>
              </Animated.View>
            )}
          </>
        ) : (
          <EmptyState
            icon={
              activeTab === "photos"
                ? "images-outline"
                : activeTab === "videos"
                  ? "videocam-outline"
                  : "image-outline"
            }
            title={`No ${activeTab === "photos" ? "Photos" : activeTab === "videos" ? "Videos" : "Media"} Yet`}
            subtitle={`${activeTab === "photos" ? "Photos" : activeTab === "videos" ? "Videos" : "Media"} from this club will appear here`}
            style={{ flex: 0, paddingVertical: 48 }}
          />
        )}
      </View>

      {/* Full-Screen Media Modal */}
      <MediaGridModal
        visible={modalVisible}
        media={allMedia}
        initialTab={activeTab}
        onClose={() => setModalVisible(false)}
        onMediaPress={onMediaPress}
      />
    </Animated.View>
  );
}

interface MediaGridItemProps {
  media: MediaAsset;
  onPress: () => void;
  index: number;
  numColumns: number;
}

function MediaGridItem({
  media,
  onPress,
  index,
  numColumns,
}: MediaGridItemProps) {
  const isVideo = media.type === "video";
  const hasLikes = media.likeCount !== undefined && media.likeCount > 0;

  // Calculate padding - each item has equal width, spacing is internal
  const isLastInRow = (index + 1) % numColumns === 0;
  const paddingRight = isLastInRow ? 0 : GRID_SPACING;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 30).springify()}
      style={[
        styles.gridItem,
        {
          width: `${100 / numColumns}%`,
          paddingRight,
          paddingBottom: GRID_SPACING,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.gridItemPressable,
          pressed && styles.gridItemPressed,
        ]}
      >
        {isVideo ? (
          <View style={[styles.gridImage, { backgroundColor: "#111" }]} />
        ) : (
          <Image
            source={{ uri: media.url }}
            style={styles.gridImage}
            resizeMode="cover"
          />
        )}

        {/* Video Indicator */}
        {isVideo && (
          <>
            <View style={styles.videoOverlay} />
            <View style={styles.videoIndicator}>
              <Ionicons name="play" size={24} color={Colors.platinum} />
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
              size={10}
              color={media.isLiked ? "#FF4458" : Colors.platinum}
            />
            <Text style={styles.likeText}>{media.likeCount}</Text>
          </View>
        )}

        {/* Gradient overlay for better visibility */}
        <View style={styles.gradientOverlay} />
      </Pressable>
    </Animated.View>
  );
}

// Helper function to format video duration
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
