import React, { useEffect, useState, useCallback } from 'react';
import { AiMap, HeatmapLayer, ZoomControl, LegendRamp, LegendControl } from '@antv/aimapui';
import { Tooltip } from '@antv/aimapui';
import type { LayerEventPayload } from '@antv/aimapui';

/**
 * 蜂窝热力图 2D — HeatmapLayer hexagon
 *
 * 参照 L7 示例：heatmap/hexagon
 * 数据：全国发电站容量数据，使用蜂窝聚合展示 2D 平面热力
 */
export default function HexagonHeatmap2D() {
  const [data, setData] = useState<Record<string, unknown>[] | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{ visible: boolean; lng: number; lat: number; value: number }>({
    visible: false, lng: 0, lat: 0, value: 0,
  });
  const [legend, setLegend] = useState<{ colors: string[]; labels: string[] } | null>(null);

  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/basement_prod/337ddbb7-aa3f-4679-ab60-d64359241955.json')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData(null));
  }, []);

  const handleMouseMove = useCallback((payload: LayerEventPayload) => {
    if (!payload.feature) return;
    setTooltipInfo({ visible: true, lng: payload.lng, lat: payload.lat, value: Number(payload.feature.sum ?? payload.feature.count ?? 0) });
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
          center: [104.995, 31.451],
          zoom: 3.79,
          style: 'light',
        }}
      >
        {data && (
          <HeatmapLayer
            source={data}
            sourceConfig={{
              transforms: [
                { type: 'hexagon', size: 90000, field: 'capacity', method: 'sum' },
              ],
            }}
            shape="hexagon"
            colorField="sum"
            colorValues={[
              '#40C4CE', '#30B2E9', '#30B2E9', '#0F62FF', '#0F62FF',
              '#3C73DA', '#3C73DA', '#3C73DA', '#3F4BBA', '#3F4BBA',
              '#3F4BBA', '#3F4BBA',
            ]}
            style={{ coverage: 0.9, angle: 0 }}
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
          items={[{ label: '容量总和', value: tooltipInfo.value }]}
        />
        <ZoomControl position="bottomright" />
      </AiMap>
      {legend && (
        <div style={{ position: 'absolute', right: 16, bottom: 16, padding: '12px 14px', background: 'rgba(255,255,255,0.92)', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <LegendRamp type="ramp" title="容量总和" labels={legend.labels} colors={legend.colors} isContinuous />
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
