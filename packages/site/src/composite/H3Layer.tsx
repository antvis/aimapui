import React from 'react';
import { AiMap, H3Layer, ZoomControl } from '@antv/aimapui';
import { Legend } from '../components/Legend';

const H3_COLORS = ['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'];

const h3Data = [
  { h3: '89283082837ffff', value: 120, name: 'A区' },
  { h3: '8928308280fffff', value: 280, name: 'B区' },
  { h3: '89283082873ffff', value: 95, name: 'C区' },
  { h3: '89283082877ffff', value: 310, name: 'D区' },
  { h3: '8928308283bffff', value: 175, name: 'E区' },
  { h3: '89283082803ffff', value: 420, name: 'F区' },
  { h3: '8928308280bffff', value: 55, name: 'G区' },
  { h3: '89283082807ffff', value: 230, name: 'H区' },
  { h3: '89283082833ffff', value: 360, name: 'I区' },
  { h3: '8928308287bffff', value: 145, name: 'J区' },
  { h3: '89283082863ffff', value: 200, name: 'K区' },
  { h3: '89283082867ffff', value: 390, name: 'L区' },
];

export default function H3LayerDemo() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        autoFit
        map={{
          basemap: 'gaode',
          center: [-122.42, 37.77],
          zoom: 13,
          style: 'light',
        }}
      >
        <H3Layer
          source={h3Data}
          h3Field="h3"
          colorField="value"
          colorValues={H3_COLORS}
          opacity={0.75}
          showStroke
          strokeColor="rgba(255,255,255,0.5)"
          strokeWidth={1}
          showLabel
          labelField="name"
          labelColor="#1e3a5f"
          labelSize={12}
          hoverEffect
          active={{ color: '#fbbf24' }}
        />
        <ZoomControl position="bottomright" />
      </AiMap>

      <div style={{ position: 'absolute', bottom: 32, left: 16, zIndex: 10 }}>
        <Legend
          type="ramp"
          title="数据密度"
          colors={H3_COLORS}
          labels={['低', '高']}
        />
      </div>
    </div>
  );
}
