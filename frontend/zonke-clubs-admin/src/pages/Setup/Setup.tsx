import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../services/api";
import { setupStep1Schema, parseZodErrors } from "../../utils/validation";
import { Input, FormGroup, Label, TextArea } from "../../components/Input";
import { Button } from "../../components/Button";
import { LocationAutocomplete } from "../../components/LocationAutocomplete";
import { useToast } from "../../components/Toast";
import { theme } from "../../styles/theme";
import {
  RiAddLine,
  RiCheckLine,
  RiCloseLine,
  RiPencilLine,
  RiDeleteBinLine,
} from "react-icons/ri";
import {
  PageContainer,
  SetupCard,
  Header,
  Title,
  Subtitle,
  ProgressBar,
  ProgressTrack,
  ProgressFill,
  StepIndicator,
  StepDot,
  Form,
  StepTitle,
  StepDescription,
  ButtonGroup,
  Row,
  RadioGroup,
  RadioOption,
} from "./styles";

interface SetupData {
  // Step 1: Basic Info
  phone: string;
  table_reservation_numbers: string[];
  location: string | { name: string; latitude: number; longitude: number };
  description: string;

  // Step 2: Opening Hours
  openingHoursType: "always" | "custom";

  // Step 3: Social & Contact
  website: string;
  instagram: string;
  facebook: string;
}

const TOTAL_STEPS = 3;

