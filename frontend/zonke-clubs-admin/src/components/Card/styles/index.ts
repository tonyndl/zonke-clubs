import styled, { css } from "styled-components";
import { theme } from "../../../styles/theme";

interface CardProps {
  variant?: "default" | "glass" | "glow";
  interactive?: boolean;
}

export const Card = styled.div<CardProps>`
  background: ${theme.colors.cardBackground};
  border: 1px solid ${theme.colors.cardBorder};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.md};
  transition: all ${theme.transitions.normal};
  position: relative;
  overflow: hidden;

  ${(props) =>
    props.variant === "glass" &&
    css`
      background: ${theme.colors.glass};
      ${theme.effects.backdropBlur.lg}
      border-color: ${theme.colors.glassBorder};
    `}

  ${(props) =>
    props.variant === "glow" &&
    css`
      border-color: ${theme.colors.primary};
      box-shadow: ${theme.shadows.glow};
    `}

  ${(props) =>
    props.interactive &&
    css`
      cursor: pointer;

      &:hover {
        transform: translateY(-2px);
        box-shadow: ${theme.shadows.lg};
        border-color: ${theme.colors.borderHover};
        background: ${theme.colors.cardBackgroundHover};
      }

      &:active {
        transform: translateY(0);
      }
    `}
`;

export const CardHeader = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

export const CardTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.sm};
  line-height: ${theme.typography.lineHeight.tight};
`;

export const CardDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  line-height: ${theme.typography.lineHeight.normal};
`;

export const CardBody = styled.div``;

export const CardFooter = styled.div`
  margin-top: ${theme.spacing.lg};
  padding-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.borderLight};
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: ${theme.spacing.md};
`;

// Specialty card variants
export const GlassCard = styled(Card)`
  background: ${theme.colors.glass};
  ${theme.effects.backdropBlur.lg}
  border-color: ${theme.colors.glassBorder};
`;

export const GradientCard = styled(Card)`
  background: ${theme.gradients.card};
  border-color: ${theme.colors.primary};
  box-shadow: ${theme.shadows.glow};
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: ${theme.gradients.accent};
    opacity: 0.5;
  }
`;
