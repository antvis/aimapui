import { useState } from 'react'
import Link from 'next/link'

interface ExampleItem {
  id: string
  title: string
  category: string
  description: string
}

// 重新定义分类以覆盖全部 52 个 Demo
const ALL_CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'engine', label: '地图引擎' },
  { key: 'basic', label: '基础功能' },
  { key: 'layer', label: '基础图层' },
  { key: 'composite', label: '复合图层' },
  { key: 'control', label: '控件' },
  { key: 'marker', label: '标注交互' },
  { key: 'interaction', label: '交互功能' },
  { key: 'mobile', label: '移动端' }
]

// 全量示例列表
const allExamples: ExampleItem[] = [
  // 地图引擎
  { id: 'gaode-map', title: '高德地图引擎', category: 'engine', description: '高德地图底图，完整控件展示' },
  { id: 'maplibre-map', title: 'MapLibre 地图引擎', category: 'engine', description: '开源 MapLibre GL JS 引擎' },
  { id: 'mapbox-map', title: 'Mapbox 地图引擎', category: 'engine', description: 'Mapbox GL JS 引擎' },
  { id: 'tianditu-map', title: '天地图引擎', category: 'engine', description: '天地图底图' },
  { id: 'independent-map', title: '独立 Map', category: 'engine', description: '不依赖 Aimap 的独立地图' },
  // 基础功能
  { id: 'basic-point', title: '基础点图层', category: 'basic', description: '最简单的点图层可视化' },
  { id: 'basic-map-config', title: '底图配置', category: 'basic', description: '底图、中心点、缩放级别配置' },
  { id: 'basic-controls', title: '地图控件', category: 'basic', description: '缩放、比例尺、全屏、定位等控件' },
  { id: 'l7-map', title: 'L7 内置底图', category: 'basic', description: '无需 Token 即可运行' },
  // 基础图层
  { id: 'point-layer', title: '点图层', category: 'layer', description: 'PointLayer 基础用法' },
  { id: 'column-layer', title: '3D 柱状图', category: 'layer', description: 'PointLayer cylinder shape，上海房价数据' },
  { id: 'color-mapping', title: '颜色映射', category: 'layer', description: 'colorField + colorValues 数据驱动着色' },
  { id: 'size-mapping', title: '大小映射', category: 'layer', description: 'sizeField + sizeValues 数据驱动大小' },
  { id: 'line-layer', title: '线图层', category: 'layer', description: 'LineLayer 飞线动画' },
  { id: 'path-map', title: '路径地图', category: 'layer', description: 'LineLayer path shape 路径轨迹' },
  { id: 'line-animate', title: '线动画', category: 'layer', description: 'LineLayer greatcircle 动画弧线' },
  { id: 'arc-map', title: '弧线地图', category: 'layer', description: 'LineLayer arc 2D 弧线流向' },
  { id: 'flow-map', title: '流向图', category: 'layer', description: 'LineLayer flowline shape OD 流向' },
  { id: 'isoline-map', title: '等值线图', category: 'layer', description: 'LineLayer isoline shape 等值线' },
  { id: 'fill-layer', title: '填充图层', category: 'layer', description: 'FillLayer 填充 + 描边 + 文字标注' },
  { id: 'administrative-map', title: '行政区划 GDP', category: 'layer', description: 'ChinaDistrict 省级 GDP 数据下钻' },
  { id: 'fill-3d-layer', title: '3D 填充图', category: 'layer', description: 'PolygonLayer 3D 建筑区域渲染' },
  { id: 'heatmap-layer', title: '热力图', category: 'layer', description: 'HeatmapLayer 经典热力可视化' },
  { id: 'heatmap-classic', title: '经典热力图', category: 'layer', description: 'HeatmapLayer 经典模式' },
  { id: 'hexagon-heatmap-2d', title: '2D 蜂窝热力', category: 'layer', description: 'HeatmapLayer hexagon shape 2D' },
  { id: 'image-layer', title: '图片图层', category: 'layer', description: 'ImageLayer + RasterLayer 图片叠加' },
  { id: 'raster-tile-layer', title: '栅格瓦片', category: 'layer', description: 'RasterLayer 栅格瓦片图层' },
  { id: 'multi-layer', title: '多图层叠加', category: 'layer', description: '多图层叠加 + 图例配合' },
  { id: 'layer-events', title: '图层事件', category: 'layer', description: 'onClick / onMouseEnter / onMouseLeave' },
  { id: 'map-events', title: '地图事件', category: 'layer', description: 'onMapMove / onMapZoom 数据驱动' },
  // 复合图层
  { id: 'bubble-layer', title: '气泡图', category: 'composite', description: 'BubbleLayer 气泡 + 文字标签' },
  { id: 'icon-label', title: '图片标注', category: 'composite', description: 'IconImageLayer 图标 + 文字缩放自适应' },
  { id: 'icon-font-label', title: '字体图标标注', category: 'composite', description: 'IconFontLayer Material Symbols 图标' },
  { id: 'choropleth', title: '分级统计图', category: 'composite', description: 'FillLayer 三种 colorMapping 模式' },
  { id: 'hexagon-heatmap', title: '蜂窝热力图', category: 'composite', description: 'HexagonLayer 六边形聚合热力' },
  { id: 'satellite-layer', title: '卫星影像图层', category: 'composite', description: '三种卫星影像源切换' },
  { id: 'marker-cluster', title: '聚合标注', category: 'composite', description: 'MarkerClusterLayer 大规模数据聚合' },
  { id: 'arc-layer', title: '弧线图', category: 'composite', description: 'LineLayer arc shape 弧线流向' },
  { id: 'path-layer', title: '路径图', category: 'composite', description: 'LineLayer path shape 路径轨迹' },
  // 控件
  { id: 'zoom-control', title: '缩放控件', category: 'control', description: 'ZoomControl + ScaleControl' },
  { id: 'fullscreen-control', title: '全屏控件', category: 'control', description: 'FullscreenControl' },
  { id: 'geo-locate-control', title: '定位控件', category: 'control', description: 'GeoLocateControl' },
  { id: 'map-theme-control', title: '底图主题切换', category: 'control', description: 'MapThemeControl 样式选择' },
  { id: 'mouse-location-control', title: '鼠标坐标控件', category: 'control', description: 'MouseLocationControl 经纬度显示' },
  { id: 'export-image-control', title: '导出图片控件', category: 'control', description: 'ExportImageControl PNG 导出' },
  { id: 'theme-toggle', title: 'UI 主题切换', category: 'control', description: '明/暗 UI 主题切换' },
  // 标注交互
  { id: 'marker', title: 'Marker 标注规范', category: 'marker', description: '4 种形态 + 4 种颜色 + 缩放自适应' },
  { id: 'marker-drag', title: '可拖拽标注', category: 'marker', description: 'Marker draggable + 回调' },
  { id: 'marker-test', title: 'Marker 最简测试', category: 'marker', description: '最基本的 Marker 显示' },
  { id: 'popup', title: 'Popup 弹出框', category: 'marker', description: '3 种尺寸 + 结构化布局' },
  { id: 'tooltip', title: 'Tooltip 轻提示', category: 'marker', description: '3 种变体 + 键值对展示' },
  // 交互功能
  { id: 'color-mapping-interaction', title: '颜色映射', category: 'interaction', description: '数据驱动颜色映射 + 图例' },
  { id: 'size-mapping-interaction', title: '大小映射', category: 'interaction', description: '数据驱动大小映射 + 图例' },
  { id: 'layer-active-select', title: '高亮与选中', category: 'interaction', description: 'hover 高亮 + click 选中' },
  { id: 'marker-popup', title: '标注与弹窗', category: 'interaction', description: 'Marker + Popup 声明式配置' },
  { id: 'layer-legend', title: '图例配置', category: 'interaction', description: '分类/渐变/比例等多种图例' },
  // 移动端
  { id: 'mobile-responsive', title: '移动端响应式', category: 'mobile', description: '响应式断点 + 移动端布局' },
  { id: 'mobile-toolbar', title: '移动端工具栏', category: 'mobile', description: 'BottomSheet + SearchBar + Toolbar' }
]

