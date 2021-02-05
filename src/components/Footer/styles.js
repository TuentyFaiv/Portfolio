import styled, { css } from 'styled-components';

export const Container = styled.footer`
  display: flex;
  width: 100%;
  margin-top: 5em;
  padding: 1.5rem;
  ${({ dark }) => dark ? css`background-color: var(--theme-dark);` : css`background-color: var(--theme);`}
  color: var(--content);
  flex-direction: column;
  justify-content: space-between;
  a {
    ${({ dark }) => dark ? css`color: black;` : css`color: white;`}
    font-weight: bold;
  }

  @media screen and (min-width: 650px) {
    flex-direction: row;
  }

  @media screen and (min-width: 768px) {
    margin-top: 10em;
  }
`;

export const FooterLogo = styled.img`
  margin: 0;
  object-fit: cover;
  border-radius: 100px;
`;

export const FooterNav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-around;
  ul {
    display: flex;
    margin: 0;
    padding: 0;
    list-style-type: none;
    align-items: center;
    justify-content: space-between;
    flex-direction: column;
    flex-wrap: wrap;
    li {
      display: block;
      margin: 12px;
    }
  }

  @media screen and (min-width: 500px) {
    ul {
      flex-direction: row;
    }
  }

  @media screen and (min-width: 650px) {
    ul {
      li {
        display: inline;
        margin: 0 0 0 15px;
      }
    }
  }

  @media screen and (min-width: 768px) {
    ul li {
      margin: 0 0 0 20px;
    }
  }

  @media screen and (min-width: 1280px) {
    ul li {
      margin: 0 0 0 30px;
    }
  }
`;

export const FooterNavTwo = styled.nav`
  display: flex;
  padding: 10px 0;
  text-align: center;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  a {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    margin: 15px;
  }

  @media screen and (min-width: 500px) {
    padding: 5px 0;
  }

  @media screen and (min-width: 650px) {
    padding: 0;
  }

  @media screen and (min-width: 768px) {
    width: 35%;
  }

  @media screen and (min-width: 1280px) {
    width: 30%;
  }
`;
