import React, { useEffect, useState } from 'react';
import { Aimap, LineLayer, ZoomControl } from '../../index';

/**
 * 弧线地图 — LineLayer arc
 *
 * 参照 L7 示例：line/arc/trip_arc
 * 数据：纽约共享单车出行数据，使用 arc3d 弧线展示 OD 流向
 */
export default function ArcMap() {
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/basement_prod/bd33a685-a17e-4686-bc79-b0e6a89fd950.csv')
      .then((res) => res.text())
      .then((text) => setData(text))
      .catch(() => setData(null));
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap
        map={{
          basemap: 'gaode',
          center: [-74.0697, 40.7204],
          zoom: 12.46,
          pitch: 60,
          style: 'light',
        }}
      >
        {data && (
          <LineLayer
            source={data}
            sourceType="csv"
            sourceConfig={{
              x: 'start station longitude',
              y: 'start station latitude',
              x1: 'end station longitude',
              y1: 'end station latitude',
            }}
            size={1}
            shape="arc3d"
            color="#0C47BF"
            style={{ blur: 0.9, opacity: 0.9 }}
          />
        )}
        <ZoomControl position="bottomright" />
      </Aimap>
    </div>
  );
}
