import React, { useState, useCallback } from 'react';
import { AiMap, PointLayer, ZoomControl, LegendRamp, LegendControl } from '@antv/aimapui';
import { Tooltip } from '@antv/aimapui';
import type { LayerEventPayload } from '@antv/aimapui';

const points = Array.from({ length: 40 }, () => ({
  lng: 116.1 + Math.random() * 0.6,
  lat: 39.7 + Math.random() * 0.4,
  value: Math.round(Math.random() * 500),
}));

/**
 * 颜色映射 — colorField + colorValues
 */
export default function Demo09ColorMapping() {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        autoFit
        map={{
          basemap: 'gaode',
          center: [116.397, 39.909],
          zoom: 10,
          style: 'light',
        }}
      >
        <PointLayer
          source={points}
          colorField="value"
          colorValues={['#2166AC', '#67A9CF', '#D1E5F0', '#FDDBC7', '#EF8A62', '#B2182B']}
          size={16}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onLayerCreated={handleLayerCreated}
        />
        <Tooltip
          longitude={tooltipInfo.lng}
          latitude={tooltipInfo.lat}
          variant="dark"
          visible={tooltipInfo.visible}
          items={[{ label: '数值', value: tooltipInfo.value }]}
        />
        <ZoomControl />
        {legend && (
          <LegendControl position="bottomleft">
            <LegendRamp type="ramp" title="数值" labels={legend.labels} colors={legend.colors} isContinuous />
          </LegendControl>
        )}
      </AiMap>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatValue(v: any): string {
  if (Array.isArray(v)) return v.map((n: number) => Math.round(n)).join('–');
  if (typeof v === 'number') return String(Math.round(v));
  return String(v ?? '');
}
