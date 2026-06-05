import React, { useState } from 'react';
import { AiMap, BottomSheet } from '@antv/aimapui';
import type { BottomSheetSnap } from '@antv/aimapui';

/**
 * 底部抽屉 — BottomSheet
 *
 * 三档吸附（collapsed / half / expanded），拖拽手柄即可切换，常用于移动端的"列表 + 地图"混合视图。
 */
const POIS = [
  { name: '西湖断桥', distance: '0.4 km', tag: '景点' },
  { name: '楼外楼', distance: '0.6 km', tag: '餐饮' },
  { name: '雷峰塔', distance: '1.2 km', tag: '景点' },
  { name: '河坊街', distance: '1.8 km', tag: '购物' },
  { name: '灵隐寺', distance: '5.4 km', tag: '景点' },
  { name: '宋城', distance: '8.2 km', tag: '演艺' },
];

export default function BottomSheetDemo() {
  const [snap, setSnap] = useState<BottomSheetSnap>('half');

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        autoFit
        map={{
          basemap: 'gaode',
          center: [120.155, 30.255],
          zoom: 12,
          style: 'light',
        }}
      />
      <BottomSheet defaultSnap="half" onSnapChange={setSnap}>
        <div style={{ padding: '4px 20px 24px' }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
            附近 POI ({POIS.length})
          </div>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
            当前吸附状态：{snap}
          </div>
          {POIS.map((poi) => (
            <div
              key={poi.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{poi.name}</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                  {poi.tag} · {poi.distance}
                </div>
              </div>
              <span
                style={{
                  fontSize: 12,
                  color: '#2563eb',
                  padding: '4px 10px',
                  borderRadius: 12,
                  background: 'rgba(37,99,235,0.08)',
                }}
              >
                导航
              </span>
            </div>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
