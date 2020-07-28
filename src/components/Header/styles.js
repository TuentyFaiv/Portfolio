import styled, { css } from 'styled-components';

export const Container = styled.header`
  display: flex;
  width: 100%;
  height: 70px;
  font-weight: 900;
  padding: 10px;
  justify-content: space-between;
  align-items: center;
  ${({ native }) => native && css`
    position: fixed;
    height: 8vh;
    background: ${({ dark }) => dark ? 'var(--content-bg-dark)' : '#EEEEEE'};
    box-shadow: 0 1px 7px 0 rgba(0, 0, 0, .5);
    bottom: 0;
    z-index: 9999;
 `}
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
    text-align: center;
    list-style-type: none;
    margin: 0;
    padding: 0;
    li {
      margin: 0 .7em;
      padding: .2em 0;
      font-family: "Segoe UI", sans-serif;
      font-size: 18px;
      border-bottom: 2px solid transparent;
      &:hover {
        cursor: pointer;
        border-bottom: 2px solid ${({ dark }) => dark ? 'var(--theme-dark)' : 'var(--theme)'};
      }
      a {
        text-decoration: none;
      }
    }
  }

  .activeLink {
    padding: .2em 0;
    border-bottom: 2px solid ${({ dark }) => dark ? 'var(--theme-dark)' : 'var(--theme)'};
  }
`;

export const Navmobile = styled(Nav)`
  width: 100%;
  ul {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    li {
      &:hover {
        color: ${({ dark }) => dark ? 'var(--theme-dark)' : 'var(--theme)'};
      }
    }
  }

  .activeLink {
    color: ${({ dark }) => dark ? 'var(--theme-dark)' : 'var(--theme)'};
  }
`;

export const Navweb = styled(Nav)`
  ul {
    li {
      display: inline;
    }
  }

  @media screen and (max-width: 420px) {
    width: 90%;
    ul {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex-wrap: wrap;
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
`;

export const Overlay = styled.div`
  grid-area: overlay;
  height: 100%;
  background: rgba(0, 0, 0, .35);
  &:hover {
    cursor: pointer;
  }
`;
