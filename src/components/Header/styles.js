import styled, { css } from 'styled-components';

export const Container = styled.header`
  display: flex;
  width: 100%;
  height: 70px;
  padding: 10px;
  font-weight: 900;
  justify-content: space-between;
  align-items: center;
  ${({ native }) => native ?
    css`
      position: fixed;
      height: 8.5vh;
      background: ${({ dark }) => dark ? 'var(--content-bg-dark)' : '#EEEEEE'};
      box-shadow: 0 1px 7px 0 rgba(0, 0, 0, .5);
      bottom: 0;
      z-index: 9999;
    ` :
    css`
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      &.isFixed {
        position: fixed;
        background: ${({ dark }) => dark ? 'var(--background-dark)' : 'var(--background)'};
        z-index: 9999;
        nav ul li,
        div .bmenu {
          color: currentColor;
          fill: currentColor;
          &:hover {
            color: ${({ dark }) => dark ? 'var(--theme-dark)' : 'var(--theme)'};
            fill: ${({ dark }) => dark ? 'var(--theme-dark)' : 'var(--theme)'};
          }
        }
      }

      @media screen and (min-width: 650px) {
        height: 90px;
      }
    `
  }
  img {
    width: 50px;
    height: 50px;
    margin: 0 .5em;
    object-fit: cover;
    border-radius: 50px;
  }
`;

export const Nav = styled.nav`
  ul {
    margin: 0;
    padding: 0;
    text-align: center;
    list-style-type: none;
    li {
      margin: 0 .7em;
      padding: .5em 0;
      font-family: "Segoe UI", sans-serif;
      font-size: 18px;
      border-bottom: 3px solid transparent;
      &:hover {
        cursor: pointer;
        border-bottom: 3px solid ${({ dark }) => dark ? 'var(--theme-dark)' : 'var(--theme)'};
      }
      a {
        text-decoration: none;
      }
    }
  }

  .activeLink {
    padding: .5em 0;
    border-bottom: 3px solid ${({ dark }) => dark ? 'var(--theme-dark)' : 'var(--theme)'};
  }
`;

export const Navmobile = styled(Nav)`
  width: 100%;
  ul {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    li {
      padding: 0;
      a {
        width: 30px;
        height: 30px;
        padding: .15em calc(50% - 1.1em);
      }
      &:hover {
        color: ${({ dark }) => dark ? 'var(--theme-dark)' : 'var(--theme)'};
      }
    }
  }

  .activeLink {
    padding: .15em calc(50% - 1.1em);
    color: ${({ dark }) => dark ? 'var(--theme-dark)' : 'var(--theme)'};
  }
`;

export const Navweb = styled(Nav)`
  display: none;
  ul {
    li {
      display: inline;
      ${({ isHome }) => isHome && css`color: var(--content);`}
      font-size: 22px;
      letter-spacing: .05rem;
      &:hover {
        color: ${({ dark }) => dark ? 'var(--theme-dark)' : 'var(--theme)'};
      }
    }
  }

  @media screen and (min-width: 650px) {
    display: flex;
    align-items: center;
  }
`;

export const Home = styled.div`
  display: flex;
  align-items: center;
  .bmenu {
    display: none;
    &.white {
      fill: var(--content);
    }
  }

  @media screen and (max-width: 649px) {
    width: 100%;
    justify-content: space-between;
    .bmenu {
      display: block;
    }
  }
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

export const BMenu = styled.div`
  position: absolute;
  display: grid;
  width: 100%;
  height: 92vh;
  grid-template-columns: 30% 70%;
  grid-template-areas: "overlay nav";
  top: -92vh;
  left: 120vw;
  transition: left .65s ease-in-out;
  nav {
    grid-area: nav;
    height: 100%;
    display: flex;
    background: ${({ dark }) => dark ? 'var(--content-bg-dark)' : '#EEEEEE'};
    align-items: center;
    justify-content: center;
    flex-direction: column;
    li,
    button {
      margin: 1em .7em;
    }
  }

  ${({ native }) => !native &&
    css`
      position: fixed;
      height: 100vh;
      top: 0;
      z-index: 9999;
      @media screen and (min-width: 650px) {
        display: none;
      }
    `
  }
`;

export const Overlay = styled.div`
  grid-area: overlay;
  height: 100%;
  background: rgba(0, 0, 0, .35);
  &:hover {
    cursor: pointer;
  }
`;
