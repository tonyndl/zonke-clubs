import styled from "styled-components";
import { Card } from "../../../components/Card";
import { theme } from "../../../styles/theme";

export const DashboardContainer = styled.div`
  max-width: 1400px;
`;

export const PageHeader = styled.div`
  margin-bottom: ${theme.spacing.xl};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${theme.spacing.lg};

  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const HeaderLeft = styled.div``;

export const PageTitle = styled.h1`
  font-size: 48px;
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.sm};
  background: ${theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -1px;
  font-weight: ${theme.typography.fontWeight.bold};
  text-shadow: 0 0 30px rgba(57, 243, 255, 0.3);

  @media (max-width: 1400px) {
    font-size: 36px;
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    font-size: 32px;
  }
`;

export const PageDescription = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.textSecondary};
  opacity: 0.9;
`;

export const HeaderActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;

  @media (max-width: 1024px) {
    width: 100%;

    button {
      flex: 1;
      min-width: 200px;
    }
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-direction: column;

    button {
      width: 100%;
    }
  }
`;

export const HeroSection = styled.div`
  position: relative;
  padding: ${theme.spacing["3xl"]};
  margin-bottom: ${theme.spacing["3xl"]};
  background: linear-gradient(
    135deg,
    rgba(57, 243, 255, 0.2) 0%,
    rgba(138, 43, 226, 0.1) 50%,
    rgba(15, 25, 35, 0.95) 100%
  );
  border-radius: ${theme.borderRadius["2xl"]};
  border: 2px solid ${theme.colors.primary};
  overflow: hidden;
  backdrop-filter: blur(20px);
  box-shadow:
    ${theme.shadows.glow},
    0 0 80px rgba(57, 243, 255, 0.3);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: ${theme.gradients.primary};
    box-shadow: 0 0 30px rgba(57, 243, 255, 0.8);
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(
        circle at 30% 50%,
        rgba(57, 243, 255, 0.15) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 70% 50%,
        rgba(138, 43, 226, 0.1) 0%,
        transparent 50%
      );
    animation: pulse 8s ease-in-out infinite;
    pointer-events: none;
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

export const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.xl};

  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const HeroLeft = styled.div`
  flex: 1;
`;

export const HeroTitle = styled.div`
  font-size: 64px;
  font-weight: ${theme.typography.fontWeight.extrabold};
  background: ${theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -2px;
  margin-bottom: ${theme.spacing.md};
  text-shadow: 0 0 60px rgba(57, 243, 255, 0.5);
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};

  svg {
    width: 56px;
    height: 56px;
    color: ${theme.colors.primary};
    filter: drop-shadow(0 0 20px rgba(57, 243, 255, 0.8));
  }
`;

export const HeroSubtitle = styled.div`
  font-size: ${theme.typography.fontSize["2xl"]};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

export const StatusBadge = styled.div<{ status: "open" | "closed" }>`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: ${(props) =>
    props.status === "open"
      ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
      : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: white;
  box-shadow: 0 0 30px
    ${(props) =>
      props.status === "open"
        ? "rgba(16, 185, 129, 0.5)"
        : "rgba(239, 68, 68, 0.5)"};
  animation: pulse 2s ease-in-out infinite;

  svg {
    width: 24px;
    height: 24px;
  }
`;

export const HeroStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.lg};
  margin-top: ${theme.spacing.xl};

  @media (max-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

export const HeroStatItem = styled.div`
  padding: ${theme.spacing.lg};
  background: rgba(57, 243, 255, 0.08);
  border: 1px solid rgba(57, 243, 255, 0.3);
  border-radius: ${theme.borderRadius.xl};
  backdrop-filter: blur(10px);
`;

export const HeroStatValue = styled.div`
  font-size: ${theme.typography.fontSize["3xl"]};
  font-weight: ${theme.typography.fontWeight.extrabold};
  background: ${theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: ${theme.spacing.xs};
`;

export const HeroStatLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: ${theme.typography.fontWeight.semibold};
`;

export const MainStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing["2xl"]};

  @media (max-width: 1400px) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.md};
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.md};
  }
`;

export const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing["3xl"]};

  @media (max-width: ${theme.breakpoints.desktop}) {
    grid-template-columns: 1fr;
  }
`;

