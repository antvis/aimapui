import React from 'react';
import ReactDOM from 'react-dom/client';
import { marked } from 'marked';
import '../../core/src/styles/tailwind.css';
import HomePage from './home/HomePage';
import DesignPage from './home/DesignPage';
import NavBar from './home/NavBar';
import DocsPage from './docs/DocsPage';
import BlockPage from './home/BlockPage';
import { SourceCodePanel, SourceCodeToggle } from './components/SourceCodePanel';
import BlockDemoPage from './home/BlockDemoPage';
import SkillPage from './home/SkillPage';

// 本地字体（替代 Google Fonts CDN）
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/jetbrains-mono/400.css';

// ============================================================
// Demo 入口 — 左侧菜单 + 中间地图 + 右侧代码预览
// 所有 Demo 均使用组件化 API
// ============================================================

// ── 地图引擎 ──
import GaodeMap from './engine/GaodeMap';
import MaplibreMap from './engine/MaplibreMap';
import MapboxMap from './engine/MapboxMap';
import IndependentMap from './engine/IndependentMap';
import TiandituMap from './engine/TiandituMap';
import TencentMap from './engine/TencentMap';
import BaiduMap from './engine/BaiduMap';
import GoogleMap from './engine/GoogleMap';
// ── 控件 ──
import MapControlsDemo from './control/MapControls';
import DrawControlDemo from './control/DrawControlDemo';
import ImageCalibrationDemo from './control/ImageCalibrationDemo';
// ── 点位标注 / 交互 ──
import Marker from './marker/Marker';
import MarkerDrag from './marker/MarkerDrag';
import Popup from './marker/Popup';
import TooltipDemo from './marker/Tooltip';
// ── 应用模板 ──
import MobileApp from './app/MobileApp';
import CheckInMap from './app/CheckInMap';
import FootprintMap from './app/FootprintMap';
import PcApp from './app/PcApp';
import ImmersiveTravelMap from './app/ImmersiveTravelMap';
import InterestMap from './app/InterestMap';
import FlightRouteMap from './app/FlightRouteMap';

// ── 复合图层 ──
import BubbleLayer from './composite/BubbleLayer';
import IconLabel from './composite/IconLabel';
import IconFontLabel from './composite/IconFontLabel';
import BuiltinIconsDemo from './composite/BuiltinIconsDemo';
import BuiltinGlyphsDemo from './composite/BuiltinGlyphsDemo';
import ChoroplethMap from './composite/ChoroplethMap';
import HexagonHeatmap from './composite/HexagonHeatmap';
import SatelliteLayerDemo from './composite/SatelliteLayer';
import MarkerCluster from './composite/MarkerCluster';
import ArcFlowLayer from './composite/ArcFlowLayer';
import RouteLayerDemo from './composite/RouteLayer';
import TiffRasterLayerDemo from './composite/TiffRasterLayer';
// ── 基础图层 ──
import PointLayer from './layer/PointLayer';
import GeometricPoint from './layer/GeometricPoint';
import ColumnLayer from './layer/ColumnLayer';
import ColorMapping from './layer/ColorMapping';
import SizeMapping from './layer/SizeMapping';
import LineLayer from './layer/LineLayer';
import PathMap from './layer/PathMap';
import LineAnimate from './layer/LineAnimate';
import ArcMap from './layer/ArcMap';
import AdministrativeMap from './layer/AdministrativeMap';
import FlowMap from './layer/FlowMap';
import IsolineMap from './layer/IsolineMap';
import HeatmapLayer from './layer/HeatmapLayer';
import MultiLayer from './layer/MultiLayer';
import FillLayer from './layer/FillLayer';
import Fill3DLayer from './layer/Fill3DLayer';
import ImageLayer from './layer/ImageLayer';
import RasterTileLayer from './layer/RasterTileLayer';
// ── 图例 ──
import LegendCategoriesDemo from './layer/LegendCategoriesDemo';
import LegendRampDemo from './layer/LegendRampDemo';
import LegendDivergingDemo from './layer/LegendDivergingDemo';
import LegendThresholdDemo from './layer/LegendThresholdDemo';
import LegendSizeDemo from './layer/LegendSizeDemo';
import LegendLineWidthDemo from './layer/LegendLineWidthDemo';
import LegendProportionDemo from './layer/LegendProportionDemo';
import LegendIconDemo from './layer/LegendIconDemo';
// ── Hooks ──
import UseResponsiveDemo from './layer/UseResponsiveDemo';
// ── 移动端 ──
import BottomSheetDemo from './app/BottomSheetDemo';
import SearchBarDemo from './app/SearchBarDemo';
import MobileToolbarDemo from './app/MobileToolbarDemo';
import MobileSheetLegendDemo from './app/MobileSheetLegendDemo';

