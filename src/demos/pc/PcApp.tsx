import React, { useState, useCallback, useMemo } from 'react';
import { Aimap } from '../../components/Aimap';
import { ZoomControl } from '../../components/Control/ZoomControl';
import { GeoLocateControl } from '../../components/Control/GeoLocateControl';
import { MapThemeControl } from '../../components/Control/MapThemeControl';
import { Marker } from '../../components/Interaction/Marker';
import { LegendRenderer } from '../../components/Legend/LegendRenderer';
import type { LegendSchema } from '../../schema/types';

/* ================================================================
   PC 端地图应用 — GIS 数据分析平台
   遵循 pc-app.md 设计规范：
   - 侧边导航栏 280px（图层管理 + 分析工具）
   - 顶部应用栏 64px（品牌 + 搜索 + 状态）
   - 地图主视口（沉浸式全屏）
   - 玻璃拟态控件组
   - 底部状态栏
   - 图例面板
   ================================================================ */

/** 地理要素数据 */
interface GeoFeature {
  id: string;
  name: string;
  category: 'logistics' | 'monitor' | 'alert' | 'warehouse';
  lng: number;
  lat: number;
  value: number;
  icon: string;
}

/** 图层配置 */
interface LayerConfig {
  key: string;
  name: string;
  icon: string;
  visible: boolean;
  opacity: number;
  color: string;
}

const FEATURES: GeoFeature[] = [
  { id: 'f1', name: '华东集运中心', category: 'logistics', lng: 121.47, lat: 31.23, value: 8500, icon: 'local_shipping' },
  { id: 'f2', name: '浦东仓储基地', category: 'warehouse', lng: 121.54, lat: 31.22, value: 12000, icon: 'warehouse' },
  { id: 'f3', name: '虹桥枢纽站', category: 'logistics', lng: 121.33, lat: 31.20, value: 6200, icon: 'local_shipping' },
  { id: 'f4', name: '杨浦监测站', category: 'monitor', lng: 121.52, lat: 31.27, value: 98, icon: 'sensors' },
  { id: 'f5', name: '松江配送中心', category: 'logistics', lng: 121.23, lat: 31.00, value: 4800, icon: 'local_shipping' },
  { id: 'f6', name: '宝山预警点', category: 'alert', lng: 121.49, lat: 31.40, value: 2, icon: 'warning' },
  { id: 'f7', name: '闵行仓储', category: 'warehouse', lng: 121.38, lat: 31.11, value: 7500, icon: 'warehouse' },
  { id: 'f8', name: '徐汇监测站', category: 'monitor', lng: 121.44, lat: 31.18, value: 99, icon: 'sensors' },
  { id: 'f9', name: '嘉定物流园', category: 'logistics', lng: 121.27, lat: 31.38, value: 5100, icon: 'local_shipping' },
  { id: 'f10', name: '奉贤预警', category: 'alert', lng: 121.47, lat: 30.92, value: 3, icon: 'warning' },
];

const DEFAULT_LAYERS: LayerConfig[] = [
  { key: 'logistics', name: '物流站点', icon: 'local_shipping', visible: true, opacity: 100, color: '#2563eb' },
  { key: 'warehouse', name: '仓储基地', icon: 'warehouse', visible: true, opacity: 100, color: '#7c3aed' },
  { key: 'monitor', name: '监测站点', icon: 'sensors', visible: true, opacity: 80, color: '#10b981' },
  { key: 'alert', name: '预警点位', icon: 'warning', visible: true, opacity: 100, color: '#ef4444' },
  { key: 'heatmap', name: '热力图层', icon: 'whatshot', visible: false, opacity: 60, color: '#f59e0b' },
  { key: 'flow', name: '流向弧线', icon: 'south_east', visible: false, opacity: 70, color: '#06b6d4' },
];

const CATEGORY_COLORS: Record<string, string> = {
  logistics: '#2563eb',
  warehouse: '#7c3aed',
  monitor: '#10b981',
  alert: '#ef4444',
};

