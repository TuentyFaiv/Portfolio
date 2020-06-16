import React from "react";
import { Container, Main } from "./styles";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import MetaLinks from "../MetaLinks/MetaLinks";

class Layout extends React.Component {
  render() {
    const { children } = this.props
    return (
      <Container>
        <MetaLinks />
        <Header />
        <Main>{children}</Main>
        <Footer />
      </Container>
    )
  }
}

export default Layout;
