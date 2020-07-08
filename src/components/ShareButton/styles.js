import styled from 'styled-components';

export const Wrapper = styled.div`
  position: relative;
  button {
    display: flex;
    width: 150px;
    height: 45px;
    margin: 0;
    padding: 1px;
    background-color: transparent;
    border: none;
    border-radius: 4px;
    border: 2px solid black;
    outline: 0;
    align-items: center;
    &:hover {
      cursor: pointer;
      border: 2px solid var(--mdc-theme-secondary);
      p {
        color: var(--mdc-theme-secondary);
      }
      img {
        margin: 0 5px 0 0;
      }
    }
    &:active {
      transform: scale(.95);
    }
  }
  img {
    width: 45px;
    height: 45px;
    margin: 0 5px 0 0;
    padding: 5px;
    object-fit: cover;
  }
  p {
    margin: 0;
    font-size: 18px;
    font-weight: bold;
  }

  @media screen and (min-width: 801px) {
    width: 54%;
    margin: 20px 23%;
  }

  @media screen and (max-width: 800px) {
    width: 70%;
    margin: 20px 15%;
  }

  @media screen and (max-width: 510px) {
    width: 100%;
    margin: 20px 0;
  }
`;

export const Modal = styled.div`
  position: absolute;
  display: flex;
  width: 160px;
  height: 40px;
  padding: 5px;
  border-radius: 8px;
  background-color: var(--mdc-theme-secondary);
  border: 2px solid #222222;
  align-items: center;
  justify-content: space-between;
  top: -47px;
  left: -5px;
  z-index: 99;
  &:hover {
    cursor: default;
  }
  a {
    width: 32px;
    height: 32px;
  }
  img {
    width: 32px;
    height: 32px;
    object-fit: cover;
    margin: 0;
    padding: 0;
    &:hover {
      cursor: pointer;
    }
  }
`;

export const Square = styled.span`
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: var(--mdc-theme-secondary);
  border-top-left-radius: 20px;
  border-bottom: 2px solid #222222;
  border-right: 2px solid #222222;
  transform: rotateZ(45deg);
  z-index: 99;
  top: -18px;
  left: 65px;
  z-index: 9999;
`;