const LEGENDS: LegendSchema[] = [
  {
    type: 'categories',
    title: '要素分类',
    labels: ['物流站点', '仓储基地', '监测站点', '预警点位'],
    colors: ['#2563eb', '#7c3aed', '#10b981', '#ef4444'],
  },
  {
    type: 'ramp',
    title: '吞吐量',
    colors: ['#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8', '#1e3a8a'],
    labels: ['0', '3K', '6K', '9K', '12K+'],
    showTicks: true,
    brushable: true,
  },
];

export default function PcApp() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [layers, setLayers] = useState<LayerConfig[]>(DEFAULT_LAYERS);
  const [selectedFeature, setSelectedFeature] = useState<GeoFeature | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [mapStyle, setMapStyle] = useState('light');

  const visibleCategories = useMemo(
    () => layers.filter((l) => l.visible && ['logistics', 'warehouse', 'monitor', 'alert'].includes(l.key)).map((l) => l.key),
    [layers],
  );

  const filteredFeatures = useMemo(
    () => FEATURES.filter((f) => visibleCategories.includes(f.category)),
    [visibleCategories],
  );

  const filteredSearchFeatures = useMemo(
    () => searchValue ? filteredFeatures.filter((f) => f.name.includes(searchValue)) : filteredFeatures,
    [filteredFeatures, searchValue],
  );

  /** 图层显隐切换 */
  const handleLayerToggle = useCallback((key: string) => {
    setLayers((prev) => prev.map((l) => (l.key === key ? { ...l, visible: !l.visible } : l)));
  }, []);

  /** 图层透明度修改 */
  const handleLayerOpacity = useCallback((key: string, opacity: number) => {
    setLayers((prev) => prev.map((l) => (l.key === key ? { ...l, opacity } : l)));
  }, []);

  /** 点击要素 */
  const handleFeatureClick = useCallback((feature: GeoFeature) => {
    setSelectedFeature((prev) => (prev?.id === feature.id ? null : feature));
  }, []);

  /** 要素类型 marker 颜色映射 */
  const getCategoryColor = useCallback((category: string) => {
    return CATEGORY_COLORS[category] || '#2563eb';
  }, []);

  const sidebarWidth = sidebarOpen ? 280 : 0;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── 顶部应用栏 64px ── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          zIndex: 1000,
          background: 'rgba(248, 249, 255, 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(195, 198, 215, 0.3)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 16,
        }}
      >
        {/* 品牌 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#fff' }}>map</span>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#121c2a', letterSpacing: -0.01 }}>GeoLink Pro</div>
            <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 500 }}>城市物流监控平台</div>
          </div>
        </div>

        {/* 侧边栏切换 */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: '1px solid rgba(195, 198, 215, 0.3)',
            background: 'rgba(248, 249, 255, 0.6)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#434655',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
          title="切换侧边栏"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{sidebarOpen ? 'menu_open' : 'menu'}</span>
        </button>

        {/* 搜索栏 */}
        <div
          style={{
            flex: 1,
            maxWidth: 480,
            height: 40,
            borderRadius: 10,
            border: '1px solid rgba(195, 198, 215, 0.4)',
            background: 'rgba(248, 249, 255, 0.6)',
            padding: '0 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#9ca3af' }}>search</span>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="搜索站点、仓库、监测点..."
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: 13,
              color: '#121c2a',
            }}
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#9ca3af' }}>close</span>
            </button>
          )}
        </div>

        {/* 右侧状态 */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.4)' }} />
            <span style={{ fontSize: 12, color: '#434655', fontWeight: 500 }}>系统就绪</span>
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.03em' }}>
            {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#fff' }}>person</span>
          </div>
        </div>
      </div>

      {/* ── 侧边导航栏 280px ── */}
      <div
        style={{
          position: 'absolute',
          top: 64,
          left: 0,
          bottom: 32,
          width: sidebarWidth,
          zIndex: 1000,
          background: 'rgba(248, 249, 255, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRight: '1px solid rgba(195, 198, 215, 0.3)',
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'width 0.3s ease-in-out',
          scrollbarWidth: 'thin',
        }}
      >
        {sidebarOpen && (
          <div style={{ padding: '16px 0' }}>
            {/* 图层管理 */}
            <div style={{ padding: '8px 20px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', marginBottom: 8 }}>
                图层管理
              </div>
            </div>
            {layers.map((layer) => (
              <div
                key={layer.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 20px',
                  transition: 'background 0.15s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,74,198,0.04)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                {/* 显隐开关 */}
                <div
                  onClick={() => handleLayerToggle(layer.key)}
                  style={{
                    width: 34,
                    height: 18,
                    borderRadius: 9,
                    background: layer.visible ? '#2563eb' : '#d1d5db',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: '#fff',
                      position: 'absolute',
                      top: 2,
                      left: layer.visible ? 18 : 2,
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                    }}
                  />
                </div>
                {/* 图标 */}
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: layer.visible ? layer.color : '#9ca3af' }}>
                  {layer.icon}
                </span>
                {/* 名称 */}
                <span style={{ fontSize: 13, color: layer.visible ? '#121c2a' : '#9ca3af', fontWeight: 500, flex: 1 }}>
                  {layer.name}
                </span>
                {/* 透明度 */}
                {layer.visible && (
                  <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: "'JetBrains Mono', monospace" }}>
                    {layer.opacity}%
                  </span>
                )}
              </div>
            ))}

            {/* 透明度滑块（简化版） */}
            {layers.filter((l) => l.visible).map((layer) => (
              <div key={`slider-${layer.key}`} style={{ padding: '2px 20px 8px 64px' }}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={layer.opacity}
                  onChange={(e) => handleLayerOpacity(layer.key, Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: 4,
                    accentColor: layer.color,
                    cursor: 'pointer',
                  }}
                />
              </div>
            ))}

            {/* 分割线 */}
            <div style={{ margin: '12px 20px', borderTop: '1px solid rgba(195, 198, 215, 0.2)' }} />

            {/* 分析工具 */}
            <div style={{ padding: '8px 20px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', marginBottom: 8 }}>
                分析工具
              </div>
            </div>
            {[
              { icon: 'analytics', label: '区域分析', desc: '圈选区域统计' },
              { icon: 'filter_alt', label: '数据筛选', desc: '多维度过滤' },
              { icon: 'timeline', label: '时序对比', desc: '历史数据回溯' },
              { icon: 'download', label: '导出报告', desc: '生成分析报表' },
            ].map((tool) => (
              <div
                key={tool.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 20px',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,74,198,0.04)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#434655' }}>{tool.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#121c2a', fontWeight: 500 }}>{tool.label}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{tool.desc}</div>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#d1d5db' }}>chevron_right</span>
              </div>
            ))}

            {/* 分割线 */}
            <div style={{ margin: '12px 20px', borderTop: '1px solid rgba(195, 198, 215, 0.2)' }} />

            {/* 数据概览面板 */}
            <div style={{ padding: '8px 20px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', marginBottom: 10 }}>
                数据概览
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: '活跃站点', value: '8', unit: '个', color: '#2563eb' },
                  { label: '预警', value: '2', unit: '条', color: '#ef4444' },
                  { label: '今日吞吐', value: '44.6K', unit: '件', color: '#10b981' },
                  { label: '在线率', value: '99.7', unit: '%', color: '#7c3aed' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      background: `${stat.color}08`,
                      border: `1px solid ${stat.color}15`,
                    }}
                  >
                    <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 4 }}>{stat.label}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: stat.color, fontFamily: "'JetBrains Mono', monospace" }}>{stat.value}</span>
                      <span style={{ fontSize: 10, color: '#9ca3af' }}>{stat.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 地图主视口 ── */}
      <div
        style={{
          position: 'absolute',
          top: 64,
          left: sidebarWidth,
          right: 0,
          bottom: 32,
          zIndex: 1,
          transition: 'left 0.3s ease-in-out',
        }}
      >
        <Aimap
          map={{
            basemap: 'gaode',
            center: [121.47, 31.23],
            zoom: 11,
            style: mapStyle,
          }}
        >
          {/* 地图控件组 — 缩放+定位右下角，主题切换右上角 */}
          <ZoomControl position="topright" showZoom />
          <GeoLocateControl position="bottomright" />
          <MapThemeControl position="topright" defaultValue={mapStyle} onThemeChange={setMapStyle} />

          {/* 要素标记 */}
          {filteredSearchFeatures.map((feature) => {
            const isSelected = selectedFeature?.id === feature.id;
            const color = getCategoryColor(feature.category);
            const markerColor = feature.category === 'alert' ? 'error' : feature.category === 'warehouse' ? 'primary' : feature.category === 'monitor' ? 'success' : 'primary';

            return (
              <Marker
                key={feature.id}
                longitude={feature.lng}
                latitude={feature.lat}
                variant="icon"
                icon={feature.icon}
                color={markerColor}
                label={feature.name}
                selected={isSelected}
                onClick={() => handleFeatureClick(feature)}
              />
            );
          })}
        </Aimap>
      </div>

      {/* ── 图例面板（地图区域左下角，独立覆盖层） ── */}
      <LegendRenderer
        legends={LEGENDS}
        style={{
          position: 'absolute',
          left: sidebarWidth + 16,
          bottom: 48,
          zIndex: 1010,
          transition: 'left 0.3s ease-in-out',
        }}
      />

      {/* ── 选中要素详情卡片 ── */}
      {selectedFeature && (
        <div
          style={{
            position: 'absolute',
            top: 80,
            left: sidebarWidth,
            right: 0,
            zIndex: 800,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
            transition: 'left 0.3s ease-in-out',
          }}
        >
            <div
              className="glass-panel"
              style={{
                padding: '14px 20px',
                borderRadius: 14,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                maxWidth: 600,
              }}
            >
              {/* 图标 */}
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: `${getCategoryColor(selectedFeature.category)}12`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 22,
                    color: getCategoryColor(selectedFeature.category),
                    fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                  }}
                >
                  {selectedFeature.icon}
                </span>
              </div>

              {/* 名称 + 分类 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#121c2a' }}>{selectedFeature.name}</span>
                  <span
                    style={{
                      fontSize: 10,
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: `${getCategoryColor(selectedFeature.category)}12`,
                      color: getCategoryColor(selectedFeature.category),
                      fontWeight: 600,
                    }}
                  >
                    {{ logistics: '物流', warehouse: '仓储', monitor: '监测', alert: '预警' }[selectedFeature.category]}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                  {selectedFeature.lng.toFixed(4)}°E, {selectedFeature.lat.toFixed(4)}°N
                </div>
              </div>

              {/* 数值 */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: getCategoryColor(selectedFeature.category), fontFamily: "'JetBrains Mono', monospace" }}>
                  {selectedFeature.value.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>
                  {{ logistics: '件/日', warehouse: '容量', monitor: '在线率%', alert: '预警级别' }[selectedFeature.category]}
                </div>
              </div>

              {/* 关闭 */}
              <button
                onClick={() => setSelectedFeature(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: 8,
                  color: '#9ca3af',
                  display: 'flex',
                  transition: 'background 0.15s',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>
          </div>
        )}

      {/* ── 底部状态栏 ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 32,
          zIndex: 1000,
          background: 'rgba(248, 249, 255, 0.9)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          borderTop: '1px solid rgba(195, 198, 215, 0.2)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 0,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          letterSpacing: '0.03em',
          color: '#6b7280',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>my_location</span>
          31.2304°N, 121.4737°E
        </span>
        <div style={{ width: 1, height: 14, background: 'rgba(195,198,215,0.3)', margin: '0 12px' }} />
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>straight</span>
          1:50,000
        </span>
        <div style={{ width: 1, height: 14, background: 'rgba(195,198,215,0.3)', margin: '0 12px' }} />
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>layers</span>
          {layers.filter((l) => l.visible).length}/{layers.length} 图层
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 4px rgba(16,185,129,0.4)' }} />
          OPERATIONAL
        </span>
        <div style={{ width: 1, height: 14, background: 'rgba(195,198,215,0.3)', margin: '0 12px' }} />
        <span>CPS v2.4.0</span>
      </div>
    </div>
  );
}