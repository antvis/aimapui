import React from 'react';
import { AiMap, RasterLayer, ZoomControl } from '../../index';
/**
 * 栅格瓦片图层
 */
export default function Demo29RasterTileLayer() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        map={{
          basemap: 'map',
          center: [120.2, 30.25],
          zoom: 8.5,
          style: 'light',
          gestureConfig: { dragPan: true, pinchZoom: true, dragRotate: true },
        }}
      >
        <RasterLayer
          source="https://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}"
          sourceType="rasterTile"
          sourceConfig={{ parser: { type: 'rasterTile', tileSize: 256, zoomOffset: 0 } }}
          zIndex={0}
        />
        <ZoomControl />
      </AiMap>
</div>
  );
}