import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/tailwind.css';

// ============================================================
// Demo 入口 — 左侧菜单 + 中间地图 + 右侧代码预览
// 所有 Demo 均使用组件化 API
// ============================================================

// Map
import GaodeMap from './map/GaodeMap';
import MaplibreMap from './map/MaplibreMap';
import MapboxMap from './map/MapboxMap';
import IndependentMap from './map/IndependentMap';
import TiandituMap from './map/TiandituMap';
// Control
import ZoomControl from './control/ZoomControl';
import FullscreenControl from './control/FullscreenControl';
import GeoLocateControl from './control/GeoLocateControl';
import MapThemeControl from './control/MapThemeControl';
import MouseLocationControl from './control/MouseLocationControl';
import ExportImageControl from './control/ExportImageControl';
// Marker
import Marker from './marker/Marker';
import MarkerDrag from './marker/MarkerDrag';
import MarkerCluster from './marker/MarkerCluster';
import MarkerTest from './marker/MarkerTest';
// Popup
import Popup from './popup/Popup';
// Layer
import PointLayer from './layer/PointLayer';
import ColorMapping from './layer/ColorMapping';
import SizeMapping from './layer/SizeMapping';
import LineLayer from './layer/LineLayer';
import HeatmapLayer from './layer/HeatmapLayer';
import MultiLayer from './layer/MultiLayer';
import LayerEvents from './layer/LayerEvents';
import MapEvents from './layer/MapEvents';
// Advanced
import BubbleLayer from './advanced/BubbleLayer';
import IconLabel from './advanced/IconLabel';
import PathLayer from './advanced/PathLayer';
import ArcLayer from './advanced/ArcLayer';
import FillLayer from './advanced/FillLayer';
import Fill3DLayer from './advanced/Fill3DLayer';
import HeatmapClassic from './advanced/HeatmapClassic';
import HexagonHeatmap from './advanced/HexagonHeatmap';
import ImageLayer from './advanced/ImageLayer';
import RasterTileLayer from './advanced/RasterTileLayer';
import ChoroplethMap from './advanced/ChoroplethMap';

// 源码文本 — Vite import.meta.glob eager
const sourceModules = import.meta.glob(
  ['./{map,control,marker,popup,layer,advanced}/*.tsx', './{map,control,marker,popup,layer,advanced}/*.md'],
  { query: '?raw', eager: true }
) as Record<string, { default: string }>;

