import React, { useEffect, useRef } from "react";
import { graphql } from "gatsby";
import { useGlobalState } from "../context/Context";

import { Title, GridPosts, MainSection, NoContent } from "../styles/content";

import Layout from "../components/Layout/Layout";
import SEO from "../components/SEO/SEO";
import Card from "../components/Card/Card";

const BlogPage = ({ data }) => {
  const [{ native }, dispatch] = useGlobalState();
  const mainRef = useRef(null);
  const posts = data.blogs.edges || [];

  useEffect(() => {
    dispatch({ type: 'MAIN_REF', payload: mainRef.current });
  }, [mainRef.current]);

  return (
    <Layout centered>
      <SEO title="Blog" keywords={['blog']} />
      <Title ref={mainRef} margin={!native}>Blog</Title>
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
    </Layout>
  );
};

export default BlogPage;

export const pageQuery = graphql`
  query {
    blogs: allMarkdownRemark(
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
