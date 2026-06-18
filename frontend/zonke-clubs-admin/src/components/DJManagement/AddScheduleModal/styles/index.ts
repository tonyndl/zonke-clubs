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

export const TextArea = styled.textarea`
  padding: ${theme.spacing.md};
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.base};
  font-family: ${theme.typography.fontFamily.base};
  min-height: 80px;
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

export const RadioGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
`;

export const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  transition: all ${theme.transitions.fast};
  flex: 1;

  &:hover {
    border-color: ${theme.colors.primary};
    background: ${theme.colors.sidebarActiveBg};
  }

  input[type="radio"]:checked + & {
    border-color: ${theme.colors.primary};
    background: ${theme.colors.sidebarActiveBg};
  }
`;

export const RadioInput = styled.input`
  cursor: pointer;
`;

export const RadioLabel = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textPrimary};
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

export const DJSelectHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
`;

export const AddDJButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.sm};
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;

export const EmptyDJsMessage = styled.div`
  padding: ${theme.spacing.lg};
  text-align: center;
  background: ${theme.colors.background};
  border: 2px dashed ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  margin-bottom: ${theme.spacing.lg};

  p {
    color: ${theme.colors.textSecondary};
    margin-bottom: ${theme.spacing.md};
    font-size: ${theme.typography.fontSize.sm};
  }
`;
