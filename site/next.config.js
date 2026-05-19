const { default: nextra } = require('nextra')

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
})

module.exports = withNextra({
  output: 'export',
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@antv/aimapkit', '@antv/l7', '@antv/l7-maps'],
})