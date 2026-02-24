import React, { useState, useEffect, useRef } from "react";
import { CardTitle, CardDescription } from "../../../components/Card";
import { PrimaryButton, OutlineButton } from "../../../components/Buttons";
import { theme } from "../../../styles/theme";
import {
  RiUploadLine,
  RiVideoLine,
  RiCloseLine,
  RiCheckLine,
  RiImageAddLine,
  RiHeartFill,
  RiEyeLine,
  RiPlayCircleLine,
  RiScissorsFill,
  RiAlertLine,
  RiDeleteBinLine,
  RiEditLine,
} from "react-icons/ri";
import { apiService } from "../../../services/api";
import { useToast } from "../../../components/Toast";
import { VideoTrimmer } from "../../../components/VideoTrimmer";
import { MAX_DURATION } from "../../../components/VideoTrimmer/styles";
import {
  SettingsContainer,
  PageHeader,
  HeaderLeft,
  PageTitle,
  PageDescription,
  UploadCard,
  UploadArea,
  UploadText,
  UploadHint,
  SelectedFilesArea,
  SelectedFile,
  FileIcon,
  FileThumb,
  FileInfo,
  FileName,
  FileSize,
  RemoveButton,
  TrimButton,
  NeedsTrimBadge,
  TrimRequiredBanner,
  CaptionInput,
  UploadActions,
  ProgressBarWrap,
  ProgressLabel,
  ProgressBar,
  ProgressFill,
  GalleryGrid,
  MediaCard,
  MediaPreview,
  MediaImage,
  MediaVideo,
  MediaOverlay,
  MediaOverlayIcon,
  MediaCaption,
  MediaDate,
  LikeBadge,
  LikeCount,
  EmptyState,
  MediaActionBar,
  MediaActionBtn,
  EditCaptionOverlay,
  EditCaptionBox,
  EditCaptionTitle,
  EditCaptionActions,
  DeleteConfirmBox,
  DeleteConfirmIcon,
  DeleteConfirmText,
  DangerButton,
  LightboxOverlay,
  LightboxMedia,
  LightboxImage,
  LightboxVideo,
  LightboxClose,
  LightboxInfo,
  LightboxCaption,
  LightboxMeta,
} from "./styles";

interface SelectedFileType {
  file: File;
  preview: string;
  isVideo: boolean;
  needsTrim?: boolean;
}

function getVideoDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => resolve(video.duration);
    video.onerror = () => resolve(0);
    video.src = url;
  });
}

