import React from "react";
import { StaticQuery, graphql } from "gatsby";

import Card from "../Card/Card";

function BlogPostGrid() {
  return (
    <StaticQuery
      query={blogPostQuery}
      render={data => {
        const posts = data.allMarkdownRemark.edges;
        return (
          <section className="page-main__section">
            <div className="blog-posts__container">
              {posts.map(({ node }) => (
                <Card
                  key={node.fields.slug}
                  slug={node.fields.slug}
                  image={node.frontmatter.banner.childImageSharp.fluid}
                  title={node.frontmatter.title}
                  date={node.frontmatter.date}
                  description={node.frontmatter.description}
                />
              ))}
            </div>
          </section>
        );
      }}
    />
  );
};

const blogPostQuery = graphql`
  query BlogPostQuery {
    allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/posts/" } }
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
            twitterUser
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

export default BlogPostGrid;
