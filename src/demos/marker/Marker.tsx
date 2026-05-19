import React, { useState } from 'react';
import { Aimap, Marker } from '../../index';
/**
 * Marker 设计规范展示 — 默认样式与交互状态
 *
 * 展示内容:
 * 1. 水滴型 Marker (Pin Marker) - 默认业务点样式
 * 2. 圆型 Marker (Circle Marker) - 轻量点样式
 * 3. 图标型 Marker (Icon Marker) - 带 Material Symbols 图标
 * 4. 交互状态: 默认、悬停、选中、禁用
 * 5. 语义颜色: 正常、成功、警告、错误
 */
export default function Demo05Marker() {
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

  // 基础位置数据
  const baseLng = 116.397;
  const baseLat = 39.909;

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
        {/* 1. 水滴型 Marker - 默认样式 */}
        <Marker
          longitude={baseLng}
          latitude={baseLat}
          onClick={() => setSelectedMarker(selectedMarker === 'pin' ? null : 'pin')}
        />

        {/* 2. 圆型 Marker */}
        <Marker
          longitude={baseLng + 0.01}
          latitude={baseLat}
          content={
            <div className="aimapkit-marker-circle">
              <div className="aimapkit-marker-circle__inner" />
            </div>
          }
          onClick={() => setSelectedMarker(selectedMarker === 'circle' ? null : 'circle')}
        />

        {/* 3. 图标型 Marker - 带图标 */}
        <Marker
          longitude={baseLng + 0.02}
          latitude={baseLat}
          content={
            <div className="aimapkit-marker-icon">
              <span className="material-symbols-outlined">location_on</span>
            </div>
          }
          onClick={() => setSelectedMarker(selectedMarker === 'icon' ? null : 'icon')}
        />

        {/* 4. 选中状态的 Marker */}
        <Marker
          longitude={baseLng}
          latitude={baseLat + 0.01}
          className={selectedMarker === 'selected' ? 'aimapkit-marker--selected' : ''}
          content={
            <div className="aimapkit-marker-icon">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
          }
          onClick={() => setSelectedMarker(selectedMarker === 'selected' ? null : 'selected')}
        />

        {/* 5. 禁用状态的 Marker */}
        <Marker
          longitude={baseLng + 0.01}
          latitude={baseLat + 0.01}
          className="aimapkit-marker--inactive"
          content={
            <div className="aimapkit-marker-icon">
              <span className="material-symbols-outlined">block</span>
            </div>
          }
        />

        {/* 6. 成功状态 Marker */}
        <Marker
          longitude={baseLng + 0.02}
          latitude={baseLat + 0.01}
          className="aimapkit-marker--success"
          content={
            <div className="aimapkit-marker-icon">
              <span className="material-symbols-outlined">check</span>
            </div>
          }
        />

        {/* 7. 警告状态 Marker */}
        <Marker
          longitude={baseLng}
          latitude={baseLat - 0.01}
          className="aimapkit-marker--warning"
          content={
            <div className="aimapkit-marker-icon">
              <span className="material-symbols-outlined">warning</span>
            </div>
          }
        />

        {/* 8. 错误状态 Marker */}
        <Marker
          longitude={baseLng + 0.01}
          latitude={baseLat - 0.01}
          className="aimapkit-marker--error"
          content={
            <div className="aimapkit-marker-icon">
              <span className="material-symbols-outlined">error</span>
            </div>
          }
        />

        {/* 9. 带文本标注的 Marker */}
        <Marker
          longitude={baseLng + 0.02}
          latitude={baseLat - 0.01}
          content={
            <div style={{ position: 'relative' }}>
              <div className="aimapkit-marker-pin">
                <div className="aimapkit-marker-pin__inner" />
              </div>
              <div className="aimapkit-marker-label">站点 A-12</div>
            </div>
          }
        />

        {/* 10. 简化点 Marker (低缩放级) */}
        <Marker
          longitude={baseLng + 0.03}
          latitude={baseLat}
          content={<div className="aimapkit-marker-dot" />}
        />
      </Aimap>

      </div>
  );
}