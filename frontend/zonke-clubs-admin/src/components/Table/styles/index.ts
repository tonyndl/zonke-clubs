import styled from "styled-components";
import { theme } from "../../../styles/theme";

export const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border};
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${theme.colors.cardBackground};
`;

export const TableHead = styled.thead`
  background-color: ${theme.colors.backgroundGray};
`;

export const TableBody = styled.tbody``;

export const TableRow = styled.tr`
  border-bottom: 1px solid ${theme.colors.borderLight};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${theme.colors.backgroundDark};
  }
`;

export const TableHeader = styled.th`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  text-align: left;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text};
  white-space: nowrap;
`;

export const TableCell = styled.td`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
`;

export const EmptyState = styled.div`
  padding: ${theme.spacing["3xl"]} ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.textLight};
`;

export const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${theme.spacing.md};
  opacity: 0.5;
`;

export const EmptyStateText = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.textSecondary};
`;
