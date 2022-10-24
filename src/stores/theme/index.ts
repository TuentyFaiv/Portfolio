import { atom } from "nanostores";

const storagedTheme = localStorage.getItem("theme") as "dark" | "ligth";

export const theme = atom<"dark" | "ligth">(storagedTheme ?? "dark");

export const changeTheme = () => {
  const changedTheme = (theme.get() === "dark" ? "ligth" : "dark");
  localStorage.setItem("theme", changedTheme);
  theme.set(changedTheme);
}