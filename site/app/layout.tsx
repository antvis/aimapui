import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'aimapkit - Schema 驱动的地图可视化组件库',
    template: '%s | aimapkit'
  },
  description: '基于 L7 的 React 地图可视化组件库,支持 Schema 驱动,AI 友好',
  keywords: ['地图可视化', 'React', 'L7', 'AntV', 'Schema', 'GIS'],
  authors: [{ name: 'AntV Team' }],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://aimapkit.antv.vision',
    siteName: 'aimapkit'
  }
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
