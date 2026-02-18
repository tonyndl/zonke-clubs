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

  /* Remove number input arrows */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
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

export const CustomerSearchContainer = styled.div`
  position: relative;
`;

export const CustomerSuggestions = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${theme.colors.cardBackground};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  margin-top: ${theme.spacing.xs};
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: ${theme.shadows.lg};
`;

export const CustomerSuggestion = styled.div`
  padding: ${theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.sidebarActiveBg};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${theme.colors.border};
  }
`;

export const CustomerAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.full};
  border: 2px solid ${theme.colors.border};
`;

export const CustomerInfo = styled.div`
  flex: 1;
`;

export const CustomerName = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
`;

export const CustomerEmail = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
`;

export const SelectedCustomer = styled.div`
  padding: ${theme.spacing.md};
  background: ${theme.colors.sidebarActiveBg};
  border: 1px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

export const ClearButton = styled.button`
  margin-left: auto;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${theme.colors.error};
  border: none;
  border-radius: ${theme.borderRadius.md};
  color: white;
  cursor: pointer;
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.errorDark};
  }
`;

export const AmountInputContainer = styled.div`
  position: relative;
`;

export const CurrencyPrefix = styled.div`
  position: absolute;
  left: ${theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

export const AmountInput = styled(Input)`
  padding-left: calc(${theme.spacing.md} + 24px);
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary};

  /* Remove number input arrows */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type="number"] {
    -moz-appearance: textfield;
  }
`;

export const FormActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  padding-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border};
`;

export const HelpText = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
  font-style: italic;
`;

export const ToggleSwitch = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${theme.colors.sidebarActiveBg};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    border-color: ${theme.colors.primary};
  }
`;

export const Switch = styled.div<{ active: boolean }>`
  width: 48px;
  height: 24px;
  background: ${(props) =>
    props.active ? theme.colors.primary : theme.colors.border};
  border-radius: ${theme.borderRadius.full};
  position: relative;
  transition: all ${theme.transitions.fast};
  box-shadow: ${(props) => (props.active ? theme.shadows.glow : "none")};

  &::after {
    content: "";
    position: absolute;
    top: 2px;
    left: ${(props) => (props.active ? "26px" : "2px")};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: ${theme.borderRadius.full};
    transition: all ${theme.transitions.fast};
    box-shadow: ${theme.shadows.sm};
  }
`;

export const SwitchLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  svg {
    width: 18px;
    height: 18px;
    color: ${theme.colors.primary};
  }
`;

export const GroupSection = styled.div`
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
`;

export const GroupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
`;

export const GroupTitle = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  svg {
    width: 18px;
    height: 18px;
    color: ${theme.colors.primary};
  }
`;

export const AddMemberButton = styled.button`
  padding: ${theme.spacing.xs} ${theme.spacing.md};
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

  &:hover {
    background: ${theme.colors.primary};
    color: ${theme.colors.background};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

export const GroupMembersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

export const GroupMemberItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${theme.colors.cardBackground};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border};
`;

export const MemberAvatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: ${theme.borderRadius.full};
  border: 2px solid ${theme.colors.border};
`;

export const MemberInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const MemberName = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
`;

export const MemberAmount = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.success};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

export const RemoveMemberButton = styled.button`
  padding: ${theme.spacing.xs};
  background: transparent;
  border: 1px solid ${theme.colors.error};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.error};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.error};
    color: white;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const SplitTypeSelector = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
`;

export const SplitTypeButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${(props) =>
    props.active ? theme.colors.primary : theme.colors.sidebarActiveBg};
  border: 1px solid
    ${(props) => (props.active ? theme.colors.primary : theme.colors.border)};
  border-radius: ${theme.borderRadius.lg};
  color: ${(props) =>
    props.active ? theme.colors.background : theme.colors.textPrimary};
  cursor: pointer;
  font-weight: ${theme.typography.fontWeight.semibold};
  font-size: ${theme.typography.fontSize.sm};
  transition: all ${theme.transitions.fast};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
`;

export const TotalSummary = styled.div`
  padding: ${theme.spacing.md};
  background: ${theme.colors.sidebarActiveBg};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.primary};
  margin-top: ${theme.spacing.md};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const SummaryLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
`;

export const SummaryValue = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary};
`;
