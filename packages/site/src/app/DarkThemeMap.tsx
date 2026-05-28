import React, { useState, useCallback } from 'react';
import { AiMap, PointLayer, ZoomControl, useTheme } from '@antv/aimapui';
import { Tooltip } from '@antv/aimapui';
import { GeoLocateControl } from '@antv/aimapui';
import { ScaleControl } from '@antv/aimapui';
import { LegendCategories } from '@antv/aimapui';
import type { LayerEventPayload } from '@antv/aimapui';
import type { MapTheme } from '@antv/aimapui';

const cities = [
  { lng: 116.4, lat: 39.9, name: '北京', value: 100, type: '一线' },
  { lng: 121.5, lat: 31.2, name: '上海', value: 90, type: '一线' },
  { lng: 113.3, lat: 23.1, name: '广州', value: 80, type: '一线' },
  { lng: 114.1, lat: 22.5, name: '深圳', value: 85, type: '一线' },
  { lng: 104.1, lat: 30.6, name: '成都', value: 70, type: '新一线' },
  { lng: 106.6, lat: 29.6, name: '重庆', value: 75, type: '新一线' },
  { lng: 120.2, lat: 30.3, name: '杭州', value: 65, type: '新一线' },
  { lng: 114.3, lat: 30.6, name: '武汉', value: 60, type: '新一线' },
  { lng: 108.9, lat: 34.3, name: '西安', value: 55, type: '二线' },
  { lng: 118.8, lat: 32.1, name: '南京', value: 58, type: '新一线' },
  { lng: 117.0, lat: 36.7, name: '济南', value: 45, type: '二线' },
  { lng: 126.6, lat: 45.8, name: '哈尔滨', value: 40, type: '二线' },
];

function ThemeToggleButton() {
  const { resolvedTheme, setTheme } = useTheme();

  const cycleTheme = () => {
    const next: MapTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  return (
    <button
      onClick={cycleTheme}
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 1000,
        padding: '8px 16px',
        borderRadius: 8,
        border: 'none',
        background: resolvedTheme === 'dark' ? 'rgba(180,197,255,0.15)' : 'rgba(0,74,198,0.08)',
        color: resolvedTheme === 'dark' ? '#b4c5ff' : '#004ac6',
        fontWeight: 600,
        fontSize: 13,
        cursor: 'pointer',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.2s ease',
      }}
    >
      {resolvedTheme === 'dark' ? '🌙 暗色主题' : '☀️ 亮色主题'}
    </button>
  );
}

/**
 * 暗色主题 Demo — 展示亮/暗主题切换效果
 */
export default function DarkThemeMap() {
  const [theme, setTheme] = useState<MapTheme>('dark');
  const [tooltipInfo, setTooltipInfo] = useState<{
    visible: boolean; lng: number; lat: number; name: string; value: number; type: string;
  }>({ visible: false, lng: 0, lat: 0, name: '', value: 0, type: '' });

  const handleMouseMove = useCallback((payload: LayerEventPayload) => {
    const feature = payload.feature;
    if (!feature) return;
    setTooltipInfo({
      visible: true,
      lng: payload.lng,
      lat: payload.lat,
      name: String(feature.name ?? ''),
      value: Number(feature.value ?? 0),
      type: String(feature.type ?? ''),
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltipInfo((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        map={{
          basemap: 'gaode',
          center: [105, 35],
          zoom: 4,
          style: theme === 'dark' ? 'dark' : 'light',
        }}
        theme={theme}
      >
        <ThemeToggleButton />

        <PointLayer
          source={cities}
          color="#4ECDC4"
          size={12}
          active={{ color: '#FFD93D' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />

        <Tooltip
          longitude={tooltipInfo.lng}
          latitude={tooltipInfo.lat}
          variant="glass"
          visible={tooltipInfo.visible}
          items={[
            { label: '城市', value: tooltipInfo.name },
            { label: '等级', value: tooltipInfo.type },
            { label: '热度', value: tooltipInfo.value },
          ]}
        />

        <ZoomControl position="bottomright" />
        <GeoLocateControl position="bottomright" />
        <ScaleControl position="bottomleft" />

        <LegendCategories
          type="categories"
          title="城市等级"
          labels={['一线', '新一线', '二线']}
          colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
        />
      </AiMap>
    </div>
  );
}
