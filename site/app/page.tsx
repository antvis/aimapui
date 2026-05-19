import Link from 'next/link'

export default function HomePage() {
  return (
    <main>
      {/* Hero 区域 */}
      <section className="hero">
        <div className="hero-content">
          <h1>aimapkit</h1>
          <p className="text-3xl mb-4">Schema 驱动的 React 地图可视化组件库</p>
          <p className="subtitle">
            只需一个 JSON Schema,即可生成完整的地图可视化应用
          </p>
          <div className="hero-actions">
            <Link href="/docs/getting-started/quick-start">
              快速开始 →
            </Link>
            <Link href="/examples">
              查看示例
            </Link>
          </div>
        </div>
      </section>

      {/* Features 区域 */}
      <section className="features bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">核心特性</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card">
              <h3 className="text-xl font-semibold mb-4">🎨 Schema 驱动</h3>
              <p className="text-gray-600">
                基于 JSON Schema 配置,无需编写复杂代码,AI 可直接生成配置
              </p>
            </div>
            <div className="feature-card">
              <h3 className="text-xl font-semibold mb-4">🚀 开箱即用</h3>
              <p className="text-gray-600">
                内置多种图层类型、控件和交互,覆盖常见可视化场景
              </p>
            </div>
            <div className="feature-card">
              <h3 className="text-xl font-semibold mb-4">📱 移动端适配</h3>
              <p className="text-gray-600">
                响应式设计,自动适配移动端,提供触摸手势支持
              </p>
            </div>
            <div className="feature-card">
              <h3 className="text-xl font-semibold mb-4">🗺️ 多底图支持</h3>
              <p className="text-gray-600">
                支持高德、Mapbox、天地图等多种底图服务
              </p>
            </div>
            <div className="feature-card">
              <h3 className="text-xl font-semibold mb-4">⚡ 高性能</h3>
              <p className="text-gray-600">
                基于 L7 渲染引擎,支持大规模数据可视化
              </p>
            </div>
            <div className="feature-card">
              <h3 className="text-xl font-semibold mb-4">🎯 TypeScript</h3>
              <p className="text-gray-600">
                完整的类型定义,提供优秀的开发体验
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 区域 */}
      <section className="py-20 bg-gray-50 text-center">
        <h2 className="text-3xl font-bold mb-4">开始使用</h2>
        <p className="text-gray-600 mb-8">几分钟内即可创建你的第一个地图可视化应用</p>
        <Link 
          href="/docs/getting-started/quick-start"
          className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          快速开始 →
        </Link>
      </section>
    </main>
  )
}
