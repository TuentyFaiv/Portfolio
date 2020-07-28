import styled, { css } from 'styled-components';

export const Container = styled.div`
  min-height: 100vh;
  ${({ native }) => native && css`padding: 2vh 0 8vh;`}
  overflow: hidden;
  display: block;
  position: relative;
`;

export const Main = styled.main`
  min-height: 100%;
  margin: 0 auto;
`;
