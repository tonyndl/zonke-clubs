import styled from "styled-components";
import { theme } from "../../../styles/theme";

export const FormGroup = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

export const Label = styled.label`
  display: block;
  margin-bottom: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text};
  letter-spacing: 0.3px;
`;

export const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text};
  background: ${theme.colors.backgroundCard};
  border: 1.5px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  transition: all ${theme.transitions.normal};
  font-family: ${theme.typography.fontFamily.base};

  &:hover:not(:disabled) {
    border-color: ${theme.colors.borderHover};
    background: ${theme.colors.backgroundHover};
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    background: ${theme.colors.backgroundHover};
    box-shadow:
      0 0 0 3px rgba(57, 243, 255, 0.1),
      0 0 20px rgba(57, 243, 255, 0.1);
    transform: translateY(-1px);
  }

  &:disabled {
    background: ${theme.colors.backgroundDark};
    cursor: not-allowed;
    opacity: 0.6;
  }

  &::placeholder {
    color: ${theme.colors.textMuted};
  }

  &:invalid:not(:placeholder-shown) {
    border-color: ${theme.colors.error};
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.base};
  font-family: ${theme.typography.fontFamily.base};
  color: ${theme.colors.text};
  background: ${theme.colors.backgroundCard};
  border: 1.5px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  resize: vertical;
  min-height: 120px;
  transition: all ${theme.transitions.normal};

  &:hover:not(:disabled) {
    border-color: ${theme.colors.borderHover};
    background: ${theme.colors.backgroundHover};
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    background: ${theme.colors.backgroundHover};
    box-shadow:
      0 0 0 3px rgba(57, 243, 255, 0.1),
      0 0 20px rgba(57, 243, 255, 0.1);
    transform: translateY(-1px);
  }

  &:disabled {
    background: ${theme.colors.backgroundDark};
    cursor: not-allowed;
    opacity: 0.6;
  }

  &::placeholder {
    color: ${theme.colors.textMuted};
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text};
  background: ${theme.colors.backgroundCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${theme.transitions.normal};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    background: ${theme.colors.backgroundHover};
    box-shadow:
      0 0 0 3px ${theme.colors.primary}20,
      ${theme.shadows.glow};
  }

  &:disabled {
    background: ${theme.colors.backgroundDark};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const HelperText = styled.span`
  display: block;
  margin-top: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
`;

export const ErrorText = styled(HelperText)`
  color: ${theme.colors.error};
`;

interface CheckboxProps {
  checked?: boolean;
}

export const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

export const Checkbox = styled.input.attrs({ type: "checkbox" })<CheckboxProps>`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${theme.colors.primary};
`;

export const CheckboxLabel = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text};
  cursor: pointer;

  &:hover {
    color: ${theme.colors.textPrimary};
  }
`;
