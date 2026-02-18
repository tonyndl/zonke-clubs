import styled from "styled-components";
import { Card } from "../../../components/Card";
import { theme } from "../../../styles/theme";

export const SpendingContainer = styled.div`
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

export const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

export const StatCard = styled(Card)`
  padding: ${theme.spacing.xl};
  position: relative;
  overflow: hidden;
  transition: all ${theme.transitions.normal};

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

export const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.md};
`;

export const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.sidebarActiveBg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.primary};
  font-size: 24px;

  svg {
    width: 24px;
    height: 24px;
  }
`;

export const StatValue = styled.div`
  font-size: ${theme.typography.fontSize["3xl"]};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.xs};
`;

export const StatLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
`;

export const TableCard = styled(Card)`
  padding: 0;
  overflow: hidden;
`;

export const TableHeader = styled.div`
  padding: ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.border};
`;

export const FilterSection = styled.div`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.border};
  background: ${theme.colors.background};
  display: flex;
  gap: ${theme.spacing.xl};
  align-items: center;
  flex-wrap: wrap;
`;

export const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

export const FilterLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
`;

export const FilterTabs = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  flex-wrap: wrap;
`;

export const FilterTab = styled.button<{ active: boolean }>`
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  background: ${(props) =>
    props.active ? theme.colors.primary : theme.colors.sidebarActiveBg};
  border: 1px solid
    ${(props) => (props.active ? theme.colors.primary : theme.colors.border)};
  border-radius: ${theme.borderRadius.full};
  color: ${(props) =>
    props.active ? theme.colors.background : theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    border-color: ${theme.colors.primary};
  }
`;

export const RecordsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg};
`;

export const RecordCard = styled.div<{ rank: number }>`
  background: ${(props) => {
    if (props.rank === 1)
      return `linear-gradient(135deg, rgba(57, 243, 255, 0.15) 0%, rgba(15, 25, 35, 0.98) 50%, rgba(15, 25, 35, 1) 100%)`;
    if (props.rank === 2)
      return `linear-gradient(135deg, rgba(192, 192, 192, 0.1) 0%, rgba(15, 25, 35, 0.98) 50%, rgba(15, 25, 35, 1) 100%)`;
    if (props.rank === 3)
      return `linear-gradient(135deg, rgba(205, 127, 50, 0.1) 0%, rgba(15, 25, 35, 0.98) 50%, rgba(15, 25, 35, 1) 100%)`;
    return `linear-gradient(135deg, rgba(57, 243, 255, 0.03) 0%, rgba(15, 25, 35, 1) 100%)`;
  }};
  border: 1px solid
    ${(props) =>
      props.rank === 1 ? theme.colors.primary : theme.colors.border};
  border-radius: ${theme.borderRadius["2xl"]};
  padding: ${theme.spacing.md};
  display: grid;
  grid-template-columns: auto 1fr 260px auto;
  gap: ${theme.spacing.md};
  align-items: center;
  transition: all ${theme.transitions.normal};
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);

  ${(props) =>
    props.rank === 1 &&
    `
    box-shadow: ${theme.shadows.glow}, 0 8px 32px rgba(57, 243, 255, 0.2);

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: ${theme.gradients.primary};
    }

    &::after {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(57, 243, 255, 0.1) 0%, transparent 70%);
      pointer-events: none;
    }
  `}

  &:hover {
    transform: translateY(-6px) scale(1.01);
    box-shadow:
      ${theme.shadows.xl},
      0 12px 40px rgba(57, 243, 255, 0.15);
    border-color: ${theme.colors.primary};

    &::before {
      height: 5px;
    }
  }

  @media (max-width: ${theme.breakpoints.desktop}) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.md};
  }
`;

export const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

export const UserAvatar = styled.img<{ rank: number }>`
  width: 48px;
  height: 48px;
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid
    ${(props) => {
      if (props.rank === 1) return theme.colors.primary;
      if (props.rank === 2) return "#c0c0c0";
      if (props.rank === 3) return "#cd7f32";
      return theme.colors.border;
    }};
  box-shadow: ${(props) =>
    props.rank === 1 ? theme.shadows.glow : theme.shadows.md};
  transition: all ${theme.transitions.normal};

  &:hover {
    transform: scale(1.1);
  }
`;

export const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Username = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
`;

export const UserId = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
  font-family: ${theme.typography.fontFamily.mono};
`;

