import styled from "styled-components";

// ─── Page shell ───────────────────────────────────────────────────────────────

export const PageContainer = styled.div`
  height: 100vh;
  display: flex;
  overflow: hidden;
  background: #070c16;
`;

// ─── Left brand panel ─────────────────────────────────────────────────────────

export const BrandPanel = styled.div`
  flex: 0 0 42%;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Dot grid */
  background-color: #060b14;
  background-image: radial-gradient(
    circle,
    rgba(57, 243, 255, 0.14) 1px,
    transparent 1px
  );
  background-size: 26px 26px;

  /* Radial vignette — fades the dot grid at edges */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse 85% 85% at 50% 50%,
      transparent 20%,
      #060b14 80%
    );
    z-index: 1;
  }

  /* Bottom-center glow */
  &::after {
    content: "";
    position: absolute;
    bottom: -120px;
    left: 50%;
    transform: translateX(-50%);
    width: 480px;
    height: 360px;
    background: radial-gradient(
      ellipse,
      rgba(57, 243, 255, 0.18) 0%,
      transparent 68%
    );
    z-index: 0;
    animation: breathe 5s ease-in-out infinite;
  }

  @keyframes breathe {
    0%,
    100% {
      opacity: 0.7;
      transform: translateX(-50%) scale(1);
    }
    50% {
      opacity: 1;
      transform: translateX(-50%) scale(1.08);
    }
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

export const BrandContent = styled.div`
  position: relative;
  z-index: 2;
  padding: 3rem 3rem 3rem 3.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 380px;
  width: 100%;
`;

export const BrandLogoIcon = styled.div`
  width: 68px;
  height: 68px;
  margin-bottom: 1.75rem;
  background: linear-gradient(135deg, #39f3ff 0%, #0bc8d8 100%);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  font-weight: 800;
  color: #060b14;
  box-shadow:
    0 0 0 1px rgba(57, 243, 255, 0.25),
    0 8px 32px rgba(57, 243, 255, 0.35),
    0 0 80px rgba(57, 243, 255, 0.15);
  animation: float 4s ease-in-out infinite;

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-7px);
    }
  }
`;

export const BrandTitle = styled.h1`
  font-size: 2.125rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.5rem;
  letter-spacing: -0.75px;
  line-height: 1.15;
`;

export const BrandTagline = styled.p`
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.42);
  margin: 0 0 2.25rem;
  line-height: 1.65;
`;

export const BrandDivider = styled.div`
  width: 36px;
  height: 2px;
  background: linear-gradient(90deg, #39f3ff, transparent);
  border-radius: 2px;
  margin-bottom: 1.75rem;
`;

export const BrandFeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const BrandFeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.4;

  &::before {
    content: "✓";
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(57, 243, 255, 0.1);
    border: 1px solid rgba(57, 243, 255, 0.35);
    color: #39f3ff;
    font-size: 10px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
`;

// ─── Right form panel ─────────────────────────────────────────────────────────

export const FormPanel = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0b1221;
  overflow-y: auto;
  padding: 2rem;
  position: relative;

  /* Left separator line */
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 12%;
    bottom: 12%;
    width: 1px;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(57, 243, 255, 0.25) 35%,
      rgba(57, 243, 255, 0.25) 65%,
      transparent
    );
  }
`;

export const FormInner = styled.div`
  width: 100%;
  max-width: 400px;
  animation: fadeInUp 0.5s ease-out;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(18px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const FormHeading = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.375rem;
  letter-spacing: -0.5px;
`;

export const FormSubheading = styled.p`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.38);
  margin: 0 0 2rem;
  line-height: 1.5;
`;

export const TabContainer = styled.div`
  display: flex;
  gap: 0.3rem;
  margin-bottom: 1.75rem;
  background: rgba(255, 255, 255, 0.03);
  padding: 0.25rem;
  border-radius: 0.625rem;
  border: 1px solid rgba(255, 255, 255, 0.07);
`;

export const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 0.625rem 1rem;
  background: ${({ $active }) =>
    $active
      ? "linear-gradient(135deg, rgba(57,243,255,0.14), rgba(57,243,255,0.07))"
      : "transparent"};
  border: ${({ $active }) =>
    $active ? "1px solid rgba(57,243,255,0.22)" : "1px solid transparent"};
  color: ${({ $active }) => ($active ? "#39f3ff" : "rgba(255,255,255,0.38)")};
  font-size: 0.875rem;
  font-weight: ${({ $active }) => ($active ? 600 : 500)};
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 0.4rem;
  letter-spacing: 0.1px;

  &:hover {
    color: ${({ $active }) => !$active && "rgba(255,255,255,0.65)"};
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: fadeIn 0.35s ease-out;

  /* Zero out FormGroup's built-in margin */
  & > div {
    margin-bottom: 0;
  }

  /* Labels */
  & label {
    font-size: 0.8125rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    letter-spacing: 0.15px;
    margin-bottom: 0.4rem;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const PasswordWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const EyeButton = styled.button`
  position: absolute;
  right: 0.875rem;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.35);
  display: flex;
  align-items: center;
  transition: color 0.2s;

  &:hover {
    color: rgba(255, 255, 255, 0.7);
  }
`;

/* Standalone input styled for auth page */
export const AuthInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.625rem;
  padding: 0.8125rem 2.75rem 0.8125rem 1rem;
  font-size: 0.9375rem;
  color: #ffffff;
  font-family: inherit;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    background 0.2s;

  &::placeholder {
    color: rgba(255, 255, 255, 0.22);
  }

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.065);
    border-color: rgba(255, 255, 255, 0.18);
  }

  &:focus {
    background: rgba(57, 243, 255, 0.05);
    border-color: rgba(57, 243, 255, 0.45);
    box-shadow: 0 0 0 3px rgba(57, 243, 255, 0.09);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:invalid:not(:placeholder-shown) {
    border-color: rgba(239, 68, 68, 0.45);
  }
`;

export const ErrorMessage = styled.div`
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.28);
  border-radius: 0.625rem;
  color: #f87171;
  font-size: 0.8125rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &::before {
    content: "⚠";
    font-size: 13px;
    flex-shrink: 0;
  }
`;

export const SuccessMessage = styled.div`
  padding: 0.75rem 1rem;
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.28);
  border-radius: 0.625rem;
  color: #4ade80;
  font-size: 0.8125rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &::before {
    content: "✓";
    font-size: 13px;
    font-weight: 700;
    flex-shrink: 0;
  }
`;

export const HelperText = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.8125rem;
  margin-top: 1.25rem;
  font-weight: 500;
`;
