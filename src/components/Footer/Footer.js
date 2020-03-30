import { Link } from "gatsby";
import React, { Component } from "react";
import facebookIcon from "../../images/icons/facebook-icon.svg";
import twitterIcon from "../../images/icons/twitter-icon.svg";
import githubIcon from "../../images/icons/github-icon-24px.svg";
import linkedinIcon from "../../images/icons/linkedin-icon.svg";
import instagramIcon from "../../images/icons/instagram-round-white-24px.svg";
import youtubeIcon from "../../images/icons/youtube-icon-24px.svg";

import footerLogo from "../../images/logo@3x.png"

import styles from "./footer.module.scss"

class Footer extends Component {
  render() {
    return (
      <footer className={styles.siteFooter}>
        <nav className={styles.footerNav}>
          {/* LOGO */}
          <Link to="/">
            <img
              src={footerLogo}
              width="100px"
              alt="TuentyFaiv-logo"
              className={styles.footerLogo}
            />
          </Link>
          <ul>
            <li>
              <Link to="/">Projects</Link>
            </li>
            <li>
              <Link to="/blog/">Blog</Link>
            </li>
            <li>
              <Link to="/about/">About</Link>
            </li>
          </ul>
        </nav>
        <nav className={styles.footerNav2}>
          <a
            href="https://www.facebook.com/tuentyfaivpage/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={facebookIcon}
              className={styles.footerIcon}
              width="24px"
              alt="facebook-social-link"
            />
          </a>
          <a
            href="https://twitter.com/TuentyFaiv"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={twitterIcon}
              className={styles.footerIcon}
              width="30px"
              alt="twitter-social-link"
            />
          </a>
          <a
            href="https://github.com/TuentyFaiv"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={githubIcon}
              className={styles.footerIcon}
              width="24px"
              alt="github-social-link"
            />
          </a>
          <a
            href="https://www.linkedin.com/in/tuentyfaiv/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={linkedinIcon}
              className={styles.footerIcon}
              width="24px"
              alt="linkedin-social-link"
            />
          </a>
          <a
            href="https://www.instagram.com/tuenty_faiv"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={instagramIcon}
              className={styles.footerIcon}
              width="24px"
              alt="instagram-social-link"
            />
          </a>
          <a
            href="https://www.youtube.com/channel/UCh2M1HBuV-SiBPEcBG6iQaQ"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={youtubeIcon}
              className={styles.footerIcon}
              width="24px"
              alt="youtube-social-link"
            />
          </a>
        </nav>
      </footer>
    )
  }
}

export default Footer
