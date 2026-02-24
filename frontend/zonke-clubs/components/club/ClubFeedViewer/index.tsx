import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Modal,
  StatusBar,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VideoView, useVideoPlayer } from "expo-video";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { Provider as PaperProvider } from "react-native-paper";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { PopupMenu } from "@/components/popup";
import { EditPostModal } from "../EditPostModal";
import { LikeButton } from "@/components/ui/LikeButton";
import { ClubPost, MediaAsset } from "@/types/post";
import postsService from "@/services/postsService";
import { clubsService } from "@/services/clubsService";
import { styles } from "./styles";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Props {
  visible: boolean;
  posts: ClubPost[];
  initialPostIndex?: number;
  currentUserId?: string;
  onClose: () => void;
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: (postId: string, updatedCaption: string) => void;
  onPostLiked?: (postId: string, liked: boolean, likeCount: number) => void;
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
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialPostIndex);
  const [localPosts, setLocalPosts] = useState<ClubPost[]>(posts);
  const flatListRef = useRef<FlatList>(null);

  // Update local posts when props change
  React.useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  // Handle like toggle
  const handleToggleLike = (postId: string) => {
    // Optimistically update UI
    setLocalPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
            }
          : post,
      ),
    );

    // Call API
    clubsService
      .togglePostLike(postId)
      .then((result) => {
        // Update with server response to ensure consistency
        setLocalPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, isLiked: result.liked, likeCount: result.like_count }
              : post,
          ),
        );

        // Notify parent component of the like change
        if (onPostLiked) {
          onPostLiked(postId, result.liked, result.like_count);
        }
      })
      .catch((error) => {
        console.error("Failed to toggle like:", error);
        // Revert optimistic update on error
        setLocalPosts(posts);
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
      if (index !== null) {
        setCurrentIndex(index);
      }
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
                />
              )}
              pagingEnabled
              showsVerticalScrollIndicator={false}
              onViewableItemsChanged={handleViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              initialScrollIndex={initialPostIndex}
              getItemLayout={(data, index) => ({
                length: SCREEN_HEIGHT,
                offset: SCREEN_HEIGHT * index,
                index,
              })}
              decelerationRate="fast"
              snapToInterval={SCREEN_HEIGHT}
              snapToAlignment="start"
            />

            {/* Post Counter */}
            {/* <Animated.View entering={FadeIn.delay(200)} style={styles.counterBadge}>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {posts.length}
          </Text>
        </Animated.View> */}
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
}

