import React from 'react';
import { Aimap, PointLayer, ZoomControl, useTheme } from '../../index';
import { ScaleControl } from '../../components/Control/ScaleControl';
import { GeoLocateControl } from '../../components/Control/GeoLocateControl';
import { LegendCategories } from '../../components/Legend/LegendCategories';
import type { MapTheme } from '../../context/ThemeContext';

const cities = [
  { lng: 116.4, lat: 39.9, name: '北京', value: 100 },
  { lng: 121.5, lat: 31.2, name: '上海', value: 90 },
  { lng: 113.3, lat: 23.1, name: '广州', value: 80 },
  { lng: 104.1, lat: 30.6, name: '成都', value: 70 },
  { lng: 120.2, lat: 30.3, name: '杭州', value: 65 },
  { lng: 114.3, lat: 30.6, name: '武汉', value: 60 },
];

/** 主题切换按钮 — 使用 useTheme hook */
function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();

  const options: { value: MapTheme; label: string; icon: string }[] = [
    { value: 'light', label: '亮色', icon: 'light_mode' },
    { value: 'dark', label: '暗色', icon: 'dark_mode' },
    { value: 'system', label: '跟随系统', icon: 'contrast' },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 1000,
        display: 'flex',
        gap: 4,
        padding: 4,
        borderRadius: 10,
        background: resolvedTheme === 'dark' ? 'rgba(22,32,48,0.88)' : 'rgba(248,249,255,0.9)',
        backdropFilter: 'blur(12px)',
        border: resolvedTheme === 'dark'
          ? '1px solid rgba(180,197,255,0.08)'
          : '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 12px',
            borderRadius: 7,
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 500,
            transition: 'all 0.2s ease',
            background: resolvedTheme === opt.value || (opt.value === 'system' && false)
              ? (resolvedTheme === 'dark' ? 'rgba(180,197,255,0.15)' : 'rgba(0,74,198,0.1)')
              : 'transparent',
            color: resolvedTheme === 'dark' ? '#b4c5ff' : '#004ac6',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            {opt.icon}
          </span>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/**
 * 主题切换控件 — ThemeProvider + useTheme
 *
 * 展示：
 * - 亮色/暗色/跟随系统 三种主题模式
 * - 所有 UI 控件（Zoom、Scale、GeoLocate、Legend）自动跟随主题
 * - 底图样式同步切换
 */
export default function ThemeToggleDemo() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap
        map={{
          basemap: 'gaode',
          center: [105, 35],
          zoom: 4,
          style: 'dark',
        }}
        theme="dark"
      >
        <ThemeSwitch />

        <PointLayer
          source={cities}
          color="#4ECDC4"
          size={12}
          active={{ color: '#FFD93D' }}
        />

        <ZoomControl position="bottomright" />
        <GeoLocateControl position="bottomright" />
        <ScaleControl position="bottomleft" />

        <LegendCategories
          type="categories"
          title="城市热度"
          labels={['高', '中', '低']}
          colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
        />
      </Aimap>
    </div>
  );
}
