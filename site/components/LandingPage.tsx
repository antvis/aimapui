import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import type { CSSProperties } from 'react'

const MapDemo = dynamic(() => import('./landing/MapDemo'), { ssr: false })

export default function HomePage() {
  const [demoTab, setDemoTab] = useState<'schema' | 'component'>('schema')

  return (
    <>
      {/* ── Hero: dot-grid backdrop + gradient heading ── */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Dot grid background */}
        <div
          style={{ pointerEvents: 'none', position: 'absolute', left: 0, right: 0, top: -40, bottom: -40, overflow: 'hidden' }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              opacity: 0.07,
            }}
          />
          {/* Fade-out gradient at bottom */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, transparent 60%, var(--background) 100%)',
            }}
          />
        </div>

        <div
          style={{ position: 'relative', display: 'flex', width: '100%', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 80, paddingBottom: 48, gap: 16, maxWidth: 1400, marginLeft: 'auto', marginRight: 'auto', paddingLeft: 24, paddingRight: 24 }}
        >
          {/* Badge */}
          <div
            className="animate-fade-up animate-stagger"
            style={
              {
                '--stagger': 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 14px',
                borderRadius: 9999,
                background: 'var(--brand-light)',
                color: 'var(--brand)',
                fontSize: '0.8rem',
                fontWeight: 500,
                border: '1px solid color-mix(in oklch, var(--brand) 25%, transparent)',
              } as CSSProperties
            }
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--brand)',
                display: 'inline-block',
              }}
            />
            Schema 驱动 · AI 原生 · React 地图可视化
          </div>

          {/* Heading — gradient text like mapcn */}
          <h1
            className="animate-fade-up animate-stagger gradient-text"
            style={
              {
                '--stagger': 1,
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                maxWidth: '36rem',
              } as CSSProperties
            }
          >
            Beautiful maps,
            <br />
            made simple.
          </h1>

          {/* Description */}
          <p
            className="animate-fade-up animate-stagger"
            style={
              {
                '--stagger': 2,
                color: 'var(--muted-foreground)',
                fontSize: '1.1rem',
                lineHeight: 1.7,
                maxWidth: '34rem',
              } as CSSProperties
            }
          >
            基于 @antv/l7 的 React 地图可视化组件库。
            <br />
            一个 JSON Schema 即可生成完整地图应用。
          </p>

          {/* Install command */}
          <div
            className="animate-fade-up animate-stagger"
            style={
              {
                '--stagger': 3,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                background: 'oklch(0.145 0 0)',
                color: 'oklch(0.922 0 0)',
                borderRadius: 10,
                fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                fontSize: '0.9rem',
                border: '1px solid oklch(0.269 0 0)',
              } as CSSProperties
            }
          >
            npm install @antv/aimapui
          </div>

          {/* CTAs */}
          <div
            className="animate-fade-up animate-stagger"
            style={
              {
                '--stagger': 4,
                display: 'flex',
                gap: 12,
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginTop: 4,
              } as CSSProperties
            }
          >
            <Link
              href="/docs/getting-started/quick-start"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 24px',
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
                borderRadius: 'var(--radius)',
                fontWeight: 600,
                fontSize: '0.9rem',
                textDecoration: 'none',
                transition: 'opacity 0.15s',
              }}
            >
              快速开始
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/components/overview"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '10px 24px',
                background: 'var(--background)',
                color: 'var(--foreground)',
                borderRadius: 'var(--radius)',
                fontWeight: 600,
                fontSize: '0.9rem',
                textDecoration: 'none',
                border: '1px solid var(--border)',
                transition: 'border-color 0.15s',
              }}
            >
              组件文档
            </Link>
            <a
              href="https://github.com/antvis/aimapui"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 24px',
                background: 'var(--background)',
                color: 'var(--foreground)',
                borderRadius: 'var(--radius)',
                fontWeight: 600,
                fontSize: '0.9rem',
                textDecoration: 'none',
                border: '1px solid var(--border)',
                transition: 'border-color 0.15s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ── Code Demo: Schema ↔ Map ── */}
      <section style={{ padding: '0 24px 80px' }}>
        <div className="container-wide" style={{ margin: '0 auto', maxWidth: 1400 }}>
          <div
            className="animate-fade-in animate-stagger"
            style={
              {
                '--stagger': 5,
                borderRadius: 16,
                overflow: 'hidden',
                border: '1px solid var(--border)',
                background: 'oklch(0.145 0 0)',
                boxShadow: 'var(--shadow-lg)',
              } as CSSProperties
            }
          >
            {/* Tab bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid oklch(0.269 0 0)',
                padding: '0 16px',
              }}
            >
              <button
                onClick={() => setDemoTab('schema')}
                style={{
                  padding: '10px 16px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  color: demoTab === 'schema' ? 'var(--brand)' : 'var(--muted-foreground)',
                  borderBottom: demoTab === 'schema' ? '2px solid var(--brand)' : '2px solid transparent',
                  marginBottom: -1,
                  background: 'none',
                  border: 'none',
                  borderBottomWidth: 2,
                  borderBottomStyle: 'solid',
                  borderBottomColor: demoTab === 'schema' ? 'var(--brand)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                Schema
              </button>
              <button
                onClick={() => setDemoTab('component')}
                style={{
                  padding: '10px 16px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  color: demoTab === 'component' ? 'var(--brand)' : 'var(--muted-foreground)',
                  background: 'none',
                  border: 'none',
                  borderBottomWidth: 2,
                  borderBottomStyle: 'solid',
                  borderBottomColor: demoTab === 'component' ? 'var(--brand)' : 'transparent',
                  marginBottom: -1,
                  cursor: 'pointer',
                }}
              >
                Component
              </button>
            </div>
            {/* Code grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <div
                style={{
                  padding: 24,
                  fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                  fontSize: '0.82rem',
                  lineHeight: 1.7,
                  overflow: 'auto',
                  borderRight: '1px solid oklch(0.269 0 0)',
                }}
              >
                {demoTab === 'schema' ? (
                  <pre style={{ color: 'oklch(0.922 0 0)', margin: 0, whiteSpace: 'pre' }}>
{`{
  "map": {
    "basemap": "gaode",
    "style": "dark",
    "center": [113.5, 34.5],
    "zoom": 4
  },
  "layers": [{
    "type": "point",
    "source": cities,
    "sourceType": "json",
    "colorField": "category",
    "colorValues": [
      "#3B82F6", "#10B981",
      "#F59E0B", "#EF4444"
    ],
    "sizeField": "value",
    "sizeValues": [6, 28]
  }],
  "controls": [
    { "type": "zoom" },
    { "type": "scale" }
  ],
  "legends": [{
    "type": "categories",
    "field": "category",
    "position": "bottom-left"
  }]
}`}
                  </pre>
                ) : (
                  <pre style={{ color: 'oklch(0.922 0 0)', margin: 0, whiteSpace: 'pre' }}>
{`import { Aimap, PointLayer,
  ZoomControl, ScaleControl,
  CategoriesLegend } from '@antv/aimapui'

export default function App() {
  return (
    <Aimap map={{
      basemap: 'gaode',
      style: 'dark',
      center: [113.5, 34.5],
      zoom: 4
    }}>
      <PointLayer
        source={cities}
        sourceType="json"
        colorField="category"
        colorValues={[
          '#3B82F6', '#10B981',
          '#F59E0B', '#EF4444'
        ]}
        sizeField="value"
        sizeValues={[6, 28]}
      />
      <ZoomControl />
      <ScaleControl />
      <CategoriesLegend
        field="category"
        position="bottom-left"
      />
    </Aimap>
  )
}`}
                  </pre>
                )}
              </div>
              {/* Real L7 map demo */}
              <div style={{ minHeight: 380 }}>
                <MapDemo />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features grid ── */}
      <section style={{ padding: '80px 24px', background: 'var(--muted)' }}>
        <div className="container" style={{ margin: '0 auto' }}>
          <h2
            className="animate-fade-up gradient-text"
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            一切皆 Schema，AI 可生成
          </h2>
          <p
            style={{
              textAlign: 'center',
              color: 'var(--muted-foreground)',
              marginBottom: 56,
              fontSize: '1rem',
            }}
          >
            声明式 JSON 配置驱动地图，从原型到生产只需一处 Schema
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { icon: '{ }', title: 'Schema 驱动', desc: '纯 JSON Schema 配置，可序列化、可存储、可 AI 生成' },
              { icon: '</>', title: '双模式 API', desc: 'Schema 声明式 + React 组件式，灵活选择' },
              { icon: '⬡', title: '14 图层类型', desc: '6 基础图层 + 8 复合图层，覆盖全部可视化场景' },
              { icon: '◎', title: '7 种底图引擎', desc: '高德/Mapbox/MapLibre/天地图/腾讯/百度/L7' },
              { icon: '◐', title: 'MD3 设计体系', desc: 'Material Design 3 令牌，亮暗主题一体化' },
              { icon: '📱', title: '移动端适配', desc: '内置响应式断点，BottomSheet/Toolbar 开箱即用' },
            ].map(({ icon, title, desc }, i) => (
              <div
                key={title}
                className="feature-card animate-fade-up animate-stagger"
                style={{ '--stagger': i } as CSSProperties}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'var(--brand-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    marginBottom: 16,
                    color: 'var(--brand)',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  {icon}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8, color: 'var(--foreground)' }}>
                  {title}
                </h3>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dual API comparison ── */}
      <section style={{ padding: '80px 24px' }}>
        <div className="container" style={{ margin: '0 auto' }}>
          <h2
            className="animate-fade-up gradient-text"
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            同一功能，两种写法
          </h2>
          <p
            style={{
              textAlign: 'center',
              color: 'var(--muted-foreground)',
              marginBottom: 48,
              fontSize: '1rem',
            }}
          >
            Schema 模式 AI 友好，组件模式类型安全 — 按需选择
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Schema mode */}
            <div
              className="animate-fade-up animate-stagger"
              style={
                {
                  '--stagger': 0,
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                } as CSSProperties
              }
            >
              <div
                style={{
                  padding: '10px 20px',
                  background: 'var(--brand)',
                  color: 'var(--brand-foreground)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'oklch(0.8 0.1 260)' }} />
                Schema 模式
              </div>
              <pre
                style={{
                  padding: 20,
                  fontSize: '0.82rem',
                  lineHeight: 1.7,
                  overflow: 'auto',
                  margin: 0,
                  background: 'var(--muted)',
                }}
              >
{`const schema = {
  map: { basemap: 'gaode', zoom: 10 },
  layers: [{
    type: 'point',
    source: data,
    sourceType: 'json',
    colorField: 'category',
    colorValues: ['#3B82F6', '#10B981'],
    sizeField: 'value',
    sizeValues: [6, 24]
  }]
}

<Aimap schema={schema} />`}
              </pre>
            </div>
            {/* Component mode */}
            <div
              className="animate-fade-up animate-stagger"
              style={
                {
                  '--stagger': 1,
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                } as CSSProperties
              }
            >
              <div
                style={{
                  padding: '10px 20px',
                  background: 'oklch(0.6 0.18 160)',
                  color: 'oklch(0.98 0 0)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'oklch(0.8 0.12 160)' }} />
                组件模式
              </div>
              <pre
                style={{
                  padding: 20,
                  fontSize: '0.82rem',
                  lineHeight: 1.7,
                  overflow: 'auto',
                  margin: 0,
                  background: 'var(--muted)',
                }}
              >
{`<Aimap map={{ basemap: 'gaode', zoom: 10 }}>
  <PointLayer
    source={data}
    sourceType="json"
    colorField="category"
    colorValues={['#3B82F6', '#10B981']}
    sizeField="value"
    sizeValues={[6, 24]}
    onClick={handleClick}
  />
  <ZoomControl position="top-right" />
</Aimap>`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── Links grid ── */}
      <section style={{ padding: '80px 24px', background: 'var(--muted)' }}>
        <div className="container" style={{ margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {[
              { title: '教程', desc: '从安装到进阶，完整学习路径', href: '/docs/getting-started/quick-start', color: 'oklch(0.6 0.2 260)' },
              { title: '组件', desc: '50+ 组件 API 参考文档', href: '/components/overview', color: 'oklch(0.6 0.18 160)' },
              { title: '示例', desc: '52 个真实场景示例', href: '/examples', color: 'oklch(0.7 0.18 90)' },
              { title: '设计规范', desc: 'MD3 设计令牌与视觉规范', href: '/design', color: 'oklch(0.55 0.2 300)' },
            ].map(({ title, desc, href, color }, i) => (
              <Link
                key={title}
                href={href}
                className="glass-card animate-fade-up animate-stagger"
                style={
                  {
                    '--stagger': i,
                    display: 'block',
                    padding: 24,
                    textDecoration: 'none',
                  } as CSSProperties
                }
              >
                <div style={{ width: 32, height: 4, borderRadius: 2, background: color, marginBottom: 16 }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 6, color: 'var(--foreground)' }}>
                  {title}
                </h3>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                  {desc}
                </p>
                <div style={{ marginTop: 12, fontSize: '0.85rem', fontWeight: 500, color }}>
                  了解更多 →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA footer ── */}
      <section
        style={{
          padding: '80px 24px',
          background: 'oklch(0.145 0 0)',
          textAlign: 'center',
          color: 'oklch(0.985 0 0)',
        }}
      >
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 12 }}>
          几分钟内创建你的第一个地图应用
        </h2>
        <p style={{ color: 'oklch(0.985 0 0 / 60%)', marginBottom: 36, fontSize: '1.05rem' }}>
          npm install @antv/aimapui
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link
            href="/docs/getting-started/quick-start"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 24px',
              background: 'var(--brand)',
              color: 'var(--brand-foreground)',
              borderRadius: 'var(--radius)',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
            }}
          >
            快速开始
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/examples"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '10px 24px',
              background: 'transparent',
              color: 'oklch(0.985 0 0 / 80%)',
              borderRadius: 'var(--radius)',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
              border: '1px solid oklch(1 0 0 / 20%)',
            }}
          >
            查看示例
          </Link>
        </div>
        <div
          style={{
            marginTop: 56,
            paddingTop: 24,
            borderTop: '1px solid oklch(1 0 0 / 8%)',
          }}
        >
          <p style={{ opacity: 0.4, fontSize: '0.8rem' }}>
            © 2026 AntV · AiMapUI ·{' '}
            <a
              href="https://antv.antgroup.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'oklch(0.985 0 0 / 50%)', textDecoration: 'none' }}
            >
              AntV 生态
            </a>
            {' · '}
            <a
              href="https://l7.antv.antgroup.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'oklch(0.985 0 0 / 50%)', textDecoration: 'none' }}
            >
              L7
            </a>
            {' · '}
            <a
              href="https://github.com/antvis/aimapui"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'oklch(0.985 0 0 / 50%)', textDecoration: 'none' }}
            >
              GitHub
            </a>
          </p>
        </div>
      </section>
    </>
  )
}