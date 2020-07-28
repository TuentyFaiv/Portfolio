import React from "react";
import { Link } from "gatsby";

const NavLink = (props) => (
  <li>
    <Link to={props.to} activeClassName="activeLink">
      {props.children}
    </Link>
  </li>
);

export default NavLink;