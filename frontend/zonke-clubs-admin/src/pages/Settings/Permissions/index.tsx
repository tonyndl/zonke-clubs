import React, { useState } from "react";
import { CardTitle } from "../../../components/Card";
import { PrimaryButton } from "../../../components/Buttons";
import { theme } from "../../../styles/theme";
import { RiLockLine, RiCheckLine, RiCloseLine } from "react-icons/ri";
import {
  SettingsContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  FormCard,
  PermissionRow,
  PermissionInfo,
  PermissionTitle,
  PermissionDesc,
  ToggleSwitch,
  FormActions,
} from "./styles";

interface Permission {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export const Permissions: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: "allow-posting",
      title: "Allow User Posting",
      description: "Let customers post photos and content about your club",
      enabled: true,
    },
    {
      id: "require-approval",
      title: "Require Post Approval",
      description: "All posts must be approved before appearing publicly",
      enabled: true,
    },
    {
      id: "allow-comments",
      title: "Allow Comments",
      description: "Let users comment on posts and events",
      enabled: true,
    },
    {
      id: "allow-ratings",
      title: "Allow Ratings & Reviews",
      description: "Let customers rate and review your club",
      enabled: true,
    },
    {
      id: "auto-tag",
      title: "Auto-Tag Detection",
      description: "Automatically detect when users tag your club",
      enabled: false,
    },
    {
      id: "spending-tracking",
      title: "Spending Tracking",
      description: "Track customer spending and create VIP profiles",
      enabled: true,
    },
  ]);

  const togglePermission = (id: string) => {
    setPermissions((prev) =>
      prev.map((perm) =>
        perm.id === id ? { ...perm, enabled: !perm.enabled } : perm,
      ),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Permissions updated successfully!");
  };

  return (
    <SettingsContainer>
      <PageHeader>
        <PageTitle>Posting Permissions</PageTitle>
        <PageDescription>
          Control what users can do and how content is moderated at your club.
        </PageDescription>
      </PageHeader>

      <FormCard>
        <CardTitle style={{ marginBottom: theme.spacing.lg }}>
          Permission Settings
        </CardTitle>

        <form onSubmit={handleSubmit}>
          {permissions.map((permission) => (
            <PermissionRow key={permission.id}>
              <PermissionInfo>
                <PermissionTitle>
                  {permission.enabled
                    ? React.createElement(RiCheckLine as React.ComponentType)
                    : React.createElement(RiCloseLine as React.ComponentType)}
                  {permission.title}
                </PermissionTitle>
                <PermissionDesc>{permission.description}</PermissionDesc>
              </PermissionInfo>
              <ToggleSwitch
                type="button"
                active={permission.enabled}
                onClick={() => togglePermission(permission.id)}
              />
            </PermissionRow>
          ))}

          <FormActions>
            <PrimaryButton type="submit">
              {React.createElement(RiLockLine as React.ComponentType)}
              Save Permissions
            </PrimaryButton>
          </FormActions>
        </form>
      </FormCard>
    </SettingsContainer>
  );
};
