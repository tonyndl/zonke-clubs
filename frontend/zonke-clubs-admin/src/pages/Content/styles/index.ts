import styled from "styled-components";
import { Card } from "../../../components/Card";
import { theme } from "../../../styles/theme";

export const ContentContainer = styled.div`
  max-width: 1400px;
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

export const HeaderLeft = styled.div`
  position: relative;
  z-index: 1;
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
  max-width: 600px;
`;

export const FilterTabs = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  padding: ${theme.spacing.sm};
  background: linear-gradient(
    135deg,
    rgba(15, 25, 35, 0.6) 0%,
    rgba(15, 25, 35, 0.4) 100%
  );
  backdrop-filter: blur(10px);
  border-radius: ${theme.borderRadius.xl};
  border: 1px solid rgba(57, 243, 255, 0.1);
`;

export const FilterTab = styled.button<{ active?: boolean }>`
  flex: 1;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${(props) =>
    props.active
      ? "linear-gradient(135deg, rgba(57, 243, 255, 0.2) 0%, rgba(57, 243, 255, 0.05) 100%)"
      : "transparent"};
  border: 1px solid
    ${(props) => (props.active ? "rgba(57, 243, 255, 0.3)" : "transparent")};
  border-radius: ${theme.borderRadius.lg};
  color: ${(props) =>
    props.active ? theme.colors.primary : theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${theme.gradients.primary};
    opacity: 0;
    transition: opacity ${theme.transitions.normal};
  }

  &:hover {
    color: ${theme.colors.primary};
    border-color: rgba(57, 243, 255, 0.2);

    &::before {
      opacity: ${(props) => (props.active ? 0 : 0.05)};
    }
  }

  span {
    position: relative;
    z-index: 1;
  }
`;

export const PostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: ${theme.spacing.lg};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const PostCard = styled(Card)`
  display: flex;
  flex-direction: column;
  padding: 0;
  transition: all ${theme.transitions.normal};
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(57, 243, 255, 0.1);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: linear-gradient(
      135deg,
      rgba(57, 243, 255, 0.03) 0%,
      transparent 100%
    );
    opacity: 0;
    transition: opacity ${theme.transitions.normal};
    pointer-events: none;
  }

  &::after {
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
    transform: translateY(-3px);
    box-shadow:
      0 12px 24px rgba(0, 0, 0, 0.3),
      0 0 15px rgba(57, 243, 255, 0.08);
    border-color: rgba(57, 243, 255, 0.3);

    &::before {
      opacity: 1;
    }

    &::after {
      opacity: 1;
    }
  }
`;

export const PostHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: linear-gradient(
    135deg,
    rgba(15, 25, 35, 0.4) 0%,
    rgba(15, 25, 35, 0.2) 100%
  );
  border-bottom: 1px solid rgba(57, 243, 255, 0.1);
`;

export const QuickViewButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${theme.borderRadius.lg};
  background: rgba(57, 243, 255, 0.1);
  border: 1px solid rgba(57, 243, 255, 0.2);
  color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  margin-left: ${theme.spacing.sm};

  &:hover {
    background: rgba(57, 243, 255, 0.2);
    border-color: rgba(57, 243, 255, 0.4);
    transform: scale(1.1);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

export const UserAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.full};
  border: 2px solid rgba(57, 243, 255, 0.3);
  box-shadow: 0 4px 12px rgba(57, 243, 255, 0.2);
  transition: all ${theme.transitions.normal};

  ${PostCard}:hover & {
    border-color: rgba(57, 243, 255, 0.5);
    box-shadow: 0 6px 16px rgba(57, 243, 255, 0.3);
  }
`;

export const UserInfo = styled.div`
  flex: 1;
`;

export const Username = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  margin-bottom: 2px;
  letter-spacing: 0.2px;
`;

export const PostTime = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: 11px;
  color: ${theme.colors.textSecondary};
  font-weight: ${theme.typography.fontWeight.medium};

  svg {
    width: 12px;
    height: 12px;
    opacity: 0.7;
  }
`;

