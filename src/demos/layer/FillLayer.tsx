import React, { useEffect, useState } from 'react';
import { Aimap, FillLayer, ZoomControl } from '../../index';
/**
 * 填充图（填充 + 描边 + 文字）
 */
export default function Demo24FillStrokeText() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/basement_prod/1d27c363-af3a-469e-ab5b-7a7e1ce4f311.json')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData(null));
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap map={{ basemap: 'gaode', center: [116.368652, 39.93866], zoom: 10.07, style: 'light' }}>
        {data && (
          <FillLayer
            source={data}
            sourceType="geojson"
            shape="fill"
            colorField="unit_price"
            colorValues={['#1A4397', '#2555B7', '#3165D1', '#467BE8', '#6296FE', '#7EA6F9', '#98B7F7', '#BDD0F8', '#DDE6F7', '#F2F5FC']}
            active
            showStroke
            showLabel
            labelField="name"
          />
        )}
        <ZoomControl />
      </Aimap>
</div>
  );
}