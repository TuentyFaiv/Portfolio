import React, { useEffect, useRef } from "react";
import { useGlobalState } from "../context/Context";

import { Widget, Button } from "../styles/mentoring";

import SEO from "../components/SEO/SEO";
import Layout from "../components/Layout/Layout";
import { Title } from "../styles/content";

const Mentoring = () => {
  const [{ dark, native }, dispatch] = useGlobalState();
  const mainRef = useRef(null);

  useEffect(() => {
    const head = document.querySelector('head');
    const script = document.createElement('script');
    script.setAttribute('src', 'https://assets.calendly.com/assets/external/widget.js');
    head.appendChild(script);
  }, []);

  useEffect(() => {
    dispatch({ type: 'MAIN_REF', payload: mainRef.current });
  }, [mainRef.current]);

  return (
    <Layout>
      <SEO title="Mentorías" description="Si estas aquí es porque quieres que te comparta del poco conocimiento que poseo para iniciar en el desarrollo web 😁" />
      <Title ref={mainRef} margin={!native}>Mentorías</Title>
      <Widget
        className="calendly-inline-widget"
        data-url="https://calendly.com/tuentyfaiv/compartiendo-conocimiento?text_color=333333&primary_color=961e1e"
      />
      <Button to="/blog" dark={dark}>Lee alguno de mis blogs <span role="img" aria-label="wink">😁</span></Button>
    </Layout>
  );
};

export default Mentoring;
