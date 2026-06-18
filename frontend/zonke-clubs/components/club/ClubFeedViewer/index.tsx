import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  StatusBar,
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  StyleSheet,
} from "react-native";
import { ImageZoom } from "@likashefqet/react-native-image-zoom";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VideoView, useVideoPlayer } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { Provider as PaperProvider } from "react-native-paper";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { PopupMenu } from "@/components/popup";
import { EditPostModal } from "../EditPostModal";
import { LikeButton } from "@/components/ui/LikeButton";
import { ClubPost, MediaAsset } from "@/types/post";
import { formatTimeAgo } from "@/data/clubVideos";
import postsService from "@/services/postsService";
import { clubsService } from "@/services/clubsService";
import { Toast } from "@/components/ui/Toast";
import { styles } from "./styles";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

interface Props {
  visible: boolean;
  posts: ClubPost[];
  initialPostIndex?: number;
  currentUserId?: string;
  onClose: () => void;
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: (postId: string, updatedCaption: string) => void;
  onPostLiked?: (postId: string, liked: boolean, likeCount: number) => void;
  onPostPinToggled?: (postId: string, pinnedAt?: string) => void;
}

export function ClubFeedViewer({
  visible,
  posts,
  initialPostIndex = 0,
  currentUserId,
  onClose,
  onPostDeleted,
  onPostUpdated,
  onPostLiked,
  onPostPinToggled,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialPostIndex);
  const [localPosts, setLocalPosts] = useState<ClubPost[]>(posts);
  const flatListRef = useRef<FlatList>(null);

  React.useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  const handleToggleLike = (postId: string) => {
    const post = localPosts.find((p) => p.id === postId);
    if (!post) return;
    const newLiked = !post.isLiked;
    const newCount = newLiked ? post.likeCount + 1 : post.likeCount - 1;

    setLocalPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, isLiked: newLiked, likeCount: newCount } : p,
      ),
    );
    if (onPostLiked) onPostLiked(postId, newLiked, newCount);

    clubsService
      .togglePostLike(postId)
      .then((result) => {
        setLocalPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, isLiked: result.liked, likeCount: result.like_count }
              : p,
          ),
        );
        if (onPostLiked) onPostLiked(postId, result.liked, result.like_count);
      })
      .catch(() => {
        setLocalPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, isLiked: post.isLiked, likeCount: post.likeCount }
              : p,
          ),
        );
        if (onPostLiked) onPostLiked(postId, post.isLiked, post.likeCount);
      });
  };

  React.useEffect(() => {
    if (visible && initialPostIndex !== currentIndex) {
      setCurrentIndex(initialPostIndex);
      flatListRef.current?.scrollToIndex({
        index: initialPostIndex,
        animated: false,
      });
    }
  }, [visible, initialPostIndex]);

  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      if (index !== null) setCurrentIndex(index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  if (!visible || posts.length === 0) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent={true}
    >
      <PaperProvider>
        <StatusBar backgroundColor="black" barStyle="light-content" />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={styles.container}
          >
            <FlatList
              ref={flatListRef}
              data={localPosts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <FeedItem
                  post={item}
                  isActive={localPosts[currentIndex]?.id === item.id}
                  currentUserId={currentUserId}
                  onClose={onClose}
                  onPostDeleted={onPostDeleted}
                  onPostUpdated={onPostUpdated}
                  onToggleLike={handleToggleLike}
                  onPostPinToggled={onPostPinToggled}
                />
              )}
              pagingEnabled
              showsVerticalScrollIndicator={false}
              onViewableItemsChanged={handleViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              initialScrollIndex={initialPostIndex}
              getItemLayout={(_, index) => ({
                length: SCREEN_HEIGHT,
                offset: SCREEN_HEIGHT * index,
                index,
              })}
              decelerationRate="fast"
              snapToInterval={SCREEN_HEIGHT}
              snapToAlignment="start"
            />
          </Animated.View>
        </GestureHandlerRootView>
      </PaperProvider>
    </Modal>
  );
}

