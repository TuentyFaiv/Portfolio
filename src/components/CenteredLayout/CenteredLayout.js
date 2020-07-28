import React from "react";
import { useGlobalState } from "../../context/Context";
import { GlobalStyles } from "../../styles/GlobalStyles";
import { Container, Main } from "./styles";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import MetaLinks from "../MetaLinks/MetaLinks";

const CenteredLayout = ({ children }) => {
  const [{ dark, native }] = useGlobalState();

  return (
    <>
      <GlobalStyles dark={dark} />
      <Container native={native}>
        <MetaLinks />
        <Header dark={dark} />
        <Main>{children}</Main>
        <Footer dark={dark} />
      </Container>
    </>
  );
};

export default CenteredLayout
