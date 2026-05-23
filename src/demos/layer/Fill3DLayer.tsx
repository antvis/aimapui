import React, { useEffect, useState, useCallback } from 'react';
import { Aimap, PolygonLayer, ZoomControl } from '../../index';
import { Tooltip } from '../../components/Interaction/Tooltip';
import type { LayerEventPayload } from '../../schema/types';

/**
 * 3D 填充图
 */
export default function Demo25Fill3D() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{ visible: boolean; lng: number; lat: number; name: string; price: number }>({
    visible: false,
    lng: 0,
    lat: 0,
    name: '',
    price: 0,
  });

  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/basement_prod/1d27c363-af3a-469e-ab5b-7a7e1ce4f311.json')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData(null));
  }, []);

  const handleMouseMove = useCallback((payload: LayerEventPayload) => {
    const feature = payload.feature;
    if (!feature) return;
    setTooltipInfo({
      visible: true,
      lng: payload.lng,
      lat: payload.lat,
      name: String(feature.name ?? ''),
      price: Number(feature.unit_price ?? 0),
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltipInfo((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap map={{ basemap: 'gaode', center: [116.368652, 39.93866], zoom: 10.2, pitch: 55, style: 'dark' }}>
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
      </Aimap>
    </div>
  );
}