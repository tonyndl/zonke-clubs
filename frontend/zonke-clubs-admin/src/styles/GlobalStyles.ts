import { createGlobalStyle } from "styled-components";
import { theme } from "./theme";

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
    width: 100%;
  }

  body {
    font-family: ${theme.typography.fontFamily.base};
    font-size: ${theme.typography.fontSize.base};
    line-height: ${theme.typography.lineHeight.normal};
    color: ${theme.colors.text};
    background: ${theme.colors.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${theme.typography.fontFamily.heading};
    font-weight: ${theme.typography.fontWeight.semibold};
    line-height: ${theme.typography.lineHeight.tight};
    color: ${theme.colors.textPrimary};
  }

  h1 {
    font-size: ${theme.typography.fontSize["4xl"]};
    font-weight: ${theme.typography.fontWeight.bold};
  }

  h2 {
    font-size: ${theme.typography.fontSize["3xl"]};
  }

  h3 {
    font-size: ${theme.typography.fontSize["2xl"]};
  }

  h4 {
    font-size: ${theme.typography.fontSize.xl};
  }

  h5 {
    font-size: ${theme.typography.fontSize.lg};
  }

  h6 {
    font-size: ${theme.typography.fontSize.base};
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    transition: color ${theme.transitions.fast};

    &:hover {
      color: ${theme.colors.primaryHover};
    }
  }

  button {
    font-family: ${theme.typography.fontFamily.base};
    cursor: pointer;
    border: none;
    outline: none;
  }

  input, textarea, select {
    font-family: ${theme.typography.fontFamily.base};
    font-size: ${theme.typography.fontSize.base};
    color: ${theme.colors.text};
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.backgroundDark};
    border-radius: ${theme.borderRadius.full};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: ${theme.borderRadius.full};
    transition: background ${theme.transitions.fast};

    &:hover {
      background: ${theme.colors.borderHover};
    }
  }

  /* Selection */
  ::selection {
    background: ${theme.colors.primary};
    color: ${theme.colors.background};
  }

  ::-moz-selection {
    background: ${theme.colors.primary};
    color: ${theme.colors.background};
  }
`;
