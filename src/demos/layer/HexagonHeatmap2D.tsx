import React, { useEffect, useState, useCallback } from 'react';
import { Aimap, HeatmapLayer, ZoomControl } from '../../index';
import { Tooltip } from '../../components/Interaction/Tooltip';
import type { LayerEventPayload } from '../../schema/types';

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

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap
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
      </Aimap>
    </div>
  );
}
