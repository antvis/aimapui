import React, { useEffect, useState, useCallback } from 'react';
import { Aimap, HeatmapLayer, ZoomControl } from '../../index';
import { Tooltip } from '../../components/Interaction/Tooltip';
import type { LayerEventPayload } from '../../schema/types';

/**
 * 经典热力图
 */
export default function Demo26Heatmap() {
  const [csvData, setCsvData] = useState<string | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{ visible: boolean; lng: number; lat: number; value: number }>({
    visible: false, lng: 0, lat: 0, value: 0,
  });

  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/basement_prod/7359a5e9-3c5e-453f-b207-bc892fb23b84.csv')
      .then((res) => res.text())
      .then((text) => setCsvData(text))
      .catch(() => setCsvData(null));
  }, []);

  const handleMouseMove = useCallback((payload: LayerEventPayload) => {
    const feature = payload.feature;
    if (!feature) return;
    setTooltipInfo({
      visible: true,
      lng: payload.lng,
      lat: payload.lat,
      value: Number(feature.v ?? 0),
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltipInfo((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap map={{ basemap: 'gaode', center: [110.097892, 33.853662], zoom: 4.2, style: 'dark' }}>
        {csvData && (
          <HeatmapLayer
            source={csvData}
            sourceType="csv"
            sourceConfig={{ x: 'lng', y: 'lat' }}
            shape="heatmap"
            sizeField="v"
            sizeValues={[0, 1]}
            colorField="v"
            colorValues={['#2E8BFF', '#63D1FF', '#D6F36B', '#FFD166', '#FF6B3D', '#D7263D']}
            style={{
              intensity: 2,
              radius: 20,
              opacity: 0.85,
              rampColors: {
                colors: ['#2E8BFF', '#63D1FF', '#D6F36B', '#FFD166', '#FF6B3D', '#D7263D'],
                positions: [0, 0.2, 0.4, 0.6, 0.8, 1],
              },
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
        )}
        {tooltipInfo.visible && (
          <Tooltip
            longitude={tooltipInfo.lng}
            latitude={tooltipInfo.lat}
            variant="light"
            visible={true}
            items={[{ label: '热力值', value: tooltipInfo.value }]}
          />
        )}
        <ZoomControl />
      </Aimap>
    </div>
  );
}