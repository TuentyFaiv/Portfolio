import React from "react";
import { graphql } from "gatsby";
import CenteredLayout from "../components/CenteredLayout/CenteredLayout";
import SEO from "../components/SEO/SEO";

import "../styles/app.scss";

class About extends React.Component {
  render() {
    const { data: { markdownRemark: { html } } } = this.props;
    return (
      <CenteredLayout location={this.props.location}>
        <SEO title="About" />
        <div className="about__content" dangerouslySetInnerHTML={{ __html: html }} />
      </CenteredLayout>
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
