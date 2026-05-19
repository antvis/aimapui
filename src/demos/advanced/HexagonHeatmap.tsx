import React, { useEffect, useState } from 'react';
import { Aimap, HeatmapHexagonLayer, ZoomControl } from '../../index';
/**
 * 蜂窝热力图
 */
export default function Demo27HexagonHeatmap() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/basement_prod/513add53-dcb2-4295-8860-9e7aa5236699.json')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData(null));
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap map={{ basemap: 'gaode', center: [114.077376, 22.542657], zoom: 12.48, pitch: 56, rotation: 39, style: 'light' }}>
        {data && (
          <HeatmapHexagonLayer
            source={data}
            sourceType="geojson"
            weightField="h12"
            weightMethod="sum"
            hexSize={100}
            sizeField="sum"
            sizeValues={[0, 600]}
            colorField="sum"
            colorValues={['#CEF8D6', '#A1EDB8', '#7BE39E', '#5FD3A6', '#4AC5AF', '#34B6B7', '#289899', '#1D7F7E', '#146968', '#094D4A']}
          />
        )}
        <ZoomControl />
      </Aimap>
</div>
  );
}