import styled from 'styled-components';
import { Link as LinkG } from "gatsby";

export const HeaderPost = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  p {
    margin: 15px 5px;
    a {
      text-decoration: underline;
    }
  }
`;

export const Content = styled.div`
  padding-bottom: 10px;
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
      cursor: pointer;
      color: var(--mdc-theme-secondary);
    }
  }
  
  @media screen and (min-width: 801px) {
    margin: 45px 23% 0;
    width: 54%;
  }

  @media screen and (max-width: 800px) {
    margin: 35px 15% 0;
    width: 70%;
  }

  @media screen and (max-width: 510px) {
    margin: 35px 0 0;
    width: 100%;
  }
`;

export const NavList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  list-style: none;
  padding: 0;
  
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
