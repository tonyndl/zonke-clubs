import React, { useState, useRef, useEffect } from "react";
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
  RiCloseLine,
  RiSearchLine,
  RiMusic2Line,
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
} from "./styles";
import { theme } from "../../../styles/theme";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: EventFormData) => void;
  mode?: "create" | "edit";
  initialData?: EventFormData;
  eventId?: string;
}

export interface EventFormData {
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  general_entry_price: string;
  vip_entry_price: string;
  dj_lineup: Array<{ id: string; name: string }>;
  cover_image: string;
  status: "draft" | "published";
}

interface DJUser {
  id: string;
  username: string;
  avatar_url?: string;
  dj_genres?: string[];
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mode = "create",
  initialData,
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
  const djSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [closedDays, setClosedDays] = useState<number[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [formData, setFormData] = useState<EventFormData>(getInitialFormData());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [originalData, setOriginalData] =
    useState<EventFormData>(getInitialFormData());
  const [djSearch, setDjSearch] = useState("");
  const [djResults, setDjResults] = useState<DJUser[]>([]);
  const [djDropdownOpen, setDjDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    apiService
      .getMyClub()
      .then((club: any) => {
        if (!club?.opening_hours) return;
        const dayNameToIndex: Record<string, number> = {
          Sunday: 0,
          Monday: 1,
          Tuesday: 2,
          Wednesday: 3,
          Thursday: 4,
          Friday: 5,
          Saturday: 6,
        };
        const closed: number[] = [];
        Object.entries(dayNameToIndex).forEach(([name, idx]) => {
          const h = club.opening_hours[name];
          if (!h || !h.open || !h.close) closed.push(idx);
        });
        setClosedDays(closed);
      })
      .catch(() => {});
  }, [isOpen]);

  React.useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData(initialData);
      setOriginalData(initialData);
    }
  }, [mode, initialData, isOpen]);

  const hasChanges = React.useMemo(() => {
    if (mode === "create") {
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

  const handleDJSearch = (query: string) => {
    setDjSearch(query);
    if (djSearchTimerRef.current) clearTimeout(djSearchTimerRef.current);
    if (!query.trim()) {
      setDjResults([]);
      setDjDropdownOpen(false);
      return;
    }
    djSearchTimerRef.current = setTimeout(() => {
      apiService
        .searchDJUsers(query)
        .then((results: DJUser[]) => {
          setDjResults(results);
          setDjDropdownOpen(true);
        })
        .catch(() => {});
    }, 300);
  };

  const addDJToLineup = (dj: DJUser) => {
    const already = formData.dj_lineup.some((d) => d.id === dj.id);
    if (!already) {
      setFormData((prev) => ({
        ...prev,
        dj_lineup: [...prev.dj_lineup, { id: dj.id, name: dj.username }],
      }));
    }
    setDjSearch("");
    setDjResults([]);
    setDjDropdownOpen(false);
  };

  const removeDJFromLineup = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      dj_lineup: prev.dj_lineup.filter((d) => d.id !== id),
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  const emptyForm: EventFormData = {
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
    setFormData(emptyForm);
  };

  const handleOnClose = () => {
    onClose();
    setFormData(emptyForm);
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
            closedDays={closedDays}
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

        {/* DJ Lineup */}
        <FormGroup>
          <Label>
            {React.createElement(RiMusicLine as React.ComponentType)}
            DJ Lineup
          </Label>

          <SelectedDJsArea>
            {formData.dj_lineup.length === 0 ? (
              <EmptyDJHint>Search and add DJs to this event</EmptyDJHint>
            ) : (
              formData.dj_lineup.map((dj) => (
                <DJChip key={dj.id}>
                  <DJChipIcon>
                    {React.createElement(RiMusicLine as React.ComponentType)}
                  </DJChipIcon>
                  <DJChipName>{dj.name}</DJChipName>
                  <DJChipRemove
                    type="button"
                    onClick={() => removeDJFromLineup(dj.id)}
                  >
                    {React.createElement(RiCloseLine as React.ComponentType)}
                  </DJChipRemove>
                </DJChip>
              ))
            )}
          </SelectedDJsArea>

          <div style={{ position: "relative", marginTop: 8 }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: theme.colors.textSecondary,
                display: "flex",
                pointerEvents: "none",
              }}
            >
              {React.createElement(
                RiSearchLine as React.ComponentType<{ size?: number }>,
                { size: 16 },
              )}
            </span>
            <input
              type="text"
              value={djSearch}
              onChange={(e) => handleDJSearch(e.target.value)}
              onFocus={() => djResults.length > 0 && setDjDropdownOpen(true)}
              onBlur={() => setTimeout(() => setDjDropdownOpen(false), 150)}
              placeholder="Search DJs by username..."
              style={{
                width: "100%",
                padding: `10px 12px 10px 38px`,
                background: theme.colors.background,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.borderRadius.lg,
                color: theme.colors.textPrimary,
                fontSize: theme.typography.fontSize.sm,
                fontFamily: theme.typography.fontFamily.base,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            {djDropdownOpen && djResults.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  right: 0,
                  background: theme.colors.backgroundCard,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.lg,
                  zIndex: 200,
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                }}
              >
                {djResults.map((dj) => (
                  <div
                    key={dj.id}
                    onMouseDown={() => addDJToLineup(dj)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                      cursor: "pointer",
                      borderBottom: `1px solid ${theme.colors.border}`,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(57,243,255,0.06)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {dj.avatar_url ? (
                      <img
                        src={dj.avatar_url}
                        alt=""
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 15,
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 15,
                          background: "rgba(57,243,255,0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {React.createElement(
                          RiMusic2Line as React.ComponentType<{
                            size?: number;
                            color?: string;
                          }>,
                          { size: 14, color: theme.colors.primary },
                        )}
                      </div>
                    )}
                    <div>
                      <div
                        style={{
                          color: theme.colors.textPrimary,
                          fontSize: theme.typography.fontSize.sm,
                          fontWeight: 600,
                        }}
                      >
                        {dj.username}
                      </div>
                      {dj.dj_genres && dj.dj_genres.length > 0 && (
                        <div
                          style={{
                            color: theme.colors.textSecondary,
                            fontSize: theme.typography.fontSize.xs,
                          }}
                        >
                          {dj.dj_genres.join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
