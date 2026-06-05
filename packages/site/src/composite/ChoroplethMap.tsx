import React, { useEffect, useMemo, useState } from 'react';
import { AiMap, FillLayer, ZoomControl } from '@antv/aimapui';
type AnyGeoJSON = {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: unknown;
    properties: Record<string, unknown>;
  }>;
};

type FillColorMapping = 'sequential' | 'diverging' | 'categorical';

const MAPPING_OPTIONS: Array<{ label: string; value: FillColorMapping }> = [
  { label: '单色渐变', value: 'sequential' },
  { label: '发散渐变', value: 'diverging' },
  { label: '分类映射', value: 'categorical' },
];

/**
 * 分级统计图示例
 * - 展示 FillLayer 三种 colorMapping 模式
 * - 演示默认 hover tooltip 与 click 缩放/下钻回调
 */
export default function Demo32ChoroplethMap() {
  const [raw, setRaw] = useState<AnyGeoJSON | null>(null);
  const [mapping, setMapping] = useState<FillColorMapping>('sequential');
  const [activeRegion, setActiveRegion] = useState<string>('无');

  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/basement_prod/1d27c363-af3a-469e-ab5b-7a7e1ce4f311.json')
      .then((res) => res.json())
      .then((json) => setRaw(json))
      .catch(() => setRaw(null));
  }, []);

  const data = useMemo(() => {
    if (!raw) return null;

    const prices = raw.features
      .map((f) => Number(f.properties.unit_price ?? 0))
      .filter((v) => Number.isFinite(v));
    const total = prices.reduce((s, v) => s + v, 0) || 1;

    return {
      ...raw,
      features: raw.features.map((feature) => {
        const value = Number(feature.properties.unit_price ?? 0);
        const ratio = Math.max(0, Math.min(100, (value / total) * 100));
        return {
          ...feature,
          properties: {
            ...feature.properties,
            value,
            ratio: Number(ratio.toFixed(2)),
            category: value > 6 ? 'A' : value > 4 ? 'B' : value > 2 ? 'C' : 'D',
          },
        };
      }),
    } as AnyGeoJSON;
  }, [raw]);


  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap autoFit map={{ basemap: 'gaode', center: [116.368652, 39.93866], zoom: 10.07, style: 'light' }}>
        {data && (
          <FillLayer
            source={data}
            sourceType="geojson"
            colorMapping={mapping}
            colorField={mapping === 'categorical' ? 'category' : 'value'}
            valueField="value"
            percentageField="ratio"
            showStroke
            showLabel
            labelField="name"
            minLabelZoom={10.2}
            hoverEffect
            tooltipEffect
            tooltipFields={['name', 'value', 'ratio']}
            onDrilldown={(feature) => {
              setActiveRegion(String(feature.name ?? feature.id ?? '未知区域'));
            }}
          />
        )}
        <ZoomControl />
      </AiMap>

      </div>
  );
}
