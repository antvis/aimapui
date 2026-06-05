import React, { useEffect, useState, useCallback } from 'react';
import { AiMap, LineLayer, ZoomControl, LegendRamp, LegendControl } from '@antv/aimapui';
import { Tooltip } from '@antv/aimapui';
import type { LayerEventPayload } from '@antv/aimapui';

/**
 * 路径地图 — LineLayer path
 *
 * 参照 L7 示例：line/path/bus_light
 * 数据：新加坡公交线路，使用颜色映射展示不同级别路线
 */
export default function PathMap() {
  const [data, setData] = useState<Record<string, unknown>[] | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{ visible: boolean; lng: number; lat: number; level: number }>({
    visible: false, lng: 0, lat: 0, level: 0,
  });
  const [legend, setLegend] = useState<{ colors: string[]; labels: string[] } | null>(null);

  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/basement_prod/ee07641d-5490-4768-9826-25862e8019e1.json')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData(null));
  }, []);

  const handleMouseMove = useCallback((payload: LayerEventPayload) => {
    if (!payload.feature) return;
    setTooltipInfo({ visible: true, lng: payload.lng, lat: payload.lat, level: Number(payload.feature.level ?? 0) });
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
        autoFit
        map={{
          basemap: 'gaode',
          center: [103.837, 1.360],
          zoom: 9.5,
          pitch: 20,
          style: 'light',
        }}
      >
        {data && (
          <LineLayer
            source={data}
            sourceConfig={{ coordinates: 'path' }}
            shape="line"
            sizeField="level"
            sizeValues={[0.8, 0.1, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2]}
            colorField="level"
            colorValues={['#D7F9F0', '#B8EFE2', '#A6E1E0', '#83CED6', '#72BED6', '#64A5D3', '#4D89E5', '#3771D9']}
            active
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
          items={[{ label: '等级', value: tooltipInfo.level }]}
        />
        <ZoomControl position="bottomright" />
      </AiMap>
      {legend && (
        <div style={{ position: 'absolute', right: 16, bottom: 16, padding: '12px 14px', background: 'rgba(255,255,255,0.92)', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <LegendRamp type="ramp" title="路线等级" labels={legend.labels} colors={legend.colors} />
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
