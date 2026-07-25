import React, { useEffect, useState } from 'react';
import { AiMap, HexagonLayer, ZoomControl } from '@antv/aimapui';
import { Legend } from '../components/Legend';
import { useClickPopup, popupContentWithFields, hoverTooltipEvents } from './useLayerInteraction';

/**
 * CPS 蜂窝色阶 — 单色渐进（低→高）
 * 遵循规范 2.1: 低权重 primary/10 → 高权重 primary 100%
 */
const HEXBIN_COLORS = [
  '#dbeafe', // primary/10
  '#bfdbfe', // primary/20
  '#93c5fd', // primary/30
  '#60a5fa', // primary/50
  '#3b82f6', // primary/60
  '#2563eb', // primary/80
  '#1d4ed8', // primary/90
  '#1e40af', // primary/100
];

/**
 * 蜂窝热力图 (Hexbin Map)
 *
 * 遵循设计规范：
 * - 3D 挤压模式 (hexagonColumn) + 高度映射
 * - 单色渐进色阶（primary 体系）
 * - coverage: 0.8 保持 1px 间距感
 * - opacity: 0.8 确保底图路网可见
 * - Hover 高亮 + Tooltip 聚合信息
 * - 45° 倾斜视角强化立体感
 */
export default function HexagonHeatmapDemo() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  // click → 点击蜂窝柱弹出聚合数据 Popup
  const { onClick, popupNode } = useClickPopup((f) =>
    popupContentWithFields(f, undefined, [
      { label: '汇总值', field: 'sum' },
      { label: '数量', field: 'count' },
    ]),
  );


  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/basement_prod/513add53-dcb2-4295-8860-9e7aa5236699.json')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData(null));
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        autoFit
        map={{
          basemap: 'gaode',
          center: [114.077376, 22.542657],
          zoom: 12.48,
          pitch: 50,
          rotation: 39,
          style: 'light',
        }}
      >
        {data && (
          <HexagonLayer
            source={data}
            sourceType="geojson"
            weightField="h12"
            weightMethod="sum"
            hexSize={100}
            sizeField="sum"
            sizeValues={[0, 600]}
            colorField="sum"
            colorValues={HEXBIN_COLORS}
            style={{ coverage: 0.8, angle: 0, opacity: 0.8 }}
            active={{ color: '#fbbf24' }}
            // hover → Tooltip（蜂窝聚合信息）
            events={hoverTooltipEvents(['sum', 'count'])}
            // click → Popup
            onClick={onClick}
          />
        )}

        {popupNode}
        <ZoomControl position="bottomright" />
      </AiMap>

      {/* 图例 — 蜂窝热力色带 */}
      <div style={{ position: 'absolute', bottom: 32, left: 16, zIndex: 10 }}>
        <Legend
          type="ramp"
          title="汇聚密度"
          colors={HEXBIN_COLORS}
          labels={['低', '高']}
        />
      </div>
    </div>
  );
}