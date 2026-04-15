import React from "react";
import styled from "styled-components";
import { RiArrowLeftLine, RiArrowRightLine } from "react-icons/ri";
import { theme } from "../../styles/theme";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Returns the page numbers to display, inserting `null` for ellipsis gaps. */
function buildPageRange(current: number, total: number): (number | null)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | null)[] = [1];

  if (current > 3) pages.push(null); // left ellipsis

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let p = start; p <= end; p++) pages.push(p);

  if (current < total - 2) pages.push(null); // right ellipsis

  pages.push(total);
  return pages;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const pages = buildPageRange(currentPage, totalPages);

  return (
    <Container>
      <NavButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        {React.createElement(RiArrowLeftLine as React.ComponentType)}
        Prev
      </NavButton>

      <PageNumbers>
        {pages.map((p, i) =>
          p === null ? (
            <Ellipsis key={`ellipsis-${i}`}>…</Ellipsis>
          ) : (
            <PageNum
              key={p}
              active={p === currentPage}
              onClick={() => p !== currentPage && onPageChange(p)}
            >
              {p}
            </PageNum>
          ),
        )}
      </PageNumbers>

      <NavButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
        {React.createElement(RiArrowRightLine as React.ComponentType)}
      </NavButton>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.xl};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: linear-gradient(
    135deg,
    rgba(15, 25, 35, 0.4) 0%,
    rgba(15, 25, 35, 0.2) 100%
  );
  border-radius: ${theme.borderRadius.xl};
  border: 1px solid rgba(57, 243, 255, 0.1);
`;

const NavButton = styled.button<{ disabled?: boolean }>`
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  background: ${(p) =>
    p.disabled ? "transparent" : "rgba(57, 243, 255, 0.08)"};
  border: 1px solid
    ${(p) => (p.disabled ? theme.colors.border : "rgba(57, 243, 255, 0.2)")};
  border-radius: ${theme.borderRadius.lg};
  color: ${(p) =>
    p.disabled ? theme.colors.textSecondary : theme.colors.primary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: ${(p) => (p.disabled ? "not-allowed" : "pointer")};
  opacity: ${(p) => (p.disabled ? 0.4 : 1)};
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all ${theme.transitions.fast};

  &:hover:not(:disabled) {
    background: rgba(57, 243, 255, 0.15);
    border-color: rgba(57, 243, 255, 0.4);
  }

  svg {
    width: 15px;
    height: 15px;
  }
`;

const PageNumbers = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PageNum = styled.button<{ active: boolean }>`
  min-width: 34px;
  height: 34px;
  padding: 0 6px;
  border-radius: ${theme.borderRadius.md};
  border: 1px solid
    ${(p) => (p.active ? "rgba(57, 243, 255, 0.6)" : "transparent")};
  background: ${(p) => (p.active ? "rgba(57, 243, 255, 0.15)" : "transparent")};
  color: ${(p) =>
    p.active ? theme.colors.primary : theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${(p) =>
    p.active
      ? theme.typography.fontWeight.bold
      : theme.typography.fontWeight.normal};
  cursor: ${(p) => (p.active ? "default" : "pointer")};
  transition: all ${theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${(p) =>
      p.active ? "rgba(57, 243, 255, 0.15)" : "rgba(255,255,255,0.05)"};
    color: ${(p) =>
      p.active ? theme.colors.primary : theme.colors.textPrimary};
  }
`;

const Ellipsis = styled.span`
  min-width: 28px;
  text-align: center;
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};
  user-select: none;
`;
