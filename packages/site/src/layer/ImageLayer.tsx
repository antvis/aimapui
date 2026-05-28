import React from 'react';
import { AiMap, ImageLayer, RasterLayer, ZoomControl } from '@antv/aimapui';
/**
 * 图片图层
 */
export default function Demo28ImageLayer() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        map={{
          basemap: 'map',
          center: [121.268, 30.3628],
          zoom: 10,
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
        <ImageLayer
          source="https://gw.alipayobjects.com/zos/rmsportal/FnHFeFklTzKDdUESRNDv.jpg"
          sourceType="image"
          sourceConfig={{ parser: { type: 'image', extent: [121.168, 30.2828, 121.384, 30.4219] } }}
        />
        <ZoomControl />
      </AiMap>
</div>
  );
}