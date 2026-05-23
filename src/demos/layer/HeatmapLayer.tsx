import React, { useState, useCallback } from 'react';
import { Aimap, HeatmapLayer, PointLayer, ZoomControl, ScaleControl } from '../../index';
import { Tooltip } from '../../components/Interaction/Tooltip';
import type { LayerEventPayload } from '../../schema/types';

const heatData = Array.from({ length: 200 }, () => ({
  lng: 116.1 + Math.random() * 0.6,
  lat: 39.7 + Math.random() * 0.45,
  value: Math.random() * 100,
}));

const centers = [
  { lng: 116.397, lat: 39.909, name: '北京' },
];

/**
 * 热力图 — HeatmapLayer
 */
export default function Demo12Heatmap() {
  const [tooltipInfo, setTooltipInfo] = useState<{ visible: boolean; lng: number; lat: number; value: number }>({
    visible: false, lng: 0, lat: 0, value: 0,
  });

  const handleMouseMove = useCallback((payload: LayerEventPayload) => {
    if (!payload.feature) return;
    setTooltipInfo({ visible: true, lng: payload.lng, lat: payload.lat, value: Number(payload.feature.value ?? 0) });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltipInfo((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap
        map={{
          basemap: 'gaode',
          style: 'dark',
          center: [116.397, 39.909],
          zoom: 10,
        }}
      >
        <HeatmapLayer
          source={heatData}
          shape="heatmap"
          sizeField="value"
          sizeValues={[0, 1]}
          colorField="value"
          colorValues={['#2166AC', '#67A9CF', '#D1E5F0', '#FDDBC7', '#EF8A62', '#B2182B']}
          style={{
            intensity: 2,
            radius: 20,
            opacity: 0.85,
            rampColors: {
              colors: ['#2166AC', '#67A9CF', '#D1E5F0', '#FDDBC7', '#EF8A62', '#B2182B'],
              positions: [0, 0.2, 0.4, 0.6, 0.8, 1],
            },
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
        <PointLayer source={centers} color="#F6BD16" size={8} />
        {tooltipInfo.visible && (
          <Tooltip
            longitude={tooltipInfo.lng}
            latitude={tooltipInfo.lat}
            variant="light"
            visible={true}
            items={[{ label: '热力值', value: Math.round(tooltipInfo.value) }]}
          />
        )}
        <ZoomControl />
        <ScaleControl />
      </Aimap>
    </div>
  );
}