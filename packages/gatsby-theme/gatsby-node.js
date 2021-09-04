const fs = require('fs');
const path = require('path');

exports.onPreBootstrap = ({ reporter }) => {
  const contentPath = 'content';

exports.onPreBootstrap = ({ reporter }, { contentPath = 'content' }) => {
  if (!fs.existsSync(contentPath)) {
    reporter.info(`creating the ${contentPath} directory`);

    fs.mkdirSync(contentPath);
  }
};

exports.createPages = async (
  { actions, graphql, reporter },
  { basePath = '/' },
) => {
  const { createPage } = actions;

  const result = await graphql(`
    query {
      allMdx {
        edges {
          node {
            slug
            frontmatter {
              icon {
                name
                variant
              }
              title
            }
            body
          }
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panic('error loading content', reporter.errors);

    return;
  }

  createPage({
    path: basePath,
    component: path.resolve('./src/components/desktop.js'),
    context: { content: {}, data: result.data },
  });

  const contents = result.data.allMdx.edges;

  contents.forEach(({ node }) => {
    const { slug } = node;

    createPage({
      path: slug,
      component: path.resolve('./src/components/desktop.js'),
      context: { content: node, data: result.data },
    });
  });
};

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: ['ts-loader'],
        },
      ],
    },
  });
};
