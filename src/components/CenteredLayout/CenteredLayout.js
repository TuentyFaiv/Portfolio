import React from "react";
import { useGlobalState } from "../../context/Context";
import { GlobalStyles } from "../../styles/GlobalStyles";
import { Container, Main } from "./styles";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import MetaLinks from "../MetaLinks/MetaLinks";

const CenteredLayout = ({ children }) => {
  const [{ dark }] = useGlobalState();

  return (
    <>
      <GlobalStyles dark={dark} />
      <Container>
        <MetaLinks />
        <Header />
        <Main>{children}</Main>
        <Footer />
      </Container>
    </>
  );
};

export default CenteredLayout
