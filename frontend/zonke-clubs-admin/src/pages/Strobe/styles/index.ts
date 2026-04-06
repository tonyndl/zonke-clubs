import styled from "styled-components";
import { theme } from "../../../styles/theme";

export const StrobeContainer = styled.div`
  width: 100%;
`;

export const PageHeader = styled.div`
  margin-bottom: ${theme.spacing.xl};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: ${theme.spacing.lg};
  background: linear-gradient(
    135deg,
    rgba(15, 25, 35, 0.5) 0%,
    rgba(15, 25, 35, 0.3) 100%
  );
  backdrop-filter: blur(10px);
  border-radius: ${theme.borderRadius.xl};
  border: 1px solid rgba(57, 243, 255, 0.15);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${theme.gradients.primary};
    opacity: 0.7;
  }
`;

export const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize["3xl"]};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.sm};
  background: ${theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
`;

export const PageDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  line-height: 1.5;
`;

export const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-top: 30px;
`;

export const Badge = styled.span<{ variant: "pending" | "approved" }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  letter-spacing: 0.5px;

  ${({ variant }) =>
    variant === "pending"
      ? `
    background: ${theme.colors.warningLight};
    color: ${theme.colors.warning};
    border: 1px solid ${theme.colors.warning}44;
  `
      : `
    background: ${theme.colors.successLight};
    color: ${theme.colors.success};
    border: 1px solid ${theme.colors.success}44;
  `}
`;

export const ApprovalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.xl};
`;

export const ApprovalCard = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.bgCard};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.borderLight};
  transition: border-color ${theme.transitions.fast};

  &:hover {
    border-color: ${theme.colors.border};
  }
`;

export const Avatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: ${theme.borderRadius.full};
  background: ${theme.colors.backgroundGray};
  border: 1px solid ${theme.colors.borderLight};
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.textSecondary};
  font-size: 18px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const DJInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const DJName = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  margin-bottom: 2px;
`;

export const ExpiresAt = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
`;

export const Actions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  flex-shrink: 0;
`;

export const ApproveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: ${theme.colors.success};
  color: #fff;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: opacity ${theme.transitions.fast};

  &:hover:not(:disabled) {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const RevokeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: transparent;
  color: ${theme.colors.error};
  border: 1px solid ${theme.colors.error}66;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${theme.colors.errorLight};
    border-color: ${theme.colors.error};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing["2xl"]} ${theme.spacing.lg};
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};
  border: 1px dashed ${theme.colors.borderLight};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
`;

export const CountChip = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: ${theme.borderRadius.full};
  background: ${theme.colors.primary};
  color: #000;
  font-size: 11px;
  font-weight: ${theme.typography.fontWeight.bold};
`;
