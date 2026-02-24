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
  padding: ${theme.spacing.lg};
  background: linear-gradient(
    135deg,
    rgba(15, 25, 35, 0.5) 0%,
    rgba(15, 25, 35, 0.3) 100%
  );
  backdrop-filter: blur(10px);
  border-radius: ${theme.borderRadius.xl};
  border: 1px solid rgba(57, 243, 255, 0.15);
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

export const UploadCard = styled(Card)`
  padding: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.xl};
`;

export const UploadArea = styled.div<{ isDragging?: boolean }>`
  padding: ${theme.spacing["3xl"]};
  border: 2px dashed
    ${(props) =>
      props.isDragging ? theme.colors.primary : theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  background: ${(props) =>
    props.isDragging ? "rgba(57, 243, 255, 0.05)" : theme.colors.background};

  &:hover {
    border-color: ${theme.colors.primary};
    background: ${theme.colors.backgroundHover};
  }

  svg {
    width: 48px;
    height: 48px;
    color: ${theme.colors.primary};
    margin-bottom: ${theme.spacing.md};
  }
`;

export const UploadText = styled.p`
  color: ${theme.colors.textPrimary};
  font-weight: ${theme.typography.fontWeight.medium};
  margin-bottom: ${theme.spacing.sm};
`;

export const UploadHint = styled.p`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};
`;

export const SelectedFilesArea = styled.div`
  margin-top: ${theme.spacing.lg};
  padding: ${theme.spacing.lg};
  background: rgba(57, 243, 255, 0.03);
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid rgba(57, 243, 255, 0.1);
`;

export const SelectedFile = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${theme.colors.bgCard};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.sm};

  &:last-child {
    margin-bottom: 0;
  }
`;

export const FileIcon = styled.div`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(57, 243, 255, 0.1);
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.primary};
`;

export const FileThumb = styled.img`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: ${theme.borderRadius.md};
  object-fit: cover;
  border: 1px solid ${theme.colors.border};
`;

export const FileInfo = styled.div`
  flex: 1;
`;

export const FileName = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
`;

export const FileSize = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
`;

export const RemoveButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.error};
  cursor: pointer;
  transition: all ${theme.transitions.normal};

  &:hover {
    background: rgba(239, 68, 68, 0.2);
  }
`;

export const TrimButton = styled.button<{ urgent?: boolean }>`
  height: 32px;
  padding: 0 ${theme.spacing.sm};
  display: flex;
  align-items: center;
  gap: 4px;
  background: ${(p) =>
    p.urgent ? "rgba(245, 158, 11, 0.12)" : "rgba(57, 243, 255, 0.08)"};
  border: 1px solid
    ${(p) =>
      p.urgent ? "rgba(245, 158, 11, 0.35)" : "rgba(57, 243, 255, 0.2)"};
  border-radius: ${theme.borderRadius.md};
  color: ${(p) => (p.urgent ? theme.colors.warning : theme.colors.primary)};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  white-space: nowrap;

  &:hover {
    background: ${(p) =>
      p.urgent ? "rgba(245, 158, 11, 0.2)" : "rgba(57, 243, 255, 0.15)"};
    box-shadow: 0 0 10px
      ${(p) =>
        p.urgent ? "rgba(245, 158, 11, 0.25)" : "rgba(57, 243, 255, 0.2)"};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 13px;
    height: 13px;
  }
`;

export const NeedsTrimBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: ${theme.borderRadius.full};
  color: ${theme.colors.warning};
  font-size: ${theme.typography.fontSize.xs};
  white-space: nowrap;

  svg {
    width: 11px;
    height: 11px;
    flex-shrink: 0;
  }
`;

export const TrimRequiredBanner = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: rgba(245, 158, 11, 0.07);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.warning};
  font-size: ${theme.typography.fontSize.xs};
  margin-top: ${theme.spacing.sm};

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`;

export const CaptionInput = styled.textarea`
  width: 100%;
  padding: ${theme.spacing.md};
  background: ${theme.colors.bgCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  margin-top: ${theme.spacing.md};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }

  &::placeholder {
    color: ${theme.colors.textSecondary};
  }
`;

export const UploadActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
`;

export const ProgressBarWrap = styled.div`
  margin-top: ${theme.spacing.md};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: rgba(57, 243, 255, 0.05);
  border: 1px solid rgba(57, 243, 255, 0.15);
  border-radius: ${theme.borderRadius.md};
`;

export const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(57, 243, 255, 0.12);
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
`;

export const ProgressFill = styled.div<{ progress: number }>`
  width: ${(props) => props.progress}%;
  height: 100%;
  background: ${theme.gradients.primary};
  border-radius: ${theme.borderRadius.full};
  transition: width 0.3s ease;
  box-shadow: 0 0 8px rgba(57, 243, 255, 0.5);
`;

export const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: ${theme.spacing.md};
`;

export const MediaCard = styled.div`
  border-radius: ${theme.borderRadius.xl};
  overflow: hidden;
  cursor: pointer;
  position: relative;
  background: ${theme.colors.backgroundCard};
  border: 1px solid ${theme.colors.border};
  transition: all ${theme.transitions.normal};

  &:hover {
    border-color: rgba(57, 243, 255, 0.3);
    box-shadow:
      0 0 24px rgba(57, 243, 255, 0.1),
      ${theme.shadows.lg};
    transform: translateY(-3px);
  }
