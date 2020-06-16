import styled, { keyframes } from 'styled-components';

const effect = keyframes`
  0% {
    top: 36px;
    left: 36px;
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    top: 0px;
    left: 0px;
    width: 72px;
    height: 72px;
    opacity: 0;
  }
`;

export const Loader = styled.div`
  display: inline-block;
  position: relative;
  margin: calc(30vh - 80px) calc(50vw - 130px);
  width: 80px;
  height: 80px;
  div {
    position: absolute;
    border: 4px solid #961E1E;
    opacity: 1;
    border-radius: 50%;
    animation: ${effect} 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
    &:nth-child(2) {
      animation-delay: -0.5s;
    }
  }
`;
