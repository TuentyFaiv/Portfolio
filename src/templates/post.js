import React from "react";
import { graphql } from "gatsby";

import { GlobalStyles } from "../styles/GlobalStyles";
import { HeaderPost, Cover, Content, NavList, Link, URL } from "./styles";

import CenteredLayout from "../components/CenteredLayout/CenteredLayout";
import SEO from "../components/SEO/SEO";
import ShareButton from "../components/ShareButton/shareButton";

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark;
    const { previous, next } = this.props.pageContext;
    return (
      <>
        <GlobalStyles />
        <CenteredLayout location={this.props.location}>
          <SEO
            title={post.frontmatter.title}
            description={post.frontmatter.description}
          />
          <h1>{post.frontmatter.title}</h1>
          <HeaderPost>
            <p>{post.frontmatter.date}</p>
            <p><a href={`https://twitter.com/${post.frontmatter.twitterUser}`} target="_blank" rel="noopener noreferrer">{post.frontmatter.twitterUser}</a></p>
          </HeaderPost>
          <Cover fluid={post.frontmatter.banner.childImageSharp.fluid} />
          {
            post.frontmatter.url &&
            <URL>
              Enlace del proyecto:
                {' '}
              <a href={post.frontmatter.url} target="_blank" rel="noopener noreferrer">{post.frontmatter.url}</a>
            </URL>
          }
          <Content
            mt={post.frontmatter.url ? '0' : '45px'}
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
          <ShareButton
            title={post.frontmatter.title}
            description={post.frontmatter.description}
            url={this.props.location.href}
          />
          <NavList>
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
      </>
    );
  }
}

export default BlogPostTemplate;

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
