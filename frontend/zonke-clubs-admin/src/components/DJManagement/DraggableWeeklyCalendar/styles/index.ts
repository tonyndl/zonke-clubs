import styled from "styled-components";
import { theme } from "../../../../styles/theme";

export const CalendarContainer = styled.div`
  background: ${theme.colors.cardBackground};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.xl};
  overflow: hidden;
  box-shadow: ${theme.shadows.sm};
`;

export const CalendarHeader = styled.div`
  padding: ${theme.spacing.xl};
  background: linear-gradient(
    135deg,
    ${theme.colors.background} 0%,
    ${theme.colors.cardBackground} 100%
  );
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const CalendarTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  background: ${theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  svg {
    width: 24px;
    height: 24px;
    color: ${theme.colors.primary};
    opacity: 1;
    -webkit-text-fill-color: initial;
  }
`;

export const CalendarScrollWrapper = styled.div`
  overflow-x: auto;
  overflow-y: hidden;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${theme.colors.background};
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.primary}40;
    border-radius: ${theme.borderRadius.sm};

    &:hover {
      background: ${theme.colors.primary}60;
    }
  }
`;

export const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(250px, 1fr));
  gap: 0;
  background: ${theme.colors.border};
  border-top: 1px solid ${theme.colors.border};
  min-width: min-content;

  @media (min-width: ${theme.breakpoints.desktop}) {
    grid-template-columns: repeat(7, 1fr);
  }
`;

export const DayColumn = styled.div<{
  isDragOver?: boolean;
  isInvalidDrop?: boolean;
  isSpecialEvent?: boolean;
  isClosed?: boolean;
}>`
  background: ${(props) => {
    if (props.isClosed) {
      return `repeating-linear-gradient(
        -45deg,
        ${theme.colors.background} 0px,
        ${theme.colors.background} 8px,
        ${theme.colors.backgroundGray} 8px,
        ${theme.colors.backgroundGray} 16px
      )`;
    }
    if (props.isInvalidDrop) {
      return `linear-gradient(180deg, rgba(239,68,68,0.08) 0%, ${theme.colors.background} 100%)`;
    }
    if (props.isSpecialEvent) {
      return `linear-gradient(135deg,
        ${theme.colors.primary}08 0%,
        ${theme.colors.background} 50%,
        ${theme.colors.primary}08 100%)`;
    }
    return props.isDragOver
      ? `linear-gradient(180deg, ${theme.colors.primaryLight}20 0%, ${theme.colors.background} 100%)`
      : theme.colors.background;
  }};
  opacity: ${(props) => (props.isClosed ? 0.7 : 1)};
  min-height: 300px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid
    ${(props) =>
      props.isInvalidDrop ? `rgba(239,68,68,0.4)` : theme.colors.border};
  transition: all ${theme.transitions.normal};
  position: relative;
  overflow: visible;

  ${(props) =>
    props.isSpecialEvent &&
    `
    border: 2px solid ${theme.colors.primary}40;
    box-shadow: 0 0 20px ${theme.colors.primary}20, inset 0 0 20px ${theme.colors.primary}05;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: ${theme.gradients.primary};
      animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
  `}

  &:last-child {
    border-right: none;
  }

  &:hover {
    background: ${(props) =>
      props.isSpecialEvent
        ? `linear-gradient(135deg,
            ${theme.colors.primary}12 0%,
            ${theme.colors.cardBackground} 50%,
            ${theme.colors.primary}12 100%)`
        : theme.colors.cardBackground};
  }
`;

export const ClosedBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: 2px ${theme.spacing.sm};
  background: ${theme.colors.backgroundGray};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-top: ${theme.spacing.xs};

  svg {
    width: 12px;
    height: 12px;
    opacity: 0.7;
  }
`;

export const DayHeader = styled.div<{
  isSpecialEvent?: boolean;
  isClosed?: boolean;
}>`
  padding: ${theme.spacing.lg} ${theme.spacing.md};
  background: ${(props) =>
    props.isClosed
      ? theme.colors.backgroundDark
      : props.isSpecialEvent
        ? `linear-gradient(135deg, ${theme.colors.primary}15 0%, ${theme.colors.cardBackground} 100%)`
        : theme.colors.cardBackground};
  border-bottom: 2px solid
    ${(props) =>
      props.isClosed
        ? theme.colors.border
        : props.isSpecialEvent
          ? theme.colors.primary
          : `${theme.colors.primary}40`};
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  height: 110px;
  justify-content: center;
`;

export const DayNameRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xs};
`;

export const TrophyIcon = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.primary};
  animation: glow 2s infinite;

  @keyframes glow {
    0%,
    100% {
      transform: scale(1);
      filter: drop-shadow(0 0 2px ${theme.colors.primary}60);
    }
    50% {
      transform: scale(1.1);
      filter: drop-shadow(0 0 6px ${theme.colors.primary}80);
    }
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const DayName = styled.div<{ isSpecialEvent?: boolean }>`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${(props) =>
    props.isSpecialEvent ? theme.colors.primary : theme.colors.primary};
  text-transform: uppercase;
  letter-spacing: 1px;
  ${(props) =>
    props.isSpecialEvent &&
    `
    background: ${theme.gradients.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  `}
