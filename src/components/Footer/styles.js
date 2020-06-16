import styled from 'styled-components';

export const Footer = styled.footer`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  margin-top: 80px;
  padding: 1.5rem;
  background-color: var(--mdc-theme-primary);
  color: var(--mdc-theme-on-primary);

  @media screen and (min-width: 650px) {
    flex-direction: row;
  }
`;

export const FooterLogo = styled.img`
  margin: 12px 0;
  object-fit: cover;
  border-radius: 100px;

  @media screen and (min-width: 650px) {
    margin: 0 12px;
  }
`;

export const FooterNav = styled.nav`
  display: block;
  margin-bottom: 30px;
  ul {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    list-style-type: none;
    margin: 0;
    padding: 0;
    li {
      display: block;
      margin: 12px 5px;
    }
  }

  @media screen and (min-width: 650px) {
    display: flex;
    align-items: center;
    margin-bottom: 0;
    ul {
      li {
        display: inline;
        margin: 5px 15px;
      }
    }
  }
`;

export const FooterNavTwo = styled.nav`
  display: flex;
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

  @media screen and (max-width: 768px) {
    max-width: 300px;
  }

  @media screen and (max-width: 650px) {
    max-width: 100%;
    text-align: right;
  }

  @media screen and (max-width: 425px) {
    margin-top: 20px;
  }
`;

export const FooterIcon = styled.img`
  vertical-align: middle;
`;
