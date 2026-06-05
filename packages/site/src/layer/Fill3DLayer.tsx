import React, { useEffect, useState, useCallback } from 'react';
import { AiMap, PolygonLayer, ZoomControl, LegendRamp, LegendControl } from '@antv/aimapui';
import { Tooltip } from '@antv/aimapui';
import type { LayerEventPayload } from '@antv/aimapui';

/**
 * 3D 填充图
 */
export default function Demo25Fill3D() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{ visible: boolean; lng: number; lat: number; name: string; price: number }>({
    visible: false, lng: 0, lat: 0, name: '', price: 0,
  });
  const [legend, setLegend] = useState<{ colors: string[]; labels: string[] } | null>(null);

  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/basement_prod/1d27c363-af3a-469e-ab5b-7a7e1ce4f311.json')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData(null));
  }, []);

  const handleMouseMove = useCallback((payload: LayerEventPayload) => {
    const feature = payload.feature;
    if (!feature) return;
    setTooltipInfo({ visible: true, lng: payload.lng, lat: payload.lat, name: String(feature.name ?? ''), price: Number(feature.unit_price ?? 0) });
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
      <AiMap autoFit map={{ basemap: 'gaode', center: [116.368652, 39.93866], zoom: 10.2, pitch: 55, style: 'dark' }}>
        {data && (
          <PolygonLayer
            source={data}
            sourceType="geojson"
            shape="extrude"
            sizeField="unit_price"
            sizeValues={[0, 3000]}
            colorField="unit_price"
            colorValues={['#163d8f', '#2d5fd1', '#4f85ea', '#86b0ff', '#d7e6ff']}
            style={{ opacity: 0.9 }}
            active={{ color: '#7ec8e3' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onLayerCreated={handleLayerCreated}
          />
        )}
        <Tooltip
          longitude={tooltipInfo.lng}
          latitude={tooltipInfo.lat}
          variant="dark"
          visible={tooltipInfo.visible}
          items={[
            { label: '区域', value: tooltipInfo.name },
            { label: '单价', value: `${tooltipInfo.price} 元/m²` },
          ]}
        />
        <ZoomControl />
      </AiMap>
      {legend && (
        <div style={{ position: 'absolute', right: 16, bottom: 16, padding: '12px 14px', background: 'rgba(0,0,0,0.75)', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
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
