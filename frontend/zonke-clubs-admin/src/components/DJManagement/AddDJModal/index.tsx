import React, { useState } from "react";
import { djSchema, parseZodErrors } from "../../../utils/validation";
import { Modal } from "../../Modal/Modal";
import { PrimaryButton, OutlineButton } from "../../Buttons";
import { RiHeadphoneLine } from "react-icons/ri";
import {
  Form,
  FormGroup,
  Label,
  OptionalTag,
  Input,
  TextArea,
  DJIconHero,
  DJIconBadge,
  DJIconHeroText,
  SectionDivider,
  SectionDividerLine,
  SectionDividerLabel,
  SocialsRow,
  SocialField,
  SocialPrefix,
  SocialInput,
  FormActions,
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
  instagram: string;
  tiktok: string;
  image: string;
}

const emptyForm: DJFormData = {
  name: "",
  bio: "",
  instagram: "",
  tiktok: "",
  image: "",
};

export const AddDJModal: React.FC<AddDJModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditMode = false,
}) => {
  const [formData, setFormData] = useState<DJFormData>(
    initialData || emptyForm,
  );
  const [nameError, setNameError] = useState("");

  React.useEffect(() => {
    setFormData(initialData || emptyForm);
    setNameError("");
  }, [initialData, isOpen]);

  const handleChange = (field: keyof DJFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "name") setNameError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = djSchema.safeParse({ name: formData.name });
    if (!result.success) {
      const errs = parseZodErrors(result.error);
      setNameError(errs.name || "DJ name is required");
      return;
    }
    setNameError("");
    onSubmit(formData);
    onClose();
    setFormData(emptyForm);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit DJ" : "Add New DJ"}
    >
      <Form onSubmit={handleSubmit}>
        <DJIconHero>
          <DJIconBadge>
            {React.createElement(RiHeadphoneLine as React.ComponentType)}
          </DJIconBadge>
          <DJIconHeroText>
            {isEditMode ? "Edit DJ Details" : "New Roster Addition"}
          </DJIconHeroText>
        </DJIconHero>

        {/* DJ Name */}
        <FormGroup>
          <Label htmlFor="dj-name">
            DJ Name <span>*</span>
          </Label>
          <Input
            id="dj-name"
            type="text"
            placeholder="e.g., DJ Nova"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          {nameError && (
            <p
              style={{ color: "#ef4444", fontSize: "12px", margin: "4px 0 0" }}
            >
              {nameError}
            </p>
          )}
        </FormGroup>

        {/* Bio */}
        <FormGroup>
          <Label htmlFor="dj-bio">
            Bio / Description <OptionalTag>optional</OptionalTag>
          </Label>
          <TextArea
            id="dj-bio"
            placeholder="Tell us about this DJ — their style, vibe, residencies..."
            value={formData.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
          />
        </FormGroup>

        {/* Social Links */}
        <SectionDivider>
          <SectionDividerLine />
          <SectionDividerLabel>Social Links</SectionDividerLabel>
          <SectionDividerLine />
        </SectionDivider>

        <SocialsRow>
          {/* Instagram */}
          <SocialField>
            <Label htmlFor="dj-instagram">
              Instagram <OptionalTag>optional</OptionalTag>
            </Label>
            <SocialPrefix platform="instagram">
              <span>@</span>
              <SocialInput
                id="dj-instagram"
                type="text"
                placeholder="djnova"
                value={formData.instagram}
                onChange={(e) => handleChange("instagram", e.target.value)}
              />
            </SocialPrefix>
          </SocialField>

          {/* TikTok */}
          <SocialField>
            <Label htmlFor="dj-tiktok">
              TikTok <OptionalTag>optional</OptionalTag>
            </Label>
            <SocialPrefix platform="tiktok">
              <span>@</span>
              <SocialInput
                id="dj-tiktok"
                type="text"
                placeholder="djnova"
                value={formData.tiktok}
                onChange={(e) => handleChange("tiktok", e.target.value)}
              />
            </SocialPrefix>
          </SocialField>
        </SocialsRow>

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
