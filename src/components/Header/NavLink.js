import React from "react";
import { Link } from "gatsby";

const NavLink = ({ to, children }) => (
  <li>
    <Link to={to} activeClassName="activeLink">
      {children}
    </Link>
  </li>
);

export default NavLink;
