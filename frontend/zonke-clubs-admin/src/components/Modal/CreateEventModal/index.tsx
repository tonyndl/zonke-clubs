import React, { useState, useRef } from "react";
import { eventSchema, parseZodErrors } from "../../../utils/validation";
import { Modal } from "../Modal";
import { PrimaryButton, OutlineButton } from "../../Buttons";
import { DatePicker } from "../../DatePicker";
import { TimePicker } from "../../TimePicker";
import { apiService } from "../../../services/api";
import { useToast } from "../../Toast";
import {
  RiCalendarLine,
  RiTimeLine,
  RiImageAddLine,
  RiMusicLine,
  RiAddLine,
  RiCloseLine,
  RiCheckLine,
} from "react-icons/ri";
import {
  Form,
  FormGroup,
  Label,
  Input,
  TextArea,
  FormRow,
  ImageUploadArea,
  ImagePreview,
  ImageUploadText,
  ImageUploadHint,
  FormActions,
  HiddenInput,
  SwitchContainer,
  SwitchLabel,
  SwitchInput,
  SwitchSlider,
  StatusText,
  DJSelectHeader,
  QuickAddDJButton,
  ImagePreviewOverlay,
  ImageProgressBar,
  ImageProgressText,
  ImageRemoveButton,
  ImageChangeHint,
  SelectedDJsArea,
  EmptyDJHint,
  DJChip,
  DJChipIcon,
  DJChipName,
  DJChipRemove,
  DJPickerGrid,
  DJPickerCard,
  DJPickerAvatar,
  DJPickerName,
  DJPickerCheck,
  DJPickerEmpty,
} from "./styles";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: EventFormData) => void;
  mode?: "create" | "edit";
  initialData?: EventFormData;
  eventId?: string;
  availableDJs?: Array<{ id: string; name: string }>;
  onAddDJ?: () => void;
}

