import React, { useEffect, useState, useCallback } from 'react';
import { AiMap, PointLayer, ZoomControl } from '../../index';
import { Tooltip } from '../../components/Interaction/Tooltip';
import type { LayerEventPayload } from '../../schema/types';

/**
 * 3D 柱图 — PointLayer cylinder
 *
 * 参照 L7 示例：point/column
 * 数据：上海房价数据，使用多种柱形 + 颜色映射 + 动画效果
 */
export default function ColumnLayer() {
  const [data, setData] = useState<Record<string, unknown>[] | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{ visible: boolean; lng: number; lat: number; name: string; price: number }>({
    visible: false, lng: 0, lat: 0, name: '', price: 0,
  });

  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/basement_prod/893d1d5f-11d9-45f3-8322-ee9140d288ae.json')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData(null));
  }, []);

  const handleMouseMove = useCallback((payload: LayerEventPayload) => {
    if (!payload.feature) return;
    setTooltipInfo({
      visible: true, lng: payload.lng, lat: payload.lat,
      name: String(payload.feature.name ?? ''),
      price: Number(payload.feature.unit_price ?? 0),
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltipInfo((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        map={{
          basemap: 'gaode',
          center: [121.400257, 31.25287],
          zoom: 14.55,
          pitch: 66,
          rotation: 135,
          style: 'dark',
        }}
      >
        {data && (
          <PointLayer
            source={data}
            sourceConfig={{ x: 'longitude', y: 'latitude' }}
            shapeField="name"
            shapeValues={['cylinder', 'triangleColumn', 'hexagonColumn', 'squareColumn']}
            sizeField="unit_price"
            sizeValues={[6, 6, 100]}
            colorField="name"
            colorValues={['#739DFF', '#61FCBF', '#FFDE74', '#FF896F']}
            animate={{ enable: true }}
            active
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
        )}
        <Tooltip
          longitude={tooltipInfo.lng}
          latitude={tooltipInfo.lat}
          variant="light"
          visible={tooltipInfo.visible}
          items={[
            { label: '小区', value: tooltipInfo.name },
            { label: '单价', value: `${tooltipInfo.price} 元/m²` },
          ]}
        />
        <ZoomControl position="bottomright" />
      </AiMap>
    </div>
  );
}
