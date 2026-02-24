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
  min-height: 200px;
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

export const ImagePreview = styled.img`
  width: 100%;
  height: auto;
  display: block;
  border-radius: inherit;
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

export const SelectedDJsArea = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${theme.spacing.sm};
  min-height: 52px;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
`;

export const EmptyDJHint = styled.span`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};
  font-style: italic;
`;

export const DJChip = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px 4px 10px;
  background: ${theme.colors.sidebarActiveBg};
  border: 1px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.full};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
`;

export const DJChipIcon = styled.div`
  display: flex;
  align-items: center;
  color: ${theme.colors.primary};

  svg {
    width: 12px;
    height: 12px;
    display: block;
  }
`;

export const DJChipName = styled.span`
  white-space: nowrap;
`;

export const DJChipRemove = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 50%;
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  line-height: 0;
  flex-shrink: 0;

  &:hover {
    background: ${theme.colors.error};
    color: white;
  }

  svg {
    width: 10px;
    height: 10px;
    display: block;
  }
`;

export const DJPickerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: ${theme.spacing.sm};
  max-height: 210px;
  overflow-y: auto;
  padding: 2px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: 4px;
  }
`;

export const DJPickerCard = styled.button<{ selected?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.sm};
  background: ${(props) =>
    props.selected ? theme.colors.sidebarActiveBg : theme.colors.background};
  border: 1.5px solid
    ${(props) => (props.selected ? theme.colors.primary : theme.colors.border)};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  text-align: center;

  &:hover {
    border-color: ${theme.colors.primary};
    background: ${theme.colors.sidebarActiveBg};
    transform: translateY(-2px);
    box-shadow: 0 4px 14px ${theme.colors.primaryLight};
  }
`;

export const DJPickerAvatar = styled.div<{ selected?: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${(props) =>
    props.selected ? theme.gradients.primary : theme.colors.sidebarActiveBg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => (props.selected ? "white" : theme.colors.primary)};
  transition: all ${theme.transitions.fast};

  svg {
    width: 20px;
    height: 20px;
    display: block;
  }
`;

export const DJPickerName = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  line-height: 1.3;
  word-break: break-word;
`;

export const DJPickerCheck = styled.div`
  position: absolute;
  top: -7px;
  right: -7px;
  width: 20px;
  height: 20px;
  background: ${theme.colors.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  line-height: 0;

  svg {
    width: 11px;
    height: 11px;
    display: block;
  }
`;

export const DJPickerEmpty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};

  svg {
    width: 32px;
    height: 32px;
    color: ${theme.colors.textSecondary};
    opacity: 0.5;
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

export const ImagePreviewOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.md};
  z-index: 2;
  border-radius: inherit;
`;

export const ImageProgressText = styled.div`
  color: white;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

export const ImageProgressBar = styled.div<{ progress: number }>`
  width: 70%;
  height: 6px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 999px;
  overflow: hidden;

  &::after {
    content: "";
    display: block;
    height: 100%;
    width: ${(props) => props.progress}%;
    background: ${theme.colors.primary};
    border-radius: 999px;
    transition: width 0.15s ease;
  }
`;

export const ImageRemoveButton = styled.button`
  position: absolute;
  top: ${theme.spacing.sm};
  right: ${theme.spacing.sm};
  z-index: 3;
  background: rgba(0, 0, 0, 0.65);
  border: none;
  border-radius: ${theme.borderRadius.full};
  color: white;
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  cursor: pointer;
  transition: background ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.error};
  }

  svg {
    width: 14px;
    height: 14px;
    display: block;
    margin: auto;
  }
`;

export const ImageChangeHint = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: ${theme.spacing.sm};
  background: rgba(0, 0, 0, 0.5);
  color: rgba(255, 255, 255, 0.85);
  font-size: ${theme.typography.fontSize.xs};
  text-align: center;
  z-index: 2;
  opacity: 0;
  transition: opacity ${theme.transitions.fast};

  ${ImageUploadArea}:hover & {
    opacity: 1;
  }
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
