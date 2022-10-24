import { useEffect } from "react";
import { useStore } from "@nanostores/react";
import { changeTheme, theme } from "@stores/theme";

import "@stylescomp/Theme.scss";

import IconDark from "@icons/moon.svg";
import IconLigth from "@icons/sun.svg";

export default function Theme() {
  const $theme = useStore(theme);

  useEffect(() => {
    const html = document.querySelector("html");
    if (html) {
      html.dataset.theme = $theme;
    }
  }, [$theme]);

  return (
    <button className="theme" onClick={changeTheme} aria-label="Cambiar tema" title="Cambiar tema">
      <div className="theme__icon-wrapper" data-theme={$theme}>
        <img className="theme__icon" src={$theme === "ligth" ? IconLigth : IconDark} alt="" />
      </div>
    </button>
  )
}
