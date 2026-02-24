import styled from "styled-components";
import { Card } from "../../../../components/Card";
import { theme } from "../../../../styles/theme";

export const SettingsContainer = styled.div`
  width: 100%;
`;

export const PageHeader = styled.div`
  margin-bottom: ${theme.spacing.xl};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

export const HeaderLeft = styled.div``;

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

export const Section = styled.div`
  margin-bottom: ${theme.spacing["2xl"]};
`;

export const SectionHeader = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

export const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize["2xl"]};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  svg {
    width: 24px;
    height: 24px;
    color: ${theme.colors.primary};
  }
`;

export const SectionDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
`;

export const DJGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: ${theme.spacing.md};
`;

export const DJGridItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${theme.spacing.md} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.xl};
  background: ${theme.colors.backgroundCard};
  border: 1px solid ${theme.colors.border};
  transition: all ${theme.transitions.fast};
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: ${theme.borderRadius.xl};
    background: linear-gradient(
      160deg,
      rgba(57, 243, 255, 0.04) 0%,
      transparent 60%
    );
    opacity: 0;
    transition: opacity ${theme.transitions.fast};
    pointer-events: none;
  }

  &:hover::before {
    opacity: 1;
  }

  &:hover {
    border-color: rgba(57, 243, 255, 0.4);
    box-shadow:
      0 0 24px rgba(57, 243, 255, 0.1),
      ${theme.shadows.md};
    transform: translateY(-2px);
  }
`;

export const DJGridAvatar = styled.div<{ image?: string }>`
  width: 62px;
  height: 62px;
  border-radius: ${theme.borderRadius.full};
  background: ${(props) =>
    props.image ? `url(${props.image})` : theme.gradients.primary};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.background};
  margin-bottom: ${theme.spacing.sm};
  border: 2px solid ${theme.colors.border};
  transition:
    border-color ${theme.transitions.fast},
    box-shadow ${theme.transitions.fast};

  ${DJGridItem}:hover & {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 14px rgba(57, 243, 255, 0.35);
  }
`;

export const DJGridName = styled.h3`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 6px;
`;

export const DJGridGenreTag = styled.span`
  font-size: 10px;
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.primary};
  background: rgba(57, 243, 255, 0.1);
  border: 1px solid rgba(57, 243, 255, 0.2);
  border-radius: ${theme.borderRadius.full};
  padding: 2px 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  display: inline-block;
  margin-bottom: ${theme.spacing.xs};
`;

export const DJGridSocials = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: stretch;
  width: 100%;
  margin-bottom: ${theme.spacing.xs};
`;

export const DJGridSocialLink = styled.a<{
  $platform?: "instagram" | "tiktok";
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: ${theme.borderRadius.full};
  background: ${({ $platform }) =>
    $platform === "instagram"
      ? "rgba(225, 48, 108, 0.12)"
      : "rgba(255, 255, 255, 0.06)"};
  border: 1px solid
    ${({ $platform }) =>
      $platform === "instagram"
        ? "rgba(225, 48, 108, 0.25)"
        : "rgba(255, 255, 255, 0.12)"};
  text-decoration: none;
  transition: all ${theme.transitions.fast};
  overflow: hidden;
  min-width: 0;
  text-align: center;

  &:hover {
    background: ${({ $platform }) =>
      $platform === "instagram"
        ? "rgba(225, 48, 108, 0.22)"
        : "rgba(255, 255, 255, 0.12)"};
    transform: translateX(2px);
  }
`;

export const DJGridSocialPlatform = styled.span<{
  $platform?: "instagram" | "tiktok";
}>`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: ${({ $platform }) =>
    $platform === "instagram" ? "#E1306C" : theme.colors.textMuted};

  svg {
    width: 10px;
    height: 10px;
  }
`;

export const DJGridSocialHandle = styled.span`
  font-size: 10px;
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;

export const DJGridActions = styled.div`
  display: flex;
  gap: 6px;
  margin-top: auto;
  padding-top: ${theme.spacing.sm};
`;

export const DJGridEditBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border};
  background: transparent;
  color: ${theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
    background: rgba(57, 243, 255, 0.08);
  }

  svg {
    width: 13px;
    height: 13px;
  }
`;

export const DJGridDeleteBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.errorLight};
  background: transparent;
  color: ${theme.colors.error};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    border-color: ${theme.colors.error};
    background: ${theme.colors.errorLight};
  }

  svg {
    width: 13px;
    height: 13px;
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing["3xl"]};

  svg {
    width: 64px;
    height: 64px;
    color: ${theme.colors.textSecondary};
    margin-bottom: ${theme.spacing.lg};
  }
`;

export const WeekToggleContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.xs};
`;

export const WeekToggleButton = styled.button<{ $active?: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid
    ${(props) => (props.$active ? theme.colors.primary : theme.colors.border)};
  background: ${(props) =>
    props.$active ? `${theme.colors.primary}20` : "transparent"};
  color: ${(props) =>
    props.$active ? theme.colors.primary : theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${(props) =>
    props.$active
      ? theme.typography.fontWeight.semibold
      : theme.typography.fontWeight.normal};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  text-align: center;
  line-height: 1.4;

  &:hover {
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
  }
`;

export const WeekLabel = styled.span`
  display: block;
  font-size: 11px;
  opacity: 0.8;
  font-weight: ${theme.typography.fontWeight.normal};
`;

export const UpcomingBadge = styled.span`
  display: inline-block;
  background: ${theme.colors.primary}30;
  color: ${theme.colors.primary};
  font-size: 10px;
  font-weight: ${theme.typography.fontWeight.semibold};
  padding: 2px 6px;
  border-radius: ${theme.borderRadius.sm};
  margin-left: ${theme.spacing.xs};
  vertical-align: middle;
`;
