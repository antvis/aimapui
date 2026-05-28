import React, { useEffect, useState, useCallback } from 'react';
import { AiMap, LineLayer, ZoomControl } from '@antv/aimapui';
import { Tooltip } from '@antv/aimapui';
import type { LayerEventPayload } from '@antv/aimapui';

/**
 * 等值线地图 — LineLayer isoline
 *
 * 参照 L7 示例：line/isoline/isoline
 * 数据：全国等值线数据，使用颜色和粗细映射展示
 */
export default function IsolineMap() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{ visible: boolean; lng: number; lat: number; value: number }>({
    visible: false, lng: 0, lat: 0, value: 0,
  });

  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/basement_prod/9f6afbcd-3aec-4a26-bd4a-2276d3439e0d.json')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData(null));
  }, []);

  const handleMouseMove = useCallback((payload: LayerEventPayload) => {
    if (!payload.feature) return;
    setTooltipInfo({ visible: true, lng: payload.lng, lat: payload.lat, value: Number(payload.feature.value ?? 0) });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltipInfo((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        map={{
          basemap: 'gaode',
          center: [104.117, 36.493],
          zoom: 3.89,
          style: 'light',
        }}
      >
        {data && (
          <LineLayer
            source={data}
            sourceType="geojson"
            shape="line"
            sizeField="value"
            sizeValues={[0.5, 1, 1.5, 2]}
            colorField="value"
            colorValues={[
              '#D7F9F0', '#B8EFE2', '#A6E1E0', '#83CED6', '#72BED6',
              '#64A5D3', '#4D89E5', '#3771D9', '#1558AC', '#0A3663',
            ]}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
        )}
        <Tooltip
          longitude={tooltipInfo.lng}
          latitude={tooltipInfo.lat}
          variant="dark"
          visible={tooltipInfo.visible}
          items={[{ label: '等值', value: tooltipInfo.value }]}
        />
        <ZoomControl position="bottomright" />
      </AiMap>
    </div>
  );
}