export const StatusBadge = styled.div<{
  status: "pending" | "approved" | "rejected";
}>`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: 6px ${theme.spacing.md};
  border-radius: ${theme.borderRadius.full};
  font-size: 10px;
  font-weight: ${theme.typography.fontWeight.bold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
  background: ${(props) => {
    if (props.status === "approved")
      return "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)";
    if (props.status === "rejected")
      return "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)";
    return "linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%)";
  }};
  border: 1px solid
    ${(props) => {
      if (props.status === "approved") return "rgba(34, 197, 94, 0.3)";
      if (props.status === "rejected") return "rgba(239, 68, 68, 0.3)";
      return "rgba(251, 191, 36, 0.3)";
    }};
  color: ${(props) => {
    if (props.status === "approved") return theme.colors.success;
    if (props.status === "rejected") return theme.colors.error;
    return theme.colors.warning;
  }};
  box-shadow: ${(props) => {
    if (props.status === "approved") return "0 4px 12px rgba(34, 197, 94, 0.2)";
    if (props.status === "rejected") return "0 4px 12px rgba(239, 68, 68, 0.2)";
    return "0 4px 12px rgba(251, 191, 36, 0.2)";
  }};

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      ${(props) => {
        if (props.status === "approved") return "rgba(34, 197, 94, 0.2)";
        if (props.status === "rejected") return "rgba(239, 68, 68, 0.2)";
        return "rgba(251, 191, 36, 0.2)";
      }},
      transparent
    );
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }
`;

export const CountdownTimer = styled.div<{ urgent?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: 6px ${theme.spacing.md};
  border-radius: ${theme.borderRadius.full};
  font-size: 10px;
  font-weight: ${theme.typography.fontWeight.bold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${(props) =>
    props.urgent
      ? "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)"
      : "linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%)"};
  border: 1px solid
    ${(props) =>
      props.urgent ? "rgba(239, 68, 68, 0.3)" : "rgba(251, 191, 36, 0.3)"};
  color: ${(props) =>
    props.urgent ? theme.colors.error : theme.colors.warning};
  box-shadow: ${(props) =>
    props.urgent
      ? "0 4px 12px rgba(239, 68, 68, 0.2)"
      : "0 4px 12px rgba(251, 191, 36, 0.2)"};

  svg {
    width: 12px;
    height: 12px;
  }
`;

export const PostImage = styled.img`
  width: 100%;
  height: 220px;
  object-fit: cover;
  transition: all ${theme.transitions.normal};
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
    filter: brightness(1.1);
  }

  ${PostCard}:hover & {
    transform: scale(1.02);
  }
`;

export const PostVideo = styled.video`
  width: 100%;
  height: 220px;
  object-fit: cover;
  transition: all ${theme.transitions.normal};
  cursor: pointer;
  background: ${theme.colors.bgSecondary};

  &:hover {
    transform: scale(1.05);
    filter: brightness(1.1);
  }

  ${PostCard}:hover & {
    transform: scale(1.02);
  }
`;

export const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
`;

export const PlayIconOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${theme.transitions.normal};

  svg {
    width: 64px;
    height: 64px;
    color: ${theme.colors.primary};
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5));
    opacity: 0.9;
    transition: all ${theme.transitions.normal};
  }

  ${VideoWrapper}:hover & svg {
    transform: scale(1.1);
    opacity: 0.4;
    filter: drop-shadow(0 6px 16px rgba(57, 243, 255, 0.5));
  }
`;

export const PostContent = styled.div`
  padding: ${theme.spacing.md};
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const PostCaption = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textPrimary};
  line-height: 1.6;
  margin-bottom: ${theme.spacing.md};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const LikesDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  margin-bottom: ${theme.spacing.sm};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: rgba(255, 68, 88, 0.1);
  border-radius: ${theme.borderRadius.full};
  width: fit-content;
  border: 1px solid rgba(255, 68, 88, 0.2);

  svg {
    width: 14px;
    height: 14px;
    color: #ff4458;
  }

  span {
    font-size: ${theme.typography.fontSize.xs};
    font-weight: ${theme.typography.fontWeight.semibold};
    color: ${theme.colors.textPrimary};
  }
