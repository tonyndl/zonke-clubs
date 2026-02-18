import styled, { css } from "styled-components";
import { theme } from "../../../styles/theme";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "error" | "info" | "primary";
}

const variants = {
  default: css`
    background: ${theme.colors.backgroundGray};
    color: ${theme.colors.text};
    border: 1px solid ${theme.colors.border};
  `,
  primary: css`
    background: ${theme.colors.sidebarActiveBg};
    color: ${theme.colors.primary};
    border: 1px solid ${theme.colors.primary};
    box-shadow: 0 0 10px rgba(57, 243, 255, 0.2);
  `,
  success: css`
    background: ${theme.colors.successLight};
    color: ${theme.colors.success};
    border: 1px solid ${theme.colors.success}40;
  `,
  warning: css`
    background: ${theme.colors.warningLight};
    color: ${theme.colors.warning};
    border: 1px solid ${theme.colors.warning}40;
  `,
  error: css`
    background: ${theme.colors.errorLight};
    color: ${theme.colors.error};
    border: 1px solid ${theme.colors.error}40;
  `,
  info: css`
    background: ${theme.colors.infoLight};
    color: ${theme.colors.info};
    border: 1px solid ${theme.colors.info}40;
  `,
};

export const Badge = styled.span<BadgeProps>`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  border-radius: ${theme.borderRadius.full};
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all ${theme.transitions.fast};

  ${(props) => variants[props.variant || "default"]}
`;

export const GlowBadge = styled(Badge)`
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
`;
