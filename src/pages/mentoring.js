import React, { useEffect } from "react";
import { Link } from "gatsby";

import SEO from "../components/SEO/SEO";
import CenteredLayout from "../components/CenteredLayout/CenteredLayout";
import Button from "@material/react-button";

import "../styles/app.scss";

const Mentoring = () => {
  useEffect(() => {
    const head = document.querySelector('head');
    const script = document.createElement('script');
    script.setAttribute('src', 'https://assets.calendly.com/assets/external/widget.js');
    head.appendChild(script);
  }, []);

  return (
    <CenteredLayout>
      <SEO title="Mentoring" description="Si estas aquí es porque quieres que te comparta del poco conocimiento que poseo para iniciar en el desarrollo web 😁" />
      <div
        className="calendly-inline-widget"
        data-url="https://calendly.com/tuentyfaiv/compartiendo-conocimiento?text_color=333333&primary_color=961e1e"
        style={{
          minWidth: '280px',
          minHeight: '800px',
          height: '800px',
          margin: '40px 0',
          overflowY: 'none'
        }}
      />
      <Link to="/blog">
        <Button
          raised
          className="mdc-button--round"
          style={{
            display: 'block',
            margin: '5px auto'
          }}
        >
          Lee alguno de mis blogs <span role="img" aria-label="wink">😁</span>
        </Button>
      </Link>
    </CenteredLayout>
  );
};

export default Mentoring;
