import { Link } from "gatsby"
import React, { Component } from "react"

import styles from "./header.module.scss"
import logo from "../../images/logo@3x.png";

class Header extends Component {
  render() {
    const ListLink = props => (
      <li>
        <Link to={props.to} activeClassName={styles.activeLink}>
          {props.children}
        </Link>
      </li>
    )
    return (
      <header className={styles.siteHeader}>
        <Link to="/">
          <img src={logo} alt="Logo" />
        </Link>
        <nav>
          <ul>
            <ListLink to={`/`}>Projects</ListLink>
            <ListLink to={`/blog/`}>Blog</ListLink>
            <ListLink to={`/about/`}>About</ListLink>
          </ul>
        </nav>
      </header>
    )
  }
}

export default Header
