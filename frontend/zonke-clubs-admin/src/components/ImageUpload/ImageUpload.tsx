import React, { useState, useRef } from "react";
import { RiImageAddLine, RiCloseLine, RiUploadCloudLine } from "react-icons/ri";
import { apiService } from "../../services/api";
import {
  Container,
  Label,
  UploadArea,
  ImagePreview,
  PreviewImage,
  RemoveButton,
  UploadIcon,
  UploadText,
  UploadHint,
  HiddenInput,
  UploadProgress,
} from "./styles";

interface ImageUploadProps {
  onUploadSuccess: (asset: any) => void;
  entityType: "user" | "club" | "post";
  entityId: string;
  existingImageUrl?: string;
  label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadSuccess,
  entityType,
  entityId,
  existingImageUrl,
  label = "Upload Image",
}) => {
  const [preview, setPreview] = useState<string | null>(
    existingImageUrl || null,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

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

    const formData = new FormData();
    formData.append("file", file);
    formData.append(`${entityType}_id`, entityId);

    apiService
      .uploadAsset(formData)
      .then((asset) => {
        setIsUploading(false);
        onUploadSuccess(asset);
      })
      .catch((error) => {
        setIsUploading(false);
        console.error("Upload error:", error);
        alert("Failed to upload image. Please try again.");
        setPreview(existingImageUrl || null);
      });
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Container>
      <Label>{label}</Label>

      <UploadArea
        isDragging={isDragging}
        hasImage={!!preview}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <ImagePreview>
            <PreviewImage src={preview} alt="Preview" />
            <RemoveButton type="button" onClick={handleRemove}>
              {React.createElement(RiCloseLine as React.ComponentType)}
            </RemoveButton>
          </ImagePreview>
        ) : (
          <>
            <UploadIcon>
              {React.createElement(RiImageAddLine as React.ComponentType)}
            </UploadIcon>
            <UploadText>
              {isDragging
                ? "Drop image here"
                : "Click to upload or drag and drop"}
            </UploadText>
            <UploadHint>PNG, JPG, JPEG up to 5MB</UploadHint>
          </>
        )}

        {isUploading && (
          <UploadProgress>
            {React.createElement(RiUploadCloudLine as React.ComponentType)}{" "}
            Uploading...
          </UploadProgress>
        )}
      </UploadArea>

      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
      />
    </Container>
  );
};
