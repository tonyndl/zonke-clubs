import styled from "styled-components";
import { Card } from "../../../../components/Card";
import { theme } from "../../../../styles/theme";

export const SettingsContainer = styled.div`
  width: 100%;
`;

export const PageHeader = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

export const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize["4xl"]};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.sm};
  background: ${theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const PageDescription = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.textSecondary};
`;

export const FormCard = styled(Card)`
  padding: ${theme.spacing.xl};
`;

export const DayRow = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr 80px;
  align-items: center;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border};

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.md};
  }
`;

export const DayName = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

export const DayNameText = styled.span`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.base};
`;

export const DayDateText = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

export const TimeInputs = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: ${theme.spacing.md};
`;

export const TimeSelectWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const TimeClockIcon = styled.span`
  position: absolute;
  left: 10px;
  color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  pointer-events: none;
  z-index: 1;
  opacity: 0.8;

  svg {
    width: 13px;
    height: 13px;
  }
`;

export const TimeSelect = styled.select`
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  padding: ${theme.spacing.sm} 2rem ${theme.spacing.sm} 2rem;
  background: ${theme.colors.backgroundGray};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
  font-family: ${theme.typography.fontFamily.base};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2339f3ff' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;

  &:hover {
    border-color: ${theme.colors.borderHover};
    background-color: ${theme.colors.backgroundHover};
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(57, 243, 255, 0.12);
  }

  option {
    background: ${theme.colors.backgroundCard};
    color: ${theme.colors.textPrimary};
  }
`;

export const TimeSeparator = styled.span`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
`;

export const ToggleButton = styled.button<{ active: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid
    ${(props) => (props.active ? theme.colors.success : theme.colors.border)};
  background: ${(props) =>
    props.active ? theme.colors.successLight : theme.colors.background};
  color: ${(props) =>
    props.active ? theme.colors.success : theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xs};

  &:hover {
    border-color: ${(props) =>
      props.active ? theme.colors.successDark : theme.colors.borderHover};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const FormActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${theme.spacing.xl};
  padding-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border};
`;

export const ClosedLabel = styled.span`
  color: ${theme.colors.textSecondary};
  font-style: italic;
  font-size: ${theme.typography.fontSize.sm};
`;

export const WeekIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.backgroundGray};
  border-radius: ${theme.borderRadius.lg};
  margin-bottom: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.borderLight};
`;

export const WeekText = styled.span`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
`;

export const WeekDate = styled.span`
  color: ${theme.colors.text};
  font-weight: ${theme.typography.fontWeight.semibold};
  font-size: ${theme.typography.fontSize.sm};
`;

export const WeekTabs = styled.div`
  display: flex;
  gap: 0;
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.backgroundGray};
  border: 1px solid ${theme.colors.border};
  padding: 4px;
  margin-bottom: ${theme.spacing.xl};
  width: fit-content;
`;

export const WeekTab = styled.button<{ active: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.md};
  border: none;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  background: ${(props) =>
    props.active ? theme.colors.primary : "transparent"};
  color: ${(props) =>
    props.active ? theme.colors.background : theme.colors.textSecondary};

  &:hover {
    color: ${(props) =>
      props.active ? theme.colors.background : theme.colors.textPrimary};
  }
`;
