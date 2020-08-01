import styled from 'styled-components';
import { Link as LinkG } from "gatsby";
import Img from "gatsby-image";

export const ContentHeader = styled.div`
  div:first-of-type {
    display: flex;
    align-items: center;
    justify-content: space-between;
    p {
      margin: 15px 5px;
      a {
        text-decoration: underline;
        &:hover {
          color: ${({ dark }) => dark ? '#D81717' : 'var(--theme-secondary)'};
        }
      }
    }
  }
  div:last-of-type {
    margin: 10px 15%;
    p {
      text-align: center;
    }
  }
  h2 {
    width: 100%;
    font-family: 'Roboto', sans-serif;
    font-size: 1.5rem;
    text-align: center;
    a {
      padding: 3px 0;
      font-size: 1.2rem;
      border-bottom: 1px solid ${({ dark }) => dark ? 'white' : 'black'};
      &:hover {
        padding: 3px 0 2px;
        color: ${({ dark }) => dark ? '#D81717' : 'var(--theme-secondary)'};
        border-bottom: 2px solid ${({ dark }) => dark ? '#D81717' : 'var(--theme-secondary)'};
        cursor: pointer;
      }
    }
  }

  @media screen and (min-width: 801px) {
    div:last-of-type {
      margin: 10px 10%;
    }
    h2 {
      margin: 25px 0;
    }
  }

  @media screen and (max-width: 800px) {
    div:last-of-type {
      margin: 10px 5%;
    }
    h2 {
      margin: 15px 0;
      font-size: 1.2rem;
    }
  }

  @media screen and (max-width: 510px) {
    div:last-of-type {
      margin: 10px 0;
    }
    h2 {
      margin: 10px 0;
      font-size: 1rem;
    }
  }
`;

export const Cover = styled(Img)`
  box-shadow: 1px 1px 6px 0 rgba(0, 0, 0, .2);
`;

export const Content = styled.div`
  padding: 10px 0;
  border-top: 2px solid #676767;
  border-bottom: 2px solid #676767;
  h2,
  h3 {
    font-family: 'Roboto', sans-serif;
    font-weight: bold;
  }
  h2 {
    font-size: 28px;
  }
  h3 {
    font-size: 22px;
  }
  a {
    text-decoration: underline !important;
    &:hover {
      color: ${({ dark }) => dark ? '#D81717' : 'var(--theme-secondary)'};
      cursor: pointer;
    }
  }
  
  @media screen and (min-width: 801px) {
    margin: 0 23%;
    width: 54%;
  }

  @media screen and (max-width: 800px) {
    margin: 0 15%;
    width: 70%;
  }

  @media screen and (max-width: 510px) {
    margin: 0;
    width: 100%;
  }
`;

export const NavList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  list-style: none;
  padding: 0;

  a {
    text-decoration: none;
    padding: 1px 0;
    border-bottom: 1px solid ${({ dark }) => dark ? 'white' : 'black'};
    :hover {
      padding: 1px 0;
      color: ${({ dark }) => dark ? '#D81717' : 'var(--theme-secondary)'};
      border-bottom: 1px solid ${({ dark }) => dark ? '#D81717' : 'var(--theme-secondary)'};
      cursor: pointer;
    }
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

export const Link = styled(LinkG)`
  text-decoration: underline;
`;
