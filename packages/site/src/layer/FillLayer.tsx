import React, { useEffect, useState, useCallback } from 'react';
import { AiMap, FillLayer, ZoomControl, LegendRamp, LegendControl } from '@antv/aimapui';

/**
 * 填充图（填充 + 描边 + 文字）— 使用 Tooltip
 */
export default function Demo24FillStrokeText() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [legend, setLegend] = useState<{ colors: string[]; labels: string[] } | null>(null);

  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/basement_prod/1d27c363-af3a-469e-ab5b-7a7e1ce4f311.json')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData(null));
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
      <AiMap autoFit map={{ basemap: 'gaode', center: [116.368652, 39.93866], zoom: 10.07, style: 'light' }}>
        {data && (
          <FillLayer
            source={data}
            sourceType="geojson"
            shape="fill"
            colorField="unit_price"
            colorValues={['#1A4397', '#2555B7', '#3165D1', '#467BE8', '#6296FE', '#7EA6F9', '#98B7F7', '#BDD0F8', '#DDE6F7', '#F2F5FC']}
            active
            showStroke
            showLabel
            labelField="name"
            hoverEffect
            tooltipEffect
            tooltipFields={['name', 'unit_price']}
            onLayerCreated={handleLayerCreated}
          />
        )}
        <ZoomControl />
      </AiMap>
      {legend && (
        <div style={{ position: 'absolute', right: 16, bottom: 16, padding: '12px 14px', background: 'rgba(255,255,255,0.92)', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <LegendRamp type="ramp" title="单价 (元/m²)" labels={legend.labels} colors={legend.colors} isContinuous />
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
