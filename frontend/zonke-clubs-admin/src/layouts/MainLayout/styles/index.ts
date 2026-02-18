import styled from "styled-components";
import { theme } from "../../../styles/theme";

export const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${theme.colors.background};
`;

export const MainContent = styled.main`
  flex: 1;
  margin-left: 280px;
  padding: ${theme.spacing["2xl"]};
  min-height: 100vh;
  position: relative;

  @media (max-width: ${theme.breakpoints.tablet}) {
    margin-left: 0;
    padding: ${theme.spacing.lg};
  }
`;
