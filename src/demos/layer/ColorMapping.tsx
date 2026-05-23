import React, { useState, useCallback } from 'react';
import { Aimap, PointLayer, ZoomControl } from '../../index';
import { Tooltip } from '../../components/Interaction/Tooltip';
import type { LayerEventPayload } from '../../schema/types';

const points = Array.from({ length: 40 }, () => ({
  lng: 116.1 + Math.random() * 0.6,
  lat: 39.7 + Math.random() * 0.4,
  value: Math.round(Math.random() * 500),
}));

/**
 * 颜色映射 — colorField + colorValues
 */
export default function Demo09ColorMapping() {
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
          center: [116.397, 39.909],
          zoom: 10,
          style: 'light',
        }}
      >
        <PointLayer
          source={points}
          colorField="value"
          colorValues={['#2166AC', '#67A9CF', '#D1E5F0', '#FDDBC7', '#EF8A62', '#B2182B']}
          size={16}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
        {tooltipInfo.visible && (
          <Tooltip
            longitude={tooltipInfo.lng}
            latitude={tooltipInfo.lat}
            variant="dark"
            visible={true}
            items={[{ label: '数值', value: tooltipInfo.value }]}
          />
        )}
        <ZoomControl />
      </Aimap>
    </div>
  );
}