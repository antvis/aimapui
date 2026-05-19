import Link from 'next/link'
import { examples } from '@/data/examples'

export default function ExamplesPage() {
  const categories = {
    basic: '基础功能',
    layer: '图层类型',
    interaction: '交互功能',
    mobile: '移动端'
  }

  return (
    <div className="examples-page min-h-screen bg-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">示例库</h1>
          <p className="text-gray-600 text-lg">
            探索 aimapkit 的各种可视化能力,从基础示例到复杂场景
          </p>
        </div>

        {Object.entries(categories).map(([key, label]) => {
          const categoryExamples = examples.filter(e => e.category === key)
          
          if (categoryExamples.length === 0) return null

          return (
            <section key={key} className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">{label}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryExamples.map(example => (
                  <Link
                    key={example.id}
                    href={`/examples/${example.id}`}
                    className="example-card border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="h-40 bg-gray-100 flex items-center justify-center">
                      {example.thumbnail ? (
                        <img 
                          src={example.thumbnail} 
                          alt={example.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400">示例预览</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{example.title}</h3>
                      <p className="text-sm text-gray-600">{example.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
