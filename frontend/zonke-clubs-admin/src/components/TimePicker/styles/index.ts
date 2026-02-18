import styled from "styled-components";
import { theme } from "../../../styles/theme";

export const TimePickerContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const TimeInput = styled.div<{ hasValue: boolean; isOpen: boolean }>`
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
  gap: ${theme.spacing.sm};

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

export const TimeDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  svg {
    width: 18px;
    height: 18px;
    color: ${theme.colors.primary};
  }
`;

export const TimeDropdown = styled.div<{
  isOpen: boolean;
  positionAbove: boolean;
}>`
  position: absolute;
  ${(props) =>
    props.positionAbove
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
  z-index: 1000;
  overflow: hidden;
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  transform: ${(props) => {
    if (!props.isOpen) {
      return props.positionAbove
        ? "translateY(10px) scale(0.95)"
        : "translateY(-10px) scale(0.95)";
    }
    return "translateY(0) scale(1)";
  }};
  pointer-events: ${(props) => (props.isOpen ? "all" : "none")};
  transition: all ${theme.transitions.normal};
  max-height: 320px;

  &::before {
    content: "";
    position: absolute;
    ${(props) => (props.positionAbove ? "bottom: 0;" : "top: 0;")}
    left: 0;
    right: 0;
    height: 3px;
    background: ${theme.gradients.primary};
    z-index: 10;
  }
`;

export const TimeList = styled.div`
  max-height: 320px;
  overflow-y: auto;
  padding: ${theme.spacing.sm};

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${theme.colors.background};
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: ${theme.borderRadius.full};

    &:hover {
      background: ${theme.colors.primary};
    }
  }
`;

export const TimeOption = styled.button<{ isSelected: boolean }>`
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: none;
  background: ${(props) =>
    props.isSelected ? theme.gradients.primary : "transparent"};
  color: ${(props) => (props.isSelected ? "#fff" : theme.colors.textPrimary)};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${(props) =>
    props.isSelected
      ? theme.typography.fontWeight.semibold
      : theme.typography.fontWeight.normal};
  text-align: left;
  cursor: pointer;
  border-radius: ${theme.borderRadius.lg};
  transition: all ${theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.xs};

  &:hover {
    background: ${(props) =>
      props.isSelected
        ? theme.gradients.primary
        : theme.colors.sidebarActiveBg};
    transform: translateX(4px);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

export const TimePeriod = styled.span<{ isSelected: boolean }>`
  font-size: ${theme.typography.fontSize.xs};
  padding: 2px 8px;
  border-radius: ${theme.borderRadius.full};
  background: ${(props) =>
    props.isSelected ? "rgba(255,255,255,0.2)" : theme.colors.background};
  color: ${(props) => (props.isSelected ? "#fff" : theme.colors.textSecondary)};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

export const ArrowIcon = styled.div<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.textSecondary};
  transform: ${(props) => (props.isOpen ? "rotate(90deg)" : "rotate(0deg)")};
  transition: transform ${theme.transitions.fast};

  svg {
    width: 20px;
    height: 20px;
  }
`;
