const path = require('path')

const IS_EXEC_BUILD = process.env.gatsby_executing_command === 'build'
const IS_PROD = process.env.PRODUCTION === 'true' ||
  process.env.NODE_ENV === 'production' ||
  process.env.RENDER === 'true'
const ENABLE_IMAGE_PLUGINS = false
  
/**
 * 根据条件生成配置，需要展开
 * @param cond boolean 条件
 * @param v any 配置
 * @returns {[v]} 返回 [v] 或 []
 */
const needPlugin = (cond, v) => (cond ? [v] : [])

// 提供一些警告
if (IS_PROD && !IS_EXEC_BUILD) {
  console.warn('Using production configurations in non-build environment')
} else if (!IS_PROD && process.env.CI === 'true') {
  console.warn('Using development configurations in build environment')
}

const fontURL = 'https://cdn.jsdelivr.net/npm/mathjax@3.0.5/es5/output/chtml/fonts/woff-v2'
const mathRehype = IS_EXEC_BUILD
  ? [require('rehype-mathjax/chtml'), { fontURL }]
  : [require('rehype-mathjax/browser')]

const { remarkDetails, rehypeDetails } = require('./gatsby-config.esm')

module.exports = {
  plugins: [
    {
      resolve: 'gatsby-source-local-git',
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: './docs',
        path: path.resolve('./docs'),
      },
    },
    ...needPlugin(ENABLE_IMAGE_PLUGINS && IS_PROD, 'gatsby-plugin-sharp'),
    'gatsby-transformer-sharp',
    {
      resolve: 'gatsby-transformer-remark-rehype',
      options: {
        plugins: [
          ...needPlugin(ENABLE_IMAGE_PLUGINS && IS_PROD, {
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: 900,
              withWebp: true,
              tracedSVG: false,
              linkImagesToOriginal: false,
              disableBgImageOnAlpha: true,
            },
          }),
          {
            resolve: 'gatsby-remark-copy-linked-files',
            options: {
              ignoreFileExtensions: ['md'],
            },
          },
          /** {
              resolve: `gatsby-remark-autolink-headers`,
              options: {
                isIconAfterHeader: true,
              },
            }, */
          {
            resolve: 'gatsby-local-autolink-headers',
            options: {
              isIconAfterHeader: true,
            },
          },
          {
            resolve: path.resolve(__dirname, 'plugins/gatsby-remark-snippets'),
          },
        ],
        remarkPlugins: [
          require('remark-math'),
          remarkDetails,
          rehypeDetails,
          [require('@mgtd/remark-shiki'), {
            semantic: false,
            theme: 'light-plus',
            skipInline: true,
          }],
        ],
        rehypePlugins: [
          require('./plugins/rehype-pseudocodejs'),
          mathRehype,
        ],
        // extensions: ['.mdx', '.md'],
      },
    },
    {
      resolve: 'gatsby-plugin-material-ui',
      options: {
        stylesProvider: {
          injectFirst: true,
        },
      },
    },
    {
      resolve: 'gatsby-plugin-catch-links',
    },
    {
      resolve: 'gatsby-plugin-react-helmet',
    },
    ...needPlugin(IS_PROD, {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'OI Wiki',
        short_name: 'OI Wiki',
        start_url: '/',
        display: 'standalone',
        icon: require.resolve('./icon/favicon_512x512.png'),
      },
    }),
    {
      resolve: 'gatsby-plugin-offline',
      options: {
        precachePages: [],
        workboxConfig: {
          importWorkboxFrom: 'local',
          globPatterns: ['*.js'],
          runtimeCaching: [
            {
              urlPattern: /(\.js$|\.css$)/, // js and css
              handler: 'CacheFirst',
            },
            {
              urlPattern: /^https?:.*\.(json)$/, // page-data
              handler: 'NetworkFirst',
            },
            {
              urlPattern: /^https?:.*\.(woff|woff2)$/, // mathjax fonts
              handler: 'StaleWhileRevalidate',
            },
            {
              urlPattern: /^https?:.*\.(png|jpg|jpeg|webp|svg|gif|tiff)$/, // do not cache images
              handler: 'NetworkOnly',
            },
          ],
          skipWaiting: true,
          clientsClaim: true,
        },
      },
    },
    {
      resolve: 'gatsby-plugin-typegen',
      options: {
        outputPath: path.resolve(__dirname, 'src/__generated__/gatsby-types.d.ts'),
        emitSchema: {
          [path.resolve(__dirname, 'src/__generated__/gatsby-schema.graphql')]: true,
          [path.resolve(__dirname, 'src/__generated__/gatsby-introspection.json')]: true,
        },
        emitPluginDocuments: {
          [path.resolve(__dirname, 'src/__generated__/gatsby-plugin-documents.graphql')]: true,
        },
      },
    },
    'gatsby-plugin-preact',
    // "gatsby-plugin-webpack-bundle-analyser-v2",
    // when you need to analyze bundle size, enable it
  ],
}
