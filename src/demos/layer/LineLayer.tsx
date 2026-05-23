import React, { useState } from 'react';
import { Aimap, PointLayer, LineLayer, ZoomControl } from '../../index';
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

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap
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
          events={{ enablePopup: true, popupTrigger: 'hover', popupFields: ['value'] }}
        />

        {/* 节点图层 */}
        <PointLayer source={keyPoints} color="#F6BD16" size={10} />
        <ZoomControl />
      </Aimap>

      {/* 控制面板 */}
      </div>
  );
}