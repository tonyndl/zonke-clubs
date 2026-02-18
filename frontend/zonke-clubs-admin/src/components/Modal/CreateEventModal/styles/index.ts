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

  /* Remove spinner arrows from number inputs */
  &[type="number"]::-webkit-outer-spin-button,
  &[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type="number"] {
    -moz-appearance: textfield;
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

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.lg};

  @media (max-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

export const ImageUploadArea = styled.div`
  border: 2px dashed ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  text-align: center;
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  background: ${theme.colors.background};
  position: relative;
  overflow: hidden;

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
  }
`;

export const ImageUploadText = styled.div`
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  margin-bottom: ${theme.spacing.xs};
`;

export const ImageUploadHint = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};
`;

export const DJLineupContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const DJInput = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

export const RemoveButton = styled.button`
  padding: ${theme.spacing.md};
  background: ${theme.colors.error};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  color: white;
  cursor: pointer;
  font-weight: ${theme.typography.fontWeight.semibold};
  transition: all ${theme.transitions.fast};
  font-size: ${theme.typography.fontSize.sm};
  min-width: 80px;

  &:hover {
    background: ${theme.colors.errorDark};
    transform: translateY(-2px);
  }
`;

export const AddButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.sidebarActiveBg};
  border: 1px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.primary};
  cursor: pointer;
  font-weight: ${theme.typography.fontWeight.semibold};
  transition: all ${theme.transitions.fast};
  font-size: ${theme.typography.fontSize.sm};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  width: fit-content;

  &:hover {
    background: ${theme.colors.primary};
    color: ${theme.colors.background};
    transform: translateY(-2px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const Select = styled.select`
  padding: ${theme.spacing.md};
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.base};
  font-family: ${theme.typography.fontFamily.base};
  transition: all ${theme.transitions.fast};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primaryLight};
  }

  option {
    background: ${theme.colors.cardBackground};
    color: ${theme.colors.textPrimary};
  }
`;

export const FormActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  padding-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border};
`;

export const HiddenInput = styled.input`
  display: none;
`;

export const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

export const SwitchLabel = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
`;

export const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background: ${theme.gradients.primary};
  }

  &:checked + span:before {
    transform: translateX(26px);
  }
`;

export const SwitchSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${theme.colors.border};
  transition: 0.4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

export const StatusText = styled.span<{ published: boolean }>`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${(props) =>
    props.published ? theme.colors.success : theme.colors.textSecondary};
`;

export const DJSelectHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const QuickAddDJButton = styled.button`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${theme.colors.sidebarActiveBg};
  border: 1px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.primary};
  cursor: pointer;
  font-weight: ${theme.typography.fontWeight.semibold};
  transition: all ${theme.transitions.fast};
  font-size: ${theme.typography.fontSize.xs};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  &:hover {
    background: ${theme.colors.primary};
    color: ${theme.colors.background};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;
