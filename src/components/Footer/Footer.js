import React from "react";
import { Link } from "gatsby";
import { FaFacebook, FaTwitter, FaGithub, FaLinkedin, FaInstagram, FaYoutube } from "react-icons/fa";
import { useGlobalState } from "../../context/Context";
import { Container, FooterLogo, FooterNav, FooterNavTwo } from './styles';

import footerLogo from "../../images/logo@3x.png";

const Footer = () => {
  const [{ dark }] = useGlobalState();

  return (
    <Container dark={dark}>
      <FooterNav >
        <Link to="/">
          <FooterLogo
            src={footerLogo}
            width="100px"
            alt="TuentyFaiv-logo"
          />
        </Link>
        <ul>
          <li>
            <Link to="/#projects">Projects</Link>
          </li>
          <li>
            <Link to="/blog/">Blog</Link>
          </li>
          <li>
            <Link to="/about/">About</Link>
          </li>
          <li>
            <Link to="/mentoring/">Tech me</Link>
          </li>
        </ul>
      </FooterNav>
      <FooterNavTwo>
        <a
          href="https://www.facebook.com/tuentyfaivpage/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaFacebook
            color={dark ? '#111111' : 'white'}
            size={24}
          />
        </a>
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
        <a
          href="https://www.instagram.com/tuenty_faiv"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaInstagram
            color={dark ? '#111111' : 'white'}
            size={24}
          />
        </a>
        <a
          href="https://www.youtube.com/channel/UCh2M1HBuV-SiBPEcBG6iQaQ"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaYoutube
            color={dark ? '#111111' : 'white'}
            size={24}
          />
        </a>
      </FooterNavTwo>
    </Container>
  );
};

export default Footer
