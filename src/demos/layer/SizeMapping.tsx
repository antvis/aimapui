import React, { useState, useCallback } from 'react';
import { Aimap, PointLayer, ZoomControl } from '../../index';
import { Tooltip } from '../../components/Interaction/Tooltip';
import type { LayerEventPayload } from '../../schema/types';

const points = Array.from({ length: 30 }, () => ({
  lng: 121.3 + Math.random() * 0.5,
  lat: 31.1 + Math.random() * 0.3,
  value: Math.round(Math.random() * 400 + 10),
}));

/**
 * 大小映射 — sizeField + sizeValues
 */
export default function Demo10SizeMapping() {
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
          center: [121.473, 31.23],
          zoom: 10,
          style: 'light',
        }}
      >
        <PointLayer
          source={points}
          color="#5B8FF9"
          sizeField="value"
          sizeValues={[6, 30]}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
        <Tooltip
          longitude={tooltipInfo.lng}
          latitude={tooltipInfo.lat}
          variant="dark"
          visible={tooltipInfo.visible}
          items={[{ label: '数值', value: tooltipInfo.value }]}
        />
        <ZoomControl />
      </Aimap>
    </div>
  );
}