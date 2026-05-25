const { default: nextra } = require('nextra')
const path = require('path')

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
  webpack: (config) => {
    // Ensure @antv/aimapkit dist uses the same React instance as site
    config.resolve.alias = {
      ...config.resolve.alias,
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'aimapkit-css': path.resolve(__dirname, '..', 'dist', 'aimapkit.css'),
    }
    return config
  },
})