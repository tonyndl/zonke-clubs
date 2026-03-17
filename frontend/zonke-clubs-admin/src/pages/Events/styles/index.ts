import styled from "styled-components";
import { Card } from "../../../components/Card";
import { theme } from "../../../styles/theme";

export const EventsContainer = styled.div`
  max-width: 1400px;
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

export const HeaderActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
`;

export const FilterTabs = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border};
`;

export const FilterTab = styled.button<{ active?: boolean }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: none;
  border: none;
  color: ${(props) =>
    props.active ? theme.colors.primary : theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${(props) =>
    props.active
      ? theme.typography.fontWeight.semibold
      : theme.typography.fontWeight.normal};
  cursor: pointer;
  border-bottom: 2px solid
    ${(props) => (props.active ? theme.colors.primary : "transparent")};
  transition: all ${theme.transitions.fast};

  &:hover {
    color: ${theme.colors.primary};
  }
`;

export const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${theme.spacing.lg};
`;

export const EventCard = styled(Card)`
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  transition: all ${theme.transitions.normal};
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${theme.gradients.primary};
    opacity: 0;
    transition: opacity ${theme.transitions.normal};
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.xl};

    &::before {
      opacity: 1;
    }
  }
`;

export const EventImage = styled.div`
  width: 100%;
  height: 200px;
  background-color: ${theme.colors.sidebarActiveBg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.textSecondary};
  font-size: 48px;
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60%;
    background: linear-gradient(
      to top,
      ${theme.colors.cardBackground} 0%,
      transparent 100%
    );
    pointer-events: none;
  }
`;

export const EventCoverImg = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
`;

export const EventContent = styled.div`
  padding: ${theme.spacing.xl};
`;

export const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: ${theme.spacing.md};
`;

export const EventTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.xs};
`;

export const EventMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  margin-bottom: ${theme.spacing.md};
`;

export const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};

  svg {
    width: 16px;
    height: 16px;
    color: ${theme.colors.primary};
  }
`;

export const StatusBadge = styled.div<{ status: "published" | "draft" }>`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  background: ${(props) =>
    props.status === "published"
      ? theme.colors.successLight
      : theme.colors.warningLight};
  color: ${(props) =>
    props.status === "published" ? theme.colors.success : theme.colors.warning};
  text-transform: capitalize;
`;

export const EventFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border};
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

export const EventActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.xl};
  padding: ${theme.spacing.lg};
  background: linear-gradient(
    135deg,
    rgba(15, 25, 35, 0.4) 0%,
    rgba(15, 25, 35, 0.2) 100%
  );
  border-radius: ${theme.borderRadius.xl};
  border: 1px solid rgba(57, 243, 255, 0.1);
`;

export const PageButton = styled.button<{ disabled?: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${(props) =>
    props.disabled ? "transparent" : "rgba(57, 243, 255, 0.1)"};
  border: 1px solid
    ${(props) =>
      props.disabled ? theme.colors.border : "rgba(57, 243, 255, 0.2)"};
  border-radius: ${theme.borderRadius.lg};
  color: ${(props) =>
    props.disabled ? theme.colors.textSecondary : theme.colors.primary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all ${theme.transitions.normal};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};

  &:hover {
    background: ${(props) =>
      props.disabled ? "transparent" : "rgba(57, 243, 255, 0.2)"};
    border-color: ${(props) =>
      props.disabled ? theme.colors.border : "rgba(57, 243, 255, 0.4)"};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const PageInfo = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textPrimary};
  font-weight: ${theme.typography.fontWeight.medium};
`;
