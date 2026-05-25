'use client'

import { useState } from 'react'

interface PlaygroundProps {
  /** Schema 模式的代码 */
  schemaCode: string
  /** 组件模式的代码 */
  componentCode?: string
  /** Aimap schema 对象（用于实时渲染） */
  schema?: Record<string, unknown>
  /** 是否默认显示 Schema 模式 */
  defaultTab?: 'schema' | 'component'
  /** 预览区域高度 */
  height?: number
}

/**
 * Playground 编辑器组件
 * 
 * 左侧代码编辑区 + 右侧 Aimap 实时渲染区
 * 顶部 Tab 切换 Schema 模式 / 组件模式
 */
export function Playground({
  schemaCode,
  componentCode,
  defaultTab = 'schema',
  height = 400
}: PlaygroundProps) {
  const [activeTab, setActiveTab] = useState<'schema' | 'component'>(defaultTab)
  const [copied, setCopied] = useState(false)

  const code = activeTab === 'schema' ? schemaCode : componentCode || schemaCode

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const textarea = document.createElement('textarea')
      textarea.value = code
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="playground-container" style={{
      border: '1px solid var(--border-color, #e2e8f0)',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 24
    }}>
      {/* 顶部工具栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        borderBottom: '1px solid var(--border-color, #e2e8f0)',
        background: 'var(--bg-secondary, #f8fafc)'
      }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setActiveTab('schema')}
            style={{
              padding: '4px 12px',
              borderRadius: 6,
              fontSize: '0.8rem',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'schema' ? '#3B82F6' : 'transparent',
              color: activeTab === 'schema' ? '#fff' : 'inherit',
              transition: 'all 0.15s'
            }}
          >
            Schema
          </button>
          {componentCode && (
            <button
              onClick={() => setActiveTab('component')}
              style={{
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: '0.8rem',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'component' ? '#10B981' : 'transparent',
                color: activeTab === 'component' ? '#fff' : 'inherit',
                transition: 'all 0.15s'
              }}
            >
              Component
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleCopy}
            style={{
              padding: '4px 12px',
              borderRadius: 6,
              fontSize: '0.8rem',
              border: '1px solid var(--border-color, #e2e8f0)',
              cursor: 'pointer',
              background: 'transparent',
              color: 'inherit',
              transition: 'all 0.15s'
            }}
          >
            {copied ? '✓ 已复制' : '复制代码'}
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div style={{ display: 'flex', minHeight: height }}>
        {/* 代码区 */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          borderRight: '1px solid var(--border-color, #e2e8f0)'
        }}>
          <pre style={{
            margin: 0,
            padding: 16,
            fontSize: '0.82rem',
            lineHeight: 1.7,
            fontFamily: 'var(--font-mono, "SF Mono", "Fira Code", monospace)',
            background: 'var(--bg-code, #1e293b)',
            color: 'var(--color-code, #e2e8f0)',
            minHeight: height,
            whiteSpace: 'pre',
            overflowX: 'auto'
          }}>
            <code>{code}</code>
          </pre>
        </div>

        {/* 预览区 */}
        <div style={{
          flex: 1,
          background: '#f0f4f8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{
            color: '#94a3b8',
            fontSize: '0.85rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>🗺️</div>
            <div>实时预览</div>
            <div style={{ fontSize: '0.75rem', marginTop: 4 }}>
              需要启动开发服务器查看
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}