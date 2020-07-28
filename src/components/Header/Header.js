import React, { useState, useEffect } from "react";
import { Link } from "gatsby";
import { MdBrightness2, MdBrightness5, MdHome, MdEdit, MdDashboard, MdMenu } from "react-icons/md";
import { useGlobalState } from "../../context/Context";

import { Container, Navweb, Navmobile, Home, ThemeBtn, BMenu, Overlay, Nav } from './styles';

import logo from "../../images/logo@3x.png";

const NavLink = (props) => (
  <li>
    <Link to={props.to} activeClassName="activeLink">
      {props.children}
    </Link>
  </li>
);

const Header = ({ dark }) => {
  const [menu, setMenu] = useState(false);
  const [{ native }, dispatch] = useGlobalState();

  const changeTheme = () => {
    dispatch({
      type: 'THEME',
      payload: !dark
    });
  };

  const handleBMenu = () => {
    const bMenu = document.getElementById('bmenu');
    if (menu) {
      bMenu.style.left = '120vw';
    } else {
      bMenu.style.left = '0';
    }
    setMenu(!menu);
  };

  useEffect(() => {
    if (navigator.appVersion.match(/(Android|iPad|iPhone)/)) {
      dispatch({
        type: 'NATIVE',
        payload: true
      });
    } else {
      dispatch({
        type: 'NATIVE',
        payload: false
      });
    }
  }, []);

  return (
    <Container dark={dark} native={native}>
      {
        !native ?
          <>
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
            <Navweb dark={dark}>
              <ul>
                <NavLink to={`/#projects`}>Projects</NavLink>
                <NavLink to={`/blog/`}>Blog</NavLink>
                <NavLink to={`/about/`}>About</NavLink>
                <NavLink to={`/mentoring/`}>Tech me</NavLink>
              </ul>
            </Navweb>
          </> :
          <>
            <Navmobile dark={dark}>
              <ul>
                <NavLink to={`/`}><MdHome size={30} /></NavLink>
                <NavLink to={`/#projects`}><MdDashboard size={30} /></NavLink>
                <NavLink to={`/blog/`}><MdEdit size={30} /></NavLink>
                <li>
                  <MdMenu size={30} onClick={handleBMenu} />
                </li>
              </ul>
            </Navmobile>
            <BMenu id="bmenu" dark={dark}>
              <Overlay onClick={handleBMenu} />
              <Nav dark={dark}>
                <ThemeBtn onClick={changeTheme} dark={dark}>
                  <div className={!dark ? 'moveLeft' : 'moveRight'}>
                    {!dark ? <MdBrightness5 color="#961E1E" size={25} /> : <MdBrightness2 color="#006342" size={25} />}
                  </div>
                </ThemeBtn>
                <ul onClick={handleBMenu}>
                  <NavLink to={`/about/`}>About</NavLink>
                  <NavLink to={`/mentoring/`}>Tech me</NavLink>
                </ul>
              </Nav>
            </BMenu>
          </>
      }
    </Container>
  );
}

export default Header;
