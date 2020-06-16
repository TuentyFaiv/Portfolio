import React from "react";
import { StaticQuery, graphql } from "gatsby";
import { MainSection, GridPosts, NoContent } from "../../styles/content";

import Card from "../Card/Card";

function BlogPostGrid() {
  return (
    <StaticQuery
      query={blogPostQuery}
      render={data => {
        const posts = data.allMarkdownRemark.edges || [];
        return (
          <MainSection>
            {
              posts.length > 0 ?
                <GridPosts>
                  {posts.map(({ node }) => (
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
        );
      }}
    />
  );
};

const blogPostQuery = graphql`
  query BlogPostQuery {
    allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/posts/blog/" } }
      sort: { fields: [frontmatter___date], order: DESC }
    ) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            title
            date(formatString: "MMMM DD, YYYY")
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

export default BlogPostGrid;