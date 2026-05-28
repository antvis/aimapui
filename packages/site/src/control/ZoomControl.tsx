import React from 'react';
import { AiMap, ZoomControl, ScaleControl } from '@antv/aimapui';
/**
 * 缩放 & 比例尺 — ZoomControl + ScaleControl
 *
 * 遵循 L7 Control 规范：
 * - ZoomControl 默认位置 bottomright
 * - ScaleControl 默认位置 bottomleft
 * - 支持 position 属性自定义位置
 */
export default function Demo03ZoomControl() {
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
        <ZoomControl />
        <ScaleControl />
      </AiMap>
</div>
  );
}