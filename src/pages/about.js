import React from "react";
import { graphql } from "gatsby";
import { FaTwitter, FaLinkedin, FaTelegramPlane } from "react-icons/fa";
import { useGlobalState } from "../context/Context";
import { Content, Info, SubTitle, Socials } from "../styles/about";

import SEO from "../components/SEO/SEO";
import CenteredLayout from "../components/CenteredLayout/CenteredLayout";

const About = (props) => {
  const [{ dark }] = useGlobalState();
  const { data: { markdownRemark: { html } } } = props;

  return (
    <CenteredLayout location={props.location}>
      <SEO title="About" />
      <Content dangerouslySetInnerHTML={{ __html: html }} />
      <SubTitle>¿Quieres colaborar conmigo?</SubTitle>
      <Info>
        Puedes contactarme por Twitter, LinkedIn ó Telegram:
        <Socials dark={dark}>
          <li>
            <a href="https://twitter.com/TuentyFaiv" target="_blank" rel="noopener noreferrer" >
              <FaTwitter size={32} />
              <h4>Twitter</h4>
            </a>
          </li>
          <li>
            <a href="https://www.linkedin.com/in/tuentyfaiv/" target="_blank" rel="noopener noreferrer" >
              <FaLinkedin size={32} />
              <h4>LinkedIn</h4>
            </a>
          </li>
          <li>
            <a href="https://t.me/TuentyFaiv/" target="_blank" rel="noopener noreferrer" >
              <FaTelegramPlane size={32} />
              <h4>Telegram</h4>
            </a>
          </li>
        </Socials>
      </Info>
    </CenteredLayout>
  );
};

export default About;

export const pageQuery = graphql`
  query {
    markdownRemark(fileAbsolutePath: { regex: "/about.md/" }) {
      html
    }
  }
`;