interface FeedItemProps {
  post: ClubPost;
  isActive: boolean;
  currentUserId?: string;
  onClose: () => void;
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: (postId: string, updatedCaption: string) => void;
  onToggleLike: (postId: string) => void;
  onPostPinToggled?: (postId: string, pinnedAt?: string) => void;
}

function FeedItem({
  post,
  isActive,
  currentUserId,
  onClose,
  onPostDeleted,
  onPostUpdated,
  onToggleLike,
  onPostPinToggled,
}: FeedItemProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "error",
  );

  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDraggingRef = useRef(false);
  const trackWidthRef = useRef(0);

  const currentMedia = post.media[currentMediaIndex];
  const isVideo = currentMedia?.type === "video";
  const hasMultipleMedia = post.media.length > 1;

  const videoPlayer = useVideoPlayer(
    isVideo ? currentMedia.url : "",
    (player) => {
      player.loop = false;
      player.muted = isMuted;
      player.currentTime = currentMedia?.startTime || 0.1;
    },
  );

  const playerRef = useRef(videoPlayer);
  playerRef.current = videoPlayer;

  const seekToRatio = useCallback((locationX: number) => {
    const ratio = Math.max(0, Math.min(1, locationX / trackWidthRef.current));
    const seekTime = ratio * (playerRef.current.duration ?? 0);
    playerRef.current.currentTime = seekTime;
    setVideoProgress(ratio * 100);
    setCurrentTime(seekTime);
  }, []);

  const progressPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        isDraggingRef.current = true;
        seekToRatio(e.nativeEvent.locationX);
      },
      onPanResponderMove: (e) => {
        seekToRatio(e.nativeEvent.locationX);
      },
      onPanResponderRelease: (e) => {
        seekToRatio(e.nativeEvent.locationX);
        isDraggingRef.current = false;
      },
      onPanResponderTerminate: () => {
        isDraggingRef.current = false;
      },
    }),
  ).current;

  // Sync muted state
  React.useEffect(() => {
    if (videoPlayer) videoPlayer.muted = isMuted;
  }, [isMuted, videoPlayer]);

  // Play/pause based on active state
  React.useEffect(() => {
    if (!videoPlayer || !isVideo || !isActive) return;
    videoPlayer.loop = true;
    videoPlayer.play();
    return () => {
      try {
        videoPlayer.pause();
      } catch (_) {}
    };
  }, [isActive, isVideo, videoPlayer, currentMedia]);

  // Progress polling + trimmed video loop
  React.useEffect(() => {
    if (!isVideo || !isActive) {
      setVideoProgress(0);
      setCurrentTime(0);
      return;
    }
    const isTrimmed =
      currentMedia?.startTime != null && currentMedia?.endTime != null;

    const interval = setInterval(() => {
      if (isDraggingRef.current) return;
      const rawDur = videoPlayer.duration ?? 0;
      const rawCur = videoPlayer.currentTime ?? 0;
      const dur = isTrimmed
        ? currentMedia.endTime! - currentMedia.startTime!
        : rawDur;
      const cur = isTrimmed ? rawCur - (currentMedia.startTime ?? 0) : rawCur;
      setDuration(dur);
      setCurrentTime(Math.max(0, cur));
      setVideoProgress(dur > 0 ? (Math.max(0, cur) / dur) * 100 : 0);
      if (isTrimmed && rawCur >= (currentMedia.endTime ?? 0)) {
        videoPlayer.currentTime = currentMedia.startTime ?? 0;
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isVideo, isActive, videoPlayer, currentMedia]);

  // Auto-hide controls after 3 seconds
  React.useEffect(() => {
    if (showControls) {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(
        () => setShowControls(false),
        3000,
      );
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [showControls]);

  const handleTap = () => {
    if (isVideo) {
      setShowControls(true);
      if (videoPlayer?.playing) {
        videoPlayer.pause();
      } else {
        videoPlayer?.play();
      }
    } else {
      setShowControls((prev) => !prev);
    }
  };

  const toggleMute = () => setIsMuted((m) => !m);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / SCREEN_WIDTH);
    if (
      newIndex !== currentMediaIndex &&
      newIndex >= 0 &&
      newIndex < post.media.length
    ) {
      setCurrentMediaIndex(newIndex);
    }
  };

  const handleMenuSelect = (value: string) => {
    const v = value.toLowerCase();
    if (v === "edit info") setShowEditModal(true);
    else if (v === "delete") setShowDeleteConfirm(true);
    else if (v === "pin to top") handlePinPost();
    else if (v === "unpin") handleUnpinPost();
  };

  const handlePinPost = () => {
    postsService
      .pinPost(post.id)
      .then((result) => {
        if (onPostPinToggled) onPostPinToggled(post.id, result.pinned_at);
        setToastType("success");
        setToastMessage("Post pinned!");
        setToastVisible(true);
      })
      .catch(() => {
        setToastType("error");
        setToastMessage("Failed to pin post");
        setToastVisible(true);
      });
  };

  const handleUnpinPost = () => {
    postsService
      .unpinPost(post.id)
      .then(() => {
        if (onPostPinToggled) onPostPinToggled(post.id, undefined);
        setToastType("success");
        setToastMessage("Post unpinned");
        setToastVisible(true);
      })
      .catch(() => {
        setToastType("error");
        setToastMessage("Failed to unpin post");
        setToastVisible(true);
      });
  };

  const handleDeletePost = () => {
    setIsDeleting(true);
    postsService
      .deletePost(post.id)
      .then(() => {
        if (onPostDeleted) onPostDeleted(post.id);
        onClose();
      })
      .catch(() => {
        setIsDeleting(false);
        setToastType("error");
        setToastMessage("Failed to delete post");
        setToastVisible(true);
      });
  };

  const handleEditSuccess = (updatedCaption: string) => {
    if (onPostUpdated) onPostUpdated(post.id, updatedCaption);
  };

  return (
    <View style={styles.feedItem}>
      {/* Full-screen horizontal media scroll */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={StyleSheet.absoluteFill}
      >
        {post.media.map((media, index) => {
          const isCurrentVideo = media.type === "video";
          const isCurrentMedia = index === currentMediaIndex;
          return (
            <View key={index} style={styles.mediaPage}>
              {isCurrentVideo && isCurrentMedia ? (
                <VideoView
                  player={videoPlayer}
                  style={styles.media}
                  contentFit="cover"
                  surfaceType="textureView"
                  nativeControls={false}
                  allowsFullscreen={false}
                />
              ) : isCurrentVideo ? (
                <View style={styles.media} />
              ) : (
                <ImageZoom
                  source={{ uri: media.url }}
                  style={styles.media}
                  resizeMode="contain"
                  minScale={1}
                  maxScale={5}
                  doubleTapScale={2.5}
                  isDoubleTapEnabled
                />
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Center play icon — shown when paused + controls visible */}
      {showControls && isVideo && !videoPlayer?.playing && (
        <Animated.View
          entering={ZoomIn.duration(250).springify()}
          exiting={ZoomOut.duration(200)}
          style={styles.centerPlayIcon}
          pointerEvents="none"
        >
          <View style={styles.playIconBackground}>
            <Ionicons name="play" size={52} color={Colors.white} />
          </View>
        </Animated.View>
      )}

      {/* Tap area — covers screen above progress bar */}
      <Pressable style={styles.tapArea} onPress={handleTap} />

      {/* Duration badge — top right */}
      {showControls && isVideo && duration > 0 && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[styles.durationBadge, { top: insets.top + 16 }]}
          pointerEvents="none"
        >
          <Text style={styles.durationText}>
            {formatDuration(duration - currentTime)}
          </Text>
        </Animated.View>
      )}

      {/* Close button — top left */}
      {showControls && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[styles.closeButton, { top: insets.top + 8 }]}
        >
          <PressableScale onPress={onClose}>
            <View style={styles.closeButtonInner}>
              <Ionicons name="close" size={24} color={Colors.gold} />
            </View>
          </PressableScale>
        </Animated.View>
      )}

      {/* Menu button — top right, owner only — always visible */}
      {currentUserId && post.user?.id === currentUserId && (
        <View style={[styles.menuButton, { top: insets.top + 8 }]}>
          <PopupMenu
            options={
              post.pinnedAt
                ? ["Edit Info", "Unpin", "Delete"]
                : ["Edit Info", "Pin to Top", "Delete"]
            }
            onSelect={handleMenuSelect}
            menuWidth={180}
          >
            <View style={styles.menuButtonInner}>
              <Ionicons
                name="ellipsis-vertical"
                size={20}
                color={Colors.platinum}
              />
            </View>
          </PopupMenu>
        </View>
      )}

      {/* Bottom info overlay */}
      {showControls && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.bottomInfoWrapper}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.bottomInfo}>
            {/* Caption */}
            {post.description && (
              <Text style={styles.captionText} numberOfLines={3}>
                {post.description}
              </Text>
            )}

            {/* Club name + like + mute */}
            <View style={styles.nameContainer}>
              <View style={styles.clubBadge}>
                <Ionicons name="home" size={14} color={Colors.gold} />
                <Text style={styles.clubName} numberOfLines={1}>
                  {post.clubName || "Club"}
                </Text>
              </View>
              <View style={styles.rightActions}>
                <LikeButton
                  isLiked={post.isLiked}
                  likeCount={post.likeCount}
                  onToggleLike={() => onToggleLike(post.id)}
                  size="medium"
                  showCount
                />
                {isVideo && (
                  <PressableScale onPress={toggleMute}>
                    <Ionicons
                      name={isMuted ? "volume-mute" : "volume-high"}
                      size={28}
                      color={Colors.white}
                    />
                  </PressableScale>
                )}
              </View>
            </View>

            {/* Location */}
            {post.clubLocation && (
              <View style={styles.locationRow}>
                <Ionicons
                  name="location"
                  size={12}
                  color={Colors.smoke}
                  style={{ marginTop: 3 }}
                />
                <Text style={styles.locationText}>{post.clubLocation}</Text>
              </View>
            )}

            {/* Time ago */}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={Colors.platinum}
                />
                <Text style={styles.statText}>
                  {formatTimeAgo(post.createdAt)}
                </Text>
              </View>
            </View>

            {/* Pagination dots for multiple media */}
            {hasMultipleMedia && (
              <View style={styles.dotsContainer}>
                {post.media.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      i === currentMediaIndex && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Progress bar — always visible, absolutely at bottom edge */}
          {isVideo && (
            <View
              style={styles.progressTouchArea}
              onLayout={(e) => {
                trackWidthRef.current = e.nativeEvent.layout.width;
              }}
              {...progressPanResponder.panHandlers}
            >
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${videoProgress}%` as any },
                  ]}
                >
                  <View style={styles.progressThumb} />
                </View>
              </View>
            </View>
          )}
        </Animated.View>
      )}

      {/* Edit Post Modal */}
      <EditPostModal
        visible={showEditModal}
        postId={post.id}
        initialCaption={post.description || ""}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
      />

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <View style={deleteConfirmStyles.overlay}>
          <View style={deleteConfirmStyles.card}>
            <View style={deleteConfirmStyles.iconWrap}>
              <Ionicons name="trash-outline" size={28} color="#FF6B6B" />
            </View>
            <Text style={deleteConfirmStyles.title}>Delete Post</Text>
            <Text style={deleteConfirmStyles.body}>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </Text>
            <View style={deleteConfirmStyles.actions}>
              <Pressable
                style={deleteConfirmStyles.cancelBtn}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={deleteConfirmStyles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={deleteConfirmStyles.deleteBtn}
                onPress={() => {
                  setShowDeleteConfirm(false);
                  handleDeletePost();
                }}
              >
                <Ionicons name="trash-outline" size={16} color="#fff" />
                <Text style={deleteConfirmStyles.deleteText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const deleteConfirmStyles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: 24,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 24,
    padding: 24,
    width: "100%",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,107,107,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#E2E8F0" },
  body: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 20,
  },
  actions: { flexDirection: "row", gap: 12, marginTop: 8, width: "100%" },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
  },
  cancelText: { fontSize: 15, fontWeight: "600", color: "#94A3B8" },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: "#FF6B6B",
  },
  deleteText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});
