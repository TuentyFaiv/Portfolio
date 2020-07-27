import styled, { css } from 'styled-components';

export const Container = styled.header`
  display: flex;
  height: 70px;
  font-weight: 900;
  padding: 10px;
  justify-content: space-between;
  align-items: center;
  img {
    width: 50px;
    height: 50px;
    margin: 0 .5em;
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
        ${({ dark }) => dark ? css`border-bottom: 2px solid var(--theme-dark);` : css`border-bottom: 2px solid var(--theme);`}
      }
      a {
        text-decoration: none;
      }
    }
  }

  .activeLink {
    padding: .2em 0;
    ${({ dark }) => dark ? css`border-bottom: 2px solid var(--theme-dark);` : css`border-bottom: 2px solid var(--theme);`}
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

export const Home = styled.div`
  display: flex;
  align-items: center;
`;

export const ThemeBtn = styled.button`
  position: relative;
  height: 20px;
  width: 60px;
  margin: 0 .5em;
  padding: 0;
  border-radius: 20px;
  ${({ dark }) => dark ? css`background: var(--background-dark-two);` : css`background: ghostwhite;`}
  border: none;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, .25);
  outline: 0;
  div {
    position: absolute;
    height: 29px;
    width: 29px;
    margin: 0;
    border-radius: 30px;
    top: -4.5px;
    transition: all .8s ease;
    svg,
    &:hover {
      cursor: pointer;
    }
    svg {
      margin: 2px;
    }
    &:hover {
      box-shadow: 0 0 5px 0 rgba(0, 0, 0, .5);
    }
  }
  .moveLeft {
    background: #EF7171;
    transform: translateX(0px);
  }
  .moveRight {
    background: #21C08B;
    transform: translateX(30px);
  }
`;
