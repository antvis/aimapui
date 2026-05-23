import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/tailwind.css';

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
// ── 控件 ──
import ZoomControl from './control/ZoomControl';
import FullscreenControl from './control/FullscreenControl';
import GeoLocateControl from './control/GeoLocateControl';
import MapThemeControl from './control/MapThemeControl';
import MouseLocationControl from './control/MouseLocationControl';
import ExportImageControl from './control/ExportImageControl';
import ThemeToggle from './control/ThemeToggle';
// ── Marker 标注 ──
import Marker from './marker/Marker';
import MarkerDrag from './marker/MarkerDrag';
import MarkerTest from './marker/MarkerTest';
import Popup from './marker/Popup';
import TooltipDemo from './marker/Tooltip';
// ── 应用模板 ──
import MobileApp from './app/MobileApp';
import CheckInMap from './app/CheckInMap';
import FootprintMap from './app/FootprintMap';
import TravelStatsMap from './app/TravelStatsMap';
import PcApp from './app/PcApp';
import ImmersiveTravelMap from './app/ImmersiveTravelMap';
import InterestMap from './app/InterestMap';
import FlightRouteMap from './app/FlightRouteMap';
import DarkThemeMap from './app/DarkThemeMap';
// ── 复合图层 ──
import BubbleLayer from './composite/BubbleLayer';
import IconLabel from './composite/IconLabel';
import IconFontLabel from './composite/IconFontLabel';
import ChoroplethMap from './composite/ChoroplethMap';
import HexagonHeatmap from './composite/HexagonHeatmap';
import SatelliteLayerDemo from './composite/SatelliteLayer';
import MarkerCluster from './composite/MarkerCluster';
import PathLayer from './composite/PathLayer';
import ArcLayer from './composite/ArcLayer';
// ── 基础图层 ──
import PointLayer from './layer/PointLayer';
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
import LayerEvents from './layer/LayerEvents';
import MapEvents from './layer/MapEvents';
import FillLayer from './layer/FillLayer';
import Fill3DLayer from './layer/Fill3DLayer';
import HeatmapClassic from './layer/HeatmapClassic';
import ImageLayer from './layer/ImageLayer';
import RasterTileLayer from './layer/RasterTileLayer';

const sourceModules = import.meta.glob(
  ['./{engine,control,marker,layer,composite,app}/*.tsx', './{engine,control,marker,layer,composite,app}/*.md'],
  { query: '?raw', eager: true }
) as Record<string, { default: string }>;

// 设计规范文档 — 从 src/design/ 子目录加载 (.md + .html)
const designMdModules = import.meta.glob(
  '../design/{app,composite,marker,control,engine,layer}/*.md',
  { query: '?raw', eager: true }
) as Record<string, { default: string }>;

