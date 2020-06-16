import React, { Component } from "react";
import { Link } from "gatsby";
import { Header as Wrapper } from './styles';

import logo from "../../images/logo@3x.png";

class Header extends Component {
  render() {
    const ListLink = props => (
      <li>
        <Link to={props.to} activeClassName="activeLink">
          {props.children}
        </Link>
      </li>
    );

    return (
      <Wrapper>
        <Link to="/">
          <img src={logo} alt="Logo" />
        </Link>
        <nav>
          <ul>
            <ListLink to={`/#projects`}>Projects</ListLink>
            <ListLink to={`/blog/`}>Blog</ListLink>
            <ListLink to={`/about/`}>About</ListLink>
            <ListLink to={`/mentoring/`}>Tech me</ListLink>
          </ul>
        </nav>
      </Wrapper>
    )
  }
}

export default Header
