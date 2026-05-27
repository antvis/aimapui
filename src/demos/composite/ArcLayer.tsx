import React, { useEffect, useState } from 'react';
import { AiMap, LineLayer, ZoomControl } from '../../index';
/**
 * 弧线图
 */
export default function Demo23ArcLayer() {
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/basement_prod/bd33a685-a17e-4686-bc79-b0e6a89fd950.csv')
      .then((res) => res.text())
      .then((text) => setData(text))
      .catch(() => setData(null));
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap map={{ basemap: 'gaode', center: [-74.06967, 40.720399], zoom: 12.46, pitch: 60, style: 'light' }}>
        {data && (
          <LineLayer
            source={data}
            sourceType="csv"
            sourceConfig={{ x: 'start station longitude', y: 'start station latitude', x1: 'end station longitude', y1: 'end station latitude' }}
            size={1}
            shape="arc3d"
            color="#0C47BF"
            style={{ blur: 0.9, opacity: 0.9 }}
          />
        )}
        <ZoomControl />
      </AiMap>
</div>
  );
}