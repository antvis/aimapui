import React, { useEffect, useState } from 'react';
import { Aimap, IconImageLayer, IconFontLayer, ZoomControl } from '../../index';
/**
 * 标注图（图片图标 + 文字）
 */
export default function Demo21IconLabel() {
  const [data, setData] = useState<Record<string, unknown>[] | null>(null);

  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/basement_prod/893d1d5f-11d9-45f3-8322-ee9140d288ae.json')
      .then((res) => res.json())
      .then((json) => setData(Array.isArray(json) ? json : []))
      .catch(() => setData(null));
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap map={{ basemap: 'gaode', center: [121.434765, 31.256735], zoom: 14.83, style: 'light' }}>
        {data && (
          <>
            <IconImageLayer
              source={data}
              sourceType="json"
              sourceConfig={{ x: 'longitude', y: 'latitude' }}
              iconField="name"
              iconMap={{
                '00': 'https://gw.alipayobjects.com/zos/basement_prod/604b5e7f-309e-40db-b95b-4fac746c5153.svg',
                '01': 'https://gw.alipayobjects.com/zos/basement_prod/30580bc9-506f-4438-8c1a-744e082054ec.svg',
                '02': 'https://gw.alipayobjects.com/zos/basement_prod/7aa1f460-9f9f-499f-afdf-13424aa26bbf.svg',
              }}
              size={10}
            />
            <IconFontLayer
              source={data}
              sourceType="json"
              sourceConfig={{ x: 'longitude', y: 'latitude' }}
              iconField="name"
              color="#f00"
              size={25}
              style={{ textOffset: [0, 20] }}
            />
          </>
        )}
        <ZoomControl />
      </Aimap>
</div>
  );
}