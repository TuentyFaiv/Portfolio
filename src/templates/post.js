import React, { useEffect, useRef } from "react";
import { graphql } from "gatsby";
import { useGlobalState } from "../context/Context";

import { ContentHeader, Title, Cover, Content, NavList, Link } from "./styles";

import Layout from "../components/Layout/Layout";
import SEO from "../components/SEO/SEO";
import ShareButton from "../components/ShareButton/shareButton";

const PostTemplate = ({ data: { post }, pageContext, location }) => {
  const [{ dark, native }, dispatch] = useGlobalState();
  const mainRef = useRef(null);
  const { frontmatter: { title, description, date, twitterUser, banner, url, withoutUrl }, html: __html } = post;
  const { previous, next } = pageContext;

  useEffect(() => {
    dispatch({ type: 'MAIN_REF', payload: mainRef.current });
  }, [mainRef.current]);

  return (
    <Layout centered>
      <SEO
        title={title}
        description={description}
        article={true}
        image={banner.childImageSharp.fluid.src}
      />
      <ContentHeader ref={mainRef} dark={dark} padding={!native}>
        <Title>{title}</Title>
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
            {withoutUrl && withoutUrl}
          </h2>
        </div>
      </ContentHeader>
      <Content dangerouslySetInnerHTML={{ __html }} dark={dark} />
      <ShareButton
        title={title}
        description={description}
        url={location.href}
        dark={dark}
      />
      <NavList dark={dark}>
        <li>
          {previous && (
            <Link to={previous.fields.slug} rel="prev">← {previous.frontmatter.title}</Link>
          )}
        </li>
        <li>
          {next && (
            <Link to={next.fields.slug} rel="next">{next.frontmatter.title} →</Link>
          )}
        </li>
      </NavList>
    </Layout>
  );
};

export default PostTemplate;

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    post: markdownRemark(fields: { slug: { eq: $slug } }) {
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
