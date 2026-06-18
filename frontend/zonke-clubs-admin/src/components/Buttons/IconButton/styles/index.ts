import styled from "styled-components";
import { theme } from "../../../../styles/theme";

export const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.md};
  font-family: ${theme.typography.fontFamily.base};
  font-weight: ${theme.typography.fontWeight.medium};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  background: ${theme.colors.cardBackground};
  color: ${theme.colors.text};
  border: 1px solid ${theme.colors.border};
  aspect-ratio: 1;

  &:hover:not(:disabled) {
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
    background: ${theme.colors.sidebarActiveBg};
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;
