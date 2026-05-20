import React, { useEffect, useState } from 'react';
import { Aimap, HeatmapLayer, ZoomControl } from '../../index';

/**
 * 蜂窝热力图 2D — HeatmapLayer hexagon
 *
 * 参照 L7 示例：heatmap/hexagon/hexagon
 * 数据：深圳 POI 热力数据，使用蜂窝聚合展示 2D 平面热力
 */
export default function HexagonHeatmap2D() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/basement_prod/513add53-dcb2-4295-8860-9e7aa5236699.json')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData(null));
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap
        map={{
          basemap: 'gaode',
          center: [114.077, 22.543],
          zoom: 12.48,
          style: 'light',
        }}
      >
        {data && (
          <HeatmapLayer
            source={data}
            sourceConfig={{
              transforms: [
                { type: 'hexagon', size: 100, field: 'h12', method: 'sum' },
              ],
            }}
            shape="hexagon"
            sizeField="sum"
            sizeValues={[0, 600]}
            colorField="sum"
            colorValues={[
              '#CEF8D6', '#A1EDB8', '#7BE39E', '#5FD3A6', '#4AC5AF',
              '#34B6B7', '#289899', '#1D7F7E', '#146968', '#094D4A',
            ]}
            style={{ coverage: 0.8, angle: 0 }}
          />
        )}
        <ZoomControl position="bottomright" />
      </Aimap>
    </div>
  );
}
