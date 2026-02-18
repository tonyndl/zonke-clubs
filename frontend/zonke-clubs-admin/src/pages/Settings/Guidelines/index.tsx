import React, { useState } from "react";
import { CardTitle, CardDescription } from "../../../components/Card";
import { PrimaryButton, OutlineButton } from "../../../components/Buttons";
import { theme } from "../../../styles/theme";
import { RiFileTextLine } from "react-icons/ri";
import {
  SettingsContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  FormCard,
  Form,
  FormGroup,
  Label,
  TextArea,
  HelpText,
  FormActions,
  PreviewCard,
  PreviewText,
} from "./styles";

export const Guidelines: React.FC = () => {
  const [guidelines, setGuidelines] = useState({
    posting: `• Be respectful to all club-goers and staff
• No offensive or discriminatory content
• Photos must be appropriate and not violate privacy
• No promotional content without permission`,
    behavior: `• Dress code must be followed at all times
• No outside food or beverages
• Respect the club's capacity limits
• Follow staff instructions`,
    photography: `• Flash photography may be restricted in certain areas
• Always ask for consent before posting photos of others
• Tag the club to increase visibility
• Use our official hashtags`,
  });

  const handleChange = (field: string, value: string) => {
    setGuidelines({
      ...guidelines,
      [field]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Guidelines updated successfully!");
  };

  return (
    <SettingsContainer>
      <PageHeader>
        <PageTitle>Content Guidelines</PageTitle>
        <PageDescription>
          Set clear guidelines for user behavior and content posting at your
          club.
        </PageDescription>
      </PageHeader>

      <FormCard>
        <CardTitle style={{ marginBottom: theme.spacing.lg }}>
          Community Guidelines
        </CardTitle>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Posting Guidelines</Label>
            <TextArea
              value={guidelines.posting}
              onChange={(e) => handleChange("posting", e.target.value)}
              placeholder="Enter posting guidelines..."
            />
            <HelpText>
              Rules for what users can and cannot post about your club
            </HelpText>
          </FormGroup>

          <FormGroup>
            <Label>Behavior Guidelines</Label>
            <TextArea
              value={guidelines.behavior}
              onChange={(e) => handleChange("behavior", e.target.value)}
              placeholder="Enter behavior guidelines..."
            />
            <HelpText>Expected behavior and club policies</HelpText>
          </FormGroup>

          <FormGroup>
            <Label>Photography Guidelines</Label>
            <TextArea
              value={guidelines.photography}
              onChange={(e) => handleChange("photography", e.target.value)}
              placeholder="Enter photography guidelines..."
            />
            <HelpText>
              Rules for taking and sharing photos at your club
            </HelpText>
          </FormGroup>

          <FormActions>
            <OutlineButton
              type="button"
              onClick={() => alert("Changes discarded")}
            >
              Cancel
            </OutlineButton>
            <PrimaryButton type="submit">
              {React.createElement(RiFileTextLine as React.ComponentType)}
              Save Guidelines
            </PrimaryButton>
          </FormActions>
        </Form>
      </FormCard>

      <PreviewCard>
        <CardTitle style={{ marginBottom: theme.spacing.md }}>
          Preview
        </CardTitle>
        <CardDescription style={{ marginBottom: theme.spacing.lg }}>
          This is how your guidelines will appear to users
        </CardDescription>

        <div style={{ marginBottom: theme.spacing.lg }}>
          <h4
            style={{
              color: theme.colors.primary,
              marginBottom: theme.spacing.sm,
            }}
          >
            Posting Guidelines
          </h4>
          <PreviewText>{guidelines.posting}</PreviewText>
        </div>

        <div style={{ marginBottom: theme.spacing.lg }}>
          <h4
            style={{
              color: theme.colors.primary,
              marginBottom: theme.spacing.sm,
            }}
          >
            Behavior Guidelines
          </h4>
          <PreviewText>{guidelines.behavior}</PreviewText>
        </div>

        <div>
          <h4
            style={{
              color: theme.colors.primary,
              marginBottom: theme.spacing.sm,
            }}
          >
            Photography Guidelines
          </h4>
          <PreviewText>{guidelines.photography}</PreviewText>
        </div>
      </PreviewCard>
    </SettingsContainer>
  );
};
