import React, { useEffect, useState, useCallback } from 'react';
import { AiMap, LineLayer, ZoomControl } from '@antv/aimapui';
import { Tooltip } from '@antv/aimapui';
import type { LayerEventPayload } from '@antv/aimapui';

/**
 * 线动画 — LineLayer greatcircle + animate
 *
 * 参照 L7 示例：line/animate/line_animate
 * 数据：全球航线数据，使用 greatcircle 弧线 + 动画效果
 */
export default function LineAnimate() {
  const [data, setData] = useState<string | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{ visible: boolean; lng: number; lat: number; feature: Record<string, unknown> }>({
    visible: false, lng: 0, lat: 0, feature: {},
  });

  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/rmsportal/UEXQMifxtkQlYfChpPwT.txt')
      .then((res) => res.text())
      .then((text) => setData(text))
      .catch(() => setData(null));
  }, []);

  const handleMouseMove = useCallback((payload: LayerEventPayload) => {
    if (!payload.feature) return;
    setTooltipInfo({ visible: true, lng: payload.lng, lat: payload.lat, feature: payload.feature });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltipInfo((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        map={{
          basemap: 'gaode',
          center: [107.778, 35.443],
          zoom: 2.9,
          style: 'dark',
        }}
      >
        {data && (
          <LineLayer
            source={data}
            sourceType="csv"
            sourceConfig={{ x: 'lng1', y: 'lat1', x1: 'lng2', y1: 'lat2' }}
            size={1}
            shape="greatcircle"
            color="#8C1EB2"
            animate={{ enable: true, speed: 0.1, trailLength: 0.5, duration: 2 }}
            style={{ opacity: 0.8 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
        )}
        <Tooltip
          longitude={tooltipInfo.lng}
          latitude={tooltipInfo.lat}
          variant="light"
          visible={tooltipInfo.visible}
          title="航线"
          items={Object.entries(tooltipInfo.feature).slice(0, 3).map(([key, val]) => ({ label: key, value: String(val ?? '') }))}
        />
        <ZoomControl position="bottomright" />
      </AiMap>
    </div>
  );
}