export const Media: React.FC = () => {
  const toast = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileType[]>([]);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [trimmingFile, setTrimmingFile] = useState<{
    file: File;
    index: number;
  } | null>(null);
  const [editingPost, setEditingPost] = useState<{
    id: string;
    caption: string;
  } | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [previewPost, setPreviewPost] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = () => {
    setLoading(true);
    apiService
      .getPosts(1, 100, "approved", "club")
      .then((response) => {
        setPosts(response.posts || []);
      })
      .catch((error) => {
        console.error("Failed to load media:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB
      return (isImage || isVideo) && isValidSize;
    });

    const newFiles: SelectedFileType[] = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isVideo: file.type.startsWith("video/"),
    }));

    // Add files to state immediately so they appear in the UI
    setSelectedFiles((prev) => [...prev, ...newFiles]);

    // Check durations for video files and mark those that exceed the limit
    newFiles.forEach((f) => {
      if (!f.isVideo) return;
      getVideoDuration(f.preview).then((duration) => {
        if (duration > MAX_DURATION) {
          setSelectedFiles((prev) => {
            const updated = [...prev];
            const idx = updated.findIndex((sf) => sf.file === f.file);
            if (idx !== -1) {
              updated[idx] = { ...updated[idx], needsTrim: true };
              // Auto-open trimmer for this video if none is open
              setTrimmingFile((current) =>
                current === null
                  ? { file: updated[idx].file, index: idx }
                  : current,
              );
            }
            return updated;
          });
        }
      });
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleTrimConfirm = (trimmedFile: File) => {
    if (trimmingFile === null) return;
    const idx = trimmingFile.index;
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[idx].preview);
      newFiles[idx] = {
        file: trimmedFile,
        preview: URL.createObjectURL(trimmedFile),
        isVideo: true,
        needsTrim: false,
      };
      return newFiles;
    });
    setTrimmingFile(null);
    toast.success("Video trimmed successfully!");
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    const uploadPromises = selectedFiles.map((fileData, index) => {
      const formData = new FormData();
      formData.append("file", fileData.file);
      formData.append(
        "meta",
        JSON.stringify({ type: fileData.isVideo ? "video" : "image" }),
      );

      return apiService.uploadAsset(formData, (progress) => {
        const overallProgress =
          ((index + progress / 100) / selectedFiles.length) * 100;
        setUploadProgress(Math.round(overallProgress));
      });
    });

    Promise.all(uploadPromises)
      .then((assets) => {
        const assetIds = assets.map((asset) => asset.id);
        return apiService.createClubPost(assetIds, caption.trim() || undefined);
      })
      .then(() => {
        setSelectedFiles([]);
        setCaption("");
        setUploadProgress(0);
        loadPosts();
        toast.success("Media uploaded successfully!");
      })
      .catch((error) => {
        console.error("Upload failed:", error);
        toast.error("Failed to upload media. Please try again.");
      })
      .finally(() => {
        setUploading(false);
      });
  };

  const handleDeletePost = () => {
    if (!confirmDeleteId) return;
    const postId = confirmDeleteId;
    setConfirmDeleteId(null);
    apiService
      .deleteClubPost(postId)
      .then(() => {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        toast.success("Post deleted successfully.");
      })
      .catch((error) => {
        console.error("Delete failed:", error);
        toast.error("Failed to delete post.");
      });
  };

  const openEditCaption = (post: any) => {
    setEditingPost({ id: post.id, caption: post.caption || "" });
    setEditCaption(post.caption || "");
  };

  const handleSaveCaption = () => {
    if (!editingPost) return;
    apiService
      .updateClubPost(editingPost.id, editCaption)
      .then(() => {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === editingPost.id ? { ...p, caption: editCaption } : p,
          ),
        );
        setEditingPost(null);
        toast.success("Caption updated.");
      })
      .catch((error) => {
        console.error("Update failed:", error);
        toast.error("Failed to update caption.");
      });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const hasUntrimmedVideos = selectedFiles.some((f) => f.needsTrim);

  return (
    <>
      {trimmingFile && (
        <VideoTrimmer
          isOpen={true}
          file={trimmingFile.file}
          onCancel={() => setTrimmingFile(null)}
          onConfirm={handleTrimConfirm}
        />
      )}
      <SettingsContainer>
        <PageHeader>
          <HeaderLeft>
            <PageTitle>Media Gallery</PageTitle>
            <PageDescription>
              Upload and manage photos and videos of your club that will be
              visible to users.
            </PageDescription>
          </HeaderLeft>
        </PageHeader>

        <UploadCard>
          <CardTitle style={{ marginBottom: theme.spacing.lg }}>
            Upload New Media
          </CardTitle>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => handleFileSelect(e.target.files)}
          />

          <UploadArea
            isDragging={isDragging}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {React.createElement(RiUploadLine as React.ComponentType)}
            <UploadText>Click to upload or drag and drop</UploadText>
            <UploadHint>PNG, JPG, MP4 · Videos max 30 seconds</UploadHint>
          </UploadArea>

          {selectedFiles.length > 0 && (
            <SelectedFilesArea>
              {selectedFiles.map((fileData, index) => (
                <SelectedFile key={index}>
                  {fileData.isVideo ? (
                    <FileIcon>
                      {React.createElement(RiVideoLine as React.ComponentType)}
                    </FileIcon>
                  ) : (
                    <FileThumb
                      src={fileData.preview}
                      alt={fileData.file.name}
                    />
                  )}
                  <FileInfo>
                    <FileName>{fileData.file.name}</FileName>
                    <FileSize>{formatFileSize(fileData.file.size)}</FileSize>
                  </FileInfo>
                  {fileData.needsTrim && (
                    <NeedsTrimBadge>
                      {React.createElement(RiAlertLine as React.ComponentType)}
                      Too long
                    </NeedsTrimBadge>
                  )}
                  {fileData.isVideo && (
                    <TrimButton
                      urgent={fileData.needsTrim}
                      onClick={() =>
                        setTrimmingFile({ file: fileData.file, index })
                      }
                      disabled={uploading}
                    >
                      {React.createElement(
                        RiScissorsFill as React.ComponentType,
                      )}
                      {fileData.needsTrim ? "Trim required" : "Trim"}
                    </TrimButton>
                  )}
                  <RemoveButton onClick={() => removeFile(index)}>
                    {React.createElement(RiCloseLine as React.ComponentType)}
                  </RemoveButton>
                </SelectedFile>
              ))}

              {hasUntrimmedVideos && (
                <TrimRequiredBanner>
                  {React.createElement(RiAlertLine as React.ComponentType)}
                  Videos must be trimmed to {MAX_DURATION}s or less before
                  uploading.
                </TrimRequiredBanner>
              )}

              <CaptionInput
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption (optional)"
              />

              {uploading && (
                <ProgressBarWrap>
                  <ProgressLabel>
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </ProgressLabel>
                  <ProgressBar>
                    <ProgressFill progress={uploadProgress} />
                  </ProgressBar>
                </ProgressBarWrap>
              )}

              <UploadActions>
                <PrimaryButton
                  fullWidth
                  onClick={handleUpload}
                  disabled={uploading || hasUntrimmedVideos}
                >
                  {React.createElement(RiCheckLine as React.ComponentType)}
                  {uploading
                    ? "Uploading..."
                    : `Upload ${selectedFiles.length} ${selectedFiles.length === 1 ? "file" : "files"}`}
                </PrimaryButton>
                <OutlineButton
                  onClick={() => setSelectedFiles([])}
                  disabled={uploading}
                >
                  Cancel
                </OutlineButton>
              </UploadActions>
            </SelectedFilesArea>
          )}
        </UploadCard>

        {editingPost && (
          <EditCaptionOverlay onClick={() => setEditingPost(null)}>
            <EditCaptionBox onClick={(e) => e.stopPropagation()}>
              <EditCaptionTitle>Edit Caption</EditCaptionTitle>
              <CaptionInput
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                placeholder="Add a caption (optional)"
                autoFocus
              />
              <EditCaptionActions>
                <OutlineButton onClick={() => setEditingPost(null)}>
                  Cancel
                </OutlineButton>
                <PrimaryButton onClick={handleSaveCaption}>Save</PrimaryButton>
              </EditCaptionActions>
            </EditCaptionBox>
          </EditCaptionOverlay>
        )}

        {confirmDeleteId && (
          <EditCaptionOverlay onClick={() => setConfirmDeleteId(null)}>
            <DeleteConfirmBox onClick={(e) => e.stopPropagation()}>
              <DeleteConfirmIcon>
                {React.createElement(RiDeleteBinLine as React.ComponentType)}
              </DeleteConfirmIcon>
              <EditCaptionTitle>Delete Post</EditCaptionTitle>
              <DeleteConfirmText>
                This media post and all its assets will be permanently removed.
                This action cannot be undone.
              </DeleteConfirmText>
              <EditCaptionActions>
                <OutlineButton onClick={() => setConfirmDeleteId(null)}>
                  Cancel
                </OutlineButton>
                <DangerButton onClick={handleDeletePost}>Delete</DangerButton>
              </EditCaptionActions>
            </DeleteConfirmBox>
          </EditCaptionOverlay>
        )}

        {previewPost &&
          (() => {
            const asset = previewPost.assets?.[0];
            const isVid = asset?.type === "video";
            return (
              <LightboxOverlay onClick={() => setPreviewPost(null)}>
                <LightboxClose onClick={() => setPreviewPost(null)}>
                  {React.createElement(RiCloseLine as React.ComponentType)}
                </LightboxClose>
                <LightboxMedia onClick={(e) => e.stopPropagation()}>
                  {isVid ? (
                    <LightboxVideo
                      src={asset.url}
                      controls
                      autoPlay
                      playsInline
                    />
                  ) : (
                    <LightboxImage
                      src={asset.url}
                      alt={previewPost.caption || "Club media"}
                    />
                  )}
                </LightboxMedia>
                {(previewPost.caption || previewPost.inserted_at) && (
                  <LightboxInfo onClick={(e) => e.stopPropagation()}>
                    {previewPost.caption && (
                      <LightboxCaption>{previewPost.caption}</LightboxCaption>
                    )}
                    <LightboxMeta>
                      {formatDate(previewPost.inserted_at)}
                      {previewPost.assets?.length > 1 &&
                        ` · ${previewPost.assets.length} items`}
                      {previewPost.like_count > 0 && (
                        <span
                          style={{
                            marginLeft: theme.spacing.md,
                            color: "#ff4458",
                          }}
                        >
                          ♥ {previewPost.like_count}
                        </span>
                      )}
                    </LightboxMeta>
                  </LightboxInfo>
                )}
              </LightboxOverlay>
            );
          })()}

        <div
          style={{
            padding: theme.spacing.xl,
            background: theme.colors.backgroundCard,
            borderRadius: theme.borderRadius.xl,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <CardTitle style={{ marginBottom: theme.spacing.lg }}>
            Gallery{" "}
            {!loading && (
              <span
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.normal,
                  color: theme.colors.textSecondary,
                }}
              >
                ({posts.length} {posts.length === 1 ? "item" : "items"})
              </span>
            )}
          </CardTitle>

          {loading ? (
            <EmptyState>
              <CardDescription>Loading media...</CardDescription>
            </EmptyState>
          ) : posts.length > 0 ? (
            <GalleryGrid>
              {posts.map((post) => {
                const firstAsset = post.assets?.[0];
                if (!firstAsset) return null;

                const isVideo = firstAsset.type === "video";

                return (
                  <MediaCard key={post.id} onClick={() => setPreviewPost(post)}>
                    <MediaPreview>
                      {isVideo ? (
                        <MediaVideo src={firstAsset.url} playsInline muted />
                      ) : (
                        <MediaImage
                          src={firstAsset.url}
                          alt={post.caption || "Club media"}
                        />
                      )}

                      {post.like_count > 0 && (
                        <LikeBadge>
                          {React.createElement(
                            RiHeartFill as React.ComponentType,
                          )}
                          <LikeCount>{post.like_count}</LikeCount>
                        </LikeBadge>
                      )}

                      <MediaOverlay>
                        <MediaOverlayIcon>
                          {React.createElement(
                            isVideo
                              ? (RiPlayCircleLine as React.ComponentType)
                              : (RiEyeLine as React.ComponentType),
                          )}
                        </MediaOverlayIcon>
                        {post.caption && (
                          <MediaCaption>{post.caption}</MediaCaption>
                        )}
                        <MediaDate>
                          {formatDate(post.inserted_at)}
                          {post.assets?.length > 1 &&
                            ` · ${post.assets.length} items`}
                        </MediaDate>
                        <MediaActionBar>
                          <MediaActionBtn
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditCaption(post);
                            }}
                            title="Edit caption"
                          >
                            {React.createElement(
                              RiEditLine as React.ComponentType,
                            )}
                          </MediaActionBtn>
                          <MediaActionBtn
                            danger
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(post.id);
                            }}
                            title="Delete post"
                          >
                            {React.createElement(
                              RiDeleteBinLine as React.ComponentType,
                            )}
                          </MediaActionBtn>
                        </MediaActionBar>
                      </MediaOverlay>
                    </MediaPreview>
                  </MediaCard>
                );
              })}
            </GalleryGrid>
          ) : (
            <EmptyState>
              {React.createElement(RiImageAddLine as React.ComponentType)}
              <CardTitle>No media yet</CardTitle>
              <CardDescription>
                Upload your first photos or videos to get started
              </CardDescription>
            </EmptyState>
          )}
        </div>
      </SettingsContainer>
    </>
  );
};
