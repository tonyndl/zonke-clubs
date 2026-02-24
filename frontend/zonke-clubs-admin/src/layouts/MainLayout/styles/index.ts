import styled from "styled-components";
import { theme } from "../../../styles/theme";

export const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: ${theme.colors.background};
`;

export const MainContent = styled.main`
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow-y: auto;
  padding: ${theme.spacing["2xl"]};
  position: relative;
`;