export default function ExamplesPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = allExamples.filter((ex) => {
    const matchCategory = activeCategory === 'all' || ex.category === activeCategory
    const matchSearch = searchQuery === '' ||
      ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* 标题 */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: 12 }}>示例库</h1>
        <p style={{ color: '#666', fontSize: '1.05rem' }}>
          探索 AiMapUI 的各种可视化能力，从基础示例到复合图层
        </p>
      </div>

      {/* 搜索 */}
      <div style={{ maxWidth: 480, margin: '0 auto 24px' }}>
        <input
          type="text"
          placeholder="搜索示例..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            fontSize: '0.95rem',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* 分类标签 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
        {ALL_CATEGORIES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            style={{
              padding: '6px 16px',
              borderRadius: 9999,
              fontSize: '0.85rem',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              background: activeCategory === key ? '#3B82F6' : '#f1f5f9',
              color: activeCategory === key ? '#fff' : '#475569',
              transition: 'all 0.15s'
            }}
          >
            {label}
            {key !== 'all' && (
              <span style={{ marginLeft: 4, opacity: 0.7 }}>
                ({allExamples.filter(e => e.category === key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 结果统计 */}
      <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 16 }}>
        共 {filtered.length} 个示例
      </div>

      {/* 示例网格 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 20
      }}>
        {filtered.map((example) => (
          <Link
            key={example.id}
            href={`/examples/${example.id}`}
            style={{
              display: 'block',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              overflow: 'hidden',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'box-shadow 0.2s, border-color 0.2s'
            }}
          >
            <div style={{
              height: 140,
              background: 'linear-gradient(145deg, #e0e7ff, #c7d2fe)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '2.5rem', opacity: 0.3 }}>🗺</span>
            </div>
            <div style={{ padding: 16 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 6 }}>{example.title}</h3>
              <p style={{ fontSize: '0.82rem', color: '#888', lineHeight: 1.5, margin: 0 }}>{example.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
          <div>没有找到匹配的示例</div>
        </div>
      )}
    </div>
  )
}