function FeedItem({
  post,
  isActive,
  currentUserId,
  onClose,
  onPostDeleted,
  onPostUpdated,
  onToggleLike,
}: FeedItemProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const progressBarWidthRef = useRef<number>(0);
  const insets = useSafeAreaInsets();

  const currentMedia = post.media[currentMediaIndex];
  const isVideo = currentMedia.type === "video";
  const hasMultipleMedia = post.media.length > 1;

  // Create video player for current video - with preview frame
  const videoPlayer = useVideoPlayer(
    isVideo ? currentMedia.url : "",
    (player) => {
      player.loop = false;
      player.muted = isMuted;
      // Set a preview frame so first frame loads immediately (like MediaViewer)
      const previewTime = currentMedia.startTime || 0.1;
      player.currentTime = previewTime;
    },
  );

  // Update muted state when it changes
  React.useEffect(() => {
    if (videoPlayer) {
      videoPlayer.muted = isMuted;
    }
  }, [isMuted, videoPlayer]);

  // ONLY control playback for active posts - let inactive ones show first frame naturally
  React.useEffect(() => {
    if (!videoPlayer || !isVideo || !isActive) return;

    const isTrimmed =
      currentMedia.startTime != null && currentMedia.endTime != null;

    if (!isTrimmed) {
      // For active non-trimmed videos, play them
      videoPlayer.loop = true;
      videoPlayer.play();
    }

    // Cleanup: pause when becoming inactive
    return () => {
      try {
        videoPlayer.pause();
      } catch (error) {
        // Video player might already be destroyed, ignore error
      }
    };
  }, [isActive, isVideo, videoPlayer, currentMedia]);

  // Handle trimmed video playback
  React.useEffect(() => {
    if (!videoPlayer || !isVideo || !isActive) return;

    // Check if video is trimmed
    const isTrimmed =
      currentMedia.startTime != null && currentMedia.endTime != null;

    if (isTrimmed) {
      // Start at trim start time
      videoPlayer.currentTime = currentMedia.startTime || 0;
      videoPlayer.play(); // Start playing from trim start

      // Monitor playback and loop within trimmed range + update progress
      const interval = setInterval(() => {
        const currentTime = videoPlayer.currentTime;
        const startTime = currentMedia.startTime || 0;
        const endTime = currentMedia.endTime || currentMedia.duration || 0;
        const duration = endTime - startTime;

        // Update progress bar
        const progress = ((currentTime - startTime) / duration) * 100;
        setVideoProgress(Math.max(0, Math.min(100, progress)));

        // If we've reached the end of the trim, loop back to start
        if (currentTime >= endTime) {
          videoPlayer.currentTime = startTime;
        }
      }, 100);

      return () => clearInterval(interval);
    } else {
      // For non-trimmed videos, just loop normally
      videoPlayer.loop = true;

      // Update progress bar
      const interval = setInterval(() => {
        const currentTime = videoPlayer.currentTime;
        const duration = videoPlayer.duration || currentMedia.duration || 0;
        if (!duration) return;
        const progress = (currentTime / duration) * 100;
        setVideoProgress(Math.max(0, Math.min(100, progress)));
      }, 100);

      return () => clearInterval(interval);
    }
  }, [videoPlayer, currentMedia, isVideo, isActive]);

  const handleNextMedia = () => {
    if (currentMediaIndex < post.media.length - 1) {
      const nextIndex = currentMediaIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: SCREEN_WIDTH * nextIndex,
        animated: true,
      });
      setCurrentMediaIndex(nextIndex);
    }
  };

  const handlePreviousMedia = () => {
    if (currentMediaIndex > 0) {
      const prevIndex = currentMediaIndex - 1;
      scrollViewRef.current?.scrollTo({
        x: SCREEN_WIDTH * prevIndex,
        animated: true,
      });
      setCurrentMediaIndex(prevIndex);
    }
  };

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

  const togglePlayPause = () => {
    if (videoPlayer) {
      if (videoPlayer.playing) {
        videoPlayer.pause();
      } else {
        videoPlayer.play();
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVideoTap = () => {
    setShowControls(!showControls);
  };

  React.useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    if (showControls && isVideo) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [showControls, isVideo]);

  const handleProgressBarLayout = (event: any) => {
    progressBarWidthRef.current = event.nativeEvent.layout.width;
  };

  const handleProgressBarPress = (event: any) => {
    if (!videoPlayer || !isVideo || !progressBarWidthRef.current) return;

    const { locationX } = event.nativeEvent;
    const progress = Math.max(
      0,
      Math.min(1, locationX / progressBarWidthRef.current),
    );
    const duration = videoPlayer.duration || currentMedia.duration || 0;
    if (!duration) return;
    const newTime = progress * duration;

    const wasPlaying = videoPlayer.playing;
    videoPlayer.currentTime = newTime;
    if (wasPlaying) {
      videoPlayer.play();
    }
  };

  const handleMenuSelect = (value: string) => {
    const lowerValue = value.toLowerCase();

    if (lowerValue === "edit info") {
      setShowEditModal(true);
    } else if (lowerValue === "delete") {
      Alert.alert(
        "Delete Post",
        "Are you sure you want to delete this post? This action cannot be undone.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: handleDeletePost,
          },
        ],
      );
    }
  };

  const handleDeletePost = () => {
    setIsDeleting(true);
    postsService
      .deletePost(post.id)
      .then(() => {
        if (onPostDeleted) {
          onPostDeleted(post.id);
        }
        onClose();
      })
      .catch((error) => {
        console.error("Failed to delete post:", error);
        Alert.alert("Error", "Failed to delete post. Please try again.");
        setIsDeleting(false);
      });
  };

  const handleEditSuccess = (updatedCaption: string) => {
    if (onPostUpdated) {
      onPostUpdated(post.id, updatedCaption);
    }
  };

  return (
    <View style={styles.feedItem}>
      {/* Close Button */}
      <Animated.View
        entering={FadeIn.delay(300)}
        style={[styles.closeButton, { top: insets.top + 34 }]}
      >
        <PressableScale onPress={onClose}>
          <View style={styles.closeButtonInner}>
            <Ionicons name="close" size={28} color={Colors.platinum} />
          </View>
        </PressableScale>
      </Animated.View>

      {/* Menu Button - Only show for user's own posts */}
      {currentUserId && post.user?.id === currentUserId && (
        <Animated.View
          entering={FadeIn.delay(300)}
          style={[styles.menuButton, { top: insets.top + 34 }]}
        >
          <PopupMenu
            options={["Edit Info", "Delete"]}
            onSelect={handleMenuSelect}
            menuWidth={180}
          >
            <View style={styles.menuButtonInner}>
              <Ionicons
                name="ellipsis-vertical"
                size={24}
                color={Colors.platinum}
              />
            </View>
          </PopupMenu>
        </Animated.View>
      )}

      {/* Media Display */}
      <View style={styles.mediaContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {post.media.map((media, index) => {
            const isCurrentVideo = media.type === "video";
            const isCurrentMedia = index === currentMediaIndex;

            return (
              <View key={index} style={styles.mediaItem}>
                {isCurrentVideo && isCurrentMedia ? (
                  <>
                    <VideoView
                      player={videoPlayer}
                      style={styles.media}
                      contentFit="contain"
                      nativeControls={false}
                      allowsFullscreen={false}
                    />
                    {/* Tap to show/hide controls */}
                    <Pressable
                      style={styles.videoTapArea}
                      onPress={handleVideoTap}
                    />
                  </>
                ) : isCurrentVideo ? (
                  <View style={styles.media} />
                ) : (
                  <Image
                    source={{ uri: media.url }}
                    style={styles.media}
                    resizeMode="contain"
                  />
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* Bottom Controls */}
        {isVideo && showControls && (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.videoBottomControls}
          >
            <PressableScale
              onPress={togglePlayPause}
              style={styles.feedPlayPauseButton}
            >
              <Ionicons
                name={videoPlayer?.playing ? "pause" : "play"}
                size={24}
                color={Colors.platinum}
              />
            </PressableScale>

            <Pressable
              style={styles.progressBarContainer}
              onPress={handleProgressBarPress}
            >
              <View
                style={styles.progressBarBackground}
                onLayout={handleProgressBarLayout}
              >
                <Animated.View
                  entering={FadeIn}
                  style={[
                    styles.progressBarFill,
                    { width: `${videoProgress}%` },
                  ]}
                />
              </View>
            </Pressable>

            <PressableScale onPress={toggleMute} style={styles.feedMuteButton}>
              <Ionicons
                name={isMuted ? "volume-mute" : "volume-high"}
                size={24}
                color={Colors.platinum}
              />
            </PressableScale>
          </Animated.View>
        )}

        {/* Media Navigation Dots (Instagram style) */}
        {hasMultipleMedia && (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.dotsContainer}
          >
            {post.media.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentMediaIndex && styles.dotActive,
                ]}
              />
            ))}
          </Animated.View>
        )}

        {/* Media Navigation Arrows */}
        {hasMultipleMedia && showControls && (
          <>
            {currentMediaIndex > 0 && (
              <Animated.View
                entering={FadeIn}
                exiting={FadeOut}
                style={styles.navLeft}
              >
                <PressableScale onPress={handlePreviousMedia}>
                  <View style={styles.navButton}>
                    <Ionicons
                      name="chevron-back"
                      size={24}
                      color={Colors.platinum}
                    />
                  </View>
                </PressableScale>
              </Animated.View>
            )}
            {currentMediaIndex < post.media.length - 1 && (
              <Animated.View
                entering={FadeIn}
                exiting={FadeOut}
                style={styles.navRight}
              >
                <PressableScale onPress={handleNextMedia}>
                  <View style={styles.navButton}>
                    <Ionicons
                      name="chevron-forward"
                      size={24}
                      color={Colors.platinum}
                    />
                  </View>
                </PressableScale>
              </Animated.View>
            )}
          </>
        )}
      </View>

      {/* Post Info Overlay */}
      {showControls && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.infoOverlay}
        >
          <View style={styles.gradientOverlay}>
            {post.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.description}>{post.description}</Text>
              </View>
            )}

            <View style={styles.statsRow}>
              <LikeButton
                isLiked={post.isLiked}
                likeCount={post.likeCount}
                onToggleLike={() => onToggleLike(post.id)}
                size="medium"
                showCount={true}
              />
            </View>
          </View>
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
    </View>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}
