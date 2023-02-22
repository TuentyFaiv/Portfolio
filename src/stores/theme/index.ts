import { atom } from "nanostores";

const hasWindow = true;

const storagedTheme = hasWindow ? localStorage.getItem("theme") as "dark" | "ligth" : "dark";

export const theme = atom<"dark" | "ligth">(storagedTheme ?? "dark");

export const changeTheme = () => {
  const changedTheme = (theme.get() === "dark" ? "ligth" : "dark");

  if (hasWindow) localStorage.setItem("theme", changedTheme);
  theme.set(changedTheme);
}