export const StatCard = styled(Card)`
  padding: ${theme.spacing.xl};
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  background: linear-gradient(
    135deg,
    rgba(57, 243, 255, 0.12) 0%,
    rgba(15, 25, 35, 0.95) 100%
  );
  border: 2px solid ${theme.colors.border};
  backdrop-filter: blur(20px);
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @media (max-width: 1400px) {
    padding: ${theme.spacing.lg};
    min-height: 120px;
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing.md};
    min-height: auto;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: ${theme.gradients.primary};
    opacity: 0;
    transition: opacity ${theme.transitions.normal};
  }

  &::after {
    content: "";
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(57, 243, 255, 0.2) 0%,
      transparent 70%
    );
    opacity: 0;
    transition: opacity ${theme.transitions.normal};
    pointer-events: none;
    animation: rotate 20s linear infinite;
  }

  &:hover {
    transform: translateY(-16px) scale(1.03);
    box-shadow:
      ${theme.shadows.glow},
      0 20px 60px rgba(57, 243, 255, 0.3);
    border-color: ${theme.colors.primary};

    &::before {
      opacity: 1;
    }

    &::after {
      opacity: 1;
      animation:
        rotate 20s linear infinite,
        pulse 2s ease-in-out infinite;
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.4;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.15);
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
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
  width: 56px;
  height: 56px;
  border-radius: ${theme.borderRadius.xl};
  background: ${theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: ${theme.colors.background};
  box-shadow:
    ${theme.shadows.glow},
    0 0 40px rgba(57, 243, 255, 0.4);
  animation: iconPulse 3s ease-in-out infinite;
  transition: all ${theme.transitions.normal};

  svg {
    width: 28px;
    height: 28px;
    color: ${theme.colors.background};
  }

  ${StatCard}:hover & {
    transform: scale(1.15) rotate(10deg);
    box-shadow:
      ${theme.shadows.glowHover},
      0 0 60px rgba(57, 243, 255, 0.6);
  }

  @media (max-width: 1400px) {
    width: 48px;
    height: 48px;

    svg {
      width: 24px;
      height: 24px;
    }
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    width: 40px;
    height: 40px;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  @keyframes iconPulse {
    0%,
    100% {
      box-shadow:
        ${theme.shadows.glow},
        0 0 40px rgba(57, 243, 255, 0.4);
    }
    50% {
      box-shadow:
        ${theme.shadows.glowHover},
        0 0 60px rgba(57, 243, 255, 0.6);
    }
  }
`;

export const StatValue = styled.div`
  font-size: 40px;
  font-weight: ${theme.typography.fontWeight.extrabold};
  background: ${theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: ${theme.spacing.sm};
  line-height: 1;
  letter-spacing: -1px;
  transition: all ${theme.transitions.normal};
  text-shadow: 0 0 40px rgba(57, 243, 255, 0.3);

  ${StatCard}:hover & {
    transform: scale(1.08);
    letter-spacing: -2px;
  }

  @media (max-width: 1400px) {
    font-size: 32px;
    margin-bottom: ${theme.spacing.xs};

    ${StatCard}:hover & {
      letter-spacing: -1.5px;
    }
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    font-size: 28px;
  }
`;

export const StatLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.md};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: ${theme.typography.fontWeight.bold};
  opacity: 0.9;

  @media (max-width: 1400px) {
    font-size: ${theme.typography.fontSize.xs};
    margin-bottom: ${theme.spacing.sm};
  }
`;

export const StatChange = styled.div<{ positive?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${(props) =>
    props.positive ? theme.colors.success : theme.colors.error};
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  background: ${(props) =>
    props.positive ? theme.colors.successLight : theme.colors.errorLight};
  border-radius: ${theme.borderRadius.full};
  transition: all ${theme.transitions.normal};

  svg {
    width: 14px;
    height: 14px;
    color: ${(props) =>
      props.positive ? theme.colors.success : theme.colors.error};
  }

  ${StatCard}:hover & {
    transform: scale(1.05);
    box-shadow: ${(props) =>
      props.positive
        ? "0 4px 12px rgba(16, 185, 129, 0.3)"
        : "0 4px 12px rgba(239, 68, 68, 0.3)"};
  }
`;

export const ActivityFeed = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

