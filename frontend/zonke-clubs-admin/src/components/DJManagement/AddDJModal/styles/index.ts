import styled from "styled-components";
import { theme } from "../../../../styles/theme";

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.xl};
`;

export const DJIconHero = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} 0 ${theme.spacing.md};
`;

export const DJIconBadge = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: ${theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.background};
  box-shadow: 0 0 28px rgba(57, 243, 255, 0.35);

  svg {
    width: 32px;
    height: 32px;
    display: block;
  }
`;

export const DJIconHeroText = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.primary};
  text-transform: uppercase;
  letter-spacing: 0.12em;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Label = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  span {
    color: ${theme.colors.primary};
  }
`;

export const OptionalTag = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.normal};
  color: ${theme.colors.textSecondary} !important;
  background: ${theme.colors.backgroundGray};
  padding: 1px 6px;
  border-radius: ${theme.borderRadius.full};
  border: 1px solid ${theme.colors.border};
  letter-spacing: 0.02em;
`;

export const Input = styled.input`
  padding: 0.7rem ${theme.spacing.md};
  background: ${theme.colors.backgroundGray};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
  font-family: ${theme.typography.fontFamily.base};
  transition: all ${theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(57, 243, 255, 0.1);
    background: ${theme.colors.backgroundHover};
  }

  &::placeholder {
    color: ${theme.colors.textMuted};
  }
`;

export const TextArea = styled.textarea`
  padding: 0.7rem ${theme.spacing.md};
  background: ${theme.colors.backgroundGray};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
  font-family: ${theme.typography.fontFamily.base};
  min-height: 88px;
  resize: vertical;
  transition: all ${theme.transitions.fast};
  line-height: ${theme.typography.lineHeight.relaxed};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(57, 243, 255, 0.1);
    background: ${theme.colors.backgroundHover};
  }

  &::placeholder {
    color: ${theme.colors.textMuted};
  }
`;

export const SectionDivider = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin: -4px 0;
`;

export const SectionDividerLine = styled.div`
  flex: 1;
  height: 1px;
  background: ${theme.colors.border};
`;

export const SectionDividerLabel = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
`;

export const SocialsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
`;

export const SocialField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const SocialPrefix = styled.div<{ platform: "instagram" | "tiktok" }>`
  display: flex;
  align-items: center;
  background: ${theme.colors.backgroundGray};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  transition: all ${theme.transitions.fast};

  &:focus-within {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(57, 243, 255, 0.1);
    background: ${theme.colors.backgroundHover};
  }

  > span {
    padding: 0 10px 0 12px;
    font-size: ${theme.typography.fontSize.sm};
    font-weight: ${theme.typography.fontWeight.semibold};
    background: ${({ platform }) =>
      platform === "instagram"
        ? "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)"
        : "linear-gradient(135deg, #010101 0%, #69C9D0 50%, #EE1D52 100%)"};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
    flex-shrink: 0;
  }
`;

export const SocialInput = styled.input`
  flex: 1;
  padding: 0.7rem 0.75rem 0.7rem 0;
  background: transparent;
  border: none;
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
  font-family: ${theme.typography.fontFamily.base};

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: ${theme.colors.textMuted};
  }
`;

export const FormActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  padding-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border};
  margin-top: ${theme.spacing.sm};
`;

// Legacy exports kept for any other consumers
export const ImageUploadArea = styled.div<{ hasImage: boolean }>``;
export const ImagePreview = styled.img``;
export const ImageUploadText = styled.div``;
export const ImageUploadHint = styled.div``;
export const HelperText = styled.p``;
