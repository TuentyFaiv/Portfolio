import styled, { css } from 'styled-components';

export const Container = styled.div`
  min-height: 100vh;
  ${({ native }) => native && css`padding: 0 0 8.5vh;`}
  overflow: hidden;
  display: block;
  position: relative;
`;

export const Main = styled.main`
  ${({ centered }) => centered && css`width: 90%;`}
  min-height: 100%;
  margin: 0 auto;
`;
