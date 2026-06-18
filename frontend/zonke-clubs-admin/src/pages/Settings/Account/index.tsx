import React, { useState, useEffect } from "react";
import {
  RiLockLine,
  RiUserLine,
  RiAlertLine,
  RiDeleteBinLine,
} from "react-icons/ri";
import { apiService } from "../../../services/api";
import { useToast } from "../../../components/Toast";
import { PrimaryButton, DangerButton } from "../../../components/Buttons";
import { ConfirmationModal } from "../../../components/Modal";
import {
  accountProfileSchema,
  changePasswordSchema,
  parseZodErrors,
} from "../../../utils/validation";
import {
  SettingsContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  FormCard,
  SectionTitle,
  Form,
  FormGroup,
  Label,
  Input,
  FormActions,
  DangerZone,
  DangerTitle,
  DangerDescription,
  ErrorText,
} from "./styles";

export const Account: React.FC = () => {
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  // Profile editing
  const [originalEmail, setOriginalEmail] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>(
    {},
  );

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete account
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    apiService.getCurrentUser().then((data: any) => {
      setEmail(data.email || "");
      setName(data.name || "");
      setOriginalEmail(data.email || "");
      setOriginalName(data.name || "");
    });
  }, []);

  const profileChanged = email !== originalEmail || name !== originalName;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrors({});
    const result = accountProfileSchema.safeParse({ email, name });
    if (!result.success) {
      setProfileErrors(parseZodErrors(result.error));
      return;
    }
    setSavingProfile(true);
    apiService
      .updateProfile({ name, email })
      .then(() => {
        toast.success("Profile updated");
        setOriginalEmail(email);
        setOriginalName(name);
      })
      .catch(() => {
        toast.error("Failed to update profile");
      })
      .finally(() => setSavingProfile(false));
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});
    const result = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    if (!result.success) {
      setPasswordErrors(parseZodErrors(result.error));
      return;
    }
    setChangingPassword(true);
    apiService
      .changePassword(currentPassword, newPassword)
      .then(() => {
        toast.success("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      })
      .catch((err: any) => {
        const msg =
          err.response?.data?.error ||
          "Failed to change password. Check your current password.";
        setPasswordErrors({ currentPassword: msg });
      })
      .finally(() => setChangingPassword(false));
  };

  const handleDeleteAccount = () => {
    setDeleting(true);
    apiService
      .deleteAccount(deletePassword)
      .then(() => {
        apiService.logout();
        window.location.href = "/login";
      })
      .catch((err: any) => {
        const msg =
          err.response?.data?.error ||
          "Failed to delete account. Check your password.";
        toast.error(msg);
        setDeletePassword("");
      })
      .finally(() => {
        setDeleting(false);
        setDeleteModalOpen(false);
      });
  };

  return (
    <SettingsContainer>
      <PageHeader>
        <PageTitle>Account Settings</PageTitle>
        <PageDescription>
          Manage your account security and preferences.
        </PageDescription>
      </PageHeader>

      {/* Account Info */}
      <FormCard>
        <SectionTitle>
          {React.createElement(RiUserLine as React.ComponentType)}
          Account Information
        </SectionTitle>
        <Form onSubmit={handleSaveProfile}>
          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setProfileErrors((p) => {
                  const { email: _, ...rest } = p;
                  return rest;
                });
              }}
              placeholder="Email address"
            />
            {profileErrors.email && (
              <ErrorText>{profileErrors.email}</ErrorText>
            )}
          </FormGroup>
          <FormGroup>
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setProfileErrors((p) => {
                  const { name: _, ...rest } = p;
                  return rest;
                });
              }}
              placeholder="Display name"
            />
            {profileErrors.name && <ErrorText>{profileErrors.name}</ErrorText>}
          </FormGroup>
          <FormActions>
            <PrimaryButton
              type="submit"
              disabled={savingProfile || !profileChanged}
            >
              {savingProfile ? "Saving..." : "Save Changes"}
            </PrimaryButton>
          </FormActions>
        </Form>
      </FormCard>

      {/* Change Password */}
      <FormCard>
        <SectionTitle>
          {React.createElement(RiLockLine as React.ComponentType)}
          Change Password
        </SectionTitle>
        <Form onSubmit={handleChangePassword}>
          <FormGroup>
            <Label>Current Password</Label>
            <Input
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setPasswordErrors((p) => {
                  const { currentPassword: _, ...rest } = p;
                  return rest;
                });
              }}
            />
            {passwordErrors.currentPassword && (
              <ErrorText>{passwordErrors.currentPassword}</ErrorText>
            )}
          </FormGroup>
          <FormGroup>
            <Label>New Password</Label>
            <Input
              type="password"
              placeholder="Enter new password (min 8 characters)"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordErrors((p) => {
                  const { newPassword: _, ...rest } = p;
                  return rest;
                });
              }}
            />
            {passwordErrors.newPassword && (
              <ErrorText>{passwordErrors.newPassword}</ErrorText>
            )}
          </FormGroup>
          <FormGroup>
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordErrors((p) => {
                  const { confirmPassword: _, ...rest } = p;
                  return rest;
                });
              }}
            />
            {passwordErrors.confirmPassword && (
              <ErrorText>{passwordErrors.confirmPassword}</ErrorText>
            )}
          </FormGroup>
          <FormActions>
            <PrimaryButton type="submit" disabled={changingPassword}>
              {changingPassword ? "Changing..." : "Change Password"}
            </PrimaryButton>
          </FormActions>
        </Form>
      </FormCard>

      {/* Exit */}
      <DangerZone>
        <DangerTitle>
          {React.createElement(RiAlertLine as React.ComponentType)}
          Exit
        </DangerTitle>
        <DangerDescription>
          Once you delete your account, there is no going back. This will
          permanently remove your admin account and all associated data.
        </DangerDescription>
        <DangerButton type="button" onClick={() => setDeleteModalOpen(true)}>
          {React.createElement(RiDeleteBinLine as React.ComponentType)}
          Delete Account
        </DangerButton>
      </DangerZone>

      {/* Delete confirmation modal with password */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletePassword("");
        }}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="This action is irreversible. Enter your password to confirm."
        confirmText={deleting ? "Deleting..." : "Delete Account"}
        type="danger"
      />
    </SettingsContainer>
  );
};
