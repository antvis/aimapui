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
  transpilePackages: ['@antv/aimapui', '@antv/l7', '@antv/l7-maps'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'aimapui-css': path.resolve(__dirname, '..', 'dist', 'aimapui.css'),
    }
    return config
  },
})