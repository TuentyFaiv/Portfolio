import React, { useState, useEffect, useRef } from "react";
import { Link } from "gatsby";
import { MdHome, MdEdit, MdDashboard, MdMenu } from "react-icons/md";
import { useGlobalState } from "../../context/Context";

import { Container, Navweb, Navmobile, Home, BMenu, Overlay, Nav } from "./styles";
import NavLink from "./NavLink";
import ThemeBtn from "./ThemeBtn";

import logo from "../../images/logo.svg";
import logoDark from "../../images/logo_dark.svg";

const Header = ({ dark }) => {
  const [{ native, mainRef }, dispatch] = useGlobalState();
  const [menu, setMenu] = useState(false);
  const burgerMenuRef = useRef(null);
  const headerRef = useRef(null);
  const threshold = .5;
  const isHome = !window.location.href.match(/(projects|blog|about)/g);

  const changeTheme = () => {
    dispatch({ type: 'THEME', payload: !dark });
  };

  const handleBMenu = () => {
    burgerMenuRef.current.style.left = menu ? '120vw' : '0';
    setMenu(!menu);
  };

  useEffect(() => {
    dispatch({
      type: 'THEME',
      payload: localStorage.getItem('theme') === 'dark' ? true : false
    });

    dispatch({
      type: 'NATIVE',
      payload: navigator.appVersion.match(/(Android|iPad|iPhone)/) ? true : false,
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      console.log(entries);
      console.log(entries[0].isIntersecting);
      if (!entries[0].isIntersecting && !headerRef.current?.classList.contains('isFixed')) {
        headerRef.current.classList.add('isFixed');
      } else {
        headerRef.current.classList.remove('isFixed');
      }
    }, { threshold });
    if (mainRef) {
      observer.observe(mainRef);
    }
  }, [mainRef]);

  return (
    <Container ref={headerRef} dark={dark} native={native}>
      {
        !native ?
          <>
            <Home>
              <Link to="/">
                <img src={dark ? logoDark : logo} alt="Logo" />
              </Link>
              <ThemeBtn func={changeTheme} dark={dark} />
              <MdMenu className={`bmenu ${isHome ? 'white' : ''}`} size={30} onClick={handleBMenu} />
            </Home>
            <Navweb dark={dark} isHome={isHome}>
              <ul>
                <NavLink to={`/projects/`}>Proyectos</NavLink>
                <NavLink to={`/blog/`}>Blog</NavLink>
                <NavLink to={`/about/`}>Acerca de mí</NavLink>
              </ul>
            </Navweb>
            <BMenu ref={burgerMenuRef} dark={dark} native={native}>
              <Overlay onClick={handleBMenu} />
              <Nav dark={dark}>
                <ul onClick={handleBMenu}>
                  <NavLink to={`/projects/`}>Proyectos</NavLink>
                  <NavLink to={`/blog/`}>Blog</NavLink>
                  <NavLink to={`/about/`}>Acerca de mí</NavLink>
                </ul>
              </Nav>
            </BMenu>
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
            <BMenu ref={burgerMenuRef} dark={dark} native={native}>
              <Overlay onClick={handleBMenu} />
              <Nav dark={dark}>
                <ThemeBtn func={changeTheme} dark={dark} />
                <ul onClick={handleBMenu}>
                  <NavLink to={`/about/`}>Acerca de mí</NavLink>
                </ul>
              </Nav>
            </BMenu>
          </>
      }
    </Container>
  );
}

export default Header;
