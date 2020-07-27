import React from "react";
import { Link } from "gatsby";
import { MdBrightness2, MdBrightness5 } from "react-icons/md";
import { useGlobalState } from "../../context/Context";

import { Container, Home, ThemeBtn } from './styles';

import logo from "../../images/logo@3x.png";

const NavLink = (props) => (
  <li>
    <Link to={props.to} activeClassName="activeLink">
      {props.children}
    </Link>
  </li>
);

const Header = (props) => {
  const [{ dark }, dispatch] = useGlobalState();

  const changeTheme = () => {
    dispatch({
      type: 'THEME',
      payload: !dark
    });
  };

  return (
    <Container dark={dark}>
      <Home>
        <Link to="/">
          <img src={logo} alt="Logo" />
        </Link>
        <ThemeBtn onClick={changeTheme} dark={dark}>
          <div className={!dark ? 'moveLeft' : 'moveRight'}>
            {!dark ? <MdBrightness5 color="#961E1E" size={25} /> : <MdBrightness2 color="#006342" size={25} />}
          </div>
        </ThemeBtn>
      </Home>
      <nav>
        <ul>
          <NavLink to={`/#projects`}>Projects</NavLink>
          <NavLink to={`/blog/`}>Blog</NavLink>
          <NavLink to={`/about/`}>About</NavLink>
          <NavLink to={`/mentoring/`}>Tech me</NavLink>
        </ul>
      </nav>
    </Container>
  );
}

export default Header;
