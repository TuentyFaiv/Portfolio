import React from "react";
import { Link, graphql } from "gatsby";
import { GlobalStyles } from "../styles/GlobalStyles";
import { SectionOne, SectionOneOverlay, Overlay, SectionTwo, SectionThree, Button } from "../styles/home";
import { GridPosts, NoContent } from "../styles/content";

import SEO from "../components/SEO/SEO";
import Layout from "../components/Layout/Layout";
import Card from "../components/Card/Card";

import hero from "../images/hero.jpg";

class IndexPage extends React.Component {
  render() {
    const { data } = this.props;
    const projects = data.allMarkdownRemark.edges || [];
    return (
      <>
        <GlobalStyles />
        <Layout>
          <SEO title="Home" />
          <SectionOne>
            <SectionOneOverlay>
              <img src={hero} alt="hero" />
              <Overlay />
              <h1>Recuerda tener siempre la mente sana y el cuerpo sano.</h1>
              <p><span role="img" aria-label="icon">💪🏻</span></p>
              <Link to="/#projects">
                <Button>Ver proyectos</Button>
              </Link>
            </SectionOneOverlay>
          </SectionOne>
          <SectionTwo>
            <h2>Piensa fuera de la caja, y no veas todo desde el miso angulo. <span role="img" aria-label="icon">👌🏻</span></h2>
            <h2>La mejor forma de aprender es enseñando, no importa si consideras que es poco por algo se empieza. <span role="img" aria-label="icon">😁</span></h2>
            <h2>Tratare de publicar contenido al menos una vez a la semana. <span role="img" aria-label="icon">🙌🏻</span> </h2>
            <h2>
              ¿Te gustaría compartir algo aquí? Mandame un mensaje a
              {" "}
              <a href="http://twitter.com/TuentyFaiv" target="_blank" rel="noopener noreferrer">
                Twitter
              </a>
              {" "}
              <span role="img" aria-label="icon">💬.</span>
            </h2>
          </SectionTwo>
          <SectionThree id="projects">
            <h2>Projects</h2>
            {
              projects.length > 0 ?
                <GridPosts>
                  {projects.map(({ node }) => (
                    <Card
                      key={node.fields.slug}
                      slug={node.fields.slug}
                      image={node.frontmatter.banner.childImageSharp.fluid}
                      title={node.frontmatter.title}
                      date={node.frontmatter.date}
                      description={node.frontmatter.description}
                      author={node.frontmatter.author}
                    />
                  ))}
                </GridPosts> :
                <NoContent>Aún no hay contenido vuelve en unos días <span role="img" aria-label="icon">😉</span></NoContent>
            }
          </SectionThree>
        </Layout>
      </>
    );
  }
}

export default IndexPage;

export const indexQuery = graphql`
  query {
    allMarkdownRemark(
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
          }
        }
      }
    }
  }
`;
