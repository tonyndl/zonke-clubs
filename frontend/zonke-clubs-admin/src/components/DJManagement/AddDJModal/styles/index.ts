import styled from "styled-components";
import { theme } from "../../../../styles/theme";

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.xl};
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const Label = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  svg {
    width: 16px;
    height: 16px;
    color: ${theme.colors.primary};
  }
`;

export const Input = styled.input`
  padding: ${theme.spacing.md};
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.base};
  font-family: ${theme.typography.fontFamily.base};
  transition: all ${theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primaryLight};
  }

  &::placeholder {
    color: ${theme.colors.textSecondary};
  }
`;

export const TextArea = styled.textarea`
  padding: ${theme.spacing.md};
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.base};
  font-family: ${theme.typography.fontFamily.base};
  min-height: 100px;
  resize: vertical;
  transition: all ${theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primaryLight};
  }

  &::placeholder {
    color: ${theme.colors.textSecondary};
  }
`;

export const ImageUploadArea = styled.div<{ hasImage: boolean }>`
  border: 2px dashed ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${(props) => (props.hasImage ? theme.spacing.sm : theme.spacing.xl)};
  text-align: center;
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  background: ${theme.colors.background};
  position: relative;
  overflow: hidden;
  min-height: ${(props) => (props.hasImage ? "150px" : "auto")};

  &:hover {
    border-color: ${theme.colors.primary};
    background: ${theme.colors.sidebarActiveBg};

    &::after {
      opacity: 0.05;
    }
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: ${theme.gradients.primary};
    opacity: 0;
    transition: opacity ${theme.transitions.fast};
  }

  svg {
    width: 48px;
    height: 48px;
    color: ${theme.colors.primary};
    margin-bottom: ${theme.spacing.md};
    position: relative;
    z-index: 1;
  }
`;

export const ImagePreview = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: ${theme.borderRadius.lg};
`;

export const ImageUploadText = styled.div`
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  margin-bottom: ${theme.spacing.xs};
  position: relative;
  z-index: 1;
`;

export const ImageUploadHint = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};
  position: relative;
  z-index: 1;
`;

export const HiddenInput = styled.input`
  display: none;
`;

export const FormActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  padding-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border};
`;

export const HelperText = styled.p`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
  margin-top: ${theme.spacing.xs};
`;
