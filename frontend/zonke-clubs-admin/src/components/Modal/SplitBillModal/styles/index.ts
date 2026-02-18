import styled from "styled-components";
import { theme } from "../../../../styles/theme";

export const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 280px;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
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
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(57, 243, 255, 0.15);
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
    height: 4px;
    background: ${theme.gradients.primary};
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  border-bottom: 1px solid rgba(57, 243, 255, 0.1);
  background: linear-gradient(
    135deg,
    rgba(15, 25, 35, 0.6) 0%,
    rgba(15, 25, 35, 0.3) 100%
  );
`;

export const ModalTitle = styled.h2`
  font-size: ${theme.typography.fontSize["2xl"]};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  background: ${theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  svg {
    width: 28px;
    height: 28px;
    color: ${theme.colors.primary};
    -webkit-text-fill-color: ${theme.colors.primary};
  }
`;

export const CloseButton = styled.button`
  width: 40px;
  height: 40px;
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
    width: 24px;
    height: 24px;
  }
`;

export const ModalBody = styled.div`
  padding: ${theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

export const Label = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  svg {
    width: 18px;
    height: 18px;
    color: ${theme.colors.primary};
  }
`;

export const AmountInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const CurrencySymbol = styled.div`
  position: absolute;
  left: ${theme.spacing.lg};
  font-size: ${theme.typography.fontSize["3xl"]};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary};
  pointer-events: none;
`;

export const AmountInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.lg} ${theme.spacing.lg} ${theme.spacing.lg} 60px;
  font-size: ${theme.typography.fontSize["3xl"]};
  font-weight: ${theme.typography.fontWeight.bold};
  background: linear-gradient(
    135deg,
    rgba(57, 243, 255, 0.05) 0%,
    rgba(15, 25, 35, 0.8) 100%
  );
  border: 2px solid rgba(57, 243, 255, 0.2);
  border-radius: ${theme.borderRadius.xl};
  color: ${theme.colors.textPrimary};
  transition: all ${theme.transitions.normal};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    background: linear-gradient(
      135deg,
      rgba(57, 243, 255, 0.1) 0%,
      rgba(15, 25, 35, 0.9) 100%
    );
    box-shadow: 0 0 0 4px rgba(57, 243, 255, 0.1);
  }

  &::placeholder {
    color: ${theme.colors.textSecondary};
    opacity: 0.5;
  }
`;

export const SearchWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const SearchIcon = styled.div`
  position: absolute;
  left: ${theme.spacing.md};
  color: ${theme.colors.textSecondary};
  pointer-events: none;

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.md} ${theme.spacing.md} 44px;
  background: rgba(57, 243, 255, 0.05);
  border: 1px solid rgba(57, 243, 255, 0.2);
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
  transition: all ${theme.transitions.normal};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    background: rgba(57, 243, 255, 0.08);
  }

  &::placeholder {
    color: ${theme.colors.textSecondary};
  }
`;

export const FriendsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${theme.spacing.sm};
  max-height: 280px;
  overflow-y: auto;
  padding: ${theme.spacing.xs};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(57, 243, 255, 0.05);
    border-radius: ${theme.borderRadius.full};
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.primary};
    border-radius: ${theme.borderRadius.full};
  }
`;

export const FriendCard = styled.label<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md};
  background: ${(props) =>
    props.selected
      ? "linear-gradient(135deg, rgba(57, 243, 255, 0.15) 0%, rgba(15, 25, 35, 0.8) 100%)"
      : "rgba(15, 25, 35, 0.4)"};
  border: 1px solid
    ${(props) =>
      props.selected ? theme.colors.primary : "rgba(57, 243, 255, 0.1)"};
  border-radius: ${theme.borderRadius.lg};
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
    height: 2px;
    background: ${theme.gradients.primary};
    opacity: ${(props) => (props.selected ? 1 : 0)};
    transition: opacity ${theme.transitions.normal};
  }

  &:hover {
    transform: translateY(-2px);
    border-color: ${theme.colors.primary};
    box-shadow: 0 4px 12px rgba(57, 243, 255, 0.2);
  }

  input[type="checkbox"] {
    display: none;
  }
`;

export const FriendAvatar = styled.div<{ avatar?: string }>`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.full};
  background: ${(props) =>
    props.avatar
      ? `url(${props.avatar}) center/cover`
      : theme.gradients.primary};
  border: 2px solid ${theme.colors.primary};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.background};
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: ${theme.typography.fontSize.sm};
`;

export const FriendName = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  flex: 1;
`;

export const CalculationCard = styled.div`
  padding: ${theme.spacing.xl};
  background: linear-gradient(
    135deg,
    rgba(57, 243, 255, 0.1) 0%,
    rgba(138, 43, 226, 0.05) 100%
  );
  border: 2px solid rgba(57, 243, 255, 0.3);
  border-radius: ${theme.borderRadius.xl};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(57, 243, 255, 0.1) 0%,
      transparent 70%
    );
    animation: pulse 3s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
  }
`;

export const CalculationRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
`;

export const CalculationLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: ${theme.typography.fontWeight.semibold};
`;

export const CalculationValue = styled.div<{ highlight?: boolean }>`
  font-size: ${(props) =>
    props.highlight
      ? theme.typography.fontSize["2xl"]
      : theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.extrabold};
  background: ${(props) =>
    props.highlight ? theme.gradients.primary : "none"};
  color: ${(props) =>
    props.highlight ? "transparent" : theme.colors.textPrimary};
  -webkit-background-clip: ${(props) => (props.highlight ? "text" : "none")};
  -webkit-text-fill-color: ${(props) =>
    props.highlight ? "transparent" : theme.colors.textPrimary};
  background-clip: ${(props) => (props.highlight ? "text" : "none")};
`;

export const Divider = styled.div`
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    ${theme.colors.primary},
    transparent
  );
  opacity: 0.3;
  position: relative;
  z-index: 1;
`;

export const NotesInput = styled.textarea`
  width: 100%;
  padding: ${theme.spacing.md};
  background: rgba(57, 243, 255, 0.05);
  border: 1px solid rgba(57, 243, 255, 0.2);
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.sm};
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: all ${theme.transitions.normal};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    background: rgba(57, 243, 255, 0.08);
  }

  &::placeholder {
    color: ${theme.colors.textSecondary};
  }
`;

export const ModalActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.xl};
  padding-top: 0;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};
`;
