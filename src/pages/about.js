import React, { useEffect, useRef } from "react";
import { graphql } from "gatsby";
import { FaTwitter, FaLinkedin, FaTelegramPlane } from "react-icons/fa";
import { useGlobalState } from "../context/Context";

import { Content, Info, SubTitle, Socials } from "../styles/about";
import { Title } from "../styles/content";

import SEO from "../components/SEO/SEO";
import Layout from "../components/Layout/Layout";

const About = ({ data }) => {
  const [{ dark, native }, dispatch] = useGlobalState();
  const mainRef = useRef(null);
  const { content: { html: __html } } = data;

  useEffect(() => {
    dispatch({ type: 'MAIN_REF', payload: mainRef.current });
  }, [mainRef.current]);

  return (
    <Layout centered>
      <SEO title="Acerca de mí" />
      <Title ref={mainRef} margin={!native}>Acerca de mí</Title>
      <Content dangerouslySetInnerHTML={{ __html }} />
      <SubTitle>¿Quieres colaborar conmigo?</SubTitle>
      <Info>
        Puedes contactarme por Twitter, LinkedIn ó Telegram:
        <Socials dark={dark}>
          <li>
            <a
              href="https://twitter.com/TuentyFaiv"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              title="Twitter"
            >
              <FaTwitter size={32} />
              <h4>Twitter</h4>
            </a>
          </li>
          <li>
            <a
              href="https://www.linkedin.com/in/tuentyfaiv/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
            >
              <FaLinkedin size={32} />
              <h4>LinkedIn</h4>
            </a>
          </li>
          <li>
            <a
              href="https://t.me/TuentyFaiv/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              title="Telegram"
            >
              <FaTelegramPlane size={32} />
              <h4>Telegram</h4>
            </a>
          </li>
        </Socials>
      </Info>
    </Layout>
  );
};

export default About;

export const pageQuery = graphql`
  query {
    content: markdownRemark(fileAbsolutePath: { regex: "/about.md/" }) {
      html
    }
  }
`;