export const ActivityItem = styled.div`
  padding: ${theme.spacing.lg};
  background: linear-gradient(
    135deg,
    rgba(57, 243, 255, 0.05) 0%,
    rgba(15, 25, 35, 0.8) 100%
  );
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  transition: all ${theme.transitions.normal};
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: ${theme.gradients.primary};
    opacity: 0;
    transition: opacity ${theme.transitions.normal};
  }

  &:hover {
    border-color: ${theme.colors.primary};
    background: linear-gradient(
      135deg,
      rgba(57, 243, 255, 0.1) 0%,
      rgba(15, 25, 35, 0.9) 100%
    );
    transform: translateX(4px);

    &::before {
      opacity: 1;
    }
  }
`;

export const ActivityIcon = styled.div<{
  type: "favorite" | "booking" | "bottle" | "event";
}>`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => {
    switch (props.type) {
      case "favorite":
        return "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
      case "booking":
        return "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)";
      case "bottle":
        return "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
      case "event":
        return theme.gradients.primary;
      default:
        return theme.colors.sidebarActiveBg;
    }
  }};
  box-shadow: 0 4px 12px rgba(57, 243, 255, 0.3);

  svg {
    width: 20px;
    height: 20px;
    color: white;
  }
`;

export const ActivityContent = styled.div`
  flex: 1;
`;

export const ActivityText = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.xs};
`;

export const ActivityTime = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
`;

export const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing.md};
`;

export const QuickActionButton = styled.button`
  padding: ${theme.spacing.lg};
  background: linear-gradient(
    135deg,
    rgba(57, 243, 255, 0.1) 0%,
    rgba(15, 25, 35, 0.8) 100%
  );
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.xl};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  text-align: left;

  svg {
    width: 24px;
    height: 24px;
    color: ${theme.colors.primary};
    transition: all ${theme.transitions.normal};
  }

  &:hover {
    border-color: ${theme.colors.primary};
    background: linear-gradient(
      135deg,
      rgba(57, 243, 255, 0.15) 0%,
      rgba(15, 25, 35, 0.9) 100%
    );
    transform: translateX(8px) scale(1.02);
    box-shadow: ${theme.shadows.glow};

    svg {
      transform: scale(1.2) rotate(5deg);
    }
  }
`;

export const PremiumCard = styled(Card)`
  padding: ${theme.spacing["2xl"]};
  position: relative;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    rgba(57, 243, 255, 0.1) 0%,
    rgba(15, 25, 35, 0.95) 100%
  );
  border: 2px solid ${theme.colors.border};
  transition: all ${theme.transitions.normal};
  backdrop-filter: blur(16px);

  @media (max-width: 1400px) {
    padding: ${theme.spacing.xl};
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing.lg};
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${theme.gradients.primary};
    box-shadow: 0 0 20px rgba(57, 243, 255, 0.5);
  }

  &::after {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(57, 243, 255, 0.12) 0%,
      transparent 70%
    );
    opacity: 0;
    transition: opacity ${theme.transitions.normal};
    pointer-events: none;
    animation: rotate 30s linear infinite;
  }

  &:hover {
    border-color: ${theme.colors.primary};
    box-shadow:
      ${theme.shadows.glow},
      0 12px 48px rgba(57, 243, 255, 0.25);
    transform: translateY(-6px);

    &::after {
      opacity: 1;
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};

  svg {
    width: 24px;
    height: 24px;
    color: ${theme.colors.primary};
  }
`;

export const TableHeader = styled.div`
  padding: ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.border};
`;

export const TableCard = styled(Card)`
  padding: 0;
  overflow: hidden;
`;

export const RecordsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg};
`;

export const SpendersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const SpenderItem = styled.div<{ rank: number }>`
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
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  display: grid;
  grid-template-columns: auto 1.5fr 1fr auto auto;
  gap: ${theme.spacing.xl};
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

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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

export const EmptyLeaderboard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing["3xl"]} ${theme.spacing.xl};
  gap: ${theme.spacing.lg};
  text-align: center;
`;

export const EmptyLeaderboardIcon = styled.div`
  width: 72px;
  height: 72px;
  border-radius: ${theme.borderRadius["2xl"]};
  background: linear-gradient(
    135deg,
    rgba(57, 243, 255, 0.08) 0%,
    rgba(15, 25, 35, 0.9) 100%
  );
  border: 2px dashed rgba(57, 243, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(57, 243, 255, 0.3);

  svg {
    width: 36px;
    height: 36px;
  }
`;

export const EmptyLeaderboardTitle = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  opacity: 0.7;
`;

export const EmptyLeaderboardSubtitle = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  max-width: 320px;
  line-height: 1.6;
`;

export const RankPosition = styled.div<{ direction: "up" | "down" | "same" }>`
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
