import React, { useEffect, useRef, useState } from 'react';
import { Aimap, Popup, PointLayer, Marker, Tooltip, ZoomControl } from '../../index';
const cities = [
  { lng: 116.397, lat: 39.909, name: '天安门', desc: '中国首都中心' },
  { lng: 116.391, lat: 39.916, name: '故宫', desc: '明清两代皇宫' },
  { lng: 116.403, lat: 39.920, name: '南锣鼓巷', desc: '北京特色胡同' },
];

/**
 * Popup & Tooltip — 弹窗 + 提示框组合示例
 * 展示 MD3 玻璃拟态设计规范的三种尺寸变体
 */
export default function Demo11Popup() {
  const hoverRef = useRef<HTMLDivElement | null>(null);
  const [hoverEl, setHoverEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setHoverEl(hoverRef.current);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap
        map={{
          basemap: 'gaode',
          center: [116.397, 39.909],
          zoom: 13,
          style: 'light',
        }}
      >
        <PointLayer source={cities} color="#5B8FF9" size={10} />

        {/* Popup — 紧凑型 (Compact) */}
        <Popup
          longitude={cities[0].lng}
          latitude={cities[0].lat}
          content={`<div><strong>${cities[0].name}</strong><br/><span style="color:var(--color-on-surface-variant)">${cities[0].desc}</span></div>`}
          size="compact"
          closeButton
        />

        {/* Popup — 标准型 (Standard) - 默认 */}
        <Popup
          longitude={cities[1].lng}
          latitude={cities[1].lat}
          content={`<div><strong>${cities[1].name}</strong><br/><span style="color:var(--color-on-surface-variant)">${cities[1].desc}</span></div>`}
          size="standard"
          closeButton
        />

        {/* Popup — 宽幅型 (Detailed) */}
        <Popup
          longitude={cities[2].lng}
          latitude={cities[2].lat}
          content={`
            <div>
              <strong style="font-size:16px">${cities[2].name}</strong>
              <div style="margin-top:8px;color:var(--color-on-surface-variant)">${cities[2].desc}</div>
              <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--color-outline-variant);display:flex;gap:16px">
                <div><span style="color:var(--color-on-surface-variant);font-size:12px">游客</span><br/><strong>2.4万</strong></div>
                <div><span style="color:var(--color-on-surface-variant);font-size:12px">评分</span><br/><strong>4.8</strong></div>
              </div>
            </div>
          `}
          size="detailed"
          closeButton
        />

        {/* Tooltip 触发点 */}
        <Marker
          longitude={116.410}
          latitude={39.905}
          content='<div style="width:12px;height:12px;border-radius:9999px;background:#004ac6;border:2px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,.2)"></div>'
        />

        <ZoomControl />
      </Aimap>

      <Tooltip
        targetElement={hoverEl}
        trigger="hover"
        placement="top"
        content="Tooltip: 轻量级悬浮提示"
      />
    </div>
  );
}