import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../services/api";
import { Input, FormGroup, Label, TextArea } from "../../components/Input";
import { Button } from "../../components/Button";
import { LocationAutocomplete } from "../../components/LocationAutocomplete";
import { useToast } from "../../components/Toast";
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
  name: string;
  phone: string;
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

  const [setupData, setSetupData] = useState<SetupData>({
    name: "",
    phone: "",
    location: "",
    description: "",
    openingHoursType: "always",
    website: "",
    instagram: "",
    facebook: "",
  });

  const updateField = <K extends keyof SetupData>(
    field: K,
    value: SetupData[K],
  ) => {
    setSetupData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Validation for each step
    if (currentStep === 1) {
      if (!setupData.name || !setupData.location || !setupData.description) {
        toast.error("Please fill in all required fields");
        return;
      }
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
                <Label htmlFor="name">Club Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your Club Name"
                  value={setupData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                />
              </FormGroup>

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
                  onChange={(location) => updateField("location", location)}
                  placeholder="Search for your location..."
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+27 XX XXX XXXX"
                  value={setupData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="description">Description *</Label>
                <TextArea
                  id="description"
                  placeholder="Tell people about your club, the vibe, music, etc."
                  value={setupData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  required
                />
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
                <Label htmlFor="website">Website</Label>
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
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    type="text"
                    placeholder="@yourclub"
                    value={setupData.instagram}
                    onChange={(e) => updateField("instagram", e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="facebook">Facebook</Label>
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