`;

export const DayDate = styled.div<{ isSpecialEvent?: boolean }>`
  font-size: ${theme.typography.fontSize.xs};
  color: ${(props) =>
    props.isSpecialEvent ? theme.colors.primary : theme.colors.textSecondary};
  font-weight: ${(props) =>
    props.isSpecialEvent
      ? theme.typography.fontWeight.semibold
      : theme.typography.fontWeight.normal};
`;

export const EventBadgeText = styled.div`
  font-size: 10px;
  font-weight: ${theme.typography.fontWeight.bold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: pulse 2s infinite;

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

export const DaySlots = styled.div`
  padding: ${theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  flex: 1;
`;

export const SlotCard = styled.div<{
  isDragging?: boolean;
  $borderColor?: string;
}>`
  background: ${({ $borderColor }) =>
    $borderColor
      ? `linear-gradient(160deg, ${$borderColor}0A 0%, ${theme.colors.cardBackground} 55%)`
      : theme.colors.cardBackground};
  border: 1px solid
    ${({ $borderColor }) =>
      $borderColor ? `${$borderColor}28` : theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.md};
  transition: all 0.2s ease;
  position: relative;
  cursor: grab;
  opacity: ${(props) => (props.isDragging ? 0.45 : 1)};
  transform: ${(props) =>
    props.isDragging ? "rotate(3deg) scale(0.97)" : "none"};

  /* Thin top shimmer line in the DJ's color */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 10%;
    right: 10%;
    height: 1px;
    background: ${({ $borderColor }) =>
      $borderColor
        ? `linear-gradient(90deg, transparent, ${$borderColor}90, transparent)`
        : "transparent"};
    border-radius: 0 0 4px 4px;
  }

  &:hover {
    border-color: ${({ $borderColor }) =>
      $borderColor ? `${$borderColor}55` : `${theme.colors.primary}55`};
    transform: translateY(-3px);
    background: ${({ $borderColor }) =>
      $borderColor
        ? `linear-gradient(160deg, ${$borderColor}12 0%, ${theme.colors.cardBackground} 60%)`
        : theme.colors.cardBackground};
    box-shadow: ${({ $borderColor }) =>
      $borderColor
        ? `0 6px 20px ${$borderColor}18, 0 2px 6px rgba(0,0,0,0.25)`
        : `0 6px 20px rgba(0,0,0,0.3)`};

    .quick-actions {
      opacity: 1;
    }
  }

  &:active {
    cursor: grabbing;
  }
`;

export const DragHandle = styled.div`
  position: absolute;
  left: ${theme.spacing.xs};
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.textSecondary};
  opacity: 0.3;
  transition: all ${theme.transitions.fast};

  ${SlotCard}:hover & {
    opacity: 1;
    color: ${theme.colors.primary};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const SlotHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.sm};
  padding-left: ${theme.spacing.lg};
`;

export const DJAvatar = styled.div<{ image?: string; $color?: string }>`
  width: 38px;
  height: 38px;
  border-radius: ${theme.borderRadius.full};
  background: ${({ image, $color }) =>
    image
      ? `url(${image})`
      : $color
        ? `linear-gradient(135deg, ${$color}55 0%, ${$color}22 100%)`
        : `linear-gradient(135deg, ${theme.colors.primary}55 0%, ${theme.colors.secondary}33 100%)`};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid
    ${({ $color }) => ($color ? `${$color}40` : theme.colors.border)};

  svg {
    width: 18px;
    height: 18px;
    color: ${({ $color }) => $color || theme.colors.primary};
    opacity: 0.9;
  }
`;

export const SlotInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const SlotDJ = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const GenreTag = styled.span<{ genre?: string }>`
  display: inline-block;
  padding: 2px ${theme.spacing.xs};
  background: ${(props) => getGenreColor(props.genre)}30;
  color: ${(props) => getGenreColor(props.genre)};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const SlotTime = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding-left: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xs};

  svg {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
  }
`;

export const SlotNotes = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  padding-left: ${theme.spacing.lg};
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.md};
  border-left: 2px solid ${theme.colors.primary};
  font-style: italic;
  line-height: 1.4;
`;

export const QuickActions = styled.div`
  position: absolute;
  top: ${theme.spacing.xs};
  right: ${theme.spacing.xs};
  display: flex;
  gap: ${theme.spacing.xs};
  opacity: 0;
  transition: all ${theme.transitions.fast};
