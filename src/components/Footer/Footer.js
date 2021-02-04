import React from "react";
import { Link } from "gatsby";
import { FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";
import { Container, FooterLogo, FooterNav, FooterNavTwo } from './styles';

import logo from "../../images/logo.svg";
import logoDark from "../../images/logo_dark.svg";

const Footer = ({ dark }) => (
  <Container dark={dark}>
    <FooterNav >
      <Link to="/">
        <FooterLogo
          src={dark ? logoDark : logo}
          width="100px"
          alt="TuentyFaiv-logo"
        />
      </Link>
      <ul>
        <li>
          <Link to="/projects/">Proyectos</Link>
        </li>
        <li>
          <Link to="/blog/">Blog</Link>
        </li>
        <li>
          <Link to="/about/">Acerca de mí</Link>
        </li>
      </ul>
    </FooterNav>
    <FooterNavTwo>
      <a
        href="https://twitter.com/TuentyFaiv"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaTwitter
          color={dark ? '#111111' : 'white'}
          size={24}
        />
      </a>
      <a
        href="https://github.com/TuentyFaiv"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaGithub
          color={dark ? '#111111' : 'white'}
          size={24}
        />
      </a>
      <a
        href="https://www.linkedin.com/in/tuentyfaiv/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaLinkedin
          color={dark ? '#111111' : 'white'}
          size={24}
        />
      </a>
    </FooterNavTwo>
  </Container>
);

export default Footer
