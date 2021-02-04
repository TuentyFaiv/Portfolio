import React from "react"
import Helmet from "react-helmet"

const MetaLinks = () => {
  return (
    <>
      <Helmet>
        <html lang="es" />
        <meta http-equiv="refresh" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;700&family=Playfair+Display:wght@900&display=swap" rel="stylesheet" />
      </Helmet>
    </>
  );
};

export default MetaLinks;