const designHtmlModules = import.meta.glob(
  '../design/{app,composite,marker,control,engine,layer}/*.html',
  { query: '?raw', eager: true }
) as Record<string, { default: string }>;

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
};
// 目录名 → 中文分组名（与 demo 分组一致）
const designCategoryMap: Record<string, string> = {
  app: '应用模板',
  composite: '复合图层',
  marker: 'Marker 标注',
  control: '控件',
  engine: '地图引擎',
  layer: '基础图层',
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

// ── 简易 Markdown → HTML 转换器 ──
function markdownToHtml(md: string): string {
  let html = md;

  // 代码块
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    const escaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<pre style="background:#161b22;padding:12px 16px;border-radius:6px;overflow-x:auto;border:1px solid #30363d;margin:12px 0"><code class="language-${lang}">${escaped}</code></pre>`;
  });

  // 表格
  html = html.replace(/^\|(.+)\|\s*\n\|[\s:|-]+\|\s*\n((?:\|.+\|\s*\n)*)/gm, (_m, headerRow, bodyRows) => {
    const headers = headerRow.split('|').map((h: string) => h.trim()).filter(Boolean);
    const headerHtml = headers.map((h: string) => `<th style="padding:8px 12px;border-bottom:2px solid #30363d;text-align:left;font-weight:600;font-size:12px;color:#58a6ff">${h}</th>`).join('');
    const rows = bodyRows.trim().split('\n').map((row: string) => {
      const cells = row.split('|').map((c: string) => c.trim()).filter(Boolean);
      return `<tr>${cells.map((c: string) => `<td style="padding:6px 12px;border-bottom:1px solid #21262d;font-size:12px">${c}</td>`).join('')}</tr>`;
    }).join('');
    return `<table style="width:100%;border-collapse:collapse;margin:12px 0"><thead><tr>${headerHtml}</tr></thead><tbody>${rows}</tbody></table>`;
  });

  // 标题
  html = html.replace(/^### (.+)$/gm, '<h3 style="font-size:14px;font-weight:600;color:#e6edf3;margin:16px 0 8px;padding-left:0">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 style="font-size:16px;font-weight:600;color:#e6edf3;margin:20px 0 10px;border-bottom:1px solid #21262d;padding-bottom:6px">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 style="font-size:20px;font-weight:700;color:#e6edf3;margin:0 0 8px">$1</h1>');

  // 水平线
  html = html.replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid #21262d;margin:16px 0"/>');

  // 加粗
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e6edf3">$1</strong>');
  // 行内代码
  html = html.replace(/`([^`]+)`/g, '<code style="background:#161b22;padding:2px 5px;border-radius:3px;font-size:11px;color:#79c0ff;font-family:monospace">$1</code>');
  // 斜体
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // 列表项
  html = html.replace(/^\*\s+(.+)$/gm, '<li style="margin:3px 0;padding-left:4px;font-size:13px;line-height:1.7">$1</li>');
  // 包裹连续 li 为 ul
  html = html.replace(/((?:<li[^>]*>.*<\/li>\s*)+)/g, '<ul style="list-style:disc;padding-left:20px;margin:8px 0">$1</ul>');

  // 段落（非空行且不是已标签化的内容）
  html = html.replace(/^(?!<[a-zA-Z/])(.+)$/gm, (match) => {
    if (match.trim() === '') return '';
    return `<p style="margin:6px 0;font-size:13px;line-height:1.7;color:#8b949e">${match}</p>`;
  });

  // 空行清理
  html = html.replace(/\n{3,}/g, '\n\n');

  return html;
}

const demos = [
  // ── 应用模板（移动端 + 桌面端） ─────────────────────────
  { name: '移动端应用', icon: 'smartphone', component: MobileApp, group: '应用模板', file: 'app/MobileApp', device: 'mobile' },
  { name: '打卡地图', icon: 'location_on', component: CheckInMap, group: '应用模板', file: 'app/CheckInMap', device: 'mobile' },
  { name: '足迹地图', icon: 'explore', component: FootprintMap, group: '应用模板', file: 'app/FootprintMap', device: 'mobile' },
  { name: '旅行足迹统计', icon: 'bar_chart', component: TravelStatsMap, group: '应用模板', file: 'app/TravelStatsMap', device: 'mobile' },
  { name: 'PC 端应用', icon: 'desktop_windows', component: PcApp, group: '应用模板', file: 'app/PcApp', device: 'desktop' },
  { name: '沉浸式旅游足迹', icon: 'photo_camera', component: ImmersiveTravelMap, group: '应用模板', file: 'app/ImmersiveTravelMap', device: 'desktop' },
  { name: '兴趣地图', icon: 'interests', component: InterestMap, group: '应用模板', file: 'app/InterestMap', device: 'mobile' },
  { name: '航线地图', icon: 'flight', component: FlightRouteMap, group: '应用模板', file: 'app/FlightRouteMap', device: 'mobile' },
  { name: '暗色主题', icon: 'dark_mode', component: DarkThemeMap, group: '应用模板', file: 'app/DarkThemeMap', device: 'desktop' },

  // ── 复合图层 ──────────────────────────────
  // 点
  { name: '气泡图', icon: 'bubble_chart', component: BubbleLayer, group: '复合图层', file: 'composite/BubbleLayer' },
  { name: '图片标注', icon: 'label', component: IconLabel, group: '复合图层', file: 'composite/IconLabel' },
  { name: '字体标注', icon: 'font_download', component: IconFontLabel, group: '复合图层', file: 'composite/IconFontLabel' },
  // 面
  { name: '分级统计图', icon: 'stacked_bar_chart', component: ChoroplethMap, group: '复合图层', file: 'composite/ChoroplethMap' },
  // 热力图
  { name: '蜂窝热力图', icon: 'hexagon', component: HexagonHeatmap, group: '复合图层', file: 'composite/HexagonHeatmap' },
  { name: '卫星影像', icon: 'satellite_alt', component: SatelliteLayerDemo, group: '复合图层', file: 'composite/SatelliteLayer' },
  { name: 'Marker 聚合', icon: 'scatter_plot', component: MarkerCluster, group: '复合图层', file: 'composite/MarkerCluster' },

  // ── Marker 标注 ───────────────────────────
  { name: 'Marker 标注', icon: 'location_on', component: Marker, group: 'Marker 标注', file: 'marker/Marker' },
  { name: 'Marker 测试', icon: 'science', component: MarkerTest, group: 'Marker 标注', file: 'marker/MarkerTest' },
  { name: '可拖拽标注', icon: 'push_pin', component: MarkerDrag, group: 'Marker 标注', file: 'marker/MarkerDrag' },
  { name: 'Popup 弹窗', icon: 'chat_bubble', component: Popup, group: 'Marker 标注', file: 'marker/Popup' },
  { name: 'Tooltip 轻提示', icon: 'info', component: TooltipDemo, group: 'Marker 标注', file: 'marker/Tooltip' },

  // ── 控件 ──────────────────────────────────
  { name: '缩放控件', icon: 'zoom_in', component: ZoomControl, group: '控件', file: 'control/ZoomControl' },
  { name: '全屏控件', icon: 'fullscreen', component: FullscreenControl, group: '控件', file: 'control/FullscreenControl' },
  { name: '定位控件', icon: 'my_location', component: GeoLocateControl, group: '控件', file: 'control/GeoLocateControl' },
  { name: '底图主题', icon: 'palette', component: MapThemeControl, group: '控件', file: 'control/MapThemeControl' },
  { name: '鼠标坐标', icon: 'pin_drop', component: MouseLocationControl, group: '控件', file: 'control/MouseLocationControl' },
  { name: '导出图片', icon: 'photo_camera', component: ExportImageControl, group: '控件', file: 'control/ExportImageControl' },
  { name: 'UI 主题切换', icon: 'dark_mode', component: ThemeToggle, group: '控件', file: 'control/ThemeToggle' },

  // ── 地图引擎 ──────────────────────────────
  { name: '高德地图', icon: 'public', component: GaodeMap, group: '地图引擎', file: 'engine/GaodeMap' },
  { name: 'Maplibre 地图', icon: 'language', component: MaplibreMap, group: '地图引擎', file: 'engine/MaplibreMap' },
  { name: 'Mapbox 地图', icon: 'travel_explore', component: MapboxMap, group: '地图引擎', file: 'engine/MapboxMap' },
  { name: '天地图', icon: 'terrain', component: TiandituMap, group: '地图引擎', file: 'engine/TiandituMap' },
  { name: '独立 Map', icon: 'inventory_2', component: IndependentMap, group: '地图引擎', file: 'engine/IndependentMap' },

  // ── 基础图层 ──────────────────────────────
  // 点
  { name: '点图层', icon: 'circle', component: PointLayer, group: '基础图层', file: 'layer/PointLayer' },
  { name: '3D 柱图', icon: 'bar_chart', component: ColumnLayer, group: '基础图层', file: 'layer/ColumnLayer' },
  { name: '颜色映射', icon: 'gradient', component: ColorMapping, group: '基础图层', file: 'layer/ColorMapping' },
  { name: '大小映射', icon: 'resize', component: SizeMapping, group: '基础图层', file: 'layer/SizeMapping' },
  // 线
  { name: '线图层', icon: 'timeline', component: LineLayer, group: '基础图层', file: 'layer/LineLayer' },
  { name: '路径地图', icon: 'route', component: PathMap, group: '基础图层', file: 'layer/PathMap' },
  { name: '线动画', icon: 'flight', component: LineAnimate, group: '基础图层', file: 'layer/LineAnimate' },
  { name: '弧线地图', icon: 'south_east', component: ArcMap, group: '基础图层', file: 'layer/ArcMap' },
  { name: '流向图', icon: 'swap_calls', component: FlowMap, group: '基础图层', file: 'layer/FlowMap' },
  { name: '等值线地图', icon: 'waves', component: IsolineMap, group: '基础图层', file: 'layer/IsolineMap' },
  // 面
  { name: '填充图层', icon: 'format_shapes', component: FillLayer, group: '基础图层', file: 'layer/FillLayer' },
  { name: '行政区划 GDP', icon: 'public', component: AdministrativeMap, group: '基础图层', file: 'layer/AdministrativeMap' },
  { name: '3D 填充图', icon: 'location_city', component: Fill3DLayer, group: '基础图层', file: 'layer/Fill3DLayer' },
  // 热力图
  { name: '热力图', icon: 'local_fire_department', component: HeatmapLayer, group: '基础图层', file: 'layer/HeatmapLayer' },
  { name: '经典热力图', icon: 'thermostat', component: HeatmapClassic, group: '基础图层', file: 'layer/HeatmapClassic' },
  // 图片 & 栅格
  { name: '图片图层', icon: 'image', component: ImageLayer, group: '基础图层', file: 'layer/ImageLayer' },
  { name: '栅格瓦片', icon: 'grid_view', component: RasterTileLayer, group: '基础图层', file: 'layer/RasterTileLayer' },
  // 事件 & 组合
  { name: '多图层叠加', icon: 'layers', component: MultiLayer, group: '基础图层', file: 'layer/MultiLayer' },
  { name: '图层事件', icon: 'touch_app', component: LayerEvents, group: '基础图层', file: 'layer/LayerEvents' },
  { name: '地图事件', icon: 'explore', component: MapEvents, group: '基础图层', file: 'layer/MapEvents' },
];

const groups = [...new Set(demos.map((d) => d.group))];

// 从 URL hash 获取当前 demo 索引
const getDemoIndexFromHash = (): number => {
  const hash = window.location.hash.slice(1); // 移除 #
  if (!hash) return 0;

  // 支持格式: #map/GaodeMap 或 #11 或 #demo-11
  const index = demos.findIndex((d) =>
    d.file === hash ||
    d.file.replace('demo-', '') === hash ||
    d.file === `demo-${hash.padStart(2, '0')}`
  );
  return index >= 0 ? index : 0;
};

function App() {
  const [current, setCurrent] = React.useState(() => getDemoIndexFromHash());
  const [showPanel, setShowPanel] = React.useState(false);
  // 左侧主 Tab：可视化 / 设计规范
  const [sidebarMode, setSidebarMode] = React.useState<'demo' | 'design'>('demo');
  // 当前选中的设计规范文档索引
  const [currentDesignDoc, setCurrentDesignDoc] = React.useState(0);
  // 设计规范展示模式：html 预览(markdown渲染) / html demo(加载.html文件)
  // 全局 UI 主题
  const [appTheme, setAppTheme] = React.useState<"light" | "dark">("light");
  const [designViewMode, setDesignViewMode] = React.useState<'html' | 'demo'>('demo');

  const demo = demos[current];
  const DemoComponent = demo.component;

  // 监听 URL hash 变化
  React.useEffect(() => {
    const handleHashChange = () => {
      const newIndex = getDemoIndexFromHash();
      if (newIndex !== current) {
        setCurrent(newIndex);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [current]);

  // 切换 demo 时更新 URL hash
  const handleDemoChange = (index: number) => {
    setCurrent(index);
    const demoFile = demos[index].file;
    window.location.hash = demoFile; // 例如: #map/GaodeMap
  };

  // 获取源码文本
  const sourceKey = `./${demo.file}.tsx`;
  const sourceCode = sourceModules[sourceKey]?.default ?? '// 源码加载失败';

  // 当前选中的设计规范文档
  const selectedDesignDoc = designDocs[currentDesignDoc];

  return (
    <div data-theme={appTheme} style={{ width: '100%', height: '100%', display: 'flex', background: appTheme === 'dark' ? '#0f0f1a' : '#f5f7fa', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* ========== 左侧菜单 ========== */}
      <div
        style={{
          width: 240,
          minWidth: 240,
          height: '100%',
          background: 'linear-gradient(180deg, #13132b 0%, #0d0d1f 100%)',
          borderRight: '1px solid rgba(99, 102, 241, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          userSelect: 'none',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Logo / 标题 */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(99, 102, 241, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#fff' }}>map</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', letterSpacing: 0.3 }}>
                AimapKit
              </div>
              <div style={{ fontSize: 10, color: 'rgba(148, 163, 184, 0.7)', marginTop: 1, letterSpacing: 0.2 }}>
                Composable Map Components
              </div>
            </div>
          </div>
        </div>

        {/* 左侧 Tab 切换：可视化 / 设计规范 */}
        <div style={{ display: 'flex', gap: 2, padding: '8px 12px', borderBottom: '1px solid rgba(99, 102, 241, 0.06)' }}>
          <button
            onClick={() => setSidebarMode('demo')}
            style={{
              flex: 1,
              padding: '7px 0',
              fontSize: 11,
              fontWeight: 600,
              color: sidebarMode === 'demo' ? '#e0e7ff' : 'rgba(148, 163, 184, 0.6)',
              background: sidebarMode === 'demo' ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              letterSpacing: 0.3,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 3 }}>layers</span>可视化
          </button>
          <button
            onClick={() => setSidebarMode('design')}
            style={{
              flex: 1,
              padding: '7px 0',
              fontSize: 11,
              fontWeight: 600,
              color: sidebarMode === 'design' ? '#e0e7ff' : 'rgba(148, 163, 184, 0.6)',
              background: sidebarMode === 'design' ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              letterSpacing: 0.3,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 3 }}>design_services</span>设计规范
          </button>
        </div>

        {/* 菜单列表 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
          {sidebarMode === 'demo' ? (
            /* 可视化模式：展示 demos 列表 */
            groups.map((group) => (
              <div key={group}>
                <div
                  style={{
                    padding: '14px 20px 6px',
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'rgba(99, 102, 241, 0.8)',
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                  }}
                >
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
                          padding: '7px 12px',
                          margin: '1px 8px',
                          cursor: 'pointer',
                          fontSize: 12.5,
                          fontWeight: isActive ? 500 : 400,
                          color: isActive ? '#e0e7ff' : 'rgba(148, 163, 184, 0.7)',
                          background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                          borderRadius: 8,
                          borderLeft: 'none',
                          transition: 'all 0.2s ease',
                          position: 'relative',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.06)';
                            e.currentTarget.style.color = 'rgba(203, 213, 225, 0.9)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'rgba(148, 163, 184, 0.7)';
                          }
                        }}
                      >
                        {isActive && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 16, borderRadius: 2, background: 'linear-gradient(180deg, #6366f1, #8b5cf6)' }} />}
                        <span className="material-symbols-outlined" style={{ width: 20, textAlign: 'center', fontSize: 16, flexShrink: 0, opacity: isActive ? 1 : 0.6, color: isActive ? '#a5b4fc' : 'inherit' }}>
                          {d.icon}
                        </span>
                        <span>{d.name}</span>
                      </div>
                    );
                  })}
              </div>
            ))
          ) : (
            /* 设计规范模式：展示 design docs 列表 */
            <div>
              {designGroups.map((group) => (
                <div key={group}>
                  <div
                    style={{
                      padding: '14px 20px 6px',
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'rgba(99, 102, 241, 0.8)',
                      letterSpacing: 1.2,
                      textTransform: 'uppercase',
                    }}
                  >
                    {group}
                  </div>
                  {designDocs
                    .map((doc, index) => ({ ...doc, index }))
                    .filter((doc) => doc.group === group)
                    .map((doc) => {
                      const isActive = doc.index === currentDesignDoc;
                      return (
                        <div
                          key={doc.id}
                          onClick={() => setCurrentDesignDoc(doc.index)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '7px 12px',
                            margin: '1px 8px',
                            cursor: 'pointer',
                            fontSize: 12.5,
                            fontWeight: isActive ? 500 : 400,
                            color: isActive ? '#e0e7ff' : 'rgba(148, 163, 184, 0.7)',
                            background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                            borderRadius: 8,
                            transition: 'all 0.2s ease',
                            position: 'relative',
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.06)';
                              e.currentTarget.style.color = 'rgba(203, 213, 225, 0.9)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = 'rgba(148, 163, 184, 0.7)';
                            }
                          }}
                        >
                          {isActive && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 16, borderRadius: 2, background: 'linear-gradient(180deg, #6366f1, #8b5cf6)' }} />}
                          <span className="material-symbols-outlined" style={{ width: 20, textAlign: 'center', fontSize: 16, flexShrink: 0, opacity: isActive ? 1 : 0.6, color: isActive ? '#a5b4fc' : 'inherit' }}>
                            {doc.icon}
                          </span>
                          <span>{doc.name}</span>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部信息 */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(99, 102, 241, 0.06)', fontSize: 10, color: 'rgba(148, 163, 184, 0.4)', letterSpacing: 0.3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34, 197, 94, 0.4)' }} />
            @antv/aimapkit v0.1.0
          </div>
        </div>
      </div>

      {/* ========== 中间内容区 ========== */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {sidebarMode === 'demo' ? (
          <>
            {/* 顶部标题栏 */}
            <div
              style={{
                height: 44,
                display: 'flex',
                alignItems: 'center',
                padding: '0 20px',
                background: 'rgba(15, 15, 26, 0.95)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(99, 102, 241, 0.06)',
                fontSize: 12,
                color: 'rgba(148, 163, 184, 0.7)',
                gap: 10,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#a5b4fc' }}>{demo.icon}</span>
              <span style={{ color: '#e2e8f0', fontWeight: 500, fontSize: 13 }}>{demo.name}</span>
              <span style={{ color: 'rgba(99, 102, 241, 0.3)', fontSize: 10 }}>●</span>
              <span style={{ fontSize: 11 }}>{demo.group}</span>
              <div style={{ flex: 1 }} />
              {/* 代码预览开关 */}
              <button
                onClick={() => setShowPanel((v) => !v)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: '1px solid rgba(99, 102, 241, 0.15)',
                  background: showPanel ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  color: showPanel ? '#a5b4fc' : 'rgba(148, 163, 184, 0.7)',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  letterSpacing: 0.2,
                }}
              >
                {showPanel ? '</> 隐藏代码' : '</> 查看代码'}
              </button>
            </div>

            {/* 地图容器 */}
            <div style={{ position: 'absolute', top: 44, left: 0, right: 0, bottom: 0 }}>
              {demo.device === 'mobile' ? (
                /* 移动端 Demo：居中手机模拟器 */
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'radial-gradient(ellipse at center, #1a1a35 0%, #0f0f1a 70%)',
                  }}
                >
                  <div
                    style={{
                      width: 390,
                      height: 844,
                      maxHeight: 'calc(100% - 40px)',
                      borderRadius: 20,
                      overflow: 'hidden',
                      border: '2px solid #2a2a44',
                      boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99, 102, 241, 0.1)',
                      position: 'relative',
                      background: '#f8f9ff',
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
          </>
        ) : (
          /* 设计规范模式：展示文档内容 */
          <>
            {/* 顶部标题栏 + 视图模式切换 */}
            <div
              style={{
                height: 44,
                display: 'flex',
                alignItems: 'center',
                padding: '0 20px',
                background: 'rgba(15, 15, 26, 0.95)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(99, 102, 241, 0.06)',
                fontSize: 12,
                color: 'rgba(148, 163, 184, 0.7)',
                gap: 10,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#a5b4fc' }}>{selectedDesignDoc?.icon}</span>
              <span style={{ color: '#e2e8f0', fontWeight: 500, fontSize: 13 }}>{selectedDesignDoc?.name}</span>
              <span style={{ color: 'rgba(99, 102, 241, 0.3)', fontSize: 10 }}>●</span>
              <span style={{ fontSize: 11 }}>设计规范</span>
              <div style={{ flex: 1 }} />
              {/* HTML 预览 / HTML Demo 切换 */}
              <div style={{ display: 'flex', gap: 2, padding: 2, borderRadius: 8, background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                <button
                  onClick={() => setDesignViewMode('html')}
                  style={{
                    padding: '4px 10px',
                    border: 'none',
                    borderRadius: 6,
                    background: designViewMode === 'html' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    color: designViewMode === 'html' ? '#a5b4fc' : 'rgba(148, 163, 184, 0.6)',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 2 }}>article</span> Markdown
                </button>
                <button
                  onClick={() => setDesignViewMode('demo')}
                  style={{
                    padding: '4px 10px',
                    border: 'none',
                    borderRadius: 6,
                    background: designViewMode === 'demo' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    color: designViewMode === 'demo' ? '#a5b4fc' : 'rgba(148, 163, 184, 0.6)',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 2 }}>desktop_windows</span> HTML Demo
                </button>
              </div>
            </div>

            {/* 文档内容区 */}
            <div style={{ position: 'absolute', top: 44, left: 0, right: 0, bottom: 0, overflow: 'hidden', background: '#0a0a18' }}>
              {selectedDesignDoc ? (
                designViewMode === 'html' ? (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      overflow: 'auto',
                      padding: '24px 32px',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: 800,
                        margin: '0 auto',
                        color: '#c9d1d9',
                        lineHeight: 1.7,
                        fontSize: 13,
                      }}
                      dangerouslySetInnerHTML={{ __html: markdownToHtml(selectedDesignDoc.content) }}
                    />
                  </div>
                ) : selectedDesignDoc.htmlDemo ? (
                  <iframe
                    srcDoc={selectedDesignDoc.htmlDemo}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      background: '#fff',
                    }}
                    title={`${selectedDesignDoc.name} Demo`}
                    sandbox="allow-scripts allow-same-origin"
                  />
                ) : (
                  <div style={{ color: '#8b949e', textAlign: 'center', padding: '60px 20px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 32, marginBottom: 12, display: 'block', color: '#8b949e' }}>construction</span>
                    <div>暂无 HTML Demo</div>
                    <div style={{ fontSize: 11, marginTop: 8, opacity: 0.7 }}>
                      可在 src/design/ 目录添加 {selectedDesignDoc.id}.html 文件
                    </div>
                  </div>
                )
              ) : (
                <div style={{ color: '#8b949e', textAlign: 'center', padding: '60px 20px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 32, marginBottom: 12, display: 'block' }}>description</span>
                  <div>暂无设计规范文档</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ========== 右侧代码预览面板（仅可视化模式） ========== */}
      {sidebarMode === 'demo' && showPanel && (
        <div
          style={{
            width: 440,
            minWidth: 340,
            height: '100%',
            background: '#0a0a18',
            borderLeft: '1px solid rgba(99, 102, 241, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* 顶部标题栏 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              background: 'rgba(15, 15, 30, 0.95)',
              borderBottom: '1px solid rgba(99, 102, 241, 0.06)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#a5b4fc' }}>code</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#a5b4fc', letterSpacing: 0.3 }}>源代码</span>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => setShowPanel(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                borderRadius: 6,
                border: 'none',
                background: 'transparent',
                color: 'rgba(148, 163, 184, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                e.currentTarget.style.color = '#a5b4fc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'rgba(148, 163, 184, 0.5)';
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
            </button>
          </div>

          {/* 文件名 */}
          <div
            style={{
              padding: '8px 16px',
              fontSize: 11,
              color: 'rgba(148, 163, 184, 0.5)',
              background: 'rgba(15, 15, 30, 0.6)',
              borderBottom: '1px solid rgba(99, 102, 241, 0.04)',
              fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
              letterSpacing: 0.3,
            }}
          >
            {demo.file}.tsx
          </div>

          {/* 代码内容区 */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            <pre
              style={{
                margin: 0,
                padding: '16px 0',
                fontSize: 12,
                lineHeight: 1.7,
                fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', Menlo, Monaco, monospace",
                color: '#c9d1d9',
                whiteSpace: 'pre',
                tabSize: 2,
              }}
            >
              {sourceCode.split('\n').map((line, i) => (
                <div key={i} style={{ display: 'flex' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      minWidth: 48,
                      paddingRight: 16,
                      textAlign: 'right',
                      color: 'rgba(99, 102, 241, 0.25)',
                      userSelect: 'none',
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ flex: 1, paddingRight: 20 }}>
                    {line}
                  </span>
                </div>
              ))}
            </pre>
          </div>

          {/* 底部按钮 */}
          <div
            style={{
              padding: '10px 16px',
              borderTop: '1px solid rgba(99, 102, 241, 0.06)',
              background: 'rgba(15, 15, 30, 0.8)',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <button
              onClick={() => {
                navigator.clipboard.writeText(sourceCode).catch(() => {});
              }}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: '1px solid rgba(99, 102, 241, 0.15)',
                background: 'rgba(99, 102, 241, 0.06)',
                color: 'rgba(165, 180, 252, 0.8)',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 500,
                transition: 'all 0.2s ease',
                letterSpacing: 0.3,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#a5b4fc';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(165, 180, 252, 0.8)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.15)';
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.06)';
              }}
            >
              复制代码
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);