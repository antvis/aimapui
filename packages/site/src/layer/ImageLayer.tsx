import React from 'react';
import { AiMap, ImageLayer, ZoomControl } from '@antv/aimapui';
/**
 * 图片图层 — 手绘卡通风格地图叠加
 */
export default function Demo28ImageLayer() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        autoFit
        map={{
          basemap: 'gaode',
          style: 'light',
        }}
      >
        <ImageLayer
          source="https://mass.alipay.com/dituhuiservice/afts/file/30kFTK7jkxcAAAAAgQAAAAgAetugAQFr"
          sourceType="image"
          sourceConfig={{
            parser: {
              type: 'image',
              extent: [116.260183, 39.978131, 116.283836, 40.004918],
            },
          }}
        />
        <ZoomControl />
      </AiMap>
    </div>
  );
}
