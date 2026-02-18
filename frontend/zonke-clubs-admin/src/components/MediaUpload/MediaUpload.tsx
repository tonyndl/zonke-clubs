import React, { useState, useRef } from "react";
import {
  RiImageAddLine,
  RiCloseLine,
  RiUploadCloudLine,
  RiVideoAddLine,
} from "react-icons/ri";
import { apiService } from "../../services/api";
import {
  Container,
  Label,
  UploadArea,
  MediaPreview,
  PreviewImage,
  PreviewVideo,
  RemoveButton,
  DurationBadge,
  UploadIcon,
  UploadText,
  UploadHint,
  HiddenInput,
  UploadProgress,
  ErrorMessage,
} from "./styles";

interface MediaUploadProps {
  onUploadSuccess: (asset: any) => void;
  entityType: "user" | "club" | "post";
  entityId: string;
  existingMediaUrl?: string;
  label?: string;
  mediaType?: "image" | "video" | "both";
  maxVideoDuration?: number; // in seconds
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  onUploadSuccess,
  entityType,
  entityId,
  existingMediaUrl,
  label = "Upload Media",
  mediaType = "both",
  maxVideoDuration = 30,
}) => {
  const [preview, setPreview] = useState<string | null>(
    existingMediaUrl || null,
  );
  const [selectedType, setSelectedType] = useState<"image" | "video" | null>(
    null,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getAcceptedTypes = () => {
    if (mediaType === "image") return "image/*";
    if (mediaType === "video") return "video/*";
    return "image/*,video/*";
  };

  const validateFile = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      setError(null);

      // Validate file type
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        setError("Please select an image or video file");
        resolve(false);
        return;
      }

      if (mediaType === "image" && !isImage) {
        setError("Please select an image file");
        resolve(false);
        return;
      }

      if (mediaType === "video" && !isVideo) {
        setError("Please select a video file");
        resolve(false);
        return;
      }

      // Validate file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        setError("File size must be less than 50MB");
        resolve(false);
        return;
      }

      // Validate video duration
      if (isVideo) {
        const videoElement = document.createElement("video");
        videoElement.preload = "metadata";

        videoElement.onloadedmetadata = () => {
          window.URL.revokeObjectURL(videoElement.src);
          const duration = videoElement.duration;

          if (duration > maxVideoDuration) {
            setError(
              `Video duration must be ${maxVideoDuration} seconds or less. Your video is ${Math.round(duration)} seconds.`,
            );
            resolve(false);
          } else {
            setVideoDuration(duration);
            resolve(true);
          }
        };

        videoElement.onerror = () => {
          setError("Failed to load video metadata");
          resolve(false);
        };

        videoElement.src = URL.createObjectURL(file);
      } else {
        resolve(true);
      }
    });
  };

  const handleFileSelect = async (file: File) => {
    const isValid = await validateFile(file);
    if (!isValid) return;

    const isImage = file.type.startsWith("image/");
    setSelectedType(isImage ? "image" : "video");

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadFile(file);
  };

  const uploadFile = (file: File) => {
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append(`${entityType}_id`, entityId);

    // Add metadata for videos
    if (selectedType === "video") {
      formData.append(
        "meta",
        JSON.stringify({
          type: "video",
          duration: videoDuration,
        }),
      );
    }

    apiService
      .uploadAsset(formData)
      .then((asset) => {
        setIsUploading(false);
        onUploadSuccess(asset);
      })
      .catch((error) => {
        setIsUploading(false);
        console.error("Upload error:", error);
        setError("Failed to upload media. Please try again.");
        setPreview(existingMediaUrl || null);
      });
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFileSelect(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setSelectedType(null);
    setVideoDuration(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Container>
      <Label>{label}</Label>

      <UploadArea
        isDragging={isDragging}
        hasMedia={!!preview}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <MediaPreview>
            {selectedType === "video" ? (
              <>
                <PreviewVideo ref={videoRef} src={preview} controls />
                {videoDuration > 0 && (
                  <DurationBadge>
                    {Math.round(videoDuration)}s / {maxVideoDuration}s
                  </DurationBadge>
                )}
              </>
            ) : (
              <PreviewImage src={preview} alt="Preview" />
            )}
            <RemoveButton type="button" onClick={handleRemove}>
              {React.createElement(RiCloseLine as React.ComponentType)}
            </RemoveButton>
          </MediaPreview>
        ) : (
          <>
            <UploadIcon>
              {mediaType === "video"
                ? React.createElement(RiVideoAddLine as React.ComponentType)
                : React.createElement(RiImageAddLine as React.ComponentType)}
            </UploadIcon>
            <UploadText>
              {isDragging
                ? "Drop media here"
                : "Click to upload or drag and drop"}
            </UploadText>
            <UploadHint>
              {mediaType === "image" && "PNG, JPG, JPEG, GIF, WebP up to 50MB"}
              {mediaType === "video" &&
                `MP4, MOV, AVI, MPEG - Max ${maxVideoDuration}s duration, 50MB`}
              {mediaType === "both" &&
                `Images or Videos - Max ${maxVideoDuration}s for videos, 50MB`}
            </UploadHint>
          </>
        )}

        {isUploading && (
          <UploadProgress>
            {React.createElement(RiUploadCloudLine as React.ComponentType)}{" "}
            Uploading...
          </UploadProgress>
        )}
      </UploadArea>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept={getAcceptedTypes()}
        onChange={handleFileInputChange}
      />
    </Container>
  );
};
