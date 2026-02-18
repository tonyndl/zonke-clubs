import React, { useState, useEffect, useRef } from "react";
import { Card, CardTitle, CardDescription } from "../../../components/Card";
import {
  PrimaryButton,
  DangerButton,
  OutlineButton,
} from "../../../components/Buttons";
import { theme } from "../../../styles/theme";
import {
  RiImageLine,
  RiDeleteBinLine,
  RiUploadLine,
  RiVideoLine,
  RiCloseLine,
  RiCheckLine,
  RiImageAddLine,
  RiHeartFill,
} from "react-icons/ri";
import { apiService } from "../../../services/api";
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
  FileInfo,
  FileName,
  FileSize,
  RemoveButton,
  CaptionInput,
  UploadActions,
  ProgressBar,
  ProgressFill,
  GalleryGrid,
  MediaCard,
  MediaPreview,
  MediaImage,
  MediaVideo,
  LikeBadge,
  LikeCount,
  MediaInfo,
  MediaName,
  MediaMeta,
  MediaActions,
  EmptyState,
} from "./styles";

interface SelectedFileType {
  file: File;
  preview: string;
  isVideo: boolean;
}

export const Media: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileType[]>([]);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = () => {
    setLoading(true);
    apiService
      .getPosts(1, 100, "approved")
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

    const newFiles = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isVideo: file.type.startsWith("video/"),
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    // Upload all files first
    const uploadPromises = selectedFiles.map((fileData, index) => {
      const formData = new FormData();
      formData.append("file", fileData.file);

      // Add metadata for type
      const metadata = {
        type: fileData.isVideo ? "video" : "image",
      };
      formData.append("meta", JSON.stringify(metadata));

      return apiService.uploadAsset(formData, (progress) => {
        // Update overall progress
        const overallProgress =
          ((index + progress / 100) / selectedFiles.length) * 100;
        setUploadProgress(Math.round(overallProgress));
      });
    });

    Promise.all(uploadPromises)
      .then((assets) => {
        // Extract asset IDs
        const assetIds = assets.map((asset) => asset.id);

        // Create post with uploaded assets
        return apiService.createClubPost(assetIds, caption.trim() || undefined);
      })
      .then(() => {
        // Success! Clear form and reload
        setSelectedFiles([]);
        setCaption("");
        setUploadProgress(0);
        loadPosts();
        alert("Media uploaded successfully!");
      })
      .catch((error) => {
        console.error("Upload failed:", error);
        alert("Failed to upload media. Please try again.");
      })
      .finally(() => {
        setUploading(false);
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

  return (
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
          <UploadHint>PNG, JPG, MP4 up to 50MB each</UploadHint>
        </UploadArea>

        {selectedFiles.length > 0 && (
          <SelectedFilesArea>
            {selectedFiles.map((fileData, index) => (
              <SelectedFile key={index}>
                <FileIcon>
                  {fileData.isVideo
                    ? React.createElement(RiVideoLine as React.ComponentType)
                    : React.createElement(RiImageLine as React.ComponentType)}
                </FileIcon>
                <FileInfo>
                  <FileName>{fileData.file.name}</FileName>
                  <FileSize>{formatFileSize(fileData.file.size)}</FileSize>
                </FileInfo>
                <RemoveButton onClick={() => removeFile(index)}>
                  {React.createElement(RiCloseLine as React.ComponentType)}
                </RemoveButton>
              </SelectedFile>
            ))}

            <CaptionInput
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption (optional)"
            />

            {uploading && (
              <ProgressBar>
                <ProgressFill progress={uploadProgress} />
              </ProgressBar>
            )}

            <UploadActions>
              <PrimaryButton
                fullWidth
                onClick={handleUpload}
                disabled={uploading}
              >
                {React.createElement(RiCheckLine as React.ComponentType)}
                {uploading ? `Uploading... ${uploadProgress}%` : "Upload Media"}
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

      <Card style={{ padding: theme.spacing.xl }}>
        <CardTitle style={{ marginBottom: theme.spacing.lg }}>
          Gallery ({posts.length} {posts.length === 1 ? "item" : "items"})
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
                <MediaCard key={post.id}>
                  <MediaPreview>
                    {isVideo ? (
                      <MediaVideo src={firstAsset.url} controls playsInline />
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
                  </MediaPreview>
                  <MediaInfo>
                    <MediaName>{post.caption || "No caption"}</MediaName>
                    <MediaMeta>
                      {formatDate(post.inserted_at)}
                      {post.assets &&
                        post.assets.length > 1 &&
                        ` • ${post.assets.length} items`}
                    </MediaMeta>
                    <MediaActions>
                      <PrimaryButton
                        fullWidth
                        onClick={() => window.open(firstAsset.url, "_blank")}
                      >
                        {isVideo
                          ? React.createElement(
                              RiVideoLine as React.ComponentType,
                            )
                          : React.createElement(
                              RiImageLine as React.ComponentType,
                            )}
                        View
                      </PrimaryButton>
                    </MediaActions>
                  </MediaInfo>
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
      </Card>
    </SettingsContainer>
  );
};