const sourceModules = import.meta.glob(
  ['./{engine,control,marker,layer,composite,app}/*.tsx', './{engine,control,marker,layer,composite,app}/*.md'],
  { query: '?raw', eager: true }
) as Record<string, { default: string }>;

// 设计规范文档 — 从 src/design/ 子目录加载 (.md + .html)
// 注意：src/design 是指向 ../../core/src/design 的软链接（vite import.meta.glob 不支持跨 package 路径）
const designMdModules = import.meta.glob(
  './design/{app,composite,marker,control,layer,block}/*.md',
  { query: '?raw', eager: true }
) as Record<string, { default: string }>;

const designHtmlModules = import.meta.glob(
  './design/{app,composite,marker,control,layer,block}/*.html',
  { query: '?raw', eager: true }
) as Record<string, { default: string }>;

// 组件文档 — 从 src/docs/content/ 加载 Markdown
const docsContentModules = import.meta.glob(
  './docs/content/**/*.md',
  { query: '?raw', eager: true }
) as Record<string, { default: string }>;

// 解析文档内容为 id → content 映射
const docsMap: Record<string, string> = {};
for (const [path, mod] of Object.entries(docsContentModules)) {
  // 路径格式: ./docs/content/getting-started.md 或 ./docs/content/layers/point-layer.md
  const match = path.match(/\.\/docs\/content\/(.+)\.md$/);
  if (match) {
    docsMap[match[1]] = mod.default;
  }
}

// 解析设计规范文件列表（按目录分组）
const designNameMap: Record<string, string> = {
  'bubble-map': '气泡图',
  'choropleth-map': '分级统计图',
  'marker-cluster': '标注聚合',
  'popup': '弹出框',
  'tooltip': '轻提示',
  'map-controls': '地图控件',
  'path-route-map': '路径与轨迹',
  'arc-flow-map': '弧线与流向',
  'hexbin-map': '蜂窝热力图',
  'mobile-app': '移动端应用',
  'pc-app': 'PC 端应用',
  'large-screen': '大屏指挥中心',
  'legend': '地图图例',
  'icon-layer': '图片标注图层',
  'icon-font-layer': '字体图标图层',
  'immersive-travel-map': '沉浸式旅游足迹地图',
  'administrative-layer': '行政区划',
  'hierarchy-layout': '控件层级布局',
  'text-layer': '文本图层',
  'advanced-route-map': '路径地图',
  'geometric-point-map': '点图层',
  'raster-layer': '栅格图层',
  'block-layout': 'Block 布局设计',
};
const designIconMap: Record<string, string> = {
  'bubble-map': 'bubble_chart',
  'choropleth-map': 'map',
  'marker-cluster': 'scatter_plot',
  'popup': 'chat_bubble',
  'tooltip': 'info',
  'map-controls': 'tune',
  'path-route-map': 'route',
  'arc-flow-map': 'south_east',
  'hexbin-map': 'hexagon',
  'mobile-app': 'smartphone',
  'pc-app': 'desktop_windows',
  'large-screen': 'monitor',
  'legend': 'label',
  'icon-layer': 'image',
  'icon-font-layer': 'font_download',
  'immersive-travel-map': 'photo_camera',
  'administrative-layer': 'public',
  'hierarchy-layout': 'layers',
  'text-layer': 'text_fields',
  'advanced-route-map': 'route',
  'geometric-point-map': 'location_on',
  'raster-layer': 'grid_on',
  'block-layout': 'view_comfy',
};
// 目录名 → 中文分组名（与 demo 分组一致）
const designCategoryMap: Record<string, string> = {
  app: '应用模板',
  composite: '复合图层',
  marker: '点位标注',
  control: '控件',
  engine: '地图引擎',
  layer: '基础图层',
  block: '应用模板',
};

const designDocs = Object.entries(designMdModules).map(([path, mod]) => {
  const parts = path.split('/');
  const dirName = parts[parts.length - 2] ?? '';  // 子目录名，如 app / composite / marker / control / layer
  const filename = parts.pop()?.replace('.md', '') ?? '';
  const htmlPath = path.replace('.md', '.html');
  const htmlContent = designHtmlModules[htmlPath]?.default ?? '';
  return {
    id: filename,
    name: designNameMap[filename] || filename,
    icon: designIconMap[filename] || 'description',
    group: designCategoryMap[dirName] || dirName,
    content: mod.default,
    htmlDemo: htmlContent,
  };
});

