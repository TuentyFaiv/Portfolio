import React, { Component } from "react";
import { Link } from "gatsby";
import { Footer as Wrapper, FooterLogo, FooterNav, FooterNavTwo, FooterIcon } from './styles';

import facebookIcon from "../../images/icons/facebook-icon.svg";
import twitterIcon from "../../images/icons/twitter-icon.svg";
import githubIcon from "../../images/icons/github-icon-24px.svg";
import linkedinIcon from "../../images/icons/linkedin-icon.svg";
import instagramIcon from "../../images/icons/instagram-round-white-24px.svg";
import youtubeIcon from "../../images/icons/youtube-icon-24px.svg";

import footerLogo from "../../images/logo@3x.png";

class Footer extends Component {
  render() {
    return (
      <Wrapper>
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
            <FooterIcon
              src={facebookIcon}
              width="24px"
              alt="facebook-social-link"
            />
          </a>
          <a
            href="https://twitter.com/TuentyFaiv"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FooterIcon
              src={twitterIcon}
              width="30px"
              alt="twitter-social-link"
            />
          </a>
          <a
            href="https://github.com/TuentyFaiv"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FooterIcon
              src={githubIcon}
              width="24px"
              alt="github-social-link"
            />
          </a>
          <a
            href="https://www.linkedin.com/in/tuentyfaiv/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FooterIcon
              src={linkedinIcon}
              width="24px"
              alt="linkedin-social-link"
            />
          </a>
          <a
            href="https://www.instagram.com/tuenty_faiv"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FooterIcon
              src={instagramIcon}
              width="24px"
              alt="instagram-social-link"
            />
          </a>
          <a
            href="https://www.youtube.com/channel/UCh2M1HBuV-SiBPEcBG6iQaQ"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FooterIcon
              src={youtubeIcon}
              width="24px"
              alt="youtube-social-link"
            />
          </a>
        </FooterNavTwo>
      </Wrapper>
    )
  }
}

export default Footer