export interface EventFormData {
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  general_entry_price: string;
  vip_entry_price: string;
  dj_lineup: string[];
  cover_image: string;
  status: "draft" | "published";
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mode = "create",
  initialData,
  availableDJs = [],
  onAddDJ,
}) => {
  const getInitialFormData = (): EventFormData => {
    if (mode === "edit" && initialData) {
      return initialData;
    }
    return {
      title: "",
      description: "",
      date: "",
      start_time: "",
      end_time: "",
      general_entry_price: "",
      vip_entry_price: "",
      dj_lineup: [],
      cover_image: "",
      status: "draft",
    };
  };

  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [formData, setFormData] = useState<EventFormData>(getInitialFormData());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [originalData, setOriginalData] =
    useState<EventFormData>(getInitialFormData());

  // Update form data when initialData changes (for edit mode)
  React.useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData(initialData);
      setOriginalData(initialData);
    }
  }, [mode, initialData, isOpen]);

  // Check if form has been modified
  const hasChanges = React.useMemo(() => {
    if (mode === "create") {
      // For create mode, check if any field has been filled
      return (
        formData.title !== "" ||
        formData.description !== "" ||
        formData.date !== "" ||
        formData.start_time !== "" ||
        formData.end_time !== "" ||
        formData.general_entry_price !== "" ||
        formData.vip_entry_price !== "" ||
        formData.dj_lineup.length > 0 ||
        formData.cover_image !== ""
      );
    }

    // For edit mode, compare with original data
    return (
      formData.title !== originalData.title ||
      formData.description !== originalData.description ||
      formData.date !== originalData.date ||
      formData.start_time !== originalData.start_time ||
      formData.end_time !== originalData.end_time ||
      formData.general_entry_price !== originalData.general_entry_price ||
      formData.vip_entry_price !== originalData.vip_entry_price ||
      JSON.stringify(formData.dj_lineup) !==
        JSON.stringify(originalData.dj_lineup) ||
      formData.cover_image !== originalData.cover_image ||
      formData.status !== originalData.status
    );
  }, [formData, originalData, mode]);

  const handleChange = (field: keyof EventFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const toggleDJ = (djId: string) => {
    setFormData((prev) => ({
      ...prev,
      dj_lineup: prev.dj_lineup.includes(djId)
        ? prev.dj_lineup.filter((id) => id !== djId)
        : [...prev.dj_lineup, djId],
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, cover_image: previewUrl }));
    setUploadingImage(true);
    setImageUploadProgress(0);

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("meta", JSON.stringify({ type: "image" }));

    apiService
      .uploadAsset(uploadData, (progress) => setImageUploadProgress(progress))
      .then((asset) => {
        URL.revokeObjectURL(previewUrl);
        setFormData((prev) => ({ ...prev, cover_image: asset.url }));
      })
      .catch(() => {
        URL.revokeObjectURL(previewUrl);
        setFormData((prev) => ({ ...prev, cover_image: "" }));
        toast.error("Failed to upload image. Please try again.");
      })
      .finally(() => {
        setUploadingImage(false);
        setImageUploadProgress(0);
      });
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData((prev) => ({ ...prev, cover_image: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = eventSchema.safeParse({
      title: formData.title,
      description: formData.description,
      date: formData.date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      general_entry_price: formData.general_entry_price,
      vip_entry_price: formData.vip_entry_price,
    });
    if (!result.success) {
      setErrors(parseZodErrors(result.error));
      return;
    }
    setErrors({});
    onSubmit(formData);
    onClose();
    // Reset form
    setFormData({
      title: "",
      description: "",
      date: "",
      start_time: "",
      end_time: "",
      general_entry_price: "",
      vip_entry_price: "",
      dj_lineup: [],
      cover_image: "",
      status: "draft",
    });
  };

  const handleOnClose = () => {
    onClose();
    setFormData({
      title: "",
      description: "",
      date: "",
      start_time: "",
      end_time: "",
      general_entry_price: "",
      vip_entry_price: "",
      dj_lineup: [],
      cover_image: "",
      status: "draft",
    });
  };

  const modalTitle = mode === "edit" ? "Edit Event" : "Create New Event";
  const submitButtonText = mode === "edit" ? "Save Changes" : "Create Event";

  return (
    <Modal isOpen={isOpen} onClose={handleOnClose} title={modalTitle}>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>
            {React.createElement(RiCalendarLine as React.ComponentType)}
            Event Title
          </Label>
          <Input
            type="text"
            placeholder="e.g., Friday Night Fever"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
          {errors.title && (
            <p
              style={{ color: "#ef4444", fontSize: "12px", margin: "4px 0 0" }}
            >
              {errors.title}
            </p>
          )}
        </FormGroup>

        <FormGroup>
          <Label>Description</Label>
          <TextArea
            placeholder="Describe what makes this event special..."
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
          {errors.description && (
            <p
              style={{ color: "#ef4444", fontSize: "12px", margin: "4px 0 0" }}
            >
              {errors.description}
            </p>
          )}
        </FormGroup>

        <FormGroup>
          <Label>
            {React.createElement(RiCalendarLine as React.ComponentType)}
            Event Date
          </Label>
          <DatePicker
            value={formData.date}
            onChange={(date) => handleChange("date", date)}
            minDate={new Date().toISOString().split("T")[0]}
          />
          {errors.date && (
            <p
              style={{ color: "#ef4444", fontSize: "12px", margin: "4px 0 0" }}
            >
              {errors.date}
            </p>
          )}
        </FormGroup>

        <FormRow>
          <FormGroup>
            <Label>General Entry Price (R)</Label>
            <Input
              type="number"
              placeholder="150"
              value={formData.general_entry_price}
              onChange={(e) =>
                handleChange("general_entry_price", e.target.value)
              }
              min="0"
              step="0.01"
            />
            {errors.general_entry_price && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "12px",
                  margin: "4px 0 0",
                }}
              >
                {errors.general_entry_price}
              </p>
            )}
          </FormGroup>

          <FormGroup>
            <Label>VIP Entry Price (R)</Label>
            <Input
              type="number"
              placeholder="300"
              value={formData.vip_entry_price}
              onChange={(e) => handleChange("vip_entry_price", e.target.value)}
              min="0"
            />
            {errors.vip_entry_price && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "12px",
                  margin: "4px 0 0",
                }}
              >
                {errors.vip_entry_price}
              </p>
            )}
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label>
              {React.createElement(RiTimeLine as React.ComponentType)}
              Start Time
            </Label>
            <TimePicker
              value={formData.start_time}
              onChange={(time) => handleChange("start_time", time)}
            />
            {errors.start_time && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "12px",
                  margin: "4px 0 0",
                }}
              >
                {errors.start_time}
              </p>
            )}
          </FormGroup>

          <FormGroup>
            <Label>
              {React.createElement(RiTimeLine as React.ComponentType)}
              End Time
            </Label>
            <TimePicker
              value={formData.end_time}
              onChange={(time) => handleChange("end_time", time)}
            />
            {errors.end_time && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "12px",
                  margin: "4px 0 0",
                }}
              >
                {errors.end_time}
              </p>
            )}
          </FormGroup>
        </FormRow>

        <FormGroup>
          <DJSelectHeader>
            <Label>
              {React.createElement(RiMusicLine as React.ComponentType)}
              DJ Lineup
            </Label>
            {onAddDJ && (
              <QuickAddDJButton type="button" onClick={onAddDJ}>
                {React.createElement(RiAddLine as React.ComponentType)}
                Add New DJ
              </QuickAddDJButton>
            )}
          </DJSelectHeader>

          {/* Selected DJs chips */}
          <SelectedDJsArea>
            {formData.dj_lineup.length === 0 ? (
              <EmptyDJHint>
                {availableDJs.length === 0
                  ? "Add DJs to your roster first"
                  : "Select DJs from below"}
              </EmptyDJHint>
            ) : (
              formData.dj_lineup.map((djId) => {
                const dj = availableDJs.find((d) => d.id === djId);
                return dj ? (
                  <DJChip key={djId}>
                    <DJChipIcon>
                      {React.createElement(RiMusicLine as React.ComponentType)}
                    </DJChipIcon>
                    <DJChipName>{dj.name}</DJChipName>
                    <DJChipRemove type="button" onClick={() => toggleDJ(djId)}>
                      {React.createElement(RiCloseLine as React.ComponentType)}
                    </DJChipRemove>
                  </DJChip>
                ) : null;
              })
            )}
          </SelectedDJsArea>

          {/* DJ picker grid */}
          {availableDJs.length > 0 ? (
            <DJPickerGrid>
              {availableDJs.map((dj) => {
                const isSelected = formData.dj_lineup.includes(dj.id);
                return (
                  <DJPickerCard
                    key={dj.id}
                    type="button"
                    selected={isSelected}
                    onClick={() => toggleDJ(dj.id)}
                  >
                    <DJPickerAvatar selected={isSelected}>
                      {React.createElement(RiMusicLine as React.ComponentType)}
                    </DJPickerAvatar>
                    <DJPickerName>{dj.name}</DJPickerName>
                    {isSelected && (
                      <DJPickerCheck>
                        {React.createElement(
                          RiCheckLine as React.ComponentType,
                        )}
                      </DJPickerCheck>
                    )}
                  </DJPickerCard>
                );
              })}
            </DJPickerGrid>
          ) : (
            <DJPickerEmpty>
              {React.createElement(RiMusicLine as React.ComponentType)}
              <span>No DJs in your roster yet</span>
              {onAddDJ && (
                <QuickAddDJButton type="button" onClick={onAddDJ}>
                  {React.createElement(RiAddLine as React.ComponentType)}
                  Add Your First DJ
                </QuickAddDJButton>
              )}
            </DJPickerEmpty>
          )}
        </FormGroup>

        <FormGroup>
          <Label>
            {React.createElement(RiImageAddLine as React.ComponentType)}
            Cover Image
          </Label>
          <HiddenInput
            ref={fileInputRef}
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <ImageUploadArea
            onClick={() => !uploadingImage && fileInputRef.current?.click()}
            style={{
              cursor: uploadingImage ? "default" : "pointer",
              padding: formData.cover_image ? 0 : undefined,
              minHeight: formData.cover_image ? "unset" : undefined,
            }}
          >
            {!formData.cover_image && !uploadingImage && (
              <>
                {React.createElement(RiImageAddLine as React.ComponentType)}
                <ImageUploadText>Click to upload cover image</ImageUploadText>
                <ImageUploadHint>PNG, JPG up to 10MB</ImageUploadHint>
              </>
            )}
            {uploadingImage && (
              <ImagePreviewOverlay>
                <ImageProgressText>
                  Uploading... {imageUploadProgress}%
                </ImageProgressText>
                <ImageProgressBar progress={imageUploadProgress} />
              </ImagePreviewOverlay>
            )}
            {formData.cover_image && !uploadingImage && (
              <>
                <ImagePreview src={formData.cover_image} alt="Cover preview" />
                <ImageRemoveButton type="button" onClick={handleRemoveImage}>
                  {React.createElement(RiCloseLine as React.ComponentType)}
                </ImageRemoveButton>
                <ImageChangeHint>Click to change image</ImageChangeHint>
              </>
            )}
          </ImageUploadArea>
        </FormGroup>

        <FormGroup>
          <Label>Publish Event</Label>
          <SwitchContainer>
            <SwitchLabel>
              <SwitchInput
                type="checkbox"
                checked={formData.status === "published"}
                onChange={(e) =>
                  handleChange(
                    "status",
                    e.target.checked ? "published" : "draft",
                  )
                }
              />
              <SwitchSlider />
            </SwitchLabel>
            <StatusText published={formData.status === "published"}>
              {formData.status === "published" ? "Published" : "Draft"}
            </StatusText>
          </SwitchContainer>
        </FormGroup>

        <FormActions>
          <OutlineButton type="button" onClick={onClose}>
            Cancel
          </OutlineButton>
          <PrimaryButton type="submit" disabled={!hasChanges || uploadingImage}>
            {uploadingImage ? "Uploading image..." : submitButtonText}
          </PrimaryButton>
        </FormActions>
      </Form>
    </Modal>
  );
};
