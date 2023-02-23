import type { ReactNode } from "react";

export interface Props {
  to: string;
  children: ReactNode;
  active?: boolean;
}