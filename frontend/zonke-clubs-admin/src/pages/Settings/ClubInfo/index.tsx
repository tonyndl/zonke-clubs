import React, { useState, useEffect } from "react";
import { CardTitle } from "../../../components/Card";
import { PrimaryButton, OutlineButton } from "../../../components/Buttons";
import { theme } from "../../../styles/theme";
import {
  RiStore2Line,
  RiMapPinLine,
  RiPhoneLine,
  RiMailLine,
  RiAddLine,
  RiDeleteBinLine,
  RiPencilLine,
  RiCheckLine,
  RiCloseLine,
} from "react-icons/ri";
import { apiService } from "../../../services/api";
import { LocationAutocomplete } from "../../../components/LocationAutocomplete";
import { useToast } from "../../../components/Toast";
import { ConfirmationModal } from "../../../components/Modal";
import {
  SettingsContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  FormCard,
  Form,
  FormGroup,
  Label,
  Input,
  TextArea,
  FormActions,
  LoadingText,
  GridRow,
} from "./styles";

export const ClubInfo: React.FC = () => {
  const toast = useToast();
  const [newReservationNumber, setNewReservationNumber] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(
    null,
  );
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    location: string | { name: string; latitude: number; longitude: number };
    phone: string;
    email: string;
    vibes: string[];
    music_genres: string[];
    dress_code: string;
    entry_fee: string;
    table_reservation_numbers: string[];
  }>({
    name: "",
    description: "",
    location: "",
    phone: "",
    email: "",
    vibes: [],
    music_genres: [],
    dress_code: "",
    entry_fee: "",
    table_reservation_numbers: [],
  });
  const [originalFormData, setOriginalFormData] = useState<
    typeof formData | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Fetch club data on mount
    apiService
      .getMyClub()
      .then((response) => {
        const cachedAdmin = apiService.getAdminInfo();
        const data = {
          name: response.name || "",
          description: response.description || "",
          location: response.location || "",
          phone: response.phone || "",
          email: response.email || cachedAdmin?.email || "",
          vibes: response.vibes || [],
          music_genres: response.music_genres || [],
          dress_code: response.dress_code || "",
          entry_fee: response.entry_fee || "",
          table_reservation_numbers: response.table_reservation_numbers || [],
        };
        setFormData(data);
        setOriginalFormData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        const status = error.response?.status;
        if (status === 404) {
          // Club not set up yet — pre-fill email from cached admin info,
          // or fall back to fetching the admin profile if cache is cold.
          const applyInitial = (email: string) => {
            const initial = {
              name: "",
              description: "",
              location: "",
              phone: "",
              email,
              vibes: [],
              music_genres: [],
              dress_code: "",
              entry_fee: "",
              table_reservation_numbers: [],
            };
            setFormData(initial);
            setOriginalFormData(initial);
            setIsLoading(false);
          };

          const cached = apiService.getAdminInfo();
          if (cached?.email) {
            applyInitial(cached.email);
          } else {
            apiService
              .getCurrentUser()
              .then((admin) => applyInitial(admin?.email || ""))
              .catch(() => applyInitial(""));
          }
        } else {
          toast.error("Failed to load club information");
          setIsLoading(false);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    console.log("Submitting club data:", formData);

    apiService
      .setupClub(formData)
      .then((response) => {
        console.log("Club updated successfully:", response);

        // Refetch club data to confirm changes were saved
        return apiService.getMyClub();
      })
      .then((response) => {
        console.log("Refetched club data after update:", response);
        const data = {
          name: response.name || "",
          description: response.description || "",
          location: response.location || "",
          phone: response.phone || "",
          email: response.email || "",
          vibes: response.vibes || [],
          music_genres: response.music_genres || [],
          dress_code: response.dress_code || "",
          entry_fee: response.entry_fee || "",
          table_reservation_numbers: response.table_reservation_numbers || [],
        };
        setFormData(data);
        setOriginalFormData(data);

        // Dispatch event to update sidebar club name
        window.dispatchEvent(new Event("clubUpdated"));

        toast.success("Club information updated successfully!");
        setIsSaving(false);
      })
      .catch((error) => {
        console.error("Failed to update club:", error);
        console.error("Error response:", error.response?.data);
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to update club information";
        toast.error(errorMessage);
        setIsSaving(false);
      });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addReservationNumber = () => {
    const trimmed = newReservationNumber.trim();
    if (!trimmed) return;
    setFormData({
      ...formData,
      table_reservation_numbers: [
        ...formData.table_reservation_numbers,
        trimmed,
      ],
    });
    setNewReservationNumber("");
  };

  const removeReservationNumber = (index: number) => {
    setFormData({
      ...formData,
      table_reservation_numbers: formData.table_reservation_numbers.filter(
        (_, i) => i !== index,
      ),
    });
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditingValue("");
    }
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingValue(formData.table_reservation_numbers[index]);
  };

  const saveEditing = () => {
    if (editingIndex === null) return;
    const trimmed = editingValue.trim();
    if (!trimmed) return;
    const updated = [...formData.table_reservation_numbers];
    updated[editingIndex] = trimmed;
    setFormData({ ...formData, table_reservation_numbers: updated });
    setEditingIndex(null);
    setEditingValue("");
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  const hasChanges = () => {
    if (!originalFormData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalFormData);
  };

  const handleCancel = () => {
    if (originalFormData) {
      setFormData(originalFormData);
      toast.info("Changes discarded");
    }
  };

  if (isLoading) {
    return (
      <SettingsContainer>
        <PageHeader>
          <PageTitle>Club Information</PageTitle>
          <PageDescription>
            Manage your club's public profile and contact information.
          </PageDescription>
        </PageHeader>
        <FormCard>
          <LoadingText>Loading club information...</LoadingText>
        </FormCard>
      </SettingsContainer>
    );
  }

  return (
    <SettingsContainer>
      <PageHeader>
        <PageTitle>Club Information</PageTitle>
        <PageDescription>
          Manage your club's public profile and contact information.
        </PageDescription>
      </PageHeader>

      <FormCard>
        <CardTitle style={{ marginBottom: theme.spacing.lg }}>
          Basic Information
        </CardTitle>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>
              {React.createElement(RiStore2Line as React.ComponentType)}
              Club Name
            </Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter club name"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Description</Label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your club..."
              required
            />
          </FormGroup>

          <GridRow>
            <FormGroup>
              <Label>
                {React.createElement(RiMapPinLine as React.ComponentType)}
                Location
              </Label>
              <LocationAutocomplete
                name="location"
                value={
                  typeof formData.location === "string"
                    ? formData.location
                    : formData.location.name
                }
                onChange={(location) => setFormData({ ...formData, location })}
                placeholder="Search for your location..."
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>
                {React.createElement(RiPhoneLine as React.ComponentType)}
                WhatsApp Number
              </Label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+27 XX XXX XXXX"
                required
              />
            </FormGroup>
          </GridRow>

          <GridRow>
            <FormGroup>
              <Label>
                {React.createElement(RiMailLine as React.ComponentType)}
                Email
              </Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@club.com"
              />
            </FormGroup>

            {/* Table Reservation Numbers */}
            <FormGroup>
              <Label>
                {React.createElement(RiPhoneLine as React.ComponentType)}
                Reserve Table & Enquiries Numbers
              </Label>

              {/* Add new number */}
              <div style={{ display: "flex", gap: theme.spacing.xs }}>
                <Input
                  type="tel"
                  value={newReservationNumber}
                  onChange={(e) => setNewReservationNumber(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), addReservationNumber())
                  }
                  placeholder="+27 XX XXX XXXX"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={addReservationNumber}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                    background: theme.colors.primary,
                    color: "#000",
                    border: "none",
                    borderRadius: theme.borderRadius.lg,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: theme.typography.fontSize.sm,
                    whiteSpace: "nowrap",
                  }}
                >
                  {React.createElement(
                    RiAddLine as React.ComponentType<{ size?: number }>,
                    { size: 14 },
                  )}
                  Add
                </button>
              </div>

              {/* Pills */}
              {formData.table_reservation_numbers.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: theme.spacing.xs,
                  }}
                >
                  {formData.table_reservation_numbers.map((num, idx) =>
                    editingIndex === idx ? (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          padding: `7px 12px`,
                          background: theme.colors.background,
                          border: `1px solid ${theme.colors.primary}`,
                          borderRadius: 999,
                        }}
                      >
                        <input
                          type="tel"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              saveEditing();
                            }
                            if (e.key === "Escape") cancelEditing();
                          }}
                          autoFocus
                          style={{
                            background: "none",
                            border: "none",
                            outline: "none",
                            color: theme.colors.textPrimary,
                            fontSize: theme.typography.fontSize.sm,
                            width: 120,
                          }}
                        />
                        <button
                          type="button"
                          onClick={saveEditing}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: theme.colors.primary,
                            display: "flex",
                            alignItems: "center",
                            padding: 2,
                          }}
                        >
                          {React.createElement(
                            RiCheckLine as React.ComponentType<{
                              size?: number;
                            }>,
                            { size: 14 },
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: theme.colors.textSecondary,
                            display: "flex",
                            alignItems: "center",
                            padding: 2,
                          }}
                        >
                          {React.createElement(
                            RiCloseLine as React.ComponentType<{
                              size?: number;
                            }>,
                            { size: 14 },
                          )}
                        </button>
                      </div>
                    ) : (
                      <div
                        key={idx}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: `7px 12px`,
                          background: theme.colors.background,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: 999,
                          fontSize: theme.typography.fontSize.sm,
                          color: theme.colors.textPrimary,
                        }}
                      >
                        <span>{num}</span>
                        <button
                          type="button"
                          onClick={() => startEditing(idx)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: theme.colors.textSecondary,
                            display: "flex",
                            alignItems: "center",
                            padding: 2,
                          }}
                        >
                          {React.createElement(
                            RiPencilLine as React.ComponentType<{
                              size?: number;
                            }>,
                            { size: 12 },
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmIndex(idx)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: theme.colors.error || "#ef4444",
                            display: "flex",
                            alignItems: "center",
                            padding: 2,
                          }}
                        >
                          {React.createElement(
                            RiDeleteBinLine as React.ComponentType<{
                              size?: number;
                            }>,
                            { size: 12 },
                          )}
                        </button>
                      </div>
                    ),
                  )}
                </div>
              )}
            </FormGroup>
          </GridRow>

          <FormActions>
            {hasChanges() && (
              <OutlineButton
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </OutlineButton>
            )}
            <PrimaryButton type="submit" disabled={isSaving || !hasChanges()}>
              {isSaving ? "Saving..." : "Save Changes"}
            </PrimaryButton>
          </FormActions>
        </Form>
      </FormCard>

      <ConfirmationModal
        isOpen={deleteConfirmIndex !== null}
        onClose={() => setDeleteConfirmIndex(null)}
        onConfirm={() => {
          if (deleteConfirmIndex !== null)
            removeReservationNumber(deleteConfirmIndex);
        }}
        title="Remove Number"
        message={
          deleteConfirmIndex !== null
            ? `Are you sure you want to remove "${formData.table_reservation_numbers[deleteConfirmIndex]}"?`
            : ""
        }
        confirmText="Remove"
        type="danger"
      />
    </SettingsContainer>
  );
};
