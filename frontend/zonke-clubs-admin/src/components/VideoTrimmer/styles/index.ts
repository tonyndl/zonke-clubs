import styled from "styled-components";
import { theme } from "../../../styles/theme";

export const TRIM_BAR_WIDTH = 560;
export const MAX_DURATION = 30.9; // seconds

export const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(8, 12, 21, 0.88);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.modal};
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  pointer-events: ${(props) => (props.isOpen ? "all" : "none")};
  transition: opacity ${theme.transitions.normal};
  padding: ${theme.spacing.lg};
`;

export const Container = styled.div`
  background: ${theme.colors.backgroundCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius["2xl"]};
  width: 100%;
  max-width: 660px;
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow:
    ${theme.shadows.xl},
    0 0 40px rgba(57, 243, 255, 0.08);
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.border};
  background: linear-gradient(
    135deg,
    rgba(57, 243, 255, 0.04) 0%,
    transparent 100%
  );
`;

export const HeaderTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  svg {
    color: ${theme.colors.primary};
    width: 20px;
    height: 20px;
  }
`;

export const CloseBtn = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(57, 243, 255, 0.06);
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: rgba(239, 68, 68, 0.12);
    border-color: rgba(239, 68, 68, 0.3);
    color: ${theme.colors.error};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

export const Body = styled.div`
  padding: ${theme.spacing.xl};
  overflow-y: auto;
  flex: 1;
  min-height: 0;
`;

export const VideoWrap = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: ${theme.borderRadius.xl};
  overflow: hidden;
  background: #000;
  border: 1px solid ${theme.colors.border};
  margin-bottom: ${theme.spacing.lg};
`;

export const VideoEl = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export const PlayOverlay = styled.button`
  position: absolute;
  inset: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity ${theme.transitions.fast};

  &:hover {
    opacity: 1;
  }

  svg {
    width: 52px;
    height: 52px;
    color: ${theme.colors.primary};
    filter: drop-shadow(0 0 12px rgba(57, 243, 255, 0.6));
  }
`;

export const PlayBtn = styled.button`
  width: 44px;
  height: 44px;
  border-radius: ${theme.borderRadius.full};
  background: rgba(57, 243, 255, 0.12);
  border: 1px solid rgba(57, 243, 255, 0.3);
  color: ${theme.colors.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${theme.transitions.fast};
  flex-shrink: 0;

  &:hover {
    background: rgba(57, 243, 255, 0.2);
    box-shadow: 0 0 16px rgba(57, 243, 255, 0.3);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const TimeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

export const TimeChip = styled.div`
  flex: 1;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.backgroundGray};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border};
  text-align: center;
`;

export const TimeLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
  margin-bottom: 2px;
`;

export const TimeValue = styled.div<{ warn?: boolean }>`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${(props) => (props.warn ? theme.colors.error : theme.colors.primary)};
  font-variant-numeric: tabular-nums;
`;

export const TrimSection = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

export const TrimBarWrap = styled.div`
  position: relative;
  height: 52px;
  background: rgba(57, 243, 255, 0.05);
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  overflow: visible;
  user-select: none;
`;

export const TrimBarTrack = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  transform: translateY(-50%);
  background: rgba(57, 243, 255, 0.12);
  border-radius: ${theme.borderRadius.full};
`;

export const TrimBarSelected = styled.div`
  position: absolute;
  top: 50%;
  height: 4px;
  transform: translateY(-50%);
  background: linear-gradient(90deg, #39f3ff 0%, #7ef9ff 100%);
  border-radius: ${theme.borderRadius.full};
  box-shadow: 0 0 8px rgba(57, 243, 255, 0.4);
`;

export const TrimHandle = styled.div<{ side: "left" | "right" }>`
  position: absolute;
  top: 50%;
  transform: translate(
    ${(props) => (props.side === "left" ? "-50%" : "-50%")},
    -50%
  );
  width: 18px;
  height: 36px;
  background: linear-gradient(180deg, #39f3ff 0%, #1ed9e6 100%);
  border-radius: ${theme.borderRadius.sm};
  cursor: ew-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 0 12px rgba(57, 243, 255, 0.5),
    ${theme.shadows.md};
  z-index: 2;

  &::after {
    content: "";
    display: block;
    width: 2px;
    height: 16px;
    background: rgba(0, 0, 0, 0.35);
    border-radius: 1px;
    box-shadow:
      -3px 0 0 rgba(0, 0, 0, 0.35),
      3px 0 0 rgba(0, 0, 0, 0.35);
  }
`;

export const PlayedFill = styled.div`
  position: absolute;
  top: 50%;
  height: 4px;
  transform: translateY(-50%);
  background: linear-gradient(90deg, #39f3ff 0%, #7ef9ff 100%);
  border-radius: ${theme.borderRadius.full};
  box-shadow: 0 0 6px rgba(57, 243, 255, 0.4);
  pointer-events: none;
  z-index: 1;
  transition: width 0.1s linear;
`;

export const TimelineLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${theme.spacing.xs};
  padding: 0 2px;
`;

export const TimelineLabel = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
  font-variant-numeric: tabular-nums;
`;

export const InfoBanner = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: rgba(57, 243, 255, 0.05);
  border: 1px solid rgba(57, 243, 255, 0.15);
  border-radius: ${theme.borderRadius.lg};
  margin-bottom: ${theme.spacing.lg};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};

  svg {
    color: ${theme.colors.primary};
    flex-shrink: 0;
    width: 14px;
    height: 14px;
  }
`;

export const WarnBanner = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: ${theme.borderRadius.lg};
  margin-bottom: ${theme.spacing.lg};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.error};

  svg {
    flex-shrink: 0;
    width: 14px;
    height: 14px;
  }
`;

export const Footer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  border-top: 1px solid ${theme.colors.border};
`;

export const ProgressWrap = styled.div`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border-top: 1px solid ${theme.colors.border};
  background: rgba(57, 243, 255, 0.03);
`;

export const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.xs};
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(57, 243, 255, 0.1);
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
`;

export const ProgressFill = styled.div<{ pct: number }>`
  width: ${(props) => props.pct}%;
  height: 100%;
  background: linear-gradient(90deg, #39f3ff 0%, #7ef9ff 100%);
  border-radius: ${theme.borderRadius.full};
  transition: width 0.2s ease;
  box-shadow: 0 0 6px rgba(57, 243, 255, 0.5);
`;

export const TrimBtn = styled.button`
  flex: 1;
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: linear-gradient(135deg, #39f3ff 0%, #7ef9ff 100%);
  border: none;
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.background};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.bold};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  transition: all ${theme.transitions.fast};

  &:hover:not(:disabled) {
    box-shadow: 0 0 20px rgba(57, 243, 255, 0.4);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const CancelBtn = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: transparent;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover:not(:disabled) {
    border-color: rgba(57, 243, 255, 0.3);
    color: ${theme.colors.textPrimary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
