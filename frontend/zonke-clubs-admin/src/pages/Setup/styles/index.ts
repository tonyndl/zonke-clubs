import styled from "styled-components";

export const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background};
  background-image:
    radial-gradient(
      circle at 20% 80%,
      rgba(57, 243, 255, 0.08) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 20%,
      rgba(57, 243, 255, 0.06) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 50% 50%,
      rgba(57, 243, 255, 0.03) 0%,
      transparent 70%
    );
  padding: ${({ theme }) => theme.spacing.md};
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      transparent 0%,
      rgba(57, 243, 255, 0.02) 50%,
      transparent 100%
    );
    animation: shimmer 8s ease-in-out infinite;
  }

  @keyframes shimmer {
    0%,
    100% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
  }
`;

export const SetupCard = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing["2xl"]};
  width: 100%;
  max-width: 700px;
  box-shadow:
    0 0 0 1px rgba(57, 243, 255, 0.1),
    0 10px 40px rgba(0, 0, 0, 0.5),
    0 0 80px rgba(57, 243, 255, 0.1);
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
  animation: fadeInUp 0.6s ease-out;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.xl};
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ theme }) => theme.gradients.primary};
    border-radius: ${({ theme }) => theme.borderRadius.xl}
      ${({ theme }) => theme.borderRadius.xl} 0 0;
  }
`;

export const Header = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing["2xl"]};
`;

export const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize["3xl"]};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  background: ${({ theme }) => theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  letter-spacing: -0.5px;
`;

export const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

export const ProgressBar = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

export const ProgressTrack = styled.div`
  width: 100%;
  height: 6px;
  background: ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
`;

export const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  background: ${({ theme }) => theme.gradients.primary};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  width: ${({ $progress }) => $progress}%;
  transition: width ${({ theme }) => theme.transitions.normal};
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;

export const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

export const StepDot = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ theme, $active, $completed }) =>
    $completed
      ? theme.colors.primary
      : $active
        ? theme.colors.primary
        : theme.colors.borderLight};
  opacity: ${({ $active, $completed }) => ($active || $completed ? 1 : 0.5)};
  transition: all ${({ theme }) => theme.transitions.normal};
  transform: ${({ $active }) => ($active ? "scale(1.2)" : "scale(1)")};
  box-shadow: ${({ theme, $active, $completed }) =>
    $active || $completed ? `0 0 8px ${theme.colors.primary}` : "none"};

  ${({ $completed }) =>
    $completed &&
    `
    animation: pulse 0.5s ease-out;
  `}

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.4);
    }
    100% {
      transform: scale(1);
    }
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  animation: slideIn 0.4s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

export const StepTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  &::before {
    content: "";
    width: 4px;
    height: 24px;
    background: ${({ theme }) => theme.gradients.primary};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }
`;

export const StepDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 ${({ theme }) => theme.spacing.xl};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  padding-left: calc(${({ theme }) => theme.spacing.sm} + 4px);
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};
  padding-top: ${({ theme }) => theme.spacing.xl};
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column-reverse;
  }
`;

export const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

export const RadioOption = styled.label<{ $checked: boolean }>`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme, $checked }) =>
    $checked ? theme.colors.bgSecondary : theme.colors.backgroundCard};
  border: 1px solid
    ${({ theme, $checked }) =>
      $checked ? theme.colors.primary : theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  position: relative;

  &:hover {
    background: ${({ theme }) => theme.colors.bgSecondary};
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateX(2px);
  }

  ${({ $checked, theme }) =>
    $checked &&
    `
    box-shadow: 0 0 0 3px rgba(57, 243, 255, 0.1);
  `}

  input[type="radio"] {
    appearance: none;
    width: 20px;
    height: 20px;
    border: 2px solid
      ${({ theme, $checked }) =>
        $checked ? theme.colors.primary : theme.colors.border};
    border-radius: 50%;
    margin-right: ${({ theme }) => theme.spacing.md};
    position: relative;
    cursor: pointer;
    transition: all ${({ theme }) => theme.transitions.fast};
    flex-shrink: 0;

    &:checked::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: ${({ theme }) => theme.colors.primary};
      animation: radioCheck 0.3s ease-out;
    }

    @keyframes radioCheck {
      0% {
        transform: translate(-50%, -50%) scale(0);
      }
      50% {
        transform: translate(-50%, -50%) scale(1.2);
      }
      100% {
        transform: translate(-50%, -50%) scale(1);
      }
    }
  }

  span {
    color: ${({ theme }) => theme.colors.text};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  }
`;
