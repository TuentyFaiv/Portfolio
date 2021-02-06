import React from "react";
import { useGlobalState } from "../../context/Context";
import { GlobalStyles } from "../../styles/GlobalStyles";
import { Container, Main } from "./styles";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import MetaLinks from "../MetaLinks/MetaLinks";

const Layout = ({ children, centered }) => {
  const [{ dark, native }] = useGlobalState();

  return (
    <>
      <GlobalStyles dark={dark} />
      <Container native={native}>
        <MetaLinks />
        <Header dark={dark} />
        <Main centered={centered}>{children}</Main>
        <Footer dark={dark} />
      </Container>
    </>
  );
};

export default Layout;
