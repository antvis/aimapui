import React, { useEffect, useState } from 'react';
import { Aimap, LineLayer, ZoomControl } from '../../index';

/**
 * 弧线地图 — LineLayer arc (2D)
 *
 * 数据：纽约共享单车出行数据，使用 2D 弧线展示 OD 流向
 * 设计参考 arc-flow-map.md：2D 贝塞尔弧线 + 梯度渐变色带
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
            size={2}
            shape="arc"
            color="#2563EB"
            style={{ opacity: 0.6 }}
          />
        )}
        <ZoomControl position="bottomright" />
      </Aimap>
    </div>
  );
}
