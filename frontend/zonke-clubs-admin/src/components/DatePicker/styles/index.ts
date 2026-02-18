import styled from "styled-components";
import { theme } from "../../../styles/theme";

export const DatePickerContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const DateInput = styled.div<{ hasValue: boolean; isOpen: boolean }>`
  padding: ${theme.spacing.md};
  background: ${theme.colors.background};
  border: 1px solid
    ${(props) => (props.isOpen ? theme.colors.primary : theme.colors.border)};
  border-radius: ${theme.borderRadius.lg};
  color: ${(props) =>
    props.hasValue ? theme.colors.textPrimary : theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.base};
  font-family: ${theme.typography.fontFamily.base};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primaryLight};
  }

  ${(props) =>
    props.isOpen &&
    `
    box-shadow: 0 0 0 3px ${theme.colors.primaryLight};
  `}
`;

export const CalendarDropdown = styled.div<{
  isOpen: boolean;
  showAbove: boolean;
}>`
  position: absolute;
  ${(props) =>
    props.showAbove
      ? `bottom: calc(100% + ${theme.spacing.sm});`
      : `top: calc(100% + ${theme.spacing.sm});`}
  left: 0;
  right: 0;
  background: ${theme.colors.cardBackground};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.xl};
  box-shadow:
    ${theme.shadows.xl},
    0 0 40px rgba(57, 243, 255, 0.15);
  z-index: 10000;
  overflow: hidden;
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  transform: ${(props) => {
    if (props.isOpen) {
      return "translateY(0) scale(1)";
    }
    return props.showAbove
      ? "translateY(10px) scale(0.95)"
      : "translateY(-10px) scale(0.95)";
  }};
  pointer-events: ${(props) => (props.isOpen ? "all" : "none")};
  transition: all ${theme.transitions.normal};
  max-height: 420px;

  &::before {
    content: "";
    position: absolute;
    ${(props) => (props.showAbove ? "bottom: 0;" : "top: 0;")}
    left: 0;
    right: 0;
    height: 3px;
    background: ${theme.gradients.primary};
    z-index: 1;
  }
`;

export const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border};
  background: ${theme.colors.background};
`;

export const MonthYearDisplay = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  background: ${theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const NavButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: ${theme.borderRadius.full};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.background};
  color: ${theme.colors.textPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    border-color: ${theme.colors.primary};
    background: ${theme.colors.sidebarActiveBg};
    transform: scale(1.1);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const CalendarGrid = styled.div`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: ${theme.spacing.xs};
`;

export const DayLabel = styled.div`
  text-align: center;
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textSecondary};
  padding: ${theme.spacing.xs};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const DayCell = styled.button<{
  isSelected: boolean;
  isToday: boolean;
  isDisabled: boolean;
  isOtherMonth: boolean;
}>`
  aspect-ratio: 1;
  border: none;
  background: ${(props) => {
    if (props.isSelected) return theme.gradients.primary;
    if (props.isToday) return theme.colors.sidebarActiveBg;
    return "transparent";
  }};
  color: ${(props) => {
    if (props.isSelected) return "#fff";
    if (props.isDisabled || props.isOtherMonth)
      return theme.colors.textSecondary;
    return theme.colors.textPrimary;
  }};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${(props) =>
    props.isSelected
      ? theme.typography.fontWeight.semibold
      : theme.typography.fontWeight.normal};
  border-radius: ${theme.borderRadius.lg};
  cursor: ${(props) => (props.isDisabled ? "not-allowed" : "pointer")};
  transition: all ${theme.transitions.fast};
  opacity: ${(props) => (props.isOtherMonth ? 0.4 : 1)};
  position: relative;
  overflow: hidden;

  &:hover:not(:disabled) {
    background: ${(props) =>
      props.isSelected
        ? theme.gradients.primary
        : theme.colors.sidebarActiveBg};
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.3;
  }

  ${(props) =>
    props.isToday &&
    !props.isSelected &&
    `
    box-shadow: inset 0 0 0 2px ${theme.colors.primary};
  `}
`;

export const TodayButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: none;
  border-top: 1px solid ${theme.colors.border};
  background: ${theme.colors.background};
  color: ${theme.colors.primary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.sidebarActiveBg};
  }
`;

export const CalendarIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.primary};

  svg {
    width: 20px;
    height: 20px;
  }
`;
