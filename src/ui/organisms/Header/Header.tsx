import { useEffect, useRef, useState } from "react"
import { useStore } from "@nanostores/react";
import { refs, theme } from "@stores";

import type { Props } from "./Header.proptypes";

import "./Header.scss";

import IconMenu from "@icons/menu.svg?raw";
import IconHome from "@icons/home.svg";
import IconProjects from "@icons/projects.svg";
import IconBlog from "@icons/blogs.svg";

import { Theme, NavLink } from "../../atoms";

export default function Header({ home }: Props) {
  const [native, setNative] = useState(false);
  const [menu, setMenu] = useState(true);
  const headerRef = useRef<HTMLElement| null>(null);
  const burgerMenuRef = useRef<HTMLDivElement| null>(null);
  const $refs = useStore(refs);
  const $theme = useStore(theme);
  const mainRef = $refs["main"];

  const handleBurgerMenu = () => {
    if (burgerMenuRef.current) {
      burgerMenuRef.current.style.left = !menu ? '120vw' : '0';
    }
    setMenu(!menu);
  };

  useEffect(() => {
    setNative(
      navigator.appVersion.match(/(Android|iPad|iPhone)/) ? true : false
    )
  }, []);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0] && headerRef.current) {
        headerRef.current.dataset.fixed = !entries[0].isIntersecting ? "true" : "false";
      }
    }, { threshold: .5 });

    if (mainRef) observer.observe(mainRef);
    
    return () => {
      if (mainRef) observer.unobserve(mainRef);
    }
  }, [mainRef, headerRef]);

  return (
    <header ref={headerRef} data-native={native} className="header">
      {!native ? (
        <>
          <div className="header__home">
            <a href="/" className="header__logo-link">
              <img src={$theme === "dark" ? "/images/logo_dark@3x.webp" : "/images/logo@3x.webp"} alt="Logo" className="header__logo" />
            </a>
            <Theme />
            <button
              onClick={handleBurgerMenu}
              type="button"
              className="header__burger"
              dangerouslySetInnerHTML={{ __html: IconMenu }}
              data-white={home}
            />
          </div>
          <nav className="header__nav header__nav--web" data-home={home}>
            <ul className="header__list header__list--web">
              <NavLink to={`/projects/`}>Proyectos</NavLink>
              <NavLink to={`/blog/`}>Blog</NavLink>
              <NavLink to={`/about/`}>Acerca de mí</NavLink>
            </ul>
          </nav>
          <div className="header__menu" ref={burgerMenuRef} >
            <div className="header__overlay" onClick={handleBurgerMenu} />
            <nav className="header__nav">
              <ul className="header__list header__list--menu" onClick={handleBurgerMenu}>
                <NavLink to={`/projects/`}>Proyectos</NavLink>
                <NavLink to={`/blog/`}>Blog</NavLink>
                <NavLink to={`/about/`}>Acerca de mí</NavLink>
              </ul>
            </nav>
          </div>
        </>
      ) : (
        <>
          <nav className="header__nav header__nav--mobile">
            <ul className="header__list header__list--mobile">
              <NavLink to={`/`}>
                <img src={IconHome} alt="" className="header__icon" />
              </NavLink>
              <NavLink to={`/projects/`}>
                <img src={IconProjects} alt="" className="header__icon" />
              </NavLink>
              <NavLink to={`/blog/`}>
                <img src={IconBlog} alt="" className="header__icon" />
              </NavLink>
              <li className="header__list-item">
                <button
                  onClick={handleBurgerMenu}
                  type="button"
                  className="header__burger"
                  dangerouslySetInnerHTML={{ __html: IconMenu }}
                  data-white={home}
                />
              </li>
            </ul>
          </nav>
          <div className="header__menu" ref={burgerMenuRef}>
            <div className="header__overlay" onClick={handleBurgerMenu} />
            <nav className="header__nav">
              <Theme />
              <ul className="header__list header__list--menu" onClick={handleBurgerMenu}>
                <NavLink to={`/about/`}>Acerca de mí</NavLink>
              </ul>
            </nav>
          </div>
        </>
      )}
    </header>
  )
}
