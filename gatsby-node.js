const path = require(`path`);
const { createFilePath } = require(`gatsby-source-filesystem`);

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;

  const postPage = path.resolve(`./src/templates/post.js`);

  return graphql(
    `
      {
        blogs: allMarkdownRemark(filter: {fileAbsolutePath: {regex: "/posts/blog/"}}, sort: {fields: [frontmatter___date], order: DESC}, limit: 1000) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
              }
            }
          }
        }
        projects: allMarkdownRemark(filter: {fileAbsolutePath: {regex: "/posts/projects/"}}, sort: {fields: [frontmatter___date], order: DESC}, limit: 1000) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
              }
            }
          }
        }
      }
    `
  ).then(result => {
    if (result.errors) {
      throw result.errors;
    }

    // Create blog and project posts pages.
    const posts = result.data.blogs.edges;
    const projects = result.data.projects.edges;

    posts.forEach((post, index) => {
      const previous = index === posts.length - 1 ? null : posts[index + 1].node;
      const next = index === 0 ? null : posts[index - 1].node;
      const slug = post.node.fields.slug;

      createPage({
        path: slug,
        component: postPage,
        context: {
          slug,
          previous,
          next,
        },
      });
    });

    projects.forEach((post, index) => {
      const previous = index === projects.length - 1 ? null : projects[index + 1].node;
      const next = index === 0 ? null : projects[index - 1].node;
      const slug = post.node.fields.slug;

      createPage({
        path: slug,
        component: postPage,
        context: {
          slug,
          previous,
          next,
        },
      });
    });

    return null;
  });
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode });
    createNodeField({
      name: `slug`,
      node,
      value,
    });
  }
};
