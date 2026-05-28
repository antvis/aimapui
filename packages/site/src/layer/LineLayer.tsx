import React, { useState, useCallback } from 'react';
import { AiMap, PointLayer, LineLayer, ZoomControl } from '@antv/aimapui';
import { Tooltip } from '@antv/aimapui';
import type { LayerEventPayload } from '@antv/aimapui';

const keyPoints = [
  { lng: 116.397, lat: 39.909, name: '天安门' },
  { lng: 116.417, lat: 39.928, name: '鸟巢' },
  { lng: 116.391, lat: 39.916, name: '故宫' },
  { lng: 116.407, lat: 39.915, name: '王府井' },
  { lng: 116.365, lat: 39.917, name: '西单' },
];

const flowData = Array.from({ length: 15 }, () => ({
  lng: 116.397,
  lat: 39.909,
  lng1: 116.397 + (Math.random() - 0.5) * 0.3,
  lat1: 39.909 + (Math.random() - 0.5) * 0.2,
  value: Math.round(Math.random() * 200 + 10),
}));

/**
 * 线图层 — LineLayer + 飞线动画
 */
export default function Demo11LineLayer() {
  const [animate, setAnimate] = useState(true);
  const [tooltipInfo, setTooltipInfo] = useState<{ visible: boolean; lng: number; lat: number; value: number }>({
    visible: false, lng: 0, lat: 0, value: 0,
  });

  const handleMouseMove = useCallback((payload: LayerEventPayload) => {
    const feature = payload.feature;
    if (!feature) return;
    setTooltipInfo({
      visible: true,
      lng: payload.lng,
      lat: payload.lat,
      value: Number(feature.value ?? 0),
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
          center: [116.397, 39.909],
          zoom: 11,
          style: 'dark',
        }}
      >
        {/* 飞线图层 */}
        <LineLayer
          source={flowData}
          sourceConfig={{ x: 'lng', y: 'lat', x1: 'lng1', y1: 'lat1' }}
          color="#5B8FF9"
          size={1.5}
          animate={animate ? { enable: true, duration: 4, trailLength: 2 } : undefined}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />

        {/* 节点图层 */}
        <PointLayer source={keyPoints} color="#F6BD16" size={10} />

        <Tooltip
          longitude={tooltipInfo.lng}
          latitude={tooltipInfo.lat}
          variant="light"
          visible={tooltipInfo.visible}
          items={[{ label: '流量', value: tooltipInfo.value }]}
        />
        <ZoomControl />
      </AiMap>
    </div>
  );
}