`;

export const MediaPreview = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
`;

export const MediaImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform ${theme.transitions.normal};

  ${MediaCard}:hover & {
    transform: scale(1.04);
  }
`;

export const MediaVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform ${theme.transitions.normal};

  ${MediaCard}:hover & {
    transform: scale(1.04);
  }
`;

export const MediaOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(8, 12, 21, 0.95) 0%,
    rgba(8, 12, 21, 0.4) 50%,
    transparent 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: ${theme.spacing.md};
  opacity: 0;
  transition: opacity ${theme.transitions.normal};

  ${MediaCard}:hover & {
    opacity: 1;
  }
`;

export const MediaOverlayIcon = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -60%);
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.full};
  background: rgba(57, 243, 255, 0.15);
  border: 1px solid rgba(57, 243, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.primary};
  transition: all ${theme.transitions.fast};

  svg {
    width: 18px;
    height: 18px;
  }

  ${MediaCard}:hover & {
    background: rgba(57, 243, 255, 0.25);
    transform: translate(-50%, -50%);
  }
`;

export const MediaCaption = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 3px;
`;

export const MediaDate = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
`;

export const LikeBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  border-radius: ${theme.borderRadius.full};
  border: 1px solid rgba(255, 68, 88, 0.35);
  z-index: 1;

  svg {
    width: 13px;
    height: 13px;
    color: #ff4458;
  }
`;

export const LikeCount = styled.span`
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.bold};
`;

export const MediaActionBar = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  margin-top: ${theme.spacing.sm};
  justify-content: flex-end;
`;

export const MediaActionBtn = styled.button<{ danger?: boolean }>`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.md};
  border: 1px solid
    ${(p) => (p.danger ? "rgba(239,68,68,0.4)" : "rgba(57,243,255,0.3)")};
  background: ${(p) =>
    p.danger ? "rgba(239,68,68,0.15)" : "rgba(57,243,255,0.1)"};
  color: ${(p) => (p.danger ? theme.colors.error : theme.colors.primary)};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  flex-shrink: 0;

  &:hover {
    background: ${(p) =>
      p.danger ? "rgba(239,68,68,0.25)" : "rgba(57,243,255,0.2)"};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

export const EditCaptionOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(8, 12, 21, 0.75);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.modal};
  padding: ${theme.spacing.lg};
`;

export const EditCaptionBox = styled.div`
  background: ${theme.colors.backgroundCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius["2xl"]};
  padding: ${theme.spacing.xl};
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

export const EditCaptionTitle = styled.h4`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

export const EditCaptionActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  justify-content: flex-end;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing["3xl"]} ${theme.spacing.xl};

  svg {
    width: 64px;
    height: 64px;
    color: rgba(57, 243, 255, 0.3);
    margin-bottom: ${theme.spacing.lg};
  }
`;

export const DeleteConfirmBox = styled.div`
  background: ${theme.colors.backgroundCard};
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: ${theme.borderRadius["2xl"]};
  padding: ${theme.spacing.xl};
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  text-align: center;
`;

export const DeleteConfirmIcon = styled.div`
  width: 52px;
  height: 52px;
  border-radius: ${theme.borderRadius.full};
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.error};
  margin-bottom: ${theme.spacing.xs};

  svg {
    width: 24px;
    height: 24px;
  }
`;

export const DeleteConfirmText = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  line-height: 1.6;
  margin: 0;
`;

export const DangerButton = styled.button`
  height: 40px;
  padding: 0 ${theme.spacing.lg};
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.error};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${theme.transitions.normal};

  &:hover {
    background: rgba(239, 68, 68, 0.25);
    border-color: rgba(239, 68, 68, 0.6);
    box-shadow: 0 0 12px rgba(239, 68, 68, 0.2);
  }
`;

export const LightboxOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(5, 8, 15, 0.92);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.modal};
  padding: ${theme.spacing.xl};
  gap: ${theme.spacing.md};
`;

export const LightboxClose = styled.button`
  position: fixed;
  top: ${theme.spacing.lg};
  right: ${theme.spacing.lg};
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.full};
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: ${theme.colors.textPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  z-index: 1;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

export const LightboxMedia = styled.div`
  max-width: min(90vw, 960px);
  max-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.xl};
  overflow: hidden;
`;

export const LightboxImage = styled.img`
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: ${theme.borderRadius.xl};
  display: block;
`;

export const LightboxVideo = styled.video`
  max-width: 100%;
  max-height: 80vh;
  border-radius: ${theme.borderRadius.xl};
  display: block;
  outline: none;
`;

export const LightboxInfo = styled.div`
  max-width: min(90vw, 960px);
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: rgba(15, 25, 35, 0.6);
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid rgba(57, 243, 255, 0.1);
`;

export const LightboxCaption = styled.p`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

export const LightboxMeta = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
  display: flex;
  align-items: center;
`;