`;

export const PostActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: auto;
  padding-top: ${theme.spacing.sm};
  border-top: 1px solid rgba(57, 243, 255, 0.1);
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing["3xl"]} ${theme.spacing["2xl"]};
  background: linear-gradient(
    135deg,
    rgba(15, 25, 35, 0.4) 0%,
    rgba(15, 25, 35, 0.2) 100%
  );
  border-radius: ${theme.borderRadius.xl};
  border: 1px solid rgba(57, 243, 255, 0.1);

  svg {
    width: 80px;
    height: 80px;
    color: rgba(57, 243, 255, 0.4);
    margin-bottom: ${theme.spacing.xl};
    opacity: 0.6;
  }
`;

export const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 280px;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: ${(props) => (props.isOpen ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${theme.spacing.lg};
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    left: 0;
  }
`;

export const ModalContainer = styled.div`
  background: ${theme.colors.bgCard};
  border-radius: ${theme.borderRadius.xl};
  border: 1px solid rgba(57, 243, 255, 0.2);
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(57, 243, 255, 0.1);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(40px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${theme.gradients.primary};
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-bottom: 1px solid rgba(57, 243, 255, 0.1);
  background: linear-gradient(
    135deg,
    rgba(15, 25, 35, 0.6) 0%,
    rgba(15, 25, 35, 0.3) 100%
  );
`;

export const ModalTitle = styled.h2`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  background: ${theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${theme.borderRadius.full};
  background: rgba(57, 243, 255, 0.1);
  border: 1px solid rgba(57, 243, 255, 0.2);
  color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${theme.transitions.normal};

  &:hover {
    background: rgba(57, 243, 255, 0.2);
    border-color: rgba(57, 243, 255, 0.4);
    transform: rotate(90deg);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const ModalBody = styled.div`
  padding: ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

export const DetailImage = styled.img`
  width: 100%;
  max-height: 380px;
  object-fit: cover;
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid rgba(57, 243, 255, 0.2);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
`;

export const DetailVideo = styled.video`
  width: 100%;
  max-height: 380px;
  object-fit: cover;
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid rgba(57, 243, 255, 0.2);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  background: ${theme.colors.bgSecondary};
`;

export const DetailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const DetailUserSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: linear-gradient(
    135deg,
    rgba(57, 243, 255, 0.05) 0%,
    rgba(15, 25, 35, 0.3) 100%
  );
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid rgba(57, 243, 255, 0.1);
`;

export const DetailAvatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: ${theme.borderRadius.full};
  border: 2px solid rgba(57, 243, 255, 0.3);
  box-shadow: 0 4px 12px rgba(57, 243, 255, 0.2);
`;

export const DetailUserInfo = styled.div`
  flex: 1;
`;

export const DetailUsername = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  margin-bottom: 2px;
`;

export const DetailTimestamp = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  svg {
    width: 14px;
    height: 14px;
  }
`;

export const DetailLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: ${theme.spacing.xs};
`;

export const DetailCaption = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textPrimary};
  line-height: 1.6;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: rgba(57, 243, 255, 0.03);
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid rgba(57, 243, 255, 0.1);
  white-space: pre-wrap;
`;

export const DetailMetadata = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.md};
`;

export const MetadataItem = styled.div`
  padding: ${theme.spacing.md};
  background: linear-gradient(
    135deg,
    rgba(15, 25, 35, 0.5) 0%,
    rgba(15, 25, 35, 0.3) 100%
  );
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid rgba(57, 243, 255, 0.1);
`;

export const MetadataLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const MetadataValue = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
`;

export const ModalActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg};
  padding-top: 0;
`;

export const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

export const StatCard = styled(Card)`
  padding: ${theme.spacing.xl};
  text-align: center;
  transition: all ${theme.transitions.normal};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }
`;

export const StatValue = styled.div`
  font-size: ${theme.typography.fontSize["3xl"]};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary};
  margin-bottom: ${theme.spacing.sm};
`;

export const StatLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
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
