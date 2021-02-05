import styled, { css } from "styled-components";
import { Link } from "gatsby";

export const SectionOne = styled.section`
  min-height: 90vh;
  display: flex;
  text-align: left;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  h1 {
    margin: 70px 0 0 0;
    padding: 0 16px;
    color: var(--content);
  }
  ${({ bg }) => bg &&
    css`
      background-image: url(${bg});
      background-position: top;
      background-size: cover;
      background-repeat: no-repeat;
      background-attachment: fixed;
    `
  }

  @media screen and (min-width: 650px) {
    h1 {
      margin: 90px 0 0 0;
    }
  }
`;

export const SectionTwo = styled.section`
  display: flex;
  width: 100%;
  padding: 2.5rem 1rem;
  background: ${({ dark }) => dark ? 'linear-gradient(130deg, var(--theme-dark) 0%, rgb(0, 99, 66) 100%)' : 'linear-gradient(130deg, rgb(150, 30, 30) 0%, rgb(170, 60, 60) 100%)'};
  color: var(--content);
  justify-content: center;
  flex-direction: column;
  h2 {
    margin: 1.75rem;
    a {
      color: cyan;
      text-decoration: underline;
    }
  }

  @media screen and (max-width: 800px) {
    h2 {
      margin: 1.8rem 1.4rem;
      font-size: 24px;
    }
  }

  @media screen and (max-width: 610px) {
    h2 {
      margin: 1.6rem 1.2rem;
      font-size: 22px;
    }
  }

  @media screen and (max-width: 510px) {  
    h2 {
      margin: 1.4rem 1rem;
    }
  }

  @media screen and (max-width: 460px) {
    h2 {
      margin: 1.2rem .25rem;
      font-size: 20px;
    }
  }

  @media screen and (max-width: 375px) {
    h2 {
      margin: 1rem .25rem;
    }
  }
`;

export const SectionThree = styled.section`
  width: 90%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  & > h2:first-of-type {
    font-family: 'Roboto', sans-serif;
    margin: 2rem;
  }
`;

export const Button = styled(Link)`
  border-radius: 25px;
  background-color: ${({ dark }) => dark ? 'rgb(0, 99, 66)' : 'var(--theme)'};
  color: var(--content);
  will-change: transform, opacity;
  box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 16px;
  font-family: 'Roboto', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.09em;
  text-decoration: none;
  text-transform: uppercase;
  display: inline-flex;
  position: relative;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 64px;
  height: 36px;
  border: none;
  line-height: inherit;
  user-select: none;
  overflow: hidden;
  vertical-align: middle;
  &:hover {
    box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);
    cursor: pointer;
  }
`;