export const Setup: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});

  const [setupData, setSetupData] = useState<SetupData>({
    phone: "",
    table_reservation_numbers: [],
    location: "",
    description: "",
    openingHoursType: "always",
    website: "",
    instagram: "",
    facebook: "",
  });

  const [newReservationNumber, setNewReservationNumber] = useState("");
  const [editingResIndex, setEditingResIndex] = useState<number | null>(null);
  const [editingResValue, setEditingResValue] = useState("");

  const updateField = <K extends keyof SetupData>(
    field: K,
    value: SetupData[K],
  ) => {
    setSetupData((prev) => ({ ...prev, [field]: value }));
  };

  const addReservationNumber = () => {
    const trimmed = newReservationNumber.trim();
    if (!trimmed) return;
    setSetupData((prev) => ({
      ...prev,
      table_reservation_numbers: [...prev.table_reservation_numbers, trimmed],
    }));
    setNewReservationNumber("");
  };

  const removeReservationNumber = (index: number) => {
    setSetupData((prev) => ({
      ...prev,
      table_reservation_numbers: prev.table_reservation_numbers.filter(
        (_, i) => i !== index,
      ),
    }));
    if (editingResIndex === index) {
      setEditingResIndex(null);
      setEditingResValue("");
    }
  };

  const startEditingRes = (index: number) => {
    setEditingResIndex(index);
    setEditingResValue(setupData.table_reservation_numbers[index]);
  };

  const saveEditingRes = () => {
    if (editingResIndex === null) return;
    const trimmed = editingResValue.trim();
    if (!trimmed) return;
    const updated = [...setupData.table_reservation_numbers];
    updated[editingResIndex] = trimmed;
    setSetupData((prev) => ({ ...prev, table_reservation_numbers: updated }));
    setEditingResIndex(null);
    setEditingResValue("");
  };

  const cancelEditingRes = () => {
    setEditingResIndex(null);
    setEditingResValue("");
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const result = setupStep1Schema.safeParse({
        location: setupData.location,
        description: setupData.description,
      });
      if (!result.success) {
        setStep1Errors(parseZodErrors(result.error));
        return;
      }
      setStep1Errors({});
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Save setup data to backend
    apiService
      .post("/clubs/setup", setupData)
      .then(() => {
        toast.success("Club setup complete!");
        navigate("/dashboard");
      })
      .catch((err: any) => {
        toast.error(err.response?.data?.message || "Failed to complete setup");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSkip = () => {
    navigate("/dashboard");
  };

  const progress = (currentStep / TOTAL_STEPS) * 100;

  return (
    <PageContainer>
      <SetupCard>
        <Header>
          <Title>Welcome to Zonke Clubs</Title>
          <Subtitle>Let's set up your club profile</Subtitle>
        </Header>

        <ProgressBar>
          <ProgressTrack>
            <ProgressFill $progress={progress} />
          </ProgressTrack>
          <StepIndicator>
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <StepDot
                key={i}
                $active={i + 1 === currentStep}
                $completed={i + 1 < currentStep}
              />
            ))}
          </StepIndicator>
        </ProgressBar>

        <Form
          onSubmit={
            currentStep === TOTAL_STEPS
              ? handleSubmit
              : (e) => {
                  e.preventDefault();
                  handleNext();
                }
          }
        >
          {currentStep === 1 && (
            <>
              <StepTitle>Basic Information</StepTitle>
              <StepDescription>
                Tell us about your club so visitors can find and contact you.
              </StepDescription>

              <FormGroup>
                <Label htmlFor="location">Location *</Label>
                <LocationAutocomplete
                  id="location"
                  name="location"
                  value={
                    typeof setupData.location === "string"
                      ? setupData.location
                      : setupData.location.name
                  }
                  onChange={(location) => {
                    updateField("location", location);
                    setStep1Errors((p) => ({ ...p, location: "" }));
                  }}
                  placeholder="Search for your location..."
                />
                {step1Errors.location && (
                  <p
                    style={{
                      color: "#ef4444",
                      fontSize: "12px",
                      margin: "4px 0 0",
                    }}
                  >
                    {step1Errors.location}
                  </p>
                )}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="phone">WhatsApp Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+27 XX XXX XXXX"
                  value={setupData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label>Reserve Table &amp; Enquiries Numbers</Label>

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
                {setupData.table_reservation_numbers.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: theme.spacing.xs,
                      marginTop: theme.spacing.sm,
                    }}
                  >
                    {setupData.table_reservation_numbers.map((num, idx) =>
                      editingResIndex === idx ? (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "7px 12px",
                            background: theme.colors.background,
                            border: `1px solid ${theme.colors.primary}`,
                            borderRadius: 999,
                          }}
                        >
                          <input
                            type="tel"
                            value={editingResValue}
                            onChange={(e) => setEditingResValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                saveEditingRes();
                              }
                              if (e.key === "Escape") cancelEditingRes();
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
                            onClick={saveEditingRes}
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
                            onClick={cancelEditingRes}
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
                            padding: "7px 12px",
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
                            onClick={() => startEditingRes(idx)}
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
                            onClick={() => removeReservationNumber(idx)}
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

              <FormGroup>
                <Label htmlFor="description">Description *</Label>
                <TextArea
                  id="description"
                  placeholder="Tell people about your club, the vibe, music, etc."
                  value={setupData.description}
                  onChange={(e) => {
                    updateField("description", e.target.value);
                    setStep1Errors((p) => ({ ...p, description: "" }));
                  }}
                />
                {step1Errors.description && (
                  <p
                    style={{
                      color: "#ef4444",
                      fontSize: "12px",
                      margin: "4px 0 0",
                    }}
                  >
                    {step1Errors.description}
                  </p>
                )}
              </FormGroup>
            </>
          )}

          {currentStep === 2 && (
            <>
              <StepTitle>Opening Hours</StepTitle>
              <StepDescription>
                Set your club's operating hours. You can customize this later in
                settings.
              </StepDescription>

              <FormGroup>
                <Label>Operating Schedule</Label>
                <RadioGroup>
                  <RadioOption
                    $checked={setupData.openingHoursType === "always"}
                  >
                    <input
                      type="radio"
                      name="openingHours"
                      value="always"
                      checked={setupData.openingHoursType === "always"}
                      onChange={(e) =>
                        updateField(
                          "openingHoursType",
                          e.target.value as "always" | "custom",
                        )
                      }
                    />
                    <span>We're open every day (you can customize later)</span>
                  </RadioOption>
                  <RadioOption
                    $checked={setupData.openingHoursType === "custom"}
                  >
                    <input
                      type="radio"
                      name="openingHours"
                      value="custom"
                      checked={setupData.openingHoursType === "custom"}
                      onChange={(e) =>
                        updateField(
                          "openingHoursType",
                          e.target.value as "always" | "custom",
                        )
                      }
                    />
                    <span>I'll set this up later</span>
                  </RadioOption>
                </RadioGroup>
              </FormGroup>
            </>
          )}

          {currentStep === 3 && (
            <>
              <StepTitle>Social Media & Website</StepTitle>
              <StepDescription>
                Connect your social media accounts (all optional). You can add
                these later.
              </StepDescription>

              <FormGroup>
                <Label htmlFor="website">
                  Website{" "}
                  <span
                    style={{
                      fontWeight: 400,
                      color: theme.colors.textSecondary,
                      fontSize: theme.typography.fontSize.xs,
                    }}
                  >
                    (optional)
                  </span>
                </Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourclub.com"
                  value={setupData.website}
                  onChange={(e) => updateField("website", e.target.value)}
                />
              </FormGroup>

              <Row>
                <FormGroup>
                  <Label htmlFor="instagram">
                    Instagram{" "}
                    <span
                      style={{
                        fontWeight: 400,
                        color: theme.colors.textSecondary,
                        fontSize: theme.typography.fontSize.xs,
                      }}
                    >
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="instagram"
                    type="text"
                    placeholder="@yourclub"
                    value={setupData.instagram}
                    onChange={(e) => updateField("instagram", e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="facebook">
                    Facebook{" "}
                    <span
                      style={{
                        fontWeight: 400,
                        color: theme.colors.textSecondary,
                        fontSize: theme.typography.fontSize.xs,
                      }}
                    >
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="facebook"
                    type="text"
                    placeholder="yourclub"
                    value={setupData.facebook}
                    onChange={(e) => updateField("facebook", e.target.value)}
                  />
                </FormGroup>
              </Row>
            </>
          )}

          <ButtonGroup>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
                style={{ flex: 1 }}
              >
                Back
              </Button>
            )}

            {currentStep === 1 && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleSkip}
                style={{ flex: 1 }}
              >
                Skip Setup
              </Button>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              style={{ flex: 1 }}
            >
              {isLoading
                ? "Saving..."
                : currentStep === TOTAL_STEPS
                  ? "Complete Setup"
                  : "Next"}
            </Button>
          </ButtonGroup>
        </Form>
      </SetupCard>
    </PageContainer>
  );
};
