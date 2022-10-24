import type { ReactNode } from "react";

export interface HeaderProps {
  home: boolean;
}
export interface NavLinkProps {
  to: string;
  children: ReactNode;
  active?: boolean;
}