import React from "react";
import { graphql } from "gatsby";
import { useGlobalState } from "../context/Context";

import { ContentHeader, Cover, Content, NavList, Link } from "./styles";

import CenteredLayout from "../components/CenteredLayout/CenteredLayout";
import SEO from "../components/SEO/SEO";
import ShareButton from "../components/ShareButton/shareButton";

const PostTemplate = (props) => {
  const [{ dark }] = useGlobalState();
  const post = props.data.markdownRemark;
  const { previous, next } = props.pageContext;

  return (
    <CenteredLayout location={props.location}>
      <SEO
        title={post.frontmatter.title}
        description={post.frontmatter.description}
      />
      <ContentHeader dark={dark}>
        <h1>{post.frontmatter.title}</h1>
        <div>
          <p>{post.frontmatter.date}</p>
          <p><a href={`https://twitter.com/${post.frontmatter.twitterUser}`} target="_blank" rel="noopener noreferrer">{post.frontmatter.twitterUser}</a></p>
        </div>
        <Cover fluid={post.frontmatter.banner.childImageSharp.fluid} />
        {
          post.frontmatter.url &&
          <h2>
            Enlace del proyecto: <a href={post.frontmatter.url} target="_blank" rel="noopener noreferrer">{post.frontmatter.url}</a>
          </h2>
        }
      </ContentHeader>
      <Content
        mt={post.frontmatter.url ? '0' : '45px'}
        dangerouslySetInnerHTML={{ __html: post.html }}
        dark={dark}
      />
      <ShareButton
        title={post.frontmatter.title}
        description={post.frontmatter.description}
        url={props.location.href}
        dark={dark}
      />
      <NavList dark={dark}>
        <li>
          {previous && (
            <Link
              to={previous.fields.slug}
              rel="prev"
            >
              ← {previous.frontmatter.title}
            </Link>
          )}
        </li>
        <li>
          {next && (
            <Link
              to={next.fields.slug}
              rel="next"
            >
              {next.frontmatter.title} →
            </Link>
          )}
        </li>
      </NavList>
    </CenteredLayout>
  );
};

export default PostTemplate;

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
        author
        twitterUser
        url
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
`;
