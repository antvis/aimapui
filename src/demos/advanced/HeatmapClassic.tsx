import React, { useEffect, useState } from 'react';
import { Aimap, HeatmapLayer, ZoomControl } from '../../index';
/**
 * 经典热力图
 */
export default function Demo26Heatmap() {
  const [csvData, setCsvData] = useState<string | null>(null);

  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/basement_prod/7359a5e9-3c5e-453f-b207-bc892fb23b84.csv')
      .then((res) => res.text())
      .then((text) => setCsvData(text))
      .catch(() => setCsvData(null));
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap map={{ basemap: 'gaode', center: [110.097892, 33.853662], zoom: 4.2, style: 'dark' }}>
        {csvData && (
          <HeatmapLayer
            source={csvData}
            sourceType="csv"
            sourceConfig={{ x: 'lng', y: 'lat' }}
            shape="heatmap"
            sizeField="v"
            sizeValues={[0, 1]}
            colorField="v"
            colorValues={['#2E8BFF', '#63D1FF', '#D6F36B', '#FFD166', '#FF6B3D', '#D7263D']}
            style={{
              intensity: 2,
              radius: 20,
              opacity: 0.85,
              rampColors: {
                colors: ['#2E8BFF', '#63D1FF', '#D6F36B', '#FFD166', '#FF6B3D', '#D7263D'],
                positions: [0, 0.2, 0.4, 0.6, 0.8, 1],
              },
            }}
          />
        )}
        <ZoomControl />
      </Aimap>
</div>
  );
}