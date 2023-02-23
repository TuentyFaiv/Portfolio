import { atom } from "nanostores";

import type { Theme } from "@typing/stores.theme";

import dark from "./dark";
import ligth from "./ligth";

const hasWindow = typeof window !== "undefined";
const media: MediaQueryList | null = hasWindow ? matchMedia("(prefers-color-schema: dark)") : null;

function getTheme() {
  const themeStoraged: Theme | null = hasWindow ? localStorage.getItem("theme") as Theme : null;

  const theme: Theme = media?.matches ? "dark" : themeStoraged ?? "dark";

  return theme;
}

export const themes = {
  dark,
  ligth
};

export const theme = atom<Theme>(getTheme());

export function changeTheme() {
  const changedTheme = (theme.get() === "dark" ? "ligth" : "dark");

  if (hasWindow) localStorage.setItem("theme", changedTheme);
  theme.set(changedTheme);
}

function listener(event: MediaQueryListEvent) {
  const themeEvent: Theme = event.matches ? "dark" : "ligth";

  if (hasWindow) localStorage.setItem("theme", themeEvent);
  theme.set(themeEvent);
}

if (media) {
  media.addEventListener("change", listener);
}
