import styled from "styled-components";
import { theme } from "../../../styles/theme";

export const Container = styled.div`
  width: 100%;
`;

export const Label = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.sm};
  display: block;
`;

export const UploadArea = styled.div<{
  isDragging: boolean;
  hasImage: boolean;
}>`
  border: 2px dashed
    ${(props) => {
      if (props.isDragging) return theme.colors.primary;
      if (props.hasImage) return theme.colors.border;
      return theme.colors.border;
    }};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  text-align: center;
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  background: ${(props) =>
    props.isDragging ? theme.colors.sidebarActiveBg : theme.colors.background};
  position: relative;

  &:hover {
    border-color: ${theme.colors.primary};
    background: ${theme.colors.sidebarActiveBg};
  }
`;

export const ImagePreview = styled.div`
  position: relative;
  max-width: 400px;
  margin: 0 auto;
`;

export const PreviewImage = styled.img`
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: contain;
  border-radius: ${theme.borderRadius.lg};
`;

export const RemoveButton = styled.button`
  position: absolute;
  top: ${theme.spacing.sm};
  right: ${theme.spacing.sm};
  width: 32px;
  height: 32px;
  border-radius: ${theme.borderRadius.full};
  background: ${theme.colors.error};
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.errorDark};
    transform: scale(1.1);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const UploadIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto ${theme.spacing.md};
  color: ${theme.colors.primary};

  svg {
    width: 100%;
    height: 100%;
  }
`;

export const UploadText = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.xs};
`;

export const UploadHint = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
`;

export const HiddenInput = styled.input`
  display: none;
`;

export const UploadProgress = styled.div`
  margin-top: ${theme.spacing.md};
  text-align: center;
  color: ${theme.colors.primary};
  font-size: ${theme.typography.fontSize.sm};
`;
