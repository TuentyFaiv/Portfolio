import React from "react";
import { Link, graphql } from "gatsby";
import Img from "gatsby-image";

import CenteredLayout from "../components/CenteredLayout/CenteredLayout";
import SEO from "../components/SEO/SEO";
import ShareButton from "../components/ShareButton/shareButton";

// Styles
import styles from "./blogPost.module.scss";

class ProjectPostTemplate extends React.Component {
  render() {
    const project = this.props.data.markdownRemark;
    const { previous, next } = this.props.pageContext;
    return (
      <CenteredLayout location={this.props.location}>
        <SEO
          title={project.frontmatter.title}
          description={project.frontmatter.description}
        />
        <h1>{project.frontmatter.title}</h1>
        <div
          style={{
            display: `flex`,
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <p style={{ margin: `15px 5px` }}>{project.frontmatter.date}</p>
          <p style={{ margin: `15px 5px` }}><a style={{ textDecoration: 'underline' }} href={`https://twitter.com/${project.frontmatter.twitterUser}`} target="_blank" rel="noopener noreferrer">{project.frontmatter.author}</a></p>
        </div>
        <Img fluid={project.frontmatter.banner.childImageSharp.fluid} />
        <div
          className={styles.blogPostContent}
          dangerouslySetInnerHTML={{ __html: project.html }}
        />
        <ShareButton
          title={project.frontmatter.title}
          description={project.frontmatter.description}
          url={this.props.location.href}
        />
        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link
                style={{ textDecoration: `underline` }}
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
                style={{ textDecoration: `underline` }}
                to={next.fields.slug}
                rel="next"
              >
                {next.frontmatter.title} →
              </Link>
            )}
          </li>
        </ul>
      </CenteredLayout>
    );
  }
}

export default ProjectPostTemplate;

export const pageQuery = graphql`
  query ProjectPostBySlug($slug: String!) {
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