const designGroups = [...new Set(designDocs.map((d) => d.group))];

// ── Markdown → HTML 转换器（基于 marked，输出使用 CSS 类名以适配亮/暗主题） ──
function markdownToHtml(md: string): string {
  const renderer = new marked.Renderer();

  renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
    const escaped = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<pre class="md-code-block"><code class="language-${lang || ''}">${escaped}</code></pre>`;
  };

  renderer.codespan = ({ text }: { text: string }) => `<code class="md-inline-code">${text}</code>`;

  return marked(md, { renderer, async: false }) as string;
}

const demos = [
  // ── 应用模板（移动端 + 桌面端） ─────────────────────────
  { name: '移动端应用', icon: 'smartphone', component: MobileApp, group: '应用模板', file: 'app/MobileApp', device: 'mobile' },
  { name: '打卡地图', icon: 'location_on', component: CheckInMap, group: '应用模板', file: 'app/CheckInMap', device: 'mobile' },
  { name: '足迹地图', icon: 'explore', component: FootprintMap, group: '应用模板', file: 'app/FootprintMap', device: 'mobile' },
  { name: 'PC 端应用', icon: 'desktop_windows', component: PcApp, group: '应用模板', file: 'app/PcApp', device: 'desktop' },
  { name: '沉浸式旅游足迹', icon: 'photo_camera', component: ImmersiveTravelMap, group: '应用模板', file: 'app/ImmersiveTravelMap', device: 'desktop' },
  { name: '兴趣地图', icon: 'interests', component: InterestMap, group: '应用模板', file: 'app/InterestMap', device: 'mobile' },
  { name: '航线地图', icon: 'flight', component: FlightRouteMap, group: '应用模板', file: 'app/FlightRouteMap', device: 'mobile' },


  // ── 点位标注 ──────────────────────────────
  // 排序原则：默认方案优先、再到按需方案
  { name: 'Marker 标注', icon: 'location_on', component: Marker, group: '点位标注', file: 'marker/Marker' },
  { name: '图标标注', icon: 'label', component: IconLabel, group: '点位标注', file: 'composite/IconLabel' },
  { name: '字体标注', icon: 'font_download', component: IconFontLabel, group: '点位标注', file: 'composite/IconFontLabel' },
  { name: 'Marker 可拖拽', icon: 'push_pin', component: MarkerDrag, group: '点位标注', file: 'marker/MarkerDrag' },
  { name: 'Marker 聚合图', icon: 'scatter_plot', component: MarkerCluster, group: '点位标注', file: 'composite/MarkerCluster' },
  { name: '图像图标', icon: 'emoji_symbols', component: BuiltinIconsDemo, group: '点位标注', file: 'composite/BuiltinIconsDemo' },
  { name: '字体图标', icon: 'text_fields', component: BuiltinGlyphsDemo, group: '点位标注', file: 'composite/BuiltinGlyphsDemo' },

  // ── 复合图层 ──────────────────────────────
  { name: '气泡地图', icon: 'bubble_chart', component: BubbleLayer, group: '复合图层', file: 'composite/BubbleLayer' },
  { name: '热力图-蜂窝', icon: 'hexagon', component: HexagonHeatmap, group: '复合图层', file: 'composite/HexagonHeatmap' },
  { name: '路径地图', icon: 'route', component: RouteLayerDemo, group: '复合图层', file: 'composite/RouteLayer' },
  { name: '弧线地图', icon: 'south_east', component: ArcFlowLayer, group: '复合图层', file: 'composite/ArcFlowLayer' },
  { name: '填充地图', icon: 'stacked_bar_chart', component: ChoroplethMap, group: '复合图层', file: 'composite/ChoroplethMap' },
  { name: '栅格-数据', icon: 'satellite_alt', component: TiffRasterLayerDemo, group: '复合图层', file: 'composite/TiffRasterLayer' },

  // ── 专题地图 ──────────────────────────────
  { name: '卫星影像', icon: 'satellite_alt', component: SatelliteLayerDemo, group: '专题地图', file: 'composite/SatelliteLayer' },
  { name: '中国行政区划图', icon: 'public', component: AdministrativeMap, group: '专题地图', file: 'layer/AdministrativeMap' },

  // ── 交互组件 ──────────────────────────────
  { name: 'Popup 弹窗', icon: 'chat_bubble', component: Popup, group: '交互组件', file: 'marker/Popup' },
  { name: 'Tooltip 轻提示', icon: 'info', component: TooltipDemo, group: '交互组件', file: 'marker/Tooltip' },
  { name: '地图控件', icon: 'tune', component: MapControlsDemo, group: '交互组件', file: 'control/MapControls' },
  { name: '绘制控件', icon: 'edit', component: DrawControlDemo, group: '交互组件', file: 'control/DrawControlDemo' },
  { name: '图片配准', icon: 'image', component: ImageCalibrationDemo, group: '交互组件', file: 'control/ImageCalibrationDemo' },

  // ── 地图引擎 ──────────────────────────────
  { name: '高德地图', icon: 'public', component: GaodeMap, group: '地图引擎', file: 'engine/GaodeMap' },
  { name: 'Maplibre 地图', icon: 'language', component: MaplibreMap, group: '地图引擎', file: 'engine/MaplibreMap' },
  { name: 'Mapbox 地图', icon: 'travel_explore', component: MapboxMap, group: '地图引擎', file: 'engine/MapboxMap' },
  { name: '天地图', icon: 'terrain', component: TiandituMap, group: '地图引擎', file: 'engine/TiandituMap' },
  { name: '腾讯地图', icon: 'map', component: TencentMap, group: '地图引擎', file: 'engine/TencentMap' },
  { name: '百度地图', icon: 'explore', component: BaiduMap, group: '地图引擎', file: 'engine/BaiduMap' },
  { name: 'Google 地图', icon: 'g_translate', component: GoogleMap, group: '地图引擎', file: 'engine/GoogleMap' },
  { name: '独立 Map', icon: 'inventory_2', component: IndependentMap, group: '地图引擎', file: 'engine/IndependentMap' },

  // ── 基础图层 ──────────────────────────────
  // 点
  { name: '点-基础', icon: 'circle', component: PointLayer, group: '基础图层', file: 'layer/PointLayer' },
  { name: '点-形状', icon: 'hexagon', component: GeometricPoint, group: '基础图层', file: 'layer/GeometricPoint' },
  { name: '点-3D柱图', icon: 'bar_chart', component: ColumnLayer, group: '基础图层', file: 'layer/ColumnLayer' },
  { name: '点-颜色映射', icon: 'gradient', component: ColorMapping, group: '基础图层', file: 'layer/ColorMapping' },
  { name: '点-大小映射', icon: 'resize', component: SizeMapping, group: '基础图层', file: 'layer/SizeMapping' },
  // 线
  { name: '线-基础', icon: 'timeline', component: LineLayer, group: '基础图层', file: 'layer/LineLayer' },
  { name: '线-路径', icon: 'route', component: PathMap, group: '基础图层', file: 'layer/PathMap' },
  { name: '线-动画', icon: 'flight', component: LineAnimate, group: '基础图层', file: 'layer/LineAnimate' },
  { name: '线-弧线', icon: 'south_east', component: ArcMap, group: '基础图层', file: 'layer/ArcMap' },
  { name: '线-流向', icon: 'swap_calls', component: FlowMap, group: '基础图层', file: 'layer/FlowMap' },
  { name: '线-等值线', icon: 'waves', component: IsolineMap, group: '基础图层', file: 'layer/IsolineMap' },
  // 面
  { name: '面-填充', icon: 'format_shapes', component: FillLayer, group: '基础图层', file: 'layer/FillLayer' },
  { name: '面-3D填充', icon: 'location_city', component: Fill3DLayer, group: '基础图层', file: 'layer/Fill3DLayer' },
  // 热力图
  { name: '热力图-经典', icon: 'local_fire_department', component: HeatmapLayer, group: '基础图层', file: 'layer/HeatmapLayer' },
  // 图片图层
  { name: '图片图层', icon: 'image', component: ImageLayer, group: '基础图层', file: 'layer/ImageLayer' },
  // 栅格图层
  { name: '栅格-瓦片', icon: 'grid_view', component: RasterTileLayer, group: '基础图层', file: 'layer/RasterTileLayer' },

  // ── 图例 ──────────────────────────────────
  { name: '分类图例', icon: 'category', component: LegendCategoriesDemo, group: '图例', file: 'layer/LegendCategoriesDemo' },
  { name: '色带图例', icon: 'gradient', component: LegendRampDemo, group: '图例', file: 'layer/LegendRampDemo' },
  { name: '发散图例', icon: 'swap_horiz', component: LegendDivergingDemo, group: '图例', file: 'layer/LegendDivergingDemo' },
  { name: '阈值图例', icon: 'stairs', component: LegendThresholdDemo, group: '图例', file: 'layer/LegendThresholdDemo' },
  { name: '大小图例', icon: 'bubble_chart', component: LegendSizeDemo, group: '图例', file: 'layer/LegendSizeDemo' },
  { name: '线宽图例', icon: 'horizontal_rule', component: LegendLineWidthDemo, group: '图例', file: 'layer/LegendLineWidthDemo' },
  { name: '比例图例', icon: 'bar_chart', component: LegendProportionDemo, group: '图例', file: 'layer/LegendProportionDemo' },
  { name: '图标图例', icon: 'emoji_symbols', component: LegendIconDemo, group: '图例', file: 'layer/LegendIconDemo' },

  // ── Hooks ────────────────────────────────
  { name: 'useResponsive', icon: 'devices', component: UseResponsiveDemo, group: 'Hooks', file: 'layer/UseResponsiveDemo' },

  // ── 移动端 ────────────────────────────────
  { name: '底部抽屉', icon: 'expand_less', component: BottomSheetDemo, group: '移动端', file: 'app/BottomSheetDemo', device: 'mobile' },
  { name: '搜索栏', icon: 'search', component: SearchBarDemo, group: '移动端', file: 'app/SearchBarDemo', device: 'mobile' },
  { name: '工具栏', icon: 'apps', component: MobileToolbarDemo, group: '移动端', file: 'app/MobileToolbarDemo', device: 'mobile' },
  { name: '弹出式图例', icon: 'label', component: MobileSheetLegendDemo, group: '移动端', file: 'app/MobileSheetLegendDemo', device: 'mobile' },
];

const componentDemos = demos.filter(d => d.group !== '应用模板');
const groups = [...new Set(componentDemos.map((d) => d.group))];

// Block 页面的 demos（来自应用模板）
const blockDemos = demos.filter(d => d.group === '应用模板');

// 从 URL 获取当前页面状态（支持 path 和 hash 两种模式）
const getPageFromUrl = (): { page: 'home' | 'demo' | 'design' | 'docs' | 'block' | 'block-design' | 'skill'; demoIndex: number } => {
  // 优先读 pathname（预渲染 SEO 模式），fallback 到 hash（开发兼容）
  const pathname = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');
  const hash = window.location.hash.slice(1);
  const route = pathname || hash;

  if (!route || route === 'home' || route === 'index.html') return { page: 'home', demoIndex: 0 };
  if (route === 'block' || route === 'block/') return { page: 'block', demoIndex: 0 };
  if (route === 'block-design' || route.startsWith('block-design/')) {
    const designId = route.replace(/^block-design\/?/, '');
    const designIndex = designId ? designDocs.findIndex((d) => d.id === designId) : 0;
    return { page: 'block-design', demoIndex: designIndex >= 0 ? designIndex : 0 };
  }
  if (route === 'design' || route.startsWith('design/')) {
    const designId = route.replace(/^design\/?/, '');
    const designIndex = designId ? designDocs.findIndex((d) => d.id === designId) : 0;
    return { page: 'design', demoIndex: designIndex >= 0 ? designIndex : 0 };
  }
  if (route === 'docs' || route.startsWith('docs/')) return { page: 'docs', demoIndex: 0 };
  if (route === 'skill' || route === 'skill/') return { page: 'skill', demoIndex: 0 };

  // 支持格式: block/app/MobileApp — 在 blockDemos 中查找索引
  const blockMatch = route.match(/^block\/(.+)$/);
  if (blockMatch) {
    const blockFile = blockMatch[1];
    const blockIndex = blockDemos.findIndex((d) => d.file === blockFile);
    if (blockIndex >= 0) return { page: 'block', demoIndex: blockIndex };
  }
  // 支持格式: demo/app/MobileApp 或 app/MobileApp
  const normalizedRoute = route.replace(/^demo\//, '');
  const index = demos.findIndex((d) =>
    d.file === normalizedRoute ||
    d.file.replace('demo-', '') === normalizedRoute ||
    d.file === `demo-${normalizedRoute.padStart(2, '0')}`
  );
  return { page: 'demo', demoIndex: index >= 0 ? index : 0 };
};

function App() {
  const [currentPage, setCurrentPage] = React.useState<'home' | 'demo' | 'design' | 'docs' | 'block' | 'block-design' | 'skill'>(() => getPageFromUrl().page);
  const [current, setCurrent] = React.useState(() => getPageFromUrl().demoIndex);
  const [showPanel, setShowPanel] = React.useState(false);
  // 全局 UI 主题
  const [appTheme, setAppTheme] = React.useState<"light" | "dark">("light");

  // Geist/Vercel 设计主题色表
  const isDark = appTheme === "dark";
  const t = {
    bg: isDark ? "#000000" : "#ffffff",
    sidebar: isDark ? "#0a0a0a" : "#ffffff",
    sidebarBorder: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
    sidebarShadow: isDark ? "1px 0 0 0 rgba(255,255,255,0.06)" : "1px 0 0 0 rgba(0,0,0,0.06)",
    logoBorder: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
    logoTitle: isDark ? "#fafafa" : "#171717",
    logoSub: isDark ? "#666666" : "#999999",
    tabActive: isDark ? "#fafafa" : "#171717",
    tabInactive: isDark ? "#666666" : "#999999",
    tabBg: isDark ? "rgba(255,255,255,0.06)" : "#fafafa",
    tabBorder: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
    groupLabel: isDark ? "#888888" : "#666666",
    itemActive: isDark ? "#fafafa" : "#171717",
    itemInactive: isDark ? "#888888" : "#666666",
    itemBgActive: isDark ? "rgba(255,255,255,0.06)" : "#fafafa",
    itemHoverBg: isDark ? "rgba(255,255,255,0.04)" : "#fafafa",
    itemHoverColor: isDark ? "#eaeaea" : "#171717",
    iconActive: isDark ? "#fafafa" : "#171717",
    versionColor: isDark ? "#444444" : "#999999",
    headerBg: isDark ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.85)",
    headerBorder: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
    headerText: isDark ? "#888888" : "#666666",
    headerTitle: isDark ? "#fafafa" : "#171717",
    codeBg: isDark ? "#0a0a0a" : "#fafafa",
    codeBorder: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
    codeText: isDark ? "#eaeaea" : "#171717",
    codeLineNum: isDark ? "#333333" : "#999999",
    btnBorder: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)"}`,
    btnBg: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
    btnColor: isDark ? "#fafafa" : "#171717",
    mobileFrame: isDark ? "#333333" : "#eaeaea",
    mobileFrameBg: isDark ? "#111111" : "#ffffff",
    mobileShadow: isDark ? "0 0 0 1px rgba(255,255,255,0.08), 0 25px 60px rgba(0,0,0,0.5)" : "0 0 0 1px rgba(0,0,0,0.08), 0 25px 60px rgba(0,0,0,0.1)",
    mobileContainerBg: isDark ? "#000000" : "#ffffff",
  };

  const demo = demos[current];
  const DemoComponent = demo.component;

  // 导航工具函数 — 仅更新 URL，状态由调用方设置
  const navigateTo = (path: string) => {
    window.history.pushState(null, '', `/${path}`);
  };

  // 监听浏览器前进/后退
  React.useEffect(() => {
    const handleRouteChange = () => {
      const { page, demoIndex } = getPageFromUrl();
      setCurrentPage(page);
      if (page === 'demo' || page === 'block') {
        setCurrent(demoIndex);
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // 从首页导航到 demo
  const handleNavigateFromHome = (index: number) => {
    setCurrent(index);
    setCurrentPage('demo');
    navigateTo(`demo/${demos[index].file}`);
  };

  // 切换 demo 时更新 URL
  const handleDemoChange = (index: number) => {
    setCurrent(index);
    navigateTo(`demo/${demos[index].file}`);
  };

  // 获取源码文本
  const sourceKey = `./${demo.file}.tsx`;
  const sourceCode = sourceModules[sourceKey]?.default ?? '// 源码加载失败';

  // 当前选中的设计规范文档

  // 首页渲染
  if (currentPage === 'home') {
    return (
      <div data-theme={appTheme} style={{ width: '100%', height: '100%', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <HomePage
          onNavigate={handleNavigateFromHome}
          onNavigateDesign={() => { setCurrentPage('design'); navigateTo('design'); }}
          onNavigateBlock={() => { setCurrent(0); setCurrentPage('block'); navigateTo('block'); }}
          onNavigateDocs={() => { setCurrentPage('docs'); navigateTo('docs'); }}
          onNavigateSkill={() => { setCurrentPage('skill'); navigateTo('skill'); }}
          onToggleTheme={() => setAppTheme((t) => t === 'light' ? 'dark' : 'light')}
          demos={demos}
          theme={appTheme}
        />
      </div>
    );
  }

  // 设计规范页面渲染
  if (currentPage === 'design') {
    return (
      <div data-theme={appTheme} style={{ width: '100%', height: '100%', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <DesignPage
          docs={designDocs}
          groups={designGroups}
          theme={appTheme}
          initialDocIndex={getPageFromUrl().demoIndex}
          onDocChange={(docId: string) => navigateTo(`design/${docId}`)}
          onToggleTheme={() => setAppTheme((t) => t === 'light' ? 'dark' : 'light')}
          onNavigateHome={() => { setCurrentPage('home'); navigateTo(''); }}
          onNavigateDemo={() => { setCurrentPage('demo'); navigateTo('demo/' + demos[0].file); }}
          onNavigateDocs={() => { setCurrentPage('docs'); navigateTo('docs'); }}
          onNavigateBlock={() => { setCurrent(0); setCurrentPage('block'); navigateTo('block'); }}
          onNavigateSkill={() => { setCurrentPage('skill'); navigateTo('skill'); }}
          markdownToHtml={markdownToHtml}
        />
      </div>
    );
  }

  // Block 页面渲染
  if (currentPage === 'block') {
    return (
      <div data-theme={appTheme} style={{ width: '100%', height: '100%', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <BlockPage
          demos={blockDemos}
          theme={appTheme}
          sourceModules={sourceModules}
          onToggleTheme={() => setAppTheme((t) => t === 'light' ? 'dark' : 'light')}
          onNavigateHome={() => { setCurrentPage('home'); navigateTo(''); }}
          onNavigateDemo={() => { setCurrentPage('demo'); navigateTo('demo/' + demos[0].file); }}
          onNavigateDocs={() => { setCurrentPage('docs'); navigateTo('docs'); }}
          onNavigateDesign={() => { setCurrentPage('design'); navigateTo('design'); }}
          onNavigateBlock={() => { setCurrent(0); setCurrentPage('block'); navigateTo('block'); }}
          onNavigateSkill={() => { setCurrentPage('skill'); navigateTo('skill'); }}
          initialDemoIndex={current}
          onDemoChange={(idx) => { setCurrent(idx); navigateTo('block/' + blockDemos[idx].file); }}
        />
      </div>
    );
  }

  // Block-design 页面渲染（带 HTML Demo 的设计规范风格）
  if (currentPage === 'block-design') {
    return (
      <div data-theme={appTheme} style={{ width: '100%', height: '100%', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <BlockDemoPage
          docs={designDocs}
          groups={designGroups}
          theme={appTheme}
          initialDocIndex={current}
          onDocChange={(docId: string) => navigateTo('block-design/' + docId)}
          onToggleTheme={() => setAppTheme((t) => t === 'light' ? 'dark' : 'light')}
          onNavigateHome={() => { setCurrentPage('home'); navigateTo(''); }}
          onNavigateDemo={() => { setCurrentPage('demo'); navigateTo('demo/' + demos[0].file); }}
          onNavigateDocs={() => { setCurrentPage('docs'); navigateTo('docs'); }}
          onNavigateDesign={() => { setCurrentPage('design'); navigateTo('design'); }}
          onNavigateBlock={() => { setCurrent(0); setCurrentPage('block'); navigateTo('block'); }}
          onNavigateSkill={() => { setCurrentPage('skill'); navigateTo('skill'); }}
          markdownToHtml={markdownToHtml}
        />
      </div>
    );
  }

  // 组件文档页面渲染
  if (currentPage === 'docs') {
    return (
      <div data-theme={appTheme} style={{ width: '100%', height: '100%', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <DocsPage
          theme={appTheme}
          onToggleTheme={() => setAppTheme((t) => t === 'light' ? 'dark' : 'light')}
          onNavigateHome={() => { setCurrentPage('home'); navigateTo(''); }}
          onNavigateDemo={() => { setCurrentPage('demo'); navigateTo('demo/' + demos[0].file); }}
          onNavigateDesign={() => { setCurrentPage('design'); navigateTo('design'); }}
          onNavigateBlock={() => { setCurrent(0); setCurrentPage('block'); navigateTo('block'); }}
          onNavigateSkill={() => { setCurrentPage('skill'); navigateTo('skill'); }}
          docsMap={docsMap}
          demos={demos}
          sourceModules={sourceModules}
        />
      </div>
    );
  }

  // Skill 介绍页面渲染
  if (currentPage === 'skill') {
    return (
      <div data-theme={appTheme} style={{ width: '100%', height: '100%', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <SkillPage
          theme={appTheme}
          onToggleTheme={() => setAppTheme((t) => t === 'light' ? 'dark' : 'light')}
          onNavigateHome={() => { setCurrentPage('home'); navigateTo(''); }}
          onNavigateDemo={() => { setCurrentPage('demo'); navigateTo('demo/' + demos[0].file); }}
          onNavigateDocs={() => { setCurrentPage('docs'); navigateTo('docs'); }}
          onNavigateDesign={() => { setCurrentPage('design'); navigateTo('design'); }}
          onNavigateBlock={() => { setCurrent(0); setCurrentPage('block'); navigateTo('block'); }}
        />
      </div>
    );
  }

  return (
    <div data-theme={appTheme} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: t.bg, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* ══════ 顶部统一导航栏 ══════ */}
      <NavBar
        theme={appTheme}
        activePage="demos"
        onLogoClick={() => { setCurrentPage('home'); navigateTo(''); }}
        onNavigateDemos={() => {}}
        onNavigateDocs={() => { setCurrentPage('docs'); navigateTo('docs'); }}
        onNavigateDesign={() => { setCurrentPage('design'); navigateTo('design'); }}
        onNavigateBlock={() => { setCurrent(0); setCurrentPage('block'); navigateTo('block'); }}
        onNavigateSkill={() => { setCurrentPage('skill'); navigateTo('skill'); }}
        onToggleTheme={() => setAppTheme((prev) => prev === 'light' ? 'dark' : 'light')}
      />

      {/* ══════ Body: Sidebar + Content ══════ */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', maxWidth: 1440, margin: '0 auto', width: '100%', padding: '0 48px' }}>
        {/* ========== 左侧 Demo 列表 ========== */}
        <aside
          style={{
            width: 220,
            minWidth: 220,
            flexShrink: 0,
            overflowY: 'auto',
            padding: '24px 0',
            userSelect: 'none',
          }}
        >
          {groups.map((group) => {
            const groupIcon: Record<string, string> = { '基础图层': 'layers', '点位标注': 'location_on', '复合图层': 'bubble_chart', '交互组件': 'gesture', '控件': 'tune', '地图引擎': 'public' };
            return (
              <div key={group} style={{ marginBottom: group === groups[groups.length - 1] ? 0 : 8 }}>
                <div
                  style={{
                    padding: '4px 16px 8px',
                    fontSize: 10,
                    fontWeight: 600,
                    color: t.groupLabel,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 13, opacity: 0.5 }}>{groupIcon[group] || 'folder'}</span>
                  {group}
                </div>
                {demos
                  .map((d, i) => ({ ...d, index: i }))
                  .filter((d) => d.group === group)
                  .map((d) => {
                    const isActive = d.index === current;
                    return (
                      <div
                        key={d.index}
                        onClick={() => handleDemoChange(d.index)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '9px 16px',
                          margin: '2px 6px',
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: isActive ? 500 : 400,
                          color: isActive ? t.itemActive : t.itemInactive,
                          background: isActive ? t.itemBgActive : 'transparent',
                          borderRadius: 6,
                          transition: 'background 120ms, color 120ms',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = t.itemHoverBg;
                            e.currentTarget.style.color = t.itemHoverColor;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = t.itemInactive;
                          }
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ width: 18, textAlign: 'center', fontSize: 17, flexShrink: 0, opacity: isActive ? 1 : 0.4 }}>
                          {d.icon}
                        </span>
                        <span>{d.name}</span>
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </aside>

        {/* ========== 中间内容区 ========== */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {demo.device === 'mobile' ? (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: t.mobileContainerBg,
              }}
            >
              <div
                style={{
                  width: 390,
                  height: 844,
                  maxHeight: 'calc(100% - 40px)',
                  borderRadius: 20,
                  overflow: 'hidden',
                  border: `2px solid ${t.mobileFrame}`,
                  boxShadow: t.mobileShadow,
                  position: 'relative',
                  background: t.mobileFrameBg,
                }}
              >
                <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                  <DemoComponent />
                </div>
              </div>
            </div>
          ) : (
            <DemoComponent />
          )}

        </div>

        {/* ========== 右侧源码切换按钮 + 面板 ========== */}
        <SourceCodeToggle showPanel={showPanel} isDark={isDark} onClick={() => setShowPanel(!showPanel)} />
        {showPanel && (
          <SourceCodePanel sourceCode={sourceCode} fileName={`${demo.file}.tsx`} isDark={isDark} onClose={() => setShowPanel(false)} />
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />,
);
