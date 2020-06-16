import styled from 'styled-components';

export const Header = styled.header`
  display: flex;
  height: 70px;
  font-weight: 900;
  padding: 10px;
  justify-content: space-between;
  align-items: center;
  img {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 50px;
  }
  nav ul {
    text-align: center;
    list-style-type: none;
    margin: 0;
    padding: 0;
    li {
      display: inline;
      margin: 0 .7em;
      padding: .2em 0;
      font-family: "Segoe UI", sans-serif;
      font-size: 18px;
      &:hover {
        border-bottom: 2px solid var(--mdc-theme-primary);
      }
      a {
        text-decoration: none;
      }
    }
  }

  .activeLink {
    padding: .2em 0;
    border-bottom: 2px solid var(--mdc-theme-primary);
  }

  @media screen and (max-width: 420px) {
    nav {
      width: 90%;
      ul {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex-wrap: wrap;
      }
    }
  }
`;