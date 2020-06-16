import React from "react";
import { graphql } from "gatsby";
import { GlobalStyles } from "../styles/GlobalStyles";
import { Content } from "../styles/about";

import SEO from "../components/SEO/SEO";
import CenteredLayout from "../components/CenteredLayout/CenteredLayout";

class About extends React.Component {
  render() {
    const { data: { markdownRemark: { html } } } = this.props;
    return (
      <>
        <GlobalStyles />
        <CenteredLayout location={this.props.location}>
          <SEO title="About" />
          <Content dangerouslySetInnerHTML={{ __html: html }} />
        </CenteredLayout>
      </>
    );
  }
}

export default About;

export const pageQuery = graphql`
  query {
    markdownRemark(fileAbsolutePath: { regex: "/about.md/" }) {
      html
    }
  }
`;
