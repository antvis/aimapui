import React, { useEffect, useState } from 'react';
import { Aimap, PointLayer, ZoomControl } from '../../index';

/**
 * 3D 柱图 — PointLayer cylinder
 *
 * 参照 L7 示例：point/column/column_light
 * 数据：全国城市温度，使用 cylinder 形状展示 3D 柱状图
 */
export default function ColumnLayer() {
  const [data, setData] = useState<Record<string, unknown>[] | null>(null);

  useEffect(() => {
    fetch('https://gw.alipayobjects.com/os/rmsportal/oVTMqfzuuRFKiDwhPSFL.json')
      .then((res) => res.json())
      .then((json) => setData(json.list))
      .catch(() => setData(null));
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap
        map={{
          basemap: 'gaode',
          center: [110, 31.847],
          zoom: 4,
          pitch: 60,
          style: 'dark',
        }}
      >
        {data && (
          <PointLayer
            source={data}
            sourceConfig={{ x: 'j', y: 'w' }}
            shape="cylinder"
            sizeField="t"
            sizeValues={[1, 1, 80]}
            color="#006CFF"
            active
            style={{
              opacity: 0.6,
              opacityLinear: { enable: true, dir: 'up' },
              lightEnable: false,
            }}
          />
        )}
        <ZoomControl position="bottomright" />
      </Aimap>
    </div>
  );
}
