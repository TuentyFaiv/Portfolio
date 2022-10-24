import { useEffect, useState } from "react";

import type { NavLinkProps } from "@typing/react/proptypes";

const NavLink = ({ to, children }: NavLinkProps) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const { pathname } = new URL(location.href, location.origin);
    const { pathname: linkPathname } = new URL(to, location.origin);

    const pathnameFormatted = pathname.replace("/", pathname.length === 1 ? " " : "");
    const linkPathnameFormatted = linkPathname.replace("/", linkPathname.length === 1 ? " " : "");

    setActive(pathnameFormatted.includes(linkPathnameFormatted));
  }, [to]);

  return (
    <li className="header__list-item">
      <a href={to} data-active={active} className="header__link">
        {children}
      </a>
    </li>
  );
};

export default NavLink;