export const RankBadge = styled.div<{ rank: number }>`
  width: 44px;
  height: 44px;
  border-radius: ${theme.borderRadius.lg};
  background: ${(props) => {
    if (props.rank === 1) return theme.gradients.primary;
    if (props.rank === 2)
      return "linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)";
    if (props.rank === 3)
      return "linear-gradient(135deg, #cd7f32 0%, #f4a460 100%)";
    return theme.colors.sidebarActiveBg;
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography.fontWeight.extrabold};
  color: ${(props) =>
    props.rank <= 3 ? theme.colors.background : theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.lg};
  box-shadow: ${(props) =>
    props.rank === 1 ? theme.shadows.glow : theme.shadows.md};
  transition: all ${theme.transitions.normal};

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    transform: rotate(5deg) scale(1.1);
  }
`;

export const NightSpendSection = styled.div<{ isTop?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: ${theme.spacing.md};
  background: ${(props) =>
    props.isTop
      ? `linear-gradient(135deg, rgba(57, 243, 255, 0.15) 0%, rgba(15, 25, 35, 0.8) 100%)`
      : `linear-gradient(135deg, rgba(57, 243, 255, 0.05) 0%, rgba(15, 25, 35, 0.8) 100%)`};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid
    ${(props) => (props.isTop ? theme.colors.primary : theme.colors.border)};
  position: relative;
  overflow: hidden;
  min-width: 200px;

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: ${(props) =>
      props.isTop
        ? `radial-gradient(circle at top right, rgba(57, 243, 255, 0.2), transparent 50%)`
        : "none"};
    animation: ${(props) =>
      props.isTop ? "pulse 3s ease-in-out infinite" : "none"};
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
  }
`;

export const NightLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: ${theme.typography.fontWeight.bold};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  position: relative;
  z-index: 1;

  &::before {
    content: "🔥";
    font-size: 14px;
  }
`;

export const NightAmount = styled.div<{ isTop?: boolean }>`
  font-size: ${(props) =>
    props.isTop
      ? theme.typography.fontSize["3xl"]
      : theme.typography.fontSize["2xl"]};
  font-weight: ${theme.typography.fontWeight.extrabold};
  background: ${(props) =>
    props.isTop
      ? theme.gradients.primary
      : `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.textPrimary} 100%)`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  z-index: 1;
  text-shadow: ${(props) =>
    props.isTop ? "0 0 30px rgba(57, 243, 255, 0.5)" : "none"};
  letter-spacing: -0.5px;
  min-height: 40px;
  display: flex;
  align-items: center;
`;

export const NightDate = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.primary};
  font-weight: ${theme.typography.fontWeight.semibold};
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  &::before {
    content: "📅";
    font-size: 10px;
  }
`;

export const NightTag = styled.div<{ type: "vip" | "bottle" | "regular" }>`
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.bold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 1;
  width: fit-content;

  ${(props) => {
    if (props.type === "vip") {
      return `
        background: ${theme.gradients.primary};
        color: ${theme.colors.background};
        box-shadow: 0 0 20px rgba(57, 243, 255, 0.5);
      `;
    } else if (props.type === "bottle") {
      return `
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        color: ${theme.colors.background};
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
      `;
    } else {
      return `
        background: ${theme.colors.sidebarActiveBg};
        color: ${theme.colors.textSecondary};
        border: 1px solid ${theme.colors.border};
      `;
    }
  }}
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.md};

  @media (max-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

export const MiniStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: ${theme.spacing.sm};
  background: rgba(57, 243, 255, 0.05);
  border-radius: ${theme.borderRadius.md};
  border: 1px solid rgba(57, 243, 255, 0.1);
`;

export const MiniStatLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: ${theme.typography.fontWeight.semibold};
`;

export const MiniStatValue = styled.div<{ highlight?: boolean }>`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${(props) =>
    props.highlight ? theme.colors.primary : theme.colors.textPrimary};
`;

export const RankPosition = styled.div<{
  direction: "up" | "down" | "same" | "new";
}>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.bold};
  padding: 4px ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  background: ${(props) => {
    if (props.direction === "up")
      return "linear-gradient(135deg, #10b981 0%, #059669 100%)";
    if (props.direction === "down")
      return "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
    if (props.direction === "new")
      return "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
    return theme.colors.sidebarActiveBg;
  }};
  color: ${(props) =>
    props.direction !== "same"
      ? theme.colors.background
      : theme.colors.textSecondary};
  width: fit-content;
  box-shadow: ${(props) =>
    props.direction !== "same" ? theme.shadows.md : "none"};

  svg {
    width: 14px;
    height: 14px;
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
