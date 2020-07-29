import React from "react";
import { graphql } from "gatsby";
import { GridPosts, NoContent } from "../styles/content";

import SEO from "../components/SEO/SEO";
import CenteredLayout from "../components/CenteredLayout/CenteredLayout";
import Card from "../components/Card/Card";

const ProjectsPage = ({ data, location }) => {
  const projects = data.favs.edges || [];
  const siteTitle = data.site.siteMetadata.title;
  return (
    <CenteredLayout location={location} title={siteTitle}>
      <SEO
        title="Projects"
        keywords={[`projects`, `gatsby`, `javascript`, `react`, `TuentyFaiv`]}
      />
      <h1>
        Projects
      </h1>
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
    </CenteredLayout>
  );
};

export default ProjectsPage;

export const indexQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
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
          }
        }
      }
    }
  }
`;
