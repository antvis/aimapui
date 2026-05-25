import { templates, getTemplateById } from '@/data/templates'
import { GetStaticPaths, GetStaticProps } from 'next'

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = templates.map((t) => ({ params: { slug: t.id } }))
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const template = getTemplateById(params?.slug as string)
  if (!template) {
    return { notFound: true }
  }
  return { props: { template } }
}

export default function TemplateDetailPage({ template }: { template: any }) {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      {/* 预览区 */}
      <div style={{
        width: '100%',
        height: '60vh',
        minHeight: 400,
        background: 'linear-gradient(145deg, #1e3a5f 0%, #0f172a 50%, #1a2744 100%)',
        borderRadius: '0 0 16px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        fontSize: '1rem',
        marginBottom: 40
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🗺️</div>
          <div>{template.title} — 实时预览</div>
          <div style={{ fontSize: '0.8rem', marginTop: 8, opacity: 0.6 }}>
            需要启动开发服务器查看实时渲染
          </div>
        </div>
      </div>

      {/* 信息区 */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{template.title}</h1>
          <span style={{
            padding: '4px 12px',
            borderRadius: 9999,
            fontSize: '0.8rem',
            fontWeight: 500,
            background: template.category === 'mobile' ? '#DBEAFE' : '#D1FAE5',
            color: template.category === 'mobile' ? '#1D4ED8' : '#065F46'
          }}>
            {template.category === 'mobile' ? '移动端' : 'PC 端'}
          </span>
        </div>
        <p style={{ color: '#666', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: 20 }}>
          {template.description}
        </p>

        {/* 特性标签 */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {template.tags.map((tag: string) => (
            <span
              key={tag}
              style={{
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: '0.8rem',
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #e2e8f0'
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 使用的组件 */}
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>使用的组件</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {template.components.map((comp: string) => (
              <code
                key={comp}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: '0.85rem',
                  background: '#eff6ff',
                  color: '#2563eb',
                  border: '1px solid #bfdbfe'
                }}
              >
                {comp}
              </code>
            ))}
          </div>
        </div>
      </div>

      {/* 代码区 */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: 16 }}>代码示例</h2>
        <div style={{
          background: '#1e293b',
          borderRadius: 12,
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '10px 16px',
            borderBottom: '1px solid #334155',
            color: '#94a3b8',
            fontSize: '0.8rem',
            fontFamily: 'monospace'
          }}>
            {template.demoFile}
          </div>
          <pre style={{
            padding: 20,
            fontSize: '0.85rem',
            lineHeight: 1.7,
            color: '#e2e8f0',
            overflow: 'auto',
            margin: 0
          }}>
            <code>{template.schemaCode}</code>
          </pre>
        </div>
      </div>

      {/* AI Prompt 参考 */}
      <div style={{
        marginBottom: 48,
        padding: 24,
        background: '#eff6ff',
        borderRadius: 12,
        border: '1px solid #bfdbfe'
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12, color: '#1e40af' }}>
          AI Prompt 参考
        </h3>
        <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: 16 }}>
          将以下 Prompt 发送给 AI 助手，可直接生成该模板的 Schema 配置：
        </p>
        <pre style={{
          padding: 16,
          background: '#fff',
          borderRadius: 8,
          fontSize: '0.85rem',
          lineHeight: 1.7,
          color: '#1e293b',
          overflow: 'auto',
          border: '1px solid #e2e8f0'
        }}>
{`请使用 @antv/aimapkit 生成一个"${template.title}"的地图应用Schema配置。

要求：
- 功能：${template.description}
- 使用组件：${template.components.join(', ')}
- 底图：高德地图
- 包含必要的控件和图例
- 输出格式：AimapSchema JSON`}
        </pre>
      </div>

      {/* 返回链接 */}
      <div style={{ paddingBottom: 48 }}>
        <a
          href="/templates"
          style={{ color: '#3B82F6', textDecoration: 'none', fontWeight: 500 }}
        >
          ← 返回模板列表
        </a>
      </div>
    </div>
  )
}