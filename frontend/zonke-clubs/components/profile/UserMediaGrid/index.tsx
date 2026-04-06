import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  useWindowDimensions,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { VideoView, useVideoPlayer } from "expo-video";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { ClubPost, MediaAsset } from "@/types/post";
import { styles, GRID_SPACING } from "./styles";

// Responsive columns based on screen width
const getColumns = (width: number) => {
  if (width < 600) return 2; // Phone: 2 columns
  if (width < 900) return 3; // Tablet: 3 columns
  return 4; // Large tablet/Desktop: 4 columns
};

interface Props {
  posts: ClubPost[];
  onPostPress: (postIndex: number) => void;
  onAddPost?: () => void;
  clubNames?: Record<string, string>; // Map club IDs to names
}

type TabType = "all" | "photos" | "videos";

export function UserMediaGrid({
  posts = [],
  onPostPress,
  onAddPost,
  clubNames = {},
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [containerMinHeight, setContainerMinHeight] = useState<
    number | undefined
  >(undefined);
  const containerRef = useRef<View>(null);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Calculate responsive grid dimensions
  const numColumns = getColumns(windowWidth);
  // Subtract padding (16px * 2 = 32px) and gaps, then divide by columns
  // Using Math.floor to avoid rounding issues that might cause wrapping
  const itemWidth = Math.floor(
    (windowWidth - 32 - GRID_SPACING * (numColumns - 1)) / numColumns,
  );

  // Ensure posts is always an array
  const safePosts = posts || [];

  // Filter posts based on active tab
  const filteredPosts =
    activeTab === "all"
      ? safePosts
      : safePosts.filter((post) => {
          const hasType = post.media.some((m) =>
            activeTab === "photos" ? m.type === "image" : m.type === "video",
          );
          return hasType;
        });

  const photoCount = safePosts.filter((p) =>
    p.media.some((m) => m.type === "image"),
  ).length;
  const videoCount = safePosts.filter((p) =>
    p.media.some((m) => m.type === "video"),
  ).length;

  return (
    <View
      ref={containerRef}
      onLayout={() => {
        containerRef.current?.measure((_x, _y, _w, _h, _pageX, pageY) => {
          setContainerMinHeight(windowHeight - pageY - 80);
        });
      }}
      style={[
        styles.container,
        containerMinHeight ? { minHeight: containerMinHeight } : undefined,
      ]}
    >
      <Animated.View
        entering={FadeInDown.delay(350).springify()}
        style={{ flex: 1 }}
      >
        {safePosts.length > 0 && (
          <>
            {/* Header */}
            <View style={styles.feedHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Ionicons name="images" size={22} color={Colors.gold} />
                <Text style={styles.sectionTitle}>My Club Vibes</Text>
              </View>
              {onAddPost && (
                <PressableScale
                  style={styles.addMediaButton}
                  onPress={onAddPost}
                >
                  <Ionicons name="add" size={24} color={Colors.gold} />
                </PressableScale>
              )}
            </View>

            {/* Tab Bar */}
            <View style={styles.tabBar}>
              <PressableScale
                style={[styles.tab, activeTab === "all" && styles.tabActive]}
                onPress={() => setActiveTab("all")}
              >
                <Ionicons
                  name="grid"
                  size={16}
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
                  size={16}
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
                  size={16}
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
          </>
        )}

        {/* Grid */}
        {filteredPosts.length > 0 ? (
          <View style={styles.feedGrid}>
            {filteredPosts.map((post, index) => {
              const originalIndex = posts.findIndex((p) => p.id === post.id);
              return (
                <PostGridItem
                  key={post.id}
                  post={post}
                  clubName={clubNames[post.clubId]}
                  onPress={() => onPostPress(originalIndex)}
                  index={index}
                  itemWidth={itemWidth}
                />
              );
            })}
          </View>
        ) : (
          <View style={[styles.emptyState, { flex: 1 }]}>
            <Ionicons
              name={
                activeTab === "photos"
                  ? "images-outline"
                  : activeTab === "videos"
                    ? "videocam-outline"
                    : "image-outline"
              }
              size={48}
              color={Colors.smoke}
            />
            <Text style={styles.emptyText}>
              No{" "}
              {activeTab === "photos"
                ? "photos"
                : activeTab === "videos"
                  ? "videos"
                  : "posts"}{" "}
              yet
            </Text>
            <Text style={styles.emptySubtext}>
              Share your club moments to build your vibe collection
            </Text>

            {onAddPost && (
              <Pressable style={styles.addPostBtn} onPress={onAddPost}>
                <Text style={styles.addPostBtnText}>Add Post</Text>
              </Pressable>
            )}
          </View>
        )}
      </Animated.View>
    </View>
  );
}

interface PostGridItemProps {
  post: ClubPost;
  clubName?: string;
  onPress: () => void;
  index: number;
  itemWidth: number;
}

function PostGridItem({
  post,
  clubName,
  onPress,
  index,
  itemWidth,
}: PostGridItemProps) {
  const firstMedia = post.media[0];
  const isVideo = firstMedia.type === "video";

  // Create video player for videos with preview frame
  const videoPlayer = useVideoPlayer(
    isVideo ? firstMedia.url : "",
    (player) => {
      player.loop = false;
      player.muted = true;
      // Set a preview frame so first frame loads immediately
      const previewTime = firstMedia.startTime || 0.1;
      player.currentTime = previewTime;
    },
  );

  // Calculate dynamic height based on aspect ratio
  const aspectRatio =
    firstMedia.height && firstMedia.width
      ? firstMedia.height / firstMedia.width
      : 1.2;
  const itemHeight = itemWidth * Math.max(0.8, Math.min(aspectRatio, 1.5));

  return (
    <Animated.View
      entering={FadeInDown.delay(50 * index).springify()}
      style={[styles.feedItem, { width: itemWidth, height: itemHeight }]}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.feedItemPressable,
          pressed && styles.feedItemPressed,
        ]}
      >
        {isVideo ? (
          <VideoView
            player={videoPlayer}
            style={styles.feedItemImage}
            contentFit="cover"
            nativeControls={false}
            allowsFullscreen={false}
          />
        ) : (
          <Image
            source={{ uri: firstMedia.url }}
            style={styles.feedItemImage}
          />
        )}
        {/* Video Indicator */}
        {isVideo && (
          <View style={styles.videoIndicator}>
            <Ionicons
              name="play-circle"
              size={32}
              color="rgba(255, 255, 255, 0.5)"
            />
          </View>
        )}

        {/* Duration Badge for Videos */}
        {/* {isVideo && firstMedia.duration && (
          <View style={styles.durationBadge}>
            <Ionicons name="videocam" size={10} color={Colors.platinum} />
            <Text style={styles.durationText}>{formatDuration(firstMedia.duration)}</Text>
          </View>
        )} */}

        {/* Multiple Media Indicator */}
        {post.media.length > 1 && (
          <View style={styles.multipleMediaBadge}>
            <Ionicons name="copy" size={12} color={Colors.platinum} />
            <Text style={styles.multipleMediaText}>{post.media.length}</Text>
          </View>
        )}

        {/* Pin Badge — top-right, like Instagram */}
        {post.pinnedAt && (
          <MaterialIcons
            name="push-pin"
            size={20}
            color="white"
            style={styles.pinBadge}
          />
        )}

        {/* Club Approved Badge — drops below pin if both showing */}
        {post.isClubApproved && (
          <View style={styles.approvalBadge}>
            <Ionicons name="medal" size={20} color={Colors.gold} />
          </View>
        )}

        {/* Status Badge (Rejected Only) */}
        {post.status === "rejected" && (
          <View style={styles.statusBadgeRejected}>
            <Text style={styles.statusBadgeText}>Rejected</Text>
          </View>
        )}

        {/* Bottom Info Overlay */}
        <View style={styles.feedItemInfo}>
          <View style={styles.feedItemStats}>
            <View style={styles.feedStat}>
              <Ionicons
                name={post.isLiked ? "heart" : "heart-outline"}
                size={12}
                color={post.isLiked ? "#ef4444" : Colors.smoke}
              />
              <Text style={styles.feedStatText}>
                {formatNumber(post.likes)}
              </Text>
            </View>
            {/* <View style={styles.feedStat}>
              <Ionicons name="chatbubble" size={11} color={Colors.smoke} />
              <Text style={styles.feedStatText}>{formatNumber(post.comments)}</Text>onPress={onAddPost}
            </View> */}
          </View>
          {clubName && (
            <View style={styles.feedItemClub}>
              <Ionicons name="location" size={12} color={Colors.gold} />
              <Text style={styles.feedItemClubText} numberOfLines={1}>
                {clubName}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}
