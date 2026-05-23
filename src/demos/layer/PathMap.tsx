import React, { useEffect, useState, useCallback } from 'react';
import { Aimap, LineLayer, ZoomControl } from '../../index';
import { Tooltip } from '../../components/Interaction/Tooltip';
import type { LayerEventPayload } from '../../schema/types';

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

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap
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
      </Aimap>
    </div>
  );
}
