import { atom } from "nanostores";

import type { Theme } from "@typing/stores.theme";

import dark from "./dark";
import ligth from "./ligth";

export const themes = {
  dark,
  ligth
};

export const theme = atom<Theme>("dark");

export function changeTheme() {
  const changedTheme = (theme.get() === "dark" ? "ligth" : "dark");

  localStorage.setItem("theme", changedTheme);
  theme.set(changedTheme);
}

export function listenerTheme(event: MediaQueryListEvent) {
  const themeEvent: Theme = event.matches ? "dark" : "ligth";

  localStorage.setItem("theme", themeEvent);
  theme.set(themeEvent);
}

export function getTheme(media: MediaQueryList) {
  const themeStoraged: Theme | null = localStorage.getItem("theme") as Theme | null;

  const themeMedia = media.matches ? "dark" : "ligth";

  const newTheme: Theme = themeStoraged ?? themeMedia;

  theme.set(newTheme);
}
