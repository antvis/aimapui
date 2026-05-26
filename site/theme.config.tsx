import type { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: (
    <span style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, letterSpacing: '-0.02em' }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor" opacity="0.15"/>
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <circle cx="12" cy="9" r="2.5" fill="currentColor"/>
      </svg>
      AiMapUI
    </span>
  ),
  project: {
    link: 'https://github.com/antvis/aimapui'
  },
  docsRepositoryBase: 'https://github.com/antvis/aimapui',
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
    content: '在 GitHub 上编辑此页 →'
  },
  feedback: {
    content: '有问题? 请提交反馈 →'
  },
  footer: {
    content: (
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>© 2026 AntV · AiMapUI</span>
        <div style={{ display: 'flex', gap: 20, fontSize: '0.85rem' }}>
          <a href="https://antv.antgroup.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--muted-foreground)', textDecoration: 'none' }}>AntV 生态</a>
          <a href="https://l7.antv.antgroup.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--muted-foreground)', textDecoration: 'none' }}>L7</a>
          <a href="https://github.com/antvis/aimapui" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--muted-foreground)', textDecoration: 'none' }}>GitHub</a>
        </div>
      </div>
    )
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="AiMapUI - Schema 驱动的 React 地图可视化" />
      <meta property="og:description" content="基于 L7 的 React 地图可视化组件库，Schema 驱动，AI 原生，支持 6+8 图层类型、7 种底图引擎、Material Design 3 设计体系" />
      <meta property="og:keywords" content="地图可视化,React,L7,AntV,Schema,AI,GIS,组件库" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
    </>
  )
}

export default config