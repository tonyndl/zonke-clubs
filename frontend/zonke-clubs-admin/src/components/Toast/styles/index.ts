import styled, { keyframes } from "styled-components";
import { theme } from "../../../styles/theme";

export const slideIn = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

export const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
`;

export const ToastWrapper = styled.div<{
  type: "success" | "error" | "warning" | "info";
  isExiting?: boolean;
}>`
  display: flex;
  flex-direction: column;
  background: ${theme.colors.cardBackground};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.lg};
  border-top: 3px solid
    ${(props) => {
      switch (props.type) {
        case "success":
          return theme.colors.success;
        case "error":
          return theme.colors.error;
        case "warning":
          return theme.colors.warning;
        case "info":
          return theme.colors.info;
        default:
          return theme.colors.primary;
      }
    }};
  min-width: 300px;
  max-width: 400px;
  animation: ${(props) => (props.isExiting ? slideOut : slideIn)}
    ${theme.transitions.normal};
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  overflow: hidden;
  position: relative;
`;

export const ToastBody = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
`;

export const IconContainer = styled.div<{
  type: "success" | "error" | "warning" | "info";
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: ${theme.borderRadius.full};
  background: ${(props) => {
    switch (props.type) {
      case "success":
        return theme.colors.successLight;
      case "error":
        return theme.colors.errorLight;
      case "warning":
        return theme.colors.warningLight;
      case "info":
        return theme.colors.infoLight;
      default:
        return theme.colors.bgSecondary;
    }
  }};
  color: ${(props) => {
    switch (props.type) {
      case "success":
        return theme.colors.success;
      case "error":
        return theme.colors.error;
      case "warning":
        return theme.colors.warning;
      case "info":
        return theme.colors.info;
      default:
        return theme.colors.primary;
    }
  }};

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const ToastContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

export const ToastTitle = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
`;

export const ToastMessage = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  padding: ${theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.sm};
  transition: all ${theme.transitions.fast};

  &:hover {
    color: ${theme.colors.textPrimary};
    background: ${theme.colors.backgroundHover};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const ProgressBar = styled.div<{
  type: "success" | "error" | "warning" | "info";
  duration: number;
}>`
  height: 3px;
  background: ${(props) => {
    switch (props.type) {
      case "success":
        return theme.colors.success;
      case "error":
        return theme.colors.error;
      case "warning":
        return theme.colors.warning;
      case "info":
        return theme.colors.info;
      default:
        return theme.colors.primary;
    }
  }};
  width: 100%;
  transform-origin: left;
  animation: shrink ${(props) => props.duration}ms linear forwards;

  @keyframes shrink {
    from {
      transform: scaleX(1);
    }
    to {
      transform: scaleX(0);
    }
  }
`;

export const ToastContainerWrapper = styled.div`
  position: fixed;
  bottom: ${theme.spacing.xl};
  left: ${theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  z-index: ${theme.zIndex.toast};
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
`;
