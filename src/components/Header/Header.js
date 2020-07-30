import React, { useState, useEffect } from "react";
import { Link } from "gatsby";
import { MdHome, MdEdit, MdDashboard, MdMenu } from "react-icons/md";
import { useGlobalState } from "../../context/Context";

import { Container, Navweb, Navmobile, Home, BMenu, Overlay, Nav } from "./styles";
import NavLink from "./NavLink";
import ThemeBtn from "./ThemeBtn";

import logo from "../../images/logo.svg";
import logoDark from "../../images/logo_dark.svg";

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
    bMenu.style.left = menu ? '120vw' : '0';
    setMenu(!menu);
  };

  useEffect(() => {
    dispatch({
      type: 'THEME',
      payload: localStorage.getItem('theme') === 'dark' ? true : false
    });

    dispatch({
      type: 'NATIVE',
      payload: (navigator.appVersion.match(/(Android|iPad|iPhone)/) || localStorage.getItem('view') === 'native') ? true : false,
    });
  }, []);

  return (
    <Container dark={dark} native={native}>
      {
        !native ?
          <>
            <Home>
              <Link to="/">
                <img src={dark ? logoDark : logo} alt="Logo" />
              </Link>
              <ThemeBtn func={changeTheme} dark={dark} />
            </Home>
            <Navweb dark={dark}>
              <ul>
                <NavLink to={`/projects/`}>Proyectos</NavLink>
                <NavLink to={`/blog/`}>Blog</NavLink>
                <NavLink to={`/about/`}>Acerca de mí</NavLink>
                <NavLink to={`/mentoring/`}>Mentorías</NavLink>
              </ul>
            </Navweb>
          </> :
          <>
            <Navmobile dark={dark}>
              <ul>
                <NavLink to={`/`}><MdHome size={30} /></NavLink>
                <NavLink to={`/projects/`}><MdDashboard size={30} /></NavLink>
                <NavLink to={`/blog/`}><MdEdit size={30} /></NavLink>
                <li>
                  <MdMenu size={30} onClick={handleBMenu} />
                </li>
              </ul>
            </Navmobile>
            <BMenu id="bmenu" dark={dark}>
              <Overlay onClick={handleBMenu} />
              <Nav dark={dark}>
                <ThemeBtn func={changeTheme} dark={dark} />
                <ul onClick={handleBMenu}>
                  <NavLink to={`/about/`}>Acerca de mí</NavLink>
                  <NavLink to={`/mentoring/`}>Mentorías</NavLink>
                </ul>
              </Nav>
            </BMenu>
          </>
      }
    </Container>
  );
}

export default Header;
