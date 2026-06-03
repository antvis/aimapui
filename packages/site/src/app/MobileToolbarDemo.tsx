import React from 'react';
import { AiMap, MobileToolbar } from '@antv/aimapui';

/**
 * 移动端工具栏 — MobileToolbar
 *
 * 通过 `config.items` 声明工具按钮（zoomIn/zoomOut/locate/reset/layers），内置触发地图相应行为。
 */
export default function MobileToolbarDemo() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        map={{
          basemap: 'gaode',
          center: [120.155, 30.255],
          zoom: 12,
          style: 'light',
        }}
      >
        <MobileToolbar
          config={{
            items: ['zoomIn', 'zoomOut', 'locate', 'reset', 'layers'],
            position: 'bottom',
          }}
        />
      </AiMap>
    </div>
  );
}
