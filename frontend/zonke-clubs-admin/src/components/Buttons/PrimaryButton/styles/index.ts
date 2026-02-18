import styled from "styled-components";
import { theme } from "../../../../styles/theme";

export const PrimaryButton = styled.button<{ fullWidth?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  font-family: ${theme.typography.fontFamily.base};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  background: ${theme.gradients.primary};
  color: ${theme.colors.background};
  border: 1px solid transparent;
  box-shadow: ${theme.shadows.glow};
  width: ${(props) => (props.fullWidth ? "100%" : "auto")};

  &:hover:not(:disabled) {
    background: ${theme.gradients.primaryHover};
    box-shadow: ${theme.shadows.glowHover};
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none !important;
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 3px ${theme.colors.primary}40,
      ${theme.shadows.glow};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;
