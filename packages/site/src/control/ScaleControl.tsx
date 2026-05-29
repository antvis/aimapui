import React from 'react';
import { AiMap, ScaleControl } from '@antv/aimapui';

/**
 * 比例尺控件 — ScaleControl
 *
 * 同时展示公制（km/m）与英制（mi/ft）两条比例尺线，缩放地图即可观察刻度变化。
 */
export default function ScaleControlDemo() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        map={{
          basemap: 'gaode',
          center: [116.397, 39.909],
          zoom: 10,
          style: 'light',
        }}
      >
        <ScaleControl position="bottomleft" maxWidth={120} metric imperial />
      </AiMap>
    </div>
  );
}
