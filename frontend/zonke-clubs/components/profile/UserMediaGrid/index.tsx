import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  useWindowDimensions,
  Alert,
} from "react-native";
import Animated, { FadeInDown, FadeIn, FadeOut } from "react-native-reanimated";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { VideoView, useVideoPlayer } from "expo-video";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { ClubPost } from "@/types/post";
import { styles, GRID_SPACING } from "./styles";
import { EmptyState } from "@/components/ui/EmptyState";

const getColumns = (width: number) => {
  if (width < 600) return 2;
  if (width < 900) return 3;
  return 4;
};

interface Props {
  posts: ClubPost[];
  onPostPress: (postIndex: number) => void;
  onAddPost?: () => void;
  onDeletePosts?: (postIds: string[]) => Promise<void>;
  title?: string;
}

type TabType = "all" | "photos" | "videos";

export function UserMediaGrid({
  posts = [],
  onPostPress,
  onAddPost,
  onDeletePosts,
  title = "My Club Vibes",
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [containerMinHeight, setContainerMinHeight] = useState<
    number | undefined
  >(undefined);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const containerRef = useRef<View>(null);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const numColumns = getColumns(windowWidth);
  const itemWidth = Math.floor(
    (windowWidth - 32 - GRID_SPACING * (numColumns - 1)) / numColumns,
  );

  const safePosts = posts || [];

  const filteredPosts =
    activeTab === "all"
      ? safePosts
      : safePosts.filter((post) => {
          const hasType = post.media.some((m) =>
            activeTab === "photos" ? m.type === "image" : m.type === "video",
          );
          return hasType;
        });

  const enterSelectionMode = (postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectionMode(true);
    setSelectedIds(new Set([postId]));
  };

  const toggleSelection = (postId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
        Haptics.selectionAsync();
      }
      return next;
    });
  };

  const cancelSelection = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const handleDelete = () => {
    if (!onDeletePosts || selectedIds.size === 0) return;

    Alert.alert(
      "Delete Posts",
      `Delete ${selectedIds.size} ${selectedIds.size === 1 ? "post" : "posts"}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setIsDeleting(true);
            onDeletePosts([...selectedIds])
              .then(() => {
                setSelectionMode(false);
                setSelectedIds(new Set());
              })
              .catch(() => {
                Alert.alert("Error", "Failed to delete some posts.");
              })
              .finally(() => setIsDeleting(false));
          },
        },
      ],
    );
  };

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
              {selectionMode ? (
                <Animated.View
                  entering={FadeIn.duration(150)}
                  exiting={FadeOut.duration(150)}
                  style={styles.selectionHeader}
                >
                  <PressableScale
                    onPress={cancelSelection}
                    style={styles.selectionCancel}
                  >
                    <Ionicons name="close" size={22} color={Colors.platinum} />
                  </PressableScale>
                  <Text style={styles.selectionCount}>
                    {selectedIds.size} selected
                  </Text>
                  <PressableScale
                    onPress={handleDelete}
                    style={[
                      styles.selectionDelete,
                      selectedIds.size === 0 && styles.selectionDeleteDisabled,
                    ]}
                    disabled={selectedIds.size === 0 || isDeleting}
                  >
                    <Ionicons
                      name={isDeleting ? "hourglass-outline" : "trash-outline"}
                      size={20}
                      color={selectedIds.size > 0 ? "#ef4444" : Colors.smoke}
                    />
                    <Text
                      style={[
                        styles.selectionDeleteText,
                        selectedIds.size === 0 && { color: Colors.smoke },
                      ]}
                    >
                      {isDeleting ? "Deleting…" : "Delete"}
                    </Text>
                  </PressableScale>
                </Animated.View>
              ) : (
                <Animated.View
                  entering={FadeIn.duration(150)}
                  style={styles.selectionHeader}
                >
                  <View style={styles.sectionHeaderLeft}>
                    <Ionicons name="images" size={22} color={Colors.gold} />
                    <Text style={styles.sectionTitle}>{title}</Text>
                  </View>
                  {onAddPost && (
                    <PressableScale
                      style={styles.addMediaButton}
                      onPress={onAddPost}
                    >
                      <Ionicons name="add" size={24} color={Colors.gold} />
                    </PressableScale>
                  )}
                </Animated.View>
              )}
            </View>

            {/* Tab Bar */}
            {!selectionMode && (
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
                  style={[
                    styles.tab,
                    activeTab === "photos" && styles.tabActive,
                  ]}
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
                  style={[
                    styles.tab,
                    activeTab === "videos" && styles.tabActive,
                  ]}
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
            )}
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
                  clubName={post.clubName}
                  onPress={() => {
                    if (selectionMode) {
                      toggleSelection(post.id);
                    } else {
                      onPostPress(originalIndex);
                    }
                  }}
                  onLongPress={() => {
                    if (!selectionMode && onDeletePosts) {
                      enterSelectionMode(post.id);
                    }
                  }}
                  index={index}
                  itemWidth={itemWidth}
                  selectionMode={selectionMode}
                  isSelected={selectedIds.has(post.id)}
                />
              );
            })}
          </View>
        ) : (
          <EmptyState
            icon={
              activeTab === "photos"
                ? "images-outline"
                : activeTab === "videos"
                  ? "videocam-outline"
                  : "image-outline"
            }
            title={`No ${activeTab === "photos" ? "Photos" : activeTab === "videos" ? "Videos" : "Posts"} Yet`}
            subtitle="Share your club moments to build your vibe collection"
            action={
              onAddPost ? (
                <Pressable style={styles.addPostBtn} onPress={onAddPost}>
                  <Text style={styles.addPostBtnText}>Add Post</Text>
                </Pressable>
              ) : undefined
            }
          />
        )}
      </Animated.View>
    </View>
  );
}

interface PostGridItemProps {
  post: ClubPost;
  clubName?: string;
  onPress: () => void;
  onLongPress: () => void;
  index: number;
  itemWidth: number;
  selectionMode: boolean;
  isSelected: boolean;
}

function PostGridItem({
  post,
  clubName,
  onPress,
  onLongPress,
  index,
  itemWidth,
  selectionMode,
  isSelected,
}: PostGridItemProps) {
  const firstMedia = post.media[0];
  const isVideo = firstMedia.type === "video";

  const videoPlayer = useVideoPlayer(
    isVideo ? firstMedia.url : "",
    (player) => {
      player.loop = false;
      player.muted = true;
      player.currentTime = firstMedia.startTime || 0.1;
    },
  );

  const aspectRatio =
    firstMedia.height && firstMedia.width
      ? firstMedia.height / firstMedia.width
      : 1.2;
  const itemHeight = itemWidth * Math.max(0.8, Math.min(aspectRatio, 1.5));

  return (
    <Animated.View
      entering={FadeInDown.delay(50 * index).springify()}
      style={[
        styles.feedItem,
        { width: itemWidth, height: itemHeight },
        isSelected && { opacity: 0.75 },
      ]}
    >
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={350}
        style={({ pressed }) => [
          styles.feedItemPressable,
          pressed && !selectionMode && styles.feedItemPressed,
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
        {isVideo && !selectionMode && (
          <View style={styles.videoIndicator}>
            <Ionicons
              name="play-circle"
              size={32}
              color="rgba(255, 255, 255, 0.5)"
            />
          </View>
        )}

        {/* Multiple Media Indicator */}
        {post.media.length > 1 && !selectionMode && (
          <View style={styles.multipleMediaBadge}>
            <Ionicons name="copy" size={12} color={Colors.platinum} />
            <Text style={styles.multipleMediaText}>{post.media.length}</Text>
          </View>
        )}

        {/* Pin Badge */}
        {post.pinnedAt && !selectionMode && (
          <MaterialIcons
            name="push-pin"
            size={20}
            color="white"
            style={styles.pinBadge}
          />
        )}

        {/* Club Approved Badge */}
        {post.isClubApproved && !selectionMode && (
          <View style={styles.approvalBadge}>
            <Ionicons name="medal" size={20} color={Colors.gold} />
          </View>
        )}

        {/* Rejected Badge */}
        {post.status === "rejected" && !selectionMode && (
          <View style={styles.statusBadgeRejected}>
            <Text style={styles.statusBadgeText}>Rejected</Text>
          </View>
        )}

        {/* Bottom Info */}
        {!selectionMode && (
          <View style={styles.feedItemInfo}>
            <View style={styles.feedItemStats}>
              <View style={styles.feedStat}>
                <Ionicons
                  name={post.isLiked ? "heart" : "heart-outline"}
                  size={12}
                  color={post.isLiked ? "#ef4444" : Colors.white}
                />
                <Text style={styles.feedStatText}>
                  {formatNumber(post.likeCount)}
                </Text>
              </View>
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
        )}

        {/* Selection overlay */}
        {selectionMode && (
          <Animated.View
            entering={FadeIn.duration(150)}
            style={styles.selectionOverlay}
          >
            <View
              style={[
                styles.selectionCircle,
                isSelected && styles.selectionCircleActive,
              ]}
            >
              {isSelected && (
                <Ionicons name="checkmark" size={14} color={Colors.bg} />
              )}
            </View>
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}
