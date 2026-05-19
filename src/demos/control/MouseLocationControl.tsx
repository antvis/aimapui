import React from 'react';
import { Aimap, MouseLocationControl } from '../../index';
/**
 * 鼠标坐标控件 — MouseLocationControl
 * 实时显示鼠标所在位置的经纬度
 */
export default function Demo07MouseLocation() {
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
        <MouseLocationControl />
      </Aimap>
</div>
  );
}