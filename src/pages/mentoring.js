import React, { useEffect } from "react";
import { Link } from "gatsby";
import { Widget, Button } from "../styles/mentoring";

import SEO from "../components/SEO/SEO";
import CenteredLayout from "../components/CenteredLayout/CenteredLayout";

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
      <Widget
        className="calendly-inline-widget"
        data-url="https://calendly.com/tuentyfaiv/compartiendo-conocimiento?text_color=333333&primary_color=961e1e"
      />
      <Link to="/blog">
        <Button>
          Lee alguno de mis blogs <span role="img" aria-label="wink">😁</span>
        </Button>
      </Link>
    </CenteredLayout>
  );
};

export default Mentoring;
