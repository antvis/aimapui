import React, { useState, useCallback } from 'react';
import { AiMap, HeatmapLayer, PointLayer, ZoomControl, ScaleControl, LegendRamp, LegendControl } from '@antv/aimapui';
import { Tooltip } from '@antv/aimapui';
import type { LayerEventPayload } from '@antv/aimapui';

const heatData = Array.from({ length: 200 }, () => ({
  lng: 116.1 + Math.random() * 0.6,
  lat: 39.7 + Math.random() * 0.45,
  value: Math.random() * 100,
}));

const centers = [
  { lng: 116.397, lat: 39.909, name: '北京' },
];

/**
 * 热力图 — HeatmapLayer
 */
export default function Demo12Heatmap() {
  const [tooltipInfo, setTooltipInfo] = useState<{ visible: boolean; lng: number; lat: number; value: number }>({
    visible: false, lng: 0, lat: 0, value: 0,
  });
  const [legend, setLegend] = useState<{ colors: string[]; labels: string[] } | null>(null);

  const handleMouseMove = useCallback((payload: LayerEventPayload) => {
    if (!payload.feature) return;
    setTooltipInfo({ visible: true, lng: payload.lng, lat: payload.lat, value: Number(payload.feature.value ?? 0) });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltipInfo((prev) => ({ ...prev, visible: false }));
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLayerCreated = useCallback((layer: any) => {
    layer.on('legend:color', (e: any) => {
      const items = e?.items ?? [];
      if (items.length === 0) return;
      setLegend({
        colors: items.map((d: any) => d.color),
        labels: items.map((d: any) => formatValue(d.value)),
      });
    });
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        map={{
          basemap: 'gaode',
          style: 'dark',
          center: [116.397, 39.909],
          zoom: 10,
        }}
      >
        <HeatmapLayer
          source={heatData}
          shape="heatmap"
          sizeField="value"
          sizeValues={[0, 1]}
          colorField="value"
          colorValues={['#2166AC', '#67A9CF', '#D1E5F0', '#FDDBC7', '#EF8A62', '#B2182B']}
          style={{
            intensity: 2,
            radius: 20,
            opacity: 0.85,
            rampColors: {
              colors: ['#2166AC', '#67A9CF', '#D1E5F0', '#FDDBC7', '#EF8A62', '#B2182B'],
              positions: [0, 0.2, 0.4, 0.6, 0.8, 1],
            },
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onLayerCreated={handleLayerCreated}
        />
        <PointLayer source={centers} color="#F6BD16" size={8} />
        <Tooltip
          longitude={tooltipInfo.lng}
          latitude={tooltipInfo.lat}
          variant="light"
          visible={tooltipInfo.visible}
          items={[{ label: '热力值', value: Math.round(tooltipInfo.value) }]}
        />
        <ZoomControl />
        <ScaleControl />
      </AiMap>
      {legend && (
        <div style={{ position: 'absolute', right: 16, bottom: 16, padding: '12px 14px', background: 'rgba(0,0,0,0.75)', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
          <LegendRamp type="ramp" title="热力值" labels={legend.labels} colors={legend.colors} isContinuous />
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatValue(v: any): string {
  if (Array.isArray(v)) return v.map((n: number) => Math.round(n)).join('–');
  if (typeof v === 'number') return String(Math.round(v));
  return String(v ?? '');
}
