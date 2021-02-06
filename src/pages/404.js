import React, { useEffect, useRef } from "react";
import { useGlobalState } from "../context/Context";

import { Image, Button, Text } from "../styles/notFound";
import { Title } from "../styles/content";

import SEO from "../components/SEO/SEO";
import Layout from "../components/Layout/Layout";

import awkwardKidGif from "../images/awkward-kid.gif";

const NotFoundPage = () => {
  const [{ dark, native }, dispatch] = useGlobalState();
  const mainRef = useRef(null);

  useEffect(() => {
    dispatch({ type: 'MAIN_REF', payload: mainRef.current });
  }, [mainRef.current]);

  return (
    <Layout>
      <SEO title="404: Página no encontrada" />
      <Title ref={mainRef} margin={!native}>Oh... esto es incómodo</Title>
      <Image src={awkwardKidGif} alt="awkward kid gif" />
      <Text>
        ¡Mmmm! Parece que el lugar que buscaba ya no está aquí o
        hay un error tipográfico. Verifique que no haya errores en la URL y vuelva a intentarlo.{" "}
        <span role="img" aria-label="wink">😉</span>
      </Text>
      <Button to="/" dark={dark}>Ir al inicio</Button>
    </Layout>
  );
};

export default NotFoundPage;
