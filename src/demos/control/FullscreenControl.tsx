import React from 'react';
import { Aimap, FullscreenControl } from '../../index';
/**
 * 全屏控件 — FullscreenControl
 */
export default function Demo04Fullscreen() {
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
        <FullscreenControl />
      </Aimap>
</div>
  );
}