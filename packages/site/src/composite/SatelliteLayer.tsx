import React, { useState } from 'react';
import { AiMap, SatelliteLayer, ZoomControl } from '@antv/aimapui';
import type { SatelliteProvider } from '@antv/aimapui';

/**
 * 卫星影像图层 — 支持高德/天地图/谷歌三种影像切换
 */
export default function DemoSatelliteLayer() {
  const [provider, setProvider] = useState<SatelliteProvider>('gaode');

  const providers: { key: SatelliteProvider; label: string }[] = [
    { key: 'gaode', label: '高德卫星' },
    { key: 'tianditu', label: '天地图卫星' },
    { key: 'google', label: '谷歌卫星' },
  ];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        autoFit
        map={{
          basemap: 'map',
          center: [116.39, 39.9],
          zoom: 10,
          style: 'light',
          gestureConfig: { dragPan: true, pinchZoom: true, dragRotate: true },
        }}
      >
        <SatelliteLayer provider={provider} />
        <ZoomControl />
      </AiMap>

      {/* 影像源切换面板 */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 1000,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          borderRadius: 10,
          padding: '8px 6px',
          display: 'flex',
          gap: 4,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        {providers.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setProvider(key)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: 'none',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: provider === key ? '#7C3AED' : 'transparent',
              color: provider === key ? '#fff' : '#475569',
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
