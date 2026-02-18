import styled from "styled-components";
import { Card } from "../../../../components/Card";
import { theme } from "../../../../styles/theme";

export const SettingsContainer = styled.div`
  max-width: 1200px;
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

export const DJCard = styled(Card)`
  padding: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.lg};
  transition: all ${theme.transitions.normal};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }
`;

export const DJHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const DJInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

export const DJAvatar = styled.div<{ image?: string }>`
  width: 60px;
  height: 60px;
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
`;

export const DJDetails = styled.div``;

export const DJName = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.xs};
`;

export const DJMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
`;

export const DJGenre = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  svg {
    width: 14px;
    height: 14px;
  }
`;

export const DJSocial = styled.a`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.primary};
  text-decoration: none;
  transition: all ${theme.transitions.fast};

  &:hover {
    text-decoration: underline;
  }
`;

export const DJBio = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  margin-top: ${theme.spacing.md};
  line-height: 1.5;
`;

export const DJActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
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
