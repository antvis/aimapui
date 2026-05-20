import React, { useEffect, useState, useCallback } from 'react';
import type { Scene } from '@antv/l7';
import { LineLayer as L7LineLayer, PointLayer as L7PointLayer, PolygonLayer as L7PolygonLayer } from '@antv/l7';
import { Aimap, ZoomControl } from '../../index';

/**
 * 流向图 — LineLayer flowline
 *
 * 参照 L7 示例：line/flow/flow
 * 数据：欧洲人口流动，使用 flowline 形状展示 OD 流向
 * 注：flowline 是 L7 特有的 shape，需要直接使用 L7 原生 API
 */
export default function FlowMap() {
  const [ready, setReady] = useState(false);

  const handleSceneReady = useCallback((scene: Scene) => {
    if (ready) return;
    setReady(true);

    // 加载区域面数据
    fetch('https://mdn.alipayobjects.com/afts/file/A*O7PBQoWAMP4AAAAAAAAAAAAADrd2AQ/locations.json')
      .then((res) => res.json())
      .then((fill) => {
        // 区域填充层
        const fillLayer = new L7PolygonLayer({ autoFit: true })
          .source(fill)
          .shape('fill')
          .color('#aaa');
        scene.addLayer(fillLayer);

        // 中心点层
        const pointData = fill.features.map((item: any) => item.properties);
        const circleLayer = new L7PointLayer({ zIndex: 1 })
          .source(pointData, { parser: { type: 'json', coordinates: 'centroid' } })
          .shape('circle')
          .size(10)
          .color('rgb(8, 64, 129)')
          .style({ stroke: '#fff', strokeWidth: 2 });
        scene.addLayer(circleLayer);

        // 加载流向数据
        fetch('https://mdn.alipayobjects.com/afts/file/A*Q_x7TLOMcrAAAAAAAAAAAAAADrd2AQ/flows-2016.json')
          .then((res) => res.json())
          .then((lineData) => {
            const pointMap: Record<string, any> = {};
            pointData.forEach((item: any) => {
              pointMap[item.abbr] = item;
            });

            const odData = lineData
              .map((item: any) => ({
                ...item,
                coordinates: [pointMap[item.origin]?.centroid, pointMap[item.dest]?.centroid],
              }))
              .filter((item: any) => item.coordinates[0] && item.coordinates[1])
              .sort((a: any, b: any) => a.count - b.count);

            const flowLayer = new L7LineLayer({ zIndex: 0 })
              .source(odData, { parser: { type: 'json', coordinates: 'coordinates' } })
              .scale('count', { type: 'quantile' })
              .size('count', [0.5, 1, 1.5, 2, 4, 6, 8])
              .shape('flowline')
              .color('count', ['#fef6b5', '#ffdd9a', '#ffc285', '#ffa679', '#fa8a76', '#f16d7a', '#e15383'])
              .style({
                opacity: { field: 'count', value: [0.2, 0.4, 0.6, 0.8] },
                gapWidth: 2,
                strokeWidth: 1,
                strokeOpacity: 1,
                stroke: '#000',
              });
            scene.addLayer(flowLayer);
          });
      });
  }, [ready]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap
        map={{
          basemap: 'gaode',
          center: [8.655, 47.413],
          zoom: 5,
          style: 'dark',
        }}
        onSceneReady={handleSceneReady}
      >
        <ZoomControl position="bottomright" />
      </Aimap>
    </div>
  );
}
