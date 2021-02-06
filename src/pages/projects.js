import React, { useEffect, useRef } from "react";
import { graphql } from "gatsby";
import { useGlobalState } from "../context/Context";

import { Title, GridPosts, MainSection, NoContent } from "../styles/content";

import SEO from "../components/SEO/SEO";
import Layout from "../components/Layout/Layout";
import Card from "../components/Card/Card";

const ProjectsPage = ({ data }) => {
  const [{ native }, dispatch] = useGlobalState();
  const mainRef = useRef(null);
  const projects = data.projects.edges || [];

  useEffect(() => {
    dispatch({ type: 'MAIN_REF', payload: mainRef.current });
  }, [mainRef.current]);

  return (
    <Layout centered>
      <SEO title="Proyectos" keywords={['projects', 'proyectos']} />
      <Title ref={mainRef} margin={!native}>Proyectos</Title>
      <MainSection>
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
                  color={node.frontmatter.color}
                />
              ))}
            </GridPosts> :
            <NoContent>Aún no hay contenido vuelve en unos días <span role="img" aria-label="icon">😉</span></NoContent>
        }
      </MainSection>
    </Layout>
  );
};

export default ProjectsPage;

export const indexQuery = graphql`
  query {
    projects: allMarkdownRemark(
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
          }
        }
      }
    }
  }
`;
