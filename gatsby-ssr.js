import React from "react";
import { Provider } from "./src/context/Context";
import { reducer } from "./src/context/reducer";

export const wrapRootElement = ({ element }) => (
  <Provider reducer={reducer}>{element}</Provider>
);