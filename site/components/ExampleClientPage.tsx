'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { injectAmapKey } from '@/lib/amap-key'

// @antv/aimapkit 在 import 时访问 document，必须跳过 SSR
const Aimap = dynamic(() => import('@antv/aimapkit').then((m) => m.Aimap), { ssr: false })

interface ExampleClientPageProps {
  example: {
    id: string
    title: string
    description: string
    schema: any
    code: string
    [key: string]: unknown
  }
}

export default function ExampleClientPage({ example }: ExampleClientPageProps) {
  const [showCode, setShowCode] = useState(false)
  const schemaWithKey = injectAmapKey(example.schema)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{example.title}</h1>
          <p className="text-gray-600">{example.description}</p>
        </div>

        <div className="demo-player border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div className="demo-header p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{example.title}</h3>
            </div>
            <button
              onClick={() => setShowCode(!showCode)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
            >
              {showCode ? '隐藏代码' : '查看代码'}
            </button>
          </div>

          <div className="demo-content flex">
            <div className="demo-canvas flex-1 h-96">
              <Aimap schema={schemaWithKey} />
            </div>

            {showCode && (
              <div className="demo-code w-1/2 border-l border-gray-200 bg-gray-900 text-gray-100 overflow-auto">
                <div className="code-header flex justify-between items-center px-4 py-2 bg-gray-800">
                  <span className="text-sm">schema.tsx</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(example.code)}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                  >
                    复制
                  </button>
                </div>
                <pre className="code-content p-4 text-sm overflow-auto" style={{ maxHeight: '400px' }}>
                  <code>{example.code}</code>
                </pre>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Schema 配置</h2>
          <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
            <code>{JSON.stringify(example.schema, null, 2)}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}