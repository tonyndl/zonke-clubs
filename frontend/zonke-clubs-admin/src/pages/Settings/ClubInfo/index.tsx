import React, { useState, useEffect } from "react";
import { CardTitle } from "../../../components/Card";
import { PrimaryButton, OutlineButton } from "../../../components/Buttons";
import { theme } from "../../../styles/theme";
import {
  RiStore2Line,
  RiMapPinLine,
  RiPhoneLine,
  RiMailLine,
} from "react-icons/ri";
import { apiService } from "../../../services/api";
import { LocationAutocomplete } from "../../../components/LocationAutocomplete";
import { useToast } from "../../../components/Toast";
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
        console.log("Fetched club data:", response);
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
        };
        setFormData(data);
        setOriginalFormData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch club data:", error);
        toast.error("Failed to load club information");
        setIsLoading(false);
      });
  }, [toast]);

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
                Phone Number
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
    </SettingsContainer>
  );
};
