export interface TemplateConfig {
  id: string
  title: string
  description: string
  tags: string[]
  category: 'mobile' | 'desktop'
  /** 使用的组件列表 */
  components: string[]
  /** 完整 Schema 代码 */
  schemaCode: string
  /** 对应的 Demo 文件路径 */
  demoFile: string
  /** 缩略图 */
  thumbnail: string
}

export const templates: TemplateConfig[] = [
  {
    id: 'mobile-app',
    title: '移动端应用模板',
    description: '搜索栏 + 分类筛选 + 地图标记 + BottomSheet 列表，展示移动端地图应用完整布局',
    tags: ['移动端', '搜索', 'BottomSheet'],
    category: 'mobile',
    components: ['Aimap', 'Marker', 'BottomSheet', 'SearchBar', 'ZoomControl', 'GeoLocateControl'],
    schemaCode: `import { MobileApp } from './demos/app/MobileApp'`,
    demoFile: 'src/demos/app/MobileApp.tsx',
    thumbnail: '/images/templates/mobile-app.png'
  },
  {
    id: 'check-in-map',
    title: '打卡地图',
    description: '景点/美食/文化等分类打卡点，环形进度指示器，底部抽屉展示点位列表 + 打卡进度',
    tags: ['移动端', '打卡', '进度'],
    category: 'mobile',
    components: ['Aimap', 'Marker', 'BottomSheet', 'ZoomControl', 'GeoLocateControl'],
    schemaCode: `import { CheckInMap } from './demos/app/CheckInMap'`,
    demoFile: 'src/demos/app/CheckInMap.tsx',
    thumbnail: '/images/templates/check-in-map.png'
  },
  {
    id: 'footprint-map',
    title: '足迹地图',
    description: '照片堆叠标记（photo pin stack）+ 漂浮动画 + FAB 创建足迹按钮 + 底部导航栏',
    tags: ['移动端', '旅行', '照片'],
    category: 'mobile',
    components: ['Aimap', 'Marker', 'ZoomControl', 'GeoLocateControl'],
    schemaCode: `import { FootprintMap } from './demos/app/FootprintMap'`,
    demoFile: 'src/demos/app/FootprintMap.tsx',
    thumbnail: '/images/templates/footprint-map.png'
  },
  {
    id: 'travel-stats-map',
    title: '旅行统计地图',
    description: '渐变背景 + 打卡统计面板 + 中国行政区划高亮 + 打卡标记，参考大众点评足迹地图',
    tags: ['移动端', '统计', '行政区划'],
    category: 'mobile',
    components: ['Aimap', 'ChinaDistrict', 'Marker', 'ZoomControl'],
    schemaCode: `import { TravelStatsMap } from './demos/app/TravelStatsMap'`,
    demoFile: 'src/demos/app/TravelStatsMap.tsx',
    thumbnail: '/images/templates/travel-stats-map.png'
  },
  {
    id: 'pc-app',
    title: 'PC 端 GIS 分析平台',
    description: '侧边导航栏(图层管理+分析工具) + 顶部应用栏(搜索+状态) + 地图主视口 + 图例面板',
    tags: ['PC端', 'GIS', '分析'],
    category: 'desktop',
    components: ['Aimap', 'ZoomControl', 'GeoLocateControl', 'MapThemeControl', 'ExportImageControl', 'LegendRenderer'],
    schemaCode: `import { PcApp } from './demos/app/PcApp'`,
    demoFile: 'src/demos/app/PcApp.tsx',
    thumbnail: '/images/templates/pc-app.png'
  },
  {
    id: 'immersive-travel-map',
    title: '沉浸式旅行地图',
    description: '全屏沉浸地图 + 照片足迹标记 + 卫星/日/夜切换 + 悬浮状态栏 + 照片堆叠效果',
    tags: ['PC端', '旅行', '沉浸式'],
    category: 'desktop',
    components: ['Aimap', 'Marker', 'SatelliteLayer', 'MapThemeControl', 'ZoomControl'],
    schemaCode: `import { ImmersiveTravelMap } from './demos/app/ImmersiveTravelMap'`,
    demoFile: 'src/demos/app/ImmersiveTravelMap.tsx',
    thumbnail: '/images/templates/immersive-travel-map.png'
  },
  {
    id: 'interest-map',
    title: '兴趣点地图',
    description: 'IP 品牌/分类 Tab + 资讯标记 + 探店信息卡，面向二次元周边购物场景',
    tags: ['移动端', '探店', '兴趣点'],
    category: 'mobile',
    components: ['Aimap', 'Marker', 'BottomSheet', 'ZoomControl'],
    schemaCode: `import { InterestMap } from './demos/app/InterestMap'`,
    demoFile: 'src/demos/app/InterestMap.tsx',
    thumbnail: '/images/templates/interest-map.png'
  },
  {
    id: 'flight-route-map',
    title: '航线地图',
    description: '弧线飞行/火车航路 + 出发/到达城市标记 + 底部统计卡片(出行分类+总里程) + 渐变弧线动画',
    tags: ['移动端', '航线', '弧线'],
    category: 'mobile',
    components: ['Aimap', 'PointLayer', 'LineLayer', 'Marker', 'MapThemeControl'],
    schemaCode: `import { FlightRouteMap } from './demos/app/FlightRouteMap'`,
    demoFile: 'src/demos/app/FlightRouteMap.tsx',
    thumbnail: '/images/templates/flight-route-map.png'
  },
  {
    id: 'dark-theme-map',
    title: '暗色主题地图',
    description: '完整的暗色模式地图应用，包含城市点位 + 主题切换按钮 + 图例 + Tooltip 交互',
    tags: ['PC端', '暗色主题'],
    category: 'desktop',
    components: ['Aimap', 'PointLayer', 'Tooltip', 'MapThemeControl', 'ZoomControl', 'LegendRenderer'],
    schemaCode: `import { DarkThemeMap } from './demos/app/DarkThemeMap'`,
    demoFile: 'src/demos/app/DarkThemeMap.tsx',
    thumbnail: '/images/templates/dark-theme-map.png'
  }
]

export function getTemplateById(id: string): TemplateConfig | undefined {
  return templates.find(t => t.id === id)
}

export function getTemplatesByCategory(category: TemplateConfig['category']): TemplateConfig[] {
  return templates.filter(t => t.category === category)
}