const demos = [
  // ── Map 地图 ──────────────────────────────
  { name: '高德地图', icon: '🇨🇳', component: GaodeMap, group: 'Map 地图', file: 'map/GaodeMap' },
  { name: 'Maplibre 地图', icon: '🌐', component: MaplibreMap, group: 'Map 地图', file: 'map/MaplibreMap' },
  { name: 'Mapbox 地图', icon: '🗾', component: MapboxMap, group: 'Map 地图', file: 'map/MapboxMap' },
  { name: '天地图', icon: '🏔', component: TiandituMap, group: 'Map 地图', file: 'map/TiandituMap' },
  { name: '天地图影像', icon: '🛰', component: IndependentMap, group: 'Map 地图', file: 'map/IndependentMap' },

  // ── Control 控件 ──────────────────────────
  { name: '缩放控件', icon: '⊕', component: ZoomControl, group: 'Control 控件', file: 'control/ZoomControl' },
  { name: '全屏控件', icon: '⛶', component: FullscreenControl, group: 'Control 控件', file: 'control/FullscreenControl' },
  { name: '定位控件', icon: '◎', component: GeoLocateControl, group: 'Control 控件', file: 'control/GeoLocateControl' },
  { name: '主题切换', icon: '🔄', component: MapThemeControl, group: 'Control 控件', file: 'control/MapThemeControl' },
  { name: '鼠标坐标', icon: '✦', component: MouseLocationControl, group: 'Control 控件', file: 'control/MouseLocationControl' },
  { name: '导出图片', icon: '📷', component: ExportImageControl, group: 'Control 控件', file: 'control/ExportImageControl' },

  // ── Marker 标注 ───────────────────────────
  { name: 'Marker 测试', icon: '🧪', component: MarkerTest, group: 'Marker 标注', file: 'marker/MarkerTest' },
  { name: 'Marker 标注', icon: '📍', component: Marker, group: 'Marker 标注', file: 'marker/Marker' },
  { name: '可拖拽标注', icon: '📌', component: MarkerDrag, group: 'Marker 标注', file: 'marker/MarkerDrag' },
  { name: 'Marker 聚合', icon: '🔵', component: MarkerCluster, group: 'Marker 标注', file: 'marker/MarkerCluster' },

  // ── Popup 弹窗 ────────────────────────────
  { name: 'Popup 弹窗', icon: '💬', component: Popup, group: 'Popup 弹窗', file: 'popup/Popup' },

  // ── Layer 基础图层 ────────────────────────
  // 点
  { name: '点图层', icon: '◉', component: PointLayer, group: 'Layer 基础图层', file: 'layer/PointLayer' },
  { name: '颜色映射', icon: '🌈', component: ColorMapping, group: 'Layer 基础图层', file: 'layer/ColorMapping' },
  { name: '大小映射', icon: '⭕', component: SizeMapping, group: 'Layer 基础图层', file: 'layer/SizeMapping' },
  // 线
  { name: '线图层', icon: '🔀', component: LineLayer, group: 'Layer 基础图层', file: 'layer/LineLayer' },
  // 面
  { name: '填充图层', icon: '🧩', component: FillLayer, group: 'Layer 基础图层', file: 'advanced/FillLayer' },
  { name: '3D 填充图', icon: '🏙', component: Fill3DLayer, group: 'Layer 基础图层', file: 'advanced/Fill3DLayer' },
  // 热力图
  { name: '热力图', icon: '🔥', component: HeatmapLayer, group: 'Layer 基础图层', file: 'layer/HeatmapLayer' },
  { name: '经典热力图', icon: '🌡', component: HeatmapClassic, group: 'Layer 基础图层', file: 'advanced/HeatmapClassic' },
  // 图片 & 栅格
  { name: '图片图层', icon: '🖼', component: ImageLayer, group: 'Layer 基础图层', file: 'advanced/ImageLayer' },
  { name: '栅格瓦片', icon: '🧱', component: RasterTileLayer, group: 'Layer 基础图层', file: 'advanced/RasterTileLayer' },
  // 事件 & 组合
  { name: '多图层叠加', icon: '⊞', component: MultiLayer, group: 'Layer 基础图层', file: 'layer/MultiLayer' },
  { name: '图层事件', icon: '👆', component: LayerEvents, group: 'Layer 基础图层', file: 'layer/LayerEvents' },
  { name: '地图事件', icon: '🧭', component: MapEvents, group: 'Layer 基础图层', file: 'layer/MapEvents' },

  // ── 复合图层 ──────────────────────────────
  // 点
  { name: '气泡图', icon: '🫧', component: BubbleLayer, group: '复合图层', file: 'advanced/BubbleLayer' },
  { name: '图标标注', icon: '🏷', component: IconLabel, group: '复合图层', file: 'advanced/IconLabel' },
  // 线
  { name: '路径图', icon: '🛣', component: PathLayer, group: '复合图层', file: 'advanced/PathLayer' },
  { name: '弧线图', icon: '🌉', component: ArcLayer, group: '复合图层', file: 'advanced/ArcLayer' },
  // 面
  { name: '分级统计图', icon: '🗂', component: ChoroplethMap, group: '复合图层', file: 'advanced/ChoroplethMap' },
  // 热力图
  { name: '蜂窝热力图', icon: '⬢', component: HexagonHeatmap, group: '复合图层', file: 'advanced/HexagonHeatmap' },
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
  const [showPanel, setShowPanel] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'code' | 'design'>('code');

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

  // 获取设计规范文本
  const designDocKey = `./${demo.file}.md`;
  const designDoc = (sourceModules as Record<string, { default: string }>)[designDocKey]?.default;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex' }}>
      {/* ========== 左侧菜单 ========== */}
      <div
        style={{
          width: 220,
          minWidth: 220,
          height: '100%',
          background: '#1a1a2e',
          borderRight: '1px solid #2d2d44',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        {/* Logo / 标题 */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #2d2d44' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', letterSpacing: 0.5 }}>
            AimapKit
          </div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
            Composable Map Components
          </div>
        </div>

        {/* 菜单列表 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {groups.map((group) => (
            <div key={group}>
              <div
                style={{
                  padding: '10px 16px 4px',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#5B8FF9',
                  letterSpacing: 1,
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
                        gap: 8,
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: 13,
                        color: isActive ? '#fff' : '#999',
                        background: isActive ? '#2d2d55' : 'transparent',
                        borderLeft: isActive ? '3px solid #5B8FF9' : '3px solid transparent',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = '#222240';
                          e.currentTarget.style.color = '#ccc';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#999';
                        }
                      }}
                    >
                      <span style={{ width: 18, textAlign: 'center', fontSize: 12, flexShrink: 0 }}>
                        {d.icon}
                      </span>
                      <span>{d.name}</span>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>

        {/* 底部信息 */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid #2d2d44', fontSize: 11, color: '#555' }}>
          @antv/aimapkit v0.1.0
        </div>
      </div>

      {/* ========== 中间地图区 ========== */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* 顶部标题栏 */}
        <div
          style={{
            height: 36,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            background: '#12121f',
            borderBottom: '1px solid #2d2d44',
            fontSize: 12,
            color: '#888',
            gap: 8,
          }}
        >
          <span style={{ color: '#5B8FF9' }}>{demo.icon}</span>
          <span style={{ color: '#ccc' }}>{demo.name}</span>
          <span style={{ color: '#555' }}>|</span>
          <span>{demo.group}</span>
          <div style={{ flex: 1 }} />
          {/* 代码预览开关 */}
          <button
            onClick={() => setShowPanel((v) => !v)}
            style={{
              padding: '2px 10px',
              borderRadius: 3,
              border: '1px solid #3d3d5c',
              background: showPanel ? '#2d2d55' : 'transparent',
              color: showPanel ? '#5B8FF9' : '#888',
              cursor: 'pointer',
              fontSize: 12,
              transition: 'all 0.15s',
            }}
          >
            {showPanel ? '</> 隐藏代码' : '</> 查看代码'}
          </button>
        </div>

        {/* 地图容器 */}
        <div style={{ position: 'absolute', top: 36, left: 0, right: 0, bottom: 0 }}>
          <DemoComponent />
        </div>
      </div>

      {/* ========== 右侧代码预览面板 ========== */}
      {showPanel && (
        <div
          style={{
            width: 420,
            minWidth: 320,
            height: '100%',
            background: '#0d1117',
            borderLeft: '1px solid #2d2d44',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Tab 切换栏 */}
          <div
            style={{
              display: 'flex',
              background: '#161b22',
              borderBottom: '1px solid #21262d',
            }}
          >
            <button
              onClick={() => setActiveTab('code')}
              style={{
                padding: '8px 16px',
                fontSize: 12,
                color: activeTab === 'code' ? '#58a6ff' : '#8b949e',
                background: activeTab === 'code' ? '#0d1117' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'code' ? '2px solid #58a6ff' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {'</>'} 代码
            </button>
            <button
              onClick={() => setActiveTab('design')}
              style={{
                padding: '8px 16px',
                fontSize: 12,
                color: activeTab === 'design' ? '#58a6ff' : '#8b949e',
                background: activeTab === 'design' ? '#0d1117' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'design' ? '2px solid #58a6ff' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              🎨 设计规范
            </button>
          </div>

          {/* 文件名 */}
          <div
            style={{
              padding: '8px 16px',
              fontSize: 11,
              color: '#8b949e',
              background: '#161b22',
              borderBottom: '1px solid #21262d',
            }}
          >
            {activeTab === 'code' ? `${demo.file}.tsx` : '设计规范文档'}
          </div>

          {/* 内容区 */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {activeTab === 'code' ? (
              <pre
                style={{
                  margin: 0,
                  padding: '12px 16px',
                  fontSize: 12,
                  lineHeight: 1.6,
                  fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, monospace",
                  color: '#c9d1d9',
                  whiteSpace: 'pre',
                  tabSize: 2,
                }}
              >
                {sourceCode}
              </pre>
            ) : (
              <div
                style={{
                  margin: 0,
                  padding: '12px 16px',
                  fontSize: 13,
                  lineHeight: 1.8,
                  color: '#c9d1d9',
                }}
              >
                {designDoc ? (
                  <pre
                    style={{
                      margin: 0,
                      fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, monospace",
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                    }}
                  >
                    {designDoc}
                  </pre>
                ) : (
                  <div style={{ color: '#8b949e', textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: 24, marginBottom: 12 }}>📝</div>
                    <div>该组件暂无设计规范文档</div>
                    <div style={{ fontSize: 11, marginTop: 8, opacity: 0.7 }}>
                      可在组件同级目录添加 .md 文件
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div
            style={{
              padding: '8px 12px',
              borderTop: '1px solid #2d2d44',
              background: '#161b22',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <button
              onClick={() => {
                navigator.clipboard.writeText(activeTab === 'code' ? sourceCode : (designDoc || '')).catch(() => {});
              }}
              style={{
                padding: '4px 12px',
                borderRadius: 4,
                border: '1px solid #3d3d5c',
                background: '#21262d',
                color: '#8b949e',
                cursor: 'pointer',
                fontSize: 12,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#58a6ff';
                e.currentTarget.style.borderColor = '#58a6ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#8b949e';
                e.currentTarget.style.borderColor = '#3d3d5c';
              }}
            >
              复制{activeTab === 'code' ? '代码' : '文档'}
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