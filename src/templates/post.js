import React from "react";
import { graphql } from "gatsby";
import { useGlobalState } from "../context/Context";

import { ContentHeader, Cover, Content, NavList, Link } from "./styles";

import CenteredLayout from "../components/CenteredLayout/CenteredLayout";
import SEO from "../components/SEO/SEO";
import ShareButton from "../components/ShareButton/shareButton";

const PostTemplate = ({ data: { markdownRemark }, pageContext, location }) => {
  const [{ dark }] = useGlobalState();
  const { frontmatter: { title, description, date, twitterUser, banner, url, withoutUrl }, html } = markdownRemark;
  const { previous, next } = pageContext;

  return (
    <CenteredLayout location={location}>
      <SEO
        title={title}
        description={description}
        article={true}
        // image={banner}
      />
      <ContentHeader dark={dark}>
        <h1>{title}</h1>
        <div>
          <p>{date}</p>
          <p><a href={`https://twitter.com/${twitterUser}`} target="_blank" rel="noopener noreferrer">{twitterUser}</a></p>
        </div>
        <Cover fluid={banner.childImageSharp.fluid} />
        <div>
          <p>{description}</p>
          <h2>
            {
              url &&
              <>Enlace del proyecto: <a href={url} target="_blank" rel="noopener noreferrer">{url}</a></>
            }
            {
              withoutUrl && withoutUrl
            }
          </h2>
        </div>
      </ContentHeader>
      <Content
        dangerouslySetInnerHTML={{ __html: html }}
        dark={dark}
      />
      <ShareButton
        title={title}
        description={description}
        url={location.href}
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
        twitterUser
        url
        withoutUrl
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
