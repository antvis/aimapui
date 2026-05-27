import React, { useState } from 'react';
import { AiMap, Marker } from '../../index';
/**
 * 可拖拽标注 — draggable + onDragStart/onDragging/onDragEnd 回调
 * 参考 L7 Marker 的 mousedown/mousemove/mouseup 拖拽模式
 */
export default function Demo06MarkerDrag() {
  const [markers, setMarkers] = useState([
    { lng: 116.397, lat: 39.909, label: '天安门' },
    { lng: 116.407, lat: 39.915, label: '王府井' },
    { lng: 116.391, lat: 39.916, label: '故宫' },
  ]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        map={{
          basemap: 'gaode',
          center: [116.397, 39.909],
          zoom: 12,
          style: 'light',
        }}
      >
        {markers.map((m, i) => (
          <Marker
            key={i}
            longitude={m.lng}
            latitude={m.lat}
            draggable
            onDragging={(lng, lat) => {
              // 拖拽过程中实时更新坐标
              setMarkers((prev) =>
                prev.map((item, idx) => (idx === i ? { ...item, lng, lat } : item)),
              );
            }}
            onDragEnd={(lng, lat) => {
              setMarkers((prev) =>
                prev.map((item, idx) => (idx === i ? { ...item, lng, lat } : item)),
              );
            }}
            content={`📍 ${m.label}`}
          />
        ))}
      </AiMap>

      {/* 坐标面板 */}
      </div>
  );
}