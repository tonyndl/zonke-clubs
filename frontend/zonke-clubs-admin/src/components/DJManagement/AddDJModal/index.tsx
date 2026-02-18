import React, { useState } from "react";
import { Modal } from "../../Modal/Modal";
import { PrimaryButton, OutlineButton } from "../../Buttons";
import {
  RiUser3Line,
  RiMusicLine,
  RiLinksLine,
  RiImageAddLine,
} from "react-icons/ri";
import {
  Form,
  FormGroup,
  Label,
  Input,
  TextArea,
  ImageUploadArea,
  ImagePreview,
  ImageUploadText,
  ImageUploadHint,
  HiddenInput,
  FormActions,
  HelperText,
} from "./styles";

interface AddDJModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dj: DJFormData) => void;
  initialData?: DJFormData;
  isEditMode?: boolean;
}

export interface DJFormData {
  name: string;
  bio: string;
  genre: string;
  instagram: string;
  soundcloud: string;
  image: string;
}

export const AddDJModal: React.FC<AddDJModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditMode = false,
}) => {
  const [formData, setFormData] = useState<DJFormData>(
    initialData || {
      name: "",
      bio: "",
      genre: "",
      instagram: "",
      soundcloud: "",
      image: "",
    },
  );

  // Update form data when initialData changes (for edit mode)
  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: "",
        bio: "",
        genre: "",
        instagram: "",
        soundcloud: "",
        image: "",
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (field: keyof DJFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, image: imageUrl }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    // Reset form
    setFormData({
      name: "",
      bio: "",
      genre: "",
      instagram: "",
      soundcloud: "",
      image: "",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit DJ" : "Add New DJ"}
    >
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>
            {React.createElement(RiUser3Line as React.ComponentType)}
            DJ Name *
          </Label>
          <Input
            type="text"
            placeholder="e.g., DJ Nova"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>
            {React.createElement(RiMusicLine as React.ComponentType)}
            Genre
          </Label>
          <Input
            type="text"
            placeholder="e.g., Amapiano, House, Techno"
            value={formData.genre}
            onChange={(e) => handleChange("genre", e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label>Bio / Description</Label>
          <TextArea
            placeholder="Tell us about this DJ..."
            value={formData.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label>
            {React.createElement(RiLinksLine as React.ComponentType)}
            Instagram Handle
          </Label>
          <Input
            type="text"
            placeholder="@djnova"
            value={formData.instagram}
            onChange={(e) => handleChange("instagram", e.target.value)}
          />
          <HelperText>Enter username without the @ symbol</HelperText>
        </FormGroup>

        <FormGroup>
          <Label>
            {React.createElement(RiLinksLine as React.ComponentType)}
            SoundCloud URL
          </Label>
          <Input
            type="url"
            placeholder="https://soundcloud.com/djnova"
            value={formData.soundcloud}
            onChange={(e) => handleChange("soundcloud", e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label>
            {React.createElement(RiImageAddLine as React.ComponentType)}
            Profile Image
          </Label>
          <HiddenInput
            id="dj-image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <ImageUploadArea
            as="label"
            htmlFor="dj-image-upload"
            hasImage={!!formData.image}
          >
            {formData.image ? (
              <ImagePreview src={formData.image} alt="DJ profile" />
            ) : (
              <>
                {React.createElement(RiImageAddLine as React.ComponentType)}
                <ImageUploadText>Click to upload profile image</ImageUploadText>
                <ImageUploadHint>PNG, JPG up to 5MB</ImageUploadHint>
              </>
            )}
          </ImageUploadArea>
        </FormGroup>

        <FormActions>
          <OutlineButton type="button" onClick={onClose}>
            Cancel
          </OutlineButton>
          <PrimaryButton type="submit">
            {isEditMode ? "Update DJ" : "Add DJ"}
          </PrimaryButton>
        </FormActions>
      </Form>
    </Modal>
  );
};
