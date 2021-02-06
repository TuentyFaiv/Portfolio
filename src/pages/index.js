import React, { useEffect, useRef } from "react";
import { graphql } from "gatsby";
import { useGlobalState } from "../context/Context";

import { SectionOne, SectionTwo, SectionThree, Button } from "../styles/home";
import { GridPosts, NoContent } from "../styles/content";

import SEO from "../components/SEO/SEO";
import Layout from "../components/Layout/Layout";
import Card from "../components/Card/Card";

import hero from "../images/hero.jpg";

const IndexPage = ({ data }) => {
  const [{ dark }, dispatch] = useGlobalState();
  const mainRef = useRef(null);
  const favProjects = data.favs.edges || [];

  useEffect(() => {
    dispatch({ type: 'MAIN_REF', payload: mainRef.current });
  }, [mainRef.current]);

  return (
    <Layout>
      <SEO title="Inicio" />
      <SectionOne ref={mainRef} bg={hero}>
        <h1>Recuerda tener siempre la mente sana y el cuerpo sano.</h1>
        <p><span role="img" aria-label="icon">💪🏻</span></p>
        <Button to="/#favs" dark={dark}>Proyectos destacados</Button>
      </SectionOne>
      <SectionTwo dark={dark}>
        <h2>Piensa fuera de la caja, y no veas todo desde el miso angulo. <span role="img" aria-label="icon">👌🏻</span></h2>
        <h2>La mejor forma de aprender es enseñando, no importa si consideras que es poco por algo se empieza. <span role="img" aria-label="icon">😁</span></h2>
        <h2>Tratare de publicar contenido al menos una vez a la semana. <span role="img" aria-label="icon">🙌🏻</span> </h2>
        <h2>
          ¿Te gustaría compartir algo aquí? Mandame un mensaje a
          {" "}
          <a href="http://twitter.com/TuentyFaiv" target="_blank" rel="noopener noreferrer">Twitter</a>
          {" "}
          <span role="img" aria-label="icon">💬.</span>
        </h2>
      </SectionTwo>
      <SectionThree id="favs">
        <h2>Proyectos destacados</h2>
        {
          favProjects.length > 0 ?
            <GridPosts>
              {favProjects.map(({ node: { fields, frontmatter } }) => frontmatter.fav && (
                <Card
                  key={fields.slug}
                  slug={fields.slug}
                  image={frontmatter.banner.childImageSharp.fluid}
                  title={frontmatter.title}
                  date={frontmatter.date}
                  description={frontmatter.description}
                  author={frontmatter.author}
                  color={frontmatter.color}
                />)
              )}
            </GridPosts> :
            <NoContent>Aún no hay contenido vuelve en unos días <span role="img" aria-label="icon">😉</span></NoContent>
        }
        <Button to="/projects" dark={dark}>Ver más proyectos</Button>
      </SectionThree>
    </Layout>
  );
};

export default IndexPage;

export const indexQuery = graphql`
  query {
    favs: allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/posts/projects/" } }
      sort: { fields: [frontmatter___date], order: DESC }
    ) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
            author
            banner {
              childImageSharp {
                fluid(maxWidth: 1200, quality: 92) {
                  ...GatsbyImageSharpFluid_withWebp
                }
              }
            }
            color
            fav
          }
        }
      }
    }
  }
`;
