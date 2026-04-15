import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  Alert,
  Dimensions,
  Pressable,
  Modal as RNModal,
  StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { VideoView, useVideoPlayer } from "expo-video";
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  SlideInRight,
} from "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Colors } from "@/constants/ui";
import { PressableScale } from "@/components/ui/PressableScale";
import { Modal } from "../../modal";
import { VideoTrimmerModal } from "../VideoTrimmerModal";
import { trimVideo } from "@/utils/videoProcessor";
import postsService from "@/services/postsService";
import { clubsService, Club as ApiClub } from "@/services/clubsService";
import { useDebounce } from "@/hooks/useDebounce";
import { styles } from "./styles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface MediaItem {
  uri: string;
  type: "image" | "video";
  duration?: number;
  startTime?: number; // For trimmed videos
  endTime?: number; // For trimmed videos
  assetId?: string; // S3 asset ID after upload
  uploadProgress?: number; // Upload progress percentage
  width?: number; // Video/image width
  height?: number; // Video/image height
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onPost?: () => void;
  preselectedClubId?: string;
  clubName?: string;
  showClubSelector?: boolean;
}

export function AddPostModal({
  visible,
  onClose,
  onPost,
  preselectedClubId,
  clubName,
  showClubSelector = false,
}: Props) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [description, setDescription] = useState("");
  const [selectedClubId, setSelectedClubId] = useState<string | undefined>(
    preselectedClubId,
  );
  const [selectedClubData, setSelectedClubData] = useState<{
    id: string;
    name: string;
    image: string;
  } | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [clubSearchQuery, setClubSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [clubSearchResults, setClubSearchResults] = useState<
    Array<{ id: string; name: string; image: string }>
  >([]);
  const debouncedClubSearch = useDebounce(clubSearchQuery, 300);

  // Fetch clubs from API when search query changes
  useEffect(() => {
    if (!debouncedClubSearch.trim()) {
      setClubSearchResults([]);
      return;
    }
    clubsService
      .getClubs(false, 1, 20, debouncedClubSearch)
      .then(({ clubs }) =>
        setClubSearchResults(
          clubs.map((c: ApiClub, i: number) => ({
            id: c.id,
            name: c.name,
            image: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
          })),
        ),
      )
      .catch(() => setClubSearchResults([]));
  }, [debouncedClubSearch]);

  // Video trimming state
  const [showVideoTrimmer, setShowVideoTrimmer] = useState(false);
  const [videoToTrim, setVideoToTrim] = useState<MediaItem | null>(null);
  const [videoToTrimIndex, setVideoToTrimIndex] = useState<number>(-1);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  // Media preview state
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!visible) {
      setMediaItems([]);
      setDescription("");
      setSelectedClubId(preselectedClubId);
      setSelectedClubData(null);
      setIsPosting(false);
      setClubSearchQuery("");
      setShowSuggestions(false);
      setClubSearchResults([]);
      setShowVideoTrimmer(false);
      setVideoToTrim(null);
      setVideoToTrimIndex(-1);
      setIsProcessingVideo(false);
      setProcessingProgress(0);
    } else {
      setSelectedClubId(preselectedClubId);
    }
  }, [visible, preselectedClubId]);

  const handleClubSearch = (text: string) => {
    setClubSearchQuery(text);
    setShowSuggestions(text.trim().length > 0);
  };

  const selectClub = (club: { id: string; name: string; image: string }) => {
    setSelectedClubId(club.id);
    setSelectedClubData(club);
    setClubSearchQuery("");
    setShowSuggestions(false);
    setClubSearchResults([]);
  };

  const clearClubSelection = () => {
    setSelectedClubId(undefined);
    setSelectedClubData(null);
    setClubSearchQuery("");
    setShowSuggestions(false);
    setClubSearchResults([]);
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || libraryStatus !== "granted") {
      Alert.alert(
        "Permissions Required",
        "Camera and photo library permissions are required to post content.",
        [{ text: "OK" }],
      );
      return false;
    }
    return true;
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
        videoMaxDuration: 60, // 60 seconds max
        selectionLimit: 10 - mediaItems.length, // Max 10 total items
      });

      if (!result.canceled && result.assets) {
        const newMedia: MediaItem[] = result.assets.map((asset) => ({
          uri: asset.uri,
          type: asset.type === "video" ? "video" : "image",
          duration: asset.duration ? asset.duration / 1000 : undefined, // Convert to seconds
          width: asset.width,
          height: asset.height,
        }));

        // Check if any videos need trimming (> 30 seconds)
        const videosNeedingTrim = newMedia.filter(
          (item) =>
            item.type === "video" && item.duration && item.duration > 30,
        );

        if (videosNeedingTrim.length > 0) {
          // Add all media first
          setMediaItems([...mediaItems, ...newMedia]);
          // Then show trimmer for first video that needs trimming
          const firstVideoIndex =
            mediaItems.length +
            newMedia.findIndex(
              (item) =>
                item.type === "video" && item.duration && item.duration > 30,
            );
          setVideoToTrim(videosNeedingTrim[0]);
          setVideoToTrimIndex(firstVideoIndex);
          setShowVideoTrimmer(true);
        } else {
          setMediaItems([...mediaItems, ...newMedia]);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick media from gallery.");
      console.error("Gallery error:", error);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 5],
      });

      if (!result.canceled && result.assets[0]) {
        const newMedia: MediaItem = {
          uri: result.assets[0].uri,
          type: "image",
          width: result.assets[0].width,
          height: result.assets[0].height,
        };
        setMediaItems([...mediaItems, newMedia]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo.");
      console.error("Camera error:", error);
    }
  };

  const takeVideo = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        videoMaxDuration: 60,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newMedia: MediaItem = {
          uri: result.assets[0].uri,
          type: "video",
          duration: result.assets[0].duration
            ? result.assets[0].duration / 1000
            : undefined,
          width: result.assets[0].width,
          height: result.assets[0].height,
        };

        // Check if video needs trimming (> 30 seconds)
        if (newMedia.duration && newMedia.duration > 30) {
          setMediaItems([...mediaItems, newMedia]);
          setVideoToTrim(newMedia);
          setVideoToTrimIndex(mediaItems.length);
          setShowVideoTrimmer(true);
        } else {
          setMediaItems([...mediaItems, newMedia]);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to record video.");
      console.error("Video error:", error);
    }
  };

  const removeMedia = (index: number) => {
    setMediaItems(mediaItems.filter((_, i) => i !== index));
  };

  const handleTrimConfirm = async (startTime: number, endTime: number) => {
    if (videoToTrimIndex >= 0 && videoToTrim) {
      setShowVideoTrimmer(false);
      setIsProcessingVideo(true);
      setProcessingProgress(0);

      try {
        // Process the video with trim metadata
        const result = await trimVideo({
          videoUri: videoToTrim.uri,
          startTime,
          endTime,
          onProgress: (progress) => {
            setProcessingProgress(progress);
          },
        });

        const updatedItems = [...mediaItems];
        updatedItems[videoToTrimIndex] = {
          uri: result.uri,
          type: "video",
          duration: result.duration,
          startTime,
          endTime,
          width: videoToTrim.width, // Preserve original dimensions
          height: videoToTrim.height,
        };
        setMediaItems(updatedItems);

        setIsProcessingVideo(false);
        setProcessingProgress(0);
      } catch (error) {
        setIsProcessingVideo(false);
        setProcessingProgress(0);
        Alert.alert("Error", "Failed to process video. Please try again.");
        console.error("Video trim error:", error);
      }
    }
    setVideoToTrim(null);
    setVideoToTrimIndex(-1);
  };

  const handleTrimCancel = () => {
    // Remove the video if user cancels trimming
    if (videoToTrimIndex >= 0) {
      Alert.alert(
        "Remove Video?",
        "This video is longer than 30 seconds. Do you want to remove it or trim it?",
        [
          {
            text: "Remove",
            style: "destructive",
            onPress: () => {
              setMediaItems(
                mediaItems.filter((_, i) => i !== videoToTrimIndex),
              );
              setShowVideoTrimmer(false);
              setVideoToTrim(null);
              setVideoToTrimIndex(-1);
            },
          },
          {
            text: "Trim It",
            onPress: () => {
              // Keep trimmer open
            },
          },
        ],
      );
    } else {
      setShowVideoTrimmer(false);
      setVideoToTrim(null);
      setVideoToTrimIndex(-1);
    }
  };

  const handlePost = () => {
    if (mediaItems.length === 0) {
      Alert.alert("No Media", "Please add at least one photo or video.");
      return;
    }

    if (showClubSelector && !selectedClubId) {
      Alert.alert("Select Club", "Please select which club this post is for.");
      return;
    }

    // Check if any videos are longer than 30 seconds and haven't been trimmed
    const untrimmedLongVideos = mediaItems.filter(
      (item) =>
        item.type === "video" &&
        item.duration &&
        item.duration > 30 &&
        !item.startTime &&
        !item.endTime,
    );

    if (untrimmedLongVideos.length > 0) {
      Alert.alert(
        "Trim Required",
        "Some videos are longer than 30 seconds. Please trim them before posting.",
        [{ text: "OK" }],
      );
      return;
    }

    // Use the club ID or throw error
    const clubId = selectedClubId || preselectedClubId;
    if (!clubId) {
      Alert.alert("Error", "No club selected");
      return;
    }

    setIsPosting(true);

    // Upload all media to S3 first, then create post
    uploadMediaToS3()
      .then((assetIds) => {
        // Create post with asset IDs
        return postsService.createPost({
          club_id: clubId,
          asset_ids: assetIds,
          caption: description.trim() || undefined,
        });
      })
      .then((post) => {
        setIsPosting(false);
        onClose();
        // Notify parent to refresh posts list
        onPost?.();
      })
      .catch((error) => {
        console.error("Failed to create post:", error);
        Alert.alert(
          "Error",
          error.message || "Failed to create post. Please try again.",
        );
        setIsPosting(false);
      });
  };

  const uploadMediaToS3 = (): Promise<string[]> => {
    return Promise.all(
      mediaItems.map((item, index) => {
        // Prepare metadata - always include type and dimensions
        const metadata = {
          type: item.type, // Explicitly set type so backend knows video vs image
          ...(item.type === "video"
            ? {
                duration: item.duration,
                start_time: item.startTime,
                end_time: item.endTime,
                width: item.width,
                height: item.height,
              }
            : {}),
        };

        // Generate filename with proper extension
        const extension = item.type === "video" ? "mp4" : "jpg";
        const filename = `media_${Date.now()}_${index}.${extension}`;

        return postsService.uploadMedia(
          {
            uri: item.uri,
            type: item.type,
            name: filename,
          },
          metadata,
          (progress) => {
            // Update progress for this item
            setMediaItems((prevItems) => {
              const newItems = [...prevItems];
              newItems[index] = {
                ...newItems[index],
                uploadProgress: progress,
              };
              return newItems;
            });
          },
        );
      }),
    ).then((assets) => {
      // Extract asset IDs
      return assets.map((asset) => asset.id);
    });
  };

  const selectedClub = selectedClubData;

  if (!visible) return null;

  return (
    <>
      <Modal onDismiss={onClose} sliding bgColor={Colors.bg}>
        {!showVideoTrimmer && !showPreview && (
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <PressableScale onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={28} color={Colors.gold} />
              </PressableScale>
              <Text style={styles.headerTitle}>Create Post</Text>
              <PressableScale
                onPress={handlePost}
                disabled={isPosting || mediaItems.length === 0}
                style={[
                  styles.postButton,
                  (isPosting || mediaItems.length === 0) &&
                    styles.postButtonDisabled,
                ]}
              >
                {isPosting ? (
                  <Text style={styles.postButtonText}>Posting...</Text>
                ) : (
                  <Text style={styles.postButtonText}>Post</Text>
                )}
              </PressableScale>
            </View>

            <ScrollView
              style={styles.content}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Club Tag Section */}
              <Animated.View
                entering={FadeIn.delay(100)}
                style={styles.tagClubSection}
              >
                <View style={styles.tagHeader}>
                  <View style={styles.tagHeaderLeft}>
                    <Ionicons name="pricetag" size={18} color={Colors.gold} />
                    <Text style={styles.tagHeaderTitle}>Tag Club</Text>
                  </View>
                </View>

                {/* Selected Club Pill */}
                {selectedClubId && selectedClub && (
                  <Animated.View
                    entering={ZoomIn.springify()}
                    style={styles.selectedClubPillRow}
                  >
                    <View style={styles.selectedClubPill}>
                      <Text style={styles.selectedClubPillHash}>#</Text>
                      <Text
                        style={styles.selectedClubPillName}
                        numberOfLines={1}
                      >
                        {selectedClub.name}
                      </Text>
                      <PressableScale
                        onPress={clearClubSelection}
                        style={styles.removeClubButton}
                      >
                        <Ionicons
                          name="close-circle"
                          size={16}
                          color={Colors.gold}
                        />
                      </PressableScale>
                    </View>
                  </Animated.View>
                )}

                {/* Search Input */}
                <View style={styles.searchInputContainer}>
                  <Ionicons
                    name="search"
                    size={18}
                    color={Colors.smoke}
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search for a club..."
                    placeholderTextColor={Colors.smoke}
                    value={clubSearchQuery}
                    onChangeText={handleClubSearch}
                    onFocus={() =>
                      setShowSuggestions(clubSearchQuery.trim().length > 0)
                    }
                  />
                  {clubSearchQuery.length > 0 && (
                    <PressableScale onPress={() => handleClubSearch("")}>
                      <Ionicons
                        name="close-circle"
                        size={18}
                        color={Colors.smoke}
                      />
                    </PressableScale>
                  )}
                </View>

                {/* Autocomplete Suggestions */}
                {showSuggestions && clubSearchResults.length > 0 && (
                  <Animated.View
                    entering={FadeIn}
                    style={styles.suggestionsContainer}
                  >
                    {clubSearchResults.map((club) => (
                      <PressableScale
                        key={club.id}
                        onPress={() => selectClub(club)}
                        style={styles.suggestionItem}
                      >
                        <Image
                          source={{ uri: club.image }}
                          style={styles.suggestionImage}
                        />
                        <View style={styles.suggestionInfo}>
                          <Text style={styles.suggestionHash}>#</Text>
                          <Text style={styles.suggestionName}>{club.name}</Text>
                        </View>
                        <Ionicons
                          name="arrow-forward"
                          size={16}
                          color={Colors.gold}
                        />
                      </PressableScale>
                    ))}
                  </Animated.View>
                )}

                {showSuggestions &&
                  clubSearchQuery.trim().length > 0 &&
                  clubSearchResults.length === 0 && (
                    <Animated.View
                      entering={FadeIn}
                      style={styles.noResultsContainer}
                    >
                      <Text style={styles.noResultsText}>
                        No clubs found matching "{clubSearchQuery}"
                      </Text>
                    </Animated.View>
                  )}
              </Animated.View>

              {/* Media Picker Actions */}
              {mediaItems.length < 10 && (
                <Animated.View
                  entering={FadeIn.delay(200)}
                  style={styles.actionsSection}
                >
                  <Text style={styles.sectionLabel}>Add Media</Text>
                  <View style={styles.actionsGrid}>
                    <PressableScale
                      onPress={takePhoto}
                      style={styles.actionButton}
                    >
                      <Ionicons name="camera" size={32} color={Colors.gold} />
                      <Text style={styles.actionButtonText}>Take Photo</Text>
                    </PressableScale>

                    <PressableScale
                      onPress={takeVideo}
                      style={styles.actionButton}
                    >
                      <Ionicons name="videocam" size={32} color={Colors.gold} />
                      <Text style={styles.actionButtonText}>Record Video</Text>
                    </PressableScale>

                    <PressableScale
                      onPress={pickFromGallery}
                      style={styles.actionButton}
                    >
                      <Ionicons name="images" size={32} color={Colors.gold} />
                      <Text style={styles.actionButtonText}>From Gallery</Text>
                    </PressableScale>
                  </View>
                </Animated.View>
              )}

              {/* Media Preview Grid */}
              {mediaItems.length > 0 && (
                <Animated.View
                  entering={FadeIn.delay(300)}
                  style={styles.mediaSection}
                >
                  <View style={styles.mediaSectionHeader}>
                    <Text style={styles.sectionLabel}>
                      Media ({mediaItems.length}/10)
                    </Text>
                    {mediaItems.length < 10 && (
                      <Text style={styles.addMoreHint}>
                        Tap buttons above to add more
                      </Text>
                    )}
                  </View>
                  <View style={styles.mediaGrid}>
                    {mediaItems.map((item, index) => (
                      <MediaItemPreview
                        key={index}
                        item={item}
                        index={index}
                        onRemove={removeMedia}
                        onPress={() => {
                          setPreviewMedia(item);
                          setShowPreview(true);
                        }}
                      />
                    ))}
                  </View>
                </Animated.View>
              )}

              {/* Description Input */}
              <Animated.View
                entering={FadeIn.delay(400)}
                style={styles.descriptionSection}
              >
                <Text style={styles.sectionLabel}>Description (Optional)</Text>
                <TextInput
                  style={styles.descriptionInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Share what makes this moment special..."
                  placeholderTextColor={Colors.smoke}
                  multiline
                  maxLength={300}
                />
                <Text style={styles.charCount}>{description.length}/300</Text>
              </Animated.View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        )}

        {/* Video Processing Overlay */}
        {isProcessingVideo && (
          <View style={styles.processingOverlay}>
            <BlurView intensity={80} style={StyleSheet.absoluteFill}>
              <View style={styles.processingContent}>
                <View style={styles.processingIconContainer}>
                  <LinearGradient
                    colors={[Colors.gold, "#C89D5C"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.processingIconGradient}
                  >
                    <Ionicons name="cut" size={32} color={Colors.bg} />
                  </LinearGradient>
                </View>
                <Text style={styles.processingTitle}>Trimming Video</Text>
                <Text style={styles.processingSubtitle}>
                  Creating your perfect 30-second clip...
                </Text>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <Animated.View
                      entering={ZoomIn}
                      style={[
                        styles.progressBarFill,
                        { width: `${processingProgress}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {Math.round(processingProgress)}%
                  </Text>
                </View>
              </View>
            </BlurView>
          </View>
        )}
      </Modal>

      {/* Video Trimmer Modal - Rendered outside to prevent nesting */}
      {showVideoTrimmer && videoToTrim && videoToTrim.duration && (
        <VideoTrimmerModal
          visible={showVideoTrimmer}
          videoUri={videoToTrim.uri}
          videoDuration={videoToTrim.duration}
          onCancel={handleTrimCancel}
          onConfirm={handleTrimConfirm}
        />
      )}

      {/* Media Preview Modal */}
      {showPreview && previewMedia && (
        <MediaPreviewModal
          visible={showPreview}
          media={previewMedia}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}

// Separate component for media item preview with video player
function MediaItemPreview({
  item,
  index,
  onRemove,
  onPress,
}: {
  item: MediaItem;
  index: number;
  onRemove: (index: number) => void;
  onPress: () => void;
}) {
  const videoPlayer = useVideoPlayer(
    item.type === "video" ? item.uri : "",
    (player) => {
      player.loop = false;
      player.muted = true;
    },
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Animated.View
      entering={SlideInRight.delay(index * 50).springify()}
      style={styles.mediaItem}
    >
      <Pressable onPress={onPress} style={{ flex: 1 }}>
        {item.type === "image" ? (
          <Image source={{ uri: item.uri }} style={styles.mediaItemImage} />
        ) : (
          <View style={styles.videoContainer}>
            <VideoView
              player={videoPlayer}
              style={styles.mediaItemImage}
              contentFit="cover"
              nativeControls={false}
              allowsFullscreen={false}
            />
            <View style={styles.videoOverlay}>
              <Ionicons name="play-circle" size={32} color={Colors.platinum} />
              {item.duration && (
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>
                    {formatDuration(item.duration)}
                  </Text>
                  {item.startTime !== undefined &&
                    item.endTime !== undefined && (
                      <Ionicons
                        name="cut"
                        size={10}
                        color={Colors.gold}
                        style={{ marginLeft: 4 }}
                      />
                    )}
                </View>
              )}
            </View>
          </View>
        )}
      </Pressable>
      <Pressable onPress={() => onRemove(index)} style={styles.removeButton}>
        <BlurView intensity={80} style={styles.removeButtonBlur}>
          <Ionicons name="close" size={16} color={Colors.platinum} />
        </BlurView>
      </Pressable>
    </Animated.View>
  );
}

// Media Preview Modal Component
function MediaPreviewModal({
  visible,
  media,
  onClose,
}: {
  visible: boolean;
  media: MediaItem;
  onClose: () => void;
}) {
  const [isMuted, setIsMuted] = React.useState(false);
  const [videoProgress, setVideoProgress] = React.useState(0);
  const [showControls, setShowControls] = React.useState(true);
  const controlsTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const progressBarWidthRef = React.useRef<number>(0);

  const videoPlayer = useVideoPlayer(
    media.type === "video" ? media.uri : "",
    (player) => {
      player.loop = true;
      player.muted = isMuted;
    },
  );

  // Update muted state
  React.useEffect(() => {
    if (videoPlayer) {
      videoPlayer.muted = isMuted;
    }
  }, [isMuted, videoPlayer]);

  // Handle video playback and progress
  React.useEffect(() => {
    if (!videoPlayer || media.type !== "video" || !visible) return;

    videoPlayer.play();

    const interval = setInterval(() => {
      const currentTime = videoPlayer.currentTime;
      const duration = media.duration || 1;
      const progress = (currentTime / duration) * 100;
      setVideoProgress(Math.max(0, Math.min(100, progress)));
    }, 100);

    return () => clearInterval(interval);
  }, [videoPlayer, media, visible]);

  // Auto-hide controls after 3 seconds
  React.useEffect(() => {
    if (showControls && media.type === "video") {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
      controlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, [showControls, media.type]);

  const handleVideoTap = () => {
    setShowControls(!showControls);
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

  const handleProgressBarLayout = (event: any) => {
    progressBarWidthRef.current = event.nativeEvent.layout.width;
  };

  const handleProgressBarPress = (event: any) => {
    if (!videoPlayer || media.type !== "video" || !progressBarWidthRef.current)
      return;

    const { locationX } = event.nativeEvent;
    const progress = Math.max(
      0,
      Math.min(1, locationX / progressBarWidthRef.current),
    );
    const duration = media.duration || 0;
    const newTime = progress * duration;

    const wasPlaying = videoPlayer.playing;
    videoPlayer.currentTime = newTime;
    if (wasPlaying) {
      videoPlayer.play();
    }
  };

  if (!visible) return null;

  const isVideo = media.type === "video";

  return (
    <RNModal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <GestureHandlerRootView style={styles.gestureRoot}>
        <StatusBar backgroundColor="#000" barStyle="light-content" />
        <View style={styles.previewContainer}>
          {/* Close button overlay */}
          <View style={styles.previewTopBar}>
            <PressableScale onPress={onClose} style={styles.previewCloseButton}>
              <Ionicons name="close" size={28} color={Colors.platinum} />
            </PressableScale>
          </View>

          <View style={styles.previewMediaContainer}>
            {isVideo ? (
              <>
                <VideoView
                  player={videoPlayer}
                  style={styles.previewVideo}
                  contentFit="contain"
                  nativeControls={false}
                  allowsFullscreen={false}
                />

                {/* Tap to show/hide controls */}
                <Pressable
                  style={styles.previewVideoTapArea}
                  onPress={handleVideoTap}
                />

                {/* Bottom Controls */}
                {showControls && (
                  <Animated.View
                    entering={FadeIn}
                    exiting={FadeOut}
                    style={styles.previewBottomControls}
                  >
                    <PressableScale
                      onPress={togglePlayPause}
                      style={styles.previewPlayPauseButton}
                    >
                      <Ionicons
                        name={videoPlayer?.playing ? "pause" : "play"}
                        size={24}
                        color={Colors.platinum}
                      />
                    </PressableScale>

                    <Pressable
                      style={styles.previewProgressContainer}
                      onPress={handleProgressBarPress}
                    >
                      <View
                        style={styles.previewProgressBar}
                        onLayout={handleProgressBarLayout}
                      >
                        <Animated.View
                          entering={FadeIn}
                          style={[
                            styles.previewProgressFill,
                            { width: `${videoProgress}%` },
                          ]}
                        />
                      </View>
                    </Pressable>

                    <PressableScale
                      onPress={toggleMute}
                      style={styles.previewMuteButton}
                    >
                      <Ionicons
                        name={isMuted ? "volume-mute" : "volume-high"}
                        size={24}
                        color={Colors.platinum}
                      />
                    </PressableScale>
                  </Animated.View>
                )}
              </>
            ) : (
              <Image
                source={{ uri: media.uri }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </GestureHandlerRootView>
    </RNModal>
  );
}