`;

export const ActionButton = styled.button<{
  variant?: "edit" | "delete" | "duplicate";
}>`
  width: 28px;
  height: 28px;
  border-radius: ${theme.borderRadius.md};
  border: none;
  background: ${(props) => {
    if (props.variant === "delete") return theme.colors.error;
    if (props.variant === "edit") return theme.colors.primary;
    return theme.colors.textSecondary;
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  box-shadow: ${theme.shadows.sm};

  &:hover {
    transform: scale(1.15);
    box-shadow: ${theme.shadows.md};
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

export const EmptySlot = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};
  font-style: italic;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  opacity: 0.5;
  transition: all ${theme.transitions.fast};

  ${DayColumn}:hover & {
    opacity: 0.8;
  }

  svg {
    width: 32px;
    height: 32px;
    opacity: 0.3;
  }
`;

export const TimeConflictWarning = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${theme.colors.warning}20;
  border: 1px solid ${theme.colors.warning};
  border-radius: ${theme.borderRadius.sm};
  color: ${theme.colors.warning};
  font-size: ${theme.typography.fontSize.xs};
  margin-top: ${theme.spacing.xs};
  font-weight: ${theme.typography.fontWeight.semibold};

  svg {
    width: 12px;
    height: 12px;
  }
`;

export const QuickAddContainer = styled.div`
  margin-top: auto;
  padding: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border};
  background: ${theme.colors.background};
`;

export const QuickAddButton = styled.button<{ isOpen?: boolean }>`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${(props) =>
    props.isOpen ? theme.colors.primary : "transparent"};
  border: 2px dashed
    ${(props) => (props.isOpen ? theme.colors.primary : theme.colors.border)};
  border-radius: ${theme.borderRadius.lg};
  color: ${(props) => (props.isOpen ? "white" : theme.colors.textSecondary)};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xs};
  white-space: nowrap;

  &:hover {
    border-color: ${theme.colors.primary};
    background: ${(props) =>
      props.isOpen ? theme.colors.primaryDark : theme.colors.primary}20;
    color: ${theme.colors.primary};
    transform: translateY(-1px);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

export const DJDropdown = styled.div`
  margin-top: ${theme.spacing.sm};
  background: ${theme.colors.cardBackground};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  max-height: 200px;
  overflow-y: auto;
  box-shadow: ${theme.shadows.lg};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${theme.colors.background};
    border-radius: ${theme.borderRadius.sm};
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.primary}40;
    border-radius: ${theme.borderRadius.sm};

    &:hover {
      background: ${theme.colors.primary}60;
    }
  }
`;

export const DJOption = styled.button<{ $isScheduled?: boolean }>`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${({ $isScheduled }) =>
    $isScheduled ? `rgba(57, 243, 255, 0.04)` : "transparent"};
  border: none;
  border-bottom: 1px solid ${theme.colors.border};
  color: ${({ $isScheduled }) =>
    $isScheduled ? theme.colors.textSecondary : theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
  text-align: left;
  cursor: ${({ $isScheduled }) => ($isScheduled ? "default" : "pointer")};
  transition: all ${theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  opacity: ${({ $isScheduled }) => ($isScheduled ? 0.65 : 1)};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ $isScheduled }) =>
      $isScheduled ? `rgba(57, 243, 255, 0.04)` : `${theme.colors.primary}20`};
    color: ${({ $isScheduled }) =>
      $isScheduled ? theme.colors.textSecondary : theme.colors.primary};
  }

  svg {
    width: 16px;
    height: 16px;
    color: ${({ $isScheduled }) =>
      $isScheduled ? "#4ade80" : theme.colors.primary};
    flex-shrink: 0;
  }
`;

export const DJOptionInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const DJOptionName = styled.div`
  font-weight: ${theme.typography.fontWeight.semibold};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const DJOptionGenre = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
  margin-top: 2px;
`;

// Palette of muted, sophisticated colors for DJ cards
const DJ_COLORS = [
  "#60A5FA", // soft blue
  "#F472B6", // dusty rose
  "#FBBF24", // warm amber
  "#34D399", // sage green
  "#A78BFA", // soft violet
  "#FB923C", // muted orange
  "#38BDF8", // sky
  "#E879F9", // soft magenta
  "#4ADE80", // mint
  "#F87171", // muted red
  "#2DD4BF", // teal
  "#818CF8", // indigo
];

export function getDJColor(djId: string): string {
  let hash = 0;
  for (let i = 0; i < djId.length; i++) {
    hash = (hash * 31 + djId.charCodeAt(i)) & 0xffffffff;
  }
  return DJ_COLORS[Math.abs(hash) % DJ_COLORS.length];
}

// Helper function needed in styles (used for border colors)
export function getGenreColor(genre?: string): string {
  const genreColors: Record<string, string> = {
    House: "#FF6B9D",
    Techno: "#4ECDC4",
    "Hip Hop": "#FFD93D",
    "R&B": "#95E1D3",
    Afrobeats: "#F38181",
    Amapiano: "#AA96DA",
    Gqom: "#FCBAD3",
    "Deep House": "#A8E6CF",
    Trap: "#FF8B94",
    Electronic: "#C7CEEA",
  };

  const { theme: themeImport } = require("../../../../styles/theme");
  return genreColors[genre || ""] || themeImport.colors.primary;
}
