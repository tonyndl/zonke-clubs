import styled from "styled-components";
import { theme } from "../../../../styles/theme";

export const CalendarContainer = styled.div`
  background: ${theme.colors.cardBackground};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.xl};
  overflow: hidden;
`;

export const CalendarHeader = styled.div`
  padding: ${theme.spacing.xl};
  background: ${theme.colors.background};
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
`;

export const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: ${theme.colors.border};
  padding: 1px;

  @media (max-width: ${theme.breakpoints.desktop}) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const DayColumn = styled.div`
  background: ${theme.colors.background};
  min-height: 200px;
  display: flex;
  flex-direction: column;
`;

export const DayHeader = styled.div`
  padding: ${theme.spacing.md};
  background: ${theme.colors.cardBackground};
  border-bottom: 2px solid ${theme.colors.border};
  text-align: center;
`;

export const DayName = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const DaySlots = styled.div`
  padding: ${theme.spacing.sm};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  flex: 1;
`;

export const SlotCard = styled.div`
  background: ${theme.colors.cardBackground};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.md};
  transition: all ${theme.transitions.fast};
  position: relative;
  group: hover;

  &:hover {
    border-color: ${theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};

    .delete-button {
      opacity: 1;
    }
  }
`;

export const SlotDJ = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  svg {
    width: 14px;
    height: 14px;
    color: ${theme.colors.primary};
  }
`;

export const SlotTime = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  svg {
    width: 12px;
    height: 12px;
  }
`;

export const SlotNotes = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
  margin-top: ${theme.spacing.xs};
  font-style: italic;
  padding: ${theme.spacing.xs};
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.md};
`;

export const DeleteButton = styled.button`
  position: absolute;
  top: ${theme.spacing.xs};
  right: ${theme.spacing.xs};
  width: 24px;
  height: 24px;
  border-radius: ${theme.borderRadius.md};
  border: none;
  background: ${theme.colors.error};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.errorDark};
    transform: scale(1.1);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

export const EmptySlot = styled.div`
  padding: ${theme.spacing.lg};
  text-align: center;
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.xs};
  font-style: italic;
`;
