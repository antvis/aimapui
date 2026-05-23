import React, { useEffect, useState } from 'react';
import { Aimap, PolygonLayer, ZoomControl } from '../../index';
/**
 * 3D 填充图
 */
export default function Demo25Fill3D() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/basement_prod/1d27c363-af3a-469e-ab5b-7a7e1ce4f311.json')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData(null));
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap map={{ basemap: 'gaode', center: [116.368652, 39.93866], zoom: 10.2, pitch: 55, style: 'dark' }}>
        {data && (
          <PolygonLayer
            source={data}
            sourceType="geojson"
            shape="extrude"
            sizeField="unit_price"
            sizeValues={[0, 3000]}
            colorField="unit_price"
            colorValues={['#163d8f', '#2d5fd1', '#4f85ea', '#86b0ff', '#d7e6ff']}
            style={{ opacity: 0.9 }}
            events={{ enablePopup: true, popupTrigger: 'hover', popupFields: ['name', 'unit_price'] }}
          />
        )}
        <ZoomControl />
      </Aimap>
</div>
  );
}