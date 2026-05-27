import React, { useEffect, useState } from 'react';
import { AiMap, LineLayer, ZoomControl } from '../../index';
/**
 * 路径图
 */
export default function Demo22PathLayer() {
  const [data, setData] = useState<Record<string, unknown>[] | null>(null);

  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/basement_prod/ee07641d-5490-4768-9826-25862e8019e1.json')
      .then((res) => res.json())
      .then((json) => setData(Array.isArray(json) ? json : []))
      .catch(() => setData(null));
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap map={{ basemap: 'gaode', center: [103.837356, 1.360254], zoom: 9.5, pitch: 20, style: 'light' }}>
        {data && (
          <LineLayer
            source={data}
            sourceType="json"
            sourceConfig={{ parser: { type: 'json', coordinates: 'path' } }}
            sizeField="level"
            sizeValues={[0.8, 1.8]}
            shape="line"
            colorField="level"
            colorValues={['#0A3663', '#1558AC', '#3771D9', '#4D89E5', '#64A5D3', '#72BED6', '#83CED6', '#A6E1E0']}
            active
          />
        )}
        <ZoomControl />
      </AiMap>
</div>
  );
}