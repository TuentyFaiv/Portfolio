import React from "react";
import { graphql } from "gatsby";

import SEO from "../components/SEO/SEO";
import Layout from "../components/Layout/Layout";
import Card from "../components/Card/Card";

import hero from "../images/hero.jpg";

import "../styles/app.scss";

class IndexPage extends React.Component {
  render() {
    const { data } = this.props;
    const projects = data.allMarkdownRemark.edges || [];
    return (
      <Layout>
        <SEO title="Home" />
        <section className="home--section1">
          <img src={hero} alt="hero" />
          <div className="home--section1-overlay">
            <h1>Recuerda tener siempre la mente sana y el cuerpo sano.</h1>
            <p><span role="img" aria-label="icon">💪🏻</span></p>
          </div>
        </section>
        <section className="home--section2">
          <h3>Piensa fuera de la caja, y no veas todo desde el miso angulo. <span role="img" aria-label="icon">👌🏻</span></h3>
          <h3>La mejor forma de aprender es enseñando, no importa si consideras que es poco por algo se empieza. <span role="img" aria-label="icon">😁</span></h3>
          <h3>Tratare de publicar contenido al menos una vez a la semana. <span role="img" aria-label="icon">🙌🏻</span> </h3>
          <h3>
            ¿Te gustaría compartir algo aquí? Mandame un mensaje a
            {" "}
            <a
              style={{
                color: 'cyan',
                textDecoration: 'underline'
              }}
              href="http://twitter.com/TuentyFaiv" target="_blank" rel="noopener noreferrer"
            >
              Twitter
            </a>
            {" "}
            <span role="img" aria-label="icon">💬.</span>
          </h3>
        </section>
        <section className="home--section3">
          <h2>Projects</h2>
          {
            projects.length > 0 ?
              <div className="blog-posts__container">
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
              </div>
              : <h3 className="withoutContent">Aún no hay contenido vuelve en unos días <span role="img" aria-label="icon">😉</span></h3>
          }

        </section>
      </Layout>
    );
  }
}

export default IndexPage;

export const indexQuery = graphql`
  query {
    allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/projects/" } }
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
