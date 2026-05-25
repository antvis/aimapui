import Link from 'next/link'

export default function TemplatesPage() {
  const templates = [
    {
      id: 'mobile-app',
      title: '移动端应用模板',
      description: '搜索栏 + 分类筛选 + 地图标记 + BottomSheet 列表',
      tags: ['移动端'],
      category: 'mobile'
    },
    {
      id: 'check-in-map',
      title: '打卡地图',
      description: '景点/美食/文化分类打卡，环形进度指示器 + 底部抽屉',
      tags: ['移动端', '打卡'],
      category: 'mobile'
    },
    {
      id: 'footprint-map',
      title: '足迹地图',
      description: '照片堆叠标记 + 漂浮动画 + FAB 创建足迹按钮',
      tags: ['移动端', '旅行'],
      category: 'mobile'
    },
    {
      id: 'travel-stats-map',
      title: '旅行统计地图',
      description: '渐变背景 + 打卡统计面板 + 行政区划高亮',
      tags: ['移动端', '统计'],
      category: 'mobile'
    },
    {
      id: 'pc-app',
      title: 'PC 端 GIS 分析平台',
      description: '侧边导航栏 + 图层管理 + 分析工具 + 顶部状态栏',
      tags: ['PC端', 'GIS'],
      category: 'desktop'
    },
    {
      id: 'immersive-travel-map',
      title: '沉浸式旅行地图',
      description: '全屏沉浸 + 照片足迹标记 + 卫星/日/夜切换',
      tags: ['PC端', '旅行'],
      category: 'desktop'
    },
    {
      id: 'interest-map',
      title: '兴趣点地图',
      description: 'IP 品牌/分类 Tab + 资讯标记 + 探店信息卡',
      tags: ['移动端', '探店'],
      category: 'mobile'
    },
    {
      id: 'flight-route-map',
      title: '航线地图',
      description: '弧线飞行航路 + 出发/到达城市标记 + 统计卡片',
      tags: ['移动端', '航线'],
      category: 'mobile'
    },
    {
      id: 'dark-theme-map',
      title: '暗色主题地图',
      description: '完整暗色模式地图应用 + 城市点位 + 主题切换',
      tags: ['PC端', '暗色主题'],
      category: 'desktop'
    }
  ]

  const categories = [
    { key: 'all', label: '全部' },
    { key: 'mobile', label: '移动端' },
    { key: 'desktop', label: 'PC 端' }
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">模板</h1>
        <p className="text-lg text-gray-600">
          开箱即用的地图应用模板，覆盖移动端、PC 端等真实业务场景。每个模板提供完整的 Schema 配置和组件代码。
        </p>
      </div>

      <div className="flex gap-3 mb-8">
        {categories.map(({ key, label }) => (
          <span
            key={key}
            className="px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Link
            key={template.id}
            href={`/templates/${template.id}`}
            className="group block border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all"
          >
            <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              <span className="text-5xl opacity-30">🗺️</span>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                {template.title}
              </h3>
              <p className="text-sm text-gray-500 mb-3">{template.description}</p>
              <div className="flex gap-2 flex-wrap">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}