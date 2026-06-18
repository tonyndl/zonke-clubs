import styled from "styled-components";
import { theme } from "../../../styles/theme";

export const AutocompleteContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const Input = styled.input`
  padding: ${theme.spacing.md};
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.base};
  font-family: ${theme.typography.fontFamily.base};
  transition: all ${theme.transitions.fast};
  width: 100%;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primaryLight};
  }

  &::placeholder {
    color: ${theme.colors.textSecondary};
  }
`;

export const SuggestionsContainer = styled.div<{
  isOpen: boolean;
  top?: number;
  bottom?: number;
  left: number;
  width: number;
}>`
  position: fixed;
  ${({ top }) => (top !== undefined ? `top: ${top}px;` : "")}
  ${({ bottom }) => (bottom !== undefined ? `bottom: ${bottom}px;` : "")}
  left: ${({ left }) => left}px;
  width: ${({ width }) => width}px;
  background: ${theme.colors.cardBackground};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  max-height: 300px;
  overflow-y: auto;
  z-index: 9999;
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

export const SuggestionItem = styled.div<{ highlighted: boolean }>`
  padding: ${theme.spacing.md};
  cursor: pointer;
  transition: background ${theme.transitions.fast};
  border-bottom: 1px solid ${theme.colors.borderLight};
  background: ${({ highlighted, theme }) =>
    highlighted ? theme.colors.bgSecondary : "transparent"};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.bgSecondary};
  }
`;

export const SuggestionText = styled.div`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
`;

export const NoResults = styled.div`
  padding: ${theme.spacing.md};
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};
  text-align: center;
`;

export const LoadingText = styled(NoResults)`
  color: ${theme.colors.primary};
`;
