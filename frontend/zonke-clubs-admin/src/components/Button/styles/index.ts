import styled, { css } from "styled-components";
import { theme } from "../../../styles/theme";

interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
}

const sizes = {
  sm: css`
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    font-size: ${theme.typography.fontSize.sm};
  `,
  md: css`
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    font-size: ${theme.typography.fontSize.base};
  `,
  lg: css`
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    font-size: ${theme.typography.fontSize.lg};
  `,
};

const variants = {
  primary: css`
    background: ${theme.gradients.primary};
    color: ${theme.colors.background};
    border: 1px solid transparent;
    box-shadow: 0 4px 14px rgba(57, 243, 255, 0.3);
    font-weight: ${theme.typography.fontWeight.semibold};

    &:hover:not(:disabled) {
      background: ${theme.gradients.primaryHover};
      box-shadow: 0 6px 20px rgba(57, 243, 255, 0.4);
      transform: translateY(-2px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(57, 243, 255, 0.3);
    }
  `,
  secondary: css`
    background: ${theme.colors.cardBackground};
    color: ${theme.colors.primary};
    border: 1.5px solid ${theme.colors.primary};
    font-weight: ${theme.typography.fontWeight.semibold};

    &:hover:not(:disabled) {
      background: ${theme.colors.sidebarActiveBg};
      box-shadow: 0 0 20px rgba(57, 243, 255, 0.2);
      transform: translateY(-1px);
    }
  `,
  outline: css`
    background: transparent;
    color: ${theme.colors.text};
    border: 1px solid ${theme.colors.border};

    &:hover:not(:disabled) {
      border-color: ${theme.colors.primary};
      color: ${theme.colors.primary};
      background: ${theme.colors.sidebarActiveBg};
    }
  `,
  danger: css`
    background: ${theme.colors.error};
    color: ${theme.colors.white};
    border: 1px solid transparent;

    &:hover:not(:disabled) {
      background: ${theme.colors.errorDark};
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
    }
  `,
  ghost: css`
    background: transparent;
    color: ${theme.colors.textSecondary};
    border: none;

    &:hover:not(:disabled) {
      background: ${theme.colors.backgroundHover};
      color: ${theme.colors.text};
    }
  `,
};

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  font-family: ${theme.typography.fontFamily.base};
  font-weight: ${theme.typography.fontWeight.medium};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.3px;

  ${(props) => sizes[props.size || "md"]}
  ${(props) => variants[props.variant || "primary"]}

  ${(props) =>
    props.fullWidth &&
    css`
      width: 100%;
    `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 4px rgba(57, 243, 255, 0.2);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  /* Ripple effect on click */
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition:
      width 0.6s,
      height 0.6s;
  }

  &:active:not(:disabled)::after {
    width: 300px;
    height: 300px;
    opacity: 0;
  }
`;

export const IconButton = styled(Button)`
  padding: ${theme.spacing.md};
  aspect-ratio: 1;
`;

export const GradientButton = styled(Button)`
  background: ${theme.gradients.primary};
  border: none;
  color: ${theme.colors.background};
  font-weight: ${theme.typography.fontWeight.semibold};
  box-shadow: ${theme.shadows.glow};
  position: relative;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: ${theme.gradients.primaryHover};
    opacity: 0;
    transition: opacity ${theme.transitions.normal};
  }

  &:hover:not(:disabled) {
    box-shadow: ${theme.shadows.glowHover};
    transform: translateY(-2px);

    &::before {
      opacity: 1;
    }
  }

  span {
    position: relative;
    z-index: 1;
  }
`;
