import type { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <strong style={{ fontSize: '1.2rem' }}>aimapkit</strong>,
  project: {
    link: 'https://github.com/antvis/aimapkit'
  },
  docsRepositoryBase: 'https://github.com/antvis/aimapkit',
  useSeo: true,
  sidebar: {
    defaultMenuCollapseLevel: 2,
    toggleButton: true
  },
  toc: {
    backToTop: true
  },
  search: {
    placeholder: '搜索文档...'
  },
  editLink: {
    text: '在 GitHub 上编辑此页 →'
  },
  feedback: {
    content: '有问题? 请提交反馈 →'
  },
  footer: {
    text: '© 2026 AntV. All rights reserved.'
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="aimapkit - Schema 驱动的地图可视化" />
      <meta property="og:description" content="基于 L7 的 React 地图可视化组件库,支持 Schema 驱动,AI 友好" />
      <link rel="icon" href="/favicon.ico" />
    </>
  )
}

export default config
