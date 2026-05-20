import React, { useEffect, useState } from 'react';
import { Aimap, PointLayer, ZoomControl } from '../../index';

/**
 * 3D 柱图 — PointLayer cylinder
 *
 * 参照 L7 示例：point/column
 * 数据：上海房价数据，使用多种柱形 + 颜色映射 + 动画效果
 */
export default function ColumnLayer() {
  const [data, setData] = useState<Record<string, unknown>[] | null>(null);

  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/basement_prod/893d1d5f-11d9-45f3-8322-ee9140d288ae.json')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData(null));
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap
        map={{
          basemap: 'gaode',
          center: [121.400257, 31.25287],
          zoom: 14.55,
          pitch: 66,
          rotation: 135,
          style: 'dark',
        }}
      >
        {data && (
          <PointLayer
            source={data}
            sourceConfig={{ x: 'longitude', y: 'latitude' }}
            shapeField="name"
            shapeValues={['cylinder', 'triangleColumn', 'hexagonColumn', 'squareColumn']}
            sizeField="unit_price"
            sizeValues={[6, 6, 100]}
            colorField="name"
            colorValues={['#739DFF', '#61FCBF', '#FFDE74', '#FF896F']}
            animate={{ enable: true }}
            active
          />
        )}
        <ZoomControl position="bottomright" />
      </Aimap>
    </div>
  );
}
