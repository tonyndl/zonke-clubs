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
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(57, 243, 255, 0.1);
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.primary};
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

export const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(57, 243, 255, 0.1);
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
  margin-top: ${theme.spacing.sm};
`;

export const ProgressFill = styled.div<{ progress: number }>`
  width: ${(props) => props.progress}%;
  height: 100%;
  background: ${theme.gradients.primary};
  transition: width 0.3s ease;
`;

export const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${theme.spacing.lg};
`;

export const MediaCard = styled(Card)`
  padding: 0;
  overflow: hidden;
  transition: all ${theme.transitions.normal};
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.xl};
  }
`;

export const MediaPreview = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
`;

export const MediaImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
`;

export const MediaVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
`;

export const LikeBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: ${theme.borderRadius.full};
  border: 1px solid rgba(255, 68, 88, 0.3);

  svg {
    width: 16px;
    height: 16px;
    color: #ff4458;
  }
`;

export const LikeCount = styled.span`
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.bold};
`;

export const MediaInfo = styled.div`
  padding: ${theme.spacing.md};
`;

export const MediaName = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.xs};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MediaMeta = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.md};
`;

export const MediaActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
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
